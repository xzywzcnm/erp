<template>
  <div class="goodsMissingTable">
    <Table highlight-row border :columns="tableColumn" :data="getTableData" />
  </div>
</template>
<script>
import Mixin from '@/components/mixin/common_mixin';
import orderSys from '@/components/mixin/orderSys_mixin';

export default {
  name: 'goodsMissingTable',
  components: {},
  mixins: [Mixin, orderSys],
  props: {
    componentData: { type: Object, default: () => { return {} } },
    skuDetails: { type: Object, default: () => { return {} } },
    detailsInfo: { type: Object, default: () => { return {} } },
    inventoryDelivery: { type: Object, default: () => { return {} } },
    accountCode: { type: Object, default: () => { return {} } },
    sku: { type: String, default: '' }
  },
  data () {
    return {
      tableColumn: [
        {
          title: '付款时间',
          key: 'payTime',
          align: 'center',
          minWidth: 150,
          render (h, { row }) {
            return h('span', row.payTime ? row.payTime.substr(0, 19) : '');
          }
        },
        {
          title: '平台',
          key: 'platformId',
          align: 'center',
          minWidth: 90
        },
        {
          title: '账号',
          key: 'accountCode',
          align: 'center',
          minWidth: 120,
          render: (h, { row }) => {
            const accountCode = this.accountCode[`${row.saleAccountId}`] ? this.accountCode[`${row.saleAccountId}`].accountCode || '' : '';
            return h('span', `${accountCode || ''}`);
          }
        },
        {
          title: '订单号',
          key: 'salesRecordNumber',
          align: 'center',
          minWidth: 190,
          render: (h, { row }) => {
            const accountCode = this.accountCode[`${row.saleAccountId}`] ? this.accountCode[`${row.saleAccountId}`].accountCode || '' : '';
            return accountCode ? h('span', `${accountCode}-${row.salesRecordNumber}`) : h('span', `${row.salesRecordNumber}`)
          }
        },
        {
          title: '发货剩余',
          key: 'shippingLimiteTime',
          align: 'center',
          minWidth: 120,
          render: (h, { row }) => {
            let time = '';
            if (row.synDeliverStatus == 3) {
              time = '已发货，标发货时间：' + this.getDataToLocalTime(row.synDeliverDate, 'fulltime');
            }
            time = this.computedTime(row.remainTime);
            return h('span', time);
          }
        },
        {
          title: '商品缺货数量',
          key: 'quantity',
          align: 'center',
          minWidth: 110
        }
      ]
    }
  },
  watch: {},
  computed: {
    getTableData () {
      if (this.detailsInfo['goodsMissing'] && this.detailsInfo['goodsMissing'][this.sku]) {
        return (this.detailsInfo['goodsMissing'][this.sku] || []).filter(item => {
          return item.orderId !== this.componentData.orderId
        })
      }
      return [];
    }
  },
  created () {},
  mounted () {},
  methods: {}
};
</script>
