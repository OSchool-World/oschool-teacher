const { Editor, EditorContent, EditorMenuBar } = require('tiptap');
const { 
    Bold,
    Italic,
    Underline,
    Strike,
    OrderedList,
    BulletList,
    ListItem,
    TodoItem,
    TodoList,
    Heading,
    Placeholder,
    HorizontalRule
} = require('tiptap-extensions')

module.exports = {
    template: `
        <div class="text-editor">
            <editor-menu-bar :editor="editor" v-slot="{ commands, isActive, focused }">
                <div class="editor-toolbar" :class="{ 'is-show': focused }">
                    <div class="btn-group dir-ltr">
                        <button 
                            :class="['btn', 'btn-sm', {'btn-primary': isActive.bold()}]"
                            @click="commands.bold"
                            title="بولد"
                        >
                            <i class="fas fa-bold"></i>
                        </button>
                        
                        <button 
                            :class="['btn', 'btn-sm', {'btn-primary': isActive.italic()}]"
                            @click="commands.italic"
                            title="ایتالیک"
                        >
                            <i class="fas fa-italic"></i>
                        </button>
                        
                        <button 
                            :class="['btn', 'btn-sm', {'btn-primary': isActive.underline()}]"
                            @click="commands.underline"
                            title="آندرلاین"
                        >
                            <i class="fas fa-underline"></i>
                        </button>

                        <button 
                            :class="['btn', 'btn-sm', {'btn-primary': isActive.strike()}]"
                            @click="commands.strike"
                            title="خط خورده"
                        >
                            <i class="fas fa-strikethrough"></i>
                        </button>
                    </div>

                    <div class="btn-group dir-ltr">
                        <button 
                            :class="['btn', 'btn-sm', {'btn-primary': isActive.heading({level: 1})}]"
                            @click="commands.heading({ level: 1 })"
                            title="عنوان درجه ۱"
                        >
                            <!-- <i class="fas fa-h1"></i> -->
                            H1
                        </button>
                        
                        <button 
                            :class="['btn', 'btn-sm', {'btn-primary': isActive.heading({level: 2})}]"
                            @click="commands.heading({ level: 2 })"
                            title="عنوان درجه ۲"
                        >
                            <!-- <i class="fas fa-h2"></i> -->
                            H2
                        </button>
                        
                        <button 
                            :class="['btn', 'btn-sm', {'btn-primary': isActive.heading({level: 3})}]"
                            @click="commands.heading({ level: 3 })"
                            title="عنوان درجه ۳"
                        >
                            <!-- <i class="fas fa-h3"></i> -->
                            H3
                        </button>
                    </div>

                    <div class="btn-group dir-ltr">
                        <button 
                            :class="['btn', 'btn-sm', {'btn-primary': isActive.ordered_list()}]"
                            @click="commands.ordered_list"
                            title="لیست شماره‌دار"
                        >
                            <i class="fas fa-list-ol"></i>
                        </button>
                        
                        <button 
                            :class="['btn', 'btn-sm', {'btn-primary': isActive.bullet_list()}]"
                            @click="commands.bullet_list"
                            title="لیست نشاندار"
                        >
                            <i class="fas fa-list-ul"></i>
                        </button>
                        
                        <!-- TODO: Resolve Vue Compile Error -->
                        <!-- <button 
                            :class="['btn', 'btn-sm', {'btn-primary': isActive.todo_list()}]"
                            @click="commands.todo_list"
                            title="چک لیست"
                        >
                            <i class="fas fa-check-square"></i>
                        </button> -->
                    </div>

                    <button 
                        :class="['btn', 'btn-sm', {'btn-primary': isActive.horizontal_rule()}]"
                        @click="commands.horizontal_rule"
                        title="خط افقی"
                    >
                        <i class="fas fa-minus"></i>
                    </button>
                </div>
            </editor-menu-bar>
            <editor-content class="editor" :editor="editor" />
        </div>
    `,
    components: {
        EditorContent,
        EditorMenuBar
    },
    model: {
        prop: 'jsonContent',
        event: 'input'
    },
    props: {
        jsonContent: Object
    },
    data() {
        return {
            editor: new Editor({
                extensions: [
                    new Bold(),
                    new Italic(),
                    new Underline(),
                    new Strike(),
                    new OrderedList(),
                    new BulletList(),
                    new ListItem(),
                    new TodoItem({
                        nested: true,
                    }),
                    new TodoList(),
                    new Heading(),
                    new HorizontalRule(),
                    new Placeholder({
                        emptyEditorClass: 'is-editor-empty',
                        emptyNodeClass: 'is-empty',
                        emptyNodeText: 'اینجا بنویسید ...',
                        showOnlyWhenEditable: true,
                        showOnlyCurrent: true,
                    }),
                ],
                onBlur: ({ event,  state, view }) => {
                    this.$emit('blur');
                },
                onUpdate: ({ getJSON, getHTML }) => {
                    this.$emit('input', getJSON());
                },
            }),
        }
    },
    beforeDestroy() {
        this.editor.destroy()
    },
    watch: {
        jsonContent(newValue, oldValue) {
            this.editor.setContent(newValue);
        },
    },
}