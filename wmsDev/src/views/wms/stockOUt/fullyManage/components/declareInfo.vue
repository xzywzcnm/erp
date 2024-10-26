<template>
  <div>
    <div
      style="text-align: right"
      class="mb10"
      v-if="
        isEdit &&
        detailData.pickingNewStatus &&
        getPermission('fullTrusteeshipPicking_update')
      "
    >
      <template v-if="editStatus">
        <Button type="primary" size="small" @click="handleSubmit">保存</Button>
        <Button size="small" class="ml10" @click="cancelDeclare">取消</Button>
      </template>
      <Button type="primary" size="small" class="ml10" @click="editDeclare" v-else
        >编辑</Button
      >
    </div>
    <Form
      ref="formValidate"
      :model="formValidate"
      :rules="ruleValidate"
      :label-width="0"
      class="fmb0 decalareinfo-form"
    >
      <Table :columns="columnsDeclare" :data="formValidate.dataDeclare">
        <template slot-scope="{ index }" slot="goodsNameCn">
          <FormItem
            :prop="`dataDeclare.${index}.goodsNameCn`"
            :rules="{ required: true, message: '请输入', trigger: 'blur' }"
          >
            <Input
              v-model="formValidate.dataDeclare[index].goodsNameCn"
              clearable
              :disabled="isDisabled"
            ></Input>
          </FormItem>
        </template>
        <template slot-scope="{ index }" slot="goodsNameEn">
          <FormItem
            :prop="`dataDeclare.${index}.goodsNameEn`"
            :rules="{ required: true, message: '请输入', trigger: 'blur' }"
          >
            <Input
              v-model="formValidate.dataDeclare[index].goodsNameEn"
              clearable
              :disabled="isDisabled"
            ></Input>
          </FormItem>
        </template>
        <template slot-scope="{ index }" slot="unitPrice">
          <FormItem
            :prop="`dataDeclare.${index}.unitPrice`"
            :rules="{ required: true, message: '请输入', trigger: 'blur' }"
          >
            <Input
              v-model="formValidate.dataDeclare[index].unitPrice"
              clearable
              :disabled="isDisabled"
              type="number"
            ></Input>
          </FormItem>
        </template>
        <template slot-scope="{ index }" slot="declareCurrency">
          <FormItem
            :prop="`dataDeclare.${index}.declareCurrency`"
            :rules="{ required: true, message: '请输入', trigger: 'change' }"
          >
            <Select
              v-model="formValidate.dataDeclare[index].declareCurrency"
              :transfer="true"
              clearable
              filterable
              :disabled="isDisabled"
            >
              <Option v-for="v in currencyList" :value="v.value" :key="v.value">{{
                v.label
              }}</Option>
            </Select>
          </FormItem>
        </template>
        <template slot-scope="{ index }" slot="unitWeight">
          <FormItem
            :prop="`dataDeclare.${index}.unitWeight`"
            :rules="{ required: true, message: '请输入', trigger: 'blur' }"
          >
            <Input
              v-model="formValidate.dataDeclare[index].unitWeight"
              clearable
              :disabled="isDisabled"
            ></Input>
          </FormItem>
        </template>
        <template slot-scope="{ index }" slot="quantity">
          <FormItem
            :prop="`dataDeclare.${index}.quantity`"
            :rules="{ required: true, message: '请输入', trigger: 'blur' }"
          >
            <Input
              v-model="formValidate.dataDeclare[index].quantity"
              clearable
              :disabled="isDisabled"
              type="number"
            ></Input>
          </FormItem>
        </template>
        <template slot-scope="{ index }" slot="hsCode">
          <FormItem :prop="`dataDeclare.${index}.hsCode`">
            <Input
              v-model="formValidate.dataDeclare[index].hsCode"
              clearable
              :disabled="isDisabled"
            ></Input>
          </FormItem>
        </template>
        <template slot-scope="{ index }" slot="productUrl">
          <FormItem :prop="`dataDeclare.${index}.productUrl`">
            <Input
              v-model="formValidate.dataDeclare[index].productUrl"
              clearable
              :disabled="isDisabled"
            ></Input>
          </FormItem>
        </template>
        <template slot-scope="{ row, index }" slot="action">
          <Icon
            class="action-ico"
            @click="addDeclare"
            type="ios-add-circle"
            v-if="index == formValidate.dataDeclare.length - 1"
          />
          <Icon
            class="action-ico"
            @click="formValidate.dataDeclare.splice(index, 1)"
            type="md-remove-circle"
            v-if="
              formValidate.dataDeclare.length > 1 &&
              index < formValidate.dataDeclare.length - 1
            "
          />
        </template>
      </Table>
    </Form>
  </div>
</template>

