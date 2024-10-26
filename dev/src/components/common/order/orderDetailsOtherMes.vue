<template >
  <div class="modalItem orderDetailsTabGroup">
    <Tabs type="card" @on-click="tabOnClick" :animated="animateValue" v-if="orderInfo !== ''" value="mark">
      <Tab-pane label="备注" name="mark">
        <div class="addRemarkBit">
          <span class="icon iconfont" @click="showRemarkTextarea()"
            v-if="hasEdit && getPermission('orderRemark_insert') && inPage !== 'dispute'">&#xe671;</span>
        </div>
        <div v-if="hasEdit && addRemarkStatus" class="addRemarkItem clear">
          <Input v-model.trim="addRemakModel.remarkContent" type="textarea" :maxlength="500" :autosize="true"
            placeholder="請輸入..."></Input>
          <Button @click="cancelRemark()" class="remarkAdd fr">取消 </Button>
          <Button @click="addRemark()" type="primary" class="remarkAdd normalRMargin fr">保存 </Button>
        </div>
        <div class="markItem" v-if="!$common.isEmpty(orderRemarks)" v-for="(item, index) in orderRemarks" :key="index">
          <div class="markItemHeader clear">
            <div class="mih_left">{{ getUserName(item.createdBy) || item.createdBy }}
              <span></span> {{ getDataToLocalTime(item.createdTime, 'fulltime') }}
            </div>
            <div class="mih_right">
              <span class="icon iconfont remarkDel" v-if="hasEdit && getPermission('orderRemark_delete')"
                @click="delRemark(item.orderRemarkId)">&#xe616;</span>
            </div>
          </div>
          <div class="markItemContent">
            <div class="markArrow">
              <div class="markArrowTwo"></div>
            </div>
            {{ item.remarkContent }}
          </div>
        </div>
      </Tab-pane>
      <Tab-pane label="付款" name="pay" v-if="orderInfo.orderStatus !== 0">
        <div class="orderDetailsTabPay" v-if="payDetails !== null">
          <Row v-for="(item, index) in payDetails" :key="index" class="mb20">
            <Col :span="12">
            <Row>
              <Col :span="5">付款金额：</Col>
              <Col :span="18" class="orangeColor">{{ item.transactionPrice + '(' + item.transactionPriceCurrency + ')'
              }}
              </Col>
            </Row>
            <Row v-if="paypalMethod">
              <Col :span="5">付款地址：</Col>
              <Col :span="18">
              <div>{{ item.name }}</div>
              <div>{{ item.street1 }} + {{ item.street2 }}</div>
              <div>{{ item.cityName }} {{ item.stateName }} {{ item.postalCode }}</div>
              <div>{{ item.countryName }}</div>
              </Col>
            </Row>
            <Row v-if="orderPaymentsStatus && item.paymentNote">
              <Col :span="5">备注：</Col>
              <Col :span="18">
              {{ item.paymentNote }}
              </Col>
            </Row>
            <Row v-if="orderPaymentsStatus && item.webstoreTransactionId">
              <Col :span="5">交易号：</Col>
              <Col :span="18">
              {{ item.webstoreTransactionId }}
              </Col>
            </Row>
            <Row v-if="item.paymentTime">
              <Col :span="5">付款时间：</Col>
              <Col :span="18">
              {{ getDataToLocalTime(item.paymentTime) }}
              </Col>
            </Row>
            <Row v-if="item.receiverAccount">
              <Col :span="5">收款账号：</Col>
              <Col :span="18">
              {{ item.receiverAccount }}
              </Col>
            </Row>
            </Col>
            <Col :span="11" :offset="1">
            <Row v-if="item.paymentMethod && item.paymentMethod != ''">
              <Col :span="5">收款方式：</Col>
              <Col :span="18" class="orangeColor">{{
                  item.paymentMethod && item.paymentMethod != '' ? item.paymentMethod : ''
              }}
              </Col>
            </Row>
            <Row>
              <Col :span="5">实收金额：</Col>
              <Col :span="18" class="orangeColor">
              {{ item.actuallyAmount + '(' + item.transactionPriceCurrency + ')' }}
              <template v-if="paypalMethod">

                (paypal成交费:{{ item.feeAmount }}{{ item.transactionPriceCurrency }})
              </template>
              </Col>
            </Row>
            <Row v-if="paypalMethod && item.payerPaypalAccount">
              <Col :span="5">付款帐号：</Col>
              <Col :span="18">{{ item.payerPaypalAccount }}</Col>
            </Row>
            <Row v-if="paypalMethod && item.receiverPaypalAccount">
              <Col :span="5">收款帐号：</Col>
              <Col :span="18">{{ item.receiverPaypalAccount }}</Col>
            </Row>
            <Row v-if="item.payerAccount">
              <Col :span="5">付款账号：</Col>
              <Col :span="18">
              {{ item.payerAccount }}
              </Col>
            </Row>
            </Col>
          </Row>
        </div>
        <!--<div class="orderDetailsTabPay" v-if="platform === 'aliexpress'">
          <Row v-for="(item,index) in payDetails" :key="index">
            <Col :span="12">
              <Row>
                <Col :span="5">付款金额：</Col>
                <Col :span="18" class="orangeColor">{{item.payAmount + '(' + item.payCurrency + ')' }}</Col>
              </Row>
            </Col>
            <Col :span="11" :offset="1" v-if="orderInfo.orderPayments && orderInfo.orderPayments.length > 0">
              <Row>
                <Col :span="5">收款方式：</Col>
                <Col :span="18" class="orangeColor">
                  {{orderInfo.orderPayments[0].paymentMethodName}}
                </Col>
              </Row>
            </Col>
          </Row>
        </div>-->
      </Tab-pane>
      <Tab-pane label="付款" name="pay" v-if="orderInfo.orderStatus === 0">
        <div class="orderDetailsTabPay">
          付款金额： <span class="red">未付款</span>
          <Button @click="markThisPay" type="primary" style="margin-left:5px" size="small"
            v-if="hasEdit && orderInfo.isInvalid === '0' && getPermission('orderInfo_markOrderPayment_detail')">标记为已付款
          </Button>
        </div>
      </Tab-pane>
      <Tab-pane label="利润" name="profit" v-if="getPermission('order_profit_query')">
        <profit :orderInfo="orderInfo"
          :reportData="orderDetailsData != null ? orderDetailsData.reportOrderProfitList : []"></profit>
      </Tab-pane>
      <!-- 售后 -->
      <Tab-pane label="售后" name="customerService">
        <p class="orderDetailSale">售后处理 <span @click="addPost"
            v-if="getPermission('orderInfo_afterSales_creator') && orderInfo.isInvalid === '0'"
            class="orderDetailSaleAdd">新建售后单</span>
        </p>
        <Table v-if="data1.length > 0" :columns="columns1" :data="data1"></Table>
      </Tab-pane>
      <!-- 日誌 -->
      <Tab-pane label="日志" name="log">
        <orderLog :order-id="orderInfo.orderId" class="mt10" ref="orderLog"></orderLog>
      </Tab-pane>
    </Tabs>
    <!-- 标记为已付款 -->
    <keep-alive>
      <Modal v-model="setPayModel.status" transfer :mask-closable="false" v-if="setPayStatus" @on-ok="setMarkPayment">
        <div class="ivu-modal-confirm">
          <div class="ivu-modal-confirm-head">
            <div class="ivu-modal-confirm-head-title">{{ setPayModel.title }}</div>
          </div>
          <div class="ivu-modal-confirm-body ivu-modal-confirm-body-render">
            <div class="normalTop">
              <Row>
                <Col :span="1">
                <Icon type="information-circled" color="#2b85e4" size="36"></Icon>
                </Col>
                <Col :span="21" :offset="2">
                <p>标记为已付款，订单将会继续正常订单的流程，最终到发货。</p>
                </Col>
              </Row>
              <Form ref="setMarkModel" :model="setMarkModel" :label-width="100" class="noramlTop setAllMarkRead">
                <Form-item label="付款方式" prop="paymentMethodName">
                  <Input v-model.trim="setMarkModel.paymentMethodName" value=""></Input>
                </Form-item>
                <Row>
                  <Col :span="12">
                  <Form-item label="付款方交易号" v-if="setPayModel.type != 'all'" prop="webstoreTransactionId">
                    <Input v-model.trim="setMarkModel.webstoreTransactionId" value=""></Input>
                  </Form-item>
                  </Col>
                  <Col :span="setPayModel.type != 'all' ? 12 : 10" offset="setPayModel.type != 'all' ? 0 : 2">
                  <Form-item label="成交费比例：" prop="transactionPriceRatio">
                    <Input v-model.trim="setMarkModel.transactionPriceRatio" value=""> <span slot="append">%</span>
                    </Input>
                  </Form-item>
                  </Col>
                </Row>
                <Form-item label="备注" prop="paymentNote">
                  <Input v-model.trim="setMarkModel.paymentNote" :rows="setPayModel.num" value=""></Input>
                </Form-item>
              </Form>
            </div>
          </div>
        </div>
      </Modal>
    </keep-alive>

    <Drawer width="800" :class-name="'zIndexTop'" transfer placement="left" v-model="postSaleStepValue">
      <post-sale-step ref="postSaleStep" :editType="editType" :open="timestamp1" :reasonList="reasonList"
        :postDetail="postDetail" :source="'order'" @searchOrderCallback="searchOrderCallback"
        @saveSuccess="saveSuccessFn"></post-sale-step>
    </Drawer>
  </div>
