<template>
  <div class="mainBox">
    <Card shadow class="card-self-style">
      <div class="list-page">
        <div class="resetIvu">
          <ButtonGroup ref="btns" class="mb10">
            <Button
              v-if="taggleBtnType"
              type="primary"
              @click="taggleBtn(1, $event)"
              >待付款</Button
            >
            <Button v-if="!taggleBtnType" @click="taggleBtn(1, $event)"
              >待付款</Button
            >
            <Button v-if="taggleBtnType" @click="taggleBtn(2, $event)"
              >已付款</Button
            >
            <Button
              v-if="!taggleBtnType"
              type="primary"
              @click="taggleBtn(2, $event)"
              >已付款</Button
            >
          </ButtonGroup>
          <Form
            ref="allListFormValidate"
            class="formSearch"
            inline
            :model="allListFormValidate"
            :label-width="70"
          >
            <dyt-filter :filter-row="1">
              <FormItem label="供应商">
                <dyt-select
                  v-model="allListFormValidate.supplier"
                  :remote-method="getSupplierList"
                  :loading="loading1"
                  @on-change="searchProduct"
                  placeholder="请输入供应商远程搜索"
                >
                  <Option
                    v-for="(item, index) in supplierList"
                    :key="index"
                    :value="item.supplierId"
                    >{{ item.supplierName }}</Option
                  >
                </dyt-select>
              </FormItem>
              <FormItem label="采购员">
                <dyt-select
                  v-model="allListFormValidate.purchasePerson"
                  @on-change="searchProduct"
                >
                  <Option
                    v-for="item in purchasePersonList"
                    :value="item.purchasePerson"
                    :key="item.purchasePerson"
                    >{{ item.purchasePersonName }}</Option
                  >
                </dyt-select>
              </FormItem>
              <FormItem label="采购单号">
                <dyt-input
                  v-model.trim="allListFormValidate.purchaseCode"
                ></dyt-input>
              </FormItem>
              <FormItem label="申请时间">
                <Date-picker
                  type="datetimerange"
                  :options="dateOptions"
                  format="yyyy-MM-dd HH:mm:ss"
                  placement="bottom-end"
                  placeholder="请选择日期"
                  v-model="payTimeArr"
                >
                </Date-picker>
              </FormItem>
              <div slot="operation">
                <Button
                  type="primary"
                  @click="searchProduct"
                  icon="ios-search"
                  class="mr10"
                  >搜索</Button
                >
                <Button @click="resetSearch" icon="ios-refresh">重置</Button>
              </div>
            </dyt-filter>
          </Form>
          <div>
            <filterColumns
              :columns="payColumns"
              :filterName="filterName"
              @setTableColumns="setTableColumns"
              style="
                position: relative;
                width: auto;
                text-align: right;
                bottom: 0;
                height: 24px;
                right: 0;
              "
            ></filterColumns>
          </div>
        </div>
        <div class="operaBtn mt10">
          <Button
            class="mr10"
            v-show="taggleBtnType"
            v-for="(item, index) in sortChoseDate"
            :key="index"
            type="primary"
            @click="btnsHandel(item)"
            >{{ item.tit }}</Button
          >
        </div>
        <div class="table-main mt10">
          <div :class="['table-list', tableClass]">
            <keep-alive>
              <Table
                :columns="filterHaveDoneTableColumns"
                :height="tableHeight"
                :data="payDate"
                @on-selection-change="tableSelection"
                highlight-row
                :loading="tableLoading"
              >
              </Table>
            </keep-alive>
          </div>
          <div class="table-page">
            <div class="table-page-right">
              <Page
                :total="total"
                @on-change="changePage"
                show-total
                :page-size="allListFormValidate.pageSize"
                show-elevator
                :current="allListFormValidate.pageNum"
                show-sizer
                @on-page-size-change="changePageSize"
                placement="top"
                :page-size-opts="pageArray"
                :transfer="true"
              ></Page>
            </div>
          </div>
        </div>
      </div>
    </Card>
    <CommonPurchaseOrder ref="CommonPurchaseOrder"></CommonPurchaseOrder>
  </div>
