<template>
  <div>
    <!-- eslint-disable-next-line vue/no-mutating-props -->
    <Modal class="modal-main" v-model="dialogObj.modelVisible" :mask-closable="false" title="维护发货单" :width="500">
      <div class="content" style="padding-right:20px;">
        <Form ref="formValidates" :model="formValidate" :label-width="100" :rules="ruleValidate">
          <FormItem label="发货单号:">
            <span>{{dialogObj.data.supplierDespatchId || '-'}}</span>
          </FormItem>
          <FormItem label="送货方式:">
            <dyt-select v-model="formValidate.despatchType" clearable>
              <Option v-for="item in despatchTypelist" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </dyt-select>
          </FormItem>
          <FormItem label="快递物流商:">
            <dyt-select v-model="formValidate.logisticsId" clearable>
              <Option v-for="item in logisterList" :value="item.logisticsId" :key="item.logisticsId">{{ item.logisticsName }}</Option>
            </dyt-select>
          </FormItem>
          <FormItem label="物流运单号:" prop="trackingNumber">
            <Input v-model="formValidate.trackingNumber" placeholder="请输入" clearable></Input>
          </FormItem>
          <FormItem label="包裹数量:" prop="packageNumber">
            <Input v-model="formValidate.packageNumber" placeholder="请输入" clearable></Input>
          </FormItem>
          <FormItem label="包裹重量(kg):" prop="weight">
            <Input v-model="formValidate.weight" placeholder="请输入" clearable></Input>
          </FormItem>
        </Form>
      </div>
      <div slot="footer" style="text-align: center;">
        <Button type="primary" @click="handleSubmit('formValidates')" :loading="loading">确定</Button>
        <!-- eslint-disable-next-line vue/no-mutating-props -->
        <Button @click="dialogObj.modelVisible = false">关闭</Button>
      </div>
    </Modal>

  </div>
</template>

<script>
import api from '@/api/api';
import regular from '@/utils/regular.js';
export default {
  data () {
    return {
      Tableloading: false,
      loading: false,

      formValidate: {
        trackingNumber: '',
        despatchType: '',
        packageNumber: '',
        logisticsId: '',
        weight: '',
      },
      ruleValidate: {
        trackingNumber: [
          { max: 50, message: '最多只能输入50个字符', trigger: 'blur' },
        ],
        despatchType: [
          { type: 'number', required: true, message: '请选择送货方式', trigger: 'change' },
        ],
        packageNumber: [
          { pattern: regular.validateInteger, message: '请输入正整数', trigger: 'blur' },
        ],
        logisticsId: [
          { type: 'number', required: true, message: '请选择快递物流商', trigger: 'change' },
        ],
        weight: [
          { pattern: regular.validateWeight, message: '限数字，小数精度限4位，如0.0001', trigger: 'blur' },
        ],
      },
      despatchTypelist: [
        { label: "快递/物流送货", value: 0 },
        { label: "自送", value: 1 }
      ]
    };
  },
  props: {
    dialogObj: {
      type: Object,
      default () {
        return {
          modelVisible: false,
          data: {}
        };
      }
    },
    logisterList: {
      type: Array,
      default () {
        return [];
      }
    }
  },
  watch: {
    "dialogObj.modelVisible": {
      handler (newVal, oldVal) {
        if (newVal) this.handleReset();
      },
      immediate: true
    }
  },
  created () { },
  methods: {
    // 提交
    handleSubmit (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          let temp = {};
          temp.despatchInfoID = this.dialogObj.data.id;
          temp.supplierDespatchId = this.dialogObj.data.supplierDespatchId;
          temp.despatchType = this.formValidate.despatchType;
          temp.logisticsId = this.formValidate.logisticsId;
          temp.packageNumber = this.formValidate.packageNumber;
          temp.trackingNumber = this.formValidate.trackingNumber;
          temp.weight = this.formValidate.weight;
          // console.log(temp);
          // return;
          this.loading = true;
          this.axios.post(api.maintainDespatch, temp).then(({ data }) => {
            if (data.code == 0) {
              this.$Message.info('操作成功');
              // eslint-disable-next-line vue/no-mutating-props
              this.dialogObj.modelVisible = false;
              this.$emit('fetch');
            }
          }).finally(() => {
            this.loading = false;
          });
        }
      });
    },
    // 重置
    handleReset () {
      this.getSendetail();
    },
    // 获取发货单详情
    getSendetail () {
      this.axios.post(api.despatchqueryDetails + `?supplierDespatchId=${this.dialogObj.data.supplierDespatchId}`).then(({ data }) => {
        if (data.code == 0) {
          let obj = data.datas && data.datas.despatchDetails ? data.datas.despatchDetails : {};
          Object.keys(this.formValidate).forEach(k => {
            if (obj[k] || obj[k] === 0) {
              this.formValidate[k] = k === 'logisticsId' ? obj[k] - 0 : obj[k];
            } else {
              this.formValidate[k] = '';
            }
          });
        }
      });
    }
  }
};
</script>
<style scoped>
</style>