const { Student } = require('../models');
const pdigit = require('../tools/persian-digit');

module.exports = {
    template: `
        <section class="align-self-stretch d-flex align-items-stretch">
            <div class="mr-3 d-flex align-items-stretch" style="width: 260px">
                <div class="panel d-flex align-items-stretch">
                    <div class="scroll-y" style="width: 100%">
                        <div class="col sticky-top pt-1 pb-2 bg-white">
                            <input type="text" class="form-control" placeholder="جستجو" v-model="searchInput">
                        </div>
                        <ul class="student-list">
                            <li v-for="(student, index) in filteredStudentList" @click="setStudent(student)" :class="{active: student.id == $route.params.id}">
                                <div class="row-num">{{pdigit(index+1)}}</div>
                                <div class="image">
                                    <img 
                                        :src="student.getImagePathWithTime()"
                                        alt="Student Image"
                                        v-if="student.hasImage"
                                    >
                                    <i class="fas fa-user" v-if="!student.hasImage"></i>
                                </div>
                                <div class="name">
                                    <div class="fname">{{student.first_name}}</div>
                                    <div class="lname">{{student.last_name}}</div>
                                </div>
                            </li>
                            <li class="add justify-content-center">
                                <i class="fas fa-plus-circle" @click="add"></i>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="col mr-2 d-flex align-items-stretch">
                <div class="panel d-flex flex-column" v-if="$route.params.id">
                    <ul class="nav nav-tabs">
                        <li class="nav-item">
                            <router-link class="nav-link" active-class="active" tag="a" href="#" :to="{name: 'student_information', params: $route.params}">مشخصات فردی</router-link>
                        </li>
                        <li class="nav-item">
                            <router-link class="nav-link" active-class="active" tag="a" href="#" :to="{name: 'student_notes', params: $route.params}">یادداشت‌ها</router-link>
                        </li>
                        <li class="nav-item">
                            <router-link class="nav-link" active-class="active" tag="a" href="#" :to="{name: 'student_attendance', params: $route.params}">آمار حضور</router-link>
                        </li>
                        <li class="nav-item">
                            <router-link class="nav-link" active-class="active" tag="a" href="#" :to="{name: 'student_grades', params: $route.params}">نمرات</router-link>
                        </li>
                    </ul>
                    
                    <router-view></router-view>
                </div>
            </div>
        </section>
    `,
    data: function () {
        return {
            pdigit,
            studentList: [],
            searchInput: null
        }
    },
    methods: {
        fetchStudents: async function () {
            this.studentList = await app.activeClass.getStudents({
                order: [
                    ['last_name', 'ASC']
                ]
            });
        },
        setStudent: function (student) {
            router.push({ params: {id: student.id} });
        },
        add: async function () {
            const student = await app.activeClass.createStudent({ first_name: "[بی نام]", last_name: "[بی نام‌خانوادگی]" });
            this.fetchStudents();
            router.push({ name: 'student_information', params: {id: student.id} });
        }
    },
    created () {
        this.fetchStudents();
    },
    watch: {
        $route(to, from) {
            if(to.name == 'students')
                this.fetchStudents();

            if(to.name == 'students' && to.params.id)
                router.push({ name: 'student_information', params: { id: to.params.id } })
        }
    },
    computed: {
        filteredStudentList: function () {
            if(!this.searchInput)
                return this.studentList;
            else
                return this.studentList.filter((student) => {
                    return student.first_name.includes(this.searchInput) || student.last_name.includes(this.searchInput);
                })
        }
      }
};