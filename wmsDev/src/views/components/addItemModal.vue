<template>
  <div>
    <Modal
      v-model="isVisible"
      title="货品增项操作提醒"
      width="600px"
      :mask-closable="false"
      class="addListModal"
    >
      <productAdditionOperation v-bind="$attrs" />
      <Input
        :id="inputID"
        @on-enter="isVisible = false"
        style="
          opacity: 0;
          position: absolute;
          top: 50px;
          left: 0px;
          z-index: -10;
        "
      ></Input>
      <div slot="footer" style="text-align: center">
        <Button type="primary" @click="isVisible = false"
          >我知道了（回车）</Button
        >
      </div>
    </Modal>
  </div>
</template>

<script>
import productAdditionOperation from "./productAdditionOperation.vue";
export default {
  name: "addItemModal",
  components: { productAdditionOperation },
  props: {
    modelVisible: {
      type: Boolean,
      default() {
        return false;
      },
    },
  },
  data() {
    return {
      isVisible: false,
      inputID: "inputs" + new Date().getTime() + Math.random() * 10000,
      timer: null,
      timeNum: 0,
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
        this.keepInputFocus(val);
        if (!val) this.$emit("update:modelVisible", val);
      },
      deep: true,
    },
  },
  methods: {
    // 保持input框光标聚焦（因作业扫描流程最终老是sku光标聚焦，所以这里要一直保持光标是聚焦的，直至一分钟后停止定时器）
    keepInputFocus(val) {
      if (!val) return this.clearTime();
      let inputDom = document.getElementById(this.inputID);
      let dom = inputDom ? inputDom.querySelector("input") : null;
      if (!dom) return;
      let fun = () => {
        if (this.timeNum >= 300) this.clearTime();
        dom.focus();
        this.timeNum++;
      };
      this.timer = setInterval(fun, 200);
      this.$once("hook:beforeDestory", () => {
        this.clearTime();
      });
    },
    clearTime() {
      clearInterval(this.timer);
      this.timeNum = 0;
    },
    // 窗口打开
    open() {
      this.isVisible = true;
    },
  },
};
</script>
<style lang="less">
.addListModal {
  .ivu-modal {
    top: 50%;
    transform: translateY(-40%);
  }

  .ivu-modal-mask {
    background-color: rgba(55, 55, 55, 0.4);
  }
}

@media only screen and (max-height: 850px) {
  .addListModal .ivu-modal {
    transform: translateY(-30%);
  }
}

@media only screen and (max-height: 785px) {
  .addListModal .ivu-modal {
    transform: translateY(-20%);
  }
}

@media only screen and (max-height: 720px) {
  .addListModal .ivu-modal {
    transform: translateY(-10%);
  }
}
</style>