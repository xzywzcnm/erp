<template >
  <div class="post-sale-step" id="post-sale-step" :class={pt10i:!hasEdit}>
    <Spin fix v-if="loading1"></Spin>
    <div v-if="source === 'order'" class="post-cont-header">
      <!--订单售后里面的操作-->
      <div class="post-header" v-if="hasEdit">
        <Button type="primary" :loading="loading1" @click="orderSave(false)">新增</Button>
        <Button class="ml10" type="primary" :loading="loading1" @click="saveAndSubmit">新增并提交审批</Button>
      </div>
    </div>
    <div v-else class="post-cont-header">
      <div class="post-header" v-if="hasEdit">
        <Button type="primary" @click="saveSubmit('1')" :loading="loading1">提交审批</Button>
        <Button class="ml10" type="primary" @click="saveSubmit('0')" :loading="loading1">保存</Button>
      </div>
    </div>

    <Alert show-icon class="f14 post-step-one">
      第一步 <span slot="desc">选择订单及问题商品</span>
    </Alert>
    <div class="search-box">
      <Row type="flex" class="code-row-bg padding-10" v-if="editType === 'add' && source !== 'order'">
        <Col><label style="line-height: 32px">选择订单</label></Col>
        <Col offset="1"><Input v-model.trim="orderInNo" @on-enter="getOrderDetail" /></Col>
        <Col offset="1">
        <Button type="primary" @click="getOrderDetail">查找订单 </Button>
        </Col>
      </Row>
      <div class="plr16">
        <Alert type="warning">
          <Row>
            <Col span="12">
            <span>订单：{{ orderName }}</span>
            </Col>
            <Col span="12">
            <span>目的地：{{ orderAddress }}</span>
            </Col>
          </Row>
        </Alert>
      </div>
    </div>
    <Card title="选择问题商品" dis-hover>
      <Table class="mb10" :columns="columns1" :data="tableData"></Table>
      <Alert type="warning" show-icon>
        <p>1.建议按真实情况录入问题数量，方便日后统计货品的退换货比例。</p>
        <p>2.物流原因损坏的货品问题，请不要计入问题数量，以免影响对货品本身质量的统计分析。</p>
      </Alert>
    </Card>
    <Card title="备注" dis-hover>
      <Form ref="remarkForm" :model="afterSalesParams" :rules="ruleValidate" label-position="right" :label-width="100">
        <FormItem label="售后原因" prop="reason">
          <dyt-select :disabled="!hasEdit" v-model="afterSalesParams.reason" style="width: 200px">
            <Option v-for="(item,index) in reasonListT" :key="index" :value="item.paramValue">{{ item.paramKey }}</Option>
          </dyt-select>
          <Button
            type="primary"
            v-if="hasEdit && getPermission('afterSales_saveReason') && source !== 'order'"
            style="margin-left: 10px"
            @click="addReason"
          >新增原因</Button>
        </FormItem>
        <!--<Row type="flex"  class="code-row-bg padding-10">
            <Col ><label style="line-height: 32px">售后原因</label></Col>
            <Col offset="1">

            </Col>
            <Col offset="1"></Col>
        </Row>-->
        <FormItem label="备注" prop="remark">
          <Input
            :disabled="!hasEdit"
            :rows="4"
            type="textarea"
            class="wid80a"
            v-model.trim="afterSalesParams.remark"
          />
        </FormItem>
      </Form>
    </Card>
    <Alert show-icon style="margin: 10px 0;" class="f14 post-step-two">
      第二步 <span slot="desc">选择售后操作内容(可多选)
        <CheckboxGroup v-model="checkAllGroup" class="chosePostCheck">
          <Checkbox label="0" v-if="isPay" :disabled="(tableData.length === 0 || !hasEdit)">退款</Checkbox>
          <Checkbox label="1" v-if="isDelieryDetails" :disabled="(tableData.length === 0 || !hasEdit)">退货</Checkbox>
          <Checkbox label="2" v-if="isDelieryDetails" :disabled="(tableData.length === 0 || !hasEdit)">已补发货</Checkbox>
        </CheckboxGroup>
      </span>
    </Alert>
    <div style="min-height: 100px">
      <!--退款-->
      <div class="box0" v-if="checkAllGroup.indexOf('0')>-1">
        <Divider>退款</Divider>
        <Table :columns="columns2" :data="tableData2" class="mb10"></Table>
        <Form :model="afterSalesParams" label-position="right" :label-width="100">
          <FormItem label="申请退款金额">
            <InputNumber :disabled="!hasEdit" v-model="afterSalesParams.refundAmount" class="wid200" :min="0" :max="tableData2[0].maxPrice"></InputNumber>
            {{ totalPriceCurrency }} 不可高于：<span v-if="tableData2.length > 0 ">{{ tableData2[0].maxPrice }}</span> {{ tableData2[0].transactionPriceCurrency }}
          </FormItem>
          <FormItem label="给买家的留言">
            <Input :disabled="!hasEdit" :rows="4" type="textarea" class="wid80a" v-model.trim="afterSalesParams.toBuyerMessage" />
          </FormItem>
          <FormItem
            label="ebay退款原因"
            v-if="['CREDIT_CARD', 'CreditCard', 'CCAccepted', 'CCACCEPTED'].includes(paymentMethodName)"
          >
            <dyt-select style="width:210px" filterable v-model="afterSalesParams.reasonForRefund" :disabled="!hasEdit">
              <Option v-for="(item,index) in reasonForRefundList" :key="index" :value="item">{{ item }}</Option>
            </dyt-select>
          </FormItem>
        </Form>
        <div class="plr16">
          <Alert type="warning" show-icon>系统将生成ebay退款请求，审核通过后将自动为您退款，您无需登录ebay处理退款
          </Alert>
        </div>
      </div>
      <!--退货-->
      <div class="box0" v-if="checkAllGroup.indexOf('1')>-1">
        <Divider>退货</Divider>
        <Row :gutter="16" type="flex" justify="space-between" class="plr16 mb10" v-if="hasEdit">
          <Col>
          <Button type="primary" size="small" @click="openProductFn('1')">添加商品 </Button>
          </Col>
          <Col>
          <Button size="small" @click="resetBackGoodsAdd">清空并填入问题货品 </Button>
          </Col>
        </Row>
        <Table :columns="columns3" :data="tableData3" class="mb10"></Table>
        <Form :model="afterSalesParams" label-position="right" :label-width="100">
          <FormItem>
            <label slot="label" class="redDot">接受退货的仓库</label> <dyt-select style="width:210px" filterable v-model="afterSalesParams.warehouseId" :disabled="!hasEdit">
              <Option v-for="(item,index) in privateWarehouse" :key="index" :value="item.warehouseId">{{ item.warehouseName }}</Option>
            </dyt-select>
          </FormItem>
          <FormItem label="买家退货使用的carrier">
            <Input class="wid80a" :disabled="!hasEdit" v-model.trim="afterSalesParams.buyerReturnCarrier" />
          </FormItem>
          <FormItem label="买家退货的跟踪单号">
            <Input class="wid80a" :disabled="!hasEdit" v-model.trim="afterSalesParams.buyerReturnTrackingNum" />
            <Checkbox style="margin-left: 10px" v-if="$store.state.orderDetails && $store.state.orderDetails.orderShippingInfoList.length === 1 && hasEdit" v-model="fillInSt" @on-change="changeFillIn">填入原发货跟踪号</Checkbox>
          </FormItem>
        </Form>
        <div class="plr16">
          <Alert type="warning" show-icon>退货货品清单将在退货仓库【入库管理】中创建入库单等待入库
          </Alert>
        </div>
      </div>
      <!--补发货-->
      <div class="box0" v-if="checkAllGroup.indexOf('2')>-1">
        <Divider>已补发货</Divider>
        <Card dis-hover title="补发货货品信息">
          <Row :gutter="16" type="flex" justify="space-between" class="mb10" v-if="hasEdit">
            <Col>
            <Button type="primary" @click="openProductFn('2')" size="small">添加商品 </Button>
            </Col>
            <Col v-if="hasEdit">
            <Button size="small" class="mr10" @click="resetReplenishmentGoodsAdd">补发货货品信息 </Button>
            <Button size="small" @click="resetReplenishmentGoodsAddP">清空并填入退货商品 </Button>
            </Col>
          </Row>
          <Table :columns="columns4" :data="tableData4" class="mb10"></Table>
        </Card>
        <Card dis-hover title="补发货物流信息">
          <p class="f14 fontWeight mb10">买家收件地址
            <Button @click="addOldOrderAddress" class="fr" size="small" v-if="hasEdit">填入原订单收货地址 </Button>
          </p>
          <Form :model="afterSalesParams" label-position="right" :label-width="100">
            <FormItem label="收件人">
              <Input :disabled="!hasEdit" v-model.trim="afterSalesParams.buyerName" :maxlength="20" class="wid80a" />
            </FormItem>
            <FormItem label="买家地址1">
              <Input :disabled="!hasEdit" v-model.trim="afterSalesParams.buyerAddress1" :maxlength="100" class="wid80a" />
            </FormItem>
            <FormItem label="买家地址2">
              <Input :disabled="!hasEdit" v-model="afterSalesParams.buyerAddress2" :maxlength="100" class="wid80a" />
            </FormItem>
            <FormItem label="城市">
              <Input :disabled="!hasEdit" v-model.trim="afterSalesParams.buyerCity" :maxlength="30" class="wid80a" />
            </FormItem>
            <FormItem label="州/省">
              <Input :disabled="!hasEdit" v-model.trim="afterSalesParams.buyerState" :maxlength="30" class="wid80a" />
            </FormItem>
            <FormItem label="国家/地区">
              <dyt-select :disabled="!hasEdit" v-model="afterSalesParams.buyerCountryCode" filterable>
                <Option v-for="(item,index) in formValidate.country" :key="index" :value="item.twoCode" :v="item.productName">{{ item.enName }}</Option>
              </dyt-select>
            </FormItem>
            <FormItem label="邮编">
              <Input :disabled="!hasEdit" v-model.trim="afterSalesParams.buyerPostalCode" class="wid80a" :maxlength="30" />
            </FormItem>
            <FormItem label="电话">
              <Input :disabled="!hasEdit" v-model.trim="afterSalesParams.buyerPhone" class="wid80a" :maxlength="20" />
            </FormItem>
            <FormItem label="手机">
              <Input :disabled="!hasEdit" v-model.trim="afterSalesParams.buyerMobile" class="wid80a" :maxlength="11" />
            </FormItem>
          </Form>
          <Divider />
          <p class="f14 fontWeight mb10">发货仓库及物流
            <Button size="small" @click="addOldOrderWare" class="fr" v-if="hasEdit">选择原仓库及物流 </Button>
            <Button v-if="hasEdit" class="fr mr10" size="small" @click="resetWsData">清空 </Button>

          </p>
          <Form :model="afterSalesParams" label-position="right" :label-width="100">
            <FormItem label="发货仓库">
              <dyt-select
                :disabled="!hasEdit"
                style="width:210px"
                @on-change="changeWarehouse"
                v-model="afterSalesParams.newWarehouseId"
              >
                <Option v-for="(item,index) in allStorelist" :key="index" :value="item.warehouseId">{{ item.warehouseName }}</Option>
              </dyt-select>
            </FormItem>
            <FormItem label="物流方式">
              <Cascader
                :disabled="!hasEdit || !afterSalesParams.newWarehouseId"
                :data="shippingMethodData"
                @on-visible-change="showShippingDataApi"
                v-model="value2"
                :load-data="loadDataApi"
                @on-change="getAccountApi"
                transfer
              ></Cascader>
            </FormItem>
          </Form>
        </Card>

      </div>
    </div>
    <matchingGoodsModal ref="matchingGoodsModal" :prefix="'/cs-service'" :choseData="choseData" @saveHandel="addProductSave"></matchingGoodsModal>
  </div>
