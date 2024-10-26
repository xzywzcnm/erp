<template>
  <Modal
    v-model="isVisible"
    :title="modalTitle"
    :mask-closable="false"
    :width="width"
    class-name="upload-file-modal"
  >
    <div class="modal-body-main">
      <dytUpload
        ref="modalUpload"
        name="excelFile"
        :show-upload-list="false"
        :on-format-error="handleFormatError"
        :action="uploadUrl"
        :accept="accept"
        :before-upload="handleUpload"
      >
        <Button type="primary">选择文件</Button>
        <div style="display: inline-block;margin-left:20px;">
          <Button type="text" @click.stop="loadTemplate" style="color:#2d8cf0">下载模板</Button>
        </div>
      </dytUpload>
      <div v-if="importFile && importFile.name" class="mt10">文件名称：{{ importFile.name }}</div>
      <Spin fix v-if="pageLoading">正在处理数据中...</Spin>
    </div>
    <div slot="footer">
      <Button @click="closeModal">取 消</Button>
      <Button type="primary" @click="modalConfirm" :loading="pageLoading">确 定</Button>
    </div>
  </Modal>
</template>
<script>
// import api from '@/api/api';

export default {
  name: "skuaAwaitImport",
  components: {},
  mixins: [],
  props: {
    modelVisible: {
      type: Boolean,
      default: false
    },
    moduleData: {
      type: Object,
      default () {
        return {
          templateUrl: '',
          uploadUrl: '',
          title: '',
          fileName: 'file',
          accept: '',
          otherData: {}
        };
      }
    }
  },
  data () {
    return {
      isVisible: false,
      importFile: null,
      fileError: false,
      pageLoading: false
    };
  },
  watch: {
    modelVisible (newVal) {
      this.isVisible = newVal;
    },
    isVisible (newVal) {
      this.$emit('update:modelVisible', newVal);
      !newVal && this.closeModal();
    }
  },
  computed: {
    width () {
      if (this.$common.isEmpty(this.moduleData) || this.$common.isEmpty(this.moduleData.width)) return '500px';
      return this.moduleData.width;
    },
    accept () {
      // application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel
      if (this.$common.isEmpty(this.moduleData) || this.$common.isEmpty(this.moduleData.accept)) return '';
      return this.moduleData.accept;
    },
    modalTitle () {
      if (this.$common.isEmpty(this.moduleData) || this.$common.isEmpty(this.moduleData.title)) return '导入文件';
      return this.moduleData.title;
    },
    // filenode根路径
    filenodeViewTargetUrl () {
      let tUrl = './filenode/s';
      if (this.$common.isEmpty(this.$store.state) || this.$common.isEmpty(this.$store.state.erpConfig)) return tUrl;
      let baseUrl = this.$store.state.erpConfig.filenodeViewTargetUrl;
      if (this.$common.isEmpty(baseUrl)) return tUrl;
      if (baseUrl.substring(baseUrl.length - 1, baseUrl.length) == '/') {
        baseUrl = baseUrl.substring(0, baseUrl.length - 1);
      }
      return baseUrl;
    },
    templateUrl () {
      if (this.$common.isEmpty(this.moduleData) || this.$common.isEmpty(this.moduleData.templateUrl)) return '';
      return this.moduleData.templateUrl;
    },
    uploadUrl () {
      if (this.$common.isEmpty(this.moduleData) || this.$common.isEmpty(this.moduleData.uploadUrl)) return '';
      return this.moduleData.uploadUrl;
    },
    fileName () {
      if (this.$common.isEmpty(this.moduleData) || this.$common.isEmpty(this.moduleData.fileName)) return 'file';
      return this.moduleData.fileName;
    },
    otherData () {
      if (this.$common.isEmpty(this.moduleData) || this.$common.isEmpty(this.moduleData.otherData)) return {};
      return this.moduleData.otherData;
    },
  },
  methods: {
    // 文件格式错误提示
    handleFormatError () {
      this.fileError = true;
      this.$Message.error('文件格式有误');
    },
    // 上传前处理
    handleUpload (file) {
      this.fileError = false;
      this.importFile = file;
      return false;
    },
    // 下载模板
    loadTemplate () {
      let newTab = window.open('about:blank');
      if (this.templateUrl.includes('http://') || this.templateUrl.includes('https://')) {
        newTab.location.href = this.templateUrl;
        return;
      }
      newTab.location.href = `${this.filenodeViewTargetUrl}/${this.templateUrl}`;
    },
    // 关闭弹窗
    closeModal () {
      this.importFile = null;
      this.isVisible = false;
    },
    // 确认
    modalConfirm () {
      if (this.pageLoading) return;
      if (this.fileError) return this.$Message.error('文件格式有误');
      if (this.$common.isEmpty(this.importFile)) return this.$Message.error('请选择需要上传的文件');
      this.pageLoading = true;
      let newForm = new FormData(); // 创建form对象
      newForm.append(this.fileName, this.importFile);
      Object.keys(this.otherData).forEach(key => {
        newForm.append(key, this.otherData[key]);
      });
      this.axios.post(this.uploadUrl, newForm, { isCache: false }).then((res) => {
        if (!res || !res.data || res.data.code != 0) return;
        this.$Message.success(res.data.message || '导入操作成功!');

        this.$nextTick(() => {
          // 刷新列表
          setTimeout(() => {
            this.$emit('uploadSuccess');
          }, 200);
          this.isVisible = false;
        })
      }).catch((err) => {
        this.$emit('uploadFail', err);
      }).finally(() => {
        this.pageLoading = false;
      })
    }
  }
};
</script>
<style lang="less" scoped>
.modal-body-main{
  position: relative;
  .batch-tips{
    padding: 0 15px;
  }
  .tips-error{
    color: #f20;
  }
}
</style>
<style lang="less">
.upload-file-modal{
  .ivu-modal{
    position: relative;
    max-width: 1000px;
  }
}
</style>
