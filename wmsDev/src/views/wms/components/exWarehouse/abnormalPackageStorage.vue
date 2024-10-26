<template>
  <div>
    <Tabs v-model="tabName" v-if="!talg_details">
      <Tab-pane label="已回收产品" name="recycled">
        <recycled :tabName="tabName" v-if="tabName === 'recycled'"></recycled>
      </Tab-pane>
      <Tab-pane label="归库单" name="stock">
        <stock :tabName="tabName" @talgDetails="talgDetails" v-if="tabName === 'stock'"></stock>
      </Tab-pane>
    </Tabs>
    <!--列表详情-->
    <div class="list_details" v-else>
      <details-list @backBtn="backBtn" :ProductNumber="ProductNumber"></details-list>
    </div>
  </div>
</template>

<script>
import recycled from './abnormalPackageRecycled';
import stock from './abnormalPackageStock';
import detailsList from './abnormalPackageDetails';

export default {
  data () {
    return {
      tabName: 'recycled',
      talg_details: false,
      ProductNumber: ''
    };
  },
  components: {
    recycled,
    stock,
    'details-list': detailsList
  },
  watch: {
    $route (to, from) {
      if (to.path === '/abnormalPackageStorage') {
        this.talg_details = false;
      }
    }
  },
  methods: {
    // 监听子组件传递过来的值
    talgDetails (talg, data) {
      this.talg_details = talg;
      this.ProductNumber = data.regressProductNumber;
    },
    backBtn (talg) {
      this.talg_details = talg;
    }
  }
};
</script >
