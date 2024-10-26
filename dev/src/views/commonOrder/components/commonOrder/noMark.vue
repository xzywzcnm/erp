<template>
  <div>
    <div class="noMarkFilter">
      <div class="card-container">
        <div class="card-content">
          <div class="platformParamsSelect">
            <Form ref="pageParams" :model="pageParams" :label-width="labelWidth">
              <dyt-filter ref="noMarkTable" :table-class-name="`#${tbleBoxId}`">
                <Form-item label="忽略" prop="syncIgnore" v-if="noMarkConfig.includes('syncIgnore')">
                  <dyt-select v-model="pageParams.syncIgnore" @on-change="searchOrder" placeholder="请选择">
                    <Option v-for="item in ignoreList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="发货剩余时间" prop="remainTimeType" v-if="noMarkConfig.includes('remainTimeType')">
                  <dyt-select v-model="pageParams.remainTimeType">
                    <Option v-for="item in remainDayList" :value="item.id" :key="item.id">{{ item.title }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="返回跟踪号" prop="hasTrackingNumber" v-if="noMarkConfig.includes('hasTrackingNumber')">
                  <dyt-select v-model="pageParams.hasTrackingNumber">
                    <Option v-for="item in trackingNumberList" :value="item.id" :key="item.id">{{ item.title }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item :label="`${isNewType ? '标发货' : '同步'}状态`" prop="syncStatus" v-if="noMarkConfig.includes('syncStatus')">
                  <dyt-select v-model="pageParams.syncStatus" :placeholder="`请选择${isNewType ? '标发货' : '同步'}状态`">
                    <Option v-for="item in asyncStatusList" :value="item.id" :key="item.id">{{ item.title }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="标签" prop="tagIdList" v-if="noMarkConfig.includes('tagIdList')">
                  <dyt-select
                    v-model="pageParams.tagIdList"
                    @on-change="tagChange"
                    :max-tag-count="1"
                    multiple
                    placeholder="请选择或搜索标签"
                  >
                    <Option
                      v-for="item in tagsList"
                      :key="item.tagId"
                      :value="item.tagId"
                      :v="item.tagId"
                    >{{ item.tagName }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="EPC订单" prop="wishIsCombinedOrder" v-if="noMarkConfig.includes('wishIsCombinedOrder')">
                  <dyt-select v-model="pageParams.wishIsCombinedOrder">
                    <Option v-for="item in wishIsCombinedOrderList" :value="item.id" :key="item.id">{{ item.title }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="A+物流计划订单" prop="wishIsAdvancedLogistics" v-if="noMarkConfig.includes('wishIsAdvancedLogistics')">
                  <dyt-select v-model="pageParams.wishIsAdvancedLogistics">
                    <Option v-for="item in wishIsCombinedOrderList" :value="item.id" :key="item.id">{{ item.title }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="优质物流商订单" prop="wishIsPremiumcarrierUpgrade" v-if="noMarkConfig.includes('wishIsPremiumcarrierUpgrade')">
                  <dyt-select v-model="pageParams.wishIsPremiumcarrierUpgrade">
                    <Option v-for="item in wishIsCombinedOrderList" :value="item.id" :key="item.id">{{ item.title }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="WISH EXPRESS订单" prop="wishIsWishExpress" v-if="noMarkConfig.includes('wishIsWishExpress')">
                  <dyt-select v-model="pageParams.wishIsWishExpress">
                    <Option v-for="item in wishIsCombinedOrderList" :value="item.id" :key="item.id">{{ item.title }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="店铺" prop="saleAccountIds" v-if="noMarkConfig.includes('saleAccountIds')">
                  <dytStoreSelect
                    v-model="pageParams.saleAccountIds"
                    :option-data="shopList"
                    :replace-option-key="{ value: 'saleAccountId', label: 'accountCode' }"
                    placeholder="请选择店铺，可输入搜索"
                    input-placeholder="请输入店铺，多个店铺可用逗号或换行隔开"
                  />
                </Form-item>
                <Form-item label="物流方式" prop="shippingMethodModel" v-if="noMarkConfig.includes('shippingMethodModel')">
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
                <Form-item label="订单号" prop="orderNo" v-if="noMarkConfig.includes('orderNo')">
                  <dyt-input-tag type="textarea" v-model="pageParams.orderNo" :limit="1" :string="true" placeholder="请输入订单号,多个请用逗号隔开" />
                </Form-item>
                <Form-item label="国家/地区" prop="buyerCountryCodeList" v-if="noMarkConfig.includes('buyerCountryCodeList')">
                  <dyt-select
                    v-model="pageParams.buyerCountryCodeList"
                    @on-change="countryChange"
                    :max-tag-count="1"
                    multiple
                    placeholder="请选择或输入所在地"><Option
                    v-for="(item,index) in formValidate.country"
                    :key="index"
                    :value="item.twoCode"
                    :v="item.cnName">{{ item.enName }}</Option></dyt-select>
                </Form-item>
                <Form-item label="买家姓名" prop="buyerName" v-if="noMarkConfig.includes('buyerName')">
                  <dyt-input placeholder="请输入买家姓名" v-model.trim="pageParams.buyerName"></dyt-input>
                </Form-item>
                <Form-item label="买家ID" prop="buyerAccountId" v-if="noMarkConfig.includes('buyerAccountId')">
                  <dyt-input placeholder="请输入买家ID" v-model.trim="pageParams.buyerAccountId"></dyt-input>
                </Form-item>
                <Form-item
                  :label="`${['aliexpress'].includes(inGroup) ? 'product ID' : '平台产品编码'}`"
                  prop="webstoreItemId"
                  v-if="noMarkConfig.includes('webstoreItemId')"
                >
                  <dyt-input placeholder="请输入平台产品编码" v-model.trim="pageParams.webstoreItemId"></dyt-input>
                </Form-item>
                <Form-item label="SKU" prop="webstoreSku" v-if="noMarkConfig.includes('webstoreSku')">
                  <dyt-input-tag type="textarea" placeholder="请输入SKU, 多个请用逗号隔开" :limit="1" :string="true" v-model="pageParams.webstoreSku" />
                </Form-item>
                <Form-item label="买家类型" prop="amazonIsBusinessOrder" v-if="noMarkConfig.includes('amazonIsBusinessOrder')">
                  <dyt-select v-model="pageParams.amazonIsBusinessOrder" clearable>
                    <Option v-for="(item,index) in buyerTypeList" :key="index" :value="item.value">{{ item.type }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="Prime订单" prop="amazonIsPrime" v-if="noMarkConfig.includes('amazonIsPrime')">
                  <dyt-select v-model="pageParams.amazonIsPrime" clearable>
                    <Option v-for="(item,index) in amazonPrimeList" :key="index" :value="item.value">{{ item.type }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="Item ID" prop="asin" v-if="noMarkConfig.includes('asin')">
                  <dyt-input v-model='pageParams.asin' />
                </Form-item>
                <Form-item label="商品事业部" prop="businessDeptIdList" v-if="noMarkConfig.includes('businessDeptIdList')">
                  <dyt-select
                    v-model="pageParams.businessDeptIdList"
                    :max-tag-count="1"
                    multiple placeholder="请选择商品事业部"
                  >
                    <Option v-for="(item, index) in businessDeptDataList" :value='item.id' :key="`business-${index}`">{{item.name}}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="是否货到付款订单" prop="isCashOnDelivery" v-if="noMarkConfig.includes('isCashOnDelivery')">
                  <dyt-select v-model="pageParams.isCashOnDelivery">
                    <Option v-for="(item, index) in cashDeliveryTab" :value="item.value" :key="`i-${index}`">{{ item.label }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="搜索字符" prop="searchValue" v-if="noMarkConfig.includes('searchValue')">
                  <dyt-input
                    class="filterSearch"
                    placeholder="可输入订单号、买家ID、买家姓名、SKU、平台产品编码"
                    v-model.trim="pageParams.searchValue"
                    @on-enter="searchOrder"></dyt-input>
                </Form-item>
                <Form-item label="仓库" prop="warehouseCode" v-if="noMarkConfig.includes('warehouseCode')">
                  <dyt-select
                    v-model="pageParams.warehouseCode"
                    :max-tag-count="1"
                    multiple
                    placeholder="请选择仓库"
                  >
                    <Option v-for="(item, index) in warehouseList" :value='item.warehouseCode' :key="`ware-${index}`">{{item.warehouseName}}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="发货状态" prop="deliveryStatus" v-if="noMarkConfig.includes('deliveryStatus')">
                  <dyt-select v-model="pageParams.deliveryStatus">
                    <Option v-for="item in shippingStatusList" :value="item.id" :key="item.id">{{ item.title }}</Option>
                  </dyt-select>
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
      <div style="flex:100;">
        <Buttons
          v-if="!isDisabledBtn && ((isNewType && markView) || (!isNewType && pageParams.syncStatus !== 2))"
          type="primary"
          trigger="click"
          @on-click="markShipmentsHasCondition"
          :disabled="!getPermission('orderInfo_updateForShipments_batch')"
        >
          <Button type="primary" @click="markShipments" :disabled="!getPermission('orderInfo_updateForShipments_batch')">
            <Icon type="checkmark-round"></Icon>
            批量标发货
          </Button>
          <Buttons-menu slot="list">
            <Buttons-item name="1" :disabled="!getPermission('orderInfo_updateForShipments_all')">标发货（所有结果集）</Buttons-item>
          </Buttons-menu>
        </Buttons>
        <Dropdown class="ml10" v-if="['otto'].includes(inGroup) && !isDisabledBtn">
          <Button type="primary">
            修改退货跟踪号
            <Icon type="ios-arrow-down"></Icon>
          </Button>
          <DropdownMenu slot="list">
            <DropdownItem @click.native="openImportTracking">导入退货跟踪号</DropdownItem>
            <DropdownItem @click.native="openEditTracking">修改退货跟踪号(选中)</DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <Dropdown class="ml10" v-if="!isDisabledBtn && (getPermission('orderTag_insert_batch') || getPermission('orderTag_clear'))">
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
        <Checkbox class="ml10" v-model="showAbnormalOrder" @on-change="showAbnormalOrderChange">显示存在"订单异常"数据</Checkbox>
        <Button
          v-if="pageParams.syncIgnore === 0 && getPermission('orderInfo_batchSyncIgnore')"
          class="ml10"
          @click="markIgnoredBatchWay"
        >标记忽略</Button>
      </div>
      <div class="dataSort" style="display: inline-block;background: none;border: none;padding: 0;margin: 0;">
        <span>排序：</span>
        <Button-group>
          <template v-for="(item, index) in buttonGroupModel">
            <Button
              v-if="item.selected" :disabled="SearchDisabled" type="primary" @click="modifyTheSort(index, item.status)" :key="index">
              {{ item.title }}
              <Icon
                type="md-arrow-round-up" v-if="item.status && item.selected"></Icon>
              <Icon
                type="md-arrow-round-down" v-if="!item.status && item.selected"></Icon>
            </Button>
            <Button
              v-if="!item.selected" :disabled="SearchDisabled" @click="modifyTheSort(index, item.status)" :key="index">
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
    <div class="orderTable normalTop" :id="tbleBoxId" v-if="getPermission('orderInfo_queryForMarkShipments')">
      <Table
        highlight-row
        border
        :columns="orderColumn"
        :height="tableHeight"
        :loading="tableLoading"
        :data="orderData"
        @on-selection-change="getSelectValue"></Table>
      <div class="table-page">
        <div class="table-page-right">
          <Page
            :total="total"
            @on-change="pageNumChange"
            show-total
            :page-size="pageParams.pageSize"
            show-elevator
            :current="curPage"
            show-sizer
            @on-page-size-change="pageSizeChange"
            placement="top"
            :page-size-opts="pageArray"></Page>
        </div>
      </div>
    </div>
    <keep-alive>
      <Modal
        v-model="markshipmentModel.status"
        :mask-closable="false"
        width="400"
        v-if="markshipmentStatus"
        @on-ok="setMarkshipment">
        <div class="ivu-modal-confirm">
          <div class="ivu-modal-confirm-head">
            <div class="ivu-modal-confirm-head-title">{{ markshipmentModel.title }}</div>
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
                    {{ markshipmentModel.content }} </p>
                </Col>
              </Row>
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
    <!--导入退货跟踪号-->
    <return-tracking-number-import-modal ref="returnTrackingNumberImportModal"></return-tracking-number-import-modal>
    <!--批量修改退货跟踪号-->
    <return-tracking-number-edit-modal ref="returnTrackingNumberEditModal" :orderData="orderData"></return-tracking-number-edit-modal>
  </div>
</template>
<script>
import api from '@/api/api';
import orderDetails from "@/views/commonOrder/components/commonOrder/orderDetails";
import Mixin from '@/components/mixin/common_mixin';
import orderSys from '@/components/mixin/orderSys_mixin';
import returnTrackingNumberImportModal from '@/views/commonOrder/components/commonOrder/returnTrackingNumberImportModal';
import returnTrackingNumberEditModal from '@/views/commonOrder/components/commonOrder/returnTrackingNumberEditModal';
import logisticsModeTree from '@/components/common/logisticsModeTree';
import { noMarkConfig } from '@/views/commonOrder/script/markShipmentsConfig';

const searchOther = {
  update: {
    queryStatus: 0
  },
  waybill: {
    queryStatus: 1
  },
  fWaitAll: {
    queryStatus: 2
  },
  shippingMark: {
    queryStatus: 3
  }
}
const pattern = ['otto'];

export default {
  mixins: [Mixin, orderSys],
  components: {
    returnTrackingNumberImportModal,
    returnTrackingNumberEditModal,
    orderDetails,
    logisticsModeTree
  },
  data () {
    return {
      noMarkConfig: noMarkConfig[this.inGroup] || noMarkConfig.default,
      tbleBoxId: `tbleTips-${(new Date().getTime()).toString(32)}-${(Number(((Math.random()).toString()).substring(2))).toString(32)}`,
      businessDeptDataList: [],
      platform: this.inGroup,
      newPattern: pattern,
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
        businessDeptIdList: [],
        isCashOnDelivery: -1,
        remainTimeType: 1, // 剩余天数
        deliveryStatus: -1, // 发货状态
        searchValue: null,
        merchantShippingMethodIdList: [], // 物流方式ID
        merchantCarrierIdList: [],
        buyerCountryCodeList: [],
        syncStatus: pattern.includes(this.inGroup) ? null : 1,
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
        amazonIsBusinessOrder: null,
        amazonIsPrime: null,
        asin: null,
        showAbnormalOrder: 0,
        hasTrackingNumber: -1,
        wishIsCombinedOrder: -1,
        wishIsAdvancedLogistics: -1,
        wishIsPremiumcarrierUpgrade: -1,
        wishIsWishExpress: -1,
      },
      totalPage: 0,
      total: 0,
      curPage: 1,
      countryModal: [],
      markCountryModal: [],
      formValidate: {
        country: []
      },
      cashDeliveryTab: [
        { label: '全部', value: -1 },
        { label: '是', value: 1 },
        { label: '否', value: 0 }
      ],
      buyerTypeList: [ // 买家类型
        { type: 'B2B', value: 1
        },
        { type: 'B2C', value: 0 }
      ],
      amazonPrimeList: [ // prime订单
        { type: '是', value: 1
        },
        { type: '否', value: 0 }
      ],
      remainDayList: [
        {
          selected: false,
          id: -1,
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
        { selected: true, id: 1, title: '未标' },
        { selected: false, id: 4, title: '标失败' },
        { selected: false, id: 2, title: '正在标' }
      ],
      trackingNumberList: [
        {
          selected: true,
          id: -1,
          title: '全部'
        }, {
          selected: false,
          id: 'Y',
          title: '已返回'
        }, {
          selected: false,
          id: 'N',
          title: '未返回'
        }
      ],
      shippingStatusList: [
        {
          selected: true,
          id: -1,
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
      // (0:否 1:是 -1:全部)
      wishIsCombinedOrderList: [
        { selected: true, id: -1, title: '全部' },
        { selected: false, id: 1, title: '是' },
        { selected: false, id: 0, title: '否' }
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
          width: 150,
          fixed: 'left',
          align: 'center',
          render: (h, params) => {
            return h('div', {
              style: {
                color: this.getPermission('orderInfo_detail') ? '#0054A6' : '#515a6e',
                cursor: 'pointer'
              },
              on: {
                click: () => {
                  if (this.getPermission('orderInfo_detail')) {
                    this.show(params.row.orderId);
                    this.orderNo = params.row.accountCode + '-' + params.row.salesRecordNumber;
                    this.orderTagList = params.row.orderTagList;
                    this.webstoreItemSite = params.row.webstoreItemSite;
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
          width: 150,
          align: 'center',
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
          width: 160,
          render: (h, params) => {
            return h('span', this.getDataToLocalTime(params.row.payTime, 'fulltime'));
          }
        },
        psw: {
          title: '包裹号' + '/' + '物流方式' + '/' + '运单号',
          key: 'psw',
          align: 'center',
          minWidth: 200,
          render: (h, params) => {
            let n = params.row.carrierShippingMethodOrderBo;
            if (n !== null) {
              return h('div', this.getPSWDetails(n, h));
            } else {
              return '';
            }
          }
        },
        ebayOrderStatus: {
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
        },
        remainTime: {
          title: '发货剩余时间',
          key: 'remainTime',
          align: 'center',
          width: 160,
          render: (h, params) => {
            let remainTime;
            if (this.pageParams.remainTimeType === 0 && params.row.remainTime === 0) {
              remainTime = '逾期';
            } else {
              remainTime = this.getLimitTime(params.row.remainTime);
            }
            return h('div', {
              style: {
                color: '#f00'
              }
            }, remainTime);
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
        aliexpressOrderStatus: {
          title: '订单状态',
          key: 'orderStatus',
          align: 'center',
          width: 140,
          render: (h, { row }) => {
            return h('span', this.getPlatformOrderStatus(row.platformOrderStatus));
          }
        },
        platformOrderStatus: {
          title: '订单状态',
          key: 'platformOrderStatus',
          align: 'center',
          width: 120
        },
        productList: {
          title: '产品',
          key: 'productList',
          align: 'center',
          resizable: true,
          width: 150,
          render: (h, params) => {
            let data = params.row.productList;
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
        orderAbnormal: {
          title: '订单异常',
          key: 'orderStatus',
          align: 'center',
          width: 150,
          render: (h, params) => {
            return h('div', [
              params.row.notesCheckingOk === 0 && params.row.isSuspended === 1 ? h('div', [
                h('span', '有留言' + ','), h('span', '截留')
              ]) : params.row.notesCheckingOk === 0 && params.row.isSuspended !== 1
                ? h('div', '有留言')
                : params.row.isSuspended === 1 && params.row.notesCheckingOk !== 0
                  ? h('div', '截留')
                  : params.row.notesCheckingOk !== 0 && params.row.isSuspended !== 1 ? h('div', '-') : ''
            ]);
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
          width: 220,
          render: (h, params) => {
            let btnItem = [];
            if (this.getPermission('orderInfo_updateForShipments_single')) {
              if ((this.isNewType && this.markView && !this.isDisabledBtn) || (!this.isNewType && params.row.syncStatus !== 2)) {
                btnItem.push(h('Button', {
                  props: {
                    size: 'small'
                  },
                  class: 'mr5',
                  on: {
                    click: () => {
                      this.setMarkshipment('single', params.row.orderId);
                    }
                  }
                }, '标发货'));
              }
            }
            if (this.getPermission('orderInfo_detail') && ((this.isNewType && !this.isDisabledBtn) || !this.isNewType)) {
              btnItem.push(h('Button', {
                props: {
                  size: 'small'
                },
                class: 'mr5',
                on: {
                  click: () => {
                    this.show(params.row.orderId);
                    this.orderNo = params.row.accountCode + '-' + params.row.salesRecordNumber;
                    this.orderTagList = params.row.orderTagList;
                    this.webstoreItemSite = params.row.webstoreItemSite;
                  }
                }
              }, '订单详情'));
            }
            if (this.getPermission('orderInfo_syncIgnore') && this.pageParams.syncIgnore === 0) {
              btnItem.push(h('Button', {
                props: {
                  size: 'small'
                },
                class: 'mr5',
                on: {
                  click: () => {
                    this.markIgnored(params.row.orderId);
                  }
                }
              }, '标记忽略'));
            }
            if (this.getPermission('orderInfo_cancelSyncIgnore') && this.pageParams.syncIgnore === 1) {
              btnItem.push(h('Button', {
                props: {
                  size: 'small'
                },
                on: {
                  click: () => {
                    this.reductionMt(params.row.orderId);
                  }
                }
              }, '还原'));
            }
            return h('div', {}, btnItem);
          }
        }
      },
      orderData: [],
      orderIdList: [],
      setTagListStatus: false,
      shippingMethodModel: null,
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
    tabTimestamp: { type: Number },
    tabpaneView: { type: String }
  },
  watch: {
    tabTimestamp (n, o) {
      if (n !== o && n !== null) {
        this.getList();
        // 切换之后处理 搜索栏
        this.$nextTick(() => {
          this.$refs.noMarkTable && this.$refs.noMarkTable.init();
        })
      }
    }
  },
  computed: {
    tableHeight () {
      return this.getTableHeight(350);
    },
    orderColumn () {
      let newColumn = [];
      (noMarkConfig[`${this.inGroup}Column`] || noMarkConfig.defaultColumn).forEach((key) => {
        if (!this.$common.isEmpty(this.tableColumn[key])) {
          newColumn.push(this.tableColumn[key]);
        }
      });
      return newColumn;
    },
    // 是否新方式
    isNewType () {
      return this.newPattern.includes(this.platform);
    },
    // 是否禁用所有操作按钮
    isDisabledBtn () {
      if (this.isNewType) return ['shippingMark'].includes(this.tabpaneView);
      return false;
    },
    //  otto 状态是否显示 标发货功能
    markView () {
      return ['fWaitAll'].includes(this.tabpaneView);
    }
  },
  created () {
    this.getShopList(); // 获取店铺
    this.$common.promiseAll([
      () => {
        return this.getWarehouseData(); // 获取仓库数据
      },
      () => {
        return this.getBusinessDeptData(); // 获取事业部
      },
      () => {
        return this.getOrderListTag();// 获取标签列表
      }
    ]).finally(() => {
      this.getList();
    })
  },
  methods: {
    // 获取仓库数据
    getWarehouseData () {
      return new Promise((resolve) => {
        this.axios.post(api.get_warehouseList, { warehouseStatus: '0' }).then(res => {
          if (res && res.data && res.data.code === 0 && res.data.datas) {
            (res.data.datas || []).forEach(item => {
              this.warehouseJson[item.warehouseCode] = item;
            })
            this.warehouseList = res.data.datas || [];
          }
        }).finally(() => {
          resolve({ state: 'finally' });
        })
      })
    },
    // 物流方式
    treeChange (val) {
      this.pageParams.merchantCarrierIdList = val.carrierId;
      this.pageParams.merchantShippingMethodIdList = val.shippingMethodId;
    },
    // 获取搜索参数
    getNewParams (pageParams) {
      let params = this.$common.copy(pageParams);
      const list = [
        'remainTimeType', 'syncStatus', 'hasTrackingNumber', 'deliveryStatus', 'isCashOnDelivery', 'wishIsCombinedOrder',
        'wishIsAdvancedLogistics', 'wishIsPremiumcarrierUpgrade', 'wishIsWishExpress'
      ];
      let includeKey = [
        'pageNum', 'pageSize', 'orderBy', 'upDown', 'platformId', 'showAbnormalOrder'
      ];
      if (this.noMarkConfig.includes('shippingMethodModel')) {
        includeKey.push('merchantCarrierIdList');
        includeKey.push('merchantShippingMethodIdList');
      }
      // 移除非当前平台的参数
      Object.keys(params).forEach(key => {
        if (!this.noMarkConfig.includes(key) && !includeKey.includes(key)) {
          delete params[key];
        }
      });
      list.forEach(key => {
        params[key] = params[key] === -1 ? null : params[key];
      })
      let warehouseIds = [];
      params.warehouseCode.forEach(item => {
        if (this.warehouseJson[item]) {
          warehouseIds.push(this.warehouseJson[item].warehouseId);
        }
      })
      delete params.warehouseCode;
      params.warehouseIdList = warehouseIds;

      if (this.isNewType && !this.$common.isEmpty(this.tabpaneView) && !this.$common.isEmpty(searchOther[this.tabpaneView])) {
        params = { ...params, ...searchOther[this.tabpaneView] };
      }
      return params;
    },
    // 获取事业部
    getBusinessDeptData () {
      return new Promise((resolve) => {
        if (!this.noMarkConfig.includes('businessDeptIdList')) return resolve({ state: 'finally' }); ;
        this.axios.get(api.get_businessDeptList).then(res => {
          if (res && res.data) {
            this.businessDeptDataList = res.data.data || [];
          }
        }).finally(() => {
          resolve({ state: 'finally' });
        })
      })
    },
    getList () {
      this.orderData = [];
      if (!this.getPermission('orderInfo_queryForMarkShipments')) return;
      this.loadingTrue();
      this.$emit('getTabNumber');
      this.axios.post(api.get_shipmentsList, this.getNewParams(this.pageParams)).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          let pos = [];
          let saleAccountIdPos = [];
          if (data.list !== null) {
            data.list.forEach((n, i) => {
              pos.push({
                ...n,
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
                for (var i = 0; i < list.length; i++) {
                  for (var t = 0; t < pos.length; t++) {
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
            this.getCount();
          });
        } else {
          this.loadingFalse();
        }
      }).catch(() => {
        this.loadingFalse();
      });
    },
    // 获取发货剩余天数对应数量
    getCount () {
      if (this.noMarkConfig.includes('remainTimeType')) {
        let page = this.$store.state.inGroup;
        let platformId = [page];
        this.axios.get(api.get_markShipmentNum + '?platformId=' + platformId).then(response => {
          if (response.data.code === 0) {
            let data = response.data.datas;
            this.$nextTick(() => {
              this.remainDayList[1].num = data.remainInOneDay;
              this.remainDayList[2].num = data.overdueOrder;
              this.remainDayList[3].num = data.remainManyDays;
            });
          }
        });
      }
    },
    reset () {
      this.shippingMethodModel = null;
      this.$refs['pageParams'].resetFields();
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
        this.getList();
      })
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
      if ((this.orderIdList.length === 0 || this.orderIdList === null) && type !== 'all') {
        this.$Message.error('请选择订单');
        return false;
      }
      this.markshipmentStatus = true;
      if (type !== 'all') {
        this.markshipmentModel.title = '批量标发货';
        this.markshipmentModel.content = '系统将会把选中的订单在' + this.$store.state.inGroup + '后台' + this.$store.state.inGroup + '平台上标记为发货';
      } else {
        this.markshipmentModel.title = '标发货（所有结果集）';
        this.markshipmentModel.content = '系统将会把符合您当前查询条件的所有订单在' + this.$store.state.inGroup + '后台' + this.$store.state.inGroup + '平台上标记为发货';
      }
      this.$nextTick(() => {
        this.markshipmentModel.status = true;
      });
    },
    tagChange (value) {
      if (value.indexOf('null') >= 0) {
        this.pageParams.tagIdList = [];
      } else {
        this.pageParams.tagIdList = value;
      }
    },
    // 页码大小改变
    pageSizeChange (pageSize) {
      this.pageParams.pageSize = pageSize;
      this.$nextTick(() => {
        this.getList();
      })
    },
    // 分页切换
    pageNumChange (page) {
      this.pageParams.pageNum = page;
      this.$nextTick(() => {
        this.getList();
      })
    },
    setMarkshipment (type, oid) {
      let obj;
      if (type !== 'single') {
        obj = {
          orderIdList: this.orderIdList,
          platformId: [this.inGroup]
        };
      } else {
        obj = {
          orderIdList: [oid],
          platformId: [this.inGroup]
        };
      }
      if (this.markshipmentModel.title === '标发货（所有结果集）' && type !== 'single') {
        obj = Object.assign(this.pageParams, obj);
      }
      this.axios.put(api.markShipment, JSON.stringify(obj)).then(response => {
        if (response.data.code === 0) {
          this.$Message.success('操作成功');
          this.getList();
          this.orderIdList = [];
        } else {
          (!response.data || ![999993, '999993'].includes(response.data.code)) && this.$Message.error('操作失败，请重新尝试');
        }
      });
    },
    show (params) {
      this.orderDetailsBegin = true;
      this.orderDetailsId = params;
      let date = new Date().getTime();
      this.$nextTick(() => {
        this.orderDetails = true;
        this.timestamp = date;
      });
    },
    openImportTracking () {
      this.$refs.returnTrackingNumberImportModal.open();
    },
    openEditTracking () {
      if (this.orderIdList.length < 1) {
        this.$Message.info('未选择数据');
        return;
      }
      this.$refs.returnTrackingNumberEditModal.open(this.orderIdList);
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
    setTimeout(this.getCountrys(), 2000);// 获取国家区域列表
  }
};
</script>
<style lang="less" scoped>
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
