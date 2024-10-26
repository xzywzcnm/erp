<template>
    <div>
        <h2>仓库寄出物品运费流程</h2>
        <Form class="mt20" ref="checkShippingCostForm" :model="checkShippingCostForm" :label-width="120" :rules="ruleValidate">
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
                <span>{{ checkShippingCostForm.freightCheckNo }}</span>
                </FormItem>
              </Col>
              <Col :span="6">
                <FormItem>
                <div slot="label">
                  <span>创建人:</span>
                </div>
                <span>{{ userInfoName }}</span>
                </FormItem>
              </Col>
              <Col :span="6">
                <FormItem>
                <div slot="label">
                  <span>所属事业部:</span>
                </div>
                <span>{{ businessDeptName }}</span>
                </FormItem>
              </Col>
              <Col :span="6">
                <FormItem label="寄出日期:" prop="consignmentTime">
                <div v-if="isEdit && isWaitProcess">
                  <DatePicker v-model="checkShippingCostForm.consignmentTime" 
                  type="date" 
                  @on-change="(e) => {getDateValue(e,'consignmentTime')}"
                  placeholder="选择日期" 
                  style="width: 270px">
                  </DatePicker>
                </div>
                <div v-else>
                {{ checkShippingCostForm.consignmentTime }}
                </div>
                </FormItem>
              </Col>
              <Col :span="6">
                <FormItem label="物流单号:" prop="logisticsNo">
                  <div>
                  {{ checkShippingCostForm.logisticsNo }}
                  </div>
                </FormItem>
              </Col>
              <Col :span="6">
                <FormItem label="寄出数量:" prop="consignmentQuantity">
                  <div v-if="isEdit && isWaitProcess">
                    <InputNumber v-model="checkShippingCostForm.consignmentQuantity" :min="1" :precision="0" style="width: 270px"/>
                  </div>
                  <div v-else>
                  {{ checkShippingCostForm.consignmentQuantity }}
                  </div>
                </FormItem>
              </Col>
              <Col :span="6">
                <FormItem label="采购人:" prop="purchaserId">
                    <div v-if="!(isEdit && isWaitProcess)">
                      {{ showText('purchaserId', checkShippingCostForm.purchaserId) }}
                    </div>
                    <div v-else>
                      <dyt-select
                      v-model="checkShippingCostForm.purchaserId"
                      :disabled="!(isEdit && isWaitProcess)"
                      clearable
                      filterable
                    >
                      <Option
                        v-for="(item, index) in purchaserList"
                        :value="item.userId"
                        :key="index"
                        >{{ item.name }}
                      </Option>
                    </dyt-select>
                    </div>
                </FormItem>
              </Col>
              <Col :span="6">
                <FormItem label="寄出类型:" prop="consignmentType">
                  <div v-if="!(isEdit && isWaitProcess)">
                    {{ showText('consignmentType', checkShippingCostForm.consignmentType) }}
                  </div>
                  <div v-else>
                    <dyt-select
                      v-model="checkShippingCostForm.consignmentType"
                      clearable
                      filterable
                      :disabled="!(isEdit && isWaitProcess)"
                    >
                      <Option
                        v-for="(item, index) in sendingTypeList"
                        :value="item.value"
                        :key="index"
                        >{{ item.label }}
                      </Option>
                    </dyt-select>
                  </div>
                </FormItem>
              </Col>
              <Col :span="6">
                <FormItem label="采购单号:">
                  <div v-if="isEdit && isWaitProcess">
                    <Input v-model="checkShippingCostForm.purchaseNumber" :maxlength="30"/>
                  </div>
                  <div v-else>
                  {{ checkShippingCostForm.purchaseNumber }}
                  </div>
                </FormItem>
              </Col>
              <Col :span="6">
                <FormItem prop="pickingNo">
                  <div slot="label">
                  <span>出库单号:</span>
                </div>
                <div v-if="isEdit && isWaitProcess">
                  <Input v-model="checkShippingCostForm.pickingNo" :maxlength="30"/>
                </div>
                <div v-else>
                {{ checkShippingCostForm.pickingNo }}
                </div>
                </FormItem>
              </Col>
              <Col :span="6">
                <FormItem label="寄出补充说明:">
                  <div v-if="isEdit && isWaitProcess">
                    <Input 
                      type="textarea" 
                      v-model="checkShippingCostForm.consignmentRemark" 
                      :rows="2" 
                      :maxlength="200"
                      show-word-limit/>
                  </div>
                  <div v-else>
                  {{ checkShippingCostForm.consignmentRemark }}
                  </div>
                </FormItem>
              </Col>
              <Col :span="6">
              <FormItem label="收件供应商名称:" prop="supplierId">
                <div v-if="!(isEdit && isWaitProcess)">
                  {{ showText('supplierId', checkShippingCostForm.supplierId) }}
                </div>
                <div v-else>
                  <dyt-select 
                  v-model="checkShippingCostForm.supplierId" 
                  clearable 
                  placeholder="请选择"
                  :disabled="!(isEdit && isWaitProcess)">
                    <Option
                      v-for="(item,index) in supplierArr"
                      :value="item.supplierId"
                      :key="index">{{ item.supplierName }} 
                    </Option> 
                  </dyt-select>
                </div>
              </FormItem>
            </Col>
            <Col :span="12">
              <FormItem label="供应商收件信息:">
                <div v-if="isEdit && isWaitProcess">
                  <Input v-model="checkShippingCostForm.supplierReceiveInfo"/>
                </div>
                <div v-else>{{ checkShippingCostForm.supplierReceiveInfo }}</div>
                </FormItem>
            </Col>
            </Row>
          <div style="display: flex" class="mt20 mb10">
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
              <FormItem label="运费金额:" prop="freightAmount">
                <!-- <div v-if="isEdit && isWaitProcess && getPermission('supplierFreightCheck_import')">
                  <InputNumber v-model="checkShippingCostForm.freightAmount" :min="1" style="width:260px"/>
                </div> -->
                <div>{{ checkShippingCostForm.freightAmount }}</div>
              </FormItem>
            </Col>
            <Col :span="6">
              <FormItem label="运费承担方 和 退/抵形式:" :label-width="180" prop="freightBearInfo">
              <div v-if="!(isEdit && isWaitProcess)">
                {{  showText('freightBearInfo', checkShippingCostForm.freightBearInfo) }}
              </div>
              <div v-else>
                <dyt-select 
                v-model="checkShippingCostForm.freightBearInfo" 
                clearable 
                placeholder="请选择"
                :disabled="!(isEdit && isWaitProcess)" > 
                    <Option
                    v-for="(item,index) in freightCarrierMethodList"
                    :value="item.value"
                    :key="index"
                    :disabled="isDisabledOption && item.value === '累计月结抵扣'" >{{ item.label }} </Option > </dyt-select >
              </div>
              </FormItem>
            </Col>
            <Col :span="6">
              <FormItem label="记账月份:" prop="freightMonth">
                <!-- <div v-if="isEdit && isWaitProcess">
                  <DatePicker
                      transfer
                      type="month"
                      placeholder="选择月份"
                      style="width: 100%"
                      v-model="checkShippingCostForm.freightMonth"
                      format="yyyy-MM"
                      @on-change="(e) => {getDateValue(e,'freightMonth')}"
                    />
                </div> -->
                <div>{{ checkShippingCostForm.freightMonth }}</div>
              </FormItem>
            </Col>
            <Col :span="6">
              <FormItem label="处理备注:" prop="freightRemark">
                <div v-if="isEdit && isWaitProcess">
                  <Input v-model="checkShippingCostForm.freightRemark" type="textarea" :rows="2" :maxlength="200" show-word-limit/>
                </div>
                <div v-else>{{ checkShippingCostForm.freightRemark }}</div>
              </FormItem>
            </Col>
          </Row>
          <div style="display: flex" class="mt20 mb10" v-if="isShowFreightFollowUp">
              <div style="width: 4px; height: 20px; background: #2c74f6"></div>
              <span class="ml10" style="font-size:18px;font-weight:700">逐单 退/抵运费跟进</span>
          </div>
          <Row v-if="isShowFreightFollowUp">
            <Col :span="6">
              <FormItem label="退抵日期:">
                <div v-if="(isEdit && isWaitProcess)">
                  <DatePicker v-model="checkShippingCostForm.refundTime" 
                  type="date" 
                  @on-change="(e) => {getDateValue(e,'refundTime')}"
                  placeholder="选择日期" 
                  style="width: 270px">
                  </DatePicker>
                </div>
                <div v-else>
                {{ checkShippingCostForm.refundTime }}
                </div>
                </FormItem>
            </Col>
            <Col :span="6">
              <FormItem label="退抵金额:">
                <div v-if="(isEdit && isWaitProcess)">
                  <InputNumber v-model="checkShippingCostForm.refundAmount" :min="1" style="width:260px"/>
                </div>
                <div v-else>{{ checkShippingCostForm.refundAmount }}</div>
              </FormItem>
            </Col>
            <Col :span="6">
              <FormItem label="退/抵付款图片:">
                  <div  v-if="(isEdit && isWaitProcess)">
                <div class="form-pic-item">
                <Poptip trigger="hover" transfer placement="top">
                  <div class="pic-item-view" v-if="checkShippingCostForm.imageUrl">
                    <img :src="`./filenode/s${checkShippingCostForm.imageUrl}`" />
                    <div class="pic-view-cover" >
                      <div class="pic-view-btn">
                        <Icon title="删除" type="ios-trash-outline" @click.native="removeImg()" />
                      </div>
                    </div>
                  </div>
                  <div class="image-preview-content" slot="content">
                    <img style="width:350px" :src="`./filenode/s${checkShippingCostForm.imageUrl}`" />
                  </div>
                </Poptip>
                <Upload
                  v-if="!checkShippingCostForm.imageUrl"
                  ref="imgUploadRef"
                  name="files"
                  :show-upload-list="false"
                  :multiple="true"
                  accept="image/*"
                  :before-upload="imgFileUploadBefore"
                  :action="uploadFilesUrl"
                  :max-size="10240"
                  class="upload-item"
                >
                  <div class="upload-icon">
                    <Icon type="ios-camera" size="20"></Icon>
                  </div>
                </Upload>
              </div>
                </div>
                <div class="flexBox" v-else>
                    <div class="form-pic-item">
                    <div v-if="checkShippingCostForm.imageUrl">
                      <div class="pic-item-view">
                        <large-picture imageHigh="60px" :url="`./filenode/s${checkShippingCostForm.imageUrl}`" />
                      </div>
                      <!-- <div slot="content">
                        <img style="width:350px" :src="`./filenode/s${checkShippingCostForm.imageUrl}`" />
                      </div> -->
                    </div>
                    </div>
                    <Icon type="md-download" v-if="checkShippingCostForm.imageUrl" size="20" class="ml10" style="cursor:pointer;margin:auto" @click="downPic()"/>
                </div>
                </FormItem>
            </Col>
            <Col :span="6">
              <FormItem label="退抵说明:" prop="refundRemark">
                <div v-if="(isEdit && isWaitProcess)">
                  <Input v-model="checkShippingCostForm.refundRemark" type="textarea" :rows="2" :maxlength="200" show-word-limit/>
                </div>
                <div v-else>{{ checkShippingCostForm.refundRemark }}</div>
              </FormItem>
            </Col>
          </Row>
          <!-- 操作日志 -->
            <div>
              <div style="display: flex" class="mt20 mb10">
                <div style="width: 4px; height: 20px; background: #2c74f6"></div>
                <span class="ml10" style="font-size:18px;font-weight:700">操作日志</span>
                <Checkbox v-model="isShowRemark" class="ml20" style="margin-top:6px" @on-change="isShowOperationRemark">显示备注</Checkbox>
            </div>
            <Row>
            <Col :span="14">
            <div class="flexBox" v-if="getPermission('supplierFreightCheck_createdRemark')">
              <Input v-model="operationRemark" :rows="3" type="textarea" :maxlength="300" show-word-limit/>
              <Button type="primary" class="ml20" @click="addRemark">备注</Button>
            </div>
            </Col>
            <Col :span="24" class="mt20">
              <Table
                border
                :columns="orderLogColumns"
                :data="remarkDTOList"
                :loading="loading"
                max-height="450"
              ></Table>
            </Col>
            </Row>
            </div>
        </div>
    </Form>
    <Modal v-model="returnShow"
            title="确认退回"
            width="400"
            :loading="loading"
           >
            <Input 
            v-model="returnRemark" 
            placeholder="请输入退回原因"
            :maxlength="200" 
            type="textarea" 
            :rows="3" 
            show-word-limit/>
            <div slot="footer">
              <Button @click="returnShow = false">取消</Button>
              <Button type="primary" @click="confirmReturnApply">确定</Button>
            </div>
    </Modal>
    <Spin v-if="loading" fix></Spin>
    </div>
