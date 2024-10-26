<template>
  <div class="stockoutOrderDetails">
    <Tabs v-model="tabsVal" :animated="true" @on-click="tabsActive" v-if="skuList && skuList.length > 0 ">
      <TabPane v-for="(item, index) in skuList" :key="index" :label="item" :name="item">
        <div v-if="showTab[item] && !detailsLoading" class="tab-pane-details">
          <!-- 订单信息 -->
          <div class="pane-details-row">
            <div class="pane-details-info">
              <div class="pane-details-item">
                <span class="item-label">订单号：</span>
                <span class="item-content" v-if="skuDetails[tabsVal]">{{componentData.accountCode}}-{{skuDetails[tabsVal].salesRecordNumber}}</span>
              </div>
              <div class="pane-details-item">
                <span class="item-label">平台：</span>
                <span class="item-content" v-if="skuDetails[tabsVal]">
                  {{skuDetails[tabsVal].platformId}}
                </span>
              </div>
              <div class="pane-details-item">
                <span class="item-label">付款时间：</span>
                <span class="item-content" v-if="skuDetails[tabsVal]">
                  {{skuDetails[tabsVal].payTime ? skuDetails[tabsVal].payTime.substr(0, 19) : ''}}
                </span>
              </div>
              <div class="pane-details-item">
                <span class="item-label">发货剩余：</span>
                <span class="item-content">{{shippingLimiteTime}}</span>
              </div>
              <div class="pane-details-item">
                <span class="item-label">缺货SKU：</span>
                <span class="item-content">{{tabsVal}}</span>
              </div>
              <div class="pane-details-item">
                <span class="item-label">名称：</span>
                <span class="item-content" v-if="skuDetails[tabsVal]">
                  {{skuDetails[tabsVal].productName}}
                </span>
              </div>
              <div class="pane-details-item">
                <span class="item-label">商品状态：</span>
                <span class="item-content" v-if="skuDetails[tabsVal]">
                  {{ typeof skuDetails[tabsVal].status !== 'undefined' ? productStatus[skuDetails[tabsVal].status] : ''}}
                </span>
              </div>
              <div class="pane-details-item">
                <span class="item-label">规格：</span>
                <span class="item-content" v-if="skuDetails[tabsVal]">{{skuDetails[tabsVal].variations}}</span>
              </div>
              <div class="pane-details-item">
                <span class="item-label">商品缺货数量：</span>
                <span class="item-content" v-if="skuDetails[tabsVal]">{{skuDetails[tabsVal].quantity}}</span>
              </div>
            </div>
            <div class="pane-details-block goodsMissingTable">
              <div class="details-block-title">商品其他缺货订单信息</div>
              <goodsMissingTable :sku-details="skuDetails" :account-code="accountCodeJson" :details-info="detailsInfo" :inventory-delivery="inventoryDelivery" :component-data="componentData" :sku="tabsVal" />
            </div>
          </div>
          <!-- 采购信息 -->
          <div class="pane-details-row">
            <div class="pane-details-block orderInfoTable">
              <div class="details-block-title">商品库存采购信息</div>
              <div class="pane-details-item" style="margin-bottom: 10px;">
                <span class="item-label">本地未发在途：</span>
                <span class="item-content">
                  {{inventoryDelivery[tabsVal] ? inventoryDelivery[tabsVal].onWayNoDespatchNumberLocal || 0 : 0}}
                </span>
              </div>
              <div class="pane-details-item" style="margin-bottom: 10px;">
                <span class="item-label">海外未发在途：</span>
                <span class="item-content">
                  {{inventoryDelivery[tabsVal] ? inventoryDelivery[tabsVal].onWayNoDespatchNumberOverseas || 0 : 0}}
                </span>
              </div>
              <div class="pane-details-item" style="margin-bottom: 10px;">
                <span class="item-label">本地发货在途：</span>
                <span class="item-content">
                  {{inventoryDelivery[tabsVal] ? inventoryDelivery[tabsVal].onWayDespatchNumberLocal || 0 : 0}}
                </span>
              </div>
              <div class="pane-details-item" style="margin-bottom: 10px;">
                <span class="item-label">海外发货在途：</span>
                <span class="item-content">
                  {{inventoryDelivery[tabsVal] ? inventoryDelivery[tabsVal].onWayDespatchNumberOverseas || 0 : 0}}
                </span>
              </div>
              <div class="pane-details-item" style="margin-bottom: 10px;">
                <span class="item-label">库存：</span>
                <span class="item-content">
                  {{inventoryDelivery[tabsVal] ? inventoryDelivery[tabsVal].inventoryNumber || 0 : 0}}
                </span>
              </div>
              <orderInfoTable :sku-details="skuDetails" :details-info="detailsInfo" :inventory-delivery="inventoryDelivery" :component-data="componentData" :sku="tabsVal" />
            </div>
          </div>
          <!-- 库存信息 -->
          <div class="pane-details-row">
            <div class="pane-details-block wmsInventoryTable">
              <div class="details-block-title">有库存的SPU商品信息</div>
              <!-- <div v-if="detailsInfo[tabsVal] && detailsInfo[tabsVal]['wmsInventoryList']"></div> -->
              <wmsInventoryTable :sku-details="skuDetails" :details-info="detailsInfo" :inventory-delivery="inventoryDelivery" :component-data="componentData" :sku="tabsVal" />
            </div>
          </div>
        </div>
      </TabPane>
    </Tabs>
    <div v-else-if="!detailsLoading">暂无数据，如有异常请连续管理员！</div>
    <Spin v-if="detailsLoading" fix></Spin>
  </div>
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import orderSys from '@/components/mixin/orderSys_mixin';
import goodsMissingTable from './goodsMissingTable';
import wmsInventoryTable from './wmsInventoryTable';
import orderInfoTable from './orderInfoTable';
import stockoutOrder from '../../script/stockoutOrder';

