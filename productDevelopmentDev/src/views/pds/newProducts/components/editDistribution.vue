<template>
  <Modal v-model="isVisible" title="编辑分销" :mask-closable="false">
    <div class="edit-distribution-contain">
      <Form ref="editDistributionForm" :model="formData" :rules="ruleValidate" :label-width="130">
        <FormItem label="类型:" prop="distributionPriceType">
          <RadioGroup v-model="formData.distributionPriceType">
            <Radio label="1">按比例增加</Radio>
            <Radio label="0">按数值增加</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="加价:" prop="distributionPriceValue">
          <dytInput
            v-model="formData.distributionPriceValue"
            placeholder="请输入数字"
            :clearable="false"
            :disabled="$common.isEmpty(formData.distributionPriceType)"
          >
            <div slot="suffix" class="distribution-price-suffix">{{ `${formData.distributionPriceType == 0 ? 'RMB' : '%'}` }}</div>
          </dytInput>
        </FormItem>
      </Form>
    </div>
    <div slot="footer">
      <Button @click="isVisible = false">取消</Button>
      <Button type="primary" @click="handleSubmit">确定</Button>
    </div>
  </Modal>
</template>
<script>

export default {
  name: "editDistribution",
  components: {},
  data () {
    return {
      formData: {},
      ruleValidate: {
        distributionPriceType: [
          { required: true, message: "分销类型必填", trigger: "change"}
        ],
        distributionPriceValue: [
          { validator: this.distributionPriceValueValidate, trigger: "blur"},
          { validator: this.distributionPriceValueValidate, trigger: "change"}
        ]
      },
      isVisible: false
    };
  },
  props: {
    modelVisible: {
      type: Boolean,
      default: false
    },
    distributionInfo: {
      type: Object,
      default () {
        return {
          index: 0,
          row: {}
        };
      }
    }
  },
  watch: {
    modelVisible (newVal) {
      if (newVal) this.open();
    },
    isVisible (newVal) {
      if (!newVal) this.$emit('update:modelVisible', false);
    },
    distributionInfo: {
      immediate: true,
      deep: true,
      handler (val) {
        this.formData = this.$common.copy(val.row || {});
        if (this.$common.isEmpty(this.formData.distributionPriceType)) {
          this.formData.distributionPriceType = '1';
        }
        if (this.$common.isEmpty(this.formData.distributionPriceValue)) {
          this.formData.distributionPriceValue = '0';
        }
      }
    }
  },
  methods: {
    // 打开窗口
    open () {
      this.isVisible = this.modelVisible;
    },
    handleSubmit () {
      this.$refs.editDistributionForm.validate((valid) => {
        if (!valid) return;
        const formData = this.$common.copy(this.formData);
        if (this.$common.isEmpty(formData.distributionPriceType)) {
          formData.distributionPriceType = '1';
        }
        if (this.$common.isEmpty(formData.distributionPriceValue)) {
          formData.distributionPriceValue = '0';
        }
        this.$emit('distributionConfirm', {...formData, index: this.distributionInfo.index});
        this.$nextTick(() => {
          this.isVisible = false;
          this.$refs.editDistributionForm.resetFields();
        })
      })
    },
    distributionPriceValueValidate (rule, value, callback) {
      if (this.$common.isEmpty(value)) {
        return callback();
      }
      const newVal = Number(value);
      if (this.$common.isEmpty(newVal)) {
        return callback(new Error('分销加价必须为数字'));
      }
      callback();
    }
  }
};
</script>
<style lang="less" scoped>
.distribution-price-suffix{
  height: 100%;
  line-height: 32px;
}
</style>