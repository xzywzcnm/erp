<template>
  <div class="order-details-address">
    <!-- 订单地址 -->
    <div class="details-item details-item-address">
      <div class="item-title">订单地址</div>
      <div>
        <div class="item-row">
          <span class="item-left buyer-id-name">ID:</span>
          <div class="item-right">
            <span v-if="orderInfo.buyerAccountId" class="mr20">{{ orderInfo.buyerAccountId }}</span>
            <span>{{ orderInfo.buyerEmail }}</span>
          </div>
        </div>
        <div class="item-row" v-if="platform === 'amazon'">
          <span class="item-left buyer-id-name">NAME:</span>
          <div class="item-right">
            <span>{{ orderInfo.buyerName }}</span>
            <span class="ml20">{{ orderInfo.buyerCountryCode }}</span>
            <span class="ml20">{{ orderInfo.buyerEmail }}</span>
          </div>
        </div>
        <div class="item-row">
          <span class="item-left buyer-address-to">TO:</span>
          <div>
            <p>{{ orderInfo.buyerName }}</p>
            <p v-if="orderInfo.buyerPhone">{{ orderInfo.buyerPhone }}</p>
            <p v-if="orderInfo.buyerMobile">{{ orderInfo.buyerMobile }}</p>
            <p>{{ orderInfo.buyerAddress1 }} {{ orderInfo.buyerAddress2 }}</p>
            <p>{{ orderInfo.buyerCity }} {{ orderInfo.buyerState }} {{ orderInfo.buyerPostalCode }}</p>
            <p>{{ buyerCountry }}</p>
          </div>
        </div>
      </div>
    </div>
    <!-- 付款 -->
    <div class="details-item" style="flex:initial; width:25%;">
      <div class="item-title">付款</div>
      <template v-if="![0, '0'].includes(orderInfo.orderStatus)">
        <div v-for="(item, index) in payDetails" :key="`pay-${index}`">
          <div class="item-row">
            <span class="item-left">付款金额:</span>
            <div class="item-right">
              <span style="color:#f20; font-weight:bold;">
                {{ $common.isEmpty(item.transactionPrice) ? '0.00' : Number(item.transactionPrice).toFixed(2) }}
              </span> {{ item.transactionPriceCurrency }}
            </div>
          </div>
          <div class="item-row" v-if="item.paypalMethod">
            <span class="item-left">付款地址:</span>
            <div class="item-right">
              <p>{{ item.name }}</p>
              <p>{{ item.street1 }} + {{ item.street2 }}</p>
              <p>{{ item.cityName }} {{ item.stateName }} {{ item.postalCode }}</p>
              <p>{{ item.countryName }}</p>
            </div>
          </div>
          <div class="item-row" v-if="(item.orderPaymentsStatus && item.paymentNote)">
            <span class="item-left">备注:</span>
            <div class="item-right">
              {{ item.paymentNote }}
            </div>
          </div>
          <div class="item-row" v-if="(item.orderPaymentsStatus && item.webstoreTransactionId)">
            <span class="item-left">交易号:</span>
            <div class="item-right">
              {{ item.webstoreTransactionId }}
            </div>
          </div>
          <div class="item-row" v-if="item.paymentTime">
            <span class="item-left">付款时间:</span>
            <div class="item-right">
              {{ getDataToLocalTime(item.paymentTime, 'fulltime') }}
            </div>
          </div>
          <div class="item-row" v-if="((item.paypalMethod && item.payerPaypalAccount) || item.payerAccount)">
            <span class="item-left">付款帐号:</span>
            <div class="item-right">
              <p v-if="(item.paypalMethod && item.payerPaypalAccount)">{{ item.payerPaypalAccount }}</p>
              <p v-if="item.payerAccount">{{ item.payerAccount }}</p>
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="item-row">
          <span class="item-left">付款金额:</span>
          <div class="item-right">
            <span class="red">未付款</span>
            <Button @click="markThisPay" type="primary" style="margin-left:5px" size="small"
              v-if="hasEdit && orderInfo.isInvalid === '0' && getPermission('orderInfo_markOrderPayment_detail')">标记为已付款</Button>
          </div>
        </div>
      </template>
    </div>
    <!-- 收款 -->
    <div class="details-item">
      <div class="item-title">收款</div>
      <div v-for="(item, index) in payDetails" :key="`show-${index}`">
        <div class="item-row" v-if="item.receiverAccount">
          <span class="item-left">收款账号:</span>
          <div class="item-right">
            {{ item.receiverAccount }}
          </div>
        </div>
        <div class="item-row" v-if="item.paymentMethod && item.paymentMethod != ''">
          <span class="item-left">收款方式:</span>
          <div class="item-right">
            {{ item.paymentMethod }}
          </div>
        </div>
        <div class="item-row">
          <span class="item-left">实收金额:</span>
          <div class="item-right">
            <span style="color:#f20; font-weight:bold;">
              {{ $common.isEmpty(item.actuallyAmount) ? '0.00' : Number(item.actuallyAmount).toFixed(2) }}
            </span> {{ item.transactionPriceCurrency }}
            <template v-if="item.paypalMethod">
              (paypal成交费:
              <span style="color:#f20; font-weight:bold;">
                {{ $common.isEmpty(item.feeAmount) ? '0.00' : Number(item.feeAmount).toFixed(2) }}
              </span> {{ item.transactionPriceCurrency }})
            </template>
          </div>
        </div>
        <div class="item-row" v-if="item.paypalMethod && item.receiverPaypalAccount">
          <span class="item-left">收款帐号:</span>
          <div class="item-right">
            {{ item.receiverPaypalAccount }}
          </div>
        </div>
      </div>
    </div>
    <!-- 预估毛利润 -->
    <div class="details-item" v-if="getPermission('order_profit_query')">
      <div class="item-title">预估毛利润</div>
      <div class="item-row">
        <span class="item-left">预估总收入:</span>
        <div class="item-right">
          {{ getCostProfit.profit.toFixed(2) }} {{getCostProfit.amountCurrency}}
        </div>
      </div>
      <div class="item-row">
        <span class="item-left">预估总成本:</span>
        <div class="item-right">
          {{ getCostProfit.cost.toFixed(2) }} {{getCostProfit.amountCurrency}}
        </div>
      </div>
      <div class="item-row">
        <span class="item-left">预估毛利润:</span>
        <div class="item-right">
          {{ (getCostProfit.profit - getCostProfit.cost).toFixed(2) }} {{getCostProfit.amountCurrency}}
        </div>
      </div>
      <div class="item-row">
        <span class="item-left">预估毛利率:</span>
        <div class="item-right">
          {{ getCostProfit.profitMargin }} %
        </div>
      </div>
      <div class="item-row" style="margin-top: 15px;">
        <span class="open-profit-details" @click="openProfitDetails">预估毛利润详情</span>
      </div>
    </div>
    <!-- 标记为已付款 -->
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
            <Form ref="setMarkFormModel" :model="setMarkModel" :label-width="100" class="noramlTop setAllMarkRead">
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
    <!-- 毛利润详情 -->
    <profitDetails
      :visible.sync="showProfitDetails"
      :orderInfo="orderInfo"
      :orderDetailsData="orderDetailsData"
      :getCostProfit="getCostProfit"
      :payDetails="payDetails"
      :platformId="platformId"
      v-bind="$attrs"
    />
  </div>
