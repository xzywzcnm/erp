<template>
  <Modal v-model="isVisible" title="查看" :mask-closable="false" width="750px" class="batchScanPage">
    <div class="formDetail" style="padding: 10px 16px 0;">
      <div style="text-align: center;">
        <Alert type="warning" show-icon style="display:inline-block;padding: 8px 8px 8px 36px;line-height: 16px;">
          温馨提示：包裹为多件商品的包裹，请确认“增值服务”实际的操作数量
        </Alert>
      </div>
      <Form ref="formInline" :model="formData" :rules="formRule" inline class="formWidth240 fmb0" :label-width="100"
        @submit.native.prevent>
        <div class="table_border">
          <FormItem label="运单号:">{{ stockDetail.trackingNumber }}</FormItem>
          <FormItem label="物流商单号:">{{ stockDetail.thirdPartyNo }}</FormItem>
          <FormItem label="SKU数量:">{{ stockDetail.skuSum }}</FormItem>
          <FormItem label="商品数量:">{{ stockDetail.productSum }}</FormItem>
        </div>
        <div class="dispalyFlex justifyCenter autoLong mt20 mb10">
          <FormItem label="" prop="operateQuantity" :label-width="0">
            <div style="text-align:center;">操作数量</div>
            <Input ref="operateQuantity" type="text" v-model.trim="formData.operateQuantity" style="width: 200px;"
              size="large" class="quantity_input" @on-enter="confirmForm"></Input>
          </FormItem>
        </div>
      </Form>
    </div>
    <div slot="footer" align="center">
      <Button type="primary" @click="confirmForm">确定</Button>
    </div>
  </Modal>
</template>
<script>
export default {
  name: "batchScan",
  props: {
    modelVisible: {
      type: Boolean,
      default: false
    },
    stockDetail: {
      type: Object,
      default: () => {
        return {};
      }
    },
  },
  data() {
    return {
      isVisible: false,
      formData: {
        operateQuantity: null,
      },
      formRule: {
        operateQuantity: [
          { validator: this.validateQuantity, trigger: 'blur' }
        ],
      },
    };
  },
  watch: {
    modelVisible(newVal) {
      newVal && this.init();
    },
    isVisible(newVal) {
      this.$emit('update:modelVisible', newVal);
      !newVal && this.closeModal();
    }
  },
  methods: {
    init() {
      this.isVisible = true;
      this.formData.operateQuantity = this.stockDetail.productSum || 0;
      this.autoFocus();
    },
    autoFocus() {
      this.$nextTick(() => {
        let rdom = document.querySelector('.quantity_input').querySelector('input');
        rdom.focus();
        rdom.select();
      })
    },
    // 关闭弹窗
    closeModal() {
      this.isVisible = false;
    },
    validateQuantity(rule, value, callback) {
      if (["", null, undefined].includes(value)) {
        callback(new Error("必填~"));
        this.autoFocus();
        return;
      }
      if (!this.$regular.positiveNumber.test(value)) {
        callback(new Error('请输入大于0的整数'));
        this.autoFocus();
        return;
      }
      let productSum = this.stockDetail.productSum || 0;
      if (productSum < value) {
        callback(new Error('操作数量不可以大于包裹的全部商品数量'));
        this.autoFocus();
        return;
      }
      callback();
    },
    confirmForm() {
      this.$refs['formInline'].validate((valid) => {
        if (!valid) return;
        this.$emit('returnInfo', { operateQuantity: this.formData.operateQuantity });
        this.closeModal();
      })
    },
  }
};
</script>
<style lang="less">
.batchScanPage {

  .table_border {
    .ivu-form-item {
      border: 1px solid #dcdfe6;
      margin: 0;

      &:nth-child(1) {
        border-right: none;
        border-bottom: none;
      }

      &:nth-child(2) {
        border-bottom: none;
      }

      &:nth-child(3) {
        border-right: none;
      }
    }

    .ivu-form-item-label {
      border-right: 1px solid #dcdfe6;
    }

    .ivu-form-item-content {
      padding: 0 4px;
    }
  }

  .quantity_input {
    .ivu-input {
      text-align: center;
      font-size: 18px;
    }
  }
}
</style>