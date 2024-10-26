<template>
  <div>
    <div>
      <Modal
        v-model="samplingModal"
        title="样品采购单"
        class="clearMarginAuto sampling1"
        width="1130"
        @on-visible-change="sampVisble"
      >
        <p slot="header" @mousedown="moveMt" class="moveHead">
          <span>样品采购单</span>
        </p>
        <div v-if="$store.state.orderState">
          <p>
            采购单号:{{ samplingForm.purchaseCode }}
            <span class="ml5" style="color: #008000">{{ stateOrderText }}</span>
          </p>
          <div v-if="$store.state.is1688">
            <p>
              1688交易状态
              <Button size="small" @click="getAlibabaOrderLogisticsInfo"
                >同步</Button
              >
            </p>
            <Steps
              :current="stateStep"
              :size="'small'"
              style="margin-bottom: 10px"
            >
              <Step
                v-for="(item, index) in stateText"
                :key="index"
                :title="item.text"
              ></Step>
            </Steps>
          </div>
          <div v-else>
            <p>采购状态</p>
            <Steps
              :current="stateOrderStep"
              :size="'small'"
              style="margin-bottom: 10px"
            >
              <Step
                v-for="(item, index) in OrderText"
                :key="index"
                :title="item.text"
                :content="item.content"
              ></Step>
            </Steps>
          </div>
        </div>
        <Form
          ref="samplingForm"
          :model="samplingForm"
          :rules="samplingRules"
          class="samp"
        >
          <h3 class="bInfo">基本信息</h3>
          <Row>
            <!--<Col span="10">
              <FormItem prop="warehouseId">
                <label slot="label" class="redDot">采购仓库</label>
                <dyt-select style="width: calc(100% - 110px);" :disabled="$store.state.isEditInquiry" v-model="samplingForm.warehouseId">
                  <Option value="123456">样品仓</Option>
                  <Option value="123457">仓库2</Option>
                </dyt-select>
              </FormItem>
            </Col>-->
            <Col span="10">
              <FormItem>
                <label slot="label">供应商</label>
                <span>{{ samplingForm.supplierName }}</span>
              </FormItem>
            </Col>
            <Col span="10" offset="1">
              <FormItem prop="purchasePerson">
                <label slot="label" class="redDot">采购人员</label>
                <span>{{ purchasePerson }}</span>
                <!--<dyt-select style="width: calc(100% - 110px);" v-model="samplingForm.purchasePerson" :disabled="$store.state.isEditInquiry">
                  <Option value="0075">采购专员1</Option>
                  <Option value="003">采购专员2</Option>
                </dyt-select>-->
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span="10">
              <FormItem prop="currencyType">
                <label slot="label" class="redDot">币种</label>
                <dyt-select
                  style="width: calc(100% - 110px)"
                  v-model="samplingForm.currencyType"
                  :disabled="$store.state.isEditInquiry"
                >
                  <Option
                    v-for="(item, index) in $store.state.currencyList"
                    :key="index"
                    :value="item.code"
                    >{{ item.name }}</Option
                  >
                </dyt-select>
              </FormItem>
            </Col>
            <Col span="10" offset="1">
              <FormItem>
                <label slot="label">实际已付货款</label>
                <Input
                  style="width: calc(100% - 110px)"
                  v-model.trim="samplingForm.priceHadPay"
                  :maxlength="20"
                  :disabled="$store.state.isEditInquiry"
                />
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span="10">
              <FormItem>
                <label slot="label">结算方式</label>
                <dyt-select
                  style="width: calc(100% - 110px)"
                  v-model="samplingForm.payMethod"
                  :disabled="$store.state.isEditInquiry"
                >
                  <Option
                    v-for="(item, index) in payMethodList"
                    :key="index"
                    :value="item.value"
                    >{{ item.text }}</Option
                  >
                </dyt-select>
              </FormItem>
            </Col>
            <Col span="10" offset="1">
              <FormItem>
                <label slot="label">货款</label>
                <Input
                  style="width: calc(100% - 110px)"
                  v-model.trim="samplingForm.goodsPrice"
                  :disabled="$store.state.isEditInquiry"
                  :maxlength="20"
                />
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span="10">
              <FormItem>
                <label slot="label">运费</label>
                <Input
                  style="width: calc(100% - 110px)"
                  v-model.trim="samplingForm.freightPrice"
                  :disabled="$store.state.isEditInquiry"
                  :maxlength="20"
                />
              </FormItem>
            </Col>
            <Col span="10" offset="1">
              <FormItem>
                <label slot="label">实际应付货款</label>
                <Input
                  :disabled="$store.state.isEditInquiry"
                  v-model.trim="samplingForm.totalPrice"
                  :maxlength="20"
                  style="width: calc(100% - 110px)"
                />
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span="10">
              <FormItem prop="shippingAddressId">
                <label slot="label" class="redDot">收货地址</label>
                <dyt-select
                  v-model="samplingForm.shippingAddressId"
                  :disabled="$store.state.isEditInquiry"
                  style="width: calc(100% - 110px)"
                >
                  <Option
                    v-for="item in addressDate"
                    :value="item.shippingAddressId"
                    :key="item.shippingAddressId"
                    >{{ item.warehouseName }}</Option
                  >
                </dyt-select>
              </FormItem>
            </Col>
          </Row>
          <h3 class="bInfo">运输信息</h3>
          <Row>
            <Col span="10">
              <FormItem>
                <label slot="label">运输方式</label>
                <dyt-select
                  style="width: calc(100% - 110px)"
                  v-model="samplingForm.transportType"
                  :disabled="$store.state.isListInquiry"
                >
                  <OptionGroup
                    v-for="(group, index) in getLogisticsCompanyListGroup"
                    :key="index"
                    :label="group.name"
                  >
                    <Option
                      v-for="item in group.child"
                      :value="item.merchantCarrierId"
                      :key="item.merchantCarrierId"
                      :label="item.merchantCarrierName"
                    ></Option>

                    <!-- <Option v-for="item in cityList1" :value="item.value" :key="item.value">{{ item.label }}</Option>-->
                  </OptionGroup>
                </dyt-select>
              </FormItem>
            </Col>
            <Col span="10" offset="1">
              <FormItem>
                <label slot="label">跟踪号</label>
                <Input
                  v-model.trim="samplingForm.tracingCode"
                  :maxlength="50"
                  :disabled="$store.state.isListInquiry"
                  style="width: calc(100% - 110px)"
                />
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span="10">
              <FormItem>
                <label slot="label">外部流水号</label>
                <Input
                  v-model.trim="samplingForm.serialNum"
                  style="width: calc(100% - 110px)"
                  :maxlength="50"
                  :disabled="$store.state.isListInquiry"
                />
              </FormItem>
            </Col>
            <Col span="10" offset="1">
              <FormItem prop="account1688">
                <label slot="label" :class="{ redDot: $store.state.is1688 }"
                  >1688买家账号</label
                >
                <dyt-select
                  style="width: calc(100% - 110px)"
                  v-model="samplingForm.account1688"
                  :disabled="$store.state.isListInquiry"
                >
                  <Option
                    v-for="item in idList"
                    :value="item.accountId"
                    :key="item.accountId"
                    >{{ item.accountCode }}</Option
                  >
                </dyt-select>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span="10">
              <FormItem>
                <label slot="label">预计到达日期</label>
                <DatePicker
                  placement="top-start"
                  type="date"
                  placeholder="请选择时间"
                  :disabled="$store.state.isListInquiry"
                  :readonly="$store.state.isListInquiry"
                  v-model="samplingForm.estimatedArrivalTime"
                  style="width: calc(100% - 110px)"
                ></DatePicker>
              </FormItem>
            </Col>
            <Col span="10" offset="1">
              <FormItem>
                <label slot="label" :class="{ redDot: $store.state.is1688 }"
                  >1688订单类型</label
                >
                <RadioGroup v-model="samplingForm.orderFlow1688">
                  <Radio label="general">大市场订单</Radio>
                  <Radio label="saleproxy">分销订单</Radio>
                </RadioGroup>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span="14">
              <FormItem>
                <label slot="label" :class="{ redDot: $store.state.is1688 }"
                  >1688交易方式</label
                >
                <RadioGroup v-model="samplingForm.tradeType1688">
                  <Radio label="alipay">支付宝担保交易</Radio>
                  <Radio label="creditBuy">诚e赊</Radio>
                  <Radio label="period">普通账期交易</Radio>
                  <Radio label="null">自动判断</Radio>
                </RadioGroup>
              </FormItem>
            </Col>
          </Row>
          <h3 class="bInfo mb10">
            商品信息
            <Button
              v-show="isAttrs && !$store.state.isEditInquiry"
              type="primary"
              style="margin-left: 10px"
              @click="openAttr"
              >新增产品</Button
            >
          </h3>
          <Table
            class="purchaseTable"
            v-if="isAttrs"
            :columns="samplingFormColumns"
            height="200"
            :data="samplingForm.productGoodsInfoResultList"
            highlight-row
          ></Table>
          <Table
            class="purchaseTable"
            v-else
            :columns="samplingProductColumns"
            height="200"
            highlight-row
            :data="samplingProduct"
          ></Table>
          <p class="bInfo" style="margin: 10px 0">备注：</p>
          <Row class="mb10">
            <Col span="10">
              <Input v-model.trim="remark" :maxlength="200" />
            </Col>
            <Col span="4">
              <Button @click="addRemark">添加备注</Button>
            </Col>
          </Row>
          <Timeline pending>
            <TimelineItem
              v-for="(item, index) in purchaseRemarkList"
              :key="index"
              >{{ item.remarkContent }}</TimelineItem
            >
          </Timeline>
        </Form>
        <div slot="footer">
          <Button type="text" @click="samplingModal = false">取消</Button>
          <Button type="primary" @click="samplingSave">保存</Button>
        </div>
      </Modal>
    </div>

    <!--新增备注-->
    <attrPrice
      ref="attrPriceTw"
      @getAttrPrice="getAttrPrice"
      :attrPriceDateInit="productGoodsInfoResultList"
      :newDateInit="samplingForm.productGoodsInfoResultList"
    ></attrPrice>
  </div>
