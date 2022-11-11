const { lutimesSync } = require('fs');
const TextEditor = require('../ui-component/editor.vue');

module.exports = {
    template: `
        <div class="col d-flex align-items-stretch mr-4 ml-3 panel">
            <div class="col scroll-y">
                <div class="lesson-plan mr-3 ml-3 mt-3 text-right dir-rtl">
                    <text-editor @blur="onBlur" v-model="json_content"></text-editor>
                    <br>
                    <textarea @blur="onBlur" class="form-control" rows="8" v-model="brief" placeholder="خلاصه طرح درس"></textarea>
                </div> 
            </div>
        </div>
    `,
    components: {
        TextEditor,
        
    },
    data() {
        return {
            json_content: null,
            brief: null,
            session: null
        }
    },
    methods: {
        onBlur: function () {
            this.save();
        },
        save: async function () {
            let lesson_plan = await this.session.getLessonPlan();
            if(lesson_plan) {
                lesson_plan.content = this.json_content;
                lesson_plan.brief = this.brief;
                await lesson_plan.save();
            }
            else {
                this.session.createLessonPlan({ content: this.json_content, brief: this.brief });
            }
        },
        fetchData: async function () {
            this.session = await Session.findByPk(this.$route.params.id);
            let lesson_plan = await this.session.getLessonPlan();
            if(lesson_plan) {
                this.json_content = lesson_plan.content;
                this.brief = lesson_plan.brief;
            }
            else {
                this.json_content = null;
                this.brief = null;
            }
        },
    },
    created () {
        this.fetchData();
    },
    watch: {
        $route(to, from) {
            console.log(to.name);
            
            if(to.name == 'class_book_lesson_plan')
                this.fetchData();
        }
    },
}