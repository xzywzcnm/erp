<template>
  <div>
    <Modal
      v-model="modal1"
      @on-visible-change="calcDefaultVisibleChange"
      title="计算器默认设置"
    >
      <Form
        ref="calcSettingF"
        :model="calcSetting"
        :rules="calcSettingRules"
        :label-width="125"
        class="rest"
      >
        <FormItem prop="commissionRate">
          <label slot="label" class="redDot">平台佣金率</label>
          <Input v-model="calcSetting.commissionRate" class="ipt" />
        </FormItem>
        <FormItem prop="paypalPrice">
          <label slot="label" class="redDot">Paypal手续费</label>
          <Input
            v-model="calcSetting.paypalPrice"
            style="width: 133px"
          />%+附加费用<Input
            v-model="calcSetting.additionalFees"
            style="width: 100px"
          />
        </FormItem>
        <FormItem prop="allianceFee">
          <label slot="label">速卖通联盟费用(%)</label>
          <Input v-model="calcSetting.allianceFee" class="ipt" />
        </FormItem>
        <FormItem prop="afterSalesCost">
          <label slot="label">售后费用(%)</label>
          <Input v-model="calcSetting.afterSalesCost" class="ipt" />
        </FormItem>
        <FormItem prop="otherCost">
          <label slot="label">其他成本(CNY)</label>
          <Input v-model="calcSetting.otherCost" class="ipt" />
        </FormItem>
        <FormItem prop="damageFeeAfterFee">
          <label slot="label">汇率折损率(%)</label>
          <Input v-model="calcSetting.damageFeeAfterFee" class="ipt" />
        </FormItem>
        <FormItem prop="profitRate">
          <label slot="label">
            <dyt-select v-model="calcSetting.transport" style="margin-top: -9px">
              <Option
                v-for="item in transportList"
                :key="item.value"
                :value="item.value"
                >{{ item.label }}</Option
              >
            </dyt-select>
          </label>
          <Input v-model="calcSetting.profitRate" class="ipt" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="modal1 = false">取消</Button>
        <Button type="primary" @click="addLocal">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import CommonMixin from "@/components/mixin/commonMixin";

export default {
  name: "defaultCalcSetting",
  mixins: [CommonMixin],
  components: {},
  data () {
    let v = this;
    return {
      modal1: false,
      transportList: [
        {
          label: "销售利润率(%)",
          value: "1"
        },
        {
          label: "成本利润率(%)",
          value: "2"
        }
      ],
      calcSetting: {
        commissionRate: "", // 平台佣金率
        paypalPrice: "", // Paypal手续费
        additionalFees: "", // 附加费用
        allianceFee: "", // 速卖通联盟费用
        afterSalesCost: "", // 售后费用
        damageFeeAfterFee: "",
        profitRate: "",
        transport: "1",
        otherCost: "" // 其他成本
      },
      calcSettingRules: {
        commissionRate: {
          validator: v.commissionRateValidate,
          trigger: "blur"
        },
        paypalPrice: {
          validator: v.paypalPriceValidate,
          trigger: "blur"
        },
        allianceFee: {
          validator: v.allianceFeeValidate,
          trigger: "blur"
        },
        afterSalesCost: {
          validator: v.afterSalesCostValidate,
          trigger: "blur"
        },
        damageFeeAfterFee: {
          validator: v.damageFeeAfterFeeValidate,
          trigger: "blur"
        },
        profitRate: {
          validator: v.profitRateValidate,
          trigger: "blur"
        },
        otherCost: {
          validator: v.otherCostValidate,
          trigger: "blur"
        }
      }
    };
  },
  methods: {
    calcDefaultVisibleChange (n) {
      if (n) {
        let defaultSetting = JSON.parse(
          localStorage.getItem("defaultCalcSetting")
        );
        if (defaultSetting) {
          Object.assign(this.calcSetting, defaultSetting);
        }
      }
    },
    addLocal () {
      let v = this;
      v.$refs.calcSettingF.validate((valid) => {
        if (valid) {
          localStorage.setItem(
            "defaultCalcSetting",
            JSON.stringify(v.calcSetting)
          );
          v.modal1 = false;
        }
      });
    },
    commissionRateValidate (rule, value, callback) {
      // let v = this;
      var reg = this.nubReg;
      if (value === "" || value === null) {
        callback(new Error("平台佣金率不能为空"));
      } else if (!reg.test(value)) {
        callback(new Error("请输入数字"));
      } else {
        callback();
      }
    },
    paypalPriceValidate (rule, value, callback) {
      // let v = this;
      var reg = this.nubReg;
      if (value === "" || value === null) {
        callback(new Error("Paypal手续费不能为空"));
      } else if (!reg.test(value)) {
        callback(new Error("请输入数字"));
      } else {
        callback();
      }
    },
    allianceFeeValidate (rule, value, callback) {
      // let v = this;
      var reg = this.nubReg;
      if (value === "" || value === null) {
        callback();
      } else if (!reg.test(value)) {
        callback(new Error("请输入数字"));
      } else {
        callback();
      }
    },
    afterSalesCostValidate (rule, value, callback) {
      // let v = this;
      var reg = this.nubReg;
      if (value === "" || value === null) {
        callback();
      } else if (!reg.test(value)) {
        callback(new Error("请输入数字"));
      } else {
        callback();
      }
    },
    damageFeeAfterFeeValidate (rule, value, callback) {
      // let v = this;
      var reg = this.nubReg;
      if (value === "" || value === null) {
        callback();
      } else if (!reg.test(value)) {
        callback(new Error("请输入数字"));
      } else {
        callback();
      }
    },
    profitRateValidate (rule, value, callback) {
      // let v = this;
      var reg = this.nubReg;
      if (value === "" || value === null) {
        callback();
      } else if (!reg.test(value)) {
        callback(new Error("请输入数字"));
      } else {
        callback();
      }
    },
    otherCostValidate (rule, value, callback) {
      // let v = this;
      var reg = this.nubReg;
      if (value === "" || value === null) {
        callback();
      } else if (!reg.test(value)) {
        callback(new Error("请输入数字"));
      } else {
        callback();
      }
    }
  },
  computed: {}
};
</script>

<style scoped>
.ipt {
  width: 300px;
}
</style>
