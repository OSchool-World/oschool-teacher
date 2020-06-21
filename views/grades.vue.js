const { Student, GradeItem, Grade } = require('../models');
const { Op } = require('sequelize');
var FormulaParser = require('hot-formula-parser').Parser;
const pdigit = require('../tools/persian-digit');

module.exports = {
    template: `
        <section class="grades align-self-stretch d-flex align-items-stretch">
            <div class="col d-flex align-items-stretch mr-3 ml-3 panel">
                <div class="col scroll-y">
                    <table class="col list">
                        <tr>
                            <th></th>
                            <th class="student">دانش‌آموز</th>
                            <th class="grade-val" v-for="grade_item in grade_items">
                                {{ grade_item.name }}
                                <br>
                                <small>{{ grade_item.symbol ?? '-' }}</small>
                                <br>
                                <i class="fas fa-edit" @click="editGradeItem(grade_item)"></i>
                                <i class="fas fa-unlock" v-if="!grade_item.is_locked && grade_item.type == 'STATIC'" @click="changeLockState(grade_item)"></i>
                                <i class="fas fa-lock" v-if="grade_item.is_locked && grade_item.type == 'STATIC'" @click="changeLockState(grade_item)"></i>
                            </th>
                            <th class="add">
                                <i class="fas fa-plus-circle" @click="add_grade_item"></i>
                            </th>
                        </tr>
                        <tr v-for="(student, student_index) in students">
                            <td class="row-num">{{ pdigit(student_index+1) }}</td>
                            <td class="student">
                                <div class="info">
                                    <div class="image">
                                        <img 
                                            :src="student.getImagePathWithTime()"
                                            alt="Student Image"
                                            v-if="student.hasImage"
                                        >
                                        <i class="fas fa-user" v-if="!student.hasImage"></i>
                                    </div>
                                    <div class="name">
                                        <div class="fname">{{ student.first_name }}</div>
                                        <div class="lname">{{ student.last_name }}</div>
                                    </div>
                                </div>
                            </td>
                            <td class="grade-val" v-for="(grade_item, grade_item_index) in grade_items">
                                <input
                                    v-if="grade_item.type == 'STATIC'"
                                    :disabled="grade_item.is_locked"
                                    class="form-control"
                                    type="number"
                                    @change="saveGrade(student, grade_item, $event.target.value)"
                                    v-model="loaded && grade_matrix[student.id][grade_item.id]"
                                    :ref="'gradeinput_' + student_index + '_' + grade_item_index"
                                    @keydown.enter="enterPressed(student_index, grade_item_index)"
                                    @focus="$event.target.select()"
                                >
                                <span v-if="grade_item.type == 'EXPRESSION'">
                                    {{loaded && grade_matrix[student.id][grade_item.id] ? grade_matrix[student.id][grade_item.id] : '-'}}
                                </span>
                            </td>
                            <td class="add"></td>
                        </tr>
                    </table>
                </div>
            </div>

            <router-view></router-view>
        </section>
    `,
    data() {
        return {
            pdigit,
            students: [],
            grade_items: [],
            grades: [],
            grade_matrix: [],
            loaded: false
        }
    },
    methods: {
        fetchStudents: async function () {
            this.students = await app.activeClass.getStudents({
                order: [
                    ['last_name', 'ASC']
                ]
            });
        },
        fetchGradeItems: async function () {
            this.grade_items = await app.activeClass.getGradeItems();
        },
        add_grade_item: function () {
            router.push({ name: 'grade_item' });
        },
        saveGrade: async function (student, grade_item, val) {
            let grade = await Grade.findOne({
                where: {
                    grade_item_id: grade_item.id,
                    student_id: student.id
                }
            });

            if(grade) {
                grade.grade = val;
            } else {
                grade = Grade.build();
                grade.grade = val;
                grade.setStudent(student, {save: false});
                grade.setGradeItem(grade_item, {save: false});
            }

            grade.save();

            await this.recalculateStudentExpressions(student);
        },
        fetchAndManipulateGrades: async function () {
            let grade_item_ids = this.grade_items.map(function (grade_item) {
                return grade_item.id;
            });

            let student_ids = this.students.map(function (student) {
                return student.id;
            });

            this.grades = await Grade.findAll({
                attributes: [
                    'grade_item_id',
                    'student_id',
                    'grade'
                ],
                where: {
                    grade_item_id: {
                        [Op.in]: grade_item_ids
                    },
                    student_id: {
                        [Op.in]: student_ids
                    }
                }
            });

            //Manipulate Static Grades
            for (const student of this.students)
                this.grade_matrix[student.id] = {}

            for (const grade of this.grades)
                this.grade_matrix[grade.student_id][grade.grade_item_id] = grade.grade;

            //Manipulate Expression Grades
            for (const grade_item of this.grade_items)
                if(grade_item.type == 'EXPRESSION')
                    for (const student of this.students)
                        this.grade_matrix[student.id][grade_item.id] = await this.getParsedValue(student, grade_item);

            this.$forceUpdate();

            this.loaded = true;
        },
        fetch: async function () {
            await this.fetchStudents();
            await this.fetchGradeItems();
            await this.fetchAndManipulateGrades();
        },
        enterPressed: function (student_index, grade_item_index) {
            let inp = null;
            if(!this.$refs['gradeinput_' + (student_index+1) + '_' + grade_item_index]) {
                if(this.$refs['gradeinput_' + 0 + '_' + (grade_item_index+1)])
                    inp = this.$refs['gradeinput_' + 0 + '_' + (grade_item_index+1)][0];
                else    
                    inp = this.$refs['gradeinput_' + 0 + '_' + 0][0];
            } else {
                inp = this.$refs['gradeinput_' + (student_index+1) + '_' + grade_item_index][0];
            }

            inp.focus();
        },
        changeLockState: function (grade_item) {
            grade_item.is_locked = !grade_item.is_locked;
            grade_item.save();
        },
        recalculateStudentExpressions: async function (student) {
            for (const grade_item of this.grade_items) {
                if(grade_item.type == 'EXPRESSION')
                {
                    this.grade_matrix[student.id][grade_item.id] = await this.getParsedValue(student, grade_item);
                    this.$forceUpdate();
                }
            }
        },
        getParsedValue: async function (student, grade_item) {
            let grade_items = await student.getGradeItems({
                where: {
                    type: 'STATIC',
                    class_id: app.activeClass.id
                },
            });

            let parser = new FormulaParser();

            grade_items.forEach((grade_item) => {
                if(grade_item.symbol) {
                    parser.setVariable(grade_item.symbol, grade_item.Grade.grade);
                }
            });
 
            let res = parser.parse(grade_item.expression);
            return res.error ? res.error : res.result;
        },
        editGradeItem: function (grade_item) {
            this.$router.push({ name: 'grade_item', params: { id: grade_item.id } });
        }
    },
    created() {
        this.fetch();
    },
    watch: {
        $route(to, from) {
            if(to.name == 'grades') {
                this.fetch();
            }
        }
    }
}