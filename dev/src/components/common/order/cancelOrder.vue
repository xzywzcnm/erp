<template >
  <!-- 取消订单 -->
  <keep-alive>
    <Modal :loading="true" v-model="cancelDeliveryModel.status" :mask-closable="false" v-if="cancelDeliveryStatus" width="560">
      <div class="ivu-modal-confirm">
        <div class="ivu-modal-confirm-head">
          <div class="ivu-modal-confirm-head-title">{{ cancelDeliveryModel.title }}</div>
        </div>
        <div class="ivu-modal-confirm-body ivu-modal-confirm-body-render">
          <div class="normalTop">
            <Row v-if="isCancelPlat.includes(platform)">
              <Col :span="1">
              <Icon type="ios-information-circle-outline" color="#2b85e4" size="36"></Icon>
              </Col>
              <Col :span="21" :offset="2">
              <p>{{ `批量取消订单系统将自动调用${platform || ''}接口取消订单，并同时给买家退款。` }}</p>
              </Col>
            </Row>
            <Form ref="cancelOrderForm" :label-width="120" :rules="formRule" :model="cancelDeliveryModel"
              class="noramlTop cancelOrderForm setAllMarkRead">
              <Form-item label="类型" prop="cancelType">
                <dyt-select style="width: 85%" v-model="cancelDeliveryModel.cancelType" :clearable="false"
                  @on-change="changeCancelType">
                  <Option v-for="item in cancelTypeList" :key="item.value" :value="item.value">{{ item.label }}</Option>
                </dyt-select>
                <Tooltip content="作废订单只在LAPA系统内作废，而取消订单在作废的同时，还会去平台取消订单" placement="top" transfer>
                  <Icon class="ml10" size="22" type="md-help-circle" />
                </Tooltip>
              </Form-item>
              <Form-item
                prop="cancelReason"
                label="原因"
                v-if="cancelDeliveryModel.cancelType === 2 && !showReasonPlat.includes(platform)"
              >
                <dyt-select v-model="cancelDeliveryModel.cancelReason" value="ADDRESS_ISSUE">
                  <Option v-for="item in cancelReasonList" :key="item.value" :value="item.value">{{ item.label }}</Option>
                </dyt-select>
              </Form-item>
              <Form-item label="LAPA作废原因:" prop="invalidReason">
                <dyt-select v-model="cancelDeliveryModel.invalidReason">
                  <Option v-for="(item, index) in reasonListT" :key="index" :value="item.paramKey" :label="item.paramKey" />
                </dyt-select>
              </Form-item>
            </Form>
          </div>
        </div>
      </div>
      <div slot="footer">
        <Button @click="cancelDeliveryModel.status = false">取 消</Button>
        <Button @click="setCancelDelivery" type="primary">确 定</Button>
      </div>
      <Spin v-if="cancelOrderFormLoad" fix></Spin>
    </Modal>
  </keep-alive>
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  mixins: [Mixin],
  data() {
    return {
      cancelTypeList: [],
      cancelDeliveryModel: {
        cancelType: 2, // 1 作废订单 2 取消订单
        status: false,
        cancelReason: '',
        invalidReason: '',
        title: '',
        type: ''
      },
      cancelOrderFormLoad: false,
      cancelDeliveryStatus: false,
      singleOrder: '',
      pageType: null,
      reasonListT: [],
      isCancelPlat: ['ebay', 'ozon', 'otto', 'wish', 'sheinx'],
      showReasonPlat: ['otto', 'sheinx'],
      formRule: {
        invalidReason: [
          { required: true, message: '请选择LAPA作废原因', trigger: 'change' }
        ],
        cancelReason: [
          { required: true, message: '请选择取消原因', trigger: 'change' }
        ]
      }
    };
  },
  props: {
    orderIdList: Array,
    inPage: String,
    platformId: { type: Array, default: () => { return [] } },
  },
  watch: {
    'cancelDeliveryModel.status': {
      deep: true,
      handler(val) {
        if (val) {
          this.getReasonList();
        } else {
          this.resetCancelDelivery();
        }
      }
    }
  },
  computed: {
    cancelReasonList() {
      const defaultReasonList = [
        'BUYER_ASKED_CANCEL',
        'BUYER_CANCEL_OR_ADDRESS_ISSUE',
        'ADDRESS_ISSUES',
        'ORDER_UNPAID',
        'OUT_OF_STOCK_OR_CANNOT_FULFILL',
      ];
      let temp = defaultReasonList.map(k => { return { label: k, value: k } });
      /*
       * Ozon平台对接平台取消订单功能以及新增状态异常数据纠正功能
       * 需求：http://192.168.91.3/www/index.php?m=task&f=view&taskID=9436
      */
      if (['ozon'].includes(this.platform)) {
        let list = [
          {
            value: '352',
            label: '商品无库存'
          },
          {
            value: '400',
            label: '只剩下有缺陷的商品'
          },
          {
            value: '401',
            label: '仲裁取消'
          },
          {
            value: '402',
            label: '其他原因'
          },
          {
            value: '665',
            label: '买家没有收货'
          },
          {
            value: '666',
            label: '在该地区没有快递'
          },
          {
            value: '667',
            label: '订单被快递弄丢'
          },
        ]
        // temp.push(...list);
        temp = list;
      }
      return temp;
    },
    platform () {
      return this.platformId[0] || this.$store.state.fullInGroup || this.inGroup;
    },
  },
  methods: {
    getReasonList() {
      // 获取售后原因列表
      this.axios.get(api.get_afterSalesOrderReason).then(res => {
        if (res.data.code === 0) {
          this.reasonListT = res.data.datas || [];
        }
      });
    },
    changeCancelType() {
      if (this.cancelDeliveryModel.cancelType === 1) {
        this.cancelDeliveryModel.cancelReason = '';
      }
    },
    setCancelDelivery(confirm, lastParams) {
      this.$refs.cancelOrderForm.validate((valid) => {
        if (!valid && !lastParams) return;
        // this.cancelOrderFormLoad = true;
        let obj;
        let url = api.cancel_delivery;
        if (this.inPage === 'nonPayment') {
          url = api.set_cancelOrderForNonPayment;
        }
        let orderIdList = null;
        if (this.cancelDeliveryModel.type === 'single') {
          orderIdList = [this.singleOrder];
          obj = {
            platformId: [this.platformType],
            orderIdList: [this.singleOrder],
            cancelReason: this.cancelDeliveryModel.cancelReason,
            invalidReason: this.cancelDeliveryModel.invalidReason
          };
        } else {
          orderIdList = this.orderIdList;
          obj = {
            platformId: [this.platformType],
            orderIdList: this.orderIdList,
            cancelReason: this.cancelDeliveryModel.cancelReason,
            invalidReason: this.cancelDeliveryModel.invalidReason
          };
        }
        obj.cancelType = this.isCancelPlat.includes(this.platform) ? this.cancelDeliveryModel.cancelType : 1;
        if (typeof confirm === 'number' && confirm === 1) {
          obj = lastParams;
          obj.confirm = 1;
        } else {
          delete obj.confirm;
        }
        this.axios.put(url, JSON.stringify(obj)).then(response => {
          this.cancelOrderFormLoad = false;
          if (response.data.code === 0) {
            let dataList = response.data.datas;
            if (dataList !== null && dataList.length === 0) {
              this.$Message.success('操作成功');
              // this.cancelDeliveryModel.status = false;
              if (this.pageType === 0) {
                this.$parent.updateStatus = true;
                if (this.inPage !== null) {
                  this.$parent.$parent.$parent.combineOrderData = [];
                  this.$parent.$parent.$parent.getCombineData();
                }
              } else {
                this.$parent.pageParamsStatus = true;
                this.$parent.$parent.$parent.orderDetails = false;
                this.$parent.$parent.$parent.pageParamsStatus = true;
              }
              if (this.cancelDeliveryModel.type === 'single') {
                // this.orderIdList = [];
                this.$emit('update:orderIdList', []);
              }
            } else {
              dataList.forEach((n, i) => {
                let orderList = n.others;
                if (n.code === 110602) {
                  this.$Message.error(`${this.isCancelPlat.includes(this.platform) ? '取消' : '作废'}订单失败`);
                  this.$parent.pageParamsStatus = true;
                } else if (n.code === 999993) {
                  this.$Message.error(n.message);
                  this.$parent.pageParamsStatus = true;
                } else if (n.code === 111172) {
                  // 第三方仓 是否强制作废
                  this.$Modal.confirm({
                    title: '作废订单失败',
                    content: '尝试作废第三方仓发货订单失败，强制作废订单第三方服务商可能仍会发货，是否继续？',
                    onOk() {
                      let obj1 = {
                        platformId: [this.platformType],
                        orderIdList: orderIdList,
                        cancelReason: this.cancelDeliveryModel.cancelReason,
                        invalidReason: this.cancelDeliveryModel.invalidReason,
                        compel: 1 // 是否强制作废 0否 1强制作废
                      };
                      obj1.cancelType = this.isCancelPlat.includes(this.platform) ? this.cancelDeliveryModel.cancelType : 1;
                      this.axios.put(url, JSON.stringify(obj1)).then(response => {
                        if (response.data.code === 0) {
                          if (response.data.datas && response.data.datas.length > 0) {
                            if (n.code === 110602) {
                              this.$Message.error(`${this.isCancelPlat.includes(this.platform) ? '取消' : '作废'}订单失败`);
                            } else {
                              this.$Message.error(n.message.replace(/[\s\S]*:?(.*?)at[\s\S]*/g, '$1'));
                            }
                          } else {
                            this.$Message.success('操作成功');
                            // this.cancelDeliveryModel.status = false;
                          }
                        } else {
                          (!response.data || ![999993, '999993'].includes(response.data.code)) && this.$Message.error('操作失败，请重新尝试');
                        }
                      });
                    }
                  });
                } else if (n.code === 110241) {
                  this.$Modal.confirm({
                    title: '提示',
                    content: '多订单一包裹取消此订单将会把该订单从 {orderList} 这几个订单所在的包裹中抽离'.replace('{orderList}', orderList.toString()),
                    okText: '确认',
                    cancelText: '取消',
                    onOk: () => {
                      setTimeout(() => {
                        this.$Modal.remove();
                        this.setCancelDelivery(1, obj);
                      }, 2000);
                    }
                  });
                } else {
                  // this.cancelDeliveryModel.status = false;
                }
              });
            }
          } else {
            (!response.data || ![999993, '999993'].includes(response.data.code)) && this.$Message.error('操作失败，请重新尝试');
          }
        }).catch(() => {
          // this.cancelOrderFormLoad = false;
        })
        this.cancelDeliveryModel.status = false;
      })
    },
    resetCancelDelivery() {
      this.$refs.cancelOrderForm && this.$refs.cancelOrderForm.resetFields();
      this.cancelDeliveryModel.invalidReason = '';
      this.cancelDeliveryModel.cancelReason = 'BUYER_ASKED_CANCEL';
    },
    cancelDelivery(type, params, pageType) {
      let v = this;
      v.resetCancelDelivery();
      v.cancelDeliveryStatus = true;
      if (params) {
        v.singleOrder = params.orderId;
        /*  是否作废 0:未作废 1:手工作废 2:订单任务下载永久作废, 3:手动取消 已取消订单
         * isInvalid = 0 的才能作废
         isInvalid = 0 和  1的 能取消
         * 前提条件，订单未发货（状态不等于7） deliveryStatus
         'ebay', 'ozon', 'otto', 'wish', 'sheinx'
         未做过作废订单 取消类型可以选值为两个：作废订单、取消订单
         取消类型选择作废订单 取消类型可以选值为一个：取消订单

         其他平台
         未做过作废订单 取消类型可以选值为一个：作废订单
         * */
        if ([1, '1'].includes(params.isInvalid)) {
          if (v.isCancelPlat.includes(v.platform) && params.isHand === 0) {
            v.cancelTypeList = [ { value: 2, label: '取消订单' } ];
          } else {
            v.cancelTypeList = [];
          }
          v.cancelDeliveryModel.cancelType = 2;
        } else {
          v.cancelTypeList = [ { value: 1, label: '作废订单' } ];
          if ([0, '0'].includes(params.isInvalid) && v.isCancelPlat.includes(v.platform)) {
            v.cancelTypeList.push({ value: 2, label: '取消订单' });
          }
          v.cancelDeliveryModel.cancelType = 1;
        }
      }
      if (pageType) v.pageType = pageType;
      if (type !== 'single' && (v.orderIdList.length === 0 || v.orderIdList === null)) {
        v.$Message.error('请选择订单');
        return false;
      }
      if (type !== 'single') {
        if (!v.isCancelPlat.includes(v.platform)) {
          v.cancelDeliveryModel.cancelType = 1;
        }
        if (v.orderIdList.every(i => i.isInvalid === '1')) {
          if (v.isCancelPlat.includes(v.platform)) {
            v.cancelTypeList = [ { value: 2, label: '取消订单' } ];
          } else {
            v.cancelTypeList = [];
          }
        } else {
          v.cancelTypeList = [ { value: 1, label: '作废订单' } ];
          if (v.isCancelPlat.includes(v.platform) && v.orderIdList.every(i => i.isHand !== 1)) {
            v.cancelTypeList.push({ value: 2, label: '取消订单' });
          }
        }

        v.$nextTick(function () {
          v.cancelDeliveryModel.title = `批量${v.isCancelPlat.includes(v.platform) ? '取消' : '作废'}订单`;
          v.cancelDeliveryModel.type = '';
          v.cancelDeliveryModel.status = true;
        });
      } else {
        if (!v.isCancelPlat.includes(v.platform)) {
          v.cancelDeliveryModel.cancelType = 1;
        }
        if (v.cancelTypeList.length > 0) {
          v.$nextTick(function () {
            v.cancelDeliveryModel.title = v.isCancelPlat.includes(v.platform) ? '取消订单' : '作废订单';
            v.cancelDeliveryModel.type = 'single';
            v.cancelDeliveryModel.status = true;
          });
        } else {
          v.$Message.error('数据不可操作');
        }
      }
    },
  }
};
</script>
<style lang="less">
.setAllMarkRead {
  &.cancelOrderForm {
    .ivu-form-item {
      margin-bottom: 20px;
    }

    .ivu-form-item-error-tip {
      font-size: 12px;
    }
  }
}
</style>
