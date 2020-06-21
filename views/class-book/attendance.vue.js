const { Student, Session, Attendance } = require('../../models');
const pdigit = require('../../tools/persian-digit');

module.exports = {
    template: `
        <div class="col d-flex align-items-stretch mr-4 ml-3 panel">
            <div class="col scroll-y">
                <div class="attendance mr-3 ml-3">
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
                                <i :class="['fas', 'fa-check-circle', 'btn-attendance', 'btn-present', {active: getStudentState(student) == 'PRESENT'}]" @click="setStudentState(student, 'PRESENT')"></i>
                                <i :class="['fas', 'fa-times-circle', 'btn-attendance', 'btn-absent', {active: getStudentState(student) == 'ABSENT'}]" @click="setStudentState(student, 'ABSENT')"></i>
                                <div class="delay">
                                    <i :class="['fas', 'fa-clock', 'btn-attendance', 'btn-delay', {active: getStudentState(student) == 'DELAYED'}]" @click="setStudentState(student, 'DELAYED')"></i>
                                    <input type="number" placeholder="دقیقه" :value="getStudentDelayTime(student)" @change="setStudentState(student, 'DELAYED', $event.target.value)">
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
                    model: Attendance,
                    required: false,
                    where: {
                        session_id: this.$route.params.id,
                    },
                },
                order: [
                    ['last_name', 'ASC']
                ]
            });
        },
        setStudentState: async function (student, status, delay_time=null) {
            await student.addSession(this.session, { through: { status: status, delay_time: delay_time }});

            await student.reload({
                include: {
                    model: Attendance,
                    required: false,
                    where: {
                        session_id: this.$route.params.id,
                    }
                }
            });
        },
        getStudentState: function (student) {
            if(student.Attendances.length <= 0)
                return null;

            return student.Attendances[0].status;
        },
        getStudentDelayTime: function (student) {
            if(student.Attendances.length <= 0)
                return null;

            return student.Attendances[0].delay_time;
        },
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