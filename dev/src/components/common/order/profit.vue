<template >
  <div style="background-color: #fff;padding: 10px;">
    <Alert type="success">
      <Row>
        <Col span="8" class="line32 text-center">利润：￥{{ (income - CostExpenditure).toFixed(2) }}
        </Col>
        <Col span="8" class="line32 text-center"> 利润率：{{ ProfitMargin }}%
        </Col>
        <Col span="8" class="line32 text-center">
        <p class="white-space-nowrap">利润计算公式：（收入-成本/支出）</p>
        </Col>
      </Row>
    </Alert>
    <Row :gutter="16">
      <Col span="12">
      <Alert><span>收入：{{ income }}CNY</span></Alert>
      <div class="profit-row-box clear mb10" v-for="(profit, index) in incomeData" :key="index">
        <div class="fl left" :style="{ height: profit.reportOrderProfitDetailList.length * 32 + 'px' }">
          <div class="hvCenter hei100 p5">
            <span v-if="profit.referenceType === '1'">订单(<span class="blueColor">{{ profit.referenceNo }}</span>)</span>
            <span v-if="profit.referenceType === '2'">售后(<span class="blueColor">{{ profit.referenceNo }}</span>)</span>
            <span v-if="profit.referenceType === '3'">出库单(<span class="blueColor">{{ profit.referenceNo
            }}</span>)</span>
          </div>
        </div>
        <div class="fl right">
          <p class="item" v-for="(item, pi) in profit.reportOrderProfitDetailList" :key="pi">
            <span>{{ profitType(item.amountType) }}：{{ item.amountCurrency }}{{ item.amount }}<Poptip
                v-if="item.amountType !== '999'" trigger="hover" title="转人民币汇率" class="fr mr10">
                <img style="vertical-align: text-bottom" src="../../../assets/images/exchangeRate.png" width="12" />
                <div slot="content">
                  {{ item.amountExchangeRate }} （{{ getDataToLocalTime(item.createdTime) }}）
                </div>
              </Poptip></span>
          </p>
        </div>
      </div>
      </Col>
      <Col span="12">
      <Alert type="error"><span>成本/支出：{{ CostExpenditure }}CNY</span></Alert>
      <div class="profit-row-box clear mb10" v-for="(profit, index) in expenditureData" :key="index">
        <div class="fl left" :style="{ height: profit.reportOrderProfitDetailList.length * 32 + 'px' }">
          <div class="hvCenter hei100 p5">
            <span v-if="profit.referenceType === '1'">订单(<span class="blueColor">{{ profit.referenceNo }}</span>)</span>
            <span v-if="profit.referenceType === '2'">售后(<span class="blueColor">{{ profit.referenceNo }}</span>)</span>
            <span v-if="profit.referenceType === '3'">出库单(<span class="blueColor">{{ profit.referenceNo
            }}</span>)</span>
          </div>
        </div>
        <div class="fl right">
          <p class="item" v-for="(item, pi) in profit.reportOrderProfitDetailList" :key="pi">
            <span>{{ profitType(item.amountType) }}： <span>{{ item.amountCurrency }}</span> {{ item.amount }}<Poptip
                v-if="item.amountType !== '999'" trigger="hover" title="转人民币汇率" class="fr mr10">
                <img style="vertical-align: text-bottom" src="../../../assets/images/exchangeRate.png" width="12" />
                <div slot="content">
                  {{ item.amountExchangeRate }} （{{ getDataToLocalTime(item.createdTime) }}）
                </div>
              </Poptip></span>
          </p>
        </div>
      </div>
      </Col>
    </Row>
  </div>
</template>

<script>
import Mixin from '@/components/mixin/common_mixin';