</template>
<script >
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import profit from '@/components/common/order/profit';
import postSaleStep from '@/views/customerCenter/components/postSaleTreatment/postSaleStep';
import orderLog from '@/components/common/order/orderLog';

export default {
  mixins: [Mixin],
  components: {
    profit,
    postSaleStep,
    orderLog
  },
  data() {
    let v = this;
    return {
      postSaleStepValue: false,
      editType: 'look',
      orderNo: null,
      timestamp1: 0,
      reasonList: [],
      postDetail: {},
      value2: false,
      columns1: [
        {
          title: '创建时间', // 创建时间
          key: 'createdTime',
          align: 'center',
          render: (h, params) => {
            return h('div', this.getDataToLocalTime(params.row.createdTime, 'fulltime'));
          }
        }, {
          title: '售后单号', // 售后单号
          key: 'afterSalesCode',
          align: 'center',
          render: (h, params) => {
            return h('span', {
              on: {
                'click'() {
                  v.$refs.postSaleStep.getOrderDetail(params.row.orderId);
                  v.postSaleStepValue = true;
                  v.editType = 'look';
                  v.getPostDetail(params.row.afterSalesId);
                  v.getReasonList();
                  /* v.$refs.postSaleStep.getOrderDetail(params.row.orderId); */
                }
              },
              style: {
                color: 'blur',
                textDecoration: 'underline',
                cursor: 'pointer'
              }
            }, params.row.afterSalesCode);
          }
        }, {
          title: '处理类型',
          key: 'afterSalesType',
          align: 'center',
          render: (h, params) => {
            let afterSalesType = params.row.afterSalesType; // 售后服务类型 1退款1退货1补发货 退款100,退货010,补发货001 或者组合类型111
            let type = [
              {
                code: '100',
                data: ['退款']
              }, {
                code: '010',
                data: ['退货']
              }, {
                code: '001',
                data: ['补发货']
              }, {
                code: '111',
                data: ['退款', '退货', '补发货']
              }, {
                code: '110',
                data: ['退款', '退货']
              }, {
                code: '101',
                data: ['退款', '补发货']
              }, {
                code: '011',
                data: ['退货', '补发货']
              }
            ];
            let text = [];
            type.map((item) => {
              if (item.code === afterSalesType) {
                text = item.data;
              }
            });
            return h('div', {}, text.join('、'));
          }
        }, {
          title: '操作人',
          key: 'address',
          align: 'center',
          render(h, params) {
            // return h('span', v.getUserInfo(params.row.updatedBy, 'userName'));
            return h('span', v.getUserInfo(params.row.updatedBy));
          }
        }
      ],
      data1: [],
      reportData: [],
      animateValue: false,
      paypalMethod: false,
      orderPaymentsStatus: false,
      payDetails: null,
      payAmount: 0,
      actuallyAmount: 0,
      feeAmount: 0,
      payCurrency: null,
      platformFeatures: '',
      orderRemarks: '',
      OrderOperationLog: [],
      productRemindStatus: [],
      orderTransactions: [],
      addRemarkStatus: false, // 备注状态
      addRemakModel: {
        orderId: '',
        remarkContent: ''
      },
      setPayStatus: false,
      setPayModel: {
        status: false,
        title: '',
        type: '',
        num: 3
      },
      setMarkModel: {
        orderIdList: [],
        webstoreTransactionId: '',
        paymentMethodName: '',
        paymentNote: '',
        transactionPriceRatio: 0
      }
    };
  },
  props: {
    hasEdit: {
      // 是否可以编辑
      default() {
        return true;
      },
      type: Boolean
    },
    orderInfo: [Object, String],
    orderDetailsData: Object,
    timestampTwo: {
      type: Number,
      default: null
    },
    platform: String,
    inPage: String
  },
  watch: {
    orderInfo(n, o) {
      // let v = this;
      if (n !== o) {
        this.getAfterSales(n.orderId);
        this.startMakePackageInfo();
        this.$nextTick(() => {
          this.$refs.orderLog.On_searchOrderLogInit();
        });
      }
    },
    timestampTwo(n, o) {
      let v = this;
      if (n !== o && v.orderDetailsId !== null) {
        v.resetOrderPackage();
      }
    }
  },
  methods: {
    tabOnClick(name) {
      if (name === 'log') {
        this.$refs.orderLog.On_searchOrderLogInit();
      }
    },
    addPost() {
      this.postSaleStepValue = true;
      this.editType = 'add';
      this.timestamp1 = new Date().getTime();
      this.getReasonList();
      this.$refs.postSaleStep.getOrderDetail(this.orderInfo.orderId);
    },
    getPostDetail(afterSalesId) {
      let v = this;
      // 获取售后详情
      return new Promise(resolve => {
        v.axios.get(api.get_afterSalesApiDetail + afterSalesId).then(response => {
          if (response.data.code === 0) {
            v.postDetail = response.data.datas;
            resolve();
          }
        });
      });
    },
    getReasonList() {
      this.$refs.postSaleStep.getReasonList();
      // let v = this;
      // // 获取售后原因列表
      // v.axios.get(api.get_afterSalesOrderReason).then(response => {
      //   if (response.data.code === 0) {
      //     this.$refs.postSaleStep.reasonListT = response.data.datas;
      //   }
      // });
    },
    searchOrderCallback() {

    },
    saveSuccessFn() {
      this.getAfterSales(this.orderInfo.orderId);
      this.postSaleStepValue = false;
    },
    getAfterSales(id) {
      this.axios.get(api.get_listByOrderId + id).then(response => {
        if (response.data.code === 0) {
          this.data1 = response.data.datas;
        }
      });
    },
    resetOrderPackage() {
      let v = this;
      v.animateValue = false;
    },
    startMakePackageInfo() {
      let v = this;
      let data = v.orderDetailsData || {};
      v.payAmount = '';
      v.actuallyAmount = '';
      v.feeAmount = '';
      v.platformFeatures = data.platformFeatures;// 原始订单信息
      v.orderRemarks = data.orderRemarks;// 备注
      v.OrderOperationLog = data.orderOperationLogs;// 日志
      v.addRemakModel.orderId = data.orderInfo.orderId;
      if (data.platformFeatures && data.platformFeatures.length !== 0 && v.platform === 'ebay') { // paypal付款
        v.paypalMethod = true;
        v.orderPaymentsStatus = false;
        let ga = data.platformFeatures;
        v.payDetails = ga;

        for (let i = 0; i < ga.length; i++) {
          ga[i].payAmount = ga[i].grossAmount;
          ga[i].actuallyAmount = (ga[i].grossAmount - ga[i].feeAmount).toFixed(2);
          ga[i].feeAmount += ga[i].feeAmount.toFixed(2);
          ga[i].payCurrency = ga[i].currency;
        }
      } else if (v.platform === 'aliexpress') {
        v.paypalMethod = false;
        v.orderPaymentsStatus = true;
        let ga = data.orderInfo.orderPayments;
        v.payDetails = ga;
        if (ga !== null) {
          for (let i = 0; i < ga.length; i++) {
            ga[i].actuallyAmount = ga[i].actuallyAmount ? ga[i].actuallyAmount : 0;
            ga[i].transactionPrice = ga[i].transactionPrice ? ga[i].transactionPrice : 0;
            ga[i].paymentFee = ga[i].paymentFee ? ga[i].paymentFee : 0;
            ga[i].payAmount = ga[i].transactionPrice;
            ga[i].actuallyAmount += Number((ga[i].transactionPrice - ga[i].paymentFee).toFixed(2));
            ga[i].feeAmount += ga[i].paymentFee.toFixed(2);
            ga[i].payCurrency = ga[i].transactionPriceCurrency;
            ga[i].paymentMethod = ga[i].paymentMethodName;
          }
        }
      } else {
        v.paypalMethod = false;
        v.orderPaymentsStatus = true;
        let ga = data.orderInfo.orderPayments;
        v.payDetails = ga;
        if (ga !== null) {
          for (let i = 0; i < ga.length; i++) {
            ga[i].payAmount = ga[i].transactionPrice;
            ga[i].actuallyAmount = (ga[i].transactionPrice - (ga[i].paymentFee || 0)).toFixed(2);
            ga[i].feeAmount = ga[i].paymentFee === null ? 0 : ga[i].paymentFee.toFixed(2);
            ga[i].payCurrency = ga[i].transactionPriceCurrency;
            ga[i].paymentMethod = ga[i].paymentMethodName;
          }
        }
      }
      let ot = v.orderInfo.orderTransactions;
      for (let n = 0; n < ot.length; n++) {
        v.productRemindStatus.push(false);
        let obj = {
          orderTransactionId: ot[n].orderTransactionId,
          quantity: ot[n].quantity,
          remark: ot[n].remark
        };
        v.orderTransactions.splice(n, 1, obj);
      }
    },
    showRemarkTextarea() {
      let v = this;
      v.addRemarkStatus = true;
    },
    addRemark() {
      let v = this;
      if (v.addRemakModel.remarkContent === '') {
        v.$Message.error('内容不能为空');
        return false;
      }
      v.axios.post(api.add_remark, JSON.stringify(v.addRemakModel)).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('保存成功');
          v.addRemarkStatus = false;
          v.$parent.updateStatus = true;
          v.$parent.$parent.$parent.pageParamsStatus = true;
          v.addRemakModel.remarkContent = '';
        } else {
          (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.error('操作失败，请重新尝试');
        }
      });
    },
    delRemark(remarkId) {
      let v = this;
      v.axios.delete(api.del_remark + remarkId).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('删除成功');
          v.addRemarkStatus = false;
          v.$parent.updateStatus = true;
        } else {
          (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.error('操作失败，请重新尝试');
        }
      });
    },
    cancelRemark() {
      this.addRemarkStatus = false;
    },
    markThisPay() {
      let v = this;
      v.setPayStatus = true;
      v.$nextTick(function () {
        v.setPayModel.title = '标记为已付款';
        v.setPayModel.type = '';
        v.setPayModel.status = true;
      });
    },
    setMarkPayment() {
      let v = this;
      v.setMarkModel.orderIdList = [v.orderInfo.orderId];
      v.axios.put(api.mark_paid, JSON.stringify(v.setMarkModel)).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data.length > 0) {
            data.forEach((n, i) => {
              v.$Message.error({
                content: '销售编号' + ': ' + n.salesRecordNumber + n.error,
                duration: 5
              });
            });
          } else {
            v.$Message.success('标记为已付款成功');
            v.$parent.updateStatus = true;
          }
        }
        v.$refs.setMarkModel.resetFields();
      });
    }
  },
  created() {
    let v = this;
    v.reportData = [
      {
        'reportOrderProfitId': '315595325865984000',
        'saleAccountId': '200045357416316928',
        'merchantId': '999999',
        'orderId': '316053021555687424',
        'referenceType': '1',
        'platformId': 'ebay',
        'statisticType': '1',
        'referenceId': '316053021555687424',
        'referenceNo': 'ebay-190923081',
        'createdTime': '2019-09-22 14:21:47',
        'createdBy': '999999',
        'updatedTime': '2019-09-24 10:13:18',
        'updatedBy': '999999',
        'reportOrderProfitDetailList': [
          {
            'reportOrderProfitDetailId': '315595326100865024',
            'reportOrderProfitId': '315595325865984000',
            'orderId': '316053021555687424',
            'merchantId': '999999',
            'amountType': '1',
            'amount': 11.99,
            'amountCurrency': 'USD',
            'amountExchangeRate': 7.09,
            'createdTime': '2019-09-22 14:21:47',
            'createdBy': '999999',
            'updatedTime': '2019-09-24 10:13:45',
            'updatedBy': '999999'
          }, {
            'reportOrderProfitDetailId': '315595326100865025',
            'reportOrderProfitId': '315595325865984000',
            'orderId': '316053021555687424',
            'merchantId': '999999',
            'amountType': '2',
            'amount': 0.63,
            'amountCurrency': 'USD',
            'amountExchangeRate': 7.09,
            'createdTime': '2019-09-22 14:21:47',
            'createdBy': '999999',
            'updatedTime': '2019-09-24 10:13:46',
            'updatedBy': '999999'
          }
        ]
      }, {
        'reportOrderProfitId': '315595325865984000',
        'saleAccountId': '200045357416316928',
        'merchantId': '999999',
        'orderId': '316053021555687424',
        'referenceType': '2',
        'platformId': 'ebay',
        'statisticType': '1',
        'referenceId': '316053021555687424',
        'referenceNo': 'ebay-190923081',
        'createdTime': '2019-09-22 14:21:47',
        'createdBy': '999999',
        'updatedTime': '2019-09-24 10:13:18',
        'updatedBy': '999999',
        'reportOrderProfitDetailList': [
          {
            'reportOrderProfitDetailId': '315595326100865024',
            'reportOrderProfitId': '315595325865984000',
            'orderId': '316053021555687424',
            'merchantId': '999999',
            'amountType': '1',
            'amount': 11.99,
            'amountCurrency': 'USD',
            'amountExchangeRate': 7.09,
            'createdTime': '2019-09-22 14:21:47',
            'createdBy': '999999',
            'updatedTime': '2019-09-24 10:13:45',
            'updatedBy': '999999'
          }, {
            'reportOrderProfitDetailId': '315595326100865025',
            'reportOrderProfitId': '315595325865984000',
            'orderId': '316053021555687424',
            'merchantId': '999999',
            'amountType': '2',
            'amount': 0.63,
            'amountCurrency': 'USD',
            'amountExchangeRate': 7.09,
            'createdTime': '2019-09-22 14:21:47',
            'createdBy': '999999',
            'updatedTime': '2019-09-24 10:13:46',
            'updatedBy': '999999'
          }
        ]
      }, {
        'reportOrderProfitId': '315595325874372608',
        'saleAccountId': '200045357416316928',
        'merchantId': '999999',
        'orderId': '316053021555687424',
        'referenceType': '1',
        'platformId': 'ebay',
        'statisticType': '2',
        'referenceId': '316053021555687424',
        'referenceNo': 'ebay-190923081',
        'createdTime': '2019-09-22 14:21:47',
        'createdBy': '999999',
        'updatedTime': '2019-09-24 10:13:24',
        'updatedBy': '999999',
        'reportOrderProfitDetailList': [
          {
            'reportOrderProfitDetailId': '315595326197334016',
            'reportOrderProfitId': '315595325874372608',
            'orderId': '316053021555687424',
            'merchantId': '999999',
            'amountType': '7',
            'amount': 0.83,
            'amountCurrency': 'USD',
            'amountExchangeRate': 7.09,
            'createdTime': '2019-09-22 14:21:47',
            'createdBy': '999999',
            'updatedTime': '2019-09-24 10:13:47',
            'updatedBy': '999999'
          }, {
            'reportOrderProfitDetailId': '315595326201528320',
            'reportOrderProfitId': '315595325874372608',
            'orderId': '316053021555687424',
            'merchantId': '999999',
            'amountType': '8',
            'amount': 0.98,
            'amountCurrency': 'USD',
            'amountExchangeRate': 7.09,
            'createdTime': '2019-09-22 14:21:47',
            'createdBy': '999999',
            'updatedTime': '2019-09-24 10:13:49',
            'updatedBy': '999999'
          }
        ]
      }
    ];
    v.reportData.forEach(i => {
      if (i.reportOrderProfitDetailList) {
        let obj = {
          'amountType': '999',
          'amount': 0,
          'amountCurrency': 'CNY'
        };
        i.reportOrderProfitDetailList.forEach(i => {
          let amount = i.amount * i.amountExchangeRate;
          obj.amount += Number(amount.toFixed(2));
        });
        i.reportOrderProfitDetailList.push(obj);
      }
    });
  }
};
</script >
<style >
.zIndexTop {
  z-index: 1071;
  position: relative
}
</style >
