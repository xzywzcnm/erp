<template>
  <div class="mainBox">
    <Card shadow class="card-self-style">
      <div class="list-page">
        <div class="resetIvu">
          <Form ref="allListFormValidate" class="formSearch" inline :model="allListFormValidate" :label-width="70">
            <dyt-filter :filter-row="1">
              <FormItem label="采购状态">
                <dyt-select v-model="allListFormValidate.purchaseStatus" @on-change="searchProduct">
                  <Option v-for="item in purchaseStatusList" :value="item.value" :key="item.value">{{ item.label }}
                  </Option>
                </dyt-select>
              </FormItem>
              <FormItem label="付款状态">
                <dyt-select v-model="allListFormValidate.payStatus" @on-change="searchProduct">
                  <Option v-for="item in payStatusList" :value="item.value" :key="item.value">{{ item.label }}
                  </Option>
                </dyt-select>
              </FormItem>
              <div slot="operation">
                <Button type="primary" @click="searchProduct" icon="search" class="mr10">搜索</Button>
                <Button @click="resetSearch" icon="refresh">重置</Button>
              </div>
            </dyt-filter>
          </Form>
          <div>
            <filterColumns :columns="sampleColumns" :filterName="filterName" @setTableColumns="setTableColumns" style="position:relative;width:auto;text-align:right;bottom:0;height:24px;right:0;"></filterColumns>
          </div>
        </div>
        <div class="table-main mt10">
          <div :class="['table-list',tableClass]">
            <keep-alive>
              <Table highlight-row :height=" tableHeight" :columns="filterHaveDoneTableColumns" :data="sampleDate" :loading="tableLoading">
              </Table>
            </keep-alive>
          </div>
          <div class="table-page">
            <div class="table-page-right">
              <Page :total="total" @on-change="changePage" show-total :page-size="allListFormValidate.pageSize" show-elevator :current="allListFormValidate.pageNum" show-sizer @on-page-size-change="changePageSize" placement="top" :page-size-opts="pageArray" :transfer="true"></Page>
            </div>
          </div>
        </div>
      </div>
    </Card>
    <commonMessage ref="commonMessage" :params="params" @getList="getList"></commonMessage>
    <CommonPurchaseOrder ref="CommonPurchaseOrder"></CommonPurchaseOrder>
  </div>
</template>

