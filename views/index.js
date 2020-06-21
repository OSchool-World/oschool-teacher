const { Class, Session, Student } = require('../models');
const moment = require('moment');
const jmoment = require('moment-jalaali');
jmoment.loadPersian({dialect: 'persian-modern'});

const PHome = require('./home.vue');
const PStudents = require('./students.vue');
    const PStudent_Information = require('./student/information.vue');
    const PStudent_Attendance = require('./student/attendance.vue');
    const PStudent_Grades = require('./student/grades.vue');
    const PStudent_Notes = require('./student/notes.vue');
const PCalendar = require('./calendar.vue');
    const PCalendarEvent = require('./calendar/event.vue');
const PClassBook = require('./class-book.vue');
    const PClassBook_Information = require('./class-book/information.vue');
    const PClassBook_Attendance = require('./class-book/attendance.vue');
    const PClassBook_LessonPlan = require('./class-book/lesson_plan.vue');
    const PClassBook_Scores = require('./class-book/scores.vue');
    const PClassBook_HomeWorks = require('./class-book/home_works.vue');
const PGrades = require('./grades.vue');
    const PGradeItem = require('./grades/grade-item.vue');
const PAbout = require('./about.vue');

String.prototype.toPerisanDigits = function () {
    return this.replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
};

Vue.use(VueRouter);
Vue.use(VuePersianDatetimePicker, {
    name: 'date-picker',
    props: {
        inputFormat: 'YYYY-MM-DD',
        format: "YYYY-MM-DD",
        displayFormat: "jYYYY/jMM/jDD",
        // placeholder: 'تاریخی را انتخاب کنید',
        color: '#4554D1',
    }
});

const router = new VueRouter({
    routes: [
        { path: '/' },
        { path: '/home', name: 'home', component: PHome},
        { path: '/students/:id?', name: 'students', component: PStudents, children: [
            { path: 'information', name: 'student_information', component:  PStudent_Information},
            { path: 'attendance', name: 'student_attendance', component:  PStudent_Attendance},
            { path: 'grades', name: 'student_grades', component:  PStudent_Grades},
            { path: 'notes', name: 'student_notes', component:  PStudent_Notes},
        ]},
        { path: '/calendar', name: 'calendar', component: PCalendar, children: [
            { path: 'events/:id?', name: 'calendar_event', component: PCalendarEvent },
        ]},
        { path: '/class_book/:id?', name: 'class_book', component: PClassBook, children: [
            { path: 'information', name: 'class_book_information', component: PClassBook_Information },
            { path: 'attendance', name: 'class_book_attendance', component: PClassBook_Attendance },
            { path: 'lesson_plan', name: 'class_book_lesson_plan', component: PClassBook_LessonPlan },
            { path: 'scores', name: 'class_book_scores', component: PClassBook_Scores },
            { path: 'home_works', name: 'class_book_home_works', component: PClassBook_HomeWorks },
        ]},
        { path: '/grades', name: 'grades', component: PGrades, children: [
            { path: 'grade_item/:id?', name: 'grade_item', component: PGradeItem },
        ]},
        { path: '/about', name: 'about', component: PAbout},
    ]
});

var app = new Vue({
    el: "#app",
    router,
    data: {
        loading: true,
        activeClass: null,
        isShowClasses: false,
        classes: []
        
    },
    methods: {
        fetchLastClass: async function () {
            this.activeClass = await Class.findByPk(1);
        },
        fetchClasses: async function () {
            this.classes = await Class.findAll();
        },
        setActiveClass: function (activeClass) {
            this.activeClass = activeClass;
            this.isShowClasses = false;
            router.push('/null');
            this.$nextTick(() => {
                router.push({name: 'home'});
            })
        },
        createNewClass: async function () {
            this.isShowClasses = false;
            let newClass = await Class.create({ name: '[درس بدون نام]' });
            this.activeClass = newClass;
            this.fetchClasses();
            router.push('/null');
            this.$nextTick(() => {
                router.push({name: 'home'});
            })
        }
    },
    mounted() {
        setTimeout(() => {
            this.loading = false;    
        }, 200);
    },
    async created() {
        await this.fetchClasses();
        await this.fetchLastClass();
        this.$router.push('/home');
    }
});