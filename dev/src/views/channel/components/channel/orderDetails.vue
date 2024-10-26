<template>
  <div class="orderDetails">
    <div class="orderTagsContainer" :style="otcObj">
      <div class="orderTags" v-if="newOrderTagList.length > 0" v-for="(item, index) in newOrderTagList"
        :key="item.tagId" :style="{ marginTop: index * 30 + 10 + 'px' }">
        <Tag :closable="getPermission('orderTag_delete') && hasEdit" color="error" @on-close="closeTag" :name="index">{{
            item.tagName
        }}
        </Tag>
      </div>
    </div>
    <div class="orderDetailsTitle">
      <Row>
        <Col :span="10" class="orderDetailsBase ">
        <span class="orderNo">{{ orderNoTitle }}</span>
        <span class="orderTotalPrice">{{ orderInfo.totalPrice }}({{ orderInfo.totalPriceCurrency }})</span>
        <span class="platformOrderNo" v-if="orderInfo.thirdPartyNo">{{ '平台订单号：' + orderInfo.thirdPartyNo }}</span>
        <span v-if="orderInfo.platformOrderStatus" class="orderStatus">{{ orderInfo.platformOrderStatus }}</span>
        </Col>
        <Col :span="13" class="orderDetailsBaseFr flexBox">
        <span
          class="icon iconfont orderBox normalLRMargin normalFontSizeThreeSize normalLineHeightThree">&#xe6b2;</span>
        <span v-if="orderInfo.buyerCountryCode !== null"
          class="normalLRMargin greenColor normalFontSizeThreeSize normalLineHeightThree">{{ orderInfo.buyerCountryCode
          }}</span>
        <span class="nationalFlag nationalFlagDetails normalLRMargin" v-if="orderInfo.webstoreItemSite !== null"
          :class="['nationalFlag' + orderInfo.webstoreItemSite]"></span>
        <!-- 0 6 7 不截留不放行1030 -->
        <Button type="primary" @click.stop="interceptOrder" class="interceptOrderBut"
          v-if="(orderInfo.isSuspended === 0 ? getPermission('orderInfo_suspend_detail') : getPermission('orderInfo_suspendPass_detail')) && isShowIntercept && orderInfo.isInvalid === '0'">
          <span class="icon-zhixingzhongduan icon iconfont" v-if="orderInfo.isSuspended === 0"></span>
          <Icon type="leaf" v-if="orderInfo.isSuspended == 1"></Icon>
          {{ orderInfo.isSuspended === 0 ? '截留' : '放行' }}
        </Button>
        <Buttons type="primary" style="margin-left: 13px" trigger="click" v-if="hasEdit &&
        inPage !== 'dispute' &&
        orderInfo.orderStatus !== 7" @on-click="orderDetailsOperate"
          :disabled="(orderInfo.orderStatus !== 0 && orderInfo.orderStatus !== 6 && orderInfo.orderStatus !== 7) ? !getPermission('orderInfo_suspend_detail') : !getPermission('orderTag_insert_detail')">
          <Poptip v-model="interceptOrderStatus" placement="bottom-end" :width="200">
            <!-- <Button style="margin-right: 13px" type="primary" v-if="orderInfo.orderStatus === 0 || orderInfo.orderStatus === 6 || orderInfo.orderStatus === 7" @click="orderDetailsOperate('0')" :disabled="!getPermission('orderTag_insert_detail')">
                打标签
              </Button> -->
            <div slot="content">
              <Input v-model.trim="interceptOrderModel.suspendedReason" :maxlength="600" :rows="2" type="textarea"
                placeholder="请填写截留原因"></Input>
              <Button @click="saveIntercept" size="small" type="primary" class="saveIntercept fr">保存 </Button>
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
              v-if="orderInfo.isInvalid === '0' || (orderInfo.isInvalid === '1' && (inGroup === 'ebay' || inGroup === 'wish') && orderInfo.isHand === 0)"
              :disabled="inPage === 'nonPayment' ? !getPermission('orderInfo_cancelOrderForNonPayment_detail') : !getPermission('orderInfo_cancelOrder_detail')">
              取消订单
            </Buttons-item>
            <Buttons-item name="2" v-if="orderInfo.isInvalid === '1' && getPermission('orderInfo_resume_detail')">恢复
            </Buttons-item>
          </Buttons-menu>
        </Buttons>
        </Col>
      </Row>
    </div>
    <!-- 发货时间模块 -->
    <orderTime v-if="orderInfo !== ''" :orderInfo="orderInfo" :hasEdit="hasEdit"
      :shippingLimiteTime="shippingLimiteTime"></orderTime>
    <!--买家信息 手工单-->
    <!--<buyerInformation v-if="orderInfo.isHand === 1" :orderInfo="orderInfo"></buyerInformation>-->
    <!-- 买家留言模块 -->
    <buyerMessage v-if="orderInfo !== ''" :timestampTwo="timestampTwo" :hasEdit="hasEdit" :orderInfo="orderInfo"
      :inPage="inPage"></buyerMessage>
    <!-- 订单地址模块 -->
    <orderAddress v-if="orderInfo !== ''" :orderInfo="orderInfo" :hasEdit="hasEdit" :buyerCountry="buyerCountry">
    </orderAddress>
    <!-- 产品模块 -->
    <orderProduct v-if="orderInfo !== ''" :hasEdit="hasEdit" :orderInfo="orderInfo" :inPage="inPage"
      :packageGoodsQuantity="packageGoodsQuantityObj"></orderProduct>
    <!-- 發貨包裹 -->
    <orderPackage v-if="orderDetailsData !== ''" :hasEdit="hasEdit" :orderInfo="orderInfo"
      :orderDetailsData="orderDetailsData" :orderNo="orderNo" :inPage="inPage" :timestampTwo="timestampTwo"
      :orderDetailsId="orderDetailsId"></orderPackage>
    <!-- 付款 -->
    <orderDetailsOtherMes v-if="orderDetailsData !== ''" :hasEdit="hasEdit" :orderInfo="orderInfo"
      :orderDetailsData="orderDetailsData" :timestampTwo="timestampTwo" :inPage="inPage"></orderDetailsOtherMes>
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
    <cancelDelivery ref="cancelDelivery" :hasEdit="hasEdit" :inPage="inPage"></cancelDelivery>
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
import orderDetailsOtherMes from '@/components/common/order/orderDetailsOtherMes.vue';// 付款备注日志等模块集合
import cancelDelivery from '@/components/common/order/cancelOrder';
import buyerInformation from '@/components/common/order/buyerInformation.vue';// 手工单买家信息
export default {
  mixins: [Mixin],
  components: {
    orderTime,
    buyerMessage,
    orderAddress,
    orderProduct,
    orderPackage,
    orderDetailsOtherMes,
    cancelDelivery,
    buyerInformation
  },
  data () {
    return {
      // 标签相关
      tagModelStatus: false,
      tagsStatus: false,
      tagIdList: [],
      tagsList: [], // End
      buyerCountry: null,
      flag: null,
      orderInfo: '',
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
      newOrderTagList: [], // End
      interceptModal: {
        oid: '',
        status: 0,
        ids: null
      },
      interceptSelectStatus: false,
      interceptSelectModal: false,
      orderDetailsData: null,
      orderDetailsData_: {
        estimateCostsJson: null,
        orderInfo: { totalPrice: null }
      },
      packageGoodsQuantityObj: null,
      timestampTwo: 0,
      isManual: false
    };
  },
  props: {
    hasEdit: {
      // 是否可以编辑
      default () {
        return true;
      },
      type: Boolean
    },
    isShowIntercept: {
      default: true, // 是否展示截留订单
      type: Boolean
    },
    prefix: {
      default: ''
    },
    orderDetailsId: {
      default: null
    },
    orderNo: {
      type: String,
      default: null
    },
    orderTagList: {
      type: Array,
      default () {
        return [];
      }
    },
    webstoreItemSite: {
      type: String,
      default: null
    },
    buttonVisibile: {
      type: Boolean,
      default: true
    },
    orderType: {
      type: String,
      default: null
    },
    timestamp: {
      type: Number,
      default: null
    },
    inPage: {
      type: String,
      default: null
    },
    left: {
      type: Number,
      default: 392
    }
  },
  computed: {
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
      let v = this;
      if (n) {
        var date = new Date().getTime();
        v.timestampTwo = date;
        v.getOrderDetails();
        v.updateStatus = false;
      }
    },
    timestamp (n, o) {
      let v = this;
      if (n !== o && v.orderDetailsId !== null) {
        v.$emit('spinLoading');
        var date = new Date().getTime();
        v.timestampTwo = date;
        v.newOrderTagList = [];
        v.getOrderDetails();
        v.orderNoTitle = v.orderNo;
        if (v.$route.path === '/manualOrder') {
          v.isManual = true;
        } else {
          v.isManual = false;
        }
      }
    },
    orderNo: {
      handler (n, o) {
        let v = this;
        if (n !== o) {
          v.orderNoTitle = v.orderNo;
        }
      },
      immediate: true
    }
  },
  methods: {
    resetDetails () { // 重置数据
      let v = this;
      v.interceptModal.status = 0;
      v.interceptModal.oid = '';
      v.interceptOrderModel.orderId = [];
      v.interceptOrderModel.suspendedReason = '';

      delete v.interceptSelectModal.flag;
    },
    getOrderDetails () {
      let v = this;
      let id;
      v.resetDetails();// 重置订单信息
      if (typeof v.orderDetailsId === 'object') { // 合并订单时默认先取第一个订单
        id = v.orderDetailsId[0];
      } else {
        id = v.orderDetailsId;
      }
      v.editProductStatus = [];
      v.orderDetailsData = null;
      v.$store.commit('orderDetails', this.orderDetailsData_);
      v.axios.get(v.apiPrefix + api.get_orderDetails + '/' + id).then(response => {
        if (response.data.code === 0) {
          console.log(response.data.datas);
          let data = v.fixData(response.data.datas);
          v.$store.commit('orderDetails', data);

          v.orderDetailsData = data;
          if (data.orderShippingInfoList && data.orderShippingInfoList.length > 0) {
            v.refreshAvailableNum(data);
            // 可用库存数量
            // let productGoodsIdList = [];
            // data.orderShippingInfoList.forEach(i => {
            //   i.orderShippingDetailList.forEach(j => {
            //     productGoodsIdList.push(j.productGoodsId);
            //   });
            // });
            // v.getStockOut({
            //   merchantId: data.orderShippingInfoList[0].merchantId, // skus: data.orderShippingInfoList[0].orderShippingDetailList.map(i => i.sku),
            //   productGoodsIdList: productGoodsIdList,
            //   warehouseIdList: data.orderShippingInfoList.map(i => i.warehouseId),
            //   'pageSize': 100,
            //   'queryLevel': 0,
            //   'queryOnWayQuantity': 0
            // }).then(stockOutData => {
            //   stockOutData.inventoryList.forEach(j => {
            //     data.orderShippingInfoList.forEach(i => {
            //       i.orderShippingDetailList.forEach(k => {
            //         if (k.productGoodsId === j.productGoodsId && i.warehouseId === j.warehouseId) {
            //           k.availableNumber = j.availableNumber;
            //         }
            //       });
            //     });
            //   });
            //   v.orderInfo = data.orderInfo;// 基本信息
            //   v.setImgList(productGoodsIdList)
            //   v.assignment(data);
            // });
          } else {
            v.orderInfo = data.orderInfo;// 基本信息
            v.assignment(data);
          }
        }
      });
    },
    assignment (data) {
      let v = this;
      if (data.remainTime === 0) { // 逾期
        v.shippingLimiteTime = '逾期';
      } else if (data.remainTime === null) {
        v.shippingLimiteTime = '';
      } else { // 标发货剩余时间
        v.shippingLimiteTime = v.getLimitTime(data.remainTime);
      }
      if (!v.$common.isEmpty(v.orderInfo.orderTags)) { // 标签挂载
        v.newOrderTagList = v.orderInfo.orderTags;
      }
      v.countryName(v.orderInfo.buyerCountryCode).then(response => {
        v.buyerCountry = response;
      });
      v.$emit('resetSpinShow');
      v.$nextTick(function () {
        setTimeout(function () {
          v.$emit('reloadTag', v.newOrderTagList);
        }, 1000);
      });
    },
    fixData (data) {
      if (data.reportOrderProfitList) {
        // 利润 小计
        data.reportOrderProfitList.forEach(i => {
          if (i.reportOrderProfitDetailList) {
            let obj = {
              'amountType': '999', // 999 小计
              'amount': 0,
              'amountCurrency': 'CNY' // 使用 CNY
            };
            i.reportOrderProfitDetailList.forEach(i => {
              let amount = i.amount * i.amountExchangeRate;
              obj.amount += Number(amount.toFixed(2));
            });
            i.reportOrderProfitDetailList.push(obj);
          }
        });
      }
      return data;
    },
    getOrderListTag () { // 获取标签列表
      let v = this;
      v.axios.get(v.apiPrefix + api.get_orderListTag + '?type=1').then(response => {
        // v.tagsList = v.tagsList.concat(response.data.datas);
        // v.tagsList = response.data.datas;
        // console.log(v.tagsList);
        // console.log(v.orderInfo.orderTags);
        // 去掉已选择标签
        // if (v.orderInfo.orderTags !== null && v.orderInfo.orderTags.length > 0 && v.tagsList.length > 0) {
        //   let pos = v.tagsList;
        //   for (let i = 0; i < v.orderInfo.orderTags.length; i++) {
        //     for (let j = 0; j < v.tagsList.length; j++) {
        //       if (v.orderInfo.orderTags[i].tagId === v.tagsList[j].tagId) {
        //         pos.splice(j, 1);
        //       }
        //     }
        //   }
        //   console.log(pos);
        //   v.tagsList = pos;
        // }

        let data = response.data.datas;
        data.forEach((n, i) => {
          n.status = false;
        });
        if (v.orderInfo.orderTags !== null && v.orderInfo.orderTags.length > 0 && data.length > 0) {
          for (let i = 0; i < v.orderInfo.orderTags.length; i++) {
            for (let j = 0; j < data.length; j++) {
              if (v.orderInfo.orderTags[i].tagId === data[j].tagId) {
                data[j].status = true;
              }
            }
          }
        }
        v.tagsList = data;
      });
    },
    countryChange (value) { // 高级筛选国家列表获取
      let v = this;
      if (value.indexOf('null') >= 0) {
        v.buyerAddressModal.buyercountryId = null;
      } else {
        v.buyerAddressModal.buyercountryId = value;
      }
    },
    interceptOrder () {
      let v = this;
      v.orderInfo.isSuspended === 0 ? v.interceptOrderStatus = true : v.setThisRelease(v.orderInfo.orderId);
    },
    setThisRelease (orderId, flag) { // 放行
      let v = this;
      let obj = {};
      obj.platformId = ['ebay'];
      obj.orderIdList = [orderId];
      if (flag === 1) {
        obj.flag = 1;
      }
      v.axios.put(v.apiPrefix + api.set_orderRelease, JSON.stringify(obj)).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('放行成功');
          v.updateStatus = true; // 触发数据更新
          if (v.inPage === 'combineOrder') {
            v.$store.commit('combineStatus', true);
          }
        } else if (response.data.code === 110503) {
          v.$Modal.confirm({
            title: '提示',
            okText: '整包裹放行',
            content: '<p>' + '订单所在包裹为合并包裹，请选择整包裹放行或取消操作' + '</p>',
            onOk: () => {
              v.setThisRelease(orderId, 1);
            }
          });
        }
      });
    },
    setMark () { // 打标签操作
      let v = this;
      // if (v.tagsList.length < 1) {
      //   v.getOrderListTag();
      // }
      v.getOrderListTag();
      v.tagsStatus = true;
      v.$nextTick(function () {
        v.tagModelStatus = true;
      });
    },
    hideTag () {
      let v = this;
      v.tagModelStatus = false;
      setTimeout(function () {
        document.getElementsByTagName('body')[0].style.overflow = 'hidden';
      }, 500);
    },
    setTag () { // 打标签
      let v = this;
      if (v.tagIdList.length === 0) {
        v.$Message.error('请选择标签');
      } else if (v.tagIdList.length === 0) {
        v.$Message.error('请选择标签');
      } else {
        let obj = {
          orderIdList: [v.orderInfo.orderId],
          tagIdList: v.tagIdList
        };
        v.axios.post(v.apiPrefix + api.set_tag, JSON.stringify(obj)).then(response => {
          if (response.data.code === 0) {
            v.$Message.success('标记成功');
            v.tagModelStatus = false;
            v.resetTag();
            v.updateStatus = true;
          } else {
            v.$Message.error('操作失败，请重新尝试');
          }
        });
      }
    },
    closeTag (event, name) {
      let v = this;
      v.axios.delete(v.apiPrefix + api.del_orderTag + v.newOrderTagList[name].orderTagId).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
          v.updateStatus = true;
          v.$nextTick(function () {
            v.newOrderTagList.splice(name, 1);
            v.$emit('reloadTag', v.newOrderTagList);
          });
        }
      });
    },
    orderDetailsOperate (value) { // 订单详情操作
      let v = this;
      if (value === '0') {
        v.setMark();
      } else if (value === '1') {
        v.startCancelDelivery();
      } else if (value === '2') {
        // 恢复
        v.$Modal.confirm({
          title: '恢复作废',
          content: '订单恢复作废后，系统将重新创建发货信息，并执行所有自动规则,是否确定恢复？',
          onOk () {
            v.axios.put(api.resume_order + v.orderInfo.orderId).then(res => {
              if (res.data.code === 0) {
                v.$Message.success('恢复成功');
                v.updateStatus = true;
              }
            });
          }
        });
      }
    },
    saveIntercept (oid, type) {
      let v = this;
      if (v.interceptOrderModel.suspendedReason === '') {
        v.$Message.error('截留原因不能为空');
        return false;
      }
      if (Number(type) === 1) {
        v.interceptOrderModel.orderId = oid;
        v.interceptOrderModel.flag = type;
      } else if (Number(type) === 0) {
        v.interceptOrderModel.orderId = v.orderInfo.orderId;
        v.interceptOrderModel.flag = type;
      } else {
        v.interceptOrderModel.orderId = v.orderInfo.orderId;
        delete v.interceptOrderModel.flag;
      }
      v.axios.put(v.apiPrefix + api.set_intercept, JSON.stringify(v.interceptOrderModel)).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data === null || data.length === 0) {
            if (v.inPage === 'combineOrder') { // 如果所在页面为合并包括时，还需重置合并列表
              this.$store.commit('combineStatus', true);
            }
            v.$Message.success('截留成功');
            v.interceptOrderModel.suspendedReason = null;
            v.interceptOrderStatus = false;
            v.updateStatus = true;
          } else {
            v.$Message.warning('当前订单所在包裹存在多个订单,请选择截留类型!');
            v.interceptModal.oid = v.orderInfo.orderId;
            v.interceptModal.ids = data.others.toString();
            v.interceptSelectStatus = true;
            v.$nextTick(function () {
              v.interceptSelectModal = true;
            });
          }
        } else {
          v.$Message.error('操作失败，请重新尝试');
        }
      });
    },
    confirmSelectIntercept () {
      let v = this;
      v.saveIntercept(v.interceptModal.oid, v.interceptModal.status);
    },
    startCancelDelivery () {
      this.$refs['cancelDelivery'].cancelDelivery('single', this.orderInfo, 0);
    },
    setImgList (productGoodsIdList) {
      let busineseIdList = this.orderInfo.orderTransactions.map(itema => {
        return itema.businessId
      })

      this.axios.post(api.query_imageByProductGoodsIds, busineseIdList).then(res => {
        this.orderInfo.orderTransactions.forEach(itema => {
          res.data.datas.forEach(itemb => {
            if (itemb.businessId == itema.businessId) itema.pictureUrl = './filenode/s/thumb' + itemb.path
          })
        })
      })
      this.axios.post('/order-service' + api.query_productImgs + '?time=' + new Date().getTime(), productGoodsIdList).then(res => {
        this.orderDetailsData.orderShippingInfoList.forEach(itema => {
          itema.orderShippingDetailList.forEach(itemb => {
            Object.keys(res.data.datas).forEach(itemc => {
              if (itemb.productGoodsId == itemc) {
                itemb.pictureUrl = res.data.datas[itemc][0]
              }
            })
          })
        })
      })
    },
    // 更新包裹下产品真实库存
    refreshAvailableNum (data) {
      this.$store.dispatch('getAllstore').then((storeList) => {
        let [temp, allproductGoodsIdList] = [[], []];

        (data.orderShippingInfoList || []).forEach(orderItem => {
          let productGoodsIdList = orderItem.orderShippingDetailList.map(j => {
            allproductGoodsIdList.push(j.productGoodsId);
            return j.productGoodsId;
          });
          let obj = {
            merchantId: orderItem.merchantId, // 商家id
            productGoodsIdList: productGoodsIdList, // sku
            warehouseIdList: [orderItem.warehouseId], // 仓库id
            pageSize: 100,
            queryLevel: 0, // 查询级别:0为仓库-商品级别；1仓库-库位-商品级别；2商品级别
            queryOnWayQuantity: 0// 是否在途(0不查；1或者null查)
          };
          // 当 warehouseType 是 1 时为 第三方仓库  归属仓库且为第三方仓库
          const warehouseObj = storeList.filter(storeItem => orderItem.warehouseId === storeItem.warehouseId && storeItem.warehouseType == 1)[0];
          if (!this.$common.isEmpty(warehouseObj)) {
            // 固定的谷仓仓库，海外仓的订单的库存同步平台库存
            const barnList = ['GC-AUSY', 'GC-DE', 'GC-US', 'GCUKC', 'GCMGDAC', 'GC-DE-DGDLXMZ'];
            const orderList = ['ocoutstore', 'winitoutstore'];
            // 谷仓
            if (barnList.includes(warehouseObj.warehouseCode)) {
              obj.warehouseOverseaType = 'gcoutstore';
            } else if (orderList.includes(warehouseObj.warehouseOverseaType)) { // 其他第三方仓库
              obj.warehouseOverseaType = warehouseObj.warehouseOverseaType;
            }
          }
          temp.push(obj)
        });

        this.getRealStockOutNum(temp).then(stockOutData => {
          stockOutData.forEach(stockItem => {
            (stockItem.inventoryList || []).forEach(j => {
              data.orderShippingInfoList.forEach(i => {
                i.orderShippingDetailList.forEach(k => {
                  if (k.productGoodsId === j.productGoodsId && i.warehouseId === j.warehouseId) {
                    k.availableNumber = j.availableNumber;
                  }
                });
              });
            });
            this.orderInfo = data.orderInfo;// 基本信息
            this.setImgList(allproductGoodsIdList)
            this.assignment(data);
          })
        }).catch(() => {
          this.orderInfo = data.orderInfo;// 基本信息
          this.setImgList(allproductGoodsIdList)
          this.assignment(data);
        });
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
          // eslint-disable-next-line handle-callback-err
        }).catch(err => {
          resolve([]);
        })
      })
    }
  }
};
</script>
