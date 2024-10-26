<template>
    <div>
        <Modal class="modal-main" v-model="dialogObj.modelVisible" :mask-closable="false" 
        :title="titleMap[dialogObj.type]" 
        :width="1000">
      <div class="content">
        <Form ref="formValidate" :model="formValidate" :label-width="90" :rules="ruleValidate" class="formStyle">
          <div class="fmb10">
            <Row>
              <Col span="12">
              <FormItem label="spu:" prop="spu">
                <div>
                    {{ formValidate.spu }}
                </div>
              </FormItem>
              </Col>
              <Col span="12">
              <FormItem label="供应商:" prop="supplierId">
                <div style="display: flex;">
                    {{ supplierMap[formValidate.supplierId] }}
                    <Checkbox v-model="formValidate.firstChoice" :disabled="isView" class="ml30">是否首选供应商</Checkbox>
                </div>
              </FormItem>
              </Col>
              <Col span="11">
              <FormItem label="skc:" prop="skcList">
                <dyt-select v-model="formValidate.skcList" 
                 :max-tag-count="1"
                 multiple
                 clearable placeholder="请选择"
                 :disabled="isView"
                 style="width:250px" > 
                 <Option
                 v-for="(item,index) in skcArr"
                 :value="item"
                 :key="index" >{{ item }} </Option > 
                </dyt-select >
              </FormItem>
              </Col>
              <Col span="13">
              <FormItem label="面辅料报价利润率:" prop="surfaceAccessoriesProfitRate" :label-width="130">
                {{ formValidate.surfaceAccessoriesProfitRate}}%
              </FormItem>
              </Col>
              <Col span="11">
              <FormItem label="是否寄样:" prop="sendSample">
                  <div>
                    {{ formValidate.sendSample ? '是' : '否' }}
                  </div>
              </FormItem>
              </Col>
              <Col span="13">
              <FormItem label="加工报价利润率:" prop="processProfitRate" :label-width="130">
                <div>
                    {{ formValidate.processProfitRate }}%
                </div>
              </FormItem>
              </Col>
              <Col span="12">
              <FormItem label="物流单号:" prop="sendSampleCode"  v-if="formValidate.sendSample == '1'">
                    <div>
                      {{ formValidate.sendSampleCode }}
                    </div>
              </FormItem>
              </Col>
              <Col span="12">
              <FormItem label="备注:">
                <div style="width:350px">
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
      </div>
      <div slot="footer">
        <div v-if="!isView">
        </div>
      </div>
    </Modal>
    <productionMaterials :bomData="bomData" :supplier-list="supplierList" />
    </div>
</template> 
<script>
import api from "@/api/api";
import Mixin from "@/components/mixin/common_mixin";
import productionMaterials from "./productionMaterials.vue";

export default {
  mixins: [Mixin],
  components:{ productionMaterials },
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
        skcList:[],
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
      skcTableData:[],
      ruleValidate:{
        spu: [
          { required:true, message:'请选择',  trigger:'change' }
        ],
        skcList: [
          { required:true, message:'请选择', type: 'array',  trigger:'submit' }
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
      tableHeight: this.getTableHeight(550),
      inquiryColumn:[
        {
          key: "spu",
          align: "center",
          title: "SPU", 
          maxWidth: 120
        },
        {
          key: "skc",
          align: "center",
          title: "SKC", 
          maxWidth: 120
        }, {
          title: '图片',
          key: 'path',
          width: 120,
          align: 'center',
          render: (h, params) => {
            return this.tableImg(h, params, 'path');
          }
        },
        {
          key: "color",
          align: "center",
          title: "颜色", 
          maxWidth: 80
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
          maxWidth: 100
        },
        {
          key: "productionMaterials",
          align: "center",
          title: "生产资料", 
          maxWidth: 100,
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
          maxWidth: 120,
          render: (h, params) => {
            return h('Input',{
              props:{
                type: 'textarea',
                maxlength: 200,
                value:this.formValidate.spsSupplierInquiryDetails[params.row._index].remark,
                disabled: this.isView
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
        workShopData:[], // 车间要求
        twiceCraftInfoData: [], // 二次工艺要求信息
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
          this.$refs['formValidate'].resetFields();
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
    'formValidate.skcList':{
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
              this.formValidate.skcList.pop()
            }
          });
          // skcList列表减少的情况
          const removedSkc = oldVal.filter(item => !newVal.includes(item));
          removedSkc.forEach(item => {
            this.formValidate.spsSupplierInquiryDetails = this.formValidate.spsSupplierInquiryDetails.filter(obj => obj.skc !== item);
          });
        }
      }
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
        val = val.replace('.', '$#$').replace(/\./g, '').replace('$#$', '.'); // 只允许输入小数点后两位
        val = val.replace(/^(-)*(\d+)\.(\d\d).*$/, '$1$2.$3'); // 限制只能输入小数点后两位
        val = val.replace(/^\./, '0.'); // 修复小数点开头的情况
        this.formValidate[type] = Number(val)
      }
    },
    getSkcTableData(skcArr, productId) {
      this.axios.post(api.query_productGoodsDetail, {
        skc: skcArr,
        productId: productId
      }).then( res => {
        if(res.data.code === 0){
          this.skcTableData = res.data.datas
          // 区分类型
          if(this.skcTableData.length !== 0 && this.dialogObj.type == 'add'){
            this.formValidate.machiningRate = this.skcTableData[0].machiningRate || null,
            this.formValidate.productId = this.skcTableData[0].productId || ''
          }
        }
      } ).finally(() => {
        this.loading = false;
      })
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
      this.bomData.sewingProcessingData =  data.productProcessVOList.map(item => {
        return {
          description:item.description, //项目名称
          price: item.price // 单价
        }
      })
      // 详情接口状态-车缝加工成本合计
      // 处理生产成本合计信息
      // 计算面辅料累计
      let skcSurfaceAmount = (data.productGoodsMaterialDetailVOList || []).reduce((pre,next) => {
        return pre + next.amount
      },0 )
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
          detail: `
            ${skcSurfaceAmount.toFixed(2)} * ${((this.formValidate.surfaceAccessoriesProfitRate +100)/ 100).toFixed(4)}
            + ${SewingAmount.toFixed(2)} * ${this.formValidate.machiningRate || 0}
            * ${((this.formValidate.processProfitRate + 100)/100).toFixed(4)} + 
            ${twiceCraftTotalAmount.toFixed(2)}`,
          totalPrice: data.quotationAmount.toFixed(2)
        }
      ]
      // 详情接口状态-尺码表信息
      this.bomData.sizeInfoData = data.productManufactureVOList.map(item => {
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
      })
      // 详情接口状态-处理裁剪要求信息等
      this.bomData.cuttingInfoData = (data.productTechnologyVOList || []).filter(item => item.technologyType === 0 );
      // 处理裁剪要求信息
      this.bomData.workShopData = (data.productTechnologyVOList || []).filter(item => item.technologyType === 1 );
      // 处理裁剪要求信息
      this.bomData.tailingAndPackagingData = (data.productTechnologyVOList || []).filter(item => item.technologyType === 2 );
      // 二次工艺要求信息
      this.bomData.twiceCraftInfoData = data.productSecondaryProcessBOS || [];
      this.$nextTick(() => {
        this.bomData.modelVisible = true;
      })
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
          this.formValidate.skcList = spsSupplierInquiryDetailList.map(item => item.skc)
        }
        this.getSkcTableData(this.skcArr, obj.productId)
      })
    },
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