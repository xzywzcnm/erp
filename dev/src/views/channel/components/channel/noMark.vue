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
    <div class="noMarkFilter">
      <div class="card-container">
        <div class="card-content">
          <Form ref="pageParams" :model="pageParams" :label-width="70" label-position="left">
            <div class="platformParamsSelect">
              <div class="filterItem">
                <Form-item label="忽略">
                  <local-buttons :data="ignoreList" :value.sync="pageParams.syncIgnore" @btnClick="searchOrder"></local-buttons>
                </Form-item>

              </div>
              <div class="filterItem">
                <Form-item label="发货剩余时间">
                  <keep-alive>
                    <Button-group>
                      <template v-for="(item, index) in remainDayList">
                        <Button v-if="item.selected" type="primary" :key="index" @click="getRemainDayData(index,item.id)">{{ item.title }} </Button>
                        <Button v-if="!item.selected" @click="getRemainDayData(index,item.id)" :key="index">{{ item.title }} </Button>
                      </template>
                    </Button-group>
                  </keep-alive>
                </Form-item>
              </div>
              <div class="filterItem">
                <Form-item label="同步状态">
                  <keep-alive>
                    <Button-group>
                      <template v-for="(item, index) in asyncStatusList">
                        <Button v-if="item.selected" type="primary" @click="getAsyncStatusData(index,item.id)" :key="index">{{ item.title }} </Button>
                        <Button v-if="!item.selected" @click="getAsyncStatusData(index,item.id)" :key="index">{{ item.title }} </Button>
                      </template>
                    </Button-group>
                  </keep-alive>
                </Form-item>
              </div>
              <div class="filterItem">
                <Form-item label="仓库" prop="warehouseCode">
                  <dyt-select
                    v-model="pageParams.warehouseCode"
                    :max-tag-count="1"
                    multiple
                    placeholder="请选择仓库"
                  >
                    <Option v-for="(item, index) in warehouseList" :value='item.warehouseCode' :key="`ware-${index}`">{{item.warehouseName}}</Option>
                  </dyt-select>
                </Form-item>
              </div>
              <div class="filterItem">
                <Form-item label="发货状态" class="notplatformParamsSelect">
                  <keep-alive>
                    <Button-group>
                      <template v-for="(item, index) in shippingStatusList">
                        <Button v-if="item.selected" type="primary" @click="getOrderStatusData(index,item.id)" :key="index">{{ item.title }} </Button>
                        <Button v-if="!item.selected" @click="getOrderStatusData(index,item.id)" :key="index">{{ item.title }} </Button>
                      </template>
                    </Button-group>
                  </keep-alive>
                </Form-item>
              </div>
              <div class="formNorwap">
                <Row>
                  <Col :lg="twoItemLg" :md="twoItemMd">
                  <template>
                    <Form-item label="标签" prop="tagIdList">
                      <dyt-select v-model="pageParams.tagIdList" @on-change="tagChange" filterable multiple placeholder="请选择或搜索标签">
                        <Option v-for="item in tagsList" :key="item.tagId" :value="item.tagId" :v="item.tagId">{{ item.tagName }}</Option>
                      </dyt-select>
                    </Form-item>
                  </template>
                  </Col>
                  <Col :lg="twoItemLg" :md="twoItemMd" offset="1">
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
                </Row>
              </div>
            </div>
            <div class="platformParamsMoreSection" :class="{none : !moreFilter}">
              <Row>
                <Col :lg="threeItemLg" :md="threeItemMd">
                <Form-item label="物流方式">
                  <Cascader transfer v-model="shippingMethodModel" @on-visible-change="showShippingDataNoAuth" :load-data="loadData" :data="shippingMethodData" filterable></Cascader>
                </Form-item>
                </Col>
                <Col :lg="threeItemLg" :md="threeItemMd" :offset="1">
                <Form-item label="订单号" prop="orderNo">
                  <dyt-input-tag type="textarea" v-model="pageParams.orderNo" :limit="1" :string="true" placeholder="请输入订单号,多个请用逗号隔开" />
                </Form-item>
                </Col>
                <Col :lg="threeItemLg" :md="threeItemMd">
                <Form-item label="国家/地区" prop="buyerCountryCodeList">
                  <dyt-select v-model="pageParams.buyerCountryCodeList" @on-change="countryChange" filterable multiple placeholder="请选择或输入所在地">
                    <Option v-for="(item,index) in formValidate.country" :key="index" :value="item.twoCode" :v="item.cnName">{{ item.enName }}</Option>
                  </dyt-select>
                </Form-item>
                </Col>
              </Row>
              <Row class="normalTop">
                <Col :span="5">
                <Form-item label="买家姓名" prop="buyerName">
                  <Input placeholder="请输入买家姓名" v-model.trim="pageParams.buyerName"></Input>
                </Form-item>
                </Col>
                <Col :span="5" :offset="1">
                <Form-item label="买家ID" prop="buyerAccountId">
                  <Input placeholder="请输入买家ID" v-model.trim="pageParams.buyerAccountId"></Input>
                </Form-item>
                </Col>
                <Col :span="5" :offset="1">
                <Form-item label="平台产品编码" prop="webstoreItemId">
                  <Input placeholder="请输入平台产品编码" v-model.trim="pageParams.webstoreItemId"></Input>
                </Form-item>
                </Col>
                <Col :span="5" :offset="1">
                <Form-item label="SKU" prop="webstoreSku">
                  <dyt-input-tag type="textarea" placeholder="请输入SKU, 多个请用逗号隔开" :limit="1" :string="true" v-model="pageParams.webstoreSku" />
                </Form-item>
                </Col>
              </Row>
            </div>
            <div class="platformSearch clear" v-if="!moreFilter">
              <Row>
                <Col :lg="oneItemLg" :md="oneItemMd">
                <div class="filterItem">
                  <Form-item label="搜索字符" prop="searchValue">
                    <Input type="textarea" placeholder="可输入订单号、买家ID、买家姓名、SKU、平台产品编码" v-model.trim="pageParams.searchValue" @on-enter="searchOrder">
                    </Input>
                  </Form-item>
                </div>
                </Col>
              </Row>
            </div>
            <div class="filterItem filterConfirm" :class="{normalTop : moreFilter}" v-if="isAdmin || controlList.orderInfo_queryForMarkShipments">
              <Button type="primary" @click="searchOrder" size="small" :disabled="SearchDisabled" icon="md-search">查询 </Button>
              <Button @click="reset" size="small" v-once icon="md-refresh">重置 </Button>
            </div>
          </Form>
        </div>
      </div>
      <div class="moreFilter">
        <Button size="small" @click="toggleMoreFilter">
          {{ moreFilterMes }}
          <Icon :type="moreFilterIcon" size="small"></Icon>
        </Button>
      </div>
    </div>
    <div class="dataSort">
      <span>排序：</span>
      <Button-group>
        <template v-for="(item, index) in buttonGroupModel">
          <Button v-if="item.selected" :disabled="SearchDisabled" type="primary" @click="modifyTheSort(index, item.status)" :key="index">
            {{ item.title }}
            <Icon type="md-arrow-round-up" v-if="item.status && item.selected"></Icon>
            <Icon type="md-arrow-round-down" v-if="!item.status && item.selected"></Icon>
          </Button>
          <Button v-if="!item.selected" :disabled="SearchDisabled" @click="modifyTheSort(index, item.status)" :key="index">
            {{ item.title }}
            <Icon type="md-arrow-round-up" v-if="item.status && item.selected"></Icon>
            <Icon type="md-arrow-round-down" v-if="!item.status && item.selected"></Icon>
          </Button>
        </template>
      </Button-group>
    </div>
    <div class="tableControl">
      <Buttons v-if="pageParams.syncStatus !== 2" type="primary" trigger="click" @on-click="markShipmentsHasCondition" :disabled="!getPermission('orderInfo_updateForShipments_batch')">
        <Button type="primary" @click="markShipments" :disabled="!getPermission('orderInfo_updateForShipments_batch')">
          <Icon type="checkmark-round"></Icon>
          批量标发货
        </Button>
        <Buttons-menu slot="list">
          <Buttons-item name="1" :disabled="!getPermission('orderInfo_updateForShipments_all')">标发货（所有结果集）
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
            <order-label-tag v-model="tagIdList" :tags-list="tagsList" />
            <div class="tagsSelectFooter">
              <Button size="small" @click="setTag" :disabled="!getPermission('orderTag_insert_batch')">打标签 </Button>
              <Button size="small" @click="dropOrderTag" :disabled="!getPermission('orderTag_clear')">清空标签 </Button>
            </div>
          </div>
        </Poptip>
      </Dropdown>
      <Checkbox class="tcDropDown" v-model="showAbnormalOrder" @on-change="showAbnormalOrderChange">显示存在"订单异常"数据
      </Checkbox>
      <Button v-if="pageParams.syncIgnore === 0 && getPermission('orderInfo_batchSyncIgnore')" class="ml15" @click="markIgnoredBatchWay">标记忽略 </Button>
    </div>
    <div class="orderTable normalTop" v-if="getPermission('orderInfo_queryForMarkShipments')">
      <Table highlight-row border :columns="orderColumn" :height="tableHeight" :loading="tableLoading" :data="orderData" @on-selection-change="getSelectValue"></Table>
      <div class="table-page">
        <div class="table-page-right">
          <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator :current="curPage" show-sizer @on-page-size-change="changePageSize" placement="top" :page-size-opts="pageArray"></Page>
        </div>
      </div>
    </div>
    <keep-alive>
      <Modal v-model="markshipmentModel.status" :mask-closable="false" width="400" v-if="markshipmentStatus" @on-ok="setMarkshipment">
        <div class="ivu-modal-confirm">
          <div class="ivu-modal-confirm-head">
            <div class="ivu-modal-confirm-head-title">{{ markshipmentModel.title }}</div>
          </div>
          <div class="ivu-modal-confirm-body ivu-modal-confirm-body-render">
            <div class="normalTop">
              <Row>
                <Col :span="1">
                <Icon type="md-information-circle" color="#2b85e4" size="44"></Icon>
                </Col>
                <Col :span="21" :offset="2">
                <p>
                  {{ markshipmentModel.content }} </p>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </Modal>
    </keep-alive>
    <keep-alive>
      <sliderModal v-model="orderDetails" :spinShow="spinShow" :styles="{}" class="slider-model" v-if="orderDetailsBegin">
        <orderDetails
          :orderDetailsId="orderDetailsId"
          @reloadTag="reloadTag"
          :timestamp="timestamp"
          :orderNo="orderNo"
          :loading="tableLoading"
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
      warehouseList: [], // 仓库数据
      warehouseJson: {},
      markshipmentModel: {
        title: '',
        content: '',
        status: false
      },
      markshipmentStatus: false,
      buttonGroupModel: [
        {
          type: 'remainTime',
          selected: true,
          status: true, // true up false down
          title: '按剩余时间'
        }, {
          type: 'payTime',
          selected: false,
          status: true, // true up false down
          title: '按付款时间'
        }
      ],
      showAbnormalOrder: false,
      pageParams: {
        pageNum: 1,
        pageSize: 50,
        syncIgnore: 0,
        saleAccountIds: [],
        remainTimeType: 1, // 剩余天数
        deliveryStatus: null, // 发货状态
        searchValue: null,
        merchantShippingMethodId: null, // 物流方式ID
        merchantCarrierId: null,
        buyerCountryCodeList: [],
        syncStatus: 1,
        tagIdList: [],
        warehouseCode: [],
        platformId: [this.inGroup],
        orderBy: 'remainTime', // remainTime,payTime
        upDown: 'up',
        buyerName: null,
        buyerAccountId: null,
        webstoreItemId: null,
        webstoreSku: null,
        orderNo: null,
        showAbnormalOrder: 0
      },
      moreFilter: false, // 高级筛选
      moreFilterIcon: 'md-arrow-dropdown',
      moreFilterMes: '更多选项（国家/地区、物流方式等）',
      pageParamsStatus: false, // 每次更新完pageParms都要设置成true触发刷新
      totalPage: 0,
      total: 0,
      curPage: 1,
      countryModal: [],
      markCountryModal: [],
      formValidate: {
        country: []
      },
      remainDayList: [
        {
          selected: false,
          id: null,
          title: '全部',
          num: 0
        }, {
          selected: true,
          id: 1,
          title: '1天内',
          num: 0
        }, {
          selected: false,
          id: 0,
          title: '逾期',
          num: 0
        }, {
          selected: false,
          id: 2,
          title: '多于1天',
          num: 0
        }
      ],
      asyncStatusList: [
        {
          selected: true,
          id: 1,
          title: '未标'
        }, {
          selected: false,
          id: 4,
          title: '标失败'
        }, {
          selected: false,
          id: 2,
          title: '正在标'
        }
      ],
      shippingStatusList: [
        {
          selected: true,
          id: null,
          title: '全部'
        }, {
          selected: false,
          id: 1,
          title: '已出库'
        }, {
          selected: false,
          id: 2,
          title: '已打印'
        }, {
          selected: false,
          id: 3,
          title: '已下发物流（待打印）'
        },

        {
          selected: false,
          id: 4,
          title: '已指定物流方式（待下发物流）'
        }, {
          selected: false,
          id: 5,
          title: '未指定物流方式'
        }, {
          selected: false,
          id: 6,
          title: '缺货'
        }
      ],
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
          align: 'center',
          width: 66,
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
          title: '买家ID/姓名',
          key: 'buyerName',
          align: 'center',
          width: 180,
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
          align: 'center',
          key: 'buyerCountryCode',
          width: 120
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
          align: 'center',
          width: 160,
          render: (h, params) => {
            return h('span', self.getDataToLocalTime(params.row.payTime, 'fulltime'));
          }
        }, {
          title: '包裹号' + '/' + '物流方式' + '/' + '运单号',
          key: 'psw',
          width: 200,
          align: 'center',
          render: (h, params) => {
            let n = params.row.carrierShippingMethodOrderBo;
            if (n !== null) {
              return h('div', self.getPSWDetails(n, h));
            } else {
              return '';
            }
          }
        }, {
          title: '订单异常',
          key: 'orderStatus',
          align: 'center',
          width: 150,
          render: (h, params) => {
            return h('div', [
              h('div', [
                params.row.unMatchProduct === -1 ? h('div', '商品未匹配') : ''
              ]), h('div', [
                params.row.notesCheckingOk === 0 && params.row.isSuspended === 1 ? h('div', [
                  h('span', '有留言' + ','), h('span', '截留')
                ]) : params.row.notesCheckingOk === 0 && params.row.isSuspended !== 1
                  ? h('div', '有留言')
                  : params.row.isSuspended === 1 && params.row.notesCheckingOk !== 0
                    ? h('div', '截留')
                    : params.row.notesCheckingOk !== 0 && params.row.isSuspended !== 1 ? h('div', '-') : ''
              ])
            ]);
          }
        }, {
          title: '发货剩余时间',
          align: 'center',
          key: 'remainTime',
          width: 160,
          render: (h, params) => {
            let remainTime;
            if (self.pageParams.remainTimeType === 0 && params.row.remainTime === 0) {
              remainTime = '逾期';
            } else {
              remainTime = self.getLimitTime(params.row.remainTime);
            }
            return h('div', {
              style: {
                color: '#f00'
              }
            }, remainTime);
          }
        }, {
          title: '标签',
          align: 'center',
          key: 'tags',
          width: 130,
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
          title: '备注',
          align: 'center',
          key: 'remarkContent',
          resizable: true,
          width: 200
        }, {
          title: '操作',
          align: 'center',
          key: 'operate',
          fixed: 'right',
          width: 250,
          render: (h, params) => {
            return h('div', [
              !self.getPermission('orderInfo_updateForShipments_single') || (params.row.syncStatus !== 2 ? h('Button', {
                props: {
                  size: 'small'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    self.setMarkshipment('single', params.row.orderId);
                  }
                }
              }, '标发货') : ''), !self.getPermission('orderInfo_detail') || h('Button', {
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
              }, '订单详情'), h('Button', {
                props: {
                  size: 'small'
                },
                style: {
                  marginRight: '5px',
                  display: (() => {
                    return self.getPermission('orderInfo_syncIgnore') && self.pageParams.syncIgnore === 0
                      ? 'inline-block'
                      : 'none';
                  })()
                },
                on: {
                  click: () => {
                    self.markIgnored(params.row.orderId);
                  }
                }
              }, '标记忽略'), h('Button', {
                props: {
                  size: 'small'
                },
                style: {
                  marginRight: '5px',
                  display: (() => {
                    return self.getPermission('orderInfo_cancelSyncIgnore') && self.pageParams.syncIgnore === 1
                      ? 'inline-block'
                      : 'none';
                  })()
                },
                on: {
                  click: () => {
                    self.reductionMt(params.row.orderId);
                  }
                }
              }, '还原')

            ]);
          }
        }
      ],
      orderData: [],
      orderIdList: [],
      setTagListStatus: false,
      shippingMethodModel: [],
      shippingMethodData: [],
      orderDetails: false,
      orderDetailsBegin: false,
      orderDetailsId: null,
      orderNo: null,
      timestamp: null,
      orderTagList: null,
      webstoreItemSite: null
    };
  },
  props: {
    tabTimestamp: Number
  },
  watch: {
    pageParamsStatus (n) {
      let v = this;
      if (n) {
        v.getList();
        v.pageParamsStatus = false;
      }
    },
    tabTimestamp (n, o) {
      let v = this;
      if (n !== o && n !== null) {
        v.pageParamsStatus = true;
      }
    }
  },
  computed: {
    tableHeight () {
      return this.getTableHeight(510);
    }
  },
  created() {
    this.getWarehouseData();
  },
  methods: {
    // 获取仓库数据
    getWarehouseData () {
      this.axios.post(api.get_warehouseList, { warehouseStatus: '0' }).then(res => {
        if (res && res.data && res.data.code === 0 && res.data.datas) {
          (res.data.datas || []).forEach(item => {
            this.warehouseJson[item.warehouseCode] = item;
          })
          this.warehouseList = res.data.datas || [];
        }
      })
    },
    startLoading () {
      let v = this;
      v.$Loading.start();
      Promise.resolve(v.getPermission('orderInfo_queryForMarkShipments')
        ? v.getList()
        : v.gotoError()).then(function () {
        v.$Loading.finish();
        v.getShopList(); // 获取店铺
        v.getOrderListTag();// 获取标签列表
      });
    },
    getNewParams (pageParams) {
      let params = this.$common.copy(pageParams);
      const list = ['remainTimeType', 'syncStatus', 'hasTrackingNumber', 'deliveryStatus'];
      let obj = {};
      list.forEach(key => {
        obj[key] = params[key] === -1 ? null : params[key];
      })
      let warehouseIds = [];
      params.warehouseCode.forEach(item => {
        if (this.warehouseJson[item]) {
          warehouseIds.push(this.warehouseJson[item].warehouseId);
        }
      })
      delete params.warehouseCode;
      params.warehouseIdList = warehouseIds;
      return { ...params, ...obj };
    },
    getList () {
      let v = this;
      v.orderData = [];
      v.loadingTrue();
      v.axios.post(api.get_shipmentsList, v.getNewParams(v.pageParams)).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          let pos = [];
          let saleAccountIdPos = [];
          if (data.list !== null) {
            data.list.forEach((n, i) => {
              pos.push({
                buyerName: n.buyerName, // 买家
                totalPrice: n.totalPrice,
                totalPriceCurrency: n.totalPriceCurrency,
                orderId: n.orderId,
                buyerAccountId: n.buyerAccountId,
                buyerCountryCode: n.buyerCountryCode,
                merchantCarrierId: n.merchantCarrierId,
                merchantId: n.merchantId,
                merchantShippingMethodId: n.merchantShippingMethodId,
                carrierShippingMethodOrderBo: n.carrierShippingMethodOrderBo,
                orderStatus: n.orderStatus,
                webstoreItemSite: n.webstoreItemSite,
                webstoreOrderId: n.webstoreOrderId,
                remainTime: n.remainTime,
                payTime: n.payTime,
                accountCode: '',
                trackingNumber: n.trackingNumber,
                orderTagList: n.orderTags,
                salesRecordNumber: n.salesRecordNumber,
                saleAccountId: n.saleAccountId,
                isSuspended: n.isSuspended,
                notesCheckingOk: n.notesCheckingOk,
                synDeliverErrorMsg: n.synDeliverErrorMsg,
                syncStatus: v.pageParams.syncStatus,
                unMatchProduct: n.unMatchProduct
              });
              saleAccountIdPos.push(n.saleAccountId);
            });
          } else {
            v.orderData = [];
          }
          if (saleAccountIdPos.length > 0) { // 匹配订单号
            v.axios.post(api.get_saleAccountById + '?saleAccountIds=' + saleAccountIdPos).then(response => {
              if (response.data.code === 0) {
                let list = response.data.datas;
                for (var i = 0; i < list.length; i++) {
                  for (var t = 0; t < pos.length; t++) {
                    if (pos[t].saleAccountId === list[i].saleAccountId) {
                      pos[t].accountCode = list[i].accountCode;
                    }
                  }
                }

                v.getOrderRemark(pos, pos.map(i => i.orderId)).then(data => {
                  v.orderData = data;
                }); // 匹配订单备注
              }
            });
          }
          v.$nextTick(function () {
            v.total = Number(data.total);
            v.totalPage = Number(data.pages);
            v.loadingFalse();
            v.getCount();
          });
        } else {
          v.loadingFalse();
        }
      }).catch(() => {
        v.loadingFalse();
      });
    },
    getCount () {
      let v = this;
      let page = this.$store.state.inGroup;
      let platformId = ['ebay'];
      if (page === 'aliexpress') {
        platformId = ['aliexpress'];
      }
      v.axios.get(api.get_markShipmentNum + '?platformId=' + platformId).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          v.$nextTick(function () {
            v.remainDayList[1].num = data.remainInOneDay;
            v.remainDayList[2].num = data.overdueOrder;
            v.remainDayList[3].num = data.remainManyDays;
          });
        }
      });
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
    getAsyncStatusData (index, id) { // 同步状态筛选
      var v = this;
      v.pageParams.syncStatus = id;
      v.asyncStatusList.forEach((n, i) => {
        if (i === index) {
          n.selected = true;
        } else {
          n.selected = false;
        }
      });
    },
    getOrderStatusData (index, id) { // 订单状态更新
      let v = this;
      v.pageParams.deliveryStatus = id;
      v.shippingStatusList.forEach((n, i) => {
        if (i === index) {
          n.selected = true;
        } else {
          n.selected = false;
        }
      });
    },
    reset () {
      let v = this;
      v.$refs['pageParams'].resetFields();
      v.getOrderStatusData(0, null);
      v.getAsyncStatusData(0, 1);
      v.getRemainDayData(1, 1);
      v.shippingMethodModel = [];
    },
    searchOrder () {
      let v = this;
      if (v.pageParams.syncStatus === 4 && JSON.stringify(v.orderColumn).indexOf('synDeliverErrorMsg') < 0) {
        let failColumn = {
          title: '失败原因',
          key: 'synDeliverErrorMsg',
          minWidth: 200
        };
        v.orderColumn.splice(3, 0, failColumn);
      } else if (v.pageParams.syncStatus !== 4 && JSON.stringify(v.orderColumn).indexOf('synDeliverErrorMsg') > 0) {
        v.orderColumn.splice(3, 1);
      }
      if (v.shippingMethodModel.length > 0) {
        v.pageParams.merchantShippingMethodId = v.shippingMethodModel[1][0];// 物流方式ID
        v.pageParams.merchantCarrierId = v.shippingMethodModel[0];
      }
      v.search();
    },
    showAbnormalOrderChange (val) {
      if (val) {
        this.pageParams.showAbnormalOrder = 1;
      } else {
        this.pageParams.showAbnormalOrder = 0;
      }
      this.searchOrder();
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
    markShipmentsHasCondition (val) {
      if (val === '1') {
        this.markShipments('all');
      }
    },
    markShipments (type) {
      let v = this;
      if ((v.orderIdList.length === 0 || v.orderIdList === null) && type !== 'all') {
        v.$Message.error('请选择订单');
        return false;
      }
      v.markshipmentStatus = true;
      if (type !== 'all') {
        v.markshipmentModel.title = '批量标发货';
        v.markshipmentModel.content = '系统将会把选中的订单在' + v.$store.state.inGroup + '后台' + v.$store.state.inGroup + '平台上标记为发货';
      } else {
        v.markshipmentModel.title = '标发货（所有结果集）';
        v.markshipmentModel.content = '系统将会把符合您当前查询条件的所有订单在' + v.$store.state.inGroup + '后台' + v.$store.state.inGroup + '平台上标记为发货';
      }
      v.$nextTick(function () {
        v.markshipmentModel.status = true;
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
    setMarkshipment (type, oid) {
      let v = this;
      let obj;
      if (type !== 'single') {
        obj = {
          orderIdList: v.orderIdList,
          platformId: ['ebay']
        };
      } else {
        obj = {
          orderIdList: [oid],
          platformId: ['ebay']
        };
      }
      if (v.markshipmentModel.title === '标发货（所有结果集）' && type !== 'single') {
        obj = Object.assign(v.pageParams, obj);
      }
      v.axios.put(api.markShipment, JSON.stringify(obj)).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
          v.pageParamsStatus = true;
          v.orderIdList = [];
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
    getPSWDetails (n, h) {
      let arr = [];
      for (let i = 0; i < n.length; i++) {
        let item = n[i];
        arr.push(h('div', [
          h('div', {
            class: 'redColor',
            style: {
              marginRight: '5px'
            }
          }, item.packageCode),
          h('div', item.carrierName !== null ? item.carrierName + '>' + item.carrierShippingMethodName : ''),
          h('div', {
            class: 'greenColor'
          }, item.trackingNumber)
        ]));
        if (i === n.length - 1) {
          return arr;
        }
      }
    }
  },
  mounted () {
    let v = this;
    setTimeout(v.getCountrys(), 2000);// 获取国家区域列表
  }
};
</script>
