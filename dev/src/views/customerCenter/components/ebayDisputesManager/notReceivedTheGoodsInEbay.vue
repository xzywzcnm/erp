<template>
  <div :class="wrap">
    <div class="commonFilter">
      <div class="card-container">
        <div class="card-content">
          <div class="platformParamsSelect">
            <Form ref="pageParams" :model="pageParams" :label-width="labelWidth">
              <dyt-filter>
                <Form-item label="店铺" prop="saleAccountIdList">
                  <dytStoreSelect
                    v-model="pageParams.saleAccountIdList"
                    :option-data="shopList"
                    :replace-option-key="{value: 'saleAccountId', label: 'accountCode'}"
                    placeholder="请选择店铺，可输入搜索"
                    input-placeholder="请输入店铺，多个店铺可用逗号或换行隔开"
                  />
                </Form-item>
                <FormItem label="状态" prop="ebayAccount">
                  <ButtonGroup>
                    <template v-for="(item, index) in statusList">
                      <Button v-if="item.selected" type="primary" @click="selectStatus(index, item.status)"
                        :key="index">{{ item.title }} </Button>
                      <Button v-if="!item.selected" @click="selectStatus(index, item.status)" :key="index">{{ item.title
                      }} </Button>
                    </template>
                  </ButtonGroup>
                </FormItem>
                <Form-item label="发起时间">
                  <Date-picker transfer type="datetimerange" style="width:100%" @on-clear="resetDate"
                    @on-change="getDateValue" :clearable="clearAble" format="yyyy-MM-dd HH:mm:ss" :options="dateOptions"
                    placement="bottom-end" placeholder="选择日期" :value="payTimeArr"></Date-picker>
                </Form-item>
                <Form-item label="付款时间" prop="payTimeRange">
                  <Date-picker
                    transfer
                    type="datetimerange"
                    style="width:100%"
                    :clearable="clearAble"
                    format="yyyy-MM-dd HH:mm:ss"
                    :options="dateOptions"
                    placement="bottom-end"
                    placeholder="选择付款时间"
                    v-model="pageParams.payTimeRange"
                  />
                </Form-item>
                <FormItem label="平台产品编码" prop="itemId">
                  <dyt-input placeholder="请输入平台产品编码" v-model.trim="pageParams.itemId"></dyt-input>
                </FormItem>
                <FormItem label="inquiry ID" prop="requestId">
                  <dyt-input placeholder="请输入cancel ID" v-model.trim="pageParams.requestId"></dyt-input>
                </FormItem>
                <FormItem label="订单号" prop="orderId">
                  <dyt-input-tag type="textarea" :limit="1" :string="true" placeholder="请输入订单号,多个订单号用逗号分隔"
                    v-model="pageParams.orderId"></dyt-input-tag>
                </FormItem>
                <FormItem label="买家ID" prop="buyerAccountId">
                  <dyt-input placeholder="请输入买家ID" v-model.trim="pageParams.buyerAccountId"></dyt-input>
                </FormItem>
                <div slot="operation">
                  <Button type="primary" @click="search" :disabled="SearchDisabled" icon="md-search">查询</Button>
                  <Button style="margin-left: 10px;" @click="reset" v-once icon="md-refresh">重置 </Button>
                </div>
              </dyt-filter>
            </Form>
          </div>
        </div>
      </div>
    </div>
    <div class="tableControl">
      <Button type="primary" icon="logo-buffer" @click="updateAll" v-if="getPermission('ebayInquiry_batchSync')">全部更新
      </Button>
      <Dropdown @on-click="ExportAllBtn" class="ml10" v-if="getPermission('ebayRequest_notReceiveGoods')">
        <Button type="primary" :loading="exportLoading">
          <span class="icon iconfont">&#xe639;</span> 导出
          <Icon type="md-arrow-dropdown"></Icon>
        </Button>
        <DropdownMenu slot="list">
          <!-- <DropdownItem name='0'>导出选中数据</DropdownItem> -->
          <DropdownItem name='1'>导出所有结果集</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
    <div class="orderTable normalTop">
      <keep-alive>
        <Table highlight-row border :height="tableHeight" :loading="tableLoading" :columns="columns" :data="tableData">
        </Table>
      </keep-alive>
      <div class="table-page flexBox">
        <keep-alive>
          <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator
            :current="curPage" show-sizer @on-page-size-change="changePageSize" placement="top"
            :page-size-opts="pageArray"></Page>
        </keep-alive>
      </div>
    </div>
    <keep-alive>
      <sliderModal v-model="orderDetailsStatus" :spinShow="spinShow" :styles="sliderObjStyle"
        :buttonVisibile="buttonVisibile" v-if="orderDetailsBegin" :swStyles="swStyles"
        class="combineDetails slider-model">
        <div slot="header">
          <div class="normalPadding">
            <Table stripe border :columns="cancelDetailsColumns" :show-header="false" :data="cancelDetailsData"></Table>
          </div>
          <div class="normalPadding">
            <Card :bordered="false">
              <p slot="title">处理过程</p>
              <template v-if="historyJson && historyJson.length > 0">
                <div v-for="(item, index) in historyJson" :key="index" class="normalTop">
                  <div class="d-flex justify-content-start">
                    <span v-if="item.date && item.date.value">{{ getDateTime(item.date.value, 'fulltime') }}</span>
                    <span class="normalLMargin">{{ item.action }}</span>
                  </div>
                  <Table class="normalTop" size="small" stripe border :columns="refundDetailsColumns"
                    :show-header="false" :data="item.tableArr"></Table>
                </div>
              </template>
            </Card>
          </div>
          <div class="normalPadding">
            <Card :bordered="false">
              <p slot="title">请在<span class="redColor">{{ responseDue }}</span>前回应 </p>
              <p>
                <!-- <template v-if="availableOption && (availableOption.includes('SELLER_ISSUE_REFUND') || availableOption.includes('SELLER_OFFER_PARTIAL_REFUND') || availableOption.includes('SELLER_SEND_MESSAGE'))"> -->
                <template>
                  <div>
                    <RadioGroup v-model="handlerModel" vertical>
                      <Radio label="5" v-if="getPermission('ebayInquiry_sendMessage')">
                        <span>发送留言</span>
                      </Radio>
                      <template v-if="handlerModel === '5'">
                        <div class="normalLMargin normalMarginBottom">
                          <div>留言:</div>
                          <Input type="textarea" v-model.trim="sendMessageParams.message" :row="4"
                            style="width: 300px"></Input>
                        </div>
                      </template>
                      <Radio label="1" v-if="getPermission('ebayInquiry_issueRefund')">
                        <span>全额退款</span>
                      </Radio>
                      <template v-if="handlerModel === '1'">
                        <div class="normalPadding d-flex justify-content-start">
                          <span>退款金额: </span>
                          <span class="redColor">
                            {{ sellerTotalRefund }} {{ returnCurrency }}
                          </span>
                        </div>
                        <div class="normalLMargin normalMarginBottom">
                          <div>留言:</div>
                          <Input type="textarea" v-model.trim="allReturn.comments" :row="4"
                            style="width: 300px"></Input>
                        </div>
                      </template>
                      <Radio label="2" v-if="getPermission('ebayInquiry_provideShipmentInfo')">
                        <span>提供发货信息</span>
                      </Radio>
                      <template v-if="handlerModel === '2'">
                        <div class="normalTop">
                          <div class="d-flex justify-content-start align-items-center normalTop">
                            <span style="width: 100px; text-align: center">承运人：</span>
                            <Input type="text" v-model.trim="shippingParmas.shippingCarrierName" style="width: 200px" />
                          </div>
                          <div class="d-flex justify-content-start align-items-center">
                            <span style="width: 100px; text-align: center">发货时间：</span>
                            <DatePicker type="datetime" v-model="shippingParmas.shippingDate"
                              @on-change="selectShipmentDate" @on-clear="resetShipmentDate" style="width: 200px">
                            </DatePicker>
                          </div>
                          <div class="d-flex justify-content-start align-items-center normalTop">
                            <span style="width: 100px; text-align: center">运单号：</span>
                            <Input type="text" v-model.trim="shippingParmas.trackingNumber" style="width: 200px" />
                          </div>
                        </div>
                        <div class="normalLMargin normalMarginBottom">
                          <div>留言:</div>
                          <Input type="textarea" v-model.trim="shippingParmas.message" :row="4"
                            style="width: 300px"></Input>
                        </div>
                      </template>
                      <Radio label="3" v-if="getPermission('ebayInquiry_escalate')">
                        <span>升级</span>
                      </Radio>
                      <template v-if="handlerModel === '3'">
                        <div class="normalPadding">
                          <dyt-select v-model="updateDisputeParams.reason">
                            <Option value="BUYER_TROUBLE">BUYER_TROUBLE</Option>
                            >
                            <Option value="SHIPPED_ITEM">SHIPPED_ITEM</Option>
                            <Option value="TROUBLE_COMMUNICATION">TROUBLE_COMMUNICATION</Option>
                            <Option value="OTHERS">OTHERS</Option>
                          </dyt-select>
                          <div class="normalLMargin normalMarginBottom">
                            <div>留言:</div>
                            <Input type="textarea" v-model.trim="updateDisputeParams.message" :row="4"
                              style="width: 300px"></Input>
                          </div>
                        </div>
                      </template>
                    </RadioGroup>
                  </div>
                </template>
              </p>
            </Card>
          </div>
        </div>
        <div slot="footer">
          <div class="combineButton">
            <Button type="primary" @click="hanlerDisputes">回应
            </Button>
            <Button @click="orderDetailsStatus = !orderDetailsStatus" style="margin-left: 10px">取消
            </Button>
          </div>
        </div>
        <orderDetails
          ref="ebayCancelOrder"
          :hasEdit=false
          :orderDetailsId="orderDetailsId"
          :orderRowsDetail="orderRowsDetail"
          :orderNo="orderNo"
          :timestamp="timestamp"
          @spinLoading="spinLoading"
          @resetSpinShow="resetSpinShow"
          @updateList="getList"
          :buttonVisibile="buttonVisibile"
          inPage="dispute"
          :left="left"
          :moal-visible.sync="orderDetailsStatus"
        />
      </sliderModal>
    </keep-alive>
  </div>
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import orderSys from '@/components/mixin/orderSys_mixin';
import orderDetails from "@/views/commonOrder/components/commonOrder/orderDetails";
// import { getToken } from '@/utils/cookie';

