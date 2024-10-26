<template>
  <div class="pickListDtl">
    <div>
      <Icon type="ios-arrow-back"></Icon>
      <a href="javascript:;" style="color: #657180" @click="backList">返回列表</a>
    </div>
    <Card :bordered="false" class="formDetail">
      <p slot="title">拣货单详情</p>

      <Form :label-width="100" inline class="formWidth240 fmb0">
        <FormItem label="拣货单号：">
          <span>{{ detailInfo.pickingGoodsNo }}</span>
        </FormItem>
        <FormItem label="拣货单类型：">
          <span>{{ detailInfo.packageGoodsType }}</span>
        </FormItem>
        <FormItem label="拣货单状态：">
          <span>{{ detailInfo.packageGoodsStatus }}</span>
        </FormItem>
        <FormItem label="是否打印：">
          <span>{{ detailInfo.print }}</span>
        </FormItem>
        <FormItem label="拣货提醒：">
          <span>{{ detailInfo.remark }}</span>
        </FormItem>
        <FormItem label="是否要质检：">
          <span>{{ detailInfo.qualityCheck ? "是" : "否" }}</span>
        </FormItem>
        <FormItem label="打印拣货单" v-if="getPermission('wmsPickingGoods_print') ||
          getPermission('wmsPickingGoods_print_other')
          ">
          <a href="javascript:;" @click="printList">点击前往</a>
        </FormItem>
        <FormItem label="拣货仓库：">
          <span>{{ detailInfo.warehouseName }}</span>
        </FormItem>
        <FormItem label="创建时间：">
          <span>{{ detailInfo.createdTime }}</span>
        </FormItem>
        <FormItem label="创建人员：">
          <span>{{ detailInfo.createdBy }}</span>
        </FormItem>
        <FormItem label="产品类型：">
          <span>{{
            productTypeList[detailInfo.pickingGoodsProductType] &&
            productTypeList[detailInfo.pickingGoodsProductType].label
          }}</span>
        </FormItem>
      </Form>
    </Card>
    <!--工具栏-->
    <div class="tool">
      <Button-group style="margin-right: 10px">
        <Button :type="item.check ? 'primary' : 'default'" v-for="item in watchTypeData" @click="clickTypeButton(item)"
          :key="item.value">{{ item.label }}
        </Button>
      </Button-group>
      <div v-if="formItem.type === '0'" style="display: inline-block">
        <Input v-model.trim="formItem.sku" style="width: 300px" placeholder="输入出库单号查找"></Input>
        <Button type="primary" @click="btnSearch" class="ml10">查询</Button>
      </div>

      <!-- 海外仓出库单增加sku查询 -->
      <div v-if="formItem.type === '1'" style="display: inline-block">
        <Input v-model.trim="skuNo" style="width: 300px" placeholder="输入SKU查找" clearable></Input>
        <Button type="primary" @click="skuSearch" class="ml10">查询</Button>
      </div>
    </div>
    <!--表格-->
    <div class="tableMain">
      <dTable highlight-row border :columns="columns" :data="data"></dTable>
      <Spin size="large" fix v-if="spinShow" class="tableSpin"></Spin>
    </div>

    <!--确认删除最后一条-->
    <Modal v-model="dltLast" title="删除确认" @on-ok="dltLastOk" @on-cancel="dltLastCancel">
      <p style="font-size: 14px; font-weight: 600">
        是否删除最后一条？如果删除该拣货单也会删除！
      </p>
    </Modal>
  </div>
