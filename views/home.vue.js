const DoughnutChart = require('./charts/doughnut.vue');
const LineChart = require('./charts/line.vue');
const { Attendance, Student, CalendarEvent } = require('../models');
const jmoment = require('moment-jalaali');
const { Op, Sequelize } = require('sequelize');
const pdigit = require('../tools/persian-digit');

module.exports = {
    template: `
        <section class="home align-self-stretch d-flex align-items-stretch">
            <div class="col-3 d-flex flex-column align-items-stretch">
                <div class="panel panel-class-name d-flex align-items-center justify-content-center" style="height: 80px;">
                    <span v-show="!editClassName">
                        {{ $root.activeClass.name }}
                        <i class="fas fa-edit cursor-pointer" @click="editClassNameClick"></i>
                    </span>
                    <input
                        v-show="editClassName"
                        type="text"
                        class="form-control mr-4 ml-4"
                        v-model="$root.activeClass.name"
                        @blur="classNameInputBlur"
                        @keydown.enter="classNameInputBlur"
                        ref="editClassNameInput"
                        maxlength="30"
                    >
                </div>
                <div class="panel panel-events col mt-3 d-flex flex-column">
                    <div class="panel-title">رویدادهای پیش رو</div>
                    <div class="col mt-3 text-right align-self-stretch scroll-y" v-if="upcomingEvents.length > 0">
                        <table>
                            <tr v-for="event in upcomingEvents" :class="event.type">
                                <td class="type-symbol"><i class="fas fa-circle"></i></td>
                                <td class="day">{{ getEventDateText(event.date) }}</td>
                                <td class="desc">{{ event.description }}</td>
                            </tr>
                        </table>
                    </div>
                    <div class="not-found text-center mt-3" v-if="upcomingEvents.length <= 0">
                        رویداد نزدیکی وجود ندارد.
                    </div>
                </div>
            </div>
            <div class="col d-flex pr-2 flex-column align-items-stretch">
                <div class="d-flex flex-shrink-0" style="height: 160px;">
                    <div class="panel panel-count panel-orange col d-flex p-4">
                        <div class="d-flex align-items-center justify-content-center mr-3">
                            <div class="icon d-flex align-items-center justify-content-center">
                                <i class="fas fa-users"></i>
                            </div>
                        </div>
                        <div class="col text-center text-white">
                            <div class="count">{{ pdigit(studentCount) }}</div>
                            <div class="unit">دانش‌آموز</div>
                        </div>
                    </div>
                    <div class="panel panel-count panel-green col mr-4 d-flex p-4">
                        <div class="d-flex align-items-center justify-content-center mr-3">
                            <div class="icon d-flex align-items-center justify-content-center">
                                <i class="fas fa-book"></i>
                            </div>
                        </div>
                        <div class="col text-center text-white">
                            <div class="count">{{ pdigit(sessionCount) }}</div>
                            <div class="unit">جلسه‌ی درس</div>
                        </div>
                    </div>
                    <div class="panel panel-count panel-red col mr-4 d-flex p-4">
                        <div class="d-flex align-items-center justify-content-center mr-3">
                            <div class="icon d-flex align-items-center justify-content-center">
                                <i class="fas fa-pencil-alt"></i>
                            </div>
                        </div>
                        <div class="col text-center text-white">
                            <div class="count">{{ pdigit(studentNoteCount) }}</div>
                            <div class="unit">یادداشت تربیتی</div>
                        </div>
                    </div>
                </div>
                <div class="d-flex mt-4 flex-shrink-0" style="height: 240px;">
                    <div class="panel col d-flex flex-column">
                        <div class="panel-title">تعداد حاضرین جلسات</div>
                        <line-chart 
                            class="col m-auto align-self-center"
                            style="position: relative; max-height: 180px;"
                            :chart-data="attendanceLineChartData"
                            :options="attendanceLineChart.options"
                        >
                        </line-chart>
                    </div>
                </div>
                <div class="col d-flex mt-4 p-0">
                    <div class="col panel d-flex flex-column">
                        <div class="panel-title">درصد حضور و غیاب</div>
                        <doughnut-chart
                            class="m-auto align-self-center"
                            style="position: relative; max-height: 240px; max-width: 400px;"
                            :chart-data="attendanceDoughnutChartData"
                            :options="attendanceDoughnutChart.options"
                        >
                        </doughnut-chart>
                    </div>
                    <div class="col panel mr-4">
                        <!-- <div class="panel-title">؟؟؟</div> -->
                    </div>
                </div>
            </div>
        </section>
    `,
    components: {
        DoughnutChart,
        LineChart
    },
    data: function () {
        return {
            pdigit,
            jmoment,
            attendanceDoughnutChart: {
                labels: ['حاضر', 'تاخیر', 'غایب', 'اعلام نشده'],
                data: [],
                options: {
                    animation: {
                        animateScale: true,
                        animateRotate: true
                    },
                    legend: {
                        position: 'right'
                    },
                    maintainAspectRatio: false,
                    tooltips: {
                        callbacks: {
                            label: function (tooltipItem, data) {
                                return data.labels[tooltipItem.index] + ": " + pdigit(data.datasets[0].data[tooltipItem.index]) + '%';
                            }
                        }
                    }
                },
            },
            attendanceLineChart: {
                labels: [],
                data: [],
                options: {
                    animation: {
                        animateScale: true,
                        animateRotate: true
                    },
                    legend: {
                        display: false,
                        position: 'top'
                    },
                    maintainAspectRatio: false,
                    scales: {
                        xAxes: [{
                            display: true,
                            // scaleLabel: {
                            // 	display: true,
                            // 	labelString: 'جلسه'
                            // },
                            gridLines: {
                                display: true,
                                drawBorder: true,
                                drawOnChartArea: false,
                            },
                        }],
                        yAxes: [{
                            display: true,
                            // scaleLabel: {
                            // 	display: true,
                            // 	labelString: 'نفر'
                            // },
                            ticks: {
                                precision: 0,
                                callback: function (val) {
                                    return pdigit(val);
                                }
                            },
                            gridLines: {
                                display: true,
                                drawBorder: true,
                                drawOnChartArea: false,
                            },
                        }]
                    },
                    tooltips: {
                        callbacks: {
                            label: function (tooltipItem, data) {
                                return data.datasets[0].label + ': ' + pdigit(tooltipItem.value);
                                
                                
                            }
                        }
                    }
                }
            },
            sessionCount: 0,
            studentCount: 0,
            studentNoteCount: 0,
            upcomingEvents: [],
            editClassName: false
        }
    },
    methods: {
        fetchData: async function () {
            await this.fetchCounts();
            this.fetchLineChartAttendanceData();
            this.fetchDoughnutChartAttendanceData();
            this.fetchUpcomingEvents();
        },
        fetchLineChartAttendanceData: async function () {
            let sessions = await app.activeClass.getSessions({
                include: [{
                    required: false,
                    model: Student,
                }],
                order: [
                    ['date', 'ASC']
                ]
            });

            let labels = [];
            let data = [];
            sessions.forEach((session) => {
                labels.push(pdigit(jmoment(session.date).format('jYY/jMM/jDD')));
                let count = session.Students.reduce((count, student) => {
                    return ((student.Attendance.status == 'PRESENT' || student.Attendance.status == 'DELAYED') ? count+1 : count);
                }, 0);
                data.push(count);
            });
            
            this.attendanceLineChart.labels = labels;
            this.attendanceLineChart.data = data;
        },
        fetchDoughnutChartAttendanceData: async function () {
            let sessions = await app.activeClass.getSessions({
                attributes: [
                    'id'
                ]
            });

            let sessionIds = sessions.map((session) => session.id);

            let attendances = await Attendance.findAll({
                attributes: [
                    'status',
                    [Sequelize.fn('COUNT', Sequelize.col('status')), 'statusCount'],
                ],
                group: 'status',
                where: {
                    session_id: {
                        [Op.in]: sessionIds
                    }
                }
            });

            let counts = {
                PRESENT: 0,
                ABSENT: 0,
                DELAYED: 0,
                NOT_REPORTED: 0,
                POSSIBLE: 0
            }

            attendances.forEach((attendance) => {
                counts[attendance.status] = attendance.dataValues.statusCount;
            });
            
            counts.POSSIBLE = this.studentCount * this.sessionCount;
            counts.NOT_REPORTED = counts.POSSIBLE - (counts.PRESENT + counts.ABSENT + counts.DELAYED);

            let labels = ['حاضر', 'تاخیر', 'غایب', 'اعلام نشده'];
            let percentages = [
                counts.PRESENT*100/counts.POSSIBLE,
                counts.DELAYED*100/counts.POSSIBLE,
                counts.ABSENT*100/counts.POSSIBLE,
                counts.NOT_REPORTED*100/counts.POSSIBLE,
            ];

            for (let index = 0; index < percentages.length; index++) {
                percentages[index] = Math.round((percentages[index] + Number.EPSILON) * 100) / 100;
                
            }

            this.attendanceDoughnutChart.labels = labels;
            this.attendanceDoughnutChart.data = percentages;
        },
        fetchCounts: async function () {
            this.studentCount = await app.activeClass.countStudents();
            this.sessionCount = await app.activeClass.countSessions();
            this.studentNoteCount = await app.activeClass.countStudentNotes();
        },
        fetchUpcomingEvents: async function () {
            let fromDate = jmoment();
            let toDate = jmoment().add(6, 'days');

            this.upcomingEvents = await CalendarEvent.findAll({
                where: {
                    date: {
                        [Op.between]: [fromDate.toDate(), toDate.toDate()]
                    },
                    [Op.or]: [
                        {
                            type: 'PUBLIC_CUSTOM_EVENT'
                        },
                        {
                            type: 'CLASS_CUSTOM_EVENT',
                            class_id: app.activeClass.id
                        }
                    ]
                },
                order: [
                    ['date', 'ASC']
                ]
            });
        },
        getEventDateText: function (date) {
            let moment = jmoment(date);

            if(moment.format('YYYYMMDD') == jmoment().format('YYYYMMDD'))
                return 'امروز';
            
            if(moment.format('YYYYMMDD') == jmoment().add(1,'days').format('YYYYMMDD'))
                return 'فردا';
            
            if(moment.format('YYYYMMDD') == jmoment().add(2, 'days').format('YYYYMMDD'))
                return 'پس‌فردا';

            return moment.format('dddd');
        },
        classNameInputBlur: async function () {
            await app.activeClass.save();
            this.editClassName = false;
            this.$root.fetchClasses();
        },
        editClassNameClick: function () {
            this.editClassName = true;
            this.$nextTick(() => {
                this.$refs.editClassNameInput.focus();
                this.$refs.editClassNameInput.select();
            });
        }
    },
    created () {
        this.fetchData();
    },
    computed: {
        attendanceLineChartData() {
            return {
                labels: this.attendanceLineChart.labels,
                datasets: [
                    {
                        label: 'حاضر + تاخیر',
                        borderCapStyle: 'round',
                        borderJoinStyle: 'round',
                        borderColor: '#FA002E',
                        backgroundColor: 'rgba(0,0,0,0)',
                        pointBackgroundColor: '#FA002E',
                        data: this.attendanceLineChart.data,
                    },
                ]
            };
        },
        attendanceDoughnutChartData() {
            return {
                labels: this.attendanceDoughnutChart.labels,
                datasets: [
                    {
                        label: 'Data One',
                        backgroundColor: ['#00E049', '#FFB900', '#FA002E', '#909CB8'],
                        data: this.attendanceDoughnutChart.data
                    },
                ]
            };
        }
    },
}