const prefixCls = 'tongtool-customerCenter-ebayCancelOrder';
export default {
  mixins: [Mixin, orderSys],
  data () {
    let v = this;
    let self = this;
    return {// 详情数据
      updateDisputeParams: {
        message: null,
        reason: null
      },
      allReturn: {
        comments: null
      },
      sendMessageParams: {
        message: null
      },
      portionReturn: {
        message: null,
        partialRefundAmount: 0
      },
      uploadPath: null,
      historyJson: null,
      orderNo: null,
      expressSheetProvider: null,
      isReturn: false, // 是否需要退货
      returnAmount: 1, // 部分退货金额
      returnCurrency: null, // 退款
      availableOption: null,
      ebayRequestId: null,
      shippingParmas: {
        shippingDate: null,
        trackingNumber: null,
        message: null,
        shippingCarrierName: null
      },
      cancellation: false,
      handlerModel: null,
      responseDue: null,
      autoReturn: false,
      cancelDetailsColumns: [
        {
          title: '',
          key: 'name',
          align: 'right'
        }, {
          title: '',
          key: 'value',
          render: (h, params) => {
            if (params.row.type === '1') {
              return h('div', [
                !v.getPermission('ebayRequest_changeNeedAutoRefund') || h('Checkbox', {
                  props: {
                    value: params.row.value
                  },
                  on: {
                    'on-change': (value) => {
                      v.autoReturn = value;
                    }
                  }
                }), h('span', '买家升级纠纷后，无需自动退款')
              ]);
            } else {
              return h('span', params.row.value);
            }
          }
        }
      ],
      refundDetailsColumns: [
        {
          title: '',
          key: 'name',
          align: 'right'
        }, {
          title: '',
          key: 'value',
          render: (h, params) => {
            return h('span', params.row.value);
          }
        }
      ],
      cancelDetailsData: [],
      pageParamsStatus: false, // ebay订单详情
      timestamp: 0,
      orderDetailsId: null,
      orderRowsDetail: {},
      orderDetailsBegin: false,
      buttonVisibile: false,
      sliderObjStyle: null,
      swStyles: null,
      orderDetailsStatus: false, // ebay  订单详情 end
      columns: [
        {
          title: 'Inquiry Id',
          key: 'requestId',
          minWidth: 140,
          align: 'center'
        }, {
          title: '订单号',
          key: 'orderId',
          minWidth: 140,
          align: 'center',
          render: (h, params) => {
            let v = this;
            return h('div', {
              style: {
                color: self.getPermission('order_detail') ? '#0054A6' : '#515a6e',
                cursor: 'pointer'
              },
              on: {
                click: () => {
                  if (self.getPermission('order_detail')) {
                    v.orderNo = params.row.orderInfoBo.webstoreOrderId;
                    v.showOrder(params);
                  }
                }
              }
            }, params.row.orderInfoBo.webstoreOrderId);
          }
        }, {
          title: '买家ID',
          minWidth: 140,
          align: 'center',
          render: (h, params) => {
            if (params.row.orderInfoBo) {
              return h('span', params.row.orderInfoBo.buyerAccountId);
            }
          }
        }, {
          title: '买家期望',
          key: 'flowType',
          align: 'center',
          minWidth: 180
        },
        {
          title: '付款时间',
          key: 'payTime',
          align: 'center',
          minWidth: 140,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.orderInfoBo) || this.$common.isEmpty(row.orderInfoBo.payTime)) {
              return h('span', '');
            }
            return h('span', this.$common.toLocaleDate(row.orderInfoBo.payTime, 'fulltime'));
          }
        },
        {
          title: '发起时间', // 发起时间
          key: 'initiatesTime',
          align: 'center',
          minWidth: 140,
          render: (h, { row }) => {
            return h('span', this.getDateTime(row.initiatesTime));
          }
        },
        {
          title: '更新时间',
          key: 'updatedTime',
          align: 'center',
          minWidth: 140
        }, {
          title: '状态',
          key: 'state',
          align: 'center',
          minWidth: 140
        }, {
          title: '最迟响应时间',
          key: 'responseDue',
          align: 'center',
          minWidth: 140,
          render: (h, params) => {
            if (params.row.responseDue) {
              return h('span', this.getDateTime(params.row.responseDue));
            }
          }
        }, {
          title: '操作',
          key: 'operate',
          align: 'center',
          fixed: 'right',
          width: 160,
          render: (h, params) => {
            let v = this;
            return h('div', [
              !self.getPermission('ebayRequest_detail') || h('Button', {
                props: {
                  type: 'primary',
                  size: 'small'
                },
                on: {
                  click () {
                    v.orderNo = params.row.orderInfoBo.webstoreOrderId;
                    v.showOrder(params);
                  }
                }
              }, '处理'), !self.getPermission('ebayInquiry_sync') || h('Button', {
                props: {
                  size: 'small'
                },
                style: {
                  marginLeft: '10px'
                },
                on: {
                  click () {
                    v.syncRequestId(params.row.ebayRequestId);
                  }
                }
              }, '更新')
            ]);
          }
        }
      ],
      tableData: [],
      totalPage: 0,
      total: 0,
      curPage: 1,
      payTimeArr: [],
      clearAble: true,
      pageParams: {
        pageNum: 1,
        pageSize: 10,
        requestType: 'INQUIRY',
        endTime: null,
        startTime: null,
        itemId: null,
        requestId: null,
        saleAccountIdList: [],
        buyerAccountId: null,
        payTimeRange: [],
        status: 'WAITSELLER',
        orderId: null
      },
      statusList: [
        {
          selected: true,
          status: 'WAITSELLER',
          title: '等待卖家回应'
        }, {
          selected: false,
          status: 'OTHER',
          title: '其他'
        }, {
          selected: false,
          status: 'CLOSED',
          title: '关闭'
        }
      ],
      exportLoading: false
    };
  },
  computed: {
    uploadHeader () {
      return {
        ...this.$store.getters.erpRequestHeaders,
        ...this.$store.getters.dytRequestHeaders
      }
    },
    wrap () {
      return `${prefixCls}`;
    },
    tableHeight () {
      return this.getTableHeight(290);
    },
    // 付款收款信息
    payDetails() {
      const orderDetailsData = this.$store.getters.getOrderDetails;
      let platform = '';
      if (this.$common.isEmpty(orderDetailsData)) return [];
      if (!this.$common.isEmpty(orderDetailsData.orderInfo)) {
        platform = orderDetailsData.orderInfo.platformId || '';
      }
      if (orderDetailsData && orderDetailsData.platformFeatures && orderDetailsData.platformFeatures.length !== 0 && platform === 'ebay') {
        return orderDetailsData.platformFeatures.map(item => {
          return {
            ...item,
            paypalMethod: true,
            orderPaymentsStatus: false,
            payAmount: item.grossAmount,
            actuallyAmount: item.grossAmount - item.feeAmount,
            feeAmount: (item.feeAmount * 2).toFixed(2),
            payCurrency: item.currency
          }
        });
      }
      if (this.$common.isEmpty(orderDetailsData.orderInfo) || this.$common.isEmpty(orderDetailsData.orderInfo.orderPayments)) return [];
      if (platform === 'aliexpress') {
        return orderDetailsData.orderInfo.orderPayments.map(item => {
          return {
            ...item,
            paypalMethod: false,
            orderPaymentsStatus: true,
            transactionPrice: this.$common.isEmpty(item.transactionPrice) ? 0 : item.transactionPrice.toFixed(2),
            paymentFee: this.$common.isEmpty(item.paymentFee) ? 0 : item.paymentFee,
            payAmount: item.transactionPrice,
            actuallyAmount: (this.$common.isEmpty(item.actuallyAmount) ? 0 : item.actuallyAmount) + Number((item.transactionPrice - item.paymentFee)),
            feeAmount: item.paymentFee.toFixed(2),
            payCurrency: item.transactionPriceCurrency,
            paymentMethod: item.paymentMethodName
          }
        });
      }
      return orderDetailsData.orderInfo.orderPayments.map(item => {
        return {
          ...item,
          paypalMethod: false,
          orderPaymentsStatus: true,
          payAmount: item.transactionPrice,
          actuallyAmount: item.transactionPrice - (item.paymentFee || 0),
          feeAmount: item.paymentFee === null ? 0 : item.paymentFee.toFixed(2),
          payCurrency: item.transactionPriceCurrency,
          paymentMethod: item.paymentMethodName
        }
      });
    },
    // 计算收款总额
    getToalPrice () {
      const payDetails = this.payDetails;

      if (this.$common.isEmpty(payDetails)) {
        return {
          refundTotal: null,
          priceCurrency: null
        };
      }
      let refundTotal = 0;
      let transactionPrice = 0;
      payDetails.forEach(item => {
        if (!this.$common.isEmpty(transactionPrice)) {
          refundTotal += item.actuallyAmount
        }
      })
      return {
        refundTotal: refundTotal.toFixed(2),
        priceCurrency: payDetails[0].transactionPriceCurrency
      };
    }
  },
  components: {
    orderDetails
  },
  watch: {
    domWidth: { // common_mixin 里面有公共计算 domWidth 的方法， 这里通过 domWidth 来决定详情弹出框大小
      handler (n) {
        let v = this;
        if (n > 1600) {
          v.sliderObjStyle = { width: '1000px' };
          v.swStyles = {
            width: '560px',
            left: '-560px',
            top: '0',
            height: '100%'
          };
          v.left = 560;
        } else if (n > 1200) {
          v.sliderObjStyle = { width: '800px' };
          v.swStyles = {
            width: '392px',
            left: '-392px',
            top: '0',
            height: '100%'
          };
          v.left = 392;
        } else {
          v.sliderObjStyle = { width: '700px' };
          v.swStyles = {
            width: '322px',
            left: '-322px',
            top: '0',
            height: '100%'
          };
          v.left = 322;
        }
      },
      immediate: true
    },
    pageParamsStatus (n) {
      var v = this;
      if (n) {
        v.$Loading.start();
        Promise.resolve(v.getPermission('ebayInquiry_query') ? v.getList() : v.gotoError()).then(() => {
          v.$Loading.finish();
        });
        v.pageParamsStatus = false;
      }
    },
    autoReturn (n, o) {
      if (n) {
        this.setAutoReturn(0);
      } else {
        this.setAutoReturn(1);
      }
    }
  },
  methods: {
    syncRequestId (requestId) {
      let v = this;
      const obj = {
        url: api.set_inquiryPrefix + requestId + api.set_ebaySync,
        type: 'get'
      };
      v.ajaxData(obj).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
          v.pageParamsStatus = true;
        }
      });
    },
    updateAll () {
      if (this.$common.isEmpty(this.pageParams.saleAccountIdList)) {
        this.ajaxData({
          url: api.set_inquiryBatchSync,
          type: 'get'
        }).then(res => {
          if (!res || !res.data || res.data.code != 0) return;
          this.$Message.success('操作成功');
          this.pageParamsStatus = true;
        });
        return;
      }
      const awaitRes = this.pageParams.saleAccountIdList.map((m) => {
        return () => {
          return new Promise((resolve) => {
            this.ajaxData({
              url: `${api.set_inquiryBatchSync}?saleAccountId=${m}`,
              type: 'get'
            }).then(res => {
              if (!res || !res.data || res.data.code != 0) return resolve({ type: 'fail', key: m });
              resolve({ type: 'success', key: m });
            }).catch((err) => {
              console.error(err);
              resolve({ type: 'fail', key: m });
            });
          })
        }
      })
      this.$common.promiseAll(awaitRes).then(resArr => {
        const failLst = resArr.filter(f => f.type == 'fail').map(m => m.key);
        if (this.$common.isEmpty(failLst)) {
          this.pageParamsStatus = true;
          return this.$Message.success('操作成功');
        }
        if (failLst.length != resArr.length) {
          this.pageParamsStatus = true;
          this.$Message.success('部分操作成功');
          // this.$Message.error(`店铺：${failLst.join('、')}操作失败!`);
        }
      });
    },
    setAutoReturn (value) {
      let v = this;
      const obj = {
        url: api.set_autoReturn + v.ebayRequestId + '?needAutoRefund=' + value,
        type: 'put'
      };
      v.ajaxData(obj).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
        } else {
          (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.error('操作失败，请重新尝试');
        }
      });
    },
    handleBeforeUpload () {
      // let v = this;
    },
    uploadSuccess (response, file, fileList) {
      let v = this;
      if (response.code === 0) {
        let data = response.datas;
        v.$Message.success('上传成功');
        if (data.length > 0) {
          // v.filesArr.push(data[0]);
        }
      } else {
        v.$Message.error('上传失败');
      }
    },
    uploadError () {
      this.$Message.error('操作失败，请重新尝试');
    },
    hanlerDisputes () { // 回应
      let v = this;
      if (v.handlerModel === '1') {
        const obj = {
          url: api.set_inquiryPrefix + v.ebayRequestId + api.set_issueRefund,
          data: v.allReturn
        };
        v.ajaxData(obj).then(response => {
          if (response.data.code === 0) {
            v.allReturn.comments = null;
            v.$Message.success('操作成功');
            v.orderDetailsStatus = false;
            v.pageParamsStatus = true;
          }
        });
      } else if (v.handlerModel === '2') {
        let time = v.getDateTime(v.shippingParmas.shippingDate, 'fulltime');
        v.shippingParmas.shippingDate = time;
        const obj = {
          url: api.set_inquiryPrefix + v.ebayRequestId + api.set_provideShipmentInfo,
          data: v.shippingParmas
        };
        v.ajaxData(obj).then(response => {
          if (response.data.code === 0) {
            v.portionReturn.partialRefundAmount = 0;
            v.$Message.success('操作成功');
            v.orderDetailsStatus = false;
            v.pageParamsStatus = true;
          }
        });
      } else if (v.handlerModel === '5') {
        const obj = {
          url: api.set_inquiryPrefix + v.ebayRequestId + api.set_sendMessage,
          data: v.sendMessageParams
        };
        v.ajaxData(obj).then(response => {
          if (response.data.code === 0) {
            v.sendMessageParams.message = null;
            v.$Message.success('操作成功');
            v.orderDetailsStatus = false;
            v.pageParamsStatus = true;
          }
        });
      } else if (v.handlerModel === '3') {
        const obj = {
          url: api.set_inquiryPrefix + v.ebayRequestId + api.set_updateDisput,
          data: v.updateDisputeParams
        };
        v.ajaxData(obj).then(response => {
          if (response.data.code === 0) {
            v.sendMessageParams.message = null;
            v.$Message.success('操作成功');
            v.orderDetailsStatus = false;
            v.pageParamsStatus = true;
          }
        });
      }
    },
    selectShipmentDate (val) { // 选择日期
      let v = this;
      v.shippingParmas.shippingDate = v.getUniversalTime(val, 'fulltime');
    },
    resetShipmentDate () { // 重置日期
      let v = this;
      v.shippingParmas.shippingDate = null;
    },
    showOrder (params) {
      this.orderDetailsId = params.row.orderInfoBo.customerOrderInfoId;
      this.orderRowsDetail = { ...this.$common.copy(params.row.orderInfoBo), notReceivedTheGoods: true };
      this.ebayRequestId = params.row.ebayRequestId;
      this.returnAmount = params.row.orderInfoBo.totalPrice;
      this.returnCurrency = params.row.refundCurrency;
      this.sellerTotalRefund = params.row.sellerTotalRefund;
      this.uploadPath = api.set_inquiryPrefix + this.ebayRequestId + api.set_addShippingLabel;
      this.availableOption = params.row.availableOption;
      let historyJson = JSON.parse(params.row.responseHistory);
      historyJson.forEach((n, i) => {
        n.tableArr = [
          {
            name: '留言', // 留言
            value: n.description
          }/*,
           {
           name: '图片', // 图片
           value: ''
           } */
        ];
      });
      this.historyJson = historyJson;
      let date = new Date().getTime();
      this.cancelDetailsData = [
        {
          name: 'Inquiry Id',
          value: params.row.requestId
        }, {
          name: '状态',
          value: params.row.state
        }, {
          name: '买家期望',
          value: params.row.flowType
        }, {
          name: '发起时间',
          value: params.row.initiatesTime
        }, {
          name: '自动退款',
          type: '1',
          value: params.row.needAutoRefund
        }
      ];
      if (params.row.responseDue) {
        this.responseDue = this.getDateTime(params.row.responseDue);
      }
      // this.packageRadioModel = '新的包裹';
      // this.combineModel.packageCode = null;
      this.orderDetailsBegin = true;
      this.$nextTick(() => {
        this.orderDetailsStatus = true;
        this.timestamp = date;
      });
    },
    startLoading () {
      let v = this;
      v.$Loading.start();
      Promise.resolve(v.getList()).then(() => {
        v.$Loading.finish();
        v.getShopList(null, '/cs-service/erpCommon');
      });
    },
    getPageParams () {
      let reqParams = this.$common.copy(this.pageParams);
      if (!this.$common.isEmpty(reqParams.payTimeRange) && !this.$common.isEmpty(reqParams.payTimeRange[0]) && !this.$common.isEmpty(reqParams.payTimeRange[1])) {
        reqParams.payStartTime = this.$common.getUniversalTime(reqParams.payTimeRange[0], 'YYYY-MM-DD HH:mm:ss');
        reqParams.payEndTime = this.$common.getUniversalTime(reqParams.payTimeRange[1], 'YYYY-MM-DD HH:mm:ss');
      } else {
        reqParams.payStartTime = null;
        reqParams.payEndTime = null;
      }
      delete reqParams.payTimeRange;
      return reqParams;
    },
    getList () {
      let v = this;
      const obj = {
        url: api.get_cancelList,
        type: 'POST',
        data: this.getPageParams()
      };
      v.loadingTrue();
      v.tableData = [];
      v.ajaxData(obj).then(response => {
        v.loadingFalse();
        if (response.data.code === 0) {
          let data = response.data.datas;
          let saleAccountIdPos = [];
          let list = data.list;
          let pos = [];
          if (data.list !== null || data.length > 0) {
            list.forEach((n, i) => {
              if (n.orderInfoBo) {
                pos.push(n);
                saleAccountIdPos.push(n.saleAccountId);
              }
            });
            if (saleAccountIdPos.length > 0) { // 匹配订单号
              async function getData () {
                const Arr = await v.getAccountCode(pos, saleAccountIdPos);
                v.tableData = Arr;
              }

              getData();
            }
            v.$nextTick(function () {
              v.total = Number(data.total);
              v.totalPage = Number(data.pages);
            });
          } else {
            v.tableData = [];
            v.loadingFalse();
            v.$nextTick(function () {
              v.total = 0;
              v.totalPage = 0;
            });
          }
        }
      }).catch(() => {
        v.loadingFalse();
      });
    },
    reset () {
      let v = this;
      v.$refs['pageParams'].resetFields();
      v.payTimeArr = [];
      v.resetDate();
    },
    getDateValue (value) { // 获取日期返回值
      let v = this;
      if (value.length === 0) {
        v.$Message.error('日期格式有误');
        v.resetDate();
      } else {
        if (value[0] === '' || value[0] === null) return false;
        v.pageParams.startTime = v.getUniversalTime(new Date(value[0]).getTime(), 'fulltime');
        v.pageParams.endTime = v.getUniversalTime(new Date(value[1]).getTime(), 'fulltime');
      }
    },
    resetDate () {
      let v = this;
      v.pageParams.startTime = null;
      v.pageParams.endTime = null;
    },
    selectStatus (index, status) {
      let v = this;
      if (index === 0) {
        v.pageParams.status = 'WAITSELLER';
      } else if (index === 1) {
        v.pageParams.status = 'OTHER';
      } else {
        v.pageParams.status = 'CLOSED';
      }
      v.statusList.forEach((n, i) => {
        if (i === index) {
          n.selected = true;
        } else {
          n.selected = false;
        }
      });
      // v.pageParamsStatus = true;
    },
    ExportAllBtn (name) {
      if (this.exportLoading) return;
      let temp = this.getPageParams();
      this.exportLoading = true;
      this.axios.post(api.exportInfoByQuery, temp).then((response) => {
        this.exportLoading = false;
        if (response.data.code === 0) {
          this.$Message.success('操作成功');
        }
      }).catch(() => {
        this.exportLoading = false;
      })
    }
  }
};
</script>
