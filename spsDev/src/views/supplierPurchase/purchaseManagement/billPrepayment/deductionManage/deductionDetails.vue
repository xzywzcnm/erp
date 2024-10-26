<template>
  <div>
    <Modal v-model="isVisible" :title="'账单付款抵扣 ' + (title[deductType] || '')" width="1200" :mask-closable="false"
      class="deductionDetailsPage ">
      <div class="formDetail">
        <Form ref="formData" :model="formData" :rules="formRules" inline :label-width="90">
          <div class="titles">供应商基本信息</div>
          <div :class="isAdd || isEdit ? 'fmb16' : 'fmb0'">
            <FormItem label="供应商名称:" prop="supplierId">
              <dyt-select v-model="formData.supplierId" @on-change="supplierChange"
                v-if="isAdd || (isEdit && !costGeneration)">
                <Option v-for="item in supplerList" :value="item.supplierId" :key="item.supplierId">
                  {{ item.supplierName }}
                </Option>
              </dyt-select>
              <div v-else>{{ supplerList[formData.supplierId] ? supplerList[formData.supplierId].supplierName :
                formData.supplierId }}</div>
            </FormItem>
            <FormItem label="结算方式:" prop="settlementType">
              <div v-if="settlementTypeArr[formData.settlementType]">
                {{ settlementTypeArr[formData.settlementType].dataDesc }}
              </div>
              <div v-else>--</div>
            </FormItem>
            <FormItem label="记账月份:" prop="billMonth">
              <DatePicker type="month" placeholder="请选择月份" :value="formData.billMonth" format="yyyy-MM"
                @on-change="billMothChange" v-if="isAdd || (isEdit && !costGeneration)">
              </DatePicker>
              <div v-else>{{ formData.billMonth }}</div>
            </FormItem>
            <FormItem label="账单状态:" prop="bindingBillStatus">
              <div v-if="isAdd">创建后生成</div>
              <dyt-select v-model="formData.bindingBillStatus" v-if="isEdit">
                <Option :value="1">已完成</Option>
              </dyt-select>
              <div v-if="isDetail">{{ billOptionList[detailData.billStatus] ?
                billOptionList[detailData.billStatus].label : detailData.billStatus }}</div>
            </FormItem>
            <FormItem label="账单申请编号:">
              <div v-if="isAdd">账单抵扣后关联</div>
              <div v-else>{{ detailData.billApplyNo || '' }}</div>
            </FormItem>
            <template v-if="detailData.billApplyDeductionId">
              <FormItem label="汇总状态:">
                <div v-if="deductionList[detailData.deductionStatus]">
                  {{ deductionList[detailData.deductionStatus].label }}
                </div>
              </FormItem>
              <FormItem label="创建时间:">
                <div>{{ detailData.createdTime || '' }}</div>
              </FormItem>
              <FormItem label="创建人:">
                <div v-if="createUserArr[detailData.createdBy]">{{ createUserArr[detailData.createdBy].userName }}</div>
              </FormItem>
            </template>
          </div>
          <div class="titles">抵扣金额</div>
          <div class="fmb0">
            <div>
              <FormItem label="运费抵扣金额:">
                <div>{{ detailData.freightTotalPrice || 0 }} 元</div>
              </FormItem>
            </div>
            <div>
              <FormItem label="出库抵扣金额:">
                <div>{{ detailData.outboundTotalPrice || 0 }} 元</div>
              </FormItem>
            </div>
            <pricetAddList ref="fineDeductionList" priceTitle="罚款抵扣金额" :list="fineDeductionList"
              :deductType="deductType" />
            <pricetAddList ref="otherDeductionList" priceTitle="其它抵扣金额" :list="otherDeductionList"
              :deductType="deductType" />
          </div>
          <div class="mt10 fmb0 autolong">
            <div style="margin-bottom: 5px;">汇总备注:</div>
            <FormItem :label-width="0" v-if="isAdd || isEdit" prop="remark">
              <Input v-model="formData.remark" maxlength="200" show-word-limit type="textarea" :rows="3"
                style="width: 100%" />
            </FormItem>
            <div v-else>{{ formData.remark }}</div>
          </div>
        </Form>
        <Spin fix v-if="pageLoading"></Spin>
      </div>
      <div slot="footer">
        <Button @click="isVisible = false">关闭</Button>
        <Button type="primary" @click="handleForm" :loading="saveLoading" v-if="isAdd || isEdit">保存</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import api from "@/api/api";
