<template>
  <div class="uploadCommonPage">
    <dytUpload ref="buttonUpload" :name="config.name" :show-upload-list="config.showUploadList" :on-success="handleSuccess"
      :format="config.format" :max-size="config.maxSize" :on-format-error="handleFormatError"
      :on-exceeded-size="handleMaxSize" :before-upload="handleBeforeUpload" :action="uploadApi" :data="data"
      :default-file-list="uploadList" :disabled="isDisabled" :headers="headObj">
      <slot><Button icon="ios-cloud-upload-outline" :disabled="isDisabled">点击上传</Button></slot>
    </dytUpload>

    <transition name="fade">
      <div class="file-name" v-if="showFileName && fileName">
        <span>{{ fileName }}</span>
        <Icon class="icon" type="ios-close-circle" @click="errorEmit" v-if="!isDisabled" />
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'uploadCommon',
  model: {
    prop: 'uploadList',
    event: 'returnBack'
  },
  props: {
    options: {// 配置参数，可添加/覆盖默认配置参数
      type: Object,
      default() {
        return {};
      }
    },
    uploadList: {// 默认已上传的文件列表
      type: Array,
      default() {
        return [];
      }
    },
    uploadApi: {// 上传的地址
      type: String,
      default() {
        return '';
      }
    },
    data: {// 上传时附带的额外参数
      type: Object,
      default() {
        return {};
      }
    },
    isDisabled: {// 是否可选
      type: Boolean,
      default() {
        return false;
      }
    },
    showFileName: {// 是否展示文件名称
      type: Boolean,
      default() {
        return false;
      }
    },
  },
  data() {
    return {
      config: {
        name: 'excleFile', // 设置图片上传的参数名称
        showUploadList: false,
        format: ['xlsx', 'xls', 'xml'], // 接受上传的文件类型
        maxSize: 5120,
        limit: 1, // 设置可上传的图片数量
        sizes: 'default',
        headers: {}
      },
      // fileName: '', // 文件名称
    }
  },
  created() {
    Object.keys(this.options).forEach(k => {
      this.config[k] = this.options[k];
    });
  },
  computed: {
    headObj() {
      return {
        ...this.$store.getters.erpRequestHeaders,
        ...this.$store.getters.dytRequestHeaders
      }
    },
    // 文件名称
    fileName() {
      let file = this.uploadList[0] || {};
      return file.name || '';
    }
  },
  watch: {
    // uploadList: {
    //   handler(val) {
    //     console.log(val, 44)
    //   },
    //   immediate: true,
    //   deep: true,
    // }
  },
  methods: {
    // 上传成功
    handleSuccess(res, file) {
      this.$emit('successUpload', res);
    },
    // 格式限制
    handleFormatError(file) {
      this.$Message.error({
        content: file.name + `文件格式不正确, 请选择${this.config.format.toString()}格式的文件~`,
        duration: 2
      });
      this.errorEmit();
    },
    // 大小限制
    handleMaxSize(file) {
      let num = this.config.maxSize / 1024;
      this.$Message.error(file.name + `文件大小不能超过${num}M`);
      this.errorEmit();
    },
    // 上传前
    handleBeforeUpload(file) {
      this.$emit('manualUpload', file);
      return !!this.uploadApi;
    },
    // 验证不通过
    errorEmit() {
      !this.uploadApi && this.$emit('manualUpload', null);// 清空手动文件内容
    },
  }
}
</script>

<style lang="less" scoped>
.uploadCommonPage {
  .file-name {
    color: #2d8cf0;
    padding: 0 10px 0 2px;
    cursor: pointer;
    margin-top: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 700px;

    &:hover {
      background-color: rgba(159, 200, 244, 0.1);
    }

    .icon {
      font-size: 18px;
    }
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: all .5s;
  }

  .fade-enter,
  .fade-leave-to {
    opacity: 0;
    transform: translateY(-100%);
  }
}
</style>
