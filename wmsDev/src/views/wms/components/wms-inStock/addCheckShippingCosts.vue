<template>
  <div>
    <h2>仓库寄出物品运费流程</h2>
    <Form class="mt20" ref="checkShippingCostForm" :model="checkShippingCostForm" :label-width="120"
      :rules="ruleValidate">
      <div class="card-content mt20">
        <div style="display: flex" class="mt20 mb10">
          <div style="width: 4px; height: 20px; background: #2c74f6"></div>
          <span class="ml10" style="font-size:18px;font-weight:700">仓储售后寄出信息</span>
        </div>
        <Row>
          <Col :span="6">
          <FormItem>
            <div slot="label">
              <span>运费核对编号:</span>
            </div>
            <span>保存后创建</span>
          </FormItem>
          </Col>
          <Col :span="6">
          <FormItem>
            <div slot="label">
              <span>创建人:</span>
            </div>
            <span>{{ userInfo.userName }}</span>
          </FormItem>
          </Col>
          <Col :span="6">
          <FormItem>
            <div slot="label">
              <span>所属事业部:</span>
            </div>
            <span>{{ businessDept }}</span>
          </FormItem>
          </Col>
          <Col :span="6">
          <FormItem label="寄出日期:" prop="consignmentTime">
            <DatePicker v-model="checkShippingCostForm.consignmentTime" type="date"
              @on-change="(e) => { getDateValue(e, 'consignmentTime') }" placeholder="选择日期" style="width: 270px">
            </DatePicker>
          </FormItem>
          </Col>
          <Col :span="6">
          <FormItem label="物流单号:" prop="logisticsNo">
            <Input v-model="checkShippingCostForm.logisticsNo" :maxlength="30" />
          </FormItem>
          </Col>
          <Col :span="6">
          <FormItem label="寄出数量:" prop="consignmentQuantity">
            <InputNumber v-model="checkShippingCostForm.consignmentQuantity" :min="1" :precision="0"
              style="width: 270px" />
          </FormItem>
          </Col>
          <Col :span="6">
          <FormItem label="采购人:" prop="purchaserId">
            <dyt-select v-model="checkShippingCostForm.purchaserId" clearable filterable>
              <Option v-for="(item, index) in purchaserArr" :value="item.userId" :key="index">{{ item.name }}
              </Option>
            </dyt-select>
          </FormItem>
          </Col>
          <Col :span="6">
          <FormItem label="寄出类型:" prop="consignmentType">
            <dyt-select v-model="checkShippingCostForm.consignmentType" clearable filterable>
              <Option v-for="(item, index) in sendingTypeList" :value="item.value" :key="index">{{ item.label }}
              </Option>
            </dyt-select>
          </FormItem>
          </Col>
          <Col :span="6">
          <FormItem label="采购单号:">
            <Input v-model="checkShippingCostForm.purchaseNumber" :maxlength="30" />
          </FormItem>
          </Col>
          <Col :span="6">
          <FormItem props="pickingNo">
            <div slot="label">
              <span>出库单号:</span>
            </div>
            <Input v-model="checkShippingCostForm.pickingNo" :maxlength="30" />
          </FormItem>
          </Col>
          <Col :span="6">
          <FormItem label="寄出补充说明:">
            <Input type="textarea" v-model="checkShippingCostForm.consignmentRemark" :rows="2" :maxlength="200"
              show-word-limit />
          </FormItem>
          </Col>
          <Col :span="6">
          <FormItem label="收件供应商名称:" prop="supplierId">
            <dyt-select v-model="checkShippingCostForm.supplierId" clearable placeholder="请选择">
              <Option v-for="(item, index) in supplierArr" :value="item.supplierId" :key="index">{{ item.supplierName }}
              </Option>
            </dyt-select>
          </FormItem>
          </Col>
          <Col :span="12">
          <FormItem label="供应商收件信息:">
            <Input v-model="checkShippingCostForm.supplierReceiveInfo" />
          </FormItem>
          </Col>
        </Row>
        <!-- <div style="display: flex" class="mt20 mb10">
          <div style="width: 4px; height: 20px; background: #2c74f6"></div>
          <span class="ml10" style="font-size:18px;font-weight:700">采购跟进处理费用</span>
        </div>
        <Row>
          <Col :span="6">
          <FormItem label="结算方式:">
            {{ checkShippingCostForm.settlementType || '--' }}
          </FormItem>
          </Col>
          <Col :span="6">
          <FormItem label="运费金额:">
            <InputNumber v-model="checkShippingCostForm.freightAmount" :min="1" style="width:260px" />
          </FormItem>
          </Col>
          <Col :span="6">
          <FormItem label="运费承担方 和 退/抵形式:" :label-width="180" prop="freightBearInfo">
            <dyt-select v-model="checkShippingCostForm.freightBearInfo" clearable placeholder="请选择">
              <Option v-for="(item, index) in freightCarrierMethodList" :value="item.value" :key="index">{{ item.label }}
              </Option>
            </dyt-select>
          </FormItem>
          </Col>
          <Col :span="6">
          <FormItem label="记账月份:" prop="freightMonth">
            <DatePicker transfer type="month" placeholder="选择月份" style="width: 100%"
              v-model="checkShippingCostForm.freightMonth" format="yyyy-MM"
              @on-change="(e) => { getDateValue(e, 'freightMonth') }" />
          </FormItem>
          </Col>
          <Col :span="6">
          <FormItem label="处理备注:" prop="freightRemark">
            <Input v-model="checkShippingCostForm.freightRemark" type="textarea" :rows="2" :maxlength="200"
              show-word-limit />
          </FormItem>
          </Col>
        </Row> -->
      </div>
    </Form>
    <Spin v-if="loading" fix></Spin>
  </div>
