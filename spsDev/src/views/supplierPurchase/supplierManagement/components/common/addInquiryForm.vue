<template>
    <div>
        <!-- <Modal class="modal-main" v-model="dialogObj.modelVisible" :mask-closable="false" 
        :title="titleMap[dialogObj.type]" 
        :width="1000"> -->
      <div class="content">
        <Form ref="formValidate" :model="formValidate" :label-width="90" :rules="ruleValidate" class="formStyle">
          <div class="fmb10">
            <Row>
              <Col span="6">
              <FormItem label="spu:" prop="spu" :label-width="130">
                <div style="display:flex" v-if="!isView">
                    <Input v-model="formValidate.spu" style="width:200px" :disabled="true" />
                    <Button type="primary" class="ml10" v-if="!isView" @click="chooseSpu">选择spu</Button>
                </div>
                <div v-else>
                  {{ formValidate.spu }}
                </div>
              </FormItem>
              </Col>
              <Col span="6">
              <FormItem label="skc:" prop="skcList" :label-width="130">
                <div>
                    <dyt-select v-model="skcList" 
                  :max-tag-count="1"
                  multiple
                  clearable placeholder="请选择skc"
                  :disabled="isView"
                  style="width:250px" > 
                  <Option
                  v-for="(item,index) in skcArr"
                  :value="item"
                  :key="index" >{{ item }} </Option > 
                  </dyt-select >
                </div>
              </FormItem>
              </Col>
              <Col span="12">
              <FormItem label="供应商:" prop="supplierId">
                <div v-if="!isView" style="display: flex;">
                    <Select v-model="formValidate.supplierId" style="width:300px" filterable :disabled="isView">
                        <Option v-for="item in supplierList" :value="item.supplierId" :key="item.supplierId">{{ item.supplierName }}</Option>
                    </Select>
                    <Checkbox v-model="formValidate.firstChoice" :disabled="isView" class="ml10">是否首选供应商</Checkbox>
                    <!-- <div v-if="!isView" style="display:flex;">
                    <Button type="error" v-if="dialogObj.type === 'againEdit'" class="mr10" @click="cancel">作废</Button>
                    <Button class="mr10" @click="goBackForm">取消</Button>
                    <Button type="primary"  v-if="dialogObj.type !== 'againEdit'" class="mr10" @click="handleSubmit('save')" :loading="loading">暂存</Button>
                    <Button type="primary"  v-if="dialogObj.type !== 'againEdit'" class="mr10" @click="handleSubmit('submit')" :loading="loading">提交</Button>
                    <Button type="primary"  v-if="dialogObj.type === 'againEdit'"  @click="handleSubmit('submit')" :loading="loading">再次提交</Button>
                </div> -->
                </div>
                <div v-else>
                  {{ supplierMap[formValidate.supplierId] }}
                  <span style="margin-left:100px">是否首选供应商: {{ formValidate.firstChoice ? '是' : '否' }}</span>
                </div>
              </FormItem>
              </Col>
              <Col span="6">
              <FormItem label="面辅料报价利润率:" prop="surfaceAccessoriesProfitRate" :label-width="130">
                <div v-if="!isView">
                  <Input-number v-model="formValidate.surfaceAccessoriesProfitRate" style="width:250px"   :min="0" class="hideBtn" 
                    :disabled="isView"
                    :formatter="profitFormater"
                    @on-change="(e) => {changeProfitInputVal(e,'surfaceAccessoriesProfitRate')}">
                    </Input-number>
                    %
                </div>
                <div v-else>
                  {{ formValidate.surfaceAccessoriesProfitRate}}%
                </div>
              </FormItem>
              </Col>
              <Col span="6">
              <FormItem label="加工报价利润率:" prop="processProfitRate" :label-width="130">
                   <div v-if="!isView">
                    <Input-number v-model="formValidate.processProfitRate" :min="0" class="hideBtn" 
                    :disabled="isView"
                    :formatter="profitFormater"
                    @on-change="(e) => {changeProfitInputVal(e,'processProfitRate')}"
                     style="width:250px">
                    </Input-number>
                    %
                   </div>
                    <div v-else>
                  {{ formValidate.processProfitRate }}%
                </div>
              </FormItem>
              </Col>
              <Col span="6">
              <FormItem label="是否寄样:" prop="sendSample">
                  <div v-if="!isView">
                    <Select v-model="formValidate.sendSample" style="width:300px" :disabled="isView">
                        <Option v-for="item in isMainSupplierArr" :value="item.value" :key="item.value">{{ item.label }}</Option>
                    </Select>
                  </div>
                  <div v-else>
                    {{ formValidate.sendSample ? '是' : '否' }}
                  </div>
              </FormItem>
              </Col>
              <Col span="6">
              <FormItem label="物流单号:" prop="sendSampleCode"  v-if="formValidate.sendSample == '1'">
                    <div v-if="!isView">
                      <Input v-model="formValidate.sendSampleCode" :maxlength="20"  style="width:250px" :disabled="isView"></Input>
                    </div>
                    <div v-else>
                      {{ formValidate.sendSampleCode }}
                    </div>
              </FormItem>
              </Col>
              <Col span="12">
              <FormItem label="备注:" :label-width="130">
                <div v-if="!isView">
                  <Input v-model="formValidate.remark" type="textarea" show-word-limit :maxlength="200" 
                    :autosize="{minRows: 3,maxRows: 5}"
                    :disabled="isView"  style="width:750px"></Input>
                </div>
                <div v-else>
                  {{ formValidate.remark }}
                </div>
              </FormItem>
              </Col>
            </Row>
            <Spin v-if="loading" fix>
            </Spin>
          </div>

          <div class="fmb16">
            <Table ref="inquiryFormTable"
            :border="true"
            :loading="tableLoading"
            :height="tableHeight"
            :columns="inquiryColumn"
            :data="formValidate.spsSupplierInquiryDetails"
            class="tableStyle"
            :key="Math.random()"
            >
            <template slot-scope="{ row }" slot="minimumOrderQuantity">
                <FormItem
                :label-width="0"
                :prop="`spsSupplierInquiryDetails.${row._index}.minimumOrderQuantity`"
                :rules="{ required: true, type: 'number', message: '请输入', trigger: 'change' }">
                    <Input-number :min="1" :formatter="formatter"
                    :disabled="isView"
                    v-model="formValidate.spsSupplierInquiryDetails[row._index].minimumOrderQuantity"
                    :value="formValidate.spsSupplierInquiryDetails[row._index].minimumOrderQuantity"
                    class="hideBtn"
                    @on-change="(e) => { changeInputVal(e,row,'minimumOrderQuantity')}"
                    >
                    </Input-number>
                </FormItem>
              </template>
              <template slot-scope="{ row }" slot="requiredDeliveryDate">
                <FormItem
                :label-width="0"
                :prop="`spsSupplierInquiryDetails.${row._index}.requiredDeliveryDate`"
                :rules="{ required: true, type: 'number', message: '请输入', trigger: 'change' }">
                <Input-number :min="1" :formatter="formatter" 
                :disabled="isView"
                 v-model="formValidate.spsSupplierInquiryDetails[row._index].requiredDeliveryDate"
                 :value="formValidate.spsSupplierInquiryDetails[row._index].requiredDeliveryDate"
                 class="hideBtn"
                 @on-change="(e) => { changeInputVal(e,row,'requiredDeliveryDate')}"
                ></Input-number>
                </FormItem>
              </template>       
            </Table>
          </div>
        </Form>
        <div class="mt10 mb10" style="font-size:18px" v-if="dialogObj.type == 'againEdit' || formValidate.status == 2">
         <span style="font-weight:700">{{ supplierMap[formValidate.supplierId] }}-拒绝报价,</span>
         <span class="ml10">拒绝原因: {{ formValidate.reason }}</span>
         <span class="ml30" style="font-size:14px">{{ formValidate.quotationCompletionTime }}</span>
        </div>
      </div>
    <!-- </Modal> -->
    <productionMaterials :bomData="bomData" :supplier-list="supplierList" />
    <div v-if="isShowAddPro">
      <Modal
        v-model="isShowAddPro"
        :width="1100"
        title="添加商品"
        :styles="{ top: '50px' }"
        :mask-closable="false"
        class="addProductModal1 headerBar addProductBar"
      >
        <addProduct
          :onlyChoseOne="true"
          :from="true"
          @addProductSuccess="addProductSuccess"
          @addProductCancel="addProductCancel"
          :type="'spu'"
        ></addProduct>
      </Modal>
    </div>
    </div>
