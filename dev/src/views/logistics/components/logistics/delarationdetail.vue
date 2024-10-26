<template >
  <Card dis-hover class="declare">
    <div slot="title"><span>默认申报设置</span>
      <Button v-if="!hideSave && getPermission('packageRuleDetails_save')" size="small" class="ml20" @click="packageRuleDetailsSave">保存 </Button>
    </div>
    <Form ref="formInline" class="__noSetFormLabel" :model="formInline" :rules="ruleInline">
      <FormItem>
        <div slot="label"><span class="label">申报的SKU品种数</span></div>
        <RadioGroup v-model="declareQuantityType">
          <Radio label="0">全部申报</Radio>
          <Radio label="1">限制最多申报品种数</Radio>
          <InputNumber v-if="declareQuantityType === '1'" :disabled="declareQuantityType === '0'" size="small" :max="999999999" :min="1" v-model="declareQuantity"></InputNumber>
        </RadioGroup>
      </FormItem>
      <FormItem>
        <div slot="label"><span class="label">每个申报的SKU品种申报的数量</span></div>
        <RadioGroup v-model="goodsQuantityType">
          <Radio label="0">实际数量</Radio>
          <Radio label="1">限制最多申报数量</Radio>
          <InputNumber v-if="goodsQuantityType === '1'" :disabled="goodsQuantityType === '0'" size="small" :max="999999999" :min="1" v-model="goodsQuantity"></InputNumber>
        </RadioGroup>
      </FormItem>
      <FormItem>
        <div slot="label"><span class="label">包裹包含多SKU时选择申报的货品信息</span></div>
        <dyt-select class="w256" size="small" v-model="formInline.sortMethod">
          <Option v-for="(item,index) in sortMethodList" :key="index" :value="item.value">{{ item.label }}</Option>
        </dyt-select><span class="redColor ml10">本项设置仅为确定申报所使用的品名及数量，对报关重量和价格无影响</span>
      </FormItem>
      <FormItem>
        <div slot="label"><span class="label">申报重量的计算方法</span></div>
        <RadioGroup v-model="formInline.weightType">
          <div>
            <Radio label="F">使用固定的总重量申报</Radio>
            固定包裹总重量为
            <InputNumber :disabled="formInline.weightType === 'R'" size="small" :max="999999999" :min="1" v-model="formInline.fixWeight"></InputNumber>
            g <span class="redColor ml10">如果申报时各品种需要详细的申报重量，系统将自动按照申报的品种的真实货品重量加权平均计算</span>
          </div>
          <div>
            <Radio label="R">使用货品真实重量申报</Radio>
            <Checkbox :disabled="formInline.weightType === 'F'" v-model="isSetMaxWeight">设置包裹封顶重量为
              <InputNumber v-model="formInline.maxWeight" :disabled="formInline.weightType === 'F' || !isSetMaxWeight" size="small" :max="999999999" :min="0"></InputNumber>
            </Checkbox>
            g
          </div>
        </RadioGroup>
      </FormItem>
      <FormItem>
        <div slot="label">
          <span>申报价格的计算方法</span> <span class="ml20 f12" style="font-weight: normal">申报币种:</span><dyt-select class="w256" size="small" v-model="formInline.declareCurrency">
            <Option v-for="(item, index) in currencyList" :key="index" :value="item.value">{{ item.label }}</Option>
          </dyt-select>
        </div>
        <div>
          <RadioGroup v-model="formInline.priceType">
            <div>
              <Radio label="F">使用固定价格申报</Radio>
              固定申报价格
              <InputNumber :disabled="formInline.priceType !== 'F'" size="small" :max="999999999" :min="1" v-model="formInline.fixAmount"></InputNumber>
              <span class="redColor ml10">本项设置仅录入金额，币种取本申报币种</span>
            </div>
            <div>
              <Radio label="R">使用价格比例申报</Radio>
              使用包裹<dyt-select :disabled="formInline.priceType !== 'R'" class="w256" size="small" v-model="formInline.amountFrom">
                <Option v-for="(item,index) in amountFromList" :key="index" :value="item.value">{{ item.label }}</Option>
              </dyt-select>的
              <InputNumber :disabled="formInline.priceType !== 'R'" size="small" :max="999999999" :min="1" v-model="formInline.amountPercentage"></InputNumber>
              %
              <Checkbox v-model="isSetMinAmount" :disabled="formInline.priceType !== 'R'" class="ml10">
                <span>设置最低价格</span>
                <InputNumber :disabled="formInline.priceType !== 'R' || !isSetMinAmount" size="small" :max="999999999" :min="0" v-model="formInline.minAmount"></InputNumber>
              </Checkbox>
              <Checkbox v-model="isSetMaxAmount" :disabled="formInline.priceType !== 'R'" class="ml10">
                <span>设置封顶价格</span>
                <InputNumber :disabled="formInline.priceType !== 'R' || !isSetMaxAmount" size="small" :max="999999999" :min="0" v-model="formInline.maxAmount"></InputNumber>
              </Checkbox>
              <span class="redColor ml10">设置为本选项后，系统将根据申报币种自动做汇率转换</span>
            </div>

            <div>
              <Radio label="P">使用申报包裹的实际重量*单价申报，单价=</Radio>
              <InputNumber :disabled="formInline.priceType !== 'P'" size="small" :max="999999999" :min="1" v-model="formInline.weightAmount"></InputNumber>/千克
              <Checkbox v-model="isSetMinWeightAmount" :disabled="formInline.priceType !== 'P'" class="ml10">
                <span>设置最低价格</span>
                <InputNumber :disabled="formInline.priceType !== 'P' || !isSetMinWeightAmount" size="small" :max="999999999" :min="0" v-model="formInline.minWeightAmount"></InputNumber>
              </Checkbox>
              <Checkbox v-model="isSetMaxWeightAmount" :disabled="formInline.priceType !== 'P'" class="ml10">
                <span>设置封顶价格</span>
                <InputNumber :disabled="formInline.priceType !== 'P' || !isSetMaxWeightAmount" size="small" :max="999999999" :min="0" v-model="formInline.maxWeightAmount"></InputNumber>
              </Checkbox>
              <span class="redColor ml10">设置为本选项后，系统将根据申报币种自动做汇率转换</span>
            </div>
          </RadioGroup>
        </div>
      </FormItem>
    </Form>
  </Card>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