</template>
<script>
import api from "@/api/api";
export default {
  props: {
    purchaserArr: {
      type: Array,
      default: () => {
        return []
      }
    },
    supplierArr: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      checkShippingCostForm: {
        consignmentTime: null,
        logisticsNo: null,
        consignmentQuantity: null,
        purchaserId: null,
        consignmentType: null,
        pickingNo: null,
        consignmentRemark: null,
        supplierId: null,
        supplierReceiveInfo: null,
        purchaseNumber: null,
        settlementType: null,
        freightAmount: null,
        freightBearInfo: null,
        freightMonth: null,
        summitType: null // 判断是否为创建时提交还是已存有数据提交,1  创建时提交，  0，已有数据时提交
      },
      ruleValidate: {
        purchaserId: [
          { required: true, message: '请输入', trigger: 'change' }
        ],
        consignmentType: [
          { required: true, type: 'number', message: '请输入', trigger: 'change' }
        ],
        freightBearInfo: [
          { required: true, message: '请输入', trigger: 'change' }
        ],
        consignmentTime: [
          { required: true, message: '请选择日期', trigger: 'change' }
        ],
        consignmentQuantity: [
          { required: true, type: 'number', message: '请输入', trigger: 'change' }
        ],
        logisticsNo: [
          { required: true, message: '请输入', trigger: 'change' }
        ],
        supplierId: [
          { required: true, message: '请选择', trigger: 'change' }
        ]
      },
      sendingTypeList: [
        {
          value: 0,
          label: '来货异常处理'
        },
        {
          value: 1,
          label: '质检问题件处理'
        },
        {
          value: 2,
          label: '出库退货处理'
        },
        {
          value: 3,
          label: '其他寄出处理'
        },
      ],
      settlementMethodArr: [],
      freightCarrierMethodList: [
        { label: '累计月结抵扣', value: '累计月结抵扣' },
        { label: '逐单现金退还', value: '逐单现金退还' },
        { label: '由公司承担', value: '由公司承担' },
        { label: '到付寄出', value: '到付寄出' },
        { label: '其他', value: '其他' },
      ],
      loading: false
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo;
    },
    businessDept() {
      let businessDeptInfo = {};
      let authInfo = this.$store.state.authUserInfo
      if (this.$common.isEmpty(this.$store.getters.getBusinessDeptList)) return businessDeptInfo;
      this.$store.getters.getBusinessDeptList.forEach(item => {
        businessDeptInfo[item.id] = item;
      })
      return businessDeptInfo[authInfo.securityUser.businessDeptId].name;
    },
    // 获取当前登录账号可查看的事业部ID列表
    allowBusinessDeptIds() {
      return this.$store.getters['allowBusinessDeptIds'].join(',');
    },
  },
  watch: {
    'checkShippingCostForm.supplierId': {
      handler(newVal, oldVal) {
        let supplierReceivingInfo = ''
        let settlementType = ''
        this.supplierArr.forEach(item => {
          supplierReceivingInfo = `${item.contactMan ? item.contactMan : ''}  ${item.telephone ? item.telephone : ''}  ${item.rAddress ? item.rAddress : ''}  ${item.rAddressDetail ? item.rAddressDetail : ''} `
          this.$set(item, 'supplierReceivingInfo', supplierReceivingInfo)
          if (item.supplierId === newVal) {
            this.settlementMethodArr.forEach(el => {
              if (el.dataValue == item.settlementType) {
                settlementType = el.dataDesc
              }
            })
            this.checkShippingCostForm.supplierReceiveInfo = this.$common.isEmpty(item.supplierReceivingInfo.trim()) ? '--' : item.supplierReceivingInfo
            this.checkShippingCostForm.settlementType = settlementType
          }
        })
      }
    },
  },
  created() {
    this.getSupplierList()
  },
  methods: {
    // 获取当前用户下可查看事业部所属供应商的结算方式
    getSupplierList() {
      this.axios.get(api.baseDataList + '?dataType=' + 'settlementType').then(res => {
        if (res.data.code == 0) {
          this.settlementMethodArr = res.data.datas;
        }
      })
    },
    getDateValue(val, type) {
      this.checkShippingCostForm[type] = val
    },
    saveOrSubmit(type) {
      this.$refs.checkShippingCostForm.validate((valid) => {
        if (valid) {
          this.loading = true
          let obj = this.$common.copy(this.checkShippingCostForm)
          let authInfo = this.$store.state.authUserInfo
          obj.businessDeptId = authInfo.securityUser.businessDeptId
          if (type === 'submit') {
            obj.summitType = 0
            this.axios.post(api.submit_freightCheck, obj).then(res => {
              if (res.data.code === 0) {
                this.$Message.success('操作成功')
                this.$emit('goBack', true)
              }
            }).finally(() => {
              this.loading = false
            })
          } else {
            this.axios.post(api.add_freightCheck, obj).then(res => {
              if (res.data.code === 0) {
                this.$Message.success('操作成功')
                this.$emit('goBack', true)
              }
            }).finally(() => {
              this.loading = false
            })
          }
        }
      })
    }
  }
}
</script>
<style lang="less"></style>