<template >
  <div >
    <commonManage
        :tableColumn="tableColumn"
        :exportApi="exportApi"
        exportParams="wmsOutstoreInventoryId"
        :productSyncApi="productSyncApi"
        :getListApi="getListApi" ></commonManage >
  </div >
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import commonManage from '@/views/wms/components/overseasWarehouseCompont/manageCommon';

export default {
  mixins: [Mixin],
  components: {
    commonManage
  },
  data () {
    return {
      exportApi: api.wmsOutstoreInventoryExport,
      productSyncApi: api.wmsOutstoreInventorySync,
      getListApi: api.wmsOutstoreInventoryQuery,
      tableColumn: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        }, {
          title: '图片',
          key: 'goodsUrl',
          align: 'center',
          width: 100,
          render: (h, params) => {
            let imgUrlPrefix = this.$store.state.imgUrlPrefix;
            return h('img', {
              attrs: {
                src: params.row.goodsUrl === '' || params.row.goodsUrl === null || params.row.goodsUrl === undefined
                     ? this.placeholderSrc
                     : imgUrlPrefix + params.row.goodsUrl
              },
              style: {
                width: '48px',
                height: '48px',
                border: '1px solid #d7dde4',
                padding: '4px',
                marginRight: '8px',
                marginTop: '6px',
                cursor: 'pointer'
              }
            });
          }
        }, {
          title: '商品编码', // 商品编码
          key: 'productCode',
          align: 'center',
          minWidth: 200
        }, {
          title: 'SKU库存批次号', // SKU库存批次号
          key: 'batchNo',
          align: 'center',
          minWidth: 200,
          render (h, params) {
            let text = JSON.parse(params.row.paramJson).batch_no || '';
            return h('span', text);
          }
        }, {
          title: '可用库存', // 可用库存
          key: 'availQty',
          align: 'center',
          minWidth: 200
        }, {
          title: '待出库存', // 待出库存
          key: 'waitingShipQuantity',
          align: 'center',
          minWidth: 200
        }, {
          title: '在途库存', // 在途库存
          key: 'intransitQty',
          align: 'center',
          minWidth: 200
        }, {
          title: '库存质量', // 库存质量
          key: 'stockQuality',
          align: 'center',
          minWidth: 200,
          render (h, params) {
            let text = JSON.parse(params.row.paramJson).stockQuality || '';
            return h('span', text);
          }
        }
      ]
    };
  }
};
</script >
