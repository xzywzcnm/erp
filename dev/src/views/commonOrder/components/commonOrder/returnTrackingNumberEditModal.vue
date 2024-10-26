<template>
  <Modal
    v-model="modal1"
    title="批量修改退货跟踪号"
    width="1200"
    :loading="loading">
    <Table :columns="columns1" :data="data1"></Table>
    <div slot="footer">
      <Button @click="confirm" type="primary">确定</Button>
      <Button @click="modal1 = false">取消</Button>
    </div>
  </Modal>
</template>

<script>
import Mixin from '@/components/mixin/common_mixin';
import api from '@/api/api';

export default {
  name: 'returnTrackingNumberModal',
  mixins: [Mixin],
  data () {
    let v = this;
    return {
      columns1: [
        {
          title: '订单号',
          key: 'salesRecordNumber',
          align: 'center',
          width: 140,
          render: (h, params) => {
            return h('div', {
              style: {
                color: '#515a6e'
              }
            }, params.row.accountCode + '-' + params.row.salesRecordNumber);
          }
        },
        {
          title: '出库单号',
          key: 'packageCode'
        },
        {
          title: '发货物流商',
          key: 'deliveryProvider'
        },
        {
          title: '发货追踪号',
          key: 'trackingNumber'
        },
        {
          title: '发货时间',
          key: 'despatchTime'
        },
        {
          title: '发货地址信息',
          render (h, params) {
            let country = '';
            v.formValidate.country.forEach(i => {
              if (i.threeCode === params.row.deliveryCountry) {
                country = i.cnName;
              }
            });
            return h('div', [
              h('p', country),
              h('p', params.row.deliveryCity),
              h('p', params.row.deliveryZipCode)
            ]);
          }
        },
        {
          title: '退货物流商',
          key: 'returnCarrier'
        },
        {
          title: '退货追踪号',
          render (h, params) {
            return h('Input', {
              props: {
                value: v.data1[params.index].returnTrackingNumber
              },
              on: {
                'on-change': (e) => {
                  v.data1[params.index].returnTrackingNumber = e.target.value;
                }
              }
            });
          }
        }
      ],
      data1: [],
      modal1: false,
      loading: false
    };
  },
  created () {

  },
  props: {
    orderData: {
      type: Array
    }
  },
  watch: {},
  methods: {
    open (orderIds) {
      this.getCountrys();
      this.getCarrierShippingByOrderId(orderIds);
    },
    getCarrierShippingByOrderId (orderIds) {
      let v = this;
      this.loading = true;
      v.axios.post(api.post_orderInfo_queryByOrderIdForCarrierShippingMethod, orderIds)
        .then(response => {
          this.loading = false;
          if (response.data.code === 0) {
            v.orderData.forEach(i => {
              response.data.datas.forEach(j => {
                if (i.orderId === j.orderId) {
                  j.accountCode = i.accountCode;
                }
              });
            });
            v.data1 = response.data.datas;
            this.modal1 = true;
          }
        });
    },
    confirm () {
      let v = this;
      if (v.data1.length === 0) {
        v.$Message.error('无数据');
        return;
      }
      if (v.data1.every(i => i.returnTrackingNumber !== '' && i.returnTrackingNumber !== null)) {
        v.updateReturnTrackingNumber(v.data1.map(i => {
          return {
            'orderId': i.orderId,
            'orderShippingId': i.orderShippingId,
            'returnTrackingNumber': i.returnTrackingNumber
          };
        }));
      } else {
        v.$Message.error('退货追踪号不能为空');
      }
    },
    updateReturnTrackingNumber (params) {
      let v = this;
      v.axios.post(api.post_orderInfo_updateReturnTrackingNumber, params).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
        }
      });
    }
  }
};
</script>

<style scoped>

</style>