export default {
  components: { goodsMissingTable, wmsInventoryTable, orderInfoTable },
  mixins: [Mixin, orderSys],
  data () {
    return {
      accountCodeJson: {},
      detailsLoading: true,
      tabsVal: '',
      orderId: '',
      showTab: {},
      skuList: [],
      detailsInfo: {},
      skuDetails: {},
      shippingLimiteTime: '',
      inventoryDelivery: {},
      productStatus: {
        0: '停售', 1: '在售', 2: '试卖', 3: '清仓', 4: '促销', 5: '转季'
      }
    };
  },
  props: {
    componentData: {
      type: Object,
      default: () => {
        return {}
      }
    },
    sliderVisible: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    sliderVisible: {
      deep: true,
      handler (val) {
        val ? this.initPage() : this.restData();
      }
    },
    detailsLoading: {
      deep: true,
      handler (val) {
        !val && this.$nextTick(() => {
          stockoutOrder.modalGuide(() => {
            this.$emit('closeModal');
          });
        })
      }
    }
  },
  computed: {},
  created () { },
  mounted () { },
  methods: {
    restData () {
      this.detailsLoading = true;
      this.tabsVal = '';
      this.orderId = '';
      this.showTab = {};
      this.skuList = [];
      this.detailsInfo = {};
      this.skuDetails = {};
      this.shippingLimiteTime = '';
      this.inventoryDelivery = {};
    },
    initPage () {
      this.detailsLoading = true;
      if (this.componentData.synDeliverStatus == 3) {
        this.shippingLimiteTime = '已发货，标发货时间：' + this.getDataToLocalTime(this.componentData.synDeliverDate, 'fulltime');
      } else {
        this.shippingLimiteTime = this.computedTime(this.componentData.remainTime);
      }
      this.orderId = this.componentData.orderId;
      this.getGoodsMissing();
    },
    // 获取订单信息
    getGoodsMissing () {
      this.axios.get(`${api.query_byGoodsMissing}?orderId=${this.orderId}`).then(res => {
        if (res.data && res.data.datas) {
          let skuList = [];
          let accountIds = [];
          let goodsMissing = {};
          // 排序
          res.data.datas.sort((a, b) => {
            return !this.$common.dayjs(b.payTime).isAfter(a.payTime) ? -1 : 1;
          })
          res.data.datas.forEach(item => {
            if (item.payTime) {
              item.payTime = this.getDataToLocalTime(item.payTime, 'fulltime')
            }
            if (this.orderId === item.orderId) {
              skuList.push(item.sku);
              this.$set(this.skuDetails, item.sku, item);
            }
            if (!accountIds.includes(item.saleAccountId)) {
              accountIds.push(item.saleAccountId);
            }
            if (!goodsMissing[item.sku]) {
              this.$set(goodsMissing, item.sku, [item]);
            } else {
              goodsMissing[item.sku].push(item);
            }
          })
          this.$set(this.detailsInfo, 'goodsMissing', goodsMissing);
          this.skuList = skuList;
          this.tabsVal = skuList[0] || '';
          this.$set(this.showTab, this.tabsVal, true);
          this.getOtherOnfo(accountIds);
        }
      }).catch(() => {
        this.detailsLoading = false;
      })
    },
    // 切换时
    tabsActive (name) {
      if (!this.showTab[name]) {
        this.detailsLoading = true;
        this.$set(this.showTab, name, true);
        this.$nextTick(() => {
          this.getOtherOnfo();
        })
      }
    },
    getOtherOnfo (accountIds = []) {
      this.$set(this.detailsInfo, this.tabsVal, {});
      const getOrderInfoList = this.axios.post(api.orderInfoList, { skuNoList: [this.tabsVal] });
      let getWmsInventoryList = new Promise((resolve) => { resolve(false) });
      if (this.skuDetails[this.tabsVal] && this.skuDetails[this.tabsVal].spu) {
        getWmsInventoryList = this.axios.post(api.wmsInventoryList, { spuList: [this.skuDetails[this.tabsVal].spu] });
      }
      let getAccountIdPos = new Promise((resolve) => { resolve([]) });
      if (!this.$common.isEmpty(accountIds)) {
        getAccountIdPos = this.axios.post(api.get_saleAccountById + '?saleAccountIds=' + accountIds);
      }
      Promise.all([getOrderInfoList, getWmsInventoryList, getAccountIdPos]).then((arr) => {
        if (arr[0] && arr[0].data && arr[0].data.datas) {
          arr[0].data.datas.forEach(item => {
            if (item.salesTime) {
              item.salesTime = this.getDataToLocalTime(item.salesTime, 'fulltime')
            }
            // if (item.requireDespatchTime) {
            //   item.requireDespatchTime = this.getDataToLocalTime(item.requireDespatchTime, 'fulltime')
            // }
          })
          // 排序
          arr[0].data.datas.sort((a, b) => {
            return !this.$common.dayjs(b.salesTime).isAfter(a.salesTime) ? -1 : 1;
          });
          this.$set(this.detailsInfo[this.tabsVal], 'orderInfoList', arr[0].data.datas);
        }
        if (arr[1] && arr[1].data && arr[1].data.datas) {
          arr[1].data.datas.forEach(item => {
            this.$set(this.inventoryDelivery, item.goodsSku, item);
          });
          // 排序
          // arr[1].data.datas.sort((a, b) => {
          //   return !this.$common.dayjs(b.payTime).isAfter(a.payTime) ? -1 : 1;
          // });
          this.$set(this.detailsInfo[this.tabsVal], 'wmsInventoryList', arr[1].data.datas);
        }
        if (arr[2] && arr[2].data && arr[2].data.datas) {
          arr[2].data.datas.forEach(item => {
            this.$set(this.accountCodeJson, item.saleAccountId, item)
          })
        }
        this.detailsLoading = false;
      }).catch(() => {
        this.detailsLoading = false;
      })
    }
  }
};
</script>
<style scoped lang="less">
.stockoutOrderDetails {
  position: relative;
  min-height: 200px;
  .tab-pane-details {
    padding: 0 5px;
    .pane-details-item {
      display: inline-block;
      width: 25%;
      min-width: 300px;
      padding-right: 15px;
      line-height: 1.5em;
      .item-label {
        display: inline-block;
        width: 100px;
        text-align: right;
        vertical-align: top;
      }
      .item-content {
        display: inline-block;
        padding-bottom: 10px;
        width: calc(100% - 102px);
        text-align: left;
        vertical-align: top;
        // overflow: hidden;
        // text-overflow: ellipsis;
        // white-space: nowrap;
      }
    }
    .pane-details-row {
      margin-bottom: 15px;
      .pane-details-block {
        .details-block-title {
          position: relative;
          padding: 2px 10px;
          margin: 5px 0;
          font-size: 14px;
          font-weight: bold;
          &:before {
            position: absolute;
            content: "";
            left: 0;
            top: 50%;
            height: calc(100% - 4px);
            width: 3px;
            background: #2d8cf0;
            transform: translate(0, -50%);
          }
        }
      }
    }
  }
}
</style>
<style lang="less">
.stockoutOrderDetails {
  .ivu-tabs-tabpane {
    max-height: 60vh;
    overflow: auto;
  }
}
</style>
