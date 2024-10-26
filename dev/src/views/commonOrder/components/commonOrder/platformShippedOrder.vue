<template>
  <div class="fbaOrder">
    <div class="unmatchProduct">
      <div class="card-container">
        <div class="card-content">
          <div class="platformParamsSelect">
            <Form ref="pageParams" :model="pageParams" :label-width="labelWidth">
              <dyt-filter>
                <Form-item label="店铺" prop="saleAccountIds" v-if="paramKeyList.includes('saleAccountIds')">
                  <dytStoreSelect
                    v-model="pageParams.saleAccountIds"
                    :option-data="shopList"
                    :replace-option-key="{ value: 'saleAccountId', label: 'accountCode' }"
                    placeholder="请选择店铺，可输入搜索"
                    input-placeholder="请输入店铺，多个店铺可用逗号或换行隔开"
                  />
                </Form-item>
                <Form-item label="标签" prop="tagIdList" v-if="paramKeyList.includes('tagIdList')">
                  <dyt-select
                    v-model="pageParams.tagIdList"
                    filterable
                    multiple
                    placeholder="请选择或搜索标签"
                    ><Option
                      v-for="(item, index) in tagsList"
                      :key="index"
                      :value="item.tagId"
                      :v="item.tagId"
                      >{{ item.tagName }}</Option
                    ></dyt-select
                  >
                </Form-item>
                <Form-item label="付款时间" prop="payDateTime" v-if="paramKeyList.includes('payDateTime')">
                  <Date-picker
                    transfer
                    v-model="pageParams.payDateTime"
                    type="datetimerange"
                    style="width: 100%"
                    :clearable="true"
                    :options="dateOptions"
                    format="yyyy-MM-dd HH:mm:ss"
                    placement="bottom-end"
                    placeholder="选择日期"
                  ></Date-picker>
                </Form-item>
                <Form-item label="国家/地区" prop="buyerCountryCodeList" v-if="paramKeyList.includes('buyerCountryCodeList')">
                  <dyt-select
                    v-model="pageParams.buyerCountryCodeList"
                    @on-change="countryChange"
                    filterable
                    multiple
                    placeholder="请选择或输入所在地"
                    ><Option
                      v-for="(item, index) in formValidate.country"
                      :key="index"
                      :value="item.twoCode"
                      :v="item.cnName"
                      >{{ item.enName }}</Option
                    ></dyt-select
                  >
                </Form-item>
                <Form-item label="订单号" prop="orderNo" v-if="paramKeyList.includes('orderNo')">
                  <dyt-input-tag
                    type="textarea"
                    :limit="1"
                    :string="true"
                    placeholder="请输入订单号，多个订单号用逗号分隔"
                    v-model="pageParams.orderNo"
                  />
                </Form-item>
                <Form-item label="SPU" prop="lapaSpuList" v-if="paramKeyList.includes('lapaSpuList')">
                  <dyt-input-tag
                    type="textarea"
                    :limit="1"
                    :string="false"
                    placeholder="请输入SPU，多个SPU用逗号分隔"
                    v-model="pageParams.lapaSpuList"
                  />
                </Form-item>
                <Form-item label="SKU" prop="lapaSkuList" v-if="paramKeyList.includes('lapaSkuList')">
                  <dyt-input-tag
                    type="textarea"
                    :limit="1"
                    :string="false"
                    placeholder="请输入SKU，多个SKU用逗号分隔"
                    v-model="pageParams.lapaSkuList"
                  />
                </Form-item>
                <Form-item label="买家姓名" prop="buyerName" v-if="paramKeyList.includes('buyerName')">
                  <dyt-input
                    placeholder="请输入买家姓名"
                    v-model.trim="pageParams.buyerName"
                  />
                </Form-item>
                <Form-item label="买家姓名" prop="buyerNameList" v-if="paramKeyList.includes('buyerNameList')">
                  <dyt-input-tag
                    type="textarea"
                    :limit="1"
                    :string="false"
                    placeholder="请输入买家姓名，多个用逗号分隔"
                    v-model="pageParams.buyerNameList"
                  />
                </Form-item>
                <Form-item label="买家ID" prop="buyerAccountId" v-if="paramKeyList.includes('buyerAccountId')">
                  <dyt-input
                    placeholder="请输入买家ID"
                    v-model.trim="pageParams.buyerAccountId"
                  />
                </Form-item>
                <Form-item label="平台产品编码" prop="webstoreItemId" v-if="paramKeyList.includes('webstoreItemId')">
                  <dyt-input
                    placeholder="请输入平台产品编码"
                    v-model.trim="pageParams.webstoreItemId"
                  />
                </Form-item>
                <Form-item label="SKU" prop="webstoreSku" v-if="paramKeyList.includes('webstoreSku')">
                  <dyt-input
                    placeholder="请输入SKU"
                    v-model.trim="pageParams.webstoreSku"
                  />
                </Form-item>
                <Form-item label="SKU" prop="webstoreSkuList" v-if="paramKeyList.includes('webstoreSkuList')">
                  <dyt-input-tag
                    type="textarea"
                    :limit="1"
                    :string="false"
                    placeholder="请输入SKU，多个用逗号分隔"
                    v-model="pageParams.webstoreSkuList"
                  />
                </Form-item>
                <Form-item label="买家类型" prop="amazonIsBusinessOrder" v-if="paramKeyList.includes('amazonIsBusinessOrder')">
                  <dyt-select
                    v-model="pageParams.amazonIsBusinessOrder"
                    clearable
                    ><Option
                      v-for="(item, index) in buyerTypeList"
                      :key="index"
                      :value="item.value"
                      >{{ item.type }}</Option
                    ></dyt-select
                  >
                </Form-item>
                <Form-item label="Prime订单" prop="amazonIsPrime" v-if="paramKeyList.includes('amazonIsPrime')">
                  <dyt-select v-model="pageParams.amazonIsPrime" clearable
                    ><Option
                      v-for="(item, index) in amazonPrimeList"
                      :key="index"
                      :value="item.value"
                      >{{ item.type }}</Option
                    ></dyt-select
                  >
                </Form-item>
                <Form-item label="asin" prop="asin" v-if="paramKeyList.includes('asin')">
                  <dyt-input
                    v-model="pageParams.asin"
                    :maxlength="100"
                    placeholder="请输入asin"
                  />
                </Form-item>
                <Form-item label="搜索字符" prop="searchValue" v-if="paramKeyList.includes('searchValue')">
                  <dyt-input-tag
                    type="textarea"
                    :limit="1"
                    :string="true"
                    placeholder="可输入订单号、买家ID、买家姓名、SKU、平台产品编码"
                    v-model="pageParams.searchValue"
                  >
                  </dyt-input-tag>
                </Form-item>
                <div slot="operation" v-if="permission.query">
                  <Button type="primary" @click="search" :disabled="SearchDisabled" icon="md-search">查询</Button>
                  <Button @click="reset" style="margin-left: 10px" v-once icon="md-refresh">重置</Button>
                </div>
              </dyt-filter>
            </Form>
          </div>
        </div>
      </div>
    </div>

    <div class="tableControl" style="display: flex">
      <div style="flex: 100">
        <!-- 导出 -->
        <Buttons type="primary" trigger="click" v-if="permission.export" @on-click="exportOrderHasCondition">
          <Button type="primary" @click="exportOrder" class="iconbuttons">
            <span class="icon iconfont">&#xe639;</span> 导出选中
          </Button>
          <Buttons-menu slot="list">
            <Buttons-item name="1" v-if="permission.export">导出（所有结果集）</Buttons-item>
          </Buttons-menu>
        </Buttons>
        <!-- 打标签 -->
        <Dropdown class="ml10" v-if="permission.insertTag || permission.clearTag">
         <Poptip v-model="setTagListStatus" placement="bottom">
           <Button icon="md-pricetag">
             打标签
             <Icon type="md-arrow-dropdown" />
           </Button>
           <div slot="content">
             <div class="tagsList">
               <Checkbox-group v-model="tagIdList">
                 <ul>
                   <li v-for="(item, tagIndex) in tagsList" :key="tagIndex">
                     <Checkbox :label="item.tagId" >{{ item.tagName }}</Checkbox>
                   </li>
                 </ul>
               </Checkbox-group>
             </div>
             <div class="tagsSelectFooter">
               <Button size="small" @click="setTag(orderIdList, { orderType: 1 })" v-if="permission.insertTag">打标签</Button>
               <Button size="small" @click="dropOrderTag(orderIdList, { orderType: 1 })" v-if="permission.clearTag">清空标签</Button>
             </div>
           </div>
         </Poptip>
        </Dropdown>
        <!-- 批量转自发货 -->
        <Button class="ml10" type="primary" v-if="permission.consignment" @click="batchSelfDelivery">批量转自发货</Button>
        <!-- 批量备注 -->
        <Dropdown class="ml10" v-if="permission.remark">
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
      <div class="dataSort grayBg" style="display: inline-block; background: none; border: none; padding: 0; margin: 0;">
        <span>排序：</span>
        <Button-group>
          <template v-for="(item, index) in buttonGroupModel">
            <Button
              v-if="item.selected"
              :disabled="SearchDisabled"
              type="primary"
              @click="modifyTheSort(index, item.status)"
              :key="index"
            >
              {{ item.title }}
              <Icon
                type="md-arrow-round-up"
                v-if="item.status && item.selected"
              ></Icon>
              <Icon
                type="md-arrow-round-down"
                v-if="!item.status && item.selected"
              ></Icon>
            </Button>
            <Button
              v-if="!item.selected"
              :disabled="SearchDisabled"
              @click="modifyTheSort(index, item.status)"
              :key="index"
            >
              {{ item.title }}
              <Icon
                type="md-arrow-round-up"
                v-if="item.status && item.selected"
              ></Icon>
              <Icon
                type="md-arrow-round-down"
                v-if="!item.status && item.selected"
              ></Icon>
            </Button>
          </template>
        </Button-group>
      </div>
    </div>
    <div class="orderTable normalTop">
      <Table
        highlight-row
        border
        :height="tableHeight"
        :loading="tableLoading"
        :columns="orderColumn"
        :data="orderData"
        @on-selection-change="getSelectValue"
      ></Table>
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
            :page-size-opts="pageArray"
          ></Page>
        </keep-alive>
      </div>
    </div>
    <!-- 导出 -->
    <keep-alive>
      <Modal
        v-model="exportModel.status"
        :mask-closable="false"
        width="400"
        v-if="exportModelStatus"
        @on-ok="exportExcel"
      >
        <div class="ivu-modal-confirm">
          <div class="ivu-modal-confirm-head">
            <div class="ivu-modal-confirm-head-title">
              {{ exportModel.title }}
            </div>
          </div>
          <div class="ivu-modal-confirm-body ivu-modal-confirm-body-render">
            <div class="normalTop">
              <Row>
                <Col :span="1">
                  <Icon
                    type="md-information-circle"
                    color="#2b85e4"
                    size="44"
                  ></Icon>
                </Col>
                <Col :span="21" :offset="2">
                  <p>确认是否导出</p>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </Modal>
    </keep-alive>
    <keep-alive>
      <sliderModal
        v-model="orderDetails"
        :spinShow="spinShow"
        :styles="{ }"
        class="slider-model"
        v-if="orderDetailsBegin"
      >
        <orderDetails
          :moal-visible.sync="orderDetails"
          :orderDetailsId="orderDetailsId"
          :orderRowsDetail="orderRowsDetail"
          @reloadTag="reloadTag"
          :timestamp="timestamp"
          :orderNo="orderNo"
          :loading="tableLoading"
          @spinLoading="spinLoading"
          @resetSpinShow="resetSpinShow"
          @updateList="getList"
          :orderTagList="orderTagList"
          :webstoreItemSite="webstoreItemSite"
        ></orderDetails>
      </sliderModal>
    </keep-alive>
    <!-- 批量备注 -->
    <batchRemarkModal :module-visible.sync="moduleRemarkVisible" :module-data="moduleRemarkData" @updateList="getList" />
  </div>
