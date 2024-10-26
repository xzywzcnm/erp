<template>
  <div class="mainBody storageTemplateDetail">
    <div style="font-size: 15px; display: flex; align-items: center" class="mt10 ml10">
      <Icon type="md-arrow-back" style="cursor: pointer" @click="back" />
      <span style="font-weight: 500; cursor: pointer" class="ml10" @click="back">返回</span>
      <div style="width: 2px; height: 20px; background: #dcdfe6" class="ml10"></div>
      <Button type="primary" class="ml10" @click="saveData" v-if="editStatus">保存</Button>
    </div>
    <Form :model="formData" :label-width="120" class="mt20" :rules="rules" ref="formData">
      <Form-item label="费用模版名称：" prop="templateName">
        <dyt-input v-model="formData.templateName" style="width: 200px" :disabled="!editStatus">
        </dyt-input>
      </Form-item>
      <Form-item label="费用币种：" prop="currency">
        <dyt-select v-model="formData.currency" style="width: 200px" :disabled="!editStatus">
          <Option v-for="(item, index) in currencyList" :key="index" :label="item.targetCurrencyCode"
            :value="item.targetCurrencyCode"></Option>
        </dyt-select>
      </Form-item>
      <Form-item label="总折扣：" prop="discount">
        <dyt-input v-model="formData.discount" style="width: 200px" :disabled="!editStatus">
        </dyt-input>
        <span class="ml10">%</span>
        <Button type="primary" style="position: absolute; right: 20px" @click="addGoods" v-if="editStatus">增加货型</Button>
      </Form-item>
      <Form-item label="仓储费用：">
        <Card :dis-hover="true" :bordered="true" v-for="(item, index) in formData.storageCostTemplateQO
          .storageCostTemplateCargoTypeQOS" :key="index" class="mb10 storageCard">
          <div class="cardStyle">
            <Form-item label="货型名称：" :label-width="95" class="itemOption"
              :prop="`storageCostTemplateQO.storageCostTemplateCargoTypeQOS[${index}].cargoTypeName`"
              :rules="cargoTypeRule">
              <dyt-input v-model="item.cargoTypeName" style="width: 100px" placeholder="请输入货型名称"
                :disabled="!editStatus"></dyt-input>
            </Form-item>
            <span class="ml20">重量区间：</span>
            <Form-item :prop="`storageCostTemplateQO.storageCostTemplateCargoTypeQOS[${index}].weightLowerLimit`"
              :rules="tableRules">
              <dyt-input v-model="item.weightLowerLimit" style="width: 70px" :disabled="!editStatus"></dyt-input>
            </Form-item>
            <span class="ml10 mr10">{{ weightInterval }}</span>
            <Form-item :prop="`storageCostTemplateQO.storageCostTemplateCargoTypeQOS[${index}].weightUpperLimit`"
              :rules="tableRules">
              <dyt-input v-model="item.weightUpperLimit" style="width: 70px" :disabled="!editStatus"></dyt-input>
            </Form-item>
            <span class="ml20">长度区间：</span>
            <Form-item :prop="`storageCostTemplateQO.storageCostTemplateCargoTypeQOS[${index}].lengthLowerLimit`"
              :rules="tableRules">
              <dyt-input v-model="item.lengthLowerLimit" style="width: 70px" :disabled="!editStatus"></dyt-input>
            </Form-item>
            <span class="ml10 mr10">{{ lengthInterval }}</span>
            <Form-item :prop="`storageCostTemplateQO.storageCostTemplateCargoTypeQOS[${index}].lengthUpperLimit`"
              :rules="tableRules">
              <dyt-input v-model="item.lengthUpperLimit" style="width: 70px" :disabled="!editStatus"></dyt-input>
            </Form-item>
            <span class="ml20">宽度区间：</span>
            <Form-item :prop="`storageCostTemplateQO.storageCostTemplateCargoTypeQOS[${index}].widthLowerLimit`"
              :rules="tableRules">
              <dyt-input v-model="item.widthLowerLimit" style="width: 70px" :disabled="!editStatus"></dyt-input>
            </Form-item>
            <span class="ml10 mr10">{{ widthInterval }}</span>
            <Form-item :prop="`storageCostTemplateQO.storageCostTemplateCargoTypeQOS[${index}].widthUpperLimit`"
              :rules="tableRules">
              <dyt-input v-model="item.widthUpperLimit" style="width: 70px" :disabled="!editStatus"></dyt-input>
            </Form-item>
            <span class="ml20">高度区间：</span>
            <Form-item :prop="`storageCostTemplateQO.storageCostTemplateCargoTypeQOS[${index}].heightLowerLimit`"
              :rules="tableRules">
              <dyt-input v-model="item.heightLowerLimit" style="width: 70px" :disabled="!editStatus"></dyt-input>
            </Form-item>
            <span class="ml10 mr10">{{ heightInterval }}</span>
            <Form-item :prop="`storageCostTemplateQO.storageCostTemplateCargoTypeQOS[${index}].heightUpperLimit`"
              :rules="tableRules">
              <dyt-input v-model="item.heightUpperLimit" style="width: 70px" :disabled="!editStatus"></dyt-input>
            </Form-item>
            <Icon type="md-close" @click="deleteGoods(index)" class="iconClose" v-if="editStatus" />
          </div>
          <div class="cardStyle">
            <div>
              <Form-item label="其他费："
                :prop="`storageCostTemplateQO.storageCostTemplateCargoTypeQOS[${index}].otherExpenses`" :label-width="90"
                class="mt20 itemOption" :rules="otherExpensesRules">
                <dyt-input v-model="item.otherExpenses" style="width: 100px" :disabled="!editStatus"></dyt-input>
                <span class="pdl2">{{ formData.currency }}</span>
              </Form-item>
              <Form-item label="附加费："
                :prop="`storageCostTemplateQO.storageCostTemplateCargoTypeQOS[${index}].additionalCharge`"
                :label-width="90" class="mt20 itemOption" :rules="additionalChargeRules">
                <dyt-input v-model="item.additionalCharge" style="width: 100px" :disabled="!editStatus"></dyt-input>
                <span class="pdl2">{{ formData.currency }}{{ unitInterval }}</span>
              </Form-item>
            </div>
            <Form-item label="仓储费：" :label-width="100" class="mt20 itemOption">
              <Card :dis-hover="true" :bordered="true">
                <Table border :columns="columns1" :data="item.cargoTypeStockAgeQOS" width="712">
                  <template slot-scope="scope" slot="condition">
                    <div class="dstyle">
                      <Form-item
                        :prop="`storageCostTemplateQO.storageCostTemplateCargoTypeQOS[${index}].cargoTypeStockAgeQOS[${scope.index}].dayLowerLimit`"
                        :rules="tableOtherRules">
                        <dyt-input style="width: 90px" v-model="item.cargoTypeStockAgeQOS[scope.index].dayLowerLimit"
                          :disabled="scope.index > 0 || !editStatus"></dyt-input>
                      </Form-item>
                      <span class="ml10 mr10">{{ dayInterval }}</span>
                      <Form-item
                        :prop="`storageCostTemplateQO.storageCostTemplateCargoTypeQOS[${index}].cargoTypeStockAgeQOS[${scope.index}].dayUpperLimit`"
                        :rules="tableOtherRules">
                        <dyt-input style="width: 90px" v-model="item.cargoTypeStockAgeQOS[scope.index].dayUpperLimit"
                          :disabled="!editStatus"></dyt-input>
                      </Form-item>
                    </div>
                  </template>
                  <template slot-scope="scope" slot="storageFee">
                    <div class="dstyle">
                      <Form-item
                        :prop="`storageCostTemplateQO.storageCostTemplateCargoTypeQOS[${index}].cargoTypeStockAgeQOS[${scope.index}].cubicMeterCost`"
                        :rules="tableOtherRules">
                        <dyt-input style="width: 100px" v-model="item.cargoTypeStockAgeQOS[scope.index].cubicMeterCost"
                          :disabled="!editStatus"></dyt-input>
                      </Form-item>
                      <span class="ml10 mr10">{{ formData.currency }}{{ unitInterval }}</span>
                    </div>
                  </template>
                  <!-- <template slot-scope="scope" slot="additionFee">
                    <div class="dstyle">
                      <Form-item
                        :prop="`storageCostTemplateQO.storageCostTemplateCargoTypeQOS[${index}].cargoTypeStockAgeQOS[${scope.index}].pieceCost`"
                        :rules="tableOtherRules">
                        <dyt-input style="width: 90px" v-model="item.cargoTypeStockAgeQOS[scope.index].pieceCost"
                          :disabled="!editStatus"></dyt-input>
                      </Form-item>
                      <span class="ml10 mr10">{{ "/件" }}</span>
                    </div>
                  </template> -->
                  <template slot-scope="scope" slot="operate">
                    <Button type="text" style="color: #fd6b6f" :disabled="!editStatus"
                      @click="deleteList(index, scope.index)">删除</Button>
                  </template>
                </Table>
              </Card>
              <Button type="text" style="font-size: 13px; color: #1a98ee" @click="addRow(index)"
                v-if="editStatus">+增加条件</Button>
            </Form-item>
          </div>
        </Card>
      </Form-item>
    </Form>
    <Spin fix v-if="pageLoading"></Spin>
  </div>
