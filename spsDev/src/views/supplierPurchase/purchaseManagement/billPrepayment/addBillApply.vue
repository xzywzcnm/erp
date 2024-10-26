<template>
  <div>
    <div style="display: flex">
      <div style="width: 4px; height: 20px; background: #2c74f6"></div>
      <span class="ml10" style="font-size:18px;font-weight:700">采购申请提交</span>
    </div>
    <Divider />
    <Form ref="billForm" :model="billForm" :label-width="120" :rules="ruleValidate">
      <Row>
        <Col :span="5">
        <FormItem label="供应商名称" prop="supplierId">
          <dyt-select v-model="billForm.supplierId" clearable placeholder="请选择" @on-change="getAccountPrice">
            <Option v-for="(item, index) in supplierList" :value="item.supplierId" :key="index">{{ item.supplierName }}
            </Option>
          </dyt-select>
        </FormItem>
        </Col>
        <Col :span="5">
        <FormItem label="账单月份:" prop="billMonth">
          <DatePicker transfer type="month" style="width: 100%" v-model="billForm.billMonth" placeholder="选择日期"
            @on-change="getDateValue"></DatePicker>
        </FormItem>
        </Col>
        <Col :span="5">
        <FormItem label="结算方式:" prop="settlementType">
          <dyt-select v-model="billForm.settlementType" clearable placeholder="请选择">
            <Option v-for="(item, index) in settlementTypeArr" :value="item.dataValue" :key="index">{{ item.dataDesc }}
            </Option>
          </dyt-select>
        </FormItem>
        </Col>
        <Col :span="9">
        <FormItem label="付款信息汇总:" prop="settlementType">
          <Input v-model="billForm.paymentInfo" placeholder="请输入" style="width: 400px" />
        </FormItem>
        </Col>
        <Col :span="5">
        <FormItem prop="receiptTotalPrice">
          <span slot="label">
            <span style="color:red">入库总金额确认:</span>
          </span>
          <InputNumber v-model="billForm.receiptTotalPrice" :max="1000000000" class="amountInput" placeholder="请输入"
            @on-change="(e) => { changeNum(e, 'receiptTotalPrice') }" />
        </FormItem>
        </Col>
        <Col :span="5">
        <FormItem label="其他金额:" prop="otherPrice">
          <InputNumber v-model="billForm.otherPrice" :max="1000000000" class="amountInput" placeholder="请输入"
            @on-change="(e) => { changeNum(e, 'otherPrice') }" />
        </FormItem>
        </Col>
        <Col :span="5">
        <FormItem label="其他金额说明:" prop="otherPriceReason">
          <Input v-model="billForm.otherPriceReason" :maxlength="200" placeholder="请输入" />
        </FormItem>
        </Col>
        <Col :span="5">
        <FormItem prop="totalPayAmount">
          <span slot="label">
            <span style="color:red">实际应付金额:</span>
          </span>
          <!-- <InputNumber v-model="billForm.totalPayAmount" :max="1000000000" class="amountInput" placeholder="请输入"
            @on-change="(e) => { changeNum(e, 'totalPayAmount') }" /> -->
          {{ billForm.totalPayAmount }}
        </FormItem>
        </Col>
        <Col :span="5">
        <FormItem label="账单明细表">
          <div v-if="!billForm.billDetailExcelUrl">
            <Upload ref="excelUploadRef" name="files" :show-upload-list="true" :before-upload="fileUploadBefore"
              :action="uploadFilesUrl" :max-size="10240" class="upload-item">
              <div class="upload-icon">
                <Button type="primary">
                  <Icon type="ios-cloud-upload" />
                  上传
                </Button>
              </div>
              <Spin v-if="isUploadLoading" fix></Spin>
            </Upload>
          </div>
          <div v-else>
            <Icon type="ios-paper" size="20" color="green" />
            {{ billForm.billDetailExcelName }}
            <Icon type="md-eye" size="20" class="ml10" style="cursor:pointer" @click="getBillExcel('see')" />
            <Icon type="md-download" size="20" class="ml20" style="cursor:pointer" @click="getBillExcel('download')" />
            <Icon type="ios-trash" size="20" class="ml20" style="cursor:pointer" @click="getBillExcel('delete')" />
          </div>
        </FormItem>
        </Col>
      </Row>
      <div style="display: flex">
        <div style="width: 4px; height: 20px; background: #2c74f6"></div>
        <span class="ml10" style="font-size:18px;font-weight:700">抵/减/扣 项目及金额</span>
      </div>
      <Divider />
      <Row>
        <Col :span="6">
        <FormItem prop="freightReduction" :label-width="140">
          <div slot="label">
            <span style="color:red">运费抵/退金额汇总:</span>
          </div>
          <!-- <InputNumber v-model="billForm.freightReduction" :max="1000000000" class="amountInput" placeholder="请输入"
            @on-change="(e) => { changeNum(e, 'freightReduction') }" disabled /> -->
          <span>{{ billForm.freightReduction }}</span>
        </FormItem>
        </Col>
        <Col :span="18">
        <FormItem prop="outboundPriceReduction" :label-width="140">
          <div slot="label">
            <span style="color:red">出库抵/退金额汇总:</span>
          </div>
          <span>{{ billForm.outboundPriceReduction }}</span>
          <!-- <InputNumber v-model="billForm.outboundPriceReduction" :max="1000000000" class="amountInput" placeholder="请输入"
            @on-change="(e) => { changeNum(e, 'outboundPriceReduction') }" disabled /> -->
        </FormItem>
        </Col>
        <Col :span="6">
        <FormItem label="供应商扣/罚金额汇总:" prop="supplierPriceReduction" :label-width="140">
          <span>{{ billForm.supplierPriceReduction }}</span>
          <!-- <InputNumber v-model="billForm.supplierPriceReduction" :max="1000000000" class="amountInput" placeholder="请输入"
            @on-change="(e) => { changeNum(e, 'supplierPriceReduction') }" disabled /> -->
        </FormItem>
        </Col>
        <Col :span="6">
        <FormItem label="另抵/退/扣/减金额汇总:" prop="otherPriceReduction" :label-width="140">
          <span>{{ billForm.otherPriceReduction }}</span>
          <!-- <InputNumber v-model="billForm.otherPriceReduction" :max="1000000000" class="amountInput" placeholder="请输入"
            @on-change="(e) => { changeNum(e, 'otherPriceReduction') }" disabled /> -->
        </FormItem>
        </Col>
        <Col :span="6">
        <FormItem label="抵/退/扣/减补充说明:" prop="reductionReason" :label-width="140">
          <Input style="width: 400px" v-model="billForm.reductionReason" :maxlength="200" placeholder="请输入" />
        </FormItem>
        </Col>
      </Row>
    </Form>
    <Spin v-if="loading" fix></Spin>
  </div>
