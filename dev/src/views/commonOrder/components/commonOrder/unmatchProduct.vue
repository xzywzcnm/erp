<template>
  <div style="position: relative;">
    <Spin v-if="pageLoading" fix style="z-index: 9999;"></Spin>
    <div class="unmatchProduct">
      <div class="card-container">
        <div class="card-content">
          <div class="platformParamsSelect">
            <Form ref="pageParams" :model="pageParams" :label-width="labelWidth">
              <dyt-filter :filter-row="1">
                <Form-item label="店铺" prop="saleAccountIds" v-if="formSearchKey.includes('saleAccountIds')">
                  <dytStoreSelect
                    v-model="pageParams.saleAccountIds"
                    :option-data="shopList"
                    :replace-option-key="{ value: 'saleAccountId', label: 'accountCode' }"
                    placeholder="请选择店铺，可输入搜索"
                    input-placeholder="请输入店铺，多个店铺可用逗号或换行隔开"
                  />
                </Form-item>
                <Form-item label="品牌" prop="brandIdList" v-if="formSearchKey.includes('brandIdList')">
                  <dyt-select v-model="pageParams.brandIdList" :max-tag-count="1" multiple placeholder="请选择品牌">
                    <Option v-for="(item, index) in brandData" :key="`${item.brandId}${index}`" :value="item.brandId" :label="item.name" />
                  </dyt-select>
                </Form-item>
                <Form-item label="付款时间" prop="payTime" v-if="formSearchKey.includes('payTime')">
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
                <Form-item label="订单号" prop="orderNo" v-if="formSearchKey.includes('orderNo')">
                  <dyt-input-tag type="textarea" v-model="pageParams.orderNo" :limit="1" :string="true" placeholder="请输入订单号,多个请用逗号隔开" />
                </Form-item>
                <Form-item label="平台SKU" prop="webstoreItemId" v-if="formSearchKey.includes('webstoreItemId')">
                  <dyt-input placeholder="请输入平台SKU" v-model.trim="pageParams.webstoreItemId"></dyt-input>
                </Form-item>
                <Form-item label="SKU" prop="webstoreSku" v-if="formSearchKey.includes('webstoreSku')">
                  <dyt-input-tag type="textarea" placeholder="请输入SKU, 多个请用逗号隔开" :limit="1" :string="true" v-model="pageParams.webstoreSku" />
                </Form-item>
                <Form-item label="标签" prop="tagIdList" v-if="formSearchKey.includes('tagIdList')">
                  <dyt-select v-model="pageParams.tagIdList" :max-tag-count="1" multiple placeholder="请选择或搜索标签">
                    <Option v-for="(item, index) in tagsList" :key="index" :value="item.tagId" :v="item.tagId">{{ item.tagName }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="国家/地区" prop="buyerCountryCodeList" v-if="formSearchKey.includes('buyerCountryCodeList')">
                  <dyt-select v-model="pageParams.buyerCountryCodeList" @on-change="countryChange" :max-tag-count="1" multiple placeholder="请选择或输入所在地">
                    <Option v-for="(item,index) in formValidate.country" :key="index" :value="item.twoCode" :v="item.cnName">{{ item.enName }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="买家姓名" prop="buyerName" v-if="formSearchKey.includes('buyerName')">
                  <dyt-input placeholder="请输入买家姓名" v-model.trim="pageParams.buyerName"></dyt-input>
                </Form-item>
                <Form-item label="买家ID" prop="buyerAccountId" v-if="formSearchKey.includes('buyerAccountId')">
                  <dyt-input placeholder="请输入买家ID" v-model.trim="pageParams.buyerAccountId"></dyt-input>
                </Form-item>
                <Form-item label="买家类型" prop="amazonIsBusinessOrder" v-if="formSearchKey.includes('amazonIsBusinessOrder')">
                  <dyt-select v-model="pageParams.amazonIsBusinessOrder" clearable>
                    <Option v-for="(item,index) in buyerTypeList" :key="index" :value="item.value">{{ item.type }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="EPC订单" prop="wishIsCombinedOrder" v-if="formSearchKey.includes('wishIsCombinedOrder')">
                  <dyt-select v-model="pageParams.wishIsCombinedOrder" placeholder="EPC订单">
                    <Option v-for="(item, index) in orderSelectList" :key="index" :value="item.id">{{ item.title }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="A+物流计划订单" prop="wishIsAdvancedLogistics" v-if="formSearchKey.includes('wishIsAdvancedLogistics')">
                  <dyt-select v-model="pageParams.wishIsAdvancedLogistics" placeholder="A+物流计划订单">
                    <Option v-for="(item, index) in orderSelectList" :key="index" :value="item.id">{{ item.title }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="优质物流商订单" prop="wishIsPremiumcarrierUpgrade" v-if="formSearchKey.includes('wishIsPremiumcarrierUpgrade')">
                  <dyt-select v-model="pageParams.wishIsPremiumcarrierUpgrade" placeholder="优质物流商订单">
                    <Option v-for="(item, index) in orderSelectList" :key="index" :value="item.id">{{ item.title }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="WISH EXPRESS订单" prop="wishIsWishExpress" v-if="formSearchKey.includes('wishIsWishExpress')">
                  <dyt-select v-model="pageParams.wishIsWishExpress" placeholder="WISH EXPRESS订单">
                    <Option v-for="(item, index) in orderSelectList" :key="index" :value="item.id">{{ item.title }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="Prime订单" prop="amazonIsPrime" v-if="formSearchKey.includes('amazonIsPrime')">
                  <dyt-select v-model="pageParams.amazonIsPrime" clearable>
                    <Option v-for="(item,index) in amazonPrimeList" :key="index" :value="item.value">{{ item.type }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="Item ID" prop="asin" v-if="formSearchKey.includes('asin')">
                  <Input v-model='pageParams.asin' />
                </Form-item>
                <Form-item label="是否货到付款订单" prop="isCashOnDelivery" v-if="formSearchKey.includes('isCashOnDelivery')">
                  <dyt-select v-model="pageParams.isCashOnDelivery" placeholder="是否货到付款订单">
                    <Option v-for="(item, index) in cashOnDeliveryList" :key="index" :value="item.value">{{ item.label }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="搜索字符" prop="searchValue" v-if="formSearchKey.includes('searchValue')">
                  <dyt-input class="filterSearch" placeholder="可输入订单号、买家ID、买家姓名、SKU、平台产品编码" v-model.trim="pageParams.searchValue"></dyt-input>
                </Form-item>
                <Form-item label="是否截留" prop="isSuspended" v-if="formSearchKey.includes('isSuspended')">
                  <dyt-select v-model="pageParams.isSuspended" :max-tag-count="1">
                    <Option v-for="(item,index) in isSuspendedList" :key="index" :value="item.id">{{ item.name }}</Option>
                  </dyt-select>
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
    <div style="display: flex; justify-content: space-between;">
      <div>
        <Dropdown style="margin-left: 20px" v-if="getPermission('orderInfo_batch_suspend')">
          <Button type="primary">
            批量截留
            <Icon type="ios-arrow-down"></Icon>
          </Button>
          <DropdownMenu slot="list">
            <DropdownItem @click.native="suspendedSelect">批量截留选中
            </DropdownItem>
            <DropdownItem @click.native="suspendedSelectAll">批量截留所有
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <Dropdown style="margin-left: 20px" v-if="getPermission('orderTransaction_batchMatchProductGoods')">
          <Button type="primary">
            匹配商品
            <Icon type="ios-arrow-down"></Icon>
          </Button>
          <DropdownMenu slot="list">
            <DropdownItem @click.native="matchingProduction('check')">匹配选中商品
            </DropdownItem>
            <DropdownItem @click.native="matchingProduction('all')">批量匹配所有商品
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <Dropdown style="margin-left: 15px">
          <Poptip v-model="setTagListStatus" placement="bottom" :transfer="true">
            <Button icon="md-pricetag">
              打标签
              <Icon type="md-arrow-dropdown" />
            </Button>
            <div slot="content">
              <order-label-tag v-model="tagIdList" :tags-list="tagsList" />
              <div class="tagsSelectFooter">
                <Button size="small" @click="setTag(checkOrderId)">打标签</Button>
                <Button size="small" @click="dropOrderTag(checkOrderId)">清空标签</Button>
              </div>
            </div>
          </Poptip>
        </Dropdown>
        <Dropdown style="margin-left: 15px" v-if="getPermission('orderRemark_insert')">
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
      <div>
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
      <keep-alive>
          <Table highlight-row border :height="tableHeight" :loading="tableLoading" :columns="orderColumn" :data="orderData" @on-selection-change='selectChange'></Table>
      </keep-alive>
      <div class="table-page flexBox">
        <keep-alive>
          <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator :current="curPage" show-sizer @on-page-size-change="changePageSize" placement="top" :page-size-opts="pageArray"></Page>
        </keep-alive>
      </div>
    </div>
    <!-- 详情 -->
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
    <!-- 点击图片 -->
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
              <span
                class="productID"
                @click="goItemUrl(item)"
                :class="{'cursor-pointer': platformIdUrlKey.includes(item.platformId)}"
                v-if="item.webstoreItemId"
              >itemID：{{ item.webstoreItemId }}</span>
              <span class="productHaveATitle">SKU: <em>{{ item.webstoreSku }}</em></span>
              <span class="productHaveATitle" v-if="inGroup ==='ebay'">物品所在地: <em>{{ item.location }}</em></span>
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
    <Modal v-model="dialogVisible" title="操作提示" @on-ok="confirm" @on-cancel="cancel">
      <span> 确认是否要截留订单，数量：</span>
      <span style="color:#ff995c">{{suspendedWay==0?selectList.length:total}}</span>
      <div style="margin-top:20px">
        截留原因：<Input v-model="suspendedReason" maxlength="200" show-word-limit type="textarea" style="width: 400px" />
      </div>
      <p style="margin-top:30px"> 提示：无法截留的订单将会自动忽略</p>

    </Modal>
    <!-- 批量备注 -->
    <batchRemarkModal :module-visible.sync="moduleRemarkVisible" :module-data="moduleRemarkData" @updateList="getList" />
  </div>
</template>

<script>
import api from '@/api/api';
import orderDetails from "@/views/commonOrder/components/commonOrder/orderDetails";
import Mixin from '@/components/mixin/common_mixin';
import orderSys from '@/components/mixin/orderSys_mixin';
import batchRemarkModal from "@/views/commonOrder/components/commonOrder/batchUpdateRemark";
import { filterKey, columnKey } from '@/views/commonOrder/script/unmatchProductConfig';
import { platformReceptionUrl } from '@/utils/enum';

export default {
  mixins: [Mixin, orderSys],
  components: {
    orderDetails,
    batchRemarkModal
  },
  data () {
    let self = this;
    return {
      moduleRemarkVisible: false,
      pageLoading: false,
      moduleRemarkData: {},
      cashOnDeliveryList: [
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
      filenodeViewTargetUrl: self.$store.state.erpConfig.filenodeViewTargetUrl, // filenode根路径
      pageParamsStatus: false, // 每次更新完pageParms都要设置成true触发刷新
      setTagListStatus: false,
      platformItemUrl: platformReceptionUrl,
      brandData: [],
      pageParams: {
        pageNum: 1,
        pageSize: 50,
        tagIdList: [],
        brandIdList: [],
        isCashOnDelivery: -1,
        platformId: [this.inGroup],
        buyerCountryCodeList: [],
        searchValue: null,
        payStartTime: null,
        payEndTime: null,
        saleAccountIds: [],
        payTime: [],
        buyerAccountId: null,
        buyerName: null,
        webstoreItemId: null,
        webstoreSku: null,
        orderNo: null,
        orderBy: 'payTime',
        upDown: 'down',
        isSuspended: 2,
        amazonIsBusinessOrder: null,
        amazonIsPrime: null,
        asin: null,
        wishIsCombinedOrder: -1,
        wishIsAdvancedLogistics: -1,
        wishIsPremiumcarrierUpgrade: -1,
        wishIsWishExpress: -1,
      },
      totalPage: 0,
      total: 0,
      curPage: 1,
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
      orderSelectList: [
        { id: -1, title: '全部' },
        { id: 1, title: '是' },
        { id: 0, title: '否' }
      ],
      orderData: [],
      tableColumn: {
        selection: {
          type: 'selection',
          width: 50,
          // fixed: 'left',
          align: 'center'
        },
        salesRecordNumber: {
          title: '订单号',
          key: 'salesRecordNumber',
          align: 'center',
          minWidth: 200,
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
        platformOrderStatus: {
          title: '订单状态',
          key: 'platformOrderStatus',
          align: 'center',
          width: 120
        },
        aliexpressOrderStatus: {
          title: '订单状态', // 订单状态
          key: 'platformOrderStatus',
          align: 'center',
          width: 110,
          render: (h, params) => {
            return h('span', this.platformOrderStatusObj[params.row.platformOrderStatus]);
          }
        },
        productList: {
          title: '产品',
          key: 'productList',
          resizable: true,
          width: 150,
          align: 'center',
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
        },
        shippingLimiteTime: {
          title: '发货剩余时间',
          key: 'shippingLimiteTime',
          width: 150,
          render: (h, params) => {
            let date = self.getUniversalTime(params.row.shippingLimiteTime, 'fulltime');
            return h('div', {
              style: {
                color: '#f00'
              }
            }, self.getRemainTime(date));
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
        buyerAccountId: {
          title: '买家ID',
          key: 'buyerAccountId',
          align: 'center',
          width: 100,
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
        buyerCountryCodeList: {
          title: '国家/地区',
          key: 'buyerCountryCodeList',
          align: 'center',
          width: 110
        },
        totalPrice: {
          title: '金额',
          key: 'totalPrice',
          align: 'center',
          width: 110,
          render: (h, params) => {
            return h('div', [
              h('div', params.row.totalPrice), params.row.totalPriceCurrency && h('div', '(' + params.row.totalPriceCurrency + ')')
            ]);
          }
        },
        isSuspended: {
          title: '是否截留',
          key: 'isSuspended',
          align: 'center',
          width: 90,
          render: (h, params) => {
            return h('div', [
              h('div', params.row.isSuspended == 1 ? '是' : '否')
            ]);
          }
        },
        suspendedReason: {
          title: '截留原因',
          key: 'suspendedReason',
          align: 'center',
          minWidth: 120
        },
        payTime: {
          title: '付款时间',
          key: 'payTime',
          align: 'center',
          width: 140
        },
        tags: {
          title: '标签',
          key: 'tags',
          align: 'center',
          minWidth: 140,
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
          minWidth: 150
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
        salesTime: {
          title: '下单时间',
          key: 'salesTime',
          align: 'center',
          width: 140
        },
        webstoreUpdatedDate: {
          title: '上次更新时间',
          key: 'webstoreUpdatedDate',
          align: 'center',
          width: 140
        },
        wishIsAdvancedLogistics: {
          title: 'A+物流计划订单',
          key: 'wishIsAdvancedLogistics',
          align: 'center',
          width: 140,
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
          width: 120,
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
          width: 150,
          render: (h, params) => {
            return h('div', [
              h('div', params.row.orderExtendInfo != null && params.row.orderExtendInfo.wishIsWishExpress === 1
                ? '是'
                : '否')
            ]);
          }
        },
        operate: {
          title: '操作',
          key: 'operate',
          fixed: 'right',
          align: 'center',
          width: 100,
          render: (h, params) => {
            if (self.getPermission('orderInfo_detail')) {
              return h('Button', {
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
              }, '订单详情');
            }
          }
        }
      },
      // 买家类型
      buyerTypeList: [
        { type: 'B2B', value: 1 },
        { type: 'B2C', value: 0 }
      ],
      // prime订单
      amazonPrimeList: [
        { type: '是', value: 1 },
        { type: '否', value: 0 }
      ],
      // 详情
      orderDetails: false,
      orderDetailsBegin: false,
      orderDetailsId: null,
      timestamp: null,
      orderNo: null,
      orderTagList: null,
      webstoreItemSite: null,
      productStatus: false, // 点击产品列表详情状态控制
      productModal: false,
      productDetails: '', // modal产品数据
      isSuspendedList: [{ id: 2, name: '全部' }, { id: 0, name: '否' }, { id: 1, name: '是' }],
      // 对话框视图
      dialogVisible: false,
      // 截留原因
      suspendedReason: '',
      // 挑选的list
      selectList: [],
      suspendedWay: 0// 0是选择选中，1是选择所有
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
    platformIdUrlKey () {
      return Object.keys(this.platformItemUrl || {});
    },
    checkOrderId () {
      return this.selectList.map(row => row.orderId)
    },
    tableHeight () {
      return this.getTableHeight(280);
    },
    formSearchKey () {
      return filterKey[this.inGroup] || filterKey.default;
    },
    orderColumn () {
      const tableColKey = columnKey[this.inGroup] || columnKey.default;
      let platformColumn = [];
      tableColKey.forEach(key => {
        if (!this.$common.isEmpty(this.tableColumn[key])) {
          platformColumn.push(this.tableColumn[key]);
        }
      });
      return platformColumn;
    }
  },
  created () {
    this.pageLoading = true;
    let awaitRes = [
      this.getShopList,
      // 获取标签列表
      this.getOrderListTag,
      // 获取国家区域列表
      this.getCountrys
    ];
    if (['otto'].includes(this.inGroup)) {
      // 获取平台品牌
      awaitRes.push(this.getPlatformBrandData);
    }
    this.$common.promiseAll(awaitRes).finally(() => {
      this.pageLoading = false;
      this.getList();
    });
  },
  mounted () {},
  methods: {
    // 批量备注
    batchUpdateRemark (str) {
      let updateFilter = this.getParams();
      if (str !== "all") {
        if (this.selectList.length == 0) {
          return this.$Message.error("请选择订单");
        }
        updateFilter = {
          orderNo: this.selectList.map(m => `${m.accountCode}-${m.salesRecordNumber}`).join(',')
        }
      }
      this.moduleRemarkData = {
        filterParams: updateFilter,
        url: api.unMatchGoodsBatchnsertRemark
      };
      this.$nextTick(() => {
        this.moduleRemarkVisible = true;
      })
    },
    reset () {
      this.$refs['pageParams'].resetFields();
    },
    // 处理搜索条件
    getParams () {
      let filter = this.$common.copy(this.pageParams);
      Object.keys(filter).forEach(key => {
        if (!['pageNum', 'pageSize', 'orderBy', 'upDown', 'platformId'].includes(key) && !this.formSearchKey.includes(key)) {
          delete filter[key];
        }
      });
      if (filter.isSuspended == 2) {
        filter.isSuspended = null;
      }
      if (filter.isCashOnDelivery === -1) {
        filter.isCashOnDelivery = null;
      }
      const initNull = ['wishIsCombinedOrder', 'wishIsAdvancedLogistics', 'wishIsPremiumcarrierUpgrade', 'wishIsWishExpress'];
      initNull.forEach(key => {
        if (filter[key] == -1) {
          filter[key] = null;
        }
      });
      filter.payStartTime = null;
      filter.payEndTime = null;
      if (!this.$common.isEmpty(filter.payTime) && !this.$common.isEmpty(filter.payTime[0])) {
        filter.payStartTime = this.getUniversalTime(new Date(filter.payTime[0]).getTime(), 'fulltime');
      }
      if (!this.$common.isEmpty(filter.payTime) && !this.$common.isEmpty(filter.payTime[1])) {
        filter.payEndTime = this.getUniversalTime(new Date(filter.payTime[1]).getTime(), 'fulltime');
      }
      delete filter.payTime;
      return filter;
    },
    getList () {
      if (!this.getPermission('orderInfo_queryForUnmatchedGoods')) return this.$Message.error('你暂无权限访问对应数据！');
      this.orderData = [];
      this.loadingTrue();
      this.selectList = [];
      let pageParams = this.getParams();
      this.axios.post(api.get_unmatchGoods, pageParams).then(response => {
        if (response.data.code === 0) {
          let pos = [];
          let saleAccountIdPos = [];
          let orderIdPos = [];
          let data = response.data.datas;
          if (data.list !== null) {
            data.list.forEach((n, i) => {
              pos.push({
                ...n,
                productList: [],
                buyerCountryCodeList: n.buyerCountryCode,
                payTime: this.getDataToLocalTime(n.payTime, 'fulltime'),
                accountCode: '',
                orderTagList: n.orderTags
              });
              saleAccountIdPos.push(n.saleAccountId);
              orderIdPos.push(n.orderId);
            });
            if (saleAccountIdPos.length > 0) { // 匹配订单号
              const getData = async () => {
                const Arr = await this.getAccountCode(pos, saleAccountIdPos);
                let newArr = await this.getProductList(Arr, orderIdPos);
                newArr = await this.getOrderRemark(newArr, orderIdPos); // 匹配订单备注
                this.orderData = newArr;
                // this.orderData = pos;
                this.loadingFalse();
              }
              getData();
            }
            this.$nextTick(function () {
              this.total = Number(data.total);
              this.totalPage = Number(data.pages);
            });
          } else {
            this.orderData = [];
            this.loadingFalse();
            this.$nextTick(function () {
              this.total = 0;
              this.totalPage = 0;
            });
          }
        }
      }).catch(() => {
        this.loadingFalse();
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
      this.$nextTick(() => {
        this.productModal = true;
        this.productDetails = data;
      });
    },
    // 获取 otto 品牌数据
    getPlatformBrandData () {
      return new Promise((resolve) => {
        this.brandData = [];
        this.axios.post(api.getBrandData).then(res => {
          if (res && res.data && res.data.code == 0) {
            this.brandData = (res.data.datas || []).filter(item => !this.$common.isEmpty(item.brandId));
          }
          resolve({ state: 'finally' });
        }).catch(() => {
          resolve({ state: 'finally' });
        })
      })
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
      if (!this.$common.isEmpty(item.orderTransactionExtend)) {
        amazonAsin = item.orderTransactionExtend.amazonAsin || '';
      }
      const shopeeShopId = item.accountInfo ? item.accountInfo.shopeeShopId || '' : '';
      const openUrl = this.platformItemUrl[item.platformId](itemId, amazonAsin, shopeeShopId);
      window.open(openUrl);
    },
    closeModal () {
      this.productModal = false;
    },
    suspendedSelect () {
      if (this.selectList.length == 0) return this.$Message.warning('请先选择要截留的订单')
      this.suspendedWay = 0
      this.suspendedReason = ''
      this.dialogVisible = true
    },
    suspendedSelectAll () {
      if (this.orderData.length == 0) return this.$Message.warning('请先查询要截留的订单')
      this.suspendedWay = 1
      this.suspendedReason = ''
      this.dialogVisible = true
    },
    // 匹配商品
    matchingProduction (str) {
      let option = this.getParams();
      if (str == 'check') {
        if (this.selectList.length == 0) return this.$Message.warning('请先选择要匹配的订单')
        option = {
          platformId: option.platformId,
          matchGoodsOrderIdList: this.selectList.map(item => { return item.orderId })
        }
      }
      this.axios.post(api.batchMatchProductGoods, option).then(res => {
        if (res.data && res.data.code != 0) {
          return this.$Message.error(res.data.message || '匹配失败！');
        }
        this.$Message.success('重新匹配完成');
        this.search();
      }).catch(() => {
        this.$Message.error('匹配失败！');
      })
    },
    confirm () {
      let pageParams = this.getParams();
      this.axios.put('/order-service/orderInfo/batchSuspendOrderInfo', {
        batchSuspendedReason: this.suspendedReason,
        orderIdList: this.suspendedWay == 0 ? this.selectList.map(item => { return item.orderId }) : [],
        queryForUnmatchedGoodsBo: this.suspendedWay == 1 ? pageParams : {},
        operateType: this.suspendedWay
      }).then(res => {
        this.$Message.success('截留成功')
        this.getList()
      })
    },
    cancel () {

    },
    selectChange (val) {
      this.selectList = val
    }
  }
};
</script>