</template>
<script>
import api from "@/api/api";
import common from "@/components/mixin/common_mixin";
import { getWarehouseId } from "@/utils/getService";
import {
  // commodityLabel,
  outListTypeList,
} from "@/views/wms/stockOUt/otherStouck/components/fileData.js";
import {
  outListTypeList as fullyTypeList,
  pickingTypeList,
  arrayToObj,
} from "@/views/wms/stockOUt/fullyManage/components/fileData.js";
export default {
  props: ["pickingGoodsNo", "pickingStatus", "where", "pickingDetail"],
  mixins: [common],
  data() {
    let v = this;
    return {
      tableItemTotal: 0,
      dltLast: false,
      detailInfo: {
        pickingGoodsNo: "",
        packageGoodsStatus: "",
        packageGoodsType: "",
        print: "",
        warehouseName: "",
        createdTime: "",
        createdBy: "",
        remark: "",
      },
      formItem: {
        type: "0",
        sku: null,
        pageNum: 1,
        pageSize: 10,
      },
      watchTypeData: [
        {
          label: "按出库单查看",
          value: "0",
          check: true,
        },
        {
          label: "按商品查看",
          value: "1",
          check: false,
        },
      ],
      columns: [],
      data: [],
      columnsStockOut: [
        {
          type: "index",
          width: 60,
          align: "center",
        },
        {
          title: "出库单号",
          key: "pickingNo",
          align: "center",
          render: (h, params) => {
            if (params.row.packageGoodsRelationStatus === "3") {
              return h("div", [
                h("span", params.row.pickingNo),
                h(
                  "span",
                  {
                    style: {
                      color: "red",
                      marginLeft: "5px",
                    },
                  },
                  "(作废)"
                ),
              ]);
            } else {
              return h("div", params.row.pickingNo);
            }
          },
        },
        {
          title: "出库单类型",
          align: "center",
          key: "type",
        },
        {
          title: "平台主体",
          align: "center",
          key: "platformType",
          render: (h, params) => {
            let platformItem =
              arrayToObj(fullyTypeList)[params.row.platformType] || {};
            return h("div", platformItem.label || "");
          },
        },
        {
          title: "出库单状态",
          align: "center",
          key: "salePickingStatus",
          render: (h, params) => {
            if (
              params.row.salePickingStatus === 0 ||
              params.row.otherPickingStatus === "0"
            ) {
              return h("div", "订单创建");
            } else if (
              params.row.salePickingStatus === 1 ||
              params.row.otherPickingStatus === "1"
            ) {
              return h("div", "部分分配");
            } else if (
              params.row.salePickingStatus === 2 ||
              params.row.otherPickingStatus === "2"
            ) {
              return h("div", "分配完成");
            } else if (
              params.row.salePickingStatus === 3 ||
              params.row.otherPickingStatus === "3"
            ) {
              return h("div", "部分发货");
            } else if (
              params.row.salePickingStatus === 4 ||
              params.row.otherPickingStatus === "4"
            ) {
              return h("div", "完全发货");
            } else if (
              params.row.salePickingStatus === 5 ||
              params.row.otherPickingStatus === "5"
            ) {
              return h("div", "订单完成");
            }
          },
        },
        {
          title: "物流下发状态",
          align: "center",
          key: "packageUploadCarrierStatus",
          render: (h, params) => {
            if (params.row.packageUploadCarrierStatus === 0) {
              return h(
                "div",
                {
                  style: {
                    color: "#FF0000",
                  },
                },
                "未下发"
              );
            } else if (params.row.packageUploadCarrierStatus === 3) {
              return h(
                "div",
                {
                  style: {
                    color: "#008000",
                  },
                },
                "成功"
              );
            } else if (params.row.packageUploadCarrierStatus === 4) {
              return h(
                "div",
                {
                  style: {
                    color: "#FF0000",
                  },
                },
                "失败"
              );
            }
          },
        },
        {
          title: "仓库",
          align: "center",
          key: "warehouseName",
        },
        {
          title: "商品",
          align: "center",
          key: "address",
          render: (h, params) => {
            if (params.row.pickingProductResultList) {
              return h(
                "ul",
                params.row.pickingProductResultList.map((val) => {
                  return h("li", val.goodsSku + "*" + val.expectedNumber);
                })
              );
            }
          },
        },
        {
          title: "操作",
          align: "center",
          key: "address",
          render: (h, params) => {
            if (params.row.packageGoodsRelationStatus !== "3") {
              return h(
                "Button",
                {
                  props: {
                    type: "primary",
                    disabled:
                      !this.getPermission(
                        "wmsPickingGoods_modifyPickingByNo"
                      ) &&
                      !this.getPermission(
                        "wmsPickingGoods_modifyPickingByNo_other"
                      ),
                  },
                  on: {
                    click: () => {
                      this.getGenerateSituation(params.row).then(() => {
                        this.axios
                          .post(
                            api.delete_pickNo +
                            "?pickingNo=" +
                            params.row.pickingNo +
                            "&pickingGoodsNo=" +
                            this.detailInfo.pickingGoodsNo
                          )
                          .then((res) => {
                            if (res.data.code === 0) {
                              // this.StockOutData.splice(params.index, 1);
                              if (
                                res.data.datas === -1 ||
                                this.data.length <= 1
                              ) {
                                // 删除最后一个了
                                this.$emit("goList", "list");
                                this.$Message.success("操作成功!");
                              } else {
                                this.$Message.success("操作成功!");
                                this.searchOfStockOut();
                              }
                            }
                          })
                          .finally(() => {
                            this.$Modal.remove();
                          });
                      });
                    },
                  },
                },
                "从拣货单移除"
              );
            }
          },
        },
      ],
      columnsGoods: [
        {
          type: "index",
          width: 60,
          align: "center",
        },
        {
          title: "库区组",
          key: "warehouseBlockGroupName",
        },
        {
          title: "所在库区",
          key: "warehouseBlockName",
        },
        {
          title: "所在库位",
          key: "warehouseLocationName",
        },
        {
          title: "产品图片",
          key: "goodsUrl",
          render: (h, params) => {
            return h("img", {
              attrs: {
                src: params.row.goodsUrl
                  ? v.$store.state.imgUrlPrefix + params.row.goodsUrl
                  : require("../../../../../public/static/images/placeholder.jpg"),
              },
              style: {
                width: "60px",
                height: "60px",
              },
            });
          },
        },
        {
          // title: 'SKU/条码编码',
          // key: 'goodsSku',
          width: 114,
          render: (h, params) => {
            return h("div", [
              h("div", params.row.goodsSku),
              h("div", params.row.barCode),
            ]);
          },
          renderHeader: (h, column, index) => {
            const title = Object.keys(pickingTypeList).includes(
              v.detailInfo.pickingType
            )
              ? "SKU/条码编码"
              : "SKU";
            return h("div", title);
          },
        },
        {
          title: "中文描述",
          key: "goodsCnDesc",
        },
        {
          title: "英文描述",
          key: "goodsEnDesc",
        },
        // {
        //   title: "批次号",
        //   key: "receiptBatchNo",
        // },
        {
          title: "拣货数量",
          key: "expectedNumber",
        },
        {
          title: "体积",
          key: "goodsVolume",
        },
        {
          title: "重量" + "(g)",
          key: "goodsWeight",
        },
      ],
      StockOutData: [],
      GoodsData: [],
      skuNo: "",
      spinShow: false, // 表格加载遮罩
      productTypeList: {
        0: { label: "普通产品", value: 0 },
        1: { label: "组合产品", value: 1 },
        2: { label: "混合产品", value: 2 },
      },
    };
  },
  // computed: {
  //   // 根据不同出库类型不同打印内容
  //   pintField() {
  //     let { pickingType } = this.data.length ? this.data[0] || {} : {};
  //     !pickingType && (pickingType = "O5"); // 不存在出库单类型，则默认为FBA出库单
  //     return commodityLabel[pickingType] || {};
  //   },
  // },
  methods: {
    clickTypeButton(data) {
      // 按分配切换不同的表格
      this.formItem.pageNum = 1;
      this.watchTypeData.forEach(function (n) {
        n.check = data.value === n.value;
      });
      this.formItem.type = data.value;
      if (data.value === "1") {
        this.columns = this.columnsGoods;
        this.searchOfGood();
      } else {
        this.columns = this.columnsStockOut;
        this.searchOfStockOut();
      }
    },
    backList() {
      this.$parent.workShow = "list";
    },
    processData(listData) {
      // 返回数据的中文匹配
      listData.forEach((val) => {
        const pickingType = {
          S1: "销售出库",
          O1: "调拨出库",
          O2: "组装加工",
          O3: "其他出库",
          J1: "借样出库",
        };
        let allList = [...outListTypeList, ...Object.values(pickingTypeList)];
        // 新增的出库单类型
        allList.forEach((k) => {
          pickingType[k.value] = k.label;
        });
        val.type = pickingType[val.pickingType];
        let sale =
          val.salePickingStatus === 0
            ? "订单创建"
            : val.salePickingStatus === 1
              ? "部分分配"
              : val.salePickingStatus === 2
                ? "分配完成"
                : val.salePickingStatus === 3
                  ? "部分发货"
                  : val.salePickingStatus === 4
                    ? "完全发货"
                    : val.salePickingStatus === 5
                      ? "订单完成"
                      : "";
        let other =
          val.otherPickingStatus === 0
            ? "订单创建"
            : val.otherPickingStatus === 1
              ? "部分分配"
              : val.otherPickingStatus === 2
                ? "分配完成"
                : val.otherPickingStatus === 3
                  ? "部分发货"
                  : val.otherPickingStatus === 4
                    ? "完全发货"
                    : val.otherPickingStatus === 5
                      ? "订单完成"
                      : "";
        val.status = sale + other;
        val.pickStatus =
          val.packageGoodsStatus === "0"
            ? "未拣货"
            : val.packageGoodsStatus === "1"
              ? "已拣货"
              : "";
      });
      return listData;
    },
    paramsObj() {
      let obj = {
        pickingGoodsNo: this.pickingGoodsNo,
        status: this.formItem.type,
        pickingNo: this.formItem.sku ? this.formItem.sku : null,
        pageNum: this.formItem.pageNum,
        pageSize: this.formItem.pageSize,
      };
      return obj;
    },
    // 按出库单查找
    searchOfStockOut() {
      this.searchDtl((data) => {
        this.StockOutData = this.processData(data);
        this.GoodsData = [];
        this.data = this.StockOutData; // 出库单数据
      });
    },
    // 按商品查
    searchOfGood() {
      this.searchDtl((data) => {
        this.GoodsData = this.processData(data);
        this.StockOutData = [];
        this.data = this.GoodsData; // 商品数据
      });
    },
    btnSearch() {
      if (this.formItem.type === "0") {
        this.searchOfStockOut();
      } else {
        this.searchOfGood();
      }
    },
    searchDtl(callback) {
      let obj = this.paramsObj();
      this.axios.post(api.get_pickListDtl, obj).then((res) => {
        if (res.data.code === 0) {
          let data = res.data.datas[0];
          this.detailInfo.pickingType = data.pickingType;
          this.detailInfo.pickingGoodsNo = data.pickingGoodsNo;
          this.detailInfo.remark = data.remark;
          this.detailInfo.packageGoodsStatus =
            data.packageGoodsStatus === "1"
              ? "已拣货"
              : data.packageGoodsStatus === "0"
                ? "未拣货"
                : "";
          this.detailInfo.packageGoodsType =
            data.packageGoodsType === "SS"
              ? "单品"
              : data.packageGoodsType === "SM"
                ? "单品"
                : data.packageGoodsType === "MM"
                  ? "多品"
                  : "";
          this.detailInfo.print = data.print === "0" ? "否" : "是";
          this.detailInfo.warehouseName = data.warehouseName;
          this.detailInfo.createdTime = this.$uDate.getDataToLocalTime(
            data.createdTime,
            "fulltime"
          );
          this.detailInfo.createdBy = data.createdByName;
          this.detailInfo.pickingGoodsProductType =
            data.pickingGoodsProductType;
          this.detailInfo.qualityCheck = data.qualityCheck;

          if (this.formItem.type === "0") {
            this.tableItemTotal =
              res.data.datas[0].queryByPickingResultPage.total;
            callback &&
              callback(res.data.datas[0].queryByPickingResultPage.list);
          } else {
            this.tableItemTotal =
              res.data.datas[0].queryByGoodsDetailResultPage.total;
            callback &&
              callback(res.data.datas[0].queryByGoodsDetailResultPage.list);
          }
        }
      });
    },
    dltLastOk() {
      let obj = this.StockOutData[0];
      this.axios
        .post(
          api.delete_pickNo +
          "?pickingNo=" +
          obj.pickingNo +
          "&pickingGoodsNo=" +
          this.detailInfo.pickingGoodsNo
        )
        .then((res) => {
          if (res.data.code === 0) {
            this.StockOutData.splice(0, 1);
            this.$parent.workShow = "list";
          }
        });
    },
    dltLastCancel() { },
    printList() {
      let goto = this.$router.resolve({
        path: "/printPickList",
        query: {
          warehouseId: getWarehouseId(),
          data: this.pickingGoodsNo,
          type: "pickList",
          where: this.where || null,
        },
      });
      window.open(goto.href, "_blank");
    },
    // sku 自筛
    skuSearch() {
      let skuNo = this.skuNo;
      if (!skuNo) {
        this.data = this.GoodsData;
        return;
      }
      this.data = this.data.filter((k) => {
        return skuNo === k.goodsSku;
      });
    },
    // 查询出库单拣货单关系 (出库单:拣货单 -> 1:1 返回0, *:1 返回1, 1:* 返回2, *:* 返回3)
    getGenerateSituation(row) {
      return new Promise((resolve, reject) => {
        this.spinShow = true;
        this.axios
          .post(
            `${api.generateSituation}?pickingNo=${row.pickingNo}&pickingGoodsNo=''`
          )
          .then(({ data }) => {
            if (data.code === 0) {
              data.datas = 3;
              if (!data.datas) {
                resolve();
                return;
              }
              let content = {
                1: "该拣货单删除后会删除多张出库单的拣货信息",
                2: "该拣货单删除后会删除对应出库单的所有拣货单",
                3: "该拣货单删除后会删除对应出库单的所有拣货单",
              };
              this.$Modal.confirm({
                title: "提示",
                content: `<p>${content[data.datas]}</p>`,
                loading: true,
                onOk: () => {
                  resolve();
                },
              });
            } else {
              resolve();
            }
          })
          .catch(() => {
            resolve();
          })
          .finally(() => {
            this.spinShow = false;
          });
      });
    },
  },
  created() {
    if (this.pickingGoodsNo) {
      this.searchDtl((data) => {
        this.StockOutData = this.processData(data);
        this.data = this.StockOutData; // 出库单数据
      });
    }
    if (this.pickingStatus === "1") {
      this.columnsStockOut.pop();
    }
    if (this.where === "other") {
      this.columnsStockOut.splice(4, 1);
    }
    this.columns = this.columnsStockOut; // 出库单表头
  },
};
</script>
<style>
.pickListDtl {
  padding-left: 12px;
}

.pickListDtl .tool {
  padding: 15px 0;
  background-color: #fff;
  margin-top: 10px;
  padding-left: 10px;
  margin-bottom: 10px;
}

.pickListDtl>div:first-child h3 {
  background-color: #ffffff;
  padding: 10px;
  margin-bottom: 10px;
}

.pickListDtl .tableMain {
  position: relative;
}

.pickListDtl .tableMain .tableSpin {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>