</template> 
<script>
import api from "@/api/api";
import Mixin from "@/components/mixin/common_mixin";
import addProduct from "@/components/common/addProduct";
import productionMaterials from "./productionMaterials.vue";

export default {
  mixins: [Mixin],
  components:{ productionMaterials, addProduct },
  props: {
    dialogObj: {
      type: Object,
      default () {
        return {
          modelVisible: false,
          data: {},
          type: 'add'
        };
      }
    }
  },
  data() {
    return {
      formValidate:{
        spu:null,
        supplierId:'',
        firstChoice:false,
        surfaceAccessoriesProfitRate:null,
        sendSample:null,
        processProfitRate:null,
        sendSampleCode:null,
        remark:'',
        spsSupplierInquiryDetails:[],
        productId:null,
        machiningRate:null
      },
      skcList:[],
      skcTableData:[],
      ruleValidate:{
        spu: [
          { required:true, message:'请选择',  trigger:'change' }
        ],
        supplierId: [
          { required:true, message:'请选择',  trigger:'change' }
        ],
        sendSample: [
          { required:true, message:'请选择', type:"number", trigger:'change' }
        ],
        surfaceAccessoriesProfitRate: [
          { required:true, message:'请输入', type:"number", trigger:'change' }
        ],
        processProfitRate: [
          { required:true, message:'请输入', type:"number", trigger:'change' }
        ],
        sendSampleCode: [
          { required:true, message:'请输入', trigger:'change' }
        ]
      },
      titleMap:{
        'add': "新建询价",
        'edit': '编辑询价',
        'againEdit': '二次询价',
        'view': '询价单'
      },
      loading:false,
      spuList:[],
      supplierArr:[],
      skcArr:[],
      supplierList:[],
      supplierMap:{},
      isMainSupplierArr:[
        { label:'否', value: 0 },
        { label:'是', value: 1 },
      ],
      tableLoading:false,
      tableHeight: this.getTableHeight(480),
      inquiryColumn:[
        {
          key: "spu",
          align: "center",
          title: "SPU", 
          maxWidth: 160
        },
        {
          key: "skc",
          align: "center",
          title: "SKC", 
          maxWidth: 160
        }, {
          title: '图片',
          key: 'path',
          width: 180,
          align: 'center',
          render: (h, params) => {
            return this.tableImg(h, params, 'path');
          }
        },
        {
          key: "color",
          align: "center",
          title: "颜色", 
          maxWidth: 120
        }, 
        {
          key: "minimumOrderQuantity",
          align: "center",
          title: "最少起订量",
          slot: 'minimumOrderQuantity'
        },
        {
          key: "requiredDeliveryDate",
          align: "center",
          title: "要求交期（天）",
          slot: 'requiredDeliveryDate'
        },
        {
          key: "quotationAmount",
          align: "center",
          title: "报价金额", 
          maxWidth: 130
        },
        {
          key: "productionMaterials",
          align: "center",
          title: "生产资料", 
          maxWidth: 120,
          render: (h, params) => {
            return h('span',{
              style:{
                color:'#2DABF6',
                cursor: 'pointer'
              },
              on:{
                click: () => {
                  this.viewBom(params.row)
                }
              }
            },'BOM')
          }
        },
        {
          key: "remark",
          align: "center",
          title: "备注", 
          render: (h, params) => {
            return h('Input',{
              props:{
                type: 'textarea',
                maxlength: 200,
                value:this.formValidate.spsSupplierInquiryDetails[params.row._index].remark,
                disabled: this.isView,
                rows: 3,
              },
              on:{
                input: (value) => {
                  this.$set(this.formValidate.spsSupplierInquiryDetails[params.row._index], 'remark', value)
                }
              }
            })
          }
        },
      ],
      bomData:{
        modelVisible: false,
        data:{},
        accessoriesData:[], //面辅料信息
        sewingProcessingData:[], //车缝加工信息
        productionCostData:[], // 生产成本合计
        sizeInfoData:[], // 尺码信息
        cuttingInfoData:[], // 裁剪要求
        twiceCraftInfoData: [], // 二次工艺要求信息
        workShopData:[], // 车间要求
        tailingAndPackagingData:[] // 尾整及包装要求
      },
      filenodeViewTargetUrl: this.$store.state.imgUrl,
      isShowAddPro:false
    }
  },
  created() {
    this.getSupplierList();
  },
  watch: {
    'dialogObj.modelVisible': {
      handler (newVal, oldVal) {
        this.formValidate.spu = null
        if(newVal && this.dialogObj.type == 'add'){
          this.formValidate.spsSupplierInquiryDetails = []
          this.skcArr = []
          this.formValidate.remark = ''
        } else if( newVal ){
          const { spsSupplierInquiry, spsSupplierInquiryDetailList } = this.dialogObj.data
          this.formValidate = spsSupplierInquiry
          this.formValidate.spsSupplierInquiryDetails = spsSupplierInquiryDetailList
          this.getSkcData(spsSupplierInquiry)
        }
      },
      deep: true,
      immediate: true
    },
    'formValidate.surfaceAccessoriesProfitRate': {
      handler(newVal, oldVal) {
        if (JSON.stringify(newVal) == JSON.stringify(oldVal)) return;
        this.formValidate.spsSupplierInquiryDetails.forEach(item => {
          const quotationAmount = this.tableRowAmount(item);
          this.$set(item,'quotationAmount',Number(quotationAmount.toFixed(2)));
        })
      }
    },
    'formValidate.processProfitRate': {
      handler(newVal, oldVal) {
        if (JSON.stringify(newVal) == JSON.stringify(oldVal)) return;
        this.formValidate.spsSupplierInquiryDetails.forEach(item => {
          const quotationAmount = this.tableRowAmount(item);
          this.$set(item,'quotationAmount',Number(quotationAmount.toFixed(2)));
        })
      }
    },
    skcList: {
      handler(newVal, oldVal){
        if(newVal && oldVal !== null) {
          // skcList列表增加的情况
          oldVal = oldVal || []
          const addSkc = newVal.filter(item => !oldVal.includes(item));
          addSkc.forEach(item => {
            const obj = this.skcTableData.find(obj => obj.skc === item);
            if (obj) {
              const quotationAmount = this.tableRowAmount(obj);
              obj.quotationAmount = Number(quotationAmount.toFixed(2));
              obj.minimumOrderQuantity = 1;
              obj.requiredDeliveryDate = 1;
              this.formValidate.spsSupplierInquiryDetails.push(obj);
            } else {
              this.$Message.error('无法勾选该skc')
              this.skcList.pop()
            }
          });
          // skcList列表减少的情况
          const removedSkc = oldVal.filter(item => !newVal.includes(item));
          removedSkc.forEach(item => {
            this.formValidate.spsSupplierInquiryDetails = this.formValidate.spsSupplierInquiryDetails.filter(obj => obj.skc !== item);
          });
        }
      },
    }
  },
  computed:{
    isView() {
      return this.dialogObj.type === 'view'
    },
  },
  methods:{
    // 获取供应商数据
    getSupplierList() {
      this.axios.get(api.supplierAll).then((res) => {
        this.supplierList = res.data.datas;
        this.supplierList.forEach(item => {
          this.$set(this.supplierMap, item.supplierId, item.supplierName)
        })
      });
    },
    // 计算报价金额
    tableRowAmount (tableRow) {
      // 计算报价金额
      let skcSurfaceAmount = (tableRow.productGoodsMaterialDetailVOList || []).reduce((pre,next) => {
        return pre + next.amount;
      },0);
      skcSurfaceAmount = skcSurfaceAmount * ((this.formValidate.surfaceAccessoriesProfitRate / 100) + 1);
      // 车缝加工合计
      let sewingAmount = (tableRow.productProcessVOList || []).reduce( (pre,next)=> {
        return pre + next.price
      },0);
      sewingAmount = sewingAmount * this.formValidate.machiningRate* ((this.formValidate.processProfitRate / 100) + 1);
      // 二次工艺金额
      const twiceCraftTotalAmount = (tableRow.productSecondaryProcessBOS || []).reduce((prev, curr) => {
        if (this.$common.isEmpty(Number(curr.amount))) {
          return prev;
        } else {
          return prev + Number(curr.amount);
        }
      }, 0);
      const quotationAmount =  skcSurfaceAmount + sewingAmount + twiceCraftTotalAmount;
      return quotationAmount;
    },
    // 提交
    handleSubmit(type){
      // 处理spsSupplierInquiryDetails参数
      let targetApi = api.save_supplierInquiry
      let patternFile = ''
      let spsSupplierInquiryDetails = this.formValidate.spsSupplierInquiryDetails.map(item => {
        patternFile = item.patternFile ? item.patternFile : this.dialogObj.data.patternFile
        return {
          productName: item.cnName ?  item.cnName : item.productName,
          spu: item.spu,
          skc: item.skc,
          path: item.path,
          color: item.color,
          minimumOrderQuantity: item.minimumOrderQuantity ? item.minimumOrderQuantity : 1,
          requiredDeliveryDate: item.requiredDeliveryDate ? item.requiredDeliveryDate : 1,
          quotationAmount: item.quotationAmount, //待计算
          remark: item.remark,
          productProcessVOList: item.productProcessVOList,
          productManufactureVOList: item.productManufactureVOList,
          productGoodsMaterialDetailVOList: item.productGoodsMaterialDetailVOList,
          productTechnologyVOList: item.productTechnologyVOList,
          productSecondaryProcessBOS: (item.productSecondaryProcessBOS || []).map(row => {
            return {
              ...row,
              ...this.findSupplierInfo(row.supplierId)
            }
          }),
          inquiryDetailId: item.inquiryDetailId ? item.inquiryDetailId :  null
        }
      })
      let obj = {
        spu: this.formValidate.spu,
        productId: this.formValidate.productId,
        machiningRate	: this.formValidate.machiningRate,
        sendSample: this.formValidate.sendSample,
        supplierId: this.formValidate.supplierId,
        firstChoice: this.formValidate.firstChoice ? 1 : 0,
        surfaceAccessoriesProfitRate : this.formValidate.surfaceAccessoriesProfitRate,
        processProfitRate: this.formValidate.processProfitRate,
        remark: this.formValidate.remark,
        status: type  == 'save' ? 0 : 1,
        oldStatus: this.formValidate.status,  // 用于区分状态
        spsSupplierInquiryDetails: spsSupplierInquiryDetails,
        sendSampleCode: this.formValidate.sendSampleCode,
        patternFile: patternFile,
      }
      if(this.dialogObj.type !== 'add'){
        targetApi = api.update_supplierInquiry
        obj.inquiryId = this.formValidate.inquiryId
        obj.inquiryCode= this.formValidate.inquiryCode
      }
      this.$refs['formValidate'].validate((valid) => {
        if (valid) {
          if(this.formValidate.surfaceAccessoriesProfitRate == 0 || this.formValidate.processProfitRate == 0) return this.$Message.error('利润率不可为0')
          if(this.formValidate.spsSupplierInquiryDetails.length === 0) return this.$Message.error('缺少数据~')
          this.loading = true
          this.axios.post(targetApi, obj).then( res => {
            if( res.data.code === 0){
              this.$Message.success(`${this.dialogObj.type == 'add' ? '新增成功' : '操作成功'}`)
              this.$emit('completeTask', true)
            }
          }).finally( () => {
            this.loading = false
            this.dialogObj.modelVisible = false
            this.$emit('goBackForm',true)
          })
        }
      })
    },
    // 输入框输入值限制10位
    changeInputVal(value,obj,type){
      if (value && value.toString().length > 10) {
        value = value.toString().slice(0, 10);
        this.$set(this.formValidate.spsSupplierInquiryDetails[obj._index],type,Number(value))
      }
    },
    // 格式化输入框限制10位数显示
    formatter(value) {
      value = `${parseInt(value)}`; // 转为整数字符串
      if (value.length > 10) {
        value = value.slice(0, 10); // 限制显示位数为10位
      }
      return parseInt(value);
    },
    // 格式化利润率显示
    profitFormater(value){
      value = value.toString()
      value = value.replace(/[^\d.]/g, ''); // 只允许输入数字和小数点
      value = value.replace(/^\./g, ''); // 修复首位不能为小数点的情况
      value = value.replace(/\.{2,}/g, '.'); // 修复多个连续小数点的情况
      value = value.replace('.', '$#$').replace(/\./g, '').replace('$#$', '.'); // 只允许输入小数点后两位
      value = value.replace(/^(-)*(\d+)\.(\d\d).*$/, '$1$2.$3'); // 限制只能输入小数点后两位
      value = Number(value)
      return `${value}`
    },
    // 格式化利润率数值最少为0且输入不得超过2位小数
    changeProfitInputVal(val,type){
      if(val){
        val = val.toString()
        val = val.replace(/[^\d.]/g, ''); // 只允许输入数字和小数点
        val = val.replace(/^\./g, ''); // 修复首位不能为小数点的情况
        val = val.replace(/\.{2,}/g, '.'); // 修复多个连续小数点的情况
        // val = val.replace('.', '$#$').replace(/\./g, '').replace('$#$', '.'); // 只允许输入小数点后两位
        val = val.replace(/^(-)*(\d+)\.(\d\d).*$/, '$1$2.$3'); // 限制只能输入小数点后两位
        val = val.replace(/^\./, '0.'); // 修复小数点开头的情况
        val = Number(val)
        this.formValidate[type] = val
      }
    },
    // 添加商品成功回调
    addProductSuccess(data){
      // 处理skc列表
      this.skcList = []
      this.spuList = []
      let skcArr = data[0].skc ? data[0].skc.split(',') : []
      skcArr = [... new Set(skcArr)]
      this.skcArr = skcArr
      // 处理spu列表
      this.formValidate.spu = data[0].spu
      // 处理table列表
      this.getSkcTableData(skcArr, data[0].productId)
      this.isShowAddPro = false;
    },
    getSkcTableData(skcArr, productId) {
      this.axios.post(api.query_productGoodsDetail, {
        skc: skcArr,
        productId: productId
      }).then( res => {
        if(res.data.code === 0){
          this.skcTableData = res.data.datas
          // 区分类型
          if(this.skcTableData.length !== 0){
            this.formValidate.machiningRate = this.skcTableData[0].machiningRate || null,
            this.formValidate.productId = this.skcTableData[0].productId || ''
          }
        }
      } ).finally(() => {
        this.loading = false;
      })
    },
    // 取消添加商品回调
    addProductCancel(data){},
    // 打开添加商品对话框
    chooseSpu(){
      this.formValidate.spu = null
      this.isShowAddPro = true
    },
    // 查看Bom
    viewBom(data) {
      // 处理Bom所需数据
      this.bomData.data = {
        path: data.path,
        patternFile: data.patternFile,
        skc: data.skc,
        cnName: data.cnName ? data.cnName : data.productName,
        inquiryDetailId: data.inquiryDetailId
      }
      // 详情接口状态-面辅料信息
      this.bomData.accessoriesData = data.productGoodsMaterialDetailVOList ? data.productGoodsMaterialDetailVOList.map(item => {
        const curSupplier = this.supplierList.filter( obj => obj.supplierId == item.supplierId)
        return {
          ...item,
          materialSupplierDetailId: curSupplier[0] ? curSupplier[0].supplierName : '', // 供应商ID
          materialSupplierDetailAddress: curSupplier[0] ? curSupplier[0].address : '', //供应商地址
          telephone: curSupplier[0] ? curSupplier[0].telephone : '', //联系方式
        }
      }) : []
      // 详情接口状态-车缝加工信息
      this.bomData.sewingProcessingData =  data.productProcessVOList ? data.productProcessVOList.map(item => {
        return {
          description:item.description, //项目名称
          price: item.price // 单价
        }
      }) : []
      // 详情接口状态-车缝加工成本合计
      // 处理生产成本合计信息
      // 计算面辅料累计
      let skcSurfaceAmount = (data.productGoodsMaterialDetailVOList || []).reduce((pre,next) => {
        return pre + next.amount
      },0 );
      let SewingAmount = (data.productProcessVOList || []).reduce( (pre,next)=> {
        return pre + next.price
      },0 );
      // 二次工艺金额
      const twiceCraftTotalAmount = (data.productSecondaryProcessBOS || []).reduce((prev, curr) => {
        if (this.$common.isEmpty(Number(curr.amount))) {
          return prev;
        } else {
          return prev + Number(curr.amount);
        }
      }, 0);
      this.bomData.productionCostData = [
        {
          totalType: '生产成本',
          calculationFormula: '面辅料累计+车缝加工累计',
          detail: `${skcSurfaceAmount.toFixed(2)} + ${SewingAmount.toFixed(2)}`,
          totalPrice: (skcSurfaceAmount+SewingAmount).toFixed(2)
        },
        {
          totalType: '报价价格',
          calculationFormula: '面辅料累计*(1+面辅料报价利润率)+车缝加工累计*加工倍率*(1+加工报价利润率) + 二次工艺累计',
          detail: `${skcSurfaceAmount.toFixed(2)} * 
          ${((this.formValidate.surfaceAccessoriesProfitRate / 100) + 1 ).toFixed(4)} + 
          ${SewingAmount.toFixed(2)} * ${this.formValidate.machiningRate || 0}
            * ${((this.formValidate.processProfitRate / 100) + 1 ).toFixed(4)} +
            ${twiceCraftTotalAmount.toFixed(2)}`,
          totalPrice: data.quotationAmount.toFixed(2)
        }
      ]
      // 详情接口状态-尺码表信息
      this.bomData.sizeInfoData = data.productManufactureVOList ? data.productManufactureVOList.map(item => {
        let sizeMap = {}
        if(item.sizeText){
          let sizeArr = item.sizeText.split(',')
          let temp = []
          sizeArr.forEach(item => {
            if(item.includes(':')){
              temp = item.split(":")
              this.$set(sizeMap, temp[0], temp[1])
            }
          })
        }
        let resultObj = {
          cnName: item.cnName,
          measurementDescription: item.measurementDescription,
          sampleSize: item.sampleSize,
          allowance: item.allowance,
          sizeHopping: item.sizeHopping,
        }
        resultObj = Object.assign({}, sizeMap, resultObj)
        return resultObj
      }) : []
      // 详情接口状态-处理裁剪要求信息等
      this.bomData.cuttingInfoData = (data.productTechnologyVOList || []).filter(item => item.technologyType === 0 );
      // 处理裁剪要求信息
      this.bomData.workShopData =  (data.productTechnologyVOList || []).filter(item => item.technologyType === 1 );
      // 处理裁剪要求信息
      this.bomData.tailingAndPackagingData =  (data.productTechnologyVOList || []).filter(item => item.technologyType === 2 );
      // 二次工艺要求信息
      this.bomData.twiceCraftInfoData = data.productSecondaryProcessBOS || [];
      this.$nextTick(() => {
        this.bomData.modelVisible = true;
      })
    },
    // 查找供应商信息
    findSupplierInfo (supplierId) {
      const supplierInfo = this.supplierList.find(fin => {
        return supplierId == fin.supplierId
      });
      if (this.$common.isEmpty(supplierInfo)) {
        return {
          supplierName: '', // 供应商名称
          address: '', // 供应商地址
          telephone: '' // 供应商电话
        }
      }
      return {
        supplierName: supplierInfo.supplierName, // 供应商名称
        address: supplierInfo.address, // 供应商地址
        telephone: supplierInfo.telephone // 供应商电话
      }
    },
    getSkcData(obj){
      this.loading = true
      this.axios.post(api.categoryGoodsList,{
        isSpu: 1,
        spu:obj.spu,
        pageNum:1,
        pageSize: 10
      }).then(res => {
        // 对skc进行处理
        if(res.data.code == 0) {
          let skcArr = this.$common.isEmpty(res.data.datas.list) ? [] : res.data.datas.list[0].skc.split(',');
          skcArr = [... new Set(skcArr)]
          this.skcArr = skcArr
          const { spsSupplierInquiryDetailList } = this.dialogObj.data
          spsSupplierInquiryDetailList.forEach((item,index) => {
            this.skcList.push(item.skc)
          })
        }
        this.getSkcTableData(this.skcArr, obj.productId)
      })
    },
    // 作废询价单
    // cancel(){
    //   this.axios.post(api.update_supplierInquiryStatus, {
    //     inquiryId: this.formValidate.inquiryId,
    //     inquiryCode: this.formValidate.inquiryCode,
    //     status: 4
    //   }).then( res => {
    //     if(res.data.code === 0){
    //       this.$Message.success('操作成功')
    //       this.getList()
    //     }
    //   }).finally(() => {
    //     this.dialogObj.modelVisible = false
    //     this.$emit('goBackForm',true)
    //   })
    // },
    goBackForm() {
      this.$emit('goBackForm', true)
    }
  }
}
</script>
<style lang="less">
.hideBtn {
    margin-top:5px;
    .ivu-input-number-handler-wrap{
        display: none;
    }
}
.tableStyle {
    .ivu-form-item-error-tip{
        display: none;
    }
}
.formStyle {
  .ivu-form-item-error-tip{
        display: none;
    } 
}

</style>