<template>
  <div>
    <Modal
      v-model="isVisible"
      title="提示"
      :width="600"
      :mask-closable="false"
      class="boxLabelPage"
    >
      <div>
        <Form
          :model="data"
          :label-width="130"
          class="detail-form"
          style="padding-left: 50px"
        >
          <FormItem label="物流单号：">{{ data.trackingNumber }}</FormItem>
          <FormItem label="店铺：">{{ data.accountCode }}</FormItem>
          <FormItem label="预约揽收单状态：">
            <span v-if="data.pickupStatus">{{
              data.pickupStatus == 2 ? "已预约" : "未预约"
            }}</span>
          </FormItem>
        </Form>
        <div class="mt20 b-tips">
          <div class="tips">装入货箱</div>
          <div class="boxNo">{{ data.containerNumber }}</div>
        </div>
      </div>
      <div slot="footer">继续扫描下一个包裹或者点击ESC关闭</div>
    </Modal>
  </div>
</template>

<script>
export default {
  name: "boxLabel",
  props: {
    modelVisible: {
      type: Boolean,
      default() {
        return false;
      },
    },
    data: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      isVisible: false,
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
        if (val) return;
        this.$emit("update:modelVisible", val);
      },
      deep: true,
    },
  },
  methods: {
    // 窗口打开
    open() {
      this.isVisible = true;
    },
  },
};
</script>
<style lang="less">
.boxLabelPage {
  .ivu-modal {
    top: 50%;
    transform: translateY(-50%);
  }

  .ivu-modal-mask {
    background-color: rgba(55, 55, 55, 0.2);
  }

  .b-tips {
    font-weight: bold;
    text-align: center;

    .tips {
      font-size: 18px;
    }

    .boxNo {
      font-size: 30px;
    }
  }
}
</style>
