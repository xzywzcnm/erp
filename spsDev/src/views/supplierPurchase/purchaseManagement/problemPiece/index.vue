<template>
  <div class="qualityManage-page">
    <Tabs :value="tabActive" :animated="false" @on-click="tabsClick">
      <TabPane label="待处理" name="1">
        <pendingProcess v-if="activeList.includes('1')" :tab="tabActive" :businessDeptInfoList="businessDeptInfoList"
          :purchaserList="purchaserList" />
      </TabPane>
      <TabPane label="处理中" name="2">
        <processing-sheet v-if="activeList.includes('2')" :tab="tabActive" :businessDeptInfoList="businessDeptInfoList"
          :purchaserList="purchaserList">
        </processing-sheet>
      </TabPane>
      <TabPane label="处理完结" name="3">
        <processing-sheet v-if="activeList.includes('3')" :tab="tabActive" :businessDeptInfoList="businessDeptInfoList"
          :purchaserList="purchaserList">
        </processing-sheet>
      </TabPane>
    </Tabs>
  </div>
</template>
<script>
import api from '@/api/api';
import pendingProcess from './components/pendingProcess';
import processingSheet from './components/processingSheet';
// import { getWarehouseId } from '@/utils/getService';
export default {
  name: "qualityManage",
  components: { pendingProcess, processingSheet },
  data() {
    return {
      tabActive: '', // 选中的tab页
      activeList: [], // 打开过的tab页
      qualitySkuData: {}, // 要质检的sku信息
      // warehouseId: getWarehouseId(), // 仓库id
      sku: '', // 质检扫描页面的sku
      businessDeptInfoList: [],
      purchaserList: [],
    }
  },
  created() {
    this.tabsClick('1');
    this.getBusinessDeptInfo();
    this.getPurchaserList();
  },
  methods: {
    tabsClick(e) {
      this.tabActive = e;
      !this.activeList.includes(e) && this.activeList.push(e);
    },
    getBusinessDeptInfo() {
      this.axios
        .post("/sps-service/sps/common/businessDeptInfo")
        .then((res) => {
          this.businessDeptInfoList = res.data.datas || [];
        });
    },
    getPurchaserList() {
      this.axios.get(api.get_userInfoCommon).then(res => {
        if (res.data.code == 0) {
          this.purchaserList = Object.values(res.data.datas || {});
        }
      })
    },
  },
  activated() {
    this.activeList = [];
    this.tabsClick(this.tabActive);
  },
}
</script>
<style lang="less">
.qualityManage-page {
  height: 100%;
  background-color: #fff;

  .ivu-tabs {
    height: 100%;
    display: flex;
    flex-direction: column;

    .ivu-tabs-bar {
      padding: 0 10px;
    }

    .ivu-tabs-content {
      flex: 1;
      overflow: hidden;

      .ivu-tabs-tabpane {
        height: 100%;
      }
    }
  }

  .funMain {
    padding: 10px 0;
    background-color: #f5f7f9;

    .funMain__flex {
      padding: 10px;
      background-color: #fff;
    }
  }
}
</style>
