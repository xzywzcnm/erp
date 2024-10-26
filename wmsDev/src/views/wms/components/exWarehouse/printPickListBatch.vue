<template>
  <div class="print-box">
    <div class="print-n-box">
      <div id="printBox">
        <div style="page-break-before: always" class="print-mb100" v-for="(detailInfo, index) in batchPrintData"
          :key="index">
          <div style="
              font-size: 24px;
              font-weight: 600;
              border-bottom: 1px solid #ccc;
              padding-bottom: 15px;
              line-height: 60px;
            ">
            <span v-if="type === 'pickList'">拣货单:</span><span>{{ detailInfo.pickingGoodsNo }}</span>
            <span v-if="type === 'checkList'">盘点单:</span><span>{{ detailInfo.inventoryCheckNo }}</span>
            <font id="printSkuBarCode" style="font-family: IDAutomationC128S; margin-left: 10px"
              v-html="detailInfo.barcode"></font>
          </div>

          <div style="padding: 20px 0; border-bottom: 1px solid #ccc">
            <div>
              <span v-if="type === 'pickList'">
                <span class="textTitle">拣货仓库：</span>
                <span>{{ detailInfo.warehouseName }}</span>
              </span>
              <span v-if="type === 'checkList'">
                <span class="textTitle">盘点仓库：</span>
                <span>{{ detailInfo.warehouseName }}</span>
              </span>
            </div>

            <template v-if="type === 'pickList'">
              <div>
                <span>
                  <span class="textTitle ab">物流商：</span>
                  <span v-if="detailInfo.carrierMethodNameList.length">
                    {{
                      detailInfo.carrierMethodNameList.length > 1
                      ? "多种物流渠道" +
                      detailInfo.carrierMethodNameList[0] +
                      "等"
                      : detailInfo.carrierMethodNameList[0]
                    }}
                  </span>
                </span>
              </div>
              <div>
                <span>
                  <span class="textTitle">拣货提醒：</span>
                  <span>{{ detailInfo.remark }}</span></span>
              </div>
              <div>
                <span style="
                    display: inline-block;
                    width: 300px;
                    white-space: nowrap;
                  ">
                  <span class="textTitle ab">物流渠道：</span>
                  <span v-if="detailInfo.carrierNameList.length">
                    {{
                      detailInfo.carrierNameList.length > 1
                      ? "多种物流渠道" +
                      "，" +
                      detailInfo.carrierNameList[0] +
                      "等"
                      : detailInfo.carrierNameList[0]
                    }}
                  </span>
                </span>
              </div>
            </template>

            <div class="line-block">
              <template v-if="type === 'pickList'">
                <span class="left-block">
                  <span class="textTitle">拣货单类型：</span>
                  <span>{{
                    detailInfo.packageGoodsType === "MM" ? "多品" : "单品"
                  }}</span>
                </span>
                <span style="display: inline-block; width: 180px">
                  <span class="textTitle ab">出库单数量：</span>
                  <span>{{ detailInfo.pickingNumber }}</span>
                </span>
              </template>
              <template v-if="type === 'checkList'">
                <span class="left-block">
                  <span class="textTitle">盘点单状态：</span>
                  <span>{{
                    detailInfo.checkStatus === "0"
                    ? "待盘点"
                    : detailInfo.checkStatus === "1"
                      ? "盘点中"
                      : detailInfo.checkStatus === "2"
                        ? "已完成"
                        : ""
                  }}</span>
                </span>
                <span>
                  <span class="textTitle ab">创建时间：</span>
                  <span>{{
                    $uDate.getDataToLocalTime(detailInfo.createdTime)
                  }}</span>
                </span>
              </template>
            </div>
            <div class="line-block">
              <template v-if="type === 'pickList'">
                <span class="left-block">
                  <span class="textTitle">创建时间：</span>
                  <span>{{
                    $uDate.getDataToLocalTime(
                      detailInfo.createdTime,
                      "fulltime"
                    )
                  }}</span>
                </span>
                <span style="
                    display: inline-block;
                    width: 180px;
                    white-space: nowrap;
                  ">
                  <span class="textTitle">SKU总数：</span>
                  <span>{{ detailInfo.goodsQuantityNumber }}</span>
                </span>
              </template>
              <span class="left-block" v-if="type === 'checkList'">
                <span class="textTitle">动态盘点：</span>
                <span>{{ detailInfo.beginDate ? "Y" : "N" }}</span>
              </span>
              <span v-if="type === 'checkList'">
                <span class="textTitle">盲盘：</span>
                <span>{{ detailInfo.blindFlag === "1" ? "Y" : "N" }}</span>
              </span>
            </div>
            <div class="line-block">
              <template v-if="type === 'pickList'">
                <span class="left-block">
                  <span class="textTitle">拣货人员：</span>
                  <span>{{
                    detailInfo.pickingGoodsUser
                    ? detailInfo.pickingGoodsUser
                    : ""
                  }}</span>
                </span>
                <span>
                  <span class="textTitle">SKU种类：</span>
                  <span>{{ detailInfo.goodsSkuNumber }}</span>
                </span>
              </template>
              <span class="left-block" v-if="type === 'checkList' && detailInfo.checkStatus !== '0'">
                <span class="textTitle">盘点人员：</span>
                <span>{{
                  detailInfo.checkUserName ? detailInfo.checkUserName : ""
                }}</span>
              </span>
            </div>
            <template v-if="type === 'pickList' && detailInfo.pickingNo">
              <div class="line-block">
                <span class="left-block">
                  <span class="textTitle">出库单号：</span>
                  <span>{{ detailInfo.pickingNo || "" }}</span>
                </span>
                <span class="left-block">
                  <span class="textTitle">出库单类型：</span>
                  <span v-if="detailInfo.pickingType &&
                    overSeaPickingType[detailInfo.pickingType]
                    ">
                    {{ overSeaPickingType[detailInfo.pickingType].label }}
                  </span>
                </span>
              </div>
              <div class="line-block">
                <span class="left-block">
                  <span class="textTitle">平台主体：</span>
                  <span v-if="detailInfo.platformType">
                    <span v-for="(pk, pi) in detailInfo.platformType.split(',') ||
                      []" :key="pi">
                      <span v-if="fullyTypeList[pk]">{{ pi > 0 ? "," : ""
                      }}{{ fullyTypeList[pk].label }}</span>
                    </span>
                  </span>
                </span>
                <span class="left-block">
                  <span class="textTitle">是否要质检：</span>
                  <span>
                    {{ detailInfo.qualityCheck ? "是" : "否" }}
                  </span>
                </span>
              </div>
              <div class="line-block">
                <span class="left-block">
                  <span class="textTitle">拣货单拆单数量：</span>
                  <span>{{ detailInfo.pickingGoodsOrder || 0 }}/{{
                    detailInfo.pickingGoodsNumber || 0
                  }}</span>
                </span>
              </div>
            </template>
          </div>
          <table width="100%">
            <thead style="background-color: #ccc">
              <tr>
                <th style="padding: 6px 0" v-show="filterColumns.includes('warehouseBlockName')">
                  所在库区
                </th>
                <th style="padding: 6px 0" v-show="filterColumns.includes('warehouseLocationName')">
                  所在库位
                </th>
                <th style="padding: 6px 0" v-show="filterColumns.includes('goodsSku')">
                  SKU
                </th>
                <th style="padding: 6px 0" v-if="type === 'pickList' &&
                  filterColumns.includes('expectedNumber')
                  ">
                  需拣货数量
                </th>
                <th style="padding: 6px 0" v-show="filterColumns.includes('goodsCnDesc')">
                  中文描述
                </th>

                <th style="padding: 6px 0" v-show="filterColumns.includes('goodsAttributes')">
                  产品规格
                </th>

                <th style="padding: 6px 0" v-show="filterColumns.includes('goodsEnDesc')">
                  英文描述
                </th>
                <th style="padding: 6px 0" v-show="!['other'].includes(where) &&
                  filterColumns.includes('receiptBatchNo')
                  ">
                  批次号
                </th>
                <th style="padding: 6px 0" v-if="type === 'checkList' &&
                  filterColumns.includes('oriTotalNumber')
                  ">
                  库存数
                </th>
                <th style="padding: 6px 0" v-if="type === 'checkList' &&
                  filterColumns.includes('countingQuantity')
                  ">
                  盘点数
                </th>
                <th style="padding: 6px 0" v-if="type === 'checkList' &&
                  filterColumns.includes('gainsAndLosses')
                  ">
                  差异数
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(val, i) in detailInfo.totalItem" :key="i">
                <td align="center" style="white-space: nowrap" v-show="filterColumns.includes('warehouseBlockName')">
                  {{ val.warehouseBlockName }}
                </td>
                <td align="center" style="white-space: nowrap" v-show="filterColumns.includes('warehouseLocationName')">
                  {{ val.warehouseLocationName }}
                </td>

                <td align="center" style="white-space: nowrap" v-show="filterColumns.includes('goodsSku')">
                  {{ val.goodsSku }}
                </td>
                <td align="center" v-if="type === 'pickList' &&
                  filterColumns.includes('expectedNumber')
                  ">
                  {{ val.expectedNumber }}
                </td>

                <td align="left" style="word-break: break-all" v-show="filterColumns.includes('goodsCnDesc')">
                  {{ val.goodsCnDesc }}
                </td>
                <td align="left" style="word-break: break-all" v-show="filterColumns.includes('goodsAttributes')">
                  {{ val.goodsAttributes ? val.goodsAttributes : "" }}
                </td>
                <td align="left" style="word-break: break-all" v-show="filterColumns.includes('goodsEnDesc')">
                  {{ val.goodsEnDesc }}
                </td>
                <td align="center" style="word-break: break-all" v-show="!['other'].includes(where) &&
                  filterColumns.includes('receiptBatchNo')
                  ">
                  {{ val.receiptBatchNo }}
                </td>
                <td align="center" v-if="type === 'checkList' &&
                  filterColumns.includes('oriTotalNumber')
                  ">
                  {{ detailInfo.blindFlag === "1" ? "*" : val.oriTotalNumber }}
                </td>
                <td align="center" v-if="type === 'checkList' &&
                  filterColumns.includes('countingQuantity')
                  "></td>
                <td align="center" v-if="type === 'checkList' &&
                  filterColumns.includes('gainsAndLosses')
                  "></td>
              </tr>
            </tbody>
          </table>
          <div class="clear">
            <div class="fr" style="margin-top: 50px">
              <span style="margin-right: 100px; font-size: 14px">制单人 （签字/日期）</span><span
                style="margin-right: 100px; font-size: 14px">拣货人 （签字日期）</span>
            </div>
          </div>
        </div>
      </div>
      <div style="position: absolute; right: -100px; top: 0" class="print-none">
        <div style="margin-bottom: 10px">
          <Button type="primary" @click="print">打印</Button>
        </div>
        <!-- <div style="margin-bottom: 10px">
          <Button type="primary" @click="download">下载</Button>
        </div> -->
        <div>
          <Button type="primary" @click="cancelPrint">取消打印</Button>
        </div>
        <div style="height: 35px; position: relative">
          <local-filter-columns :columns="columns" :filterName="'printPickList'"
            @setTableColumns="setTableColumns"></local-filter-columns>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
