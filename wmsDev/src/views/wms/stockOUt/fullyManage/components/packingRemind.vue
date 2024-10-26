<template>
  <Modal
    v-model="isVisible"
    title="操作提示"
    :width="600"
    :mask-closable="false"
  >
    <div class="formDetail">
      <Form
        :label-width="90"
        inline
        :model="formData"
        class="formWidth140 fmb0 valueHighLight"
      >
        <Form-item label="商品SKU:">
          <div>{{ modalData.goodsSku }}</div>
        </Form-item>
        <div class="autoLong mb10">
          <Form-item label="名称:">
            <div>{{ modalData.goodsCnDesc }}</div>
          </Form-item>
        </div>
        <Form-item label="本次装箱数量:" prop="labelNum">
          <Input
            v-model="formData.labelNum"
            style="width: 120px"
            type="number"
          ></Input>
        </Form-item>
        <Form-item label="" prop="isPrint" :label-width="0">
          <Checkbox v-model="formData.isPrint">打印商品第三方标签</Checkbox>
        </Form-item>
      </Form>
    </div>
    <slot slot="footer">
      <Button @click="isVisible = false">取消</Button>
      <Button type="primary" @click="confirmClick">确定</Button>
    </slot>
  </Modal>
</template>

<script>
import Big from "big.js";
export default {
  name: "confirmModal",
  props: {
    modelVisible: {
      type: Boolean,
      default() {
        return {};
      },
    },
    modalData: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  data() {
    return {
      isVisible: false,
      formData: {
        labelNum: "",
        isPrint: false,
      },
    };
  },
  watch: {
    modelVisible: {
      handler(val) {
        val && this.open();
      },
      deep: true,
    },
    isVisible: {
      handler(val) {
        !val && this.$emit("update:modelVisible", val);
      },
      deep: true,
    },
  },
  methods: {
    open() {
      this.isVisible = true;
      let data = this.modalData;
      // console.log(data);
      this.formData.labelNum = data.maxNum || 0;
      this.formData.isPrint = !!data.isPrint;
    },
    confirmClick() {
      let formData = this.formData;
      let modalData = this.modalData;
      if (formData.labelNum <= 0) {
        this.$Message.warning("本次装箱数量要大于0!");
        return;
      }
      let subNum = new Big(modalData.maxNum || 0).minus(formData.labelNum) - 0;
      if (subNum < 0) {
        this.$Message.warning(
          `本次装箱数最大不能超过 ${modalData.maxNum || 0}`
        );
        return;
      }
      this.$emit("mulScan", {
        labelNum: formData.labelNum,
        isPrint: formData.isPrint,
      });
      this.isVisible = false;
    },
  },
};
</script>

<style lang="less">
.valueHighLight {
}
</style>