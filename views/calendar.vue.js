const jmoment = require('moment-jalaali');
const imoment = require('moment-hijri');
const { Session, CalendarEvent } = require('../models');
const { Op } = require('sequelize');
const Occasions = require('../tools/calendar/occasions');
const pdigit = require('../tools/persian-digit');

module.exports = {
    template: `
        <section class="align-self-stretch d-flex align-items-stretch">
            <div class="mr-3 d-flex flex-column align-items-stretch"  style="width: 260px">
                <div class="panel pr-3 pl-3 mb-4 text-center">
                    <i class="fas fa-angle-right" style="cursor: pointer" @click="nextYear" title="سال بعد"></i>
                    {{ pdigit(selected_year) }}
                    <i class="fas fa-angle-left"  style="cursor: pointer" @click="previousYear" title="سال قبل"></i>
                    <br>
                    <button class="btn btn-primary col" @click="goToday">برو به امروز</button>
                </div>
                <div class="panel pr-3 pl-3 align-self-start">
                    <ul class="event-list">
                        <li>
                            <input type="checkbox" v-model="isShowSessionEvents">
                            <label>جلسات درس</label>
                            <i class="fas fa-circle event-color session"></i>
                        </li>
                        <li>
                            <input type="checkbox" v-model="isShowOccasionEvents">
                            <label>مناسبت‌ها</label>
                            <i class="fas fa-circle event-color occasion"></i>
                        </li>
                        <li>
                            <input type="checkbox" v-model="isShowPublicCustomEvents">
                            <label>یادداشت‌های شخصی عمومی</label>
                            <i class="fas fa-circle event-color public_custom_event"></i>
                        </li>
                        <li>
                            <input type="checkbox" v-model="isShowClassCustomEvents">
                            <label>یادداشت‌های شخصی این درس</label>
                            <i class="fas fa-circle event-color class_custom_event"></i>
                        </li>
                        <!-- <li>
                            <input type="checkbox">
                            <label>تکالیف</label>
                            <i class="fas fa-circle event-color home_work"></i>
                        </li> -->
                        <!-- <li>
                            <input type="checkbox">
                            <label>کلاس‌های دیگر</label>
                            <i class="fas fa-circle event-color other_sessions"></i>
                        </li> -->
                    </ul>
                </div>
            </div>
            <div class="col mr-2 d-flex align-items-stretch scroll-y">
                <table class="calendar">
                    <tr>
                        <th>شنبه</th>
                        <th>یکشنبه</th>
                        <th>دوشنبه</th>
                        <th>سه‌شنبه</th>
                        <th>چهارشنبه</th>
                        <th>پنجشنبه</th>
                        <th>جمعه</th>
                    </tr>
                    <tr v-for="week in calendar_chunked">
                        <td v-for="day in week">
                            <div :class="{day: true, holiday: day.isHoliday || day.date.format('dddd') == 'جمعه', today: day.date.format('YYYYMMDD') == jmoment().format('YYYYMMDD')}" v-if="day">
                                <div class="title dir-rtl">{{ pdigit( day.date.format("jD jMMMM") ) }}</div>
                                <div class="events">
                                    <div class="event" v-for="event in day.events" v-if="showEvent(event)" @click="editEvent(event)">
                                        <i :class="['fas', 'fa-circle', 'event-color', event.type.toLowerCase()]"></i>
                                        <div class="desc">{{ event.desc }}</div>
                                    </div>
                                </div>
                                <div class="btns">
                                    <div class="col" @click="$router.push({name: 'calendar_event', params: {date: day.date.format()}})">ایجاد رویداد جدید</div>
                                </div>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>

            <router-view></router-view>
        </section>
    `,
    data: function () {
        return {
            pdigit,
            jmoment,
            imoment,
            calendar: [],
            selected_year: null,
            isShowSessionEvents: true,
            isShowOccasionEvents: false,
            isShowClassCustomEvents: true,
            isShowPublicCustomEvents: true,
        }
    },
    methods: {
        chunkArray(array, chunk) {
            let i,j,temparray;
            let res = [];
            for (i=0,j=array.length; i<j; i+=chunk) {
                temparray = array.slice(i,i+chunk);
                res.push(temparray);
            }
            return res;
        },
        manipulateCalendar: function (year) {
            let days = [];

            let first_day = jmoment().jYear(year).startOf('jYear');
            let last_day = jmoment().jYear(year).endOf('jYear');

            let cur = jmoment().jYear(year).startOf('jYear');
            while(cur.format("dddd") != 'شنبه') {
                cur = cur.subtract(1, 'days');
                days.unshift(null);
            }

            cur = jmoment().jYear(year).startOf('jYear');
            while (cur.format("jYYYY") == year) {
                days.push({
                    label: cur.format("jYYYYjMMjDD"),
                    date: cur.clone(),
                    events: [
                        // { type: 'SESSION', desc: 'رویدادی از نوع جلسات' },
                        // { type: 'OCCASION', desc: 'رویدادی از نوع مناسبت‌ها' },
                        // { type: 'CLASS_CUSTOM_EVENT', desc: 'رویدادی از نوع شخصی این درس' },
                        // { type: 'PUBLIC_CUSTOM_EVENT', desc: 'رویدادی از نوع شخصی عمومی' },
                        // { type: 'HOME_WORK', desc: 'رویدادی از نوع تکالیف' },
                        // { type: 'OTHER_SESSIONS', desc: 'رویدادی از نوع تکالیف' },
                    ]
                });
                cur = cur.add(1, 'days');
            }

            this.calendar = days;
        },
        nextYear: function () {
            this.selected_year += 1;
        },
        previousYear: function () {
            this.selected_year -= 1;
        },
        goToday: function () {
            this.selected_year = Number(jmoment().format("jYYYY"));
            this.$nextTick(function () {
                document.getElementsByClassName('today')[0].scrollIntoView({
                    block: "center",
                    behavior: "smooth",
                });
            });
        },
        addEvent: function (date, event) {
            this.calendar.find((day) => {
                return day && day.label == jmoment(date).format('jYYYYjMMjDD')
            }).events.push(event);
        },
        editEvent: function (event) {
            if(event.type == 'CLASS_CUSTOM_EVENT' || event.type == 'PUBLIC_CUSTOM_EVENT')
                this.$router.push({ name: 'calendar_event', params: { id: event.id } });
        },
        showEvent: function (event) {
            return  (event.type == 'SESSION' && this.isShowSessionEvents) ||
                    (event.type == 'OCCASION' && this.isShowOccasionEvents) ||
                    (event.type == 'CLASS_CUSTOM_EVENT' && this.isShowClassCustomEvents) ||
                    (event.type == 'PUBLIC_CUSTOM_EVENT' && this.isShowPublicCustomEvents)
                    ;
        },
        fetchAndAddSessionEvents: async function () {
            let sessions = await app.activeClass.getSessions({
                attributes: [
                    'id',
                    'date'
                ],
                order: [
                    ['date', 'ASC']
                ]
            });

            let start_of_year = jmoment().jYear(this.selected_year).startOf('jYear');
            let end_of_year = jmoment().jYear(this.selected_year).endOf('jYear');

            sessions.forEach((session, index) => {
                if(jmoment(session.date) >= start_of_year && jmoment(session.date) <= end_of_year)
                    this.addEvent(session.date, {
                        type: "SESSION",
                        desc: "‌جلسه‌ی " + pdigit(index+1) + " درس"
                    });
            });
        },
        fetchAndAddOccasionEvents: function () {
            this.calendar.forEach(day => {
                if(day) {
                    let hijri = Occasions.hijri[imoment(day.date.format()).format("iMM/iDD")];
                    let jalali = Occasions.jalali[jmoment(day.date.format()).format("jMM/jDD")];
                    let gregorian = Occasions.gregorian[jmoment(day.date.format()).format("MM/DD")];                  

                    if (hijri || jalali || gregorian) {
                        let desc =  [hijri ? hijri.title : null,
                                    jalali ? jalali.map(val => { return val.title }).join(' - ') : null,
                                    gregorian ? gregorian.map(val => { return val.title }).join(' - ') : null];

                        desc = desc.filter(function (el) {
                            return el != null;
                        });
                        
                        day.events.push({
                            type: "OCCASION",
                            desc: desc.join('\n\n')
                        });

                        day.isHoliday = (hijri && hijri.isHoliday) || 
                                        (jalali && jalali.find((val) => { return val.isHoliday })) || 
                                        (gregorian && gregorian.find((val) => { return val.isHoliday }));
                    }
                }
            });
        },
        fetchAndAddCustomEvents: async function () {
            let start_of_year = jmoment().jYear(this.selected_year).startOf('jYear');
            let end_of_year = jmoment().jYear(this.selected_year).endOf('jYear');
            
            let calendar_events = await CalendarEvent.findAll({
                attributes: [
                    'id',
                    'date',
                    'type',
                    'description'
                ],
                where: {
                    date: {
                        [Op.between]: [start_of_year.toDate(), end_of_year.toDate()]
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
                }
            });

            calendar_events.forEach((calendar_event) => {
                this.addEvent(calendar_event.date, {
                    id: calendar_event.id,
                    type: calendar_event.type,
                    desc: calendar_event.description
                });
            });
        },
        refresh: function () {
            this.manipulateCalendar(this.selected_year);
            this.fetchAndAddSessionEvents();
            this.fetchAndAddOccasionEvents();
            this.fetchAndAddCustomEvents();
        }
    },
    created () {
        this.goToday();
    },
    watch: {
        $route: function (to, from) {
            if(to.name == 'calendar')
                this.refresh();
        },
        selected_year: function () {
            if(this.selected_year) {
                this.refresh();
            }
        },
    },
    computed: {
        calendar_chunked() {
            return this.chunkArray(this.calendar, 7);
        },
    },
}