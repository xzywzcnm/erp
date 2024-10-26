<template>
  <div>
    <Modal
      v-model="calcModal"
      class="co clearMarginAuto rest calcM"
      width="1000"
      @on-visible-change="calcVisibleChange"
    >
      <p slot="header" @mousedown="moveMt" class="moveHead">
        <span>预期采购价计算器</span>
      </p>
      <ButtonGroup>
        <span v-for="(item, index) in calcTits" :key="index">
          <Button
            type="primary"
            v-if="item.checked"
            @click="calcTag(item, index)"
            >{{ item.title }}</Button
          >
          <Button v-if="!item.checked" @click="calcTag(item, index)">{{
            item.title
          }}</Button>
        </span>
      </ButtonGroup>

      <Button
        @click="$refs.calcSetting.modal1 = true"
        class="fr"
        type="primary"
        shape="circle"
        size="small"
        icon="ios-settings"
        >参数设置</Button
      >
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
              <dyt-select v-model="calcFormDate.platformId" class="ipt-wid">
                <Option
                  v-for="(item, index) in platformList"
                  :key="index"
                  :value="item.value"
                  >{{ item.label }}</Option
                >
              </dyt-select>
            </FormItem>
          </Col>
          <Col span="11" v-show="calcIndex !== 1">
            <FormItem prop="sellPrice">
              <label slot="label" class="redDot">售价</label>
              <Input style="width: 80px" v-model="calcFormDate.sellPrice" />
              <dyt-select
                style="width: calc(100% - 130px - 80px); margin-left: 10px"
                v-model="calcFormDate.sellPriceCurrency"
                filterable
                @on-change="changefeeAfterFee"
                ref="afterFee1"
              >
                <Option
                  v-for="(item, index) in currencyList"
                  :key="index"
                  :value="item.code"
                  :label="item.name"
                ></Option>
              </dyt-select>
            </FormItem>
          </Col>
          <Col span="11">
            <FormItem prop="warehouseId">
              <label slot="label" class="redDot">发货仓库</label>
              <dyt-select
                v-model="calcFormDate.warehouseId"
                class="ipt-wid"
                filterable
              >
                <Option
                  v-for="item in warehouseAndEnableShipMethod.localWarehouseInfoList"
                  :key="item.warehouseId"
                  :value="item.warehouseId"
                  >{{ item.warehouseName }}</Option
                >
              </dyt-select>
            </FormItem>
          </Col>
          <Col span="11" v-show="calcIndex !== 0">
            <FormItem prop="estimatedPurchasePrice">
              <label slot="label">采购价(CNY)</label>
              <Input
                v-model.trim="calcFormDate.estimatedPurchasePrice"
                class="ipt-wid"
              />
            </FormItem>
          </Col>
          <Col span="11">
            <FormItem prop="freightPrice">
              <label slot="label" class="redDot">总运费(CNY)</label>
              <Input
                style="width: calc(100% - 130px - 96px); margin-right: 10px"
                v-model="calcFormDate.freightPrice"
              />
              <Button @click="openFreight">运费计算器</Button>
            </FormItem>
          </Col>
          <Col span="11">
            <FormItem prop="commissionRate">
              <label slot="label" class="redDot">平台佣金率(%)</label>
              <Input
                v-model.trim="calcFormDate.commissionRate"
                class="ipt-wid"
              />
            </FormItem>
          </Col>
          <Col span="11" v-show="calcFormDate.platformId === 1">
            <FormItem prop="paypalPrice">
              <label slot="label" class="redDot">Paypal手续费</label>
              <Input style="width: 80px" v-model="calcFormDate.paypalPrice" />
              <span style="width: 60px">%+附加费用</span>
              <Input
                style="width: 60px"
                v-model="calcFormDate.additionalFees"
              />
              <dyt-select
                style="width: 100px; margin-left: 10px"
                v-model="calcFormDate.sellPriceCurrency"
                filterable
                @on-change="changefeeAfterFee"
                disabled
                ref="afterFee1"
              >
                <Option
                  v-for="(item, index) in currencyList"
                  :key="index"
                  :value="item.code"
                  :label="item.name"
                ></Option>
              </dyt-select>
            </FormItem>
          </Col>
          <Col span="11" v-show="calcFormDate.platformId === 2">
            <FormItem prop="paypalPrice">
              <label slot="label" class="redDot">联盟费用(%)</label>
              <Input style="width: 80px" v-model="calcFormDate.paypalPrice" />
            </FormItem>
          </Col>
          <Col span="11">
            <FormItem>
              <label slot="label">售后费用率(%)</label>
              <Input v-model.trim="calcFormDate.afterSale" class="ipt-wid" />
            </FormItem>
          </Col>
          <Col span="11">
            <FormItem>
              <label slot="label">其他成本(CNY)</label>
              <Input v-model.trim="calcFormDate.otherCost" class="ipt-wid" />
            </FormItem>
          </Col>
          <Col span="11">
            <FormItem prop="feeAfterFee">
              <label slot="label" class="redDot">汇率</label>
              <Input
                v-model.trim="calcFormDate.feeAfterFee"
                style="width: calc(100% - 120px); margin-right: 10px"
              />
            </FormItem>
          </Col>
          <Col span="11">
            <FormItem>
              <label slot="label">汇率折损率(%)</label>
              <Input
                v-model.trim="calcFormDate.damageFeeAfterFee"
                class="ipt-wid"
              />
            </FormItem>
          </Col>
          <Col span="11" v-show="calcIndex !== 2">
            <FormItem prop="profitRate">
              <div
                slot="label"
                style="position: absolute; z-index: 5"
                class="redDot"
              >
                <dyt-select
                  v-model="calcFormDate.profitRateType"
                  style="margin-top: -10px; width: 95px"
                >
                  <Option
                    v-for="(item, index) in ProfitMarginList"
                    :key="index"
                    :value="item.value"
                    >{{ item.label }}</Option
                  >
                </dyt-select>
              </div>
              <Input v-model="calcFormDate.profitRate" class="ipt-wid" />
            </FormItem>
          </Col>
          <Col span="11" v-show="calcIndex === 0">
            <FormItem>
              <label slot="label">采购价(CNY)</label>
              <Input
                class="ipt-wid"
                v-model="estimatedPurchasePrice"
                readonly
                style="color: red"
              />
            </FormItem>
          </Col>
          <Col span="11" v-show="calcIndex === 1">
            <FormItem>
              <label slot="label">售价</label>
              <Input v-model="sellPrice" style="width: 80px" readonly />
              <dyt-select
                style="width: calc(100% - 130px - 84px); margin-left: 10px"
                v-model="calcFormDate.sellPriceCurrency"
                filterable
                @on-change="changefeeAfterFee"
                ref="afterFee"
              >
                <Option
                  v-for="(item, index) in currencyList"
                  :key="index"
                  :value="item.code"
                  :label="item.name"
                ></Option>
              </dyt-select>
            </FormItem>
          </Col>
          <Col span="11" v-show="calcIndex === 2">
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
                    >{{ item.label }}</Option
                  >
                </dyt-select>
              </div>
              <Input v-model="profitRate" readonly class="ipt-wid" />
            </FormItem>
          </Col>
          <Col span="11">
            <FormItem>
              <div slot="label">利润额(CNY)</div>
              <Input v-model="profitAmount" readonly class="ipt-wid" />
            </FormItem>
          </Col>
        </Row>
      </Form>
      <p>{{ calcTit }}</p>
      <p>售价=总成本/（1-销售利润率）=总成本*（1+成本利润率）</p>
      <div slot="footer">
        <Button
          type="primary"
          v-show="calcIndex === 0"
          @click="
            setPaypal();
            calcEstimatedPurchasePrice();
          "
          >计算目标采购价</Button
        >
        <Button
          type="primary"
          v-show="calcIndex === 1"
          @click="
            setPaypal();
            calcSellPrice();
          "
          >计算售价</Button
        >
        <Button
          type="primary"
          v-show="calcIndex === 2"
          @click="
            setPaypal();
            calcProfitRate();
          "
          >计算销售利润率</Button
        >
        <Button
          type="primary"
          v-show="calcIndex === 2"
          @click="
            setPaypal();
            calcProfitRate1();
          "
          >计算成本利润率</Button
        >
      </div>
    </Modal>
    <freightCalc ref="freightCalc"></freightCalc>
    <setting ref="calcSetting"></setting>
  </div>
