<template>
  <div>
    <Modal
      v-model="calcModal"
      class="co clearMarginAuto rest calcM"
      width="1100"
      @on-visible-change="calcVisibleChange"
    >
      <p slot="header" @mousedown="moveMt" class="moveHead">
        <span>目标采购价计算器</span>
      </p>
      <Spin fix v-if="spinShow"></Spin>
      <Form
        ref="calcForm"
        class="calc mt15 pb25"
        :model="calcFormDate"
        :rules="calcRuleValidate"
      >
        <Row>
          <Col span="11">
            <FormItem>
              <label slot="label">平台</label>
              <dyt-select
                v-model="calcFormDate.platformId"
                :disabled="isDisable"
                class="ipt-wid"
                @on-change="getCostTemp"
              >
                <Option
                  v-for="(item, index) in platformList"
                  :key="index"
                  :value="item.value"
                  >{{ item.label }}</Option
                >
              </dyt-select>
            </FormItem>
          </Col>
          <Col span="11">
            <FormItem>
              <label slot="label">费用模板</label>
              <dyt-select v-model="costTempId" class="ipt-wid" v-if="!isDisable">
                <Option
                  v-for="(item, index) in costTempList"
                  :key="index"
                  :value="item.templateName"
                  @click.native="changeCostTemp(index)"
                  >{{ item.templateName }}
                </Option>
              </dyt-select>
              <Input
                class="ipt-wid"
                v-else
                disabled
                v-model="templateName"
              ></Input>
            </FormItem>
          </Col>
          <Col span="11" v-show="calcIndex !== 1">
            <FormItem>
              <label slot="label" class="redDot">售价</label>
              <Input
                style="width: 80px"
                disabled
                v-model="calcFormDate.sellPrice"
              />
              <dyt-select
                style="width: calc(100% - 130px - 80px); margin-left: 10px"
                disabled
                v-model="calcFormDate.sellPriceCurrency"
                filterable
                @on-change="changefeeAfterFee"
                ref="afterFee1"
              >
                <Option
                  v-for="(item, index) in $store.state.currencyList"
                  :key="index"
                  :value="item.code"
                  :label="item.name"
                ></Option>
              </dyt-select>
            </FormItem>
          </Col>
          <Col span="11" v-show="calcIndex !== 0 && curType === 'created'">
            <FormItem>
              <label slot="label">采购价(CNY)</label>
              <Input
                v-model.trim="calcFormDate.estimatedPurchasePrice"
                :disabled="isDisable"
                class="ipt-wid"
              />
            </FormItem>
          </Col>
          <Col span="11">
            <FormItem>
              <label slot="label" class="redDot">总运费(CNY)</label>
              <span style="width: 70px">头程运费</span>
              <Input
                style="width: 70px"
                :disabled="isDisable"
                v-model="calcFormDate.freightHeadPrice"
              />
              <span style="width: 70px">+ 当地运费</span>
              <Input
                style="width: 76px; margin-right: 10px"
                :disabled="isDisable"
                v-model="calcFormDate.freightPrice"
              />
              <Button @click="openFreight">运费计算器</Button>
            </FormItem>
          </Col>
          <Col span="11" v-if="curType === 'inquiry'">
            <FormItem>
              <label slot="label" class="redDot">采购价(CNY)</label>
              <Input v-model.trim="purchasePrice" disabled class="ipt-wid" />
            </FormItem>
          </Col>

          <Col span="11">
            <FormItem>
              <label slot="label" class="redDot">平台佣金率(%)</label>
              <Input
                :disabled="isDisable"
                v-model.trim="calcFormDate.commissionRate"
                class="ipt-wid"
              />
            </FormItem>
          </Col>
          <Col span="11" v-show="calcFormDate.platformId === 1">
            <FormItem>
              <label slot="label" class="redDot">Paypal手续费</label>
              <Input
                :disabled="isDisable"
                style="width: 90px"
                v-model="calcFormDate.paypalPrice"
              />
              <span style="width: 60px">%+附加费用</span>
              <Input
                :disabled="isDisable"
                style="width: 91px"
                v-model="calcFormDate.additionalFees"
              />
              <dyt-select
                :disabled="isDisable"
                style="width: 100px; margin-left: 10px"
                v-model="calcFormDate.sellPriceCurrency"
                filterable
                @on-change="changefeeAfterFee"
                ref="afterFee1"
              >
                <Option
                  v-for="(item, index) in $store.state.currencyList"
                  :key="index"
                  :value="item.code"
                  :label="item.name"
                ></Option>
              </dyt-select>
            </FormItem>
          </Col>
          <Col span="11" v-show="calcFormDate.platformId === 2">
            <FormItem>
              <label slot="label" class="redDot">联盟费用(%)</label>
              <Input
                :disabled="isDisable"
                style="width: 80px"
                v-model="calcFormDate.expressLeagueFee"
              />
            </FormItem>
          </Col>
          <Col span="11">
            <FormItem>
              <label slot="label">售后费用率(%)</label>
              <Input
                :disabled="isDisable"
                v-model.trim="calcFormDate.afterSale"
                class="ipt-wid"
              />
            </FormItem>
          </Col>
          <Col span="11">
            <FormItem>
              <label slot="label" class="redDot">汇率</label>
              <Input
                :disabled="isDisable"
                v-model.trim="calcFormDate.feeAfterFee"
                style="width: calc(100% - 120px); margin-right: 10px"
              />
            </FormItem>
          </Col>
          <Col span="11">
            <FormItem>
              <label slot="label">汇率折损率(%)</label>
              <Input
                :disabled="isDisable"
                v-model.trim="calcFormDate.damageFeeAfterFee"
                class="ipt-wid"
              />
            </FormItem>
          </Col>
          <Col span="11">
            <FormItem>
              <label slot="label">其他成本(CNY)</label>
              <Input
                :disabled="isDisable"
                v-model.trim="calcFormDate.otherCost"
                style="width: 100px"
              />
              <span>+</span>
              <Input
                :disabled="isDisable"
                v-model.trim="calcFormDate.otherCostRate"
                style="width: calc(100% - 250px)"
              />
              <span>%</span>
            </FormItem>
          </Col>
          <Col span="11" v-show="calcIndex !== 2 && curType === 'created'">
            <FormItem>
              <div slot="label" style="position: absolute; z-index: 5">
                <dyt-select
                  v-model="calcFormDate.profitRateType"
                  style="margin-top: -10px; width: 95px"
                >
                  <Option
                    v-for="(item, index) in ProfitMarginList"
                    :key="index"
                    :value="item.value"
                    >{{ item.label }}
                  </Option>
                </dyt-select>
              </div>
              <Input
                :disabled="isDisable"
                v-show="calcFormDate.profitRateType === '1'"
                v-model="calcFormDate.profitRate"
                class="ipt-wid"
              />
              <Input
                :disabled="isDisable"
                v-show="calcFormDate.profitRateType === '2'"
                v-model="calcFormDate.costProfitRate"
                class="ipt-wid"
              />
            </FormItem>
          </Col>
          <Col span="11" v-show="calcIndex === 0 && curType === 'created'">
            <FormItem>
              <label slot="label">采购价(CNY)</label>
              <Input
                class="ipt-wid"
                v-model="estimatedPurchasePriceAuto"
                readonly
                style="color: red"
              />
            </FormItem>
          </Col>
          <Col v-show="curType === 'inquiry'" span="11">
            <FormItem>
              <label slot="label">销售利润率</label>
              <Input
                class="ipt-wid"
                v-model="salesOl"
                readonly
                style="color: red"
              />
            </FormItem>
          </Col>
        </Row>
      </Form>
      <p>{{ calcTit }}</p>
      <p>售价=总成本/（1-销售利润率）=总成本*（1+成本利润率）</p>
      <div slot="footer">
        <Button type="primary" v-show="!isDisable" @click="saveCost"
          >保存</Button
        >
        <Button
          type="primary"
          v-show="curType === 'inquiry' && $store.state.curNodeId === 3"
          @click="setSalesOl"
          >设置利润率</Button
        >
        <Button @click="calcModal = false">取消</Button>
      </div>
    </Modal>

    <freightCalc
      ref="freightCalc"
      :freightDate="freightDate"
      @setFreight="setFreight"
    ></freightCalc>
    <setting ref="calcSetting"></setting>
  </div>
