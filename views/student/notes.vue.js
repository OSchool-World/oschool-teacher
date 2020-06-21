const { StudentNote } = require('../../models');
const jmoment = require('moment-jalaali');
const pdigit = require('../../tools/persian-digit');

module.exports = {
    template: `
        <div class="student-notes d-flex flex-column" style="height: 100%;">
            <div class="notes col scroll-y p-2">
                <div class="text-center mt-5" v-if="notes.length <= 0">هنوز یادداشتی ثبت نشده است.</div>
                <div class="notes col mt-3 mb-3 mr-2 ml-2">
                    <div class="d-flex note" v-for="note in notes">
                        <div class="date">{{ pdigit(jmoment(note.date).format("jYYYY/jMM/jDD")) }}</div>
                        <div class="text">
                            <span class="text">{{ note.note }}</span>
                            <div class="btns d-flex">
                                <div class="ml-1 mt-1" @click="edit(note)">ویرایش</div>
                                <div class="ml-1 mt-1" @click="del(note)">حذف</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="collapse-btn text-center" @click="isCollapsedInputPanel = !isCollapsedInputPanel">
                <i class="fas fa-angle-down" v-if="!isCollapsedInputPanel"></i>
                <i class="fas fa-angle-up" v-if="isCollapsedInputPanel"></i>
            </div>
            <div class="input d-flex flex-column mt-2" v-if="!isCollapsedInputPanel">
                <div class="pr-4 pl-4 border-dark d-flex flex-column col">
                    <date-picker v-model="note.date"></date-picker>
                    <textarea v-model="note.note" class="form-control col" rows="5"></textarea>
                    <div class="text-right mt-1">
                        <button class="btn btn-success" @click="save">ذخیره</button>
                        <button class="btn btn-secondary" @click="cancel">انصراف</button>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            pdigit,
            isCollapsedInputPanel: true,
            note: {
                date: moment().format(),
                note: null
            },
            notes: [],
            jmoment: jmoment,
            editMode: false,
        }
    },
    methods: {
        fetchNotes: async function () {
            this.notes = await app.activeClass.getStudentNotes({
                where: {
                    student_id: this.$route.params.id
                },
                order: [
                    ['date', 'DESC']
                ]
            });
        },
        save: async function () {
            if(!this.note.note)
                return;

            if(this.editMode) {
                this.note.save();
                this.editMode = false;
                this.isCollapsedInputPanel = true;
                this.clear();
                return;
            }

            let student = await Student.findByPk(this.$route.params.id);

            let studentNote = StudentNote.build({
                date: this.note.date,
                note: this.note.note,
            });
            studentNote.setStudent(student, {save: false});
            studentNote.setClass(app.activeClass, {save: false});
            await studentNote.save();
 
            this.clear();

            this.fetchNotes();
        },
        cancel: function () {
            if(this.editMode) {
                this.note.reload();
                this.editMode = false;
            }
            this.isCollapsedInputPanel = true;
            this.clear(); 
        },
        clear: function () {
            this.note = {
                date: moment().format(),
                note: null
            }
        },
        edit: function (note) {
            this.editMode = true;
            this.isCollapsedInputPanel = false;
            this.note = note;
        },
        del: async function (note) {
            await note.destroy();
            this.fetchNotes();
        }
    },
    created() {
        this.fetchNotes();
    },
    watch: {
        $route(to, from) {
            if(to.name == 'student_notes')
                this.fetchNotes();
        }
    }
}