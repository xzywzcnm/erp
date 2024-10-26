<template>
  <dyt-model
    :modalVisible.sync="modalVisible"
    @backList="backLists"
    :pageLoading="pageLoading"
    class="unfreezeModelPage"
  >
    <div slot="lefts">
      <Button
        type="primary"
        @click="unfreezeBtn"
        :disabled="freezeDisabled"
        :loading="btnLoading"
        >解除冻结</Button
      >
      <Button class="ml10" @click="backLists">取消</Button>
    </div>
    <div class="mt10">
      <Table
        highlight-row
        border
        :columns="columns"
        :data="tableList"
        ref="selection"
      ></Table>
    </div>
  </dyt-model>
</template>

<script>
import Big from "big.js";
import api from "@/api/api";
export default {
  name: "unfreezeModel",
  props: {
    modelVisible: {
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
      columns: [
        {
          title: "冻结单编号",
          key: "inventoryFrozenNo",
          align: "center",
          minWidth: 100,
        },
        {
          title: "图片",
          width: 80,
          align: "center",
          render: (h, params) => {
            return v.tableImg(h, params, "goodsUrl");
          },
        },
        {
          title: "SKU",
          key: "goodsSku",
          align: "center",
          minWidth: 90,
        },
        {
          title: "批次号",
          key: "receiptBatchNo",
          align: "center",
          minWidth: 100,
        },
        {
          title: "库位",
          key: "warehouseLocationName",
          align: "center",
          minWidth: 90,
        },
        {
          title: "中英文描述",
          align: "center",
          minWidth: 130,
          render: (h, { row }) => {
            return h("div", [
              h("div", row.goodsCnDesc || "-"),
              h("div", row.goodsEnDesc || "-"),
            ]);
          },
        },
        {
          title: "原库存数量",
          key: "oriInventoryNumber",
          align: "center",
          width: 100,
        },
        {
          title: "原分配数量",
          key: "oriAllottedNumber",
          align: "center",
          width: 100,
        },
        {
          title: "原冻结数量",
          key: "oriFrozenNumber",
          align: "center",
          width: 100,
        },
        {
          title: "原可用数量",
          key: "oriUsableNumber",
          align: "center",
          width: 100,
        },
        {
          title: "冻结数量",
          key: "frozenInventoryNumber",
          align: "center",
          width: 100,
        },
        {
          title: "已解冻数量",
          key: "thawNumber",
          align: "center",
          width: 100,
        },
        {
          title: "本次解冻数量",
          key: "unThawNumber",
          align: "center",
          width: 110,
          render: (h, params) => {
            return h("div", [
              h("InputNumber", {
                props: {
                  size: "small",
                  min: 0,
                  max: params.row.CopyUnThawNumber,
                  value: params.row.unThawNumber,
                },
                style: {
                  marginRight: "5px",
                },
                on: {
                  "on-change": (value) => {
                    v.$set(v.tableList[params.index], "unThawNumber", value);
                  },
                },
              }),
            ]);
          },
        },
      ],
      pageLoading: false,
      modalVisible: false,
      btnLoading: false,
      tableList: [],
    };
  },
  watch: {
    modelVisible: {
      handler(val) {
        val && this.open();
      },
      deep: true,
    },
    modalVisible: {
      handler(val) {
        if (!val) {
          this.$emit("update:modelVisible", val);
        }
      },
      deep: true,
    },
  },
  computed: {
    freezeDisabled() {
      return !!!this.tableList.filter((k) => k.unThawNumber > 0).length;
    },
  },
  methods: {
    // 窗口打开
    open() {
      this.modalVisible = true;
      this.searchData();
    },
    // 关闭窗口
    backLists() {
      this.modalVisible = false;
    },
    // 页面查询
    searchData() {
      let list = this.list.map((k) => k.inventoryFrozenNo);
      this.pageLoading = true;
      this.axios
        .post(api.queryAllDetail, list)
        .then(({ data }) => {
          if (data.code === 0) {
            this.tableList = (data.datas || []).map((k) => {
              // 本次解冻商品数量：最大解冻数量=冻结数量-已解冻数量；
              let unThawNumber =
                new Big(k.frozenInventoryNumber || 0).minus(k.thawNumber || 0) -
                0;
              k.CopyUnThawNumber = unThawNumber;
              k.unThawNumber = unThawNumber;
              return k;
            });
          }
        })
        .finally(() => {
          this.pageLoading = false;
        });
    },
    // 解除冻结
    unfreezeBtn() {
      let list = [];
      this.tableList.forEach((k) => {
        if (k.unThawNumber > 0) {
          list.push({
            inventoryFrozenNo: k.inventoryFrozenNo,
            inventoryFrozenDetailId: k.inventoryFrozenDetailId,
            unfreezeInventoryNumber: k.unThawNumber,
          });
        }
      });
      this.btnLoading = true;
      this.axios
        .post(api.newBatchCancelFrozen, list)
        .then((res) => {
          if (res.data.code === 0) {
            this.$Message.success("操作成功");
            this.$emit("search");
            this.backLists();
          }
        })
        .finally(() => {
          this.btnLoading = false;
        });
    },
    // 图片处理
    tableImg(h, params, imgKey, imageUrl) {
      let v = this;
      let imgUrl = imageUrl || params.row[imgKey];
      return h(
        "Poptip",
        {
          props: {
            placement: "right",
            trigger: "hover",
            transfer: true,
          },
          style: {
            width: "46px",
            height: "46px",
            objectFit: "cover",
            verticalAlign: "middle",
          },
        },
        [
          h("div", {}, [
            h("img", {
              attrs: {
                src: imageUrl
                  ? imgUrl
                  : !imgUrl
                  ? "./static/images/placeholder.jpg"
                  : v.$store.state.imgUrlPrefix + imgUrl,
                onerror:
                  "javascript:this.src='./static/images/placeholder.jpg'",
              },
              style: {
                width: "46px",
                height: "46px",
                objectFit: "cover",
                verticalAlign: "middle",
                cursor: "pointer",
              },
            }),
          ]),
          !imgUrl ||
            h("img", {
              slot: "content",
              props: {},
              attrs: {
                src: imageUrl
                  ? imgUrl
                  : !imgUrl
                  ? "./static/images/placeholder.jpg"
                  : v.$store.state.imgUrlPrefix + imgUrl,
              },
              style: {
                width: "400px",
                height: "auto",
                verticalAlign: "middle",
              },
            }),
        ]
      );
    },
  },
};
</script>

<style lang="less"></style>
