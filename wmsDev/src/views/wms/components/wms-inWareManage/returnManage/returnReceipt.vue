<template>
    <div class="returnManage">
      <Form ref="formData" @submit.native.prevent :model="formData" :rules="formRules" :label-width="90" class="mt10">
        <div style="display:flex">
            <!-- scan扫描区域 -->
            <div class="scanArea mt10">
            <span> 扫描或输入退货单号（扫描后自动签收）：</span>
            <Input  v-model="inputNumber"
            ref="scanInput"
            class="mt10"
            size="large"
            style="padding-right: 20px;"
            placeholder="支持通过退货单参考编号查询"
            @on-enter="getReturnCode"
            />
            <Modal
              v-model="returnCodeVisible"
              footer-hide
              title="选择退货单"
              >
              <h3 style="color:red">该物流单号下存在多个退货单号，需选择其中一个</h3>
              <Table
             class="mt20"
              highlight-row
              border
              :columns="returnCodeColumns"
              :data="returnCodeList"></Table>
          </Modal>
              <Card class="mr20 mt10">
                <Form-item label="退货单号：">
                    {{ formData.returnCode }}
                </Form-item>
                <Form-item label="参考编号：">
                    {{ formData.supplierPackageNo }}
                </Form-item>
                <Form-item label="平台主体：">
                    {{ formData.platform }}
                </Form-item>
                <Form-item label="店铺：">
                    {{ formData.accountCode }}
                </Form-item>
                <Form-item label="退货原因：">
                    {{ formData.supplierReasonDesc }}
                </Form-item>
                <Form-item label="退货物流商：">
                    {{ formData.logisticsTypeDesc }}
                </Form-item>
                <Form-item label="退货物流单号：" :label-width="100">
                    {{ formData.expressDeLiverySn }}
                </Form-item>
                <Form-item label="SKU数量：">
                    {{ formData.skuCount }}
                </Form-item>
                <Form-item label="商品数量：">
                    {{ formData.returnSupplierQuantity }}
                </Form-item>
              </Card>
              <div class="btnArea" v-if="scanStatus === '2'">
                <Form-item label="打印处理标签" :label-width="130">
                    <RadioGroup v-model="formData.isPrintProcess">
                        <Radio label="1">
                            <span>是</span>
                        </Radio>
                        <Radio label="0">
                            <span>否</span>
                        </Radio>
                    </RadioGroup>
                </Form-item>
                <Form-item label="打印换标商品标签" :label-width="130">
                    <RadioGroup v-model="formData.isPrintChangeGoods">
                        <Radio label="1">
                            <span>是</span>
                        </Radio>
                        <Radio label="0">
                            <span>否</span>
                        </Radio>
                    </RadioGroup>
                </Form-item>
                <div class="mt20" style="display:flex;justify-content: center;align-items: center;">
                    <Button type="primary" v-if="pagePermission.confirmReceipt" @click="confirmReceipt">确认收货</Button>
                    <Button class="ml20" @click="cancelReceipt">取消本次收货</Button>
                </div>
              </div>
            </div>
            <!-- 右侧数据信息展示区域 -->
            <div class="dataInfoArea">
             <div class="mt20 ml20 tipPage" style="color:red;font-size: 28px;" v-if="scanStatus === '1' || scanStatus === '0'">
                <span>货物待分配处理方式</span>
             </div>
             <div class="mt20 ml20 tipPage" style="color:red;font-size: 28px;" v-if="scanStatus === '3' || scanStatus === '4'">
                <span>货物已经收货</span>
             </div>
             <div class="mt20 ml20 tipPage" style="color:red;font-size: 28px;" v-if="scanStatus === null">
                <span>扫描或输入无效，无法识别</span>
             </div>
             <div v-if="scanStatus === '2'">
                <div class="mt20 ml20">扫描或输入SKU条码:</div>
                <div class="dataInfoAreaTop ml20">
                    <div>
                        <Input  v-model="formData.skuCode" size="large" style="width:300px" ref="scanSkuInput"
                        @on-enter="addReceivedQuantity"/>
                        <div class="ml10" style="display:inline-block;">
                            <RadioGroup v-model="formData.isMoreOrSingle">
                                <Radio label= '0'>
                                    <span>逐渐扫描</span>
                                </Radio>
                                <Radio label= '1'>
                                    <span>批量扫描</span>
                                </Radio>
                            </RadioGroup>
                        </div>
                    </div>
                    <div class="mr20">
                    <Button @click="setReceiptNum('min')">收货件数为0</Button>
                    <Button @click="setReceiptNum('max')" class="ml20">收货件数为最大值</Button>
                    </div>
                </div>
                <div>
                    <div class="dataInfoAreaMain" v-for="(item,index) in formData.refundHandleVOList" :key="index">
                        <div style="border:1px solid #D7D7D7">
                                <div class="mt10 mb10 ml10">
                                <Row>
                                    <Col :span="4">
                                        <div style="display:flex">
                                            <div>处理类型:</div>
                                            <div
                                            :style="{
                                                background: processAllocationMap[item.processType]
                                                ? processAllocationMap[item.processType].color : '#ffffff'
                                                }"
                                            style="
                                                width: 70px;
                                                color: white;
                                                margin-left: 10px;
                                                text-align: center;
                                                ">
                                                <span>
                                                {{ processAllocationMap[item.processType]? processAllocationMap[item.processType].value : '' }}
                                                </span>
                                        </div>
                                        </div>
                                    </Col>
                                    <Col :span="6">
                                        处理单号: {{ item.processCode }}
                                    </Col>
                                    <Col :span="4">
                                        更换标签: <span :style="{color: item.isChangeLabel ? 'red': ''}">{{ item.isChangeLabel ? '是' : '否' }}</span>
                                    </Col>
                                </Row>
                                </div>
                                <Table
                                :row-class-name="rowClassName"
                                highlight-row
                                border
                                :columns="columns"
                                :data="item.spsRefundHandleDetailInfoList"
                                >
                                <template slot-scope="{ row }" slot="proPicture">
                                    <div class="form-pic-item">
                                        <Poptip trigger="hover" transfer placement="right-start" v-for="(pic, pIndex) in row.qualityProblemPicArr" :key="`pic-${pIndex}`">
                                        <div class="pic-item-view">
                                          <img :src="pic.startsWith('http') ? pic : `./filenode/s${pic}`" />
                                        </div>
                                        <div slot="content">
                                            <img  style="width:350px" :src="pic.startsWith('http') ? pic : `./filenode/s${pic}`" />
                                        </div>
                                        </Poptip>
                                    </div>
                                </template>
                                </Table>
                        </div>
                    </div>
                </div>
             </div>
             <div class="mt20 ml20 tipPage" style="color:red;font-size: 28px;" v-if="scanStatus === '5'">
                <span>已作废</span>
             </div>
             <div class="mt20 ml20 tipPage" style="color:red;font-size: 28px;" v-if="scanStatus === '-1'" >
                <span>扫描或输入退货单号</span>
             </div>
            </div>
        </div>
        <confirmReceiptModal ref="confirmReceiptModal" :modelVisible="modelVisible" :confirm-data="confirmData" @refresh="refresh" @closeModal="modelVisible = false"></confirmReceiptModal>
      </Form>
      <Spin size="large" fix v-if="loading"></Spin>
    </div>