</template>

<script>
import commonMixix from "../../../components/mixin/commonMixin";
import CommonPurchaseOrder from "./purchaseOrder";
import filterColumns from "../common/filterColumns"; // 列筛选
import api from "@/api/api";
import table_highly_adaptive from "@/components/mixin/table_highly_adaptive";

export default {
  name: "paymentList", // 付款记录
  mixins: [commonMixix, table_highly_adaptive],
  components: {
    CommonPurchaseOrder,
    filterColumns,
  },
  data() {
    let v = this;
    var end = new Date();
    var start = new Date();
    start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
    return {
      total: 0,
      taggleBtnType: true,
      filterName: "paymentListColumns",
      filterHaveDoneTableColumns: [],
      tableLoading: false,
      payColumns: [
        {
          type: "selection",
          width: 60,
          fixed: "left",
          align: "center",
        },
        {
          key: "enableFlag",
          align: "center",
          title: "操作",
          minWidth: 130,
          render: (h, params) => {
            if (params.row.payStatus === 2) {
              return h(
                "Button",
                {
                  on: {
                    click() {
                      v.$store.commit("isEditInquiry", true);
                      v.$store.commit("quotationId", params.row.quotationId);
                      v.$store.commit("createId", params.row.productId);
                      v.$refs.CommonPurchaseOrder.getQueryProductQuotationDetail(
                        params.row.quotationId,
                        () => {
                          v.supplierMt(params, function () {
                            v.$refs.CommonPurchaseOrder.samplingForm.supplierName =
                              params.row.supplierName;
                            v.$refs.CommonPurchaseOrder.purchasePerson =
                              params.row.purchasePersonName;
                            v.$refs.CommonPurchaseOrder.samplingModal = true;
                          });
                          v.$refs.CommonPurchaseOrder.samplingForm.quotationId =
                            params.row.quotationId;
                          v.$refs.CommonPurchaseOrder.samplingForm.productId =
                            v.$store.state.createId;
                        }
                      );
                    },
                  },
                },
                "查看"
              );
            } else {
              let payStatus = params.row.payStatus;
              return h("local-down-button", {
                props: {
                  data: {
                    btn: {
                      text: "标记为付款", // 标记为付款
                      disabled: (() =>
                        !!(payStatus === 2 || payStatus === 3))(),
                      clickFn: () => {
                        if (payStatus !== 2 || payStatus !== 3) {
                          v.payListMt([params.row.purchaseId]);
                        }
                      },
                    },
                    list: [
                      {
                        text: "取消付款", // 取消付款
                        value: 1,
                        disabled: (() => payStatus === 2)(),
                        clickFn: () => {
                          if (payStatus === 2) {
                            return true;
                          } else {
                            v.payListCancel([params.row.purchaseId]);
                          }
                        },
                      },
                    ],
                  },
                },
              });
            }
          },
        },
        {
          key: "purchaseCode",
          align: "center",
          minWidth: 165,
          title: "采购单号",
          render(h, params) {
            return h(
              "div",
              {
                class: "cursor-pointer",
                style: "color:#169BD5",
                attrs: {
                  title: params.row.purchaseCode,
                },
                on: {
                  click: function () {
                    v.$store.commit("isEditInquiry", true);
                    v.$store.commit("quotationId", params.row.quotationId);
                    v.$store.commit("createId", params.row.productId);
                    v.$refs.CommonPurchaseOrder.getQueryProductQuotationDetail(
                      params.row.quotationId
                    );
                    v.supplierMt(params, function () {
                      v.$refs.CommonPurchaseOrder.samplingForm.supplierName =
                        params.row.supplierName;
                      v.$refs.CommonPurchaseOrder.purchasePerson =
                        params.row.purchasePersonName;
                      v.$refs.CommonPurchaseOrder.samplingModal = true;
                    });
                    v.$refs.CommonPurchaseOrder.getQueryProductQuotationDetail(
                      params.row.quotationId
                    );
                    v.$refs.CommonPurchaseOrder.samplingForm.quotationId =
                      params.row.quotationId;
                    v.$refs.CommonPurchaseOrder.samplingForm.productId =
                      v.$store.state.createId;
                  },
                },
              },
              params.row.purchaseCode
            );
          },
        },
        {
          key: "purchasePersonName",
          align: "center",
          minWidth: 120,
          title: "采购员",
        },
        {
          key: "supplierName",
          align: "left",
          minWidth: 120,
          title: "供应商",
        },
        {
          key: "payStatus",
          align: "center",
          minWidth: 120,
          title: "付款记录",
          render(h, params) {
            // 0未申请付款，1已申请付款，2已付款，3已取消付款
            if (params.row.payStatus === 0) {
              return h("div", "未申请付款");
            } else if (params.row.payStatus === 1) {
              return h("div", "待付款");
            } else if (params.row.payStatus === 2) {
              return h("div", "已付款");
            } else if (params.row.payStatus === 3) {
              return h("div", "已取消付款");
            }
          },
        },
        {
          key: "purchaseStatus",
          align: "center",
          minWidth: 120,
          title: "采购单状态",
          render(h, params) {
            // （0等待到货，1已到货，3已作废）
            if (params.row.purchaseStatus === 0) {
              return h("div", "等待到货");
            } else if (params.row.purchaseStatus === 1) {
              return h("div", "已到货");
            } else if (params.row.purchaseStatus === 2) {
              return h("div", "已作废");
            }
          },
        },
        {
          key: "priceHadPay",
          align: "center",
          minWidth: 120,
          title: "本次付款",
          render(h, params) {
            if (params.row.priceHadPay === null) {
              return h("div", params.row.currencyType + "0");
            } else {
              return h(
                "div",
                params.row.currencyType + " " + params.row.priceHadPay
              );
            }
          },
        },
        {
          key: "createdTime",
          align: "center",
          minWidth: 160,
          title: "申请时间",
          render(h, params) {
            return h(
              "div",
              {
                attrs: {
                  title: v.getDataToLocalTime(
                    params.row.createdTime,
                    "fulltime"
                  ),
                },
              },
              v.getDataToLocalTime(params.row.createdTime, "fulltime")
            );
          },
        },
        {
          key: "paymentMode",
          align: "center",
          minWidth: 120,
          title: "支付方式",
          render(h, params) {
            if (params.row.paymentMode == 1) {
              return h("div", "现金");
            } else if (params.row.paymentMode == 2) {
              return h("div", "银行");
            } else if (params.row.paymentMode == 3) {
              return h("div", "paypal");
            } else if (params.row.paymentMode == 4) {
              return h("div", "支付宝");
            } else {
              return h("div", "无数据");
            }
          },
        },
        {
          key: "bank",
          align: "center",
          minWidth: 120,
          title: "开户行",
          render(h, params) {
            if (params.row.bank == "" || params.row.bank == null) {
              return h("div", "无数据");
            } else {
              return h(
                "div",
                {
                  attrs: {
                    title: params.row.bank,
                  },
                },
                params.row.bank
              );
            }
          },
        },
        {
          key: "payeeAccount",
          align: "center",
          minWidth: 160,
          title: "收款账号",
          render(h, params) {
            if (
              params.row.payeeAccount === "" ||
              params.row.payeeAccount == null
            ) {
              return h("div", "无数据");
            } else {
              return h(
                "div",
                {
                  attrs: {
                    title: params.row.payeeAccount,
                  },
                },
                params.row.payeeAccount
              );
            }
          },
        },
        {
          key: "accountName",
          align: "center",
          minWidth: 160,
          title: "开户名",
          render(h, params) {
            if (
              params.row.accountName === "" ||
              params.row.accountName == null
            ) {
              return h("div", "无数据");
            } else {
              return h(
                "div",
                {
                  attrs: {
                    title: params.row.accountName,
                  },
                },
                params.row.accountName
              );
            }
          },
        },
      ],
      payDate: [],
      checkedItem: [],
      sortChoseDate: [
        {
          tit: "批量标记付款",
          name: 1,
        },
        {
          tit: "批量取消付款",
          name: 2,
        },
      ],
      supplierNameList: [
        {
          label: "供应商1",
          value: 0,
        },
        {
          label: "供应商1",
          value: 1,
        },
      ],
      purchasePersonList: [] /* purchasePersonList: [{       label: '采购员1',
       value: '1'
       }, {
       label: '采购员2',
       value: '2'
       }], */,
      payStatusList: [
        {
          label: "待付款",
          value: 1,
        },
        {
          label: "已付款",
          value: 2,
        },
        {
          label: "已取消付款",
          value: 3,
        },
      ],
      payTimeArr: [start, end],
      allListFormValidate: {
        applyPayBeginTime: "", // 申请时间开始日期
        applyPayEndTime: "", // 申请时间结束日期
        pageNum: 1,
        pageSize: 10,
        payStatus: 1, // 付款状态(默认null，1待付款，2已付款 3已取消付款)
        purchaseCode: "", // 样品采购id
        purchasePerson: "", // 采购员
        supplier: "", // 供应商
      },
      supplierList: [],
      loading1: false,
    };
  },
  computed: {
    securityUser() {
      if (this.$store.getters["authUserInfo"] && this.$store.getters["authUserInfo"].securityUser) {
        return this.$store.getters["authUserInfo"].securityUser;
      }
      return {}
    },
  },
  created() {
    // window.document.title = "付款记录";
    this.getList();
    // this.getSupplierList();
    this.getUser();
  },
  methods: {
    setTableColumns(data) {
      this.$nextTick(() => {
        this.filterHaveDoneTableColumns = data;
      });
    },
    getSupplierList(query) {
      let v = this;
      if (query === "") {
        v.allListFormValidate.supplier = "";
        return;
      }

      let apiUrl = api.getSupplierInfo;
      if (v.$store.state.ierpStatus === "1") {
        apiUrl = api.getNewSupplierInfo;
      }
      v.loading1 = true;
      v.$axios
        .post(apiUrl, {
          supplierName: query,
          pageNum: 1,
          pageSize: 10,
          auditStatus: 3, // 已审核
          businessDeptId: this.securityUser.businessDeptId,
          businessDeptIds: this.securityUser.businessDeptIds,
        })
        .then((res) => {
          v.loading1 = false;
          if (res.code === 0) {
            v.supplierList = res.datas.list;
          } else {
            v.supplierList = [];
          }
        });
    },
    supplierMt(params, callback) {
      // 样品采购
      let v = this;
      v.$axios
        .get(api.queryProductPurchase + "?purchaseId=" + params.row.purchaseId)
        .then((res) => {
          if (res.code === 0) {
            if (res.datas !== null) {
              v.$refs.CommonPurchaseOrder.samplingForm = res.datas;
              v.$refs.CommonPurchaseOrder.purchaseRemarkList =
                res.datas.purchaseRemarkList;
              v.$refs.CommonPurchaseOrder.orderStatuText =
                res.datas.orderStatus1688;
              v.$refs.CommonPurchaseOrder.OrderText[0].content =
                v.getDataToLocalTime(res.datas.createdTime, "fulltime");
              v.$refs.CommonPurchaseOrder.OrderText[1].content =
                v.getDataToLocalTime(res.datas.actualArrivalTime, "fulltime");
              if (params.row.quotationProductUrl) {
                v.$store.commit(
                  "product1688Url",
                  res.datas.quotationProductUrl
                );
              }
              v.$store.commit("orderState", true); // 显示1688订单状态
              v.$store.commit("purchaseId", params.row.purchaseId);
              if (params.row.is1688Order === 1) {
                v.$store.commit("set1688State", true);
              } else {
                v.$store.commit("set1688State", false);
              }
              callback && callback();
            }
          } else {
            v.$msg.error("请求失败");
          }
        })
        .catch(() => {});
    },
    payListMt(arr) {
      let v = this;
      v.$axios
        .post(api.payList, arr)
        .then((res) => {
          if (res.code === 0) {
            v.$msg.success("已标记付款");
            v.getList();
          } else {
            v.$msg.error("标记付款失败");
          }
        })
        .catch(() => {});
    },
    payListCancel(arr) {
      let v = this;
      v.$axios
        .post(api.canclePayList, arr)
        .then((res) => {
          if (res.code === 0) {
            v.$msg.success("取消付款成功");
            v.getList();
          } else {
            v.$msg.error("取消付款失败");
          }
        })
        .catch(() => {});
    },
    changePage(page) {
      let v = this;
      v.allListFormValidate.pageNum = page;
      v.getList();
    },
    changePageSize(val) {
      this.allListFormValidate.pageSize = +val;
      if (val !== undefined) {
        localStorage.setItem("pageSize", val);
      }
      this.getList();
    },
    tableSelection(a) {
      this.checkedItem = a;
    },
    btnsHandel(item) {
      let v = this;
      let arr = [];
      if (v.checkedItem.length === 0) {
        v.$msg.info({
          ducation: 5,
          content: "选择要标记的数据",
        });
        return;
      }
      v.checkedItem.forEach((child) => {
        arr.push(child.purchaseId);
      });
      if (item.name === 1) {
        v.payListMt(arr);
      } else if (item.name === 2) {
        v.payListCancel(arr);
      }
    },
    getUser() {
      let v = this;
      v.$axios.post(api.purchasePerson).then((res) => {
        if (res.code === 0) {
          v.purchasePersonList = res.datas;
        }
      });
    },
    getList() {
      let v = this;
      if (localStorage.getItem("pageSize")) {
        v.allListFormValidate.pageSize = +localStorage.getItem("pageSize");
      }
      if (v.taggleBtnType) {
        v.allListFormValidate.payStatus = 1;
      } else {
        v.allListFormValidate.payStatus = 2;
      }
      let params = v.setNull(v.allListFormValidate);
      if (v.payTimeArr !== "" && v.payTimeArr[0] !== "") {
        params.applyPayBeginTime = v.getUniversalTime(
          new Date(v.payTimeArr[0]).getTime(),
          "fulltime"
        );
        params.applyPayEndTime = v.getUniversalTime(
          new Date(v.payTimeArr[1]).getTime(),
          "fulltime"
        );
      }
      v.tableLoading = true;
      v.$axios
        .post(api.record, params)
        .then((res) => {
          v.tableLoading = false;
          if (res.code === 0) {
            if (res.datas === null) {
              v.payDate = [];
              v.total = 0;
            } else {
              v.payDate = res.datas.list;
              v.total = res.datas.total;
            }
          }
        })
        .catch(() => {
          v.tableLoading = false;
        });
    },
    taggleBtn(id) {
      let v = this;
      id == 1 ? (v.taggleBtnType = true) : (v.taggleBtnType = false);
      v.allListFormValidate.payStatus = id;
      v.getList();
    },
    searchProduct() {
      let v = this;
      v.allListFormValidate.pageNum = 1;
      v.allListFormValidate.pageSize = 10;
      v.getList();
    },
    resetSearch() {
      let v = this;
      for (let key in v.allListFormValidate) {
        v.allListFormValidate[key] = null;
      }
      v.payTimeArr = "";
      v.allListFormValidate.pageNum = 1;
      v.allListFormValidate.pageSize = 10;
      v.getList();
    },
  },
};
</script>

<style>
.ivu-form .ivu-form-item-label {
  width: 90px;
}
</style>
<style scoped></style>