</template>
<script>
import api from "@/api/api";
import { time_now } from "@/utils/comfun.js";
import Mixin from "@/components/mixin/common_mixin";
import largePicture from "@/components/largePicture";

export default {
  mixins: [Mixin],
  components: {
    largePicture
  },
  props: {
    purchaserList: {
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
    },
    detaildsData: {
      type: Object,
      default: () => {
        return {}
      }
    },
    businessDeptUser: {
      type: Object,
      default: () => {
        return {}
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
        summitType: null //判断是否为创建时提交还是已存有数据提交,0  创建时提交，  1，已有数据时提交
      },
      ruleValidate: {
        purchaserId: [
          { required: true, message: '请输入' ,  trigger: 'change'}
        ],
        consignmentType: [
          { required: true, type: 'number', message: '请输入' ,  trigger: 'change'}
        ],
        freightBearInfo: [
          { required: true, message: '请输入' ,  trigger: 'change'}
        ],
        freightAmount: [
          { required: true, message: '需导入运费' , type: 'number' , trigger: 'change'}
        ],
        consignmentTime: [
          { required: true, message: '请选择日期' ,  trigger: 'change'}
        ],
        consignmentQuantity: [
          { required: true, type: 'number', message: '请输入' ,  trigger: 'change'}
        ],
        // logisticsNo: [
        //   { required: true, message: '请输入' ,  trigger: 'change'}
        // ],
        supplierId: [
          { required: true, message: '请选择' ,  trigger: 'change'}
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
      loading: false,
      uploadFilesUrl: api.upload_files + '?basePath=/product',
      operationRemark: null,
      remarkDTOList: [],
      oldRemarkDTOList: [],
      isShowRemark: true,
      orderLogColumns: [
        {
          key: "createdBy",
          title: "操作人", // 操作人
          width: 100,
          render:(h, params) =>{
            let createdName = ''
            this.purchaserList.forEach(item => {
              if(item.userId === params.row.createdBy){
                createdName = item.name
              }
            })
            createdName = this.$common.isEmpty(createdName) ? params.row.createdBy : createdName
            return h("span",{} ,createdName);
          },
        },
        {
          key: "remark",
          title: "操作内容描述", // 操作内容描述
          minWidth: 230,
          render(h, params) {
            return h("span", params.row.remark);
          },
        },
        {
          key: "createdTime",
          title: "操作时间", // 操作时间
          width: 160,
          align: "center",
          render: (h, params) => {
            return h(
              "div",
              {},
              params.row.createdTime
            );
          },
        },
      ],
      returnRemark: null,
      returnShow: false,
      businessDeptName: '',
    }
  },
  computed: { 
    userInfo () {
      return this.$store.state.userInfo;
    },
    userInfoName () {
      let resultUserInfoName = ''
      this.purchaserList.forEach(item => {
        if(item.userId === this.checkShippingCostForm.createdBy) {
          resultUserInfoName = item.name
        }
      })
      resultUserInfoName = this.$common.isEmpty(resultUserInfoName)  ?  this.checkShippingCostForm.createdBy : resultUserInfoName
      return resultUserInfoName;
    },
    // 获取当前登录账号可查看的事业部ID列表
    allowBusinessDeptIds () {
      return this.$store.getters['allowBusinessDeptIds'].join(',');
    },
    isEdit() {
      return this.detaildsData.type === 'edit'
    },
    isWaitProcess() {
      return this.checkShippingCostForm.status === 0
    },
    isWaitAudit() {
      return this.checkShippingCostForm.status === 1
    },
    isShowFreightFollowUp() {
      let flagMap = {
        '累计月结抵扣': false,
        '由公司承担': false,
        '到付寄出': false,
        '逐单现金退还': true,
        '其他': false
      }
      return flagMap[this.checkShippingCostForm.freightBearInfo]
    },
    isDisabledOption() {
      if (['款到发货', '阿里账期', '货到付款', '账期结算'].includes(this.checkShippingCostForm.settlementType)) return true
    }
  },
  watch: {
    'checkShippingCostForm.supplierId': {
      handler(newVal, oldVal){
        if(newVal && oldVal) {
          let supplierReceivingInfo = ''
          let settlementType = ''
          this.supplierArr.forEach(item => {
            supplierReceivingInfo =`${item.contactMan ? item.contactMan : '' }  ${item.telephone ? item.telephone : '' }  ${item.rAddress ? item.rAddress : '' }  ${item.rAddressDetail ? item.rAddressDetail : ''} `
            this.$set(item, 'supplierReceivingInfo', supplierReceivingInfo)
            if(item.supplierId === newVal) {
              this.settlementMethodArr.forEach(el => {
                if(el.dataValue == item.settlementType) {
                  settlementType = el.dataDesc
                }
              })
              this.checkShippingCostForm.supplierReceiveInfo = this.$common.isEmpty(item.supplierReceivingInfo.trim()) ? '--' : item.supplierReceivingInfo
              this.checkShippingCostForm.settlementType = settlementType
            }
          })
        }
      }
    },
    'checkShippingCostForm.purchaserId': {
      handler(newVal, oldVal){
        if(newVal) {
          let businessDeptName = ''
          for (let departmentId in this.businessDeptUser) {
            if (this.businessDeptUser[departmentId].includes(newVal)) {
              let businessDeptArr = this.$store.getters["businessDeptList"]
              businessDeptArr.forEach(item => {
                if(item.id == departmentId) {
                  console.log(item);
                  businessDeptName = item.name
                }
              })
            }
            this.businessDeptName = this.$common.isEmpty(businessDeptName) ? '' : businessDeptName
          }
        } else {
          this.businessDeptName =''
        }
      }  
    },
    detaildsData: {
      handler(newVal, oldVal) {
        if(newVal) {
          this.checkShippingCostForm = this.$common.copy(newVal.checkShippingCostForm)
          this.remarkDTOList = this.$common.copy(newVal.checkShippingCostForm.remarkDTOList)
          this.oldRemarkDTOList = this.$common.copy(newVal.checkShippingCostForm.remarkDTOList)
        }
      },
      deep: true,
      immediate: true
    }
  },
  created() {
    this.getSupplierList()
  },
  methods: {
    time_now,
    // 获取当前用户下可查看事业部所属供应商的结算方式
    getSupplierList() {
      this.axios.get(api.baseDataList + '?dataType=' + 'settlementType').then(res => {
        if (res.data.code == 0) {
          this.settlementMethodArr = res.data.datas;
        }
      })
    },
    getDateValue(val,type) {
      this.checkShippingCostForm[type] = val
    },
    saveOrSubmit(type) {
      this.loading = true
      let obj = this.$common.copy(this.checkShippingCostForm)
      if(type === 'submit') {
        this.axios.get(api.submit_freightCheck, obj).then(res => {
          if(res.data.code === 0) {
            this.$Message.success('操作成功')
            this.$emit('goBack', true)
          }
        }).finally(() => {
          this.loading = false
        })
      } else {
        this.axios.post(api.add_freightCheck, obj).then(res => {
          if(res.data.code === 0) {
            this.$Message.success('操作成功')
            this.$emit('goBack', true)
          }
        }).finally(() => {
          this.loading = false
        })
      }
    },
    //  上传付款图片
    imgFileUploadBefore (file) {
      if (!file.type.includes('image/')) {
        this.$Message.error('文件格式不对，请上传图片格式的文件');
        return false;
      }
      this.loading = true;
      let newForm = new FormData(); // 创建form对象
      newForm.append('files', file);
      const uploadUrl = `${this.uploadFilesUrl}&random=${(Math.random()).toString().substring(2, 5) + (new Date().getTime()).toString()}`;
      this.axios.post(uploadUrl, newForm).then(res => {
        if (!res || res.data.code != 0) return;
        this.checkShippingCostForm.imageUrl = res.data.datas[0]
      }).finally(() => {
        this.loading = false;
      })
      return false;
    },
    removeImg(){
      this.checkShippingCostForm.imageUrl = null
    },
    downPic() {
      window.open('./filenode/s' + this.checkShippingCostForm.imageUrl)
    },
    // 提交、保存、退回
    editPageBtn(type) {
      if(type === 'return') {
        this.returnShow = true
      } else {
        // 由于时间赋值导致原先赋值的时间会被强制转换格式，因此需要转化一下时间
        this.checkShippingCostForm.consignmentTime = this.$common.isEmpty(this.checkShippingCostForm.consignmentTime) 
          ? this.checkShippingCostForm.consignmentTime : this.formatTime(this.checkShippingCostForm.consignmentTime)
        this.checkShippingCostForm.refundTime = this.$common.isEmpty(this.checkShippingCostForm.refundTime) 
          ? this.checkShippingCostForm.refundTime : this.formatTime(this.checkShippingCostForm.refundTime)
        this.checkShippingCostForm.freightMonth = this.$common.isEmpty(this.checkShippingCostForm.freightMonth) 
          ? this.checkShippingCostForm.freightMonth : this.formatTime(this.checkShippingCostForm.freightMonth, 'month')
        this.$refs.checkShippingCostForm.validate((valid) => {
          if(valid || type == 'save') {
            let resultApi = type === 'submit' ? api.submit_freightCheck : api.save_freightCheck
            // 这里做多个判断如果运费承担方 和 退/抵形式为逐单现金退还 则退抵日期、退抵金额这两个字段为必填
            if(this.checkShippingCostForm.freightBearInfo === '逐单现金退还') {
              if(this.$common.isEmpty(this.checkShippingCostForm.refundTime) ||
              this.$common.isEmpty(this.checkShippingCostForm.refundAmount)) {
                this.$Message.error('请填写退抵日期与退抵金额')
                return;
              }
              // 当退抵金额小于运费金额时，退抵说明必填
              if(this.checkShippingCostForm.refundAmount < this.checkShippingCostForm.freightAmount && 
              this.$common.isEmpty(this.checkShippingCostForm.refundRemark)){
                return this.$Message.error('当退抵金额小于运费金额时，需填写退抵说明') 
              }
            }
            this.loading = true
            let obj = this.$common.copy(this.checkShippingCostForm)
            obj.summitType = type === 'submit' ? 1 : null
            this.axios.post(resultApi, obj).then(res => {
              if(res.data.code === 0) {
                this.$Message.success('操作成功')
                this.$emit('goBack', true)
              }
            }).finally(() => {
              this.loading = false
            })
          }
        })
      }
    },
    confirmReturnApply() {
      if(this.$common.isEmpty(this.returnRemark)) return this.$Message.error('请输入退回原因')
      this.loading = true
      let obj = {
        freightCheckId: this.checkShippingCostForm.freightCheckId,
        remark: this.returnRemark
      }
      this.axios.post(api.back_freightCheck, obj).then(res => {
        if(res.data.code === 0) {
          this.$Message.success('操作成功')
          this.$emit('goBack', true)
        }
      }).finally(() => {
        this.loading = false
        this.returnRemark = null
      })
    },
    // 添加备注
    addRemark() {
      if(this.$common.isEmpty(this.operationRemark) || this.$common.isEmpty(this.operationRemark.trim())) return this.$Message.error('备注为空无法添加')
      this.loading = true
      let obj = {
        remark: this.operationRemark,
        freightCheckNo: this.checkShippingCostForm.freightCheckNo
      }
      this.axios.post(api.add_freightCheckRemark, obj).then(res => {
        if(res.data.code === 0) {
          this.$Message.success('添加成功')
          let remark = {
            remark: ` 备注: ${this.operationRemark}`,
            createdBy: this.userInfo.userId,
            createdTime: this.time_now(),
            operateType: 0
          }
          this.isShowRemark ? this.remarkDTOList.unshift(remark) : null
          this.oldRemarkDTOList.unshift(remark)
          this.operationRemark = null
        }
      }).finally(() => {
        this.loading =false
      })
    },    
    // 是否显示备注
    isShowOperationRemark(val) {
      if(val) {
        this.remarkDTOList = this.$common.copy(this.oldRemarkDTOList)
      } else {
        this.remarkDTOList = this.oldRemarkDTOList.filter(item => item.operateType !== 0)
      }
    },
    // 格式化时间
    formatTime(time, type) {
      let pattern = /-/        
      let resultTime = ''
      if(!pattern.test(time) && !this.$common.isEmpty(time)){
        const date = new Date(time);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0')
        if (type === 'month') {
          resultTime = `${year}-${month}`;
        } else {
          resultTime = `${year}-${month}-${day}`;
        }
        return resultTime
      } else {
        return time
      }
    },
    showText(type, val) {
      let result = null
      // 采购人
      if(type == 'purchaserId' && val) {
        let list = this.$common.arrayToObj(this.purchaserList, "userId");
        result = list[val] ? list[val].name : ''
      }
      // 寄出类型
      if(type == 'consignmentType' && val) {
        let list = this.$common.arrayToObj(this.sendingTypeList, "value");
        result = list[val] ? list[val].label : ''
      }
      // 供应商id
      if(type == 'supplierId' && val) {
        let list = this.$common.arrayToObj(this.supplierArr, "supplierId");
        result = list[val] ? list[val].supplierName : ''
      }
      // 运费承担方 和 退/抵形式
      if(type == 'freightBearInfo' && val) {
        let list = this.$common.arrayToObj(this.freightCarrierMethodList, "value");
        result = list[val] ? list[val].label : ''
      }
      return result
    }
  }
}
</script>
<style lang="less">
    .form-pic-item{
        display: flex;
        justify-content: flex-start;
        flex-flow: wrap;
        .pic-item-view{
          position: relative;
          margin-right: 10px;
          width: 46px;
          height: 46px;
          >img {
            height: 100%;
            width: 100%;
          }
          .pic-view-cover{
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            &:hover{
              background: rgba(0, 0, 0, 0.5);
              .pic-view-btn{
                display: block;
              }
            }
            .pic-view-btn{
              display: none;
              position: absolute;
              top: 50%;
              width: 100%;
              transform: translate(0, -50%);
              font-size: 20px;
              color: #fff;
              text-align: center;
              >i{
                cursor: pointer;
              }
            }
          }
        }
        .upload-item{
          position: relative;
          display: inline-block;
          width: 46px;
          height: 46px;
          border: 1px solid #ccc;
          border-radius: 5px;
          cursor: pointer;
        }
        .upload-icon{
          width: 70px;
          height: 70px;
          i>{
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }
        }
      } 
</style>