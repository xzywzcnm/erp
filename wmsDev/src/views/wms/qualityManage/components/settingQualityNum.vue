<template>
  <div>
    <Modal v-model="isVisible" title="批量设置抽检数量" :width="600" :mask-closable="false" class="settingQualityNum-page">

      <Form :model="formData" :rules="ruleForm" :label-width="0" ref="settingQualityNum">
        <div>批量设置规则：</div>
        <FormItem label="" prop="ruleType" class="settingQualityNum-content">
          <RadioGroup v-model="formData.ruleType" class="settingQualityNum-radio">
            <Radio :label="1">
              <div class="radio-div">
                <span>相同SPU的产品，总抽检比例：</span>
                <FormItem label="" prop="totalProportion">
                  <Input v-model="formData.totalProportion" class="proportion-input" @on-focus="inputFocus(1)"></Input>
                </FormItem>
                <span>%，四舍五入</span>
              </div>
            </Radio>
            <Radio :label="2">
              <div class="radio-div">
                <span>每款产品(SKU)，抽检比例：</span>
                <FormItem label="" prop="skuProportion">
                  <Input v-model="formData.skuProportion" class="proportion-input" @on-focus="inputFocus(2)"></Input>
                </FormItem>
                <span>%，四舍五入</span>
              </div>
            </Radio>
            <Radio :label="3">
              <div class="radio-div">
                <span>每款产品（SKU），抽检件数：</span>
                <FormItem label="" prop="sampleNum">
                  <Input v-model="formData.sampleNum" class="proportion-input" @on-focus="inputFocus(3)"></Input>
                </FormItem>
              </div>
            </Radio>
          </RadioGroup>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" @click="submitSetting">确定</Button>
        <Button @click="isVisible = false">取消</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import Big from 'big.js';
import regular from '@/utils/regular.js';
export default {
  name: 'settingQualityNum',
  props: {
    modelVisible: {
      type: Boolean,
      default() {
        return false
      }
    },
    detailData: {
      type: Object,
      default() {
        return {}
      }
    },
  },
  data() {
    let _self = this;
    return {
      isVisible: false,
      formData: {
        ruleType: 1,
        totalProportion: null,
        skuProportion: null,
        sampleNum: null,
      },
      ruleForm: {
        ruleType: [{ required: true, message: '请设置规则', trigger: 'change', type: 'number' }],
        totalProportion: [
          { validator: _self.validateTotal, trigger: 'blur' }
        ],
        skuProportion: [
          { validator: _self.validateSku, trigger: 'blur' }
        ],
        sampleNum: [
          { validator: _self.validateSample, trigger: 'blur' }
        ],
      },
    }
  },
  watch: {
    modelVisible: {
      handler(val) {
        val && this.open();
      },
      deep: true
    },
    isVisible: {
      handler(val) {
        if (val) return;
        this.$emit('update:modelVisible', val);
      },
      deep: true
    },
  },
  methods: {
    // 窗口打开
    open() {
      this.isVisible = true;
      this.$nextTick(() => {
        this.$refs['settingQualityNum'].resetFields();
      })
    },
    // 相同SPU的产品，总抽检比例
    validateTotal(rule, value, callback) {
      let flag = value === '' || value === undefined || value === null;
      if (this.formData.ruleType === 1 && flag) {
        return callback(new Error('请输入内容'));
      }
      const reg = /^((?!0)\d{1,2}|100)$/;
      if (!flag && !reg.test(value)) {
        return callback(new Error('限大于0，小于100的整数'));
      }
      return callback();
    },
    // 每款产品(SKU)，抽检比例
    validateSku(rule, value, callback) {
      let flag = value === '' || value === undefined || value === null;
      if (this.formData.ruleType === 2 && flag) {
        return callback(new Error('请输入内容'));
      }
      const reg = /^((?!0)\d{1,2}|100)$/;
      if (!flag && !reg.test(value)) {
        return callback(new Error('限大于0，小于100的整数'));
      }
      return callback();
    },
    // 每款产品（SKU），抽检件数
    validateSample(rule, value, callback) {
      let flag = value === '' || value === undefined || value === null;
      if (this.formData.ruleType === 3 && flag) {
        return callback(new Error('请输入内容'));
      }
      let wmsReceiptCheckDetailBaseList = this.detailData.wmsReceiptCheckDetailBaseList || [];
      // let maxNum = Math.max.apply(Math, wmsReceiptCheckDetailBaseList.map(item => { return item.purchaseNumber })); // 最大值
      let minNum = Math.min.apply(Math, wmsReceiptCheckDetailBaseList.map(item => { return item.purchaseNumber })); // 最小值
      // console.log(minNum)
      if (flag) return callback();
      if (!regular.positiveNumber.test(value)) {
        return callback(new Error('限大于0的整数'));
      }
      if (new Big(value || 0).minus(minNum || 0) > 0) {
        return callback(new Error(`不能小于最小下单数 "${minNum}" `));
      }
      return callback();
    },
    // 设置规则
    submitSetting() {
      this.$refs['settingQualityNum'].validate((valid) => {
        if (!valid) return false;
        let formData = this.formData;
        let obj = { 1: 'totalProportion', 2: 'skuProportion', 3: 'sampleNum' }
        let temp = {
          type: formData.ruleType,
          value: formData[obj[formData.ruleType]]
        }
        this.$emit('settingRules', temp);
        this.isVisible = false;
      })
    },
    inputFocus(val) {
      this.formData.ruleType = val;
      this.$refs['settingQualityNum'].validate();
    }
  }
}
</script>

<style lang="less">
.settingQualityNum-page {
  .proportion-input {
    width: 90px;
    margin: 0 10px;
  }

  .settingQualityNum-content {
    margin: 20px 20px 20px 40px;
  }

  .settingQualityNum-radio {
    .ivu-radio-wrapper {
      display: inline-block;

      &:not(:last-child) {
        margin-bottom: 20px;
      }
    }

    .radio-div {
      display: inline-flex;
      align-items: center;
    }
  }

}
</style>
