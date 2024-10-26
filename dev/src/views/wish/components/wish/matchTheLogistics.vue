<template>
  <div>
    <div class="commonFilter">
      <div class="card-container">
        <div class="card-content">
          <div class="platformParamsSelect">
            <Form ref="pageParams" :model="pageParams" :label-width="labelWidth">
              <dyt-filter>
                <Form-item label="国家/地区" prop="buyerCountryCodeList">
                  <dyt-Select
                    v-model="pageParams.buyerCountryCodeList"
                    @on-change="countryChange"
                    multiple
                    placeholder="请选择国家/地区"
                    :max-tag-count="1"
                  >
                    <Option v-for="(item, index) in formValidate.country" :key="index" :value="item.twoCode" :v="item.cnName">{{ item.enName }}</Option>
                  </dyt-Select>
                </Form-item>
                <Form-item label="付款时间">
                  <Date-picker transfer type="datetimerange" style="width:100%" @on-clear="resetDate" @on-change="getDateValue" :clearable="clearAble" format="yyyy-MM-dd HH:mm:ss" :options="dateOptions" placement="bottom-end" placeholder="选择日期" :value="payTimeArr"></Date-picker>
                </Form-item>
                <Form-item label="店铺" prop="saleAccountIds">
                  <dytStoreSelect
                    v-model="pageParams.saleAccountIds"
                    :option-data="shopList"
                    :replace-option-key="{ value: 'saleAccountId', label: 'accountCode' }"
                    placeholder="请选择店铺，可输入搜索"
                    input-placeholder="请输入店铺，多个店铺可用逗号或换行隔开"
                  />
                </Form-item>
                <Form-item label="包裹号" prop="packageCode">
                  <dyt-input placeholder="请输入包裹号" v-model.trim="pageParams.packageCode"></dyt-input>
                </Form-item>
                <Form-item label="金额" prop="searchPrice">
                  <dyt-input v-model.trim="pageParams.searchPrice"> <dyt-Select v-model="pageParams.priceOperator" value="大于" slot="prepend" style="width: 60px">
                    <Option value=">" label=">"></Option>
                    <Option value=">=" label=">="></Option>
                    <Option value="=" label="="></Option>
                    <Option value="<=" label="<="></Option>
                    <Option value="<" label="<"></Option>
                  </dyt-Select> <dyt-Select v-model="pageParams.priceCurrency" value="USD" slot="append" style="width: 60px">
                    <Option value="USD">USD</Option>
                  </dyt-Select> </dyt-input>
                </Form-item>
                <Form-item label="订单号" prop="orderNo">
                  <dyt-input-tag type="textarea" placeholder="请输入订单号,多个订单号用逗号分隔" :limit="1" :string="true" v-model="pageParams.orderNo"></dyt-input-tag>
                </Form-item>
                <Form-item label="买家姓名" prop="buyerName">
                  <dyt-input placeholder="请输入买家姓名" v-model.trim="pageParams.buyerName"></dyt-input>
                </Form-item>
                <Form-item label="买家ID" prop="buyerAccountId">
                  <dyt-input placeholder="请输入买家ID" v-model.trim="pageParams.buyerAccountId"></dyt-input>
                </Form-item>
                <Form-item label="平台产品编码" prop="webstoreItemId">
                  <dyt-input placeholder="请输入平台产品编码" v-model.trim="pageParams.webstoreItemId"></dyt-input>
                </Form-item>
                <Form-item label="SKU" prop="webstoreSku">
                  <dyt-input-tag type="textarea" placeholder="请输入SKU" :limit="1" :string="true" v-model="pageParams.webstoreSku"></dyt-input-tag>
                </Form-item>
                <Form-item label="搜索字符" prop="searchValue">
                  <dyt-input-tag type="textarea" :limit="1" :string="true" placeholder="可输入订单号、包裹号、买家ID、买家姓名、SKU、平台产品编码" v-model="pageParams.searchValue" @on-enter="search">
                  </dyt-input-tag>
                </Form-item>
                <div slot="operation">
                  <Button type="primary" @click="search" :disabled="SearchDisabled" icon="md-search">查询 </Button>
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
        <Buttons type="primary" trigger="click" @on-click="matchTheLogisticsOrderHasCondition" :disabled="!getPermission('orderShippingInfo_batchSetShippingMethod_batch')">
          <Button type="primary" @click="matchTheLogisticsOrder" :disabled="!getPermission('orderShippingInfo_batchSetShippingMethod_batch')">
            <Icon type="arrow-shrink"></Icon>
            指定仓库物流方式
          </Button>
          <Buttons-menu slot="list">
            <Buttons-item name="1" :disabled="!getPermission('orderShippingInfo_batchSetShippingMethod_all')">指定仓库物流方式（所有结果集）
            </Buttons-item>
          </Buttons-menu>
        </Buttons>
        <Dropdown style="margin-left: 20px" v-if="getPermission('orderTransaction_batchMatchWarehouseRules')">
          <Button type="primary">
            匹配仓库/邮寄方式
            <Icon type="ios-arrow-down"></Icon>
          </Button>
          <DropdownMenu slot="list">
            <DropdownItem @click.native="matchingWarehouse('check')">匹配选中订单
            </DropdownItem>
            <DropdownItem @click.native="matchingWarehouse('all')">批量匹配所有订单
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
      <div class="dataSort grayBg" style="display: inline-block;background: none;border: none;padding: 0;margin: 0;">
        <span>排序：</span>
        <Button-group>
          <template v-for="(item, index) in buttonGroupModel">
            <Button v-if="item.selected" :disabled="SearchDisabled" type="primary" @click="modifyTheSort(index,item.status)" :key="index">
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
    <div class="orderTable normalTop">
      <Table highlight-row :loading="tableLoading" border :height="tableHeight" :columns="orderColumn" :data="orderData" @on-selection-change="getSelectValue"></Table>
      <div class="table-page">
        <div class="table-page-right">
          <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator :current="curPage" show-sizer @on-page-size-change="changePageSize" placement="top" :page-size-opts="pageArray"></Page>
        </div>
      </div>
    </div>
    <Modal v-model="setMatchStatusModel" width="600" :mask-closable="false" v-if="setMatchStatus" @on-ok="setShippingMethod" @on-cancel="resetShippingMethod" :loading="setMatchLoading">
      <div class="ivu-modal-confirm">
        <div class="ivu-modal-confirm-head">
          <div class="ivu-modal-confirm-head-title">{{ changeShippingMehotdModel.title }}</div>
        </div>
        <div class="ivu-modal-confirm-body ivu-modal-confirm-body-render">
          <div style="margin-top:10px">
            <Row>
              <Col :span="1">
              <Icon type="md-information-circle" color="#2b85e4" size="44"></Icon>
              </Col>
              <Col :span="21" :offset="2">
              <p style="line-height:36px"></p>{{ changeShippingMehotdModel.content }}
              </Col>
            </Row>
            <Form class="setAllMarkRead" style="margin-top:10px">
              <Row>
                <Form-item label="请选择仓库：" :label-width="120">
                  <dyt-Select style="width:210px" v-model="selectStore">
                    <Option v-for="(item,index) in allStorelist" v-if="storeStatus" :key="index" :value="item.warehouseId">{{ item.warehouseName }}</Option>
                  </dyt-Select>
                </Form-item>
              </Row>
            </Form>
            <!--指定仓库物流方式组件-->
            <logisticsMode :selectStoreId="selectStore" :allStorelist="allStorelist" :setMatchStatusModel="setMatchStatusModel" @ONShippingMethod="ONShippingMethod"></logisticsMode>
          </div>
        </div>
      </div>
    </Modal>
    <keep-alive>
      <sliderModal v-model="orderDetails" :spinShow="spinShow" :styles="{}" class="slider-model" v-if="orderDetailsBegin">
        <orderDetails
          :orderDetailsId="orderDetailsId"
          @reloadTag="reloadTag"
          :timestamp="timestamp"
          :orderNo="orderNo"
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
import Mixin from '@/components/mixin/common_mixin';
import tableMixin from '@/components/mixin/table_mixin';
import publicService from '@/components/mixin/publicService_mixin';
import orderSys from '@/components/mixin/orderSys_mixin';
import orderDetails from "@/views/commonOrder/components/commonOrder/orderDetails";
import logisticsMode from '@/components/common/logisticsMode';

