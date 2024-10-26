<template>
    <div>
        <div style="display: flex">
            <div style="width: 4px; height: 20px; background: #2c74f6"></div>
            <span class="ml10" style="font-size:18px;font-weight:700">基本信息</span>
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
            <div v-if="returnsData.type === 'check'">
              退货处理仓库: 
              <dyt-select v-model="warehouseId" style="width: 300px" clearable>
              <Option
                v-for="item in returnsData.warehouseArr"
                :value="item.warehouseId"
                :key="item.warehouseIdindex"
              >{{ item.warehouseName }}</Option>
            </dyt-select>
            <span style="color:red" class="ml20">注意：退货处理仓库选择后，退货包裹的收货，入库等操作，只能在选择的仓库操作</span>
            </div>
            <div v-else>
              退货处理仓库:  {{ warehouseName }}
            </div>
          </Col>
        </Row>
        <div style="display: flex;margin-top: 50px;">
            <div style="width: 4px; height: 20px; background: #2c74f6"></div>
            <span class="ml10" style="font-size:18px;font-weight:700">退货商品信息</span>
        </div>
        <!-- <Divider /> -->
        <div class="flexBox spaceBetween mb10 mt10" v-if="returnsData.type == 'handle'">
            <div class="tableControl" style="margin-left:12px">
            <Button type="primary" v-if="pagePermission.createProcessOrder" @click="createHandleOrder">创建处理单</Button>
            </div>
        </div>
        <Table
        :border="true"
        :columns="getColumns"
        :height="tableHeight"
        :data="tableData"
        :loading="tableLoading"
        @on-selection-change="getSelectValue">
        <template slot-scope="{ row }" slot="picture">
            <div v-if="returnsData.type == 'check'">
                <div class="form-pic-item">
                <div v-for="(pic, pIndex) in tableData[row._index].checkPictureDetails" :key="`pic-${pIndex}`">
                  <div class="pic-item-view">
                    <largePicture 
                    :url="pic"
                    :picStyle="{
                      height: '60px',
                      width: '50px'
                    }"></largePicture>
                    <div class="pic-view-cover" >
                      <div class="pic-view-btn">
                        <Icon title="删除" type="ios-trash-outline" @click.native="removeImg(pic,row._index)" />
                      </div>
                    </div>
                  </div>
                  <!-- <div class="image-preview-content" slot="content">
                    <img style="width:350px" :src="`./filenode/s${pic}`" />
                  </div> -->
                </div>
                <dytUpload
                  ref="washedUploadRef"
                  name="files"
                  :show-upload-list="false"
                  :multiple="true"
                  accept="image/*"
                  :before-upload="(file) => {fileUploadBefore(file, row._index)}"
                  :action="uploadFilesUrl"
                  :max-size="5120"
                  class="upload-item"
                >
                  <div class="upload-icon">
                    <Icon type="ios-camera" size="20"></Icon>
                  </div>
                  <Spin v-if="isUploadLoading" fix></Spin>
                </dytUpload>
              </div>
            </div>
            <div v-else>
                <div class="form-pic-item">
                <div v-for="(pic, pIndex) in tableData[row._index].checkPictureDetails" :key="`pic-${pIndex}`">
                  <div class="pic-item-view">
                    <largePicture 
                    :url="pic"
                    :picStyle="{
                      height: '46px',
                      width: '46px'
                    }"></largePicture>
                  </div>
                  <!-- <div slot="content">
                    <img style="width:350px" :src="`./filenode/s${pic}`" />
                  </div> -->
                </div>
                </div>
            </div>
        </template>
        </Table>
        <handleOrderModal :dialog-obj="handleOrderData" @refresh="getList"></handleOrderModal>
    </div>
</template>
<script>
import Mixin from "@/components/mixin/common_mixin";
import api from "@/api/api";
import handleOrderModal from "./handleOrderModal.vue";
import largePicture from "@/components/largePicture";

