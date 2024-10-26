
<template>
  <div class="orderDetails" v-if="moalVisible">
    <div class="orderDetailsTitle">
      <Row style="width: 100; justify-content: space-between;">
        <Col class="orderDetailsBase ">
          <span class="back-table-list-btn" @click="backList">
            <i class="ivu-icon ivu-icon-ios-arrow-forward" />返回
          </span>
          <span class="orderNo">{{ orderNoTitle }}</span>
          <span class="orderTotalPrice">{{ orderInfo.totalPrice }}({{ orderInfo.totalPriceCurrency }})</span>
          <span
            v-if="!$common.isEmpty(getplatformStatusTxt)"
            class="orderStatus"
          >{{ getplatformStatusTxt }}</span>
        </Col>
        <Col class="orderDetailsBaseFr flexBox">
          <span
            class="icon iconfont orderBox normalLRMargin normalFontSizeThreeSize normalLineHeightThree">&#xe6b2;</span>
          <span v-if="orderInfo.buyerCountryCode !== null"
            class="normalLRMargin greenColor normalFontSizeThreeSize normalLineHeightThree">{{ orderInfo.buyerCountryCode
            }}</span>

          <span v-if="orderInfo.webstoreItemSite !== null && orderInfo.webstoreItemSite === '100'"
            class="webstoreItemSite">eBay Motors</span>
          <span class="nationalFlag nationalFlagDetails normalLRMargin"
            v-if="orderInfo.webstoreItemSite !== null && orderInfo.webstoreItemSite !== '100'"
            :class="['nationalFlag' + orderInfo.webstoreItemSite]"></span>
          <!-- 0 6 7 不截留不放行1030 -->
          <span
            class="normalLRMargin"
            v-if="(orderInfo.isSuspended === 0 ? getPermission('orderInfo_suspend_detail') :
            getPermission('orderInfo_suspendPass_detail')) && isShowIntercept && orderInfo.isInvalid === '0'"
          >
            <Button type="primary" @click.stop="interceptOrder" class="interceptOrderBut">
              <span class="icon-zhixingzhongduan icon iconfont" v-if="orderInfo.isSuspended === 0"></span>
              <Icon type="leaf" v-if="orderInfo.isSuspended == 1"></Icon>
              {{ orderInfo.isSuspended === 0 ? '截留' : '放行' }}
            </Button>
          </span>
          <span
            class="normalLRMargin"
            v-if="hasEdit && inPage !== 'dispute' && orderInfo.orderStatus !== 7"
          >
            <Buttons type="primary" class="buttons-style" trigger="click"
              @on-click="orderDetailsOperate"
              :disabled="(orderInfo.orderStatus !== 0 && orderInfo.orderStatus !== 6 && orderInfo.orderStatus !== 7) ? !getPermission('orderInfo_suspend_detail') : !getPermission('orderTag_insert_detail')"
            >
              <Poptip v-model="interceptOrderStatus" placement="bottom-end" :width="200">
                <!-- <Button style="margin-right: 13px" type="primary" v-if="orderInfo.orderStatus === 0 || orderInfo.orderStatus === 6 || orderInfo.orderStatus === 7" @click="orderDetailsOperate('0')" :disabled="!getPermission('orderTag_insert_detail')">
                    打标签
                  </Button> -->
                <div slot="content">
                  <Input v-model.trim="interceptOrderModel.suspendedReason" :maxlength="600" :rows="2" type="textarea"
                    placeholder="请填写截留原因"></Input>
                  <Button @click="saveIntercept" size="small" type="primary" class="saveIntercept fr">保存
                  </Button>
                </div>
              </Poptip>
              <Buttons-menu slot="list">
                <Buttons-item name="0"
                  v-if="orderInfo.orderStatus === 0 || orderInfo.orderStatus === 6 || orderInfo.orderStatus === 7"
                  :disabled="!getPermission('orderTag_insert_detail')">打标签
                </Buttons-item>
                <Buttons-item name="0"
                  v-if="getPermission('orderTag_insert_detail') && orderInfo.orderStatus !== 0 && orderInfo.orderStatus !== 6 && orderInfo.orderStatus !== 7"
                  :disabled="!getPermission('orderTag_insert_detail')">打标签
                </Buttons-item>
                <!--isHand 是否手工单-->
                <Buttons-item name="1"
                  v-if="orderInfo.isInvalid === '0' || (orderInfo.isInvalid === '1' && (nowPlatform === 'ebay' || nowPlatform === 'wish') && orderInfo.isHand === 0)"
                  :disabled="inPage === 'nonPayment' ? !getPermission('orderInfo_cancelOrderForNonPayment_detail') : !getPermission('orderInfo_cancelOrder_detail')">
                  {{ isCancelPlat.includes(platform) ? '取消' : '作废' }}订单
                </Buttons-item>
                <Buttons-item name="2" v-if="orderInfo.isInvalid === '1' && getPermission('orderInfo_resume_detail')">恢复
                </Buttons-item>
              </Buttons-menu>
            </Buttons>
          </span>
        </Col>
      </Row>
    </div>
    <!-- 标签 -->
    <div v-if="newOrderTagList.length > 0" class="orderDetailsStatus">
      标签：
      <Tag :closable="getPermission('orderTag_delete') && hasEdit" class="order-details-tag" @on-close="closeTag"
        :name="index" v-for="(item, index) in newOrderTagList" :key="`tag-${index}`">
        {{ item.tagName }}
      </Tag>
    </div>
    <!-- 发货时间模块 -->
    <orderTime
      v-if="orderInfo !== ''"
      :orderInfo="orderInfo"
      :orderRowsDetail="orderRowsDetail"
      :hasEdit="hasEdit"
      :shippingLimiteTime="shippingLimiteTime"
    />
    <!--买家信息 手工单-->
    <!--<buyerInformation v-if="orderInfo.isHand === 1" :orderInfo="orderInfo"></buyerInformation>-->
    <!-- 买家留言模块 -->
    <buyerMessage
      v-if="orderInfo !== ''"
      :timestampTwo="timestampTwo"
      :orderRowsDetail="orderRowsDetail"
      :hasEdit="hasEdit"
      :orderInfo="orderInfo"
      :inPage="inPage"
    />
    <!-- 订单地址、付款、收款、毛利信息模块 -->
    <orderAddress
      v-if="orderInfo !== ''"
      :orderRowsDetail="orderRowsDetail"
      :orderInfo="orderInfo"
      :hasEdit="hasEdit"
      :buyerCountry="buyerCountry"
      :orderNo="orderNo"
      :orderDetailsData="orderDetailsData"
      :platformId="platform"
    />
    <!-- 产品模块 -->
    <orderProduct
      v-if="orderInfo !== ''"
      :orderRowsDetail="orderRowsDetail"
      :hasEdit="hasEdit"
      :orderInfo="orderInfo"
      :inPage="inPage"
      :orderDetailsData="orderDetailsData"
      :platformId="platform"
      :shopDataList="shopDataList"
      :packageGoodsQuantity="packageGoodsQuantityObj"
      :target-source="targetSource"
      @updateOrderData="updateOrderData"
      @backList="backList"
      @updateList="updateList"
    />
    <div class="order-row-item" v-if="notReceivedTheGoods && isPlatformOrder">
      <div class="order-main">
        <div class="main-label">物流运单号</div>
        <div class="modalItemContent">
          <span
            v-for="(orderTra, tIndex) in getOrderTracking"
            :key="`orderTra-${tIndex}`"
            class="item-tracking"
          >
            <a
              class="pointer-font"
              :href="`https://t.17track.net/zh-cn#nums=${orderTra}`"
              target="_blank"
            >
            {{ orderTra }}
            </a>
          </span>
        </div>
      </div>
    </div>
    <!-- 发货包裹 -->
    <orderPackage
      v-if="orderDetailsData !== '' && !isPlatformOrder"
      :hasEdit="hasEdit"
      :orderInfo="orderInfo"
      :orderDetailsData="orderDetailsData"
      :orderNo="orderNo"
      :inPage="inPage"
      :platformId="platform"
      :timestampTwo="timestampTwo"
      :moalVisible="moalVisible"
      :orderDetailsId="orderDetailsId"
      :orderOpenData="orderOpenData"
    />
    <!-- 付款 -->
    <!-- <orderDetailsOtherMes v-if="orderDetailsData !== ''" :hasEdit="hasEdit" :orderInfo="orderInfo"
      :orderDetailsData="orderDetailsData" :timestampTwo="timestampTwo" :inPage="inPage" /> -->
      <!-- 售后 -->
      <afterSale v-if="orderInfo !== '' && !isPlatformOrder" :orderInfo="orderInfo" class="mb20" :moalVisible="moalVisible" />
      <!-- 备注 -->
      <orderRemarks
        v-if="orderInfo !== ''"
        :hasEdit="hasEdit"
        :orderInfo="orderInfo"
        :inPage="inPage"
        :orderDetailsData="orderDetailsData"
        class="mb20"
        :isPlatformOrder="isPlatformOrder"
        :moalVisible="moalVisible"
      />
      <!-- 日志 -->
      <orderLog v-if="orderInfo !== ''" :orderInfo="orderInfo" class="mt10" ref="orderLog" :moalVisible="moalVisible" />

    <keep-alive>
      <Modal title="打标签" v-model="tagModelStatus" v-if="tagsStatus">
        <order-label-tag v-if="tagsList.length" v-model="tagIdList" :tags-list="tagsList" />
        <div class="tagsList" v-else>
          暂无可用标签
        </div>
        <div slot="footer">
          <Button @click="setTag">打标签</Button>
          <Button @click="hideTag">取消</Button>
        </div>
      </Modal>
    </keep-alive>
    <cancelDelivery ref="cancelDelivery" :hasEdit="hasEdit" :inPage="inPage" :platformId="platform" />
    <keep-alive>
      <Modal v-model="interceptSelectModal" :mask-closable="false" v-if="interceptSelectStatus"
        @on-ok="confirmSelectIntercept">
        <div class="ivu-modal-confirm">
          <div class="ivu-modal-confirm-head">
            <div class="ivu-modal-confirm-head-title">截留选择</div>
          </div>
          <div class="ivu-modal-confirm-body ivu-modal-confirm-body-render">
            <div class="normalTop">
              此订单已与<strong class="red">{{ interceptModal.ids }}</strong>几个订单合并到一个包裹
            </div>
            <div class="normalTop">
              <RadioGroup v-model="interceptModal.status">
                <Radio :label="0">
                  <span>将整包裹截留</span>
                </Radio>
                <Radio :label="1">
                  <span>将此订单从包裹中抽离</span>
                </Radio>
              </RadioGroup>
            </div>
          </div>
        </div>
      </Modal>
    </keep-alive>
  </div>
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import orderTime from '@/components/common/order/orderTime.vue';// 订单详情发货时间相关模块
import buyerMessage from '@/components/common/order/buyerMessage.vue';// 订单详情买家留言模块
import orderAddress from '@/components/common/order/orderAddress.vue';// 订单详情订单地址模块
import orderProduct from '@/components/common/order/orderProduct.vue';// 订单详情产品模块
import orderPackage from '@/components/common/order/package.vue';// 订单详情发货模块
// import orderDetailsOtherMes from '@/components/common/order/orderDetailsOtherMes.vue';// 付款备注日志等模块集合
import cancelDelivery from '@/components/common/order/cancelOrder';
import buyerInformation from '@/components/common/order/buyerInformation.vue';// 手工单买家信息
import afterSale from '@/components/common/order/afterSale.vue';// 售后
import orderRemarks from '@/components/common/order/orderRemarks.vue';// 备注
import orderLog from '@/components/common/order/orderLog';// 日志
import { costTypeData, ignoreCostType, pOrderStatus, costTypeSubtract } from '@/utils/comConfig';

