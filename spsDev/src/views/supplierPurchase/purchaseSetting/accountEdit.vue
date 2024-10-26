<template >
  <Modal
    v-model="moduleVisible"
    :title="title"
    :mask-closable="false"
    width="600px"
    class-name="edit-modal-box"
  >
    <div class="module-modal-content">
      <Form
        ref="modalForm"
        :model="formData"
        :rules="ruleValidate"
        :label-width="120"
        class="module-form"
      >
        <FormItem label="账号" prop="accountCode">
          <Input v-model="formData.accountCode" placeholder="请输入账号" />
        </FormItem>
        <FormItem label="1688订单" prop="orderType">
          <dyt-select
            v-model="formData.orderType"
            placeholder="请选择订单类型"
          >
            <Option :value="0">大市场普通订单</Option>
            <Option :value="1">代销市场订单</Option>
          </dyt-select>
        </FormItem>
        <FormItem label="所属事业部" prop="businessDeptIds">
          <dyt-select
            v-model="formData.businessDeptIds"
            placeholder="请选择所属事业部"
            :max-tag-count="1"
            :multiple="true"
          >
            <Option
              v-for="(item, bIndex) in businessDeptList"
              :key="`${bIndex}-${item.id}`"
              :label="item.name"
              :value="item.id"
            />
          </dyt-select>
        </FormItem>
        <FormItem label="预计到货" prop="expectedDelivery">
          <dyt-select
            v-model="formData.expectedDelivery"
            placeholder="请选择预计到货"
          >
            <Option :value="1">1天预计到货时间选择</Option>
            <Option :value="3">3天预计到货时间选择</Option>
            <Option :value="5">5天预计到货时间选择</Option>
            <Option :value="7">7天预计到货时间选择</Option>
            <Option :value="9">9天预计到货时间选择</Option>
            <Option :value="15">15天预计到货时间选择</Option>
          </dyt-select>
        </FormItem>
        <FormItem label="运费均摊" prop="freightType">
          <dyt-select
            v-model="formData.freightType"
            placeholder="请选择运费均摊"
          >
            <Option :value="0">按重量</Option>
            <Option :value="1">按数量</Option>
            <Option :value="2">按金额</Option>
          </dyt-select>
        </FormItem>
        <FormItem label="App Key" prop="appKey">
          <Input v-model="formData.appKey" placeholder="请输入App Key" />
        </FormItem>
        <FormItem label="App Secret" prop="appSecret">
          <Input v-model="formData.appSecret" placeholder="请输入App Secret" />
        </FormItem>
        <FormItem label="授权 Token" prop="accessToken">
          <Input v-model="formData.accessToken" placeholder="请输入授权 Token" />
        </FormItem>
        <FormItem label="1688留言" prop="aliMessage">
          <Input v-model="formData.aliMessage" placeholder="请输入1688留言" type="textarea" :rows="2" />
        </FormItem>
        <FormItem label="采购备注" prop="purchaseMessage">
          <Input v-model="formData.purchaseMessage" placeholder="请输入采购备注" type="textarea" :rows="2" />
        </FormItem>
      </Form>
      <Spin fix v-if="loadingData"></Spin>
    </div>
    <div slot="footer">
      <Button type="primary" @click="saveData" :disabled="loadingData">确定</Button>
      <Button @click="moduleVisible = false">关闭</Button>
    </div>
    
  </Modal>
</template>

<script>
import api from '@/api/api';

