<template>
  <div>
    <div class="tabContent">
      <div class="flexBox payment commonFilter">
        <Tabs v-model="tabsValue" @on-click="changeTab">
          <TabPane label="全部" name="-1"></TabPane>
          <TabPane
            :label="item.label"
            :name="item.value"
            v-for="item in tabStatusArr"
            :key="item.value"
          ></TabPane>
        </Tabs>
      </div>
      <div class="card-container">
        <div class="card-content" style="padding-top: 8px">
          <div class="platformParamsSelect">
            <Form ref="pageParams" :model="pageParams" :label-width="100">
              <dyt-filter>
                <FormItem label="下单日期">
                  <DatePicker
                    transfer
                    style="width: 100%"
                    type="datetimerange"
                    @on-clear="resetDate"
                    @on-change="getDateValue"
                    :clearable="clearAble"
                    :value="[
                      pageParams.orderStartTime,
                      pageParams.orderEndTime,
                    ]"
                    format="yyyy-MM-dd HH:mm"
                    placement="bottom-end"
                    placeholder="选择日期"
                    v-model="payTimeArr"
                  />
                </FormItem>
                <FormItem label="采购单号">
                  <dyt-input-tag
                    :limit="1"
                    v-model="pageParams.purchaseNumberList"
                    type="textarea"
                    placeholder="请输入（多个用逗号或者回车分开）"
                  />
                </FormItem>
                <FormItem label="供应商" prop="supplierId">
                  <dyt-select
                    v-model="pageParams.supplierId"
                    clearable
                    filterable
                  >
                    <Option :value="-1">全部</Option>
                    <Option
                      v-for="(item, index) in supplierArr"
                      :disabled="item.purchaseWarehouseStatus === '1'"
                      :value="item.supplierId"
                      :key="index"
                      >{{ item.supplierName }}</Option
                    >
                  </dyt-select>
                </FormItem>
                <FormItem label="申请人" prop="applyId">
                  <dyt-select
                    ref="developerSelect"
                    v-model="pageParams.applyId"
                    filterable
                    clearable
                  >
                    <Option :value="-1">全部</Option>
                    <Option
                      v-for="(item, index) in developerArr"
                      :value="item.id"
                      :key="index"
                      >{{ item.name }}</Option
                    >
                  </dyt-select>
                </FormItem>
                <FormItem label="外部流水号">
                  <dyt-input-tag
                    :limit="1"
                    v-model="pageParams.externalSerialNoList"
                    type="textarea"
                    placeholder="请输入（多个用逗号或者回车分开）"
                  />
                </FormItem>
                <FormItem label="退款单类型" prop="paymentType">
                  <dyt-select v-model="pageParams.paymentType" clearable>
                    <Option
                      :value="item.value"
                      v-for="item in paymentTypeArr"
                      :key="item.value"
                      >{{ item.label }}
                    </Option>
                  </dyt-select>
                </FormItem>
                <FormItem label="申请单号">
                  <dyt-input-tag
                    :limit="1"
                    v-model="pageParams.paymentNumberList"
                    type="textarea"
                    placeholder="请输入（多个用逗号或者回车分开）"
                  />
                </FormItem>
                <FormItem label="结算方式" prop="settlementType">
                  <dyt-select
                    ref="developerSelect"
                    v-model="pageParams.settlementType"
                    filterable
                    clearable
                  >
                    <Option :value="-1">全部</Option>
                    <Option
                      v-for="(item, index) in settlementTypeArr"
                      :value="item.value"
                      :key="`settlementTypeArr` + index"
                      >{{ item.label }}</Option
                    >
                  </dyt-select>
                </FormItem>
                <FormItem label="供应商支付方式" prop="payType">
                  <dyt-select
                    ref="developerSelect"
                    v-model="pageParams.payType"
                    filterable
                    clearable
                  >
                    <Option :value="-1">全部</Option>
                    <Option
                      v-for="(item, index) in payTypeArr"
                      :value="item.value"
                      :key="`payTypeArr` + index"
                      >{{ item.label }}</Option
                    >
                  </dyt-select>
                </FormItem>
                <FormItem label="申请金额范围" class="startEndPayAmount">
                  <InputNumber v-model="pageParams.startPayAmount" />
                  <span style="padding: 0 5px">至</span>
                  <InputNumber
                    v-model="pageParams.endPayAmount"
                    :min="pageParams.startPayAmount"
                  />
                </FormItem>
                <FormItem
                  label="状态"
                  prop="paymentStatusList"
                  v-if="tabsValue == -1"
                >
                  <dyt-select
                    v-model="pageParams.paymentStatusList"
                    :max-tag-count="1"
                    clearable
                    multiple
                  >
                    <Option
                      v-for="(item, index) in tabStatusArr"
                      :value="item.value"
                      :label="item.label"
                      :key="index"
                    >
                      {{ item.label }}</Option
                    >
                  </dyt-select>
                </FormItem>
                <FormItem label="所属事业部" prop="businessDeptId">
                  <dyt-select
                    v-model="pageParams.businessDeptId"
                    :max-tag-count="1"
                    clearable
                  >
                    <Option
                      v-for="item in businessDeptInfoList"
                      :key="item.id"
                      :label="item.name"
                      :value="item.id"
                    ></Option>
                  </dyt-select>
                </FormItem>
                <div slot="operation">
                  <Button
                    type="primary"
                    @click="search"
                    :disabled="SearchDisabled"
                    icon="ios-search"
                    >查询</Button
                  >
                  <Button
                    @click="reset"
                    style="margin-left: 10px"
                    v-once
                    icon="md-refresh"
                    >重置</Button
                  >
                </div>
              </dyt-filter>
            </Form>
          </div>
        </div>
      </div>
    </div>
    <div class="flexBox spaceBetween" style="margin-bottom: 10px">
      <div class="tableControl">
        <Button
          type="primary"
          v-if="tabsValue === '0'"
          class="iconbuttons"
          style="margin-left: 12px"
          @click="toCheck"
        >
          审核通过
        </Button>
        <Button
          type="primary"
          v-if="
            tabsValue === '1' &&
            getPermission('purchaseRefundInfo_batchConfirm')
          "
          class="iconbuttons"
          style="margin-left: 12px"
          @click="batchConfirmThePayment"
        >
          确认退款
        </Button>

        <!-- <Button type="primary" v-if="(tabsValue === '1' || tabsValue === '2') && getPermission('purchasePaymentInfo_export')"  class="iconbuttons" style="margin-left: 12px" @click="exportMt">
            Excel导出
        </Button> -->
        <!-- <Button
          type="primary"
          v-if="tabsValue === '0' || tabsValue === '1'"
          class="iconbuttons"
          style="margin-left: 12px"
          @click="cancelPay(2)"
        >
          取消退款
        </Button> -->
        <Dropdown @on-click="exportMt" v-if="tabsValue !== '3'">
          <Button type="primary" style="margin-left: 12px"
            ><span class="icon iconfont" style="font-size: 12px">&#xe639;</span>
            Excel导出
            <Icon type="md-arrow-dropdown"></Icon>
          </Button>
          <DropdownMenu slot="list">
            <DropdownItem name="0">导出选中数据</DropdownItem>
            <DropdownItem name="1">导出所有结果集</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
      <div style="margin-right: 20px">
        <span>排序方式：</span>
        <Button-group>
          <Button
            :type="item.checked ? 'primary' : 'default'"
            v-for="item in sortData"
            @click="clickSortButton(item)"
            :key="item.value"
            >{{ item.label }}
            <Icon type="md-arrow-up" v-if="item.checked && !item.toogle"></Icon>
            <Icon
              type="md-arrow-down"
              v-if="item.checked && item.toogle"
            ></Icon>
          </Button>
        </Button-group>
      </div>
    </div>
    <div class="flexBox commonFilter payment paymentRequest">
      <keep-alive>
        <Table
          highlight-row
          border
          :height="tableHeight"
          :loading="Tableloading"
          :columns="column1"
          :data="data1"
          @on-selection-change="checkData"
        >
          <template slot-scope="{ row }" slot="relatedImageList">
            <div style="display: flex; flex-wrap: wrap">
              <div
                v-for="(item, index) in row.relatedImageList"
                :key="index"
                style="margin-right: 5px; margin-bottom: 5px"
              >
                <large-picture :url="item || row.thumbUrl" imageHigh="60px">
                  <slot name="picslot"></slot>
                </large-picture>
              </div>
            </div>
          </template>
        </Table>
      </keep-alive>
    </div>
    <div class="table-page">
      <div class="table-page-right">
        <Page
          :total="total"
          @on-change="changePage"
          show-total
          :page-size="pageParams.pageSize"
          show-elevator
          :current="pageParams.pageNum"
          show-sizer
          @on-page-size-change="changePageSize"
          placement="top"
          :page-size-opts="pageArray"
        ></Page>
      </div>
    </div>

    <!-- 采购单详情 -->
    <transition name="bounce">
      <!-- 查看 -->
      <template v-if="isToPurDetail">
        <div class="subLayer infoDetails">
          <div>
            <!-- <purchase-detail :dialogObj="dialogDetail" :purchaserArrT="purchaserArr" @getList="getList" @goBackFromAdd="goBackFromAdd" @addOrderGoBack="addOrderGoBack" :orderData="orderData" :editType="editType" :purchaseOrderIds="purchaseOrderIds" :showType="showType"></purchase-detail> -->
            <refundDetail
              :dialogObj="dialogDetail"
              :isToPurDetail.sync="isToPurDetail"
            ></refundDetail>
          </div>
        </div>
      </template>
    </transition>
  </div>