<script>
import api from "@/api/api";
import CommonMixin from "@/components/mixin/commonMixin";
import commonMessage from "../common/demand";
import CommonPurchaseOrder from "../stockUp/purchaseOrder";
import filterColumns from "../common/filterColumns"; // 列筛选
import table_highly_adaptive from '@/components/mixin/table_highly_adaptive';
export default {
  name: "myPurchase", // 样品采购管理
  mixins: [CommonMixin, table_highly_adaptive],
  components: {
    commonMessage,
    CommonPurchaseOrder,
    filterColumns
  },
  data () {
    let v = this;
    return {
      filterName: "myPurchaseColumns",
      total: 0,
      filterHaveDoneTableColumns: [],
      tableLoading: false,
      allListFormValidate: {
        pageNum: 1,
        pageSize: 10,
        payStatus: null, // 付款状态(默认null,0未申请付款，1已申请付款，2已付款，3已取消付款)
        // purchasePerson: '201112010000000193', // 采购人
        purchaseStatus: null // 采购状态(默认null,0等待到货，1已到货，3已作废)
      },
      purchaseStatusList: [
        {
          label: "全部",
          value: ""
        },
        {
          label: "等待到货",
          value: 0
        },
        {
          label: "已到货",
          value: 1
        },
        {
          label: "已作废",
          value: 2
        }
      ],
      params: {},
      payStatusList: [
        {
          label: "全部",
          value: ""
        },
        {
          label: "未申请付款",
          value: 0
        },
        {
          label: "待付款",
          value: 1
        },
        {
          label: "已付款",
          value: 2
        },
        {
          label: "已取消付款",
          value: 3
        }
      ],
      sampleColumns: [
        {
          key: "enableFlag",
          align: "center",
          title: "操作",
          width: 80,
          render: (h, params) => {
            return h(
              "Button",
              {
                type: "default",
                class: "trimming",
                on: {
                  click () {
                    v.$store.commit("isEditInquiry", true);
                    v.$store.commit("isListInquiry", true);
                    v.$store.commit("quotationId", params.row.quotationId);
                    v.$store.commit("productCurNodeId", null);
                    v.$refs.CommonPurchaseOrder.getQueryProductQuotationDetail(
                      params.row.quotationId
                    );
                    v.supplierMt(params, function () {
                      v.$refs.CommonPurchaseOrder.samplingForm.supplierName =
                        params.row.supplierName;
                      v.$refs.CommonPurchaseOrder.purchasePerson =
                        params.row.purchasePersonName;
                      // v.$refs.CommonPurchaseOrder.samplingForm.purchasePerson=params.row.userInfo.userId;
                      v.$store.commit("createId", params.row.productId);
                      v.$refs.CommonPurchaseOrder.samplingModal = true;
                    });
                  }
                }
              },
              [
                h("span", {
                  style: {
                    top: "0"
                  }
                }),
                h("span", "查看")
              ]
            );
          }
        },
        {
          align: "center",
          title: "采购单号",
          minWidth: 165,
          key: "purchaseCode",
          render (h, params) {
            return h(
              "div",
              {
                attrs: {
                  title: params.row.purchaseCode
                }
              },
              params.row.purchaseCode
            );
          }
        },
        {
          align: "left",
          title: "商品编号",
          minWidth: 180,
          key: "productCode",
          render (h, params) {
            return h(
              "div",
              {
                on: {
                  click: function () {
                    v.lookMethod(params);
                  }
                },
                class: "cursor-pointer",
                style: "color:#169BD5",
                attrs: {
                  title: params.row.productCode
                }
              },
              params.row.productCode
            );
          }
        },
        {
          align: "left",
          title: "供应商",
          minWidth: 100,
          key: "supplierName",
          render (h, params) {
            if (params.row.supplierName === null) {
              return h("div", "无数据");
            } else {
              return h(
                "div",
                {
                  class: "line2",
                  attrs: { title: params.row.supplierName }
                },
                params.row.supplierName
              );
            }
          }
        },
        {
          align: "center",
          title: "货款",
          minWidth: 100,
          key: "goodsPrice",
          render (h, params) {
            if (params.row.goodsPrice === null) {
              return h("div", "无数据");
            } else {
              return h(
                "div",
                {
                  class: "line2",
                  attrs: { title: params.row.goodsPrice }
                },
                params.row.goodsPrice
              );
            }
          }
        },
        {
          align: "center",
          title: "运费",
          minWidth: 100,
          key: "freightPrice",
          render (h, params) {
            if (params.row.freightPrice === null) {
              return h("div", "无数据");
            } else {
              return h(
                "div",
                {
                  class: "line2",
                  attrs: { title: params.row.freightPrice }
                },
                params.row.freightPrice
              );
            }
          }
        },
        {
          align: "center",
          title: "应付款",
          minWidth: 100,
          key: "totalPrice",
          render (h, params) {
            if (params.row.totalPrice === null) {
              return h("div", "无数据");
            } else {
              return h(
                "div",
                {
                  class: "line2",
                  attrs: { title: params.row.totalPrice }
                },
                params.row.totalPrice
              );
            }
          }
        },
        {
          align: "center",
          title: "已付款",
          minWidth: 100,
          key: "totalPrice",
          render (h, params) {
            if (params.row.priceHadPay === null) {
              return h("div", "0");
            } else {
              return h(
                "div",
                {
                  class: "line2",
                  attrs: { title: params.row.priceHadPay }
                },
                params.row.priceHadPay
              );
            }
          }
        },
        {
          align: "center",
          title: "结算方式",
          minWidth: 100,
          key: "payMethod",
          render (h, params) {
            /*
             *    <Option  value=1>货到付款</Option>
             <Option  value=2>款到发货</Option>
             <Option  value=4>快递代收</Option>
             <Option  value=5>定期结算</Option>
             * */
            if (params.row.payMethod === 1) {
              return h("div", "货到付款");
            } else if (params.row.payMethod === 2) {
              return h("div", "款到发货");
            } else if (params.row.payMethod === 4) {
              return h("div", "快递代收");
            } else if (params.row.payMethod === 5) {
              return h("div", "定期结算");
            }
          }
        },
        {
          align: "center",
          title: "采购人员",
          minWidth: 100,
          key: "purchasePersonName"
        },
        {
          align: "center",
          title: "采购日期",
          minWidth: 100,
          key: "createdTime",
          render (h, params) {
            return h(
              "div",
              {
                attrs: {
                  title: v.getDataToLocalTime(
                    params.row.createdTime,
                    "fulltime"
                  )
                }
              },
              v.getDataToLocalTime(params.row.createdTime, "fulltime")
            );
          }
        },
        {
          align: "center",
          title: "到货日期",
          minWidth: 160,
          key: "actualArrivalTime",
          render (h, params) {
            if (params.row.actualArrivalTime === null) {
              return h("div", "暂未到货");
            } else {
              return h(
                "div",
                {
                  attrs: {
                    title: v.getDataToLocalTime(
                      params.row.createdTime,
                      "fulltime"
                    )
                  }
                },
                v.getDataToLocalTime(params.row.actualArrivalTime)
              );
            }
          }
        },
        {
          align: "center",
          title: "付款状态",
          minWidth: 160,
          key: "payStatus",
          render (h, params) {
            if (params.row.payStatus === 0) {
              return h(
                "div",
                {
                  style: {
                    color: "red"
                  }
                },
                "未申请付款"
              );
            } else if (params.row.payStatus === 1) {
              return h(
                "div",
                {
                  style: {
                    color: "red"
                  }
                },
                "已申请付款"
              );
            } else if (params.row.payStatus === 2) {
              return h(
                "div",
                {
                  style: {
                    color: "red"
                  }
                },
                "已付款"
              );
            } else if (params.row.payStatus === 3) {
              return h(
                "div",
                {
                  style: {
                    color: "red"
                  }
                },
                "已取消付款"
              );
            }
          }
        },
        {
          align: "center",
          title: "采购状态",
          minWidth: 100,
          key: "purchaseStatus",
          render (h, params) {
            if (params.row.purchaseStatus === 0) {
              return h(
                "div",
                {
                  style: {
                    color: "red"
                  }
                },
                "等待到货"
              );
            } else if (params.row.purchaseStatus === 1) {
              return h(
                "div",
                {
                  style: {
                    color: "red"
                  }
                },
                "已到货"
              );
            } else if (params.row.purchaseStatus === 2) {
              return h(
                "div",
                {
                  style: {
                    color: "red"
                  }
                },
                "已作废"
              );
            }
          }
        },
        {
          align: "center",
          title: "预计到货日期",
          minWidth: 160,
          key: "estimatedArrivalTime",
          render (h, params) {
            return h(
              "div",
              {
                attrs: {
                  title: v.getDataToLocalTime(
                    params.row.createdTime,
                    "fulltime"
                  )
                }
              },
              v.getDataToLocalTime(params.row.estimatedArrivalTime)
            );
          }
        }
      ],
      sampleDate: []
    };
  },
  created () {
    // window.document.title = "样品采购管理";
    this.getList();
  },
  methods: {
    setTableColumns (data) {
      this.$nextTick(() => {
        this.filterHaveDoneTableColumns = data;
      });
    },
    supplierMt (params, callback) {
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
              v.$refs.CommonPurchaseOrder.OrderText[0].content = v.getDataToLocalTime(
                res.datas.createdTime,
                "fulltime"
              );
              v.$refs.CommonPurchaseOrder.OrderText[1].content = v.getDataToLocalTime(
                res.datas.actualArrivalTime,
                "fulltime"
              );
              v.$store.commit("product1688Url", res.datas.quotationProductUrl);
              v.$store.commit("orderState", true); // 显示订单状态
              v.$store.commit("purchaseId", params.row.purchaseId);
              if (params.row.is1688Order === 1) {
                v.$store.commit("set1688State", true);
              } else {
                v.$store.commit("set1688State", false);
              }
              callback && callback();
            }
          }
        })
        .catch(() => { });
    },
    changePage (page) {
      let v = this;
      v.allListFormValidate.pageNum = page;
      v.getList();
    },
    changePageSize (val) {
      this.allListFormValidate.pageSize = +val;
      if (val !== undefined) {
        localStorage.setItem("pageSize", val);
      }
      this.getList();
    },
    operationMt (operationStatus, purchaseId) {
      let v = this;
      v.$axios
        .get(
          api.operation +
          "?operationStatus=" +
          operationStatus +
          "&purchaseId=" +
          purchaseId
        )
        .then((res) => {
          if (res.code === 0) {
            v.$msg.success("操作成功");
            v.getList();
          }
        })
        .catch(() => { });
    },
    searchProduct () {
      let v = this;
      v.allListFormValidate.pageNum = 1;
      v.allListFormValidate.pageSize = 10;
      v.getList();
    },
    resetSearch () {
      let v = this;
      for (let key in v.allListFormValidate) {
        v.allListFormValidate[key] = null;
      }
      v.allListFormValidate.pageNum = 1;
      v.allListFormValidate.pageSize = 10;
      v.getList();
    },
    getList () {
      let v = this;
      if (localStorage.getItem("pageSize")) {
        v.allListFormValidate.pageSize = +localStorage.getItem("pageSize");
      }
      v.tableLoading = true;
      v.$axios
        .post(api.queryPurchase, v.allListFormValidate)
        .then((res) => {
          v.tableLoading = false;
          if (res.code === 0) {
            v.sampleDate = res.datas.list;
            v.total = res.datas.total;
          }
        })
        .catch(() => {
          v.tableLoading = false;
        });
    },
    lookMethod (params) {
      let v = this;
      v.params = params;
      v.$refs.commonMessage.createDemand = true;
      v.$store.commit("createId", params.row.productId);
    }
  }
};
</script>

<style scoped></style>
