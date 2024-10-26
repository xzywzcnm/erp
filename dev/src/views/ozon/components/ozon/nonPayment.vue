<template>
  <div>
    <div class="messageToBeProcessedFilter">
      <div class="card-container">
        <div class="card-content">
          <div class="platformParamsSelect">
            <Form ref="pageParams" :model="pageParams" :label-width="labelWidth">
              <dyt-filter>
                <Form-item label="店铺" prop="saleAccountIds">
                  <dytStoreSelect
                    v-model="pageParams.saleAccountIds"
                    :option-data="shopList"
                    :replace-option-key="{ value: 'saleAccountId', label: 'accountCode' }"
                    placeholder="请选择店铺，可输入搜索"
                    input-placeholder="请输入店铺，多个店铺可用逗号或换行隔开"
                  />
                </Form-item>
                <Form-item label="标签" prop="tagIdList">
                  <dyt-Select
                    v-model="pageParams.tagIdList"
                    @on-change="tagChange"
                    :max-tag-count="1"
                    multiple
                    placeholder="请选择或搜索标签"><Option
                    v-for="item in tagsList"
                    :key="item.tagId"
                    :value="item.tagId"
                    :v="item.tagId">{{ item.tagName }}</Option></dyt-Select>
                </Form-item>
                <Form-item label="国家/地区" prop="buyerCountryCodeList" style="width: 400px;">
                  <dyt-Select
                    v-model="pageParams.buyerCountryCodeList"
                    @on-change="countryChange"
                    :max-tag-count="1"
                    multiple
                    placeholder="请选择或输入所在地"><Option
                    v-for="(item,index) in formValidate.country"
                    :key="index"
                    :value="item.twoCode">{{ item.enName }}</Option></dyt-Select>
                </Form-item>
                <Form-item label="下单日期">
                  <Date-picker
                    transfer
                    type="datetimerange"
                    style="width:100%"
                    @on-clear="resetDate"
                    @on-change="getDateValue"
                    :clearable="clearAble"
                    :options="dateOptions"
                    format="yyyy-MM-dd HH:mm:ss"
                    placement="bottom-end"
                    placeholder="选择日期"
                    :value="payTimeArr"></Date-picker>
                </Form-item>
                <Form-item label="平台产品编码" prop="webstoreItemId">
                  <dyt-input placeholder="请输入平台产品编码" v-model.trim="pageParams.webstoreItemId"></dyt-input>
                </Form-item>
                <Form-item label="SKU" prop="webstoreSku">
                  <dyt-input-tag type="textarea" placeholder="请输入SKU, 多个请用逗号隔开" :limit="1" :string="true" v-model="pageParams.webstoreSku" />
                </Form-item>
                <Form-item label="搜索字符" prop="searchValue">
                  <dyt-input
                    class="filterSearch"
                    placeholder="可输入订单号、买家ID、买家姓名、SKU、平台产品编码"
                    v-model.trim="pageParams.searchValue"></dyt-input>
                </Form-item>
                <div slot="operation">
                  <Button
                    v-if="isAdmin || controlList.orderInfo_queryForNonPayment"
                    type="primary"
                    @click="search"
                    :disabled="SearchDisabled"
                    icon="md-search">查询 </Button>
                  <Button @click="reset" style="margin-left: 10px;" v-once icon="md-refresh">重置 </Button>
                </div>
              </dyt-filter>
            </Form>
          </div>
        </div>
      </div>
    </div>

    <div class="tableControl" style="display: flex;">
      <div style="flex: 100;">
        <Button
          type="primary" @click="setMarkPay('all')" v-if="getPermission('orderInfo_markOrderPayment_batch')">
          <Icon type="cash"></Icon>
          批量标记为已付款
        </Button>
        <Buttons
          type="primary"
          style="margin-left: 10px"
          trigger="click"
          @on-click="cancelDeliveryHasCondition"
          :disabled="!getPermission('orderInfo_cancelOrderForNonPayment_batch')">
          <Button
            type="primary"
            class="iconbuttons"
            @click="cancelDelivery"
            :disabled="!getPermission('orderInfo_cancelOrderForNonPayment_batch')">
            <span class="icon iconfont">&#xe67e;</span> 取消订单 </Button>
          <Buttons-menu slot="list">
            <Buttons-item
              name="1" :disabled="!getPermission('orderInfo_cancelOrderForNonPayment_all')">取消订单（所有结果集）
            </Buttons-item>
          </Buttons-menu>
        </Buttons>
        <Dropdown
          class="tcDropDown" v-if="getPermission('orderTag_insert_batch') || getPermission('orderTag_clear')">
          <Poptip
            v-model="setTagListStatus" placement="bottom" :transfer="true">
            <Button icon="md-pricetag">
              打标签
              <Icon type="md-arrow-dropdown"/>
            </Button>
            <div slot="content">
              <order-label-tag v-model="tagIdList" :tags-list="tagsList"/>
              <div class="tagsSelectFooter">
                <Button
                  size="small" @click="setTag" :disabled="!getPermission('orderTag_insert_batch')">打标签 </Button>
                <Button
                  size="small" @click="dropOrderTag" :disabled="!getPermission('orderTag_clear')">清空标签 </Button>
              </div>
            </div>
          </Poptip>
        </Dropdown>
      </div>
      <div class="dataSort grayBg" style="display: inline-block;background: none;border: none;padding: 0;margin: 0;">
        <span>排序：</span>
        <Button-group>
          <template v-for="(item,index) in buttonGroupModel">
            <Button
              v-if="item.selected" :disabled="SearchDisabled" type="primary" @click="modifyTheSort(index,item.status)" :key="index">
              {{ item.title }}
              <Icon
                type="md-arrow-round-up" v-if="item.status && item.selected"></Icon>
              <Icon
                type="md-arrow-round-down" v-if="!item.status && item.selected"></Icon>
            </Button>
            <Button
              v-if="!item.selected" :disabled="SearchDisabled" @click="modifyTheSort(index,item.status)" :key="index">
              {{ item.title }}
              <Icon
                type="md-arrow-round-up" v-if="item.status && item.selected"></Icon>
              <Icon
                type="md-arrow-round-down" v-if="!item.status && item.selected"></Icon>
            </Button>
          </template>
        </Button-group>
      </div>
    </div>
    <div
      class="orderTable normalTop" v-if="getPermission('orderInfo_queryForNonPayment')">
      <keep-alive>
        <Table
          highlight-row
          border
          :height="tableHeight"
          :loading="tableLoading"
          :columns="orderColumn"
          :data="orderData"
          @on-selection-change="getSelectValue"></Table>
      </keep-alive>
      <div class="table-page flexBox">
        <keep-alive>
          <Page
            :total="total"
            @on-change="changePage"
            show-total
            :page-size="pageParams.pageSize"
            show-elevator
            :current="curPage"
            show-sizer
            @on-page-size-change="changePageSize"
            placement="top"
            :page-size-opts="pageArray"></Page>
        </keep-alive>
      </div>
    </div>
    <keep-alive>
      <Modal
        v-model="productModal" :mask-closable="false" v-if="productStatus" :width="600">
        <div class="orderDetailsProductItem">
          <Row
            v-for="(item,index) in productDetails" :key="index" class="normalTop">
            <Col :span="2">
              <div class="orderDetailsProductItemPic">
                <img
                  :src="item.pictureUrl" :alt="item.title">
              </div>
            </Col>
            <Col
              :span="17" :offset="1">
              <div class="odpidProductID">
                <span class="productID">{{ item.webstoreItemId }}</span>
                <span class="productHaveATitle">SKU: <em>{{ item.webstoreSku }}</em></span> <span
                class="productHaveATitle" v-if="inGroup ==='ebay'">物品所在地: <em>{{ item.location }}</em></span>
                <span class="productLogsticService">物流服务：<em>{{ item.buyerShippingMethod }}</em></span>
              </div>
              <div class="odpidProductDetails">
                {{ item.title }}
              </div>
              <div
                class="odpidProductParams" v-if="item.variations !== null">
                <span
                  class="productHaveATitle"
                  v-if="item.variations.indexOf('color') >=0 && item.variations.indexOf(';')  >0 ">Color:<em>{{ item.variations.split(': ')[1].split(';')[0] }} </em></span>
                <span
                  class="productHaveATitle"
                  v-if="item.variations.indexOf('color') >=0 && item.variations.indexOf(';')  < 0 ">Color:<em>{{ item.variations.split(': ')[1] }} </em></span>
                <span
                  class="productHaveATitle"
                  v-if="item.variations.toLowerCase().indexOf('pack of') >=0">Pack of:<em>{{ item.variations.split(';')[1].split(': ')[1] }}</em></span>
              </div>
            </Col>
            <Col
              :span="2" :offset="2">
              X {{ item.quantity }}
            </Col>
          </Row>
        </div>
        <div slot="footer">
          <Button @click="closeModal">关闭</Button>
        </div>
      </Modal>
    </keep-alive>
    <!-- 标记为已付款 -->
    <keep-alive>
      <Modal
        v-model="setPayModel.status" :mask-closable="false" v-if="setPayStatus" @on-ok="setMarkPayment">
        <div class="ivu-modal-confirm">
          <div class="ivu-modal-confirm-head">
            <div class="ivu-modal-confirm-head-title">{{ setPayModel.title }}</div>
          </div>
          <div class="ivu-modal-confirm-body ivu-modal-confirm-body-render">
            <div class="normalTop">
              <Row>
                <Col :span="1">
                  <Icon
                    type="md-information-circle" color="#2b85e4" size="44"></Icon>
                </Col>
                <Col
                  :span="21" :offset="2">
                  <p>标记为已付款，订单将会继续正常订单的流程，最终到发货。</p>
                </Col>
              </Row>
              <Form
                ref="setMarkModel" :model="setMarkModel" :label-width="100" class="noramlTop setAllMarkRead">
                <Form-item
                  label="付款方式" prop="paymentMethodName">
                  <dyt-input
                    v-model.trim="setMarkModel.paymentMethodName" value=""></dyt-input>
                </Form-item>
                <Row>
                  <Col :span="12">
                    <Form-item
                      label="付款方交易号" v-if="setPayModel.type !== 'all'" prop="webstoreTransactionId">
                      <dyt-input
                        v-model.trim="setMarkModel.webstoreTransactionId" value=""></dyt-input>
                    </Form-item>
                  </Col>
                  <Col
                    :span="setPayModel.type !== 'all' ? 12 : 10" offset="setPayModel.type !== 'all' ? 0 : 2">
                    <Form-item
                      label="成交费比例：" prop="transactionPriceRatio">
                      <InputNumber
                        :min="0"
                        v-model="setMarkModel.transactionPriceRatio"
                        :formatter="value => `${value}%`"
                        :parser="value => value.replace('%', '')"></InputNumber>
                    </Form-item>
                  </Col>
                </Row>
                <Form-item
                  label="备注" prop="paymentNote">
                  <dyt-input
                    v-model.trim="setMarkModel.paymentNote" :rows="setPayModel.num" value=""></dyt-input>
                </Form-item>
              </Form>
            </div>
          </div>
        </div>
      </Modal>
    </keep-alive>
    <!-- 取消订单 -->
    <keep-alive>
      <Modal
        v-model="cancelDeliveryModel.status"
        :mask-closable="false"
        v-if="cancelDeliveryStatus"
        @on-ok="setCancelDelivery">
        <div class="ivu-modal-confirm">
          <div class="ivu-modal-confirm-head">
            <div class="ivu-modal-confirm-head-title">{{ cancelDeliveryModel.title }}</div>
          </div>
          <div class="ivu-modal-confirm-body ivu-modal-confirm-body-render">
            <div class="normalTop">
              <Row>
                <Col :span="1">
                  <Icon
                    type="md-information-circle" color="#2b85e4" size="44"></Icon>
                </Col>
                <Col :span="21" :offset="2">
                  <p>{{`批量取消订单系统将自动调用${$store.state.inGroup||''}接口取消订单，并同时给买家退款。`}}</p>
                </Col>
              </Row>
              <Form ref="cancelOrderForm" :label-width="100" :rules="formRule" :model="cancelDeliveryModel" class="noramlTop setAllMarkRead">
                <Form-item label="类型" prop="cancelType">
                  <dyt-Select
                    style="width: 85%" v-model="cancelDeliveryModel.cancelType" @on-change="changeCancelType">
                    <Option
                      v-for="item in cancelTypeList" :key="item.value" :value="item.value">{{ item.label }}</Option>
                  </dyt-Select>
                  <Tooltip
                    content="作废订单只在LAPA系统内作废，而取消订单在作废的同时，还会去平台取消订单" placement="top">
                    <Icon
                      class="ml10" size="22" type="md-help-circle"/>
                  </Tooltip>
                </Form-item>
                <Form-item label="原因" v-if="cancelDeliveryModel.cancelType === 2" prop="cancelReason">
                  <dyt-Select
                    v-model="cancelDeliveryModel.cancelReason"
                    value="ADDRESS_ISSUE"
                  >
                    <Option value="ADDRESS_ISSUES">ADDRESS_ISSUES</Option>
                    <Option value="BUYER_ASKED_CANCEL">BUYER_ASKED_CANCEL</Option>
                    <Option value="ORDER_UNPAID">ORDER_UNPAID</Option>
                    <Option value="OUT_OF_STOCK_OR_CANNOT_FULFILL">OUT_OF_STOCK_OR_CANNOT_FULFILL</Option></dyt-Select>
                </Form-item>
                <Form-item label="LAPA作废原因:" prop="invalidReason">
                  <!-- <dyt-input v-model="cancelDeliveryModel.invalidReason" type="textarea" :rows="4" placeholder="" /> -->
                  <dyt-select v-model="cancelDeliveryModel.invalidReason">
                    <Option v-for="(item, index) in reasonListT" :key="index" :value="item.paramKey" :label="item.paramKey" />
                  </dyt-select>
                </Form-item>
              </Form>
            </div>
          </div>
        </div>
      </Modal>
    </keep-alive>
    <keep-alive>
      <sliderModal
        v-model="orderDetails" :spinShow="spinShow" :styles="{}" class="slider-model" v-if="orderDetailsBegin">
        <orderDetails
          :orderDetailsId="orderDetailsId"
          @reloadTag="reloadTag"
          :orderNo="orderNo"
          :timestamp="timestamp"
          inPage="nonPayment"
          @spinLoading="spinLoading"
          @resetSpinShow="resetSpinShow"
          @updateList="getList"
          :orderTagList="orderTagList"
          :webstoreItemSite="webstoreItemSite"
          :moal-visible.sync="orderDetails"
        />
      </sliderModal>
    </keep-alive>
  </div>
