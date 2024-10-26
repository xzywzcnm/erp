<template>
  <div class="assignPage">
    <Table
      highlight-row
      border
      :columns="columns"
      :data="tableList"
      max-height="300"
    ></Table>
  </div>
</template>

<script>
export default {
  name: "assignPage",
  data() {
    return {
      columns: [
        {
          title: "产品sku",
          align: "center",
          key: "goodsSku",
          minWidth: 100
        },
        {
          title: "中文描述",
          align: "center",
          key: "goodsCnDesc",
          minWidth: 100,
          render: (h, params) => {
            return h(
              "Poptip",
              {
                props: {
                  content: params.row.goodsCnDesc,
                  trigger: "hover",
                },
              },
              [h("span", {}, params.row.goodsCnDesc)]
            );
          },
        },
        {
          title: "英文描述",
          align: "center",
          key: "goodsEnDesc",
          minWidth: 100,
          render: (h, params) => {
            return h(
              "Poptip",
              {
                props: {
                  content: params.row.goodsEnDesc,
                  trigger: "hover",
                },
              },
              [h("span", {}, params.row.goodsEnDesc)]
            );
          },
        },
        {
          title: "分配批次",
          align: "center",
          key: "receiptBatchNo",
          minWidth: 100,
        },
        {
          title: "分配库位",
          align: "center",
          key: "warehouseLocationName",
          minWidth: 100,
        },
        {
          title: "分配数量",
          align: "center",
          key: "batchNumber",
          minWidth: 100,
        },
        {
          title: "分配完成时间",
          align: "center",
          minWidth: 100,
          render: (h, { row }) => {
            return h("div", row.createdTime ? this.$uDate.dealTime(row.createdTime) : "");
          },
        },
        {
          title: "操作人",
          align: "center",
          key: "createdBy",
          minWidth: 100,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.createdBy)) return h('span', '');
            if (this.$common.isEmpty(this.userListData[row.createdBy])) return h('span', row.createdBy);
            return h('span', this.userListData[row.createdBy].userName || '');
          }
        },
      ],
    };
  },
  props: {
    data: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  computed: {
    tableList() {
      return this.data.queryPickingBatchResult || [];
    },
    // 用户列表
    userListData () {
      return this.$store.state.userInfoList;
    },
  },
  methods: {},
};
</script>

<style lang="less">
// .assignPage {}
</style>
