<template >
  <Modal title="预估毛利润详情" v-model="modalVisible" transfer :mask-closable="false" width="90%">
    <div class="profit-details">
      <div class="details-title">{{ orderNo }}</div>
      <div class="profit-content">
        <Form :model="orderInfo" :inline="true" class="fmb0 profit-form">
          <div class="block">
            <div class="active-title">
              <span class="mr10">预估毛利润</span>
              <span>{{ (getCostProfit.profit - getCostProfit.cost).toFixed(2) }} {{getCostProfit.amountCurrency}}</span>
            </div>
            <div class="block-content ignore-width">
              <FormItem label="预估总收入:" :label-width="80">
                {{ getCostProfit.profit.toFixed(2) }} {{getCostProfit.amountCurrency}}
              </FormItem>
              <FormItem label="预估总成本:" :label-width="80">
                {{ getCostProfit.cost.toFixed(2) }} {{getCostProfit.amountCurrency}}
              </FormItem>
              <FormItem label="预估毛利润:" :label-width="80">
                {{ (getCostProfit.profit - getCostProfit.cost).toFixed(2) }}{{getCostProfit.amountCurrency}}
              </FormItem>
              <FormItem label="预估毛利率:" :label-width="80">
                {{ getCostProfit.profitMargin }} %
              </FormItem>
            </div>
          </div>

          <div class="block">
            <div class="active-title">
              <span class="mr10">预估总收入</span>
              <span>{{`${getCostProfit.profit.toFixed(2)} ${getCostProfit.amountCurrency}` }}</span>
            </div>
            <div class="block-content">
              <div class="dash-block ignore-width" v-if="receiveInfo.collectList && receiveInfo.collectList.length > 0">
                <div class="dash-block-title">收款</div>
                <div class="dash-block-main">
                  <FormItem v-for="(item, index) in receiveInfo.collectList" :key="index + 'collectList'">
                    {{`${amountTypeList[item.amountType].label || ''}：${($common.isEmpty(item.amount) ? 0 : item.amount).toFixed(2)} `}}
                    <Tooltip :transfer="true" placement="bottom-start">
                      <span class="dash-block-tips">{{item.amountCurrency}}</span>
                      <div slot="content">
                        {{ `转人民币汇率：${item.amountExchangeRate.toFixed(4)}(${item.createdTime ? item.createdTime.substring(0, 10) : ''})` }}
                      </div>
                    </Tooltip>
                  </FormItem>
                </div>
                <FormItem class="dash-block-total" label="不含税收款合计(CNY)：" :label-width="140">{{ receiveInfo.priceTotal }}</FormItem>
              </div>
              <div class="dash-block ignore-width" v-if="receiveInfo.refundList && receiveInfo.refundList.length > 0">
                <div class="dash-block-title">退款</div>
                <div class="dash-block-main">
                  <FormItem v-for="(item, index) in receiveInfo.refundList" :key="index + 'refundList'">
                    {{`${amountTypeList[item.amountType].label || ''}：${($common.isEmpty(item.amount) ? 0 : item.amount).toFixed(2)} `}}
                    <Tooltip :transfer="true" placement="bottom-start">
                      <span class="dash-block-tips">{{item.amountCurrency}}</span>
                      <div slot="content">
                        {{ `转人民币汇率：${item.amountExchangeRate.toFixed(4)}(${item.createdTime ? item.createdTime.substring(0, 10) : ''})` }}
                      </div>
                    </Tooltip>
                  </FormItem>
                </div>
                <FormItem class="dash-block-total" label="退款合计(CNY)：" :label-width="140">{{ receiveInfo.refundTotal }}</FormItem>
              </div>
              <div class="dash-block">
                <div class="dash-block-title">合计</div>
                <FormItem class="dash-block-total" label="收入合计(CNY)：" :label-width="140">{{ receiveInfo.total }}</FormItem>
              </div>
            </div>
          </div>

          <div class="block">
            <div class="active-title">
              <span class="mr10">预估总成本</span>
              <span>{{`${costInfo.total.toFixed(2)} CNY`}}</span>
            </div>
            <!-- 订单列表 -->
            <div class="block-content" v-for="(item, index) in costInfo.orderList" :key="`orderFee-${index}`">
              <div class="back-block ignore-width">
                <FormItem :label="`${[1, '1'].includes(item.referenceType) ? '订' : '售后'}单：`" :label-width="60">{{ item.referenceNo }}</FormItem>
                <FormItem v-if="[1, '1'].includes(item.referenceType)" label="平台:" :label-width="50">{{ platform }}</FormItem>
              </div>
              <div
                class="dash-block ignore-width"
                v-if="costInfo[item.referenceNo].platformCommission && costInfo[item.referenceNo].platformCommission.list
                && costInfo[item.referenceNo].platformCommission.list.length > 0"
              >
                <div class="dash-block-title">平台佣金(成交费)</div>
                <div class="dash-block-main">
                  <template v-for="(fee, fIndex) in costInfo[item.referenceNo].platformCommission.list">
                    <FormItem
                      :key="`orderFee-${index}-${fIndex}`"
                      v-if="costFeeTypeList.platformCommission.includes(fee.amountType)"
                    >
                      {{`${amountTypeList[fee.amountType].label || ''}：${($common.isEmpty(fee.amount) ? 0 : fee.amount).toFixed(2)} `}}
                      <Tooltip :transfer="true" placement="bottom-start">
                        <span class="dash-block-tips">{{fee.amountCurrency}}</span>
                        <div slot="content">
                          {{ `转人民币汇率：${fee.amountExchangeRate.toFixed(4)}(${fee.createdTime ? fee.createdTime.substring(0, 10) : ''})` }}
                        </div>
                      </Tooltip>
                    </FormItem>
                  </template>
                </div>
                <FormItem
                  class="dash-block-total"
                  label="平台佣金合计(CNY)："
                  :label-width="140"
                >
                  {{
                    ($common.isEmpty(costInfo[item.referenceNo].platformCommission.itemTotal) ? 0
                    : costInfo[item.referenceNo].platformCommission.itemTotal).toFixed(2)
                  }}
                </FormItem>
              </div>
              <div
                class="dash-block ignore-width"
                v-if="costInfo[item.referenceNo].tradingFee && costInfo[item.referenceNo].tradingFee.list
                && costInfo[item.referenceNo].tradingFee.list.length > 0"
              >
                <div class="dash-block-title">交易费</div>
                <div class="dash-block-main">
                  <template v-for="(fee, fIndex) in costInfo[item.referenceNo].tradingFee.list">
                    <FormItem
                      :key="`orderFee-${index}-${fIndex}`"
                      v-if="costFeeTypeList.tradingFee.includes(fee.amountType)"
                    >
                      {{`${amountTypeList[fee.amountType].label || ''}：${($common.isEmpty(fee.amount) ? 0 : fee.amount).toFixed(2)}`}}
                      <Tooltip :transfer="true" placement="bottom-start">
                        <span class="dash-block-tips">{{fee.amountCurrency}}</span>
                        <div slot="content">
                          {{ `转人民币汇率：${fee.amountExchangeRate.toFixed(4)}(${fee.createdTime ? fee.createdTime.substring(0, 10) : ''})` }}
                        </div>
                      </Tooltip>
                    </FormItem>
                  </template>
                </div>
                <FormItem
                  class="dash-block-total"
                  label="交易费合计(CNY)："
                  :label-width="140"
                >
                  {{($common.isEmpty(costInfo[item.referenceNo].tradingFee.itemTotal) ? 0 : costInfo[item.referenceNo].tradingFee.itemTotal).toFixed(2)}}
                </FormItem>
              </div>
              <div
                class="dash-block ignore-width"
                v-if="costInfo[item.referenceNo].advertisingFee && costInfo[item.referenceNo].advertisingFee.list
                && costInfo[item.referenceNo].advertisingFee.list.length > 0"
              >
                <div class="dash-block-title">广告费</div>
                <div class="dash-block-main">
                  <template v-for="(fee, fIndex) in costInfo[item.referenceNo].advertisingFee.list">
                    <FormItem
                      :key="`orderFee-${index}-${fIndex}`"
                      v-if="costFeeTypeList.advertisingFee.includes(fee.amountType)"
                    >
                      {{`${amountTypeList[fee.amountType].label || ''}：${($common.isEmpty(fee.amount) ? 0 : fee.amount).toFixed(2)} `}}
                      <Tooltip :transfer="true" placement="bottom-start">
                        <span class="dash-block-tips">{{fee.amountCurrency}}</span>
                        <div slot="content">
                          {{ `转人民币汇率：${fee.amountExchangeRate.toFixed(4)}(${fee.createdTime ? fee.createdTime.substring(0, 10) : ''})` }}
                        </div>
                      </Tooltip>
                    </FormItem>
                  </template>
                </div>
                <FormItem
                  class="dash-block-total"
                  label="广告费合计(CNY)："
                  :label-width="140"
                >
                  {{($common.isEmpty(costInfo[item.referenceNo].advertisingFee.itemTotal) ? 0 : costInfo[item.referenceNo].advertisingFee.itemTotal).toFixed(2)}}
                </FormItem>
              </div>
              <div
                class="dash-block ignore-width"
                v-if="costInfo[item.referenceNo].shopFee && costInfo[item.referenceNo].shopFee.list
                && costInfo[item.referenceNo].shopFee.list.length > 0"
              >
                <div class="dash-block-title">店铺费用</div>
                <div class="dash-block-main">
                  <template v-for="(fee, fIndex) in costInfo[item.referenceNo].shopFee.list">
                    <FormItem
                      :key="`orderFee-${index}-${fIndex}`"
                      v-if="costFeeTypeList.shopFee.includes(fee.amountType)"
                    >
                      {{`${amountTypeList[fee.amountType].label || ''}：${($common.isEmpty(fee.amount) ? 0 : fee.amount).toFixed(2)} `}}
                      <Tooltip :transfer="true" placement="bottom-start">
                        <span class="dash-block-tips">{{fee.amountCurrency}}</span>
                        <div slot="content">
                          {{ `转人民币汇率：${fee.amountExchangeRate.toFixed(4)}(${fee.createdTime ? fee.createdTime.substring(0, 10) : ''})` }}
                        </div>
                      </Tooltip>
                    </FormItem>
                  </template>
                </div>
                <FormItem
                  class="dash-block-total"
                  label="店铺费用合计(CNY)："
                  :label-width="140"
                >
                  {{($common.isEmpty(costInfo[item.referenceNo].shopFee.itemTotal) ? 0 : costInfo[item.referenceNo].shopFee.itemTotal).toFixed(2)}}
                </FormItem>
              </div>
              <div
                class="dash-block ignore-width"
                v-if="costInfo[item.referenceNo].supplyAgainFee && costInfo[item.referenceNo].supplyAgainFee.list
                && costInfo[item.referenceNo].supplyAgainFee.list.length > 0"
              >
                <div class="dash-block-title">补发费用</div>
                <div class="dash-block-main">
                  <template v-for="(fee, fIndex) in costInfo[item.referenceNo].supplyAgainFee.list">
                    <FormItem
                      :key="`orderFee-${index}-${fIndex}`"
                      v-if="costFeeTypeList.supplyAgainFee.includes(fee.amountType)"
                    >
                      {{`${amountTypeList[fee.amountType].label || ''}：${($common.isEmpty(fee.amount) ? 0 : fee.amount).toFixed(2)} `}}
                      <Tooltip :transfer="true" placement="bottom-start">
                        <span class="dash-block-tips">{{fee.amountCurrency}}</span>
                        <div slot="content">
                          {{ `转人民币汇率：${fee.amountExchangeRate.toFixed(4)}(${fee.createdTime ? fee.createdTime.substring(0, 10) : ''})` }}
                        </div>
                      </Tooltip>
                    </FormItem>
                  </template>
                </div>
                <FormItem
                    class="dash-block-total"
                    label="补发费用合计(CNY)："
                    :label-width="140"
                  >
                    {{
                      ($common.isEmpty(costInfo[item.referenceNo].supplyAgainFee.itemTotal) ? 0
                      : costInfo[item.referenceNo].supplyAgainFee.itemTotal).toFixed(2)
                    }}
                  </FormItem>
              </div>
              <div
                class="dash-block ignore-width"
                v-if="costInfo[item.referenceNo].warehouseFee && costInfo[item.referenceNo].warehouseFee.list
                && costInfo[item.referenceNo].warehouseFee.list.length > 0 && ![1, '1'].includes(item.referenceType)"
              >
                <div class="dash-block-title">仓库费用</div>
                <div class="dash-block-main">
                  <template v-for="(fee, fIndex) in costInfo[item.referenceNo].warehouseFee.list">
                    <FormItem
                      :key="`orderFee-${index}-${fIndex}`"
                      v-if="costFeeTypeList.warehouseFee.includes(fee.amountType)"
                    >
                      {{`${amountTypeList[fee.amountType].label || ''}：${($common.isEmpty(fee.amount) ? 0 : fee.amount).toFixed(2)} `}}
                      <span
                        class="dash-block-tips"
                        :title="`转人民币汇率：${fee.amountExchangeRate.toFixed(4)}(${fee.createdTime ? fee.createdTime.substring(0, 10) : ''})`"
                      >{{fee.amountCurrency}}</span>
                    </FormItem>
                  </template>
                </div>
                <FormItem
                  class="dash-block-total"
                  label="仓库费用合计(CNY)："
                  :label-width="140"
                >
                  {{($common.isEmpty(costInfo[item.referenceNo].warehouseFee.itemTotal) ? 0 : costInfo[item.referenceNo].warehouseFee.itemTotal).toFixed(2)}}
                </FormItem>
              </div>
              <div class="dash-block ignore-width">
                <div class="dash-block-title">合计</div>
                <FormItem class="dash-block-total" label="合计(CNY)：" :label-width="140">
                  {{ ($common.isEmpty(costInfo[item.referenceNo].subtotal) ? 0 : costInfo[item.referenceNo].subtotal).toFixed(2) }}
                </FormItem>
              </div>
            </div>
            <!-- 出库单列表 -->
            <div class="block-content" v-for="(item, index) in costInfo.stockList" :key="`stockFee-${index}`">
              <div class="back-block ignore-width">
                <FormItem label="出库单:" :label-width="60">{{ item.referenceNo }}</FormItem>
                <FormItem label="仓库:" :label-width="50">
                  {{`${getWarehouseName[item.referenceNo] ? getWarehouseName[item.referenceNo].warehouseName || '未匹配' : '未匹配'}` }}
                </FormItem>
              </div>
              <div
                class="dash-block ignore-width"
                v-if="costInfo[item.referenceNo].costFfGoods && costInfo[item.referenceNo].costFfGoods.list
                && costInfo[item.referenceNo].costFfGoods.list.length > 0"
              >
                <div class="dash-block-title">商品成本</div>
                <div class="dash-block-main">
                  <template v-for="(fee, fIndex) in costInfo[item.referenceNo].costFfGoods.list">
                    <FormItem
                      :key="`orderFee-${index}-${fIndex}`"
                      v-if="costFeeTypeList.costFfGoods.includes(fee.amountType)"
                    >
                      {{`${amountTypeList[fee.amountType].label || ''}：${($common.isEmpty(fee.amount) ? 0 : fee.amount).toFixed(2)} `}}
                      <Tooltip :transfer="true" placement="bottom-start">
                        <span class="dash-block-tips">{{fee.amountCurrency}}</span>
                        <div slot="content">
                          {{ `转人民币汇率：${fee.amountExchangeRate.toFixed(4)}(${fee.createdTime ? fee.createdTime.substring(0, 10) : ''})` }}
                        </div>
                      </Tooltip>
                    </FormItem>
                  </template>
                </div>
                <FormItem
                  class="dash-block-total"
                  label="商品成本合计(CNY)："
                  :label-width="140"
                >
                  {{($common.isEmpty(costInfo[item.referenceNo].costFfGoods.itemTotal) ? 0 : costInfo[item.referenceNo].costFfGoods.itemTotal).toFixed(2)}}
                </FormItem>
              </div>
              <div
                class="dash-block ignore-width"
                v-if="costInfo[item.referenceNo].logisticsFee && costInfo[item.referenceNo].logisticsFee.list
                && costInfo[item.referenceNo].logisticsFee.list.length > 0"
              >
                <div class="dash-block-title">物流费用</div>
                <div class="dash-block-main">
                  <template v-for="(fee, fIndex) in costInfo[item.referenceNo].logisticsFee.list">
                    <FormItem
                      :key="`orderFee-${index}-${fIndex}`"
                      v-if="costFeeTypeList.logisticsFee.includes(fee.amountType)"
                    >
                      {{`${amountTypeList[fee.amountType].label || ''}：${($common.isEmpty(fee.amount) ? 0 : fee.amount).toFixed(2)} `}}
                      <Tooltip :transfer="true" placement="bottom-start">
                        <span class="dash-block-tips">{{fee.amountCurrency}}</span>
                        <div slot="content">
                          {{ `转人民币汇率：${fee.amountExchangeRate.toFixed(4)}(${fee.createdTime ? fee.createdTime.substring(0, 10) : ''})` }}
                        </div>
                      </Tooltip>
                    </FormItem>
                  </template>
                </div>
                <FormItem
                  class="dash-block-total"
                  label="物流费用合计(CNY)："
                  :label-width="140"
                >
                  {{($common.isEmpty(costInfo[item.referenceNo].logisticsFee.itemTotal) ? 0 : costInfo[item.referenceNo].logisticsFee.itemTotal).toFixed(2)}}
                </FormItem>
              </div>
              <div
                class="dash-block ignore-width"
                v-if="costInfo[item.referenceNo].warehouseFee && costInfo[item.referenceNo].warehouseFee.list
                && costInfo[item.referenceNo].warehouseFee.list.length > 0"
              >
                <div class="dash-block-title">仓库费用</div>
                <div class="dash-block-main">
                  <template v-for="(fee, fIndex) in costInfo[item.referenceNo].warehouseFee.list">
                    <FormItem
                      :key="`orderFee-${index}-${fIndex}`"
                      v-if="costFeeTypeList.warehouseFee.includes(fee.amountType)"
                    >
                      {{`${amountTypeList[fee.amountType].label || ''}：${($common.isEmpty(fee.amount) ? 0 : fee.amount).toFixed(2)} `}}
                      <Tooltip :transfer="true" placement="bottom-start">
                        <span class="dash-block-tips">{{fee.amountCurrency}}</span>
                        <div slot="content">
                          {{ `转人民币汇率：${fee.amountExchangeRate.toFixed(4)}(${fee.createdTime ? fee.createdTime.substring(0, 10) : ''})` }}
                        </div>
                      </Tooltip>
                    </FormItem>
                  </template>
                </div>
                <FormItem
                  class="dash-block-total"
                  label="仓库费用合计(CNY)："
                  :label-width="140"
                >
                  {{($common.isEmpty(costInfo[item.referenceNo].warehouseFee.itemTotal) ? 0 : costInfo[item.referenceNo].warehouseFee.itemTotal).toFixed(2)}}
                </FormItem>
              </div>
              <div
                class="dash-block ignore-width"
                v-if="costInfo[item.referenceNo].otherFee && costInfo[item.referenceNo].otherFee.list
                && costInfo[item.referenceNo].otherFee.list.length > 0"
              >
                <div class="dash-block-title">其它费用</div>
                <div class="dash-block-main">
                  <template v-for="(fee, fIndex) in costInfo[item.referenceNo].otherFee.list">
                    <FormItem
                      :key="`orderFee-${index}-${fIndex}`"
                      v-if="costFeeTypeList.otherFee.includes(fee.amountType)"
                    >
                      {{`${amountTypeList[fee.amountType].label || ''}：${($common.isEmpty(fee.amount) ? 0 : fee.amount).toFixed(2)} `}}
                      <Tooltip :transfer="true" placement="bottom">
                        <span class="dash-block-tips">{{fee.amountCurrency}}</span>
                        <div slot="content">
                          {{ `转人民币汇率：${fee.amountExchangeRate.toFixed(4)}(${fee.createdTime ? fee.createdTime.substring(0, 10) : ''})` }}
                        </div>
                      </Tooltip>
                    </FormItem>
                  </template>
                </div>
                <FormItem
                  class="dash-block-total"
                  label="其它费用合计(CNY)："
                  :label-width="140"
                >
                  {{($common.isEmpty(costInfo[item.referenceNo].otherFee.itemTotal) ? 0 : costInfo[item.referenceNo].otherFee.itemTotal).toFixed(2)}}
                </FormItem>
              </div>
              <div class="dash-block">
                <div class="dash-block-title">合计</div>
                <FormItem class="dash-block-total" label="合计(CNY)：" :label-width="140">
                  {{ ($common.isEmpty(costInfo[item.referenceNo].subtotal) ? 0 : costInfo[item.referenceNo].subtotal).toFixed(2) }}
                </FormItem>
              </div>
            </div>
          </div>
        </Form>
      </div>
    </div>
    <div slot="footer">
      <Button @click="modalCancel">关 闭</Button>
    </div>
  </Modal>
