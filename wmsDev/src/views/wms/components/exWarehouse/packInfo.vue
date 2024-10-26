<template>
  <div>
    <Table border :columns="columns" :data="data" :show-header="false"></Table>
  </div>
</template>
<script>
export default {
  props: ['fatherTableData'],
  data () {
    return {
      columns: [
        {
          title: 'text',
          key: 'text'
        }, {
          title: 'num',
          key: 'num'
        }
      ],
      data: [
        {
          text: '出库单数' + ':',
          num: 0
        }, {
          text: '订单数' + ':',
          num: 0
        }, {
          text: 'SKU品种数' + ':',
          num: 0
        }, {
          text: '货品总数' + ':',
          num: 0
        }
      ]
    };
  },
  computed: {},
  watch: {
    fatherTableData: function (newVal) {
      if (newVal.length === 0) {
        this.data = [
          {
            text: '出库单数' + ':',
            num: 0
          }, {
            text: '订单数' + ':',
            num: 0
          }, {
            text: 'SKU品种数' + ':',
            num: 0
          }, {
            text: '货品总数' + ':',
            num: 0
          }
        ];
      } else {
        this.data = [
          {
            text: '出库单数' + ':',
            num: newVal.wmsPickingNumber === null ? 0 : newVal.wmsPickingNumber
          }, {
            text: '订单数' + ':',
            num: newVal.orderNumber === null ? 0 : newVal.orderNumber
          }, {
            text: 'SKU品种数' + ':',
            num: newVal.skuNumber === null ? 0 : newVal.skuNumber
          }, {
            text: '货品总数' + ':',
            num: newVal.goodsNumber === null ? 0 : newVal.goodsNumber
          }
        ];
      }
    }
  }
};
</script>
