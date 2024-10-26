<template>
  <div>
    <div class="noMarkFilter">
      <div class="card-container">
        <div class="card-content">
          <div class="platformParamsSelect">
            <Form ref="pageParams" :model="pageParams" :label-width="labelWidth">
              <dyt-filter ref="waybillUpdateTable" table-class-name="#waybillUpdateTable">
                <Form-item label="忽略" prop="syncIgnore" v-if="waybillUpdateConfig.includes('syncIgnore')">
                  <dyt-select v-model="pageParams.syncIgnore" @on-change="searchOrder">
                    <Option v-for="item in ignoreList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="同步状态" prop="syncStatus" v-if="waybillUpdateConfig.includes('syncStatus')">
                  <dyt-select v-model="pageParams.syncStatus">
                    <Option v-for="item in asyncStatusList" :value="item.id" :key="item.id">{{ item.title }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="标签" prop="tagIdList" v-if="waybillUpdateConfig.includes('tagIdList')">
                  <dyt-select
                    v-model="pageParams.tagIdList"
                    @on-change="tagChange"
                    :max-tag-count="1"
                    multiple
                    placeholder="请选择或搜索标签"><Option
                    v-for="item in tagsList"
                    :key="item.tagId"
                    :value="item.tagId"
                    :v="item.tagId">{{ item.tagName }}</Option></dyt-select>
                </Form-item>
                <Form-item label="店铺" prop="saleAccountIds" v-if="waybillUpdateConfig.includes('saleAccountIds')">
                  <dytStoreSelect
                    v-model="pageParams.saleAccountIds"
                    :option-data="shopList"
                    :replace-option-key="{ value: 'saleAccountId', label: 'accountCode' }"
                    placeholder="请选择店铺，可输入搜索"
                    input-placeholder="请输入店铺，多个店铺可用逗号或换行隔开"
                  />
                </Form-item>
                <Form-item label="FBA订单" prop="isFbaOrder" v-if="waybillUpdateConfig.includes('isFbaOrder')">
                  <dyt-select v-model="pageParams.isFbaOrder">
                    <Option
                      v-for="(item, index) in fbaOrderList"
                      :key="index"
                      :value="item.value"
                    >{{ item.type }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="国家/地区" prop="buyerCountryCodeList" v-if="waybillUpdateConfig.includes('buyerCountryCodeList')">
                  <dyt-select
                    v-model="pageParams.buyerCountryCodeList"
                    @on-change="countryChange"
                    :max-tag-count="1"
                    multiple
                    placeholder="请选择或输入所在地"
                  >
                    <Option
                      v-for="(item,index) in formValidate.country"
                      :key="index"
                      :value="item.twoCode"
                      :v="item.cnName"
                    >{{ item.enName }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="EPC订单" prop="wishIsCombinedOrder" v-if="waybillUpdateConfig.includes('wishIsCombinedOrder')">
                  <dyt-select v-model="pageParams.wishIsCombinedOrder">
                    <Option v-for="item in wishIsCombinedOrderList" :value="item.id" :key="item.id">{{ item.title }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="A+物流计划订单" prop="wishIsAdvancedLogistics" v-if="waybillUpdateConfig.includes('wishIsAdvancedLogistics')">
                  <dyt-select v-model="pageParams.wishIsAdvancedLogistics">
                    <Option v-for="item in wishIsCombinedOrderList" :value="item.id" :key="item.id">{{ item.title }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="优质物流商订单" prop="wishIsPremiumcarrierUpgrade" v-if="waybillUpdateConfig.includes('wishIsPremiumcarrierUpgrade')">
                  <dyt-select v-model="pageParams.wishIsPremiumcarrierUpgrade">
                    <Option v-for="item in wishIsCombinedOrderList" :value="item.id" :key="item.id">{{ item.title }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="WISH EXPRESS订单" prop="wishIsWishExpress" v-if="waybillUpdateConfig.includes('wishIsWishExpress')">
                  <dyt-select v-model="pageParams.wishIsWishExpress">
                    <Option v-for="item in wishIsCombinedOrderList" :value="item.id" :key="item.id">{{ item.title }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="物流方式" prop="shippingMethodModel" v-if="waybillUpdateConfig.includes('shippingMethodModel')">
                  <logisticsModeTree
                    v-model="shippingMethodModel"
                    :loadingChildren="true"
                    :multiple="true"
                    :disableBranchNodes="false"
                    :all-logistics-mode="true"
                    placeholder="请选择物流方式"
                    @on-change="treeChange"
                  />
                </Form-item>
                <Form-item label="订单号" prop="orderNo" v-if="waybillUpdateConfig.includes('orderNo')">
                  <dyt-input-tag type="textarea" v-model="pageParams.orderNo" :limit="1" :string="true" placeholder="请输入订单号,多个请用逗号隔开" />
                </Form-item>
                <Form-item label="买家姓名" prop="buyerName" v-if="waybillUpdateConfig.includes('buyerName')">
                  <dyt-input placeholder="请输入买家姓名" v-model.trim="pageParams.buyerName"></dyt-input>
                </Form-item>
                <Form-item label="买家ID" prop="buyerAccountId" v-if="waybillUpdateConfig.includes('buyerAccountId')">
                  <dyt-input placeholder="请输入买家ID" v-model.trim="pageParams.buyerAccountId"></dyt-input>
                </Form-item>
                <Form-item label="平台产品编码" prop="webstoreItemId" v-if="waybillUpdateConfig.includes('webstoreItemId')">
                  <dyt-input placeholder="请输入平台产品编码" v-model.trim="pageParams.webstoreItemId"></dyt-input>
                </Form-item>
                <Form-item label="SKU" prop="webstoreSku" v-if="waybillUpdateConfig.includes('webstoreSku')">
                  <dyt-input-tag type="textarea" placeholder="请输入SKU, 多个请用逗号隔开" :limit="1" :string="true" v-model="pageParams.webstoreSku" />
                </Form-item>
                <Form-item label="买家类型" prop="amazonIsBusinessOrder" v-if="waybillUpdateConfig.includes('amazonIsBusinessOrder')">
                  <dyt-select v-model="pageParams.amazonIsBusinessOrder" clearable>
                    <Option
                      v-for="(item,index) in buyerTypeList"
                      :key="index"
                      :value="item.value"
                    >{{ item.type }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="Prime订单" prop="amazonIsPrime" v-if="waybillUpdateConfig.includes('amazonIsPrime')">
                  <dyt-select v-model="pageParams.amazonIsPrime" clearable>
                    <Option
                      v-for="(item,index) in fbaOrderList"
                      :key="index"
                      :value="item.value"
                    >{{ item.type }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="Item ID" prop="asin" v-if="waybillUpdateConfig.includes('asin')">
                  <dyt-input v-model='pageParams.asin'/>
                </Form-item>
                <Form-item label="商品事业部" prop="businessDeptIdList" v-if="waybillUpdateConfig.includes('businessDeptIdList')">
                  <dyt-select
                    v-model="pageParams.businessDeptIdList"
                    :max-tag-count="1"
                    multiple placeholder="请选择商品事业部"
                  >
                    <Option v-for="(item, index) in businessDeptDataList" :value='item.id' :key="`business-${index}`">{{item.name}}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="是否货到付款订单" prop="isCashOnDelivery" v-if="waybillUpdateConfig.includes('isCashOnDelivery')">
                  <dyt-select v-model="pageParams.isCashOnDelivery">
                    <Option v-for="(item, index) in cashDeliveryTab" :value="item.value" :key="`i-${index}`">{{ item.label }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="搜索字符" prop="searchValue" v-if="waybillUpdateConfig.includes('searchValue')">
                  <dyt-input
                    class="filterSearch"
                    placeholder="可输入订单号、买家ID、买家姓名、SKU、平台产品编码"
                    v-model.trim="pageParams.searchValue"
                    @on-enter="searchOrder"></dyt-input>
                </Form-item>
                <Form-item label="仓库" prop="warehouseCode" v-if="waybillUpdateConfig.includes('warehouseCode')">
                  <dyt-select
                    v-model="pageParams.warehouseCode"
                    :max-tag-count="1"
                    multiple
                    placeholder="请选择仓库"
                  >
                    <Option v-for="(item, index) in warehouseList" :value='item.warehouseCode' :key="`ware-${index}`">{{item.warehouseName}}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="发货状态" prop="deliveryStatus" v-if="waybillUpdateConfig.includes('deliveryStatus')">
                  <!-- class="notplatformParamsSelect" -->
                  <dyt-select v-model="pageParams.deliveryStatus">
                    <Option v-for="item in shippingStatusList" :value="item.id" :key="item.id">{{ item.title }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="有补发" prop="isRedelivery" v-if="waybillUpdateConfig.includes('isRedelivery')">
                  <dyt-select v-model="pageParams.isRedelivery" placeholder="请选择">
                    <Option v-for="item in haveOrNot" :key="`isRedelivery-${item.value}`" :value="item.value">{{ item.label }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="更新类型" prop="updateTrackingType" v-if="waybillUpdateConfig.includes('updateTrackingType')">
                  <dyt-select
                    v-model="pageParams.updateTrackingType"
                    placeholder="请选择更新类型"
                    style="width: calc(100% - 30px); display: inline-block;vertical-align: middle;"
                  >
                    <Option :value="1">运单号新增</Option>
                    <Option :value="2">运单号替换</Option>
                  </dyt-select>
                  <Poptip class="form-item-tooltip" trigger="hover" transfer placement="right-start">
                    <Icon type="ios-help-circle-outline" style="color: #f60; font-size: 18px;cursor: pointer;font-weight: bold;" />
                    <div slot="content">
                      <p>1、标发货后，新增包裹更新运单号的，更新类型为运单号新增</p>
                      <p>2、标发货后，原运单号修改的，更新类型为运单号替换</p>
                    </div>
                  </Poptip>
                </Form-item>
                <div slot="operation">
                  <Button
                    type="primary"
                    @click="searchOrder"
                    :disabled="SearchDisabled"
                    icon="md-search"
                    v-if="isAdmin || controlList.orderInfo_queryForMarkShipments"
                  >查询</Button>
                  <Button @click="reset" style="margin-left:10px;" v-once icon="md-refresh">重置</Button>
                </div>
              </dyt-filter>
            </Form>
          </div>
        </div>
      </div>
    </div>

    <div class="tableControl" style="display: flex;">
      <div style="flex: 100;">
        <Buttons
          v-if="pageParams.syncStatus !== 2"
          type="primary"
          trigger="click"
          @on-click="syncHasCondition"
          :disabled="!getPermission('orderInfo_updateForTrackUpdated_batch')"
        >
          <Button
            type="primary" @click="sync" :disabled="!getPermission('orderInfo_updateForTrackUpdated_batch')">
            <Icon type="checkmark-round"></Icon>
            同步
          </Button>
          <Buttons-menu slot="list">
            <Buttons-item
              name="1" :disabled="!getPermission('orderInfo_updateForTrackUpdated_all')">同步（所有结果集）
            </Buttons-item>
          </Buttons-menu>
        </Buttons>
        <Dropdown class="ml10" v-if="getPermission('orderTag_insert_batch') || getPermission('orderTag_clear')">
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
        <Button
          v-if="pageParams.syncIgnore === 0 && getPermission('orderInfo_batchSyncIgnore')"
          class="ml10"
          @click="markIgnoredBatchWay"
        >标记忽略 </Button>
      </div>
      <div class="dataSort grayBg" style="display: inline-block;background: none;border: none;padding: 0;margin: 0;">
        <span>排序：</span>
        <Button-group>
          <template v-for="(item, index) in buttonGroupModel">
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
      class="orderTable normalTop" id="waybillUpdateTable" v-if="getPermission('orderInfo_queryForMarkShipments')">
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
      <sliderModal
        v-model="orderDetails" :spinShow="spinShow" :styles="{}" class="slider-model" v-if="orderDetailsBegin">
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
    <keep-alive>
      <Modal
        v-model="syncModel.status" :mask-closable="false" width="400" v-if="syncStatus" @on-ok="setSync">
        <div class="ivu-modal-confirm">
          <div class="ivu-modal-confirm-head">
            <div class="ivu-modal-confirm-head-title">{{ syncModel.title }}</div>
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
                  <p>
                    {{ syncModel.content }} </p>
                </Col>
              </Row>
            </div>
          </div>
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
import logisticsModeTree from '@/components/common/logisticsModeTree';
import { waybillUpdateConfig } from '@/views/commonOrder/script/markShipmentsConfig';

export default {
  mixins: [Mixin, orderSys],
  components: {
    orderDetails,
    logisticsModeTree
  },
  data () {
    var self = this;
    return {
      waybillUpdateConfig: waybillUpdateConfig[this.inGroup] || waybillUpdateConfig.default,
      businessDeptDataList: [],
      warehouseList: [], // 仓库数据
      warehouseJson: {},
      isInitPage: false,
      syncModel: {
        title: '',
        content: '',
        status: false
      },
      syncStatus: 1,
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
      orderDetailsBegin: false,
      orderDetailsId: null,
      orderNo: null,
      timestamp: null,
      orderTagList: null,
      webstoreItemSite: null,
      pageParams: {
        pageNum: 1,
        pageSize: 50,
        syncIgnore: 0,
        businessDeptIdList: [],
        isCashOnDelivery: -1,
        remainTimeType: 1, // 剩余天数
        deliveryStatus: -1, // 订单状态
        searchValue: null,
        merchantShippingMethodIdList: [], // 物流方式ID
        merchantCarrierIdList: [],
        buyerCountryCodeList: [],
        saleAccountIds: [],
        syncStatus: 1,
        tagIdList: [],
        warehouseCode: [],
        platformId: [this.inGroup],
        orderBy: 'remainTime', // remainTime,payTime
        upDown: 'up',
        buyerName: null,
        updateTrackingType: null,
        isRedelivery: null,
        buyerAccountId: null,
        webstoreItemId: null,
        webstoreSku: null,
        isFbaOrder: null,
        amazonIsBusinessOrder: null,
        amazonIsPrime: null,
        asin: null,
        orderNo: null,
        wishIsCombinedOrder: -1,
        wishIsAdvancedLogistics: -1,
        wishIsPremiumcarrierUpgrade: -1,
        wishIsWishExpress: -1,
      },
      pageParamsStatus: false, // 每次更新完pageParms都要设置成true触发刷新
      totalPage: 0,
      total: 0,
      curPage: 1,
      countryModal: [],
      markCountryModal: [],
      tagsList: [],
      formValidate: {
        country: []
      },
      cashDeliveryTab: [
        { label: '全部', value: -1 },
        { label: '是', value: 1 },
        { label: '否', value: 0 }
      ],
      // (0:否 1:是 -1:全部)
      wishIsCombinedOrderList: [
        { selected: true, id: -1, title: '全部' },
        { selected: false, id: 1, title: '是' },
        { selected: false, id: 0, title: '否' }
      ],
      fbaOrderList: [
        { type: '是', value: 1 },
        { type: '否', value: 0 }
      ],
      buyerTypeList: [ // 买家类型
        { type: 'B2B', value: 1
        },
        { type: 'B2C', value: 0 }
      ],
      asyncStatusList: [
        { selected: true, id: 1, title: '未同步' },
        { selected: false, id: 4, title: '同步失败' },
        { selected: false, id: 2, title: '正在同步' }
      ],
      shippingStatusList: [
        { selected: true, id: -1, title: '全部' },
        { selected: false, id: 1, title: '已出库' },
        { selected: false, id: 2, title: '已打印' },
        { selected: false, id: 3, title: '已下发物流（待打印）' },
        { selected: false, id: 4, title: '已指定物流方式（待下发物流）' },
        { selected: false, id: 5, title: '未指定物流方式' },
        { selected: false, id: 6, title: '缺货' }
      ],
      tableColumn: {
        selection: {
          type: 'selection',
          width: 60,
          fixed: 'left',
          align: 'center'
        },
        salesRecordNumber: {
          title: '订单号',
          key: 'salesRecordNumber',
          fixed: 'left',
          width: 150,
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
        },
        packageCode: {
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
        },
        buyerName: {
          title: '买家ID/姓名',
          key: 'buyerName',
          align: 'center',
          width: 150,
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
        },
        buyerCountryCode: {
          title: '国家/地区',
          key: 'buyerCountryCode',
          align: 'center',
          width: 110
        },
        totalPrice: {
          title: '金额',
          key: 'totalPrice',
          width: 100,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('div', params.row.totalPrice), params.row.totalPriceCurrency && h('div', '(' + params.row.totalPriceCurrency + ')')
            ]);
          }
        },
        payTime: {
          title: '付款时间',
          key: 'payTime',
          align: 'center',
          minWidth: 160
        },
        psw: {
          title: '包裹号' + '/' + '物流方式' + '/' + '运单号',
          key: 'psw',
          align: 'center',
          minWidth: 200,
          render: (h, params) => {
            let n = params.row.carrierShippingMethodOrderBo;
            if (n !== null) {
              return h('div', self.getPSWDetails(n, h));
            } else {
              return '';
            }
          }
        },
        tags: {
          title: '标签',
          key: 'tags',
          width: 130,
          align: 'center',
          render: (h, { row }) => {
            return (row.orderTagList || []).map(m => {
              return h('div', [
                h('Icon', {
                  props: {
                    type: 'pricetag',
                    color: '#f00'
                  },
                  style: {
                    marginRight: '5px'
                  }
                }), h('span', m.tagName)
              ]);
            })
          }
        },
        remarkContent: {
          title: '备注',
          key: 'remarkContent',
          align: 'center',
          resizable: true,
          width: 150
        },
        synDeliverErrorMsg: {
          title: '失败原因',
          key: 'synDeliverErrorMsg',
          minWidth: 200
        },
        aliexpressOrderStatus: {
          title: '订单状态',
          key: 'orderStatus',
          width: 140,
          align: 'center',
          render: (h, params) => {
            return h('span', this.getPlatformOrderStatus(params.row.platformOrderStatus));
          }
        },
        productList: {
          title: '产品',
          key: 'productList',
          align: 'center',
          resizable: true,
          width: 150,
          render: (h, params) => {
            let data = params.row.productList || [];
            let pos = [];
            data.forEach((n, i) => {
              let item = this.tableImg(h, params, '', n.pictureUrl, () => {
                this.showPicModal(data);
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
        },
        buyerNameLevel: {
          title: '买家ID/姓名/买家等级',
          key: 'buyerName',
          align: 'center',
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
        },
        amazonIsBusinessOrder: {
          title: '买家类型',
          key: 'amazonIsBusinessOrder',
          width: 120,
          align: 'center',
          render: (h, params) => {
            if (params.row.amazonIsBusinessOrder === 0) {
              return h('div', 'B2C');
            }
            if (params.row.amazonIsBusinessOrder === 1) {
              return h('div', 'B2B');
            }
          }
        },
        platformOrderStatus: {
          title: '订单状态',
          key: 'platformOrderStatus',
          align: 'center',
          width: 120
        },
        wishIsAdvancedLogistics: {
          title: 'A+物流计划订单',
          key: 'wishIsAdvancedLogistics',
          align: 'center',
          width: 150,
          render: (h, params) => {
            return h('div', [
              h('div', params.row.orderExtendInfo != null && params.row.orderExtendInfo.wishIsAdvancedLogistics === 1
                ? '是'
                : '否')
            ]);
          }
        },
        wishIsPremiumcarrierUpgrade: {
          title: '优质物流商订单',
          key: 'wishIsPremiumcarrierUpgrade',
          align: 'center',
          width: 130,
          render: (h, params) => {
            return h('div', [
              h('div', params.row.orderExtendInfo != null && params.row.orderExtendInfo.wishIsPremiumcarrierUpgrade === 1
                ? '是'
                : '否')
            ]);
          }
        },
        wishIsWishExpress: {
          title: 'WISH EXPRESS订单',
          key: 'wishIsWishExpress',
          align: 'center',
          width: 160,
          render: (h, params) => {
            return h('div', [
              h('div', params.row.orderExtendInfo != null && params.row.orderExtendInfo.wishIsWishExpress === 1
                ? '是'
                : '否')
            ]);
          }
        },
        buyerAccountId: {
          title: '买家ID',
          key: 'buyerAccountId',
          width: 100,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('div', {
                style: {
                  color: '#0054A6'
                }
              }, params.row.buyerAccountId)
            ]);
          }
        },
        salesTime: {
          title: '下单时间',
          key: 'salesTime',
          align: 'center',
          width: 160
        },
        webstoreUpdatedDate: {
          title: '上次更新时间',
          key: 'webstoreUpdatedDate',
          align: 'center',
          width: 160
        },
        operate: {
          title: '操作',
          key: 'operate',
          fixed: 'right',
          align: 'center',
          width: 210,
          render: (h, params) => {
            if (params.row !== undefined) {
              return h('div', [
                self.getPermission('orderInfo_updateForTrackUpdated_single') && params.row.syncStatus !== 2
                  ? h('Button', {
                    props: {
                      size: 'small'
                    },
                    style: {
                      marginRight: '5px'
                    },
                    on: {
                      click: () => {
                        self.setSync(params.row.orderId);
                      }
                    }
                  }, '同步')
                  : '', !self.getPermission('orderInfo_detail') || h('Button', {
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
        }
      },
      orderColumn: [],
      orderData: [],
      orderIdList: [],
      setTagListStatus: false,
      shippingMethodModel: [],
    };
  },
  props: {
    tabTimestamp: {
      type: Number,
      default: null
    }
  },
  computed: {
    tableHeight () {
      return this.getTableHeight(350);
    },
    // 列设置
    getTableColumn () {
      let newColumn = [];
      (waybillUpdateConfig[`${this.inGroup}Column`] || waybillUpdateConfig.defaultColumn).forEach((key) => {
        if (!this.$common.isEmpty(this.tableColumn[key])) {
          newColumn.push(this.tableColumn[key]);
        }
      });
      return newColumn;
    }
  },
  watch: {
    pageParamsStatus (n) {
      if (n) {
        this.getList();
        this.pageParamsStatus = false;
      }
    },
    tabTimestamp: {
      immediate: true,
      deep: true,
      handler (n, o) {
        if (n !== o && n !== null) {
          this.pageParamsStatus = true;
          // 切换之后处理 搜索栏
          this.$nextTick(() => {
            this.$refs.waybillUpdateTable && this.$refs.waybillUpdateTable.init();
          })
        }
      }
    },
    getTableColumn: {
      deep: true,
      immediate: true,
      handler (val) {
        this.orderColumn = val;
      }
    }
  },
  created () {
    this.getWarehouseData();
    this.getBusinessDeptData();
  },
  methods: {
    // 获取仓库数据
    getWarehouseData () {
      this.axios.post(`${api.get_warehouseList}?tiem=${new Date().getTime()}`, { warehouseStatus: '0' }).then(res => {
        if (res && res.data && res.data.code === 0 && res.data.datas) {
          (res.data.datas || []).forEach(item => {
            this.warehouseJson[item.warehouseCode] = item;
          })
          this.warehouseList = res.data.datas || [];
        }
      })
    },
    startLoading () {
      this.getOrderListTag();// 获取标签列表
      this.getShopList(); // 获取店铺
    },
    // 获取搜索参数
    getNewParams (params) {
      const list = [
        'remainTimeType', 'syncStatus', 'deliveryStatus', 'isCashOnDelivery',
        'wishIsCombinedOrder', 'wishIsAdvancedLogistics', 'wishIsPremiumcarrierUpgrade', 'wishIsWishExpress'
      ];
      let includeKey = [ 'pageNum', 'pageSize', 'orderBy', 'upDown', 'platformId' ];
      let pageParams = this.$common.copy(params);
      if (this.waybillUpdateConfig.includes('shippingMethodModel')) {
        includeKey.push('merchantCarrierIdList');
        includeKey.push('merchantShippingMethodIdList');
      }
      // 移除非当前平台的参数
      Object.keys(pageParams).forEach(key => {
        if (!this.waybillUpdateConfig.includes(key) && !includeKey.includes(key)) {
          delete pageParams[key];
        }
      });

      list.forEach(key => {
        pageParams[key] = pageParams[key] === -1 ? null : pageParams[key];
      })
      let warehouseIds = [];
      pageParams.warehouseCode.forEach(item => {
        if (this.warehouseJson[item]) {
          warehouseIds.push(this.warehouseJson[item].warehouseId);
        }
      })
      pageParams.warehouseIdList = warehouseIds;
      delete pageParams.warehouseCode;
      return pageParams;
    },
    // 获取事业部
    getBusinessDeptData () {
      if (!this.waybillUpdateConfig.includes('businessDeptIdList')) return;
      this.axios.get(api.get_businessDeptList).then(res => {
        if (res && res.data) {
          this.businessDeptDataList = res.data.data || [];
        }
      })
    },
    getList () {
      this.orderData = [];
      this.loadingTrue();
      this.$emit('getTabNumber');
      this.axios.post(api.get_trackUpdateList, this.getNewParams(this.pageParams)).then(response => {
        if (response.data.code === 0) {
          let pos = [];
          let saleAccountIdPos = [];
          let data = response.data.datas;
          if (data.list !== null) {
            data.list.forEach((n, i) => {
              pos.push({
                ...n,
                payTime: this.getDataToLocalTime(n.payTime, 'fulltime'),
                accountCode: '',
                orderTagList: n.orderTags,
                syncStatus: this.pageParams.syncStatus
              });
              saleAccountIdPos.push(n.saleAccountId);
            });
          } else {
            this.orderData = [];
          }
          if (saleAccountIdPos.length > 0) { // 匹配订单号
            this.axios.post(api.get_saleAccountById + '?saleAccountIds=' + saleAccountIdPos).then(response => {
              if (response.data.code === 0) {
                let list = response.data.datas;
                for (let i = 0; i < list.length; i++) {
                  for (let t = 0; t < pos.length; t++) {
                    if (pos[t].saleAccountId === list[i].saleAccountId) {
                      pos[t].accountCode = list[i].accountCode;
                    }
                  }
                }
                // 匹配订单备注
                this.getOrderRemark(pos, pos.map(i => i.orderId)).then(data => {
                  this.orderData = data;
                }).finally(() => {
                  this.loadingFalse();
                });
              }
            }).catch(() => {
              this.loadingFalse();
            });
          } else {
            this.loadingFalse();
          }
          this.$nextTick(() => {
            this.total = Number(data.total);
            this.totalPage = Number(data.pages);
          });
        } else {
          this.loadingFalse();
        }
      }).catch(() => {
        this.loadingFalse();
      });
    },
    reset () {
      this.shippingMethodModel = [];
      this.$refs['pageParams'].resetFields();
    },
    // 物流方式
    treeChange (val) {
      this.pageParams.merchantCarrierIdList = val.carrierId;
      this.pageParams.merchantShippingMethodIdList = val.shippingMethodId;
    },
    searchOrder () {
      this.$nextTick(() => {
        if (this.pageParams.syncStatus === 4 && JSON.stringify(this.orderColumn).indexOf('synDeliverErrorMsg') < 0) {
          let failColumn = {
            title: '失败原因',
            key: 'synDeliverErrorMsg',
            minWidth: 200
          };
          this.orderColumn.splice(3, 0, failColumn);
        } else if (this.pageParams.syncStatus !== 4 && JSON.stringify(this.orderColumn).indexOf('synDeliverErrorMsg') > 0) {
          this.orderColumn.splice(3, 1);
        }
        this.search();
      })
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
    syncHasCondition (val) {
      if (val === '1') {
        this.sync('all');
      }
    },
    sync (type) {
      let v = this;
      if ((v.orderIdList === null || v.orderIdList.length === 0) && type !== 'all') {
        v.$Message.error('请选择订单');
        return false;
      }
      v.syncStatus = true;
      if (type !== 'all') {
        v.syncModel.title = '批量同步运单号';
        v.syncModel.content = '系统将会把新的运单号同步到' + v.$store.state.inGroup + '后台，发货时间将不变';
      } else {
        v.syncModel.title = '批量同步运单号（所有结果集）';
        v.syncModel.content = '系统将会把新的运单号同步到' + v.$store.state.inGroup + '后台，发货时间将不变';
      }
      v.$nextTick(function () {
        v.syncModel.status = true;
      });
    },
    tagChange (value) {
      var v = this;
      if (value.indexOf('null') >= 0) {
        v.pageParams.tagIdList = [];
      } else {
        v.pageParams.tagIdList = value;
      }
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
    setSync (orderId) {
      let v = this;
      let arr = [];
      arr.push(v.platformType);
      let obj = {
        platformId: arr
      };
      if (orderId) {
        obj.orderIdList = [orderId];
      } else {
        obj.orderIdList = v.orderIdList;
      }
      if (v.syncModel.title === '批量同步运单号（所有结果集）') {
        obj = Object.assign({}, v.pageParams);
      }
      v.axios.put(api.set_asyncTrackUpdate, JSON.stringify(obj)).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
          v.pageParamsStatus = true;
        } else {
          (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.error('操作失败，请重新尝试');
        }
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
    this.startLoading();
  }
};
</script>
<style lang="less">
.form-item-tooltip {
  vertical-align: middle;
  margin:0 0 0 8px;
  .ivu-tooltip-popper {
    top: 0 !important;
    width: 320px;
  }
}
</style>