export default {
  mixins: [Mixin],
  components: {
    orderTime,
    buyerMessage,
    orderAddress,
    orderProduct,
    orderPackage,
    // orderDetailsOtherMes,
    cancelDelivery,
    buyerInformation,
    afterSale,
    orderRemarks,
    orderLog,
  },
  data () {
    // var self = this;
    return {
      // 标签相关
      tagModelStatus: false,
      tagsStatus: false,
      tagIdList: [],
      tagsList: [],
      // End
      buyerCountry: null,
      flag: null,
      orderInfo: '',
      shopDataList: [],
      isCancelPlat: ['ebay', 'ozon', 'otto', 'wish'],
      shippingLimiteTime: null,
      updateStatus: false, // 更新后触发数据刷新
      interceptOrderStatus: false, // 截留订单状态
      interceptOrderModel: {
        orderId: [],
        suspendedReason: ''
      },
      reasonStatus: true,
      packageTypeValue: '是，保持合并',
      shippingErr: false,
      newOrderTagList: [],
      // End
      interceptModal: {
        oid: '',
        status: 0,
        ids: null
      },
      interceptSelectStatus: false,
      interceptSelectModal: false,
      orderDetailsData: null,
      packageGoodsQuantityObj: null,
      timestampTwo: 0,
      isManual: false,
    };
  },
  props: {
    // 来源-从什么地方打开，默认为空
    targetSource: { type: String, default: null },
    platformId: { type: Array, default: () => { return [] } },
    moalVisible: { type: Boolean, default: false },
    // 是否可以编辑
    hasEdit: { type: Boolean, default: true },
    // 是否平台仓
    platformBunkerOrder: { type: Boolean },
    // 其他额外参数
    orderOpenData: { type: Object, default: () => { return {} } },
    // 是否展示截留订单
    isShowIntercept: { type: Boolean, default: true },
    prefix: { type: String, default: '' },
    orderDetailsId: { type: String, default: null },
    orderRowsDetail: { type: Object, default: () => { return {} } },
    orderNo: { type: String, default: null },
    orderTagList: { type: Array, default () { return []; } },
    webstoreItemSite: { type: String, default: null },
    buttonVisibile: { type: Boolean, default: true },
    orderType: { type: String, default: null },
    timestamp: { type: Number, default: null },
    inPage: { type: String, default: null },
    left: { type: Number, default: 392 }
  },
  computed: {
    // 是否平台仓订单   0：不是平台仓订单，1：是平台仓订单
    isPlatformOrder () {
      if (this.$common.isEmpty(this.orderRowsDetail)) {
        if (this.$common.isEmpty(this.platformBunkerOrder)) return false;
        return this.platformBunkerOrder;
      };
      return [1].includes(Number(this.orderRowsDetail.isPlatformOrder));
    },
    // 是否为未收到货品
    notReceivedTheGoods () {
      if (this.$common.isEmpty(this.orderRowsDetail) || this.$common.isEmpty(this.orderRowsDetail.notReceivedTheGoods)) return false;
      if (!this.$common.isBoolean(this.orderRowsDetail.notReceivedTheGoods)) return false;
      return this.orderRowsDetail.notReceivedTheGoods;
    },
    // 状态显示(我也不知道这是什么状态，字段表面上是平台订单状态)
    getplatformStatusTxt () {
      if (this.$common.isEmpty(this.orderInfo) || this.$common.isEmpty(this.orderInfo.platformOrderStatus)) return '';
      if (this.$common.isEmpty(this.platOrderStatus[this.orderInfo.platformOrderStatus])) return this.orderInfo.platformOrderStatus;
      return this.platOrderStatus[this.orderInfo.platformOrderStatus];
    },
    // 是否 JIT 订单
    // isJIT () {
    //   if (this.$common.isEmpty(this.orderDetailsData) || this.$common.isEmpty(this.orderDetailsData.orderInfo)) return false;
    //   return this.orderDetailsData.orderInfo.orderType === 'JIT';
    // },
    // 获取运单号
    getOrderTracking () {
      if (this.$common.isEmpty(this.orderDetailsData)) return [];
      let tracking = [];
      if (!this.$common.isEmpty(this.orderDetailsData.orderInfo) && !this.$common.isEmpty(this.orderDetailsData.orderInfo.orderTransactions)) {
        this.orderDetailsData.orderInfo.orderTransactions.forEach((item) => {
          !this.$common.isEmpty(item.trackingNumber) && tracking.push(item.trackingNumber);
        })
      }
      if (!this.$common.isEmpty(this.orderDetailsData.orderShippingInfoList)) {
        this.orderDetailsData.orderShippingInfoList.forEach((item) => {
          !this.$common.isEmpty(item.trackingNumber) && tracking.push(item.trackingNumber);
        })
      }
      return this.$common.arrRemoveRepeat(tracking);
    },
    // 当前打开的订单所属的平台
    platform () {
      if (this.$common.isEmpty(this.platformId)) {
        if (this.$common.isEmpty(this.orderDetailsData)) return [this.inGroup];
        if (this.$common.isEmpty(this.orderDetailsData.orderInfo)) return [this.inGroup];
        if (this.$common.isEmpty(this.orderDetailsData.orderInfo.platformId)) return [this.inGroup];
        return [this.orderDetailsData.orderInfo.platformId];
      }
      return this.platformId;
    },
    nowPlatform () {
      if (this.$common.isEmpty(this.platform)) return '';
      return this.platform[0];
    },
    // 平台订单状态
    platOrderStatus () {
      if (this.$common.isEmpty(this.nowPlatform) || this.$common.isEmpty(pOrderStatus[this.nowPlatform])) return pOrderStatus.default || {};
      return pOrderStatus[this.nowPlatform];
    },
    apiPrefix () {
      let apiPrefix = '';
      if (this.prefix) {
        apiPrefix = this.prefix + '/erpCommon';
      }
      return apiPrefix;
    },
    otcObj () {
      if (this.inPage === 'combineOrder') {
        return {
          marginLeft: '-' + this.left + 'px'
        };
      }
    }
  },
  watch: {
    updateStatus (n) {
      this.updateOrderData(n);
    },
    timestamp (n, o) {
      this.$nextTick(() => {
        if (this.$common.isEmpty(this.orderDetailsId)) return;
        if (n !== o) {
          this.$emit('spinLoading');
          var date = new Date().getTime();
          this.timestampTwo = date;
          this.newOrderTagList = [];
          this.getOrderDetails();
          this.orderNoTitle = this.orderNo;
          if (this.$route.path === '/manualOrder') {
            this.isManual = true;
          } else {
            this.isManual = false;
          }
        }
      })
    },
    orderNo: {
      handler (n, o) {
        if (n !== o) {
          this.orderNoTitle = this.orderNo;
        }
      },
      immediate: true
    },
    moalVisible (val) {
      if (val) return;
      this.$nextTick(() => {
        this.resetDetails();
        this.$store.commit('orderDetails', null);
      })
    }
  },
  methods: {
    // 刷新订单页面
    updateOrderData (val) {
      if (!val) return;
      this.$nextTick(() => {
        const date = new Date().getTime();
        this.timestampTwo = date;
        this.getOrderDetails();
        this.updateStatus = false;
      })
    },
    backList () {
      this.$emit('update:moalVisible', false);
    },
    // 刷新列表
    updateList (obj) {
      this.$emit('updateList', obj);
    },
    resetDetails () { // 重置数据
      this.interceptModal.status = 0;
      this.interceptModal.oid = '';
      this.interceptOrderModel.orderId = [];
      this.interceptOrderModel.suspendedReason = '';

      delete this.interceptSelectModal.flag;
    },
    // 获取订单详情
    getOrderDetails () {
      let id;
      this.resetDetails();// 重置订单信息
      if (typeof this.orderDetailsId === 'object') { // 合并订单时默认先取第一个订单
        id = this.orderDetailsId[0];
      } else {
        id = this.orderDetailsId;
      }
      this.editProductStatus = [];
      this.orderDetailsData = null;
      this.$store.commit('orderDetails', null);
      let getOrderDetailApi = `${this.apiPrefix}${api.get_orderDetails}/${id}`;
      if (this.isPlatformOrder) {
        getOrderDetailApi = `${this.apiPrefix}${api.platformOrderDetail}/${id}`;
      }
      this.axios.get(getOrderDetailApi).then(response => {
        if (response.data.code === 0) {
          let data = this.fixData(this.$common.copy(response.data.datas));
          if (!this.$common.isEmpty(data.orderInfo) && !this.$common.isEmpty(data.orderInfo.platformId)) {
            this.getShopListData([data.orderInfo.platformId]).then((shopList) => {
              this.shopDataList = this.$common.copy(shopList);
            });
          }
          if (data.orderShippingInfoList && data.orderShippingInfoList.length > 0) {
            let normalityPackage = [];
            let voidPackage = [];
            data.orderShippingInfoList.forEach((pack) => {
              pack.packageStatus == 99 ? voidPackage.push(pack) : normalityPackage.push(pack);
            });
            data.orderShippingInfoList = [...normalityPackage, ...voidPackage];
            // 基本信息
            this.orderInfo = { ...data.orderInfo, orderShippingInfoList: data.orderShippingInfoList };
            this.refreshAvailableNum(data).finally(() => {
              this.$store.commit('orderDetails', data);
              this.orderDetailsData = data;
              // 再次变更
              this.orderInfo = { ...data.orderInfo, orderShippingInfoList: data.orderShippingInfoList };
            });
          } else {
            this.orderInfo = data.orderInfo || {};// 基本信息
            this.assignment(data).finally(() => {
              this.$store.commit('orderDetails', data);
              this.orderDetailsData = data;
            });
          }
        }
      }).catch(() => {
        this.$emit('resetSpinShow');
      });
    },
    assignment (data) {
      return new Promise((resolve) => {
        if (data.remainTime === 0) { // 逾期
          this.shippingLimiteTime = '逾期';
        } else if (data.remainTime === null) {
          this.shippingLimiteTime = '';
        } else { // 标发货剩余时间
          this.shippingLimiteTime = this.getLimitTime(data.remainTime);
        }
        if (!this.$common.isEmpty(this.orderInfo.orderTags)) { // 标签挂载
          this.newOrderTagList = this.orderInfo.orderTags;
        }
        this.countryName(this.orderInfo.buyerCountryCode).then(response => {
          this.buyerCountry = response;
        }).finally(() => {
          resolve({});
        });
        this.$emit('resetSpinShow');
        this.$nextTick(() => {
          setTimeout(() => {
            this.$emit('reloadTag', this.newOrderTagList);
          }, 1000);
        });
      })
    },
    fixData (data) {
      let minusList = [28, '28'];
      minusList = [...minusList, ...Object.keys(costTypeData.refund || {})];
      if (data && data.reportOrderProfitList) {
        // 利润 小计
        data.reportOrderProfitList.forEach(i => {
          if (i.reportOrderProfitDetailList) {
            let obj = {
              'amountType': '999', // 999 小计
              'amount': 0,
              'amountCurrency': 'CNY' // 使用 CNY
            };
            let amount = 0;
            i.reportOrderProfitDetailList.forEach(j => {
              if (minusList.includes(j.amountType) && !this.$common.isEmpty(j.amount) && j.amount > 0) {
                j.amount = j.amount * -1;
              }
              if ([1, '1'].includes(i.statisticType)) {
                // 预估总收入不包含：买家支付运费（目前速卖通除外），税费
                if (this.isPlusHand('proceeds', j.amountType)) {
                  amount += (this.$common.isEmpty(j.amount) ? 0 : j.amount) * (this.$common.isEmpty(j.amountExchangeRate) ? 0 : j.amountExchangeRate);
                } else if (this.isCostSubtract('proceeds', j.amountType)) {
                  amount += ((this.$common.isEmpty(j.amount) ? 0 : j.amount) * (this.$common.isEmpty(j.amountExchangeRate) ? 0 : j.amountExchangeRate) * -1);
                }
              } else {
                amount += (this.$common.isEmpty(j.amount) ? 0 : j.amount) * (this.$common.isEmpty(j.amountExchangeRate) ? 0 : j.amountExchangeRate);
              }
            });
            obj.amount = Number(amount.toFixed(2));
            i.reportOrderProfitDetailList.push(obj);
          }
        });
      }
      return data;
    },
    // 是否可累加
    isPlusHand (key, amountType) {
      if (this.$common.isEmpty(key) || this.$common.isEmpty(amountType)) return false;
      if (!this.$common.isEmpty(ignoreCostType[key])) {
        if (!this.$common.isEmpty(ignoreCostType[key][this.nowPlatform])) {
          return !ignoreCostType[key][this.nowPlatform].includes(amountType);
        }
        if (!this.$common.isEmpty(ignoreCostType[key].default)) {
          return !ignoreCostType[key].default.includes(amountType);
        }
      }
      return true;
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
    getOrderListTag () { // 获取标签列表
      this.axios.get(this.apiPrefix + api.get_orderListTag + '?type=1').then(response => {
        // this.tagsList = this.tagsList.concat(response.data.datas);
        // this.tagsList = response.data.datas;
        // console.log(this.tagsList);
        // console.log(this.orderInfo.orderTags);
        // 去掉已选择标签
        // if (this.orderInfo.orderTags !== null && this.orderInfo.orderTags.length > 0 && this.tagsList.length > 0) {
        //   let pos = this.tagsList;
        //   for (let i = 0; i < this.orderInfo.orderTags.length; i++) {
        //     for (let j = 0; j < this.tagsList.length; j++) {
        //       if (this.orderInfo.orderTags[i].tagId === this.tagsList[j].tagId) {
        //         pos.splice(j, 1);
        //       }
        //     }
        //   }
        //   console.log(pos);
        //   this.tagsList = pos;
        // }

        let data = response.data.datas;
        data.forEach((n, i) => {
          n.status = false;
        });
        if (this.orderInfo.orderTags !== null && this.orderInfo.orderTags.length > 0 && data.length > 0) {
          for (let i = 0; i < this.orderInfo.orderTags.length; i++) {
            for (let j = 0; j < data.length; j++) {
              if (this.orderInfo.orderTags[i].tagId === data[j].tagId) {
                data[j].status = true;
              }
            }
          }
        }
        this.tagsList = data;
      });
    },
    countryChange (value) { // 高级筛选国家列表获取
      if (value.indexOf('null') >= 0) {
        this.buyerAddressModal.buyercountryId = null;
      } else {
        this.buyerAddressModal.buyercountryId = value;
      }
    },
    interceptOrder () {
      this.orderInfo.isSuspended === 0
        ? this.interceptOrderStatus = true
        : this.setThisRelease(this.orderInfo.orderId);
    },
    setThisRelease (orderId, flag) { // 放行
      let obj = {};
      obj.platformId = this.platform;
      obj.orderIdList = [orderId];
      if (flag === 1) {
        obj.flag = 1;
      }
      this.axios.put(this.apiPrefix + api.set_orderRelease, JSON.stringify(obj)).then(response => {
        if (response.data.code === 0) {
          this.$Message.success('放行成功');
          this.updateStatus = true; // 触发数据更新
          if (this.inPage === 'combineOrder') {
            this.$store.commit('combineStatus', true);
          }
        } else if (response.data.code === 110503) {
          this.$Modal.confirm({
            title: '提示',
            okText: '整包裹放行',
            content: '<p>' + '订单所在包裹为合并包裹，请选择整包裹放行或取消操作' + '</p>',
            onOk: () => {
              this.setThisRelease(orderId, 1);
            }
          });
        }
      });
    },
    setMark () { // 打标签操作
      // if (this.tagsList.length < 1) {
      //   this.getOrderListTag();
      // }
      this.getOrderListTag();
      this.tagsStatus = true;
      this.$nextTick(() => {
        this.tagModelStatus = true;
      });
    },
    hideTag () {
      this.tagModelStatus = false;
      setTimeout(() => {
        document.getElementsByTagName('body')[0].style.overflow = 'hidden';
      }, 500);
    },
    setTag () { // 打标签
      if (this.tagIdList.length === 0) {
        this.$Message.error('请选择标签');
      } else if (this.tagIdList.length === 0) {
        this.$Message.error('请选择标签');
      } else {
        let obj = {
          orderIdList: [this.orderInfo.orderId],
          tagIdList: this.tagIdList
        };
        this.axios.post(this.apiPrefix + api.set_tag, JSON.stringify(obj))
          .then(response => {
            if (response.data.code === 0) {
              this.$Message.success('标记成功');
              this.tagModelStatus = false;
              this.resetTag();
              this.updateStatus = true;
            } else {
              (!response.data || ![999993, '999993'].includes(response.data.code)) && this.$Message.error('操作失败，请重新尝试');
            }
          });
      }
    },
    closeTag (event, name) {
      this.axios.delete(this.apiPrefix + api.del_orderTag + this.newOrderTagList[name].orderTagId).then(response => {
        if (response.data.code === 0) {
          this.$Message.success('操作成功');
          this.updateStatus = true;
          this.$nextTick(() => {
            this.newOrderTagList.splice(name, 1);
            this.$emit('reloadTag', this.newOrderTagList);
          });
        }
      });
    },
    orderDetailsOperate (value) { // 订单详情操作
      if (value === '0') {
        this.setMark();
      } else if (value === '1') {
        this.startCancelDelivery();
      } else if (value === '2') {
        // 恢复
        this.$Modal.confirm({
          title: '恢复作废',
          content: '订单恢复作废后，系统将重新创建发货信息，并执行所有自动规则,是否确定恢复？',
          onOk: () => {
            this.axios.put(api.resume_order + this.orderInfo.orderId).then(res => {
              if (res.data.code === 0) {
                this.$Message.success('恢复成功');
                this.updateStatus = true;
              }
            });
          }
        });
      }
    },
    saveIntercept (oid, type) {
      if (this.interceptOrderModel.suspendedReason === '') {
        this.$Message.error('截留原因不能为空');
        return false;
      }
      if (Number(type) === 1) {
        this.interceptOrderModel.orderId = oid;
        this.interceptOrderModel.flag = type;
      } else if (Number(type) === 0) {
        this.interceptOrderModel.orderId = this.orderInfo.orderId;
        this.interceptOrderModel.flag = type;
      } else {
        this.interceptOrderModel.orderId = this.orderInfo.orderId;
        delete this.interceptOrderModel.flag;
      }
      this.axios.put(this.apiPrefix + api.set_intercept, JSON.stringify(this.interceptOrderModel)).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data === null || data.length === 0) {
            if (this.inPage === 'combineOrder') { // 如果所在页面为合并包括时，还需重置合并列表
              this.$store.commit('combineStatus', true);
            }
            this.$Message.success('截留成功');
            this.interceptOrderModel.suspendedReason = null;
            this.interceptOrderStatus = false;
            this.updateStatus = true;
          } else {
            this.$Message.warning('当前订单所在包裹存在多个订单,请选择截留类型!');
            this.interceptModal.oid = this.orderInfo.orderId;
            this.interceptModal.ids = data.others.toString();
            this.interceptSelectStatus = true;
            this.$nextTick(() => {
              this.interceptSelectModal = true;
            });
          }
        } else {
          (!response.data || ![999993, '999993'].includes(response.data.code)) && this.$Message.error('操作失败，请重新尝试');
        }
      });
    },
    confirmSelectIntercept () {
      this.saveIntercept(this.interceptModal.oid, this.interceptModal.status);
    },
    startCancelDelivery () {
      this.$refs['cancelDelivery'].cancelDelivery('single', this.orderInfo, 0);
    },
    setImgList (productGoodsIdList, data) {
      return new Promise((resolve) => {
        let busineseIdList = this.orderInfo.orderTransactions.map(itema => {
          return itema.businessId
        });
        this.axios.post('/order-service' + api.query_productImgs + '?time=' + new Date().getTime(), productGoodsIdList).then(res => {
          data.orderShippingInfoList.forEach(itema => {
            itema.orderShippingDetailList.forEach(itemb => {
              Object.keys(res.data.datas || {}).forEach(itemc => {
                if (itemb.productGoodsId == itemc) {
                  itemb.pictureUrl = res.data.datas[itemc][0]
                }
              })
            })
          });
          this.getBusineseIdListPictureUrl(busineseIdList).finally(() => {
            resolve(data);
          });
        }).catch(() => {
          this.getBusineseIdListPictureUrl(busineseIdList);
        })
      })
    },
    getBusineseIdListPictureUrl (busineseIdList) {
      return new Promise((resolve) => {
        this.axios.post(api.query_imageByProductGoodsIds, busineseIdList).then(res => {
          this.orderInfo.orderTransactions.forEach(itema => {
            (res.data.datas || []).forEach(itemb => {
              if (itemb.businessId == itema.businessId) itema.pictureUrl = './filenode/s/thumb' + itemb.path
            })
          })
        }).finally(() => {
          resolve({});
        })
      })
    },
    // 更新包裹下产品真实库存
    refreshAvailableNum (data) {
      return new Promise((resolve) => {
        this.$store.dispatch('getAllstore').then((storeList) => {
          let [temp, allproductGoodsIdList] = [[], []];
          (data.orderShippingInfoList || []).forEach(orderItem => {
            let productGoodsIdList = orderItem.orderShippingDetailList.map(j => {
              allproductGoodsIdList.push(j.productGoodsId);
              return j.productGoodsId;
            });
            if (!this.$common.isEmpty(orderItem.warehouseId)) {
              let obj = {
                merchantId: orderItem.merchantId, // 商家id
                productGoodsIdList: productGoodsIdList, // sku
                warehouseIdList: [orderItem.warehouseId], // 仓库id
                queryFormType: 'orderPackageSkuInventory', // 用于查询sku未发在途的数值
                pageSize: 100,
                queryLevel: 0, // 查询级别:0为仓库-商品级别；1仓库-库位-商品级别；2商品级别
                queryOnWayQuantity: 0, // 是否在途(0不查；1或者null查)
              };
              // 当 warehouseType 是 1 时为 第三方仓库  归属仓库且为第三方仓库
              const warehouseObj = storeList.filter(storeItem => orderItem.warehouseId === storeItem.warehouseId && storeItem.warehouseType == 1)[0];
              if (!this.$common.isEmpty(warehouseObj)) {
              // 第三方特殊仓库传参，海外仓的订单的库存同步平台库存
                const barnList = {
                  'GC-AUSY': 'gcoutstore',
                  'GC-DE': 'gcoutstore',
                  'GC-US': 'gcoutstore',
                  'GCUKC': 'gcoutstore',
                  'GCMGDAC': 'gcoutstore',
                  'GC-DE-DGDLXMZ': 'gcoutstore',
                  'GCSSM-AUXN': 'gcoutstore',
                  'GCSSM-UK': 'gcoutstore',
                  'GCSSM-USWE': 'gcoutstore',
                  'GCSSM-USEA': 'gcoutstore',
                  'GCSSM-DE': 'gcoutstore'
                }
                const orderList = ['ocoutstore', 'winitoutstore', 'shloutstore'];
                // 第三方特殊仓库
                if (!this.$common.isEmpty(barnList[warehouseObj.warehouseCode])) {
                  obj.warehouseOverseaType = barnList[warehouseObj.warehouseCode];
                } else if (orderList.includes(warehouseObj.warehouseOverseaType)) { // 其他第三方仓库
                  obj.warehouseOverseaType = warehouseObj.warehouseOverseaType;
                }
              }
              temp.push(obj)
            }
          });
          if (this.$common.isEmpty(temp)) {
            this.$common.promiseAll([
              () => {
                return this.setImgList(allproductGoodsIdList, data);
              },
              () => {
                return this.assignment(data);
              }
            ]).finally(() => {
              resolve(data);
            });
            return;
          }
          // 匹配仓库平台信息
          this.getRealStockOutNum(temp).then(stockOutData => {
            stockOutData.forEach(stockItem => {
              (stockItem.inventoryList || []).forEach(j => {
                // 后端返回的用于订单详情页面判断仓库类型的字段，和仓库的 warehouseType 不一样
                j.rowWarehouseType = stockItem.warehouseType;
                data.orderShippingInfoList.forEach(i => {
                  i.orderShippingDetailList.forEach(k => {
                    if (k.productGoodsId === j.productGoodsId && i.warehouseId === j.warehouseId) {
                      Object.keys(j).forEach(key => {
                        if (typeof k[key] === 'undefined') {
                          k[key] = j[key];
                        }
                      })
                    }
                  });
                });
              });
              this.$common.promiseAll([
                () => {
                  return this.setImgList(allproductGoodsIdList, data);
                },
                () => {
                  return this.assignment(data);
                }
              ]).finally(() => {
                resolve(data);
              });
            })
          }).catch(() => {
            this.$common.promiseAll([
              () => {
                return this.setImgList(allproductGoodsIdList, data);
              },
              () => {
                return this.assignment(data);
              }
            ]).finally(() => {
              resolve(data);
            });
          });
        })
      })
    },
    // 查询包裹下产品真实库存
    getRealStockOutNum (temp) {
      return new Promise(resolve => {
        this.axios.post(api.queryInventoryByWarehouseOverseaType, temp).then(response => {
          if (response.data.code === 0) {
            resolve(response.data.datas || []);
          } else {
            resolve([]);
          }
        }).catch(() => {
          resolve([]);
        })
      })
    }
  }
};
</script>
<style lang="less" scoped>
@orderLeftWidth: 95px; // 订单详情左侧宽度
.orderDetailsTitle{
  display: flex;
  justify-content: space-between;
}
.order-row-item{
  padding: 15px 0;
  .main-label{
    width: @orderLeftWidth;
    padding: 0 5px;
    font-size: 14px;
    font-weight: bold;
  }
  .order-main{
    display: flex;
    .modalItemContent{
      width: calc(100% - @orderLeftWidth);
    }
    .item-tracking{
      .pointer-font{
        padding: 0 15px 0 0;
        cursor: pointer;
        color: #2828ff;
        text-decoration: underline;
        text-underline-position: under;
      }
    }
  }
}
.buttons-style{
  height: 32px;
  width: 17px;
  padding-right: 0;
}
.webstoreItemSite {
  padding: 0 10px 0 5px;
  line-height: 23px;
}
.orderDetailsBaseFr{
  align-items: center;
}

.back-table-list-btn {
  display: inline-block;
  width: @orderLeftWidth;
  margin-right: 0px;
  font-size: 16px;
  color: #515A6E;
  cursor: pointer;

  i {
    transform: rotate(180deg);
  }
}

.orderDetailsStatus{
  margin-left:  @orderLeftWidth;
  margin-right: 80px;
}
.order-details-tag {
  background: rgba(#f20, 0.08);
  border: 1px solid rgba(#f20, 0.08);
  :deep(.ivu-tag-text) {
    color: #f20;
  }

  :deep(.ivu-icon) {
    color: #f20;
    opacity: 1;
  }
}
</style>
