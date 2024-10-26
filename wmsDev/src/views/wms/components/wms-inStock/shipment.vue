<template >
  <div>
    <Table :columns="columns" :data="shipmentData" @on-row-click="rowClick" highlight-row></Table>
    <Table class="mt20" :columns="columns1" :data="data1"></Table>
  </div>
</template>

<script>
// import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  name: 'shipment',
  mixins: [Mixin],
  data () {
    let v = this;
    return {
      columns: [
        {
          // SHIPMENT ID
          title: 'SHIPMENT ID',
          key: 'shipmentId',
          align: 'center',
          minWidth: 150
        }, {
          title: 'SHIPMENT NAME',
          key: 'shipmentName',
          align: 'center',
          minWidth: 150,
          render (h, params) {
            return h('Input', {
              props: {
                value: params.row.shipmentName
              },
              style: {
                width: '120px',
                margin: '0 auto'
              },
              on: {
                'on-change' (val) {
                  v.shipmentData[params.index].shipmentName = val.target.value;
                  v.$emit('updateData', v.shipmentData);
                }
              }
            });
          }
        }, {
          title: '仓库',
          key: 'name',
          align: 'center',
          minWidth: 150,
          render (h, params) {
            return h('span', params.row.shipToAddress.name);
          }
        }, {
          title: '仓库地址',
          key: 'shipmentName',
          align: 'center',
          minWidth: 150,
          render (h, params) {
            let data = params.row.shipToAddress;
            let text = data.addressLine1 + ' ' + data.addressLine2 + ' ' + data.districtOrCounty + ' ' + data.city + ' ' + data.provinceCode + ' ' + data.postalCode + ' ' + data.countryCode;
            return h('div', {}, [h('p', data.name), h('p', text)]);
          }
        }, {
          title: '状态',
          key: 'status',
          align: 'center',
          minWidth: 150,
          render (h, parmas) {
            return h('span', '等待确认'); // 等待确认 写死
          }
        }, {
          title: '操作',
          key: 'operation',
          align: 'center',
          minWidth: 150,
          render (h, params) {
            return h('Button', {
              props: {
                size: 'small',
                type: 'error'
              },
              on: {
                'click' () {
                  v.isDelModal(() => {
                    v.shipmentData.splice(params.index, 1);
                    if (v.shipmentData.length > 0) {
                      v.data1 = v.shipmentData[0].itemList;
                    } else {
                      v.data1 = [];
                    }
                    v.$emit('updateData', v.shipmentData);
                    v.$emit('deleteData', params.row.itemList);
                  }, () => { }, '确认是否删除，提示：这个运输计划不会被创建');
                }
              }
            }, '删除');
          }
        }
      ],
      columns1: [
        {
          title: '商品图片',
          align: 'center',
          width: 100,
          render (h, params) {
            return v.tableImg(h, params, 'goodsUrl');
          }
        }, {
          title: 'LAPA SKU/产品名称',
          key: 'goodsSku',
          align: 'center',
          minWidth: 150,
          render: (h, params) => {
            return h('div', [h('div', params.row.goodsSku), h('div', params.row.goodsCnDesc)]);
          }
        }, {
          title: '计划调拨数量',
          key: 'allotInventoryNumber',
          align: 'center',
          minWidth: 150
        }, {
          title: 'ASIN/MSKU',
          key: 'asin',
          align: 'center',
          minWidth: 150,
          render: (h, params) => {
            if (params.row.asin && params.row.sellerSku) {
              return h('div', [h('div', params.row.asin), h('div', params.row.sellerSku)]);
            } else {
              return h('div', {
                style: {
                  color: '#008000'
                }
              }, '未关联');
            }
          }
        }, {
          title: '申报数量',
          key: 'quantity',
          align: 'center',
          minWidth: 150
        }
      ],
      data: [],
      data1: []
    };
  },
  created () {

  },
  props: {
    shipmentData: {
      type: Array
    },
    timeStamp: {
      type: Number
    }
  },
  watch: {
    'timeStamp': {
      immediate: true,
      handler (n, o) {
        if (n && n !== o) {
          this.data1 = this.shipmentData[0].itemList;
        }
      }

    }
  },
  methods: {
    rowClick (data) {
      this.data1 = data.itemList;
    }
  }
};
</script>

<style scoped>
</style>
