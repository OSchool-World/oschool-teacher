const { Score } = require('../../models');
const pdigit = require('../../tools/persian-digit');

module.exports = {
    template: `
        <div class="col d-flex align-items-stretch mr-4 ml-3 panel">
            <div class="col scroll-y">
                <div class="scores mr-3 ml-3">
                    <table class="col list">
                        <tr v-for="(student, index) in students">
                            <td class="row-num">{{ pdigit(index+1) }}</td>
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
                            <td class="actions">
                                <div class="score">
                                    <i :class="['fas', 'fa-plus-circle', 'btn-score', 'btn-plus']" @click="setStudentState(student, 1)"></i>
                                    <input type="text" :value="getStudentScore(student)" readonly>
                                    <i :class="['fas', 'fa-minus-circle', 'btn-score', 'btn-minus']" @click="setStudentState(student, -1)"></i>
                                </div>
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            pdigit,
            students: [],
            session: {
                id: this.$route.params.id
            }
        }
    },
    methods: {
        fetchSession: async function () {
            this.session = await Session.findByPk(this.$route.params.id);
        },
        fetchStudents: async function () {
            this.students = await app.activeClass.getStudents({
                include: {
                    model: Score,
                    required: false,
                    where: {
                        session_id: this.$route.params.id,
                    },
                },
                order: [
                    ['last_name', 'ASC']
                ]
            });

            console.log(this.students);
            
        },
        setStudentState: async function (student, addedScore) {
            let score = await Score.findOne({
                where: {
                    student_id: student.id,
                    session_id: this.session.id
                }
            });

            if(score) {
                let newScore = score.score + addedScore;
                if(newScore == 0)
                    await score.destroy();
                else {
                    score.score = newScore;
                    await score.save();
                }
            } else {
                score = Score.build({ score: addedScore });
                score.setStudent(student, { save: false });
                score.setSession(this.session, { save: false });
                await score.save();
            }

            this.fetchStudents();
        },
        getStudentScore: function (student) {
            if(student.Scores.length > 0)
                return student.Scores[0].score;
            else
                return null;
        }
    },
    created() {
        this.fetchSession();
        this.fetchStudents();
    },
    watch: {
        $route(to, from) {
            this.fetchSession();
            this.fetchStudents();
        },
    },
}