<template>
  <div style="position: relative;">
    <div class="commonFilter">
      <div class="card-container">
        <div class="card-content">
          <div class="platformParamsSelect">
            <Form ref="pageParams" :model="pageParams" :label-width="labelWidth">
              <dyt-filter ref="filterRef">
                <Form-item label="店铺" prop="saleAccountIds" v-if="platformFilterKey.includes('saleAccountIds')">
                  <dytStoreSelect
                    v-model="pageParams.saleAccountIds"
                    :option-data="shopList"
                    :replace-option-key="{ value: 'saleAccountId', label: 'accountCode' }"
                    placeholder="请选择店铺，可输入搜索"
                    input-placeholder="请输入店铺，多个店铺可用逗号或换行隔开"
                  />
                </Form-item>
                <Form-item label="付款时间" prop="payTime" v-if="platformFilterKey.includes('payTime')">
                  <Date-picker
                    transfer
                    type="datetimerange"
                    style="width:100%"
                    :clearable="true"
                    :options="dateOptions"
                    format="yyyy-MM-dd HH:mm:ss"
                    placement="bottom-end"
                    placeholder="选择日期"
                    v-model="pageParams.payTime"
                  />
                </Form-item>
                <Form-item label="异常类型" prop="outOfStockStatusList" v-if="platformFilterKey.includes('outOfStockStatusList')">
                  <dyt-select v-model="pageParams.outOfStockStatusList" :max-tag-count="1" multiple>
                    <Option v-for="item in failTypeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="EPC订单" prop="wishIsCombinedOrder" v-if="platformFilterKey.includes('wishIsCombinedOrder')">
                  <dyt-select v-model="pageParams.wishIsCombinedOrder" placeholder="EPC订单">
                    <Option v-for="(item, index) in orderList" :key="index" :value="item.value">{{ item.label }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="A+物流计划订单" prop="wishIsAdvancedLogistics" v-if="platformFilterKey.includes('wishIsAdvancedLogistics')">
                  <dyt-select v-model="pageParams.wishIsAdvancedLogistics" placeholder="A+物流计划订单">
                    <Option v-for="(item, index) in orderList" :key="index" :value="item.value">{{ item.label }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="优质物流商订单" prop="wishIsPremiumcarrierUpgrade" v-if="platformFilterKey.includes('wishIsPremiumcarrierUpgrade')">
                  <dyt-select v-model="pageParams.wishIsPremiumcarrierUpgrade" placeholder="优质物流商订单">
                    <Option v-for="(item, index) in orderList" :key="index" :value="item.value">{{ item.label }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="WISH EXPRESS订单" prop="wishIsWishExpress" v-if="platformFilterKey.includes('wishIsWishExpress')">
                  <dyt-select v-model="pageParams.wishIsWishExpress" placeholder="WISH EXPRESS订单">
                    <Option v-for="(item, index) in orderList" :key="index" :value="item.value">{{ item.label }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="国家/地区" prop="buyerCountryCodeList" v-if="platformFilterKey.includes('buyerCountryCodeList')">
                  <dyt-select v-model="pageParams.buyerCountryCodeList" @on-change="countryChange" :max-tag-count="1" multiple placeholder="请选择或输入所在地">
                    <Option v-for="(item,index) in formValidate.country" :key="index" :value="item.twoCode" :v="item.cnName">{{ item.enName }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="仓库" prop="warehouseIdList" v-if="platformFilterKey.includes('warehouseIdList')">
                  <dyt-select v-model="pageParams.warehouseIdList" :max-tag-count="1" multiple placeholder="请选择仓库">
                    <Option v-for="(item, index) in warehouseList" :value='item.warehouseId' :label="item.warehouseName" :key="`ware-${index}`" />
                  </dyt-select>
                </Form-item>
                <Form-item label="标签" prop="tagIdList" v-if="platformFilterKey.includes('tagIdList')">
                  <dyt-select v-model="pageParams.tagIdList" :max-tag-count="1" multiple placeholder="请选择或搜索标签">
                    <Option v-for="item in tagsList" :key="item.tagId" :value="item.tagId" :v="item.tagId">{{ item.tagName }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="商品状态" prop="productStatus" v-if="platformFilterKey.includes('productStatus')">
                  <div style="display: inline-block;vertical-align: middle;">
                    <dyt-select v-model="pageParams.productStatus" placeholder="请选择商品状态">
                      <Option v-for="(item, index) in productStatuList" :value='item.value' :key="`status-${index}`">{{item.label}}</Option>
                    </dyt-select>
                  </div>
                </Form-item>
                <Form-item label="订单号" prop="orderNo" v-if="platformFilterKey.includes('orderNo')">
                  <dyt-input-tag type="textarea" v-model="pageParams.orderNo" :limit="1" :string="true" placeholder="请输入订单号,多个请用逗号隔开" />
                </Form-item>
                <Form-item label="买家姓名" prop="buyerName" v-if="platformFilterKey.includes('buyerName')">
                  <dyt-input placeholder="请输入买家姓名" v-model.trim="pageParams.buyerName"></dyt-input>
                </Form-item>
                <Form-item label="买家ID" prop="buyerAccountId" v-if="platformFilterKey.includes('buyerAccountId')">
                  <dyt-input placeholder="请输入买家ID" v-model.trim="pageParams.buyerAccountId"></dyt-input>
                </Form-item>
                <Form-item label="平台产品编码" prop="webstoreItemId" v-if="platformFilterKey.includes('webstoreItemId')">
                  <dyt-input placeholder="请输入平台产品编码" v-model.trim="pageParams.webstoreItemId"></dyt-input>
                </Form-item>
                <Form-item label="SPU/SKU" prop="webstoreSku" v-if="platformFilterKey.includes('webstoreSku')">
                  <dyt-input-tag type="textarea" placeholder="请输入SPU/SKU, 多个请用逗号隔开" :limit="1" :string="true" v-model="pageParams.webstoreSku" />
                </Form-item>
                <Form-item label="商品事业部" prop="businessDeptIdList" v-if="platformFilterKey.includes('businessDeptIdList') && isGetBusiness">
                  <dyt-select
                    v-model="pageParams.businessDeptIdList"
                    :max-tag-count="1"
                    multiple placeholder="请选择商品事业部"
                  >
                    <Option v-for="(item, index) in businessDeptDataList" :value='item.id' :key="`business-${index}`">{{item.name}}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="是否货到付款订单" prop="isCashOnDelivery" v-if="platformFilterKey.includes('isCashOnDelivery')">
                  <dyt-select v-model="pageParams.isCashOnDelivery" placeholder="是否货到付款订单">
                    <Option v-for="item in orderList" :key="item.value" :value="item.value">{{ item.label }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="搜索字符" prop="searchValue" v-if="platformFilterKey.includes('searchValue')">
                  <dyt-input class="filterSearch" placeholder="可输入订单号、买家ID、买家姓名、SKU、平台产品编码" v-model.trim="pageParams.searchValue"></dyt-input>
                </Form-item>
                <div slot="operation">
                  <Button type="primary" @click="search" :disabled="SearchDisabled" icon="md-search">查询 </Button>
                  <Button @click="reset" style="margin-left:10px;" v-once icon="md-refresh">重置 </Button>
                </div>
              </dyt-filter>
            </Form>
          </div>
        </div>
      </div>
    </div>
    <div class="tableControl" style="display: flex;">
      <div style="flex: 100;">
        <Button type="primary" style="margin-right: 20px" @click="startCancelDelivery" class="iconbuttons" :disabled="!getPermission('orderInfo_cancelOrder_batch')">
          <span class="icon iconfont">&#xe67e;</span>
          {{ isCancelPlat.includes(platform) ? '取消' : '作废' }}订单
        </Button>
        <Dropdown v-if="getPermission('orderTag_insert_batch') || getPermission('orderTag_clear')" transfer>
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
        <!-- 只有沃尔玛的显示导出 -->
        <!-- <Dropdown class="ml20" trigger="click" v-if="inGroup === 'walmart' && (getPermission('walmartFailedOrder_exportOrder_batch') || getPermission('walmartFailedOrder_exportOrder_all'))"> -->
        <Dropdown class="ml20" trigger="click" v-if="(changePermission('batch') || changePermission('all'))" transfer>
          <Button type="primary" class="iconbuttons">
            导出
            <Icon type="ios-arrow-down"></Icon>
          </Button>
          <DropdownMenu slot="list">
            <!-- <DropdownItem @click.native="exportOrder" v-if="getPermission('walmartFailedOrder_exportOrder_batch')">导出选中</DropdownItem>
            <DropdownItem @click.native="exportOrderHasCondition" v-if="getPermission('walmartFailedOrder_exportOrder_all')">导出（所有结果集）</DropdownItem> -->
            <DropdownItem @click.native="exportOrder" v-if="changePermission('batch')">导出选中</DropdownItem>
            <DropdownItem @click.native="exportOrderHasCondition" v-if="changePermission('all')">导出（所有结果集）</DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <Dropdown style="margin-left: 15px" v-if="getPermission('orderRemark_insert')" transfer>
          <Button type="primary">
            批量备注
            <Icon type="ios-arrow-down"></Icon>
          </Button>
          <DropdownMenu slot="list">
            <DropdownItem @click.native="batchUpdateRemark('check')">
              批量备注选中
            </DropdownItem>
            <DropdownItem @click.native="batchUpdateRemark('all')">
              批量备注所有
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
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
            <Button v-if="!item.selected" :disabled="SearchDisabled" @click="modifyTheSort(index, item.status)" :key="index">
              {{ item.title }}
              <Icon type="md-arrow-round-up" v-if="item.status && item.selected"></Icon>
              <Icon type="md-arrow-round-down" v-if="!item.status && item.selected"></Icon>
            </Button>
          </template>
        </Button-group>
      </div>
    </div>
    <div class="orderTable normalTop stockout-order-table" v-if="getPermission('orderInfo_stockoutOrder')">
      <keep-alive>
        <Table
          highlight-row border
          :height="tableHeight"
          :loading="tableLoading"
          :columns="orderColumn"
          :data="orderData"
          :row-class-name="rowClassName"
          @on-selection-change="getSelectValue"
        />
      </keep-alive>
      <div class="table-page flexBox">
        <keep-alive>
          <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator :current="curPage" show-sizer @on-page-size-change="changePageSize" placement="top" :page-size-opts="pageArray"></Page>
        </keep-alive>
      </div>
    </div>
    <!-- 导出 -->
    <keep-alive>
      <Modal v-model="exportModel.status" :mask-closable="false" width="400" v-if="exportModelStatus" @on-ok="exportExcel">
        <div class="ivu-modal-confirm">
          <div class="ivu-modal-confirm-head" style="font-size: 16px;">{{ exportModel.title }}</div>
          <div class="ivu-modal-confirm-body ivu-modal-confirm-body-render">
            <div style="display: flex;align-items: center;margin-top:20px;padding-left: 20px;">
              <Icon type="md-information-circle" color="#ff9900" size="24"></Icon>
              <span style="padding-left: 10px;">确认是否导出</span>
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
          <Row v-for="(item,index) in productDetails" :key="index" class="normalTop">
            <Col :span="2">
            <div class="orderDetailsProductItemPic">
              <img
                :src="`${$common.isEmpty(item.pictureUrl) ? '' : item.pictureUrl.includes('/filenode/') ? item.pictureUrl : `./filenode/s/thumb${item.pictureUrl}`}`"
                :alt="item.title"
              />
            </div>
            </Col>
            <Col :span="17" :offset="1">
            <div class="odpidProductID">
              <span
                class="productID"
                @click="goItemUrl(item)"
                :class="{'cursor-pointer': platformIdUrlKey.includes(item.platformId)}"
                v-if="item.webstoreItemId"
              >itemID：{{ item.webstoreItemId }}</span>
              <span class="productHaveATitle">SKU: <em>{{ item.webstoreSku }}</em></span>
              <span class="productLogsticService">物流服务：<em>{{ item.buyerShippingMethod }}</em></span>
            </div>
            <div class="odpidProductDetails">
              {{ item.title }}
            </div>
            <div class="odpidProductParams" v-if="item.variations !== null">
              <span class="productHaveATitle" v-if="item.variations.indexOf('color') >=0 && item.variations.indexOf(';') > 0">Color:<em>{{ item.variations.split(': ')[1].split(';')[0] }} </em></span>
              <span class="productHaveATitle" v-if="item.variations.indexOf('color') >=0 && item.variations.indexOf(';') < 0">Color:<em>{{ item.variations.split(': ')[1] }} </em></span>
              <span class="productHaveATitle" v-if="item.variations.toLowerCase().indexOf('pack of') >= 0">Pack of:<em>{{ item.variations.split(';')[1].split(': ')[1] }}</em></span>
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
    <cancelDelivery ref="cancelDelivery" :orderIdList.sync="orderIdList"></cancelDelivery>
    <Modal
      v-model="stockoutOrderVisible"
      :width="90"
      title="缺货商品订单详情"
      class-name="stockout-order-modal"
    >
      <stockoutOrderDetails :component-data="orderDetailData" :slider-visible="stockoutOrderVisible" @closeModal="stockoutOrderCancel"/>
      <div slot="footer">
        <Button type="info" @click="stockoutOrderCancel">取消</Button>
      </div>
    </Modal>
    <!-- 批量备注 -->
    <batchRemarkModal :module-visible.sync="moduleRemarkVisible" :module-data="moduleRemarkData" @updateList="getList" />
    <Spin v-if="pageLoading" fix style="z-index: 9999999;"></Spin>
  </div>
</template>
<script>
import api from '@/api/api';
import orderDetails from "@/views/commonOrder/components/commonOrder/orderDetails";
import Mixin from '@/components/mixin/common_mixin';
import orderSys from '@/components/mixin/orderSys_mixin';
import cancelDelivery from '@/components/common/order/cancelOrder';
import stockoutOrderDetails from '@/views/commonOrder/components/commonOrder/stockoutOrderDetails';
import stockoutOrder from '@/views/commonOrder/script/stockoutOrder';
import productData from '@/views/productCenter/components/productCenter/staticData/productData';
import batchRemarkModal from "@/views/commonOrder/components/commonOrder/batchUpdateRemark";
import { platformReceptionUrl } from '@/utils/enum';
import filterKey from '@/views/commonOrder/script/stockoutOrderFilter';

export default {
  mixins: [Mixin, orderSys],
  components: {
    orderDetails,
    cancelDelivery,
    stockoutOrderDetails,
    batchRemarkModal
  },
  data () {
    return {
      moduleRemarkVisible: false,
      moduleRemarkData: {},
      selectedArr: [],
      isCancelPlat: ['ebay', 'ozon', 'otto', 'wish'],
      platform: this.inGroup,
      pageLoading: false,
      warehouseList: [], // 仓库数据
      // warehouseJson: {},
      platformFilterKey: filterKey[this.inGroup] || filterKey.default,
      productStatuList: productData.productStatus,
      statusTipsSku: productData.statusTipsSku,
      platformItemUrl: platformReceptionUrl,
      stockoutOrderVisible: false,
      orderDetailData: {},
      pageParamsStatus: false,
      businessDeptDataList: [],
      buttonGroupModel: [
        {
          type: 'payTime',
          selected: true,
          status: true, // true up false down
          title: '按付款时间'
        },
        {
          type: 'salesTime',
          selected: false,
          status: true, // true up false down
          title: '按下单时间'
        },
        {
          type: 'surplusTime',
          selected: false,
          status: true, // true up false down
          title: '发货剩余时间'
        }
      ],
      orderList: [
        {
          label: '全部',
          value: -1
        }, {
          label: '是',
          value: 1
        }, {
          label: '否',
          value: 0
        }
      ],
      pageParams: {
        isCashOnDelivery: -1,
        saleAccountIds: [],
        outOfStockStatusList: [],
        buyerCountryCodeList: [],
        businessDeptIdList: [],
        warehouseIdList: [],
        pageSize: 50,
        pageNum: 1,
        payEndTime: '',
        payStartTime: '',
        platformId: [this.inGroup],
        buyerAccountId: null,
        buyerName: null,
        webstoreItemId: null,
        webstoreSku: null,
        orderNo: null,
        orderBy: 'payTime',
        upDown: 'up',
        searchValue: '',
        tagIdList: [],
        payTime: this.$common.getRangeTime('', -1, 'month'),
        productStatus: null,
        wishIsCombinedOrder: '',
        wishIsAdvancedLogistics: '',
        wishIsWishExpress: '',
        wishIsPremiumcarrierUpgrade: ''
      },
      searchRule: [],
      formValidate: {
        country: []
      },
      orderDetails: false,
      orderDetailsBegin: true,
      orderDetailsId: null,
      orderNo: null,
      timestamp: null,
      orderTagList: null,
      webstoreItemSite: null,
      totalPage: 0,
      total: 0,
      curPage: 1,
      tableColumn: {
        selection: {
          type: 'selection',
          width: 40,
          fixed: 'left',
          align: 'center'
        },
        salesRecordNumber: {
          title: '基本信息',
          key: 'salesRecordNumber',
          width: 240,
          align: 'center',
          fixed: 'left',
          render: (h, { row }) => {
            const text = `${row.accountCode || ''}-${row.salesRecordNumber || ''}`;
            let orderItem = [
              h('span', {}, '订单号：'),
              h('span', {
                style: {
                  'color': this.getPermission('orderInfo_detail') ? '#0054A6' : '#515a6e',
                  'cursor': 'pointer'
                },
                on: {
                  click: () => {
                    if (this.getPermission('orderInfo_detail')) {
                      this.show(row.orderId);
                      this.orderNo = text;
                      this.orderTagList = row.orderTagList;
                      this.webstoreItemSite = row.webstoreItemSite;
                    }
                  }
                }
              }, text),
              h('icon', {
                class: 'icon lapa lapa-copy',
                attrs: {
                  title: '复制订单号'
                },
                style: {
                  cursor: "pointer",
                  'margin-left': '6px'
                },
                on: {
                  click: () => {
                    this.$common.copyToClip(text).then(() => {
                      this.$Message.success('复制订单号成功');
                    }).catch(() => {
                      this.$Message.error('当前浏览器不支持复制功能');
                    })
                  }
                }
              }, '')
            ];
            if (!this.$common.isEmpty(row.emailGroups)) {
              orderItem.push(h('Icon', {
                style: { 'cursor': 'pointer', 'margin-left': '5px', 'font-size': '22px', 'color': '#f20' },
                class: 'lapa lapa-solid-core-mail',
                on: {
                  click: () => {
                    const openUrl = `/cs-service/customer.html#/ebayMail`;
                    localStorage.setItem('erp-order-stockoutOrder', JSON.stringify({
                      buyerAccountId: row.buyerAccountId,
                      messageGroupId: row.emailGroups
                    }));
                    window.open(openUrl);
                  }
                }
              }));
            }
            let rowItem = [];
            if (!this.$common.isEmpty(row.accountCode)) {
              rowItem.push(h('span', {
                attrs: {
                  title: '店铺'
                },
                class: 'table-row-td-tag',
                style: {
                  color: 'rgba(45, 140, 240)',
                  background: 'rgba(45, 140, 240, 0.1)'
                },
              }, row.accountCode));
            }
            if (!this.$common.isEmpty(row.buyerCountryCodeList)) {
              rowItem.push(h('span', {
                attrs: {
                  title: '国家/地区'
                },
                class: 'table-row-td-tag',
                style: {
                  color: 'rgba(20, 118, 2)',
                  background: 'rgba(20, 118, 2, 0.1)'
                },
              }, row.buyerCountryCodeList));
            }
            if (!this.$common.isEmpty(row.productStatus)) {
              row.productStatus.split(',').forEach(txt => {
                rowItem.push(h('span', {
                  attrs: {
                    title: '商品状态'
                  },
                  class: 'table-row-td-tag',
                  style: {
                    color: 'rgba(43, 185, 43)',
                    background: 'rgba(43, 185, 43, 0.1)'
                  },
                }, txt));
              })
            }
            if ([3, '3'].includes(row.synDeliverStatus) || !this.$common.isEmpty(row.synDeliverDate)) {
              rowItem.push(h('span', {
                attrs: {
                  title: '标发货'
                },
                class: 'table-row-td-tag',
                style: {
                  color: 'rgba(53 190 255)',
                  background: 'rgba(53, 190, 255, 0.1)'
                },
              }, '已标发货'))
            }
            if ([7, '7'].includes(row.orderStatus)) {
              rowItem.push(h('span', {
                attrs: {
                  title: '已发货'
                },
                class: 'table-row-td-tag',
                style: {
                  color: 'rgba(93, 53, 255)',
                  background: 'rgba(93, 53, 255, 0.1)'
                },
              }, '已发货'))
            }
            if ([1, '1'].includes(row.isHand) && !['JIT'].includes(row.orderType)) {
              rowItem.push(h('span', {
                attrs: {
                  title: '手工单'
                },
                class: 'table-row-td-tag',
                style: {
                  color: 'rgba(187, 53, 255)',
                  background: 'rgba(187, 53, 255, 0.1)'
                },
              }, '手工单'))
            }
            if (!this.$common.isEmpty(row.trusteeshipType) && [0, 1].includes(Number(row.trusteeshipType))) {
              const txt = row.trusteeshipType == 1 ? '半托管' : '全托管';
              rowItem.push(h('span', {
                attrs: {
                  title: txt
                },
                class: 'table-row-td-tag',
                style: {
                  color: 'rgba(98 89 102)',
                  background: 'rgba(103, 82, 114, 0.1)'
                },
              }, txt))
            }
            if (typeof row.redelivery === 'boolean' && row.redelivery) {
              rowItem.push(h('span', {
                attrs: {
                  title: '有补发'
                },
                class: 'table-row-td-tag',
                style: {
                  color: 'rgba(156, 0, 185)',
                  background: 'rgba(156, 0, 185, 0.1)'
                },
              }, '有补发'))
            }
            if ([1, 2, '1', '2'].includes(row.isInvalid)) {
              rowItem.push(h('span', {
                attrs: {
                  title: '作废订单'
                },
                class: 'table-row-td-tag',
                style: {
                  color: 'rgba(225, 67, 67)',
                  background: 'rgba(225, 67, 67, 0.1)'
                },
              }, '已作废'))
            }
            if (typeof row.goodMiss === 'boolean' && row.goodMiss) {
              rowItem.push(h('span', {
                attrs: {
                  title: '缺货订单'
                },
                class: 'table-row-td-tag',
                style: {
                  color: 'rgba(255, 165, 0)',
                  background: 'rgba(255, 165, 0, 0.1)'
                },
              }, '缺货'))
            }
            if ([1, '1'].includes(row.isRefunded)) {
              rowItem.push(h('span', {
                attrs: {
                  title: '有退款'
                },
                class: 'table-row-td-tag',
                style: {
                  color: 'rgba(247, 93, 207)',
                  background: 'rgba(247, 93, 207, 0.1)'
                },
              }, '有退款'))
            }
            if ([1, '1'].includes(row.isPartRefunded)) {
              rowItem.push(h('span', {
                attrs: {
                  title: '部分退款'
                },
                class: 'table-row-td-tag',
                style: {
                  color: 'rgba(187, 80, 159)',
                  background: 'rgba(187, 80, 159, 0.1)'
                },
              }, '部分退款'))
            }
            if ([1, '1'].includes(row.hasAfterSales)) {
              rowItem.push(h('span', {
                attrs: {
                  title: '有售后单'
                },
                class: 'table-row-td-tag',
                style: {
                  color: 'rgba(68, 0, 201)',
                  background: 'rgba(68, 0, 201, 0.1)'
                },
              }, '有售后单'))
            }
            if (['ozon'].includes(row.platformId) && !this.$common.isEmpty(row.ozonSplitOrderRecordList)) {
              let oItem = [
                h('div', {}, '已拆单'),
                h('div', {}, `主单：${row.accountCode || ''}-${row.salesRecordNumber || ''}，数量：${row.notSpiltTotal}`),
              ];
              (row.ozonSplitOrderRecordList || []).forEach((item, cIndex) => {
                oItem.push(h('div', {}, `拆分订单${cIndex + 1}：${row.accountCode || ''}-${item.subWebstoreOrderId || ''}，数量：${item.quantity}`));
              });
              oItem.push(h('div', {}, '点击图标可查询主单以及拆分订单'));

              rowItem.push(h('Poptip', {
                props: {
                  placement: 'right',
                  trigger: 'hover',
                  transfer: true
                },
                style: {},
              }, [
                h('span', {
                  class: 'table-row-td-tag',
                  style: {
                    color: 'rgb(44 141 44)',
                    background: 'rgba(0, 111, 0, 0.2)',
                    cursor: 'pointer'
                  },
                  on: {
                    click: () => {
                      this.updateLoadTable({
                        orderNo: [
                          `${row.accountCode || ''}-${row.salesRecordNumber || ''}`,
                          ...(row.ozonSplitOrderRecordList || []).map(item => {
                            return `${row.accountCode || ''}-${item.subWebstoreOrderId || ''}`
                          })
                        ].join(',')
                      })
                    }
                  }
                }, '已拆单'),
                h('div', {
                  slot: 'content',
                  style: {
                    'width': '350px',
                    'white-space': 'initial',
                    'max-height': '50vh',
                    'overflow': 'auto',
                  },
                }, oItem)
              ]))
            }
            if ([1].includes(Number(row.isReply))) {
              rowItem.push(h('span', {
                attrs: {
                  title: '回复状态'
                },
                class: 'table-row-td-tag',
                style: {
                  color: 'rgba(222, 138, 255)',
                  background: 'rgba(222, 138, 255, 0.1)'
                },
              }, '自动回复'))
            }
            return h('div', {
              style: {
                'text-align': 'left'
              }
            }, [...orderItem, h('div', {}, rowItem)]);
          }
        },
        platformOrderStatus: {
          title: '订单状态',
          key: 'platformOrderStatus',
          align: 'center',
          width: 80
        },
        wishIsAdvancedLogistics: {
          title: 'A+物流计划订单',
          key: 'wishIsAdvancedLogistics',
          align: 'center',
          width: 110,
          render: (h, params) => {
            return h('div', [
              h(
                'div',
                params.row.orderExtendInfo != null &&
                  params.row.orderExtendInfo.wishIsAdvancedLogistics === 1
                  ? '是'
                  : '否'
              )
            ]);
          }
        },
        packageCode: {
          title: '站点',
          key: 'packageCode',
          width: 60,
          align: 'center',
          render: (h, params) => {
            if (params.row.webstoreItemSite !== null) {
              return h('div', {
                attrs: {
                  class:
                    'nationalFlag nationalFlag' + params.row.webstoreItemSite,
                  title: params.row.webstoreItemSite
                }
              });
            } else {
              return h('div', '');
            }
          }
        },
        productList: {
          title: '产品',
          key: 'productList',
          width: 120,
          align: 'center',
          resizable: true,
          render: (h, params) => {
            let data = params.row.productList;
            let pos = [];
            data.forEach((n, i) => {
              let item = this.tableImg(h, params, "", n.pictureUrl, () => {
                this.showPicModal(data);
              }, "right-end", this.$common.isEmpty(n.quantity) ? 0 : n.quantity);
              if (i < 3) {
                pos.push(item);
                if (i === 2) {
                  pos.push(
                    h(
                      'span',
                      {
                        style: {
                          marginLeft: '5px'
                        }
                      },
                      '...'
                    )
                  );
                }
              }
            });
            return h('div', pos);
          }
        },
        buyerName: {
          title: '买家ID/姓名',
          key: 'buyerName',
          align: 'center',
          width: 110,
          resizable: true,
          render: (h, params) => {
            return h('div', [
              h(
                'div',
                {
                  style: {
                    color: '#0054A6'
                  }
                },
                params.row.buyerAccountId
              ),
              h(
                'div',
                {
                  style: {
                    color: '#ff3300'
                  }
                },
                params.row.buyerName
              )
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
              h(
                'div',
                {
                  style: {
                    color: '#0054A6'
                  }
                },
                params.row.buyerAccountId
              )
            ]);
          }
        },
        abnormalMessage: {
          title: '异常原因',
          key: 'wmsOrderFailReasons',
          align: 'center',
          minWidth: 200,
          render: (h, { row }) => {
            const { orderId, wmsOrderFailReasons } = row;
            if (this.$common.isEmpty(wmsOrderFailReasons)) return h('div', {}, '');
            let demo = [];
            let txt = [];
            let beforeMsg = [];
            let beforeTxt = [];
            // 筛选订单
            wmsOrderFailReasons.forEach(k => {
              if (orderId === k.orderId) {
                if (!this.$common.isEmpty(k.abnormalOutOfStockMsg)) {
                  beforeTxt.push(`${k.packageCode}-${k.abnormalOutOfStockMsg}`);
                  beforeMsg.push(h('p', `${k.packageCode}-${k.abnormalOutOfStockMsg}`));
                }
                if (!this.$common.isEmpty(k.distributionLogisticsMsg)) {
                  txt.push(`${k.packageCode}-${k.distributionLogisticsMsg}`);
                  demo.push(h('p', `${k.packageCode}-${k.distributionLogisticsMsg}`));
                } else if (!this.$common.isEmpty(k.abnormalMessage)) {
                  txt.push(`${k.packageCode}-${k.abnormalMessage}`);
                  demo.push(h('p', `${k.packageCode}-${k.abnormalMessage}`));
                }
              }
            });
            txt = [...beforeTxt, ...txt];
            demo = [...beforeMsg, ...demo];
            if (this.$common.isEmpty(txt)) return h('div', {}, '');
            return h("Tooltip", {
              style: {
                textAlign: "center",
              },
              props: {
                'transfer-class-name': 'table-row-td-tooltip',
                transfer: true,
              }
            }, [
              h('div', {
                slot: 'content'
              }, demo),
              h('div', {
                class: 'lapa-row-td-tooltip',
              }, txt.join('\n'))
            ])
          }
        },
        outOfStockStatusConcat: {
          title: '异常类型',
          key: 'outOfStockStatusConcat',
          align: 'center',
          className: 'stockout-info-column',
          width: 90,
          render: (h, params) => {
            return this.setOutOfStockStatusConcatRender(h, params);
          }
        },
        wishIsPremiumcarrierUpgrade: {
          title: '优质物流商订单',
          key: 'wishIsPremiumcarrierUpgrade',
          align: 'center',
          width: 100,
          render: (h, params) => {
            return h('div', [
              h(
                'div',
                params.row.orderExtendInfo != null &&
                  params.row.orderExtendInfo.wishIsPremiumcarrierUpgrade === 1
                  ? '是'
                  : '否'
              )
            ]);
          }
        },
        wishIsWishExpress: {
          title: 'WISH EXPRESS订单',
          key: 'wishIsWishExpress',
          align: 'center',
          width: 130,
          render: (h, params) => {
            return h('div', [
              h(
                'div',
                params.row.orderExtendInfo != null &&
                  params.row.orderExtendInfo.wishIsWishExpress === 1
                  ? '是'
                  : '否'
              )
            ]);
          }
        },
        totalPrice: {
          title: '金额',
          key: 'totalPrice',
          align: 'center',
          width: 80,
          render: (h, params) => {
            return h('div', [
              h('div', params.row.totalPrice), params.row.totalPriceCurrency && h('div', '(' + params.row.totalPriceCurrency + ')')
            ]);
          }
        },
        remainTime: {
          title: '时间信息',
          key: 'remainTime',
          width: 200,
          render: (h, { row }) => {
            let rowItem = [];
            if (!this.$common.isEmpty(row.payTime)) {
              rowItem.push(h('div', {}, [
                h('span', {}, '付款时间：'),
                h('span', {}, row.payTime || '')
              ]));
            }
            const synDeliverDate = this.getDataToLocalTime(row.synDeliverDate, 'fulltime');
            if (row.synDeliverStatus == 3 && !this.$common.isEmpty(synDeliverDate)) {
              rowItem.push(h('div', {}, [
                h('span', {}, '已发货，标发货时间：'),
                h('span', {}, synDeliverDate)
              ]));
            } else {
              const remainTime = this.computedTime(row.remainTime);
              if (!this.$common.isEmpty(remainTime)) {
                rowItem.push(h('div', {}, [
                  h('span', {}, '发货剩余：'),
                  h('span', {
                    style: { color: '#f20' }
                  }, remainTime)
                ]));
              }
            }
            return h('div', {}, rowItem);
          }
        },
        tags: {
          title: '标签',
          key: 'tags',
          width: 130,
          align: 'center',
          render: (h, params) => {
            let orderTagList = params.row.orderTagList;
            let pos = [];
            if (!this.$common.isEmpty(orderTagList)) {
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
                  }),
                  h('span', n.tagName)
                ]);
                pos.push(item);
              });
              return h('div', pos);
            }
          }
        },
        remarkContent: {
          title: '备注',
          key: 'remarkContent',
          align: 'center',
          resizable: true,
          minWidth: 130
        },
        operate: {
          title: '操作',
          key: 'operate',
          align: 'center',
          fixed: 'right',
          className: 'stockout-operate-column',
          width: 240,
          render: (h, params) => {
            let operate = [];
            const statusList = params.row.outOfStockStatusConcat.split(',');
            if (['ebay', 'aliexpress'].includes(this.inGroup) && this.getPermission('orderInfo_cancelOrder_single')) {
              operate.push(h('Button', {
                props: { size: 'small' },
                style: { marginRight: '5px' },
                on: {
                  click: () => {
                    this.$refs['cancelDelivery'].cancelDelivery('single', params.row);
                  }
                }
              }, `${this.isCancelPlat.includes(this.platform) ? '取消' : '作废'}订单`));
            }
            this.getPermission('orderInfo_detail') && operate.push(h('Button', {
              props: { size: 'small' },
              style: { marginRight: '5px' },
              on: {
                click: () => {
                  this.show(params.row.orderId);
                  this.orderNo = params.row.accountCode + '-' + params.row.salesRecordNumber;
                  this.orderTagList = params.row.orderTagList;
                  this.webstoreItemSite = params.row.webstoreItemSite;
                }
              }
            }, '订单详情'));
            statusList.includes('4') && operate.push(h('Button', {
              props: { size: 'small' },
              on: {
                click: () => {
                  this.orderDetailData = this.$common.copy(params.row);
                  this.stockoutOrderVisible = true;
                }
              }
            }, '缺货商品数据'));
            return h('div', operate);
          }
        }
      },
      orderData: [],
      orderIdList: [],
      setTagListStatus: false,
      productStatus: false, // 点击产品列表详情状态控制
      productModal: false,
      resetStatus: true,
      productDetails: '',
      // 导出弹窗数据
      exportModel: {
        title: '',
        content: '',
        status: false
      },
      // 导出弹窗状态
      exportModelStatus: false
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
    orderColumn () {
      let platformColumn = [];
      (filterKey[`${this.inGroup}Column`] || filterKey.defaultColumn).forEach(key => {
        if (!this.$common.isEmpty(this.tableColumn[key])) {
          platformColumn.push(this.tableColumn[key]);
        }
      });
      return platformColumn;
    },
    platformIdUrlKey () {
      return Object.keys(this.platformItemUrl || {});
    },
    tableHeight () {
      return this.getTableHeight(280);
    },
    // 是否展示商品事业部
    isGetBusiness () {
      return ['otto'].includes(this.inGroup);
    }
  },
  created () {
    this.pageLoading = true;
    this.searchRule = Object.keys(this.pageParams).filter(key => this.$common.isEmpty(this.pageParams[key]));
    this.$common.promiseAll([
      // 获取仓库数据
      this.getWarehouseData,
      // 获取事业部
      this.getBusinessDeptData
    ]).finally(() => {
      this.pageLoading = false;
    })
  },
  methods: {
    // 获取仓库数据
    getWarehouseData () {
      return new Promise((resolve) => {
        this.axios.post(api.get_warehouseList, { warehouseStatus: '0' }).then(res => {
          if (res && res.data && res.data.code === 0 && res.data.datas) {
            this.warehouseList = res.data.datas || [];
          }
        }).finally(() => {
          resolve({ state: 'finally' });
        })
      })
    },
    // 批量备注
    batchUpdateRemark (str) {
      let updateFilter = this.getParams();
      if (str !== "all") {
        if (this.selectedArr.length == 0) {
          return this.$Message.error("请选择订单");
        }
        updateFilter = {
          orderNo: this.selectedArr.map(m => `${m.accountCode}-${m.salesRecordNumber}`).join(',')
        }
      }
      this.moduleRemarkData = {
        filterParams: updateFilter,
        url: api.distributionBatchInsertRemark
      };
      this.$nextTick(() => {
        this.moduleRemarkVisible = true;
      })
    },
    rowClassName (row, index) {
      return stockoutOrder.rowClassName(row, index);
    },
    stockoutOrderCancel () {
      this.stockoutOrderVisible = false;
    },
    startLoading () {
      let v = this;
      v.$Loading.start();
      Promise.resolve(
        v.getPermission('orderInfo_stockoutOrder') ? v.getList() : v.gotoError()
      ).then(() => {
        v.$Loading.finish();
        v.getShopList();
        v.getOrderListTag(); // 获取标签列表
      });
    },
    // 验证搜索条件是否满足
    verifySearch (params) {
      let passArr = [];
      Object.keys(params).forEach(key => {
        this.searchRule.includes(key) && !this.$common.isEmpty(params[key]) && passArr.push(key);
      })
      return passArr.length > 0;
    },
    // 获取搜索条件
    getParams () {
      let obj = this.deepCopy(this.pageParams);
      // 移除非当前平台的参数
      Object.keys(obj).forEach(key => {
        if (!['pageNum', 'pageSize', 'orderBy', 'upDown', 'platformId'].includes(key) && !this.platformFilterKey.includes(key)) {
          delete obj[key];
        }
      });
      obj.isCashOnDelivery = obj.isCashOnDelivery === -1 ? null : obj.isCashOnDelivery;
      if (!this.isGetBusiness) {
        delete obj.businessDeptIdList;
      }
      obj.payStartTime = null;
      obj.payEndTime = null;
      if (!this.$common.isEmpty(obj.payTime) && !this.$common.isEmpty(obj.payTime[0])) {
        obj.payStartTime = this.getUniversalTime(new Date(obj.payTime[0]).getTime(), 'fulltime');
      }
      if (!this.$common.isEmpty(obj.payTime) && !this.$common.isEmpty(obj.payTime[1])) {
        obj.payEndTime = this.getUniversalTime(new Date(obj.payTime[1]).getTime(), 'fulltime');
      }
      delete obj.payTime;
      const list = ['wishIsCombinedOrder', 'wishIsAdvancedLogistics', 'wishIsPremiumcarrierUpgrade', 'wishIsWishExpress'];
      list.forEach(key => {
        obj[key] = obj[key] === -1 ? null : obj[key];
      });
      let outOfStockStatusList = [];
      obj.outOfStockStatusList.forEach(f => {
        if (this.$common.isString(f) && f.includes(',')) {
          f.split(',').forEach(k => {
            outOfStockStatusList.push(k);
          })
        } else {
          outOfStockStatusList.push(f);
        }
      });
      obj.outOfStockStatusList = outOfStockStatusList;
      return obj;
    },
    // 更改搜索条件后查询
    updateLoadTable(obj = {}) {
      this.pageParams = { ...this.pageParams, ...obj };
      this.$nextTick(() => {
        this.getList();
      })
    },
    getList () {
      let v = this;
      v.orderData = [];
      v.loadingTrue();
      const pageParam = this.getParams();
      this.selectedArr = [];
      if (!this.verifySearch(pageParam)) {
        this.$Message.error('最少需要一个搜索条件！');
        this.loadingFalse();
        return;
      }
      v.axios.post(api.get_queryForGoodsMissing, pageParam).then((response) => {
        if (response.data.code === 0) {
          let data = response.data.datas.list;
          if (data !== null && data.length > 0) {
            let pos = [];
            let saleAccountIdPos = [];
            let orderIdPos = [];
            data.forEach((n, i) => {
              pos.push({
                ...n,
                salesRecordNumber: n.salesRecordNumber,
                webstoreItemSite: n.webstoreItemSite,
                orderNotes: n.orderNotes,
                productList: [],
                buyerName: n.buyerName,
                outOfStockStatusConcat: n.outOfStockStatusConcat,
                buyerAccountId: n.buyerAccountId,
                buyerCountryCodeList: n.buyerCountryCode,
                totalPrice: n.totalPrice,
                payTime: v.getDataToLocalTime(n.payTime, 'fulltime'),
                platformId: n.platformId,
                totalPriceCurrency: n.totalPriceCurrency,
                orderId: n.orderId,
                orderExtendInfo: n.orderExtendInfo,
                accountCode: '',
                orderTagList: n.orderTags,
                saleAccountId: n.saleAccountId,
                isCashOnDelivery: n.isCashOnDelivery,
                remainTime: n.remainTime,
                synDeliverStatus: n.synDeliverStatus,
                synDeliverDate: n.synDeliverDate
              });
              saleAccountIdPos.push(n.saleAccountId);
              orderIdPos.push(n.orderId);
            });
            if (saleAccountIdPos.length > 0) {
              // 匹配订单号
              const getData = async () => {
                const Arr = await v.getAccountCode(pos, saleAccountIdPos);
                let newArr = await v.getProductList(Arr, orderIdPos);
                newArr = await v.getOrderRemark(newArr, orderIdPos); // 匹配订单备注
                v.orderData = newArr;
                v.getImg()
                v.loadingFalse();
                // stockoutOrder.orderGuide 有可能没有执行
                this.$nextTick(() => {
                  this.tableStyleHand();
                });
              }
              getData();
            } else {
              this.tableStyleHand();
            }
            v.$nextTick(() => {
              v.total = Number(response.data.datas.total);
              v.totalPage = Number(response.data.datas.pages);
            });
          } else {
            v.orderData = [];
            v.loadingFalse();
            v.$nextTick(() => {
              v.total = 0;
              v.totalPage = 0;
              v.tableStyleHand();
            });
          }
        }
      }).catch(() => {
        v.loadingFalse();
        v.tableStyleHand();
      });
    },
    // 获取事业部
    getBusinessDeptData () {
      return new Promise((resolve) => {
        if (!this.isGetBusiness) return resolve({ state: 'finally' });
        this.axios.get(api.get_businessDeptList).then(res => {
          if (res && res.data) {
            this.businessDeptDataList = res.data.data || [];
          }
        }).finally(() => {
          resolve({ state: 'finally' });
        })
      })
    },
    exportExcel (type) {
      let pageParams = this.getParams();
      let obj = {
        orderIdList: this.orderIdList,
        platformId: [`${this.inGroup}`],
        timeZone: localStorage.getItem('timezoom') === undefined ? 8 : localStorage.getItem('timezoom'),
        orderBy: this.pageParams.orderBy,
        upDown: this.pageParams.upDown
      };
      if (this.exportModel.title === '导出（所有结果集）') {
        obj = Object.assign(obj, pageParams);
        delete obj.orderIdList;
      }
      this.axios.post(api.export_stockOutOrder, JSON.stringify(obj)).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          this.$Message.success({
            content: '已生成导入/导出任务，任务编号' + '：' + data,
            duration: 10,
            closable: true
          });
        }
      });
    },
    exportOrderHasCondition () { // 导出所有
      if (this.orderData.length < 1) {
        this.$Message.error('没有相关数据');
        return false;
      }
      this.exportOrder('all');
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
        v.exportModel.title = '导出';
        v.exportModel.content = '已取消订单导出';
      }
      v.$nextTick(function () {
        v.exportModel.status = true;
      });
    },
    reset () {
      this.$refs['pageParams'].resetFields();
      this.$nextTick(() => {
        this.pageParams.payTime = this.$common.getRangeTime('', -1, 'month');
      })
    },
    getSelectValue (value) { // table获取所选值
      this.selectedArr = value;
      let v = this;
      let pos = [];
      Promise.resolve(
        value.forEach((n, i) => {
          pos.push(n.orderId);
        })
      ).then(() => {
        v.orderIdList = pos;
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
    showPicModal (data) {
      this.productStatus = true;
      const filenodeViewTargetUrl = this.$store.state.erpConfig.filenodeViewTargetUrl;
      this.productDetails = data.map(item => {
        return {
          ...item,
          pictureUrl: !item.pictureUrl.includes('/static/images/placeholder.jpg') ? `${filenodeViewTargetUrl}/thumb${item.pictureUrl}` : item.pictureUrl
        }
      });
      this.$nextTick(() => {
        this.productModal = true;
      });
    },
    /**
     * 跳转到对应平台
     * @params item 当前操作对象
     * customer 是客服系统
    * */
    goItemUrl (item) {
      if (this.$common.isEmpty(this.platformItemUrl[item.platformId])) return;
      const itemId = item.webstoreItemId || '';
      let amazonAsin = '';
      if (!this.$common.isEmpty(item.orderTransactions) && !this.$common.isEmpty(itemId)) {
        let orderTranInfo = item.orderTransactions.find(op => op.webstoreItemId == itemId);
        orderTranInfo = this.$common.isEmpty(orderTranInfo) ? {} : orderTranInfo.orderTransactionExtend;
        amazonAsin = orderTranInfo.amazonAsin || '';
      }
      const shopeeShopId = item.accountInfo ? item.accountInfo.shopeeShopId || '' : '';
      const openUrl = this.platformItemUrl[item.platformId](itemId, amazonAsin, shopeeShopId);
      window.open(openUrl);
    },
    closeModal () {
      this.productModal = false;
    },
    startCancelDelivery () {
      this.$refs['cancelDelivery'].cancelDelivery();
    },
    changePermission (type) {
      let bol = false;
      if (type == 'batch') {
        bol = this.getPermission(`${this.inGroup}FailedOrder_exportOrder_batch`);
      } else if (type == 'all') {
        bol = this.getPermission(`${this.inGroup}FailedOrder_exportOrder_all`);
      }
      return bol;
    },
    getImg () {
      let busineseIdList = []
      this.orderData.forEach(itema => {
        itema.productList.forEach(itemb => {
          if (this.$common.isEmpty(itemb.orderTransactions)) {
            itemb.orderTransactions = [];
          }
          if (itemb.businessId && !busineseIdList.includes(itemb.businessId)) busineseIdList.push(itemb.businessId);
        })
      });
      this.axios.post(api.query_imageByProductGoodsIds, busineseIdList).then(res => {
        this.orderData.forEach(itema => {
          itema.productList.forEach(itemb => {
            res.data.datas.forEach(itemc => {
              if (itemc.businessId == itemb.businessId) {
                itemb.pictureUrl = itemc.path;
              }
            })
          })
        })
      })
    },
    // 搜索栏是否展开
    tableStyleHand () {
      setTimeout(() => {
        this.$refs.filterRef && this.$refs.filterRef.tableHeightHand('.stockout-order-table', false, 'adjust');
      }, 1000)
    }
  },
  mounted () {
    let v = this;
    setTimeout(v.getCountrys(), 2000); // 获取国家区域列表
    // console.log(v.inGroup)
  }
};
</script>
<style lang="less">
.stockout-order-modal{
  &.driver-fix-stacking{
    z-index: 1000000!important;
  }
}
.body-driver-fix-calss{
  div#driver-popover-item {
    .driver-clearfix{
      &.driver-popover-footer{
        .driver-close-btn{
          display: none!important;
        }
        .driver-prev-btn{
          display: none!important;;
        }
      }
    }
  }
}
</style>
<style lang="less" scoped>
.orderTable{
  :deep(.ivu-table-tbody) {
    .ivu-table-cell{
      .ivu-tooltip, .ivu-tooltip-rel {
        width: 100%;
      }
      .lapa-row-td-tooltip{
        display: flex;
        max-width: 100%;
        margin: 5px 0;
        text-align: left;
        overflow: hidden;
        // text-overflow: ellipsis;
        // white-space: nowrap;
        font-size: 12px;
        line-height: 1.6em;
        max-height: 4.8em;
        cursor: pointer;
        color: #f20;
        justify-content: center;
      }
    }
  }
}
</style>