</template>
<script>
import profitDetails from '@/components/common/order/profitDetails.vue';// 订单详情-利润详情
import Mixin from '@/components/mixin/common_mixin';
import { costTypeContain, costTypeSubtract } from '@/utils/comConfig';
import api from '@/api/api';

export default {
  mixins: [Mixin],
  components: {
    profitDetails
  },
  data() {
    return {
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
      },
      showProfitDetails: false
    }
  },
  props: {
    platformId: { type: Array, default: () => { return [] } },
    // 是否可以编辑
    hasEdit: { type: Boolean, default: true },
    // 订单基本信息
    orderInfo: [Object, String],
    buyerCountry: { type: String, default: '' },
    // 订单详情信息
    orderDetailsData: { type: Object, default: () => { return {} } }
  },
  computed: {
    platform () {
      return this.platformId[0] || this.$store.state.fullInGroup || this.inGroup;
    },
    payDetails() {
      if (this.$common.isEmpty(this.orderDetailsData)) return [];
      if (this.orderDetailsData && this.orderDetailsData.platformFeatures && this.orderDetailsData.platformFeatures.length !== 0 && this.platform === 'ebay') {
        return this.orderDetailsData.platformFeatures.map(item => {
          return {
            ...item,
            paypalMethod: true,
            orderPaymentsStatus: false,
            payAmount: item.grossAmount,
            actuallyAmount: this.$common.isEmpty(item.grossAmount - item.feeAmount) ? '0.00' : (item.grossAmount - item.feeAmount).toFixed(2),
            feeAmount: this.$common.isEmpty(item.feeAmount) ? '0.00' : (item.feeAmount * 2).toFixed(2),
            payCurrency: item.currency
          }
        });
      }
      if (this.$common.isEmpty(this.orderDetailsData.orderInfo) || this.$common.isEmpty(this.orderDetailsData.orderInfo.orderPayments)) return [];
      if (this.platform === 'aliexpress') {
        return this.orderDetailsData.orderInfo.orderPayments.map(item => {
          return {
            ...item,
            paypalMethod: false,
            orderPaymentsStatus: true,
            transactionPrice: this.$common.isEmpty(item.transactionPrice) ? '0.00' : item.transactionPrice.toFixed(2),
            paymentFee: this.$common.isEmpty(item.paymentFee) ? 0 : item.paymentFee,
            payAmount: item.transactionPrice,
            actuallyAmount: (this.$common.isEmpty(item.actuallyAmount) ? 0 : item.actuallyAmount) + Number((item.transactionPrice - item.paymentFee).toFixed(2)),
            feeAmount: this.$common.isEmpty(item.paymentFee) ? '0.00' : item.paymentFee.toFixed(2),
            payCurrency: item.transactionPriceCurrency,
            paymentMethod: item.paymentMethodName
          }
        });
      }
      return this.orderDetailsData.orderInfo.orderPayments.map(item => {
        return {
          ...item,
          paypalMethod: false,
          orderPaymentsStatus: true,
          payAmount: item.transactionPrice,
          actuallyAmount: ((this.$common.isEmpty(item.transactionPrice) ? 0 : item.transactionPrice) - (item.paymentFee || 0)).toFixed(2),
          feeAmount: this.$common.isEmpty(item.paymentFee) ? '0.00' : item.paymentFee.toFixed(2),
          payCurrency: item.transactionPriceCurrency,
          paymentMethod: item.paymentMethodName
        }
      });
    },
    // 包裹信息
    orderShippingInfoList () {
      if (this.$common.isEmpty(this.orderDetailsData) || this.$common.isEmpty(this.orderDetailsData.orderShippingInfoList)) return [];
      const newList = this.orderDetailsData.orderShippingInfoList.filter(item => item.packageStatus != 99);
      return newList;
    },
    // 未作废的包裹号
    availableReferenceNo () {
      return this.orderShippingInfoList.map(m => m.packageCode);
    },
    // 所有费用数据
    reportData() {
      return this.$common.isEmpty(this.orderDetailsData) ? [] : this.orderDetailsData.reportOrderProfitList || [];
    },
    // 总成本、 总收入、 利润率
    getCostProfit() {
      let costProfit = {
        // 预估总收入
        profit: 0,
        // 预估总成本
        cost: 0,
        // 预估毛利率
        profitMargin: '0.00',
        // 币种
        amountCurrency: 'CNY'
      };
      let amountList = [];
      if (this.reportData) {
        this.reportData.forEach(i => {
          if (!([3].includes(Number(i.referenceType)) && !this.availableReferenceNo.includes(i.referenceNo))) {
            // statisticType：1:收入,2成本/支出
            if ([1, '1'].includes(i.statisticType)) {
              (i.reportOrderProfitDetailList || []).forEach(j => {
                // isHand: 是否手工单 0不是，1是 默认全部
                // amountType 费用类型 17订单总收入；手工单和自定义渠道单才有
                // const isCostSubtract = this.isCostSubtract('proceeds', j.amountType);
                if ([1, '1'].includes(this.orderInfo.isHand)) {
                  [17, '17'].includes(j.amountType) && amountList.push(j);
                } else if (this.isCostPlus('proceeds', j.amountType)) {
                  amountList.push(j);
                } else if (this.isCostSubtract('proceeds', j.amountType)) {
                  amountList.push({
                    ...j,
                    amount: j.amount * -1
                  });
                }
                if ([999, '999'].includes(j.amountType)) {
                // 收入小计
                  costProfit.profit += (this.$common.isEmpty(j.amount) ? 0 : j.amount);
                  costProfit.amountCurrency = j.amountCurrency;
                }
              });
            } else if ([2, '2'].includes(i.statisticType)) {
              (i.reportOrderProfitDetailList || []).forEach(j => {
                if ([999, '999'].includes(j.amountType)) {
                // 成本小计
                  costProfit.cost += (this.$common.isEmpty(j.amount) ? 0 : j.amount);
                  costProfit.amountCurrency = j.amountCurrency;
                }
              });
            }
          }
        });
        // 利润率计算
        if (!this.$common.isEmpty(amountList)) {
          let amountOfGoods = 0;
          amountList.forEach(item => {
            if (!this.$common.isEmpty(item) && !this.$common.isEmpty(item.amount) && !this.$common.isEmpty(item.amountExchangeRate)) {
              amountOfGoods += Number(item.amount * item.amountExchangeRate);
            }
          });
          const incomeValue = (costProfit.profit - costProfit.cost) / amountOfGoods;
          if (!this.$common.isEmpty(incomeValue)) {
            costProfit.profitMargin = (incomeValue * 100).toFixed(2);
          }
        }
      }
      return costProfit;
    }
  },
  methods: {
    // 标记为已付款 弹窗
    markThisPay() {
      this.setPayStatus = true;
      this.$nextTick(function () {
        this.setPayModel.title = '标记为已付款';
        this.setPayModel.type = '';
        this.setPayModel.status = true;
      });
    },
    // 是否成本纳入合计
    isCostPlus (key, amountType) {
      if (this.$common.isEmpty(key) || this.$common.isEmpty(amountType)) return false;
      if (!this.$common.isEmpty(costTypeContain[key])) {
        if (!this.$common.isEmpty(costTypeContain[key][this.platform])) {
          return costTypeContain[key][this.platform].includes(amountType);
        }
        if (!this.$common.isEmpty(costTypeContain[key].default)) {
          return costTypeContain[key].default.includes(amountType);
        }
      }
      return false;
    },
    // 是否在总金额减
    isCostSubtract (key, amountType) {
      if (this.$common.isEmpty(key) || this.$common.isEmpty(amountType)) return false;
      if (!this.$common.isEmpty(costTypeSubtract[key])) {
        if (!this.$common.isEmpty(costTypeSubtract[key][this.platform])) {
          return costTypeSubtract[key][this.platform].includes(amountType);
        }
        if (!this.$common.isEmpty(costTypeSubtract[key].default)) {
          return costTypeSubtract[key].default.includes(amountType);
        }
      }
      return false;
    },
    // 标记为已付款 保存
    setMarkPayment() {
      this.setMarkModel.orderIdList = [this.orderInfo.orderId];
      this.axios.put(api.mark_paid, JSON.stringify(this.setMarkModel)).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data.length > 0) {
            data.forEach((n, i) => {
              this.$Message.error({
                content: '销售编号' + ': ' + n.salesRecordNumber + n.error,
                duration: 5
              });
            });
          } else {
            this.$Message.success('标记为已付款成功');
            this.$parent.updateStatus = true;
          }
        }
        this.$refs.setMarkFormModel.resetFields();
      });
    },
    // 利润详情弹窗
    openProfitDetails() {
      this.showProfitDetails = true;
    }
  }
};
</script>
<style lang="less" scoped>
@orderLeftWidth: 95px; // 订单详情左侧宽度
.order-details-address {
  position: relative;
  display: flex;
  margin: 0  80px 0 @orderLeftWidth;
  // max-width: 1200px;
  // border-bottom: 1px solid #E8EAEC;

  .details-item {
    flex: 100;
    padding: 0 10px 10px 0;
    &.details-item-address{
      flex: initial;
      width: 35%;
    }

    .item-title {
      margin-bottom: 10px;
      font-size: 14px;
      font-weight: bold;
    }

    .item-left {
      display: inline-block;
      margin-right: 5px;
    }

    .item-right {
      display: inline-block;
      word-break: break-all;
    }

    .buyer-id-name {
      color: #f20;
    }

    .buyer-address-to {
      color: #3399ff;
    }

    .item-row {
      display: flex;
      line-height: 1.6em
    }
  }

  .open-profit-details {
    cursor: pointer;
    color: #2828ff;
    text-decoration: underline;
    text-underline-position: under;
  }
}
</style>
