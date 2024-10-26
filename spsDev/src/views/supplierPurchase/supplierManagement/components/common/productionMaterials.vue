<template>
    <div>
        <Modal
            v-model="bomData.modelVisible"
            title="BOM"
            :width="1400"
            :mask-closable="false"
            class="modal-main" 
            footer-hide
            >
            <div class="content">
                <div class="mt10" style="display:flex;justify-content: space-between;">
                   <div class="bomData-topLeft" style="display: flex;">
                        <div class="mr20 bomData-topLeft-front">SKC: {{ bomData.data.skc }}</div>
                        <div class="bomData-top-after">商品中文名称：{{ bomData.data.cnName }}</div>
                   </div> 
                   <div class="bomData-topRight" style="margin-top:5px">
                    <Button type="primary" @click="downLoadPattern" class="mr10">纸样下载</Button>
                    <Button type="primary" @click="exportBomData">BOM表导出</Button>
                   </div>
                </div>
                <div class="mt10">
                    <div class="titleStyle">面辅料信息</div>
                  <div class="table-box" style="display: flex;">
                    <Poptip trigger="hover" placement="right">
                      <div  style="height:300px;width:300px">
                        <img :src="this.$store.state.imgUrl+bomData.data.path || require('../../../../../assets/images/placeholder.jpg')" 
                        style="height:300px ;width: 300px;margin-right: 20px;">
                      </div>
                      <div slot="content">
                        <img :src="this.$store.state.imgUrl+bomData.data.path || require('../../../../../assets/images/placeholder.jpg')"
                        style="max-height: 400px"/>
                      </div>
                    </Poptip>
                    <div style="width: 100%;overflow: auto;">
                      <Table 
                        :columns="accessoriesColumns"
                        border
                        :height="300"
                        :data="accessoriesData"
                      />
                      <div style="padding: 8px 5px;background: #f5f5f5; text-align: right;">合计：{{ accessoriesSum }}</div>
                    </div>
                  </div>
                </div>
                <div class="mt20">
                    <div class="titleStyle">车缝加工信息</div>
                    <div class="table-box">
                    <Table 
                    :columns="sewingProcessingColumns"
                    border
                    :data="sewingProcessingData"
                    show-summary
                    ></Table>
                    </div>
                </div>
                <div class="mt20">
                  <div class="titleStyle">二次工艺信息</div>
                  <div class="table-box">
                    <Table 
                      :columns="twiceCraftColumns"
                      border
                      :data="twiceCraftTableData"
                    />
                    <div style="padding: 8px 5px;background: #f5f5f5; text-align: right;">合计：{{ twiceCraftTotalAmount }}</div>
                  </div>
                </div>
                <div class="mt20">
                    <div class="titleStyle">生产成本合计</div>
                    <div class="table-box">
                    <Table 
                    :columns="productionCostColumns"
                    border
                    :data="productionCostData"
                    ></Table>
                    </div>
                </div>
                <div class="mt20">
                    <div class="titleStyle">尺码表</div>
                    <div class="table-box">
                    <Table 
                    :columns="sizeInfoColumns"
                    border
                    :data="sizeInfoData"
                    ></Table>
                    </div>
                </div>
                <div class="mt20">
                    <div class="titleStyle">裁剪要求</div>
                    <div class="table-box">
                    <Table 
                    :columns="cuttingInfoColumns"
                    border
                    :data="cuttingInfoData"
                    ></Table>
                    </div>
                </div>
                <div class="mt20">
                    <div class="titleStyle">车间要求</div>
                    <div class="table-box">
                    <Table 
                    :columns="workShopColumns"
                    border
                    :data="workShopData"
                    ></Table>
                    </div>
                </div>
                <div class="mt20">
                    <div class="titleStyle">尾整及包装要求</div>
                    <div class="table-box">
                    <Table 
                    :columns="tailingAndPackagingColumns"
                    border
                    :data="tailingAndPackagingData"
                    ></Table>
                    </div>
                </div>
            </div>
        </Modal>
    </div>
