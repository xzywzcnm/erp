<template>
  <Modal
    v-model="isVisible"
    :title="modalTitle"
    :mask-closable="false"
    width="700px"
    class-name="bindSizeGroupModal"
  >
    <div class="modal-body-main">
      <Form ref="modalFormRef" :rules="ruleValidate" :model="formData" :label-width="110" label-position="right">
        <Form-item label="请选择店铺" prop="selectShopId" class="ivu-form-item-required" v-if="chanel && !hiddenStore">
          <Cascader
            style="width: 200px;"
            :data="cascaderData"
            placeholder="请选择店铺"
            v-model="formData.selectShopId"
            transfer
            filterable
          />
        </Form-item>
        <Form-item label="请选择导入文件" prop="importFile" class="ivu-form-item-required">
          <dytUpload
            ref="modalUpload"
            :name="improtName"
            :show-upload-list="false"
            :on-format-error="handleFormatError"
            :action="uploadUrl"
            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            :before-upload="handleUpload"
          >
            <Button type="primary">选择文件</Button>
            <div style="display: inline-block;margin-left:10px;" v-if="formData.importFile && formData.importFile.name">
              {{ formData.importFile.name }}
            </div>
          </dytUpload>
        </Form-item>
        <div class="form-bottom">
          <div class="tips-error">
            <span v-if="!chanel">备注：手动订单默认“未付款”，需要“标记付款”</span>
          </div>
          <Button type="text" @click.stop="loadTemplate" style="color:#2d8cf0">下载模板</Button>
        </div>
      </Form>
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
  name: "orderImportModal",
  components: {},
  mixins: [],
  props: {
    hiddenStore: { type: Boolean, default: false },
    chanel: {
      type: Boolean,
      default: false
    },
    modelVisible: {
      type: Boolean,
      default: false
    },
    moduleData: {
      type: Object,
      default () {
        return {
          cascaderData: []
        };
      }
    }
  },
  data () {
    return {
      isVisible: false,
      improtName: 'files',
      fileError: false,
      pageLoading: false,
      formData: {
        selectShopId: [],
        importFile: null
      },
      ruleValidate: {
        selectShopId: [
          {
            getRequired: true,
            validator: this.verifyRequired,
            msg: '请选择店铺',
            trigger: 'change'
          }
        ],
        importFile: [
          {
            getRequired: true,
            validator: this.verifyRequired,
            msg: '请选择导入文件',
            trigger: 'change'
          }
        ]
      }
    };
  },
  watch: {
    modelVisible (newVal) {
      this.isVisible = newVal;
      newVal && this.iniaData();
    },
    isVisible (newVal) {
      this.$emit('update:modelVisible', newVal);
      !newVal && this.closeModal();
    }
  },
  computed: {
    modalTitle () {
      return '导入';
    },
    // 导入 API
    uploadUrl () {
      if (this.$common.isEmpty(this.moduleData) || this.$common.isEmpty(this.moduleData.uploadUrl)) return '';
      return this.moduleData.uploadUrl;
    },
    // 下载模板路径
    templateUrl () {
      if (this.$common.isEmpty(this.moduleData) || this.$common.isEmpty(this.moduleData.templateUrl)) return '';
      return this.moduleData.templateUrl;
    },
    // filenode根路径
    filenodeViewTargetUrl () {
      let tUrl = './filenode/s';
      if (this.$common.isEmpty(this.$store.state) || this.$common.isEmpty(this.$store.state.erpConfig)) return tUrl;
      return this.$store.state.erpConfig.filenodeViewTargetUrl || tUrl;
    },
    // 选中的平台
    cascaderData () {
      if (this.$common.isEmpty(this.moduleData) || this.$common.isEmpty(this.moduleData.cascaderData)) return [];
      return this.moduleData.cascaderData;
    }
  },
  created () {},
  methods: {
    // 获取数据
    iniaData () {
      this.pageLoading = true;
      this.$common.promiseAll([]).finally(() => {
        this.pageLoading = false;
      })
    },
    // 文件格式错误提示
    handleFormatError () {
      this.fileError = true;
      this.$Message.error('文件格式有误');
    },
    // 上传前处理
    handleUpload (file) {
      this.fileError = false;
      this.formData.importFile = file;
      this.$nextTick(() => {
        this.$refs.modalFormRef && this.$refs.modalFormRef.validateField('importFile');
      })
      return false;
    },
    // 下载模板
    loadTemplate () {
      window.open(this.templateUrl);
    },
    // 关闭弹窗
    closeModal () {
      this.$refs.modalFormRef && this.$refs.modalFormRef.resetFields();
      this.$nextTick(() => {
        this.$refs.modalFormRef && this.$refs.modalFormRef.resetFields();
        setTimeout(() => {
          this.$refs.modalFormRef && this.$refs.modalFormRef.resetFields();
        }, 500);
      });
      this.isVisible = false;
    },
    // 验证必填
    verifyRequired (rule, value, callback) {
      let required = rule.getRequired;
      if (this.$common.isFunction(required)) {
        required = required(rule, value);
      }
      if (!this.$common.isEmpty(required) && required && this.$common.isEmpty(value)) {
        return callback(new Error(rule.msg || '必填项不能为空'));
      }
      callback();
    },
    // 确认
    modalConfirm () {
      if (this.pageLoading) return;
      if (this.fileError) return this.$Message.error('文件格式有误');
      if (this.$common.isEmpty(this.uploadUrl)) return this.$Message.error('未设置导入文件地址');
      this.$refs.modalFormRef.validate((valid) => {
        if (!valid) return this.$Message.error('验证不通过');
        this.pageLoading = true;
        let newForm = new FormData(); // 创建form对象
        newForm.append(this.improtName, this.formData.importFile);
        if (!this.hiddenStore) {
          newForm.append('platformId', this.formData.selectShopId[0]);
          newForm.append('saleAccountId', this.formData.selectShopId[1]);
        }
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
  .form-bottom{
    display: flex;
    padding-right: 100px;
    justify-content: space-between;
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
