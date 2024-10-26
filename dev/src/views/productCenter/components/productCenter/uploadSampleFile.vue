<template >
  <div class="form-pic-item">
    <dytUpload
      ref="washedUploadRef"
      name="files"
      :before-upload="fileUploadBefore"
      :action="uploadFilesUrl"
      class="upload-item"
      :disabled="disabled"
      v-bind="uploadConfig"
    />
    <div class="upload-contain">
      <span
        class="click-text-underline"
        :class="{'click-text-disabled' : disabled}"
        @click="opentCheckFile"
      >
        {{ !uploadConfig.multiple && !$common.isEmpty(filePathList) ? '点击更换' : '点击上传'}}
        <Spin fix v-if="isUploadLoading"></Spin>
      </span>
    </div>
    <div class="uploaded-file-list">
      <div
        v-for="(item, pIndex) in filePathList"
        :key="`file-${pIndex}`"
        class="uploaded-file-item"
      >
        <span class="file-title" :title="item.fileName" @click="dowFile(item)">{{ item.fileName }}</span>
        <span class="remove-uploaded-file" title="移除" v-if="!disabled">
          <Icon type="md-close" @click="removeFile(item)" />
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api/api';

export default {
  name: 'uploadFile',
  model: {
    prop: 'value',
    event: 'valueChange'
  },
  props: {
    // 绑定值
    value: { type: String | Array | Object },
    // 是否禁用
    disabled: { type: Boolean, default: false },
    // 上传组件配置
    uploadProps: {
      type: Object,
      default: () => {
        return {};
      }
    },
    acceptErrorTxt: { type: String, default: '文件格式不对' },
    // 单位 M
    fileMaxSize: { type: Number, default: 30 },
  },
  data () {
    return {
      isUploadLoading: false,
      uploadFilesUrl: api.upload_files + '?basePath=/product',
      filePathList: [],
    }
  },
  watch: {
    value: {
      immediate: true,
      deep: true,
      handler (val, oldVal) {
        if (JSON.stringify(val) == JSON.stringify(oldVal)) return;
        if (this.$common.isEmpty(val)) {
          this.filePathList = [];
          return;
        }
        if (this.$common.isString(val)) {
          const newVal = val.split(',');
          let fileInfo = [];
          let list = [];
          newVal.forEach(file => {
            if (!this.$common.isEmpty(file)) {
              fileInfo = file.split(':');
              if (fileInfo.length == 1) return;
              list.push({ fileName: fileInfo[0], fileUrl: fileInfo[1] });
            }
          })
          this.filePathList = list;
        } else if (this.$common.isArray(val)) {
          this.filePathList = this.$common.copy(val);
        } else if (this.$common.isJson(val)) {
          this.filePathList = [this.$common.copy(val)];
        }
      }
    },
    filePathList: {
      deep: true,
      handler (val, oldVal) {
        if (this.$common.isArray(this.value)) {
          const newVal = this.$common.copy(val);
          this.$emit('valueChange', newVal);
          this.$emit('on-change', newVal);
          return;
        }
        if (this.$common.isJson(this.value)) {
          const newVal = this.$common.copy(val);
          this.$emit('valueChange', newVal[0] || {});
          this.$emit('on-change', newVal[0] || {});
          return;
        }
        const fileList = val.map(fil => {
          return `${fil.fileName}:${fil.fileUrl}`;
        }).join(',');
        this.$emit('valueChange', fileList);
        this.$emit('on-change', fileList);
      }
    }
  },
  created () {},
  computed: {
    fileAccept () {
      const uploadProps = this.$common.copy(this.uploadProps);
      if (this.$common.isEmpty(uploadProps.accept) || !this.$common.isArray(uploadProps.accept)) return [];
      return uploadProps.accept;
    },
    uploadConfig () {
      const uploadProps = this.$common.copy(this.uploadProps);
      delete uploadProps.accept;
      return {
        'show-upload-list': true,
        'multiple': true,
        'accept': this.fileAccept.join(','),
        ...uploadProps
      }
    }
  },
  methods: {
    // 打开选择文件弹窗
    opentCheckFile () {
      if (this.disabled || !this.$refs.washedUploadRef || !this.$refs.washedUploadRef.$el) return;
      const demo = this.$refs.washedUploadRef.$el.querySelector('.ivu-upload-select');
      if (!demo) return;
      demo.click();
    },
    // 上传图片
    fileUploadBefore (file) {
      let fileType = file.type;
      if (this.$common.isEmpty(fileType)) {
        fileType = file.name.substring(file.name.lastIndexOf('.'), file.name.length);
      }
      const fileName = file.name.substring(0, file.name.lastIndexOf('.'));
      fileType = this.fileAccept.find(type => {
        return type.toLocaleLowerCase() == fileType
      })
      if (this.$common.isEmpty(fileType)) {
        this.$Message.error(this.acceptErrorTxt);
        return false;
      }
      // 最大为 30 M
      if (file.size > 1024 * 1024 * this.fileMaxSize) {
        this.$Message.error(`文件过大，请上传${this.fileMaxSize}M以内的文件`);
        return false;
      }
      this.isUploadLoading = true;
      let newForm = new FormData(); // 创建form对象
      newForm.append('files', file);
      const uploadUrl = `${this.uploadFilesUrl}&random=${(Math.random()).toString().substring(2, 5) + (new Date().getTime()).toString()}`;
      this.axios.post(uploadUrl, newForm).then(res => {
        if (!res.data || res.data.code != 0 || this.$common.isEmpty(res.data.datas)) return;
        if (this.uploadConfig.multiple) {
          this.filePathList.push({ fileName: fileName, fileUrl: res.data.datas[0] });
        } else {
          this.filePathList = [{ fileName: fileName, fileUrl: res.data.datas[0] }];
        }
      }).finally(() => {
        this.isUploadLoading = false;
      })
      return false;
    },
    // 下载文件
    dowFile (file) {
      if (this.$common.isEmpty(file.fileUrl)) return;
      const fileUrl = `${window.location.origin}/product-service/filenode/s${file.fileUrl}`;
      const suffix = file.fileUrl.substring(file.fileUrl.lastIndexOf('.'), file.fileUrl.length);
      if (['.prj'].includes(suffix)) {
        window.open(fileUrl);
      }
      this.$common.downloadFile(fileUrl, { name: file.fileName });
    },
    // 移除文件
    removeFile (file) {
      if (this.disabled) return;
      this.filePathList = this.filePathList.filter((item) => {
        return item.fileUrl != file.fileUrl;
      })
    }
  }
};
</script>

<style lang="less" scoped>
.form-pic-item{
  width: 100%;
  .upload-item{
    width: 0;
    height: 0;
  }
  .click-text-underline {
    display: inline-block;
    position: relative;
    padding: 0px 5px;
    cursor: pointer;
    color: #57a3f3;
    text-decoration: underline;
    text-underline-offset: 3px;
    &.click-text-disabled{
      color: #c9c9c9;
      cursor: no-drop;
    }
  }
  .uploaded-file-list{
    font-size: 14px;
    .uploaded-file-item{
      display: flex;
      justify-content: space-between;
      width: 100%;
      line-height: 22px;
      padding: 1px 5px;
      border-radius: 5px;
      &:hover{
        background: #e7e7e7;
        color: #03A9F4;
        .remove-uploaded-file{
          display: inline-block;
        }
      }
      .file-title{
        display: inline-block;
        max-width: calc(100% - 25px);
        line-height: 1.4em;
        cursor: pointer;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .remove-uploaded-file{
        display: none;
        margin-left: 5px;
        font-size: 15px;
        line-height: 0;
        cursor: pointer;
      }
    }
  }
}

</style>
