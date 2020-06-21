const { Session } = require('../../models');
const moment = require('moment');
const DoughnutChart = require('../charts/doughnut.vue');
const { Sequelize } = require('sequelize');
const pdigit = require('../../tools/persian-digit');

module.exports = {
    template: `
        <div class="col p-4 mr-4 ml-3 panel d-flex justify-content-center">
            <div class="col-4 text-right">
                <label>تاریخ</label>
                <date-picker v-model="session.date"></date-picker>
                <br>
                <label>زمان شروع</label>
                <date-picker v-model="session.start_time" type="time" format="HH:mm" display-format="HH:mm" inputFormat="HH:mm"/>
                <br>
                <label>زمان پایان</label>
                <date-picker v-model="session.end_time" type="time" format="HH:mm" display-format="HH:mm" inputFormat="HH:mm"/>
                <br>
                <label>مکان</label>
                <input v-model="session.place" type="text" class="form-control" placeholder="مکان">
                <br>
                <label>یادداشت</label>
                <textarea v-model="session.notes" class="form-control" rows="5" placeholder="یادداشت"></textarea>
                <br>
                <div class="text-right">
                    <button class="btn btn-success" @click="save">ذخیره</button>
                    <button class="btn btn-outline-secondary" @click="cancel">انصراف</button>
                    <button class="btn btn-danger" @click="del">حذف</button>
                </div>
            </div>
            <div class="col-5">
                <doughnut-chart :chart-data="attendanceData" :options="attendanceChart.options"></doughnut-chart>
                <div class="col text-center">
                    مجموع تاخیر: {{ pdigit(delayTimeSum) }} دقیقه
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
            session: {
                date: null
            },
            start_time: null,
            end_time: null,
            attendanceChart: {
                data: [],
                labels: ['حاضر', 'تاخیر', 'غایب', 'اعلام نشده'],
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
                                pdigit(data.datasets[0].data[tooltipItem.index]) + ' نفر';
                            }
                        }
                    }
                },
            },
            delayTimeSum: 0
        }
    },
    methods: {
        fetchSession: async function () {
            this.session = await Session.findByPk(this.$route.params.id);
        },
        save: function () {
            this.session.save();
            router.push({ name: 'class_book' });
            this.$nextTick(function () {
                router.push({ name: 'class_book_information', params: {id: this.session.id} });
            });
        },
        cancel: async function () {
            await this.session.reload();
        },
        del: async function () {
            let session = await Session.findByPk(this.$route.params.id);
            session.destroy();
            router.push({ name: 'class_book' });
        },
        fetchAttendanceChartData: async function () {
            let attendances = await this.session.getAttendances({
                attributes: [
                    [Sequelize.fn('count', Sequelize.col('status')), 'status_count'],
                    [Sequelize.fn('sum', Sequelize.col('delay_time')), 'delay_time_sum'],
                    'status'
                ],
                group: 'status'
            });

            let studentCount = await app.activeClass.countStudents();

            let res = {
                PRESENT: 0,
                ABSENT: 0,
                DELAYED: 0,
                NOT_REPORTED: 0
            }
            let delay_time_sum = 0;

            attendances.forEach((attendance) => {
                res[attendance.dataValues.status] = attendance.dataValues.status_count;
                if(attendance.dataValues.status == 'DELAYED')
                    delay_time_sum = attendance.dataValues.delay_time_sum;
            });

            res.NOT_REPORTED = studentCount - (res.PRESENT + res.ABSENT + res.DELAYED);

            let data = [
                res.PRESENT*1,
                res.DELAYED*1,
                res.ABSENT*1,
                res.NOT_REPORTED*1
            ];          

            this.delayTimeSum = delay_time_sum ?? 0;
            this.attendanceChart.data = data;
            this.attendanceChart.labels = ['حاضر', 'تاخیر', 'غایب', 'اعلام نشده'];
        },
        fetch: async function () {
            await this.fetchSession();
            await this.fetchAttendanceChartData();
        },
    },
    created () {
        this.fetch();
    },
    watch: {
        $route(to, from) {
            this.fetch();
        },
        start_time(){
            // this.session.start_time = moment(this.start_time, 'hh:mm');
            this.session.start_time = this.start_time;
        },
        end_time(){
            // this.session.end_time = moment(this.end_time, 'hh:mm');
            this.session.end_time = this.end_time;
        }
    },
    computed: {
        attendanceData() {
            return {
                labels: this.attendanceChart.labels,
                datasets: [
                    {
                        label: 'Data One',
                        backgroundColor: ['#00E049', '#FFB900', '#FA002E', '#909CB8'],
                        data: this.attendanceChart.data,
                    },
                ]
            }
        }
    },
}