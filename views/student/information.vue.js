const { Student } = require('../../models');
const { app, dialog } = require('electron').remote;
const fs = require('fs');
const path = require("path");
const Jimp = require('jimp');

module.exports = {
    template: `
        <div class="student-information p-3 row justify-content-center">
            <br>
            <div class="col-4 text-right">
                <div class="row">
                    <div class="col">
                        <br>
                        <input type="text" class="form-control" placeholder="نام" v-model="student.first_name">
                        <input type="text" class="form-control mt-2" placeholder="نام خانوادگی" v-model="student.last_name">
                    </div>
                    <div class="pl-3 text-center">
                        <div class="student-image" @click="uploadImage($event)">
                            <i class="fas fa-camera" v-if="!student.hasImage"></i>
                            <img :src="path" @load="imageLoad($event)" @error="imageError($event)" v-if="student.hasImage">
                            <div id="deleteUserImage" class="delete" @click="delImage" v-if="student.hasImage">
                                <i id="deleteUserImageIcon" class="fas fa-times" style="pointer-event: none"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <label>موبایل</label>
                <div class="input-group mb-2 dir-ltr">
                    <div class="input-group-prepend">
                        <div class="input-group-text"><i class="fas fa-mobile-alt"></i></div>
                    </div>
                    <input type="text" class="form-control dir-ltr" placeholder="موبایل" v-model="student.mobile">
                </div>
                <label>موبایل مادر</label>
                <div class="input-group mb-2 dir-ltr">
                    <div class="input-group-prepend">
                        <div class="input-group-text"><i class="fas fa-mobile-alt"></i></div>
                    </div>
                    <input type="text" class="form-control dir-ltr" placeholder="موبایل مادر" v-model="student.mobile_mother">
                </div>
                <label>موبایل پدر</label>
                <div class="input-group mb-2 dir-ltr">
                    <div class="input-group-prepend">
                        <div class="input-group-text"><i class="fas fa-mobile-alt"></i></div>
                    </div>
                    <input type="text" class="form-control dir-ltr" placeholder="موبایل پدر" v-model="student.mobile_father">
                </div>
                <label>تلفن منزل</label>
                <div class="input-group mb-2 dir-ltr">
                    <div class="input-group-prepend">
                        <div class="input-group-text"><i class="fas fa-phone-alt"></i></div>
                    </div>
                    <input type="text" class="form-control dir-ltr" placeholder="تلفن منزل" v-model="student.phone">
                </div>
            </div>
            <div class="col-4 text-right">
                <label>ایمیل</label>
                <div class="input-group mb-2 dir-ltr">
                    <div class="input-group-prepend">
                        <div class="input-group-text"><i class="fas fa-envelope"></i></div>
                    </div>
                    <input type="email" class="form-control dir-ltr" placeholder="email" v-model="student.email">
                </div>
                <label>آدرس منزل</label>
                <textarea rows="3" class="form-control" placeholder="آدرس منزل" v-model="student.address"></textarea>
                <label>توضیحات</label>
                <textarea rows="8" class="form-control" placeholder="توضیحات" v-model="student.description"></textarea>
            </div>
            <div class="col-8">
                <br>
                <div class="d-flex">
                    <button class="btn btn-success" @click="save">ذخیره</button>
                    <button class="btn btn-outline-secondary mr-2" @click="cancel">انصراف</button>
                    <button class="btn btn-danger mr-auto" @click="del">حذف</button>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            student: {
                first_name: null,
                last_name: null,
                email: null,
                mobile: null,
                mobile_mother: null,
                mobile_father: null,
                phone: null,
                address: null,
                description: null
            },
            path: null,
        }
    },
    methods: {
        fetchData: async function () {
            this.student = await Student.findByPk(this.$route.params.id);
            this.path = this.student.getImagePathWithTime();
        },
        save: function () {
            this.student.save();
            this.refreshParentList();
        },
        cancel: async function () {
            await this.student.reload();
        },
        del: async function () {
            let student = await Student.findByPk(this.$route.params.id);
            student.destroy();
            router.push({ name: 'students' });
        },
        uploadImage: async function (event) {
            if(event.target.id == 'delteUserImage' || event.target.id == 'deleteUserImageIcon')
                return;

            const dialogResult = await dialog.showOpenDialog({ properties: ['openFile'] });

            if(dialogResult.canceled)
                return;

            const filePath = dialogResult.filePaths[0];
            const fileName = path.basename(filePath);

            Jimp.read(filePath)
                .then(image => {
                    return image
                    .cover(256, 256) // cover
                    .write(this.student.getImagePath()); // save
                })
                .then(image => {
                    this.student.image_updated_at = new Date();
                    return this.student.save();
                })
                .then(student => {
                    this.refreshParentList();
                })
                .catch(err => {
                    console.error(err);
                });
        },
        imageLoad: function (event) {
            this.showImage = true;
        },
        imageError: function (event) {
            this.showImage = false;
            this.path = "";
        },
        delImage: function () {
            fs.unlink(this.student.getImagePath(), (err) => {
                if(err)
                    console.error(err);

                this.student.image_updated_at = null;
                this.student.save()
                    .then(() => {
                        this.refreshParentList();
                    });                  
            });
        },
        refreshParentList: function () {
            router.push({ name: 'students' });
            this.$nextTick(function () {
                router.push({ name: 'student_information', params: {id: this.student.id} });
            });
        }
    },
    created () {
        this.fetchData();
    },
    watch: {
        $route(to, from) {
            this.fetchData();
        }
    }
}