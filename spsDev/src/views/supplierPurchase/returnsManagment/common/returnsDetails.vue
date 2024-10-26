<template>
    <div>
        <div style="display: flex">
            <div style="width: 4px; height: 20px; background: #2c74f6"></div>
            <span class="ml10" style="font-size:18px;font-weight:700">退货包裹信息</span>
        </div>
        <Divider />
        <Row>
            <Col span="5" :offset="1">
                退货单号：{{ returnsData.returnCode  || '-' }}
            </Col>
            <Col span="6">参考编号： {{ returnsData.supplierPackageNo  || '-' }}</Col>
            <Col span="6">平台主体： {{ returnsData.platform  || '-' }}</Col>
            <Col span="5">店铺： {{ returnsData.accountCode || '-' }}</Col>
        </Row>
        <Row style="margin-top: 20px">
            <Col span="5" :offset="1">退货原因： {{ returnsData.supplierReasonDesc || '-' }}</Col>
            <Col span="6" >退货物流商： {{ returnsData.logisticsTypeDesc || '-' }}</Col>
            <Col span="6">退货物流单号： {{ returnsData.expressDeLiverySn  || '-' }}</Col>
            <Col span="5">平台状态： {{ returnsData.packageStatusDesc || '-' }}</Col>
        </Row>
        <Row class="mt20">
            <Col span="5"  :offset="1">出库时间： {{ returnsData.outboundTime || '-' }}</Col>
            <Col span="6">SKU数量： {{ returnsData.skuQuantity || '-' }}</Col>
            <Col span="6">商品数量： {{ returnsData.returnSupplierQuantity  || '-' }}</Col>
        </Row>
        <Row class="mt20">
          <Col :span="24" style="margin-left: 40px"> 
            退货处理仓库:  {{ warehouseName }}
           </Col>
        </Row>
        <div style="display: flex;margin-top: 50px;">
            <div style="width: 4px; height: 20px; background: #2c74f6"></div>
            <span class="ml10" style="font-size:18px;font-weight:700">退货包裹明细</span>
        </div>
        <Divider />
        <div v-if="unProcessTableData.length">
          <Row>
            <Col :span="6">处理单号：未分配</Col>
            <Col :span="6">处理类型：</Col>
            <Col :span="6">处理状态：</Col>
            <Col :span="6">入库单：</Col>
          </Row>
          <Table
          class="mt20"
          :border="true"
          :columns="Columns"
          :height="300"
          :data="unProcessTableData"
          :loading="tableLoading">
          <template slot-scope="{ row }" slot="picture">
            <div class="form-pic-item">
                <div transfer trigger="hover" placement="right-start" v-for="(pic, pIndex) in row.checkPictureDetails" :key="`pic-${pIndex}`">
                  <div class="pic-item-view">
                    <largePicture 
                    :url="pic"
                    :picStyle="{
                      height: '60px',
                      width: '50px'
                    }"></largePicture>
                  </div>
                  <!-- <div slot="content">
                    <img style="width:200px" :src="`./filenode/s${pic}`" />
                  </div> -->
                </div>
                </div>
          </template>
          </Table> 
         </div>
        <div class="mt20" v-for="(item,index) in processedTableDataArr" :key="index">
        <Row>
          <Col :span="5">
            <div>
              处理单号: <span class="ml10" 
              style="color:#3300FF;text-decoration: underline;cursor:pointer"
              @click="viewHandleOrder(item[0])">{{ item[0].processCode }}</span>
            </div>
            <handleOrderModal :dialog-obj="handleOrderData"></handleOrderModal>
          </Col>
          <Col :span="5">
            <div style="display:flex">
              <div>处理类型: </div>
              <div 
                class="ml20"
                :style="{
                  background: processAllocationMap[item[0].processType]
                  ? processAllocationMap[item[0].processType].color : '#ffffff'
                  }"
                  style="
                    width: 70px;
                    color: white;
                    margin-right: 10px;
                    text-align: center;
                    line-height: 24px;
                    ">
                    <span> {{ processAllocationMap[item[0].processType]? processAllocationMap[item[0].processType].value : '' }}</span>
                    </div>
            </div>
          </Col>
          <Col :span="5">
            处理状态: {{ handleStatusMap[item[0].handleStatus] }}
          </Col>
          <Col :span="5">
            入库单: {{ item[0].receiptNo }}
          </Col>
          <Col :span="4">
            <Button type="error" class="fr" v-if="pagePermission.cancelProcessOrder 
            && item[0].handleStatus == 1 && returnsData.returnStatus !== 5" @click="cancelHandle(item[0].returnHandleId, index)">作废处理单</Button>
          </Col>
        </Row>
        <Table
          class="mt10"
          :border="true"
          :columns="Columns"
          :height="300"
          :data="processedTableDataArr[index]"
          :loading="tableLoading">
          <template slot-scope="{ row }" slot="picture">
            <div class="form-pic-item">
                <div transfer trigger="hover" placement="right-start" v-for="(pic, pIndex) in row.checkPictureDetails" :key="`pic-${pIndex}`">
                  <div class="pic-item-view">
                    <largePicture 
                    :url="pic"
                    :picStyle="{
                      height: '60px',
                      width: '50px'
                    }"></largePicture>
                  </div> 
                  <!-- <div slot="content">
                    <img style="width:200px" :src="`./filenode/s${pic}`" />
                  </div> -->
                </div>
                </div>
          </template>
          </Table> 
        </div>
    </div>
