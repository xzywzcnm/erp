<template>
  <div>
    <Modal v-model="isVisible" title="最小起订量或倍数备货校验失败" :width="1000" :mask-closable="false">
      <Table highlight-row border :columns="columns" :data="tableList" max-height="500"></Table>
      <div slot="footer">
        <Button type="primary" @click="handleData" :loading="loading">修改并提交</Button>
        <Button type="error" @click="skipVerification" :loading="loading">跳过该校验</Button>
        <Button @click="isVisible = false">关闭</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import tableImg_mixin from "@/components/mixin/tableImg_mixin";
export default {
  name: "validStockNum",
  mixins: [tableImg_mixin],
  props: {
    dialogVisible: {
      type: Boolean,
      default() {
        return false;
      },
    },
    list: {
      type: Array,
      default: () => { return [] },
    },
  },
  data() {
    const self = this;
    return {
      isVisible: false,
      loading: false,
      columns: [
        {
          title: "图片",
          align: "center",
          width: 90,
          render: (h, params) => {
            return self.tableImg(h, params, "thumbUrl");
          },
        },
        {
          title: "SKU",
          key: "skuNo",
          align: "center",
          width: 120,
        },
        {
          title: "名称规格",
          align: "center",
          width: 200,
          render: (h, { row }) => {
            let spec = "";
            if (row.productGoodsSpecifications) {
              spec = row.productGoodsSpecifications.map((i) => i.name + ":" + i.value).join(",");
            }
            return [
              row.goodsName
                ? h(
                  "span",
                  {
                    style: {
                      display: "inline-block",
                      borderTop: row.skuNo ? "1px solid #dddee1" : "",
                    },
                  },
                  row.goodsName
                )
                : "",
              h(
                "p",
                {
                  style: {
                    color: "green",
                  },
                },
                spec
              ),
            ];
          },
        },
        {
          title: "最小起订量",
          key: "minOrderQuantity",
          align: "center",
          width: 100,
        },
        {
          title: "倍数备货值",
          key: "stockMultiple",
          align: "center",
          width: 100,
        },
        {
          title: "异常",
          align: "center",
          key: "errorMessage",
          render: (h, { row }) => {
            return h('div', {
              style: {
                color: row.valid ? 'red' : '#515a6e'
              }
            }, row.errorMessage || '')
          },
        },
        {
          title: "备货数量",
          align: "center",
          width: 140,
          render: (h, params) => {
            return [
              h(
                "span",
                {
                  style: {
                    display: "inline-block",
                    verticalAlign: "middle",
                    width: "65%",
                  },
                },
                [
                  h("InputNumber", {
                    props: {
                      value: params.row.replenishQuantity,
                      min: 1,
                      max: 99999999,
                    },
                    style: {
                      width: "100%",
                    },
                    on: {
                      "on-change": (val) => {
                        self.tableList[params.index].replenishQuantity = val;
                      },
                    },
                  }),
                ]
              ),
            ];
          },
        },
      ],
      tableList: [],
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
      this.tableList = this.$common.copy(this.list).map(k => {
        k.valid = false;
        return k;
      });
      this.isVisible = true;
    },
    handleData() {
      // // m 是否能被 n 除尽
      // function judgeDivisor(m, n) {
      //   if ([0, '0'].includes(n)) return true;
      //   let num = {};
      //   let i = 0;
      //   m = m % n;
      //   while (m != 0 && !(m in num)) {
      //     num[m] = i++;
      //     m = m * 10 % n;
      //   }
      //   return m == 0;
      // }
      // 需要备货的商品数量，需要大于等于产品报价的最小起订量且能被倍数备货值除尽
      let flag = false;
      this.tableList.forEach((k, i) => {
        const stockMultiple = k.stockMultiple || 0;
        const minOrderQuantity = k.minOrderQuantity || 0;
        const replenishQuantity = k.replenishQuantity || 0;
        let subNum = this.$common.sub(replenishQuantity, minOrderQuantity);
        let isDivisor = this.isDivisible(replenishQuantity, stockMultiple);
        let errorMessage = null;
        if (subNum < 0) errorMessage = '不满足最小起订量';
        if (!errorMessage && !isDivisor) errorMessage = '不满足倍数备货值';
        this.$set(this.tableList[i], 'errorMessage', errorMessage);
        this.$set(this.tableList[i], 'valid', subNum < 0 || !isDivisor);
        if (!flag) flag = subNum < 0 || !isDivisor;
      })
      if (flag) return;
      this.$emit('validSuccess', this.tableList, 'valid');
      this.isVisible = false;
    },
    skipVerification() {
      this.$emit('validSuccess', this.tableList,'skip',);
      this.isVisible = false;
    },
    isDivisible(dividend, divisor) {
      if (divisor === 0) return true;
      return dividend % divisor === 0;
    },
  },
};
</script>