</template>
<script>
import api from "@/api/api";
export default {
  props: {
    settlementTypeArr: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      billForm: {
        supplierId: null,
        settlementType: null,
        paymentInfo: null,
        billMonth: null,
        receiptTotalPrice: null,
        otherPrice: null,
        otherPriceReason: null,
        totalPayAmount: null,
        freightReduction: null,
        outboundPriceReduction: null,
        supplierPriceReduction: null,
        otherPriceReduction: null,
        reductionReason: null,
        billDetailExcelUrl: null,
        billDetailExcelName: null,
        billApplyId: null
      },
      ruleValidate: {
        billMonth: [
          { required: true, message: '请选择', trigger: 'change' }
        ],
        supplierId: [
          { required: true, message: '请选择', trigger: 'change' }
        ],
        receiptTotalPrice: [
          { required: true, type: 'number', message: '请输入', trigger: 'change' },
          { validator: this.validNum, trigger: 'change' }
        ],
        otherPrice: [
          { validator: this.validNum, trigger: 'change' }
        ],
        totalPayAmount: [
          { required: true, type: 'number', message: '请输入', trigger: 'change' },
          { validator: this.validNum, trigger: 'change' }
        ],
        freightReduction: [
          { validator: this.validNum, trigger: 'change' }
        ],
        outboundPriceReduction: [
          { validator: this.validNum, trigger: 'change' }
        ],
        supplierPriceReduction: [
          { validator: this.validNum, trigger: 'change' }
        ],
        otherPriceReduction: [
          { validator: this.validNum, trigger: 'change' }
        ]
      },
      supplierList: [],
      isUploadLoading: false,
      uploadFilesUrl: api.upload_files + '?basePath=/product',
      loading: false
    }
  },
  created() {
    this.getSupplierList()
  },
  watch: {
    'billForm.supplierId': {
      handler(newVal, oldVal) {
        if (newVal) {
          this.supplierList.forEach(item => {
            if (item.supplierId === newVal) {
              let paymentInfo = this.$common.isEmpty(item.paymentInfoList) ? '' : item.paymentInfoList.join(',')
              this.$set(this.billForm, 'paymentInfo', paymentInfo)
              this.$set(this.billForm, 'settlementType', item.settlementType)
            }
          })
        }
      }
    },
    // 此处由于监听的类型为引用类型，导致old和new会始终相等，因此拆分成6个
    'billForm.receiptTotalPrice': {
      handler(newVal) {
        this.billForm.totalPayAmount = Number(this.resultAllTotalAmount.toFixed(2))
      }
    },
    'billForm.otherPrice': {
      handler(newVal) {
        this.billForm.totalPayAmount = Number(this.resultAllTotalAmount.toFixed(2))
      }
    },
    'billForm.freightReduction': {
      handler(newVal) {
        this.billForm.totalPayAmount = Number(this.resultAllTotalAmount.toFixed(2))
      }
    },
    'billForm.outboundPriceReduction': {
      handler(newVal) {
        this.billForm.totalPayAmount = Number(this.resultAllTotalAmount.toFixed(2))
      }
    },
    'billForm.supplierPriceReduction': {
      handler(newVal) {
        this.billForm.totalPayAmount = Number(this.resultAllTotalAmount.toFixed(2))
      }
    },
    'billForm.otherPriceReduction': {
      handler(newVal) {
        this.billForm.totalPayAmount = Number(this.resultAllTotalAmount.toFixed(2))
      }
    },
  },
  computed: {
    // 获取当前登录账号可查看的事业部ID列表
    allowBusinessDeptIds() {
      return this.$store.getters['allowBusinessDeptIds'].join(',');
    },
    resultAllTotalAmount() {
      let result = (this.billForm.receiptTotalPrice + this.billForm.otherPrice)
        - (this.billForm.freightReduction + this.billForm.outboundPriceReduction
          + this.billForm.supplierPriceReduction + this.billForm.otherPriceReduction)
      return result
    }
  },
  methods: {
    // 获取当前用户下可查看事业部所属供应商
    getSupplierList() {
      this.axios.post(`${api.get_billSupplierInfo}?businessDeptIds=${this.allowBusinessDeptIds}`).then(res => {
        if (res.data.code === 0) {
          this.supplierList = res.data.datas
        }
      })
    },
    // 选择账单时间
    getDateValue(val) {
      this.billForm.billMonth = val;
      this.getAccountPrice();
    },
    // 上传excel
    fileUploadBefore(file) {
      const allowedTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      if (!allowedTypes.includes(file.type)) {
        this.$Message.error('文件格式不对，请上传xlsx、xls格式的文件');
        return false;
      }
      // this.isUploadLoading = true;
      let newForm = new FormData(); // 创建form对象
      newForm.append('files', file);
      const uploadUrl = `${this.uploadFilesUrl}&random=${(Math.random()).toString().substring(2, 5) + (new Date().getTime()).toString()}`;
      this.axios.post(uploadUrl, newForm).then(res => {
        if (!res || res.data.code != 0) return;
        this.billForm.billDetailExcelUrl = res.data.datas[0]
        this.billForm.billDetailExcelName = file.name
      }).finally(() => {
        this.isUploadLoading = false;
      })
      return false;
    },
    // 对excel文件进行下载、预览、删除操作
    getBillExcel(type) {
      if (type == 'download') {
        window.open('./filenode/s' + this.billForm.billDetailExcelUrl)
      } else if (type == 'delete') {
        this.billForm.billDetailExcelUrl = null
        this.billForm.billDetailExcelName = null
      } else {
        let url = 'filenode/s' + this.billForm.billDetailExcelUrl
        let localUrl = window.location.href
        localUrl = localUrl.split('supplierPurchase')[0]
        // 在线预览excel
        window.open(`https://view.officeapps.live.com/op/view.aspx?src=${localUrl += url}`)
      }
    },
    // 提交或暂存
    saveOrSubmit(type) {
      let obj = this.$common.copy(this.billForm)
      if (obj.totalPayAmount < 0) return this.$Message.error('实际应付总额不能为负数')
      delete obj.billApplyId
      obj.type = type === 'save' ? 0 : 1
      this.$refs.billForm.validate((valid) => {
        if (valid) {
          this.loading = true
          this.axios.post(api.add_billApply, obj).then(res => {
            if (res.data.code === 0) {
              this.$Message.success('操作成功')
              this.$emit('goBackForm', true)
            }
            if (res.data.code === 403) return this.$Message.error('暂无权限')
          }).finally(() => {
            this.loading = false
          })
        }
      })
    },
    changeNum(val, type) {
      this.billForm[type] = Number(val)
    },
    validNum(rule, value, callback) {
      const reg = /^\d{1,9}(\.\d{1,2})?$/;
      if ((reg.test(value) && Number(value) >= 0) || this.$common.isEmpty(value)) {
        callback();
      } else {
        callback(new Error('不超过2位小数且整数最大为9位数'));
      }
    },
    getAccountPrice() {
      let { supplierId, billMonth } = this.billForm;
      let fun = (resultData) => {
        let temp = {
          freightReduction: 'freightTotalPrice',
          outboundPriceReduction: 'outboundTotalPrice',
          supplierPriceReduction: 'fineTotalPrice',
          otherPriceReduction: 'otherTotalPrice',
        }
        Object.keys(temp).forEach(key => {
          let num = this.$common.isEmpty(resultData[temp[key]]) ? null : resultData[temp[key]] - 0;
          this.$set(this.billForm, key, num);
        })
      }
      fun({});// 清空抵/减/扣 项目及金额
      if (!(supplierId && billMonth)) return;
      this.axios.get(api.getBySupplierAndBillMonth, { params: { supplierId, billMonth } }).then(({ data }) => {
        if (data.code === 0) {
          fun(data.datas || {});
        }
      })
    }
  }
}
</script>
<style lang="less">
.amountInput {
  width: 200px;

  .ivu-input-number-handler-wrap {
    display: none;
  }
}
</style>