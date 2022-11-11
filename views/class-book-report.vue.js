const jmoment = require('moment-jalaali');
const pdigit = require('../tools/persian-digit');
const { LessonPlan, Student } = require('../models');

module.exports = {
    template: `
        <section class="grades align-self-stretch d-flex align-items-stretch">
            <div class="col d-flex align-items-stretch mr-3 ml-3 panel">
                <div class="col text-center scroll-y">
                    <div class="row">
                        <div class="col text-right">
                            <button class="btn btn-primary" @click="copytable">کپی جدول</button>
                        </div>
                    </div>
                    <table class="table selectable" id="tbl">
                        <thead>
                            <tr>
                                <th scope="col">ردیف</th>
                                <th scope="col">تاریخ</th>
                                <th scope="col">زمان شروع</th>
                                <th scope="col">زمان پایان</th>
                                <th scope="col">مکان</th>
                                <th scope="col">یادداشت</th>
                                <th scope="col">خلاصه طرح درس</th>
                                <th scope="col">تعداد حاضران</th>
                                </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(session, index) in sessions">
                                <th scope="row">{{index+1}}</th>
                                <td>{{session.jdate}}</td>
                                <td>{{String(session.start_time)}}</td>
                                <td>{{session.end_time}}</td>
                                <td>{{session.place}}</td>
                                <td style="white-space: pre-line">{{session.notes}}</td>
                                <td style="white-space: pre-line">{{session.LessonPlan.brief}}</td>
                                <td>{{session.studentCount}}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>  
            </div>
        </section>
    `,
    data() {
        return {
            sessions: [],
            pdigit
        }
    },
    methods: {
        async fetchData() {
            this.sessions = await app.activeClass.getSessions({
                include: [
                    {
                        required: false,
                        model: Student,
                    },
                    {
                        required: false,
                        model: LessonPlan,
                        attributes: ['session_id', 'brief']
                    }
                ],
                order: [
                    ['date', 'ASC']
                ]
            });

            this.sessions.forEach((session) => {
                session.jdate = (jmoment(session.date).format('jYY/jMM/jDD'));
                session.studentCount = session.Students.reduce((count, student) => {
                    return ((student.Attendance.status == 'PRESENT' || student.Attendance.status == 'DELAYED') ? count+1 : count);
                }, 0);
            });
        },
        copytable() {
            var el = document.getElementById('tbl');
            var body = document.body, range, sel;
            if (document.createRange && window.getSelection) {
                range = document.createRange();
                sel = window.getSelection();
                sel.removeAllRanges();
                try {
                    range.selectNodeContents(el);
                    sel.addRange(range);
                } catch (e) {
                    range.selectNode(el);
                    sel.addRange(range);
                }
            } else if (body.createTextRange) {
                range = body.createTextRange();
                range.moveToElementText(el);
                range.select();
                document.execCommand("copy");
            }
        }
    },
    created () {
        this.fetchData();
    },
}