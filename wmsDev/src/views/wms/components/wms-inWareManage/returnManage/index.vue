<template >
  <div class="returnManage">
    <div class="tabs-p10">
      <Tabs v-model="tabsName" v-if="!isDetails">
        <TabPane label="退货收货" name="returnReceipt"></TabPane>
        <TabPane label="待退供处理" name="waitHandle"></TabPane>
        <TabPane label="退货单" name="list"></TabPane>
      </Tabs>
      <!-- 退货收货 -->
      <template v-if="tabsName === 'returnReceipt'">
        <returnReceipt></returnReceipt>
      </template>
      <!-- 待退供处理 -->
      <template v-if="tabsName === 'waitHandle'">
        <waitForProcessing></waitForProcessing>
      </template>
      <!-- 退货单 -->
      <template v-if="tabsName === 'list'">
        <returnOrder @openDetails="openDetails"></returnOrder>
      </template>
    </div>
  </div>
</template>
<script>
import returnReceipt from './returnReceipt.vue';
import waitForProcessing from './waitForProcessing.vue';
import returnOrder from './returnOrder.vue';
export default {
  components: { returnReceipt, waitForProcessing, returnOrder },
  data() {
    return {
      tabsName: 'returnReceipt', // 当前tabItem
      isDetails: false, // 是否查看详情页面
    }
  },
  methods: {
    openDetails(val) {
      this.isDetails = val
    }
  }
}
</script>
<style lang="less">
.returnManage {
  display: flex;
  flex-direction: column;

  &,
  .tabs-p10 {
    height: 100%;
  }

  .tabs-p10 {
    display: flex;
    flex-direction: column;
  }
}
</style>