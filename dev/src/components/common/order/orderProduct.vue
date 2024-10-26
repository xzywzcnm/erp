<template>
  <div class="order-product-info">
    <div class="order-product-main">
      <div class="main-label">商品信息</div>
      <div class="modalItemContent">
        <span
          v-if="['ozon'].includes(activePlatform) && notSpiltTotal > 1 && getOzonCurrent"
          class="pointer-font"
          @click="openSplitModal"
          style="display:inline-block; margin-bottom: 5px;"
        >
          拆单
        </span>
        <Row
          class="orderDetailsProductItem"
          :class="{ 'is-check-product': getOrderTransactionId === item.webstoreOrderTransactionId }"
          v-for="(item, index) in orderTransactionsList"
          :key="index"
        >
          <div class="row-info-td orderDetailsProductItemPic">
            <img :src="item.pictureUrl === null ? placeholderSrc : item.pictureUrl">
          </div>
          <div class="row-info-td order-product-middle">
            <div class="odpidProductID">
              <div v-if="item.webstoreItemId">
                <div>
                  <span class="productHaveATitle">itemID：</span>
                  <a
                    class="productID mr10 cursor-und"
                    v-if="isPlatformItem"
                    target="_blank"
                    @click="goItemUrl(item)"
                    style="color:#f20;"
                  >{{ item.webstoreItemId }}</a>
                  <span v-else class="productID mr10" style="color:#f20;">{{ item.webstoreItemId }}</span>
                </div>
                <template v-if="['aliexpress'].includes(activePlatform)">
                  <span v-if="combinedOrder" class="combined_order">合单</span>
                  <span v-if="tenDaysOrder" style="background-color: #ff9b04;" class="combined_order">十日达</span>
                  <span v-if="item.isPlatformShippedTransaction === 1" style="background-color: #04ff75;" class="combined_order">认证仓</span>
                  <template v-if="item.orderTransactionExtend">
                    <span v-if="item.orderTransactionExtend.aliexpressAlreadyTaxed === 'I_TAXED'" style="background-color: #04A7FF;" class="combined_order">
                      跨境已税
                    </span>
                    <span v-if="item.orderTransactionExtend.aliexpressAlreadyTaxed === 'U_TAXED'" style="background-color: #CE7515;" class="combined_order">
                      海外仓已税
                    </span>
                  </template>
                </template>
                <span
                  v-if="['ebay', 'customer'].includes(activeInGroup) && getPermission('orderInfo_ebaySendBuyerMessage')"
                  class="contact-buyers"
                  @click="openContactBuyersModal(item)"
                >
                  <Icon size="16" type="md-text" />联系买家
                </span>
                <span v-if="activePlatform === 'amazon' && item.orderTransactionExtend" class="ml10">
                  asin: <a @click="goListing(item)">{{ item.orderTransactionExtend.amazonAsin }}</a>
                </span>
              </div>
              <span class="productHaveATitle">SKU: <em>{{ item.webstoreSku }}</em></span>
              <span class="productHaveATitle" v-if="activePlatform === 'ebay'">物品所在地: <em>{{ item.location }}</em></span>
              <!--
                匹配添加
                valueCode = orderInfo->webstoreItemSite (如果orderInfo->webstoreItemSite不为空需加这个条件)
                valueCnName = orderInfo->orderTransactioin->buyerShippingMethod
                如果根据这两个条件能从出参里取取到记录，那么显示出参对应的remark字段，否则还是显示原来的buyerShippingMethod
              -->
              <span class="productLogsticService">
                物流服务：
                <em v-if="$store.state.commonParameter.some(i=>i.valueCode === orderInfo.webstoreItemSite && i.valueCnName === item.buyerShippingMethod)">
                  {{ $store.state.commonParameter.filter(i => i.valueCode === orderInfo.webstoreItemSite && i.valueCnName === item.buyerShippingMethod)[0].remark }}
                </em>
                <em v-else>{{ item.buyerShippingMethod }}</em>
              </span>
            </div>
            <div v-if="!$common.isEmpty(Number(item.productsPrice)) && activePlatform === 'ebay'">
              <!-- <div>销售单价：{{ `${Number(item.productsPrice).toFixed(2)} ${item.productsCurrency || ''}` }}</div> -->
              <div>
                实际付款金额：
                <span style="color:#f20;">{{ `${Number(item.productsPrice).toFixed(2)} ${item.productsCurrency || ''}` }}</span>
              </div>
            </div>
            <div class="odpidProductDetails" :title="`名称：${item.title}`">
              {{ item.title }}
            </div>
            <!-- 标记匹配商品 -->
            <div v-if="!isPlatformOrder">
              <span v-if="(item.matchType === 0)" style="margin-right: 5px;">
                <span class="tips-tag-txt tips-tag-error" title="匹配状态">匹配LAPA商品失败</span>
                <Button
                  type="text"
                  v-if="showMarryGoods"
                  @click="marryGoods({index: index, item: item})"
                  size="small"
                  :disabled="marryStatus"
                  style="color:#0000FF;"
                  title="点击匹配商品"
                >匹配商品</Button>
                <span class="tips-tag-txt tips-tag-brand" v-if="activePlatform === 'otto'" title="品牌">品牌：{{ item.brandName }}</span>
              </span>
              <span class="tips-tag-txt" v-if="(item.matchType === 1)" title="匹配状态">匹配LAPA商品成功</span>
              <span class="tips-tag-txt " v-if="(item.matchType === 2)" title="匹配状态">匹配LAPA商品成功(人工匹配)</span>
            </div>
          </div>
          <div class="row-info-td orderDetailsQuantity">
            <span>X {{ item.quantity }}</span>
            <div
              class="redColor noInPack ml5"
              v-if="packageGoodsQuantity !== null && (item.quantity - packageGoodsQuantity[item.salesRecordNumber]) > 0 &&
                (item.isDeliver === 1 || item.isDeliver === null) && !setNoDelivery"
            >
              <span>{{ item.quantity - packageGoodsQuantity[item.salesRecordNumber] }}</span> 个未包含在包裹中
            </div>
            <div class="ml5" v-if="packageGoodsQuantity !== null">
              <Checkbox
                v-model="setNoDelivery"
                true-value=1
                false-value=0
                v-if="(item.quantity - packageGoodsQuantity[item.salesRecordNumber]) > 0 && (item.isDeliver === 1 || item.isDeliver === null) && !setNoDelivery && hasEdit"
                @on-change="markNoDeliver(item.orderTransactionId)"
              >标记不发货</Checkbox>
            </div>
          </div>
          <div class="row-info-td product-info" v-if="!isPlatformOrder">
            <div v-if="item.sku" class="product-info-item">
              <div class="item-label">sku: </div>
              <div class="item-content">{{item.sku}}</div>
            </div>
            <div v-if="item.productName" class="product-info-item">
              <div class="item-label">名称: </div>
              <div class="item-content">{{item.productName}}</div>
            </div>
            <div v-if="!!item.variations" class="product-info-item">
              <div class="item-label">规格: </div>
              <div class="item-content">
                <span v-for="(vItem, vIndex) in item.variationList" :key="`${vIndex}`" class="product-info-variation">
                  <span>{{vItem.name}}: </span>
                  <span>{{vItem.value}}</span>
                </span>
              </div>
            </div>
            <div v-if="['ozon'].includes(activePlatform) && item.splitQuantity > 0 && !$common.isEmpty(item.ozonSplitOrderRecordList)">
              <div class="product-info-item">
                <div class="item-label">未拆分数量: </div>
                <div class="item-content">{{Number(item.quantity) - Number(item.splitQuantity || '0')}}</div>
              </div>
              <div class="product-info-item">
                <div class="item-label">已拆分数量: </div>
                <div class="item-content">{{item.splitQuantity}}</div>
              </div>
              <div
                class="product-info-item"
                v-if="['ozon'].includes(activePlatform) && item.splitQuantity > 0 && !$common.isEmpty(item.ozonSplitOrderRecordList)"
              >
                <Poptip trigger="hover" placement="bottom-start">
                  <div class="pointer-font" @click="searchTableData(true, {
                    nowId: `${accountCode || ''}-${orderSalesRecNumber || ''}`,
                    list: item.ozonSplitOrderRecordList
                  })">已拆单</div>
                  <div slot="content">
                    <div>已拆单</div>
                    <div>{{ `主单：${accountCode || ''}-${orderSalesRecNumber || ''}，数量：${notSpiltTotal}` }}</div>
                    <div
                      v-for="(oSp, oIndex) in item.ozonSplitOrderRecordList"
                      :key="`osp-${oIndex}`"
                    >{{ `拆分订单${(oIndex + 1)}：${accountCode || ''}-${oSp.subWebstoreOrderId || ''}，数量：${oSp.quantity}` }}</div>
                    <div>点击图标可查询主单以及拆分订单</div>
                  </div>
                </Poptip>
              </div>
            </div>
          </div>
        </Row>
      </div>
    </div>
    <!-- 人工匹配商品 -->
    <!-- <matchingGoodsModal ref="matchingGoodsModal" :orderInfo="orderInfo" :typeStatus="typeStatus" :inPage="inPage" @updateOrder="marryGoods" /> -->
    <matchingGoodsModal ref="matchingGoodsModal" :orderInfo="orderInfo" :typeStatus="typeStatus" :inPage="inPage" />
    <!-- 联系买家模态框-->
    <buyerMessage ref="buyerMessage" :orderInfo="orderInfo" :platformId="activePlatform" />
    <!-- 拆单弹窗 -->
    <splitOrderModal :modelVisible.sync="spiltModelVisible" :modelData="splitDetailInfo" @updateOrderData="updateOrderData" />
  </div>
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import matchingGoodsModal from './matchingGoodsModal';
import buyerMessage from '@/views/ebay/components/ebay/buyerMessage';
import splitOrderModal from './splitOrderModal';
import { platformReceptionUrl } from '@/utils/enum';