</template>
<script>
import api from '@/api/api';
import orderDetails from "@/views/commonOrder/components/commonOrder/orderDetails";
import Mixin from '@/components/mixin/common_mixin';
import orderSys from '@/components/mixin/orderSys_mixin';

export default {
  mixins: [Mixin, orderSys],
  components: {
    orderDetails
  },
  data () {
    var self = this;
    return {
      cancelTypeList: [
        {
          value: 1,
          label: '作废订单'
        }, {
          value: 2,
          label: '取消订单'
        }
      ],
      buttonGroupModel: [
        {
          type: 'salesTime',
          selected: true,
          status: true, // true up false down
          title: '按下单时间'
        }
      ],
      setPayModel: {
        status: false,
        title: '',
        type: '',
        num: 3
      },
      setPayStatus: false,
      cancelDeliveryModel: {
        cancelType: 2, // 1 作废订单 2 取消订单
        status: false,
        cancelReason: 'BUYER_CANCEL_OR_ADDRESS_ISSUE',
        invalidReason: '',
        title: '',
        type: ''
      },
      formRule: {
        invalidReason: [
          { required: true, message: '请选择LAPA作废原因', trigger: 'change' }
        ],
        cancelReason: [
          { required: true, message: '请选择取消原因', trigger: 'change' }
        ]
      },
      cancelDeliveryStatus: false,
      mtbStatus: true,
      orderDetails: false,
      orderDetailsBegin: false,
      orderDetailsId: null,
      orderNo: null,
      timestamp: null,
      orderTagList: null,
      webstoreItemSite: null,
      payTimeArr: [],
      markCountryModal: [],
      shopListModal: [],
      markTagsModal: [],
      pageParamsStatus: false, // 每次更新完pageParms都要设置成true触发刷新
      totalPage: 0,
      total: 0,
      curPage: 1,
      pageParams: {
        pageNum: 1,
        pageSize: 50,
        tagIdList: [],
        platformId: [this.inGroup],
        buyerCountryCodeList: [],
        searchValue: null,
        salesStartTime: null,
        salesEndTime: null,
        saleAccountIds: [],
        orderBy: 'salesTime',
        upDown: 'up',
        webstoreSku: null,
        webstoreItemId: null
      },
      orderData: [],
      orderIdList: [],
      orderColumn: [
        {
          type: 'selection',
          width: 60,
          fixed: 'left',
          align: 'center'
        }, {
          title: '订单号',
          key: 'salesRecordNumber',
          fixed: 'left',
          width: 200,
          align: 'center',
          render: (h, params) => {
            return h('div', {
              style: {
                color: self.getPermission('orderInfo_detail') ? '#0054A6' : '#515a6e',
                cursor: 'pointer'
              },
              on: {
                click: () => {
                  if (self.getPermission('orderInfo_detail')) {
                    self.show(params.row.orderId);
                    self.orderNo = params.row.accountCode + '-' + params.row.salesRecordNumber;
                    self.orderTagList = params.row.orderTagList;
                    self.webstoreItemSite = params.row.webstoreItemSite;
                  }
                }
              }
            }, params.row.accountCode + '-' + params.row.salesRecordNumber);
          }
        }, {
          title: '站点',
          key: 'packageCode',
          width: 80,
          align: 'center',
          render: (h, params) => {
            if (params.row.webstoreItemSite !== null) {
              return h('div', {
                attrs: {
                  class: 'nationalFlag nationalFlag' + params.row.webstoreItemSite,
                  title: params.row.webstoreItemSite
                }
              });
            } else {
              return h('div', '');
            }
          }
        }, {
          title: '产品',
          key: 'productList',
          align: 'center',
          resizable: true,
          width: 200,
          render: (h, params) => {
            let data = params.row.productList;
            let pos = [];
            data.forEach((n, i) => {
              let item = self.tableImg(h, params, '', n.pictureUrl, () => {
                self.showPicModal(data);
              });
              if (i < 3) {
                pos.push(item);
                if (i === 2) {
                  pos.push(h('span', {
                    style: {
                      marginLeft: '5px'
                    }
                  }, '...'));
                }
              }
            });
            return h('div', pos);
          }
        }, {
          title: '买家ID/姓名',
          key: 'buyerName',
          align: 'center',
          width: 220,
          render: (h, params) => {
            return h('div', [
              h('div', {
                style: {
                  color: '#0054A6'
                }
              }, params.row.buyerAccountId), h('div', {
                style: {
                  color: '#ff3300'
                }
              }, params.row.buyerName)
            ]);
          }
        }, {
          title: '国家/地区',
          key: 'buyerCountryCodeList',
          align: 'center',
          width: 110
        }, {
          title: '金额',
          key: 'totalPrice',
          width: 120,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('span', params.row.totalPrice),
              params.row.totalPriceCurrency && h('span', '(' + params.row.totalPriceCurrency + ')')
            ]);
          }
        }, {
          title: '下单时间',
          key: 'salesTime',
          align: 'center',
          width: 160
        }, {
          title: '标签',
          key: 'tags',
          align: 'center',
          minWidth: 130,
          render: (h, params) => {
            let orderTagList = params.row.orderTagList || [];
            let pos = [];
            orderTagList.forEach((n, i) => {
              let item = h('div', [
                h('Icon', {
                  props: {
                    type: 'pricetag',
                    color: '#f00'
                  },
                  style: {
                    marginRight: '5px'
                  }
                }), h('span', n.tagName)
              ]);
              pos.push(item);
            });
            return h('div', pos);
          }
        }, {
          title: '操作',
          key: 'operate',
          fixed: 'right',
          align: 'center',
          width: 220,
          render: (h, params) => {
            return h('div', [
              !self.getPermission('orderInfo_markOrderPayment_single') || h('Button', {
                props: {
                  size: 'small'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    self.setMarkPay('single', params.row.orderId);
                  }
                }
              }, '标记为已付款'), !self.getPermission('orderInfo_detail') || h('Button', {
                props: {
                  size: 'small'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    self.show(params.row.orderId);
                    self.orderNo = params.row.accountCode + '-' + params.row.salesRecordNumber;
                    self.orderTagList = params.row.orderTagList;
                    self.webstoreItemSite = params.row.webstoreItemSite;
                  }
                }
              }, '订单详情')
            ]);
          }
        }
      ],
      setTagListStatus: false,
      clearAble: true,
      resetStatus: true,
      productStatus: false, // 点击产品列表详情状态控制
      productModal: false,
      productDetails: '', // modal产品数据
      setMarkModel: {
        orderIdList: [],
        webstoreTransactionId: '',
        paymentMethodName: '',
        paymentNote: '',
        transactionPriceRatio: 0
      },
      reasonListT: [],
      singelSetMarkId: null // 单个标记已付款ID
    };
  },
  watch: {
    pageParamsStatus (n) {
      let v = this;
      if (n) {
        v.getList();
        v.pageParamsStatus = false;
      }
    }
  },
  computed: {
    tableHeight () {
      return this.getTableHeight(280);
    }
  },
  methods: {
    getReasonList () {
      // 获取售后原因列表
      this.axios.get(api.get_afterSalesOrderReason).then(res => {
        if (res.data.code === 0) {
          this.reasonListT = res.data.datas || [];
        }
      });
    },
    changeCancelType () {
      if (this.cancelDeliveryModel.cancelType === 1) {
        this.cancelDeliveryModel.cancelReason = '';
      }
    },
    startLoading () {
      var v = this;
      v.$Loading.start();
      Promise.resolve(// v.controlList.orderInfo_queryForNonPayment ? v.getList() : v.gotoError()
        v.getPermission('orderInfo_queryForNonPayment') ? v.getList() : v.gotoError()).then(function () {
        v.$Loading.finish();
        v.getShopList();
        v.getOrderListTag(); // 获取标签列表
      });
    },
    getList () {
      var v = this;
      v.loadingTrue();
      v.axios.post(api.get_nonPaymentList, JSON.stringify(v.pageParams)).then(response => {
        if (response.data.code === 0) {
          let pos = [];
          let saleAccountIdPos = [];
          let orderIdPos = [];
          let data = response.data.datas;
          if (data.list !== null) {
            data.list.forEach((n, i) => {
              pos.push({
                salesRecordNumber: n.salesRecordNumber,
                webstoreItemSite: n.webstoreItemSite,
                orderNotes: n.orderNotes,
                productList: [],
                buyerName: n.buyerName,
                buyerAccountId: n.buyerAccountId,
                buyerCountryCodeList: n.buyerCountryCode,
                totalPrice: n.totalPrice,
                salesTime: v.getDataToLocalTime(n.salesTime, 'fulltime'),
                platformId: n.platformId,
                totalPriceCurrency: n.totalPriceCurrency,
                orderId: n.orderId,
                accountCode: '',
                orderTagList: n.orderTags,
                saleAccountId: n.saleAccountId
              });
              saleAccountIdPos.push(n.saleAccountId);
              orderIdPos.push(n.orderId);
            });
            if (saleAccountIdPos.length > 0) { // 匹配订单号
              async function getData () {
                try {
                  const Arr = await v.getAccountCode(pos, saleAccountIdPos);
                  const newArr = await v.getProductList(Arr, orderIdPos);
                  v.orderData = newArr;
                } catch (e) {
                  console.error(e)
                  v.$Message.error('匹配订单号查询失败')
                }
                v.loadingFalse();
              }
              getData();
            }
            v.$nextTick(function () {
              v.total = Number(data.total);
              v.totalPage = Number(data.pages);
            });
          } else {
            v.orderData = [];
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
      var v = this;
      v.resetDate();
      v.$refs['pageParams'].resetFields();
      v.payTimeArr = [];
    },
    show (params) {
      let v = this;
      v.orderDetailsBegin = true;
      v.orderDetailsId = params;
      let date = new Date().getTime();
      v.$nextTick(function () {
        v.orderDetails = true;
        v.timestamp = date;
      });
    },
    getPlatformData (index, id) {
      let v = this;
      v.pageParams.platformId = id;
      v.pageParamsStatus = true;// 更新数据
      v.curPage = 1;
      v.pageParams.pageNum = 1;
      v.plateformGroup.forEach((n, i) => {
        if (i === index) {
          n.selected = true;
        } else {
          n.selected = false;
        }
      });
    },
    tagChange (value) {
      let v = this;
      if (value.indexOf('null') >= 0) {
        v.pageParams.tagIdList = null;
      } else {
        v.pageParams.tagIdList = value;
      }
    },
    setMarkPay (type, id) { // 标记为已付款,type all 批量
      let v = this;
      v.setPayStatus = true;
      if (type !== 'single' && (v.orderIdList.length === 0 || v.orderIdList === null)) {
        v.$Message.error('请选择订单');
        return false;
      }
      v.$nextTick(function () {
        if (type === 'all') {
          v.setPayModel.title = '批量标记为已付款';
          v.setPayModel.type = 'all';
        } else {
          v.setPayModel.title = '标记为已付款';
          v.setPayModel.type = '';
          v.singelSetMarkId = id;
        }
        v.setPayModel.status = true;
      });
    },
    cancelDeliveryHasCondition () { // 取消订单 all condition
      this.cancelDelivery('all');
    },
    cancelDelivery (type) { // 取消订单
      let v = this;
      v.cancelDeliveryStatus = true;
      if ((v.orderIdList.length === 0 || v.orderIdList === null) && type !== 'all') {
        v.$Message.error('请选择订单');
        return false;
      }
      this.getReasonList();
      v.$nextTick(function () {
        if (type === 'all') {
          v.cancelDeliveryModel.title = '批量取消订单（所有结果集）';
          v.cancelDeliveryModel.type = 'all';
        } else {
          v.cancelDeliveryModel.title = '批量取消订单';
          v.cancelDeliveryModel.type = '';
        }
        v.cancelDeliveryModel.status = true;
      });
    },
    getDateValue (value) { // 获取日期返回值
      let v = this;
      if (value[0] !== '') {
        v.pageParams.salesStartTime = v.getUniversalTime(new Date(value[0]).getTime(), 'fulltime');
        v.pageParams.salesEndTime = v.getUniversalTime(new Date(value[1]).getTime(), 'fulltime');
      }
    },
    resetDate () {
      let v = this;
      v.pageParams.salesStartTime = null;
      v.pageParams.salesEndTime = null;
    },
    getSelectValue (value) { // table获取所选值
      let v = this;
      let pos = [];
      Promise.resolve(value.forEach((n, i) => {
        pos.push(n.orderId);
      })).then(function () {
        v.orderIdList = pos;
      });
    },
    showPicModal (data) {
      var v = this;
      v.productStatus = true;
      v.$nextTick(function () {
        v.productModal = true;
        v.productDetails = data;
      });
    },
    closeModal () {
      this.productModal = false;
    },
    setMarkPayment () {
      let v = this;
      if (v.setPayModel.type === 'all') {
        v.setMarkModel.orderIdList = v.orderIdList;
      } else {
        v.setMarkModel.orderIdList = [v.singelSetMarkId];
      }
      v.axios.put(api.mark_paid, JSON.stringify(v.setMarkModel)).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data.length > 0) {
            data.forEach((n, i) => {
              v.$Message.error({
                content: '销售编号' + ': ' + n.salesRecordNumber + n.error,
                duration: 5
              });
            });
          } else {
            v.$Message.success('标记为已付款成功');
          }
          v.pageParamsStatus = true;
          v.$refs['setMarkModel'].resetFields();
        } else {
          v.$Message.error('操作失败，请重新尝试');
          v.$refs['setMarkModel'].resetFields();
        }
      });
    },
    setCancelDelivery () {
      let v = this;
      this.$refs.cancelOrderForm.validate((valid) => {
        if (!valid) return;
        let obj = {
          platformId: [this.inGroup],
          orderIdList: v.orderIdList,
          cancelReason: v.cancelDeliveryModel.cancelReason,
          invalidReason: v.cancelDeliveryModel.invalidReason,
          cancelType: v.cancelDeliveryModel.cancelType
        };
        if (v.cancelDeliveryModel.type === 'all') {
          obj = Object.assign(obj, v.pageParams);
        }
        v.axios.put(api.set_cancelOrderForNonPayment, JSON.stringify(obj)).then(response => {
          if (response.data.code === 0) {
            let dataList = response.data.datas;
            if (dataList !== null && dataList.length === 0) {
              v.$Message.success('操作成功');
            } else {
              dataList.forEach((n, i) => {
                if (n.code === 110602) {
                  v.$Message.error('取消订单失败');
                }
              });
            }
            v.pageParamsStatus = true;
            v.orderIdList = [];
            v.resetCancelDelivery();
          } else {
            v.$Message.error('操作失败，请重新尝试');
          }
        }).catch(() => {
          v.$Message.error('操作失败，请重新尝试');
        });
      })
    },
    resetCancelDelivery () {
      this.$refs.cancelOrderForm && this.$refs.cancelOrderForm.resetFields();
      this.cancelDeliveryModel.invalidReason = '';
      this.cancelDeliveryModel.cancelReason = 'BUYER_CANCEL_OR_ADDRESS_ISSUE';
    }
  },
  mounted () {
    let v = this;
    setTimeout(v.getCountrys(), 2000);// 获取国家区域列表
  }
};
</script>