// 打印盘点单与拣货单共用模块
import api from "@/api/api";
import common from "@/components/mixin/common_mixin";
import JsPDF from "jspdf";
import printMixin from "@/components/mixin/print_mixin";
import { getWarehouseId } from "@/utils/getService";
import { outListTypeList } from "@/views/wms/stockOUt/otherStouck/components/fileData";
import { outListTypeList as otherTypeList } from "@/views/wms/components/exWarehouse/otherStockOut/fileData";
import {
  outListTypeList as fullyTypeList,
  pickingTypeList,
  arrayToObj,
} from "@/views/wms/stockOUt/fullyManage/components/fileData.js";
export default {
  // type === 'checkList'为盘点单
  mixins: [common, printMixin],
  data() {
    let v = this;
    let columns1 = [
      {
        title: "所在库区",
        key: "warehouseBlockName",
      },
      {
        title: "所在库位",
        key: "warehouseLocationName",
      },
      {
        title: "SKU",
        key: "goodsSku",
      },
      {
        title: "中文描述",
        key: "goodsCnDesc",
      },
      {
        title: "产品规格",
        key: "goodsAttributes",
      },
      {
        title: "英文描述",
        key: "goodsEnDesc",
      },
      {
        title: "批次号",
        key: "receiptBatchNo",
      },
    ];
    let columns2 = JSON.parse(JSON.stringify(columns1));
    let columns3 = JSON.parse(JSON.stringify(columns1));
    columns2.splice(2, 0, {
      title: "需拣货数量",
      key: "expectedNumber",
    });
    columns3.push(
      {
        title: "库存数",
        key: "blindFlag",
        render(h, params) {
          let data =
            v.detailInfo.blindFlag === "1" ? "*" : params.row.oriTotalNumber;
          return h("span", data);
        },
      },
      {
        title: "盘点数",
        key: "countingQuantity",
      },
      {
        title: "差异数",
        key: "gainsAndLosses",
      }
    );
    return {
      placeholderUrl: require("../../../../../public/static/images/placeholder.jpg"),
      localeUrl: window.location.origin
        ? window.location.origin
        : window.location.protocol +
        "//" +
        window.location.hostname +
        (window.location.port ? ":" + window.location.port : ""), // 兼容性写法
      totalItem: "",
      detailInfo: [],
      barCodeString: "",
      type: "",
      batchPrintData: [],
      columns: [],
      filterColumns: [],
      columns2: columns2,
      columns3: columns3,
      fullyTypeList: arrayToObj(fullyTypeList),
    };
  },
  computed: {
    prefixUrl() {
      return localStorage.getItem("imgUrlPrefix");
    },
    // 海外仓出库单类型列表
    overSeaPickingType() {
      let obj = {};
      let additionalTypes = [
        {
          label: "借样出库",
          value: "J1",
        },
      ]
      let allList = [...outListTypeList, ...otherTypeList, ...Object.values(pickingTypeList), ...additionalTypes];
      allList.forEach((k) => {
        obj[k.value] = k;
      });
      return obj;
    },
  },
  created() {
    let obj = this.$route.query.data;
    this.type = this.$route.query.type;
    this.where = this.$route.query.where;
    this.goodsSkuOrGoodsCnDesc = this.$route.query.goodsSkuOrGoodsCnDesc;
    if (typeof obj === "object") {
      window.localStorage.setItem("paramsDtl", JSON.stringify(obj));
    } else if (
      typeof JSON.parse(window.localStorage.getItem("paramsDtl")) ===
      "object" &&
      JSON.parse(window.localStorage.getItem("paramsDtl")) !== null
    ) {
      obj = JSON.parse(window.localStorage.getItem("paramsDtl"));
    }
    let paramsObj = null;
    if (this.type === "pickList") {
      paramsObj = {
        isPage: "1",
        status: "1",
        pickingGoodsNos: obj.split(","),
      };
      let columns2 = this.$common.copy(this.columns2);
      // 其它拣货单去除批次号
      if (["other"].includes(this.where)) {
        let index = null;
        columns2.forEach((k, i) => {
          k.key == "receiptBatchNo" && (index = i);
        });
        (index || index === 0) && columns2.splice(index, 1);
      }
      this.columns = columns2;
    } else if (this.type === "checkList") {
      paramsObj = {
        isPage: "1",
        status: "1",
        goodsSkuOrGoodsCnDesc: this.goodsSkuOrGoodsCnDesc,
        pickingGoodsNos: obj ? [obj] : null,
      };
      this.columns = this.columns3;
    }
    // 盘点单需要的参数
    if (this.type === "checkList") {
      if (typeof obj === "object") {
        paramsObj.inventoryCheckNo = obj.inventoryCheckNo
          ? [obj.inventoryCheckNo]
          : null;
      } else if (typeof obj === "string") {
        paramsObj.inventoryCheckNo = obj;
      }
      delete paramsObj.pickingGoodsNos;
    }
    const rqApi =
      this.type === "checkList" ? api.get_scanDetailData : api.get_pickListDtl;
    this.$Spin.show();
    this.axios
      .post(rqApi, paramsObj)
      .then((res) => {
        if (res.data.code === 0) {
          let arr = res.data.datas || [];

          if (this.type === "checkList") {
            this.totalItem = res.data.datas.inventoryCheckDetailResultPage.list;
          } else {
            arr.forEach((i) => {
              if (paramsObj.status === "0") {
                i.totalItem = i.queryByPickingResultPage.list;
              } else {
                i.totalItem = i.queryByGoodsDetailResultPage.list;
              }
            });
          }
          let pickingGoodsNo = obj.split(",");
          this.axios
            .post(api.getBarCode, pickingGoodsNo)
            .then((res) => {
              if (res.data.code === 0) {
                arr.forEach((val1) => {
                  res.data.datas.forEach((val2) => {
                    let key = Object.getOwnPropertyNames(val2)[0];
                    if (val1.pickingGoodsNo === key) {
                      let value = val2[key] ? val2[key] : "";
                      this.$set(val1, "barcode", value);
                    }
                  });
                });
                this.batchPrintData = arr;
              }
            })
            .finally(() => {
              this.$Spin.hide();
            });
        } else {
          this.$Spin.hide();
        }
      })
      .catch(() => {
        this.$Spin.hide();
      });
  },
  destroyed() {
    localStorage.removeItem("paramsDtl");
  },
  methods: {
    setTableColumns(data) {
      this.filterColumns = data.map((i) => i.key);
    },
    print() {
      let obj = this.$route.query.data;
      this.axios
        .post(api.printListNum, {
          pickingGoodsNos: obj.split(","),
        })
        .then((res) => {
          if (res.data.code === 0) {
            this.$Message.success(res.data.message);
          }
        });
      window.print();
    },
    cancelPrint() {
      if (this.type === "checkList") {
        window.location.href =
          "#/inventoryScan?warehouseId=" + getWarehouseId(); // 盘点单
      } else {
        // if (this.where === 'sell') {
        //   window.location.href = '#/pickList?warehouseId=' + getWarehouseId();
        // } else {
        //   window.location.href = '#/otherStockOutPickList?warehouseId=' + getWarehouseId();
        // }
        let typeList = {
          sell: { pageName: "pickList" },
          other: { pageName: "otherStockOutPickList" },
        };
        const url = typeList[this.where]
          ? typeList[this.where].pageName
          : "index";
        window.location.href = `#/${url}?warehouseId=${getWarehouseId()}`;
      }
    },
    changePrintStatus(obj) {
      let paramsObj = {
        pickingGoodsNos: [obj],
      };
      this.axios.post(api.printListNum, paramsObj).then((res) => {
        if (res.data.code === 0) {
          this.$Message.success(res.data.message);
        }
      });
    },
    download() {
      var pdf = new JsPDF("p", "pt", "a4");
      if (pdf.internal) {
        pdf.internal.scaleFactor = 1.5;
      }
      var options = {
        pagesplit: true,
      };
      let node = document.querySelector("#printBox");
      node.style.backgroundColor = "#fff";
      node.style.padding = "20px 40px";
      node.style.margin = "0 auto";
      pdf.addHTML(node, options, function () {
        pdf.save("web.pdf");
      });
    },
  },
};
</script>
<style>
.iview-table-setWidth .ivu-table:before {
  height: 0;
}

