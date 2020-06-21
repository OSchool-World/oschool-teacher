const TextEditor = require('../ui-component/editor.vue');

module.exports = {
    template: `
        <div class="col d-flex align-items-stretch mr-4 ml-3 panel">
            <div class="col scroll-y">
                <div class="lesson-plan mr-3 ml-3 mt-3 text-right dir-rtl">
                    <text-editor @blur="onBlur" v-model="json_content"></text-editor>
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
                await lesson_plan.save();
            }
            else {
                this.session.createLessonPlan({ content: this.json_content });
            }
        },
        fetchData: async function () {
            this.session = await Session.findByPk(this.$route.params.id);
            let lesson_plan = await this.session.getLessonPlan();
            if(lesson_plan)
                this.json_content = lesson_plan.content;
            else
                this.json_content = null;
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