<template >
  <Modal v-model="isVisible" :title="modalTitle" width="500">
    <div class="modal-edit">
      <Spin v-if="pageLoading" fix></Spin>
      <Form
        class="modal-edit-form"
        ref="modalForm"
        :model="formData"
        :rules="formRule"
        :label-width="100"
        label-position="right"
      >
        <Form-item label="商户编号: " prop="merchantId">
          <dytInput placeholder="请输入商户编号" v-model="formData.merchantId" :disabled="!isEdit" />
        </Form-item>
        <Form-item label="商户名称: " prop="merchantName">
          <dytInput placeholder="请输入商户名称" v-model="formData.merchantName" :disabled="!isEdit" />
        </Form-item>
        <Form-item label="商户类型:" prop="merchantType">
          <dyt-select v-model="formData.merchantType" :disabled="!isEdit" placeholder="请选择商户类型">
            <Option :value="0">分销商</Option>
            <Option :value="1">供应商</Option>
          </dyt-select>
        </Form-item>
        <Form-item label="Token: " prop="token">
          <dytInput placeholder="请输入Token" v-model="formData.token" :disabled="!isEdit" />
        </Form-item>
      </Form>
    </div>
    <div slot="footer">
      <Button @click="isVisible = false">取 消</Button>
      <Button v-if="isEdit" type="primary" @click="saveData" :disabled="pageLoading">确 定</Button>
    </div>
  </Modal>
</template>
<script>
import api from '@/api/api';

export default {
  name: 'addOrEditYmsAccount',
  components: {},
  props: {
    modalData: {
      type: Object,
      default: () => {
        return {}
      }
    },
    modalVisible: { type: Boolean, default: false }
  },
  data () {
    return {
      isVisible: false,
      pageLoading: false,
      accountDetails: {},
      formData: {
        merchantId: null,
        merchantName: null,
        merchantType: null,
        token: null,
      },
      formRule: {
        merchantId: [
          { required: true, validator: this.merchantIdVerify, trigger: 'blur' },
          { required: true, validator: this.merchantIdVerify, trigger: 'change' }
        ],
        merchantName: [
          { required: true, validator: this.$common.strMaxVerify, maxLength: 20, trigger: 'blur', msg: '请输入商户名称' },
          { required: true, validator: this.$common.strMaxVerify, maxLength: 20, trigger: 'change', msg: '请输入商户名称' }
        ],
        merchantType: [
          { required: true, validator: this.$common.formItemVerify, trigger: 'change', msg: '请选择商户类型' }
        ],
        token: [
          { required: true, validator: this.$common.strMaxVerify, maxLength: 50, trigger: 'blur', msg: '请输入Token' },
          { required: true, validator: this.$common.strMaxVerify, maxLength: 50, trigger: 'change', msg: '请输入Token' }
        ],
      }
    }
  },
  watch: {
    modalVisible: {
      immediate: true,
      deep: true,
      handler (val) {
        this.isVisible = val;
        if (!val) return;
        this.$nextTick(() => {
          this.initData();
        })
      }
    },
    isVisible: {
      immediate: true,
      deep: true,
      handler (val) {
        this.$emit('update:modalVisible', val);
      }
    }
  },
  computed: {
    // 行详情
    rowDetails () {
      if (this.$common.isEmpty(this.modalData) || this.$common.isEmpty(this.modalData.row)) return {};
      return this.modalData.row;
    },
    // 商户账号ID
    merchantAccountId () {
      if (this.$common.isEmpty(this.rowDetails)) return '';
      return this.rowDetails.merchantAccountId || '';
    },
    // 打开方式
    viewType () {
      if (this.$common.isEmpty(this.modalData) || this.$common.isEmpty(this.modalData.viewType)) return 'view';
      return this.modalData.viewType;
    },
    // 是否可编辑
    isEdit () {
      return ['edit', 'add'].includes(this.viewType)
    },
    modalTitle () {
      if (this.viewType == 'add') return '添加新绑定';
      if (this.viewType == 'edit') return '编辑绑定';
      return '查看绑定';
    }
  },
  created () {},
  methods: {
    // 初始化数据
    initData () {
      this.pageLoading = true;
      this.accountDetails = {};
      this.$refs.modalForm && this.$refs.modalForm.resetFields();
      this.$nextTick(() => {
        this.$refs.modalForm && this.$refs.modalForm.resetFields();
        let awaitRes = [];
        let newFormData = {};
        if (!this.$common.isEmpty(this.merchantAccountId)) {
          newFormData.merchantAccountId = this.merchantAccountId;
          awaitRes.push(this.getAccountDetails);
        }
        this.$common.promiseAll(awaitRes).finally(() => {
          if (!this.$common.isEmpty(this.merchantAccountId)) {
            Object.keys(this.formData).forEach(key => {
              if (!this.$common.isUndefined(this.accountDetails[key])) {
                newFormData[key] = this.accountDetails[key];
              } else {
                newFormData[key] = this.formData[key];
              }
            });
          }
          this.formData = newFormData;
          this.pageLoading = false;
        });
      })
    },
    // 获取商户详情
    getAccountDetails () {
      return new Promise((resolve) => {
        this.axios.get(`${api.ymsMerchantAccount}/${this.merchantAccountId}`).then(res => {
          if (res && res.data && res.data.datas) {
            this.accountDetails = res.data.datas;
          } else {
            this.accountDetails = this.rowDetails;
          }
          resolve({ state: 'finally' });
        }).catch(() => {
          resolve({ state: 'finally' });
        })
      })
    },
    // 商户编号验证
    merchantIdVerify (rule, value, callback) {
      let required = this.$common.isEmpty(rule.required) ? rule.getRequired : rule.required;
      if (this.$common.isFunction(required)) {
        required = required(rule, value);
      }
      if (!this.$common.isEmpty(required) && required && this.$common.isEmpty(value)) {
        return callback(new Error('请输入商户编号'));
      }
      const valStr = value.trim();
      const newVal = Number(valStr);
      if (this.$common.isEmpty(newVal) || (valStr.length != 6 && rule.trigger == 'blur') || valStr.length > 6) return callback(new Error('商户编号必须为6位数字'));
      callback();
    },
    // 保存
    saveData () {
      if (this.pageLoading) return;
      this.$refs.modalForm.validate((valid) => {
        if (!valid) return;
        this.pageLoading = true;
        this.axios[this.$common.isEmpty(this.merchantAccountId) ? 'post' : 'put'](api.ymsMerchantAccount, this.formData).then(res => {
          this.pageLoading = false;
          if (!res || !res.data || res.data.code != 0) return;
          this.$Message.success('操作成功！');
          this.$emit('refreshParent');
          this.isVisible = false;
        }).catch(() => {
          this.pageLoading = false;
        })
      });
    }
  }
};
</script>
<style lang="less" scoped>
.modal-edit{
  position: relative;
}
</style>
