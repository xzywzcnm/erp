<template >
  <div>
    <div class="interceptOrderFilter">
      <div class="card-container">
        <div class="card-content">
          <div class="platformParamsSelect">
            <Form ref="pageParams" :model="pageParams" :label-width="labelWidth">
              <Row type="flex" :gutter="gutterItem" class="col_margin_bottom">
                <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol">
                <Form-item label="店铺" prop="saleAccountIds">
                  <dytStoreSelect
                    v-model="pageParams.saleAccountIds"
                    :option-data="shopList"
                    :replace-option-key="{ value: 'saleAccountId', label: 'accountCode' }"
                    placeholder="请选择店铺，可输入搜索"
                    input-placeholder="请输入店铺，多个店铺可用逗号或换行隔开"
                  />
                </Form-item>
                </Col>
                <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol">
                <Form-item label="标签" prop="tagIdList">
                  <dyt-select v-model="pageParams.tagIdList" filterable multiple placeholder="请选择或搜索标签">
                    <Option v-for="item in tagsList" :key="item.tagId" :value="item.tagId" :v="item.tagId">{{ item.tagName }}</Option>
                  </dyt-select>
                </Form-item>
                </Col>
                <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol">
                <Form-item label="付款时间">
                  <Date-picker transfer type="datetimerange" style="width:100%" @on-clear="resetDate" @on-change="getDateValue" :clearable="clearAble" format="yyyy-MM-dd HH:mm:ss" :options="dateOptions" placement="bottom-end" placeholder="选择日期" :value="payTimeArr"></Date-picker>
                </Form-item>
                </Col>
                <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol">
                <Form-item label="国家/地区" prop="buyerCountryCodeList">
                  <dyt-select v-model="pageParams.buyerCountryCodeList" @on-change="countryChange" filterable multiple placeholder="请选择或输入所在地">
                    <Option v-for="(item,index) in formValidate.country" :key="index" :value="item.twoCode">{{ item.enName }}</Option>
                  </dyt-select>
                </Form-item>
                </Col>
                <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol" v-show="moreFilter">
                <Form-item label="金额范围" prop="currency" :rules="priceAuth">
                  <Input style="width:80px" placeholder="最小金额" v-model.trim="pageParams.minTotalPrice"></Input>
                  <span> - </span> <Input style="width:80px" placeholder="最大金额" v-model.trim="pageParams.maxTotalPrice"></Input> <dyt-select style="width:100px" v-model="pageParams.currency">
                    <Option value="USD">美元</Option>
                  </dyt-select>
                </Form-item>
                </Col>
                <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol" v-show="moreFilter">
                <Form-item label="订单号" prop="orderNo">
                  <Input placeholder="请输入订单号,多个订单号用逗号或回车分隔" type="textarea" v-model.trim="pageParams.orderNo"></Input>
                </Form-item>
                </Col>
                <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol" v-show="moreFilter">
                <Form-item label="买家姓名" prop="buyerName">
                  <Input placeholder="请输入买家姓名" v-model.trim="pageParams.buyerName"></Input>
                </Form-item>
                </Col>
                <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol" v-show="moreFilter">
                <Form-item label="买家ID" prop="buyerAccountId">
                  <Input placeholder="请输入买家ID" v-model.trim="pageParams.buyerAccountId"></Input>
                </Form-item>
                </Col>
                <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol" v-show="moreFilter">
                <Form-item label="product ID" prop="webstoreItemId">
                  <Input placeholder="请输入平台产品编码" v-model.trim="pageParams.webstoreItemId"></Input>
                </Form-item>
                </Col>
                <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol" v-show="moreFilter">
                <Form-item label="SKU" prop="webstoreSku">
                  <Input placeholder="请输入SKU" v-model.trim="pageParams.webstoreSku"></Input>
                </Form-item>
                </Col>
                <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol" v-show="moreFilter">
                <Form-item label="搜索字符" prop="searchValue">
                  <Input class="filterSearch" @on-enter="search" placeholder="可输入订单号、买家ID、买家姓名、SKU、平台产品编码" v-model.trim="pageParams.searchValue"></Input>
                </Form-item>
                </Col>
              </Row>
              <Row type="flex" justify="space-between" :gutter="gutterItem" class="filter_options_button">
                <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol" :offset="1">
                <Button type="primary" @click="search" size="small" :disabled="SearchDisabled" icon="md-search">查询 </Button>
                <Button @click="reset" size="small" v-once icon="md-refresh">重置 </Button>
                </Col>
                <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol" style="text-align: right;">
                <Button size="small" @click="toggleMoreFilter">{{ moreFilterMes }}
                  <Icon :type="moreFilterIcon" size="small"></Icon>
                </Button>
                </Col>
              </Row>
            </Form>
          </div>
        </div>
      </div>
    </div>
    <div class="dataSort grayBg">
      <span>排序：</span>
      <Button-group>
        <template v-for="(item, index) in buttonGroupModel">
          <Button v-if="item.selected" type="primary" @click="modifyTheSort(index, item.status)" :key="index">
            {{ item.title }}
            <Icon type="md-arrow-round-up" v-if="item.status && item.selected"></Icon>
            <Icon type="md-arrow-round-down" v-if="!item.status && item.selected"></Icon>
          </Button>
          <Button v-if="!item.selected" @click="modifyTheSort(index,item.status)" :key="index">
            {{ item.title }}
            <Icon type="md-arrow-round-up" v-if="item.status && item.selected"></Icon>
            <Icon type="md-arrow-round-down" v-if="!item.status && item.selected"></Icon>
          </Button>
        </template>
      </Button-group>
    </div>
    <div class="tableControl">
      <Buttons type="primary" trigger="click" @on-click="exportOrderHasCondition" :disabled="!getPermission('aliexpressOrder_exportRiskControlOrders_batch')">
        <Button type="primary" @click="exportOrder" class="iconbuttons" :disabled="!getPermission('aliexpressOrder_exportRiskControlOrders_batch')">
          <span class="icon iconfont">&#xe639;</span> 导出选中 </Button>
        <Buttons-menu slot="list">
          <Buttons-item name="1" :disabled="!getPermission('aliexpressOrder_exportRiskControlOrders_all')">导出（所有结果集）
          </Buttons-item>
        </Buttons-menu>
      </Buttons>
      <Dropdown class="tcDropDown" v-if="getPermission('orderTag_insert_batch') || getPermission('orderTag_clear')">
        <Poptip v-model="setTagListStatus" placement="bottom" :transfer="true">
          <Button icon="md-pricetag">
            打标签
            <Icon type="md-arrow-dropdown" />
          </Button>
          <div slot="content">
            <div class="tagsList">
              <Checkbox-group v-model="tagIdList">
                <ul>
                  <li v-for="(item, tagIndex) in tagsList" :key="tagIndex">
                    <Checkbox :label="item.tagId">{{ item.tagName }}</Checkbox>
                  </li>
                </ul>
              </Checkbox-group>
            </div>
            <div class="tagsSelectFooter">
              <Button size="small" @click="setTag" :disabled="!getPermission('orderTag_insert_batch')">打标签 </Button>
              <Button size="small" @click="dropOrderTag" :disabled="!getPermission('orderTag_clear')">清空标签 </Button>
            </div>
          </div>
        </Poptip>
      </Dropdown>
    </div>
    <div class="orderTable normalTop">
      <Table highlight-row border :height="tableHeight" :loading="tableLoading" :columns="orderColumn" :data="orderData" @on-selection-change="getSelectValue"></Table>
      <div class="table-page">
        <div class="table-page-right">
          <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator :current="curPage" show-sizer @on-page-size-change="changePageSize" placement="top" :page-size-opts="pageArray"></Page>
        </div>
      </div>
    </div>
    <!-- 导出 -->
    <keep-alive >
      <Modal
          v-model="exportModel.status"
          :mask-closable="false"
          width="400"
          v-if="exportModelStatus"
          @on-ok="exportExcel" >
        <div class="ivu-modal-confirm" >
          <div class="ivu-modal-confirm-head" >
            <div class="ivu-modal-confirm-head-title" >{{ exportModel.title }}</div >
          </div >
          <div class="ivu-modal-confirm-body ivu-modal-confirm-body-render" >
            <div class="normalTop" >
              <Row >
                <Col :span="1" >
                  <Icon type="md-information-circle" color="#2b85e4" size="44" ></Icon >
                </Col >
                <Col :span="21" :offset="2" >
                  <p >
                    {{ exportModel.content }} </p >
                </Col >
              </Row >
            </div >
          </div >
        </div >
      </Modal >
    </keep-alive >
    <keep-alive >
      <Modal v-model="productModal" :mask-closable="false" v-if="productStatus" :width="600" >
        <div class="orderDetailsProductItem" >
          <Row v-for="(item, index) in productDetails" :key="index" class="normalTop" >
            <Col :span="2" >
              <div class="orderDetailsProductItemPic" >
                <img :src="item.pictureUrl" :alt="item.title" >
              </div >
            </Col >
            <Col :span="17" :offset="1" >
              <div class="odpidProductID" >
                <span class="productID" >{{ item.webstoreItemId }}</span >
                <span class="productHaveATitle" >SKU: <em >{{ item.webstoreSku }}</em ></span >
                <span class="productLogsticService" >物流服务：<em >{{ item.buyerShippingMethod }}</em ></span >
              </div >
              <div class="odpidProductDetails" >
                {{ item.title }}
              </div >
              <div class="odpidProductParams" v-if="item.variations !== null" >
                <span
                    class="productHaveATitle"
                    v-if="item.variations.indexOf('color') >=0 && item.variations.indexOf(';') >0" >Color:<em >{{ item.variations.split(': ')[1].split(';')[0] }} </em ></span >
                <span
                    class="productHaveATitle"
                    v-if="item.variations.indexOf('color') >=0 && item.variations.indexOf(';') < 0" >Color:<em >{{ item.variations.split(': ')[1] }} </em ></span >
                <span
                    class="productHaveATitle"
                    v-if="item.variations.toLowerCase().indexOf('pack of') >=0" >Pack of:<em >{{ item.variations.split(';')[1].split(': ')[1] }}</em ></span >
              </div >
            </Col >
            <Col :span="2" :offset="2" >
              X {{ item.quantity }}
            </Col >
          </Row >
        </div >
        <div slot="footer" >
          <Button @click="closeModal" >关闭</Button >
        </div >
      </Modal >
    </keep-alive >
    <keep-alive >
      <sliderModal v-model="orderDetails" :styles="{}" class="slider-model" v-if="orderDetailsBegin" >
        <orderDetails
            :orderDetailsId="orderDetailsId"
            @reloadTag="reloadTag"
            :orderNo="orderNo"
            :timestamp="timestamp"
            @spinLoading="spinLoading"
            @resetSpinShow="resetSpinShow"
            @updateList="getList"
            :orderTagList="orderTagList"
            :webstoreItemSite="webstoreItemSite"
            :moal-visible.sync="orderDetails"
          />
      </sliderModal >
    </keep-alive >
  </div >