/* P
 declarationRules.vue */
export default {
  name: 'delarationdetail',
  mixins: [Mixin],
  data () {
    return {
      isSetMaxWeight: false,
      isSetMinAmount: false,
      isSetMaxAmount: false,
      declareQuantityType: '1',
      declareQuantity: 1,
      goodsQuantityType: '1',
      goodsQuantity: 1,
      amountFromList: [
        {
          label: '总金额',
          value: 'S'
        }, {
          label: '总成本',
          value: 'C'
        }
      ],
      sortMethodList: [
        {
          value: '0',
          label: '按照货品成本单价由高到低顺序选择'
        }, {
          value: '1',
          label: '按照货品成本单价X数量由高到低顺序选择'
        }, {
          value: '2',
          label: '按照货品单品体积由大到小顺序选择'
        }, {
          value: '3',
          label: '按照货品单品体积X数量由大到小顺序选择'
        }, {
          value: '4',
          label: '按照货品单品重量由大到小顺序选择'
        }, {
          value: '5',
          label: '按照货品单品重量X数量由大到小顺序选择'
        }
      ],
      setMaxWeight: false,
      setMaxAmount: false,
      setMinAmount: false,
      isSetMinWeightAmount: false,
      isSetMaxWeightAmount: false,
      formInline: {
        'declareQuantity': 1, // 申报货品数量(0为全部申报)
        'goodsQuantity': 1, //  每个SKU最多申报数量(0为实际数量) ,
        'sortMethod': '0', // 申报货品排序方式 ,
        'weightType': 'R', // 重量获取方式(F固定重量, R真实重量，限重在max_weight标识)
        'fixWeight': 0, // 固定最大重量(g) 大于0 ,
        'maxWeight': 0, // 最大重量(g) 0为不限制重量 ,
        'declareCurrency': 'CNY', // 申报价值币种
        'priceType': 'F', //  价值申报方式(F固价申报, R 按真实价值比例申报) ,
        'fixAmount': 5, // 固定申报价值 ,
        'amountFrom': 'S', // 金额取自总售价或总成本 ,S(seller总售价),C(cost总成本) ,
        'amountPercentage': 0, //  按总售价或总成本金额多少比例取值,存储除100以后实际值
        'minAmount': 0, // 申报价最小值0为不限制 ,
        'maxAmount': 0, // 申报价最大值0为不限制 ,
        minWeightAmount: 0,
        weightAmount: 0,
        maxWeightAmount: 0
        // 'isDefault': 'Y' // 是否默认规则(N为特殊规则，Y为默认规则) ,
      },
      ruleInline: {}
    };
  },
  created () {
    this.getCurrencyInfo();
  },
  props: {
    hideSave: {
      default: false,
      type: Boolean
    }
  },
  watch: {
    isSetMaxWeight (value) {
      if (!value) {
        this.formInline.maxWeight = 0;
      }
    },
    isSetMinAmount (value) {
      if (!value) {
        this.formInline.minAmount = 0;
      }
    },
    isSetMaxAmount (value) {
      if (!value) {
        this.formInline.maxAmount = 0;
      }
    },
    isSetMinWeightAmount (value) {
      if (!value) {
        this.formInline.minWeightAmount = 0;
      }
    },
    isSetMaxWeightAmount (value) {
      if (!value) {
        this.formInline.maxWeightAmount = 0;
      }
    }
  },
  methods: {
    setParams () {
      if (this.declareQuantityType === '0') {
        this.formInline.declareQuantity = 0;
      } else {
        this.formInline.declareQuantity = this.declareQuantity;
      }
      if (this.goodsQuantityType === '0') {
        this.formInline.goodsQuantity = 0;
      } else {
        this.formInline.goodsQuantity = this.goodsQuantity;
      }
      return this.formInline;
    },
    validMt () {
      let v = this;
      if (v.isSetMinAmount && v.isSetMaxAmount && v.formInline.minAmount >= v.formInline.maxAmount) {
        v.$Message.error('封顶价格要大于最低价格');
        return false;
      }
      if (v.isSetMinAmount && v.formInline.minAmount === 0) {
        v.$Message.error('请输入设置最低价格');
        return false;
      }

      if (v.isSetMaxAmount && v.formInline.maxAmount === 0) {
        v.$Message.error('请输入设置封顶价格');
        return false;
      }

      if (v.isSetMaxWeight && v.formInline.maxWeight === 0) {
        v.$Message.error('请输入设置包裹封顶重量');
        return false;
      }

      if (v.isSetMaxWeightAmount && v.formInline.maxWeightAmount === 0) {
        v.$Message.error('请输入设置申报重量封顶价格');
        return false;
      }

      if (v.isSetMinWeightAmount && v.formInline.minWeightAmount === 0) {
        v.$Message.error('请输入设置申报重量最低价格');
        return false;
      }
      return true;
    },
    packageRuleDetailsSave () {
      let params = this.setParams();
      let valid = this.validMt();
      if (valid) {
        this.axios.post(api.update_packageRuleDetails, params).then(res => {
          if (res.data.code === 0) {
            this.$Message.success('保存成功');
          }
        });
      }
    },
    reset () {
      this.$nextTick(() => {
        this.declareQuantityType = '1';
        this.goodsQuantityType = '1';
        this.declareQuantity = 1;
        this.goodsQuantity = 1;
        this.formInline = {
          'declareQuantity': 1, // 申报货品数量(0为全部申报)
          'goodsQuantity': 1, //  每个SKU最多申报数量(0为实际数量) ,
          'sortMethod': '0', // 申报货品排序方式 ,
          'weightType': 'R', // 重量获取方式(F固定重量, R真实重量，限重在max_weight标识)
          'fixWeight': 0, // 固定最大重量(g) 大于0 ,
          'maxWeight': 0, // 最大重量(g) 0为不限制重量 ,
          'declareCurrency': 'CNY', // 申报价值币种
          'priceType': 'F', //  价值申报方式(F固价申报, R 按真实价值比例申报) ,
          'fixAmount': 5, // 固定申报价值 ,
          'amountFrom': 'S', // 金额取自总售价或总成本 ,S(seller总售价),C(cost总成本) ,
          'amountPercentage': 0, //  按总售价或总成本金额多少比例取值,存储除100以后实际值
          'minAmount': 0, // 申报价最小值0为不限制 ,
          'maxAmount': 0, // 申报价最大值0为不限制 ,
          minWeightAmount: 0,
          weightAmount: 0,
          maxWeightAmount: 0
          // 'isDefault': 'Y' // 是否默认规则(N为特殊规则，Y为默认规则) ,
        };
      });
    },
    setForm (data) {
      this.formInline = data;
      if (this.formInline.declareQuantity === 0) {
        this.declareQuantityType = '0';
      } else {
        this.declareQuantityType = '1';
        this.declareQuantity = this.formInline.declareQuantity;
      }
      if (this.formInline.goodsQuantity === 0) {
        this.goodsQuantityType = '0';
      } else {
        this.goodsQuantityType = '1';
        this.goodsQuantity = this.formInline.goodsQuantity;
      }
      if (this.formInline.minAmount) {
        this.isSetMinAmount = true;
      }
      if (this.formInline.maxAmount) {
        this.isSetMaxAmount = true;
      }
      if (this.formInline.minWeightAmount) {
        this.isSetMinWeightAmount = true;
      }
      if (this.formInline.maxWeightAmount) {
        this.isSetMaxWeightAmount = true;
      }
      if (this.formInline.maxWeight) {
        this.isSetMaxWeight = true;
      }
    },
    getRuleDetails (id) {
      this.axios.get(api.get_ruleDetails + id).then(res => {
        if (res.data.code === 0 && res.data.datas) {
          this.setForm(res.data.datas);
        }
      });
    },
    getPackageRuleDetails () {
      this.axios.get(api.get_packageRuleDetails).then(res => {
        if (res.data.code === 0 && res.data.datas) {
          this.setForm(res.data.datas);
        }
      });
    }
  }
};
</script>
<style>
.declare .ivu-form .ivu-form-item-label {
  display: block;
  float: none;
  text-align: left;
  font-weight: bold;
  font-size: 14px;
}

.label {
  font-weight: bold;
}
</style >
<style scoped >
</style >
