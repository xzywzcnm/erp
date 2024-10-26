<template>
  <div class="shopTable">
    <Table
      highlight-row border :columns="columns" :data="shopData"></Table>
    <div class="table-page">
      <div class="table-page-right">
        <Page
          :total="total"
          @on-change="changeShopPage"
          show-total
          :page-size="pageParams.pageSize"
          show-elevator
          show-sizer
          @on-page-size-change="changePageSize"
          placement="top"
          :page-size-opts="pageArray"
          :current="curPage"></Page>
      </div>
    </div>
  </div>
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  mixins: [Mixin],
  props: {
    columns: Array,
    pageParams: Object
  },
  data () {
    return {
      shopData: [],
      totalPage: 0,
      total: 0,
      curPage: 1
    };
  },
  methods: {
    getSaleAccountList () {
      let v = this;
      v.axios.post(api.get_ebayAccountList, JSON.stringify(v.pageParams)).then(response => {
        if (response.data.code === 0) {
          let pos = [];
          let data = response.data.datas.list;
          v.$nextTick(function () {
            v.total = Number(response.data.datas.total);
            v.totalPage = Number(response.data.datas.totalPage);
          });
          data.map(n => {
            pos.push({
              num: n.saleAccount.accountCode,
              platform: n.saleAccount.platformId,
              account: n.saleAccount.account,
              impowerStatus: n.ebayStatus,
              deathdate: v.getDataToLocalTime(n.tokenInvalidDate, 'fulltime'),
              originalStatus: n.saleAccount.status,
              saleAccountId: n.ebayAccountId,
              bindTime: v.getDataToLocalTime(n.tokenEffectiveDate, 'fulltime'),
              ebayAccountId: n.ebayAccountId
            });
          });
          v.shopData = pos;
        }
      });
    }
  }
};
</script>
