<template>
  <div>
    <Modal v-model="isVisible" title="打印第三方标签" :width="1000" :mask-closable="false" class="thirdLabels-fully">
      <div>
        <div class="printSkuCode_printBtn">
          <div>
            打印列表
            <Button @click="batchDelete">删除选中</Button>
          </div>
          <div>
            <div class="printSkuCode_printBtn_numset">
              <span class="mr10">统一设置打印数量</span>
              <InputNumber :min="1" @on-change="uniteSetAmount" size="small" v-model="printAmount"></InputNumber>
            </div>
          </div>
        </div>
        <Table highlight-row border :columns="columns" :data="tableList" @on-selection-change="changeTable"
          max-height="365" ref="printTable" class="negativeDistance">
        </Table>
      </div>
      <div slot="footer">
        <Button type="primary" @click="submitProblem" :disabled="btnLoading" v-if="tableList.length">打印</Button>
        <Button @click="isVisible = false">取消</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import Big from "big.js";
import common from "@/components/mixin/common_mixin";
export default {
  name: "qualityProblemProducts",
  mixins: [common],
  props: {
    dialogVisible: {
      type: Boolean,
      default() {
        return false;
      },
    },
    list: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  data() {
    const v = this;
    return {
      isVisible: false,
      printAmount: 1,
      tableList: [],
      // 打印参数
      columns: [
        {
          type: "selection",
          width: 60,
          align: "center",
        },
        {
          title: "平台SKU",
          align: "center",
          key: "platformSku",
          minWidth: 90,
        },
        {
          title: "条码编码",
          align: "center",
          key: "barCode",
          minWidth: 100,
        },
        {
          title: "属性集",
          align: "center",
          key: "attributes",
          minWidth: 110,
        },
        {
          title: "图片",
          align: "center",
          width: 80,
          render: (h, params) => {
            return this.tableImg(h, params, "goodsUrl");
          },
        },
        {
          title: "SKU",
          align: "center",
          key: "goodsSku",
          minWidth: 90,
        },
        {
          title: "商品名称",
          align: "center",
          key: "goodsCnDesc",
          minWidth: 150,
        },
        {
          title: "打印数量",
          align: "center",
          width: 100,
          render: (h, { row, index }) => {
            return h("Input", {
              props: {
                size: "small",
                value: v.tableList[index].printNumber,
              },
              on: {
                "on-change": (e) => {
                  v.$set(v.tableList[index], "printNumber", e.target.value);
                },
              },
            });
          },
        },
        {
          title: "操作",
          align: "center",
          width: 60,
          render: (h, params) => {
            return h(
              "div",
              {
                style: {
                  width: "22px",
                  height: "22px",
                },
                on: {
                  click: () => {
                    v.tableList.splice(params.index, 1);
                  },
                },
              },
              [
                h(
                  "Icon",
                  {
                    attrs: {},
                    props: {
                      type: "ios-trash",
                    },
                    style: {
                      fontSize: "24px",
                      cursor: "pointer",
                      width: "22px",
                      height: "22px",
                    },
                  },
                  "删除"
                ),
              ]
            );
          },
        },
      ],
      btnLoading: false, // 表单提交加载
      checkData: [],
    };
  },
  watch: {
    dialogVisible: {
      handler(val) {
        val && this.open();
      },
      deep: true,
    },
    isVisible: {
      handler(val) {
        if (val) return;
        this.$emit("update:dialogVisible", val);
      },
      deep: true,
    },
  },
  methods: {
    // 窗口打开
    open() {
      this.resetData();
      this.isVisible = true;
      this.$nextTick(() => {
        this.tableList = this.$common.copy(this.list);
        this.tableList.forEach((item, key) => {
          // 最大值=待装箱数-已装箱数;
          const maxNum = new Big(item.waitQuantitySum || 0).minus(item.quantitySum || 0) - 0;
          this.$set(this.tableList[key], "printNumber", maxNum || 1);
        });
      });
    },
    resetData() {
      this.tableList = [];
      this.checkData = [];
      this.printAmount = 1;
    },
    changeTable(data) {
      this.checkData = data.map((i) => {
        return i.productGoodsId;
      });
    },
    // 删除选中
    batchDelete() {
      let list = this.checkData;
      if (!list.length) {
        this.$Message.warning("请选择要删除的数据!");
        return;
      }
      this.tableList = this.tableList.filter((k) => {
        return !list.includes(k.productGoodsId);
      });
      this.checkData = [];
      this.$refs.printTable.selectAll(false);
    },
    uniteSetAmount(num) {
      this.tableList.forEach((k, i) => {
        this.$set(this.tableList[i], "printNumber", num);
      });
    },
    // 打印
    submitProblem() {
      if (!this.tableList.length) {
        this.$Message.error("打印数据为空~");
        return;
      }
      this.$emit("thirdLabelPrint", this.tableList);
      this.isVisible = false;
    },
  },
};
</script>

<style lang="less">
.thirdLabels-fully {
  .printSkuCode_printBtn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 8px;
    background-color: #f2f2f2;

    .printSkuCode_printBtn_numset {
      display: flex;
      align-items: center;
    }
  }
}
</style>
