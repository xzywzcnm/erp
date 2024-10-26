<template>
  <div class="mainBody">
    <template v-if="supplyShow == 'supplyOrder'">
      <div>
        <Form
          ref="searchCriteria"
          class="formSearch fmb16"
          :model="searchCriteria"
          inline
          :label-width="120"
        >
          <Tabs :value="tab" @on-click="tabEvent">
            <TabPane
              :label="labelFun(item)"
              :name="item.value"
              v-for="item in tablist"
              :key="item.value"
            ></TabPane>
          </Tabs>
          <dyt-filter class="platformParamsSelect">
            <FormItem label="备货类型:">
              <dyt-select v-model="searchCriteria.readyType" clearable>
                <Option
                  v-for="item in purchaseList"
                  :value="item.value"
                  :key="item.value"
                  >{{ item.label }}</Option
                >
              </dyt-select>
            </FormItem>
            <FormItem label="采购员:">
              <dyt-select
                v-model="searchCriteria.purchaserName"
                clearable
                filterable
                @on-change="searchForm"
              >
                <Option
                  v-for="(item, index) in purchaserArr"
                  :value="item.userId"
                  :key="index"
                  >{{ item.name }}
                </Option>
              </dyt-select>
            </FormItem>
            <FormItem label="下单时间:">
              <DatePicker
                transfer
                v-model="time0"
                type="datetimerange"
                format="yyyy-MM-dd HH:mm"
                placeholder="请选择"
                @on-change="pickDataChange"
                :value="[
                  searchCriteria.salesStartTime,
                  searchCriteria.salesEndTime,
                ]"
              >
              </DatePicker>
            </FormItem>
            <FormItem label="订单号:">
              <dyt-input-tag
                :limit="1"
                v-model="searchCriteria.purchaseNumberList"
                placeholder="多个用逗号或回车分开"
                type="textarea"
              ></dyt-input-tag>
            </FormItem>
            <FormItem label="供方货号:">
              <dyt-input-tag
                :limit="1"
                v-model="searchCriteria.supplierNoList"
                placeholder="多个用逗号或回车分开"
                type="textarea"
              ></dyt-input-tag>
            </FormItem>
            <FormItem label="SPU:">
              <dyt-input-tag
                :limit="1"
                v-model="searchCriteria.spuNoList"
                placeholder="多个用逗号或回车分开"
                type="textarea"
              >
              </dyt-input-tag>
            </FormItem>
            <FormItem label="SKU:">
              <dyt-input-tag
                :limit="1"
                v-model="searchCriteria.skuNoList"
                placeholder="多个用逗号或回车分开"
                type="textarea"
              >
              </dyt-input-tag>
            </FormItem>
            <FormItem label="超期状态:">
              <dyt-select v-model="searchCriteria.overdueStatus" clearable>
                <Option
                  v-for="item in overdueStatuslist"
                  :value="item.value"
                  :key="item.value"
                  >{{ item.label }}
                </Option>
              </dyt-select>
            </FormItem>
            <FormItem label="备货仓库:">
              <dyt-select
                v-model="searchCriteria.warehouseId"
                clearable
                filterable
              >
                <Option
                  v-for="item in supplyStockList"
                  :value="item.warehouseId"
                  :key="item.warehouseId"
                  >{{ item.warehouseName }}</Option
                >
              </dyt-select>
            </FormItem>
            <FormItem label="规格:">
              <dyt-input
                v-model="searchCriteria.specifications"
                placeholder="请输入"
              ></dyt-input>
            </FormItem>
            <FormItem label="供应商:" v-if="isdevelop">
              <dyt-select
                v-model="searchCriteria.supplierId"
                clearable
                filterable
              >
                <Option
                  v-for="item in supplyList"
                  :value="item.supplierId"
                  :key="item.supplierId"
                  >{{ item.supplierName }}</Option
                >
              </dyt-select>
            </FormItem>
            <FormItem label="要求收货时间:">
              <DatePicker
                transfer
                v-model="time1"
                type="datetimerange"
                format="yyyy-MM-dd HH:mm"
                placeholder="请选择"
                @on-change="pickSendChange"
                :value="[
                  searchCriteria.requireDespatchStartTime,
                  searchCriteria.requireDespatchEndTime,
                ]"
              ></DatePicker>
            </FormItem>
            <FormItem label="发货时间:">
              <DatePicker
                transfer
                v-model="time2"
                type="datetimerange"
                format="yyyy-MM-dd HH:mm"
                placeholder="请选择"
                @on-change="pickaleadySendChange"
                :value="[
                  searchCriteria.despatchStartTime,
                  searchCriteria.despatchEndTime,
                ]"
              ></DatePicker>
            </FormItem>
            <FormItem label="完成时间:">
              <DatePicker
                transfer
                v-model="time3"
                type="datetimerange"
                format="yyyy-MM-dd HH:mm"
                placeholder="请选择"
                @on-change="pickFinishChange"
                :value="[
                  searchCriteria.finishStartTime,
                  searchCriteria.finishEndTime,
                ]"
              >
              </DatePicker>
            </FormItem>
            <FormItem label="订单类型:">
              <dyt-select v-model="searchCriteria.orderType" clearable>
                <Option
                  v-for="item in orderTypelist"
                  :value="item.value"
                  :key="item.value"
                  >{{ item.label }}</Option
                >
              </dyt-select>
            </FormItem>
            <FormItem label="是否紧急:">
              <dyt-select v-model="searchCriteria.iscrash" clearable>
                <Option
                  v-for="item in urgentOrderlist"
                  :value="item.value"
                  :key="item.value"
                  >{{ item.label }}</Option
                >
              </dyt-select>
            </FormItem>
            <FormItem label="收货情况:">
              <dyt-select
                v-model="searchCriteria.receiveStatus"
                clearable
                @on-change="receiveChange"
              >
                <Option
                  v-for="item in recevieList"
                  :value="item.value"
                  :key="item.value"
                  >{{ item.label }}</Option
                >
              </dyt-select>
            </FormItem>
            <FormItem label="超发" prop="overshootStateList">
              <dyt-select v-model="searchCriteria.overshootStateList"  multiple :max-tag-count="1">
                <Option label="允许超发中" :value="1"></Option>
                <Option label="允许超发结束" :value="2"></Option>
              </dyt-select>
            </FormItem>
            <div slot="operation">
              <Button
                type="primary"
                @click="searchForm"
                :disabled="SearchDisabled"
                icon="ios-search"
                >查询</Button
              >
              <Button
                @click="resetForm"
                style="margin-left: 10px"
                v-once
                icon="md-refresh"
                >重置</Button
              >
            </div>
          </dyt-filter>
        </Form>
      </div>

      <div class="operatBtn mt10 mb10" style="display: flex">
        <div style="flex: 100">
          <Button
            class="mr10"
            type="primary"
            @click="urgentOrdermark()"
            :disabled="showUrgentMark"
            v-if="getPermission('supplierPurchase_urgentOrderSign')"
            >急单标记</Button
          >
          <Button
            class="mr10"
            type="primary"
            @click="residualCancel()"
            :disabled="showResidualCan"
            v-if="getPermission('supplierPurchase_cancelSurplus')"
            >剩余取消</Button
          >
          <Button
            class="mr10"
            type="primary"
            @click="deliverGoods()"
            :disabled="showDeliverGoods"
            v-if="getPermission('supplierPurchase_sendGoods')"
            >发货</Button
          >
          <Button
            class="mr10"
            type="primary"
            @click="supplyStatus()"
            :disabled="columnList.length == 0 ? true : isCansend"
            v-if="getPermission('supplierPurchase_changeSupplyState')"
            >供应状态变更</Button
          >
          <Button
            class="mr10"
            type="primary"
            @click="progressFeedback()"
            :disabled="showProgressFeedback"
            v-if="getPermission('supplierPurchase_orderStatusFeedback')"
            >订单进度反馈</Button
          >
          <Button
            class="mr10"
            type="primary"
            @click="confirmCancel()"
            :disabled="showLockGoods"
            v-if="getPermission('supplierPurchase_confirmShortage')"
            >确认少货</Button
          >
          <Dropdown
            class="mr10"
            @on-click="changedropdown"
            v-if="getPermission('supplierPurchase_print')"
          >
            <Button type="primary">
              选择打印项目
              <Icon type="ios-arrow-down"></Icon>
            </Button>
            <DropdownMenu slot="list">
              <DropdownItem name="1">打印条码</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <Dropdown
            class="mr10"
            @on-click="changeExport"
            v-if="getPermission('supplierPurchase_export')"
          >
            <Button type="primary" :loading="exportLoading">
              导出
              <Icon type="ios-arrow-down"></Icon>
            </Button>
            <DropdownMenu slot="list">
              <DropdownItem :name="1">导出选中</DropdownItem>
              <DropdownItem :name="2">导出所有</DropdownItem>
              <DropdownItem :name="3">导出选中生产资料</DropdownItem>
              <DropdownItem :name="4">导出所有生产资料</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <Button
            class="mr10"
            type="primary"
            @click="importOrder"
            v-if="getPermission('supplierPurchase_importFollowRemark')"
            >导入跟单备注</Button
          >
        </div>
        <div class="sortBox">
          <sort-by
            style="width: 300px; background-color: #f4f5f5"
            :sortData="sortData"
            @search_cli="sortFun"
          ></sort-by>
        </div>
      </div>

      <div class="table-box">
        <Table
          highlight-row
          :height="tableHeight"
          :columns="columns"
          :data="tableList"
          :border="true"
          :loading="Tableloading"
          @on-selection-change="selectChange"
          ref="iviewTable"
        >
          <template slot-scope="{ row, index }" slot="basic">
            <basicDataCom :dataRow="row">
              <div slot="picslot" class="cancel-text" v-if="row.status === 7">
                已取消
              </div>
              <a
                slot="link"
                class="alink"
                href="javascript:;"
                @click="seeOrder(row)"
                >{{ row.purchaseNumber || "-" }}</a
              >
              <Icon
                slot="order"
                type="md-checkbox-outline"
                class="ml10 iconSty"
                @click="checkSameorder(row, index)"
              />
              <Icon
                slot="sku"
                type="md-checkbox-outline"
                class="ml10 iconSty"
                @click="checkSamesku(row, index)"
              />
            </basicDataCom>
          </template>
          <template slot-scope="{ row }" slot="stock">
            <div>可用：{{ row.availableNumber }}</div>
            <div>未发：{{ row.onWayNoDespatchNumber }}</div>
            <div>在途：{{ row.onWayDespatchNumber }}</div>
          </template>
          <template slot-scope="{ row }" slot="threeNum">
            <div>下单：{{ row.salesNumber }}</div>
            <div style="line-height: 1.6em;">
              <span>{{ `超发：${row.overshootNumber || 0} ` }}</span>
              <Tooltip :transfer="true">
                <span
                  class="erp sps-huaban"
                  :style="`
                    font-size: 12px;
                    margin-left: 5px;
                    cursor: pointer;
                    display:${[1, '1', 2, '2'].includes(row.overshootState) ? 'inline-block' : 'none'};
                    color: ${[1, '1'].includes(row.overshootState) ? '#3cb034' : '#f30'}
                  `"
                ></span>
                <span slot="content">
                  {{ [1, '1'].includes(row.overshootState) ? '允许超发中...' : '允许超发结束' }}
                </span>
              </Tooltip>
            </div>
            <div>取消：{{ row.surplusQuantity }}</div>
            <div :class="row.lessGoodsQuantity === 0 ? '' : 'text-red'">
              少货：{{ row.lessGoodsQuantity }}
            </div>
          </template>
          <template slot-scope="{ row }" slot="salesTime">
            <span>{{
              getDataToLocalTime(row.salesTime, "fulltime", true)
            }}</span>
          </template>
          <template slot-scope="{ row }" slot="sendTime">
            <!-- <div style="width: 70px;">{{ intercepTime(row.requireDespatchTime) }}</div> -->
            <div style="width: 70px">
              {{
                getDataToLocalTime(row.requireDespatchTime, "fulltime", true)
              }}
            </div>
            <div class="devetime" v-if="overTime(row.status, row)">
              <Icon class="time-icon" type="ios-time-outline" />{{
                overTime(row.status, row)
              }}
            </div>
          </template>
          <template slot-scope="{ row }" slot="logistic">
            <div>
              发货单号：<a href="javascript:;" @click="seeSendetail(row)">{{
                row.supplierDespatchId || "-"
              }}</a>
            </div>
            <div>
              发货时间：{{
                getDataToLocalTime(row.despatchTime, "fulltime", true)
              }}
            </div>
            <div>
              完成时间：{{
                getDataToLocalTime(row.finishTime, "fulltime", true)
              }}
            </div>
          </template>
          <template slot-scope="{ row }" slot="deliver">
            <div>已发：{{ row.despatchNumber }}</div>
            <div>未发：{{ row.notDespatchNumber }}</div>
          </template>
          <template slot-scope="{ row }" slot="receive">
            <div>正品：{{ row.qualityNumber }}</div>
            <div>次品：{{ row.substandardNumber }}</div>
            <div>未收：{{ row.notReceivedNumber }}</div>
          </template>
          <template slot-scope="{ row }" slot="price">
            <div>
              原价：{{ row.supplierName == "*" ? "*" : row.suggestPrice }}
            </div>
            <div>单价：{{ row.supplierName == "*" ? "*" : row.unitPrice }}</div>
          </template>
          <template slot-scope="{ row }" slot="warehouse">
            <div>{{ row.warehouseName }}</div>
            <div>{{ row.purchaserName }}</div>
          </template>
          <template slot-scope="{ row, index }" slot="requireDespatch">
            <div>
              <div :title="row.requireDespatch" class="requireText">
                发货要求：{{ row.requireDespatch || "-" }}
              </div>
              <div :title="row.purchaserRemark" class="remarkText">
                需：{{ row.purchaserRemark || "-" }}
              </div>
              <div :title="row.supplierRemark" class="remarkText">
                供：{{ row.supplierRemark || "-" }}
              </div>
              <div
                :title="row.followRemark"
                class="remarkText"
                v-if="row.followRemark != null ? true : false"
              >
                跟：{{ row.followRemark || "-" }}
              </div>
              <div class="iconContent" @click="editRemark(row, index)">
                <div>
                  <Icon type="ios-create-outline" size="24" />
                </div>
                <div class="iconText">需方备注</div>
              </div>
            </div>
          </template>
          <template slot-scope="{ row }" slot="supplierName">
            <div>{{ row.supplierName }}</div>
          </template>
        </Table>
      </div>
      <div class="table-page-right">
        <Page
          :total="proPage.total"
          @on-change="proChangePage"
          show-total
          :page-size="proPage.pageSize"
          show-elevator
          :current="proPage.pageNum"
          show-sizer
          @on-page-size-change="proChangePageSize"
          placement="top"
          :page-size-opts="pageArray"
        ></Page>
      </div>
    </template>

    <transition name="bounce">
      <!-- 查看 -->
      <template v-if="supplyShow === 'showOrderDetail'">
        <div class="subLayer infoDetails">
          <div>
            <order-detail
              :dialogObj="dialogDetail"
              @goBack="goBack"
            ></order-detail>
          </div>
        </div>
      </template>
    </transition>

    <!-- 剩余取消 -->
    <surplus-stock :dialogObj="dialogObj" @fetch="search"></surplus-stock>
    <!-- 发货 -->
    <surplus-invoice :dialogObj="dialogSend" @fetch="search"></surplus-invoice>
    <!-- 供应商状态变更 -->
    <status-change :dialogObj="dialogStatus" @fetch="search"></status-change>
    <!-- 订单进度反馈 -->
    <progress-feeback
      :dialogObj="dialogFeedback"
      @fetch="search"
    ></progress-feeback>
    <!-- 订单条码打印 -->
    <print-barcode :dialogObj="dialogBarcode"></print-barcode>
    <!-- 订单详情 -->
    <!-- <order-detail :dialogObj="dialogDetail"></order-detail> -->
    <!-- 打印发货单 -->
    <print-shippingorder
      :dialogObj="dialogShippingorder"
      ref="printShippingorder"
    ></print-shippingorder>
    <!-- 查看发货单详情 -->
    <send-orderdetail
      :dialogObj="dialogOrderdetail"
      :isVisible.sync="isVisible"
      @printSend="printSend"
    >
    </send-orderdetail>
    <!-- 导出图片询问 -->
    <export-dialog
      :dialogObj="dialogExport"
      @dialogExportReturn="dialogExportReturn"
    ></export-dialog>
    <!-- 确认少货 -->
    <confirm-shortage
      :dialogObj="dialogConfirm"
      @fetch="search"
    ></confirm-shortage>
    <!-- 编辑备注 -->
    <edit-remark
      :dialogObj="dialogRemark"
      @fetch="search"
      @showItemRemark="showItemRemark"
    ></edit-remark>
    <!-- 导入跟单备注 -->
    <import-order-remark :dialogImport="dialogImport" @searchForm="searchForm">
    </import-order-remark>
  </div>
</template>

<script>
import qs from "qs";
import api from "@/api/api";
import pagemixin from "@/components/mixin/page_mixin";
import Mixin from "@/components/mixin/common_mixin";
import surplusStock from "./supplyOrder/surplusStock";
import surplusInvoice from "./supplyOrder/surplusInvoice";
import importOrderRemark from "./supplyOrder/importOrderRemark.vue";
import editRemark from "./supplyOrder/editRemark";
import statusChange from "./supplyOrder/statusChange";
import progressFeeback from "./supplyOrder/progressFeeback";
import printBarcode from "./supplyOrder/printBarcode";
import orderDetail from "./supplyOrder/orderDetail";
import SortBy from "@/components/SortBy";
import { fun_date } from "@/utils/comfun.js";
import {
  titleList,
  tablist,
  recevieList,
  purchaseList,
} from "./supplyOrder/configFile";
import printShippingorder from "./supplyOrdersend/printShippingorder";
import sendOrderdetail from "./supplyOrdersend/sendOrderdetail";
import exportDialog from "@/components/exportDialog";
import confirmShortage from "./supplyOrder/confirmShortage";
import { intercepTime } from "@/utils/comfun.js";
import basicDataCom from "./supplyOrder/basicDataCom";
import Qs from "qs";

export default {
  mixins: [pagemixin, Mixin],
  components: {
    surplusStock,
    surplusInvoice,
    editRemark,
    statusChange,
    progressFeeback,
    printBarcode,
    orderDetail,
    SortBy,
    printShippingorder,
    sendOrderdetail,
    exportDialog,
    confirmShortage,
    basicDataCom,
    importOrderRemark,
  },
  data() {
    return {
      tableHeight: this.getTableHeight(335),
      tab: "all",
      tablist: tablist,
      supplyShow: "supplyOrder",
      searchCriteria: {
        status: "",
        supplierNo: "",
        iscrash: "",
        salesStartTime: "",
        overshootStateList: [], // 允许超发
        salesEndTime: "",
        overdueStatus: "",
        readyType: "",
        requireDespatchStartTime: "",
        requireDespatchEndTime: "",
        // purchaseType: '',
        finishStartTime: "",
        finishEndTime: "",
        specifications: "",
        supplierId: "",
        orderType: "",
        purchaseNumberList: [],
        supplierNoList: [],
        skuNoList: [],
        spuNoList: [],
        orderBy: "",
        upDown: "",
        purchaserName: "",
        receiveStatus: 0,
        warehouseId: "",
        despatchStartTime: "",
        despatchEndTime: "",
        businessDeptIds: null, //事业部id
      },
      purchaserArr: [], // 采购人员
      orderSplit: "", // 订单号逗号回车分隔处理
      supplierSplit: "", // 供方号逗号回车分隔处理
      skuSplit: "", // sku逗号回车分隔处理
      spuSplit: "", // spu逗号回车分隔处理
      urgentOrderlist: {
        0: { label: "普通", value: 0 },
        1: { label: "紧急", value: 1 },
      },
      overdueStatuslist: {
        1: { label: "即将超期", value: 1 },
        2: { label: "已经超期", value: 2 },
      },
      orderTypelist: {
        1: { label: "供应商系统", value: 1 },
        2: { label: "1688系统", value: 2 },
        0: { label: "未对接系统", value: 0 },
      },
      purchaseList,
      supplyList: [],
      time0: [],
      time1: [],
      time2: [],
      time3: [],
      searchFilter: false,
      changeItemIndex: null,
      columns: titleList,
      dialogObj: {
        modelVisible: false,
        list: [],
      },
      dialogSend: {
        modelVisible: false,
        list: [],
      },
      dialogRemark: {
        modelVisible: false,
        list: {},
        purchaserRemark: "",
        requireDespatch: "",
        followRemark: "",
      },
      dialogStatus: {
        modelVisible: false,
        list: [],
      },
      dialogFeedback: {
        modelVisible: false,
        list: [],
      },
      dialogBarcode: {
        modelVisible: false,
        list: [],
      },
      dialogDetail: {
        // modelVisible: false,
        data: {},
        supplyList: {},
      },
      dialogShippingorder: {
        data: {},
      },
      dialogOrderdetail: {
        source: null, // 代表由哪个页面调用此组件 0代表供应商订单管理，1代表供应商发货单列表，2代表采购单-采购单详情
        // modelVisible: false,
        data: {},
      },
      dialogConfirm: {
        modelVisible: false,
        list: [],
      },
      dialogExport: {
        modelVisible: false,
        data: {},
      },
      dialogImport: {
        modelVisible: false,
        data: {},
      },
      exportLoading: false,
      orderDetail: false,
      checkOrderlist: [],
      checkSkulist: [],
      sortData: [
        {
          label: "下单时间",
          value: "salesTime",
          checked: true,
          toogle: "down",
        },
        {
          label: "要求收货时间",
          value: "requireDespatchTime",
          checked: false,
          toogle: "down",
        },
      ],
      isdevelop: false,
      recevieList: recevieList,
      supplyStockList: [],
      purchaserRemark: "",
      requireDespatch: "",
      followRemark: "",
      labelFun: (data) => {
        return (h) => {
          return h("div", [
            h("span", data.label),
            h(
              "span",
              data.value == this.tab
                ? { style: { color: "#2d8cf0" } }
                : { style: { color: "red" } },
              data.num || data.num == 0 ? `(${data.num})` : ""
            ),
          ]);
        };
      },
      isVisible: false,
    };
  },

  watch: {},

  created() {
    this.initAssign();
    this.isDeveloper();
    this.getPurchaserArr();
    this.getSupplyStocklist();
    this.getStatusCount();
    this.fetch(api.orderInfo_list, "post", "supplierPurchase_check").then(
      () => {
        this.columns[1].title = `基本信息（订单数：${
          this.tableList.length ? this.tableList[0].allPurchaseNumber : 0
        }）`;
      }
    );
  },
  /* deactivated () {
    this.dialogDetail.modelVisible = false;
  }, */
  computed: {
    authUserInfo() {
      return this.$store.getters["authUserInfo"];
    },
    // 是否为线下订单 --供应状态变更
    isCansend() {
      let columns = this.columnList;
      let online = false;
      columns.forEach((k) => {
        if (k.orderType === 1) {
          online = true;
        }
      });
      return online;
    },
    //急单标记 订单状态status 是否为 0-待确认，1-待发货，2-加入发货台
    showUrgentMark() {
      let selectedList = this.columnList;
      let isDisabled = false;
      if (selectedList.length != 0) {
        isDisabled = selectedList.every(function (item, index, array) {
          return [0, 1, 2].includes(item.status);
        });
      }
      return !isDisabled;
    },
    //剩余取消 订单状态status 是否为 0-待确认，1-待发货
    showResidualCan() {
      let selectedList = this.columnList;
      let isDisabled = false;
      if (selectedList.length != 0) {
        isDisabled = selectedList.every(function (item, index, array) {
          return [0, 1].includes(item.status);
        });
      }
      return !isDisabled;
    },
    //发货  订单类型orderType 是否为 0-线下； 订单状态status 1-待发货
    showDeliverGoods() {
      let selectedList = this.columnList;
      let isDisabled = false;
      if (selectedList.length != 0) {
        isDisabled = selectedList.every(function (item, index, array) {
          return item.orderType == 0 && item.status == 1;
        });
      }
      return !isDisabled;
    },
    //供应状态变更  订单类型orderType 是否为 1-线下
    /* showSupplyStatus() {
      let selectedList = this.columnList;
      let isDisabled = false;
      if(selectedList.length!=0) {
        isDisabled = selectedList.every(function(item, index, array) {
          return item.orderType == 1;
        });
      }
      console.log(isDisabled,111);
      return !isDisabled;
    }, */
    //订单进度反馈 订单类型orderType 是否为 0-线下; 订单状态status 是否为 0-待确认，1-待发货
    showProgressFeedback() {
      let selectedList = this.columnList;
      let isDisabled = false;
      if (selectedList.length != 0) {
        isDisabled = selectedList.every(function (item, index, array) {
          return item.orderType == 0 && [0, 1].includes(item.status);
        });
      }
      return !isDisabled;
    },
    //确认少货 订单类型orderType 是否为 0-线下; 订单状态status 是否为 4-已发物流，5-收货中
    showLockGoods() {
      let selectedList = this.columnList;
      let isDisabled = false;
      if (selectedList.length != 0) {
        isDisabled = selectedList.every(function (item, index, array) {
          return [4, 5].includes(item.status);
        });
      }
      return !isDisabled;
    },
  },
  methods: {
    intercepTime,
    // 初始化赋值
    initAssign() {
      this.time0[0] = fun_date(-7)[0].slice(0, -8) + "00:00:00";
      this.searchCriteria.salesStartTime = this.time0[0];

      this.time0[1] = fun_date(-7)[1].slice(0, -8) + "23:59:59";
      this.searchCriteria.salesEndTime = this.time0[1];

      this.orderSplit = "";
      this.skuSplit = "";
      this.spuSplit = "";
      this.supplierSplit = "";
      this.searchCriteria.purchaseNumberList =
        this.searchCriteria.supplierNoList =
        this.searchCriteria.spuNoList =
        this.searchCriteria.skuNoList =
          [];

      this.searchCriteria.orderBy = this.sortData[0].value;
      this.searchCriteria.upDown = this.sortData[0].toogle;
      this.searchCriteria.status =
        this.tab && this.tab !== "all" ? this.tab - 0 : "";
    },
    // post请求
    axiosPost(reqParams) {
      let api = this.api;
      reqParams.businessDeptIds =
        this.authUserInfo.securityUser.businessDeptIds;
      if (Object.keys(this.searchFix).length)
        api += `?${Qs.stringify(this.searchFix)}`; //有后端要求将某参数放到url后面的要求
      return this.axios
        .post(api, reqParams)
        .then(({ data }) => {
          if (data.code == 0) {
            this.tableList = data.datas.list;
            this.proPage.total = data.datas.total;
          }
        })
        .finally(() => {
          this.Tableloading = false;
        });
    },
    // 查询表单
    searchForm() {
      this.search().then(() => {
        this.$refs.iviewTable.selectAll(false);
        this.columns[1].title = `基本信息（订单数：${
          this.tableList.length ? this.tableList[0].allPurchaseNumber : 0
        }）`;
        this.getStatusCount();
      });
    },
    clearSalesTime() {
      if (this.tab == 0 || this.tab == 1 || this.tab == 2 || this.tab == 5) {
        this.searchCriteria.salesStartTime = "";
        this.searchCriteria.salesEndTime = "";
        this.time0 = [];
      } else {
        this.searchCriteria.salesStartTime =
          fun_date(-7)[0].slice(0, -8) + "00:00:00";
        this.searchCriteria.salesEndTime =
          fun_date(-7)[1].slice(0, -8) + "23:59:59";
        this.time0 = [
          fun_date(-7)[0].slice(0, -8) + "00:00:00",
          fun_date(-7)[1].slice(0, -8) + "23:59:59",
        ];
      }
    },
    // 重置表单
    resetForm() {
      this.reset();
      this.initAssign();
      this.clearSalesTime();
      this.time1 = [];
      this.time2 = [];
      this.time3 = [];
    },
    // tab选项
    tabEvent(val) {
      this.tab = val || "all";
      this.searchCriteria.status = val === "all" ? "" : val - 0;
      this.clearSalesTime();
      this.searchForm();
    },
    // 高级选项
    toggleClick() {
      this.searchFilter = !this.searchFilter;
    },
    // 下单时间
    pickDataChange(e) {
      if (e[1]) {
        e[1] = e[1].slice(0, -6) + " 23:59";
      }
      this.time0 = e;
      this.searchCriteria.salesStartTime = e[0] ? e[0] + ":00" : "";
      this.searchCriteria.salesEndTime = e[1] ? e[1] + ":59" : "";
    },
    // 要求发货时间
    pickSendChange(e) {
      if (e[1]) {
        e[1] = e[1].slice(0, -6) + " 23:59";
      }
      this.time1 = e;
      this.searchCriteria.requireDespatchStartTime = e[0] ? e[0] + ":00" : "";
      this.searchCriteria.requireDespatchEndTime = e[1] ? e[1] + ":59" : "";
    },
    // 完成时间
    pickFinishChange(e) {
      if (e[1]) {
        e[1] = e[1].slice(0, -6) + " 23:59";
      }
      this.time3 = e;
      this.searchCriteria.finishStartTime = e[0] ? e[0] + ":00" : "";
      this.searchCriteria.finishEndTime = e[1] ? e[1] + ":59" : "";
    },
    // 发货时间
    pickaleadySendChange(e) {
      if (e[1]) {
        e[1] = e[1].slice(0, -6) + " 23:59";
      }
      this.time2 = e;
      this.searchCriteria.despatchStartTime = e[0] ? e[0] + ":00" : "";
      this.searchCriteria.despatchEndTime = e[1] ? e[1] + ":59" : "";
    },
    // 是否选中订单
    isCheckedList() {
      let columnList = this.columnList;
      if (!columnList.length) {
        this.$Message.error("请勾选订单~");
        return;
      }
    },
    // 急单标记
    urgentOrdermark() {
      let [columnList, values, okList, failList] = [
        this.columnList,
        false,
        [],
        [],
      ];
      if (!columnList.length) {
        this.$Message.error("请勾选订单~");
        return;
      }
      // 已发货，已取消的订单SKU不允许更改急单标识
      columnList.forEach((k) => {
        if (k.status < 4) {
          okList.push(k);
        } else {
          failList.push(k);
        }
      });
      if (failList.length) {
        this.$Message.warning(
          "已发货，已取消的订单SKU不允许更改急单标识，已帮你筛选~"
        );
      }
      if (!okList.length) {
        this.$Message.warning("暂无符合条件的订单~");
        return;
      }
      this.$Modal.confirm({
        render: (h) => {
          return h("div", [
            h(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "10px",
                },
              },
              [
                h("Icon", {
                  props: {
                    type: "ios-information-circle",
                  },
                  style: {
                    fontSize: "28px",
                    color: "#f90",
                  },
                }),
                h(
                  "div",
                  {
                    style: {
                      display: "inline-block",
                      verticalAlign: "middle",
                      marginLeft: "12px",
                      fontSize: "16px",
                      color: "#17233d",
                      fontWeight: 500,
                    },
                  },
                  "操作提示"
                ),
              ]
            ),
            h(
              "div",
              {
                style: {
                  marginLeft: "38px",
                  marginBottom: "10px",
                },
              },
              `确认是否要使用新的急单标识，数量：${okList.length}`
            ),
            h(
              "div",
              {
                style: {
                  marginLeft: "38px",
                },
              },
              [
                h("span", {}, "是否急单："),
                h("i-switch", {
                  props: {
                    value: values,
                  },
                  on: {
                    input: (val) => {
                      values = val;
                    },
                  },
                }),
              ]
            ),
          ]);
        },
        loading: true,
        onOk: () => {
          let params = { iscrash: values ? 1 : 0 };
          let idList = [];
          okList.forEach((k) => {
            idList.push(k.orderInfoGoodsId);
          });
          this.axios
            .post(api.urgentOrderSign + "?" + qs.stringify(params), idList)
            .then(({ data }) => {
              if (data.code == 0) {
                this.$Message.info("操作成功");
                this.search();
              }
            })
            .finally(() => {
              this.$Modal.remove();
            });
        },
      });
    },
    // 剩余取消
    residualCancel() {
      let columnList = this.columnList;
      if (!columnList.length) {
        this.$Message.error("请勾选订单~");
        return;
      }
      this.dialogObj.modelVisible = true;
      this.dialogObj.list = columnList;
    },
    // 发货
    deliverGoods() {
      let columnList = this.columnList;
      if (!columnList.length) {
        this.$Message.error("请勾选订单~");
        return;
      }
      let purchaseTypeArr = [];
      columnList.forEach((k) => {
        if (purchaseTypeArr.indexOf(k.readyType) == -1) {
          purchaseTypeArr.push(k.readyType);
        }
      });
      if (purchaseTypeArr.length > 1 && purchaseTypeArr.indexOf(0) != -1) {
        this.$Message.error("急采与备货不可以在同一个发货单里发货");
        return;
      }
      let compareArr = this.columnList.map(item => item.purchaseNumber);
      // 判断数组中的purchaseNumber值是否存在不一样的，如果不一样就发提示信息
      if (compareArr.some(val => val !== compareArr[0])) {
        this.$Message.error("相同采购单的商品才能一起发货");
        return;
      }
      this.dialogSend.modelVisible = true;
      this.dialogSend.list = columnList;
    },
    // 供应商状态变更
    supplyStatus() {
      let columnList = this.columnList;
      if (!columnList.length) {
        this.$Message.error("请勾选订单~");
        return;
      }
      this.dialogStatus.modelVisible = true;
      this.dialogStatus.list = columnList;
    },
    // 订单进度反馈
    progressFeedback() {
      let columnList = this.columnList;
      if (!columnList.length) {
        this.$Message.error("请勾选订单~");
        return;
      }
      this.dialogFeedback.modelVisible = true;
      this.dialogFeedback.list = columnList;
    },
    // 1:打印项目
    changedropdown(val) {
      if (!val) return;
      let columnList = this.columnList;
      if (!columnList.length) {
        this.$Message.error("请勾选订单~");
        return;
      }
      if (val == 1) {
        this.dialogBarcode.modelVisible = true;
        this.dialogBarcode.list = columnList;
      }
    },
    // 查看订单详情
    seeOrder(row) {
      if (!(this.getPermission("supplierPurchase_queryOrder") && row.purchaseNumber)) return;
      this.supplyShow = "showOrderDetail";
      // this.dialogDetail.modelVisible = true;
      this.dialogDetail.data = row;
    },
    overTime(status, row) {
      /**订单状态 0:待确认 1:待发货 2:加入发货台 3:待发物流 4:已发物流 5:收货中 6:收货完成 7:已取消*/
      if (!row.requireDespatchTime) return false;
      // 要求发货时间
      const comTime = new Date(
        this.getDataToLocalTime(row.requireDespatchTime, "fulltime", true)
      ).getTime();
      let endTime = null;
      const v = {
        s: 1000,
        mm: 1000 * 60,
        dayRage: 1000 * 60 * 60,
        hand: (time) => {
          if (!time) return false;
          endTime = new Date(
            this.getDataToLocalTime(time, "fulltime", true)
          ).getTime();
          const hours = (comTime - endTime) / v.dayRage;
          const minute = (comTime - endTime) / v.mm;
          const second = (comTime - endTime) / v.s;
          if (second > -60 && second < 60) {
            return hours < 0 ? `${second.toFixed(2)}s` : false;
          }
          if (minute > -60 && minute < 60) {
            return hours < 0 ? `${minute.toFixed(2)}m` : false;
          }
          return hours < 0 ? `${hours.toFixed(2)}h` : false;
        },
      };
      // 当状态处于未发货或未发货数量大于 0 时
      // if (status < 4 || row.notDespatchNumber > 0) {
      // 改为 收货完成后不提示 即将超期
      if (status < 6) {
        // 当状态为未完成时，如果要求收货时间大于当前时间，判断为逾期，逾期时间=要求收货时间-当前时间
        // 当状态为未完成时，如果要求收货时间大于完成时间，判断为逾期，逾期时间=要求收货时间-完成时间
        const finishTime = row.finishTime
          ? new Date(
            this.getDataToLocalTime(row.finishTime, "fulltime", true)
          ).getTime()
          : comTime;
        const nowTime =
          comTime > finishTime ? finishTime : new Date().getTime();
        const hours = (comTime - nowTime) / v.dayRage;
        const minute = (comTime - nowTime) / v.mm;
        const second = (comTime - nowTime) / v.s;
        if (second > -60 && second < 60) {
          return hours >= 0 && hours - 24 < 0
            ? "即将超期"
            : hours < 0
            ? `${second.toFixed(2)}s`
            : false;
        }
        if (minute > -60 && minute < 60) {
          return hours >= 0 && hours - 24 < 0
            ? "即将超期"
            : hours < 0
            ? `${minute.toFixed(2)}m`
            : false;
        }
        return hours >= 0 && hours - 24 < 0 ? "即将超期" : hours < 0 ? `${hours.toFixed(2)}h` : false;
      }
      // 当状态处于已发货或未收货，并且未发货数量为 0 时
      // if (row.notDespatchNumber == 0 && [4, 5].includes(status)) {
      //   return v.hand(row.despatchTime);
      // }
      // 当状态处于已收货时(当发货时间不为空时则取发货时间)
      // if ([6].includes(status)) {
      //   // if (!row.despatchTime && !row.finishTime) return false;
      //   // return v.hand(row.despatchTime || row.finishTime);
      //   if (!row.finishTime) return false;
      //   return v.hand(row.finishTime);
      // }
      // 当状态处于已取消时
      if ([7].includes(status)) {
        return v.hand(row.cancelTime);
      }
      return false;
    },
    // 选中相同的订单
    checkSameorder(row) {
      this.tableList.forEach((k, i) => {
        if (k.purchaseId === row.purchaseId) {
          this.$refs.iviewTable.toggleSelect(i);
        }
      });
    },
    // 选中相同的sku
    checkSamesku(row) {
      this.tableList.forEach((k, i) => {
        if (k.skuNo === row.skuNo) {
          this.$refs.iviewTable.toggleSelect(i);
        }
      });
    },
    // 状态
    statusText(status) {
      let name = "";
      this.tablist.forEach((k) => {
        if (k.value !== "all" && k.value - 0 === status) {
          name = k.label;
        }
      });
      return name;
    },
    // 判断登录账号是否为商品开发员
    isDeveloper() {
      this.axios.post(api.isDeveloper).then(({ data }) => {
        this.isdevelop = data.datas;
        if (!data.datas) return;
        this.getSupplierFn();
      });
    },
    // 供应商下拉列表(筛选状态为3的供应商：审批状态（1待提交，2待审核，3已审核，4已停用）)
    getSupplierFn() {
      this.axios.get(api.queryIdAndName).then(({ data }) => {
        if (data.code == 0) {
          let list = data.datas || [];
          let [arr, obj] = [[], {}];
          list.forEach((k) => {
            if (k.auditStatus === 3) {
              arr.push(k);
              obj[k.supplierId] = k;
            }
          });
          this.supplyList = arr;
          this.dialogDetail.supplyList = obj;
        }
      });
    },
    // 采购人员列表
    getPurchaserArr() {
      let v = this;
      v.axios.get(api.userList).then((res) => {
        if (res.data.code == 0) {
          let arr = [];
          let datas = res.data.datas;
          for (let i in datas) {
            if (i != "service") {
              arr.push({
                userId: datas[i].userId,
                name: datas[i].userName,
              });
            }
          }
          v.purchaserArr = arr;
        }
      });
    },
    // 排序
    sortFun(row) {
      this.searchCriteria.orderBy = row.value;
      this.searchCriteria.upDown = row.toogle;
      this.fetch();
    },
    // 查看发货单详情
    seeSendetail(row) {
      if (
        !(
          this.getPermission("supplierPurchase_queryInvoice") &&
          row.supplierDespatchId
        )
      )
        return;
      this.dialogOrderdetail.source = 0;
      // this.dialogOrderdetail.modelVisible = true;
      this.dialogOrderdetail.data = row;
      this.isVisible = true;
    },
    // 打印发货单
    printSend(row) {
      this.dialogShippingorder.data = row;
      this.$refs.printShippingorder.open();
    },
    receiveChange(e) {
      this.searchCriteria.receiveStatus = e || 0;
    },
    // 确认少货
    confirmCancel() {
      let columnList = this.columnList;
      if (!columnList.length) {
        this.$Message.error("请勾选订单~");
        return;
      }
      this.dialogConfirm.modelVisible = true;
      this.dialogConfirm.list = columnList;
    },
    // 导出
    changeExport(e) {
      if ((e === 1 || e == 3) && !this.columnList.length) {
        this.$Message.error("请勾选要导出的订单~");
        return;
      }
      if(e == 1 || e == 2) {
        this.dialogExport.modelVisible = true;
        this.dialogExport.type = e;
        this.dialogExport.title = e === 1 ? "导出选中" : "导出所有";
        this.dialogExport.len =
          e === 1 ? this.columnList.length : this.proPage.total;
      } else {
        // 导出生产资料
        this.exportManufactureMeans(e)
      }
    },
    dialogExportReturn(type) {
      if (this.dialogExport.type === 1) {
        this.partExport(type);
      } else {
        this.allExport(type);
      }
    },
    // 导出选中
    partExport(type) {
      let temp = {};
      let orderInfoGoodsId = this.columnList.map((k) => {
        return k.orderInfoGoodsId;
      });
      temp.isExportImage = type;
      temp.purchaseIds = orderInfoGoodsId;
      temp.businessDeptIds = this.authUserInfo.securityUser.businessDeptIds;
      this.exportLoading = true;
      this.axios
        .post(api.exportByIds, temp)
        .then(({ data }) => {
          if (data.code == 0) {
            this.$Message.success("导出成功");
            this.$refs.iviewTable.selectAll(false);
          }
        })
        .finally((err) => {
          this.exportLoading = false;
        });
    },
    // 导出所有
    allExport(type) {
      let temp = { ...this.searchCriteria, isExportImage: type };
      temp.businessDeptIds = this.authUserInfo.securityUser.businessDeptIds;
      this.exportLoading = true;
      this.axios
        .post(api.exportByall, temp)
        .then(({ data }) => {
          if (data.code == 0) {
            this.$Message.success("导出成功");
          }
        })
        .finally((err) => {
          this.exportLoading = false;
        });
    },
    // 导出生产资料
    exportManufactureMeans(type) {
      //  type 3为选中，4为所有
      let temp = {}
      if(type === 3) {
        let orderInfoGoodsId = this.columnList.map((k) => {
          return k.orderInfoGoodsId;
        });
        temp.orderInfoGoodsIdList = orderInfoGoodsId;
        temp.orderBy = this.searchCriteria.orderBy
      } else {
        temp = this.$common.copy(this.searchCriteria)
      }
      temp.businessDeptIds = this.authUserInfo.securityUser.businessDeptIds;
      this.exportLoading = true;
      this.axios
        .post(api.exportManufactureMeans, temp)
        .then(({ data }) => {
          if (data.code == 0) {
            this.$Message.success("导出成功");
          }
        })
        .finally((err) => {
          this.exportLoading = false;
        });
    },
    getSupplyStocklist() {
      let { merchantId } = this.$store.state.userInfo;
      this.axios
        .get(api.getWarehouseInfo, { params: { merchantId } })
        .then(({ data }) => {
          if (data.code == 0) {
            this.supplyStockList = data.datas || [];
          }
        });
    },
    editRemark(row, index) {
      this.changeItemIndex = index;
      this.dialogRemark.modelVisible = true;
      this.dialogRemark.list = row;
      this.dialogRemark.purchaserRemark = row.purchaserRemark;
      this.dialogRemark.requireDespatch = row.requireDespatch;
      this.dialogRemark.followRemark = row.followRemark;
    },
    showItemRemark(temp) {
      //purchaseNumber订单号
      let list = this.tableList;
      let index = this.changeItemIndex;
      list.filter((k) => {
        if (k.purchaseNumber == list[index].purchaseNumber) {
          return (k.requireDespatch = temp.requireDespatch);
        }
      });
      list[index].purchaserRemark = temp.purchaserRemark;
      list[index].followRemark = temp.followRemark;
      // list[index].requireDespatch = temp.requireDespatch;
    },
    //获取统计状态数量
    getStatusCount() {
      this.axios.post(api.getStatusCount).then(({ data }) => {
        let list = this.tablist;
        let datas = data.datas;
        if (data.code == 0) {
          list[1].num = datas.decidedCount;
          list[2].num = datas.deliveryCount;
          list[3].num = datas.shippingTableCount;
          list[6].num = datas.receiptCount;
        }
      });
    },
    goBack() {
      this.supplyShow = "supplyOrder";
    },
    importOrder() {
      this.dialogImport.modelVisible = true;
    },
  },
};
</script>
<style scoped>
.devetime {
  color: #ed4014;
}

.devetime .time-icon {
  font-size: 16px;
  font-weight: bold;
}

.cancel-text {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  color: #fff;
  background-color: rgba(105, 104, 104, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
}

.text-red {
  color: red;
}

.requireText {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

.remarkText {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.iconContent {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.iconText {
  background-color: #eee;
  color: #00bfff;
}

.modalDirection >>> .ivu-modal-wrap {
  top: 230px;
}

.textareaContent {
  display: flex;
  margin: 20px 10px;
}

.supplierRemarkText {
  margin: 20px 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.textareaBox {
  width: 400px;
  height: 60px;
  padding: 10px;
}

.textareaTips {
  margin-left: 10px;
  color: #ccc;
  display: flex;
  justify-content: center;
  align-items: center;
}

.sortBox >>> .grayBg {
  margin: 0 !important;
  padding: 0;
}
</style>