<template >
  <div class="pickListRule">
    <Form ref="pickListRule" :model="sltParams" :rules="ruleValidate" :label-width="320" label-position="left"
      class="fmb0 ">
      <!-- 库区组 -->
      <FormItem label="允许不同库区组的出库单进入同一张拣货单？">
        <RadioGroup v-model="sltParams.groupNum" @on-change="commonChange">
          <Radio label="0">
            <span>允许</span>
          </Radio>
          <Radio label="1">
            <span>不允许</span>
          </Radio>
        </RadioGroup>
      </FormItem>
      <!-- 库区 -->
      <FormItem label="允许不同库区的出库单进入同一张拣货单？">
        <RadioGroup v-model="sltParams.areaNum" @on-change="commonChange">
          <Radio label="0">
            <span>允许</span>
          </Radio>
          <Radio label="1">
            <span>不允许</span>
          </Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="允许单品多件包裹与单品单件包裹进入同一张拣货单？" v-if="show">
        <RadioGroup v-model="sltParams.num1" @on-change="commonChange">
          <Radio label="0">
            <span>允许</span>
          </Radio>
          <Radio label="1">
            <span>不允许</span>
          </Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="允许不同物流商的包裹进入同一张拣货单？">
        <RadioGroup v-model="sltParams.num2" @on-change="commonChange">
          <Radio label="0">
            <span>允许</span>
          </Radio>
          <Radio label="1">
            <span>不允许</span>
          </Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="允许相同物流商不同邮寄方式的包裹进入同一张拣货单？" v-if="sltParams.num2 === '0'">
        <RadioGroup v-model="sltParams.num3" @on-change="commonChange">
          <Radio label="0">
            <span>允许</span>
          </Radio>
          <Radio label="1">
            <span>不允许</span>
          </Radio>
        </RadioGroup>
      </FormItem>
      <template v-if="sortedType">
        <FormItem label="拣货顺序">
          <RadioGroup v-model="sltParams.sortedType" @on-change="commonChange">
            <Radio label="0">
              <span>按库位拣货</span>
            </Radio>
            <Radio label="1">
              <span>按sku拣货</span>
            </Radio>
          </RadioGroup>
        </FormItem>
      </template>
      <template v-if="isSplitCombination">
        <FormItem label="允许组合和普通产品的产品进入同一张拣货单">
          <RadioGroup v-model="sltParams.isSplitCombination" @on-change="commonChange">
            <Radio label="0">
              <span>允许</span>
            </Radio>
            <Radio label="1">
              <span>不允许</span>
            </Radio>
          </RadioGroup>
        </FormItem>
      </template>
      <FormItem label="单张拣货单最大出库单数" class="mt10" prop="max">
        <Input v-model.trim="sltParams.max" type="number" style="width: 150px;" @on-change="commonChange" />
      </FormItem>
      <!-- 海外仓拣货显示每张拣货单最大物品数 -->
      <FormItem label="单张最大物品数量" class="mt20" prop="maxsku" v-if="maxsku">
        <div class="tips">
          <Input v-model.trim="sltParams.maxsku" type="number" style="width: 150px;" @on-change="commonChange" />
          <Tooltip content="按照填写的sku数量生成拣货单数量！" placement="right">
            <Icon type="ios-help-circle-outline" class="icons" />
          </Tooltip>
        </div>
      </FormItem>
    </Form>
  </div>
</template>
<script>
export default {
  name: 'pickListRule',
  props: ['show', 'update', 'sortedType', 'isSplitCombination', 'maxsku'],
  data() {
    let _self = this;
    return {
      sltParams: {
        num1: '0',
        num2: '0',
        num3: '0',
        groupNum: '0',
        areaNum: '0',
        sortedType: '0',
        isSplitCombination: '1',
        max: 20,
        maxsku: ''
      },
      ruleValidate: {
        max: [
          { validator: _self.validateMax, trigger: 'blur' }
        ],
        maxsku: [
          { validator: _self.validateMaxsku, trigger: 'blur' }
        ]
      }
    };
  },
  methods: {
    commonChange() {
      this.$emit('backSlt', this.sltParams);
    },
    setData() {
      //  父组件 赋值
      let v = this;
      if (localStorage.getItem('pickListSetting' + this.$store.state.erpConfig.userInfo.userId)) {
        let pickListSetting = JSON.parse(localStorage.getItem('pickListSetting' + this.$store.state.erpConfig.userInfo.userId));
        v.$nextTick(() => {
          v.sltParams = {
            num1: pickListSetting.num1,
            num2: pickListSetting.num2,
            num3: pickListSetting.num3,
            groupNum: pickListSetting.groupNum,
            areaNum: pickListSetting.areaNum,
            max: pickListSetting.max
          };
        });
      }
    },
    // 验证最大出库单数
    validateMax(rule, value, callback) {
      this.commonValidate(rule, value, callback, 'max');
    },
    // 验证最大物品数
    validateMaxsku(rule, value, callback) {
      this.commonValidate(rule, value, callback, 'maxsku');
    },
    // 公用验证
    commonValidate(rule, value, callback, type) {
      if (value) {
        if (type === 'max') {
          if (value > 5000) {
            callback(new Error('数值最多不能超过5000'));
            return;
          }
          if (this.sltParams.maxsku) {
            callback(new Error('最大出库单数和最大物品数只能满足一种条件'));
            return;
          }
        }
        if (type === 'maxsku') {
          if (value.length > 6) {
            callback(new Error('最多可输入5位数'));
            return;
          }
          if (this.sltParams.max) {
            callback(new Error('最大物品数和最大出库单数只能满足一种条件'));
            return;
          }
        }
        if (!this.$regular.positiveNumber.test(value)) {
          callback(new Error('请输入大于0的整数'));
          return;
        }
        callback();
      } else {
        if (!(this.sltParams.maxsku || this.sltParams.max)) {
          callback(new Error('最大物品数和最大出库单数必须要填写其中一项!'));
          return;
        }
        callback();
      }
    },
    // 提交表单
    handleSubmit() {
      return new Promise((resolve, reject) => {
        this.$refs['pickListRule'].validate((valid) => {
          resolve(valid);
        })
      })
    }
  },
  watch: {
    update: {
      deep: true,
      immediate: true,
      handler: function (n, o) {
        if (n) {
          this.sltParams.num2 = n.allowDiffLogisticsDealer;
          this.sltParams.num3 = n.allowDiffMailMode;
          this.sltParams.areaNum = n.allowDiffWarehouseBlock;
          this.sltParams.groupNum = n.allowDiffWarehouseBlockGroup;
          this.sltParams.max = n.maxPickingsNum;
        }
      }
    },
  }
};
</script>
<style lang="less" scoped>
.pickListRule {
  /deep/.ivu-radio-group {
    line-height: 32px;
    display: flex;
    align-items: center;
  }

  .ivu-radio-wrapper {
    margin-right: 20px;
  }

  .tips {

    /deep/.ivu-tooltip-rel,
    & {
      display: flex;
      align-items: center;
    }

    .icons {
      font-size: 24px;
      font-weight: bold;
      margin-left: 10px;
      cursor: pointer;
    }
  }
}
</style>
