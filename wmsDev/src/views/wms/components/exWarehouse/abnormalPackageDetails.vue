<template>
  <div class="details">
    <div class="title_box">
      <!-- eslint-disable-next-line vue/no-parsing-error -->
      <span class="back" @click="BackBtn">{{ " < 返回列表" }}</span>
      <h2 class="title">归库单详情 {{ "：" + details.regressProductNumber }}</h2>
    </div>
    <div class="info_box">
      <div class="left_box">
        <p class="lines">归库单编号 {{ "：" + details.regressProductNumber }}</p>
        <p class="lines">仓库{{ "：" + details.warehouseName }}</p>
      </div>
      <div class="right_box">
        <p class="lines">归库单状态{{ "：" + details.status }}</p>
        <!--createdBy-->
        <p class="lines">创建人{{ "：" + details.userName }}</p>
        <p class="lines">创建时间{{ "：" + details.createdTime }}</p>
      </div>
    </div>
    <h2 class="details_info">明细信息</h2>
    <!--列表区域-->
    <div class="orderTable normalTop">
      <Table
        highlight-row
        border
        :loading="loading"
        :height="tableHeight"
        :columns="orderColumn"
        :data="cancelData"
      ></Table>
    </div>
  </div>
</template>

<style lang="less" scoped>
.details {
  .title_box {
    display: flex;
    justify-content: center;
    position: relative;

    .back {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      color: #217af2;
      font-size: 14px;
      left: 10px;
      cursor: pointer;
    }

    .title {
      font-size: 18px;
      color: #000;
    }
  }

  .info_box {
    margin: 20px 10px;
    padding: 20px 0;
    background-color: #fff;
    display: flex;
    justify-content: space-around;

    .lines {
      line-height: 35px;
      color: #333;
      font-size: 14px;
    }
  }

  .details_info {
    margin: 0 10px 20px 10px;
    color: #000;
    font-size: 16px;
    font-weight: bold;
  }
}
</style>

<script>
import api from "@/api/api";
import Mixin from "@/components/mixin/common_mixin";
import { getAllWarehouse } from "@/utils/user";

export default {
  mixins: [Mixin],
  props: {
    ProductNumber: {
      type: String,
      default: "",
    },
  },
  data() {
    let v = this;
    return {
      cancelData: [],
      loading: false,
      details: {},
      orderColumn: [
        {
          title: "所在库区",
          key: "BlockName",
          align: "center",
          render: (h, params) => {
            let data =
              params.row.warehouseBlockNames != null
                ? params.row.warehouseBlockNames.join(",")
                : params.row.warehouseBlockName;
            return h("div", data);
          },
        },
        {
          title: "所在库位",
          key: "warehouseLocationName",
          align: "center",
        },
        {
          title: "产品图片",
          key: "packageCode",
          align: "center",
          render: (h, params) => {
            return v.tableImg(h, params, "goodsUrl");
          },
        },
        {
          title: "SKU/条码编码",
          key: "goodsSku",
          align: "center",
          render: (h, params) => {
            return h("div", [
              h("div", params.row.goodsSku),
              h("div", params.row.barCode),
            ]);
          },
        },
        {
          title: "中文描述",
          key: "goodsCnDesc",
          align: "center",
        },
        {
          title: "英文描述",
          key: "goodsEnDesc",
          align: "center",
        },
        {
          title: "批次号",
          key: "receiptBatchNo",
          align: "center",
        },
        {
          title: "归库数量",
          key: "quantity",
          align: "center",
        },
      ],
    };
  },
  computed: {
    tableHeight() {
      return this.getTableHeight(310);
    },
  },
  created() {
    this.InventoryDetails();
  },
  methods: {
    // 返回列表
    BackBtn() {
      this.$emit("backBtn", false);
    }, // 获取归库单详情数据
    InventoryDetails() {
      let v = this;
      let details = {};
      let userInfoList = JSON.parse(localStorage.getItem("userInfoList"));
      if (v.ProductNumber !== "") {
        v.loading = true;
        v.axios.get(api.get_InventoryDetails + v.ProductNumber).then((response) => {
          if (response.data.code === 0) {
            if (response.data.datas != null && response.data.datas.length > 0) {
              details.regressProductNumber = response.data.datas[0].regressProductNumber;
              details.status =
                response.data.datas[0].status === 0
                  ? "等待归库"
                  : response.data.datas[0].status === 1
                  ? "归库完成"
                  : "";
              details.createdTime = v.$uDate.getDataToLocalTime(
                response.data.datas[0].createdTime,
                "fulltime"
              );
              details.userName =
                response.data.datas[0].createdBy != null
                  ? userInfoList[response.data.datas[0].createdBy].userName
                  : "";
              v.details = Object.assign({}, details);
              v.loading = false;
              v.cancelData = response.data.datas;
              v.AllWarehouse(response.data.datas[0].warehouseId);
            } else {
              v.cancelData = [];
              v.loading = false;
            }
          }
        });
      }
    }, // 获取仓库数据
    AllWarehouse(warehouseId) {
      let v = this;
      getAllWarehouse().then((res) => {
        if (res.length > 0) {
          res.map((item) => {
            if (item.warehouseId === warehouseId) {
              let name = {
                warehouseName: item.warehouseName,
              };
              v.details = Object.assign({}, v.details, name);
            }
          });
        }
      });
    },
  },
};
</script>
