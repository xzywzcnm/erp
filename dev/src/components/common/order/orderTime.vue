<template >
  <div class="orderDetailsStatus normalTop">
    <div class="flexBox odsOne">
      <span v-if="orderInfo.salesTime">下单时间：{{ getDataToLocalTime(orderInfo.salesTime, 'fulltime') }}</span>
      <span v-if="orderInfo.payTime">付款时间：{{ getDataToLocalTime(orderInfo.payTime, 'fulltime') }}</span>
      <span
        class="redColor remainingTime"
        v-if="orderInfo.synDeliverDate === null && orderInfo.shippingLimiteTime !== null && !isPlatformOrder"
      >
        <i class="icon iconfont icon-post"></i>未标发货剩余时间：{{ shippingLimiteTime }}
      </span>
      <span class="redColor remainingTime" v-if="orderInfo.synDeliverDate !== null">
        <i class="icon iconfont icon-post"></i>标发货时间：{{ getDataToLocalTime(orderInfo.synDeliverDate, 'fulltime') }}
      </span>
      <!-- <span class="formaProfit_box" v-if="EstimatedProfitTalg">
        <p class="color_txt" :class="orderContent.estimatedProfit < 0 || orderContent.estimatedProfitMargin < 0 ? 'red_txt' : ''">
          <span>{{ `预估利润：${orderContent.estimatedProfit} CNY` }}</span>
          <span>预估利润率：{{estimatedProfitMargin}}</span>
        </p>
        <Tooltip placement="bottom" theme="light" max-width="380">
          <Icon class="icon-style" size="20" type="md-help-circle" />
          <div slot="content">
            <p>预估利润 = 订单收入 - 预估成本；</p>
            <p>预估利润率 =（订单收入 - 预估成本）/ 订单收入*100%</p>
            <p class="order_title">{{ `订单收入：CNY ${orderContent.totalPrice}`}}</p>
            <div v-for="(item, index) in orderContent.orderItem" :key="index">
              <p class="order_title">{{ `预估成本(${item.packageCode})：CNY ${item.cost}` }}</p>
              <p>
                <span>{{ '预估采购成本' + '：' + item.purchaseCost }}</span>
                <span style="margin-left: 15px;">{{ '预估运费' + '：' + item.freight }}</span>
              </p>
            </div>
          </div>
        </Tooltip>
      </span> -->
    </div>
    <div class="flexBox normalTop redColor stopOrder" v-if="orderInfo.isSuspended === 1 && !isPlatformOrder">
      <!-- 由 <em>{{getUserName (orderInfo.updatedBy)}}</em> -->
      <i class="icon iconfont icon-zhixingzhongduan"></i>
      {{ getDataToLocalTime(orderInfo.suspendedTime, 'fulltime') }} 截留：{{ orderInfo.suspendedReason }}
    </div>
  </div>
</template>
<style lang='less' scoped >
.formaProfit_box {
  display: flex;
  align-items: center;
  font-size: 12px;

  .color_txt {
    color: #2828ff;
    font-size: 13px;
  }

  .red_txt {
    color: #e00707;
  }

  .order_title {
    color: #000;
    font-weight: bold;
  }
}
</style>
<script>
import Mixin from '@/components/mixin/common_mixin';
export default {
  mixins: [Mixin],
  props: {
    hasEdit: {
      // 是否可以编辑
      default () {
        return true;
      },
      type: Boolean
    },
    orderRowsDetail: { type: Object, default: () => { return {} } },
    orderInfo: [Object, String],
    shippingLimiteTime: [Object, String]
  },
  data () {
    return {
      orderContent: {},
      EstimatedProfitTalg: true
    };
  },
  computed: {
    // 是否平台仓订单   0：不是平台仓订单，1：是平台仓订单
    isPlatformOrder () {
      if (this.$common.isEmpty(this.orderRowsDetail)) return false;
      return [1, '1'].includes(this.orderRowsDetail.isPlatformOrder);
    },
    estimatedProfitMargin () {
      if (this.orderContent.estimatedProfitMargin == '-Infinity') return '负无穷大';
      if (this.orderContent.estimatedProfitMargin == 'Infinity') return '无穷大';
      return `${this.orderContent.estimatedProfitMargin || '0'}%`
    },
    orderDetailsData () {
      return this.$store.state.orderDetails;
    }
  },
  methods: {
    // 获取预估费用的数据
    GetEstimateCostsJson (data, price) {
      let jsonData = data != null ? JSON.parse(data) : [];
      this.orderContent = {};
      let orderItem = [];
      let totalCost = 0;
      let totalPrice = 0;
      let estimatedProfit = 0;
      let estimatedProfitMargin = 0;
      let totalPriceExchangeRate = 0;
      if (jsonData.length > 0) {
        jsonData.map((item) => {
          // 订单的汇率值
          totalPriceExchangeRate = item.totalPriceExchangeRate;
          // 预估采购成本
          let purchaseCost =
            item.estimateProductCosts * item.estimateProductCostsExchangeRate;
          // 预估运费
          let freight = item.estimateFreight * item.estimateFreightExchangeRate;
          // 预估成本
          let cost = purchaseCost + freight;
          orderItem.push({
            purchaseCost: Number(purchaseCost.toFixed(2)),
            freight: Number(freight.toFixed(2)),
            cost: Number(cost.toFixed(2)),
            packageCode: item.packageCode
          });
        });

        // 预估成本--总和
        if (orderItem.length > 0) {
          orderItem.map((item) => {
            totalCost += item.cost;
          });
        }
        // 订单收入(总和)
        totalPrice = Number((price * totalPriceExchangeRate).toFixed(2));

        // 预估利润 = 订单收入-预估成本(总和)
        estimatedProfit = Number((totalPrice - totalCost).toFixed(2));

        // 预估利润率 = 预估利润 / 订单收入 *100
        estimatedProfitMargin = Number(
          ((estimatedProfit / totalPrice) * 100).toFixed(2)
        );

        this.orderContent = {
          orderItem: orderItem,
          totalCost: totalCost,
          totalPrice: totalPrice,
          estimatedProfit: estimatedProfit,
          estimatedProfitMargin: estimatedProfitMargin
        };
      }
    }
  },
  watch: {
    orderDetailsData: {
      handler (value) {
        if (value) {
          let price = value.orderInfo.totalPrice;
          let data = value.estimateCostsJson;
          data === null ? this.EstimatedProfitTalg = false : this.EstimatedProfitTalg = true;
          this.GetEstimateCostsJson(data, price);
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
@orderLeftWidth: 95px; // 订单详情左侧宽度
.orderDetailsStatus{
  margin-left:  @orderLeftWidth;
  margin-right: 80px;
}
.icon-style{
  margin-left: 5px;
  cursor: pointer;
  color: #f60;
}
</style>
