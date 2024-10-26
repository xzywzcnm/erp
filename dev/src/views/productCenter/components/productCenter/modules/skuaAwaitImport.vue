<template>
  <Modal
    v-model="isVisible"
    :title="modalTitle"
    :mask-closable="false"
    width="400px"
    class-name="bindSizeGroupModal"
  >
    <div class="modal-body-main">
      <dytUpload
        ref="modalUpload"
        name="excelFile"
        :show-upload-list="false"
        :on-format-error="handleFormatError"
        :action="uploadUrl"
        accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        :before-upload="handleUpload"
      >
        <Button type="primary">选择文件</Button>
        <div style="display: inline-block;margin-left:20px;">
          <Button type="text" @click.stop="loadTemplate" style="color:#2d8cf0">下载模板</Button>
        </div>
      </dytUpload>
      <div v-if="importFile && importFile.name" class="mt10">{{ importFile.name }}</div>
      <Spin fix v-if="pageLoading">正在处理数据中...</Spin>
    </div>
    <div slot="footer">
      <Button @click="closeModal">取 消</Button>
      <Button type="primary" @click="modalConfirm" :loading="pageLoading">确 定</Button>
    </div>
  </Modal>
</template>
<script>
import api from '@/api/api';

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
        return {};
      }
    }
  },
  data () {
    return {
      isVisible: false,
      uploadUrl: api.skuAwaitImport,
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
    modalTitle () {
      return 'SKU待办项导入';
    },
    // filenode根路径
    filenodeViewTargetUrl () {
      let tUrl = './filenode/s';
      if (this.$common.isEmpty(this.$store.state) || this.$common.isEmpty(this.$store.state.erpConfig)) return tUrl;
      return this.$store.state.erpConfig.filenodeViewTargetUrl || tUrl;
    },
    // 登录人事业部
    businessDeptId() {
      if (!this.$store.getters['authUserInfo'] || !this.$store.getters['authUserInfo'].securityUser) return '';
      return this.$store.getters['authUserInfo'].securityUser.businessDeptId;
    }
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
      newTab.location.href = `${this.filenodeViewTargetUrl}/product-service/template/backlogImport.xlsx`;
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
      if (this.$common.isEmpty(this.businessDeptId)) return this.$Message.error('您所属部门未绑定事业部，暂不能导入');
      this.pageLoading = true;
      let newForm = new FormData(); // 创建form对象
      newForm.append('excelFile', this.importFile);
      newForm.append('businessDeptId', this.businessDeptId);
      this.axios.post(this.uploadUrl, newForm, { isCache: false }).then((res) => {
        if (!res || !res.data || res.data.code != 0) return;
        this.$Message.success('导入操作成功');
        // 刷新列表
        this.$emit('refreshTable');
        this.$nextTick(() => {
          this.isVisible = false;
        })
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
.bindSizeGroupModal{
  .ivu-modal{
    position: relative;
    max-width: 1000px;
  }
}
</style>