</template>

<script>
import CommonMixin from "../../../components/mixin/commonMixin";
import attrPrice from "./commonAttrPriceTw";
import api from "@/api/api";

export default {
  name: "purchaseOrder", // 样品采购单
  mixins: [CommonMixin],
  components: {
    attrPrice
  },
  data () {
    let v = this;
    return {
      remark: "",
      orderStatuText: "",
      purchasePerson: "",
      isAttrs: true,
      modalRemarks: false,
      samplingModal: false,
      samplingProduct: [],
      getLogisticsCompanyList: [],
      OrderText: [
        {
          text: "等待到货",
          value: 0,
          content: "" // v.samplingForm.createdTime
        },
        {
          text: "到货",
          value: 1,
          content: "" // v.samplingForm.actualArrivalTime
        }
      ],
      stateText: [
        {
          text: "等待买家付款",
          value: 0
        },
        {
          text: "等待卖家发货",
          value: 1
        },
        {
          text: "等待物流公司揽件",
          value: 2
        },
        {
          text: "等待买家收货",
          value: 3
        },
        {
          text: "等待买家签收",
          value: 4
        },
        {
          text: "买家已签收",
          value: 5
        },
        {
          text: "已收货",
          value: 6
        },
        {
          text: "交易成功",
          value: 7
        }
      ],
      payMethodList: [
        {
          value: 1,
          text: "货到付款"
        },
        {
          value: 2,
          text: "款到发货"
        },
        {
          value: 4,
          text: "快递代收"
        },
        {
          value: 5,
          text: "定期结算"
        }
      ],
      samplingProductColumns: [
        {
          title: "SKU编号",
          key: "goodsSku",
          render (h, params) {
            let data = params.row.goodsSku;
            return h(
              "div",
              {
                class: "line2",
                attrs: {
                  title: data
                }
              },
              data
            );
          }
        },
        {
          title: "货品名称",
          key: "productName",
          render (h, params) {
            let data = params.row.productName;
            return h(
              "div",
              {
                class: "line2",
                attrs: {
                  title: data
                }
              },
              data
            );
          }
        },
        {
          title: "采购数量",
          key: "purchaseAmount",
          render (h, params) {
            return h("Input", {
              class: (() => {
                if (!v.goodsValid) {
                  return "redBor";
                }
              })(),
              attrs: {
                disabled: (function () {
                  if (v.$store.state.isEditInquiry) {
                    return true;
                  } else {
                    return false;
                  }
                })()
              },
              props: {
                value: params.row.purchaseAmount,
                maxlength: 9
              },
              on: {
                input: (val) => {
                  v.$set(
                    v.samplingProduct[params.index],
                    "purchaseAmount",
                    val
                  );
                  v.samplingForm.productGoodsInfoResultList = v.samplingProduct;
                },
                "on-blur": () => {
                  v.goodsValidMt();
                }
              }
            });
          }
        },
        {
          title: "采购单价",
          key: "unitPrice",
          render (h, params) {
            return h("Input", {



              
              class: (() => {
                if (!v.goodsValid) {
                  return "redBor";
                }
              })(),
              attrs: {
                disabled: (function () {
                  if (v.$store.state.isEditInquiry) {
                    return true;
                  } else {
                    return false;
                  }
                })()
              },
              props: {
                value: params.row.unitPrice,
                min: 0
              },
              on: {
                input: (val) => {
                  v.$set(v.samplingProduct[params.index], "unitPrice", val);
                  v.samplingForm.productGoodsInfoResultList = v.samplingProduct;
                },
                "on-blur": () => {
                  v.goodsValidMt();
                }
              }
            });
          }
        }
      ],
      samplingFormColumns: [
        {
          title: "SKU编号",
          key: "goodsSku",
          render (h, params) {
            let data = params.row.goodsSku;
            return h(
              "div",
              {
                class: "line2",
                attrs: {
                  title: data
                }
              },
              data
            );
          }
        },
        {
          title: "货品名称",
          key: "productName",
          render (h, params) {
            let data = params.row.productName;
            return h(
              "div",
              {
                class: "line2",
                attrs: {
                  title: data
                }
              },
              data
            );
          }
        },
        {
          title: "规格",
          render (h, params) {
            let data = params.row.specifications;
            return h(
              "div",
              {
                class: "line2",
                attrs: {
                  title: data
                }
              },
              data
            );
          }
        },
        {
          title: "采购数量",
          key: "purchaseAmount",
          render (h, params) {
            return h("Input", {
              class: (() => {
                if (!v.goodsValid) {
                  return "redBor";
                }
              })(),
              attrs: {
                disabled: (function () {
                  if (v.$store.state.isEditInquiry) {
                    return true;
                  } else {
                    return false;
                  }
                })()
              },
              props: {
                value: params.row.purchaseAmount
              },
              on: {
                input: (val) => {
                  // samplingForm.productGoodsInfoResultList
                  v.samplingForm.productGoodsInfoResultList[
                    params.index
                  ].purchaseAmount = val;
                },
                "on-blur": () => {
                  v.goodsValidMt();
                }
              },
              blur: () => {}
            });
          }
        },
        {
          title: "采购单价",
          key: "unitPrice"
        }
      ],
      samplingForm: {
        shippingAddressId: "", // 收货地址id
        account1688: "", // 1688买家账号
        actualArrivalTime: "", // 实际到货时间
        currencyType: "CNY", // 币种
        estimatedArrivalTime: "", // 预计到货时间
        orderFlow1688: "", // 订单类型
        tradeType1688: "", // 交易方式
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
            remarkContent: "" // 备注内容
          }
        ]
      },
      goodsValid: true,
      specValid: true,
      purchaseRemarkList: [],
      productGoodsInfoResultList: [],
      samplingRules: {
        warehouseId: {
          required: true,
          message: "请选择采购仓库",
          trigger: "change"
        },
        purchasePerson: {
          required: true,
          message: "请选择采购仓库",
          trigger: "change"
        },
        shippingAddressId: {
          required: true,
          message: "请选择收货地址",
          trigger: "change"
        },
        account1688: {
          validator: v.account1688Valid,
          trigger: "change"
        },
        currencyType: {
          required: true,
          message: "请选择币种",
          trigger: "change"
        },
        purchaseAmount: {
          required: true,
          message: "请选择币种",
          trigger: "blur"
        },
        orderFlow1688: {
          validator: "请选择订单类型",
          trigger: "change"
        },
        tradeType1688: {
          validator: "请选择交易方式",
          trigger: "change"
        }
      },
      idList: [],
      productSpecList: [],
      addressDate: []
    };
  },
  // created () {
  //   let v = this;
  // },
  methods: {
    account1688Valid (rule, value, callback) {
      let v = this;
      if (v.$store.state.is1688) {
        if (value === "" || value === null) {
          callback(new Error("买家账号不能为空"));
        } else {
          callback();
        }
      } else {
        callback();
      }
    },
    getAlibabaOrderLogisticsInfo () {
      let v = this;
      v.$axios
        .post(api.getAlibabaOrderLogisticsInfoByApi, {
          purchaseId: v.$store.state.purchaseId
        })
        .then((res) => {
          if (res.code === 0) {
            if (res.datas.result.productItems.length > 0) {
              v.orderStatuText = res.datas.result.productItems[0].statusStr;
            }
          }
        })
        .catch(() => {});
    },
    getLogisticsCompanyMt () {
      let v = this;
      v.$axios
        .post(api.getLogisticsCompany)
        .then((res) => {
          v.getLogisticsCompanyList = res.datas;
        })
        .catch(() => {});
    },
    sampVisble (n) {
      let v = this;
      if (n) {
        v.getAttr();
        v.getAddress();
        v.getLogisticsCompanyMt();
        v.getAlibabaAccountInfo();
        if (v.$store.state.is1688) {
          // 1688商品属性
          v.$axios
            .post(
              api.getAli1688ProductInfo +
                "?productUrl=" +
                v.$store.state.product1688Url
            )
            .then((res) => {
              if (res.code === 0) {
                v.productSpecList = res.datas;
                v.samplingProductColumns = [
                  {
                    title: "SKU编号",
                    key: "goodsSku",
                    render (h, params) {
                      let data = params.row.goodsSku;
                      return h(
                        "div",
                        {
                          class: "line2",
                          attrs: {
                            title: data
                          }
                        },
                        data
                      );
                    }
                  },
                  {
                    title: "货品名称",
                    key: "productName",
                    render (h, params) {
                      let data = params.row.productName;
                      return h(
                        "div",
                        {
                          class: "line2",
                          attrs: {
                            title: data
                          }
                        },
                        data
                      );
                    }
                  },
                  {
                    title: "采购数量",
                    key: "purchaseAmount",
                    render (h, params) {
                      return h("Input", {
                        class: (() => {
                          if (!v.goodsValid) {
                            return "redBor";
                          }
                        })(),
                        attrs: {
                          disabled: (function () {
                            if (v.$store.state.isEditInquiry) {
                              return true;
                            } else {
                              return false;
                            }
                          })()
                        },
                        props: {
                          value: params.row.purchaseAmount
                        },
                        on: {
                          input: (val) => {
                            v.$set(
                              v.samplingProduct[params.index],
                              "purchaseAmount",
                              val
                            );
                            v.samplingForm.productGoodsInfoResultList =
                              v.samplingProduct;
                          },
                          "on-blur": () => {
                            v.goodsValidMt();
                          }
                        }
                      });
                    }
                  },
                  {
                    title: "采购单价",
                    key: "unitPrice",
                    render (h, params) {
                      return h("Input", {
                        class: (() => {
                          if (!v.goodsValid) {
                            return "redBor";
                          }
                        })(),
                        attrs: {
                          disabled: (function () {
                            if (v.$store.state.isEditInquiry) {
                              return true;
                            } else {
                              return false;
                            }
                          })()
                        },
                        props: {
                          value: params.row.unitPrice,
                          min: 0
                        },
                        on: {
                          input: (val) => {
                            v.$set(
                              v.samplingProduct[params.index],
                              "unitPrice",
                              val
                            );
                            v.samplingForm.productGoodsInfoResultList =
                              v.samplingProduct;
                          },
                          "on-blur": () => {
                            v.goodsValidMt();
                          }
                        }
                      });
                    }
                  }
                ];
                v.samplingFormColumns = [
                  {
                    title: "SKU编号",
                    key: "goodsSku",
                    render (h, params) {
                      let data = params.row.goodsSku;
                      return h(
                        "div",
                        {
                          class: "line2",
                          attrs: {
                            title: data
                          }
                        },
                        data
                      );
                    }
                  },
                  {
                    title: "货品名称",
                    key: "productName",
                    render (h, params) {
                      let data = params.row.productName;
                      return h(
                        "div",
                        {
                          class: "line2",
                          attrs: {
                            title: data
                          }
                        },
                        data
                      );
                    }
                  },
                  {
                    title: "规格",
                    render (h, params) {
                      let data = params.row.specifications;
                      return h(
                        "div",
                        {
                          class: "line2",
                          attrs: {
                            title: data
                          }
                        },
                        data
                      );
                    }
                  },
                  {
                    title: "采购数量",
                    key: "purchaseAmount",
                    render (h, params) {
                      return h("Input", {
                        class: (() => {
                          if (!v.goodsValid) {
                            return "redBor";
                          }
                        })(),
                        attrs: {
                          disabled: (function () {
                            if (v.$store.state.isEditInquiry) {
                              return true;
                            } else {
                              return false;
                            }
                          })()
                        },
                        props: {
                          value: params.row.purchaseAmount
                        },
                        on: {
                          input: (val) => {
                            // samplingForm.productGoodsInfoResultList
                            v.samplingForm.productGoodsInfoResultList[
                              params.index
                            ].purchaseAmount = val;
                          },
                          "on-blur": () => {
                            v.goodsValidMt();
                          }
                        },
                        blur: () => {}
                      });
                    }
                  },
                  {
                    title: "采购单价",
                    key: "unitPrice"
                  }
                ];
                // 单品
                v.samplingProductColumns.splice(1, 0, {
                  title: "1688商品属性",
                  render (h, params) {
                    return h(
                      "Select",
                      {
                        class: (() => {
                          if (!v.specValid) {
                            return "redBor";
                          }
                        })(),
                        attrs: {
                          disabled: (function () {
                            if (v.$store.state.isEditInquiry) {
                              return true;
                            } else {
                              return false;
                            }
                          })()
                        },
                        props: {
                          value: params.row.ali1688MapId,
                          transfer: true
                        },
                        on: {
                          "on-change": (event) => {
                            v.$set(
                              v.samplingProduct[params.index],
                              "ali1688MapId",
                              event
                            );
                            v.samplingForm.productGoodsInfoResultList =
                              v.samplingProduct;
                            v.specValidMt();
                          }
                        }
                      },
                      v.productSpecList.map((item) => {
                        return h(
                          "Option",
                          {
                            props: {
                              value: item.specId
                            }
                          },
                          item.skuRemark
                        );
                      })
                    );
                  }
                });
                // 多规格
                v.samplingFormColumns.splice(1, 0, {
                  title: "1688商品属性",
                  render (h, params) {
                    return h(
                      "Select",
                      {
                        class: (() => {
                          if (!v.specValid) {
                            return "redBor";
                          }
                        })(),
                        attrs: {
                          disabled: (function () {
                            if (v.$store.state.isEditInquiry) {
                              return true;
                            } else {
                              return false;
                            }
                          })()
                        },
                        props: {
                          value: params.row.ali1688MapId,
                          transfer: true
                        },
                        on: {
                          "on-change": (event) => {
                            /* let max = '';
                         v.productSpecList.forEach(item => {
                         if (item.specId === event) {
                         max = item.amountOnSale;
                         }
                         }); */
                            v.samplingForm.productGoodsInfoResultList[
                              params.index
                            ].ali1688MapId = event;
                            v.specValidMt();
                          }
                        }
                      },
                      v.productSpecList.map((item) => {
                        return h(
                          "Option",
                          {
                            props: {
                              value: item.specId
                            }
                          },
                          item.skuRemark
                        );
                      })
                    );
                  }
                });
              } else {
                v.$msg.error("请求1688接口出错");
              }
            })
            .catch(() => {});
        } else {
          v.samplingProductColumns = [
            {
              title: "SKU编号",
              key: "goodsSku",
              render (h, params) {
                let data = params.row.goodsSku;
                return h(
                  "div",
                  {
                    class: "line2",
                    attrs: {
                      title: data
                    }
                  },
                  data
                );
              }
            },
            {
              title: "货品名称",
              key: "productName",
              render (h, params) {
                let data = params.row.productName;
                return h(
                  "div",
                  {
                    class: "line2",
                    attrs: {
                      title: data
                    }
                  },
                  data
                );
              }
            },
            {
              title: "采购数量",
              key: "purchaseAmount",
              render (h, params) {
                return h("Input", {
                  class: (() => {
                    if (!v.goodsValid) {
                      return "redBor";
                    }
                  })(),
                  attrs: {
                    disabled: (function () {
                      if (v.$store.state.isEditInquiry) {
                        return true;
                      } else {
                        return false;
                      }
                    })()
                  },
                  props: {
                    value: params.row.purchaseAmount,
                    maxlength: 9
                  },
                  on: {
                    input: (val) => {
                      v.$set(
                        v.samplingProduct[params.index],
                        "purchaseAmount",
                        val
                      );
                      v.samplingForm.productGoodsInfoResultList =
                        v.samplingProduct;
                    },
                    "on-blur": () => {
                      v.goodsValidMt();
                    }
                  }
                });
              }
            },
            {
              title: "采购单价",
              key: "unitPrice",
              render (h, params) {
                return h("Input", {
                  class: (() => {
                    if (!v.goodsValid) {
                      return "redBor";
                    }
                  })(),
                  attrs: {
                    disabled: (function () {
                      if (v.$store.state.isEditInquiry) {
                        return true;
                      } else {
                        return false;
                      }
                    })()
                  },
                  props: {
                    value: params.row.unitPrice,
                    min: 0,
                    maxlength: 9
                  },
                  on: {
                    input: (val) => {
                      v.$set(v.samplingProduct[params.index], "unitPrice", val);
                      v.samplingForm.productGoodsInfoResultList =
                        v.samplingProduct;
                    },
                    "on-blur": () => {
                      v.goodsValidMt();
                    }
                  }
                });
              }
            }
          ];
          v.samplingFormColumns = [
            {
              title: "SKU编号",
              key: "goodsSku",
              render (h, params) {
                let data = params.row.goodsSku;
                return h(
                  "div",
                  {
                    class: "line2",
                    attrs: {
                      title: data
                    }
                  },
                  data
                );
              }
            },
            {
              title: "货品名称",
              key: "productName",
              render (h, params) {
                let data = params.row.productName;
                return h(
                  "div",
                  {
                    class: "line2",
                    attrs: {
                      title: data
                    }
                  },
                  data
                );
              }
            },
            {
              title: "规格",
              render (h, params) {
                let data = params.row.specifications;
                return h(
                  "div",
                  {
                    class: "line2",
                    attrs: {
                      title: data
                    }
                  },
                  data
                );
              }
            },
            {
              title: "采购数量",
              key: "purchaseAmount",
              render (h, params) {
                return h("Input", {
                  class: (() => {
                    if (!v.goodsValid) {
                      return "redBor";
                    }
                  })(),
                  attrs: {
                    disabled: (function () {
                      if (v.$store.state.isEditInquiry) {
                        return true;
                      } else {
                        return false;
                      }
                    })()
                  },
                  props: {
                    value: params.row.purchaseAmount,
                    maxlength: 9
                  },
                  on: {
                    input: (val) => {
                      // samplingForm.productGoodsInfoResultList
                      v.samplingForm.productGoodsInfoResultList[
                        params.index
                      ].purchaseAmount = val;
                    },
                    "on-blur": () => {
                      v.goodsValidMt();
                    }
                  },
                  blur: () => {}
                });
              }
            },
            {
              title: "采购单价",
              key: "unitPrice"
            }
          ];
        }
      } else {
        v.$store.commit("isListInquiry", false);
      }
    },
    getAlibabaAccountInfo () {
      // 获取1688账号
      let v = this;
      v.$axios.get(api.getAlibabaAccountInfoByApi).then((res) => {
        if (res.code === 0) {
          v.idList = res.datas;
        }
      });
    },
    getAttr () {
      let v = this;
      v.samplingProduct = [];
      v.$Spin.show();
      v.$axios
        .get(
          api.queryProductVari +
            "?productId=" +
            v.$store.state.createId +
            "&quotationId=" +
            v.$store.state.quotationId
        )
        .then((res) => {
          v.$Spin.hide();
          if (res.code === 0) {
            if (res.datas.productCode === null) {
              v.isAttrs = true;
            } else {
              v.isAttrs = false;
              if (!v.$store.state.isEditInquiry) {
                v.samplingProduct.push({
                  goodsSku: res.datas.productCode,
                  productName: res.datas.productName,
                  purchaseAmount: "",
                  unitPrice: ""
                });
              } else {
                v.samplingProduct.push({
                  goodsSku: res.datas.productCode,
                  productName: res.datas.productName,
                  purchaseAmount:
                    v.samplingForm.productGoodsInfoResultList[0].purchaseAmount,
                  unitPrice:
                    v.samplingForm.productGoodsInfoResultList[0].unitPrice,
                  ali1688MapId:
                    v.samplingForm.productGoodsInfoResultList[0].ali1688MapId
                });
              }
            }
          } else {
            v.isAttrs = true;
          }
        })
        .catch(() => {
          v.$Spin.hide();
        });
    },
    getAddress () {
      let v = this;
      v.$axios
        .post(api.queryShippingAddress, {
          validStatus: 0
        })
        .then((res) => {
          v.tableLoading = false;
          if (res.code === 0) {
            v.addressDate = res.datas;
          } else {
            v.$msg.error({
              content: "获取收货地址失败",
              duration: 5
            });
          }
        })
        .catch(() => {});
    },
    addRemark () {
      let v = this;
      v.purchaseRemarkList.push({
        remarkContent: v.remark
      });
      v.remark = "";
    },
    demandAdd () {
      this.modalRemarks = true;
      this.addRemarkContent = "";
    },
    getQueryProductQuotationDetail (id, callback) {
      let v = this;
      v.$axios
        .get(api.queryProductQuotationDetail + "?strQuotationId=" + id)
        .then((res) => {
          if (res.code === 0) {
            v.productGoodsInfoResultList = res.datas.listVariQuotationInfo;
            v.$store.commit("product1688Url", res.datas.productUrl);
            callback && callback();
          }
        })
        .catch(() => {});
    },
    openAttr () {
      this.$refs.attrPriceTw.attrPrice = true;
    },
    goodsValidMtAll () {
      let v = this;
      // 校验使用
      v.goodsValid = true;
      var reg = v.$regular.validateInteger;
      var reg1 = this.nubReg;
      if (v.samplingForm.productGoodsInfoResultList.length < 1) {
        v.goodsValid = false;
      }
      v.samplingForm.productGoodsInfoResultList.some((item) => {
        if (item.purchaseAmount === "" || item.unitPrice === "") {
          v.goodsValid = false;
          return true;
        } else if (
          !reg.test(item.purchaseAmount) ||
          !reg1.test(item.unitPrice)
        ) {
          v.goodsValid = false;
          return true;
        }
      });
    },
    goodsValidMt () {
      let v = this;
      // 校验使用
      let valid = true;
      var reg = v.$regular.validateInteger;
      var reg1 = this.nubReg;
      v.samplingForm.productGoodsInfoResultList.some((item) => {
        if (item.purchaseAmount === "" || item.unitPrice === "") {
          valid = false;
          v.goodsValid = false;
          return true;
        } else if (
          !reg.test(item.purchaseAmount) ||
          !reg1.test(item.unitPrice)
        ) {
          valid = false;
          v.goodsValid = false;
          return true;
        }
      });
      if (valid) {
        v.goodsValid = true;
      }
    },
    specValidMt () {
      let v = this;
      if (v.$store.state.is1688) {
        // 增加1688校验
        let isNoChose = false;
        v.samplingForm.productGoodsInfoResultList.some((item) => {
          if (item.ali1688MapId === undefined || item.ali1688MapId === null) {
            isNoChose = true;
            return true;
          }
        });
        if (
          isNoChose ||
          (v.samplingForm.productGoodsInfoResultList.length === 0 && !v.isAttrs)
        ) {
          v.specValid = false;
          /* v.$msg.error({
           content: `请选择1688商品属性`,
           duration: 5
           }); */
          return "请选择1688商品属性";
        }
        let arr = [];
        v.samplingForm.productGoodsInfoResultList.forEach((item) => {
          arr.push(item.ali1688MapId);
        });
        if (new Set(arr).size !== arr.length) {
          /* v.$msg.error({
           content: '选择1688商品属性有重复',
           duration: 5
           }); */
          v.specValid = false;
          return "选择1688商品属性有重复";
        }
        v.specValid = true;
      } else {
        v.specValid = true;
      }
    },
    samplingSave () {
      let v = this;
      v.goodsValidMtAll(); // 采购数量校验
      // isAttrs  是否有多属性
      if (v.isAttrs && v.samplingForm.productGoodsInfoResultList.length === 0) {
        v.$msg.error({
          content: "请添加商品",
          duration: 5
        });
      }
      v.$refs.samplingForm.validate((valid) => {
        var message = v.specValidMt(); // 1688校验
        if (message) {
          v.$msg.error({
            content: message,
            duration: 5
          });
        }
        if (valid && v.goodsValid && v.specValid) {
          if (v.samplingForm.tradeType1688 === 'null') {
            v.samplingForm.tradeType1688 = null;
          }
          var paramsT = v.setNull(v.samplingForm);
          if (
            v.samplingForm.estimatedArrivalTime !== "" &&
            v.samplingForm.estimatedArrivalTime !== null
          ) {
            if (
              v.samplingForm.estimatedArrivalTime.toString().indexOf("GMT") > 0
            ) {
              paramsT.estimatedArrivalTime = v.format(
                "yyyy-MM-dd",
                v.samplingForm.estimatedArrivalTime
              );
            } else {
              paramsT.estimatedArrivalTime =
                v.samplingForm.estimatedArrivalTime;
            }
          } else {
            paramsT.estimatedArrivalTime = "";
          }
          paramsT.productId = v.$store.state.createId;
          let remark = [];
          v.purchaseRemarkList.forEach((item) => {
            if (item.purchaseId === undefined) {
              remark.push(item);
            }
          });
          paramsT.purchaseRemarkList = remark;
          if (v.$store.state.is1688) {
            paramsT.is1688Order = 1;
          } else {
            paramsT.is1688Order = 0;
          }
          v.$axios
            .post(api.savePurchase, paramsT)
            .then((res) => {
              if (res.code === 0) {
                if (
                  v.$store.state.is1688 &&
                  v.$store.state.productCurNodeId === 1
                ) {
                  v.createAlibabaOrder(res.datas);
                } else {
                  v.$msg.success("保存成功");
                  v.$refs.samplingForm.resetFields();
                  v.samplingModal = false;
                }
              } else {
                v.$msg.error({
                  content: "保存失败",
                  duration: 5
                });
              }
            })
            .catch(() => {
              v.$msg.error({
                content: "保存失败",
                duration: 5
              });
            });
        }
      });
    },
    createAlibabaOrder (id) {
      let v = this;
      v.$axios
        .get(api.createAlibabaOrderByApi + "?purchaseId=" + id)
        .then((res) => {
          if (res.code === 0) {
            v.$msg.success("下单成功");
            v.$refs.samplingForm.resetFields();
            v.samplingModal = false;
          } else if (res.code === 1) {
            v.$msg.error({
              content: res.message,
              duration: 5
            });
          } else {
            v.$msg.error("下单失败");
          }
        })
        .catch(() => {});
    },
    getAttrPrice (data) {
      let v = this;
      v.$axios
        .post(api.queryProductGoodsInfo, data)
        .then((res) => {
          if (res.code === 0) {
            v.samplingForm.productGoodsInfoResultList = res.datas;
          }
        })
        .catch(() => {});
    }
  },
  computed: {
    stateStep () {
      let v = this;
      var ind = 0;
      v.stateText.forEach((item, index) => {
        if (item.text === v.orderStatuText) {
          ind = index;
        }
      });
      return ind;
    },
    stateOrderStep () {
      let v = this;
      var ind = 0;
      v.OrderText.forEach((item, index) => {
        if (item.value === v.samplingForm.purchaseStatus) {
          ind = index;
        }
      });
      return ind;
    },
    stateOrderText () {
      let v = this;
      var ind = "等待到货";
      v.OrderText.forEach((item) => {
        if (item.value === v.samplingForm.purchaseStatus) {
          ind = item.text;
        }
      });
      return ind;
    },
    getLogisticsCompanyListGroup () {
      let arr = [];
      let v = this;
      let child = [];
      if (v.getLogisticsCompanyList && v.getLogisticsCompanyList.length > 0) {
        v.getLogisticsCompanyList.forEach((item, index) => {
          if (item.merchantCarrierUrl === "") {
            if (index > 0) {
              arr[arr.length - 1].child = child;
            }
            arr.push({
              name: item.merchantCarrierName,
              child: []
            });
            child = [];
          } else {
            child.push(item);
          }
        });
      }
      return arr;
    }
  }
};
</script>

<style>
.sampling1 .ivu-form-item-label {
  width: 110px;
}

.sampling1 .ivu-form-item-error-tip {
  left: 110px;
}

.samp .ivu-form-item-required .ivu-form-item-label:before {
  content: "";
}

.ivu-modal-body {
  max-height: 600px;
  overflow-y: auto;
}

.purchaseTable .redBor {
  border: 1px solid #ed3f14;
  border-radius: 4px !important;
  transition: 0.2s all ease-out;
}
</style>
<style scoped>
.bInfo {
  font-size: 16px;
}

.demandBoxTit h3 {
  font-weight: 600;
  font-size: 16px;
  padding: 10px 0 10px 15px;
}

.remarks {
  margin-left: 80px;
  margin-bottom: 30px;
  margin-right: 50px;
}
</style>
