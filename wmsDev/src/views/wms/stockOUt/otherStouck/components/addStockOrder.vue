<template>
  <div class="add-stock-order">
    <detailModel @backList="backList" :pageLoading="pageLoading">
      <div v-if="getPermission('wmsFbaPicking_createFbaPicking')" slot="rights">
        <Button type="primary" @click="createStockOutList">创建出库单</Button>
      </div>
      <div>
        <!-- 面板 -->
        <stock-panel ref="stockPanel" :isEdit="true" :workShow="workShow" @getFormInfo="getFormInfo"></stock-panel>
        <!-- 产品 -->
        <add-products ref="addProducts" :isEdit="true" :detailData="detailmainInfo"></add-products>
      </div>
    </detailModel>
  </div>
</template>

<script>
import api from "@/api/api";
import stockPanel from "./stockPanel";
import addProducts from "./addProducts";
import common from "@/components/mixin/common_mixin";
import detailModel from "./detailModel";
export default {
  name: "addStockOrder",
  components: { stockPanel, addProducts, detailModel },
  mixins: [common],
  props: {
    workShow: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      pageLoading: false,
      wareId: "", // 仓库id
      detailmainInfo: {}, // 出库单表单信息
    };
  },
  created() {
    this.wareId = this.getWarehouseId();
  },
  methods: {
    // 返回列表
    backList() {
      this.$emit("update:workShow", "list");
    },
    // 创建出库单
    async createStockOutList() {
      // 表单验证是否通过
      let mainInfo = await this.$refs.stockPanel.handleSubmit("main"); // 主信息
      if (!mainInfo) return;
      let receiveInfo = await this.$refs.stockPanel.handleSubmit("receiver"); // 收货人
      if (!receiveInfo) return;

      let isTemu = this.detailmainInfo.pickingType === "O11"; // temu出库单类型
      let qualityTestingData = {};
      if (isTemu) {
        let qualityTestingInfo = await this.$refs.stockPanel.handleCommon(
          "qualityTesting",
          "qualityTesting"
        );
        if (!qualityTestingInfo) return;
        qualityTestingData = qualityTestingInfo;
      }
      let product = await this.$refs.addProducts.handleSubmit(); // 产品
      if (!(product && product.length)) return;
      let temp = Object.assign({}, mainInfo); // 主信息
      temp.warehouseId = this.wareId; // 仓库id
      temp.wmsPickingExtend = receiveInfo; // 收货人信息
      temp.wmsPickingDetail = product; // 产品信息
      if (isTemu) temp = Object.assign({}, temp, qualityTestingData);

      // console.log(temp);
      // return;
      this.pageLoading = true;
      this.axios
        .post(api.createFbaPicking, temp)
        .then((res) => {
          if (res.data.code === 0) {
            this.$Message.success("创建成功");
            this.$emit("searchData");
            this.backList();
          } else if (res.data.code == "553803") {
            // 商品库存不足
            // let arr = res.data && res.data.split(',');
            // stockNum = arr || [];
            // console.log(res.data.code);
          }
        })
        .finally(() => {
          this.pageLoading = false;
        });
    },
    // 获取表单信息
    getFormInfo(info) {
      this.detailmainInfo = info || {};
    },
  },
};
</script>

<style lang="less" scoped>
.addstock-main {
  border: 1px solid #e8eaec;
}

.return-back {
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  background: #f9fafb;
  border-bottom: 1px solid #e8eaec;

  >a {
    display: inline-flex;
    align-items: center;
    font-weight: bold;
  }

  .icon {
    font-size: 18px;
  }
}

.addstock-container {
  padding: 0px 16px 10px;
}
</style>