export default {
  mixins: [Mixin, tableMixin, publicService, orderSys],
  components: {
    orderDetails,
    logisticsMode
  },
  data () {
    var self = this;
    return {
      TipsTalg: false,
      resetTalg: false, // 详情参数 Start
      packageModel: false,
      packageDetailsStatus: true,
      packageId: null,
      timestamp: null, // End
      buttonGroupModel: [
        {
          type: 'payTime',
          selected: true,
          status: false, // true up false down
          title: '按付款时间'
        }, {
          type: 'salesTime',
          selected: false,
          status: true, // true up false down
          title: '按下单时间'
        }
      ],
      changeShippingMehotdModel: {
        type: '',
        title: '',
        content: ''
      },
      isOnlineShip: 0,
      setMatchStatus: false,
      setMatchStatusModel: false,
      orderDetails: false,
      orderDetailsBegin: false,
      orderDetailsId: null,
      orderNo: null,
      orderTagList: null,
      webstoreItemSite: null,
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
        pageSize: 50,
        platformId: [this.inGroup],
        buyerCountryCodeList: [],
        searchValue: null,
        payStartTime: null,
        payEndTime: null,
        saleAccountIds: [],
        priceCurrency: 'USD',
        priceOperator: '>',
        searchPrice: null,
        salesRecordNumber: '',
        buyerName: null,
        buyerAccountId: null,
        webstoreItemId: null,
        webstoreSku: null,
        orderNo: null,
        orderBy: 'payTime',
        upDown: 'down',
        packageCode: null,
        warehouseId: self.selectStore
      },
      clearAble: true,
      orderColumn: [
        {
          type: 'selection',
          width: 60,
          fixed: 'left',
          align: 'center'
        }, {
          title: 'NO',
          width: 60,
          fixed: 'left',
          align: 'center',
          key: 'index'
        }, {
          title: '包裹号',
          minWidth: 200,
          fixed: 'left',
          align: 'center',
          key: 'packageCode'
        }, {
          title: '订单号',
          key: 'salesRecordNumber',
          minWidth: 200,
          align: 'center',
          render: (h, params) => {
            // let str = '';
            // let id = null;
            let pos = [];
            if (params.row.orderShippingOrderBoList !== null && params.row.orderShippingOrderBoList.length > 0) {
              params.row.orderShippingOrderBoList.forEach((n, i) => {
                // str = params.row.accountCode + '-' + n.salesRecordNumber;
                // id = n.orderId;
                pos.push(h('span', {
                  style: {
                    color: self.getPermission('orderInfo_detail') ? '#0054A6' : '#515a6e',
                    cursor: 'pointer',
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      if (self.getPermission('orderInfo_detail')) {
                        self.show(n.orderId);
                        self.orderNo = params.row.accountCode + '-' + n.salesRecordNumber;
                        self.orderTagList = params.row.orderTagList;
                        self.webstoreItemSite = params.row.webstoreItemSite;
                      }
                    }
                  }
                }, params.row.accountCode + '-' + n.salesRecordNumber));
              });
            }
            return h('div', pos);
          }
        }, {
          title: '买家ID/姓名',
          key: 'buyerName',
          align: 'center',
          minWidth: 180,
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
          key: 'buyerCountryCode',
          align: 'center',
          minWidth: 110
        }, {
          title: '订单金额',
          key: 'totalPrice',
          align: 'center',
          minWidth: 110,
          render (h, params) {
            return h('div', {}, [
              h('span', params.row.totalPrice),
              params.row.totalPriceCurrency && h('span', params.row.totalPriceCurrency)
            ]);
          }
        }, {
          title: '买家选择的物流渠道',
          key: 'orderShippingOrderBoList',
          align: 'center',
          minWidth: 150,
          render (h, params) {
            let buyerShippingMethods = [];
            params.row.orderShippingOrderBoList.forEach(i => {
              buyerShippingMethods.push(...i.buyerShippingMethods);
            });
            buyerShippingMethods = [...new Set(buyerShippingMethods)];
            if (buyerShippingMethods !== null && buyerShippingMethods.length === 1) {
              return h('div', buyerShippingMethods[0]);
            } else if (buyerShippingMethods !== null && buyerShippingMethods.length > 1) {
              return h('span', '多种物流服务');
            }
          }
        }, {
          title: 'SKU数量',
          align: 'center',
          width: 100,
          key: 'skuQuantity'
        }, {
          title: '物品数量',
          align: 'center',
          width: 100,
          key: 'productQuantity'
        }, {
          title: '操作',
          key: 'operate',
          fixed: 'right',
          align: 'center',
          width: 180,
          render: (h, params) => {
            if (self.getPermission('orderShippingInfo_setShippingMethod')) {
              return h('Button', {
                props: {
                  size: 'small'
                },
                on: {
                  click: () => {
                    self.selectId = params.row.orderShippingId;
                    self.$nextTick(function () {
                      self.matchTheLogisticsOrder('single');
                      self.selectStore = params.row.warehouseId;
                    });
                  }
                }
              }, '指定仓库物流方式');
            }
          }
        }
      ],
      orderData: [],
      orderShippingIds: [],
      value13: '',
      select3: 'gt',
      currencyModal: 'usd',
      shippingMethodModal: [],
      isCell: '否',
      isInsurance: '否',
      value2: [], // 物流[[mcarrierID, carrierAccounts],[merchantShippingMethodId]]
      carrierBaseSetting: [], // 物流参数配置
      setMatchLoading: true,
      shippingMethodModel: [],
      productStatus: false, // 点击产品列表详情状态控制
      productModal: false,
      productDetails: '', // modal产品数据
      selectId: null,
      apiInterfaceStatus: null // 指定仓库物流方式 存下选中的物流方式 若是速卖通线上发货，edis物流则不显示账号
    };
  },
  watch: {
    pageParamsStatus (n) {
      var v = this;
      if (n) {
        v.getList();
        v.pageParamsStatus = false;
      }
    }
  },
  created () {
    this.tableHeight = this.getTableHeight(290);
  },
  methods: {
    startLoading () {
      var v = this;
      v.$Loading.start();
      Promise.resolve(v.getPermission('orderShippingInfo_queryForSetShippingMethod')
        ? v.getList()
        : v.gotoError()).then(() => {
        v.$Loading.finish();
        v.getShopList();
      });
    },
    // 匹配参考/邮寄方式
    matchingWarehouse (str) {
      let option = this.deepCopy(this.pageParams);
      if (str == 'check') {
        if (this.orderShippingIds.length == 0) return this.$Message.warning('请先选择要匹配的订单');
        option = {
          platformId: option.platformId,
          orderShippingIdList: this.orderShippingIds
        }
      }
      this.axios.post(api.batchMatchWarehouseRules, option).then(res => {
        if (res.data && res.data.code != 0) {
          return this.$Message.error(res.data.message || '匹配失败！');
        }
        this.$Message.success('重新匹配完成');
        this.getList();
      }).catch(() => {
        this.$Message.error('匹配失败！');
      })
    },
    getList () {
      let v = this;
      let obj = v.deepCopy(v.pageParams);
      // if (obj.platformId === 'all') { obj.platformId = ['ebay']; }
      v.loadingTrue();
      v.axios.post(api.get_matchTheLogicticsList, JSON.stringify(obj)).then(response => {
        let pos = [];
        let orderIdPos = [];
        let saleAccountIdPos = [];
        let data = response.data.datas;
        if (data.list !== null && data.list.length > 0) {
          data.list.forEach((n, i) => {
            pos.push({
              index: i + 1,
              orderShippingId: n.orderShippingId,
              packageCode: n.packageCode,
              orderCount: n.orderCount, // 订单数量
              buyerName: n.buyerName, // 买家
              webstoreItemSite: n.webstoreItemSite,
              totalPrice: n.totalPrice,
              totalPriceCurrency: n.totalPriceCurrency,
              orderTagList: n.orderTags,
              orderId: n.orderId,
              productList: [],
              orderShippingOrderBoList: n.orderShippingOrderBoList,
              saleAccountId: n.saleAccountId,
              buyerCountryCode: n.buyerCountryCode,
              platformId: n.platformId,
              buyerPostalCode: n.buyerPostalCode,
              buyerAccountId: n.buyerAccountId,
              skuQuantity: n.skuQuantity,
              productQuantity: n.productQuantity,
              warehouseId: n.warehouseId
            });
            saleAccountIdPos.push(n.saleAccountId);
            orderIdPos.push(n.orderId);
          });
        } else {
          v.orderData = [];
        }
        if (saleAccountIdPos.length > 0) { // 匹配订单号
          Promise.resolve(v.axios.post(api.get_saleAccountById + '?saleAccountIds=' + saleAccountIdPos).then(response => {
            if (response.data.code === 0) {
              let list = response.data.datas;
              for (let i = 0; i < list.length; i++) {
                for (let t = 0; t < pos.length; t++) {
                  if (pos[t].saleAccountId === list[i].saleAccountId) {
                    pos[t].accountCode = list[i].accountCode;
                  }
                }
              }
            }
          })).then(() => {
            v.orderData = pos;
          });
        }
        v.$nextTick(function () {
          v.total = Number(data.total);
          v.totalPage = Number(data.pages);
          v.loadingFalse();
        });
      }).catch(() => {
        v.loadingFalse();
      });
    },
    show (params) {
      let v = this;
      v.orderDetailsBegin = true;
      let date = new Date().getTime();
      v.orderDetailsId = params;
      v.$nextTick(function () {
        v.orderDetails = true;
        v.timestamp = date;
      });
    },
    getSelectValue (value) { // table获取所选值
      let v = this;
      let pos = [];
      Promise.resolve(value.forEach((n, i) => {
        pos.push(n.orderShippingId);
      })).then(() => {
        v.orderShippingIds = pos;
      });
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
      v.payTimeArr = [];
      v.resetDate();
    },
    getDateValue (value) { // 获取日期返回值
      let v = this;
      if (value.length === 0) {
        v.$Message.error('日期格式有误');
        v.resetDate();
      } else {
        if (value[0] === '' || value[0] === null) return false;
        v.pageParams.payStartTime = v.getUniversalTime(new Date(value[0]).getTime(), 'fulltime');
        v.pageParams.payEndTime = v.getUniversalTime(new Date(value[1]).getTime(), 'fulltime');
      }
    },
    resetDate () {
      let v = this;
      v.pageParams.payStartTime = null;
      v.pageParams.payEndTime = null;
    },
    matchTheLogisticsOrder (type) {
      let v = this;
      if ((v.orderShippingIds.length === 0 || v.orderShippingIds === null) && type !== 'all' && type !== 'single') {
        v.$Message.error('请选择订单');
        return false;
      }
      if (type === 'single') {
        v.TipsTalg = true;
        v.changeShippingMehotdModel.type = 'single';
        v.changeShippingMehotdModel.title = '指定仓库物流方式';
        v.changeShippingMehotdModel.content = '指定仓库物流方式';
      } else if (type === 'all') {
        v.changeShippingMehotdModel.type = 'all';
      } else {
        v.orderShippingIds.length > 1 ? v.TipsTalg = false : v.TipsTalg = true;
        v.changeShippingMehotdModel.type = '';
        v.changeShippingMehotdModel.title = '批量指定物流方式';
        v.changeShippingMehotdModel.content = '批量指定物流方式系统将自动将所选中的列表中的订单指定为所选择的物流方式。';
      }
      v.setMatchStatus = true;
      v.$nextTick(function () {
        v.setMatchStatusModel = true;
        v.getAllstore(0, 3);
      });
    },
    setShippingMethod (type) {
      let v = this;
      let obj = {};
      if (v.selectStore === '' || v.selectStore === null) {
        v.$Message.error('请选择仓库');
        v.setMatchLoading = false;
        v.$nextTick(function () {
          v.setMatchLoading = true;
        });
        return false;
      } else if (v.value2.length === 0) {
        if (v.TipsTalg) {
          v.$Message.error('请选择实际发货物流方式');
          v.setMatchLoading = false;
          v.$nextTick(function () {
            v.setMatchLoading = true;
          });
          return false;
        }
      } else if ((v.shippingAccountModel === null || v.shippingAccountModel.length === 0) && v.isOnlineShip === 0) {
        if (v.TipsTalg) {
          v.$Message.error('请选择帐号');
          v.setMatchLoading = false;
          v.$nextTick(function () {
            v.setMatchLoading = true;
          });
          return false;
        }
      }
      if (v.changeShippingMehotdModel.type === '') {
        obj = {
          orderShippingIds: v.orderShippingIds,
          merchantCarrierId: !this.$common.isEmpty(v.value2) ? v.value2[0] : '',
          merchantShippingMethodId: !this.$common.isEmpty(v.value2) ? v.value2[1][0] : '',
          packageCarrierParam: v.shippingMethodModel,
          carrierAccountId: !this.$common.isEmpty(v.shippingAccountModel) ? v.shippingAccountModel : '',
          warehouseId: v.selectStore
        };
      } else if (v.changeShippingMehotdModel.type === 'all') {
        obj = v.deepCopy(v.pageParams);
        obj.orderShippingIds = v.orderShippingIds;
        obj.merchantCarrierId = !this.$common.isEmpty(v.value2) ? v.value2[0] : '';
        obj.merchantShippingMethodId = !this.$common.isEmpty(v.value2) ? v.value2[1][0] : '';
        obj.packageCarrierParam = v.shippingMethodModel;
        obj.carrierAccountId = !this.$common.isEmpty(v.shippingAccountModel) ? v.shippingAccountModel : '';
        obj.warehouseId = v.selectStore;
      } else if (v.changeShippingMehotdModel.type === 'single') {
        obj = {
          orderShippingId: v.selectId,
          merchantCarrierId: !this.$common.isEmpty(v.value2) ? v.value2[0] : '',
          merchantShippingMethodId: !this.$common.isEmpty(v.value2) ? v.value2[1][0] : '',
          packageCarrierParam: v.shippingMethodModel,
          carrierAccountId: !this.$common.isEmpty(v.shippingAccountModel) ? v.shippingAccountModel : '',
          warehouseId: v.selectStore
        };
      }
      obj.platformId = [this.inGroup];
      if (v.isOnlineShip === 1) {
        delete obj.carrierAccountId;
      }
      if (v.changeShippingMehotdModel.type === 'single') {
        v.axios.put(api.set_singleShippingMethod, JSON.stringify(obj)).then(response => {
          if (response.data.code === 0) {
            v.$Message.success('操作成功');
            v.pageParamsStatus = true;
            v.setMatchStatusModel = false;
            v.resetShippingMethod();
          } else {
            v.resetShippingMethod();
            (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.error('操作失败，请重新尝试');
          }
        }).catch(() => {
          v.resetShippingMethod();
        });
      } else {
        v.axios.put(api.set_shippingMethod, JSON.stringify(obj)).then(response => {
          if (response.data.code === 0) {
            v.$Message.success('操作成功');
            v.pageParamsStatus = true;
            v.setMatchStatusModel = false;
            v.resetShippingMethod();
            let errorList = response.data.datas;
            if (errorList.length > 0) {
              v.$Message.error({
                content: '指定仓库物流失败' + '：' + errorList.map(i => i.packageCode).join(','),
                duration: 5
              });
            }
          } else {
            v.resetShippingMethod();
            (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.error('操作失败，请重新尝试');
          }
        }).catch(() => {
          v.resetShippingMethod();
        });
      }
    },
    matchTheLogisticsOrderHasCondition (val) {
      let v = this;
      if (val === '1') {
        v.matchTheLogisticsOrder('all');
        v.changeShippingMehotdModel.type = 'all';
        v.changeShippingMehotdModel.title = '指定物流方式（所有结果集）';
        v.changeShippingMehotdModel.content = '指定物流方式（所有结果集），系统将自动将符合当前查询条件的所有包裹指定为所选择的物流方式。';
      }
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
    resetShippingMethod () { // reset changeShippingMethod model data
      let v = this;
      v.setMatchLoading = false;
      v.$nextTick(function () {
        v.setMatchLoading = true;
      });
      v.TipsTalg = false;
      v.resetTalg = true;
      v.value2 = [];
      v.shippingAccountModel = [];
      v.carrierAccount = [];
      v.carrierBaseSetting = [];
      v.selectStore = '';
    },
    showPackageDetails (pid) {
      let v = this;
      v.packageId = pid;
      v.packageDetailsStatus = true;
      let date = new Date().getTime();
      v.$nextTick(function () {
        v.packageModel = true;
        v.timestamp = date;
      });
    }, // 获取子组件传递过来的数据
    ONShippingMethod (value) {
      /*
       value.type => 1--获取发货物流方式数据
       value.type => 2--获取物流相关设置数据
       value.type => 3--获取账号数据
       */
      if (value.type === 1) {
        this.value2 = value.data;
      } else if (value.type === 2) {
        this.shippingMethodModel = value.data;
      } else if (value.type === 3) {
        this.shippingAccountModel = value.data;
      }
    }
  },
  mounted () {
    let v = this;
    setTimeout(v.getCountrys(), 2000); // 获取国家区域列表
  }
};
</script>