</template>

<script>
import CommonMixin from "../../../components/mixin/commonMixin";
import freightCalc from "./freightCalc";
import setting from "./defaultCalcSetting";
import api from "@/api/api";

export default {
  name: "calc",
  mixins: [CommonMixin],
  components: {
    freightCalc,
    setting
  },
  data () {
    let v = this;
    return {
      spinShow: false,
      purchasePrice: 0, // 采购价
      templateName: "", // 模板名称
      tempList: [], // 模板列表
      estimatedPurchasePrice: 0,
      sellPrice: 0,
      profitRate: 0,
      calcRuleValidate: {
        sellPrice: {
          validator: v.validatesellPrice,
          trigger: "blur"
        },
        warehouseId: {
          required: true,
          message: "请选择发货仓库",
          trigger: "change"
        },
        estimatedPurchasePrice: {
          validator: v.validEstimatedPurchasePrice,
          trigger: "blur"
        },
        freightPrice: {
          validator: v.validfreightPrice,
          trigger: "blur"
        },
        commissionRate: {
          required: true,
          message: "平台佣金率不能为空",
          trigger: "blur"
        },
        paypalPrice: {
          validator: v.validpaypalPrice,
          trigger: "blur"
        },
        feeAfterFee: {
          required: true,
          message: "汇率不能为空",
          trigger: "blur"
        },
        profitRate: {
          validator: v.validProfitRate,
          trigger: "blur"
        }
      },
      footerCalcText: "计算目标采购价",
      calcModal: false,
      platformList: [
        {
          label: "Ebay",
          value: 1
        },
        {
          label: "速卖通",
          value: 2
        },
        {
          label: "其他",
          value: 3
        }
      ], // 平台
      warehouseList: [
        {
          label: "仓库",
          value: "1111"
        }
      ], // 发货仓库
      ProfitMarginList: [
        {
          label: "销售利润率",
          value: "1"
        },
        {
          label: "成本利润率",
          value: "2"
        }
      ], //
      calcTits: [
        {
          title: "计算目标采购价",
          checked: true
        },
        {
          title: "计算售价",
          checked: false
        },
        {
          title: "计算利润率",
          checked: false
        }
      ],
      calcFormDate: {
        platformId: 1,
        expressLeagueFee: 0, // 联盟费用
        paypalPrice: 0, // paypalFeeRate Paypal手续费比率 ,
        sellPrice: 0,
        otherCostRate: 0, // 其他成本率
        freightHeadPrice: 0, // 头程运费
        sellPriceCurrency: "CNY",
        freightPrice: 0,
        commissionRate: 0,
        additionalFees: 0,
        feeAfterFee: "1", // 汇率
        otherCost: 0,
        afterSale: 0,
        profitRate: 0,
        costProfitRate: 0,
        profitRateType: "1",
        estimatedPurchasePrice: "", // 采购价(CNY)
        damageFeeAfterFee: 0 // 汇率折损率
      },
      costTempId: "", // 费用模板id
      costTempList: [], // 费用模板
      calcIndex: 0,
      warehouseAndEnableShipMethod: [],
      freightDate: {
        overseaDeliveryFlag: 0, // 是否为海外仓发货
        firstCarriageModeId: "", // 头程运输id
        shipmentsWarehouseId: "", // 发货仓库
        targetCountryId: "", // 到达国家
        carriageLogistics: "", // 运输方式
        netWeight: "", // 重量
        carrierId: "" // 物流商
      }
    };
  },
  props: [
    "epSellPrice",
    "sellPriceCurrency",
    "curType",
    "purchase",
    "weight",
    "platform"
  ],
  computed: {
    profitAmount: {
      // 利润额=售价*销售利润率
      get () {
        let v = this;
        if (v.calcIndex === 0) {
          if (
            v.calcFormDate.profitRateType === "1" &&
            v.calcFormDate.sellPrice !== "" &&
            v.calcFormDate.profitRate !== "" &&
            v.calcFormDate.profitRate !== undefined
          ) {
            return (
              v.calcFormDate.sellPrice *
              v.calcFormDate.feeAfterFee *
              (v.calcFormDate.profitRate * 0.01)
            ).toFixed(2);
          } else {
            return 0;
          }
        } else if (v.calcIndex === 1) {
          if (
            v.calcFormDate.profitRateType === "1" &&
            v.sellPrice !== "" &&
            v.calcFormDate.profitRate !== "" &&
            v.calcFormDate.profitRate !== undefined
          ) {
            return (
              v.sellPrice *
              (v.calcFormDate.profitRate * 0.01) *
              v.calcFormDate.feeAfterFee
            ).toFixed(2);
          } else {
            return 0;
          }
        } else {
          if (
            v.calcFormDate.profitRateType === "1" &&
            v.calcFormDate.sellPrice !== "" &&
            v.profitRate !== "" &&
            v.profitRate !== undefined
          ) {
            return (
              v.calcFormDate.sellPrice *
              (v.profitRate * 0.01) *
              v.calcFormDate.feeAfterFee
            ).toFixed(2);
          } else {
            return 0;
          }
        }
      }
    },
    calcTit () {
      let v = this;
      if (v.calcFormDate.platformId === 1) {
        return "总成本=采购价+运费+Paypal附加费用+其他成本+售价*（平台佣金率+Paypal手续费率+汇率折损率+售后费用率+其他成本比例）";
      } else if (v.calcFormDate.platformId === 2) {
        return "总成本=采购价+运费+其他成本+售价*（平台佣金率+联盟费用+汇率折损率+售后费用率+其他成本比例）";
      } else {
        return "总成本=采购价+运费+其他成本+售价*（平台佣金率+汇率折损率+售后费用率+其他成本比例）";
      }
    },
    salesOl () {
      let v = this;
      let sellPrice = 0;
      let additionalFees = 0; // 附加费用
      sellPrice = (
        v.calcFormDate.sellPrice * v.calcFormDate.feeAfterFee
      ).toFixed(2);
      additionalFees = (
        v.calcFormDate.additionalFees * v.calcFormDate.feeAfterFee
      ).toFixed(2);
      if (v.calcFormDate.platformId === 1) {
        v.calcFormDate.expressLeagueFee = 0;
      } else if (v.calcFormDate.platformId === 1) {
        additionalFees = 0;
        v.calcFormDate.paypalPrice = 0;
      } else {
        additionalFees = 0;
        v.calcFormDate.paypalPrice = 0;
        v.calcFormDate.expressLeagueFee = 0;
      }
      let B =
        v.purchasePrice * 1 +
        v.calcFormDate.estimatedPurchasePrice * 1 +
        v.calcFormDate.freightPrice * 1 +
        v.calcFormDate.freightHeadPrice * 1 +
        additionalFees * 1 +
        v.calcFormDate.otherCost * 1 +
        sellPrice *
          1 *
          ((v.calcFormDate.commissionRate * 1 +
            v.calcFormDate.paypalPrice * 1 +
            v.calcFormDate.damageFeeAfterFee * 1 +
            v.calcFormDate.afterSale * 1 +
            v.calcFormDate.otherCostRate * 1 +
            v.calcFormDate.expressLeagueFee * 1) *
            0.01);
      let C = sellPrice * 1;
      return ((1 - B / C) * 100).toFixed(2);
    },
    estimatedPurchasePriceAuto () {
      let v = this;
      let allCost = 0;
      let sellPrice = 0; // 售价
      let additionalFees = 0; // 附加费用
      v.calcFormDate.sellPrice = v.calcFormDate.sellPrice
        ? v.calcFormDate.sellPrice
        : 0;
      v.calcFormDate.freightPrice = v.calcFormDate.freightPrice
        ? v.calcFormDate.freightPrice
        : 0;
      v.calcFormDate.freightHeadPrice = v.calcFormDate.freightHeadPrice
        ? v.calcFormDate.freightHeadPrice
        : 0;
      sellPrice = (
        v.calcFormDate.sellPrice * v.calcFormDate.feeAfterFee
      ).toFixed(2);
      additionalFees = (
        v.calcFormDate.additionalFees * v.calcFormDate.feeAfterFee
      ).toFixed(2); // paypal 附加费用
      if (v.calcFormDate.platformId === 1) {
        v.calcFormDate.expressLeagueFee = 0;
      } else if (v.calcFormDate.platformId === 1) {
        additionalFees = 0;
        v.calcFormDate.paypalPrice = 0;
      } else {
        additionalFees = 0;
        v.calcFormDate.paypalPrice = 0;
        v.calcFormDate.expressLeagueFee = 0;
      }
      if (v.calcFormDate.profitRateType === "1") {
        // 销售利润率
        allCost = sellPrice * (1 - v.calcFormDate.profitRate * 0.01);
      } else {
        // 成本利润率
        allCost = (sellPrice * 1) / (1 + v.calcFormDate.costProfitRate * 0.01);
      }
      v.estimatedPurchasePrice = (
        allCost -
        (v.calcFormDate.freightPrice * 1 +
          v.calcFormDate.freightHeadPrice * 1 +
          additionalFees * 1 +
          v.calcFormDate.otherCost * 1 +
          sellPrice *
            1 *
            (v.calcFormDate.otherCostRate * 1 +
              v.calcFormDate.commissionRate * 1 +
              v.calcFormDate.paypalPrice * 1 +
              v.calcFormDate.damageFeeAfterFee * 1 +
              v.calcFormDate.afterSale * 1 +
              v.calcFormDate.expressLeagueFee * 1) *
            0.01)
      ).toFixed(2);
      return v.estimatedPurchasePrice;
    },
    isDisable () {
      return this.$store.state.curNodeId !== 0;
    }
  },
  created () {
    this.$store.dispatch("currencyExchangeInfo");
  },
  methods: {
    isSetTheWay () {
      let valid = true;
      for (let key in this.freightDate) {
        if (key !== "firstCarriageModeId") {
          if (this.freightDate[key] === "") {
            valid = false;
          }
        }
      }
      return valid;
    },
    setSalesOl () {
      this.$emit("setSalesOl", this.salesOl);
      this.calcModal = false;
    },
    setFreight (data) {
      this.freightDate = data;
    },
    fixData () {
      return {
        platformId: this.calcFormDate.platformId,
        sellingPrice: Number(this.calcFormDate.sellPrice),
        firstFreight: Number(this.calcFormDate.freightHeadPrice),
        localFreight: Number(this.calcFormDate.freightPrice),
        platformFeeRate: Number(this.calcFormDate.commissionRate),
        paypalFeeRate: Number(this.calcFormDate.paypalPrice),
        paypalAddedFee: Number(this.calcFormDate.additionalFees),
        afterFee: Number(this.calcFormDate.afterSale), // exchangeRate     : Number(this.calcFormDate.feeAfterFee),
        exchangeWreckRate: Number(this.calcFormDate.damageFeeAfterFee),
        otherCost: Number(this.calcFormDate.otherCost),
        otherCostRate: Number(this.calcFormDate.otherCostRate),
        expressLeagueFee: Number(this.calcFormDate.expressLeagueFee),
        sellingProfitRate: Number(this.calcFormDate.profitRate),
        costProfitRate: Number(this.calcFormDate.costProfitRate),
        sellingPriceCurrency: this.calcFormDate.sellPriceCurrency,
        templateName: this.costTempId,
        productId: this.$store.state.createId
      };
    },
    showViewData (obj, isGetTemp) {
      if (!isGetTemp) {
        this.calcFormDate.platformId = Number(obj.platformId);
        this.calcFormDate.freightHeadPrice = obj.firstFreight;
        this.calcFormDate.freightPrice = obj.localFreight;
        this.calcFormDate.sellPriceCurrency = obj.sellingPriceCurrency;
      } else {
        // 使用模板
        this.freightDate.overseaDeliveryFlag = obj.overseaDeliveryFlag;
        this.freightDate.firstCarriageModeId = obj.firstCarriageModeId;
        this.freightDate.shipmentsWarehouseId = obj.shipmentsWarehouseId;
        // this.freightDate.targetCountryId = obj.overseaDeliveryFlag;
        this.freightDate.carriageLogistics = obj.carriageLogistics;
        this.freightDate.carrierId = obj.carrierId;
      }
      if (!this.epSellPrice) {
        // 在创建的时候 取需求里面的预计售价 详情则不是
        this.calcFormDate.sellPrice = obj.sellingPrice;
      }
      this.calcFormDate.profitRate = obj.sellingProfitRate;
      this.calcFormDate.costProfitRate = obj.costProfitRate;
      this.calcFormDate.expressLeagueFee = obj.expressLeagueFee;
      this.calcFormDate.commissionRate = obj.platformFeeRate;
      this.calcFormDate.paypalPrice = obj.paypalFeeRate;
      this.calcFormDate.additionalFees = obj.paypalAddedFee;
      this.calcFormDate.afterSale = obj.afterFee;
      // this.calcFormDate.feeAfterFee = obj.exchangeRate;
      this.calcFormDate.damageFeeAfterFee = obj.exchangeWreckRate;
      this.calcFormDate.otherCost = obj.otherCost;
      this.calcFormDate.otherCostRate = obj.otherCostRate;
    },
    saveCost () {
      let v = this;
      let obj = Object.assign({}, v.fixData(), v.freightDate);
      // isSetTheWay
      let valid = v.isSetTheWay();
      if (!valid) {
        v.$msg.error("必须在运费计算器采用一个运费计算方式");
        return;
      }
      v.$axios
        .post(api.costCreate, obj)
        .then((res) => {
          if (res.code === 0) {
            let profitRateType = 0;
            if (v.calcFormDate.profitRateType === '1') {
              profitRateType = v.calcFormDate.profitRate;
            } else {
              let sellPrice = Number(v.calcFormDate.sellPrice) * Number(v.calcFormDate.feeAfterFee);
              let additionalFees = v.calcFormDate.additionalFees * v.calcFormDate.feeAfterFee; // paypal 附加费用
              if (v.calcFormDate.platformId === 1) {
                v.calcFormDate.expressLeagueFee = 0;
              } else if (v.calcFormDate.platformId === 1) {
                additionalFees = 0;
                v.calcFormDate.paypalPrice = 0;
              } else {
                additionalFees = 0;
                v.calcFormDate.paypalPrice = 0;
                v.calcFormDate.expressLeagueFee = 0;
              }
              let all = Number((v.calcFormDate.freightPrice * 1 +
                        v.calcFormDate.freightHeadPrice * 1 +
                        additionalFees * 1 +
                        v.calcFormDate.otherCost * 1 +
                        sellPrice *
                        1 *
                        (v.calcFormDate.otherCostRate * 1 +
                        v.calcFormDate.commissionRate * 1 +
                        v.calcFormDate.paypalPrice * 1 +
                        v.calcFormDate.damageFeeAfterFee * 1 +
                        v.calcFormDate.afterSale * 1 +
                        v.calcFormDate.expressLeagueFee * 1) *
                        0.01)
              ) + Number(v.estimatedPurchasePriceAuto);
              profitRateType = ((1 - all / (
                v.calcFormDate.sellPrice * v.calcFormDate.feeAfterFee
              )).toFixed(2)) * 100;
            }
            v.$emit('setCost', {
              estimatedPurchasePriceAuto: v.estimatedPurchasePriceAuto,
              profitRateType: profitRateType
            });
            v.$msg.success("保存成功");
            v.calcModal = false;
          }
        })
        .catch(() => {});
    },
    getCost () {
      let v = this;
      // 查看产品成本及费用
      return new Promise((resolve) => {
        v.$axios
          .get(api.costDetail + "?productId=" + v.$store.state.createId)
          .then((res) => {
            if (res.code === 0) {
              if (res.datas) {
                v.showViewData(res.datas, false);
                v.templateName = res.datas.templateName;
                for (let key in v.freightDate) {
                  v.freightDate[key] = res.datas[key];
                }
                this.changefeeAfterFee(res.datas.sellingPriceCurrency); // 汇率
                resolve();
              } else {
                if (v.curType === "inquiry") {
                  v.$msg.error("创建需求未保存成本及费用设置");
                }
              }
            }
          })
          .catch(() => {});
      });
    },
    getCostTemp () {
      let v = this;
      // 查询模版列表
      v.$axios
        .get(
          api.chargeTemplatePlatTemplate + "?code=" + v.calcFormDate.platformId
        )
        .then((res) => {
          if (res.code === 0) {
            v.costTempList = res.datas;
          }
        })
        .catch(() => {});
    },
    changeCostTemp (index) {
      this.showViewData(this.costTempList[index], true);
    },
    defaultSetting () {
      let v = this;
      let defaultSetting = JSON.parse(
        localStorage.getItem("defaultCalcSetting")
      );
      if (defaultSetting) {
        v.calcFormDate.commissionRate = defaultSetting.commissionRate;
        v.calcFormDate.paypalPrice = defaultSetting.paypalPrice;
        v.calcFormDate.additionalFees = defaultSetting.additionalFees;
        v.calcFormDate.afterSale = defaultSetting.afterSalesCost;
        v.calcFormDate.otherCost = defaultSetting.otherCost;
        v.calcFormDate.damageFeeAfterFee = defaultSetting.damageFeeAfterFee;
        v.calcFormDate.profitRateType = defaultSetting.transport
          ? defaultSetting.transport
          : "1";
        v.calcFormDate.profitRate = defaultSetting.profitRate;
      }
    },
    changefeeAfterFee (item) {
      let v = this;
      v.$store.state.currencyExchangeInfo.forEach((cur) => {
        if (cur.targetCurrencyCode === item) {
          v.calcFormDate.feeAfterFee = cur.merchantExchangeRate + "";
        }
      });
    },
    validProfitRate (rule, value, callback) {
      let v = this;
      var reg = this.nubReg;
      if (v.calcIndex !== 2) {
        if (value === "" || value === null) {
          callback(new Error("请填写销售利润率或成本利润率"));
        } else if (!reg.test(value)) {
          callback(new Error("请输入正确的销售利润率或成本利润率"));
        } else {
          callback();
        }
      } else {
        callback();
      }
    },
    validpaypalPrice (rule, value, callback) {
      let v = this;
      if (v.calcFormDate.platformId === 1) {
        if (value === "" || value === null) {
          callback(new Error("Paypal手续费不能为空"));
        } else {
          callback();
        }
      } else if (v.calcFormDate.platformId === 2) {
        if (value === "" || value === null) {
          callback(new Error("联盟费用不能为空"));
        } else {
          callback();
        }
      } else {
        callback();
      }
    },
    validfreightPrice (rule, value, callback) {
      let v = this;
      var reg = this.nubReg;
      if (v.calcIndex !== 2) {
        if (value === "" || value === null) {
          callback(new Error("运费不能为空"));
        } else if (!reg.test(value)) {
          callback(new Error("请输入正确的运费"));
        } else {
          callback();
        }
      } else {
        callback();
      }
    },
    validEstimatedPurchasePrice (rule, value, callback) {
      let v = this;
      var reg = this.nubReg;
      if (v.calcIndex !== 0) {
        if (value === "" || value === null) {
          callback(new Error("采购价不能为空"));
        } else if (!reg.test(value)) {
          callback(new Error("请输入正确的采购价"));
        } else {
          callback();
        }
      } else {
        callback();
      }
    },
    validatesellPrice (rule, value, callback) {
      let v = this;
      var reg = this.nubReg;
      if (v.calcIndex !== 1) {
        if (value === "" || value === null) {
          callback(new Error("售价不能为空"));
        } else if (!reg.test(value)) {
          callback(new Error("请输入正确的售价"));
        } else {
          callback();
        }
      } else {
        callback();
      }
    },
    calcVisibleChange (n) {
      /*
       询价逻辑
       **  从询价页面拿到采购价和重量
       **  根据重量和以保存的数据（头程运输，仓库..）调用试算接口，获取到运费（头程运费+当地运费）
       **  根据公式计算出销售利润率
       */
      if (n) {
        // 创建
        if (this.curType === "created") {
          this.calcFormDate.sellPrice = this.epSellPrice;
          if (this.platform === "ebay") {
            this.calcFormDate.platformId = 1;
          } else if (this.platform === "aliexpress") {
            this.calcFormDate.platformId = 2;
          } else {
            this.calcFormDate.platformId = 3;
          }
          console.log(this.sellPriceCurrency);
          this.calcFormDate.sellPriceCurrency = this.sellPriceCurrency;
        }
        // --end
        this.defaultSetting();
        this.getCostTemp();
        this.getWarehouse().then(() => {
          this.getCost().then(() => {
            // 询价
            if (this.curType === "inquiry") {
              this.spinShow = true;
              this.purchasePrice = this.purchase;
              this.freightDate.netWeight = this.weight;
              this.$refs.freightCalc.calcFreightFormDate.totalWeight = this.weight;
              this.$refs.freightCalc
                .calcFreightVisibleChange(true, "noGet")
                .then(() => {
                  this.$refs.freightCalc.tryCalc("novaild", true).then((data) => {
                    if (data.length === 0) {
                      this.$msg.error(
                        "查询当前商品重量的运费价格出错，运费价格更新失败"
                      );
                    } else {
                      this.calcFormDate.freightPrice = data[0].shippingFeeCost;
                      if (data[0].firstFreight) {
                        this.calcFormDate.freightHeadPrice =
                          data[0].firstFreight;
                      } else {
                        this.calcFormDate.freightHeadPrice = 0;
                      }
                    }
                    this.spinShow = false;
                  });
                });
            }
            this.spinShow = false;
          });
        });
        this.changefeeAfterFee(this.sellPriceCurrency); // 汇率
      }
    },
    openFreight () {
      let v = this;
      console.log(this.freightDate);
      v.$refs.freightCalc.calcFreightModal = true;
    },
    setPaypal () {
      // 根据不同平台设置不同费用
      let v = this;
      // eslint-disable-next-line no-empty
      if (v.calcFormDate.platformId === 1) {
      } else if (v.calcFormDate.platformId === 2) {
        v.calcFormDate.additionalFees = 0;
      } else {
        v.calcFormDate.paypalPrice = 0;
        v.calcFormDate.additionalFees = 0;
      }
    },
    getWarehouse () {
      let v = this;
      return new Promise((resolve) => {
        if (v.$store.state.ierpStatus !== "1") {
          v.$axios
            .post(api.getWarehouseAndEnableShipMethod)
            .then((res) => {
              if (res.code === 0) {
                v.warehouseAndEnableShipMethod = res.datas;
                if (
                  v.warehouseAndEnableShipMethod.localWarehouseInfoList.length >
                  0
                ) {
                  v.calcFormDate.warehouseId =
                    v.warehouseAndEnableShipMethod.localWarehouseInfoList[0].warehouseId;
                }
                v.$store.commit("warehouseAndEnableShipMethod", res.datas);
                resolve();
              }
            })
            .catch(() => {});
        } else {
          v.getWarehouseNew().then((data) => {
            v.$set(
              v.warehouseAndEnableShipMethod,
              "localWarehouseInfoList",
              data
            );
            resolve();
          });
        }
      });
    }
  }
};
</script>

<style>
.calc .ivu-form-item-label {
  width: 110px !important;
}

.profitPd {
}

.calc .ivu-form-item-error-tip {
  left: 110px !important;
}

.calcM .ivu-modal-body {
  overflow-y: visible !important;
}
</style>
<style scoped>
.ipt-wid {
  display: inline-block;
  width: calc(100% - 120px);
}
</style>
