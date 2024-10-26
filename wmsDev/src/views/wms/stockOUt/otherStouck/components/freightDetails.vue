<template>
  <div class="freightDetails">
    <Form :label-width="100" :rules="mainValidate" :model="mainInfo" ref="formValidate" :class="isDisabled ? 'freigh-form' : 'freigh-formun'">
      <FormItem label="运费：" prop="transportExpense">
        <div class="price-sty">
          <Icon type="logo-yen" class="logoyen" />
          <Input v-model.trim="mainInfo.transportExpense" type="number" style="width: 200px;" v-if="isDisabled"></Input>
          <span class="price-font" v-else>{{fixedTwo(mainInfo.transportExpense)}}</span>
        </div>
      </FormItem>
      <FormItem label="其他费用：" prop="otherExpense">
        <div class="price-sty">
          <Icon type="logo-yen" class="logoyen" />
          <Input v-model.trim="mainInfo.otherExpense" type="number" style="width: 200px;" v-if="isDisabled"></Input>
          <span class="price-font" v-else>{{fixedTwo(mainInfo.otherExpense)}}</span>
        </div>
      </FormItem>
      <FormItem label="备注：" prop="remarks">
        <Input v-model.trim="mainInfo.remarks" type="textarea" :autosize="{ minRows: 3, maxRows: 7 }" placeholder="请输入" style="width: 590px;" class="pdl18" v-if="isDisabled"></Input>
        <div v-else>{{mainInfo.remarks}}</div>
      </FormItem>
      <FormItem label="总运费：">
        <div class="price-sty">
          <Icon type="logo-yen" class="logoyen" />
          <span class="price-font">
            <span v-if="totalFreight.split('.').length">{{totalFreight.split('.')[0]}}</span>
            <span v-if="totalFreight.split('.').length>1">.{{totalFreight.split('.')[1]}}</span>
          </span>
        </div>
      </FormItem>
    </Form>
  </div>
</template>

<script>
import Big from 'big.js';
import regular from '@/utils/regular';
const positiveFloat = { message: '必须大于或等于0的数字,且最多允许两位小数', pattern: regular.hasPriceNum, trigger: 'blur' };
export default {
  name: 'freightDetails',
  data () {
    return {
      mainInfo: {
        transportExpense: '',
        otherExpense: '',
        remarks: ''
      },
      mainValidate: {
        transportExpense: [{ required: true, message: '运费必填', trigger: 'blur' }, positiveFloat],
        otherExpense: [positiveFloat],
        remarks: [{ required: false, message: '输入内容超于200字符', trigger: 'blur', max: 200 }]
      }
    }
  },
  props: {
    detailData: {
      type: Object,
      default () {
        return {}
      }
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    detailData: {
      handler (val) {
        if (!val.pickingId) return;
        let fbaExpenseDetail = val.fbaExpenseDetail || {};
        Object.keys(this.mainInfo).forEach(item => {
          this.mainInfo[item] = String(fbaExpenseDetail[item] || '');
        })
      },
      deep: true,
      immediate: true
    }
  },
  computed: {
    isDisabled () {
      return this.isEdit;
    },
    totalFreight () {
      let { transportExpense, otherExpense } = this.mainInfo;
      return new Big(transportExpense || 0).plus(otherExpense || 0).toFixed(2);
    }
  },
  methods: {
    // 表单提交
    handleSubmit () {
      return new Promise((resolve, reject) => {
        this.$refs['formValidate'].validate((valid) => {
          if (valid) {
            let temp = this.$common.copy(this.mainInfo);
            resolve(temp);
          } else {
            resolve(false);
          }
        })
      })
    },
    // 小数留两位
    fixedTwo (val) {
      return new Big(val || 0).toFixed(2);
    }
  }
}
</script>
<style lang="less" scoped>
.freightDetails {
  .logoyen {
    color: red;
    margin-right: 6px;
    font-size: 12px;
    width: 12px;
  }
  :deep(.ivu-form-item-error-tip),
  .pdl18 {
    padding-left: 18px;
  }
  .price-sty {
    display: flex;
    align-items: center;
    .price-font {
      color: red;
      > span:first-child {
        font-size: 20px;
        font-weight: bold;
      }
    }
  }
  :deep(.freigh-form) {
    .ivu-form-item {
      margin-bottom: 20px;
    }
  }
  :deep(.freigh-formun) {
    .ivu-form-item {
      margin-bottom: 8px;
    }
  }
}
</style>
