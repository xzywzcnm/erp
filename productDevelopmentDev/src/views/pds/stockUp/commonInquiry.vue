<template>
  <div>
    <div class="demandBoxTit">
      <h3>
        询价<Button class="ml10" v-show="
            $store.state.curNodeId === 3 && $store.state.curNodeControl === 999
          " @click="addSupplierBtn">新增询价</Button>
        <span style="color: red; font-weight: 100; margin-left: 100px">预期售价： {{ expectedSellPrice }}{{ sellPriceCurrency }}</span>
        <span style="color: red; font-weight: 100; margin-left: 20px">目标利润率：{{ profitRate }}%</span>
        <Button style="margin-left: 30px;" v-if="($store.state.curNodeId === 3 && $store.state.curNodeControl === 999) || (inquiryDate && inquiryDate.length)" @click="openCalc">成本及费用设置</Button>
      </h3>
    </div>
    <Tabs :value="inquiryTab" @on-click="clickTabs">
      <TabPane label="询价列表" name="list" key="inquiry00001"> </TabPane>
      <TabPane v-if="inquiryTab != 'list'" label="询价详情" key="inquiry00002" name="detail" disabled="">
      </TabPane>
    </Tabs>
    <Table v-if="inquiryTab === 'list'" class="inquiryTab" :columns="inquiryTableColumns" :data="inquiryDate" height="350" highlight-row :loading="tableLoading"></Table>

    <!-- 新增询价 -->
    <CommonAddSupplier v-if="inquiryTab != 'list'" ref="CommonAddSupplier" :type="supplierType" strQuotationId="strQuotationId" :list="inquiryDate" @goTabList="goTabList"></CommonAddSupplier>
    <CommonPurchaseOrder ref="CommonPurchaseOrder"></CommonPurchaseOrder>
    <calc
      ref="calcIq"
      v-if="$store.state.baseInfo"
      :platform="$store.state.baseInfo.saleChannel"
      :epSellPrice="$store.state.baseInfo.expectedSellPrice"
      :sellPriceCurrency="$store.state.baseInfo.sellPriceCurrency"
      :curType="'created'"
    ></calc>
  </div>
</template>

<script>
import CommonMixin from "../../../components/mixin/commonMixin";
import CommonAddSupplier from "./commonAddSupplier";
import CommonPurchaseOrder from "./purchaseOrder";
import calc from "./costCalculation";
import api from "@/api/api";

