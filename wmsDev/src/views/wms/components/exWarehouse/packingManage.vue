<template>
  <div class="tabs_box">
    <Tabs v-model="tabsName" :animated="false" @on-click="changetabBox">
      <!--箱/袋管理-->
      <TabPane label="箱/袋管理" name="packingManage">
        <packingList v-if="tabsName === 'packingManage'" @changeTabs="changeTabs"></packingList>
      </TabPane>
      <!--扫描装箱-->
      <TabPane label="扫描装箱" name="scanPacking">
        <scanPacking v-if="tabsName === 'scanPacking'" :pickupOrderNumber="pickupOrderNumber" @changeTabs="changeTabs"
          :type="type"></scanPacking>
      </TabPane>
    </Tabs>
  </div>
</template>
<style>
.tabs_box {
  padding: 0 12px;
}
</style>
<script>
import packingList from './packingList';
import scanPacking from './scanPacking';

export default {
  name: 'packingManage',
  data () {
    return {
      tabsName: 'packingManage',
      pickupOrderNumber: null,
      type: 'scanning' // continue: 继续装箱， scanning：扫描装箱，adding：新增
    };
  },
  methods: {
    // 切换tabs 栏时，要重置数据
    changetabBox (value) {
      if (value === 'packingManage') {
        this.pickupOrderNumber = null;
        this.type = 'scanning';
      }
    },
    // 切换到扫描、新增箱\袋、继续装箱
    changeTabs (data) {
      this.tabsName = data.value;
      if (data.pickupOrderNumber) {
        this.pickupOrderNumber = data.pickupOrderNumber;
      }
      this.type = data.type;
    }
  },
  components: {
    packingList,
    scanPacking
  }
};
</script>
