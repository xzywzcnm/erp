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
          title: 'SKU',
          key: 'goodsSku',
          align: 'center',
          width: 120
        },
        {
          title: 'SPU',
          key: 'spu',
          align: 'center',
          width: 120
        },
        {
          title: '产品',
          key: 'goodsCnDesc',
          align: 'left',
          minWidth: 300,
          render: (h, params) => {
            const row = params.row;
            return h('div', {
              style: { display: 'flex', padding: '2px 0' }
            }, [
              this.tableImg(h, params, 'goodsUrl', row.goodsUrl, () => { }),
              h('div', {
                style: { flex: '100', padding: '5px 0', 'margin-left': '10px' }
              }, [
                h('div', {}, row.goodsCnDesc || ''),
                h('div', {
                  style: { color: 'green' }
                }, row.goodsAttributes || '')
              ])
            ])
          }
        },
        {
          title: '商品状态',
          key: 'goodsStatus',
          align: 'center',
          width: 120,
          render: (h, { row }) => {
            // 0:停售 1:在售 2:试卖 3:清仓 4:促销 5:转季
            const target = { '0': '停售', '1': '在售', '2': '试卖', '3': '清仓', '4': '促销', '5': '转季' };
            return h('div', {}, target[row.goodsStatus] || '')
          }
        },
        {
          title: '未发在途',
          key: 'onWayNoDespatchNumber',
          align: 'center',
          width: 90
        },
        {
          title: '已发在途',
          key: 'onWayDespatchNumber',
          align: 'center',
          width: 90
        },
        {
          title: '可用库存',
          key: 'availableNumber',
          align: 'center',
          width: 90
        }
      ]
    }
  },
  watch: {},
  computed: {
    getTableData () {
      if (!this.sku) return [];
      if (!this.detailsInfo[this.sku]) return [];
      console.log(this.detailsInfo[this.sku]['wmsInventoryList'], 'wmsInventoryList');
      let wmsInventoryList = (this.detailsInfo[this.sku]['wmsInventoryList'] || []).filter(item => {
        return this.sku !== item.goodsSku;
      })
      wmsInventoryList = wmsInventoryList.filter(item => {
        return (item.availableNumber) != 0
      })
      return wmsInventoryList
    }
  },
  created () { },
  mounted () { },
  methods: {}
};
</script>