</template>
<script>
import api from "@/api/api";
export default {
  props:{
    bomData: {
      type: Object,
      default () {
        return {
          modelVisible: false,
          data: {},
          accessoriesData:[], //面辅料信息
          sewingProcessingData:[], //车缝加工信息
          productionCostData:[], // 生产成本合计
          twiceCraftInfoData: [], // 二次工艺要求信息
          sizeInfoData:[], // 尺码信息
          cuttingInfoData:[], // 裁剪要求
          workShopData:[], // 车间要求
          tailingAndPackagingData:[] // 尾整及包装要求
        };
      }
    },
    // 供应商信息
    supplierList: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      // 二次工艺类型
      twiceCraftType: {
        '1': {label: '物料二次工艺', value: 1},
        '2': {label: '成衣二次工艺', value: 2},
        '3': {label: '裁片二次工艺', value: 3}
      },
      accessoriesColumns:[
        {
          key: "materialType",
          align: "center",
          title: "物料类型", 
          minWidth: 120,
          render: (h, params) => {
            let typeMap = {
              1:'面料',
              2:'辅料',
              3:'衬布',
              4:'包装材料'
            }
            return h('div',{},typeMap[params.row.materialType])
          }
        },
        {
          key: "materialName",
          align: "center",
          title: "物料名称", 
          minWidth: 140
        },
        {
          key: "productCode",
          align: "center",
          title: "供应商物料编码", 
          minWidth: 130
        },
        {
          key: "color",
          align: "center",
          title: "颜色", 
          minWidth: 90
        },
        {
          key: "materialSupplierDetailId",
          align: "center",
          title: "供应商", 
          minWidth: 150
        },
        {
          key: "materialSupplierDetailAddress",
          align: "center",
          title: "供应商地址", 
          minWidth: 140
        },
        {
          key: "telephone",
          align: "center",
          title: "联系方式", 
          minWidth: 140
        },
        {
          key: "breadth",
          align: "center",
          title: "幅宽(cm)", 
          minWidth: 90
        },
        {
          key: "weight",
          align: "center",
          title: "克重(g)", 
          minWidth: 90
        }, 
        {
          key: "unitMeasurement",
          align: "center",
          title: "计量单位", 
          minWidth: 100,
          render: (h, params) => {
            let typeMap = {
              1:'米',
              2:'码',
              3:'条',
              4:'件',
              5:'套',
              6:'个',
            }
            return h('div',{},typeMap[params.row.unitMeasurement])
          }
        }, 
        {
          key: "price",
          align: "center",
          title: "单价(元)", 
          minWidth: 100
        }, 
        {
          key: "netUnitUsage",
          align: "center",
          title: "净用量", 
          minWidth: 100
        }, 
        {
          key: "wastageRate",
          align: "center",
          title: "损耗率(%)", 
          minWidth: 100
        }, 
        {
          key: "amount",
          align: "center",
          title: "金额小计", 
          minWidth: 100
        }, 
      ],
      accessoriesData:[],
      sewingProcessingColumns:[
        {
          key: "description",
          align: "center",
          title: "项目名称", 
        },
        {
          key: "price",
          align: "center",
          title: "单价", 
        },
      ],
      sewingProcessingData:[],
      productionCostColumns:[
        {
          key: "totalType",
          align: "center",
          title: "合计类型", 
          maxWidth:100
        },
        {
          key: "calculationFormula",
          align: "center",
          title: "计算公式", 
        },
        {
          key: "detail",
          align: "center",
          title: "明细", 
          maxWidth:230
        },       
        {
          key: "totalPrice",
          align: "center",
          title: "总计价格", 
          maxWidth:150
        },    
      ],
      // 二次工艺列
      twiceCraftColumns: [
        {
          key: "secondaryProcessName",
          align: "center",
          title: "二次工艺名称",
          minWidth:120
        },
        {
          key: "secondaryProcessType",
          align: "center",
          title: "二次工艺类型",
          width:120,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.secondaryProcessType)) return h('span', '');
            const item = this.twiceCraftType[row.secondaryProcessType] || {};
            return h('span', item.label || '');
          }
        },
        {
          key: "supplierName",
          align: "center",
          title: "供应商",
          minWidth:120
        },
        {
          key: "supplierAddress",
          align: "center",
          title: "供应商地址",
          minWidth:120
        },
        {
          key: "supplierTelephone",
          align: "center",
          title: "联系方式",
          maxWidth:120
        },
        {
          key: "price",
          align: "center",
          title: "单价",
          maxWidth:120
        },
        {
          key: "unitNetUsage",
          align: "center",
          title: "单件用量(净用量)",
          width: 130
        },
        {
          key: "amount",
          align: "center",
          title: "金额小计",
          maxWidth:120
        },
      ],
      productionCostData:[],
      sizeInfoColumns:[
        {
          key: "cnName",
          align: "center",
          title: "部位", 
          maxWidth:120
        },
        {
          key: "measurementDescription",
          align: "center",
          title: "量法", 
          tooltip: true,
          minWidth:250
        },
        {
          key: "sampleSize",
          align: "center",
          title: "样衣尺码", 
          maxWidth:120
        },
        {
          key: "allowance",
          align: "center",
          title: "公差", 
          maxWidth:120
        },
        {
          key: "sizeHopping",
          align: "center",
          title: "跳码", 
          maxWidth:120
        }
      ],
      sizeInfoData:[],
      cuttingInfoColumns:[
        {
          key: "technologyName",
          align: "center",
          title: "工艺名称", 
          maxWidth: 160
        },
        {
          key: "description",
          align: "center",
          title: "工艺描述", 
        },
      ],
      cuttingInfoData:[],
      workShopColumns:[
        {
          key: "technologyName",
          align: "center",
          title: "工艺名称", 
          maxWidth: 160
        },
        {
          key: "description",
          align: "center",
          title: "工艺描述", 
        },
      ],
      workShopData:[],
      tailingAndPackagingColumns:[
        {
          key: "technologyName",
          align: "center",
          title: "工艺名称", 
          maxWidth: 160
        },
        {
          key: "description",
          align: "center",
          title: "工艺描述", 
        },
      ],
      tailingAndPackagingData:[]
    }
  },
  watch: {
    'bomData.modelVisible': {
      handler (newVal, oldVal) {
        if(newVal){
          this.accessoriesData = this.bomData.accessoriesData
          this.sewingProcessingData = this.bomData.sewingProcessingData
          this.productionCostData = this.bomData.productionCostData
          this.sizeInfoData = this.bomData.sizeInfoData
          this.cuttingInfoData = this.bomData.cuttingInfoData
          this.workShopData = this.bomData.workShopData
          this.tailingAndPackagingData = this.bomData.tailingAndPackagingData
          this.sizeInfoColumns = this.getSizeInfoColumns
        }
      },
      deep: true,
      immediate: true
    }
  },
  computed:{
    // 二次工艺要求列表数据
    twiceCraftTableData () {
      let supplierInfo = {};
      const twiceCraftData = this.bomData.twiceCraftInfoData.map(row => {
        supplierInfo = this.findSupplierInfo(row.supplierId);
        return {
          ...row,
          ...supplierInfo
        }
      })
      return twiceCraftData;
    },
    // 二次工艺要求总额
    twiceCraftTotalAmount () {
      let amount = null;
      const sum = this.twiceCraftTableData.reduce((prev, curr) => {
        amount = Number(curr.amount);
        if (this.$common.isEmpty(amount)) {
          return prev;
        } else {
          return prev + amount;
        }
      }, 0);
      return `${sum.toFixed(2)} 元`;
    },
    getSizeInfoColumns() {
      const sizeInfoObj = this.sizeInfoData[0]
      const columns = this.sizeInfoColumns.slice() // 创建副本以确保不影响原先的数组
      for (const key in sizeInfoObj) {
        const sizeInfoColumns = columns.map(item => item.key)
        if (!sizeInfoColumns.includes(key)) {
          columns.push({
            key: key,
            align: 'center',
            title: key
          })
        }
      }
      return columns
    },
    // 面辅料信息 金额合计
    accessoriesSum () {
      const amounts = this.accessoriesData.map(row => row.amount);
      const sum = amounts.reduce((prev, curr) => {
        const value = Number(curr);
        if (!isNaN(value)) {
          return prev + curr;
        } else {
          return prev;
        }
      }, 0);
      return `${sum.toFixed(2)} 元`;
    }
  },
  methods:{
    // 下载纸样
    downLoadPattern(){
      const { patternFile } = this.bomData.data
      if(this.$common.isEmpty(patternFile)){
        return this.$Message.error('暂无纸样文件')
      }
      let patternList = patternFile.split(',')
      patternList = patternList.map(item => {
        let result = item.substring( item.indexOf(":") + 1 )
        return this.$store.state.imgUrl + result
      })
      patternList.forEach(item => {
        // 因为前缀 ./filenode/s刚好为12个字符
        if(item.length !== 12){
          window.open(item,'_blank')
        }
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
          supplierAddress: '', // 供应商地址
          supplierTelephone: '' // 供应商电话
        }
      }
      return {
        supplierName: supplierInfo.supplierName, // 供应商名称
        supplierAddress: supplierInfo.address, // 供应商地址
        supplierTelephone: supplierInfo.telephone // 供应商电话
      }
    },
    exportBomData() {
      if(this.$common.isEmpty(this.bomData.data.inquiryDetailId)) return this.$Message.error('新增时无法导出')
      this.axios.post(api.export_Bom,this.bomData.data.inquiryDetailId).then(res => {
        if(res.data.code === 0) {
          window.open(this.$store.state.imgUrl + res.data.datas,'_blank')
        }
      })
    }
  }
}
</script>
<style lang="less" scoped>
.bomData-topLeft{
  border: 1px solid black;
  width: 580px;
  height: 40px;
  line-height: 38px;
  padding-left: 10px;
  .bomData-topLeft-front{
    width: 140px;
    margin-left: 10px;
    border-right: 1px solid black;
  }
}
.titleStyle{
  text-align: center;
  font-size: 18px;
  font-weight: 700;
}
</style>