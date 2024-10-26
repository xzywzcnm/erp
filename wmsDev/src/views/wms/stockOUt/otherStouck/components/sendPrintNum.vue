<template>
  <div>
    <Modal v-model="isVisible" title="寄样样品数" :width="500" :mask-closable="false" class="sendPrintNumPage">
      <Form ref="temuForm" :model="temuForm" :rules="temuValidate" :label-width="54" class="formDetail">
        <FormItem label="样品数:">
          <div class="flex-style">
            <FormItem prop="min" :label-width="0">
              <Input v-model.number="temuForm.min" type="number" class="spinButton"></Input>
            </FormItem>
            <span class="ml10 mr10">-</span>
            <FormItem prop="max" :label-width="0">
              <Input v-model.number="temuForm.max" type="number" class="spinButton"></Input>
            </FormItem>
          </div>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" @click="printSubmit()">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import Big from 'big.js';
import regular from '@/utils/regular';
export default {
  name: 'sendPrintNum',
  props: {
    modelVisible: {
      type: Boolean,
      default() {
        return false
      }
    },
    sendTemp: {// 某一列寄养数据
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
      temuForm: {// 样品数量
        min: '',
        max: '',
      },
      temuValidate: {
        min: [{ validator: _self.validateFreight, trigger: 'blur', name: 'min', type: 'number' }],
        max: [{ validator: _self.validateFreight, trigger: 'blur', name: 'max', type: 'number' }]
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
        this.$nextTick(() => {
          this.$refs['temuForm'].resetFields();
          this.$emit('update:modelVisible', val);
        })
      },
      deep: true
    },
  },
  methods: {
    // 窗口打开
    open() {
      this.isVisible = true;
    },
    // 验证样品数格式
    validateFreight(rule, value, callback) {
      if (!value) return callback(new Error('必填'));
      if (!regular.positiveNumber.test(value)) {
        return callback(new Error('大于0的整数'));
      }
      let { min, max } = this.temuForm;
      if (rule.name === 'min' && max && (new Big(min).minus(max) > 0)) {
        return callback(new Error('须小于结束值'));
      }
      if (rule.name === 'max' && min && (new Big(min).minus(max) > 0)) {
        return callback(new Error('须大于开始值'));
      }
      callback();
    },
    // 确认打印
    printSubmit() {
      this.$refs['temuForm'].validate((valid) => {
        if (!valid) return;
        this.$emit('temuSendReturn', this.$common.copy(this.temuForm));
        this.isVisible = false;
      })
    },
  }
}
</script>

<style lang="less">

</style>