export default {
  name: 'profit',
  mixins: [Mixin],
  props: {
    reportData: {
      type: Array,
      default: () => []
    },
    orderInfo: {
      type: Object
    }
  },
  data() {
    return {};
  },
  computed: {
    ProfitMargin() {
      // 利润率=【利润】/【货品金额】*100%
      let incomeValue = (this.income - this.CostExpenditure) / this.AmountOfGoods;
      if (incomeValue && isFinite(incomeValue)) {
        return (incomeValue * 100).toFixed(2);
      } else {
        return 0;
      }
    },
    income() {
      let v = this;
      let ac = 0;
      if (v.reportData) {
        v.reportData.forEach(i => {
          if (i.statisticType === '1') {
            // 收入
            i.reportOrderProfitDetailList.forEach(j => {
              if (j.amountType === '999') {
                // 小计
                ac += j.amount;
              }
            });
          }
        });
      }
      return ac;
    },
    CostExpenditure() {
      let v = this;
      let ac = 0;
      if (v.reportData) {
        v.reportData.forEach(i => {
          if (i.statisticType === '2') {
            // 收入
            i.reportOrderProfitDetailList.forEach(j => {
              if (j.amountType === '999') {
                // 小计
                ac += j.amount;
              }
            });
          }
        });
      }
      return ac;
    },
    incomeData() {
      let reportData = this.reportData || [];
      return reportData.filter(i => i.statisticType === '1');
    },
    expenditureData() {
      let reportData = this.reportData || [];
      return reportData.filter(i => i.statisticType === '2');
    },
    AmountOfGoods() {
      let value = 0;
      if (this.reportData) {
        this.reportData.forEach(i => {
          if (i.statisticType === '1') {
            // 收入
            let item = i.reportOrderProfitDetailList.filter(j => {
              if (this.orderInfo.isHand === 1) {
                // 手工单
                return j.amountType === '17';
              } else {
                return j.amountType === '1';
              }
            })[0];
            if (item && item.amount && item.amountExchangeRate) {
              let amount = item.amount * item.amountExchangeRate;
              value = Number(amount.toFixed(2));
            }
          }
        });
      }
      return value;
    }
  },
  methods: {
    profitType(value) {
      // 费用类型 1:货品金额 2:买家支付运费3:保险4:税费5:退货产品收入6:平台佣金退回7:papal手续费8:平台佣金9:采购成本10:物流成本11:包装成本12:VAT 13:退款14补发产品成本15:平台退款手续费16:退货物流成本17:订单总金额 999 小计
      if (value === '1') {
        return '货品金额';
      } else if (value === '2') {
        return '买家支付运费';
      } else if (value === '3') {
        return '保险';
      } else if (value === '4') {
        return '税费';
      } else if (value === '5') {
        return '退货产品收入';
      } else if (value === '6') {
        return '平台佣金退回';
      } else if (value === '7') {
        return 'papal手续费';
      } else if (value === '8') {
        return '平台佣金';
      } else if (value === '9') {
        return '采购成本';
      } else if (value === '10') {
        return '物流成本';
      } else if (value === '11') {
        return '包装成本';
      } else if (value === '12') {
        return 'VAT';
      } else if (value === '13') {
        return '退款';
      } else if (value === '14') {
        return '补发产品成本';
      } else if (value === '15') {
        return '平台退款手续费';
      } else if (value === '16') {
        return '退货物流成本';
      } else if (value === '17') {
        return '订单总收入';
      } else if (value === '18') {
        return '头程成本';
      } else if (value === '19') {
        return '调整费用'; // 调整费用
      } else if (value === '20') {
        return '补发采购成本'; // 补发采购成本
      } else if (value === '21') {
        return '补发物流成本'; // 补发物流成本
      } else if (value === '22') {
        return '补发包装成本'; // 补发包装成本
      } else if (value === '23') {
        return '托管支付费用'; // 托管支付费用
      } else if (value === '24') {
        return '跨国交易费'; // 跨国交易费
      } else if (value === '25') {
        return 'wish邮运费';
      } else if (value === '26') {
        return '额外成交费';
      } else if (value === '27') {
        return '广告费';
      } else if (value === '28') {
        return '成本折扣';
      } else if (value === '999') {
        return '小计';
      }
    }
  }
};
</script>

<style scoped>
.hei100 {
  height: 100%;
}

.p5 {
  padding: 5px;
}

.profit-row-box {
  border: 1px solid #ccc;
}

.profit-row-box .left {
  width: 50%;
  word-break: break-all;
  border-right: 1px solid #ddd;
}

.profit-row-box .right {
  width: 50%;
  word-break: break-all;
}

.profit-row-box .right .item {
  height: 32px;
  border-bottom: 1px solid #ccc;
  padding: 0 5px;
  line-height: 32px;
}

.profit-row-box .right .item:last-child {
  border: 0;
}
</style>
