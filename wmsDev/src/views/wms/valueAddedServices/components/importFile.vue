<template>
  <Modal v-model="isVisible" title="导入（其他出库）" :mask-closable="false" width="830px" class-name="upload-file-modal">
    <div class="modal-body-main" style="padding: 16px 20px;">
      <Alert type="warning" show-icon style="display:inline-block;padding: 8px 8px 8px 36px;line-height: 16px;">
        温馨提示：只允许导入“其他出库单”的增值服务，其他出库包括：{{ stockoutList }}
      </Alert>
      <Form ref="searchParams" :label-width="110" class="fmb0">
        <dytUpload ref="modalUpload" name="excelFile" :show-upload-list="false" :on-format-error="handleFormatError"
          :action="uploadUrl" :format="format" :before-upload="handleUpload">
          <Form-item label="选择导入的文件：">
            <Button type="primary">选择文件</Button>
            <div style="display: inline-block;margin-left:30px;">
              <Button type="text" @click.stop="loadTemplate" style="color:#2d8cf0">下载模板</Button>
            </div>
          </Form-item>
        </dytUpload>
        <Form-item label="文件名称：" class="mt10">
          <span v-if="importFile && importFile.name">{{ importFile.name }}</span>
        </Form-item>
      </Form>
      <Spin fix v-if="pageLoading">正在处理数据中...</Spin>
    </div>
    <div slot="footer">
      <Button @click="closeModal">取消</Button>
      <Button type="primary" @click="modalConfirm" :loading="pageLoading">导入</Button>
    </div>
  </Modal>
</template>
<script>
// import api from '@/api/api';
import api from "@/api/api";
import { documTypeList } from "./fileData";
import { getWarehouseId } from '@/utils/getService';

export default {
  name: "valueAddedServicesImportFile",
  components: {},
  props: {
    modelVisible: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      isVisible: false,
      importFile: null,
      fileError: false,
      pageLoading: false,
      fileName: 'excelFile',
      uploadUrl: api.valAddService_importPicking,
      templateUrl: api.valAddService_vasImport,
      format: ['xls', 'xlsx', 'xlsm'],
    };
  },
  watch: {
    modelVisible(newVal) {
      this.isVisible = newVal;
      newVal && this.init();
    },
    isVisible(newVal) {
      this.$emit('update:modelVisible', newVal);
      !newVal && this.closeModal();
    }
  },
  computed: {
    // filenode根路径
    filenodeViewTargetUrl() {
      let tUrl = './filenode/s';
      if (this.$common.isEmpty(this.$store.state) || this.$common.isEmpty(this.$store.state.erpConfig)) return tUrl;
      let baseUrl = this.$store.state.erpConfig.filenodeViewTargetUrl;
      if (this.$common.isEmpty(baseUrl)) return tUrl;
      if (baseUrl.substring(baseUrl.length - 1, baseUrl.length) == '/') {
        baseUrl = baseUrl.substring(0, baseUrl.length - 1);
      }
      return baseUrl;
    },
    stockoutList() {
      return Object.keys(documTypeList).map(k => documTypeList[k].label).filter(k => !['销售出库'].includes(k)).join('，');
    },
    warehouseId() {
      return this.$store.state.warehouseId || getWarehouseId();
    },
  },
  methods: {
    init() {
      this.uploadUrl = api.valAddService_importPicking + this.warehouseId;
    },
    // 文件格式错误提示
    handleFormatError() {
      this.fileError = true;
      this.$Message.error('文件格式有误');
    },
    // 上传前处理
    handleUpload(file) {
      this.fileError = false;
      this.importFile = file;
      return false;
    },
    // 下载模板
    loadTemplate() {
      let newTab = window.open('about:blank');
      if (this.templateUrl.includes('http://') || this.templateUrl.includes('https://')) {
        newTab.location.href = this.templateUrl;
        return;
      }
      newTab.location.href = `${this.filenodeViewTargetUrl}/${this.templateUrl}`;
    },
    // 关闭弹窗
    closeModal() {
      this.importFile = null;
      this.isVisible = false;
    },
    // 确认
    modalConfirm() {
      if (this.pageLoading) return;
      if (this.fileError) return this.$Message.error('文件格式有误');
      if (this.$common.isEmpty(this.importFile)) return this.$Message.error('请选择需要上传的文件');
      this.pageLoading = true;
      let newForm = new FormData(); // 创建form对象
      newForm.append(this.fileName, this.importFile);
      this.axios.post(this.uploadUrl, newForm, { isCache: false }).then((res) => {
        if (!res || !res.data || res.data.code != 0) return;
        this.$Message.success(res.data.message || '导入操作成功!');
        this.$nextTick(() => {
          // 刷新列表
          setTimeout(() => {
            this.$emit('refreshAll');
          }, 200);
          this.isVisible = false;
        })
      }).finally(() => {
        this.pageLoading = false;
      })
    }
  }
};
</script>
<!-- <style lang="less" scoped>
.modal-body-main {
  position: relative;

  .batch-tips {
    padding: 0 15px;
  }

  .tips-error {
    color: #f20;
  }
}
</style>
<style lang="less">
.upload-file-modal {
  .ivu-modal {
    position: relative;
    max-width: 1000px;
  }
}
</style> -->
