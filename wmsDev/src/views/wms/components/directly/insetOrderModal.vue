<template >
  <Modal
    v-model="modalVisible"
    :title="modaltitle"
    :mask-closable="false"
    width="600"
  >
    <div class="modal-main-content">
      <Form
        ref="modalFormRef"
        :model="formData"
        :rules="rormRule"
        :label-width="90"
      >
        <FormItem label="供应商" prop="supplierId">
          <dyt-select v-model="formData.supplierId" placeholder="请选择供应商">
            <Option
              v-for="(item, index) in supplierDataList"
              :value="item.supplierId"
              :key="`s-${index}`"
              :label="item.supplierName"
            />
          </dyt-select>
        </FormItem>
        <FormItem label="平台主体" prop="platformSubject">
          <dyt-select v-model="formData.platformSubject" placeholder="请选择平台主体" @on-change="platformChange">
            <Option
              v-for="(item, index) in platformDataList"
              :value="item.platformId"
              :key="`p-${index}`"
              :label="item.platformName"
            />
          </dyt-select>
        </FormItem>
        <FormItem label="店铺" prop="saleAccountId">
          <dyt-select
            v-model="formData.saleAccountId"
            :placeholder="$common.isEmpty(formData.platformSubject) ? '请先选择平台主体后再选择店铺': '请选择店铺'"
          >
            <Option
              v-for="(item, index) in platformSaleAccountList"
              :value="item.saleAccountId"
              :key="`a-${index}`"
              :label="item.account"
            />
          </dyt-select>
        </FormItem>
        <FormItem label="选择导入文件" prop="abnormalArrivalNoList" v-if="isImport">
          <dytUpload
            style="display: inline-block;"
            ref="uploadRef"
            name="excleFile"
            :data="uploadData"
            :show-upload-list="false"
            :on-success="handleSuccess"
            :on-error="handleError"
            :on-format-error="handleFormatError"
            :action="actionUrl"
            accept=".xlsx,.xls"
            :before-upload="handleUpload"
          >
            <Button type="primary">选择文件</Button>
          </dytUpload>
          <span class="underline down-file" @click="downTemplate">下载模板</span>
        </FormItem>
        <FormItem label="文件" v-if="isImport">
          <span v-if="uploadFile">{{ uploadFile.name }}</span>
        </FormItem>
      </Form>
    </div>
    <div slot="footer">
      <Button type="primary" @click="modalConfirm" :loading="modalLoading">{{ isImport ? '导入' : '确定' }}</Button>
      <Button @click="modalCancel">取消</Button>
    </div>
  </Modal>
</template>

<script>
import api from '@/api/api';

