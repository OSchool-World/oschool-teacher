const { CalendarEvent } = require('../../models');
const moment = require('moment');

module.exports = {
    template: `
        <!-- Modal -->
        <div :class="['modal', 'fade', {show: isShowModal}]" style="display: block; background-color: rgba(0,0,0,0.5);">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header justify-content-start">
                        <h5 class="modal-title" id="exampleModalLongTitle">{{ isEditMode ? 'ویرایش رویداد' : 'ایجاد رویداد جدید' }}</h5>
                    </div>
                    <div class="modal-body text-right">
                        <label>تاریخ</label>
                        <date-picker v-model="calendar_event.date"></date-picker>
                        <br>
                        <label>نوع</label>
                        <select class="form-control" v-model="calendar_event.type">
                            <option value="CLASS_CUSTOM_EVENT">شخصی برای این درس</option>
                            <option value="PUBLIC_CUSTOM_EVENT">شخصی عمومی</option>
                        </select>
                        <small class="form-text text-muted" v-if="calendar_event.type == 'CLASS_CUSTOM_EVENT'">درس: {{active_class_name}}</small>
                        <br>
                        <label>شرح</label>
                        <textarea v-model="calendar_event.description" type="text" class="form-control" placeholder="شرح" rows="5"></textarea>
                    </div>
                    <div class="modal-footer justify-content-start">
                        <button type="button" class="btn btn-primary" @click="save">تایید</button>
                        <button type="button" class="btn btn-outline-secondary" @click="close">انصراف</button>
                        <button type="button" class="btn btn-danger mr-auto" @click="del" v-if="isEditMode"><i class="fas fa-trash-alt"></i>حذف</button>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            isShowModal: false,
            calendar_event: {
                date: null,
                type: 'CLASS_CUSTOM_EVENT',
                description: null,
            },
            active_class_name: null,
            isEditMode: false
        }
    },
    methods: {
        close: function () {
            router.push({ name: 'calendar' });
        },
        save: async function () {
            //TODO Show validation errors
            if(!this.calendar_event.description)
                return;

            let event = this.isEditMode ? this.calendar_event : CalendarEvent.build(this.calendar_event);

            if(this.calendar_event.type == "CLASS_CUSTOM_EVENT")
                event.setClass(app.activeClass, {save: false});
            else
                event.setClass(null, {save: false});

            await event.save();

            this.close();
        },
        fetchEvent: async function () {
            this.calendar_event = await CalendarEvent.findByPk(this.$route.params.id);
        },
        del: async function () {
            this.calendar_event.destroy();

            this.close();
        }
    },
    mounted() {
        setTimeout(() => {
            this.isShowModal = true;
        }, 10);
    },
    created () {
        this.active_class_name = app.activeClass.name;

        if(this.$route.params.date)
            this.calendar_event.date = this.$route.params.date;

        if(this.$route.params.id) {
            this.fetchEvent();
            this.isEditMode = true;
        }
    },
}