<style scoped>
.productMarginRight {
  margin-right: 5px;
}
.orderDetailsProductItem {
  max-height: 600px;
  overflow-y: auto;
}
</style>
<template>
  <div>
    <div class="interceptOrderFilter">
      <div class="card-container">
        <div class="card-content">
          <div class="platformParamsSelect">
            <Form ref="pageParams" :model="pageParams" :label-width="70" class="fixwidthForm">
              <dyt-filter :filter-row="1">
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
                  <dyt-select v-model="pageParams.tagIdList" :max-tag-count="1" multiple placeholder="请选择或搜索标签">
                    <Option v-for="item in tagsList" :key="item.tagId" :value="item.tagId" :v="item.tagId">{{ item.tagName }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="合并状态" prop="allowMerge">
                  <dyt-select v-model="pageParams.allowMerge" placeholder="合并状态">
                    <Option v-for="item in combineOrderStatusList" :key="item.value" :value="item.value">{{ item.label }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="国家/地区" prop="buyerCountryCodeList">
                  <dyt-select v-model="pageParams.buyerCountryCodeList" @on-change="countryChange" :max-tag-count="1" multiple placeholder="请选择或输入所在地">
                    <Option v-for="(item,index) in formValidate.country" :key="index" :value="item.twoCode" :v="item.cnName">{{ item.enName }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="总金额" prop="searchPrice" :rules="priceAuth" class="searchPrice">
                  <dyt-input v-model.trim="pageParams.searchPrice">
                    <dyt-select v-model="pageParams.priceOperator" placeholder="比较" slot="prepend" style="width: 60px">
                      <Option value=">" label=">"></Option>
                      <Option value=">=" label=">="></Option>
                      <Option value="=" label="="></Option>
                      <Option value="<=" label="<="></Option>
                      <Option value="<" label="<"></Option>
                    </dyt-select>
                    <dyt-select v-model="pageParams.priceCurrency" placeholder="币种" slot="append" style="width: 60px">
                      <Option value="usd">美元</Option>
                    </dyt-select>
                  </dyt-input>
                </Form-item>
                <Form-item label="付款时间">
                  <Date-picker transfer type="datetimerange" style="width:100%" @on-clear="resetDate" @on-change="getDateValue" :clearable="clearAble" :options="dateOptions" format="yyyy-MM-dd HH:mm:ss" placement="bottom-end" placeholder="请选择日期" :value="payTimeArr"></Date-picker>
                </Form-item>
                <Form-item label="买家姓名" prop="buyerName">
                  <dyt-input placeholder="请输入买家姓名" v-model.trim="pageParams.buyerName"></dyt-input>
                </Form-item>
                <Form-item label="买家ID" prop="buyerAccountId">
                  <dyt-input placeholder="请输入买家ID" v-model.trim="pageParams.buyerAccountId"></dyt-input>
                </Form-item>
                <Form-item label="搜索字符" prop="searchValue">
                  <dyt-input placeholder="买家ID、买家姓名" v-model.trim="pageParams.searchValue" @on-enter="search"></dyt-input>
                </Form-item>
                <div slot="operation">
                  <Button type="primary" @click="search" :disabled="SearchDisabled" v-if="isAdmin || controlList.orderInfo_queryForAllowMerge" icon="md-search">查询</Button>
                  <Button @click="reset" style="margin-left: 10px;" v-once icon="md-refresh">重置</Button>
                </div>
              </dyt-filter>
            </Form>
          </div>
        </div>
      </div>
    </div>

    <div class="tableControl" style="display: flex;">
      <div style="flex: 100;" v-if="getPermission('orderInfo_updateForBatchMerge_all') || getPermission('orderInfo_updateForBatchMerge')">
        <Buttons type="primary" trigger="click" @on-click="combineOrderHasCondition" :disabled="!getPermission('orderInfo_updateForBatchMerge')">
          <Button type="primary" @click="combineOrder" :disabled="!getPermission('orderInfo_updateForBatchMerge')">
            <Icon type="arrow-shrink"></Icon>
            合并
          </Button>
          <Buttons-menu slot="list">
            <Buttons-item name="1" :disabled="!getPermission('orderInfo_updateForBatchMerge_all')">合并（所有结果集）
            </Buttons-item>
          </Buttons-menu>
        </Buttons>
      </div>
      <div class="dataSort grayBg" style="display: inline-block;background: none;border: none;padding: 0;margin: 0;">
        <span>排序：</span>
        <Button-group>
          <template v-for="(item, index) in buttonGroupModel">
            <Button v-if="item.selected" :disabled="SearchDisabled" type="primary" @click="modifyTheSort(index, item.status)" :key="index">
              {{ item.title }}
              <Icon type="md-arrow-round-up" v-if="item.status && item.selected"></Icon>
              <Icon type="md-arrow-round-down" v-if="!item.status && item.selected"></Icon>
            </Button>
            <Button v-if="!item.selected" :disabled="SearchDisabled" @click="modifyTheSort(index,item.status)" :key="index">
              {{ item.title }}
              <Icon type="md-arrow-round-up" v-if="item.status && item.selected"></Icon>
              <Icon type="md-arrow-round-down" v-if="!item.status && item.selected"></Icon>
            </Button>
          </template>
        </Button-group>
      </div>
    </div>
    <div class="orderTable normalTop" v-if="getPermission('orderInfo_queryForAllowMerge')">
      <Table highlight-row border :columns="orderColumn" :height="tableHeight" :loading="tableLoading" :data="orderData" @on-selection-change="getSelectValue"></Table>
      <div class="table-page flexBox">
        <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator :current="curPage" show-sizer @on-page-size-change="changePageSize" placement="top" :page-size-opts="pageArray"></Page>
      </div>
    </div>
    <keep-alive>
      <sliderModal v-model="orderDetails" :spinShow="spinShow" :styles="sliderObjStyle" :buttonVisibile="buttonVisibile" v-if="orderDetailsBegin" :swStyles="swStyles" class="combineDetails slider-model">
        <div slot="header" v-if="getPermission('orderInfo_queryForMergeDigest')">
          <div class="hideDetails">
            <div @click="orderDetails = !orderDetails">
              <Icon type="chevron-left"></Icon>
              <span>返回</span>
            </div>
          </div>
        </div>
        <div slot="content" v-if="getPermission('orderInfo_queryForMergeDigest')">
          <div class="combineOrderDeliveryMes">
            <div class="toUserId">
              <Row>
                <Col :span="1" class="combineOrderDeliveryTo combineOrderDeliveryToUserId">
                ID:
                </Col>
                <Col :span="23" class="combineOrderDeliveryToContent combineOrderDeliveryToUserId">
                {{ mergeDigestDataSelect.buyerAccountId }}
                </Col>
              </Row>
            </div>
            <div class="toUserDetails">
              <Row>
                <Col :span="1" class="combineOrderDeliveryTo">
                TO:
                </Col>
                <Col :span="23" class="combineOrderDeliveryToContent">
                <div>{{ mergeDigestDataSelect.buyerName }}</div>
                <div>{{ mergeDigestDataSelect.buyerPhone }}</div>
                <div>{{ mergeDigestDataSelect.buyerAddress1 }}</div>
                <div>{{ mergeDigestDataSelect.buyerAddress2 }}</div>
                <div>{{ mergeDigestDataSelect.buyerCity }} {{ mergeDigestDataSelect.buyerState }} {{ mergeDigestDataSelect.buyerPostalCode }}</div>
                <div>{{ mergeDigestDataSelect.buyerCountryName }}</div>
                </Col>
              </Row>
            </div>
            <div class="combineTable">
              <dTable highlight-row border :columns="combineOrderColumn" :data="combineOrderData" @on-row-click="changeDetails"></dTable>
              <div class="shutOutHeader">已合并</div>
            </div>
            <div class="uncombineTable">
              <dTable highlight-row border @on-row-click="changeDetails" :columns="uncombineOrderColumn" :data="uncombineOrderData" @on-selection-change="getUnCombineOrderValue"></dTable>
              <div class="shutOutHeader">未合并</div>
            </div>
            <Alert type="warning" show-icon class="normalTop">有留言、未匹配商品或者截留订单不参与合并，如需合并请先标记留言已读、匹配商品或标记不再截留。已指定仓库物流方式的订单，追加进已有包裹将丢失原来指定的仓库物流方式，新建包裹则需要到订单系统中重新指定仓库物流方式。
            </Alert>
            <Radio-group v-model="packageRadioModel" vertical>
              <Radio label="追加进已合并包裹" v-if="combineOrderData.length > 0"></Radio>
              <Radio label="新的包裹"></Radio>
            </Radio-group>
            <Form :model="combineModel">
              <Form-item v-if="packageRadioModel === '追加进已合并包裹'">
                <dyt-select v-model="combineModel.packageCode" :v="combineModel.packageCode">
                  <Option v-for="(item, index) in packageCodeList" :value="item" :key="index">{{ item }}</Option>
                </dyt-select>
              </Form-item>
            </Form>
          </div>
        </div>
        <div slot="footer" v-if="getPermission('orderInfo_queryForMergeDigest')">
          <div class="combineButton" v-if="getPermission('orderInfo_updateForMerge')">
            <Button type="primary" @click="combineSinagleOrder">合并 </Button>
            <Button @click="orderDetails = !orderDetails" style="margin-left: 10px">取消 </Button>
          </div>
        </div>
        <orderDetails
          ref="combineOrderDetails"
          :orderDetailsId="orderDetailsId"
          :timestamp="timestamp"
          @spinLoading="spinLoading"
          @resetSpinShow="resetSpinShow"
          @updateList="getList"
          :buttonVisibile="buttonVisibile"
          inPage="combineOrder"
          :left="left"
          :orderNo="orderNo"
          :orderTagList="orderTagList"
          :webstoreItemSite="webstoreItemSite"
          :moal-visible.sync="orderDetails"
        />
      </sliderModal>
    </keep-alive>
    <!-- 合并 -->
    <keep-alive>
      <Modal v-model="combineShippingModel.status" :mask-closable="false" width="400" v-if="combineShippingStatus" @on-ok="combine">
        <div class="ivu-modal-confirm">
          <div class="ivu-modal-confirm-head">
            <div class="ivu-modal-confirm-head-title">{{ combineShippingModel.title }}</div>
          </div>
          <div class="ivu-modal-confirm-body ivu-modal-confirm-body-render">
            <div class="normalTop">
              <Row>
                <Col :span="1">
                <Icon type="md-information-circle" color="#2b85e4" size="44"></Icon>
                </Col>
                <Col :span="21" :offset="2">
                <p>
                  {{ combineShippingModel.content }} </p>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </Modal>
    </keep-alive>
    <!--点击订单查看产品-->
    <keep-alive>
      <Modal v-model="productModal" v-if="productStatus" :width="600">
        <div class="orderDetailsProductItem">
          <Row v-for="(item, index) in productDetails" :key="index" class="normalTop">
            <Col :span="2">
            <div class="orderDetailsProductItemPic">
              <img :src="item.pictureUrl" :alt="item.title">
            </div>
            </Col>
            <Col :span="17" :offset="1">
            <div>
              <span class="proderOrderNo productMarginRight">
                订单号：{{ item.accountCode }} - {{ item.salesRecordNumber }}
              </span> <span class="proderOrderNo productMarginRight">
                {{ (item.productsPrice * item.quantity).toFixed(2) }}({{ item.productsCurrency }})
              </span> <span class="productHaveATitle">{{ item.buyerShippingMethod }}</span>
            </div>
            <div class="odpidProductID">
              <span class="productID">{{ item.webstoreItemId }}</span>
              <span class="productHaveATitle">SKU: <em>{{ item.webstoreSku }}</em></span>
              <span class="productHaveATitle" v-if="inGroup ==='ebay'">物品所在地: <em>{{ item.location }}</em></span>
            </div>
            <div class="odpidProductDetails">
              {{ item.title }}
            </div>
            <div class="odpidProductParams" v-if="item.variations !== null">
              <span class="productHaveATitle" v-if="item.variations.indexOf('color') >=0 && item.variations.indexOf(';') >0 ">Color:<em>{{ item.variations.split(': ')[1].split(';')[0] }} </em></span>
              <span class="productHaveATitle" v-if="item.variations.indexOf('color') >=0 && item.variations.indexOf(';') < 0 ">Color:<em>{{ item.variations.split(': ')[1] }} </em></span>
              <span class="productHaveATitle" v-if="item.variations.toLowerCase().indexOf('pack of') >=0">Pack of:<em>{{ item.variations.split(';')[1].split(': ')[1] }}</em></span>
            </div>
            </Col>
            <Col :span="2" :offset="2" class="normalTop20">
            X {{ item.quantity }}
            </Col>
          </Row>
        </div>
        <div slot="footer">
          <Button @click="closeModal">关闭</Button>
        </div>
      </Modal>
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
      buttonGroupModel: [
        {
          type: 'buyerName',
          selected: false,
          status: true, // true up false down
          title: '按买家姓名'
        }, {
          type: 'payTime',
          selected: true,
          status: false, // true up false down
          title: '按最早付款时间'
        }
      ],
      payTimeArr: [],
      orderDetails: false,
      orderDetailsBegin: false,
      orderDetailsId: null,
      orderNo: null,
      timestamp: null,
      orderTagList: null,
      webstoreItemSite: null,
      buttonVisibile: false,
      formValidate: {
        country: []
      },
      shopModal: [],
      pageParamsStatus: false, // 每次更新完pageParms都要设置成true触发刷新
      totalPage: 0,
      total: 0,
      curPage: 1,
      mergeDigestDataSelect: '',
      mergeDigestData: '',
      pageParams: {
        pageNum: 1,
        pageSize: 50,
        allowMerge: 1,
        tagIdList: [],
        platformId: [this.inGroup],
        buyerCountryCodeList: [],
        searchValue: null,
        payStartTime: null,
        payEndTime: null,
        priceCurrency: null,
        priceOperator: null,
        upDown: 'down',
        buyerAccountId: null,
        buyerName: null,
        orderBy: 'payTime',
        orderNo: null,
        webstoreItemId: null,
        webstoreSku: null,
        searchPrice: null,
        saleAccountIds: []
      },
      clearAble: true,
      orderColumn: [
        {
          type: 'selection',
          width: 60,
          fixed: 'left',
          align: 'center'
        }, {
          title: '买家ID/姓名',
          key: 'buyerName',
          align: 'center',
          width: 200,
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
          title: '订单数',
          key: 'orderCount',
          align: 'center',
          width: 120,
          render: (h, params) => {
            var orderIds = params.row.orderId;
            return h('div', {
              style: {
                color: '#0054A6',
                cursor: 'pointer',
                textDecoration: 'underline'
              },
              on: {
                click: () => {
                  self.showPicModal(orderIds);
                }
              }
            }, params.row.orderCount);
          }
        }, {
          title: '总金额',
          key: 'totalPriceAndCurrencyBos',
          align: 'center',
          width: 130,
          render: (h, params) => {
            let price = params.row.totalPriceAndCurrencyBos;
            if (price !== null && price.length === 1) {
              return h('div', [
                h('div', price[0].totalPrice), h('div', '(' + price[0].totalPriceCurrency + ')')
              ]);
            } else if (price !== null && price.length > 1) {
              return h('span', '多币种');
            }
          }
        }, {
          title: '国家/地区',
          key: 'buyerCountryCodeList',
          align: 'center',
          width: 130
        }, {
          title: '地址',
          key: 'address',
          minWidth: 150,
          render: (h, params) => {
            return h('div', [
              h('span', params.row.buyerAddress1),
              h('span', params.row.buyerAddress2),
              h('span', params.row.buyerCity + ' ' + params.row.buyerState + ' ' + params.row.buyerPostalCode)
            ]);
          }
        }, {
          title: '买家选择的物流服务',
          key: 'buyerShippingMethods',
          align: 'center',
          width: 220,
          render: (h, params) => {
            let buyerShippingMethods = params.row.buyerShippingMethods;
            if (buyerShippingMethods !== null && buyerShippingMethods.length === 1) {
              return h('div', buyerShippingMethods[0]);
            } else if (buyerShippingMethods !== null && buyerShippingMethods.length > 1) {
              return h('span', '多种物流服务');
            }
          }
        }, {
          title: '操作',
          key: 'operate',
          width: 120,
          align: 'center',
          fixed: 'right',
          render: (h, params) => {
            if (params.row !== undefined) {
              return h('div', [
                !self.getPermission('orderInfo_queryForMergeDigest') || h('Button', {
                  props: {
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      self.combineDataModel.oid = params.row.orderId;
                      self.combineDataModel.mqc = params.row.mergeUniqueCode;
                      self.webstoreItemSite = params.row.webstoreItemSite;
                      self.show();
                      self.orderTagList = params.row.orderTagList;
                    }
                  }
                }, '合并详情')
              ]);
            }
          }
        }
      ],
      combineDataModel: {
        mqc: null,
        oid: null
      },
      orderData: [],
      orderIdList: [],
      setTagListStatus: false,
      value13: '',
      select3: '>',
      currencyModal: 'usd',
      shippingMethodModal: [], // 单个合并订单参数
      combineOrderColumn: [
        {
          title: '订单号',
          key: 'orderId',
          minWidth: 120,
          combine: true,
          render: (h, params) => {
            if (params.row.orderShippingId) {
              let t;
              if (params.row.printTime !== null) {
                t = ['span', { class: 'icon iconfont icon-dayin printTime' }, ''];
              } else {
                t = ['span', {}, ''];
              }
              let shippingName = '';
              if (!params.row.carrierName) {
                shippingName = '未指定物流方式';
              } else {
                shippingName = params.row.carrierName + '>' + params.row.carrierShippingMethodName;
              }
              let cancelBit;
              if (this.getPermission('orderShippingInfo_invalid')) {
                cancelBit = [
                  'Button', {
                    props: {
                      size: 'small'
                    },
                    class: 'fr',
                    on: {
                      click: () => {
                        this.cancelOrder(params.row.orderShippingId);
                      }
                    }
                  }, '作废'
                ];
              } else {
                cancelBit = [
                  'div', {}, ''
                ];
              }
              var obj = {
                childrens: [
                  [
                    'div', {
                      class: 'combiePackageCode'
                    }, params.row.packageCode
                  ], [
                    'div', {
                      class: 'combineShipping'
                    }, shippingName
                  ], t, cancelBit
                ],
                props: {}
              };
              obj.props.colSpan = 3;
              return obj;
            } else {
              return params.row.accountCode + '-' + params.row.salesRecordNumber;
            }
          }
        }, {
          title: '价格',
          minWidth: 100,
          key: 'totalPrice',
          render: (h, params) => {
            return h('div', [
              h('div', params.row.totalPrice), params.row.totalPriceCurrency && h('div', '(' + params.row.totalPriceCurrency + ')')
            ]);
          }
        }, {
          title: '时间',
          minWidth: 200,
          key: 'suspendedTime',
          render: (h, params) => {
            // 整包截留
            if (params.row.isSuspended === 1 && params.row.notesCheckingOk !== 0) { // 截留
              return h('div', [
                h('span', self.getDataToLocalTime(params.row.payTime, 'fulltime')), h('span', {
                  class: 'combineHasMes'
                }, '(' + '截留' + ')')
              ]);
            } else {
              return self.getDataToLocalTime(params.row.payTime, 'fulltime');
            }
          }
        }
      ],
      combineOrderData: [], // 已合并的数据
      uncombineOrderColumn: [
        {
          type: 'selection',
          align: 'center',
          minWidth: 70,
          combine: true,
          render: (h, params) => {
            if (params.index % 2 === 0) {
              let shippingName = '';
              if (!params.row.carrierName && !params.row.noPackage) {
                shippingName = '未指定物流方式';
              } else if (params.row.noPackage) {
                shippingName = '未生成发货信息';
              } else {
                shippingName = params.row.carrierName + '>' + params.row.carrierShippingMethodName;
              }
              let obj = {
                childrens: [
                  [
                    'div', {
                      class: 'unCombinePackageCode fl combineShipping'
                    }, params.row.packageCode
                  ], [
                    'div', {
                      class: 'combineShipping fl'
                    }, shippingName
                  ]
                ],
                props: {}
              };
              obj.props.colSpan = 4;
              return obj;
            } else {
              return '';
            }
          }
        }, {
          title: '订单号',
          key: 'orderId',
          minWidth: 120,
          render: (h, params) => {
            return params.row.accountCode + '-' + params.row.salesRecordNumber;
          }
        }, {
          title: '价格',
          key: 'totalPrice',
          minWidth: 100,
          render: (h, params) => {
            return h('div', [
              h('div', params.row.totalPrice), params.row.totalPriceCurrency && h('div', '(' + params.row.totalPriceCurrency + ')')
            ]);
          }
        }, {
          title: '时间',
          key: 'suspendedTime',
          minWidth: 200,
          render: (h, params) => {
            if (params.row.notesCheckingOk === 0 && params.row.isSuspended === 1) {
              return h('div', [
                h('span', self.getDataToLocalTime(params.row.payTime, 'fulltime')), h('span', {
                  class: 'combineHasMes'
                }, '(' + '有留言' + ')'), h('span', {
                  class: 'combineHasMes'
                }, '(' + '截留' + ')')
              ]);
            } else if (params.row.notesCheckingOk === 0 && params.row.isSuspended !== 1) { // 有留言
              return h('div', [
                h('span', self.getDataToLocalTime(params.row.payTime, 'fulltime')), h('span', {
                  class: 'combineHasMes'
                }, '(' + '有留言' + ')')
              ]);
            } else if (params.row.isSuspended === 1 && params.row.notesCheckingOk !== 0) { // 截留
              return h('div', [
                h('span', self.getDataToLocalTime(params.row.payTime, 'fulltime')), h('span', {
                  class: 'combineHasMes'
                }, '(' + '截留' + ')')
              ]);
            } else {
              return self.getDataToLocalTime(params.row.payTime, 'fulltime');
            }
          }
        }
      ],
      uncombineOrderData: [], // 未合并的数据
      packageRadioModel: '新的包裹',
      combineModel: {
        merchantCarrierId: null,
        orderIds: [],
        packageCode: null,
        shippingMethodId: null,
        confirm: false
      },
      value2: [],
      packageCodeList: [], // 已有包裹
      combineShippingModel: {
        title: '',
        content: '',
        status: false,
        shippingMethodModel: []
      },
      combineShippingStatus: false,
      combineShippingList: [],
      productDetails: '', // modal产品数据
      productStatus: false, // 点击产品列表详情状态控制
      productModal: false,
      priceAuth: [
        {
          validator: this.validatePrice(),
          trigger: 'blur'
        }
      ],
      sliderObjStyle: null,
      swStyles: null,
      left: 392
    };
  },
  computed: {
    tableHeight () {
      return this.getTableHeight(280);
    },
    combineStatus () {
      return this.$store.state.combineStatus;
    }
  },
  watch: {
    pageParamsStatus (n) {
      let v = this;
      if (n) {
        v.getList();
        v.pageParamsStatus = false;
      }
    },
    domWidth: { // common_mixin 里面有公共计算 domWidth 的方法， 这里通过 domWidth 来决定详情弹出框大小
      handler (n) {
        let v = this;
        if (n > 1600) {
          v.sliderObjStyle = { width: '1000px' };
          v.swStyles = {
            width: '660px',
            left: '-660px',
            top: '0',
            height: '100%'
          };
          v.left = 660;
        } else if (n > 1200) {
          v.sliderObjStyle = { width: '800px' };
          v.swStyles = {
            width: '442px',
            left: '-442px',
            top: '0',
            height: '100%'
          };
          v.left = 442;
        } else {
          v.sliderObjStyle = { width: '700px' };
          v.swStyles = {
            width: '322px',
            left: '-322px',
            top: '0',
            height: '100%'
          };
          v.left = 322;
        }
      },
      immediate: true
    },
    combineStatus (n) {
      let v = this;
      if (n) {
        v.uncombineOrderData = [];
        v.combineOrderData = [];
        v.getCombineData();
        v.$store.commit('combineStatus', false);
      }
    }
  },
  methods: {
    startLoading () {
      let v = this;
      v.$Loading.start();
      Promise.resolve(v.getPermission('orderInfo_queryForAllowMerge') ? v.getList() : v.gotoError()).then(() => {
        v.$Loading.finish();
        v.getOrderListTag();// 获取标签列表
        v.getShopList();
      });
    },
    getList () {
      var v = this;
      v.loadingTrue();
      v.axios.post(api.get_combineOrderList, JSON.stringify(v.pageParams)).then(response => {
        if (response.data.code === 0) {
          let pos = [];
          let data = response.data.datas;
          if (data.list !== null) {
            data.list.forEach((n, i) => {
              pos.push({
                orderCount: n.orderCount, // 订单数量
                buyerName: n.buyerName, // 买家
                totalPriceAndCurrencyBos: n.totalPriceAndCurrencyBos, // array, one or more currency
                buyerShippingMethods: n.buyerShippingMethods, // arr, one or more shipping mehotds
                buyerAddress1: n.buyerAddress1,
                buyerAddress2: n.buyerAddress2,
                buyerCountryCodeList: n.buyerCountryCode,
                buyerCity: n.buyerCity,
                buyerState: n.buyerState,
                orderTagList: n.orderTags,
                orderId: n.orderIds,
                mergeUniqueCode: n.mergeUniqueCode,
                buyerAccountId: n.buyerAccountId,
                webstoreItemSite: n.webstoreItemSite,
                buyerPostalCode: n.buyerPostalCode
              });
            });
            v.orderData = pos;
          } else {
            v.orderData = [];
          }
          v.$nextTick(function () {
            v.loadingFalse();
            v.total = Number(data.total);
            v.totalPage = Number(data.pages);
          });
        }
      }).catch(() => {
        v.loadingFalse();
      });
    },
    getSelectValue (value) { // table获取所选值
      let v = this;
      let pos = [];
      Promise.resolve(value.forEach((n, i) => {
        pos.push(n.orderId);
      })).then(() => {
        v.orderIdList = pos;
      });
    },
    tagChange (value) {
      let v = this;
      if (value.indexOf('null') >= 0) {
        v.pageParams.tagIdList = [];
      } else {
        v.pageParams.tagIdList = value;
      }
    },
    shopChange () {
      this.pageParamsStatus = true;
    },
    getMarkCountryList (h) {
      let pos = [];
      this.formValidate.country.forEach((n, i) => {
        pos.push(h('Option', {
          props: {
            value: n.twoCode,
            key: n
          }
        }, n.cnName));
      });
      return pos;
    },
    reset () {
      let v = this;
      v.$refs['pageParams'].resetFields();
      v.resetDate();
      v.payTimeArr = [];
    },
    getDateValue (value) { // 获取日期返回值
      let v = this;
      if (value.length === 0) {
        v.$Message.error('日期格式有误');
        v.resetDate();
      } else {
        if (value[0] !== '') {
          v.pageParams.payStartTime = v.getUniversalTime(new Date(value[0]).getTime(), 'fulltime');
          v.pageParams.payEndTime = v.getUniversalTime(new Date(value[1]).getTime(), 'fulltime');
        }
      }
    },
    resetDate () {
      let v = this;
      v.pageParams.payStartTime = null;
      v.pageParams.payEndTime = null;
    },
    combineOrder (type) {
      let v = this;
      if ((v.orderIdList.length === 0 || v.orderIdList === null) && type !== 'all') {
        v.$Message.error('请选择订单');
        return false;
      }
      v.combineShippingStatus = true;
      if (type === 'all') {
        v.combineShippingModel.title = '合并（所有结果集）';
        v.combineShippingModel.content = '批量合并系统将符合您当前的查询条件的所有的可合并的买家订单自动合并（有留言或者截留订单不参与合并）。';
      } else {
        v.combineShippingModel.title = '批量合并';
        v.combineShippingModel.content = '批量合并系统将自动将列表中的同一买家的订单自动合并成一个包裹发货（有留言或者截留订单不参与合并）。';
      }
      v.$nextTick(function () {
        v.combineShippingModel.status = true;
      });
    },
    loadData (item, callback) {
      let v = this;
      item.loading = true;
      v.axios.get(api.erpServiceCommon + api.get_enableShippingMethodsApi + '?carrierId=' + item.value).then(response => {
        if (response.data.code === 0) {
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
        }
      });
    },
    combineOrderHasCondition (val) {
      this.combineOrder('all');
    },
    combine () {
      let v = this;
      let obj = {
        orderIdLists: v.orderIdList
      };
      if (v.combineShippingModel.title === '合并（所有结果集）') {
        obj = Object.assign(obj, v.pageParams);
        delete obj.orderIdLists;
      }
      v.axios.post(api.merge_BatchOrder, JSON.stringify(obj)).then(response => {
        if (response.data.code === 0) {
          if (response.data.datas !== null && response.data.datas.length > 0) {
            response.data.datas.forEach((n, i) => {
              v.$Message.error(n.buyerAccountId + n.message);
            });
          } else {
            v.$Message.success('操作成功');
          }
          v.pageParamsStatus = true;
          v.orderIdList = [];
        }
      });
    },
    show () {
      var v = this;
      v.uncombineOrderData = [];
      v.combineOrderData = [];
      v.packageCodeList = [];
      v.getCombineData();
    },
    showSlider () {
      let v = this;
      let date = new Date().getTime();
      v.packageRadioModel = '新的包裹';
      v.combineModel.packageCode = null;
      v.orderDetailsBegin = true;
      v.$nextTick(function () {
        v.orderDetails = true;
        v.timestamp = date;
      });
    },
    getCombineData () {
      let v = this;
      v.uncombineOrderData = [];
      let obj = {
        mergeUniqueCode: v.combineDataModel.mqc,
        orderIds: v.combineDataModel.oid
      };
      v.unCombineOrderData = [];
      v.axios.post(api.get_mergeDigest, JSON.stringify(obj)) // 可合并详情接口
        .then(response => {
          if (response.data.code === 0) {
            let data = response.data.datas;
            let combinePos = [];
            let noCombinePos = [];
            let merchantShippingMethodIdArr = [];
            if (data.length > 0) { // 左侧地址信息
              v.mergeDigestDataSelect = data[0].orderInfoList[0];
              v.countryName(data[0].orderInfoList[0].buyerCountryCode).then(response1 => {
                v.mergeDigestDataSelect.buyerCountryName = response1;
              });
            }
            data.forEach((n, i) => {
              if (n.orderShippingInfo) {
                merchantShippingMethodIdArr.push(n.orderShippingInfo.merchantShippingMethodId);
              }
            });
            v.getShippingMethodName(merchantShippingMethodIdArr)// 查物流
              .then(response => {
                data.forEach((n, i) => {
                  if (response.length > 0) {
                    response.forEach((m, t) => {
                      if (n.orderShippingInfo && n.orderShippingInfo.merchantShippingMethodId === m.shippingMethodId) { // 添加每个包裹的物流信息
                        n.orderShippingInfo.carrierName = m.carrierName;
                        n.orderShippingInfo.carrierShippingMethodName = m.carrierShippingMethodName;
                      }
                    });
                    if ((n.orderInfoList.length > 0 && !n.orderShippingInfo) || (n.orderInfoList.length === 1 && n.orderShippingInfo)) {
                      noCombinePos.push(n);
                    } else {
                      combinePos.push(n);
                    }
                  } else {
                    if ((n.orderInfoList.length > 0 && !n.orderShippingInfo) || (n.orderInfoList.length === 1 && n.orderShippingInfo)) {
                      noCombinePos.push(n);
                    } else {
                      combinePos.push(n);
                    }
                  }
                });
                let unCombineOrderDataPos = [];// 未合并集合
                let saleAccountIdPos = [];
                if (noCombinePos.length > 0) {
                  noCombinePos.forEach((n, i) => {
                    if (i === 0) {
                      v.orderDetailsId = n.orderInfoList[0].orderId;
                      v.showSlider();
                    }
                    if (n.orderInfoList[0].isSuspended === 1 || n.orderInfoList[0].notesCheckingOk === 0) { // isSuspended 1 截留 notesCheckingOk 0 有留言
                      n.orderInfoList[0]._disabled = true;
                    }
                    if (n.orderShippingInfo) {
                      n.orderShippingInfo._disabled = true;
                      unCombineOrderDataPos.push(n.orderShippingInfo);
                      unCombineOrderDataPos.push(n.orderInfoList[0]);
                      saleAccountIdPos.push(n.orderInfoList[0].saleAccountId);
                    } else {
                      n.orderInfoList.forEach((p, g) => {
                        p._disabled = true;
                        unCombineOrderDataPos.push({
                          noPackage: true
                        });
                        unCombineOrderDataPos.push(p);
                        saleAccountIdPos.push(p.saleAccountId);
                      });
                    }
                  });
                }
                let combineAccountIdPos = [];// 已合并saleAccountId集合
                let combineListPos = [];// 整理已合并后的集合
                if (combinePos.length > 0) {
                  combinePos.forEach((n, i) => {
                    if (i === 0) { // 获取第一个订单，打开
                      v.orderDetailsId = n.orderInfoList[0].orderId;
                      v.showSlider();
                    }
                    combineListPos.push(n.orderShippingInfo);
                    n.orderInfoList.forEach((m, t) => {
                      combineListPos.push(m);
                    });
                    combineAccountIdPos.push(n.orderInfoList[0].saleAccountId);
                    delete n.orderShippingInfo;
                  });
                }
                if (saleAccountIdPos.length > 0) {
                  v.axios.post(api.get_saleAccountById + '?saleAccountIds=' + saleAccountIdPos).then(response1 => {
                    if (response1.data.code === 0) {
                      let list = response1.data.datas;
                      for (let i = 0; i < list.length; i++) {
                        unCombineOrderDataPos.forEach((n, t) => {
                          n.t = t;
                          n.accountCode = list[i].accountCode;
                          if (n.orderId && n.orderId === v.orderDetailsId) { // 如果是第一个订单，写入orderNo
                            v.orderNo = list[i].accountCode + '-' + n.salesRecordNumber;
                          }
                        });
                      }
                      v.uncombineOrderData = unCombineOrderDataPos;
                    }
                  });
                }
                if (combineAccountIdPos.length > 0) {
                  v.axios.post(api.get_saleAccountById + '?saleAccountIds=' + combineAccountIdPos + '&time1' + new Date().getTime()).then(response1 => {
                    if (response1.data.code === 0) {
                      let list = response1.data.datas;
                      for (let i = 0; i < list.length; i++) {
                        combinePos.forEach((m, k) => {
                          m.orderInfoList.forEach((n, t) => {
                            n.accountCode = list[i].accountCode;
                            if (n.orderId && n.orderId === v.orderDetailsId) { // 如果是第一个订单，写入orderNo
                              v.orderNo = list[i].accountCode + '-' + n.salesRecordNumber;
                            }
                          });
                        });
                      }
                      v.combineOrderData = combineListPos;
                      v.packageCodeList = [];// 记录已合并包裹号
                      v.combineOrderData.forEach((n, i) => {
                        if (n.packageCode) {
                          v.packageCodeList.push(n.packageCode);
                        }
                      });
                    }
                  });
                }
              });
          }
        });
    },
    cancelOrder (packageCode) {
      let v = this;
      v.axios.put(api.cancel_package + packageCode).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
          v.combineOrderData = [];
          v.getCombineData();
        } else {
          v.$Message.error('操作失败，请重新尝试');
        }
      });
    },
    getUnCombineOrderValue (value) {
      let v = this;
      let pos = [];
      Promise.resolve(value.forEach((n, i) => {
        pos.push(n.orderId);
      })).then(() => {
        v.combineModel.orderIds = pos;
      });
    },
    combineSinagleOrder () {
      let v = this;
      let obj = {};
      if (v.packageRadioModel === '新的包裹') {
        if (v.combineModel.orderIds.length < 2) {
          v.$Message.error('新的包裹最少要选择两个');
          return false;
        }
        obj = {
          orderIds: v.combineModel.orderIds
        };
      } else {
        if (v.combineModel.packageCode === null) {
          v.$Message.error('请选择包裹');
          return false;
        } else if (v.combineModel.orderIds.length === 0) {
          v.$Message.error('请选择合并订单');
          return false;
        }
        obj = {
          orderIds: v.combineModel.orderIds,
          packageCode: v.combineModel.packageCode,
          confirm: v.combineModel.confirm
        };
      }
      v.axios.put(api.merge_singleOrder, JSON.stringify(obj)).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('合并成功');
          v.combineModel.orderIds = [];
          v.getCombineData();
        }
      });
    },
    changeDetails (data) {
      let v = this;
      if (!data.orderShippingId) {
        v.orderDetailsId = data.orderId;
        v.orderNo = data.accountCode + '-' + data.salesRecordNumber;
        let date = new Date().getTime();
        v.$nextTick(function () {
          v.timestamp = date;
        });
      }
    },
    showPicModal (orderIds) {
      let v = this;
      v.axios.post(api.get_orderProductList + '?orderIds=' + orderIds).then(response => {
        if (response.data.code === 0) {
          let list = response.data.datas;
          let saleAccountIdPos = [];

          function getSaleAccountIdPos () {
            list.forEach((n, i) => {
              saleAccountIdPos.push(n.saleAccountId);
              if (list[i].pictureUrl === '' || list[i].pictureUrl === null) {
                list[i].pictureUrl = v.placeholderSrc;
              }
            });
          }

          function getAccountCode () {
            return new Promise(resolve => {
              if (saleAccountIdPos.length > 0) { // 匹配订单号
                v.axios.post(api.get_saleAccountById + '?saleAccountIds=' + saleAccountIdPos).then(response => {
                  if (response.data.code === 0) {
                    let saleAccountList = response.data.datas;
                    for (let i = 0; i < saleAccountList.length; i++) {
                      for (let t = 0; t < list.length; t++) {
                        if (list[t].saleAccountId === saleAccountList[i].saleAccountId) {
                          list[t].accountCode = saleAccountList[i].accountCode;
                        }
                        if (i === saleAccountList.length - 1 && t === list.length - 1) {
                          resolve(true);
                        }
                      }
                    }
                  }
                });
              }
            });
          }

          async function getList () {
            await getSaleAccountIdPos();
            const a = await getAccountCode();
            if (a) {
              v.productStatus = true;
              v.$nextTick(function () {
                v.productModal = true;
                v.productDetails = list;
              });
            }
          }

          getList();
        }
      });
    },
    closeModal () {
      this.productModal = false;
    },
    validatePrice () {
      let v = this;
      let priceReg = v.$regular.hasPriceNum;
      let validatePrice = function (rule, value, callback) {
        if (!priceReg.test(value)) {
          v.$Message.error('价格必须为数字,且最多允许两位小数');
          v.pageParams.searchPrice = '';
          callback();
        } else {
          callback();
        }
      };
      return validatePrice;
    },
    getShippingMethodName (arr) { // 获取物流商名称
      let v = this;
      return new Promise((resolve, reject) => {
        v.axios.post(api.queryCarrierShippingName, JSON.stringify(arr)).then(response => {
          if (response.data.code === 0) {
            if (response.data.datas.length >= 0) {
              resolve(response.data.datas);
            }
          }
        });
      });
    }
  },
  mounted () {
    let v = this;
    setTimeout(v.getCountrys(), 2000);// 获取国家区域列表
  }
};
</script>
<style lang="less">
.searchPrice {
  .ivu-form-item-content {
    margin-bottom: -20px;
  }
}
</style>
