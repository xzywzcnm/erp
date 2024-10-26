<template>
  <div class="mainBody deliverTemplateDetail">
    <div
      style="font-size: 15px; display: flex; align-items: center"
      class="mt10 ml10"
    >
      <Icon type="md-arrow-back" style="cursor: pointer" @click="back" />
      <span style="font-weight: 500; cursor: pointer" class="ml10" @click="back"
        >返回</span
      >
      <div
        style="width: 2px; height: 20px; background: #dcdfe6"
        class="ml10"
      ></div>
      <Button type="primary" class="ml10" @click="saveData" v-if="editStatus"
        >保存</Button
      >
    </div>
    <Form
      :model="formData"
      :label-width="150"
      class="mt20"
      :rules="rules"
      ref="formData"
    >
      <Form-item label="费用模版名称：" prop="templateName">
        <dyt-input
          v-model="formData.templateName"
          style="width: 200px"
          :disabled="!editStatus"
        >
        </dyt-input>
      </Form-item>
      <Form-item label="费用币种：" prop="currency">
        <dyt-select
          v-model="formData.currency"
          style="width: 200px"
          :disabled="!editStatus"
        >
          <Option
            v-for="(item, index) in currencyList"
            :key="index"
            :label="item.targetCurrencyCode"
            :value="item.targetCurrencyCode"
          ></Option>
        </dyt-select>
      </Form-item>
      <div style="display: flex; justify-content: space-between">
        <Form-item label="总折扣：" prop="discount">
          <dyt-input
            v-model="formData.discount"
            style="width: 200px"
            :disabled="!editStatus"
          >
          </dyt-input>
          <span class="ml10">%</span>
        </Form-item>
        <Button
          class="mr20"
          type="primary"
          @click="addClassType"
          v-if="editStatus"
          >增加分类类型</Button
        >
      </div>
      <Form-item label="操作费用：">
        <Card
          :dis-hover="true"
          :bordered="true"
          v-for="(item, tIndex) in formData.outOfWarehouseExpensesTemplateQO"
          :key="`card_${tIndex}`"
          class="mb10"
        >
          <Form-item
            label="分类类型："
            :label-width="90"
            class="itemOption"
            :rules="typeRules"
            :prop="'outOfWarehouseExpensesTemplateQO[' + tIndex + '].categoryType'"
          >
            <dyt-select
              v-model="formData.outOfWarehouseExpensesTemplateQO[tIndex].categoryType"
              style="width: 100px"
              :disabled="!editStatus"
              v-if="tIndex > 0"
            >
              <Option
                v-for="(item, index) in classTypeList"
                :key="index"
                :label="item.label"
                :value="item.value"
              />
            </dyt-select>
            <span v-else>默认(不是指分类类型)</span>
          </Form-item>

          <Icon
            type="md-close"
            class="iconClose"
            @click="removeClassType(tIndex)"
            v-if="editStatus"
          />
          <div class="dstyle" style="padding: 10px 0">
            <Form-item
              label="其他费："
              :label-width="90"
              class="itemOption"
              :prop="`outOfWarehouseExpensesTemplateQO[${tIndex}].otherExpenses`"
              :rules="formDataStairRules"
            >
              <dyt-input
                v-model="formData.outOfWarehouseExpensesTemplateQO[tIndex].otherExpenses"
                style="width: 100px"
                :disabled="!editStatus"
              >
              </dyt-input>
            </Form-item>
            <Form-item
              label="续重费："
              :label-width="90"
              class="itemOption"
              :prop="`outOfWarehouseExpensesTemplateQO[${tIndex}].continuedHeavyFee`"
              :rules="formDataStairRules"
            >
              <dyt-input
                v-model="formData.outOfWarehouseExpensesTemplateQO[tIndex].continuedHeavyFee"
                style="width: 100px"
                :disabled="!editStatus"
              >
              </dyt-input>
              /kg
            </Form-item>
            <span class="ml20">提示： 当重量超过最大条件时，操作费用使用最大条件计算，剩余重量计算续重费</span>
          </div>
          <Table
            border
            :columns="columns1"
            :data="item.outOfWarehouseExpensesOperationFeeQOS"
            width="1200"
          >
            <template slot-scope="scope" slot="condition">
              <div class="dstyle row-td">
                <Form-item
                  :rules="tableRules"
                  :prop="`outOfWarehouseExpensesTemplateQO[${tIndex}].outOfWarehouseExpensesOperationFeeQOS[${scope.index}].weightLowerLimit`"
                >
                  <dyt-input
                    style="width: 200px"
                    v-model="item.outOfWarehouseExpensesOperationFeeQOS[scope.index].weightLowerLimit"
                    :disabled="scope.index > 0 || !editStatus"
                  ></dyt-input>
                  <!-- @on-change="inputLimit(tIndex, scope.index, 'weightLowerLimit')" -->
                </Form-item>
                <span class="ml10 mr10">{{ "< kg ≤" }}</span>
                <Form-item
                  :rules="tableRules"
                  :prop="`outOfWarehouseExpensesTemplateQO[${tIndex}].outOfWarehouseExpensesOperationFeeQOS[${scope.index}].weightUpperLimit`"
                >
                  <dyt-input
                    style="width: 200px"
                    v-model="item.outOfWarehouseExpensesOperationFeeQOS[scope.index].weightUpperLimit"
                    :disabled="!editStatus"
                  ></dyt-input>
                  <!-- @on-change="inputLimit(tIndex, scope.index, 'weightUpperLimit')" -->
                </Form-item>
              </div>
            </template>
            <template slot-scope="scope" slot="storageFee">
              <div class="dstyle row-td">
                <Form-item
                  :rules="tableRules"
                  :prop="`outOfWarehouseExpensesTemplateQO[${tIndex}].outOfWarehouseExpensesOperationFeeQOS[${scope.index}].operationFee`"
                >
                  <dyt-input
                    style="width: 90px"
                    v-model="item.outOfWarehouseExpensesOperationFeeQOS[scope.index].operationFee"
                    :disabled="!editStatus"
                  ></dyt-input>
                  <!-- @on-change="inputLimit(tIndex, scope.index, 'operationFee')" -->
                </Form-item>
              </div>
            </template>
            <template slot-scope="scope" slot="additionFee">
              <div class="dstyle row-td">
                <Form-item
                  :rules="tableRules"
                  :prop="`outOfWarehouseExpensesTemplateQO[${tIndex}].outOfWarehouseExpensesOperationFeeQOS[${scope.index}].renewalFee`"
                >
                  <dyt-input
                    style="width: 90px"
                    v-model="item.outOfWarehouseExpensesOperationFeeQOS[scope.index].renewalFee"
                    :disabled="!editStatus"
                  ></dyt-input>
                  <!-- @on-change="inputLimit(tIndex, scope.index, 'renewalFee')" -->
                </Form-item>
                <span class="ml10 mr10">{{ "/件" }}</span>
              </div>
            </template>
            <template slot-scope="scope" slot="operate">
              <Button
                type="text"
                style="color: #fd6b6f"
                :disabled="
                  !editStatus ||
                  !getPermission('outOfWarehouseExpensesTemplate_deleteById')
                "
                @click="deleteRow(tIndex, scope)"
                >删除</Button
              >
            </template>
          </Table>
          <Button
            type="text"
            style="font-size: 13px; color: #1a98ee"
            @click="addRow(tIndex)"
            v-if="editStatus"
            >+增加条件</Button
          >
        </Card>
      </Form-item>
    </Form>
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
      formData: {
        templateName: "",
        templateType: "2",
        currency: "",
        discount: "",
        outOfWarehouseExpensesTemplateQO: [
          {
            otherExpenses: "", // 其他费
            categoryType: 9, // 分类类型（0默认1服装类2服饰类3家居类4玩具类）
            continuedHeavyFee: null, // 续重费
            outOfWarehouseExpensesOperationFeeQOS: [
              {
                templateInfoId: "",
                weightLowerLimit: null, // 重量下限
                weightUpperLimit: null, // 重量上限
                operationFee: null, // 操作费
                renewalFee: null, // 续件费
              },
            ],
          },
        ],
      },
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
          width: 600,
        },
        {
          title: "操作费",
          key: "storageFee",
          slot: "storageFee",
          width: 200,
        },
        {
          title: "续件费",
          key: "additionFee",
          slot: "additionFee",
        },
        {
          title: "操作",
          key: "address",
          slot: "operate",
          width: 100,
        },
      ],
      data1: [],
      formDataStairRules: [
        { validator: this.formDataStairHnd, trigger: "change" },
        { validator: this.formDataStairHnd, trigger: "blur" }
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
      typeRules: [
        {
          required: true,
          message: " ",
          trigger: "change",
          type: "number",
        },
      ],
      currencyList: [], // 币种列表
      nextValidate: {},
      classTypeList: [
        { value: 0, label: "服装类" },
        { value: 1, label: "家居类" },
        { value: 2, label: "服饰类" },
        { value: 3, label: "试运营品类" },
      ],
    };
  },
  mounted() {
    this.getData();
    this.queryCurrency();
  },
  methods: {
    getData() {
      if (this.templateId) {
        this.axios
          .get(
            `${api.queryTemplateDetail}?templateId=${this.templateId}&templateType=2`
          )
          .then((res) => {
            this.formData = res.data.datas;
          });
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
        month = "0" + month
      }
      return y + "-" + month;
    },
    saveData() {
      this.$refs["formData"].validate((valid) => {
        if (valid) {
          // 修改
          if (this.templateId) {
            this.formData.templateType = 0;
            this.updateTemplate();
            return;
          }
          this.axios.post(api.addDeliverTemplate, this.formData).then((res) => {
            this.$Message.success("新增模版成功");
            this.back();
          });
        }
      });
    },
    // 更新模版
    updateTemplate() {
      this.formData.templateType = 2;
      this.axios.post(api.updateDeliverTemplate, this.formData).then((res) => {
        this.$Message.success("保存成功");
        this.back();
      });
    },
    back() {
      this.$emit("back");
    },
    // 增加分类类型
    addClassType() {
      this.formData.outOfWarehouseExpensesTemplateQO.push({
        otherExpenses: "", // 其他费
        categoryType: null, // 分类类型（0默认1服装类2服饰类3家居类4玩具类）
        continuedHeavyFee: null, // 续重费
        outOfWarehouseExpensesOperationFeeQOS: [
          {
            templateInfoId: "",
            weightLowerLimit: null, // 重量下限
            weightUpperLimit: null, // 重量上限
            operationFee: null, // 操作费
            renewalFee: null, // 续件费
          },
        ],
      });
    },
    addRow(tIndex) {
      let temp =
        this.formData.outOfWarehouseExpensesTemplateQO[tIndex]
          .outOfWarehouseExpensesOperationFeeQOS;
      let length = temp.length;
      this.formData.outOfWarehouseExpensesTemplateQO[tIndex].outOfWarehouseExpensesOperationFeeQOS.push({
        weightLowerLimit: length > 0 ? temp[length - 1].weightUpperLimit : null,
      });
    },
    deleteRow(tIndex, scope) {
      const rowId =
        this.formData.outOfWarehouseExpensesTemplateQO[tIndex]
          .outOfWarehouseExpensesOperationFeeQOS[scope.index].id;
      if (this.$common.isEmpty(rowId)) {
        this.formData.outOfWarehouseExpensesTemplateQO[tIndex].outOfWarehouseExpensesOperationFeeQOS.splice(scope.index, 1);
        return;
      }
      this.axios({
        method: "delete",
        url: api.deleteByIdOutOfWarehouse + rowId,
      })
        .then((res) => {
          if (res.status === 200) {
            this.formData.outOfWarehouseExpensesTemplateQO[tIndex].outOfWarehouseExpensesOperationFeeQOS.splice(scope.index, 1);
          }
        })
        .catch(() => {});
    },
    // 删除分类类型
    removeClassType(index) {
      const rowId = this.formData.outOfWarehouseExpensesTemplateQO[index].id;
      if (this.$common.isEmpty(rowId)) {
        this.formData.outOfWarehouseExpensesTemplateQO.splice(index, 1);
        return;
      }
      this.axios({
        method: "post",
        url: `${api.removeOutOfWarehouse}?id=${rowId}`,
      })
        .then((res) => {
          if (res.status === 200) {
            this.formData.outOfWarehouseExpensesTemplateQO.splice(index, 1);
          }
        })
        .catch(() => {});
    },
    // 验证总折扣
    validateDiscount (rule, value, callback) {
      if (!this.editStatus) return callback();
      this.$nextTick(() => {
        const val = this.formData[rule.field];
        if (!this.$common.isEmpty(val) && this.$common.isEmpty(Number(val))) {
          return callback(new Error('请输入数字'));
        }
        callback();
      })
    },
    // 验证其他费、续重费
    formDataStairHnd (rule, value, callback) {
      if (!this.editStatus) return callback();
      this.$nextTick(() => {
        const index = Number(rule.field.substring(rule.field.indexOf('[') + 1, rule.field.lastIndexOf(']')));
        const key = rule.field.substring(rule.field.lastIndexOf('].') + 2, rule.field.length);
        const getV = this.formData.outOfWarehouseExpensesTemplateQO[index][key];
        const val = (this.$common.isEmpty(getV) ? '' : getV).toString();
        if (rule.required) {
          if (this.$common.isEmpty(val)) {
            return callback(new Error('必填项不能为空'));
          }
        }
        if (this.$common.isEmpty(val)) {
          return callback();
        }
        if (this.$common.isEmpty(Number(val)) || Number(val) < 0) {
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
        callback();
      })
    },
    // 验证表格的数字
    validateTableNumber (rule, value, callback) {
      this.$nextTick(() => {
        if (!this.editStatus) return callback();
        const firstIndex = Number(rule.field.substring(rule.field.indexOf('[') + 1, rule.field.indexOf(']')));
        const secondIndex = Number(rule.field.substring(rule.field.lastIndexOf('[') + 1, rule.field.lastIndexOf(']')));
        const firstKey = rule.field.substring(rule.field.indexOf('].') + 2, rule.field.lastIndexOf('['));
        const secondKey = rule.field.substring(rule.field.lastIndexOf('].') + 2, rule.field.length);
        const getV = this.formData.outOfWarehouseExpensesTemplateQO[firstIndex][firstKey][secondIndex][secondKey];
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

        if (secondKey.includes('weightLowerLimit')) {
          const lKey = secondKey.replace('LowerLimit', 'UpperLimit');
          const getVal = this.formData.outOfWarehouseExpensesTemplateQO[firstIndex][firstKey][secondIndex][lKey];
          const uVal = (this.$common.isEmpty(getVal) ? '' : getVal).toString();
          if (!this.$common.isEmpty(uVal) && !this.$common.isEmpty(Number(uVal)) && Number(uVal) < Number(val)) {
            return callback(new Error(`不能大于${uVal}`));
          }
        } else if (secondKey.includes('weightUpperLimit')) {
          const lKey = secondKey.replace('UpperLimit', 'LowerLimit');
          const getVal = this.formData.outOfWarehouseExpensesTemplateQO[firstIndex][firstKey][secondIndex][lKey];
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
          if (secondKey.includes('weightLowerLimit')) {
            const nKey = rule.field.replace('LowerLimit', 'UpperLimit');
            this.$set(this.nextValidate, `${rule.trigger}-${nKey}`, true);
            this.$refs.formData.validateField(nKey);
          } else if (secondKey.includes('weightUpperLimit')) {
            const nKey = rule.field.replace('UpperLimit', 'LowerLimit');
            this.$set(this.nextValidate, `${rule.trigger}-${nKey}`, true);
            this.$refs.formData.validateField(nKey);
          }
        }
        callback();
      })
    },
    inputLimit(tIndex, rowIndex, key) {
      let temp =
        this.formData.outOfWarehouseExpensesTemplateQO[tIndex]
          .outOfWarehouseExpensesOperationFeeQOS[rowIndex][key];
      let value = temp.replace(/[^0-9]{0,1}(\d*(?:\.\d{0,3})?).*$/g, "$1");
      if (value > 1000000) {
        value = value.slice(0, 6);
      }
      value = Number(value);
      this.$set(
        this.formData.outOfWarehouseExpensesTemplateQO[tIndex]
          .outOfWarehouseExpensesOperationFeeQOS[rowIndex],
        key,
        value
      );
    },
  },
};
</script>

<style lang="less" >
.deliverTemplateDetail {
  .ivu-btn {
    height: 28px;
  }
  .dstyle {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    &.row-td{
      padding: 5px 0;
    }
    .itemOption.ivu-form-item .ivu-form-item-content {
      margin-left: 90px !important;
    }
  }
  .iconClose {
    font-size: 30px;
    color: red;
    margin-left: 60px;
    cursor: pointer;
    position: absolute;
    right: 20px;
    top: 10px;
  }
}
</style>
