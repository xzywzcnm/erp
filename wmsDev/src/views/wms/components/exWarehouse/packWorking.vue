<template>
  <div class="tabs_box">
    <Tabs v-model="tabsName" :animated="false">
      <!--拣货复核-->
      <TabPane label="拣货复核" name="pickingReview">
        <picking-review v-if="tabsName === 'pickingReview'"></picking-review>
      </TabPane>
      <!--包装作业-->
      <TabPane label="包装作业" name="packagingOperation">
        <packaging-operation v-if="tabsName === 'packagingOperation'"></packaging-operation>
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
import pickingReview from './pickingReview';
import packagingOperation from './packagingOperation';

export default {
  data () {
    return {
      tabsName: 'pickingReview'
    };
  },
  components: {
    pickingReview,
    packagingOperation
  }
};
</script>