const queryConfig = {
  add: {
    method: 'post',
    url: api.addAccount
  },
  edit: {
    method: 'put',
    url: api.editAccount
  }
}
export default {
  props: {
    title: { type: String, default: '新增账号信息' },
    editType: { type: String, default: 'add' },
    modalVisible: { type: Boolean, default: false },
    modalData: { type: Object, default: () => {return {}} }
  },
  data() {
    return {
      moduleVisible: false,
      formData: {
        accountCode: '',
        orderType: '',
        businessDeptIds: [],
        expectedDelivery: '',
        freightType: '',
        aliMessage: '',
        appKey: '',
        appSecret: '',
        accessToken: '',
        purchaseMessage: '',
      },
      oldFormData: {},
      ruleValidate: {
        accountCode: [
          { required: true, message: '请输入账号', trigger: 'blur' },
        ],
        orderType: [
          { required: true, message: '请选订单类型', trigger: 'change', type: 'number' },
        ],
        expectedDelivery: [
          { required: true, message: '请选预计到货', trigger: 'change', type: 'number' },
        ],
        freightType: [
          { required: true,  message: '请选运费均摊', trigger: 'change', type: 'number' },
        ],
        aliMessage: [
          { required: true, message: '请输入1688留言', trigger: 'blur' },
        ],
        appKey: [
          { required: true, message: '请输入App Key', trigger: 'blur' },
        ],
        appSecret: [
          { required: true, message: '请输入App Secret', trigger: 'blur' },
        ],
        accessToken: [
          { required: true, message: '请输入授权 Token', trigger: 'blur' },
        ],
        purchaseMessage: [
          { required: true,  message: '请输入采购备注', trigger: 'blur' },
        ],
        businessDeptIds: [
          { required: true,  validator: this.validatorBusiness, trigger: 'change' }
        ]
      },
      loadingData: false
    };
  },
  watch: {
    modalVisible: {
      immediate: true,
      handler (val) {
        this.moduleVisible = val;
      }
    },
    moduleVisible (val) {
      this.$emit('update:modalVisible', val);
      val ? this.init() : this.resetForm();
    }
  },
  computed: {
    businessDeptList () {
      return this.$store.getters['businessDeptList'];
    }
  },
  created () {},
  activated() {},
  methods: {
    init () {
      this.oldFormData = this.$common.copy(this.formData);
      this.loadingData = true;
      this.$common.promiseAll([
        () => this.getAllAccount,
        () => {
          return this.getAccountDetails(this.modalData.accountId);
        }
      ]).then((resArr) => {
        // console.log(resArr);
      }).finally(() => {
        this.loadingData = false;
      })
    },
    // 获取账号
    // getAllAccount () {
    //   return new Promise((resolve) => {
    //     this.axios.post(`${api.postQueryAccount}?businessDeptIds=${this.businessDeptIds}`).then((res) => {
    //       if (!res.data || res.data.code !== 0) return resolve([]);
    //       this.accountList = res.data.datas || [];
    //       resolve(res.data.datas || []);
    //     }).catch((error) => {
    //       console.error(error);
    //       resolve([]);
    //     })
    //   })
    // },
    // 获取账号详情
    getAccountDetails (accountId) {
      return new Promise((resolve) => {
        if (this.$common.isEmpty(accountId)) return resolve({});
        this.axios.get(`${api.getAccountDetails}${accountId}`).then((res) => {
          if (!res.data || res.data.code !== 0) return resolve({});
          let details = res.data.datas || {};
          if (!this.$common.isEmpty(details.businessDeptIds)) {
            details.businessDeptIds = details.businessDeptIds.split(',').map(m => Number(m));
          }
          if (!this.$common.isEmpty(details.expectedDelivery)) {
            details.expectedDelivery = Number(details.expectedDelivery);
          }
          if (!this.$common.isEmpty(details.freightType)) {
            details.freightType = Number(details.freightType);
          }
          if (!this.$common.isEmpty(details.orderType)) {
            details.orderType = Number(details.orderType);
          }
          this.formData = {...this.formData, ...this.$common.copy(details)};
          resolve(details);
        }).catch((error) => {
          console.error(error);
          resolve({});
        })
      })
    },
    // 保存账号
    saveData () {
      if (this.loadingData) return;
      this.$refs.modalForm.validate((valid) => {
        if (!valid || this.$common.isEmpty(queryConfig[this.editType])) return;
        this.loadingData = true;
        let formData = this.$common.copy(this.formData);
        formData.businessDeptIds = formData.businessDeptIds.join(',');
        this.axios[queryConfig[this.editType].method](queryConfig[this.editType].url, formData).then((res) => {
          if (!res.data || res.data.code !== 0) return;
          this.moduleVisible = false;
          this.$Message.success('操作成功!');
          this.$emit('saveCallback', true);
        }).finally(() => {
          this.loadingData = false;
        })
      })
    },
    // 重置表单
    resetForm () {
      this.formData = this.$common.copy(this.oldFormData);
      this.$nextTick(() => {
        this.$refs.modalForm && this.$refs.modalForm.resetFields();
      })
    },
    // 事业部验证
    validatorBusiness (rule, value, callback) {
      // 由于下拉选择控件二次封装造成实际值改变时比验证时慢需要额外自定义验证
      this.$nextTick(() => {
        if (this.$common.isEmpty(this.formData.businessDeptIds)) {
          return callback(new Error('请选择所属事业部'));
        }
        callback();
      })
    }
  }
};
</script>
<style lang="less" scoped>
.module-modal-content{
  position: relative;
  max-height: 65vh;
  padding: 16px 16px 0 16px;
  overflow: auto;
  .module-form{
    max-width: 500px;
  }
}
:deep(.edit-modal-box){
  .ivu-modal{
    width: 600px;
  }
  .ivu-modal-body{
    padding: 0
  }
}
</style>