export default {
  name: 'insetOrderModal',
  props: {
    moduleData: {
      type: Object,
      default: () => {
        return {
          type: 'add',
          platformSaleAccountObj: {},
          platformDataList: [],
          supplierDataList: [],
          data: {}
        }
      }
    },
    visible: { type: Boolean, default: false }
  },
  data () {
    return {
      modalVisible: false,
      modalLoading: false,
      formData: {
        supplierId: '',
        platformSubject: '',
        saleAccountId: ''
      },
      rormRule: {
        supplierId: [
          { required: true, validator: this.verifySelect, msg: '请选择供应商', trigger: 'change' }
        ],
        platformSubject: [
          { required: true, validator: this.verifySelect, msg: '请选择平台主体', trigger: 'change' }
        ],
        saleAccountId: [
          { required: true, validator: this.verifySelect, msg: '请选择店铺', trigger: 'change' }
        ],
      },
      actionUrl: api.trusteeship_import,
      uploadData: {},
      uploadFile: null
    };
  },
  watch: {
    visible: {
      immediate: true,
      deep: true,
      handler (val) {
        this.modalVisible = val;
        this.$nextTick(() => {
          val && this.initData();
        })
      }
    },
    modalVisible: {
      immediate: true,
      deep: true,
      handler (val) {
        this.$emit('update:visible', val);
        if (val) return;
        this.$refs.modalFormRef && this.$refs.modalFormRef.resetFields();
        this.$nextTick(() => {
          setTimeout(() => {
            this.$refs.modalFormRef && this.$refs.modalFormRef.resetFields();
            this.initData();
          }, 300)
        })
      }
    }
  },
  created () {},
  computed: {
    // 是否导入
    isImport () {
      return this.moduleData.type == 'import';
    },
    // 弹窗标题
    modaltitle () {
      return this.isImport ? '导入数据' : '操作提示';
    },
    // 供应商
    supplierDataList () {
      return this.moduleData.supplierDataList || [];
    },
    // 平台主体
    platformDataList () {
      return this.moduleData.platformDataList || [];
    },
    // 店铺
    platformSaleAccountList () {
      if (this.$common.isEmpty(this.moduleData.platformSaleAccountObj) || this.$common.isEmpty(this.formData.platformSubject)) return [];
      return this.moduleData.platformSaleAccountObj[this.formData.platformSubject] || [];
    },
    // 登录人事业部
    loginBusinessDeptId () {
      if (this.$common.isEmpty(this.$store.getters.authUserInfo)) return '';
      if (this.$common.isEmpty(this.$store.getters.authUserInfo.securityUser)) return '';
      if (this.$common.isEmpty(this.$store.getters.authUserInfo.securityUser.businessDeptId)) return '';
      return this.$store.getters.authUserInfo.securityUser.businessDeptId;
    },
  },
  activated () {},
  mounted () {},
  methods: {
    // 初始数据
    initData () {
      this.uploadFile = null;
      this.uploadData = {};
      this.modalLoading = false;
    },
    // 确认
    modalConfirm () {
      if (this.modalLoading) return;
      if (this.$refs.modalFormRef) {
        this.$refs.modalFormRef.validate((valid) => {
          if (!valid) return;
          let addParams = this.$common.copy(this.formData);
          const selectSaleAccount = this.platformSaleAccountList.find(item => item.saleAccountId == addParams.saleAccountId) || {};
          const selectSupplier = this.supplierDataList.find(item => item.supplierId == addParams.supplierId) || {};
          addParams.warehouseId = this.$store.state.warehouseId;
          addParams.accountCode = selectSaleAccount.accountCode;
          addParams.supplierIdCode = selectSupplier.supplierCode;
          addParams.businessDeptId = this.loginBusinessDeptId;
          if (this.isImport) {
            if (this.$common.isEmpty(this.uploadFile)) {
              this.$Message.error('请选择需要导入的文件');
              return;
            }
            this.modalLoading = true;
            this.uploadData = this.$common.removeEmpty(addParams);
            this.$nextTick(() => {
              this.$refs.uploadRef.upload(this.uploadFile);
            })
            return;
          }
          this.$emit('insetConfirm', {
            type: 'add',
            data: addParams
          });
          this.modalCancel();
        })
      }
    },
    // 平台主体改变
    platformChange (val) {
      this.formData.saleAccountId = '';
    },
    // 验证
    verifySelect (rule, value, callback) {
      this.$nextTick(() => {
        const newVal = this.formData[rule.field];
        let required = rule.required;
        if (this.$common.isFunction(rule.getRequired)) {
          required = rule.getRequired();
        }
        if (required && this.$common.isEmpty(newVal)) {
          return callback(new Error(rule.msg || '必填项不能为空'));
        }
        callback();
      })
    },
    // 取消
    modalCancel () {
      this.$nextTick(() => {
        this.modalVisible = false;
      })
    },
    // 上传前处理
    handleUpload (file) {
      this.uploadFile = file;
      return false;
    },
    // 上传成功
    handleSuccess (res) {
      this.$Message.success('异步导入任务成功，请在“导入查看”确认对应导入数据成功后刷新列表');
      this.modalLoading = false;
      this.$emit('refreshPage');
      this.modalCancel();
    },
    // 上传失败
    handleError (file) {
      this.modalLoading = false;
    },
    // 文件格式不正确
    handleFormatError (file) {
      this.modalLoading = false;
      this.$Message.error('文件格式有误');
    },
    // 下载模板
    downTemplate () {
      window.open('./filenode/s/wms-service/template/trusteeshipImport.xlsx');
    }
  }
};
</script>
<style lang="less" scoped>
.modal-main-content{
  position: relative;
  .down-file{
    display: inline-block;
    margin-left: 20px;
  }
  .underline {
    color: #2d8cf0;
    text-decoration: underline;
    text-underline-position: under;
    cursor: pointer;
  }
}
</style>