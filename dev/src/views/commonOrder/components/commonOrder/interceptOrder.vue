<template>
  <div>
    <div class="interceptOrderFilter">
      <div class="card-container">
        <div class="card-content">
          <div class="platformParamsSelect">
            <Form ref="pageParams" :model="pageParams" :label-width="labelWidth">
              <dyt-filter>
                <Form-item label="店铺" prop="saleAccountIds" v-if="interceptConfig.includes('saleAccountIds')">
                  <dytStoreSelect
                    v-model="pageParams.saleAccountIds"
                    :option-data="shopList"
                    :replace-option-key="{ value: 'saleAccountId', label: 'accountCode' }"
                    placeholder="请选择店铺，可输入搜索"
                    input-placeholder="请输入店铺，多个店铺可用逗号或换行隔开"
                  />
                </Form-item>
                <Form-item label="标签" prop="tagIdList" v-if="interceptConfig.includes('tagIdList')">
                  <dyt-select v-model="pageParams.tagIdList" @on-change="tagChange" :max-tag-count="1" multiple
                    placeholder="请选择或搜索标签">
                    <Option v-for="item in tagsList" :key="item.tagId" :value="item.tagId" :v="item.tagId">{{
                        item.tagName
                    }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="EPC订单" prop="wishIsCombinedOrder" v-if="interceptConfig.includes('wishIsCombinedOrder')">
                  <dyt-select v-model="pageParams.wishIsCombinedOrder" placeholder="EPC订单">
                    <Option v-for="item in orderList" :key="item.id" :value="item.id">{{ item.title }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="A+物流计划订单" prop="wishIsAdvancedLogistics" v-if="interceptConfig.includes('wishIsAdvancedLogistics')">
                  <dyt-select v-model="pageParams.wishIsAdvancedLogistics" placeholder="物流计划订单">
                    <Option v-for="item in orderList" :key="item.id" :value="item.id">{{ item.title }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="优质物流商订单" prop="wishIsPremiumcarrierUpgrade" v-if="interceptConfig.includes('wishIsPremiumcarrierUpgrade')">
                  <dyt-select v-model="pageParams.wishIsPremiumcarrierUpgrade" placeholder="优质物流商订单">
                    <Option v-for="item in orderList" :key="item.id" :value="item.id">{{ item.title }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="WISH EXPRESS订单" prop="wishIsWishExpress" v-if="interceptConfig.includes('wishIsWishExpress')">
                  <dyt-select v-model="pageParams.wishIsWishExpress" placeholder="WISH EXPRESS订单">
                    <Option v-for="item in orderList" :key="item.id" :value="item.id">{{ item.title }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="wish邮取消需重发" prop="wishIsReReleased" v-if="interceptConfig.includes('wishIsReReleased')">
                  <dyt-select v-model="pageParams.wishIsReReleased" placeholder="wish邮取消需重发">
                    <Option v-for="item in orderList" :key="item.id" :value="item.id">{{ item.title }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="国家/地区" prop="buyerCountryCodeList" v-if="interceptConfig.includes('buyerCountryCodeList')">
                  <dyt-select v-model="pageParams.buyerCountryCodeList" @on-change="countryChange" :max-tag-count="1"
                    multiple placeholder="请选择或输入所在地">
                    <Option v-for="(item, index) in formValidate.country" :key="index" :value="item.twoCode"
                      :v="item.cnName">{{ item.enName }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="付款时间" prop="payTime" v-if="interceptConfig.includes('payTime')">
                  <Date-picker
                    transfer
                    type="datetimerange"
                    style="width:100%"
                    :clearable="clearAble"
                    :options="dateOptions"
                    format="yyyy-MM-dd HH:mm:ss"
                    placement="bottom-end"
                    placeholder="选择日期"
                    v-model="pageParams.payTime"
                  />
                </Form-item>
                <Form-item label="订单号" prop="orderNo" v-if="interceptConfig.includes('orderNo')">
                  <dyt-input-tag :limit="1" :string="true" placeholder="请输入订单号,多个订单号用逗号或回车分隔" type="textarea"
                    v-model.trim="pageParams.orderNo"></dyt-input-tag>
                </Form-item>
                <Form-item label="买家姓名" prop="buyerName" v-if="interceptConfig.includes('buyerName')">
                  <dyt-input placeholder="请输入买家姓名" v-model.trim="pageParams.buyerName"></dyt-input>
                </Form-item>
                <Form-item label="买家ID" prop="buyerAccountId" v-if="interceptConfig.includes('buyerAccountId')">
                  <dyt-input placeholder="请输入买家ID" v-model.trim="pageParams.buyerAccountId"></dyt-input>
                </Form-item>
                <Form-item label="平台产品编码" prop="webstoreItemId" v-if="interceptConfig.includes('webstoreItemId')">
                  <dyt-input placeholder="请输入平台产品编码" v-model.trim="pageParams.webstoreItemId"></dyt-input>
                </Form-item>
                <Form-item label="SKU" prop="webstoreSku" v-if="interceptConfig.includes('webstoreSku')">
                  <dyt-input-tag :limit="1" :string="true" placeholder="请输入SKU,多个用逗号或回车分隔" type="textarea"
                    v-model.trim="pageParams.webstoreSku"></dyt-input-tag>
                </Form-item>
                <Form-item label="商品事业部" prop="businessDeptIdList" v-if="isGetBusiness && interceptConfig.includes('businessDeptIdList')">
                  <dyt-select
                    v-model="pageParams.businessDeptIdList"
                    :max-tag-count="1"
                    multiple
                    placeholder="请选择商品事业部"
                  >
                    <Option v-for="(item, index) in businessDeptDataList" :value='item.id' :key="`business-${index}`">{{item.name}}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="是否有退款" prop="isRefunded" v-if="interceptConfig.includes('isRefunded')">
                  <!-- <local-buttons :data="tabsData1" :value.sync="pageParams.isRefunded"></local-buttons> -->
                  <dyt-select v-model="pageParams.isRefunded" placeholder="请选择是否有退款">
                    <Option v-for="item in orderList" :key="item.id" :value="item.id">{{ item.title }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="是否部分退款" prop="isPartRefunded" v-if="interceptConfig.includes('isPartRefunded')">
                  <dyt-select v-model="pageParams.isPartRefunded" placeholder="请选择是否部分退款">
                    <Option v-for="item in orderList" :key="item.id" :value="item.id">{{ item.title }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="是否货到付款订单" prop="isCashOnDelivery" v-show="interceptConfig.includes('isCashOnDelivery')">
                  <dyt-select v-model="pageParams.isCashOnDelivery" placeholder="请选择是否货到付款订单">
                    <Option v-for="item in orderList" :key="item.id" :value="item.id">{{ item.title }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="匹配退件" prop="isMatchingReturn" v-show="interceptConfig.includes('isMatchingReturn')">
                  <dyt-select v-model="pageParams.isMatchingReturn" placeholder="请选择是否匹配退件">
                    <Option :value="1">已匹配</Option>
                    <Option :value="0">未匹配</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="买家类型" prop="amazonIsBusinessOrder" v-show="interceptConfig.includes('amazonIsBusinessOrder')">
                  <dyt-select v-model="pageParams.amazonIsBusinessOrder" clearable>
                    <Option v-for="(item, index) in buyerTypeList" :key="index" :value="item.value">{{ item.type }}
                    </Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="Prime订单" prop="amazonIsPrime" v-show="interceptConfig.includes('amazonIsPrime')">
                  <dyt-select v-model="pageParams.amazonIsPrime" clearable>
                    <Option v-for="(item, index) in amazonPrimeList" :key="index" :value="item.value">{{ item.type }}
                    </Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="Item ID" prop="asin" v-show="interceptConfig.includes('asin')">
                  <dyt-input v-model='pageParams.asin' />
                </Form-item>
                <Form-item label="搜索字符" prop="searchValue" v-if="interceptConfig.includes('searchValue')">
                  <dyt-input class="filterSearch" placeholder="可输入订单号、买家ID、买家姓名、SKU、平台产品编码"
                    v-model.trim="pageParams.searchValue" @on-enter="search"></dyt-input>
                </Form-item>
                <div slot="operation">
                  <Button type="primary" @click="search" v-if="isAdmin || controlList.orderInfo_queryForSuspend"
                    :disabled="SearchDisabled" icon="md-search">查询 </Button>
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
        <Button type="primary" @click="startCancelDelivery" class="iconbuttons"
          :disabled="!getPermission('orderInfo_cancelOrder_batch')">
          <span class="icon iconfont">&#xe67e;</span>
          {{ `${isCancelPlat.includes(platform) ? '取消' : '作废'}订单` }}
        </Button>
        <Buttons type="primary" trigger="click" @on-click="setReleaseHasCondition" class="ml10"
          :disabled="!getPermission('orderInfo_suspendPass_batch')">
          <Button type="primary" @click="setReleaseConfirm" :disabled="!getPermission('orderInfo_suspendPass_batch')">
            <Icon type="leaf"></Icon>
            批量放行
          </Button>
          <Buttons-menu slot="list">
            <Buttons-item name="1" :disabled="!getPermission('orderInfo_suspendPass_all')">放行（所有结果集）
            </Buttons-item>
          </Buttons-menu>
        </Buttons>
        <Dropdown class="ml10" v-if="getPermission('orderTag_insert_batch') || getPermission('orderTag_clear')">
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
        <Dropdown class="ml10" v-if="getPermission('orderRemark_insert')">
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
        <Dropdown class="ml10" v-if="getPermission('orderShippingInfo_updateReceiverAddress')">
          <Button type="primary">
            批量修改地址
            <Icon type="ios-arrow-down"></Icon>
          </Button>
          <DropdownMenu slot="list">
            <DropdownItem @click.native="batchUpdateAdders('check')">
              批量修改选中地址
            </DropdownItem>
            <DropdownItem @click.native="batchUpdateAdders('all')" :disabled="SearchDisabled || orderData.length <= 0">
              批量修改所有地址
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <Button
          class="ml10"
          type="primary"
          @click.native="batchModifyWarehouse"
          v-if="getPermission('orderShippingInfo_batchUpdateWarehouse')"
        >批量修改仓库</Button>
        <Dropdown class="ml10" v-if="permission.exportOrders">
          <Button type="primary">
            批量导出
            <Icon type="ios-arrow-down"></Icon>
          </Button>
          <DropdownMenu slot="list">
            <DropdownItem @click.native="batchExportOrder('check')">
              导出选中
            </DropdownItem>
            <DropdownItem @click.native="batchExportOrder('all')">
              导出所有结果集
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
      <div class="dataSort grayBg" style="display: inline-block;background: none;border: none;padding: 0;margin: 0;">
        <span>排序：</span>
        <Button-group>
          <template v-for="(item, index) in buttonGroupModel">
            <Button v-if="item.selected" :disabled="SearchDisabled" type="primary"
              @click="modifyTheSort(index, item.status)" :key="index">
              {{ item.title }}
              <Icon type="md-arrow-round-up" v-if="item.status && item.selected"></Icon>
              <Icon type="md-arrow-round-down" v-if="!item.status && item.selected"></Icon>
            </Button>
            <Button v-if="!item.selected" :disabled="SearchDisabled" @click="modifyTheSort(index, item.status)"
              :key="index">
              {{ item.title }}
              <Icon type="md-arrow-round-up" v-if="item.status && item.selected"></Icon>
              <Icon type="md-arrow-round-down" v-if="!item.status && item.selected"></Icon>
            </Button>
          </template>
        </Button-group>
      </div>
    </div>
    <div class="orderTable normalTop" v-if="getPermission('orderInfo_queryForSuspend')">
      <keep-alive>
        <Table highlight-row border :height="tableHeight" :loading="tableLoading" :columns="orderColumn"
          :data="orderData" @on-selection-change="getSelectValue"></Table>
      </keep-alive>
      <div class="table-page flexBox">
        <keep-alive>
          <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator
            :current="curPage" show-sizer @on-page-size-change="changePageSize" placement="top"
            :page-size-opts="pageArray"></Page>
        </keep-alive>
      </div>
    </div>
    <keep-alive>
      <Modal v-model="productModal" :mask-closable="false" v-if="productStatus" :width="600">
        <div class="orderDetailsProductItem">
          <Row v-for="(item, index) in productDetails" :key="index" class="normalTop">
            <Col :span="2">
            <div class="orderDetailsProductItemPic">
              <img :src="item.pictureUrl" :alt="item.title">
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
              <span class="productHaveATitle" v-if="inGroup === 'ebay'">物品所在地: <em>{{ item.location }}</em></span>
              <span class="productLogsticService">物流服务：<em>{{ item.buyerShippingMethod }}</em></span>
            </div>
            <div class="odpidProductDetails">
              {{ item.title }}
            </div>
            <div class="odpidProductParams" v-if="item.variations !== null">
              <span class="productHaveATitle"
                v-if="item.variations.indexOf('color') >= 0 && item.variations.indexOf(';') > 0">Color:<em>{{
                    item.variations.split(': ')[1].split(';')[0]
                }} </em></span>
              <span class="productHaveATitle"
                v-if="item.variations.indexOf('color') >= 0 && item.variations.indexOf(';') < 0">Color:<em>{{
                    item.variations.split(': ')[1]
                }} </em></span>
              <span class="productHaveATitle" v-if="item.variations.toLowerCase().indexOf('pack of') >= 0">Pack
                of:<em>{{
                    item.variations.split(';')[1].split(': ')[1]
                }}</em></span>
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
    <keep-alive>
      <sliderModal v-model="orderDetails" :spinShow="spinShow" :styles="{}" class="slider-model"
        v-if="orderDetailsBegin">
        <orderDetails :orderDetailsId="orderDetailsId" @reloadTag="reloadTag" :timestamp="timestamp" :orderNo="orderNo"
          @spinLoading="spinLoading" @resetSpinShow="resetSpinShow" @updateList="getList" :orderTagList="orderTagList"
          :webstoreItemSite="webstoreItemSite"
          :moal-visible.sync="orderDetails"
        />
      </sliderModal>
    </keep-alive>
    <cancelDelivery ref="cancelDelivery" :orderIdList.sync="orderIdList"></cancelDelivery>
    <!-- 退件包裹 -->
    <matchReturnPackages :dialogVisible.sync="returnGoodVisible" :data="returnGoodData" @search="search">
    </matchReturnPackages>
    <!-- 批量备注 -->
    <batchRemarkModal :module-visible.sync="moduleRemarkVisible" :module-data="moduleRemarkData" @updateList="getList" />
    <!-- 批量修改地址 -->
    <batchUpdateAddresModal
      :module-visible.sync="moduleAddreskVisible"
      :module-data="moduleAddreskData"
      :country="formValidate.country"
      @updateList="getList"
    />
    <!-- 批量修改仓库 -->
    <batchModifyModal
      ref="batchModifyModal"
      :order-id-lists="orderIdList"
      :orderDataProp="orderData"
      @getList="getList"
    />
    <!-- 导出订单弹窗 -->
    <Modal
      v-model="exportModel.status"
      :mask-closable="false"
      width="500"
      @on-ok="exportExcel"
    >
      <div class="ivu-modal-confirm">
        <div class="ivu-modal-confirm-head">
          <div class="ivu-modal-confirm-head-title">{{ exportModel.title }}</div>
        </div>
        <div class="ivu-modal-confirm-body ivu-modal-confirm-body-render">
          <div class="normalTop">
            <p>
              {{ exportModel.content }} </p>
            <p class="mt10">
              <span class="f14">多品订单SKU导出方式选择：</span>
              <RadioGroup v-model="rowCellSetting">
                <Radio v-for="(item, index) in rowCellSettingList" :key="index" :label="item.value">{{ item.label }}
                </Radio>
              </RadioGroup>
            </p>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>
<script>
import api from '@/api/api';
import orderDetails from "@/views/commonOrder/components/commonOrder/orderDetails";
import Mixin from '@/components/mixin/common_mixin';
import orderSys from '@/components/mixin/orderSys_mixin';
import cancelDelivery from '@/components/common/order/cancelOrder';
import matchReturnPackages from './matchReturnPackages';
import batchRemarkModal from "@/views/commonOrder/components/commonOrder/batchUpdateRemark";
import batchUpdateAddresModal from "@/views/commonOrder/components/commonOrder/batchUpdateAddres";
import batchModifyModal from '@/components/common/batchModifyModal';
import { platformReceptionUrl } from '@/utils/enum';
import interceptOrderConfig from '@/views/commonOrder/script/interceptOrderConfig';

export default {
  mixins: [Mixin, orderSys],
  components: {
    orderDetails,
    cancelDelivery,
    matchReturnPackages,
    batchRemarkModal,
    batchUpdateAddresModal,
    batchModifyModal
  },
  data () {
    return {
      moduleRemarkVisible: false,
      moduleAddreskVisible: false,
      platformItemUrl: platformReceptionUrl,
      interceptConfig: interceptOrderConfig[this.inGroup] || interceptOrderConfig.default,
      moduleRemarkData: {},
      moduleAddreskData: {},
      isCancelPlat: ['ebay', 'ozon', 'otto', 'wish'],
      platform: this.inGroup,
      selectedArr: [],
      exportModel: {
        title: '',
        content: '',
        status: false
      },
      businessDeptDataList: [],
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
      orderDetails: false,
      orderDetailsBegin: false,
      orderDetailsId: null,
      orderNo: null,
      timestamp: null,
      orderTagList: null,
      webstoreItemSite: null,
      buyerTypeList: [ // 买家类型
        {
          type: 'B2B',
          value: 1
        }, {
          type: 'B2C',
          value: 0
        }
      ],
      amazonPrimeList: [ // prime订单
        {
          type: '是',
          value: 1
        }, {
          type: '否',
          value: 0
        }
      ],
      orderList: [
        {
          id: -1,
          title: '全部'
        }, {
          id: 1,
          title: '是'
        }, {
          id: 0,
          title: '否'
        }
      ],
      pageParams: {
        pageNum: 1,
        pageSize: 50,
        tagIdList: [],
        isRefunded: -1,
        isPartRefunded: -1,
        isCashOnDelivery: -1,
        platformId: [this.inGroup],
        businessDeptIdList: [],
        buyerCountryCodeList: [],
        searchValue: null,
        payStartTime: null,
        payEndTime: null,
        saleAccountIds: [],
        buyerAccountId: null,
        buyerName: null,
        webstoreItemId: null,
        webstoreSku: null,
        orderBy: 'payTime',
        upDown: 'down',
        payTime: [],
        isMatchingReturn: null,
        orderNo: null,
        asin: null,
        amazonIsBusinessOrder: null,
        amazonIsPrime: null,
        wishIsAdvancedLogistics: -1,
        wishIsPremiumcarrierUpgrade: -1,
        wishIsWishExpress: -1,
        wishIsReReleased: -1,
        wishIsCombinedOrder: -1,
      },
      formValidate: {
        country: []
      },
      shopModal: [],
      payTimeArr: [],
      tagsModal: [],
      markTagsModal: [],
      pageParamsStatus: false, // 每次更新完pageParms都要设置成true触发刷新
      totalPage: 0,
      total: 0,
      curPage: 1,
      setTagListStatus: false,
      clearAble: true,
      resetStatus: true,
      tableColumn: {
        selection: {
          type: 'selection',
          fixed: 'left',
          width: 60,
          align: 'center'
        },
        salesRecordNumber: {
          title: '订单号',
          fixed: 'left',
          align: 'center',
          key: 'salesRecordNumber',
          minWidth: 160,
          render: (h, { row }) => {
            const text = `${row.accountCode || ''}-${row.salesRecordNumber || ''}`;
            let item = [h('span', {
              style: {
                color: this.getPermission('orderInfo_detail') ? '#0054A6' : '#515a6e',
                cursor: 'pointer'
              },
              on: {
                click: () => {
                  if (this.getPermission('orderInfo_detail')) {
                    this.show(row.orderId);
                    this.orderNo = row.accountCode + '-' + row.salesRecordNumber;
                    this.orderTagList = row.orderTagList;
                    this.webstoreItemSite = row.webstoreItemSite;
                  }
                }
              }
            }, text)];
            if (['ebay'].includes(this.inGroup) && !this.$common.isEmpty(row.emailGroups)) {
              item.push(h('Icon', {
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
            return item;
          }
        },
        orderStatus: {
          title: '订单状态',
          key: 'orderStatus',
          width: 120,
          align: 'center',
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
        wishIsAdvancedLogistics: {
          title: 'A+物流计划订单',
          key: 'wishIsAdvancedLogistics',
          align: 'center',
          width: 100,
          render: (h, { row }) => {
            const txt = !this.$common.isEmpty(row.orderExtendInfo) && row.orderExtendInfo.wishIsAdvancedLogistics === 1 ? '是' : '否';
            return h('div', {}, txt);
          }
        },
        wishIsReReleased: {
          title: 'wish邮取消需重发',
          key: 'wishIsReReleased',
          align: 'center',
          width: 100,
          render: (h, { row }) => {
            const txt = !this.$common.isEmpty(row.orderExtendInfo) && row.orderExtendInfo.wishIsReReleased === 1 ? '是' : '否';
            return h('div', {}, txt);
          }
        },
        wishIsPremiumcarrierUpgrade: {
          title: '优质物流商订单',
          key: 'wishIsPremiumcarrierUpgrade',
          align: 'center',
          width: 100,
          render: (h, { row }) => {
            const txt = !this.$common.isEmpty(row.orderExtendInfo) && row.orderExtendInfo.wishIsPremiumcarrierUpgrade === 1 ? '是' : '否';
            return h('div', {}, txt);
          }
        },
        wishIsWishExpress: {
          title: 'WISH EXPRESS订单',
          key: 'wishIsWishExpress',
          align: 'center',
          width: 100,
          render: (h, { row }) => {
            const txt = !this.$common.isEmpty(row.orderExtendInfo) && row.orderExtendInfo.wishIsWishExpress === 1 ? '是' : '否';
            return h('div', {}, txt);
          }
        },
        packageCode: {
          title: '站点',
          key: 'packageCode',
          width: 66,
          align: 'center',
          render: (h, params) => {
            return h('div', {
              attrs: {
                class: 'nationalFlag nationalFlag' + params.row.webstoreItemSite,
                title: params.row.webstoreItemSite
              }
            });
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
        orderNotes: {
          title: '截留说明',
          align: 'center',
          key: 'orderNotes',
          resizable: true,
          width: 140,
          render: (h, params) => {
            return h('div', [
              h('Icon', {
                props: {
                  type: 'chatbox-working',
                  color: '#ff3737'
                }
              }), h('span', {
                style: {
                  marginLeft: '5px'
                }
              }, params.row.suspendedReason)
            ]);
          }
        },
        productList: {
          title: '产品',
          key: 'productList',
          align: 'center',
          resizable: true,
          width: 140,
          render: (h, params) => {
            let data = params.row.productList;
            let pos = [];
            (data.slice(0, 3)).forEach(n => {
              let item = this.tableImg(h, params, '', n.pictureUrl, () => {
                this.showPicModal(data);
              });
              pos.push(item);
            });
            if (data.length > 3) {
              pos.push(h('span', {
                style: {
                  marginLeft: '5px'
                }
              }, '...'));
            }
            return h('div', pos);
          }
        },
        remainTime: {
          title: '发货剩余时间',
          key: 'remainTime',
          align: 'center',
          width: 110,
          render: (h, params) => {
            if (params.row.orderExtendInfo) {
              return h('div', {
                style: {
                  color: '#f00',
                  width: '100px'
                }
              }, this.getRemainTime(params.row.orderExtendInfo.aliexpressTimeoutLeftTime));
            }
          }
        },
        aliexpressBuyerName: {
          title: '买家ID/姓名/买家等级',
          key: 'buyerName',
          width: 160,
          align: 'center',
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
        buyerName: {
          title: '买家ID/姓名',
          key: 'buyerName',
          align: 'center',
          width: 130,
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
          width: 90
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
          width: 100
        },
        tags: {
          title: '标签',
          key: 'tags',
          align: 'center',
          width: 130,
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
                  }), h('span', n.tagName)
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
          width: 140
        },
        isRefunded: {
          title: '是否有退款',
          key: 'isRefunded',
          align: 'center',
          width: 100,
          render: (h, params) => {
            let isRefunded = params.row.isRefunded === 1 ? '是' : '否';
            return h('span', isRefunded);
          }
        },
        operate: {
          title: '操作',
          key: 'operate',
          fixed: 'right',
          align: 'center',
          width: 220,
          render: (h, params) => {
            let operate = [];
            if (this.getPermission('orderInfo_cancelOrder_single')) {
              operate.push(h('Button', {
                props: {
                  size: 'small'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    this.$refs['cancelDelivery'].cancelDelivery('single', params.row);
                  }
                }
              }, `${this.isCancelPlat.includes(this.platform) ? '取消' : '作废'}订单`));
            }
            if (this.getPermission('orderInfo_suspendPass_single')) {
              operate.push(h('Button', {
                props: {
                  size: 'small'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    this.setThisRelease(params.row.orderId, 0);
                  }
                }
              }, '放行'));
            }
            if (this.getPermission('orderInfo_cancelOrder_single')) {
              operate.push(h('Button', {
                props: {
                  size: 'small'
                },
                style: {
                  marginRight: '5px'
                },
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
            return h('div', {
              style: {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }
            }, operate);
          }
        },
        salesTime: {
          title: '下单时间',
          key: 'salesTime',
          align: 'center',
          width: 100
        },
        webstoreUpdatedDate: {
          title: '上次更新时间',
          key: 'webstoreUpdatedDate',
          align: 'center',
          width: 110
        },
      },
      orderData: [],
      orderIdList: [],
      productStatus: false, // 点击产品列表详情状态控制
      productModal: false,
      productDetails: '', // modal产品数据

      returnGoodVisible: false, // 退件包裹弹框
      returnGoodData: {} // 退件包裹数据
    };
  },
  watch: {
    pageParamsStatus (n) {
      if (n) {
        this.getList();
        this.pageParamsStatus = false;
      }
    }
  },
  created () {
    this.returnGoodColumns();
    this.getBusinessDeptData(); // 获取事业部
  },
  computed: {
    orderColumn () {
      let platformColumn = [];
      (interceptOrderConfig[`${this.inGroup}Column`] || interceptOrderConfig.defaultColumn).forEach(key => {
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
    },
    // 权限
    permission () {
      return {
        exportOrders: this.getPermission('interceptOrder_exportOrders_batch')
      }
    },
    isOtto () {
      return ['otto'].includes(this.inGroup);
    },
  },
  methods: {
    // 批量备注
    batchUpdateRemark (str) {
      let updateFilter = this.getParams(this.pageParams);
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
        url: api.interceptBatchInsertRemark
      };
      this.$nextTick(() => {
        this.moduleRemarkVisible = true;
      })
    },
    // 获取事业部
    getBusinessDeptData () {
      if (!this.isGetBusiness) return;
      this.axios.get(api.get_businessDeptList).then(res => {
        if (res && res.data) {
          this.businessDeptDataList = res.data.data || [];
        }
      })
    },
    // 打开批量修改地址弹窗
    batchUpdateAdders (str) {
      // let updateFilter = this.getParams(this.pageParams);
      let updateFilter = { orderIds: [] };
      if (str === "all") {
        if (this.SearchDisabled) {
          return this.$Message.error("正在请求数据，请稍后...");
        }
        if (this.orderData.length == 0) {
          return this.$Message.error("请选择订单");
        }
        updateFilter.orderIds = this.orderData.map(m => m.orderId);
      } else {
        if (this.selectedArr.length == 0) {
          return this.$Message.error("请选择订单");
        }
        updateFilter.orderIds = this.selectedArr.map(m => m.orderId);
      }
      this.moduleAddreskData = {
        filterParams: updateFilter,
        url: api.batchUpdateReceiverAddress
      };
      this.$nextTick(() => {
        this.moduleAddreskVisible = true;
      })
    },
    // 导出弹窗
    batchExportOrder (str) {
      if (str === "all") {
        this.exportModel.title = '导出所有结果集';
        this.exportModel.content = '导出所有结果集，系统将符合您当前查询选择的所有订单导出到excel，系统限制一次性只能导出不超过100000单。';
      } else {
        if (this.selectedArr.length == 0) {
          return this.$Message.error("请选择订单");
        }
        this.exportModel.title = '导出选中';
        this.exportModel.content = '系统将您勾选的订单导出到excel';
      }
      this.$nextTick(() => {
        this.exportModel.status = true;
      });
    },
    // 导出
    exportExcel () {
      let obj = {
        orderIdList: this.orderIdList,
        platformId: [this.inGroup],
        timeZone: localStorage.getItem('timezoom') === undefined ? 8 : localStorage.getItem('timezoom'),
        orderBy: this.pageParams.orderBy,
        upDown: this.pageParams.upDown,
        rowCellSetting: this.rowCellSetting
      };
      if (this.exportModel.title === '导出所有结果集') {
        obj = Object.assign(obj, this.getParams(this.pageParams));
        delete obj.orderIdList;
      }
      this.axios.post(api.exportSuspendOrders, obj).then((response) => {
        if (response.data.code === 0) {
          // this.orderIdList = [];
          // this.pageParamsStatus = true;
          const data = response.data.datas;
          this.$Message.success({
            content: '已生成导入/导出任务，任务编号' + '：' + data,
            duration: 10,
            closable: true
          });
        } else {
          this.$Message.error('操作失败，请重新尝试');
        }
      });
    },
    // 加载
    startLoading () {
      if (!this.getPermission('orderInfo_queryForSuspend')) {
        this.$Message.error('您暂无权访问数据');
        return;
      }
      this.$Loading.start();
      this.returnGoodColumns();
      // this.getList()
      Promise.resolve().then(() => {
        this.$Loading.finish();
        this.getOrderListTag();// 获取标签列表
        this.getShopList();
      });
    },
    getParams (par, type) {
      let keys = [
        'isRefunded', 'isPartRefunded', 'isCashOnDelivery', 'wishIsAdvancedLogistics',
        'wishIsPremiumcarrierUpgrade', 'wishIsWishExpress', 'wishIsReReleased', 'wishIsCombinedOrder'
      ];
      let newPar = this.$common.copy(par);
      keys.forEach(key => {
        if ([-1, '-1'].includes(par[key])) {
          if (type) {
            delete newPar[key];
          } else {
            newPar[key] = null;
          }
        }
      });
      Object.keys(newPar).forEach(key => {
        if (!['pageNum', 'pageSize', 'orderBy', 'upDown', 'platformId'].includes(key) && !this.interceptConfig.includes(key)) {
          delete newPar[key];
        }
      });
      newPar.payStartTime = null;
      newPar.payEndTime = null;
      if (!this.$common.isEmpty(newPar.payTime) && !this.$common.isEmpty(newPar.payTime[0])) {
        newPar.payStartTime = this.getUniversalTime(new Date(newPar.payTime[0]).getTime(), 'fulltime');
      }
      if (!this.$common.isEmpty(newPar.payTime) && !this.$common.isEmpty(newPar.payTime[1])) {
        newPar.payEndTime = this.getUniversalTime(new Date(newPar.payTime[1]).getTime(), 'fulltime');
      }
      if (!this.isGetBusiness) {
        delete newPar.businessDeptIdList;
      }
      if (!this.isOtto) {
        delete newPar.isMatchingReturn;
      }
      delete newPar.payTime;
      return newPar
    },
    getList () {
      this.orderData = [];
      this.loadingTrue();
      this.selectedArr = [];
      this.axios.post(api.get_interceptOrderList, this.getParams(this.pageParams)).then(response => {
        if (response && response.data && response.data.code === 0) {
          let pos = [];
          let saleAccountIdPos = [];
          let orderIdPos = [];
          let data = response.data.datas;
          if (data.list !== null) {
            data.list.forEach((n, i) => {
              pos.push({
                ...n,
                payTime: this.getDataToLocalTime(n.payTime, 'fulltime'),
                accountCode: '',
                orderTagList: n.orderTags,
                amazonIsBusinessOrder: n.orderExtendInfo ? n.orderExtendInfo.amazonIsBusinessOrder : '',
                amazonFulfillmentChannel: n.orderExtendInfo ? n.orderExtendInfo.amazonFulfillmentChannel : '',
                amazonIsPrime: n.orderExtendInfo ? n.orderExtendInfo.amazonIsPrime : '',
                productList: []
              });
              !saleAccountIdPos.includes(n.saleAccountId) && saleAccountIdPos.push(n.saleAccountId);
              !orderIdPos.includes(n.orderId) && orderIdPos.push(n.orderId);
            });
            if (saleAccountIdPos.length > 0) {
              // 匹配订单号
              this.getAccountCode(pos, saleAccountIdPos).then(Arr => {
                // 匹配商品图片
                this.getProductList(Arr, orderIdPos).then(newArr => {
                  // 匹配订单备注
                  this.getOrderRemark(newArr, orderIdPos).then(list => {
                    // 获取图片
                    this.getImg(list).then(tableArr => {
                      this.orderData = tableArr;
                      this.loadingFalse();
                    })
                  })
                })
              });
            } else {
              this.loadingFalse();
            }
            this.$nextTick(() => {
              this.total = Number(data.total);
              this.totalPage = Number(data.pages);
            });
          } else {
            this.orderData = [];
            this.loadingFalse();
            this.$nextTick(() => {
              this.total = 0;
              this.totalPage = 0;
            });
          }
        } else {
          this.loadingFalse();
        }
      }).catch(() => {
        this.loadingFalse();
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
    // table获取所选值
    getSelectValue (value) {
      this.selectedArr = value || [];
      this.orderIdList = (value || []).map(m => m.orderId);
    },
    tagChange (value) {
      if (value.indexOf('null') >= 0) {
        this.pageParams.tagIdList = [];
      } else {
        this.pageParams.tagIdList = value;
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
      this.$refs['pageParams'].resetFields();
    },
    setThisRelease (orderId, flag, type) {
      let obj = {};
      if (type === 'more') {
        obj.orderIdList = orderId;
      } else if (type === 'all') {
        obj = this.getParams(this.pageParams, true);
      } else {
        obj.platformId = ['ebay'];
        obj.orderIdList = [orderId];
      }
      if (flag !== 1) {
        obj.flag = 0;
      } else {
        obj.flag = 1;
      }
      this.axios.put(api.set_orderRelease, JSON.stringify(obj)).then(response => {
        if (response.data.code === 0) {
          this.$Message.success('操作成功');
          this.pageParamsStatus = true;
        } else if (response.data.code === 110503) {
          setTimeout(() => {
            this.$Modal.confirm({
              title: '批量放行',
              okText: '整包裹放行',
              content: '订单所在包裹为合并包裹，请选择整包裹放行或取消操作',
              onOk: () => {
                this.setThisRelease(orderId, 1, type);
              }
            });
          }, 200);
        }
      });
    },
    setReleaseConfirm () {
      if (this.orderIdList.length === 0) {
        this.$Message.error('请选择订单');
        return false;
      }
      this.$Modal.confirm({
        title: '批量放行',
        content: '<p>' + '放行后，订单将继续处理流程。' + '</p>',
        onOk: () => {
          this.setThisRelease(this.orderIdList, 0, 'more');
        }
      });
    },
    setReleaseHasCondition (val) {
      if (val === '1') {
        this.$Modal.confirm({
          title: '放行（所有结果集）',
          content: '<p>' + '放行所有结果集，系统将会放行符合您当前查询条件的订单。' + '</p>',
          onOk: () => {
            this.setThisRelease(this.orderIdList, 0, 'all');
          }
        });
      }
    },
    showPicModal (data) {
      this.productStatus = true;
      this.$nextTick(() => {
        this.productModal = true;
        this.productDetails = data;
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
        orderTranInfo = this.$common.isEmpty(orderTranInfo) ? {} : orderTranInfo.orderTransactionExtend || {};
        amazonAsin = orderTranInfo.amazonAsin || '';
      }
      const shopeeShopId = item.accountInfo ? item.accountInfo.shopeeShopId || '' : '';
      const openUrl = this.platformItemUrl[item.platformId](itemId, amazonAsin, shopeeShopId);
      window.open(openUrl);
    },
    closeModal () {
      this.productModal = false;
    },
    // 获取匹配的图片
    getImg (list) {
      return new Promise((resolve) => {
        let busineseIdList = []
        list.forEach(itema => {
          itema.productList.forEach(itemb => {
            if (this.$common.isEmpty(itemb.orderTransactions)) {
              itemb.orderTransactions = [];
            }
            if (itemb.businessId && !busineseIdList.includes(itemb.businessId)) busineseIdList.push(itemb.businessId);
          })
        });
        this.axios.post(api.query_imageByProductGoodsIds, busineseIdList).then(res => {
          if (!res || !res.data || res.data.code != 0) return resolve(list);
          list.forEach(itema => {
            itema.productList.forEach(itemb => {
              (res.data.datas || []).forEach(itemc => {
                if (itemc.businessId == itemb.businessId) itemb.pictureUrl = itemc.path;
              })
            })
          })
          resolve(list);
        }).catch((err) => {
          console.error(err);
          resolve(list);
        })
      })
    },
    // otto平台增加匹配退件列
    returnGoodColumns () {
      let { platform } = this.$route.query || {};
      if (platform !== 'otto') return;
      let columnObj = {
        title: '匹配退件',
        key: 'isRefunded',
        align: 'center',
        width: 140,
        render: (h, params) => {
          return h('span', {
            style: {
              color: '#2d8cf0',
              textDecoration: 'underline',
              wordBreak: 'break-all',
              cursor: 'pointer'
            },
            on: {
              click: () => {
                if (!this.getPermission('orderMatchReturnPackageQuery')) {
                  this.$Message.error('暂无查看包裹信息权限');
                  return;
                }
                this.returnGoodData = params.row || {};
                this.$nextTick(() => {
                  this.returnGoodVisible = true;
                })
              }
            }
          }, params.row.returnTrackingNumber || '');
        }
      }
      this.orderColumn.splice(this.orderColumn.length - 1, 0, columnObj);
    }
  },
  mounted () {
    setTimeout(this.getCountrys(), 2000);// 获取国家区域列表
  }
};
</script>
