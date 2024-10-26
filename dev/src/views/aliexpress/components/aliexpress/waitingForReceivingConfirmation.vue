<style scoped>
.abc1 {
  margin-left: -1px;
}

.abc1 button {
  border-radius: 0;
}

.abc0 button {
  border-radius: 3px 0 0 3px;
}

.abc2 {
  margin-left: -1px;
}

.abc2 button {
  border-radius: 0 3px 3px 0;
}
</style>
<template>
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
                <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol" style="width: 28%">
                <Form-item label="收货剩余时间">
                  <keep-alive>
                    <Button-group>
                      <template>
                        <Badge v-for="(item, index) in remainDayList" :count="item.num" dot :class='["abc" + index]' :key="index">
                          <Button v-if="item.selected" type="primary" @click="getRemainDayData(index,item.id)">{{ item.title }} </Button>
                          <Button v-if="!item.selected" @click="getRemainDayData(index,item.id)">{{ item.title }} </Button>
                        </Badge>
                      </template>
                    </Button-group>
                  </keep-alive>
                </Form-item>
                </Col>
                <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol" style="width: 22%">
                <Form-item label="物流方式">
                  <Cascader v-model="shippingMethodModel" @on-visible-change="getShippingList(true)" clearable :load-data="loadData" :data="shippingMethodData" filterable transfer></Cascader>
                </Form-item>
                </Col>
                <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol" v-show="moreFilter">
                <Form-item label="国家/地区" prop="buyerCountryCodeList">
                  <dyt-select v-model="pageParams.buyerCountryCodeList" @on-change="countryChange" filterable multiple placeholder="请选择或输入所在地">
                    <Option v-for="(item,index) in formValidate.country" :key="index" :value="item.twoCode">{{ item.enName }}</Option>
                  </dyt-select>
                </Form-item>
                </Col>
                <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol" v-show="moreFilter">
                <Form-item label="付款时间">
                  <Date-picker transfer type="datetimerange" style="width:100%" @on-clear="resetDate" @on-change="getDateValue" :clearable="clearAble" format="yyyy-MM-dd HH:mm:ss" :options="dateOptions" placement="bottom-end" placeholder="选择日期" :value="payTimeArr"></Date-picker>
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
                  <Input class="filterSearch" @on-enter="searchOrder" placeholder="可输入订单号、买家ID、买家姓名、SKU、平台产品编码" v-model.trim="pageParams.searchValue"></Input>
                </Form-item>
                </Col>
              </Row>
              <Row type="flex" justify="space-between" :gutter="gutterItem" class="filter_options_button">
                <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol" :offset="1">
                <Button type="primary" @click="searchOrder" size="small" :disabled="SearchDisabled" icon="md-search">查询 </Button>
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
      <Buttons type="primary" trigger="click" @on-click="batchDelayReceivingHasCondition">
        <Button type="primary" @click="batchDelayReceiving" class="iconbuttons">
          <span class="icon iconfont">&#xe757;</span> 延长收货时间 </Button>
        <Buttons-menu slot="list">
          <Buttons-item name="1">延长收货时间（所有结果集）</Buttons-item>
        </Buttons-menu>
      </Buttons>
      <Dropdown style="margin-left: 20px">
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
              <Button size="small" @click="setTag">打标签 </Button>
              <Button size="small" @click="dropOrderTag">清空标签 </Button>
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
    <!-- single delay -->
    <keep-alive>
      <Modal v-model="delayModal.status" v-if="delayModalStatus" @on-ok="delaySingleReceiving" @on-cancle="resetDelayDay" :loading="delayModalLoading" :mask-closable="false" width="400">
        <div class="ivu-modal-confirm">
          <div class="ivu-modal-confirm-head">
            <div class="ivu-modal-confirm-head-title">{{ delayModal.title }}</div>
          </div>
          <div class="ivu-modal-confirm-body ivu-modal-confirm-body-render">
            <div class="normalTop">
              <Row>
                <Col :span="1">
                <Icon type="md-information-circle" color="#2b85e4" size="44"></Icon>
                </Col>
                <Col :span="21" :offset="2">
                <p>
                  为防止货物在运输途中的突发因素，导致买家不能及时收到货物，您可以适当延长买家收货时间。 </p>
                </Col>
              </Row>
              <Row class="normalTop">
                <Col :span="10">
                <span class="tongtool-base-inputLineHeight">延长买家收货确认时间:</span>
                </Col>
                <Col :span="10">
                <InputNumber v-model.trim="delayModal.delayDay"></InputNumber>
                </Col>
                <Col :span="3" :offset="1">
                <span class="tongtool-base-inputLineHeight">天</span>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </Modal>
    </keep-alive>
    <!-- batch delay -->
    <keep-alive>
      <Modal v-model="batchDelayModal.status" v-if="batchDelayModalStatus" @on-ok="setDelayDay" @on-cancle="resetBatchDelayDay" :loading="batchDelayModalLoading" :mask-closable="false" width="400">
        <div class="ivu-modal-confirm">
          <div class="ivu-modal-confirm-head">
            <div class="ivu-modal-confirm-head-title">{{ batchDelayModal.title }}</div>
          </div>
          <div class="ivu-modal-confirm-body ivu-modal-confirm-body-render">
            <div class="normalTop">
              <Row>
                <Col :span="1">
                <Icon type="md-information-circle" color="#2b85e4" size="44"></Icon>
                </Col>
                <Col :span="21" :offset="2">
                <p>
                  为防止货物在运输途中的突发因素，导致买家不能及时收到货物，您可以适当延长买家收货时间。 </p>
                </Col>
              </Row>
              <div class="normalTop">
                本次延长订单数量：{{ batchDelayModal.type === 'all' ? total : orderIdList.length }}
              </div>
              <div class="normalTop">
                <RadioGroup v-model="batchDelayModal.delayType" vertical>
                  <Radio label="specified">
                    <span>延长指定时长</span>
                    <InputNumber size="small" v-model="batchDelayModal.delayDay" :disabled="batchDelayModal.delayType === 'maximum' ? true : false" style="width:60px"></InputNumber>
                    <span>天</span>
                    <Checkbox v-model="batchDelayModal.isSpecifiedMaxDelay" :disabled="batchDelayModal.delayType === 'maximum' ? true : false" :true-value="1" :false-value="0">最大延长
                    </Checkbox>
                  </Radio>
                  <Radio label="maximum">
                    <span>延长最大时长</span>
                  </Radio>
                </RadioGroup>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </keep-alive>
    <keep-alive>
      <sliderModal v-model="orderDetails" :styles="{}" class="slider-model" v-if="orderDetailsBegin">
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
      </sliderModal>
    </keep-alive>
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
            <div class="odpidProductID">
              <span class="productID">{{ item.webstoreItemId }}</span>
              <span class="productHaveATitle">SKU: <em>{{ item.webstoreSku }}</em></span> <span class="productHaveATitle" v-if="inGroup ==='ebay'">物品所在地: <em>{{ item.location }}</em></span>
              <span class="productLogsticService">物流服务：<em>{{ item.buyerShippingMethod }}</em></span>
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
            <Col :span="2" :offset="2">
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
      productStatus: false, // 点击产品列表详情状态控制
      productModal: false,
      productDetails: '', // modal产品数据
      orderDetailsBegin: false,
      orderDetailsId: null,
      orderNo: null,
      timestamp: null,
      orderTagList: null,
      webstoreItemSite: null,
      delayModal: {
        status: false,
        title: '延长收货时间',
        delayDay: 0,
        type: null,
        orderId: null
      },
      batchDelayModal: {
        status: false,
        delayType: 'specified',
        title: '批量延长收货时间',
        delayDay: 0,
        type: null,
        orderId: null,
        isSpecifiedMaxDelay: 0
      },
      batchDelayModalStatus: false,
      delayModalStatus: false,
      delayModalLoading: true,
      batchDelayModalLoading: true,
      orderIdList: [],
      buttonGroupModel: [
        {
          type: 'timeoutLeftTime',
          selected: false,
          status: true, // true up false down
          title: '按收货剩余时间'
        }, {
          type: 'payTime',
          selected: true,
          status: true, // true up false down
          title: '按付款时间'
        }
      ],
      remainDayList: [
        {
          selected: false,
          id: null,
          title: '全部',
          num: 0
        }, {
          selected: true,
          id: 0,
          title: '1周内',
          num: 0
        }, {
          selected: false,
          id: 1,
          title: '1月内',
          num: 0
        }, {
          selected: false,
          id: 2,
          title: '多于1月',
          num: 0
        }, {
          selected: false,
          id: 3,
          title: '过期',
          num: 0
        }
      ],
      orderDetails: false,
      shopModal: [],
      payTimeArr: [],
      pageParamsStatus: false, // 每次更新完pageParms都要设置成true触发刷新
      totalPage: 0,
      total: 0,
      curPage: 1,
      clearAble: true,
      setTagListStatus: false,
      shippingMethodModel: [],
      shippingMethodData: [],
      pageParams: {
        pageNum: 1,
        pageSize: 50,
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
        buyerAccountId: null,
        buyerName: null,
        webstoreItemId: null,
        webstoreSku: null,
        orderNo: null,
        remainTimeType: 0
      },
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
          width: 140,
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
            }, [
              h('div', params.row.accountCode + '-' + params.row.salesRecordNumber), h('div', {
                style: {
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1296db',
                  letterSpacing: '-1px',
                  display: params.row.isCashOnDelivery === 1 ? 'block' : 'none'
                }
              }, 'COD')
            ]);
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
          title: '收货剩余时间',
          key: 'remainTime',
          width: 120,
          render: (h, params) => {
            if (params.row.orderExtendInfo) {
              let BeOverdue = (new Date(self.getDataToLocalTime(params.row.orderExtendInfo.aliexpressTimeoutLeftTime, 'fulltime')).getTime() - (new Date()).getTime()) < 0;
              return h('div', {
                style: {
                  color: BeOverdue ? '#0f5aff' : '#f00'
                }
              }, BeOverdue
                ? '逾期' + ' ' + self.getRemainTime(params.row.orderExtendInfo.aliexpressTimeoutLeftTime)
                : self.getRemainTime(params.row.orderExtendInfo.aliexpressTimeoutLeftTime));
            }
          }
        }, {
          title: '买家ID/姓名/买家等级',
          key: 'buyerName',
          width: 200,
          render: (h, params) => {
            if (params.row.orderExtendInfo) {
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
          width: 200,
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
                      self.delayModal.orderId = params.row.orderId;
                      self.delayReceiving();
                    }
                  }
                }, '延长收货时间'), h('Button', {
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
      orderData: []

    };
  },
  watch: {
    pageParamsStatus (n) {
      let v = this;
      if (n) {
        v.getList();
        v.getBadges();
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
      Promise.resolve(v.getList()).then(function () {
        v.getBadges();
        v.getShopList();
        v.$Loading.finish();
        v.getOrderListTag();// 获取标签列表
      });
    },
    getList () {
      let v = this;
      v.orderIdList = [];
      v.loadingTrue();
      v.axios.post(api.get_queryWaitingForReceipt, JSON.stringify(v.pageParams)).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          let pos = [];
          let orderIdPos = [];
          let saleAccountIdPos = [];
          if (data.list !== null && data.list.length !== 0) {
            data.list.forEach((n, i) => {
              pos.push({
                buyerName: n.buyerName, // 买家
                buyerAccountId: n.buyerAccountId,
                totalPrice: n.totalPrice,
                totalPriceCurrency: n.totalPriceCurrency,
                orderTagList: n.orderTags,
                orderId: n.orderId,
                orderExtendInfo: n.orderExtendInfo,
                productList: [],
                webstoreItemSite: n.webstoreItemSite,
                salesRecordNumber: n.salesRecordNumber,
                saleAccountId: n.saleAccountId,
                buyerCountryCode: n.buyerCountryCode,
                platformId: n.platformId,
                payTime: v.getDataToLocalTime(n.payTime, 'fulltime'),
                waitReceiptTime: n.waitReceiptTime,
                platformOrderStatus: n.platformOrderStatus,
                isCashOnDelivery: n.isCashOnDelivery
              });
              saleAccountIdPos.push(n.saleAccountId);
              orderIdPos.push(n.orderId);
            });
            if (saleAccountIdPos.length > 0) {
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
    resetDate () {
      let v = this;
      v.pageParams.payStartTime = null;
      v.pageParams.payEndTime = null;
    },
    reset () {
      let v = this;
      v.shippingMethodModel = [];
      v.pageParams.merchantShippingMethodId = null;
      v.pageParams.merchantCarrierId = null;
      v.pageParams.minTotalPrice = '';
      v.pageParams.maxTotalPrice = '';
      v.getRemainDayData(1, 1);
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
    searchOrder () {
      let v = this;
      if (v.shippingMethodModel.length !== 0) {
        v.pageParams.merchantShippingMethodId = v.shippingMethodModel[1][0];// 物流方式ID
        v.pageParams.merchantCarrierId = v.shippingMethodModel[0];
      } else {
        v.pageParams.merchantShippingMethodId = null;
        v.pageParams.merchantCarrierId = null;
      }
      v.loading = true;
      v.pageParamsStatus = true;
      v.curPage = 1;
      v.pageParams.pageNum = 1;
    },
    getRemainDayData (index, id) { // 剩余时间筛选
      var v = this;
      v.pageParams.remainTimeType = id;
      v.remainDayList.forEach((n, i) => {
        if (i === index) {
          n.selected = true;
        } else {
          n.selected = false;
        }
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
    delaySingleReceiving (orderId) {
      let v = this;
      if (v.delayModal.delayDay === '' && v.delayModal.delayDay) {
        v.$Message.error('延长收货时间不能为空且必须为整数');
        v.delayModalLoading = false;
        v.$nextTick(function () {
          v.delayModalLoading = true;
        });
        return false;
      }
      let obj = {
        orderId: v.delayModal.orderId,
        delayDays: Number(v.delayModal.delayDay)
      };
      v.axios.put(api.set_singleDelay, JSON.stringify(obj)).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
          v.pageParamsStatus = true;
          v.resetDelayDay();
        } else {
          (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.error('操作失败，请重新尝试');
          v.delayModalLoading = false;
          v.$nextTick(function () {
            v.delayModalLoading = true;
          });
        }
      });
    },
    batchDelayReceivingHasCondition () {
      this.batchDelayReceiving('all');
    },
    batchDelayReceiving (type) {
      let v = this;
      if (type !== 'all' && v.orderIdList.length === 0) {
        v.$Message.error('请选择订单');
        return false;
      }
      if (type === 'all') {
        v.batchDelayModal.title = '批量延长收货时间（所有结果集）';
        v.batchDelayModal.type = 'all';
      } else {
        v.batchDelayModal.type = 'select';
        v.batchDelayModal.title = '批量延长收货时间';
      }
      v.batchDelayModalStatus = true;
      v.$nextTick(function () {
        v.batchDelayModal.status = true;
      });
    },
    delayReceiving () {
      let v = this;
      v.delayModal.type = 'single';
      v.delayModal.title = '延长收货时间';
      v.delayModalStatus = true;
      v.$nextTick(function () {
        v.delayModal.status = true;
      });
    },
    setDelayDay () {
      let v = this;
      if (v.batchDelayModal.delayDay === '' && v.batchDelayModal.delayDay) {
        v.$Message.error('延长收货时间不能为空且必须为整数');
        v.delayModalLoading = false;
        v.$nextTick(function () {
          v.delayModalLoading = true;
        });
        return false;
      }
      let obj = {};
      if (v.batchDelayModal.type === 'select') {
        obj.delayDays = Number(v.batchDelayModal.delayDay);
        obj.orderIdList = v.orderIdList;
      } else {
        obj = v.deepCopy(v.pageParams);
        obj.orderIdList = v.orderIdList;
        obj.delayDays = Number(v.batchDelayModal.delayDay);
      }
      obj.delayDays = v.batchDelayModal.delayDay;
      obj.delayType = v.batchDelayModal.delayType;
      obj.isSpecifiedMaxDelay = v.batchDelayModal.isSpecifiedMaxDelay;
      obj.platformId = ['aliexpress'];
      v.axios.put(api.set_delayWaitingForReceipt, JSON.stringify(obj)).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
          v.resetBatchDelayDay();
          v.pageParamsStatus = true;
        } else {
          (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.error('操作失败，请重新尝试');
          v.delayModalLoading = false;
          v.$nextTick(function () {
            v.delayModalLoading = true;
          });
        }
      });
    },
    resetDelayDay () {
      let v = this;
      v.delayModal.status = false;
      v.delayModal.delayDay = '';
    },
    resetBatchDelayDay () {
      let v = this;
      v.batchDelayModal.status = false;
      v.batchDelayModal.delayType = 'specified';
      v.batchDelayModal.title = '批量延长收货时间';
      v.batchDelayModal.delayDay = '';
      v.batchDelayModal.type = null;
      v.batchDelayModal.isSpecifiedMaxDelay = 0;
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
    showPicModal (data) {
      let v = this;
      v.productStatus = true;
      v.$nextTick(function () {
        v.productModal = true;
        v.productDetails = data;
      });
    },
    closeModal () {
      this.productModal = false;
    },
    getBadges () {
      let v = this;
      let platformId = ['aliexpress'];
      v.axios.get(api.get_queryWaitingForReceiptBadges + '?platformId=' + platformId).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          v.$nextTick(function () {
            v.remainDayList[1].num = data.remainInOneWeek;
            v.remainDayList[2].num = data.remainInOneMonth;
            v.remainDayList[3].num = data.remainManyDays;
            v.remainDayList[4].num = data.remainExpired;
          });
        }
      });
    }
  },
  mounted () {
    let v = this;
    setTimeout(v.getCountrys(), 2000); // 获取国家区域列表
  }
};
</script >
