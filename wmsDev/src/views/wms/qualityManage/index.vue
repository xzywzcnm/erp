<template>
  <div class="qualityManage-page">
    <Tabs :value="tabActive" :animated="false" @on-click="tabsClick">
      <TabPane label="质检" name="1">
        <quality-test v-if="activeList.includes('1')" :qualitySkuData="qualitySkuData" :warehouseId="warehouseId"
          @qualityScan="qualityScan" :tab="tabActive">
        </quality-test>
      </TabPane>
      <TabPane label="质检记录" name="2">
        <quality-inspection-records v-if="activeList.includes('2')" @recordQuality="recordQuality"
          :warehouseId="warehouseId" :sku.sync="sku" :tab="tabActive">
        </quality-inspection-records>
      </TabPane>
      <TabPane label="质检单" name="3">
        <quality-inspection-document v-if="activeList.includes('3')" :warehouseId="warehouseId" :tab="tabActive">
        </quality-inspection-document>
      </TabPane>
      <!-- <TabPane label="处理单" name="4">
        <processing-sheet v-if="activeList.includes('4')" :warehouseId="warehouseId" :tab="tabActive">
        </processing-sheet>
      </TabPane> -->
    </Tabs>
  </div>
</template>
<script>
import qualityTest from './components/qualityTest';
import qualityInspectionRecords from './components/qualityInspectionRecords';
import qualityInspectionDocument from './components/qualityInspectionDocument';
// import processingSheet from './components/processingSheet';
import { getWarehouseId } from '@/utils/getService';
export default {
  name: "qualityManage",
  components: { qualityTest, qualityInspectionRecords, qualityInspectionDocument },
  data() {
    return {
      tabActive: '', // 选中的tab页
      activeList: [], // 打开过的tab页
      qualitySkuData: {}, // 要质检的sku信息
      warehouseId: getWarehouseId(), // 仓库id
      sku: '', // 质检扫描页面的sku
    }
  },
  created() {
    this.tabsClick('1');
  },
  methods: {
    tabsClick(e) {
      this.tabActive = e;
      !this.activeList.includes(e) && this.activeList.push(e);
    },
    // 质检(由质检单回调)
    recordQuality(row) {
      this.qualitySkuData = {};
      this.$nextTick(() => {
        this.tabsClick('1');// 将tab放回质检页
        this.qualitySkuData = this.$common.copy(row);
      })
    },
    qualityScan(sku) {
      this.sku = sku;
      this.tabsClick('2');// 将tab放回质检记录
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

  .ivu-tabs {
    height: 100%;
    display: flex;
    flex-direction: column;

    .ivu-tabs-content {
      flex: 1;
      overflow: hidden;

      .ivu-tabs-tabpane {
        height: 100%;
      }
    }
  }
}
</style>
