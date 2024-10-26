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
    sku: { type: String, default: '' }
  },
  data () {
    return {
      tableData: [],
      tableColumn: [
        {
          title: '采购单号',
          key: 'purchaseNumber',
          align: 'center',
          width: 150
        },
        {
          title: '采购员',
          key: 'purchaserName',
          align: 'center',
          width: 150
        },
        {
          title: '备货类型',
          key: 'readyType',
          align: 'center',
          width: 150
        },
        {
          title: '下单时间',
          key: 'salesTime',
          align: 'center',
          width: 150
        },
        {
          title: '要求收货时间',
          key: 'requireDespatchTime',
          align: 'center',
          width: 150
        },
        {
          title: '状态',
          key: 'status',
          align: 'center',
          width: 100,
          render: (h, { row }) => {
            const status = { 0: '待确认', 1: '待发货', 2: '加入发货台', 3: '待发物流', 4: '已发物流', 5: '查验完成', 6: '收货完成', 7: '已取消' }
            return h('span', status[row.status] || '')
          }
        },
        {
          title: '下单',
          key: 'salesNumber',
          align: 'center',
          width: 80
        },
        {
          title: '发货',
          key: 'despatchNumber',
          align: 'center',
          width: 80
        },
        {
          title: '收货',
          key: 'despatchNumber',
          align: 'center',
          width: 80,
          render: (h, { row }) => {
            const qualityNumber = !this.$common.isEmpty(Number(row.qualityNumber)) ? Number(row.qualityNumber) : 0;
            const substandardNumber = !this.$common.isEmpty(Number(row.substandardNumber)) ? Number(row.substandardNumber) : 0;
            return h('span', qualityNumber + substandardNumber);
          }
        },
        {
          title: '未收',
          key: 'notReceivedNumber',
          align: 'center',
          width: 80
        },
        {
          title: '发货物流',
          key: 'logisticsName',
          align: 'center',
          minWidth: 120,
          render: (h, { row }) => {
            return h('span', `${row.logisticsName || ''}${row.trackingNumber ? `-${row.trackingNumber}` : ''}`);
          }
        },
        {
          title: '跟单备注',
          key: 'followRemark',
          align: 'center',
          minWidth: 200
        }
      ],
      readyType: {
        0: '急采',
        1: '普通备货',
        2: '海外仓备货',
        3: 'FBA备货'
      }
    }
  },
  watch: {},
  computed: {
    getTableData () {
      if (!this.sku) return [];
      if (!this.detailsInfo[this.sku]) return [];
      if (this.detailsInfo[this.sku]['orderInfoList'].length != 0) {
        this.detailsInfo[this.sku]['orderInfoList'].forEach(item => {
          if (typeof (item.readyType) == 'string') return
          item.readyType = this.readyType[item.readyType]
        })
      }
      return (this.detailsInfo[this.sku]['orderInfoList'] || []).filter(item => {
        return this.sku === item.skuNo;
      });
    }
  },
  created () { },
  mounted () { },
  methods: {}
};
</script>