</template>

<script>
import api from "@/api/api";
import Mixin from "@/components/mixin/common_mixin";
// import filterColumns from '@/components/common/filterColumns';
import pagemixin from "@/components/mixin/page_mixin";
import { fun_date } from "@/utils/comfun.js";
import refundDetail from "../../purchaseManagement/supplyOrder/refundDetail.vue";
import largePicture from "@/components/largePicture";
export default {
  name: "PaymentRequest",
  mixins: [Mixin, pagemixin],
  components: { refundDetail, largePicture },
  data() {
    // let v = this;
    // let end = new Date();
    // let start = new Date();
    // start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
    return {
      tableHeight: this.getTableHeight(335),
      filterName: "payment_1",
      orderColumn: [],
      searchValue: [],
      total: 0,
      data: [],
      tabsValue: "-1",
      checkedData: [],
      payMethodArr: [],
      bankArr: [],
      data1: [],
      clearAble: true,
      developerArr: [],
      payTimeArr: [],
      pageParams: {
        applyId: -1, //  申请人ID
        endPayAmount: null, // 付款金额区间结束，初始值为null
        orderEndTime: fun_date(-7)[1].slice(0, -8) + "23:59:59", // 下单结束时间 ,
        orderStartTime: fun_date(-7)[0].slice(0, -8) + "00:00:00", // 下单开始时间 ,
        paymentStatus: 1, // 付款状态(1:待付款2:已付款3:已取消)
        paymentType: -1, //  付款单类型(1:网络采购自动生成2:转账申请付款) ,
        purchasePaymentInfoIdList: [], // 采购单付款信息ID ,
        pageNum: 1,
        pageSize: 10,
        startPayAmount: 0, // 付款金额区间开始，初始值为0
        supplierId: -1, //  供应商ID
        searchValueList: [],
        externalSerialNoList: [],
        settlementType: -1, //结算方式
        payType: -1, //供应商支付方式
        paymentNumberList: [], //申请单号
        // 'externalSerialNo': [], //外部流水号
        purchaseNumberList: [], //采购单号
        upDown: "",
        orderBy: "",
        paymentStatusList: [], //付款状态
        businessDeptIds: null,
        applyType: 1,
        businessDeptId: "",
      },
      supplierArr: [],
      purchasePaymentInfoId: "",
      purchaseNumber: "",
      cancelRemark: "",
      searchValueList: [],
      // externalSerialNoList: [],
      selfOperateArr: [],
      settlementTypeArr: [
        { value: "02", label: "款到发货" },
        { value: "04", label: "到期结算" },
        { value: "01", label: "货到付款" },
      ],
      payTypeArr: [
        { value: "01", label: "现金" },
        { value: "02", label: "银行转账" },
        { value: "03", label: "PayPal" },
        { value: "04", label: "支付宝" },
      ],
      tabStatusArr: [
        { value: "0", label: "待审核" },
        { value: "1", label: "待退款" },
        { value: "2", label: "已退款" },
        { value: "3", label: "已取消" },
      ],
      paymentTypeArr: [
        { value: -1, label: "全部" },
        { value: 1, label: "网络采购" },
        { value: 2, label: "转账申请" },
      ],
      sortData: [
        {
          label: "下单时间",
          value: "orderTime",
          checked: true,
          toogle: true,
        },
        {
          label: "申请时间",
          value: "createTime",
          checked: false,
          toogle: true,
        },
      ],
      cacheClickVal: "order",
      isToPurDetail: false, //跳转至 采购单详情 标识
      dialogDetail: {
        modelVisible: false,
        data: {},
        supplyList: {},
      },
      //标签样式
      statuStyle: {
        primary: {
          color: "#2D8CF0",
          backgroundColor: "rgba(45, 140, 240, .1)",
        },
        error: { color: "#EB2F96", backgroundColor: "rgba(235, 47, 150, .1)" },
        success: { color: "#3CB034", backgroundColor: "rgba(60, 176, 52, .1)" },
        warnning: {
          color: "#FF9E20",
          backgroundColor: "rgba(255, 158, 32, .1)",
        },
        info: { color: "#5D7092", backgroundColor: "rgba(93, 112, 146, 0.1)" },
        textRed: { color: "red", backgroundColor: "rgba(235, 47, 150, .1)" },
        textBlack: {
          color: "black",
          backgroundColor: "rgba(255, 215, 0, 0.8)",
        },
      },
      column1: [],
      businessDeptInfoList: [],
    };
  },
  created() {
    this.payType();
    this.pageParams.pageSize = this.getPageSizeCache();
    this.getTableColumn();
    this.getBankList().then(() => {
      this.getSupplier(); // 获取供应商
      this.getDeveloperArr(); // 获取申请人
      this.search();
    });
    this.resetTime();
    this.getBusinessDeptInfo();
  },
  watch: {
    tabsValue(value) {
      this.checkedData = [];
      this.filterName = "payment_" + value;
    },
  },
  computed: {
    authUserInfo() {
      return this.$store.getters["authUserInfo"];
    },
  },
  methods: {
    changePage(page) {
      let v = this;
      v.pageParams.pageNum = page;
      v.getList();
    },
    changePageSize(val) {
      this.setPageSizeCache(val);
      this.pageParams.pageSize = +val;
      this.getList();
    },
    checkData(data) {
      this.checkedData = data;
    },
    payType() {
      let v = this;
      v.axios
        .get(api.baseDataList + "?dataType=" + "paymentType")
        .then((res) => {
          if (res.data.code == 0) {
            v.payMethodArr = res.data.datas;
          }
        });
    },
    getBankList() {
      let v = this;
      return new Promise((resolve) => {
        v.axios
          .get(api.baseDataList + "?dataType=" + "bank")
          .then((res) => {
            if (res.data.code == 0) {
              v.bankArr = res.data.datas;
            }
            resolve();
          })
          .catch(() => {
            resolve();
          });
      });
    },
    batchConfirmThePayment() {
      let v = this;
      // 批量确定付款
      if (v.checkedData.length < 1) {
        v.$Message.error("未选择数据");
        return;
      }
      v.axios
        .put(
          api.put_refundBatchConfirm +
            "?purchasePaymentInfoIdList=" +
            v.checkedData.map((i) => i.purchasePaymentInfoId).join(",") +
            "&&applyType=1"
        )
        .then((res) => {
          if (res.data.code === 0) {
            v.$Message.success("操作成功");
            v.getList();
          }
        });
    },
    batch1688Payment(typeVal) {
      this.payMt(1, typeVal);
    },
    batch1688KPayment(typeVal) {
      this.payMt(2, typeVal);
    },
    payMt(value, typeVal) {
      let v = this;
      let currentData = typeVal === "self" ? v.selfOperateArr : v.checkedData;
      if (currentData.length < 1) {
        // 没选择数据
        v.$Message.error("未选择数据");
        return;
      }
      // 必须有支付方式，必须有支付账号，支付账号必须相同，支付方式必须相同，才能提交
      let hasPayInfo = true;
      currentData.forEach((item) => {
        // item.payType=null 没有支付方式；item.paymentAccount=null 没有支付账号
        if (item.payType === null || item.paymentAccount === null) {
          hasPayInfo = false;
        }
      });
      if (!hasPayInfo) {
        v.$Message.error("请选择相同1688买家账号的采购单");
        return;
      }
      let diffPayInfo = currentData.some((item) => {
        // 只要有一个不相同返回true，没有就返回false
        return (
          item.payType !== currentData[0].payType &&
          item.paymentAccount !== currentData[0].paymentAccount
        );
      });
      if (diffPayInfo) {
        v.$Message.error("请选择相同1688买家账号的采购单");
        return;
      }
      let arr = [];
      currentData.forEach((item) => {
        item.rueryPurchasePaymentRelatedResultList.forEach((i) => {
          let obj = {};
          obj.purchaseId = i.purchaseId;
          arr.push(obj);
        });
      });
      v.axios
        .post(api.post_paymentUrl, {
          paymentLinkType: value,
          purchaseIdList: arr.map((i) => i.purchaseId),
        })
        .then((res) => {
          if (res.data.code === 0) {
            window.open(res.data.datas);
            v.$Modal.confirm({
              title: "付款结果",
              content: "您是否已经完成了付款？",
              okText: "付款成功",
              cancelText: "付款失败",
              onOk() {
                v.batchConfirmThePayment();
              },
            });
          }
        });
    },
    exportFn(obj) {
      let v = this;
      let reqParams = this.$common.copy(v.pageParams);
      for (let k in reqParams) {
        if (reqParams[k] == -1) {
          reqParams[k] = null;
        }
      }
      // reqParams.paymentStatus = v.tabsValue;
      this.$set(reqParams, "exportId", v.tabsValue == -1 ? 0 : v.tabsValue);
      v.axios.post(api.export_purchaseRefundInfo, reqParams).then((res) => {
        if (res.data.code === 0) {
          v.$Message.success("操作成功");
        }
      });
    },
    exportMt(name) {
      let v = this;
      v.pageParams.purchasePaymentInfoIdList = [];
      if (name === "0") {
        // 选中
        if (v.checkedData.length < 1) {
          v.$Message.error("未选择数据");
          return;
        }
        v.checkedData.forEach((item) => {
          v.pageParams.purchasePaymentInfoIdList.push(
            item.purchasePaymentInfoId
          );
        });
        v.exportFn();
      } else {
        // 全部
        if (v.data1.length === 0) {
          v.$Message.warning({
            content: "无数据导出",
            duration: 5,
          });
          return;
        }
        v.exportFn();
      }
    },
    confirmThePayment() {
      let v = this;
      v.axios
        .put(
          api.put_purchaseRefundInfo +
            "/" +
            v.selfOperateArr[0].purchasePaymentInfoId +
            "?applyType=1"
        )
        .then((res) => {
          if (res.data.code === 0) {
            v.$Message.success("操作成功");
            v.getList();
          }
        });
    },
    cancellationOfPayment() {
      let v = this;
      v.axios
        .put(api.purchaseRefundInfo_cancel, {
          purchasePaymentInfoId: v.purchasePaymentInfoId,
          cancelRemark: v.cancelRemark,
          applyType: 1,
        })
        .then((res) => {
          if (res.data.code === 0) {
            v.$Message.success("操作成功");
            v.getList();
          }
        });
    },
    fixData(data, index) {
      let data1 = [];
      data.forEach((i, ind) => {
        if (i.rueryPurchasePaymentRelatedResultList.length > 1) {
          if (index === ind) {
            i.show = !i.show;
          }
          i.externalSerialNo = "";
          i.receiptStatus = "";
          i.abnormalStatus = "";
          i.purchaseNumber = "";
          // i.paidAmountAll = i.rueryPurchasePaymentRelatedResultList.reduce((a,b)=>{
          //     let nub = 0;
          //     if(b.paidAmount !== null) {
          //         nub = b.paidAmount // 付款金额
          //     }
          //     return a + nub
          // },0);
          i.receiveAmountAll = i.rueryPurchasePaymentRelatedResultList.reduce(
            (a, b) => {
              let nub = 0;
              if (b.receiveAmount !== null) {
                nub = b.receiveAmount; // 收货金额
              }
              return a + nub;
            },
            0
          );
          i.totalApplyAmount = i.rueryPurchasePaymentRelatedResultList.reduce(
            (a, b) => {
              let nub = 0;
              if (b.applyAmount !== null) {
                nub = b.applyAmount; // 本次申请金额
              }
              return a + nub;
            },
            0
          );
          i.totalTotalAmount = i.rueryPurchasePaymentRelatedResultList.reduce(
            (a, b) => {
              let nub = 0;
              if (b.totalAmount !== null) {
                nub = b.totalAmount; // 应付总额
              }
              return a + nub;
            },
            0
          );
          data1.push(i);
          if (i.show) {
            i.rueryPurchasePaymentRelatedResultList.forEach((j) => {
              j._display = true;
              j.currency = i.currency;
              j.receiveAmount = j.receiveAmount === null ? 0 : j.receiveAmount; // 收货金额
              data1.push(j);
            });
          }
        } else {
          // 付款金额
          // i.paidAmountAll = i.rueryPurchasePaymentRelatedResultList[0].paidAmount === null ? 0 : i.rueryPurchasePaymentRelatedResultList[0].paidAmount;
          // 收货金额
          i.receiveAmountAll =
            i.rueryPurchasePaymentRelatedResultList[0].receiveAmount === null
              ? 0
              : i.rueryPurchasePaymentRelatedResultList[0].receiveAmount;
          // 本次申请金额
          i.totalApplyAmount =
            i.rueryPurchasePaymentRelatedResultList[0].applyAmount === null
              ? 0
              : i.rueryPurchasePaymentRelatedResultList[0].applyAmount;
          // 应付总额
          i.totalTotalAmount =
            i.rueryPurchasePaymentRelatedResultList[0].totalAmount === null
              ? 0
              : i.rueryPurchasePaymentRelatedResultList[0].totalAmount;
          data1.push(i);
        }
      });
      return data1;
    },
    getDeveloperArr() {
      let v = this;
      v.axios.get(api.userList).then((res) => {
        if (res.data.code == 0 && res.data.datas) {
          let arr = [];
          let datas = res.data.datas;
          for (let i in datas) {
            if (i != "service") {
              arr.push({
                id: i,
                name: datas[i].userName,
              });
            }
          }
          v.developerArr = arr;
        }
      });
    },
    getSupplier() {
      let v = this;
      v.axios.get(api.queryIdAndName).then((res) => {
        if (res.data.code == 0) {
          v.supplierArr = res.data.datas;
        }
      });
    },
    getDateValue(e) {
      // 获取日期返回值
      if (e[1] && e[1].slice(-6) === " 00:00") {
        e[1] = e[1].slice(0, -6) + " 23:59";
      }
      this.payTimeArr = e;
      this.pageParams.orderStartTime = e[0] ? e[0] + ":00" : "";
      this.pageParams.orderEndTime = e[1] ? e[1] + ":59" : "";
    },
    resetDate() {
      /* let v = this;
      v.pageParams.orderStartTime = '';
      v.pageParams.orderEndTime = '';
      v.payTimeArr = []; */
    },
    getList() {
      let v = this;
      v.Tableloading = true;
      v.SearchDisabled = true;
      v.pageParams.purchasePaymentInfoIdList = [];
      let reqParams = this.$common.copy(v.pageParams);
      for (let k in reqParams) {
        if (reqParams[k] == -1) {
          reqParams[k] = null;
        }
      }
      reqParams.businessDeptIds =
        this.authUserInfo.securityUser.businessDeptIds;
      //新接口现在要加上applyType
      reqParams.applyType = 1;
      v.axios.post(api.get_purchaseRefundInfo, reqParams).then((res) => {
        v.Tableloading = false;
        v.SearchDisabled = false;
        if (res.data.code === 0 && res.data.datas.list) {
          v.data = res.data.datas.list.map((i, ind) => {
            i.index = ind;
            i.show = true;
            return i;
          });
          v.total = res.data.datas.total;
          v.data1 = res.data.datas.list;
          // v.data1 = this.fixData(v.data);
        }
      });
    },
    search() {
      // this.pageParams.externalSerialNoList = this.searchValue;
      this.pageParams.pageNum = 1;
      this.getList();
    },
    reset() {
      this.$refs["pageParams"].resetFields();
      this.pageParams.startPayAmount = 0;
      this.pageParams.endPayAmount = null;
      this.searchValue = [];
      this.searchValueList = [];
      // this.externalSerialNoList = [];
      this.pageParams.searchValueList = [];
      this.pageParams.externalSerialNoList = [];
      this.pageParams.paymentNumberList = [];
      // this.pageParams.externalSerialNo = [];
      this.pageParams.purchaseNumberList = [];
      if (this.tabsValue == -1) {
        this.pageParams.paymentStatusList = [];
      }
      this.resetTime();
    },
    toCheck() {
      if (this.checkedData.length == 0) {
        this.$Message.error("未选择数据");
      } else {
        this.$Modal.confirm({
          title: "操作提示",
          content: `<p style="font-size:16px;margin:20px 0">确认是否要审核通过退款申请单，数量：<span style="color:red">${this.checkedData.length}</span></p>`,
          width: 500,
          onOk: () => {
            this.submitCheck();
          },
          onCancel: () => {},
        });
      }
    },
    cancelPay(type) {
      if (this.checkedData.length == 0 && type == 2) {
        this.$Message.error("未选择数据");
      } else {
        let text =
          type == 1
            ? "确认是否取消退款申请单："
            : "确认是否取消退款申请单，数量：";
        this.$Modal.confirm({
          title: "操作提示",
          width: 500,
          render: (h) => {
            return h(
              "div",
              {
                style: { fontSize: "16px", margin: "10px" },
              },
              [
                h("span", {}, text),
                h(
                  "span",
                  {
                    style: { color: "red" },
                  },
                  type == 1 ? this.purchaseNumber : this.checkedData.length
                ),
                h("Input", {
                  props: {
                    value: this.cancelRemark,
                    autofocus: true,
                    type: "textarea",
                    maxlength: 300,
                    placeholder: "请输入备注...",
                  },
                  style: {
                    marginTop: "10px",
                  },
                  on: {
                    input: (val) => {
                      this.cancelRemark = val;
                    },
                  },
                }),
              ]
            );
          },
          okText: "确定",
          onOk: () => {
            this.cancellationOfPayment();
          },
        });
      }
    },
    confirmOperate(type) {
      let text = "";
      let funName = "";
      if (type == 1) {
        text = "审核通过";
        funName = "submitCheck";
      } else if (type == 2) {
        text = "确认";
        funName = "confirmThePayment";
      } else if (type == 3) {
        text = "1688";
        funName = "batch1688Payment";
      } else if (type == 4) {
        text = "跨境宝";
        funName = "batch1688KPayment";
      }
      this.$Modal.confirm({
        title: "操作提示",
        content: `<span style="font-size:16px;margin:20px 0">确认是否要${text}退款申请单：</span>
        <span style="font-size:16px;color:red">${this.selfOperateArr[0].paymentNumber}</span>`,
        width: 500,
        onOk: () => {
          this[funName]("self");
        },
        onCancel: () => {},
      });
    },
    //确认审核通过
    submitCheck(typeVal) {
      let v = this;
      let currentData = typeVal === "self" ? v.selfOperateArr : v.checkedData;
      let reqParams = currentData.map((k) => {
        return k.purchasePaymentInfoId;
      });
      v.axios.put(api.put_checkRefundPass, reqParams).then((res) => {
        if (res.data.code === 0) {
          v.$Message.success("操作成功");
          v.getList();
        }
      });
    },
    resetTime() {
      this.payTimeArr = [
        fun_date(-7)[0].slice(0, -8) + "00:00:00",
        fun_date(-7)[1].slice(0, -8) + "23:59:59",
      ];
      this.pageParams.orderStartTime = this.payTimeArr[0];
      this.pageParams.orderEndTime = this.payTimeArr[1];
    },
    clickSortButton: function (data) {
      // 点击排序的按钮
      if (data.value === this.cacheClickVal) {
        data.toogle = !data.toogle;
      }
      this.cacheClickVal = data.value;
      if (data.toogle) {
        this.pageParams.upDown = "down";
      } else {
        this.pageParams.upDown = "up";
      }
      this.sortData.forEach(function (n) {
        n.checked = data.value === n.value;
      });
      this.pageParams.orderBy = data.value;
      this.search();
    },
    //跳转至 采购单详情
    toPurchaseDetail(row, id, index) {
      this.$set(row, "purchaseId", id);
      this.dialogDetail.data = row;
      this.dialogDetail.type = 1; //查看
      this.dialogDetail.from = "paymentRequest";
      this.isToPurDetail = true;
    },
    changeTab() {
      let v = this;
      v.pageParams.paymentStatusList = [];
      v.pageParams.paymentStatusList.push(v.tabsValue);
      v.pageParams.pageNum = 1;
      this.getTableColumn();

      v.getList();
    },
    getTableColumn() {
      let data = [
        {
          type: "selection",
          minWidth: 30,
          align: "center",
          fixed: "left",
        },
        {
          title: "退款申请单",
          key: "paymentNumber",
          align: "left",
          minWidth: 200,
          render: (h, params) => {
            let paymentStatus =
              params.row.paymentStatus || params.row.paymentStatus == "0"
                ? this.tabStatusArr[params.row.paymentStatus].label
                : "";
            let settlementType = params.row.settlementType || "";
            let paymentType = params.row.paymentType
              ? this.paymentTypeArr[params.row.paymentType].label
              : "";
            let b = paymentStatus
              ? [
                h(
                  "div",
                  {
                    style: this.statuStyle["success"],
                    class: "paymentRquestTag",
                  },
                  [
                    h(
                      "Tooltip",
                      {
                        props: { transfer: true },
                      },
                      [
                        paymentStatus,
                        h(
                          "div",
                          {
                            slot: "content",
                          },
                          "状态"
                        ),
                      ]
                    ),
                  ]
                ),
              ]
              : [];
            let c = paymentType
              ? [
                h(
                  "div",
                  {
                    style: this.statuStyle["warnning"],
                    class: "paymentRquestTag",
                  },
                  [
                    h(
                      "Tooltip",
                      {
                        props: { transfer: true },
                      },
                      [
                        paymentType,
                        h(
                          "div",
                          {
                            slot: "content",
                          },
                          "退款单类型"
                        ),
                      ]
                    ),
                  ]
                ),
              ]
              : [];
            let d = settlementType
              ? [
                h(
                  "div",
                  {
                    style: this.statuStyle["error"],
                    class: "paymentRquestTag",
                  },
                  [
                    h(
                      "Tooltip",
                      {
                        props: { transfer: true },
                      },
                      [
                        settlementType,
                        h(
                          "div",
                          {
                            slot: "content",
                          },
                          "结算方式"
                        ),
                      ]
                    ),
                  ]
                ),
              ]
              : [];
            let k = params.row.businessDeptName
              ? [
                h(
                  "div",
                  {
                    style: this.statuStyle["primary"],
                    class: "paymentRquestTag",
                  },
                  [
                    h(
                      "Tooltip",
                      {
                        props: { transfer: true },
                      },
                      [
                        params.row.businessDeptName,
                        h(
                          "div",
                          {
                            slot: "content",
                          },
                          "所属事业部"
                        ),
                      ]
                    ),
                  ]
                ),
              ]
              : [];
            return h("div", [
              h(
                "div",
                {
                  style: { display: "flex", margin: "8px 0 1px 0" },
                },
                [
                  h(
                    "div",
                    {
                      style: {},
                    },
                    "申请单号："
                  ),
                  h("span", {}, params.row.paymentNumber),
                ]
              ),
              h(
                "div",
                {
                  style: { margin: "5px 0" },
                  class: "textOver",
                  attrs: { title: params.row.supplierName },
                },
                params.row.supplierName
              ),
              h(
                "div",
                {
                  style: { display: "flex", flexWrap: "wrap" },
                },
                [...b, ...c, ...d, ...k]
              ),
            ]);
          },
        },
        {
          title: "申请时间", // 申请时间
          minWidth: 60,
          align: "left",
          key: "createdTime",
          render: (h, params) => {
            return h(
              "span",
              this.getDataToLocalTime(params.row.createdTime, "fulltime")
            );
          },
        },
        {
          title: "应退金额", // 应付总金额
          key: "refundableAmount", //totalAmount
          align: "left",
          minWidth: 80,
          render(h, params) {
            if (params.row.supplierName == "*") {
              return h("span", "*");
            }
            return h(
              "span",
              params.row.refundableAmount || params.row.refundableAmount == 0
                ? params.row.refundableAmount + "  " + params.row.currency
                : ""
            );
          },
        },
        {
          title: "已退金额", // 应付总金额
          key: "refundAmountTotal",
          align: "left",
          minWidth: 70,
          render(h, params) {
            if (params.row.supplierName == "*") {
              return h("span", "*");
            }
            return h(
              "span",
              params.row.refundAmountTotal || params.row.refundAmountTotal == 0
                ? params.row.refundAmountTotal + "  " + params.row.currency
                : ""
            );
          },
        },
        {
          title: "本次退款金额",
          key: "payAmount",
          align: "left",
          minWidth: 80,
          render(h, params) {
            return h(
              "span",
              params.row.payAmount || params.row.payAmount == 0
                ? params.row.payAmount + "  " + params.row.currency
                : ""
            );
          },
        },
        {
          title: "供应商支付信息", // 供应商支付方式
          key: "payType",
          align: "left",
          minWidth: 170,
          render: (h, params) => {
            //增加外部流水号
            let list = params.row.rueryPurchasePaymentRelatedResultList;
            let showList = list.map((k) => {
              if (k.alibabaAccountType) {
                return h("div", {}, [
                  h("span", {}, k.alibabaAccountType + "："),
                  h("span", {}, k.externalSerialNo),
                ]);
              }
            });
            // return h("div", {}, showList);
            if (!params.row._display) {
              let data = this.payMethodArr.filter(
                (i) => i.dataValue === params.row.payType
              );
              if (data.length > 0) {
                if (data[0].dataCode === "13") {
                  // 现金
                  // return h("span", "现金");
                  return h("div", {}, [h("p", "现金"), h("p", showList)]);
                } else if (data[0].dataCode === "14") {
                  // 银行转账
                  let bankName = this.bankArr.filter(
                    (i) => i.dataValue === params.row.paymentBank
                  )[0].dataDesc;
                  return h("div", {}, [
                    h("p", "开户行" + "：" + bankName),
                    h("p", "账号" + "：" + params.row.paymentAccount),
                    h("p", "开户名" + "：" + params.row.paymentAccountName),
                    h("p", showList),
                  ]);
                } else if (data[0].dataCode === "15") {
                  // PayPal
                  // return h("span", data[0].dataDesc);
                  return h("div", {}, [
                    h("p", data[0].dataDesc),
                    h("p", showList),
                  ]);
                } else if (data[0].dataCode === "16") {
                  // 支付宝
                  return h("div", {}, [
                    h("p", "支付宝" + "：" + params.row.paymentAccount),
                    h("p", showList),
                  ]);
                } else {
                  // return h("span", data[0].dataDesc);
                  return h("div", {}, [
                    h("p", data[0].dataDesc),
                    h("p", showList),
                  ]);
                }
              } else {
                // return h("span", "");
                return h("div", {}, showList);
              }
            }
          },
        },
        {
          title: "退款凭证", // 申请时间
          width: 155,
          align: "left",
          slot: "relatedImageList",
        },

        {
          title: "退款备注",
          minWidth: 140,
          align: "left",
          key: "paymentRemark",
          render(h, params) {
            return h("div", {}, [
              h(
                "Tooltip",
                {
                  props: {
                    placement: "right",
                    transfer: true,
                  },
                },
                [
                  h(
                    "div",
                    {
                      style: {
                        display: "inline-block",
                        width: params.column._width * 0.85 + "px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      },
                    },
                    params.row.paymentRemark || ""
                  ),
                  h(
                    "span",
                    {
                      slot: "content",
                      style: { whiteSpace: "pre-wrap" },
                    },
                    params.row.paymentRemark
                  ),
                ]
              ),
            ]);
          },
        },

        {
          title: "采购单", // 采购单号
          minWidth: 110,
          align: "left",
          key: "purchaseNumber",
          render: (h, params) => {
            let list = params.row.rueryPurchasePaymentRelatedResultList;
            let showList = list.map((k) => {
              return h(
                "div",
                {
                  class: "clickGesture",
                  on: {
                    click: () => {
                      this.toPurchaseDetail(
                        params.row,
                        k.purchaseId,
                        params.index
                      );
                    },
                  },
                },
                k.purchaseNumber
              );
            });
            return h("div", {}, showList);
          },
        },
        {
          title: "订单金额", // 收货金额
          key: "totalAmountTotal",
          align: "left",
          minWidth: 70,
          render(h, params) {
            return h(
              "span",
              params.row.totalAmountTotal || params.row.totalAmountTotal == 0
                ? params.row.totalAmountTotal + "  " + params.row.currency
                : ""
            );
          },
        },
        {
          title: "收库金额", // 收货金额
          key: "receiveAmountTotal",
          align: "left",
          minWidth: 70,
          render(h, params) {
            return h(
              "span",
              params.row.receiveAmountTotal ||
                params.row.receiveAmountTotal == 0
                ? params.row.receiveAmountTotal + "  " + params.row.currency
                : ""
            );
          },
        },
      ];
      if (
        this.tabsValue === "-1" ||
        this.tabsValue === "0" ||
        this.tabsValue === "1"
      ) {
        data.push({
          title: "操作",
          minWidth: 80,
          align: "left",
          fixed: "right",
          key: "operation",
          render: (h, params) => {
            let v = this;
            let a =
              params.row.paymentStatus == 0 &&
              this.getPermission("purchaseRefundInfo_check")
                ? [
                  h(
                    "DropdownItem",
                    {
                      nativeOn: {
                        click() {
                          v.selfOperateArr = [];
                          v.selfOperateArr.push(params.row);
                          v.confirmOperate(1);
                        },
                      },
                    },
                    "审核通过"
                  ),
                ]
                : [];
            let b =
              params.row.paymentStatus == 1 &&
              this.getPermission("purchaseRefundInfo_batchConfirm")
                ? [
                  h(
                    "DropdownItem",
                    {
                      nativeOn: {
                        click() {
                          v.selfOperateArr = [];
                          v.selfOperateArr.push(params.row);
                          v.confirmOperate(2);
                        },
                      },
                    },
                    "确认退款"
                  ),
                ]
                : [];
            let c =
              params.row.paymentStatus == 1 &&
              this.getPermission("purchase_paymentUrl")
                ? [
                  h(
                    "DropdownItem",
                    {
                      nativeOn: {
                        click() {
                          v.selfOperateArr = [];
                          v.selfOperateArr.push(params.row);
                          v.confirmOperate(3);
                        },
                      },
                    },
                    "1688付款"
                  ),
                ]
                : [];
            let d =
              params.row.paymentStatus == 1 &&
              this.getPermission("purchase_paymentUrl")
                ? [
                  h(
                    "DropdownItem",
                    {
                      nativeOn: {
                        click() {
                          v.selfOperateArr = [];
                          v.selfOperateArr.push(params.row);
                          v.confirmOperate(4);
                        },
                      },
                    },
                    "跨境宝付款"
                  ),
                ]
                : [];
            let e =
              params.row.paymentStatus == 1 || params.row.paymentStatus == 0
                ? [
                  h(
                    "DropdownItem",
                    {
                      nativeOn: {
                        click() {
                          v.cancelRemark = "";
                          v.purchasePaymentInfoId =
                              params.row.purchasePaymentInfoId;
                          v.purchaseNumber = params.row.purchaseNumber;
                          v.cancelPay(1);
                        },
                      },
                    },
                    "取消退款"
                  ),
                ]
                : [];
            return h(
              "div",
              {
                style: {
                  display:
                    params.row.paymentStatus == 2 ||
                    params.row.paymentStatus == 3
                      ? "none"
                      : "",
                },
              },
              [
                h(
                  "Dropdown",
                  {
                    props: {
                      transfer: true,
                    },
                    style: {},
                  },
                  [
                    h("a", {}, [
                      h("Button", {}, [
                        h("Span", { style: { marginRight: "5px" } }, "操作"),
                        h("Icon", {
                          props: {
                            type: "ios-arrow-down",
                          },
                        }),
                      ]),
                    ]),
                    h(
                      "DropdownMenu",
                      {
                        slot: "list",
                      },
                      [...a, ...b, ...c, ...d, ...e]
                    ),
                  ]
                ),
              ]
            );
          },
        });
      }
      if (this.tabsValue === "3") {
        data.push({
          title: "取消信息", // 收货金额
          key: "cancelInfo",
          align: "left",
          minWidth: 110,
          render: (h, params) => {
            return h("div", [
              h(
                "span",
                this.getDataToLocalTime(params.row.cancelTime, "fulltime")
              ),
              h("div", { style: { marginTop: "10px" } }, [
                h(
                  "Tooltip",
                  {
                    props: {
                      placement: "left",
                      transfer: true,
                    },
                  },
                  [
                    h(
                      "div",
                      {
                        style: {
                          display: "inline-block",
                          width: params.column._width * 0.85 + "px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        },
                      },
                      params.row.cancelRemark || ""
                    ),
                    h(
                      "span",
                      {
                        slot: "content",
                        style: { whiteSpace: "pre-wrap" },
                      },
                      params.row.cancelRemark
                    ),
                  ]
                ),
              ]),
            ]);
          },
        });
      }
      this.column1 = data;
    },
    getBusinessDeptInfo() {
      this.axios
        .post("/sps-service/sps/common/businessDeptInfo")
        .then((res) => {
          this.businessDeptInfoList = res.data.datas;
        });
    },
  },
};
</script>

<style lang="less">
.payment .ivu-table-wrapper {
  width: 100%;
}

.trans90 {
  transform: rotate(90deg);
  transition: 0.2s ease-in;
}

.startEndPayAmount {
  .ivu-form-item-content {
    display: flex;

    .ivu-input-number {
      flex: 50;
    }
  }
}

.paymentRquestTag {
  font-size: 12px;
  font-weight: 400;
  padding: 2px 1px;
  line-height: 16px;
  border-radius: 2px;
  margin: 3px 4px;
  width: fit-content;
}
</style>
<style scoped>
.textareaContent {
  width: 71%;
}

.textareaContent >>> .ivu-input {
  height: 33px;
}

.tabContent {
  background: #fff;
  margin-left: 12px;
  padding-top: 15px;
}

.tabContent >>> .ivu-tabs-bar {
  margin-bottom: 0;
}

</style>