</template>

<script>
import api from "@/api/api";
import Mixin from "@/components/mixin/common_mixin";

export default {
  mixins: [Mixin],
  props: {
    editStatus: {
      type: Boolean,
      default: () => {
        return false;
      },
    },
    templateId: {
      type: String,
      default: () => {
        return "";
      },
    },
  },
  data() {
    return {
      pageLoading: false,
      nextValidate: {},
      formData: {
        templateName: "",
        currency: "",
        discount: "",
        templateType: 1,
        storageCostTemplateQO: {
          storageCostTemplateCargoTypeQOS: [{ cargoTypeStockAgeQOS: [{}] }],
        },
      },
      cargoTypeRule: [
        { required: true, message: "请输入货型名称", trigger: "blur" },
        { required: true, message: "请输入货型名称", trigger: "change" }
      ],
      columns1: [
        {
          title: "序号",
          type: "index",
          width: 70,
          align: "center",
        },
        {
          title: "条件",
          key: "name",
          slot: "condition",
          width: 300,
        },
        {
          title: "仓储费",
          key: "storageFee",
          slot: "storageFee",
          width: 240,
        },
        // {
        //   title: "附加费",
        //   key: "additionFee",
        //   slot: "additionFee",
        //   width: 200,
        // },
        {
          title: "操作",
          key: "address",
          slot: "operate",
          width: 100,
        },
      ],
      rules: {
        templateName: [
          {
            required: true,
            message: "请输入费用模版名称",
            trigger: "blur",
          },
        ],
        currency: [
          {
            required: true,
            message: "请选择费用币种",
            trigger: "change",
          },
        ],
        discount: [
          { validator: this.validateDiscount, trigger: "change" }
        ]
      },
      tableRules: [
        { required: true, validator: this.validateTableNumber, trigger: "change" },
        { required: true, validator: this.validateTableNumber, trigger: "blur" }
      ],
      otherExpensesRules: [
        { validator: this.validateExpenser, trigger: "change" },
        { validator: this.validateExpenser, trigger: "blur" }
      ],
      additionalChargeRules: [
        { validator: this.validateExpenser, trigger: "change" },
        { validator: this.validateExpenser, trigger: "blur" }
      ],
      tableOtherRules: [
        { required: true, validator: this.validateOtherTableNumber, trigger: "change" },
        { required: true, validator: this.validateOtherTableNumber, trigger: "blur" }
      ],
      currencyList: [], // 币种列表
      weightInterval: '< kg ≤ ',
      lengthInterval: '< cm ≤',
      widthInterval: '< cm ≤',
      heightInterval: '< cm ≤',
      dayInterval: '< 天 ≤',
      unitInterval: '/立方/天',
    };
  },
  mounted() {
    this.getData();
    this.queryCurrency();
  },
  methods: {
    getData() {
      if (this.templateId) {
        this.pageLoading = true;
        this.axios
          .get(
            `${api.queryTemplateDetail}?templateId=${this.templateId}&templateType=1`
          )
          .then((res) => {
            let data = res.data.datas;
            if (data && data.storageCostTemplateQO && data.storageCostTemplateQO.storageCostTemplateCargoTypeQOS) {
              let list = (data.storageCostTemplateQO.storageCostTemplateCargoTypeQOS || []).filter(k => {
                return k;
              });
              data.storageCostTemplateQO.storageCostTemplateCargoTypeQOS = list;
            }
            this.formData = data;
          }).finally(() => {
            this.pageLoading = false;
          })
      }
    },
    // 查询货币
    queryCurrency() {
      let date = this.formatDate();
      this.axios.post(`${api.queryCurrency}?date=${date}`).then((res) => {
        this.currencyList = res.data.datas;
      });
    },
    formatDate() {
      let d = new Date();
      let y = d.getFullYear();
      let month = d.getMonth() + 1;
      if (month < 10) {
        month = "0" + month;
      }
      return y + "-" + month;
    },
    addRow(index) {
      // this.formData.storageCostTemplateQO.storageCostTemplateCargoTypeQOS[
      //   index
      // ].cargoTypeStockAgeQOS.push({});
      let temp = this.formData.storageCostTemplateQO.storageCostTemplateCargoTypeQOS[index].cargoTypeStockAgeQOS;
      let length = temp.length;
      if (length == 0) {
        // return temp.push({ pieceCost: 0 });
        return temp.push({});
      }
      temp.push({
        dayLowerLimit: temp[length - 1].dayUpperLimit,
        // pieceCost: 0,
      });
    },
    deleteList(indexa, indexb) {
      this.formData.storageCostTemplateQO.storageCostTemplateCargoTypeQOS[indexa].cargoTypeStockAgeQOS.splice(indexb, 1);
    },
    saveData() {
      this.$refs["formData"].validate((valid) => {
        if (valid) {
          if (this.templateId) {
            this.updateTemplate();
            return;
          }
          this.axios.post(api.addStorageTemplate, this.formData).then((res) => {
            this.$Message.success("新增模版成功");
            this.back();
          });
        }
      });
    },
    // 更新模版
    updateTemplate() {
      this.formData.templateType = 1;
      this.axios.post(api.updateStorageTemplate, this.formData).then((res) => {
        this.$Message.success("保存成功");
        this.back();
      });
    },
    back() {
      this.$emit("back");
    },
    addGoods() {
      this.formData.storageCostTemplateQO.storageCostTemplateCargoTypeQOS.push({
        cargoTypeStockAgeQOS: [],
      });
    },
    deleteGoods(index) {
      this.formData.storageCostTemplateQO.storageCostTemplateCargoTypeQOS.splice(index, 1);
    },
    // inputLimit(index, key) {
    //   let temp =
    //     this.formData.storageCostTemplateQO.storageCostTemplateCargoTypeQOS[index][key];
    //   let value = temp.replace(/[^0-9]{0,1}(\d*(?:\.\d{0,3})?).*$/g, "$1");
    //   if (value > 1000000) {
    //     value = value.slice(0, 6);
    //   }
    //   value = Number(value);
    //   this.$nextTick(() => {
    //     this.$set(this.formData.storageCostTemplateQO.storageCostTemplateCargoTypeQOS[index], key, value);
    //   });
    // },
    // inputLimit1(index, index1, key) {
    //   let temp =
    //     this.formData.storageCostTemplateQO.storageCostTemplateCargoTypeQOS[index].cargoTypeStockAgeQOS[index1][key];
    //   let value = temp.replace(/[^0-9]{0,1}(\d*(?:\.\d{0,3})?).*$/g, "$1");
    //   if (value > 1000000) {
    //     value = value.slice(0, 6);
    //   }
    //   if (key == "cubicMeterCost") {
    //     value = Number(value);
    //   }
    //   this.$nextTick(() => {
    //     this.$set(this.formData.storageCostTemplateQO.storageCostTemplateCargoTypeQOS[index].cargoTypeStockAgeQOS[index1], key, value);
    //   });
    // },
    // inputChange(index, scope) {
    //   let temp = this.formData.storageCostTemplateQO.storageCostTemplateCargoTypeQOS[index].cargoTypeStockAgeQOS;
    //   temp[scope.index].dayUpperLimit = temp[scope.index].dayUpperLimit.replace(/[^0-9]{0,1}(\d*(?:\.\d{0,3})?).*$/g, "$1");
    //   if (temp[scope.index].dayUpperLimit > 1000000) {
    //     temp[scope.index].dayUpperLimit = temp[scope.index].dayUpperLimit.slice(0, 6);
    //   }
    //   if (temp.length > scope.index + 1) {
    //     temp[scope.index + 1].dayLowerLimit = temp[scope.index].dayUpperLimit;
    //   }
    // },
    // 验证总折扣
    validateDiscount(rule, value, callback) {
      if (!this.editStatus) return callback();
      this.$nextTick(() => {
        const val = this.formData[rule.field];
        if (!this.$common.isEmpty(val) && this.$common.isEmpty(Number(val))) {
          return callback(new Error('请输入数字'));
        }
        callback();
      })
    },
    // 验证其他费用
    validateExpenser(rule, value, callback) {
      this.$nextTick(() => {
        if (!this.editStatus) return callback();
        const index = Number(rule.field.substring(rule.field.indexOf('[') + 1, rule.field.lastIndexOf(']')));
        const key = rule.field.substring(rule.field.lastIndexOf('].') + 2, rule.field.length);
        const getV = this.formData.storageCostTemplateQO.storageCostTemplateCargoTypeQOS[index][key];
        const val = (this.$common.isEmpty(getV) ? '' : getV).toString();
        if (this.$common.isEmpty(val)) {
          return callback();
        }
        if (this.$common.isEmpty(Number(val)) || Number(val) < 0) {
          return callback(new Error('不小于0的数字'));
        }
        if (Number(val) > 1000000) {
          return callback(new Error('小于1000000的数字'));
        }
        if (val.includes('.')) {
          const suffix = val.substring(val.lastIndexOf('.') + 1, val.length);
          if (suffix.length > 2) {
            return callback(new Error('最多2位小数的数字'));
          }
        }
        callback();
      })
    },
    // 验证重量、长、宽、高
    validateTableNumber(rule, value, callback) {
      this.$nextTick(() => {
        if (!this.editStatus) return callback();
        const index = Number(rule.field.substring(rule.field.indexOf('[') + 1, rule.field.lastIndexOf(']')));
        const key = rule.field.substring(rule.field.lastIndexOf('].') + 2, rule.field.length);
        const getV = this.formData.storageCostTemplateQO.storageCostTemplateCargoTypeQOS[index][key];
        const val = (this.$common.isEmpty(getV) ? '' : getV).toString();
        if (this.$common.isEmpty(val) || this.$common.isEmpty(Number(val)) || Number(val) < 0) {
          return callback(new Error('请输入不小于 0 的数字'));
        }
        if (Number(val) > 1000000) {
          return callback(new Error('请输入小于 1000000 的数字'));
        }
        if (val.includes('.')) {
          const suffix = val.substring(val.lastIndexOf('.') + 1, val.length);
          if (suffix.length > 2) {
            return callback(new Error('请输入最多 2 位小数的数字'));
          }
        }
        if (key.includes('LowerLimit')) {
          const lKey = key.replace('LowerLimit', 'UpperLimit');
          const getVal = this.formData.storageCostTemplateQO.storageCostTemplateCargoTypeQOS[index][lKey];
          const uVal = (this.$common.isEmpty(getVal) ? '' : getVal).toString();
          if (!this.$common.isEmpty(uVal) && !this.$common.isEmpty(Number(uVal)) && Number(uVal) < Number(val)) {
            return callback(new Error(`不能大于${uVal}`));
          }
        } else if (key.includes('UpperLimit')) {
          const lKey = key.replace('UpperLimit', 'LowerLimit');
          const getVal = this.formData.storageCostTemplateQO.storageCostTemplateCargoTypeQOS[index][lKey];
          const uVal = (this.$common.isEmpty(getVal) ? '' : getVal).toString();
          if (!this.$common.isEmpty(uVal) && !this.$common.isEmpty(Number(uVal)) && Number(uVal) > Number(val)) {
            return callback(new Error(`不能小于${uVal}`));
          }
        }
        if (rule.trigger === 'blur') {
          if (!this.$common.isEmpty(this.nextValidate[`${rule.trigger}-${rule.field}`])) {
            delete this.nextValidate[`${rule.trigger}-${rule.field}`];
            return callback();
          };
          if (key.includes('LowerLimit')) {
            const nKey = rule.field.replace('LowerLimit', 'UpperLimit');
            this.$set(this.nextValidate, `${rule.trigger}-${nKey}`, true);
            this.$refs.formData.validateField(nKey);
          } else if (key.includes('UpperLimit')) {
            const nKey = rule.field.replace('UpperLimit', 'LowerLimit');
            this.$set(this.nextValidate, `${rule.trigger}-${nKey}`, true);
            this.$refs.formData.validateField(nKey);
          }
        }
        callback();
      })
    },
    // 验证表格其他的数字
    validateOtherTableNumber(rule, value, callback) {
      this.$nextTick(() => {
        if (!this.editStatus) return callback();
        const firstIndex = Number(rule.field.substring(rule.field.indexOf('[') + 1, rule.field.indexOf(']')));
        const secondIndex = Number(rule.field.substring(rule.field.lastIndexOf('[') + 1, rule.field.lastIndexOf(']')));
        const firstKey = rule.field.substring(rule.field.indexOf('].') + 2, rule.field.lastIndexOf('['));
        const secondKey = rule.field.substring(rule.field.lastIndexOf('].') + 2, rule.field.length);
        const getV = this.formData.storageCostTemplateQO.storageCostTemplateCargoTypeQOS[firstIndex][firstKey][secondIndex][secondKey];
        const val = (this.$common.isEmpty(getV) ? '' : getV).toString();
        if (this.$common.isEmpty(val) || this.$common.isEmpty(Number(val)) || Number(val) < 0) {
          return callback(new Error('请输入不小于 0 的数字'));
        }
        if (Number(val) > 1000000) {
          return callback(new Error('请输入小于 1000000 的数字'));
        }
        if (val.includes('.')) {
          const suffix = val.substring(val.lastIndexOf('.') + 1, val.length);
          if (suffix.length > 2) {
            return callback(new Error('请输入最多 2 位小数的数字'));
          }
        }

        if (secondKey.includes('dayLowerLimit')) {
          const lKey = secondKey.replace('LowerLimit', 'UpperLimit');
          const getVal = this.formData.storageCostTemplateQO.storageCostTemplateCargoTypeQOS[firstIndex][firstKey][secondIndex][lKey];
          const uVal = (this.$common.isEmpty(getVal) ? '' : getVal).toString();
          if (!this.$common.isEmpty(uVal) && !this.$common.isEmpty(Number(uVal)) && Number(uVal) < Number(val)) {
            return callback(new Error(`不能大于${uVal}`));
          }
        } else if (secondKey.includes('dayUpperLimit')) {
          const lKey = secondKey.replace('UpperLimit', 'LowerLimit');
          const getVal = this.formData.storageCostTemplateQO.storageCostTemplateCargoTypeQOS[firstIndex][firstKey][secondIndex][lKey];
          const uVal = (this.$common.isEmpty(getVal) ? '' : getVal).toString();
          if (!this.$common.isEmpty(uVal) && !this.$common.isEmpty(Number(uVal)) && Number(uVal) > Number(val)) {
            return callback(new Error(`不能小于${uVal}`));
          }
        }
        if (rule.trigger === 'blur') {
          if (!this.$common.isEmpty(this.nextValidate[`${rule.trigger}-${rule.field}`])) {
            delete this.nextValidate[`${rule.trigger}-${rule.field}`];
            return callback();
          };
          if (secondKey.includes('dayLowerLimit')) {
            const nKey = rule.field.replace('LowerLimit', 'UpperLimit');
            this.$set(this.nextValidate, `${rule.trigger}-${nKey}`, true);
            this.$refs.formData.validateField(nKey);
          } else if (secondKey.includes('dayUpperLimit')) {
            const nKey = rule.field.replace('UpperLimit', 'LowerLimit');
            this.$set(this.nextValidate, `${rule.trigger}-${nKey}`, true);
            this.$refs.formData.validateField(nKey);
          }
        }
        callback();
      })
    }
  },
};
</script>

<style lang="less" scoped>
.storageTemplateDetail {
  position: relative;

  :deep(.ivu-btn) {
    height: 28px;
  }

  .cardStyle {
    display: flex;

    :deep(.itemOption) {
      &.ivu-form-item {
        .ivu-form-item-content {
          margin-left: 95px !important;
        }

        .ivu-form-item-label {
          font-size: 14px;
          color: #515a6e;
        }
      }
    }

    .dstyle {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      // height: 48px;
      align-items: center;

      :deep(.ivu-form-item) {
        .ivu-form-item-content {
          margin-left: 0px !important;
        }
      }
    }

    .iconClose {
      font-size: 30px;
      color: red;
      margin-left: 60px;
      cursor: pointer;
    }
  }

  .pdl2 {
    padding-left: 4px;
  }

  // .storageCard {
  //   :deep(.ivu-card-body) {
  //     padding: 16px 8px;
  //   }
  // }
}
</style>