</template>
<script>
import api from '@/api/api';
import common from '@/components/mixin/common_mixin';
import confirmReceiptModal from './component/confirmReceiptModal.vue';
export default {
  mixins: [common],
  components: { confirmReceiptModal },
  data() {
    return {
      scanStatus: '-1',
      inputNumber: '',
      processOrderList: [],
      formData: {
        isPrintProcess: '1',
        isPrintChangeGoods: '1',
        skuCode: null,
        isMoreOrSingle: '0',
      },
      formRules: {},
      columns: [
        {
          key: 'picture',
          title: '图片',
          align: 'center',
          render: (h, params) => {
            return this.tableImg(h, params, 'thumbUrl', params.row.thumbUrl);
          }
        },
        {
          key: 'productSkuId',
          title: '平台Sku',
          align: 'center'
        },
        {
          key: 'variationSpecifics',
          title: '属性集',
          align: 'center'
        },
        {
          key: 'SKU',
          title: 'SKU/条码编码',
          align: 'center',
          render: (h, params) => {
            return [
              h('div', {}, params.row.skuExtCode),
              h('div', {}, params.row.barCode)
            ]
          }
        },
        {
          key: 'reasonDesc',
          title: '退货原因',
          align: 'center',
          render: (h, params) => {
            return [
              h('div', {}, params.row.reasonDesc),
              h('div', {}, params.row.platformQualityInspectionProblem)
            ]
          }
        },
        {
          key: 'problemPicture',
          title: '平台问题图片',
          align: 'center',
          width: 200,
          slot: 'proPicture'
        },
        {
          key: 'warehousingSku',
          title: '入库SKU',
          align: 'center',
        },
        {
          key: 'skuQuantity',
          title: '件数',
          align: 'center',
        },
        {
          key: 'receiptQuantity',
          title: '收货件数',
          align: 'center',
          render: (h, params) => {
            let outIndex = this.formData.refundHandleVOList.findIndex(obj => obj.processCode === params.row.processCode)
            return h('InputNumber', {
              props: {
                value: this.formData.refundHandleVOList[outIndex].spsRefundHandleDetailInfoList[params.index].receiptQuantity,
                min: 0,
                precision: 0
              },
              on: {
                'on-change': (val) => {
                  this.$set(this.formData.refundHandleVOList[outIndex].spsRefundHandleDetailInfoList[params.index]
                    , 'receiptQuantity', val)
                },
              }
            }, this.formData.refundHandleVOList[outIndex].spsRefundHandleDetailInfoList[params.index].receiptQuantity)
          }
        },
      ],
      processAllocationMap: {
        1: { value: '退供', color: '#996600' },
        2: { value: '质检入库', color: '#CC66CC' },
        3: { value: '维修入库', color: '#9900FF' },
        4: { value: '上架入库', color: '#009966' },
        5: { value: '销毁', color: '#FF6600' },
      },
      modelVisible: false,
      confirmData: {
        replaceLabeltableData: [],
        processLabeltableData: [],
        refundHandleVOList: []
      },
      returnCodeList: [],
      returnCodeColumns: [
        {
          type: 'index',
          align: 'center',
          width: 60
        },
        {
          key: 'returnCode',
          title: '退货单号',
          align: 'center',
        },
        {
          key: 'returnStatus',
          title: '退货单状态',
          align: 'center',
          render: (h, params) => {
            let stateMap = {
              0: '待商品核因',
              1: '待处理分配',
              2: '待收货',
              3: '处理中',
              4: '处理完结',
              5: '已作废'
            }
            return h('div', {}, stateMap[params.row.returnStatus])
          }
        },
        {
          key: 'opeation',
          title: '操作',
          align: 'center',
          render: (h, params) => {
            return h('Button', {
              props: {
                type: 'primary'
              },
              on: {
                click: () => {
                  this.returnCode = params.row.returnCode
                  this.getReturnOrderData()
                }
              }
            }, '选择')
          }
        }
      ],
      returnCode: null,
      returnCodeVisible: false,
      loading: false
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.$refs.scanInput.focus();
    });
  },
  computed: {
    pagePermission () {
      return {
        // 确认收货
        confirmReceipt: this.getPermission('fullManagedReturn_confirmReceipt'),
      }
    },
  },
  methods: {
    // 回车后先查询是否存在多个退货单(在利用物流单号查询的情况下)
    getReturnCode() {
      this.loading = true
      this.axios.post(`${api.query_returnCodeList}?inputNumber=${this.inputNumber}&warehouseId=${this.getWarehouseId()}`).then(res => {
        if (res.data.code == 0) {
          let flag = !this.$common.isEmpty(res.data.datas) && res.data.datas.length > 1
          if (flag) {
            this.returnCodeList = this.$common.copy(res.data.datas)
            this.returnCodeVisible = true
          } else {
            this.returnCode = !this.$common.isEmpty(res.data.datas) ? res.data.datas[0].returnCode : this.inputNumber
            this.getReturnOrderData()
          }
        }
      }).finally(() => {
        this.loading = false
      })
    },
    // 获取退货单数据
    getReturnOrderData() {
      this.returnCodeVisible = false
      this.loading = true
      this.axios.get(`${api.scan_getReturnInfo}?inputNumber=${this.returnCode}&warehouseId=${this.getWarehouseId()}`).then(res => {
        if (res.data.code === 0) {
          this.formData = { ...this.formData, ...res.data.datas }
          this.scanStatus = this.formData.returnStatus
          this.formData.refundHandleVOList.forEach(item => {
            item.spsRefundHandleDetailInfoList.forEach(el => {
              let qualityProblemPicArr = el.platformQualityInspectionUrl
              ? el.platformQualityInspectionUrl.split(',') : []
              this.$set(el, 'qualityProblemPicArr', qualityProblemPicArr)
              this.$set(el, 'processCode', item.processCode)
              this.setReceiptNum('min')
            })
          })
          if (this.scanStatus == '2') {
            this.$nextTick(() => {
              this.$refs.scanSkuInput.focus()
            });
          }
        } else if (res.data.code === 999993) {
          this.scanStatus = null
          this.formData = {
            isPrintProcess: '1',
            isPrintChangeGoods: '1',
            skuCode: null,
            isMoreOrSingle: '0',
          }
        }
      }).catch(() => {
        this.cancelReceipt()
      }).finally(() => {
        this.inputNumber = ''
        this.returnCode = null
        this.loading = false
      })
    },
    refresh() {
      let returnCode = this.$common.copy(this.formData.returnCode)
      this.cancelReceipt()
      this.loading = true
      this.axios.get(`${api.scan_getReturnInfo}?inputNumber=${returnCode}&warehouseId=${this.getWarehouseId()}`).then(res => {
        if (res.data.code === 0) {
          this.formData = { ...this.formData, ...res.data.datas }
          this.scanStatus = this.formData.returnStatus
          this.formData.refundHandleVOList.forEach(item => {
            item.spsRefundHandleDetailInfoList.forEach(el => {
              let qualityProblemPicArr = el.platformQualityInspectionUrl
              ? el.platformQualityInspectionUrl.split(',') : []
              this.$set(el, 'qualityProblemPicArr', qualityProblemPicArr)
              this.$set(el, 'processCode', item.processCode)
              this.setReceiptNum('min')
            })
          })
          if (this.scanStatus == '2') {
            this.$nextTick(() => {
              this.$refs.scanSkuInput.focus()
            });
          }
        } else if (res.data.code === 999993) {
          this.scanStatus = null
          this.formData = {
            isPrintProcess: '1',
            isPrintChangeGoods: '1',
            skuCode: null,
            isMoreOrSingle: '0',
          }
        }
      }).catch(() => {
        this.cancelReceipt()
      }).finally(() => {
        this.loading = false
      })
    },
    // 确认收货
    confirmReceipt() {
      // 是否勾选打印处理标签
      this.confirmData.processLabeltableData = this.formData.isPrintProcess === '1'
      ? this.$common.copy(this.formData.refundHandleVOList) : []
      let replaceLabeltableData = []
      replaceLabeltableData = this.formData.refundHandleVOList.filter(item => item.isChangeLabel == 1)
      replaceLabeltableData = replaceLabeltableData.map(item => item.spsRefundHandleDetailInfoList).flat()
      // 是否勾选打印替换产品标签
      this.confirmData.replaceLabeltableData = this.formData.isPrintChangeGoods === '1' ? replaceLabeltableData : [];
      this.confirmData.replaceLabeltableData.forEach(item => {
        this.$set(item, 'printNum', this.$common.isEmpty(item.receiptQuantity) || item.receiptQuantity <= 0 ? 1 : item.receiptQuantity);
      })
      this.confirmData.processLabeltableData.forEach(item => {
        this.$set(item, 'printNum', this.$common.isEmpty(item.receiptQuantity) || item.receiptQuantity <= 0 ? 1 : item.receiptQuantity);
      })
      this.confirmData.refundHandleVOList = this.formData.refundHandleVOList
      this.confirmData.refundHandleVOList.forEach(item => {
        this.$set(item, 'returnId', this.formData.returnId)
      })
      if (this.formData.isPrintProcess == '0' && this.formData.isPrintChangeGoods == '0') {
        // 直接调用子组件的收获方法
        this.$refs.confirmReceiptModal.receipt()
      } else {
        this.modelVisible = true
      }
    },
    // 设置收货数量
    setReceiptNum(type) {
      this.formData.refundHandleVOList.forEach(item => {
        item.spsRefundHandleDetailInfoList.forEach(el => {
          let resultNum = type == 'min' ? 0 : el.skuQuantity
          this.$set(el, 'receiptQuantity', resultNum)
        })
      })
    },
    // 扫描添加收货数
    addReceivedQuantity() {
      if (this.$common.isEmpty(this.formData.isMoreOrSingle)) return this.$Message.error('请选择扫描模式~')
      let skuCode = this.formData.skuCode.toLowerCase()
      this.formData.refundHandleVOList.forEach(item => {
        item.spsRefundHandleDetailInfoList.forEach(el => {
          if (skuCode === el.skuExtCode || skuCode === el.barCode) {
            let resultNum = this.formData.isMoreOrSingle === '0' ? el.receiptQuantity + 1 : el.skuQuantity
            // 最大值不大于退货件数
            if (el.receiptQuantity < el.skuQuantity) {
              this.$set(el, 'receiptQuantity', resultNum)
              this.formData.skuCode = null
            }
          }
        })
      })
      if (!this.$common.isEmpty(this.formData.skuCode)) return this.$Message.error('无法识别')
    },
    // 取消本次收货
    cancelReceipt() {
      this.formData = {
        isPrintProcess: '1',
        isPrintChangeGoods: '1',
        skuCode: null,
        isMoreOrSingle: '0',
      }
      this.scanStatus = '-1'
    },
    // 当前table列具有选中状态样式
    rowClassName(row) {
      let skuCode = this.formData.skuCode
      if (skuCode === row.skuExtCode || (row.barCode && skuCode === row.barCode)) {
        return 'demo-table-info-row';
      }
      return '';
    },
  }
}
</script>
<style lang="less">
.returnManage{
  height: 100%;
  .scanArea{
    width: 25vw;
    .ivu-form-item{
        margin-bottom: 5px
    }
  }
  .dataInfoArea{
    width: 70vw;
    background-color: #fff;
     .tipPage{
         height: 75vh;
        }
     .dataInfoAreaTop{
        display:flex;
        justify-content: space-between;
     }
     .dataInfoAreaMain{
        padding: 5px 20px;
        margin-top: 10px;
        .form-pic-item{
        display: flex;
        justify-content: flex-start;
        flex-flow: wrap;
        .pic-item-view{
          position: relative;
          margin-right: 10px;
          width: 70px;
          height: 70px;
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
          width: 70px;
          height: 70px;
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
      .ivu-table .demo-table-info-row td {
        background-color: #2db7f5;
        color: #fff;
      }
     }
  }
}
</style>