export default {
  mixins: [Mixin],
  components: {
    matchingGoodsModal,
    buyerMessage,
    splitOrderModal
  },
  props: {
    platformId: { type: Array, default: () => { return [] } },
    // 是否可以编辑
    hasEdit: { type: Boolean, default: true },
    orderDetailsData: { type: Object, default: () => { return {} } },
    shopDataList: { type: Array, default: () => { return [] } },
    orderInfo: [Object, String],
    packageGoodsQuantity: Object,
    orderRowsDetail: { type: Object, default: () => { return {} } },
    // 来源-从什么地方打开，默认为空
    targetSource: { type: String, default: null },
    inPage: { type: String, default: null }
  },
  data () {
    // let self = this;
    /**
     * 1.joom
     https://www.joom.com/en/products/{itemID}
     2.速卖通
     https://www.aliexpress.com/item/{itemID}.html
     3.wish
     https://www.wish.com/product/{itemID}
     4.Walmart
     https://www.walmart.com/ip/{itemID}
     5.Amazon(后缀根据店铺所在站点不同)
     https://www.amazon.co.uk/gp/product/{ASIN}
     6.shopee（平台域名和站点相关）
     https://shopee.com.my/product/{shopid}/{itemid}
     * */
    return {
      platformItemUrl: platformReceptionUrl,
      spiltModelVisible: false,
      splitDetailInfo: {},
      marryData: {},
      marryStatus: false, // 人工匹配按钮状态控制
      setNoDelivery: false,
      typeStatus: 1, // 表示执行人工匹配功能
      combinedOrder: false, // 合单
      tenDaysOrder: false // 十日达
    };
  },
  watch: {
    inGroup: {
      handler: 'getOrderCommonParameter',
      immediate: true
    },
    orderInfo: {
      handler (data) {
        if (data.orderExtendInfo) {
          let talg = data.orderExtendInfo.aliexpressTagType;
          if (talg !== null) {
            // 合单
            if (talg.indexOf('HBA_UP_EXPRESS') > -1) {
              this.combinedOrder = true;
            } else {
              this.combinedOrder = false;
            }
            // 十日达
            if (talg.indexOf('leadTimeTag#') > -1) {
              this.tenDaysOrder = true;
            } else {
              this.tenDaysOrder = false;
            }
          } else {
            this.combinedOrder = false;
            this.tenDaysOrder = false;
          }
        } else {
          this.combinedOrder = false;
          this.tenDaysOrder = false;
        }
      },
      deep: true,
      immediate: true
    },
    fullInGroup: {
      handler: 'getOrderCommonParameter',
      immediate: true
    }
  },
  computed: {
    // 当前模块
    activeInGroup () {
      if (this.$store.state.fullInGroup) {
        return this.$store.state.fullInGroup || null;
      }
      return this.inGroup || null;
    },
    // 详情信息
    pageDetail () {
      if (this.$common.isEmpty(this.orderRowsDetail) && this.$common.isEmpty(this.orderDetailsData) && this.$common.isEmpty(this.orderInfo)) return {};
      if (this.$common.isEmpty(this.orderRowsDetail)) {
        if (this.$common.isEmpty(this.orderInfo)) {
          if (this.$common.isEmpty(this.orderRowsDetail) || this.$common.isEmpty(this.orderRowsDetail.orderInfo)) return {};
          return this.orderRowsDetail.orderInfo;
        };
        return this.orderInfo;
      }
      return this.orderRowsDetail;
    },
    // 当前平台
    activePlatform () {
      if (this.$common.isEmpty(this.platformId)) return this.inGroup;
      if (this.$common.isString(this.platformId)) return this.platformId;
      return (this.platformId || []).join(',');
    },
    // 是否平台仓订单   0：不是平台仓订单，1：是平台仓订单
    isPlatformOrder () {
      if (this.$common.isEmpty(this.pageDetail)) return false;
      return [1, '1'].includes(this.pageDetail.isPlatformOrder);
    },
    // 是否在 退货退款页面打开
    isRefundReturn () {
      return ['ebayRefundReturn'].includes(this.targetSource);
    },
    // 交易号
    getOrderTransactionId () {
      if (this.$common.isEmpty(this.pageDetail) || !this.isRefundReturn) return '';
      return this.pageDetail.webstoreOrderTransactionId || '';
    },
    // 订单ID
    getOrderId () {
      if (this.$common.isEmpty(this.orderInfo) || this.$common.isEmpty(this.orderInfo.orderId)) return '';
      return this.orderInfo.orderId;
    },
    // 单号
    orderSalesRecNumber () {
      if (this.$common.isEmpty(this.orderInfo)) return '';
      return this.orderInfo.salesRecordNumber || '';
    },
    // 店铺 code
    accountCode () {
      if (this.$common.isEmpty(this.orderInfo) || this.$common.isEmpty(this.orderInfo.saleAccountId)) return '';
      if (this.$common.isEmpty(this.shopDataList)) return '';
      const seekAccount = this.shopDataList.find(seek => {
        return seek.saleAccountId == this.orderInfo.saleAccountId
      })
      if (this.$common.isEmpty(seekAccount)) return;
      return seekAccount.accountCode || '';
    },
    orderTransactionsList () {
      if (this.$common.isEmpty(this.orderInfo) || this.$common.isEmpty(this.orderInfo.orderTransactions)) return [];
      const productList = this.orderInfo.orderTransactions.map(item => {
        let variationList = [];
        if (!this.$common.isEmpty(item.variations)) {
          variationList = item.variations.split(';').map(m => {
            return { name: m.split(':')[0], value: m.split(':')[1] }
          })
        }
        return {
          ...item,
          ozonSplitOrderRecordList: this.orderInfo.ozonSplitOrderRecordList || [],
          variationList: variationList
        }
      })
      return productList;
    },
    // 未拆单的数量
    notSpiltTotal () {
      let total = 0;
      let spiltTotal = 0;
      (this.orderInfo.ozonSplitOrderRecordList || []).forEach(row => {
        if (!this.$common.isEmpty(Number(row.quantity))) {
          spiltTotal += Number(row.quantity);
        }
      })
      this.orderTransactionsList.forEach(row => {
        if (!this.$common.isEmpty(Number(row.quantity))) {
          total += Number(row.quantity);
        }
      })
      return total - spiltTotal;
    },
    // 是否显示匹配商品按钮
    showMarryGoods () {
      if (!this.hasEdit || this.$common.isEmpty(this.orderInfo) || this.$common.isEmpty(this.orderInfo.payTime)) return false;
      if ([1, '1'].includes(this.orderInfo.isInvalid) || ['dispute'].includes(this.inPage)) return false;
      return this.getPermission('orderTransaction_matchProductGoods');
    },
    isPlatformItem () {
      // 需要跳转的平台
      return Object.keys(this.platformItemUrl || {}).includes(this.activeInGroup);
    },
    fullInGroup () {
      return this.$store.state.fullInGroup;
    },
    // 物流信息
    ozonShippingInfoList () {
      const orderShippingDetails = this.$store.state.orderShippingDetails;
      if (!this.$common.isEmpty(orderShippingDetails)) {
        return orderShippingDetails[0];
      }
      if (this.$common.isEmpty(this.pageDetail)) return {};
      if (this.$common.isEmpty(this.pageDetail.orderShippingInfos)) {
        if (this.$common.isEmpty(this.pageDetail.orderShippingInfoList)) return {};
        return this.pageDetail.orderShippingInfoList[0];
      }
      return this.pageDetail.orderShippingInfos[0];
    },
    // 包裹状态(只对 ozon 处理)
    getOzonCurrent () {
      if (this.$common.isEmpty(this.ozonShippingInfoList)) return false;
      let index = 0;
      let isNull = true;
      const posOzon = [
        this.ozonShippingInfoList.packageCreatedTime, // 创建
        this.ozonShippingInfoList.pickingTime, // 分配
        this.ozonShippingInfoList.getLabelTime, // 下发物流
        this.ozonShippingInfoList.packageGoodsStatus, // 拣货1， 2未拣货
        this.ozonShippingInfoList.printTime, // 打印
        this.ozonShippingInfoList.despatchTime // 结束
      ];
      posOzon.forEach((item, fIndex) => {
        if (isNull && (this.$common.isEmpty(item) || item == 1)) {
          index = fIndex;
          isNull = false;
        }
      });
      // 下发物流后不能拆单
      return isNull ? false : index <= 2;
    }
  },
  methods: {
    goItemUrl (item) {
      /**
       * 跳转到对应平台
       * @params item 当前操作对象
       * customer 是客服系统
       * */
      if (this.$common.isEmpty(this.platformItemUrl[this.activeInGroup])) return;
      const itemId = item.webstoreItemId || '';
      const amazonAsin = item.orderTransactionExtend ? item.orderTransactionExtend.amazonAsin || '' : '';
      let shopeeShopId = '';
      if (this.$store.state.orderDetails && this.$store.state.orderDetails.accountInfo) {
        shopeeShopId = this.$store.state.orderDetails.accountInfo.shopeeShopId || '';
      }
      const openUrl = this.platformItemUrl[this.activeInGroup](itemId, amazonAsin, shopeeShopId);
      window.open(openUrl);
    },
    // 刷新订单数据
    updateOrderData (val) {
      this.$emit('updateOrderData', val);
    },
    getOrderCommonParameter () {
      if (this.$store.state.commonParameter.length > 0) {
        if (this.fullInGroup) {
          if (this.$store.state.commonParameter[0].parameterCode === this.fullInGroup) return;
        } else {
          if (this.$store.state.commonParameter[0].parameterCode === this.activePlatform) return;
        }
      }
      this.axios.post(api.get_orderCommonParameter, {
        'parameterName': 'shipmentType',
        parameterCode: this.$store.state.fullInGroup || this.activePlatform
      }).then(response => {
        if (response.data.code === 0) {
          this.$store.commit('commonParameter', response.data.datas);
        }
      });
    },
    goListing (item) {
      let newTab = window.open('about:blank');
      this.axios.get(`${api.erpServiceCommon}common-service/${api.get_site}?siteIdList=${this.orderInfo.webstoreItemSite}&platformId=amazon`).then(res => {
        if (res.data.code === 0 && item.orderTransactionExtend) {
          if (res.data.datas && res.data.datas.length > 0) {
            newTab.location.href = 'https://www.' + res.data.datas[0].url + '/gp/product/' + item.orderTransactionExtend.amazonAsin;
          } else {
            this.$Message.error('接口数据为空');
          }
        }
      });
    },
    openContactBuyersModal (data) {
      this.$refs.buyerMessage.model1 = true;
      this.$store.commit('contactBuyer', data);
    },
    markNoDeliver (id) {
      this.axios.post(api.set_orderNoDeliver + '?orderTransactionId=' + id);
    },
    marryGoods (config) { // 人工匹配模态框
      let item = config.item;
      const index = config.index;
      if (item == 'again') {
        item = this.marryData;
      } else {
        this.marryData = item;
      }
      let sku = null;
      if (item.sku) {
        sku = item.sku;
      } else {
        sku = item.variations ? item.webstoreItemId + item.variations : item.webstoreItemId;
      }
      this.marryStatus = true;
      let obj = {
        sku: sku
      };
      this.axios.post(api.qury_productSku, obj).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data) {
            let obj = {
              businessId: data.businessId,
              orderId: item.orderId,
              orderTransactionId: item.orderTransactionId,
              productName: data.productName,
              source: data.source
            };
            this.axios.post(api.match_productGoods, obj).then(response => {
              this.marryStatus = false;
              if (response.data.code === 0) {
                this.$parent.updateStatus = true;
                this.searchTableData(); // 刷新列表
                if (this.inPage === 'combineOrder') {
                  this.$store.commit('combineStatus', true);
                }
              }
            }).catch(() => {
              this.marryStatus = false;
            });
          } else {
            this.marryStatus = false;
            this.$refs.matchingGoodsModal.chioseIndex = index;
            this.$refs.matchingGoodsModal.matchingGoodsStatus = true;
            this.$refs.matchingGoodsModal.matchingGoodsModal = true;
          }
        } else {
          this.marryStatus = false;
        }
      }).catch(() => {
        this.marryStatus = false;
      });
    },
    // 刷新列表
    searchTableData (isClose, obj) {
      this.$nextTick(() => {
        if (isClose) {
          this.$emit('backList');
        }

        let ids = [obj.nowId];
        (obj.list || []).forEach(item => {
          if (!this.$common.isEmpty(item.subWebstoreOrderId)) {
            ids.push(`${this.accountCode}-${item.subWebstoreOrderId}`)
          }
        })
        this.$emit('updateList', {
          orderNo: ids.join(',')
        });
      })
      // if (!this.$parent || !this.$parent.$parent || !this.$parent.$parent.$parent || !this.$parent.$parent.$parent.getList) return;
      // this.$parent.$parent.$parent.getList();
    },
    // 打开拆单弹窗
    openSplitModal () {
      this.splitDetailInfo = {
        orderDetails: this.orderDetailsData,
        orderInfo: this.orderInfo
      };
      this.$nextTick(() => {
        this.spiltModelVisible = true;
      })
    }
  }
};
</script>
<style lang="less" scoped>
@orderLeftWidth: 95px; // 订单详情左侧宽度
.order-product-info{
  margin: 10px 0;
  .main-label{
    width: @orderLeftWidth;
    padding: 0 5px;
    font-size: 14px;
    font-weight: bold;
  }
  .orderDetailsProductItem{
    margin-top: 0px;
    padding: 0;
    border: 1px solid #E8EAEC;
    border-top: none;
    &:nth-of-type(1){
      border-top: 1px solid #E8EAEC;
    }
    &.is-check-product{
      border: 3px solid #cf1c00;
      // box-shadow: 0 0 5px #cf1c00 inset;
    }
  }
  .order-product-main{
    display: flex;
    .modalItemContent{
      width: calc(100% - @orderLeftWidth);
    }
  }
  .order-product-middle{
    flex: 100;
  }
  .row-info-td{
    padding: 8px 12px;
    border-right: 1px solid #E8EAEC;
    &.order-product-middle{
      padding: 8px 12px 8px 0;
    }
    &:first-child{
      border-right: none;
    }
    &:last-child{
      border-right: none;
    }
    &.order-product-middle{
      border-right: none;
    }
  }
  .orderDetailsQuantity{
    display: flex;
    align-items: center;
    margin-top: 0;
    // padding-right: 12px;
  }
  .orderDetailsProductItemPic{
    height: 84px;
    width: 84px;
  }
  .product-info {
    width: 45%;
    .product-info-item{
      display: flex;
      .item-content{
        flex: 100;
      }
      .product-info-variation{
        margin-right: 15px;
        // span:nth-child(2){
        //   color: #19BE6B;
        // }
        &:last-child{
          margin-right: 0;
        }
      }
    }
  }
  .tips-tag-txt{
    display: inline-block;
    color: #19BE6B;
    background: rgba(#19BE6B, 0.1);
    font-size: 12px;
    padding: 2px 5px;
    border-radius: 5px;
    &.tips-tag-brand{
      color: #199ebe;
      background: rgba(#199ebe, 0.1);
    }
    &.tips-tag-error{
      color: #f20;
      background: rgba(#f20, 0.1);
    }
  }
}
.combined_order {
  padding: 1px 7px;
  border-radius: 5px;
  display: inline-block;
  background-color: #07c20b;
  color: #fff;
  margin: 0 6px;
  font-size: 12px;
  position: relative;
  top: -3px;
}
.cursor-und:hover {
  text-decoration: underline;
}
.pointer-font{
  cursor: pointer;
  color: #2828ff;
  text-decoration: underline;
  text-underline-position: under;
}
</style>
