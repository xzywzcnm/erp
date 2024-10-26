<template>
  <div>
    <div class="interceptOrderFilter">
      <div class="card-container">
        <div class="card-content">
          <div class="platformParamsSelect">
            <Form ref="pageParams" :model="pageParams" :label-width="labelWidth">
              <dyt-filter>
                <Form-item label="渠道">
                  <dyt-select v-model="platformGroupPlatformId" placeholder="请选择店铺，可输入搜索" @on-change="changePlatform">
                    <Option v-for="(item, index) in platformGroup" :key="index" :value="item.platformId">{{ item.name }}</Option>
                  </dyt-select>
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
                <Form-item label="标签" prop="tagIdList">
                  <dyt-select v-model="pageParams.tagIdList" @on-change="tagChange" :max-tag-count="1" multiple
                    placeholder="请选择或搜索标签">
                    <Option v-for="item in tagsList" :key="item.tagId" :value="item.tagId" :v="item.tagId">{{
                        item.tagName
                    }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="国家/地区" prop="buyerCountryCodeList">
                  <dyt-select v-model="pageParams.buyerCountryCodeList" @on-change="countryChange" :max-tag-count="1"
                    multiple placeholder="请选择或输入所在地">
                    <Option v-for="(item, index) in formValidate.country" :key="index" :value="item.twoCode"
                      :v="item.cnName">{{ item.enName }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="付款时间">
                  <Date-picker transfer type="datetimerange" style="width:100%" @on-clear="resetDate"
                    @on-change="getDateValue" :clearable="clearAble" :options="dateOptions" format="yyyy-MM-dd HH:mm:ss"
                    placement="bottom-end" placeholder="选择日期" :value="payTimeArr"></Date-picker>
                </Form-item>
                <Form-item label="订单号" prop="orderNo">
                  <dyt-input-tag :limit="1" :string="true" placeholder="请输入订单号,多个订单号用逗号或回车分隔" type="textarea"
                    v-model.trim="pageParams.orderNo"></dyt-input-tag>
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
                  <dyt-input-tag :limit="1" :string="true" placeholder="请输入SKU,多个用逗号或回车分隔" type="textarea"
                    v-model.trim="pageParams.webstoreSku"></dyt-input-tag>
                </Form-item>
                <Form-item label="是否有退款">
                  <dyt-select v-model="pageParams.isRefunded" placeholder="是否有退款">
                    <Option v-for="item in orderList" :key="item.id" :value="item.id">{{ item.title }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="是否部分退款">
                  <dyt-select v-model="pageParams.isPartRefunded" placeholder="是否部分退款">
                    <Option v-for="item in orderList" :key="item.id" :value="item.id">{{ item.title }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="搜索字符" prop="searchValue">
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
        <Button type="primary" @click="startCancelDelivery" class="iconbuttons mr10"
          :disabled="!getPermission('orderInfo_cancelOrder_batch')">
          <span class="icon iconfont">&#xe67e;</span> 取消订单 </Button>
        <Buttons type="primary" trigger="click" @on-click="setReleaseHasCondition"
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
        <Dropdown style="margin-left: 15px" v-if="getPermission('orderShippingInfo_updateReceiverAddress')">
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
          style="margin-left: 15px"
          type="primary"
          @click.native="batchModifyWarehouse"
          v-if="getPermission('orderShippingInfo_batchUpdateWarehouse')"
        >批量修改仓库</Button>
        <Dropdown style="margin-left: 15px" v-if="permission.exportOrders">
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
              <span class="productID">{{ item.webstoreItemId }}</span>
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
    <Spin v-if="pageDataLoading" fix>加载数据中...</Spin>
  </div>
</template>
<script>
import api from '@/api/api';
import orderDetails from "@/views/commonOrder/components/commonOrder/orderDetails";
import Mixin from '@/components/mixin/common_mixin';
import orderSys from '@/components/mixin/orderSys_mixin';
import cancelDelivery from '@/components/common/order/cancelOrder';
import batchRemarkModal from "@/views/commonOrder/components/commonOrder/batchUpdateRemark";
import batchUpdateAddresModal from "@/views/commonOrder/components/commonOrder/batchUpdateAddres";
import batchModifyModal from '@/components/common/batchModifyModal';

export default {
  mixins: [Mixin, orderSys],
  components: {
    orderDetails,
    cancelDelivery,
    batchRemarkModal,
    batchUpdateAddresModal,
    batchModifyModal
  },
  data () {
    var self = this;
    return {
      moduleRemarkVisible: false,
      moduleAddreskVisible: false,
      moduleRemarkData: {},
      moduleAddreskData: {},
      CascaderData: [],
      pageDataLoading: false,
      selectedArr: [],
      exportModel: {
        title: '',
        content: '',
        status: false
      },
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
      platformGroupPlatformId: '-1',
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
      orderDetails: false,
      orderDetailsBegin: false,
      orderDetailsId: null,
      orderNo: null,
      timestamp: null,
      orderTagList: null,
      webstoreItemSite: null,
      platformGroup: [],
      pageParams: {
        pageNum: 1,
        pageSize: 50,
        tagIdList: [],
        platformId: [],
        buyerCountryCodeList: [],
        isRefunded: -1,
        isPartRefunded: -1,
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
        orderNo: null
      },
      formValidate: {
        country: []
      },
      shopModal: [],
      payTimeArr: [],
      moreFilter: false, // 高级筛选
      moreFilterIcon: 'md-arrow-dropdown',
      moreFilterMes: '更多筛选项',
      tagsModal: [],
      markTagsModal: [],
      pageParamsStatus: false, // 每次更新完pageParms都要设置成true触发刷新
      totalPage: 0,
      total: 0,
      curPage: 1,
      setTagListStatus: false,
      clearAble: true,
      resetStatus: true,
      orderColumn: [
        {
          type: 'selection',
          fixed: 'left',
          width: 60,
          align: 'center'
        }, {
          title: '订单号',
          fixed: 'left',
          key: 'salesRecordNumber',
          align: 'center',
          minWidth: 140,
          render: (h, params) => {
            let item = [h('span', {
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
            }, params.row.accountCode + '-' + params.row.salesRecordNumber)];
            if (!this.$common.isEmpty(params.row.emailGroups)) {
              item.push(h('Icon', {
                style: { 'cursor': 'pointer', 'margin-left': '5px', 'font-size': '22px', 'color': '#f20' },
                class: 'lapa lapa-solid-core-mail',
                on: {
                  click: () => {
                    const openUrl = `/cs-service/customer.html#/ebayMail`;
                    localStorage.setItem('erp-order-stockoutOrder', JSON.stringify({
                      buyerAccountId: params.row.buyerAccountId,
                      messageGroupId: params.row.emailGroups
                    }));
                    window.open(openUrl);
                  }
                }
              }));
            }
            return item;
          }
        }, {
          title: '截留说明',
          key: 'orderNotes',
          align: 'center',
          width: 150,
          resizable: true,
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
        }, {
          title: '产品',
          key: 'productList',
          align: 'center',
          width: 140,
          resizable: true,
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
          title: '买家ID/姓名',
          key: 'buyerName',
          align: 'center',
          width: 140,
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
          width: 90
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
          align: 'center',
          key: 'payTime',
          width: 100
        }, {
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
            }
            return h('div', pos);
          }
        }, {
          title: '备注',
          key: 'remarkContent',
          align: 'center',
          resizable: true,
          width: 140
        }, {
          title: '是否有退款',
          align: 'center',
          key: 'isRefunded',
          width: 110,
          render (h, params) {
            let isRefunded = params.row.isRefunded === 1 ? '是' : '否';
            return h('span', isRefunded);
          }
        }, {
          title: '操作',
          key: 'operate',
          align: 'center',
          fixed: 'right',
          width: 240,
          render: (h, params) => {
            return h('div', {
              style: {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexWrap: 'wrap'
              }
            }, [
              !self.getPermission('orderInfo_cancelOrder_single') || h('Button', {
                props: {
                  size: 'small'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    self.$refs['cancelDelivery'].cancelDelivery('single', params.row);
                  }
                }
              }, '取消订单'), !self.getPermission('orderInfo_suspendPass_single') || h('Button', {
                props: {
                  size: 'small'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    self.setThisRelease(params.row.orderId, 0);
                  }
                }
              }, '放行'), !self.getPermission('orderInfo_detail') || h('Button', {
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
      ],
      orderData: [],
      orderIdList: [],
      productStatus: false, // 点击产品列表详情状态控制
      productModal: false,
      productDetails: '' // modal产品数据
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
      return this.getTableHeight(280);
    },
    // 权限
    permission () {
      return {
        exportOrders: this.getPermission('interceptOrder_exportOrders_batch')
      }
    }
  },
  created () {
    this.initData();
  },
  activated () {},
  methods: {
    initData () {
      this.pageDataLoading = true;
      this.$common.promiseAll([
        this.GetPlatformGroup,
        this.getOrderListTag
      ]).finally(() => {
        this.pageDataLoading = false;
        this.getList();
      })
    },
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
    getParams (par, type) {
      let keys = ['isRefunded', 'isPartRefunded'];
      let newPar = this.$common.copy(par);
      keys.forEach(key => {
        if ([-1, '-1'].includes(par[key])) {
          if (type) {
            delete newPar[key];
          } else {
            newPar[key] = null;
          }
        }
      })
      return newPar
    },
    getList () {
      let v = this;
      v.loadingTrue();
      this.selectedArr = [];
      v.axios.post(api.get_interceptOrderList, JSON.stringify(this.getParams(v.pageParams))).then(response => {
        if (response.data.code === 0) {
          let pos = [];
          let saleAccountIdPos = [];
          let orderIdPos = [];
          let data = response.data.datas;
          if (data.list !== null) {
            data.list.forEach((n, i) => {
              pos.push({
                salesRecordNumber: n.salesRecordNumber,
                webstoreItemSite: n.webstoreItemSite,
                suspendedReason: n.suspendedReason,
                buyerAccountId: n.buyerAccountId,
                buyerName: n.buyerName,
                isRefunded: n.isRefunded,
                buyerCountryCode: n.buyerCountryCode,
                totalPrice: n.totalPrice,
                payTime: v.getDataToLocalTime(n.payTime, 'fulltime'),
                platformId: n.platformId,
                totalPriceCurrency: n.totalPriceCurrency,
                orderId: n.orderId,
                accountCode: '',
                orderTagList: n.orderTags,
                merchantId: n.merchantId,
                saleAccountId: n.saleAccountId,
                productList: []
              });
              saleAccountIdPos.push(n.saleAccountId);
              orderIdPos.push(n.orderId);
            });
            if (saleAccountIdPos.length > 0) { // 匹配订单号
              async function getData () {
                const Arr = await v.getAccountCode(pos, saleAccountIdPos);
                let newArr = await v.getProductList(Arr, orderIdPos);
                newArr = await v.getOrderRemark(newArr, orderIdPos); // 匹配订单备注
                v.orderData = newArr;
                v.getImg()
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
    show (params) {
      let v = this;
      v.orderDetailsBegin = true;
      v.orderDetailsId = params;
      let date = new Date().getTime();
      v.$nextTick(() => {
        v.orderDetails = true;
        v.timestamp = date;
      });
    },
    getSelectValue (value) { // table获取所选值
      this.selectedArr = value;
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
      v.$refs['pageParams'].resetFields();
      v.pageParams.isRefunded = -1;
      v.pageParams.isPartRefunded = -1;
      this.platformGroupPlatformId = '-1';
      this.pageParams.platformId = this.platformGroup.filter(item => {
        return item.platformId !== '-1'
      }).map((item) => {
        return item.platformId
      })
      v.resetDate();
      v.payTimeArr = [];
    },
    getDateValue (value) { // 获取日期返回值
      let v = this;
      if (value[0] !== '') {
        v.pageParams.payStartTime = v.getUniversalTime(new Date(value[0]).getTime(), 'fulltime');
        v.pageParams.payEndTime = v.getUniversalTime(new Date(value[1]).getTime(), 'fulltime');
      }
    },
    resetDate () {
      let v = this;
      v.pageParams.payStartTime = null;
      v.pageParams.payEndTime = null;
    },
    setThisRelease (orderId, flag, type) {
      let v = this;
      let obj = {};
      if (type === 'more') {
        obj.orderIdList = orderId;
      } else if (type === 'all') {
        obj = this.getParams(v.pageParams, true);
      } else {
        obj.platformId = ['ebay'];
        obj.orderIdList = [orderId];
      }
      if (flag !== 1) {
        obj.flag = 0;
      } else {
        obj.flag = 1;
      }
      v.axios.put(api.set_orderRelease, JSON.stringify(obj)).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
          v.pageParamsStatus = true;
        } else if (response.data.code === 110503) {
          v.$Modal.confirm({
            title: '批量放行',
            okText: '整包裹放行',
            content: '订单所在包裹为合并包裹，请选择整包裹放行或取消操作',
            onOk: () => {
              v.setThisRelease(orderId, 1, type);
            }
          });
        }
      });
    },
    setReleaseConfirm () {
      let v = this;
      if (v.orderIdList.length === 0) {
        v.$Message.error('请选择订单');
        return false;
      }
      v.$Modal.confirm({
        title: '批量放行',
        content: '<p>' + '放行后，订单将继续处理流程。' + '</p>',
        loading: true,
        onOk: () => {
          v.$Modal.remove();
          setTimeout(() => {
            v.setThisRelease(v.orderIdList, 0, 'more');
          }, 500);
        }
      });
    },
    setReleaseHasCondition (val) {
      let v = this;
      if (val === '1') {
        v.$Modal.confirm({
          title: '放行（所有结果集）',
          content: '<p>' + '放行所有结果集，系统将会放行符合您当前查询条件的订单。' + '</p>',
          loading: true,
          onOk: () => {
            v.$Modal.remove();
            setTimeout(() => {
              v.setThisRelease(v.orderIdList, 0, 'all');
            }, 500);
          }
        });
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
    }, // 获取渠道
    GetPlatformGroup () {
      return new Promise((resolve) => {
        this.getHavePlatformGroup().then(res => {
          this.pageParams.platformId = this.$common.isEmpty(res.platformData) ? [] : res.platformData[0].platformId;
          this.shopList = this.$common.copy(res.shopData);
          this.platformGroup = this.$common.copy(res.platformData);
          this.CascaderData = this.$common.copy(res.cascaderData);
          if (!this.$common.isEmpty(this.platformGroup) && this.platformGroup[0].name == '全部') {
            this.platformGroup[0].platformId = '-1';
          }
          this.$nextTick(() => {
            resolve(true);
          })
        });
      });
    },
    // 切换渠道
    changePlatform (val) {
      this.$set(this.pageParams, 'platformId', []);
      this.$set(this.pageParams, 'saleAccountIds', []);
      if (val === '-1' || this.$common.isEmpty(val)) {
        this.pageParams.platformId = this.platformGroup.filter(item => {
          return item.platformId !== '-1'
        }).map((item) => {
          return item.platformId
        })
      } else {
        this.pageParams.platformId.push(val);
      }
      // this.pageDataLoading = true;
      // this.getShopListData(this.pageParams.platformId).then((shopList) => {
      //   this.shopList = this.$common.copy(shopList);
      // }).finally(() => {
      //   this.pageDataLoading = false;
      //   this.getList();
      // })
      let platformShopData = [];
      this.CascaderData.forEach(getRes => {
        if (this.pageParams.platformId.includes(getRes.value)) {
          platformShopData = [...platformShopData, ...getRes.children];
        }
      });
      this.shopList = this.$common.copy(platformShopData);
      this.$nextTick(() => {
        this.getList();
      })
    },
    getImg () {
      let busineseIdList = []
      this.orderData.forEach(itema => {
        itema.productList.forEach(itemb => {
          if (itemb.businessId) busineseIdList.push(itemb.businessId)
        })
      })
      this.axios.post(api.query_imageByProductGoodsIds, busineseIdList).then(res => {
        this.orderData.forEach(itema => {
          itema.productList.forEach(itemb => {
            res.data.datas.forEach(itemc => {
              if (itemc.businessId == itemb.businessId) itemb.pictureUrl = itemc.path
            })
          })
        })
      })
    }
  },
  mounted () {
    setTimeout(this.getCountrys(), 2000);// 获取国家区域列表
  }
};
</script>
