<template>
  <div>
    <Modal
      v-model="isVisible"
      :title="modalTitle"
      width="700px"
      :closable="false"
      :mask-closable="false"
      class="JITModaVerify"
    >
      <div class="JITModaVerify-content">
        <template v-for="(row, rIndex) in modelData">
          <div
            v-if="
              row.jitOrderMapperProductDTO &&
              row.jitOrderMapperProductDTO.jITProductInfoDTOList
            "
            :key="`rowjit-${rIndex}`"
            class="row-content"
            :class="{ 'row-content-line': rIndex > 0 }"
          >
            <div class="content-head">
              你已完成分拣的平台入库单号：{{
                row.jitOrderMapperProductDTO.purchaseOrderNo
              }}，需要将以下SKU分别捆绑贴标
            </div>
            <div
              v-for="(item, index) in row.jitOrderMapperProductDTO
                .jITProductInfoDTOList"
              :key="`jit-${index}`"
              class="content-item"
            >
              <p>1、速卖通标签SKU：{{ item.mappingSku }}</p>
              <template v-if="!$common.isEmpty(item.productGoodsInfoDTOList)">
                <p
                  v-for="(row, rIndex) in item.productGoodsInfoDTOList"
                  :key="`p-${rIndex}`"
                >
                  对应LAPA SKU：{{ row.productSku }} 件数 * {{ row.quantity }}
                </p>
              </template>
            </div>
          </div>
        </template>
      </div>
      <Input
        :id="inputID"
        @on-enter="modalConfirm"
        style="
          opacity: 0;
          position: absolute;
          top: 50px;
          left: 0px;
          z-index: -10;
        "
      ></Input>
      <div slot="footer" style="text-align: center">
        <Button type="primary" @click="modalConfirm">我知道了（回车）</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
// import productAdditionOperation from './productAdditionOperation.vue';
export default {
  name: "JITModaVerify",
  components: {},
  props: {
    modelVisible: {
      type: Boolean,
      default() {
        return false;
      },
    },
    modelData: {
      type: Array,
      default: () => {
        return [];
      },
    },
    encasementBoxNo: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      isVisible: false,
      inputID: "",
      timer: null,
      timeNum: 0,
    };
  },
  watch: {
    modelVisible: {
      deep: true,
      immediate: true,
      handler(val) {
        this.isVisible = val;
        this.$nextTick(() => {
          this.initModelData(val);
        });
      },
    },
    isVisible: {
      deep: true,
      immediate: true,
      handler(val) {
        if (val) return;
        this.$emit("update:modelVisible", val);
        this.clearTime();
      },
    },
  },
  computed: {
    modalTitle() {
      if (this.$common.isEmpty(this.encasementBoxNo)) return "包装提示";
      return `包装提示，篮子编号: ${this.encasementBoxNo}`;
    },
  },
  methods: {
    // 窗口打开
    initModelData(val) {
      if (!val) return;
      this.inputID = "inputs" + new Date().getTime() + Math.random() * 10000;
      this.keepInputFocus();
    },
    // 确认
    modalConfirm() {
      this.isVisible = false;
      this.$nextTick(() => {
        this.$emit("closeJITModal", {});
      });
    },
    // 保持input框光标聚焦（因作业扫描流程最终老是sku光标聚焦，所以这里要一直保持光标是聚焦的，直至一分钟后停止定时器）
    keepInputFocus() {
      let inputDom = null;
      let dom = null;
      const fun = () => {
        this.timeNum++;
        inputDom = document.getElementById(this.inputID);
        dom = inputDom ? inputDom.querySelector("input") : null;
        if (!dom) return;
        if (this.timeNum >= 300) this.clearTime();
        dom.focus();
      };
      fun();
      this.timer = setInterval(fun, 200);
    },
    clearTime() {
      clearInterval(this.timer);
      this.timeNum = 0;
    },
  },
};
</script>
<style lang="less">
.JITModaVerify {
  .ivu-modal-mask {
    background-color: rgba(55, 55, 55, 0.4);
  }
  .ivu-modal-body {
    padding: 0;
    margin: 0;
  }
}
.JITModaVerify-content {
  position: relative;
  max-height: 60vh;
  overflow: auto;
  .row-content {
    padding-bottom: 15px;
    &.row-content-line {
      border-top: 1px solid #e8eaec;
    }
  }

  .content-head {
    position: sticky;
    top: 0;
    padding: 16px;
    font-size: 16px;
    font-weight: bold;
    background: #fff;
  }
  .content-item {
    padding: 0 16px 16px 16px;
    font-size: 18px;
    font-weight: bold;
  }
}

@media only screen and (max-height: 850px) {
  .JITModaVerify .ivu-modal {
    transform: translateY(-30%);
  }
}

@media only screen and (max-height: 785px) {
  .JITModaVerify .ivu-modal {
    transform: translateY(-20%);
  }
}

@media only screen and (max-height: 720px) {
  .JITModaVerify .ivu-modal {
    transform: translateY(-10%);
  }
}
</style>