</template>

<script>
import Big from 'big.js';
// import api from '@/api/api';
import publicService from '@/components/mixin/publicService_mixin';
import { costTypeData, ignoreCostType, costTypeSubtract, unviewableCostType } from '@/utils/comConfig';
// import Mixin from '@/components/mixin/common_mixin';
export default {
  name: 'profitDetails',
  mixins: [publicService],
  props: {
    platformId: { type: Array, default: () => { return [] } },
    // 订单基本信息
    orderInfo: {
      type: Object,
      default: () => {
        return {
          totalPriceCurrency: 'CNY'
        }
      }
    },
    orderNo: { type: String, default: '' },
    visible: { type: Boolean, default: false },
    // 订单详情信息
    orderDetailsData: { type: Object, default: () => { return {} } },
    // 利润信息
    getCostProfit: {
      type: Object,
      default: () => {
        return {
          profit: 0,
          cost: 0,
          profitMargin: 0
        }
      }
    },
    // 付款/收款信息
    payDetails: { type: Array, default: () => { return [] } },
  },
  data() {
    return {
      modalVisible: false,
      // 所有费用类型
      amountTypeList: (() => {
        let costTypeList = {};
        Object.values(costTypeData).forEach(item => {
          costTypeList = { ...costTypeList, ...item }
        })
        return costTypeList;
      })(),
      // 展示的费用类型
      costFeeTypeList: {
        // 收款
        proceeds: Object.keys(costTypeData.proceeds || {}),
        // 退款
        refund: Object.keys(costTypeData.refund || {}),
        // 平台佣金
        platformCommission: Object.keys(costTypeData.platformCommission || {}),
        // 交易费
        tradingFee: Object.keys(costTypeData.tradingFee || {}),
        // 广告费
        advertisingFee: Object.keys(costTypeData.advertisingFee || {}),
        // 店铺费用
        shopFee: Object.keys(costTypeData.shopFee || {}),
        // 补发费用
        supplyAgainFee: Object.keys(costTypeData.supplyAgainFee || {}),
        // 商品成本
        costFfGoods: Object.keys(costTypeData.costFfGoods || {}),
        // 物流费用
        logisticsFee: Object.keys(costTypeData.logisticsFee || {}),
        // 仓库费用
        warehouseFee: Object.keys(costTypeData.warehouseFee || {}),
        // 其他费用
        otherFee: Object.keys(costTypeData.otherFee || {}),
      },
      // 所有仓库平台
      allWarehouse: []
    }
  },
  watch: {
    visible: {
      deep: true,
      immediate: true,
      handler(val) {
        this.modalVisible = val;
      }
    },
    modalVisible: {
      deep: true,
      handler(val) {
        this.$emit('update:visible', val);
      }
    }
  },
  computed: {
    // 平台
    platform () {
      return this.platformId[0]
    },
    // 包裹信息
    orderShippingInfoList () {
      if (this.$common.isEmpty(this.orderDetailsData) || this.$common.isEmpty(this.orderDetailsData.orderShippingInfoList)) return [];
      const newList = this.orderDetailsData.orderShippingInfoList.filter(item => item.packageStatus != 99);
      return newList;
    },
    // 获取出库单号对应的仓库信息
    getWarehouseName () {
      let warehouse = {};
      const warehouseIds = this.orderShippingInfoList.map(m => m.warehouseId);
      const filterWarehouse = this.allWarehouse.filter(f => warehouseIds.includes(f.warehouseId));
      this.orderShippingInfoList.forEach(item => {
        filterWarehouse.forEach(w => {
          if (item.warehouseId === w.warehouseId) {
            warehouse[item.packageCode] = w;
          }
        })
      })
      return warehouse;
    },
    // 未作废的包裹号
    availableReferenceNo () {
      return this.orderShippingInfoList.map(m => m.packageCode);
    },
    // 所有费用数据
    reportData() {
      const arr = this.$common.isEmpty(this.orderDetailsData) ? [] : this.orderDetailsData.reportOrderProfitList || [];
      return this.$common.copy(arr);
    },
    // 收入
    receiveInfo() {
      let [reportData, receiveList] = [this.reportData, []];
      // statisticType（统计类型）,1:收入,2成本/支出
      receiveList = reportData.filter(k => k.statisticType == 1);
      let [collectList, refundList] = [[], []];
      let priceTotal = 0;
      let refundTotal = 0;
      let newAmount = 0;
      let amountExchangeRate = 0;
      // 遍历
      receiveList.forEach(k => {
        (k.reportOrderProfitDetailList || []).forEach(item => {
          amountExchangeRate = this.$common.isEmpty(item.amountExchangeRate) ? 0 : item.amountExchangeRate;
          newAmount = new Big(this.$common.isEmpty(item.amount) ? 0 : item.amount).times(amountExchangeRate);
          // 收款: 货品金额、买家支付运费的、税费、退货产品收入、订单总收入
          if (this.costFeeTypeList.proceeds.includes(item.amountType) && !this.unviewableType('proceeds', item.amountType)) {
            collectList.push(item);
            // 判断是否纳入合计
            if (this.isPlusHand('proceeds', item.amountType)) {
              priceTotal = new Big(priceTotal).plus(newAmount);
            } else if (this.isCostSubtract('proceeds', item.amountType)) {
              priceTotal = new Big(priceTotal).plus(newAmount * -1);
            }
          }
          // 显示退款金额的本币金额
          if (this.costFeeTypeList.refund.includes(item.amountType)) {
            refundList.push(item);
            refundTotal = new Big(refundTotal).plus(newAmount);
          }
        })
      });
      return {
        // 收款
        collectList: collectList,
        // 不含税收款合计
        priceTotal: priceTotal.toFixed(2),
        // 退款
        refundList: refundList,
        // 退款合计
        refundTotal: refundTotal.toFixed(2),
        // 收入合计，计算收入合计=不含税收款合计(CNY) - 退款合计(CNY) 注意： refundTotal 的值为负数，直接相加即可
        // total: new Big(priceTotal).minus(refundTotal).toFixed(2)
        total: new Big(priceTotal).plus(refundTotal).toFixed(2)
      };
    },
    // 成本
    costInfo() {
      const typeKeys = Object.keys(this.costFeeTypeList);
      let costData = {
        // 订单
        orderList: [],
        // 出库单
        stockList: [],
        // 售后
        afterSale: [],
        // 总计
        total: 0
      };
      let newAmount = 0;
      let amountExchangeRate = 0;
      this.reportData.forEach(item => {
        // statisticType (统计类型),1:收入,2成本/支出
        if (item.statisticType == 2) {
          // referenceType (单据类型) 1:订单 2:售后3:出库单
          if ([1, 2].includes(Number(item.referenceType)) || ([3].includes(Number(item.referenceType)) && this.availableReferenceNo.includes(item.referenceNo))) {
            if ([1, 2].includes(Number(item.referenceType))) {
              costData.orderList.push(item);
            } else if ([3].includes(Number(item.referenceType))) {
              costData.stockList.push(item);
            }
            // 使用 referenceNo 作为对象的 key
            costData[item.referenceNo] = {};
            // 将对应栏目的数据处理
            (item.reportOrderProfitDetailList || []).forEach(k => {
              // 汇率
              amountExchangeRate = this.$common.isEmpty(k.amountExchangeRate) ? 0 : k.amountExchangeRate;
              newAmount = new Big(this.$common.isEmpty(k.amount) ? 0 : k.amount).times(amountExchangeRate);
              typeKeys.forEach(key => {
                // 判断是否纳入合计
                if (this.costFeeTypeList[key].includes(k.amountType) && this.isPlusHand(key, k.amountType)) {
                  // 总计
                  costData.total = new Big(costData.total).plus(newAmount);
                  // 分组小计
                  if (!this.$common.isEmpty(costData[item.referenceNo].subtotal)) {
                    costData[item.referenceNo].subtotal = new Big(costData[item.referenceNo].subtotal).plus(newAmount);
                  } else {
                    costData[item.referenceNo].subtotal = newAmount;
                  }
                  if (!this.$common.isEmpty(costData[item.referenceNo][key])) {
                    costData[item.referenceNo][key].itemTotal = new Big(costData[item.referenceNo][key].itemTotal).plus(newAmount);
                    costData[item.referenceNo][key].list.push(k);
                  } else {
                    costData[item.referenceNo][key] = {
                      // 栏目小计
                      itemTotal: newAmount,
                      // 栏目数据
                      list: [k]
                    }
                  }
                }
              })
            })
          }
        }
      });
      // console.log(costData);
      return costData;
    }
  },
  created() {
    this.getAllstore(0, 3).then(res => {
      this.allWarehouse = res || [];
    });
  },
  methods: {
    // 关闭
    modalCancel() {
      this.modalVisible = false;
    },
    // 是否可累加
    isPlusHand (key, amountType) {
      if (this.$common.isEmpty(key) || this.$common.isEmpty(amountType)) return false;
      if (!this.$common.isEmpty(ignoreCostType[key])) {
        if (!this.$common.isEmpty(ignoreCostType[key][this.platform])) {
          return !ignoreCostType[key][this.platform].includes(amountType);
        }
        if (!this.$common.isEmpty(ignoreCostType[key].default)) {
          return !ignoreCostType[key].default.includes(amountType);
        }
      }
      return true;
    },
    // 不展示的类型
    unviewableType (key, amountType) {
      if (this.$common.isEmpty(key) || this.$common.isEmpty(amountType)) return false;
      if (!this.$common.isEmpty(unviewableCostType[key])) {
        if (!this.$common.isEmpty(unviewableCostType[key][this.platform])) {
          return unviewableCostType[key][this.platform].includes(amountType);
        }
        if (!this.$common.isEmpty(unviewableCostType[key].default)) {
          return unviewableCostType[key].default.includes(amountType);
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
  }
};
</script>

<style lang="less">
.profit-details {
  position: relative;

  .details-title {
    font-size: 16px;
    font-weight: bold;
    padding-bottom: 16px;
    border-bottom: 1px solid #ccc;
  }

  .fmb0 {
    .ivu-form-item {
      margin-bottom: 0px;
    }
  }

  .profit-content {
    padding: 16px;

    .block {
      .active-title {
        border-left: 4px solid #2D8CF0;
        padding-left: 10px;
      }

      .block-content {
        margin: 10px 16px;

        .back-block {
          background-color: #e3e5e8;
          font-weight: bold;
          margin-bottom: 6px;
        }
      }

      .dash-block {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px dashed #ccc;

        .dash-block-title {
          font-weight: bold;
          white-space: nowrap;
          margin-right: 10px;
        }
        .dash-block-main{
          flex: 100;
          text-align: right;
          .dash-block-tips{
            color: #2D8CF0;
            text-decoration: underline;
            cursor: pointer;
            // &:hover{
            //   color: #9100ff;
            // }
          }
        }
        .dash-block-total{
          width: 210px;
          margin-right: 0;
          .ivu-form-item-label{
            padding-right: 0px;
          }
        }
      }
    }

    .profit-form {
      .ivu-form-item-content {
        width: 90px;
      }

      .ignore-width .ivu-form-item-content {
        width: auto;
      }
    }
  }
}
</style>
