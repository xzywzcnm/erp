<template>
  <dyt-model
    :modalVisible.sync="modalVisible"
    @backList="backList"
    :pageLoading="pageLoading"
  >
    <div slot="lefts">
      <Button class="ml10" @click="modalVisible = false">关闭</Button>
    </div>

    <Form
      ref="formCustom"
      :model="orderDetail"
      :label-width="110"
      :inline="true"
      class="detail-form"
    >
      <div class="stock-block">
        <div class="title">基本信息</div>
        <div>
          <FormItem label="货箱编号:">
            <span>{{ orderDetail.containerNumber || "" }}</span>
          </FormItem>
          <FormItem label="店铺:">
            <span>{{ orderDetail.accountCode }}</span>
          </FormItem>
          <FormItem label="状态:">
            <span v-if="statusList[orderDetail.status]">
              {{ statusList[orderDetail.status].label }}
            </span>
          </FormItem>
          <FormItem label="收货仓库:">
            <span>{{ orderDetail.warehouseCode }} {{ orderDetail.warehouseName }}</span>
          </FormItem>
          <FormItem label="创建时间:">
            <span v-if="orderDetail.createdTime">{{
              $uDate.getDataToLocalTime(orderDetail.createdTime, "fulltime")
            }}</span>
          </FormItem>
          <FormItem label="完成装箱时间:">
            <span v-if="orderDetail.packingCompletionTime">{{
              $uDate.getDataToLocalTime(orderDetail.packingCompletionTime, "fulltime")
            }}</span>
          </FormItem>
          <FormItem label="揽收单号:">
            <span>{{ orderDetail.pickupOrderNumber || "" }}</span>
          </FormItem>
        </div>
      </div>

      <div class="stock-block">
        <div class="title">明细信息</div>
        <div>
          <Table
            border
            highlight-row
            :columns="columns"
            :data="orderDetail.wmsAliexpressPickupOrderDetailList || []"
          >
          </Table>
        </div>
      </div>
    </Form>
  </dyt-model>
</template>
<script>
import api from "@/api/api";
import { getWarehouseId } from "@/utils/getService";
import { statusList } from "./fileData";
export default {
  name: "searchDetail",
  props: {
    dialogVisible: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  data() {
    return {
      modalVisible: false,
      pageLoading: false,
      columns: [
        {
          type: "index",
          title: "行号",
          align: "center",
          width: 70,
        },
        {
          title: "速卖通平台采购单号",
          align: "center",
          key: "purchaseOrderNo",
          minWidth: 120,
        },
        {
          title: "出库单号",
          align: "center",
          key: "packageCode",
          minWidth: 140,
          render: (h, { row }) => {
            return h(
              "div",
              {
                style: {
                  position: "relative",
                  display: "inline-block",
                },
              },
              [
                h("span", row.packageCode),
                h(
                  "span",
                  {
                    style: {
                      position: "absolute",
                      left: "-100%",
                      color: "#ed4014",
                      top: "50%",
                      transform: "translateY(-50%)",
                      display: [99, "99"].includes(row.packageStatus) ? "block" : "none",
                    },
                  },
                  "已作废"
                ),
              ]
            );
          },
        },
        {
          title: "物流单号",
          align: "center",
          key: "trackingNumber",
          minWidth: 120,
          tooltip: true,
        },
      ],
      orderDetail: {},
      statusList: statusList,
    };
  },
  watch: {
    dialogVisible: {
      handler(nval, oval) {
        nval && this.open();
      },
      deep: true,
    },
    modalVisible: {
      handler(nval, oval) {
        !nval && this.$emit("update:dialogVisible", nval);
      },
      deep: true,
    },
  },
  methods: {
    // 窗口打开
    open() {
      this.orderDetail = {};
      this.modalVisible = true;
      this.init();
    },
    // 关闭窗口
    backList() {
      this.modalVisible = false;
    },
    // 初始化
    init() {
      this.pageLoading = true;
      this.$common
        .allSettled([() => this.getDetail()])
        .then((results) => {
          results.forEach((item, index) => {
            if (item.status != "fulfilled") return;
            let data = item.value.data || {};
            index === 0 && (this.orderDetail = data.datas || {});
          });
        })
        .finally(() => {
          this.pageLoading = false;
        });
    },
    // 获取出库单详情
    getDetail() {
      let { containerNumber, saleAccountId } = this.data;
      return this.axios.post(
        `${api.packing_queryDetail}?containerNumber=${
          containerNumber || ""
        }&saleAccountId=${saleAccountId || ""}&warehouseId=${getWarehouseId()}`
      );
    },
  },
};
</script>
