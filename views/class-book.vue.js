const { Session } = require('../models');
const jmoment = require('moment-jalaali');
jmoment.loadPersian({dialect: 'persian-modern'});
const pdigit = require('../tools/persian-digit');

module.exports = {
    template: `
        <section class="align-self-stretch d-flex align-items-stretch">
            <div class="mr-3 d-flex align-items-stretch" style="width: 100px">
                <div class="panel d-flex align-items-stretch" style="border-radius: 50px">
                    <div class="scroll-y col mt-3 mb-3">
                        <ul class="class-book-dates">
                            <template v-for="session in sessionList">
                                <li :title="jmoment(session.date).format('dddd jD / jMM / jYYYY')" @click="setActiveSession(session)" :class="{active: session.id == $route.params.id}">
                                    <div class="day">{{ jmoment(session.date).format("YYYYMMDD") == jmoment().format("YYYYMMDD") ? "امروز" : jmoment(session.date).format("dddd") }}</div>
                                    <div class="date" v-if="jmoment(session.date).format('YYYYMMDD') != jmoment().format('YYYYMMDD')">{{ pdigit( jmoment(session.date).format("jD / jMMMM") ) }}</div>
                                </li>
                                <li class="line">|</li>
                            </template>
                            <li class="add">
                                <i class="fas fa-plus-circle" @click="showDatePicker=true"></i>                                   
                            </li>
                        </ul>
                        <date-picker
                            v-model="date"
                            element="my-custom-editable-input"
                            :editable="true"
                            :show="showDatePicker"
                            @close="showDatePicker=false"
                            @input="inputDate"
                        />
                    </div>
                </div>
            </div>
            <div class="mr-4 d-flex flex-column justify-content-center" style="width: 110px" v-if="$route.params.id">
                <router-link class="class-book-section" tag="div" :to="{name: 'class_book_information', params: $route.params}">
                    <div class="icon">
                        <i class="fas fa-info"></i>
                    </div>
                    <div class="title">
                        اطلاعات جلسه
                    </div>
                </router-link>
                <router-link class="class-book-section" tag="div" :to="{name: 'class_book_lesson_plan', params: $route.params}">
                    <div class="icon">
                        <i class="fas fa-file-signature"></i>
                    </div>
                    <div class="title">
                        طرح درس
                    </div>
                </router-link>
                <router-link class="class-book-section" tag="div" :to="{name: 'class_book_attendance', params: $route.params}">
                    <div class="icon">
                        <i class="fas fa-check-double"></i>
                    </div>
                    <div class="title">
                        حضور و غیاب
                    </div>
                </router-link>
                <router-link class="class-book-section" tag="div" :to="{name: 'class_book_scores', params: $route.params}">
                    <div class="icon">
                        <i class="fas fa-award"></i>
                    </div>
                    <div class="title">
                        امتیازات
                    </div>
                </router-link>
                <!-- <router-link class="class-book-section" tag="div" :to="{name: 'class_book_home_works', params: $route.params}">
                    <div class="icon">
                        <i class="fas fa-book-reader"></i>
                    </div>
                    <div class="title">
                        تکالیف
                    </div>
                </router-link> -->
            </div>
            <router-view v-if="$route.params.id"></router-view>
        </section>
    `,
    data: function () {
        return {
            pdigit,
            jmoment,
            sessionList: [],
            showDatePicker: false,
            date: '',
        }
    },
    methods: {
        fetchSessionlist: async function () {
            this.sessionList = await app.activeClass.getSessions({
                order: [
                    ['date', 'ASC']
                ]
            });
        },
        setActiveSession: function (session) {
            router.push({ params: {id: session.id} });
        },
        inputDate: async function () {
            //TODO Check for date's duplication.
            let session = await app.activeClass.createSession({ date: this.date });
            this.fetchSessionlist();
            this.setActiveSession(session);
        }
    },
    created() {
        this.fetchSessionlist();
    },
    watch: {
        $route(to, from) {
            if(to.name == 'class_book')
                this.fetchSessionlist();

            if(to.name == 'class_book' && to.params.id)
                router.push({ name: 'class_book_information', params: { id: to.params.id } })
        }
    }
}