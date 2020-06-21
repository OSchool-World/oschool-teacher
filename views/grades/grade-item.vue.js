const { GradeItem } = require('../../models');

module.exports = {
    template: `
        <!-- Modal -->
        <div :class="['modal', 'fade', {show: isShowModal}]" style="display: block; background-color: rgba(0,0,0,0.5);">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header justify-content-start">
                        <h5 class="modal-title" id="exampleModalLongTitle">{{ editMode ? 'ویرایش آیتم نمره‌دهی' : 'افزودن آیتم نمره‌دهی جدید' }}</h5>
                    </div>
                    <div class="modal-body text-right">
                        <label>نام آیتم</label>
                        <input type="text" class="form-control" placeholder="نام آیتم" v-model="grade_item.name">
                        <br>
                        <label>نوع آیتم</label>
                        <select class="form-control" v-model="grade_item.type" :disabled="editMode">
                            <option value="STATIC">عدد ثابت</option>
                            <option value="EXPRESSION">فرمول‌نویسی</option>
                        </select>
                        <br>
                        <div class="form-group" v-if="grade_item.type == 'STATIC'">
                            <label>نماد فرمول‌نویسی</label>
                            <input type="text" class="form-control dir-ltr" placeholder="a, midterm, num1, ..." v-model="grade_item.symbol">
                            <small class="form-text text-muted">نام لاتین، بدون فاصله و منحصر به فردی که در فرمول‌نویسی‌ها، نماد این آیتم می‌باشد. مانند: a, num1, midterm و ...</small>
                        </div>
                        <div class="form-group" v-if="grade_item.type == 'EXPRESSION'">
                            <label>فرمول</label>
                            <textarea class="form-control dir-ltr" rows="5" placeholder="(midterm + 3 * finterm) / 4" v-model="grade_item.expression"></textarea>
                            <small class="form-text text-muted">فرمول‌ها عملیات ریاضی و اکثر توابع اکسل را در بر می‌گیرند.</small>
                        </div>
                    </div>
                    <div class="modal-footer justify-content-start">
                        <button type="button" class="btn btn-primary" @click="save">تایید</button>
                        <button type="button" class="btn btn-outline-secondary" @click="close">انصراف</button>
                        <button type="button" class="btn btn-danger mr-auto" @click="del" v-if="editMode"><i class="fas fa-trash-alt"></i> حذف</button>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            isShowModal: false,
            grade_item: {
                id: null,
                name: null,
                type: 'STATIC', //STATIC, EXPRESSION
                symbol: null,
                expression: null
            },
            editMode: false
        }
    },
    methods: {
        close: function () {
            router.push({ name: 'grades' });
        },
        save: async function () {
            if(!this.editMode)
                await app.activeClass.createGradeItem(this.grade_item);
            else
                await this.grade_item.save();

            this.close();
        },
        del: async function () {
            await this.grade_item.destroy();
            this.close();
        },
        fetchGradeItem: async function () {
            this.grade_item = await GradeItem.findByPk(this.$route.params.id);
        }
    },
    mounted() {
        setTimeout(() => {
            this.isShowModal = true;
        }, 10);
    },
    created() {
        console.log(this.$route.params.id);
        
        if(this.$route.params.id) {
            this.editMode = true;
            this.fetchGradeItem();
        }
    }
}