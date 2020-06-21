const { Student, Grade } = require('../../models');
const FormulaParser = require('hot-formula-parser').Parser;
const { Sequelize, Op } = require('sequelize');
const pdigit = require('../../tools/persian-digit');

module.exports = {
    template: `
        <div class="col-8 mt-5 mr-auto ml-auto">
            <table class="list col text-center">
                <tr>
                    <th>آیتم نمره‌دهی</th>
                    <th>نمره</th>
                    <th>میانگین کلاس</th>
                    <th>بالاترین نمره</th>
                    <th>پایین‌ترین نمره</th>
                </tr>
                <tr v-for="gradeItem in gradeItems">
                    <td>{{ gradeItem.name }}</td>
                    <td>{{ pdigit( getStudentGrade(gradeItem) ) }}</td>
                    <td>{{ pdigit( getGradeItemStatistic(gradeItem, 'average') ) }}</td>
                    <td>{{ pdigit( getGradeItemStatistic(gradeItem, 'max') ) }}</td>
                    <td>{{ pdigit( getGradeItemStatistic(gradeItem, 'min') ) }}</td>
                </tr>
            </table>
        </div>
    `,
    data() {
        return {
            pdigit,
            gradeItems: [],
            grades: {}
        }
    },
    methods: {
        fetchGradeItemsAndGrades: async function () {
            let gradeItems = await app.activeClass.getGradeItems();
            
            let studentGradeItems = await app.activeClass.getGradeItems({
                include: [{
                    model: Student,
                    attributes: [
                        'id',
                    ],
                    where: {
                        id: this.$route.params.id
                    }
                }]
            });

            gradeItems.forEach((gradeItem) => {
                let g = studentGradeItems.find((gi) => {
                    return gi.id == gradeItem.id;
                });

                if(g)
                    gradeItem.Students = g.Students;
                else
                    gradeItem.Students = [];
            });

            this.gradeItems = gradeItems;
        },
        getStudentGrade: function (gradeItem) {
            let gItem = this.gradeItems.find((gi) => gi.id == gradeItem.id);

            if(gItem.type == 'STATIC') {
                if(gItem.Students && gItem.Students.length > 0)
                    return gItem.Students[0].Grade.grade;
                else
                    return '-';
            } else {
                let parser = new FormulaParser();

                for (const gi of this.gradeItems) {
                    if(gi.Students && gi.Students.length > 0 && gi.type == 'STATIC')
                        parser.setVariable(gi.symbol, gi.Students[0].Grade.grade);
                }

                let res = parser.parse(gradeItem.expression);
                return res.error ? res.error : res.result;
            }
        },
        fetchGradesStatistics: async function () {
            let statistics = await Grade.findAll({
                attributes: [
                    [Sequelize.fn('min', Sequelize.col('grade')), 'min_grade'],
                    [Sequelize.fn('max', Sequelize.col('grade')), 'max_grade'],
                    [Sequelize.fn('avg', Sequelize.col('grade')), 'average_grade'],
                    'grade_item_id'
                ],
                group: [
                    'grade_item_id'
                ],
                where: {
                    grade_item_id: {
                        [Op.in]: this.gradeItems.map((gi) => gi.id)
                    }
                }
            });

            statistics.forEach(grade => {
                let gradeItem = this.gradeItems.find((gi) => gi.id == grade.grade_item_id);
                gradeItem.minGrade = grade.dataValues.min_grade;
                gradeItem.maxGrade = grade.dataValues.max_grade;
                gradeItem.averageGrade = grade.dataValues.average_grade;
            });

            this.$forceUpdate();
        },
        getGradeItemStatistic: function (gradeItem, func) {
            if(gradeItem.type == 'EXPRESSION')
                return '-';

            switch (func) {
                case 'min':
                    return Math.round(gradeItem.minGrade*100)/100;
                    break;
            
                case 'max':
                    return Math.round(gradeItem.maxGrade*100)/100;
                    break;
            
                case 'average':
                    return Math.round(gradeItem.averageGrade*100)/100;
                    break;
            
                default:
                    return '#func?';
                    break;
            }
        },
        fetch: async function () {
            await this.fetchGradeItemsAndGrades();
            await this.fetchGradesStatistics();
        }
    },
    created () {
        this.fetch();
    },
    watch: {
        $route(to, from) {
            if(to.name == 'student_grades') {
                this.fetch();
            }
        }
    },
}