export default {
  components: { handleOrderModal,largePicture },
  props: {
    returnsData: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  mixins: [Mixin],
  data() {
    return {
      tableHeight: this.getTableHeight(520),
      tableData: [],
      tableLoading: false,
      checkFormData:{},
      handleFormData:{},
      uploadFilesUrl: api.upload_files + '?basePath=/product',
      isUploadLoading: false,
      selectionArr:[],
      supplierList: [],
      handleOrderData: {
        modelVisible: false,
        type:'',
        data:{}
      },
      warehouseId: null,
      // warehouseArr: []
    }
  },
  mounted(){
    this.getSupplierList()
    this.getList()
  },
  activated() {
    this.$emit('goBack', true)
  },
  computed:{
    getColumns() {
      let checkColumns = [
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
        },
        {
          key: "platformQualityInspectionProblem",
          align: "center",
          title: "平台质检问题",
          width: 300,
          render: (h, params) => {
            return h(
              'Input',
              {
                props:{
                  value:this.tableData[params.row._index].platformQualityInspectionProblem,
                  maxlength: 200,
                },
                on:{
                  input:(val) => {
                    this.$set(this.tableData[params.row._index],'platformQualityInspectionProblem', val)
                  }
                }
              }
            )
          }
        },
        {
          key: "picture",
          align: "center",
          title: "平台质检图片",
          width: 320,
          slot: "picture"
        }
      ]
      let hanldeColumns = [
        {
          type: "selection",
          width: 60,
          align: "center",
        },
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
              h('div', {},params.row.reasonDesc),
              h('div', {},params.row.platformQualityInspectionProblem),
            ]
          }
        }, 
        {
          key: "picture",
          align: "center",
          title: "平台质检图片",
          width: 300,
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
          key: "processingOrder",
          align: "center",
          title: "处理单",
          width: 90,
          render: (h, params) => {
            return h('span',{},'未分配')
          }
        },
      ]
      if(this.returnsData.type == 'check'){
        return  checkColumns
      } else {
        return hanldeColumns
      }
    },
    pagePermission () {
      return {
        createProcessOrder: this.getPermission("fullManagedReturn_createRefundHandle"),
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
  watch: {
    'returnsData.warehouseArr' : {
      handler(newVal, oldVal) {
        this.warehouseId = this.returnsData.warehouseId
        console.log(this.returnsData);
      },
      immediate: true
    }
  },
  methods: {
    // getWarehouseInfo() {
    //   let { merchantId } = this.$store.state.userInfo;
    //   this.axios
    //     .get(api.getWarehouseInfo, { params: { merchantId } })
    //     .then(({ data }) => {
    //       if (data.code == 0) {
    //         data.datas.forEach(item => {
    //           if(item.warehouseName === '佛山丽山仓' || item.warehouseName === '六楼全托管仓') {
    //             this.warehouseArr.push(item)
    //           }
    //         })
    //         // 将仓库id赋值给退货仓库
    //         this.warehouseId =this.returnsData.warehouseId
    //       }
    //     });
    // },
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
      this.selectionArr = []
      this.axios.get(`${api.get_temuDetailList}?returnId=${this.returnsData.returnId}&requestType=2`).then(res => {
        if(res.data.code === 0) {
          // 这里由于外面列表的skuQuantity跟详情页面的skuQuantity不一样，需要按照详情商品数量的sku数量来展示
          let productSkuIdList = res.data.datas.map(item => item.productSkuId)
          productSkuIdList = [...new Set(productSkuIdList)]
          this.$set(this.returnsData, 'skuQuantity', productSkuIdList.length)
          this.tableData = res.data.datas.filter(item => this.$common.isEmpty(item.processType))
          this.tableData.forEach(item => {
            let picUrlArr = item.platformQualityInspectionUrl ? item.platformQualityInspectionUrl.split(',') : []
            this.$set(item, 'checkPictureDetails', picUrlArr)
          })
        }
      }).finally(() => {
        this.tableLoading = false
      })
    },
    // 移除图片
    removeImg (path,index) {
      this.tableData[index].checkPictureDetails = this.tableData[index].checkPictureDetails.filter(item => {
        return item != path;
      })
    },
    // 上传图片
    fileUploadBefore (file, index) {
      if (!file.type.includes('image/')) {
        this.$Message.error('文件格式不对，请上传图片格式的文件');
        return false;
      }
      this.isUploadLoading = true;
      let newForm = new FormData(); // 创建form对象
      newForm.append('files', file);
      const uploadUrl = `${this.uploadFilesUrl}&random=${(Math.random()).toString().substring(2, 5) + (new Date().getTime()).toString()}`;
      this.axios.post(uploadUrl, newForm).then(res => {
        if (!res || res.data.code != 0) return;
        // const sortArr = this.tableData[index].checkPictureDetails.map(m => m.sort);
        this.tableData[index].checkPictureDetails.push(res.data.datas[0]);
      }).finally(() => {
        this.isUploadLoading = false;
      })
      return false;
    },
    getSelectValue(val) {
      // table获取所选值
      this.selectionArr = val;
    },
    // 创建处理单
    createHandleOrder() {
      if(this.selectionArr.length === 0) {
        this.$Message.error('未选中数据~')
        return;
      }
      this.handleOrderData.data = this.selectionArr
      this.handleOrderData.type = 'create'
      this.handleOrderData.returnId = this.returnsData.returnId // 退货单id
      this.handleOrderData.referenceNo = this.returnsData.returnCode // 退货单号
      this.handleOrderData.modelVisible = true
    },
    saveAndSubmit(type) {
      let obj = {}
      let spsReturnDetail = this.tableData.map(item => {
        let platformQualityInspectionUrl = item.checkPictureDetails.join(',')
        return {
          id: item.id,
          platformQualityInspectionProblem: item.platformQualityInspectionProblem,
          platformQualityInspectionUrl: platformQualityInspectionUrl
        }
      })
      if(type == 'save'){
        obj = {
          spsReturn: {
            id: this.returnsData.returnId,
            warehouseId: this.warehouseId
          },
          spsReturnDetail: spsReturnDetail  
        }
      }else {
        if(this.$common.isEmpty(this.warehouseId)) return this.$Message.error('请选择退货处理仓库')
        obj = {
          spsReturn: {
            id: this.returnsData.returnId,
            returnStatus: 1,
            warehouseId: this.warehouseId
          },
          spsReturnDetail: spsReturnDetail  
        }
      }
      this.axios.post(api.update_Return, obj).then(res => {
        if(res.code === 0) {
          this.$Message.success('操作成功！')
        }
      }).catch(() => {}).finally(() => {
        this.$emit('goBack', true)
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
            top: 20%;
            left: 100%;
            width: 50%;
            height: 50%;
            transform: translate(-50%, -50%);
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
              width: 50%;
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