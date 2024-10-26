<template>
  <div class="mainBody operateTemplateDetail">
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
          <!-- <Option label="SAR" value="SAR"></Option> -->
        </dyt-select>
      </Form-item>
      <Form-item label="总折扣：" prop="discount">
        <dyt-input
          v-model="formData.discount"
          style="width: 200px"
          :disabled="!editStatus"
        >
        </dyt-input>
        <span class="ml10">%</span>
      </Form-item>
      <Form-item label="操作费用：">
        <Table
          border
          :columns="columns1"
          :data="formData.operatingExpenseTemplateQOS"
          width="1372"
        >
          <template slot-scope="scope" slot="condition">
            <div class="validateStyle">
              <Form-item
                label="分类类型"
                v-if="scope.index > 0"
                :label-width="200"
                :prop="`operatingExpenseTemplateQOS[${scope.index}].categoryType`"
                :rules="typeRules"
              >
                <dyt-select
                  v-model=" formData.operatingExpenseTemplateQOS[scope.index].categoryType"
                  placeholder="请选择分类类型"
                  style="width: 200px"
                  :disabled="!editStatus"
                >
                  <Option label="服装类" :value="0" />
                  <Option label="家居类" :value="1" />
                  <Option label="服饰类" :value="2" />
                  <Option label="试运营品类" :value="3" />
                </dyt-select>
              </Form-item>
              <div v-if="scope.index == 0" style="margin-left: 200px">
                默认(不是指分类类型)
              </div>
            </div>
          </template>
          <template slot-scope="scope" slot="operateFee">
            <div style="display: flex; align-items: center; padding-top: 10px">
              <Form-item
                style="width: calc(50% - 78px)"
                :prop="`operatingExpenseTemplateQOS[${scope.index}].kgCost`"
                :rules="kgCostRules"
              >
                <dyt-input
                  style="width: 100%"
                  placeholder="请输入不小于0的数字"
                  v-model="formData.operatingExpenseTemplateQOS[scope.index].kgCost"
                  :disabled="!editStatus"
                />
                <!-- @on-change="inputLimit(scope.index, 'kgCost')" -->
              </Form-item>
              <span class="ml10 mr10">{{ formData.currency || "" }}/kg, 并且</span>
              <Form-item
                style="width: calc(50% - 78px)"
                :label-width="0"
                :prop="`operatingExpenseTemplateQOS[${scope.index}].pieceCost`"
                :rules="tableRules"
              >
                <dyt-input
                  style="width: 100%"
                  placeholder="请输入不小于0的整数"
                  v-model="formData.operatingExpenseTemplateQOS[scope.index].pieceCost"
                  :disabled="!editStatus"
                />
                <!-- @on-change="inputLimit(scope.index, 'pieceCost')" -->
              </Form-item>
              <span class="ml10">{{ formData.currency || "" }}/件</span>
            </div>
          </template>
          <template slot-scope="scope" slot="operate">
            <Button
              type="text"
              style="color: #fd6b6f"
              @click="deleteRow(scope.index, scope.row)"
              v-if="scope.index > 0"
              :disabled="
                !editStatus || !getPermission('operateTemplate_deleteById')
              "
              >删除</Button
            >
          </template>
        </Table>
        <Button
          type="text"
          style="font-size: 13px; color: #1a98ee"
          @click="addList"
          >+增加条件</Button
        >
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
        templateType: 0,
        currency: "",
        discount: "",
        operatingExpenseTemplateQOS: [
          { id: "", kgCost: "", pieceCost: "", categoryType: "9" },
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
          title: "操作费用",
          key: "age",
          slot: "operateFee",
          width: 600,
        },
        {
          title: "操作",
          key: "address",
          slot: "operate",
          width: 100,
        },
      ],
      rules: {
        templateName: [
          { required: true, message: "请输入费用模版名称", trigger: "blur" },
        ],
        currency: [
          { required: true, message: "请选择费用币种", trigger: "change" },
        ],
        discount: [
          { validator: this.validateDiscount, trigger: "change" }
        ]
      },
      typeRules: [
        { required: true, message: "请选择分类类型", trigger: "change", type: "number" },
      ],
      costRules: [
        { required: true, message: "请输入数字", trigger: "change" },
        { required: true, message: "请输入数字", trigger: "blur" },
      ],
      currencyList: [], // 币种列表
      tableRules: { required: true, validator: this.validateTableNumber, trigger: "change" },
      kgCostRules: { validator: this.validateKgCostNumber, trigger: "change" },
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
            `${api.queryTemplateDetail}?templateId=${this.templateId}&templateType=0`
          )
          .then((res) => {
            this.formData = res.data.datas;
            this.totalRecords = res.data.datas.total;
          });
      }
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
    // 验证
    validateTableNumber (rule, value, callback) {
      this.$nextTick(() => {
        if (!this.editStatus) return callback();
        const index = Number(rule.field.substring(rule.field.indexOf('[') + 1, rule.field.lastIndexOf(']')));
        const key = rule.field.substring(rule.field.lastIndexOf('].') + 2, rule.field.length);
        const getV = this.formData.operatingExpenseTemplateQOS[index][key];
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
        callback();
      })
    },
    // 验证
    validateKgCostNumber (rule, value, callback) {
      this.$nextTick(() => {
        if (!this.editStatus) return callback();
        const index = Number(rule.field.substring(rule.field.indexOf('[') + 1, rule.field.lastIndexOf(']')));
        const key = rule.field.substring(rule.field.lastIndexOf('].') + 2, rule.field.length);
        const getV = this.formData.operatingExpenseTemplateQOS[index][key];
        const val = (this.$common.isEmpty(getV) ? '' : getV).toString();
        if (Number(val) < 0) {
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
    // 验证件数
    // validatePieceCost (rule, value, callback) {
    //   const index = Number(rule.field.substring(rule.field.indexOf('[') + 1, rule.field.lastIndexOf(']')));
    //   const key = rule.field.substring(rule.field.lastIndexOf('].') + 2, rule.field.length);
    //   const getV = this.formData.operatingExpenseTemplateQOS[index][key];
    //   const val = (this.$common.isEmpty(getV) ? '' : getV).toString();
    //   if (this.$common.isEmpty(val) || this.$common.isEmpty(Number(val)) || Number(val) < 0 || val.includes('.')) {
    //     return callback(new Error('请输入大于 0 的整数'));
    //   }
    //   if (Number(val) > 1000000) {
    //     return callback(new Error('请输入小于 1000000 的整数'));
    //   }
    //   callback();
    // },
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
      month < 10 && (month = "0" + month);
      return y + "-" + month;
    },
    // 增加list
    addList() {
      this.formData.operatingExpenseTemplateQOS.push({
        id: "",
        kgCost: "",
        pieceCost: "",
        categoryType: "",
      });
    },
    deleteList(index) {
      this.formData.operatingExpenseTemplateQOS.splice(index, 1);
    },
    // 保存
    saveData() {
      this.$refs["formData"].validate((valid) => {
        if (valid) {
          // 修改
          if (this.templateId) {
            this.formData.templateType = 0;
            this.updateTemplate();
            return;
          }
          let obj = this.$common.copy(this.formData)
          obj.operatingExpenseTemplateQOS.forEach(item => {
            item.kgCost = this.$common.isEmpty(item.kgCost) ? 0 : item.kgCost
          })
          this.axios.post(api.addOperateTemplate, obj).then((res) => {
            this.$Message.success("新增模版成功");
            this.back();
          });
        }
      });
    },
    // 更新模版
    updateTemplate() {
      this.formData.templateType = 0;
      let obj = this.$common.copy(this.formData)
      obj.operatingExpenseTemplateQOS.forEach(item => {
        item.kgCost = this.$common.isEmpty(item.kgCost) ? 0 : item.kgCost
      })
      this.axios.post(api.updateOperateTemplate, obj).then((res) => {
        this.$Message.success("保存成功");
        this.back();
      });
    },
    back() {
      this.$emit("back");
    },
    // 限制输入
    // inputLimit(index, key) {
    //   let temp = this.formData.operatingExpenseTemplateQOS[index][key];
    //   let value = temp.replace(/[^0-9]{0,1}(\d*(?:\.\d{0,3})?).*$/g, "$1");
    //   if (Number(value) > 1000000) {
    //     value = value.slice(0, 6);
    //   }
    //   value = Number(value);
    //   this.$nextTick(() => {
    //     this.$set(this.formData.operatingExpenseTemplateQOS[index], key, value);
    //   });
    // },
    // 删除操作费用
    deleteRow(index, row) {
      if (this.$common.isEmpty(row.id)) {
        this.formData.operatingExpenseTemplateQOS.splice(index, 1);
        return;
      }
      this.pageLoadong = true;
      this.axios({
        method: "delete",
        url: `${api.deleteByIdfreightTemplate}${row.id}`,
        data: this.formData,
      })
        .then((res) => {
          this.pageLoadong = false;
          if (res.status === 200) {
            this.formData.operatingExpenseTemplateQOS.splice(index, 1);
          }
        })
        .catch(() => {
          this.pageLoadong = false;
          // this.$message.error('')
        });
    },
  },
};
</script>

<style lang="less" scoped>
.operateTemplateDetail {
  padding: 10px;
  .ivu-btn {
    height: 28px;
  }
  .validateStyle {
    :deep(.ivu-form-item-error-tip) {
      left: 200px;
    }
  }
}
</style>