</template>

<script >
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import publicServiceMixin from '@/components/mixin/publicService_mixin';
import matchingGoodsModal from '@/components/common/order/matchingGoodsModal';

export default {
  name: 'postSaleStep',
  mixins: [Mixin, publicServiceMixin],
  components: {
    matchingGoodsModal
  },
  props: {
    moalVisible: { type: Boolean, default: false },
    open: {
      type: String | Number
    },
    editType: {
      type: String,
      default: 'add'
    },
    reasonList: {
      // 原因
      type: Array,
      default: () => []
    },
    postDetail: {
      // 售后对象
      type: Object
    },
    source: {
      default: 'cs' // 来源  cs 客服 order 订单系统（订单详情售后）
    },
    orderNo: {
      type: String,
      default: ''
    }
  },
  data () {
    let v = this;
    return {
      pageOrderNo: '',
      loading1: false,
      fillInSt: false,
      totalPriceCurrency: '',
      paymentMethodName: '',
      orderName: '',
      isPay: 0,
      isDelivery: 0,
      orderAddress: '',
      carrierAccount: [],
      shippingMethodModel: [],
      apiInterfaceStatus: [],
      value2: [],
      choseData: [],
      addProductType: '1',
      addProductValue: [],
      formValidate: {
        country: []
      },
      ruleValidate: {
        reason: [
          { required: true, message: '请选择原因', trigger: 'change', type: 'string' }
        ],
        // remark: [
        //   { required: true, message: '请填写备注', trigger: 'blur', type: 'string' },
        //   { required: true, message: '请填写备注', trigger: 'change', type: 'string' }
        // ]
      },
      columns4: [
        {
          title: 'SKU/商品名称',
          render (h, params) {
            return h('span', `${params.row.sku || ''}/${params.row.title || ''}`);
          }
        }, {
          title: '申请补发数量',
          render (h, params) {
            return h('Input', {
              props: {
                value: params.row.quantity,
                max: 100000,
                min: 0,
                disabled: !v.hasEdit
              },
              on: {
                'on-blur': (e) => {
                  let data = JSON.parse(JSON.stringify(params.row));
                  data.quantity = parseInt(e.target.value);
                  data.quantity = isNaN(data.quantity) ? 0 : data.quantity;
                  v.$set(v.tableData4, params.index, data);
                }
              }
            });
          }
        }, {
          title: '操作',
          render (h, params) {
            return h('Button', {
              props: {
                size: 'small',
                disabled: !v.hasEdit
              },
              on: {
                'click' () {
                  v.tableData4.splice(params.index, 1);
                }
              }
            }, '删除');
          }
        }
      ],
      tableData4: [],
      columns3: [
        {
          title: 'SKU/商品名称',
          render (h, params) {
            return h('span', `${params.row.sku || ''}/${params.row.title || ''}`);
          }
        }, {
          title: '申请退货数量',
          render (h, params) {
            return h('Input', {
              props: {
                value: params.row.quantity,
                max: 100000,
                min: 0,
                disabled: !v.hasEdit
              },
              on: {
                'on-blur': (e) => {
                  let data = JSON.parse(JSON.stringify(params.row));
                  data.quantity = parseInt(e.target.value);
                  data.quantity = isNaN(data.quantity) ? 0 : data.quantity;
                  v.$set(v.tableData3, params.index, data);
                }
              }
            });
          }
        }, {
          title: '操作',
          render (h, params) {
            return h('Button', {
              props: {
                size: 'small',
                disabled: !v.hasEdit
              },
              on: {
                'click' () {
                  v.tableData3.splice(params.index, 1);
                }
              }
            }, '删除');
          }
        }
      ],
      tableData3: [],
      columns2: [
        {
          title: '付款类型',
          render (h, params) {
            return h('span', '新增付款');
          }
        }, {
          title: '付款单号',
          key: 'orderId'
        }, {
          title: '付款金额',
          key: 'transactionPrice',
          render (h, params) {
            return h('span', params.row.transactionPrice + params.row.transactionPriceCurrency);
          }
        }, {
          title: '已退金额',
          key: 'refundPrice',
          render (h, params) {
            return h('span', params.row.refundPrice + params.row.refundPriceCurrency);
          }
        }, {
          title: '付款日期',
          render (h, params) {
            return h('span', v.getDataToLocalTime(params.row.payTime));
          }
        }
      ],
      tableData2: [],
      checkAllGroup: [],
      reasonForRefundList: [
        'BUYER_CANCEL',
        'SELLER_CANCEL',
        'ITEM_NOT_RECEIVED',
        'BUYER_RETURN',
        'ITEM_NOT_AS_DESCRIBED',
        'OTHER_ADJUSTMENT',
        'SHIPPING_DISCOUNT'
      ],
      afterSalesParams: {
        'approveStatus': 0, // 0 提交 1提交审批
        'buyerAddress1': '', // 买家地址 ,
        'buyerAddress2': '', // 买家地址2 ,
        'buyerCity': '', // 买家城市
        'buyerCountryCode': '', // 买家国家编码
        'buyerMobile': '', // 买家手机 ,
        'buyerName': '', // 买家姓名 ,
        'buyerPhone': '', //  买家电话 ,
        'buyerPostalCode': '', // 买家邮编
        'buyerReturnCarrier': '', // 买家退货使用物流商 ,
        'buyerReturnTrackingNum': '', // 买家退货跟踪号
        'buyerState': '', // 买家省洲
        'carrierId': '', // 物流商id
        'isRedelivery': 0, // 是否补发货 0否 1是 ,
        'isRefund': 0, // 是否退款 0否 1是 ,
        'isReturn': 0, // 是否退货 0否 1是 ,
        'newWarehouseId': '', // 发货仓库
        'orderId': '', // 订单Id
        reasonForRefund: '',
        'reDeliveryGoods': [
          /* // 补发货货品
           {
           'productGoodsId': '', // 货品流水号 ,
           'quantity': 0, // 数量
           'sku': '' //  sku
           } */
        ],
        'reason': '', // 原因 ,
        'refundAmount': 0, // 退款金额
        'refundCurrency': '', // : 退款币种 ,
        'remark': '', // 备注
        'returnGoods': [
          /*  // 退货货品
           {
           'productGoodsId': '', // 货品流水号 ,
           'quantity': 0, // 数量 ,
           'sku': ''//  sku
           } */
        ],
        'shippingMethodId': '', // 邮寄方式id
        'toBuyerMessage': '', // 给买家留言 ,
        'warehouseId': '', // 退货收货仓库编号 ,
        'wastageGoodsBoList': [
          /* // 问题货品
           {
           'orderTransactionId': '', // 交易id ,
           'productGoodsId': '', // 货品流水号 ,
           'quantity': 0, // 数量
           'sku': '' //  sku
           } */
        ]
      },
      orderInNo: '',
      reasonListT: [],
      columns1: [
        {
          title: '名称',
          key: 'title'
        }, {
          title: '出库单号',
          key: 'packageCode'
        }, {
          title: 'SKU',
          key: 'sku'
        }, {
          title: '发货数量',
          key: 'number1'
        }, {
          title: '问题数量',
          key: 'quantity',
          render (h, params) {
            return h('InputNumber', {
              props: {
                value: params.row.quantity,
                max: params.row.number1,
                min: 0,
                disabled: !v.hasEdit
              },
              on: {
                input (e) {
                  v.tableData[params.index].quantity = e;
                }
              }
            });
          }
        }
      ],
      tableData: []
    };
  },
  methods: {
    changeFillIn (value) {
      if (value) {
        this.afterSalesParams.buyerReturnTrackingNum = this.$store.state.orderDetails.orderShippingInfoList[0].trackingNumber;
      }
    },
    addOldOrderAddress () {
      let v = this;
      let data = v.$store.state.orderDetails.orderInfo;
      if (data) {
        v.afterSalesParams.buyerName = data.buyerName;
        v.afterSalesParams.buyerAddress1 = data.buyerAddress1;
        v.afterSalesParams.buyerAddress2 = data.buyerAddress2;
        v.afterSalesParams.buyerCity = data.buyerCity;
        v.afterSalesParams.buyerState = data.buyerState;
        v.afterSalesParams.buyerCountryCode = data.buyerCountryCode;
        v.afterSalesParams.buyerPostalCode = data.buyerPostalCode;
        v.afterSalesParams.buyerPhone = data.buyerPhone;
        v.afterSalesParams.buyerMobile = data.buyerMobile;
      }
    },
    // 清空按钮点击事件
    resetWsData () {
      this.$nextTick(() => {
        this.afterSalesParams.newWarehouseId = '';
        this.afterSalesParams.shippingMethodId = '';
        this.afterSalesParams.carrierId = '';
        this.value2 = [];
      });
    },
    addOldOrderWare () {
      let v = this;
      let data = v.$store.state.orderDetails.orderShippingInfoList[0];
      if (data) {
        v.afterSalesParams.newWarehouseId = data.warehouseId;
        v.afterSalesParams.shippingMethodId = data.merchantShippingMethodId;
        v.afterSalesParams.carrierId = data.merchantCarrierId;
        v.showShippingDataApi(true);
        v.loadDataApi({ value: data.merchantCarrierId }, () => {
          v.$nextTick(() => {
            v.value2 = [data.merchantCarrierId, data.merchantShippingMethodId];
          });
        });
      }
    },
    getCarrierBaseSettingApi (shippingMethodId, model) {
      let v = this;
      v.carrierBaseSetting = [];
      v.shippingMethodModel = [];
      v.axios.get(api.get_shippingMethodParamsApi + '?shippingMethodId=' + shippingMethodId + '&time=' + new Date().getTime() + Math.random() * 100).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          data.forEach((n, i) => {
            if (model) {
              v[model].push({
                paramKey: n.paramKey,
                paramValue: n.paramValue,
                title: n.paramName
              });
            } else {
              v.shippingMethodModel.push({
                paramKey: n.paramKey,
                paramValue: n.paramValue,
                title: n.paramName
              });
            }
          });
          v.carrierBaseSetting = data;
        } else {
          (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.error('系统繁忙，请重新尝试');
        }
      });
    },
    getAccountApi (value, selectedData) {
      let v = this;
      v.carrierAccount = [];
      if (value.length === 0) return false;
      v.shippingMethodModel = [];
      v.shippingAccountModel = [];
      v.apiInterfaceStatus = selectedData[0].apiInterface; // 存一下这个字段，当它为速卖通线上发货(API_AE_LG),eDIS物流(API_EDIS)的时候，不显示账号
      v.getCarrierBaseSettingApi(value[1]);
      if (value[1] !== null) {
        v.afterSalesParams.shippingMethodId = value[1];
        v.afterSalesParams.carrierId = value[0];
      }
    },
    loadDataApi (item, callback) {
      item.loading = true;
      let v = this;
      v.axios.get(api.csServiceCommon + api.get_enableShippingMethodsApi + '?carrierId=' + item.value + '&warehouseId=' + v.afterSalesParams.newWarehouseId).then(response => {
        if (response.data.code === 0 && response.data.datas && response.data.datas.length > 0) {
          let data = response.data.datas;
          let pos = [];
          for (let i = 0; i < data.length; i++) {
            pos.push({
              value: data[i].shippingMethodId,
              label: data[i].carrierShippingMethodName
            });
            if (i === data.length - 1) {
              item.children = pos;
              item.loading = false;
              callback();
            }
          }
          if (data.length === 0) {
            item.children = pos;
            item.loading = false;
            callback();
          }
        } else {
          item.loading = false;
          item.children = [];
        }
      }).catch(() => {
        item.loading = false;
        item.children = [];
      });
    },
    showShippingDataApi (val) {
      let v = this;
      if (val) {
        if (v.afterSalesParams.newWarehouseId) {
          // afterSalesParams.newWarehouseId
          let warehouseType = v.allStorelist.filter(i => i.warehouseId === v.afterSalesParams.newWarehouseId)[0].warehouseType;
          v.axios.get(api.csServiceCommon + api.get_enableCarriersApi + '?warehouseId=' + v.afterSalesParams.newWarehouseId + '&isFilter=true' + '&warehouseType=' + warehouseType).then(response => {
            if (response.data.code === 0) {
              let data = response.data.datas;
              if (data && data.length === 0) {
                v.shippingMethodData = [];
              }
              let pos = [];
              for (let i = 0; i < data.length; i++) {
                pos.push({
                  value: data[i].carrierId,
                  label: data[i].carrierName,
                  children: [],
                  loading: false,
                  carrierAccounts: data[i].carrierAccounts,
                  apiInterface: data[i].apiInterface
                });
                if (i === data.length - 1) {
                  v.shippingMethodData = pos;
                }
              }
            }
          });
        }
      }
    },
    // 更换仓库时，重置物流方式数据
    changeWarehouse () {
      this.value2 = [];
    },
    setParams () {
      let v = this;
      let params = {};
      v.afterSalesParams.isRedelivery = v.checkAllGroup.indexOf('2') > -1 ? 1 : 0;
      v.afterSalesParams.isRefund = v.checkAllGroup.indexOf('0') > -1 ? 1 : 0;
      v.afterSalesParams.isReturn = v.checkAllGroup.indexOf('1') > -1 ? 1 : 0;
      v.afterSalesParams.reDeliveryGoods = v.tableData4.filter(i => i.quantity > 0);
      v.afterSalesParams.returnGoods = v.tableData3.filter(i => i.quantity > 0);
      v.afterSalesParams.wastageGoodsBoList = v.tableData.filter(i => i.quantity > 0);
      v.afterSalesParams.reDeliveryGoods.forEach(i => {
        if (!i.productGoodsId) {
          i.productGoodsId = i.businessId;
        }
      });
      v.afterSalesParams.returnGoods.forEach(i => {
        if (!i.productGoodsId) {
          i.productGoodsId = i.businessId;
        }
      });
      v.afterSalesParams.wastageGoodsBoList.forEach(i => {
        if (!i.productGoodsId) {
          i.productGoodsId = i.businessId;
        }
      });
      params = JSON.parse(JSON.stringify(v.afterSalesParams));
      if (v.checkAllGroup.indexOf('0') < 0) {
        params.refundAmount = 0;
        params.toBuyerMessage = null;
      }
      if (v.checkAllGroup.indexOf('1') < 0) {
        params.returnGoods = [];
        params.warehouseId = null;
        params.buyerReturnTrackingNum = null;
      }
      if (v.checkAllGroup.indexOf('1') < 0 && v.checkAllGroup.indexOf('2') < 0) {
        params.carrierId = null;
      }
      if (v.checkAllGroup.indexOf('2') < 0) {
        params.reDeliveryGoods = [];
        params.buyerName = null;
        params.buyerAddress1 = null;
        params.buyerAddress2 = null;
        params.buyerCity = null;
        params.buyerState = null;
        params.buyerCountryCode = null;
        params.buyerPhone = null;
        params.buyerMobile = null;
        params.newWarehouseId = null;
        params.shippingMethodId = null;
      }
      return params;
    },
    // 验证数据
    saveValid () {
      return new Promise(resolve => {
        const greaterZero = this.tableData.filter(i => i.quantity > 0);
        if (greaterZero.length === 0) {
          resolve([false, '选择问题商品列表中“问题数量”列累计数量需大于 0']);
          return;
        }
        const quantityList = greaterZero.filter(i => {
          return (i.quantity.toString()).includes('.');
        });
        if (quantityList.length > 0) {
          resolve([false, '选择问题商品列表中的“问题数量”列必须为大于 0 的整数']);
          return;
        }
        if (this.checkAllGroup.length === 0) {
          resolve([false, '请选择售后内容']);
          return;
        }

        if (this.checkAllGroup.indexOf('0') > -1) {
          if (['CREDIT_CARD', 'CreditCard', 'CCAccepted', 'CCACCEPTED'].includes(this.paymentMethodName) && !this.afterSalesParams.reasonForRefund) {
            resolve([false, '请选择ebay退款原因']);
            return;
          }
          if (this.afterSalesParams.refundAmount <= 0) {
            resolve([false, '申请退款金额要大于0']);
            return;
          }
        }
        if (this.checkAllGroup.indexOf('1') > -1) {
          let data = this.tableData3.filter(i => i.quantity > 0);
          if (data.length <= 0) {
            resolve([false, '请选择退货货品']);
            return;
          } else if (!this.afterSalesParams.warehouseId) {
            resolve([false, '接收退货的仓库不能为空']);
            return;
          }
        }
        if (this.checkAllGroup.indexOf('2') > -1) {
          let data = this.tableData4.filter(i => i.quantity > 0);
          if (data.length <= 0) {
            resolve([false, '请选择补发货货品']);
            return;
          }

          if (this.$common.isEmpty(this.afterSalesParams.buyerAddress1) && this.$common.isEmpty(this.afterSalesParams.buyerAddress2)) {
            resolve([false, '买家地址不能为空']);
            return;
          }
        }
        // 必填项中止
        this.$refs.remarkForm.validate((valid) => {
          if (!valid) {
            if (this.$common.isEmpty(this.afterSalesParams.reason)) {
              resolve([false, '售后原因不能为空']);
            }
            // if (this.$common.isEmpty(this.afterSalesParams.remark)) {
            //   resolve([false, '售后原因备注不能为空']);
            // }
            return;
          }
          resolve([true]);
        })
      });
    },
    // 售后单保存(提交)
    saveSubmit (value, type) {
      return new Promise((resolve) => {
        if (this.loading1) return resolve({ state: 'loding' });
        this.saveValid().then((valid) => {
          if (valid[0]) {
            let apiType = 'post';
            if (this.editType != 'add' && !type) {
              apiType = 'put';
            }
            let params = this.setParams();
            params.approveStatus = value; // 0 提交 1提交审批
            this.loading1 = true;
            // post 方式时 approveStatus 为 0 时新增, 为1时新增并提交审批
            // put 方式时 approveStatus 为 0 时更新, 为1时提交审批
            this.axios[apiType](api.update_afterSales, params).then(res => {
              if (res.data.code === 0) {
                this.$emit('saveSuccess');
                this.$Message.success('操作成功');
              } else {
                this.$Message.error('操作失败，请重新尝试');
              }
              this.loading1 = false;
            }).catch(() => {
              this.loading1 = false;
              resolve({ state: 'fail' });
            });
          } else {
            this.loading1 = false;
            this.$Message.error(valid[1]);
            resolve({ state: 'fail' });
          }
        });
      })
    },
    // 新增售后单
    orderSave (isNext, value) {
      return new Promise((resolve) => {
        if (this.loading1) return resolve({ state: 'loding' });
        this.saveValid().then((valid) => {
          if (valid[0]) {
            let params = this.setParams();
            this.loading1 = true;
            if (!this.$common.isEmpty(value)) {
              params.approveStatus = value; // 0为新增，1 为新增并提交审批
            }
            this.axios.post(api.post_orderAfterSales, params).then(res => {
              if (res.data.code === 0) {
                if (!isNext) {
                  this.$emit('saveSuccess');
                  this.$Message.success('操作成功');
                }
                resolve({ state: 'success' });
              } else {
                if (!isNext) {
                  this.$Message.error('操作失败，请重新尝试');
                }
                resolve({ state: 'fail' });
              }
              this.loading1 = false;
            }).catch(() => {
              this.loading1 = false;
              resolve({ state: 'fail' });
            });
          } else {
            this.$Message.error(valid[1]);
            resolve({ state: 'fail' });
          }
        });
      })
    },
    // 新增售后单并提交
    saveAndSubmit () {
      this.orderSave(false, '1');
    },
    resetReplenishmentGoodsAdd () {
      this.tableData4 = [];
      this.tableData4 = JSON.parse(JSON.stringify(this.tableData3));
    },
    resetReplenishmentGoodsAddP () {
      this.tableData4 = [];
      this.tableData4 = JSON.parse(JSON.stringify(this.tableData));
    },
    resetBackGoodsAdd () {
      this.tableData3 = [];
      this.tableData3 = JSON.parse(JSON.stringify(this.tableData));
    },
    openProductFn (type) {
      this.addProductType = type; // '1' => 退货   '2' => 补发货
      if (type === '1') {
        this.choseData = JSON.parse(JSON.stringify(this.tableData3));
      } else if (type === '2') {
        this.choseData = JSON.parse(JSON.stringify(this.tableData4));
      }
      this.$refs.matchingGoodsModal.matchingGoodsStatus = true;
      this.$refs.matchingGoodsModal.matchingGoodsModal = true;
    },
    addProductSave (data) {
      let v = this;
      v.addProductValue = data;
      v.$refs.matchingGoodsModal.matchingGoodsModal = false;
      let sku = data.map(i => i.sku);
      let hasSku = false;
      hasSku = v.tableData.some(i => {
        if (sku.indexOf(i.sku) < 0) {
          return true;
        }
      });
      if (v.addProductType === '1') {
        if (hasSku) {
          // 货品错发风险警告
          // 您添加的货品在原订单中不存在。
          v.$Modal.confirm({
            title: '货品错发风险警告',
            content: '您添加的货品在原订单中不存在',
            onOk () {
              v.tableData3 = data;
            }
          });
        } else {
          v.tableData3 = data;
        }
      } else if (v.addProductType === '2') {
        if (hasSku) {
          // 货品错发风险警告
          // 您添加的货品在原订单中不存在。
          v.$Modal.confirm({
            title: '货品错发风险警告',
            content: '您添加的货品在原订单中不存在',
            onOk () {
              v.tableData4 = data;
            }
          });
        } else {
          v.tableData4 = data;
        }
      }
    },
    addReasonModal () {
      this.$Modal.confirm({
        title: '新增原因',
        render: (h) => {
          return h('Input', {
            props: {
              value: this.value,
              autofocus: true,
              placeholder: '新增原因'
            },
            on: {
              input: (val) => {
                this.value = val;
              }
            },
            onOk () {

            }
          });
        }
      });
    },
    addReason () {
      let v = this;
      let value = '';
      this.$Modal.confirm({
        title: '添加原因',
        onOk () {
          v.axios.post(api.add_reason + '?paramValue=' + value).then(res => {
            if (res.data.code === 0) {
              v.$Message.success('添加成功');
              v.getQueryReason();
            }
          });
        },
        render: (h) => {
          return h('Input', {
            props: {
              value: value,
              autofocus: true
            },
            on: {
              input: (val) => {
                value = val;
              }
            }
          });
        }
      });
    },
    getReasonList () {
      // 获取售后原因列表
      this.axios.get(api.get_afterSalesOrderReason).then(res => {
        if (res.data.code === 0) {
          this.reasonListT = res.data.datas || [];
        }
      });
    },
    getQueryReason () {
      this.axios.get(api.get_queryReason).then(res => {
        if (res.data.code === 0) {
          this.reasonListT = res.data.datas;
        }
      });
    },
    getOrderDetail (id) {
      let v = this;
      let apiUrl = api.get_queryOrder + '?orderNo=' + v.orderInNo;
      if (v.source === 'order') {
        apiUrl = api.get_lqueryOrderAfterSalesById + id;
      } else {
        if (!v.orderInNo) return;
      }
      v.axios.get(apiUrl)
        .then(res => {
          if (res.data.code === 0) {
            let orderInfo = res.data.datas.orderInfo;
            v.orderName = orderInfo.accountCode + '-' + orderInfo.salesRecordNumber;
            v.orderAddress = orderInfo.buyerCountryCode;
            v.totalPriceCurrency = orderInfo.totalPriceCurrency;
            v.isPay = orderInfo.payTime;
            v.isDelivery = orderInfo.isDelivery;
            v.afterSalesParams.orderId = orderInfo.orderId;
            v.$emit('searchOrderCallback', orderInfo);
            v.pageOrderNo = null;
            if (orderInfo.orderPayments && orderInfo.orderPayments.length) {
              v.paymentMethodName = orderInfo.orderPayments[0].paymentMethodName;
            } else {
              v.paymentMethodName = null;
            }
            orderInfo.orderTransactions.forEach(i => {
              if (i.businessId === null) {
                i.productName = '商品未知';
              }
              i.number1 = i.quantity;
            });
            orderInfo.orderTransactions.forEach(i => {
              i.quantity = 0;
            });

            v.tableData = [];
            res.data.datas.packageGoods.forEach(i => {
              i.packageGoodsList.forEach(j => {
                j.number1 = j.quantity;
                j.quantity = 0;
                v.tableData.push({
                  packageCode: i.packageCode, ...j
                });
              });
            });
            v.tableData3 = JSON.parse(JSON.stringify(v.tableData));
            v.tableData4 = JSON.parse(JSON.stringify(v.tableData));
            res.data.datas.refund.maxPrice = Number((res.data.datas.refund.transactionPrice - res.data.datas.refund.refundPrice).toFixed(2));
            v.tableData2 = [res.data.datas.refund];
            if (orderInfo.orderTransactions.businessId === null) {
              // 没有匹配到商品 不能退换和补发货
              v.isDelivery = false;
              v.tableData3 = []; // 退货
              v.tableData4 = []; // 补发货
            }
          }
        });
    },
    reset () {
      const outIncludes = ['approveStatus', 'isRedelivery', 'isRefund', 'isReturn', 'refundAmount', 'reDeliveryGoods', 'returnGoods', 'wastageGoodsBoList'];
      for (let key in this.afterSalesParams) {
        if (!outIncludes.includes(key)) {
          this.afterSalesParams[key] = '';
        }
      }
      this.afterSalesParams.approveStatus = 0;
      this.afterSalesParams.isRedelivery = 0;
      this.afterSalesParams.isRefund = 0;
      this.afterSalesParams.isReturn = 0;
      this.afterSalesParams.refundAmount = null;
      this.afterSalesParams.reDeliveryGoods = [];
      this.afterSalesParams.returnGoods = [];
      this.afterSalesParams.wastageGoodsBoList = [];
    }
  },
  created () {
    this.getCountrys();
    this.getAllstore(0);
    this.getReasonList();
  },
  watch: {
    'open' (newValue) {
      if (newValue) {
        if (this.editType === 'add') {
          // this.reset();
          this.fillInSt = false; // 填入原发货跟踪号
          this.orderName = '';
          this.orderAddress = '';
          this.tableData = [];
          this.checkAllGroup = [];
        }
      }
    },
    moalVisible (val) {
      if (val) return;
      this.reset();
      this.orderInNo = '';
      this.fillInSt = false; // 填入原发货跟踪号
      this.orderName = '';
      this.orderAddress = '';
      this.tableData = [];
      this.checkAllGroup = [];
      this.isPay = 0;
      this.$nextTick(() => {
        this.$refs.remarkForm && this.$refs.remarkForm.resetFields();
      })
    },
    // 当选中值改变时
    checkAllGroup: {
      immediate: true,
      handler (val) {
        if (this.$common.isEmpty(val)) {
          this.$set(this.afterSalesParams, 'reasonForRefund', '');
          return;
        }
        if ((val.includes('0') || val.includes(0)) && this.$common.isEmpty(this.afterSalesParams.reasonForRefund)) {
          this.$set(this.afterSalesParams, 'reasonForRefund', 'OTHER_ADJUSTMENT');
        }
      }
    },
    orderNo: {
      deep: true,
      immediate: true,
      handler (val) {
        this.pageOrderNo = val;
      }
    },
    pageOrderNo: {
      deep: true,
      handler (val) {
        if (val !== this.orderNo) {
          this.$emit('update:orderNo', val);
        }
      }
    },
    postDetail (newValue, oldValue) {
      // 数据详情
      let v = this;
      v.checkAllGroup = [];
      if (newValue && newValue.orderInfo) {
        if (newValue.orderInfo.orderInfo && newValue.orderInfo.orderInfo.orderPayments) {
          v.paymentMethodName = newValue.orderInfo.orderInfo.orderPayments[0].paymentMethodName;
        }
        this.afterSalesParams = newValue.afterSales;
        let arr = newValue.afterSales.afterSalesType.split('');
        v.orderName = newValue.orderInfo.orderInfo.accountCode + '-' + newValue.orderInfo.orderInfo.salesRecordNumber;
        v.orderAddress = newValue.orderInfo.orderInfo.buyerCountryCode;
        if (arr[0] === '1') {
          v.checkAllGroup.push('0');
        }
        if (arr[1] === '1') {
          v.checkAllGroup.push('1');
        }
        if (arr[2] === '1') {
          v.checkAllGroup.push('2');
        }
        this.tableData3 = newValue.customerReturnDetailList;
        this.tableData4 = newValue.redeliverDetailList;
        newValue.orderInfo.refund.maxPrice = Number((newValue.orderInfo.refund.transactionPrice - newValue.orderInfo.refund.refundPrice).toFixed(2));
        this.tableData2 = [newValue.orderInfo.refund];
        v.isPay = newValue.orderInfo.orderInfo.payTime;
        newValue.orderInfo.orderInfo.orderTransactions.forEach(i => {
          i.number1 = i.quantity;
          if (i.businessId === null) {
            i.productName = '商品未知';
          }
          i.quantity = 0;
        });

        let packageGoods = [];
        (newValue.orderInfo.packageGoods || []).forEach(i => {
          i.packageGoodsList.forEach(j => {
            j.number1 = j.quantity;
            packageGoods.push({
              packageCode: i.packageCode, ...j
            });
          });
        });

        // packageGoods.forEach(i => {
        //   newValue.wastageGoods.forEach(j => {
        //     if (i.packageCode === j.packageCode && i.sku === j.sku) {
        //       i.quantity = j.quantity;
        //     }
        //   });
        // });
        let wastageObj = {};
        if (newValue.wastageGoods) {
          newValue.wastageGoods.forEach(wg => {
            wastageObj[wg.sku] = wg;
          });
        }
        packageGoods.forEach(i => {
          i.quantity = (wastageObj[i.sku] && wastageObj[i.sku].packageCode === i.packageCode) ? wastageObj[i.sku].quantity || 0 : 0;
        });
        this.tableData = packageGoods;
        this.getAllstore(0).then(() => {
          this.showShippingDataApi(true);
          this.loadDataApi({ value: newValue.afterSales.carrierId }, () => {
            this.$nextTick(() => {
              this.value2 = [newValue.afterSales.carrierId, newValue.afterSales.shippingMethodId];
            });
          });
        });

        /* this.$nextTick(() => {
         this.value2 = ['255814288684613632', '256195286798696448'];
         }); */
      }
    }
  },
  computed: {
    isDelieryDetails () {
      if (this.$store.state.orderDetails && this.$store.state.orderDetails.orderShippingInfoList) {
        return this.$store.state.orderDetails.orderShippingInfoList.some(i => i.packageStatus === 7);
      } else {
        return false;
      }
    },
    privateWarehouse () {
      return this.allStorelist.filter(i => i.warehouseType === '0');
    },
    hasEdit () {
      return this.editType === 'add' || this.editType === 'edit';
    }
  },
  mounted () {

  },
  destroyed: function () {

  }
};
</script>
<style >
.chosePostCheck {
  display: inline-block;
  padding-left: 100px;
  font-size: 14px;
}

.chosePostCheck .ivu-checkbox-wrapper {
  font-size: 18px;
}
</style>

<style scoped>
.post-cont-header{
  position: sticky;
  top: 0;
  z-index: 10;
}
.post-header {
  /* position: fixed;
  top: 0; */
  height: 68px;
  z-index: 10;
  padding: 16px;
  background-color: #f5f5f5;
  /* border-top-right-radius: 30px;
  border-bottom-left-radius: 30px; */
}

.wid80a {
  width: 80% !important;
}

.mr10 {
  margin-right: 10px;
}

.plr16 {
  padding: 0 16px;
}

.box0 {
  border: 1px solid #93c9da;
  background-color: #fff;
  margin-top: 20px;
}

.wid200 {
  width: 200px;
}

.mb10 {
  margin-bottom: 10px;
}

.post-sale-step {
  padding: 0 10px 10px 10px;
}

.pt10i {
  padding-top: 10px !important;
}

.padding-10 {
  padding: 10px;
}
</style >
