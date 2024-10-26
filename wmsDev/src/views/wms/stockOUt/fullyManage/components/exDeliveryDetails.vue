<template>
  <div>
    <Modal v-model="isVisible" :title="modalTitle" width="1300px" :mask-closable="false" :closable="modalClose"
      class="mulUploadFilesPage formDetail">
      <div>
        <logisticsInfo ref="logisticsInfo" :data="modalData" isEdit="detail" v-if="isVisible" />
        <div class="flexCenter mt10">
          <div style="border-left: 4px solid #2d8cf0;padding-left: 8px;" class="mb10 mr20">出库单信息</div>
          <Alert type="error" style="display: inline-block; padding: 8px">
            注意：以下出库单，使用同一个快递单号一起发货，请找齐所有包裹一起交货给快递；
          </Alert>
        </div>
        <Form ref="tableForm" :model="formData" :label-width="0" class="fmb0">
          <Table highlight-row border :columns="columns" :data="formData.tableList" height="500" :loading="tableLoading"
            class="negativeDistance">
          </Table>
        </Form>
      </div>
      <div slot="footer">
        <Button @click="isVisible = false">取消</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from "@/api/api";
import {
  arrayToObj,
  statusReturn,
  outListTypeList,
  orderTypeList,
} from "./fileData";
import tableImg_mixin from "@/components/mixin/tableImg_mixin";
import logisticsInfo from "./logisticsInfo";
export default {
  name: "mulUploadFiles",
  mixins: [tableImg_mixin],
  components: { logisticsInfo },
  props: {
    modelVisible: {
      type: Boolean,
      default() {
        return false;
      },
    },
    modalData: {
      type: Object,
      default() {
        return {};
      },
    },
    // 标题
    title: { type: String, default: '' }
  },
  data() {
    let v = this;
    return {
      isVisible: false,
      formData: {
        tableList: [],
      },
      platformList: arrayToObj(outListTypeList),
      orderTypeList: arrayToObj(orderTypeList),
      columns: [
        {
          title: "全托管出库单",
          align: "left",
          minWidth: 200,
          render: (h, { row }) => {
            let pickingItem = statusReturn(row.pickingNewStatus);
            let platformItem = this.platformList[row.platformType] || {};
            let list = [
              h(
                "div",
                {
                  style: {
                    padding: "4px 0",
                  },
                },
                [
                  h("span", "单号："),
                  h(
                    "span",
                    {
                      on: {
                        click: () => {
                          // if (!power) return;
                          v.seeDetail(row, "detail");
                        },
                      },
                    },
                    row.pickingNo
                  ),
                ]
              ),
            ];
            if (pickingItem.label) {
              list.push(
                h(
                  "Tag",
                  {
                    props: { color: "green" },
                    attrs: { title: "出库单状态" },
                  },
                  pickingItem.label
                )
              );
            }
            if (platformItem.label) {
              list.push(
                h(
                  "Tag",
                  {
                    props: { color: "magenta" },
                    attrs: { title: "平台主体" },
                  },
                  platformItem.label
                )
              );
            }
            if (row.saleAccount) {
              list.push(
                h(
                  "Tag",
                  {
                    props: { color: "purple" },
                    attrs: { title: "店铺" },
                  },
                  row.saleAccount
                )
              );
            }
            if (v.orderTypeList[row.orderType]) {
              list.push(
                h(
                  "Tag",
                  {
                    props: { color: row.orderType == 1 ? "red" : "blue" },
                    attrs: { title: "订单类型" },
                  },
                  v.orderTypeList[row.orderType].label
                )
              );
            }
            return h(
              "div",
              {
                style: {
                  padding: "4px 0",
                },
              },
              list
            );
          },
        },
        {
          title: "平台订单/参考编号",
          align: "left",
          minWidth: 140,
          render(h, { row }) {
            return h("div", {}, [
              h("div", row.platformOrderNo || "-"),
              h("div", row.referenceNo || "-"),
            ]);
          },
        },
        {
          title: "图片",
          align: "left",
          width: 90,
          render: (h, params) => {
            return v.tableImg(h, params.row.goodsUrl);
          },
        },
        {
          title: "SKU数量",
          align: "left",
          width: 90,
          key: "skuNumber",
        },
        {
          title: "商品数量",
          align: "left",
          width: 90,
          key: "allExpectedNumber",
        },
        {
          title: "备注",
          minWidth: 110,
          align: "left",
          render: (h, { row }) => {
            let list = row.fbaRemark ? row.fbaRemark.split("\n") : [];
            let [renderList] = [[]];
            list.forEach((k) => {
              k && renderList.push(h("div", k));
            });
            return h(
              "Tooltip",
              {
                props: {
                  transfer: true,
                  placement: "top",
                  maxWidth: "400",
                  "transfer-class-name": "self-tooltip",
                },
                attrs: {
                  class: "textOverTwo",
                },
                style: {
                  display: renderList.length ? "inline-block" : "none",
                },
              },
              [
                h("div", renderList),
                h(
                  "div",
                  {
                    slot: "content",
                  },
                  renderList
                ),
              ]
            );
          },
        },
        {
          title: "发货数量",
          align: "left",
          width: 90,
          key: "allDoneDeliveredNumber",
        },
        {
          title: "创建人",
          align: "left",
          width: 120,
          render: (h, { row }) => {
            return h("div", [
              h("div", row.createdName),
              h("div", row.businessUnit),
            ]);
          },
        },
        {
          title: "创建时间",
          align: "left",
          width: 90,
          render: (h, { row }) => {
            return h(
              "div",
              row.createdTime ? v.$uDate.dealTime(row.createdTime) : ""
            );
          },
        },
      ],
      tableLoading: false,
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
        this.$emit("update:modelVisible", false);
      },
      deep: true,
    },
  },
  computed: {
    modalClose() {
      return !this.$store.getters.getSelfPreviewDialog;
    },
    modalTitle() {
      if (this.$common.isEmpty(this.title)) return '批量上传文件';
      return this.title;
    },
  },
  methods: {
    // 窗口打开
    open() {
      this.resetData();
      this.getDetail();
      this.isVisible = true;
    },
    resetData() {
      this.formData.tableList = [];
    },
    // 获取出库单详情数据
    getDetail() {
      let { expressDeliveryNumber } = this.modalData;
      this.tableLoading = true;
      this.axios
        .get(api.fullManage_queryByExpressDelivery, { params: { expressDeliveryNumber } })
        .then(({ data }) => {
          if (data.code !== 0) return;
          this.formData.tableList = data.datas || [];
        })
        .finally(() => {
          this.tableLoading = false;
        });
    },
  },
};
</script>