export default {
  name: "commonSampling", // 询价
  mixins: [CommonMixin],
  components: {
    CommonAddSupplier,
    CommonPurchaseOrder,
    calc
  },
  data () {
    let v = this;
    return {
      tableLoading: false,
      inquiryTab: "list", //list列表 detail询价详情
      supplierType: "",
      strQuotationId: "",
      disabled: true,
      inquiryTableColumns: [
        {
          align: "center",
          title: "序号",
          width: 60,
          key: "index",
        },
        {
          align: "center",
          title: "供货商名称",
          width: 100,
          key: "supplierName",
        },
        {
          align: "center",
          title: "产品单价",
          width: 90,
          render (h, params) {
            if (params.row.unitPrice !== null) {
              return h(
                "div",
                {
                  class: "line2",
                  attrs: {
                    title:
                      params.row.unitPrice.toFixed(2) +
                      params.row.unitPriceCurrency,
                  },
                },
                params.row.unitPrice.toFixed(2) + params.row.unitPriceCurrency
              );
            } else {
              return "无数据";
            }
          },
        },
        {
          align: "center",
          title: "采购运费",
          width: 90,
          render (h, params) {
            if (params.row.freightPrice !== null) {
              return h(
                "div",
                {
                  class: "line2",
                  attrs: {
                    title:
                      params.row.freightPrice.toFixed(2) +
                      params.row.freightPriceCurrency,
                  },
                },
                params.row.freightPrice.toFixed(2) +
                params.row.freightPriceCurrency
              );
            } else {
              return "无数据";
            }
          },
        },
        {
          align: "center",
          title: "目标利润率(%)",
          width: 120,
          key: "profitRate",
          render (h, params) {
            if (params.row.profitRate !== null) {
              return h(
                "div",
                {
                  class: "line2",
                  attrs: {
                    title: params.row.profitRate.toFixed(2),
                  },
                },
                params.row.profitRate.toFixed(2)
              );
            }
          },
        },
        {
          align: "center",
          title: "起批量",
          width: 80,
          key: "minBatch",
          render (h, params) {
            return h(
              "div",
              {
                class: "line2",
                attrs: {
                  title: params.row.minBatch,
                },
              },
              params.row.minBatch
            );
          },
        },
        {
          align: "center",
          title: "交期(天)",
          width: 80,
          key: "purchasePeriod",
          render (h, params) {
            return h(
              "div",
              {
                class: "line2",
                attrs: {
                  title: params.row.purchasePeriod,
                },
              },
              params.row.purchasePeriod
            );
          },
        },
        {
          align: "center",
          title: "是否默认",
          width: 90,
          render (h, params) {
            if (params.row.isDefault === 0) {
              return h("div", "否");
            } else if (params.row.isDefault === 1) {
              return h("div", "是");
            }
          },
        },
        {
          align: "center",
          title: "备注",
          key: "remark",
          width: 90,
          render (h, params) {
            return h(
              "div",
              {
                class: "tabRemark",
                attrs: {
                  title: params.row.remark,
                },
              },
              params.row.remark
            );
          },
        },
        {
          key: "enableFlag",
          align: "left",
          title: "操作",
          fixed: "right",
          minWidth: 90,
          render: (h, params) => {
            let curNodeId = v.$store.state.curNodeId;
            let productCurNodeId = v.$store.state.productCurNodeId;
            let curNodeControl = v.$store.state.curNodeControl;
            if (
              (curNodeId === 3 || productCurNodeId === 1) &&
              curNodeControl === 999
            ) {
              return h("local-down-button", {
                props: {
                  data: {
                    btn: {
                      text: (() => {
                        if (curNodeId === 3) {
                          return "编辑";
                        } else {
                          if (productCurNodeId === 1) {
                            return "下单取样";
                          } else {
                            return "查看";
                          }
                        }
                      })(),
                      clickFn: () => {
                        if (productCurNodeId === 1) {
                          v.$store.commit("isEditInquiry", false);
                          v.$store.commit(
                            "quotationId",
                            params.row.quotationId
                          );
                          v.$store.commit("set1688State", false);
                          v.$store.commit("orderState", false); // 关闭订单状态
                          v.$refs.CommonPurchaseOrder.$refs.samplingForm.resetFields();
                          v.$refs.CommonPurchaseOrder.samplingForm = {
                            account1688: "", // 1688买家账号
                            actualArrivalTime: "", // 实际到货时间
                            currencyType: "CNY", // 币种
                            estimatedArrivalTime: "", // 预计到货时间
                            freightPrice: "", // 运费
                            goodsPrice: "", // 货款
                            payMethod: 1, // 结算方式
                            payStatus: "", // 付款状态  0未申请付款，1已申请付款，2已付款，3已取消付款
                            priceHadPay: "", // 实际已付款
                            productId: v.$store.state.createId, // 产品id
                            purchaseCode: "", // 采购单号
                            purchaseId: "", // 采购单id
                            purchasePerson: "", // 采购人
                            purchaseStatus: "", // 采购状态  0等待到货，1已到货，2已作废
                            quotationId: "", // 供应商询价信息id
                            serialNum: "", // 外部流水号
                            supplierName: "", // 供应商
                            totalPrice: "", // 实际应付款
                            tracingCode: "", // 跟踪号
                            transportType: "", // 运输方式
                            warehouseId: "", // 仓库id
                            productGoodsInfoResultList: [
                              /* {
                               productGoodsId: "", //货品详情id
                               purchaseAmount: "",  //采购数量
                               purchaseDetailId: "",   //采购详情id
                               purchaseId: "",   //样品采购id
                               unitPrice: "",   //单价
                               variationCode:"",   //货品多属性编码
                               goodsUrl:"",  //货品(首图)图片URl
                               goodsSku:"",  //货品sku
                               productName:"",  //货品名称
                               specifications:[]  //规格
                               } */
                            ],
                            purchaseRemarkList: [
                              {
                                remarkId: "", // 备注ID
                                purchaseId: "", // 样品采购ID
                                remarkContent: "", // 备注内容
                              },
                            ],
                          };
                          v.$refs.CommonPurchaseOrder.purchaseRemarkList = [];
                          v.$refs.CommonPurchaseOrder.getQueryProductQuotationDetail(
                            params.row.quotationId
                          ); // 供应商详情，为了拿到多属性列表
                          v.$refs.CommonPurchaseOrder.samplingForm.supplierName =
                            params.row.supplierName;
                          v.$refs.CommonPurchaseOrder.purchasePerson =
                            params.row.userInfo.userName;
                          v.$refs.CommonPurchaseOrder.samplingForm.purchasePerson =
                            params.row.userInfo.userId;
                          v.$refs.CommonPurchaseOrder.samplingForm.supplier =
                            params.row.supplier;
                          v.$refs.CommonPurchaseOrder.samplingForm.quotationId =
                            params.row.quotationId;
                          v.$refs.CommonPurchaseOrder.samplingForm.productId =
                            v.$store.state.createId;
                          v.$refs.CommonPurchaseOrder.samplingModal = true;
                        } else {
                          v.goNext(params);
                        }
                      },
                    },
                    list: [
                      {
                        text: "1688下单", // 1688 下单
                        value: 1,
                        hide: !(
                          params.row.is1688Product && productCurNodeId === 1
                        ),
                        clickFn: () => {
                          // 1688 下单
                          if (productCurNodeId === 1) {
                            v.$store.commit("isEditInquiry", false);
                            v.$store.commit(
                              "quotationId",
                              params.row.quotationId
                            );
                            v.$store.commit(
                              "product1688Url",
                              params.row.productUrl
                            );
                            v.$store.commit("set1688State", true);
                            v.$store.commit("orderState", false); // 关闭订单状态
                            v.$refs.CommonPurchaseOrder.$refs.samplingForm.resetFields();
                            v.$refs.CommonPurchaseOrder.samplingForm = {
                              account1688: "", // 1688买家账号
                              actualArrivalTime: "", // 实际到货时间
                              currencyType: "CNY", // 币种
                              estimatedArrivalTime: "", // 预计到货时间
                              freightPrice: "", // 运费
                              goodsPrice: "", // 货款
                              payMethod: 1, // 结算方式
                              payStatus: "", // 付款状态  0未申请付款，1已申请付款，2已付款，3已取消付款
                              priceHadPay: "", // 实际已付款
                              productId: v.$store.state.createId, // 产品id
                              purchaseCode: "", // 采购单号
                              purchaseId: "", // 采购单id
                              purchasePerson: "", // 采购人
                              purchaseStatus: "", // 采购状态  0等待到货，1已到货，2已作废
                              quotationId: "", // 供应商询价信息id
                              serialNum: "", // 外部流水号
                              supplierName: "", // 供应商
                              totalPrice: "", // 实际应付款
                              tracingCode: "", // 跟踪号
                              transportType: "", // 运输方式
                              warehouseId: "", // 仓库id
                              productGoodsInfoResultList: [
                                /* {
                                 productGoodsId: "", //货品详情id
                                 purchaseAmount: "",  //采购数量
                                 purchaseDetailId: "",   //采购详情id
                                 purchaseId: "",   //样品采购id
                                 unitPrice: "",   //单价
                                 variationCode:"",   //货品多属性编码
                                 goodsUrl:"",  //货品(首图)图片URl
                                 goodsSku:"",  //货品sku
                                 productName:"",  //货品名称
                                 specifications:[]  //规格
                                 } */
                              ],
                              purchaseRemarkList: [
                                {
                                  remarkId: "", // 备注ID
                                  purchaseId: "", // 样品采购ID
                                  remarkContent: "", // 备注内容
                                },
                              ],
                            };
                            v.$refs.CommonPurchaseOrder.purchaseRemarkList = [];
                            v.$refs.CommonPurchaseOrder.getQueryProductQuotationDetail(
                              params.row.quotationId
                            ); // 供应商详情，为了拿到多属性列表
                            v.$refs.CommonPurchaseOrder.samplingForm.supplierName =
                              params.row.supplierName;
                            v.$refs.CommonPurchaseOrder.purchasePerson =
                              params.row.userInfo.userName;
                            v.$refs.CommonPurchaseOrder.samplingForm.purchasePerson =
                              params.row.userInfo.userId;
                            v.$refs.CommonPurchaseOrder.samplingForm.supplier =
                              params.row.supplier;
                            v.$refs.CommonPurchaseOrder.samplingForm.quotationId =
                              params.row.quotationId;
                            v.$refs.CommonPurchaseOrder.samplingForm.productId =
                              v.$store.state.createId;
                            v.$refs.CommonPurchaseOrder.samplingModal = true;
                          } else {
                            v.goNext(params);
                          }
                        },
                      },
                      {
                        text: "查看", // 查看
                        value: 2,
                        hide: productCurNodeId !== 1,
                        clickFn: () => {
                          // 查看
                          v.goNext(params);
                        },
                      },
                      {
                        text: "设置为默认供应商", // 设置默认供应商
                        value: 3,
                        hide: curNodeId !== 3,
                        clickFn: () => {
                          // 设置为默认供应商
                          v.$axios
                            .post(api.setDefaultSupplier, {
                              productId: v.$store.state.createId, // 新品需求ID
                              quotationId: params.row.quotationId, // 供应商报价ID，必需
                            })
                            .then((res) => {
                              if (res.code === 0) {
                                v.$msg.success("设置默认供应商成功");
                                v.getList();
                              }
                            })
                            .catch(() => { });
                        },
                      },
                      {
                        text: "删除", // 删除
                        value: 4,
                        hide: curNodeId !== 3,
                        clickFn: () => {
                          // 删除
                          if (v.$store.state.curNodeId === 3) {
                            v.isDelModal(() => {
                              v.delSrpplier({
                                productId: v.$store.state.createId, // 新品需求ID
                                quotationId: params.row.quotationId,
                              });
                            });
                          }
                        },
                      },
                    ],
                  },
                },
              });
              // return h("div", [
              //   h(
              //     "Buttons",
              //     {
              //       props: {
              //         trigger: "click",
              //       },
              //       class: "defaultStyle trimming",
              //       on: {
              //         "on-click": (val) => {
              //           v.$store.commit("createId", params.row.productId);
              //           switch (val) {
              //             case "1":
              //               if (v.$store.state.curNodeId === 3) {
              //                 v.delSrpplier({
              //                   productId: v.$store.state.createId, // 新品需求ID
              //                   quotationId: params.row.quotationId,
              //                 });
              //               }
              //               break;
              //             case "2":
              //               // 查看
              //               v.goNext(params);
              //               break;
              //             case "3":
              //               // 删除
              //               if (v.$store.state.curNodeId === 3) {
              //                 v.isDelModal(() => {
              //                   v.delSrpplier({
              //                     productId: v.$store.state.createId, // 新品需求ID
              //                     quotationId: params.row.quotationId,
              //                   });
              //                 });
              //               }
              //               break;
              //             case "4":
              //               // 1688 下单
              //               if (v.$store.state.productCurNodeId === 1) {
              //                 v.$store.commit("isEditInquiry", false);
              //                 v.$store.commit(
              //                   "quotationId",
              //                   params.row.quotationId
              //                 );
              //                 v.$store.commit(
              //                   "product1688Url",
              //                   params.row.productUrl
              //                 );
              //                 v.$store.commit("set1688State", true);
              //                 v.$store.commit("orderState", false); // 关闭订单状态
              //                 v.$refs.CommonPurchaseOrder.$refs.samplingForm.resetFields();
              //                 v.$refs.CommonPurchaseOrder.samplingForm = {
              //                   account1688: "", // 1688买家账号
              //                   actualArrivalTime: "", // 实际到货时间
              //                   currencyType: "CNY", // 币种
              //                   estimatedArrivalTime: "", // 预计到货时间
              //                   freightPrice: "", // 运费
              //                   goodsPrice: "", // 货款
              //                   payMethod: 1, // 结算方式
              //                   payStatus: "", // 付款状态  0未申请付款，1已申请付款，2已付款，3已取消付款
              //                   priceHadPay: "", // 实际已付款
              //                   productId: v.$store.state.createId, // 产品id
              //                   purchaseCode: "", // 采购单号
              //                   purchaseId: "", // 采购单id
              //                   purchasePerson: "", // 采购人
              //                   purchaseStatus: "", // 采购状态  0等待到货，1已到货，2已作废
              //                   quotationId: "", // 供应商询价信息id
              //                   serialNum: "", // 外部流水号
              //                   supplierName: "", // 供应商
              //                   totalPrice: "", // 实际应付款
              //                   tracingCode: "", // 跟踪号
              //                   transportType: "", // 运输方式
              //                   warehouseId: "", // 仓库id
              //                   productGoodsInfoResultList: [
              //                     /* {
              //                    productGoodsId: "", //货品详情id
              //                    purchaseAmount: "",  //采购数量
              //                    purchaseDetailId: "",   //采购详情id
              //                    purchaseId: "",   //样品采购id
              //                    unitPrice: "",   //单价
              //                    variationCode:"",   //货品多属性编码
              //                    goodsUrl:"",  //货品(首图)图片URl
              //                    goodsSku:"",  //货品sku
              //                    productName:"",  //货品名称
              //                    specifications:[]  //规格
              //                    } */
              //                   ],
              //                   purchaseRemarkList: [
              //                     {
              //                       remarkId: "", // 备注ID
              //                       purchaseId: "", // 样品采购ID
              //                       remarkContent: "", // 备注内容
              //                     },
              //                   ],
              //                 };
              //                 v.$refs.CommonPurchaseOrder.purchaseRemarkList = [];
              //                 v.$refs.CommonPurchaseOrder.getQueryProductQuotationDetail(
              //                   params.row.quotationId
              //                 ); // 供应商详情，为了拿到多属性列表
              //                 v.$refs.CommonPurchaseOrder.samplingForm.supplierName =
              //                   params.row.supplierName;
              //                 v.$refs.CommonPurchaseOrder.purchasePerson =
              //                   params.row.userInfo.userName;
              //                 v.$refs.CommonPurchaseOrder.samplingForm.purchasePerson =
              //                   params.row.userInfo.userId;
              //                 v.$refs.CommonPurchaseOrder.samplingForm.supplier =
              //                   params.row.supplier;
              //                 v.$refs.CommonPurchaseOrder.samplingForm.quotationId =
              //                   params.row.quotationId;
              //                 v.$refs.CommonPurchaseOrder.samplingForm.productId =
              //                   v.$store.state.createId;
              //                 v.$refs.CommonPurchaseOrder.samplingModal = true;
              //               } else {
              //                 v.goNext(params);
              //               }
              //               //  v.$store.commit('set1688State',true);
              //               break;
              //             case "5":
              //               // 设置为默认供应商
              //               v.$axios
              //                 .post(api.setDefaultSupplier, {
              //                   productId: v.$store.state.createId, // 新品需求ID
              //                   quotationId: params.row.quotationId, // 供应商报价ID，必需
              //                 })
              //                 .then((res) => {
              //                   if (res.code === 0) {
              //                     v.$msg.success("设置默认供应商成功");
              //                     v.getList();
              //                   }
              //                 })
              //                 .catch(() => { });
              //               break;
              //           }
              //         },
              //       },
              //     },
              //     [
              //       h(
              //         "Button",
              //         {
              //           type: "default",
              //           on: {
              //             click () {
              //               if (v.$store.state.productCurNodeId === 1) {
              //                 v.$store.commit("isEditInquiry", false);
              //                 v.$store.commit(
              //                   "quotationId",
              //                   params.row.quotationId
              //                 );
              //                 v.$store.commit("set1688State", false);
              //                 v.$store.commit("orderState", false); // 关闭订单状态
              //                 v.$refs.CommonPurchaseOrder.$refs.samplingForm.resetFields();
              //                 v.$refs.CommonPurchaseOrder.samplingForm = {
              //                   account1688: "", // 1688买家账号
              //                   actualArrivalTime: "", // 实际到货时间
              //                   currencyType: "CNY", // 币种
              //                   estimatedArrivalTime: "", // 预计到货时间
              //                   freightPrice: "", // 运费
              //                   goodsPrice: "", // 货款
              //                   payMethod: 1, // 结算方式
              //                   payStatus: "", // 付款状态  0未申请付款，1已申请付款，2已付款，3已取消付款
              //                   priceHadPay: "", // 实际已付款
              //                   productId: v.$store.state.createId, // 产品id
              //                   purchaseCode: "", // 采购单号
              //                   purchaseId: "", // 采购单id
              //                   purchasePerson: "", // 采购人
              //                   purchaseStatus: "", // 采购状态  0等待到货，1已到货，2已作废
              //                   quotationId: "", // 供应商询价信息id
              //                   serialNum: "", // 外部流水号
              //                   supplierName: "", // 供应商
              //                   totalPrice: "", // 实际应付款
              //                   tracingCode: "", // 跟踪号
              //                   transportType: "", // 运输方式
              //                   warehouseId: "", // 仓库id
              //                   productGoodsInfoResultList: [
              //                     /* {
              //                  productGoodsId: "", //货品详情id
              //                  purchaseAmount: "",  //采购数量
              //                  purchaseDetailId: "",   //采购详情id
              //                  purchaseId: "",   //样品采购id
              //                  unitPrice: "",   //单价
              //                  variationCode:"",   //货品多属性编码
              //                  goodsUrl:"",  //货品(首图)图片URl
              //                  goodsSku:"",  //货品sku
              //                  productName:"",  //货品名称
              //                  specifications:[]  //规格
              //                  } */
              //                   ],
              //                   purchaseRemarkList: [
              //                     {
              //                       remarkId: "", // 备注ID
              //                       purchaseId: "", // 样品采购ID
              //                       remarkContent: "", // 备注内容
              //                     },
              //                   ],
              //                 };
              //                 v.$refs.CommonPurchaseOrder.purchaseRemarkList = [];
              //                 v.$refs.CommonPurchaseOrder.getQueryProductQuotationDetail(
              //                   params.row.quotationId
              //                 ); // 供应商详情，为了拿到多属性列表
              //                 v.$refs.CommonPurchaseOrder.samplingForm.supplierName =
              //                   params.row.supplierName;
              //                 v.$refs.CommonPurchaseOrder.purchasePerson =
              //                   params.row.userInfo.userName;
              //                 v.$refs.CommonPurchaseOrder.samplingForm.purchasePerson =
              //                   params.row.userInfo.userId;
              //                 v.$refs.CommonPurchaseOrder.samplingForm.supplier =
              //                   params.row.supplier;
              //                 v.$refs.CommonPurchaseOrder.samplingForm.quotationId =
              //                   params.row.quotationId;
              //                 v.$refs.CommonPurchaseOrder.samplingForm.productId =
              //                   v.$store.state.createId;
              //                 v.$refs.CommonPurchaseOrder.samplingModal = true;
              //               } else {
              //                 v.goNext(params);
              //               }
              //             },
              //           },
              //         },
              //         [
              //           h("span", {
              //             style: {
              //               top: "0",
              //             },
              //           }),
              //           h("span", {
              //             domProps: {
              //               innerHTML: (function () {
              //                 if (v.$store.state.curNodeId === 3) {
              //                   return "编辑";
              //                 } else {
              //                   if (v.$store.state.productCurNodeId === 1) {
              //                     return "下单取样";
              //                   } else {
              //                     return "查看";
              //                   }
              //                 }
              //               })(),
              //             },
              //           }),
              //           h("span", {
              //             style: {
              //               marginLeft: "5px",
              //             },
              //           }),
              //         ]
              //       ),
              //       (() => {
              //         if (
              //           params.row.is1688Product &&
              //           v.$store.state.productCurNodeId === 1
              //         ) {
              //           return h(
              //             "Buttons-menu",
              //             {
              //               slot: "list",
              //             },
              //             [
              //               h(
              //                 "Buttons-item",
              //                 {
              //                   props: {
              //                     name: "4",
              //                   },
              //                 },
              //                 "1688下单"
              //               ),
              //             ]
              //           );
              //         }
              //       })(),
              //       (function () {
              //         if (v.$store.state.productCurNodeId === 1) {
              //           return h(
              //             "Buttons-menu",
              //             {
              //               slot: "list",
              //             },
              //             [
              //               h(
              //                 "Buttons-item",
              //                 {
              //                   props: {
              //                     name: "2",
              //                   },
              //                 },
              //                 "查看"
              //               ),
              //             ]
              //           );
              //         } else if (v.$store.state.curNodeId === 3) {
              //           return h(
              //             "Buttons-menu",
              //             {
              //               slot: "list",
              //             },
              //             [
              //               h(
              //                 "Buttons-item",
              //                 {
              //                   props: {
              //                     name: "3",
              //                   },
              //                 },
              //                 "删除"
              //               ),
              //               h(
              //                 "Buttons-item",
              //                 {
              //                   props: {
              //                     name: "5",
              //                   },
              //                 },
              //                 "设置为默认供应商"
              //               ),
              //             ]
              //           );
              //         }
              //       })(),
              //     ]
              //   ),
              // ]);
            } else {
              return h("div", [
                h(
                  "Button",
                  {
                    type: "default",
                    on: {
                      click () {
                        v.goNext(params);
                      },
                    },
                  },
                  [h("span", "查看")]
                ),
              ]);
            }
          },
        },
      ],
      inquiryDate: [],
    };
  },
  created () {
    let v = this;
    // v.getList();
    v.$store.commit("inquiryList", []);
  },
  methods: {
    async openCalc () {
      await this.$refs.calcIq.getCost();
      this.$refs.calcIq.calcModal = true;
    },
    goNext (params) {
      let v = this;
      v.disabled = false;
      v.inquiryTab = "detail";
      v.supplierType = "edit";
      v.$store.commit("addSupplierType", "edit");
      setTimeout(() => {
        v.$refs.CommonAddSupplier.$refs.supplierRefSelect.query =
          params.row.supplierName;
        v.$refs.CommonAddSupplier.getVariListMt();
        // v.$refs.CommonAddSupplier.resetDate();
        v.$refs.CommonAddSupplier.getQueryProductQuotationDetail(
          params.row.quotationId
        );
      }, 80);
    },
    supplierMt (params) {
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
              if (params.row.is1688Order === 1) {
                v.$store.commit("set1688State", true);
                v.$refs.CommonPurchaseOrder.getAlibabaOrderLogisticsInfo(
                  params.row.purchaseId
                );
              } else {
                v.$store.commit("set1688State", false);
              }
            }
          }
        })
        .catch(() => { });
    },
    // 新增询价
    addSupplierBtn () {
      let v = this;
      v.inquiryTab = "detail";
      v.supplierType = "add";
      v.$store.commit("addSupplierType", "add");
      this.$nextTick(() => {
        v.$refs.CommonAddSupplier.getVariListMt();
        v.$refs.CommonAddSupplier.$refs.selectA.reset();
        v.$refs.CommonAddSupplier.getCountryId('64961f3d-9e6b-11e7-87bc-0050568e2f6d');
        // v.$refs.CommonAddSupplier.addSupplier.deliveredFromCountry='64961f3d-9e6b-11e7-87bc-0050568e2f6d'
      }, 30);
    },
    delSrpplier (params) {
      let v = this;
      v.$axios
        .post(api.deleteProductQuotation, params)
        .then((res) => {
          if (res.code === 0) {
            v.$msg.success("删除成功");
            v.getList();
          } else {
            v.$msg.error("删除失败");
          }
        })
        .catch(() => {
          v.$msg.error("删除失败");
        });
    },
    goTabList (name) {
      let v = this;
      v.inquiryTab = name;
      v.getList();
    },
    clickTabs (name) {
      let v = this;
      if (name === "list") {
        v.getList();
        v.inquiryTab = "list";
        this.$store.commit("addSupplierType", "");
      } else if (name === "detail") {
        this.$store.commit("addSupplierType", "add");
      }
    },
    // 询价列表
    getList () {
      let v = this;
      v.tableLoading = true;
      v.$axios
        .post(api.queryQuotationInfo, {
          productId: v.$store.state.createId, // 产品id
          category: "XJ", // 新品开发需求类别(JBXX基本信息,DSX多属性,TPXX图片信息,XXMS详细描述,CZRZ操作日志,XJ询价,QY取样)
        })
        .then((res) => {
          if (res.code === 0) {
            let arr = res.datas.quotationInfoList || [];
            arr.forEach((item, index) => {
              item.index = index + 1;
            });
            v.inquiryDate = arr;
            v.$store.commit("inquiryList", arr);
          }
        })
        .finally(() => {
          v.tableLoading = false;
        });
    },
  },
  computed: {
    expectedSellPrice () {
      let v = this;
      if (v.$store.state.baseInfo) {
        return v.$store.state.baseInfo.expectedSellPrice;
      } else {
        return "";
      }
    },
    sellPriceCurrency () {
      let v = this;
      if (v.$store.state.baseInfo) {
        return v.$store.state.baseInfo.sellPriceCurrency;
      } else {
        return "";
      }
    },
    profitRate () {
      let v = this;
      if (v.$store.state.baseInfo) {
        return v.$store.state.baseInfo.profitRate;
      } else {
        return "";
      }
    },
  },
};
</script>

<style>
.inquiryTab .ivu-table-column-center .ivu-table-cell {
  white-space: normal;
}

.inquiryTab table {
  width: 100%;
}

.tabRemark {
  overflow: hidden;

  text-overflow: ellipsis;

  display: -webkit-box;

  -webkit-box-orient: vertical;

  -webkit-line-clamp: 2;
}

.sampling .ivu-form-item-label {
  width: 90px !important;
}

.sampling .ivu-form-item-error-tip {
  left: 90px !important;
}

.samp .ivu-form-item-required .ivu-form-item-label:before {
  content: "";
}
</style>
<style scoped>
.demandBoxTit h3 {
  font-weight: 600;
  font-size: 16px;
  padding: 10px 0 10px 15px;
}

.bInfo {
  font-weight: bold;
}
</style>
