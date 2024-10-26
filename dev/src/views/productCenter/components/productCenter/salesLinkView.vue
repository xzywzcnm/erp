<template>
  <div class="sales-link-view">
    <Spin v-if="pageLoading" fix></Spin>
    <Table
      v-if="pageVisible"
      :border="true"
      :max-height="700"
      :columns="tableColumns"
      :data="salesLinkData"
      :span-method="rowOrColMergeHand"
    />
  </div>
</template>
<script>

export default {
  name: "salesLinkView",
  components: {},
  props: {
    moduleVisible: { type: Boolean, default: false },
    moduleData: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      pageLoading: false,
      pageVisible: false,
      platformJson: {
        temux: { name: 'Temu半托管', platformId: 'temux' },
        sheinx: { name: 'Shein半托管', platformId: 'sheinx' }
      },
      tableColumns: [
        {
          title: 'SKU',
          key: 'productGoodsId',
          width: 200,
          align: 'center',
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.productGoodsId)) return h('div', {}, '');
            if (this.$common.isEmpty(this.productGoodsJson[row.productGoodsId])) return h('div', {}, row.productGoodsId);
            return h('div', {}, this.productGoodsJson[row.productGoodsId].sku || row.productGoodsId);
          }
        },
        {
          title: '平台',
          key: 'platformId',
          width: 150,
          align: 'center',
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.platformId)) return h('div', {}, '');
            if (this.$common.isEmpty(this.platformJson[row.platformId])) return h('div', {}, row.platformId);
            return h('div', {}, this.platformJson[row.platformId].name);
          }
        },
        {
          title: '销售链接',
          key: 'platformUrl',
          minWidth: 300,
          align: 'center',
          render: (h, { row }) => {
            return h('div', {}, row.platformUrl);
          }
        },
      ]
    };
  },
  watch: {
    moduleVisible: {
      immediate: true,
      deep: true,
      handler (val) {
        this.pageLoading = true;
        this.$nextTick(() => {
          setTimeout(() => {
            this.pageVisible = val;
            this.pageLoading = false;
          }, 100)
        })
      }
    }
  },
  computed: {
    // 商品SKU信息
    productGoodsJson () {
      let newJson = {};
      if (this.$common.isEmpty(this.moduleData) || this.$common.isEmpty(this.moduleData.productGoodsList)) return newJson;
      this.moduleData.productGoodsList.forEach(item => {
        newJson[item.productGoodsId] = item;
      });
      return newJson;
    },
    // 销售链接信息
    salesLinkData () {
      if (this.$common.isEmpty(this.moduleData) || this.$common.isEmpty(this.moduleData.list)) return [];
      let obj = {};
      // 将相同的 sku 合并
      this.moduleData.list.forEach(row => {
        if (this.$common.isUndefined(obj[row.productGoodsId])) {
          obj[row.productGoodsId] = [row];
        } else {
          obj[row.productGoodsId].push(row);
        }
      });
      let newList = [];
      Object.keys(obj).forEach(key => {
        obj[key].forEach((row, index) => {
          if (index == 0) {
            newList.push({ ...row, rowspan: obj[key].length, colspan: 1, mergeColIndex: [0] });
          } else {
            newList.push({ ...row, rowspan: 0, colspan: 0, mergeColIndex: [0] });
          }
        })
      });
      return newList;
    }
  },
  created() {},
  methods: {
    // 列表行列合并处理
    rowOrColMergeHand ({ row, column, rowIndex, columnIndex }) {
      if (row.mergeColIndex.includes(columnIndex)) {
        return { rowspan: row.rowspan, colspan: row.colspan };
      }
      return { rowspan: 1, colspan: 1 };
    }
  }
};
</script>
<style lang="less" scoped>
.sales-link-view {
  position: relative;
  margin: 15px 10px 10px 10px;
  max-height: calc(100% - 25px);
  overflow: auto;
}
</style>