</template>
<script>
import api from '@/api/api';
import orderDetails from "@/views/commonOrder/components/commonOrder/orderDetails";
import Mixin from '@/components/mixin/common_mixin';
import tableMixin from '@/components/mixin/table_mixin';
import orderSys from '@/components/mixin/orderSys_mixin';

export default {
  mixins: [Mixin, tableMixin, orderSys],
  components: {
    orderDetails
  },
  data () {
    var self = this;
    return {
      buttonGroupModel: [
        {
          type: 'payTime',
          selected: true,
          status: true, // true up false down
          title: '按付款时间'
        }, {
          type: 'salesTime',
          selected: false,
          status: true, // true up false down
          title: '按下单时间'
        }
      ],
      orderDetails: false,
      formValidate: {
        country: []
      },
      shopModal: [],
      payTimeArr: [],
      pageParamsStatus: false, // 每次更新完pageParms都要设置成true触发刷新
      totalPage: 0,
      total: 0,
      curPage: 1,
      pageParams: {
        pageNum: 1,
        pageSize: 10,
        tagIdList: [],
        platformId: ['aliexpress'],
        buyerCountryCodeList: [],
        searchValue: null,
        payStartTime: null,
        payEndTime: null,
        saleAccountIds: [],
        upDown: 'up',
        merchantCarrierId: null,
        merchantShippingMethodId: null,
        orderBy: 'payTime',
        priceOperator: null,
        buyerAccountId: null,
        buyerName: null,
        webstoreItemId: null,
        webstoreSku: null,
        orderNo: null,
        maxTotalPrice: '',
        minTotalPrice: '',
        currency: 'USD'
      },
      exportModel: {
        title: '',
        content: '',
        status: false
      },
      exportModelStatus: false,
      clearAble: true,
      orderColumn: [
        {
          type: 'selection',
          width: 60,
          fixed: 'left',
          align: 'center'
        }, {
          title: '订单号',
          key: 'salesRecordNumber',
          width: 140,
          fixed: 'left',
          render: (h, params) => {
            return h('div', {
              style: {
                color: '#0054A6',
                cursor: 'pointer'
              },
              on: {
                click: () => {
                  self.show(params.row.orderId);
                  self.orderNo = params.row.accountCode + '-' + params.row.salesRecordNumber;
                  self.orderTagList = params.row.orderTagList;
                  self.webstoreItemSite = params.row.webstoreItemSite;
                }
              }
            }, params.row.accountCode + '-' + params.row.salesRecordNumber);
          }
        }, {
          title: '订单状态',
          key: 'orderStatus',
          width: 140,
          render: (h, params) => {
            return h('span', self.getPlatformOrderStatus(params.row.platformOrderStatus));
          }
        }, {
          title: '产品',
          key: 'productList',
          minWidth: 200,
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
          title: '买家ID/姓名/买家等级',
          key: 'buyerName',
          width: 200,
          render: (h, params) => {
            let level = params.row.orderExtendInfo.aliexpressBuyerAccountLevel;
            let levelClass;
            switch (level) {
              case 'A0':
                levelClass = 'grayBgColor';
                break;
              case 'A1':
                levelClass = 'greenBgColor';
                break;
              case 'A2':
                levelClass = 'blueBgColor';
                break;
              case 'A3':
                levelClass = 'yellowBgColor';
                break;
              case 'A4':
                levelClass = 'redBgColor';
                break;
            }
            return h('div', {
              class: 'flexBox',
              style: {
                'align-items': 'baseline'
              }
            }, [
              h('span', {
                class: 'lableIcon ' + levelClass,
                style: {
                  'margin-right': '5px'
                }
              }, level), h('div', [
                h('div', {
                  style: {
                    color: '#0054A6'
                  }
                }, params.row.buyerAccountId), h('div', {
                  style: {
                    color: '#ff3300'
                  }
                }, params.row.buyerName)
              ])
            ]);
          }
        }, {
          title: '国家/地区',
          key: 'buyerCountryCode',
          width: 100
        }, {
          title: '金额',
          key: 'totalPrice',
          width: 100,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('div', params.row.totalPrice), params.row.totalPriceCurrency && h('div', '(' + params.row.totalPriceCurrency + ')')
            ]);
          }
        }, {
          title: '下单时间',
          key: 'salesTime',
          width: 100
        }, {
          title: '付款时间',
          key: 'payTime',
          width: 100
        }, {
          title: '标签',
          key: 'tags',
          width: 140,
          render: (h, params) => {
            let orderTagList = params.row.orderTagList;
            let pos = [];
            if (orderTagList !== [] && orderTagList !== null) {
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
          }
        }, {
          title: '操作',
          key: 'operate',
          fixed: 'right',
          width: 100,
          render: (h, params) => {
            if (params.row !== undefined) {
              return h('div', [
                h('Button', {
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
        }
      ],
      orderData: [],
      orderIdList: [],
      setTagListStatus: false,
      currencyModal: 'usd',
      shippingMethodModel: [],
      shippingMethodData: [],
      productStatus: false, // 点击产品列表详情状态控制
      productModal: false,
      productDetails: '', // modal产品数据
      orderDetailsBegin: false,
      orderDetailsId: null,
      orderNo: null,
      timestamp: null,
      orderTagList: null,
      webstoreItemSite: null,
      priceAuth: [
        {
          validator: this.validatePrice(),
          trigger: 'blur'
        }
      ]
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
      return this.getTableHeight(420);
    }
  },
  methods: {
    startLoading () {
      let v = this;
      v.$Loading.start();
      Promise.resolve(v.getPermission('aliexpressOrder_queryForRiskControl')
        ? v.getList()
        : v.gotoError()).then(function () {
        v.$Loading.finish();
        v.getShopList();
        v.getOrderListTag();// 获取标签列表
      });
    },
    getList () {
      let v = this;
      v.orderData = [];
      v.loadingTrue();
      v.axios.post(api.get_queryForRiskControl, JSON.stringify(v.pageParams)).then(response => {
        if (response.data.code === 0) {
          let pos = [];
          let orderIdPos = [];
          let saleAccountIdPos = [];
          let data = response.data.datas;
          if (data.list !== null) {
            data.list.forEach((n, i) => {
              pos.push({
                orderCount: n.orderCount, // 订单数量
                buyerName: n.buyerName, // 买家
                buyerAccountId: n.buyerAccountId,
                webstoreItemSite: n.webstoreItemSite,
                buyerShippingMethod: n.buyerShippingMethod,
                totalPrice: n.totalPrice,
                totalPriceCurrency: n.totalPriceCurrency,
                orderTagList: n.orderTags,
                orderId: n.orderId,
                orderExtendInfo: n.orderExtendInfo,
                productList: [],
                salesRecordNumber: n.salesRecordNumber,
                saleAccountId: n.saleAccountId,
                buyerCountryCode: n.buyerCountryCode,
                platformId: n.platformId,
                payTime: v.getDataToLocalTime(n.payTime, 'fulltime'),
                salesTime: v.getDataToLocalTime(n.salesTime, 'fulltime'),
                platformOrderStatus: n.platformOrderStatus
              });
              saleAccountIdPos.push(n.saleAccountId);
              orderIdPos.push(n.orderId);
            });
            if (saleAccountIdPos.length > 0) { // 匹配订单号
              async function getData () {
                const Arr = await v.getAccountCode(pos, saleAccountIdPos);
                const newArr = await v.getProductList(Arr, orderIdPos);
                v.orderData = newArr;
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
    getCarrierBaseSetting (shippingMethodId) {
      let v = this;
      v.axios.get(api.get_shippingMethodParams + '?shippingMethodId=' + shippingMethodId).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          data.forEach((n, i) => {
            v.shippingMethodModel.push({
              value: n.paramType === '1' ? [] : '',
              paramKey: n.paramKey,
              paramValue: n.paramValue
            });
          });
          v.carrierBaseSetting = data;
        } else {
          (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.error('操作失败，请重新尝试');
        }
      });
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
      v.shippingMethodModel = [];
      v.pageParams.minTotalPrice = '';
      v.pageParams.maxTotalPrice = '';
      v.$refs['pageParams'].resetFields();
      v.payTimeArr = [];
      v.resetDate();
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
    exportOrderHasCondition () { // 导出选中
      if (this.orderData.length < 1) {
        this.$Message.error(this.v('common.noData'));
        return false;
      }
      this.exportOrder('all');
    },
    setShippingMethod (type) {
      let v = this;
      let obj;
      if ((v.orderIdList.length === 0 || v.orderIdList === null) && type !== 'all') {
        v.$Message.error('请选择订单');
        return false;
      }
      if (type !== 'all') {
        obj = {
          orderIdList: v.orderIdList,
          timeZone: v.$common.getDefaultTimezoom()
        };
      } else {
        obj = v.deepCopy(v.pageParams);
        obj.orderIdList = v.orderIdList;
      }
      v.axios.put(api.export_orders, JSON.stringify(obj)).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
          v.pageParamsStatus = true;
        } else {
          (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.error('操作失败，请重新尝试');
        }
      });
    },
    exportOrder (type) {
      let v = this;
      if ((v.orderIdList.length === 0 || v.orderIdList === null) && type !== 'all') {
        v.$Message.error('请选择订单');
        return false;
      }
      v.exportModelStatus = true;
      if (type === 'all') {
        v.exportModel.title = '导出（所有结果集）';
        v.exportModel.content = '导出所有结果集，系统将符合您当前查询选择的所有订单导出到excel，系统限制一次性只能导出不超过10000单。';
      } else {
        v.exportModel.title = '导出选中';
        v.exportModel.content = '系统将您勾选的订单导出到excel';
      }
      v.$nextTick(function () {
        v.exportModel.status = true;
      });
    },
    exportExcel (type) {
      let v = this;
      let obj = {
        orderIdList: v.orderIdList,
        platformId: ['aliexpress'],
        timeZone: v.$common.getDefaultTimezoom(),
        orderBy: v.pageParams.orderBy,
        upDown: v.pageParams.upDown
      };
      if (v.exportModel.title === '导出（所有结果集）') {
        obj = Object.assign(obj, v.pageParams);
      }
      // let newTab = window.open('about:blank');
      v.axios.post(api.export_orders, JSON.stringify(obj)).then(response => {
        if (response.data.code === 0) {
          v.orderIdList = [];
          v.pageParamsStatus = true;
          let data = response.data.datas;
          v.$Message.success({
            content: '已生成导入/导出任务，任务编号' + '：' + data,
            duration: 10,
            closable: true
          });
          // newTab.location.href = response.data.datas;
          // setTimeout(function () {
          //   newTab.close();
          // }, 1000);
        } else {
          (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.error('操作失败，请重新尝试');
        }
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
    modifyTheSort (index, status) {
      let v = this;
      v.pageParams.orderBy = v.buttonGroupModel[index].type;
      v.buttonGroupModel.forEach((n, i) => {
        if (i === index && n.selected) {
          v.buttonGroupModel[index].status = !v.buttonGroupModel[index].status;
        } else if (i === index && !n.selected) {
          n.selected = true;
        } else {
          n.selected = false;
        }
      });
      v.pageParams.upDown = v.buttonGroupModel[index].status ? 'up' : 'down';
      if (v.orderData.length > 0) {
        v.pageParamsStatus = true;
      }
    },
    validatePrice () {
      let v = this;
      let priceReg = v.$regular.priceReg;
      let validatePrice = function (rule, value, callback) {
        if (!priceReg.test(v.pageParams.minTotalPrice) || !priceReg.test(v.pageParams.maxTotalPrice)) {
          v.$Message.error('order.enterNum');
          v.pageParams.minTotalPrice = '';
          v.pageParams.maxTotalPrice = '';
          callback();
        } else {
          callback();
        }
      };
      return validatePrice;
    }
  },
  mounted () {
    let v = this;
    setTimeout(v.getCountrys(), 2000); // 获取国家区域列表
  }
};
</script >
