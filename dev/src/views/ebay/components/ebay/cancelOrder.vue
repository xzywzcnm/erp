<template>
  <div>
    <orderToRetrieve
      ref="cancelOrder" :isCancelOrder="true" :tableColumns="tableColumns"></orderToRetrieve>
    <cancelDelivery
      ref="cancelDelivery" :orderIdList.sync="orderIdList"></cancelDelivery>
  </div>
</template>
<script>
import api from '@/api/api';
import orderToRetrieve from '@/views/commonOrder/components/commonOrder/orderToRetrieve';
import Mixin from '@/components/mixin/common_mixin';
import cancelDelivery from '@/components/common/order/cancelOrder';

export default {
  mixins: [Mixin],
  components: {
    orderToRetrieve,
    cancelDelivery
  },
  data () {
    let self = this;
    return {
      orderIdList: [],
      tableColumns: [
        {
          type: 'selection',
          width: 60,
          fixed: 'left',
          align: 'center'
        }, {
          title: '取消备注',
          width: 140,
          align: 'center',
          key: 'invalidReason'
        }, {
          title: '订单号',
          key: 'salesRecordNumber',
          width: 140,
          align: 'center',
          fixed: 'left',
          render: (h, params) => {
            return h('div', {
              style: {
                color: self.getPermission('orderInfo_detail') ? '#0054A6' : '#515a6e',
                cursor: 'pointer'
              },
              on: {
                click: () => {
                  if (self.getPermission('orderInfo_detail')) {
                    self.$refs.cancelOrder.show(params.row);
                    self.$refs.cancelOrder.orderNo = params.row.accountCode + '-' + params.row.salesRecordNumber;
                    self.$refs.cancelOrder.orderTagList = params.row.orderTagList;
                    self.$refs.cancelOrder.webstoreItemSite = params.row.webstoreItemSite;
                  }
                }
              }
            }, params.row.accountCode + '-' + params.row.salesRecordNumber);
          }
        }, {
          title: '站点',
          key: 'packageCode',
          align: 'center',
          width: 66,
          render: (h, params) => {
            if (params.row.webstoreItemSite !== null) {
              return h('div', {
                attrs: {
                  class: 'nationalFlag nationalFlag' + params.row.webstoreItemSite,
                  title: params.row.webstoreItemSite
                }
              });
            } else {
              return h('div', '');
            }
          }
        }, {
          title: '产品',
          key: 'productList',
          align: 'center',
          resizable: true,
          width: 100,
          render: (h, params) => {
            let data = params.row.productList;
            let pos = [];
            data.forEach((n, i) => {
              let item = self.tableImg(h, params, '', n.pictureUrl, () => {
                self.showPicModal(data);
              });
              if (i < 3) {
                pos.push(item);
                if (i === 2) {
                  pos.push(h('span', {
                    style: {
                      marginLeft: '5px'
                    }
                  }, '...'));
                }
              }
            });
            return h('div', pos);
          }
        }, {
          title: '买家ID/姓名',
          key: 'buyerName',
          align: 'center',
          width: 150,
          render: (h, params) => {
            return h('div', [
              h('div', {
                style: {
                  color: '#0054A6'
                }
              }, params.row.buyerAccountId), h('div', {
                style: {
                  color: '#ff3300'
                }
              }, params.row.buyerName)
            ]);
          }
        }, {
          title: '国家/地区',
          key: 'buyerCountryCode',
          align: 'center',
          width: 100
        }, {
          title: '金额',
          key: 'totalPrice',
          align: 'center',
          width: 100,
          render: (h, params) => {
            return h('div', [
              h('div', params.row.totalPrice), params.row.totalPriceCurrency && h('div', '(' + params.row.totalPriceCurrency + ')')
            ]);
          }
        },

        {
          title: '下单时间',
          key: 'salesTime',
          align: 'center',
          width: 160
        }, {
          title: '付款时间',
          key: 'payTime',
          align: 'center',
          width: 160
        }, {
          title: '标签',
          key: 'tags',
          align: 'center',
          width: 140,
          render: (h, params) => {
            let orderTagList = params.row.orderTagList;
            let pos = [];
            if (orderTagList !== [] && orderTagList !== null) {
              orderTagList.forEach((n, i) => {
                let item = h('div', [
                  h('Icon', {
                    props: {
                      type: 'pricetag',
                      color: '#f00'
                    },
                    style: {
                      marginRight: '5px'
                    }
                  }), h('span', n.tagName)
                ]);
                pos.push(item);
              });
              return h('div', pos);
            }
          }
        }, {
          title: '备注',
          key: 'remarkContent',
          align: 'center',
          resizable: true,
          width: 150
        }, {
          title: '操作',
          key: 'operate',
          align: 'center',
          fixed: 'right',
          width: 250,
          render: (h, params) => {
            if (params.row !== undefined) {
              return h('div', [
                // isInvalid  是否作废 0:未作废 1:手工作废 2:订单任务下载永久作废, 3:手动取消 已取消订单
                //  只有手工作废才能恢复
                /*
                 * isInvalid = 0 的才能作废
                 isInvalid = 0 和  1的 能取消
                 * */
                !self.getPermission('orderInfo_resume') || !(params.row.isInvalid === '1') || h('Button', {
                  props: {
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      self.$Modal.confirm({
                        title: '恢复作废',
                        content: '订单恢复作废后，系统将重新创建发货信息，并执行所有自动规则,是否确定恢复？',
                        onOk () {
                          self.axios.put(api.resume_order + params.row.orderId).then(res => {
                            if (res.data.code === 0) {
                              self.$Message.success('恢复成功');
                              self.$refs.cancelOrder.searchOrder();
                            }
                          });
                        }
                      });
                    }
                  }
                }, '恢复'),
                !self.getPermission('orderInfo_cancelOrder') || params.row.isHand === 1 || !(params.row.isInvalid === '0' || params.row.isInvalid === '1') || h('Button', {
                  props: {
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      self.$refs['cancelDelivery'].cancelDelivery('single', params.row);
                    }
                  }
                }, '取消订单'),
                !self.getPermission('orderInfo_detail') || h('Button', {
                  props: {
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      self.$refs.cancelOrder.show(params.row);
                      self.$refs.cancelOrder.orderNo = params.row.accountCode + '-' + params.row.salesRecordNumber;
                      self.$refs.cancelOrder.orderTagList = params.row.orderTagList;
                      self.$refs.cancelOrder.webstoreItemSite = params.row.webstoreItemSite;
                    }
                  }
                }, '订单详情')
              ]);
            }
          }
        }
      ],
      CancelReasonsList: [],
      cancelValue: ''
    };
  },
  watch: {},
  computed: {},
  methods: {},
  mounted () {
    this.$nextTick(() => {
      this.$refs.cancelOrder.searchOrder();
    });
  }
};
</script>
