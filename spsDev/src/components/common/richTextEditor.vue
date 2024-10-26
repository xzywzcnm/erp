<style scoped >
/* .quill-editor {
  min-height: 200px;
   height:200px;
  height:auto;
} */

/* .ql-container {
  height:160px;
  height: auto;
} */

.limit {
  height: 30px;
  border: 1px solid #ccc;
  line-height: 30px;
  text-align: right;
}

.limit span {
  color: #ee2a7b;
}

.ql-snow .ql-editor img {
  max-width: 480px;
}

.ql-editor .ql-video {
  max-width: 480px;
}
</style>
<template>
  <div >
    <quillEditor
        :style="{'height': height +'px'}"
        placeholder="请输入..."
        v-model="content"
        ref="myQuillEditor"
        :options="editorOption"
        @blur="onEditorBlur($event)"
        @focus="onEditorFocus($event)"
        @change="onEditorChange($event)" ></quillEditor >
  </div>
</template>

<script>
// import Vue from 'vue';
import { quillEditor } from 'vue-quill-editor';
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';
import 'quill/dist/quill.bubble.css';

export default {
  name: 'richTextEditor',
  props: ['height', 'contents'],
  components: {
    quillEditor
  },
  data () {
    return {
      content: '',
      editorOption: {
        placeholder: '请输入...',
        theme: 'snow'
      }
    };
  },
  created () {
    if (this.contents) {
      let str = this.contents;
      str = str.replace(/<\/?.+?>/g, '');
      this.content = str;
    }
  },
  methods: {
    onEditorBlur (evt) {
      let richTextContent = this.content;
      this.$store.commit('richTextContent', richTextContent);
    },
    onEditorFocus (evt) {
    },
    onEditorChange (evt) {
    }
  }
};
</script >