</template>

<script>
import CommonMixin from "../../../components/mixin/commonMixin";
import freightCalc from "./freightCalc";
import setting from "./defaultCalcSetting";
import api from "@/api/api";

export default {
  name: "costCalc",
  mixins: [CommonMixin],
  components: {
    freightCalc,
    setting
  },
  data () {
    let v = this;
    return {
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
        paypalPrice: "",
        sellPrice: "",
        sellPriceCurrency: "CNY",
        freightPrice: "",
        commissionRate: "",
        additionalFees: "",
        feeAfterFee: "1",
        otherCost: "",
        afterSale: "",
        profitRate: "",
        profitRateType: "1",
        estimatedPurchasePrice: "",
        damageFeeAfterFee: ""
      },
      calcIndex: 0,
      warehouseAndEnableShipMethod: []
    };
  },
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
    currencyList () {
      return this.$store.state.currencyList;
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
    }
  },
  created () {},
  methods: {
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
      if (n) {
        this.$refs.calcForm.resetFields();
        this.getWarehouse();
        this.defaultSetting();
        this.$store.dispatch("currencyExchangeInfo");
      }
    },
    openFreight () {
      let v = this;
      v.$refs.freightCalc.calcFreightModal = true;
    },
    calcTag (data, index) {
      let v = this;
      v.calcIndex = index;
      /*  v.$refs.afterFee.value=JSON.parse(d);
       v.$refs.afterFee1.value=JSON.parse(d); */
      /* v.$refs.calcForm.resetFields(); */
      v.calcTits.forEach((item) => {
        item.checked = false;
      });
      data.checked = true;
      v.estimatedPurchasePrice = 0;
      v.sellPrice = 0;
      v.profitRate = 0;
      //  v.$refs.calcForm.resetFields();
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
    calcEstimatedPurchasePrice () {
      let v = this;
      // 总成本=采购价+运费+Paypal附加费用+其他成本+售价*（平台佣金率+Paypal手续费率+汇率折损率+售后费用率）
      // 售价=总成本/（1-销售利润率）=总成本*（1+成本利润率）
      /*
       * (采购价+运费+Paypal附加费用+其他成本+售价*（平台佣金率+Paypal手续费率+汇率折损率+售后费用率）)/（1-销售利润率）=
       * */
      v.$refs.calcForm.validate((valid) => {
        if (valid) {
          let allCost = 0;
          let sellPrice = 0; // 售价
          let additionalFees = 0; // 附加费用
          sellPrice = (
            v.calcFormDate.sellPrice * v.calcFormDate.feeAfterFee
          ).toFixed(2);
          additionalFees = (
            v.calcFormDate.additionalFees * v.calcFormDate.feeAfterFee
          ).toFixed(2);
          if (v.calcFormDate.profitRateType === "1") {
            // 销售利润率
            allCost = sellPrice * (1 - v.calcFormDate.profitRate * 0.01);
          } else {
            // 成本利润率
            allCost = (sellPrice * 1) / (1 + v.calcFormDate.profitRate * 0.01);
          }
          v.estimatedPurchasePrice = (
            allCost -
            (v.calcFormDate.freightPrice * 1 +
              additionalFees * 1 +
              v.calcFormDate.otherCost * 1 +
              sellPrice *
                1 *
                (v.calcFormDate.commissionRate * 1 +
                  v.calcFormDate.paypalPrice * 1 +
                  v.calcFormDate.damageFeeAfterFee * 1 +
                  v.calcFormDate.afterSale * 1) *
                0.01)
          ).toFixed(2);
        }
      });
    },
    calcSellPrice () {
      let v = this;
      let ExchangeRate = 0;
      let additionalFees = 0; // 附加费用
      ExchangeRate = v.calcFormDate.feeAfterFee;
      additionalFees = (
        v.calcFormDate.additionalFees * v.calcFormDate.feeAfterFee
      ).toFixed(2);
      let A =
        v.calcFormDate.estimatedPurchasePrice * 1 +
        v.calcFormDate.freightPrice * 1 +
        additionalFees * 1 +
        v.calcFormDate.otherCost * 1;
      let C =
        (v.calcFormDate.commissionRate * 1 +
          v.calcFormDate.paypalPrice * 1 +
          v.calcFormDate.damageFeeAfterFee * 1 +
          v.calcFormDate.afterSale * 1) *
        0.01;
      let D = 1 - v.calcFormDate.profitRate * 0.01;
      v.$refs.calcForm.validate((valid) => {
        if (valid) {
          if (v.calcFormDate.profitRateType === "1") {
            // 销售利润率
            v.sellPrice = (A / (D - C) / ExchangeRate).toFixed(2);
          } else {
            // 成本利润率
            v.sellPrice = ((A * D) / (1 - C * D) / ExchangeRate).toFixed(2);
          }
        }
      });
    },
    calcProfitRate () {
      let v = this;
      let sellPrice = 0;
      let additionalFees = 0; // 附加费用
      v.calcFormDate.profitRateType = "1";
      sellPrice = (
        v.calcFormDate.sellPrice * v.calcFormDate.feeAfterFee
      ).toFixed(2);
      additionalFees = (
        v.calcFormDate.additionalFees * v.calcFormDate.feeAfterFee
      ).toFixed(2);
      let B =
        v.calcFormDate.estimatedPurchasePrice * 1 +
        v.calcFormDate.freightPrice * 1 +
        additionalFees * 1 +
        v.calcFormDate.otherCost * 1 +
        sellPrice *
          1 *
          ((v.calcFormDate.commissionRate * 1 +
            v.calcFormDate.paypalPrice * 1 +
            v.calcFormDate.damageFeeAfterFee * 1 +
            v.calcFormDate.afterSale * 1) *
            0.01);
      let C = sellPrice * 1;
      v.$refs.calcForm.validate((valid) => {
        if (valid) {
          v.profitRate = ((1 - B / C) * 100).toFixed(2);
        }
      });
      // 总成本=采购价+运费+Paypal附加费用+其他成本+售价*（平台佣金率+Paypal手续费率+汇率折损率+售后费用率）
      // 售价=总成本/（1-销售利润率）=总成本*（1+成本利润率）
    },
    calcProfitRate1 () {
      let v = this;
      let sellPrice = 0;
      v.calcFormDate.profitRateType = "2";
      if (
        v.calcFormDate.sellPriceCurrency !== "CNY" ||
        v.calcFormDate.sellPrice !== 0
      ) {
        v.$store.state.currencyExchangeInfo.forEach((cur) => {
          if (cur.targetCurrencyCode === v.calcFormDate.sellPriceCurrency) {
            sellPrice = (
              v.calcFormDate.sellPrice * cur.merchantExchangeRate
            ).toFixed(2);
          }
        });
      }
      let B =
        v.calcFormDate.estimatedPurchasePrice * 1 +
        v.calcFormDate.freightPrice * 1 +
        v.calcFormDate.additionalFees * 1 +
        v.calcFormDate.otherCost * 1 +
        sellPrice *
          1 *
          ((v.calcFormDate.commissionRate * 1 +
            v.calcFormDate.paypalPrice * 1 +
            v.calcFormDate.damageFeeAfterFee * 1 +
            v.calcFormDate.afterSale * 1) *
            0.01);
      let C = sellPrice * 1;
      v.$refs.calcForm.validate((valid) => {
        if (valid) {
          v.profitRate = ((C / B - 1) * 100).toFixed(2);
        }
      });
    },
    getWarehouse () {
      let v = this;
      if (v.$store.state.ierpStatus !== "1") {
        v.$axios
          .post(api.getWarehouseAndEnableShipMethod)
          .then((res) => {
            if (res.code === 0) {
              v.warehouseAndEnableShipMethod = res.datas;
              if (
                v.warehouseAndEnableShipMethod.localWarehouseInfoList.length > 0
              ) {
                v.calcFormDate.warehouseId =
                  v.warehouseAndEnableShipMethod.localWarehouseInfoList[0].warehouseId;
              }
              v.$store.commit("warehouseAndEnableShipMethod", res.datas);
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
        });
      }
    },
    fixDate () {}
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
