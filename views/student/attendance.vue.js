const DoughnutChart = require('../charts/doughnut.vue');
const { Student, Attendance } = require('../../models');
const { Op } = require('sequelize');
const pdigit = require('../../tools/persian-digit');

module.exports = {
    template: `
        <div>
            <div class="col-5 mr-auto ml-auto">
                <doughnut-chart :chart-data="attendanceData" :options="options"></doughnut-chart>
                <div class="text-center">
                    مجموع تاخیر: {{ pdigit(delay_time) }} دقیقه
                </div>
            </div>
        </div>
    `,
    components: {
        DoughnutChart
    },
    data() {
        return {
            pdigit,
            ddd: [],
            options: {
                animation: {
					animateScale: true,
					animateRotate: true
                },
                legend: {
                    position: 'right'
                },
                tooltips: {
                    callbacks: {
                        label: function (tooltipItem, data) {
                            return data.labels[tooltipItem.index] +
                            ": " +
                            pdigit(data.datasets[0].data[tooltipItem.index]) + ' جلسه';
                        }
                    }
                }
            },
            delay_time: null
        }
    },
    methods: {
        fetchData: async function () {
            let sessions = await app.activeClass.getSessions();

            let attendances = await Attendance.findAll({
                where: {
                    student_id: this.$route.params.id,
                    session_id: {
                        [Op.in]: sessions.map((session) => session.id)
                    }
                }
            });

            let presentCount = 0, absentCount = 0, delayCount = 0, notReportedCount = 0, delay_time = 0;

            for (const attendance of attendances) {
                switch (attendance.status) {
                    case "PRESENT":
                        presentCount++;
                        break;
                
                    case "ABSENT":
                        absentCount++;
                        break;
                
                    case "DELAYED":
                        delayCount++;
                        delay_time += attendance.delay_time;
                        break;
                }
            }

            notReportedCount = sessions.length - (presentCount+absentCount+delayCount);

            this.ddd = [presentCount, delayCount, absentCount, notReportedCount];
            this.delay_time = delay_time;
        }
    },
    created () {
        this.fetchData();
    },
    computed: {
        attendanceData() {
            return {
                labels: ['حاضر', 'تاخیر', 'غایب', 'اعلام نشده'],
                datasets: [
                    {
                        label: 'Data One',
                        backgroundColor: ['#00E049', '#FFB900', '#FA002E', '#909CB8'],
                        data: this.ddd
                    },
                ]
            }
        }
    },
    watch: {
        $route(to, from) {
            this.fetchData();
        }
    }
}