</template>
<script>
import Mixin from "@/components/mixin/common_mixin";
import handleOrderModal from "./handleOrderModal.vue";
import largePicture from "@/components/largePicture";
import api from "@/api/api";
export default {
  props: {
    returnsData: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  components: { handleOrderModal, largePicture },
  mixins: [Mixin],
  data() {
    return {
      Columns: [
        {
          key: "goodsInfo",
          title: "平台商品信息",
          align: "center",
          width: 260,
          render: (h, params) => {
            return h('div', {
              style: {
                display:'flex'
              }
            }, [
              h('div', { style: {} }, [
                this.tableImg(h, params, "thumbUrl")
              ]),
              h('div', { class: 'ml20' }, [
                h('div', {}, `平台SKU：${params.row.productSkuId || '-'}`),
                h('div', {}, `平台SPU：${params.row.productSpuId || '-'}`),
                h('div', {}, `属性集：${params.row.variationSpecifics || '-'}`)
              ])
            ]);
          }
        },
        {
          key: "skuExtCode",
          align: "center",
          title: "LAPA SKU",
          width: 150,
        },
        {
          key: "purchaseSubOrderSn",
          align: "center",
          title: "采购子单号",
          width: 180,
        },
        {
          key: "skuQuantity",
          align: "center",
          title: "件数",
          width: 90,
        },
        {
          key: "reasonDesc",
          align: "center",
          title: "商品退货原因",
          width: 300,
          render: (h, params) => {
            return [
              h('div', {}, params.row.reasonDesc),
              h('div', {}, params.row.platformQualityInspectionProblem)
            ]
          }
        }, 
        {
          key: "picture",
          align: "center",
          title: "平台质检图片",
          width: 320,
          slot: "picture"
        },
        {
          key: "matchSupplier",
          align: "center",
          title: "匹配供应商",
          render: (h, params) => {
            let supplierName = ''
            this.supplierList.forEach(item => {
              if(item.supplierId == params.row.supplierId) {
                supplierName = item.supplierName
              }
            })
            return h('div', {}, supplierName)
          }
        },
        {
          key: "receiptQuantity",
          align: "center",
          title: "收货件数",
          width: 90
        },
      ],
      tableHeight: this.getTableHeight(700),
      tableLoading: false,
      tableDataMap: {},
      supplierList: [],
      processAllocationMap: {
        0: { value: '' , color: ''},
        1: { value: '退供', color:'#996600' },
        2: { value: '质检入库', color:'#CC66CC' },
        3: { value: '维修入库', color:'#9900FF' },
        4: { value: '上架入库', color:'#009966' },
        5: { value: '销毁', color:'#FF6600' },
      },
      unProcessTableData: [], // 未处理分配商品数据
      processedTableDataArr: [],  // 已处理分配商品数据
      handleStatusMap: {
        1: '待收货',
        2: '处理中',
        3: '处理完结',
        4: '作废'
      },
      handleOrderData: {
        modelVisible: false,
        data: [],
        type: 'view',
        detailsData:{}
      }

    }
  },
  mounted(){
    this.getSupplierList()
    this.getList()
  },
  activated() {
    this.$emit('goBack', true)
  },
  computed: {
    pagePermission () {
      return {
        cancelProcessOrder: this.getPermission("fullManagedReturn_cancelRefundHandle"),
      }
    },
    warehouseName() {
      let result = ''
      this.returnsData.warehouseArr.forEach(item => {
        if(item.warehouseId === this.returnsData.warehouseId) {
          result = item.warehouseName
        }
      })
      return result
    }
  },
  methods: {
    // 获取供应商列表
    getSupplierList() {
      return new Promise((resolve) => {
        this.axios.get(api.supplierAll).then((res) => {
          this.supplierList = res.data.datas;
          resolve(res.data.datas || []);
        }).catch(() => {
          resolve([]);
        })
      })
    },
    getList() {
      this.tableLoading = true
      this.processedTableDataArr = []
      this.axios.get(`${api.get_temuDetailList}?returnId=${this.returnsData.returnId}&requestType=1`).then(res => {
        if(res.data.code === 0) {
          let productSkuIdList = res.data.datas.map(item => item.productSkuId)
          // productSkuIdList = [...new Set(productSkuIdList)]
          this.$set(this.returnsData, 'skuQuantity', productSkuIdList.length)
          res.data.datas.forEach(item => {
            let checkPictureDetails = this.$common.isEmpty(item.platformQualityInspectionUrl) 
            ? [] : item.platformQualityInspectionUrl.split(',')
            this.$set(item, 'checkPictureDetails', checkPictureDetails)
          })
          this.unProcessTableData = res.data.datas.filter(item => this.$common.isEmpty(item.processType))
          this.processedTableDataArr = res.data.datas.filter(item => !this.$common.isEmpty(item.processType))
          let processResultArr = this.processedTableDataArr.reduce((pre,next) => {
            let found = false 
            for(let i = 0; i< pre.length; i++) {
              if(pre[i][0].processCode === next.processCode) {
                pre[i].push(next)
                found = true
                break;
              }
            }
            if(!found) {
              pre.push([next])
            }
            return pre
          },[])
          this.processedTableDataArr = processResultArr
        }
      }).finally(() => {
        this.tableLoading = false
      })
    },
    // 作废处理单
    cancelHandle(id, index){
      this.$Modal.confirm({
        title: '操作提示',
        loading: true,
        content: `确认是否要作废处理单: <span style="color:#FFA600">${this.processedTableDataArr[index][0].processCode}</span>`,
        onOk: () => {
          this.tableLoading = true
          this.axios.get(`${api.cancel_refundHandle}?returnHandleId=${id}`).then(res => {
            if(res.data.code == 0) {
              this.$Message.success('作废成功')
              this.getList()
            }
          }).catch(() => {}).finally(() => {
            this.tableLoading = false
            this.$Modal.remove();
          })
        }
      })
    },
    // 作废退货单
    cancelReturn(){
      this.$Modal.confirm({
        title: '操作提示',
        loading: true,
        content: `确认是否要作废退货单: <span style="color:#FFA600">${this.returnsData.returnCode}</span>`,
        onOk: () => {
          this.tableLoading = true
          let obj = {
            spsReturn: {
              id: this.returnsData.returnId,
              returnStatus: 5,
              warehouseId: this.returnsData.warehouseId
            }
          }
          this.axios.post(api.update_Return,obj).then(res => {
            if(res.data.code === 0) {
              this.$Message.success('操作成功！')
              this.$emit('goBack', true)
            }
          }).finally(() => {
            this.tableLoading = false
            this.$Modal.remove();
          })
        }
      })
    },
    // 查看处理单
    viewHandleOrder(row) {
      this.tableLoading = true
      this.axios.get(`${api.view_refundHandle}?returnHandleId=${row.returnHandleId}`).then( res => {
        if(res.data.code == 0){
          this.handleOrderData.type = 'view'
          this.handleOrderData.detailsData = res.data.datas
          this.handleOrderData.data = res.data.datas.spsRefundHandleDetailInfoList
          this.handleOrderData.modelVisible = true
        }
      } ).finally( () => {
        this.tableLoading = false
      })
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