<script>
import api from "@/api/api";
import { getWarehouseId } from "@/utils/getService";
import permission_mixin from "@/components/mixin/permission_mixin";
export default {
  name: "declareInfo",
  mixins: [permission_mixin],
  data() {
    return {
      formValidate: {
        dataDeclare: [], // 申报信息数据
      },
      ruleValidate: {},
      currencyList: [],
      editStatus: false,
      deDataDeclare: [],
    };
  },
  props: {
    detailData: {
      type: Object,
      default() {
        return {};
      },
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    detailData: {
      handler(val) {
        if (val.pickingId) this.setData();
      },
      deep: true,
      immediate: true,
    },
  },
  computed: {
    columnsDeclare() {
      let list = [
        {
          title: "中文申报名",
          slot: "goodsNameCn",
          renderHeader: (h, params) => {
            return h("div", [
              h("span", { style: { color: "red", marginRight: "4px" } }, "*"),
              h("span", "中文申报名"),
            ]);
          },
        },
        {
          title: "英文申报名",
          slot: "goodsNameEn",
          renderHeader: (h, params) => {
            return h("div", [
              h("span", { style: { color: "red", marginRight: "4px" } }, "*"),
              h("span", "英文申报名"),
            ]);
          },
        },
        {
          title: "申报价值",
          slot: "unitPrice",
          renderHeader: (h, params) => {
            return h("div", [
              h("span", { style: { color: "red", marginRight: "4px" } }, "*"),
              h("span", "申报价值"),
            ]);
          },
        },
        {
          title: "币种",
          slot: "declareCurrency",
          renderHeader: (h, params) => {
            return h("div", [
              h("span", { style: { color: "red", marginRight: "4px" } }, "*"),
              h("span", "币种"),
            ]);
          },
        },
        {
          title: "申报重量",
          slot: "unitWeight",
          renderHeader: (h, params) => {
            return h("div", [
              h("span", { style: { color: "red", marginRight: "4px" } }, "*"),
              h("span", "申报重量"),
            ]);
          },
        },
        {
          title: "申报数量",
          slot: "quantity",
          renderHeader: (h, params) => {
            return h("div", [
              h("span", { style: { color: "red", marginRight: "4px" } }, "*"),
              h("span", "申报数量"),
            ]);
          },
        },
        {
          title: "海关编码",
          slot: "hsCode",
        },
        {
          title: "销售链接",
          slot: "productUrl",
        },
      ];
      if (!this.isDisabled) {
        list.push({
          title: "操作",
          width: 80,
          slot: "action",
        });
      }
      return list;
    },
    isDisabled() {
      return !this.editStatus;
    },
    isChange() {
      return (
        JSON.stringify(this.deDataDeclare) ===
        JSON.stringify(this.formValidate.dataDeclare)
      );
    },
  },
  created() {
    this.getCurrencyInfo();
  },
  methods: {
    // 获取币种下拉
    getCurrencyInfo() {
      return new Promise((resolve) => {
        this.axios
          .get(api.get_currencyInfo + "?time=" + new Date().getTime())
          .then((response) => {
            let data = response.data.datas || [];
            let pos = [];
            data.forEach((n) => {
              let label =
                n.currencyCode + (n.currencyCnName ? "-" + n.currencyCnName : "");
              pos.push({
                label: label,
                value: n.currencyCode,
              });
            });
            this.currencyList = pos;
            resolve(data);
          });
      });
    },
    setData() {
      let packageDeclareList = this.$common.copy(
        this.detailData.packageDeclareList || []
      );
      packageDeclareList.forEach((k) => {
        Object.keys(k).forEach((j) => {
          k[j] = k[j] + "";
        });
      });
      this.formValidate.dataDeclare = packageDeclareList;
      this.deDataDeclare = this.$common.copy(packageDeclareList);
    },
    // 编辑
    editDeclare() {
      this.editStatus = true;
      if (!this.formValidate.dataDeclare.length) {
        this.addDeclare();
      }
    },
    // 取消
    cancelDeclare() {
      this.setData();
      this.editStatus = false;
    },
    // 添加申报行
    addDeclare() {
      let temp = {
        goodsNameCn: "",
        goodsNameEn: "",
        unitPrice: "",
        declareCurrency: "",
        unitWeight: "",
        quantity: "",
        hsCode: "",
        productUrl: "",
        pickingId: this.detailData.pickingId,
      };
      this.formValidate.dataDeclare.push(temp);
    },
    // 保存申报信息
    handleSubmit() {
      this.$refs["formValidate"].validate((valid) => {
        if (!valid) return;
        let detailData = this.detailData;
        let { dataDeclare } = this.formValidate;
        let list = detailData.packageDeclareList || [];
        if (dataDeclare.length === 0) {
          this.$Message.warning("无新增数据");
          return;
        }
        let [rqApi, rqType] = [null, null];
        let temp = {
          packageDeclareList: dataDeclare,
          warehouseId: getWarehouseId(),
        };
        if (list.length) {
          temp.packageId = detailData.pickingId;
          rqApi = api.updateDeclare;
          rqType = "put";
        } else {
          temp.packageIdList = [detailData.pickingId];
          rqApi = api.saveDeclareInfo;
          rqType = "post";
        }
        this.$Spin.show();
        this.axios[rqType](rqApi, temp)
          .then((res) => {
            this.$Spin.hide();
            if (res.data.code === 0) {
              this.$Message.success("保存成功");
              this.editStatus = false;
              this.$emit("searchData");
            }
          })
          .catch(() => {
            this.$Spin.hide();
          });
      });
    },
  },
};
</script>

<style lang="less" scoped>
.decalareinfo-form {
  .ivu-input-wrapper-disabled,
  .ivu-input-disabled,
  .ivu-select-disabled,
  .ivu-select-disabled .ivu-select-input,
  .ivu-select-disabled .ivu-select-input[disabled] {
    color: #666;
    -webkit-text-fill-color: #666;
  }

  .action-ico {
    font-size: 24px;
    cursor: pointer;
  }
}
</style>