.iview-table-setWidth .ivu-table:after {
  height: 0;
}

.print-mb100 {
  margin-bottom: 100px;
}

.print-n-box {
  width: 1000px;
  background-color: #fff;
  margin: 0 auto;
  height: 100%;
  position: relative;
}

.print-box {
  background-color: #ccc;
  padding: 34px 56px;
  font-size: 16px;
}

#printBox {
  padding: 20px;
}

.iview-table-setWidth .ivu-table-overflowX {
  overflow: hidden;
}

.print-n-box .ivu-table-wrapper {
  border: 1px solid #999;
  border-bottom: 0;
}

.print-n-box .ivu-table td,
.print-n-box .ivu-table th {
  border-bottom: 1px solid #999;
}

@page {
  margin: 0;
  padding: 0;
}

@media print {

  html,
  body,
  #app {
    min-width: auto;
  }

  * {
    margin: 0;
    padding: 0;
    font-weight: bold;
  }

  .iview-table-setWidth .ivu-table-header table {
    width: 100% !important;
    table-layout: initial;
  }

  .iview-table-setWidth .ivu-table-body table {
    width: 100% !important;
    table-layout: initial;
  }

  .iview-table-setWidth .ivu-table:before {
    height: 0;
  }

  .iview-table-setWidth .ivu-table:after {
    height: 0;
  }

  .print-n-box .ivu-table-wrapper {
    border: 1px solid #999;
    border-bottom: 0;
  }

  .print-n-box .ivu-table td,
  .print-n-box .ivu-table th {
    border-bottom: 1px solid #999;
  }

  #printBox {
    padding: 0 !important;
  }

  .print-n-box {
    width: 100%;
    background-color: #fff;
    margin: 0 auto;
    position: relative;
    padding: 0 16px;
  }

  .print-box {
    width: 100%;
    font-size: 16px;
    background-color: #ccc;
    padding: 0;
  }

  .print-mb100 {
    margin-top: 5pt;
  }

  .print-none {
    display: none;
  }
}

.textTitle {
  font-size: 16px;
  width: 150px;
}

.textTitle+span {
  word-break: break-all;
}

.line-block .left-block {
  display: inline-block;
  /* width: 320px; */
  width: 50%;
  box-sizing: border-box;
}

* {
  margin: 0;
  padding: 0;
}
</style>
<style scoped>
table {
  -webkit-border-horizontal-spacing: 0px;
  -webkit-border-vertical-spacing: 0px;
  border-top-width: 0px;
  border-right-width: 0px;
  border-bottom-width: 0px;
  border-left-width: 0px;
  border-top: 1px solid #9a9a9a;
  border-left: 1px solid #9a9a9a;
}

.table-border {
  border: 1px solid #666;
  border-bottom: 0;
  border-right: 0;
}

table td,
table th {
  border-bottom: 1px solid #9a9a9a;
  border-right: 1px solid #9a9a9a;
}
</style>
