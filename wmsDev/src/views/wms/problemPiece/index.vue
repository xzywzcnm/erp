<template>
  <div class="qualityManage-page">
    <Tabs :value="tabActive" :animated="false" @on-click="tabsClick">
      <TabPane label="待处理" name="1">
        <pendingProcess v-if="activeList.includes('1')" :warehouseId="warehouseId" :tab="tabActive" />
      </TabPane>
      <TabPane label="处理中" name="2">
        <processing-sheet v-if="activeList.includes('2')" :warehouseId="warehouseId" :tab="tabActive">
        </processing-sheet>
      </TabPane>
      <TabPane label="处理完结" name="3">
        <processing-sheet v-if="activeList.includes('3')" :warehouseId="warehouseId" :tab="tabActive">
        </processing-sheet>
      </TabPane>
    </Tabs>
  </div>
</template>
<script>
import pendingProcess from './components/pendingProcess';
import processingSheet from './components/processingSheet';
import { getWarehouseId } from '@/utils/getService';
export default {
  name: "qualityManage",
  components: { pendingProcess, processingSheet },
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