import Mixin from "@/components/mixin/common_mixin";
import pricetAddList from './pricetAddList';
import { billOptionList, deductionList } from './fileData.js';
export default {
  name: "deductionDetails",
  components: { pricetAddList },
  mixins: [Mixin],
  props: {
    modelVisible: {
      type: Boolean,
      default() {
        return {};
      },
    },
    deductType: {
      type: String,
      default() {
        return null;
      },
    },
    data: {
      type: Object,
      default() {
        return {};
      },
    },
    createUserArr: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      isVisible: false,
      formData: {
        supplierId: '',
        settlementType: '',
        remark: '',
        billMonth: '',
        bindingBillStatus: '',
        billApplyDeductionId: '',
      },
      formRules: {
        supplierId: [
          { required: true, message: '请选择', trigger: 'change' },
        ],
        billMonth: [
          { required: true, message: '请选择', trigger: 'change' },
        ],
      },
      pageLoading: false,
      saveLoading: false,
      supplerList: {},
      settlementTypeArr: [],
      fineDeductionList: [],
      otherDeductionList: [],
      detailData: {},
      billOptionList: billOptionList,
      deductionList: deductionList,
      title: {
        add: '新增',
        detail: '详情',
        edit: '编辑',
      },
    };
  },
  watch: {
    modelVisible: {
      handler(val) {
        val && this.open();
      },
      deep: true,
    },
    isVisible: {
      handler(val) {
        // !val && this.$emit("update:modelVisible", val);
        if (!val) {
          this.reset();
          this.$emit("update:modelVisible", val);
        }
      },
      deep: true,
    },
  },
  computed: {
    isAdd() {
      return ['add'].includes(this.deductType);
    },
    isDetail() {
      return ['detail'].includes(this.deductType);
    },
    isEdit() {
      return ['edit'].includes(this.deductType);
    },
    // 编辑时，“运费抵扣金额、出库抵扣金额”值>0，字段供应商、结算方式、记账月份不可修改
    costGeneration() {
      let { freightTotalPrice, outboundTotalPrice } = this.detailData;
      return (freightTotalPrice || 0) > 0 || (outboundTotalPrice || 0) > 0;
    },
  },
  created() {
    this.getSupplierFn();
    this.getBaseDataList();
  },
  methods: {
    reset() {
      this.detailData = {};
      this.fineDeductionList = [];
      this.otherDeductionList = [];
      this.$nextTick(() => {
        this.$refs.formData.resetFields();
        this.formData.remark = ''
      })
    },
    // 窗口打开
    open() {
      this.isVisible = true;
      this.reset();
      let { billApplyDeductionId } = this.data;
      if (billApplyDeductionId) this.getDetail(billApplyDeductionId);
    },
    // 供应商下拉列表(筛选状态为3的供应商：审批状态（1待提交，2待审核，3已审核，4已停用）)
    getSupplierFn() {
      this.axios.get(api.queryIdAndName).then(({ data }) => {
        if (data.code == 0) {
          let list = data.datas || [];
          let obj = {};
          list.forEach(k => {
            // if (k.auditStatus === 3) {
            obj[k.supplierId] = k;
            // }
          });
          this.supplerList = obj;
        }
      });
    },
    supplierChange(e) {
      let item = this.supplerList[e] || {};
      this.formData.settlementType = item.settlementType || '';
    },
    // 获取供应商结算方式
    getBaseDataList() {
      this.axios
        .get(api.baseDataList + "?dataType=" + "settlementType")
        .then((res) => {
          if (res.data.code == 0) {
            let list = res.data.datas || [];
            this.settlementTypeArr = this.$common.arrayToObj(list, 'dataValue');
          }
        });
    },
    // 数据请求
    getDetail(billApplyDeductionId) {
      this.pageLoading = true;
      this.axios.get(api.deduction_get, { params: { billApplyDeductionId } })
        .then(({ data }) => {
          if (!(data && data.code === 0)) return;
          let totalData = data.datas || {};
          this.detailData = totalData;
          Object.keys(this.formData).forEach(key => {
            totalData[key] && (this.formData[key] = totalData[key]);
          })
          this.fineDeductionList = totalData.fineDeductionList || [];
          this.otherDeductionList = totalData.otherDeductionList || [];
          this.supplierChange(totalData.supplierId);
        })
        .finally(() => {
          this.pageLoading = false;
        });
    },
    billMothChange(e) {
      this.formData.billMonth = e;
    },
    // 提交汇总
    handleForm() {
      this.$refs['formData'].validate(async (valid) => {
        if (!valid) return;
        let fineDeductionList = await this.$refs.fineDeductionList.handleForm();
        let otherDeductionList = await this.$refs.otherDeductionList.handleForm();
        let detailData = this.detailData;
        let freightTotalPrice = detailData.freightTotalPrice || 0;
        let outboundTotalPrice = detailData.outboundTotalPrice || 0;
        // 当运费或出库抵扣金额为0，罚款抵扣金额、其他抵扣金额其中一项为必填
        if (freightTotalPrice <= 0 && outboundTotalPrice <= 0) {
          if (!(fineDeductionList.length || otherDeductionList.length)) {
            this.$Message.error("罚款抵扣和其他抵扣金额需填写其一!");
            return;
          }
        }
        let rqApi = null;
        let temp = this.$common.removeEmpty(this.formData);
        delete temp.settlementType;
        delete temp.imgLoading;
        if (detailData.billApplyDeductionId) {
          rqApi = 'deduction_update';
        } else {
          rqApi = 'deduction_insert';
        }
        temp.fineDeductionList = fineDeductionList;
        temp.otherDeductionList = otherDeductionList;
        // console.log(temp, rqApi)
        // return;
        this.saveLoading = true;
        this.axios
          .post(api[rqApi], temp)
          .then((res) => {
            if (res.data.code == 0) {
              this.$Message.success("操作成功!");
              this.$emit('renewList');
              this.isVisible = false;
            }
          }).finally(() => {
            this.saveLoading = false;
          })
      })
    },
  },
};
</script>
<style lang="less">
.deductionDetailsPage {
  .ivu-modal {
    top: 50px;
  }

  .ivu-modal-body {
    max-height: 720px;
    overflow: auto;
  }

  .titles {
    font-weight: bold;
    margin-bottom: 6px;
  }

  .formDetail {
    .ivu-form-item {
      .ivu-form-item-content {
        width: 180px;
      }
    }

    .autolong {

      .ivu-form-item,
      .ivu-form-item-content {
        width: 100%;
      }
    }
  }
}
</style>