</template>

<script>
import api from "@/api/api";
import Mixin from "@/components/mixin/common_mixin";
import batchRemarkModal from "@/views/commonOrder/components/commonOrder/batchUpdateRemark";
import { platformColumnKey, pageParamKey, platformApiKey } from '@/views/commonOrder/script/platformShippedOrderConfig';
import orderDetails from "@/views/commonOrder/components/commonOrder/orderDetails";

export default {
  mixins: [Mixin],
  components: {
    orderDetails,
    batchRemarkModal
  },
  data() {
    return {
      tableLoading: false,
      orderDetails: false,
      orderDetailsBegin: false,
      moduleRemarkVisible: false,
      orderDetailsId: null,
      orderRowsDetail: {},
      checkData: [],
      moduleRemarkData: {},
      noStatus: ['IN_CANCEL', 'WAIT_BUYER_ACCEPT_GOODS', 'FINISH'],
      timestamp: null,
      orderTagList: null,
      webstoreItemSite: null,
      pageParams: {
        pageNum: 1,
        pageSize: 50,
        tagIdList: [],
        platformId: [this.inGroup],
        buyerCountryCodeList: [],
        searchValue: null,
        payDateTime: this.getDataRange(-7),
        asin: null,
        saleAccountIds: [],
        buyerAccountId: null,
        buyerName: null,
        webstoreItemId: null,
        webstoreSku: null,
        orderNo: null,
        buyerNameList: [],
        webstoreSkuList: [],
        lapaSpuList: [],
        lapaSkuList: [],
        orderBy: "payTime",
        upDown: "down",
        amazonIsBusinessOrder: null,
        amazonIsPrime: null,
      },
      // 列表的列设置
      columnObj: {
        selection: {
          type: "selection",
          width: 50,
          // fixed: "left",
          align: "center",
        },
        orderId: {
          title: "订单号",
          key: "orderId",
          width: 160,
          // fixed: "left",
          align: "center",
          render: (h, { row }) => {
            return h("div", {
              style: {
                color: "#0054A6",
                cursor: 'pointer'
              },
              on: {
                click: () => {
                  this.show(row);
                },
              },
            }, [
              h('div', {}, `${row.accountCode || ''}-${row.salesRecordNumber || ''}`),
              row.amazonIsPrime === 1 ? h("img", {
                style: {
                  width: "32px",
                },
                attrs: {
                  src: require("../../../../assets/images/PRIME.png"),
                },
              }) : "",
            ]);
          },
        },
        trackingNumber: {
          title: "运单号",
          key: "trackingNumber",
          width: 150,
          align: "center",
          render: (h, { row }) => {
            return (row.trackingNumber || []).map((m) => {
              return h("p", m);
            });
          },
        },
        packageCode: {
          title: "站点",
          key: "packageCode",
          width: 60,
          align: "center",
          render: (h, params) => {
            if (params.row.webstoreItemSite !== null) {
              return h("div", {
                attrs: {
                  class:
                    "nationalFlag nationalFlag" + params.row.webstoreItemSite,
                  title: params.row.webstoreItemSite,
                },
              });
            } else {
              return h("div", "");
            }
          },
        },
        orderTransactions: {
          title: "图片",
          key: "orderTransactions",
          width: 120,
          align: "center",
          render: (h, params) => {
            const pos = (params.row.orderTransactions || []).map((n, i) => {
              return this.tableImg(h, params, "", n.pictureUrl, null, "right-end");
            });
            return h("div", pos);
          },
        },
        platformOrderStatus: {
          title: "订单状态",
          width: 140,
          align: "center",
          key: "platformOrderStatus",
        },
        skuMap: {
          title: "LAPA 产品",
          width: 130,
          align: "center",
          key: "skuMap",
          render: (h, { row }) => {
            let labelList = [];
            (row.orderTransactions || []).forEach((item) => {
              if (!this.$common.isEmpty(item.skuMap)) {
                Object.keys(item.skuMap).forEach(key => {
                  labelList.push(h('div', {}, `${key}*${item.skuMap[key]}`));
                })
              }
            })
            return labelList;
          }
        },
        amazonIsPrime: {
          title: "产品",
          key: "amazonIsPrime",
          width: 130,
          align: "center",
          render: (h, { row }) => {
            return h("div", (row.orderTransactions || []).map((i) => {
              return h("p", i.sku + "*" + i.quantity);
            }));
          },
        },
        buyerName: {
          title: "买家姓名",
          key: "buyerName",
          align: "center",
          width: 130,
          render: (h, params) => {
            return h(
              "p",
              { style: { color: "#ff0000" } },
              params.row.buyerName
            );
          },
        },
        buyerCountryCode: {
          title: "国家/地区",
          key: "buyerCountryCode",
          width: 100,
          align: "center",
          render: (h, params) => {
            let buyerCity = params.row.buyerCity ? params.row.buyerCity : "";
            let buyerState = params.row.buyerState ? params.row.buyerState : "";
            let buyerPostalCode = params.row.buyerPostalCode
              ? params.row.buyerPostalCode
              : "";
            return h("span", {}, [
              h("p", params.row.buyerCountryCode),
              h("p", buyerCity),
              h("p", buyerState),
              h("p", buyerPostalCode),
            ]);
          },
        },
        transactionPrice: {
          title: "金额",
          key: "transactionPrice",
          width: 110,
          align: "center",
          render: (h, params) => {
            return h("div", [
              h("div", params.row.totalPrice),
              params.row.totalPriceCurrency &&
                h("div", "(" + params.row.totalPriceCurrency + ")"),
            ]);
          },
        },
        salesTime: {
          title: "按创建时间",
          key: "salesTime",
          minWidth: 140,
          align: "center",
          render: (h, params) => {
            return h("span", params.row.salesTime);
          },
        },
        payTime: {
          title: "付款时间",
          key: "payTime",
          minWidth: 140,
          align: "center",
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.payTime)) return h("span", '');
            return h("span", this.$common.toLocaleDate(row.payTime, 'fulltime'));
          }
        },
        tags: {
          title: "标签",
          key: "tags",
          minWidth: 120,
          align: "center",
          render: (h, params) => {
            let orderTagList = params.row.orderTagList;
            let pos = [];
            if (!this.$common.isEmpty(orderTagList)) {
              orderTagList.forEach((n, i) => {
                let item = h("div", [
                  h("Icon", {
                    props: {
                      type: "pricetag",
                      color: "#f00",
                    },
                    style: {
                      marginRight: "5px",
                    },
                  }),
                  h("span", n.tagName),
                ]);
                pos.push(item);
              });
              return h("div", pos);
            }
          },
        },
        amazonIsBusinessOrder: {
          title: '订单买家类型',
          key: 'amazonIsBusinessOrder',
          align: 'center',
          width: 140,
          render (h, { row }) {
            return h('span', {}, row.amazonIsBusinessOrder === 0 ? 'B2C' : 'B2B');
          }
        },
        remark: {
          title: '备注',
          key: 'remarkContent',
          align: 'center',
          resizable: true,
          minWidth: 100
        },
        operate: {
          title: '操作',
          key: 'operate',
          fixed: 'right',
          width: 130,
          align: "center",
          render: (h, { row }) => {
            let item = [];
            if (!this.noStatus.includes(row.platformOrderStatus) && this.permission.consignment) {
              item.push(h('Button', {
                on: {
                  click: () => {
                    this.submitSelfDelivery([row.orderId]);
                  }
                }
              }, '转自发货'));
            }
            return item;
          }
        }
      },
      pageParamsStatus: false, // 每次更新完pageParms都要设置成true触发刷新
      buttonGroupModel: [
        {
          type: "payTime",
          selected: true,
          status: false, // true up false down
          title: "按付款时间",
        },
        {
          type: "salesTime",
          selected: false,
          status: true, // true up false down
          title: "按下单时间",
        },
      ],
      totalPage: 0,
      total: 0,
      curPage: 1,
      setTagListStatus: false,
      tagsList: [],
      orderData: [],
      buyerTypeList: [
        // 买家类型
        {
          type: "B2B",
          value: 1,
        },
        {
          type: "B2C",
          value: 0,
        },
      ],
      amazonPrimeList: [
        // prime订单
        {
          type: "是",
          value: 1,
        },
        {
          type: "否",
          value: 0,
        },
      ],
      orderIdList: [],
      exportModel: {
        title: "",
        content: "",
        status: false,
      },
      exportModelStatus: false,
      firstTime: true, // 默认一进来不查询
    };
  },
  computed: {
    tableHeight() {
      return this.getTableHeight(290);
    },
    permission () {
      return {
        // 查询
        query: this.getPermission('platformShippedOrder_query'),
        // 导出
        export: this.getPermission('platformShippedOrder_export'),
        // 批量转自发货
        consignment: this.getPermission('orderInfo_convertToShippedSelf'),
        // 打标签
        insertTag: this.getPermission('orderTag_insert_batch'),
        // 清标签
        clearTag: this.getPermission('orderTag_clear'),
        // 批量添加备注
        remark: this.getPermission('orderRemark_insert'),
      }
    },
    orderColumn () {
      let columnList = [];
      const colKey = platformColumnKey[this.inGroup] || platformColumnKey.default;
      colKey.forEach(key => {
        if (!this.$common.isEmpty(this.columnObj[key])) {
          columnList.push(this.columnObj[key]);
        }
      })
      return columnList;
    },
    // 搜索栏的字段展示
    paramKeyList () {
      const pKey = pageParamKey[this.inGroup] || pageParamKey.default;
      return ['pageNum', 'pageSize', 'orderBy', 'upDown', 'platformId', ...pKey];
    },
    // 对应 API
    platformApiObj () {
      return platformApiKey[this.inGroup] || platformApiKey.default;
    }
  },
  watch: {
    pageParamsStatus(n) {
      if (n) {
        if (!this.firstTime) {
          this.getList();
        }
        this.pageParamsStatus = false;
        this.firstTime = false;
      }
    },
  },
  methods: {
    getSelectValue(value) {
      this.checkData = value;
      // table获取所选值
      this.orderIdList = (value || []).map(m => m.orderId);
    },
    show(row) {
      this.orderDetailsBegin = true;
      this.orderDetailsId = row.orderId;
      this.orderNo = `${row.accountCode || ''}-${row.salesRecordNumber || ''}`;
      this.orderTagList = row.orderTagList ? row.orderTagList : [];
      this.webstoreItemSite = row.webstoreItemSite;
      this.orderRowsDetail = { ...this.$common.copy(row), isPlatformOrder: 1 };
      const date = new Date().getTime();
      this.$nextTick(() => {
        this.orderDetails = true;
        this.timestamp = date;
      });
    },
    exportExcel(type) {
      let obj = {
        orderIdList: this.orderIdList,
        platformId: [this.inGroup],
        timeZone: localStorage.getItem("timezoom") === undefined ? 8 : localStorage.getItem("timezoom"),
        orderBy: this.pageParams.orderBy,
        upDown: this.pageParams.upDown,
      };
      if (this.exportModel.title === "导出（所有结果集）") {
        obj = Object.assign(obj, this.getPageParams());
        delete obj.orderIdList;
      }
      this.axios.post(api[this.platformApiObj.export], JSON.stringify(obj)).then((response) => {
        if (response && response.data && response.data.code === 0) {
          this.$Message.success({
            content: "已生成导入/导出任务，任务编号" + "：" + response.data.datas,
            duration: 10,
            closable: true,
          });
        }
      });
    },
    searchFba() {
      this.search();
    },
    // 搜索栏
    getPageParams () {
      let param = this.$common.copy(this.pageParams);
      // 非当前平台的参数去掉
      Object.keys(param).forEach(key => {
        if (!this.paramKeyList.includes(key)) {
          delete param[key];
        }
      });
      if (!this.$common.isUndefined(param.payDateTime)) {
        param.payEndTime = null;
        param.payStartTime = null;
        if (!this.$common.isEmpty(param.payDateTime) && !this.$common.isEmpty(param.payDateTime[0])) {
          param.payStartTime = this.$common.getUniversalTime(param.payDateTime[0], 'fulltime');
          param.payEndTime = this.$common.getUniversalTime(param.payDateTime[1], 'fulltime');
        }
        delete param.payDateTime;
      }
      return param;
    },
    getList () {
      let obj = this.getPageParams();
      this.tableLoading = true;
      this.loadingTrue();
      this.orderIdList = [];
      this.checkData = [];
      this.axios.post(api.get_platformShippedOrder, JSON.stringify(obj)).then((response) => {
        if (response && response.data && response.data.code === 0) {
          let data = response.data.datas;
          let pos = [];
          let orderIdPos = [];
          let saleAccountIdPos = [];
          if (data.list !== null) {
            data.list.forEach((n, i) => {
              pos.push({
                ...n,
                accountCode: "",
                orderTagList: n.orderTags,
                syncStatus: this.pageParams.syncStatus
              });
              saleAccountIdPos.push(n.saleAccountId);
              orderIdPos.push(n.orderId);
            });
          } else {
            this.orderData = [];
          }
          if (saleAccountIdPos.length > 0) {
            // 匹配订单号
            this.getAccountCode(pos, saleAccountIdPos).then(getArr => {
              // 匹配备注
              this.getOrderRemark(getArr, orderIdPos).then((tableList) => {
                this.orderData = tableList;
                this.$nextTick(() => {
                  this.total = Number(data.total);
                  this.totalPage = Number(data.pages);
                  this.loadingFalse();
                  this.tableLoading = false;
                });
              });
            });
          } else {
            this.$nextTick(() => {
              this.total = Number(data.total);
              this.totalPage = Number(data.pages);
              this.loadingFalse();
              this.tableLoading = false;
            });
          }
        } else {
          this.tableLoading = false;
          this.loadingFalse();
        }
      }).catch(() => {
        this.tableLoading = false;
        this.loadingFalse();
      });
    },
    reset() {
      this.$refs["pageParams"].resetFields();
      this.$nextTick(() => {
        this.pageParams.payDateTime = this.getDataRange(-7);
      })
    },
    // 匹配订单号
    getAccountCode (pos, saleAccountIdPos) {
      return new Promise((resolve) => {
        this.axios.post(api.get_saleAccountById + "?saleAccountIds=" + saleAccountIdPos).then((res) => {
          if (res && res.data && res.data.code === 0) {
            let list = res.data.datas;
            for (var i = 0; i < list.length; i++) {
              for (var t = 0; t < pos.length; t++) {
                if (pos[t].saleAccountId === list[i].saleAccountId) {
                  pos[t].accountCode = list[i].accountCode;
                }
              }
            }
            resolve(pos);
          } else {
            resolve(pos);
          }
        }).catch((err) => {
          console.error(err);
          resolve(pos);
        })
      })
    },
    // 匹配备注
    getOrderRemark (pos, orderIdPos) {
      return new Promise(resolve => {
        this.axios.post(api.get_orderRemark, orderIdPos).then(response => {
          if (response && response.data && response.data.code === 0) {
            let list = response.data.datas;
            if (list && list.length > 0) {
              list.forEach(i => {
                pos.forEach(j => {
                  if (i.orderId === j.orderId) {
                    j.remarkContent = i.remarkContent;
                  }
                });
              });
            }
            resolve(pos);
          } else {
            resolve(pos);
          }
        }).catch((err) => {
          console.error(err);
          resolve(pos);
        });
      });
    },
    // 获取返回数据
    getDataRange (number = 0, format) {
      const day = new Date();
      const newFormat = this.$common.isEmpty(format) ? 'YYYY-MM-DD HH:mm:ss' : format == 'fulltime' ? 'YYYY-MM-DD HH:mm:ss' : format;
      const endTime = this.$common.dayjs(day).format(newFormat);
      const startTime = this.$common.dayjs(day).add(number, 'day').format(newFormat);
      return [startTime, endTime];
    },
    exportOrderHasCondition() {
      // 导出选中
      this.exportOrder("all");
    },
    exportOrder(type) {
      if ((this.orderIdList.length === 0 || this.orderIdList === null) && type !== "all") {
        this.$Message.error("请选择订单");
        return false;
      }
      this.exportModelStatus = true;
      if (type === "all") {
        this.exportModel.title = "导出（所有结果集）";
        this.exportModel.content =
          "导出所有结果集，系统将符合您当前查询选择的所有订单导出到excel，系统限制一次性只能导出不超过10000单。";
      } else {
        this.exportModel.title = "导出";
        this.exportModel.content = "已取消订单导出";
      }
      this.$nextTick(() => {
        this.exportModel.status = true;
      });
    },
    tagChange(value) {
      if (value.indexOf("null") >= 0) {
        this.pageParams.tagIdList = null;
      } else {
        this.pageParams.tagIdList = value;
      }
    },
    submitSelfDelivery (ids) {
      this.axios.post(api.post_orderInfo_convertToShippedSelf, ids).then(response => {
        if (response && response.data && response.data.code === 0) {
          this.$Message.success('操作成功');
          this.orderIdList = [];
          this.search();
        }
      });
    },
    batchSelfDelivery () {
      let ids = this.checkData.filter(i => !this.noStatus.includes(i.platformOrderStatus));
      if (ids && ids.length) {
        this.submitSelfDelivery(this.orderIdList);
      } else {
        this.$Message.error('请选择状态非IN_CANCEL,WAIT_BUYER_ACCEPT_GOODS,FINISH订单');
      }
    },
    // 批量备注
    batchUpdateRemark (str) {
      let updateFilter = this.getPageParams();
      updateFilter.orderType = 1;
      if (str !== "all") {
        if (this.checkData.length == 0) {
          return this.$Message.error("请选择订单");
        }
        updateFilter = {
          orderType: 1,
          orderIdList: (this.checkData || []).map(m => m.orderId)
        }
      }
      this.moduleRemarkData = {
        filterParams: updateFilter,
        url: api.orderRetrievalBatchInsertRemark
      };
      this.$nextTick(() => {
        this.moduleRemarkVisible = true;
      })
    },
  },
  mounted() {
    if (!this.permission.query) return;
    this.pageParamsStatus = true;
    this.getShopList();
    this.getOrderListTag(); // 获取标签列表
    setTimeout(this.getCountrys(), 2000); // 获取国家区域列表
  },
};
</script>
