<!-- 上传和预览一体 -->
<template>
  <div class="uploadimg-index">
    <preview-img :fileList="uploadList" :isDisabled="isDisabled" :sort="sort" @dragList="dragFun"></preview-img>
    <!-- eslint-disable-next-line vue/no-mutating-props -->
    <button-upload type="pic" v-model="uploadList" :options="config" v-if="!isDisabled" v-bind="$attrs"></button-upload>
  </div>
</template>

<script>
import previewImg from './previewImg';
import buttonUpload from './buttonUpload';

export default {
  name: "UploadImg",
  components: { previewImg, buttonUpload },
  model: {
    prop: 'uploadList',
    event: 'change',
  },
  props: {
    options: {
      type: Object,
      default () {
        return {};
      }
    },
    uploadList: {
      type: Array,
      default () {
        return [];
      }
    },
    isDisabled: { //是否禁用
      type: Boolean,
      default () {
        return false;
      }
    },
    sort: {
      type: Boolean,
      default () {
        return false;
      }
    },
  },
  data () {
    return {
      config: {
        name: "files", // 设置图片上传的参数名称
        showUploadList: false,
        format: ['jpg', 'jpeg', 'png', 'gif', 'bmp'], //接受上传的文件类型
        maxSize: 1024 * 5,
        multiple: false,
        limit: 1, //设置可上传的图片数量
      },
    };
  },
  created () {
    Object.keys(this.options).forEach(k => {
      this.config[k] = this.options[k];
    });
  },
  methods: {
    dragFun (list) {
      this.$emit("dragFun", list);
    }
  }
};
</script>

<style>
.uploadimg-index {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
</style>