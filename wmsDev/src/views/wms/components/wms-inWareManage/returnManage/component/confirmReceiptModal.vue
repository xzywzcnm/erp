<template>
    <div>
        <Modal
        v-model="isVisible"
        :title="`${isPrintPreview ? '打印预览' : '确认收货'}`"
        :mask-closable="false"
        class-name="modal-box"
        width="1200"
        >
    <template v-if="isPrintPreview">
        <div class="tag-view" v-for="(item, index) in previewData" :key="`tag-${index}`"
            :style="`${item.pagePxSze ? `height:${item.pagePxSze.height * item.scale}px;` : ''}`">
            <div v-html="item.previewHtml" class="tag-item-view" />
          </div>
    </template>
     <template v-else>
        <div class="ml10 mb20">
          <span>打印处理标签:</span>
          <Table
          ref="processTable"
          border
          highlight-row
          class="ml20"
          height="300"
          :columns="processColumns"
          :data="confirmData.processLabeltableData"
          @on-selection-change="changeProcessSelect"
          ></Table>
       </div>
       <div class="ml10">
          <span>打印换标商品的标签:</span>
          <div class="printGoodsTop ml20">
            <div class="ml20 l36">打印列表</div>
            <div class="l36" style="padding-right: 20px;">统一打印数量：
                <InputNumber size="small" v-model="allPrintNum" :min="0" @on-change="setPrintNum" style="width: 100px"/>
            </div>
          </div>
          <Table
          ref="replaceTable"
          border
          highlight-row
          class="ml20"
          height="300"
          :columns="goodLabelColumns"
          :data="confirmData.replaceLabeltableData"
          @on-selection-change="changeReplaceSelect"
          >
          </Table>
       </div>
     </template>
       <div slot="footer">
        <span style="display: inline-flex;align-items: center;">
        </span>
        <Button v-if="!isPrintPreview"  @click="tagPreview" type="primary">打印</Button>
        <Button v-if="isPrintPreview"  @click="printTag" type="primary">打印</Button>
        <Button v-if="!isPrintPreview" type="primary" @click="receipt()">收货</Button>
        <Button v-if="!isPrintPreview" type="primary" @click="receiptAndPrint()">打印并收货</Button>
      </div>
      <Spin size="large" fix v-if="modalLoading">
        处理打印数据中，数据量越多需要时间越久，请耐心等待...
      </Spin>
      <Spin fix v-if="loading"></Spin>
    </Modal>
    </div>
</template>
<script>
import api from "@/api/api"
import common from '@/components/mixin/common_mixin';
import printCommon from '@/utils/printCommon';
import { getPrintHtml } from '@/utils/printTagCommon';
export default {
  mixins: [common],
  props: {
    modelVisible: {
      type: Boolean,
      default: false
    },
    confirmData: {
      type: Object,
      default: () => {
        return {
          replaceLabeltableData: [],
          processLabeltableData: [],
          refundHandleVOList: []
        }
      }
    }
  },
  data() {
    return {
      isVisible: false,
      modalLoading: false,
      isPrintPreview: false,
      previewData: [],
      allPrintNum: null,
      processColumns: [
        {
          type: 'selection',
          align: 'center',
          width: 60
        },
        {
          key: 'processCode',
          title: '处理单号',
          align: 'center',
          width: 300
        },
        {
          key: 'processType',
          title: '处理类型',
          align: 'center',
          render: (h, params) => {
            let processTypeList = {
              1: '退供',
              2: '质检入库',
              3: '维修入库',
              4: '上架入库',
              5: '销毁'
            }
            let type = ''
            type = processTypeList[params.row.processType]
            return h('div', {}, type)
          }
        },
        {
          key: 'isChangeLabel',
          title: '更换标签',
          align: 'center',
          render: (h, params) => {
            return h('div', {}, params.row.isChangeLabel ? '是' : '否')
          }
        },
        {
          key: 'printNum',
          title: '打印数量',
          align: 'center',
          width: 100,
          render: (h, params) => {
            return h('div', {}, 1)
          }
        }
      ],
      goodLabelColumns: [
        {
          type: 'selection',
          align: 'center',
          width: 60
        },
        {
          title: '图片',
          key: 'picture',
          align: 'center',
          width: 100,
          render: (h, params) => {
            return this.tableImg(h, params, 'thumbUrl', params.row.thumbUrl);
          }
        },
        {
          key: 'warehousingSku',
          title: '入库SKU',
          align: 'center',
          width: 200
        },
        {
          key: 'cnName',
          title: '商品名称',
          align: 'center',
        },
        {
          key: 'variationSpecifics',
          title: '规格',
          align: 'center',
          width: 260,
          render: (h, params) => {
            return h('Input', {
              props: {
                value: this.confirmData.replaceLabeltableData[params.row._index].variationSpecifics
              },
              on: {
                input: (val) => {
                  this.$set(this.confirmData.replaceLabeltableData[params.row._index], 'variationSpecifics', val)
                }
              }
            }, this.confirmData.replaceLabeltableData[params.row._index].variationSpecifics)
          }
        },
        {
          key: 'printNum',
          title: '打印数量',
          align: 'center',
          width: 100,
          render: (h, params) => {
            return h('InputNumber', {
              props: {
                value: this.confirmData.replaceLabeltableData[params.row._index].printNum
              },
              on: {
                'on-change': (val) => {
                  this.$set(this.confirmData.replaceLabeltableData[params.row._index], 'printNum', val)
                }
              }
            }, this.confirmData.replaceLabeltableData[params.row._index].printNum)
          }
        },
      ],
      processLabel: {
        size: {
          width: 70,
          height: 20,
          unit: 'mm',
        },
        replaceKey: {
          tagType: 'type', // 标签类型 platformId
          barcode: 'processCode', // 条码，Number、String
          leftTop: 'processCode', // 条码左上角
          middleTop: 'processTypeCn', // 条码正上(即条码中间上方)
          rightTop: 'isChangeLabel', // 条码右上角
        }
      },
      lapaLabel: {
        size: {
          width: 70,
          height: 20,
          unit: 'mm',
        },
        replaceKey: {
          tagType: 'type', // 标签类型 platformId
          barcode: 'warehousingSku', // 条码，Number、String
        }
      },
      processAllocationMap: {
        1: { value: '退供', color: '#996600' },
        2: { value: '质检入库', color: '#CC66CC' },
        3: { value: '维修入库', color: '#9900FF' },
        4: { value: '上架入库', color: '#009966' },
        5: { value: '销毁', color: '#FF6600' },
      },
      selectedProcessData: [],
      selectedReplaceData: [],
      loading: false
    }
  },
  watch: {
    modelVisible: {
      handler(newVal) {
        if (newVal) {
        // 设置默认勾选状态
          this.open()
        }
      },
      deep: true
    },
    isVisible (newVal) {
      if (newVal) return;
      this.$emit('closeModal', newVal);
      !newVal && this.closeModal();
    }
  },
  methods: {
    initData() {
      let skuList = this.confirmData.replaceLabeltableData ? this.confirmData.replaceLabeltableData.map(item => item.skuExtCode) : []
      if (skuList.length > 0) {
        this.axios.post(api.query_productGoodsInfoBySkuList, skuList).then(res => {
          this.confirmData.replaceLabeltableData.forEach(item => {
            res.data.datas.forEach(el => {
              if (item.skuExtCode == el.sku) {
                this.$set(item, 'cnName', el.cnName)
              }
            })
          })
        }).finally(() => {
          // 两个Table设置默认自动全部勾选
          this.$nextTick(() => {
            this.confirmData.processLabeltableData.forEach((item, index) => {
              this.$refs.processTable.$refs.tbody.objData[index]._isChecked = true;
            })
            this.confirmData.replaceLabeltableData.forEach((item, index) => {
              this.$refs.replaceTable.$refs.tbody.objData[index]._isChecked = true;
            })
            this.selectedProcessData = this.confirmData.processLabeltableData
            this.selectedReplaceData = this.confirmData.replaceLabeltableData
          })
        })
      } else {
        this.$nextTick(() => {
          this.confirmData.processLabeltableData.forEach((item, index) => {
            this.$refs.processTable.$refs.tbody.objData[index]._isChecked = true;
          })
          this.confirmData.replaceLabeltableData.forEach((item, index) => {
            this.$refs.replaceTable.$refs.tbody.objData[index]._isChecked = true;
          })
          this.selectedProcessData = this.confirmData.processLabeltableData
          this.selectedReplaceData = this.confirmData.replaceLabeltableData
        })
      }
      this.isVisible = this.modelVisible;
    },
    // 打开窗口
    open () {
      this.initData();
    },
    // 关闭弹窗
    closeModal () {
      this.loading = false
      this.modalLoading = false;
      this.isVisible = false;
      this.isPrintPreview = false;
      this.previewData = [];
      this.allPrintNum = null
    },
    // 统一设置打印数
    setPrintNum(val) {
      this.confirmData.replaceLabeltableData.forEach(item => {
        this.$set(item, 'printNum', val)
      })
      // 由于这里如何重新渲染replaceTable组件会导致勾选状态为空，所以这里需要清空选中数组
      this.selectedReplaceData = []
    },
    // 打印预览
    tagPreview() {
      if (this.selectedProcessData.length == 0 && this.selectedReplaceData.length == 0) return this.$Message.error('无可打印内容')
      this.previewData = [];
      this.modalLoading = true
      let resultProcessList = []
      let resultReplaceList = []
      this.selectedProcessData.forEach(item => {
        this.$set(item, 'type', 'process')
        this.$set(item, 'processTypeCn', this.processAllocationMap[item.processType].value)
        this.$set(item, 'isChangeLabel', item.isChangeLabel ? '换标' : '')
      })
      this.selectedReplaceData.forEach(item => {
        let specificationList = item.variationSpecifics.split(/[,，]/)
        this.$set(item, 'specificationList', specificationList)
        for (let i = 0; i < item.printNum; i++) {
          resultReplaceList.push({ ...item })
        }
      })
      resultProcessList = this.selectedProcessData
      setTimeout(() => {
        if (resultProcessList.length > 0) {
          getPrintHtml(resultProcessList, this.processLabel).then(res => {
            if (!res.success || this.$common.isEmpty(res.data)) return;
            this.previewData = res.data
            if (resultReplaceList.length > 0) {
              getPrintHtml(resultReplaceList, this.lapaLabel).then(res => {
                this.previewData = [...this.previewData, ...res.data]
                this.isPrintPreview = true;
                this.modalLoading = false
              })
            } else {
              this.isPrintPreview = true;
              this.modalLoading = false
            }
          })
        } else {
          if (resultReplaceList.length > 0) {
            getPrintHtml(resultReplaceList, this.lapaLabel).then(res => {
              this.previewData = res.data
              this.isPrintPreview = true;
              this.modalLoading = false
            })
          }
        }
      }, 200)
    },
    // 打印标签
    printTag() {
      this.loading = true;
      let allTagHtml = '';
      this.previewData.forEach((item, index) => {
        allTagHtml = `${allTagHtml}${item.printHtml}`;
      })
      // 将 html 放到 html 文档中
      allTagHtml = `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>标签打印</title>
        </head>
        <style>
          * {
            margin: 0;
            padding: 0;
          }
          body{
            font-size: 0;
          }
          img {
            vertical-align: top;
          }
        </style>
        <body>${allTagHtml}</body>
      </html>`;
      printCommon.htmlPrint(allTagHtml).then((res) => {
      }).finally(() => {
        this.closeModal()
      })
    },
    changeProcessSelect(val) {
      this.selectedProcessData = val
    },
    changeReplaceSelect(val) {
      this.selectedReplaceData = val
    },
    // 收货
    receipt() {
      this.loading = true
      let receiptObjList = []
      let resultArr = this.$common.copy(this.confirmData.refundHandleVOList)
      if (this.$common.isEmpty(resultArr)) {
        this.loading = false
        this.isVisible = false
        return ''
      }
      resultArr = resultArr.map(item => {
        item.spsRefundHandleDetailInfoList.forEach(el => {
          // 后端要求传值
          this.$set(el, 'returnHandleId', item.returnHandleId)
          this.$set(el, 'returnId', item.returnId)
        })
        return {
          processCode: item.processCode,
          warehouseId: item.warehouseId,
          processType: item.processType,
          supplierId: item.supplierId,
          supplierName: item.supplierName,
          qualityInspectionRatio: item.processType == 3 ? 100 : item.qualityInspectionRatio,
          createReceiptDetailBOList: item.spsRefundHandleDetailInfoList,
          returnHandleId: item.returnHandleId,
          returnId: item.returnId,
          businessDeptId: item.businessDeptId,
          maintenanceContent: item.maintenanceContent
        }
      })
      // 生成入库单编号
      this.axios.post(api.confirm_receipt, resultArr).then(res => {
        // 由于退供和销毁收货操作不会返回详情，因此如果为0的话直接返回成功即可
        if (res.data.code == 0 && this.$common.isEmpty(res.data.datas)) {
          this.$Message.success('操作成功')
          this.$emit('refresh', true)
        } else {
          let promiseList = res.data.datas.map(x => {
            let resultFlag = x.resultFlag
            return () => new Promise((resolve) => {
              // 获取入库单详情
              this.axios.post(api.post_wmsReceipt_detailAll, {
                receiptBatchQueryParam: {
                  pageNum: 1,
                  pageSize: 10
                },
                receiptDetailPQueryParam: {
                  pageNum: 1,
                  pageSize: 20000
                },
                receiptDetailUQueryParam: {
                  pageNum: 1,
                  pageSize: 20000
                },
                receiptBatchCheckQueryParam: {
                  // 质检记录
                  pageNum: 1,
                  pageSize: 10
                },
                receiptShelveQueryParam: {
                  // 上架记录
                  pageNum: 1,
                  pageSize: 10
                },
                receiptNoOrReferenceNo: x.receiptDetailParam.receiptNo,
                warehouseId: x.receiptDetailParam.warehouseId
              }).then(res1 => {
                let receiptBatch = !this.$common.isEmpty(res1.data.datas.detailList[0].receiptDetailPPage)
                ? res1.data.datas.detailList[0].receiptDetailPPage.list : []
                receiptBatch.forEach(y => {
                  // 后端要求-直接写死值
                  this.$set(y, 'currentbatchNumber', y.sumExpectedNumber)
                  // this.$set(y, 'warehouseLocationId', '769699404255854592')
                  this.$set(y, 'resultFlag', resultFlag)
                  // this.$set(y, 'warehouseBlockId', '769699073648230400')
                  // this.$set(y, 'warehouseLocationName', 'SJ01-01')
                  this.$set(y, 'warehouseId', x.receiptDetailParam.warehouseId)
                })
                let receiptList = [
                  { receiptBatch: receiptBatch,
                    receiptNo: x.receiptDetailParam.receiptNo
                  }
                ]
                let obj = {
                  isOvercharge: "Y",
                  receiptBatch: "",
                  receiptNo: x.receiptDetailParam.receiptNo,
                  resultFlag: resultFlag,
                  receiptList: receiptList,
                }
                receiptObjList.push(obj)
                resolve()
              }).catch(() => {
              })
            })
          })
          this.$common.promiseAll(promiseList).then((res) => {
            // 最终调用收货模块-收货接口
            this.axios.post(api.batch_create, receiptObjList).then(res2 => {
              if (res2.data.code === 0) {
                this.$Message.success('操作成功')
                this.$emit('refresh', true)
              }
            })
            this.loading = false;
          })
        }
      }).catch(() => {})
        .finally(() => {
          this.loading = false
          this.isVisible = false
        })
    },
    // 收货且打印
    receiptAndPrint() {
    // 先执行打印操作
      this.loading = true
      this.previewData = [];
      let resultProcessList = []
      let resultReplaceList = []
      this.selectedProcessData.forEach(item => {
        this.$set(item, 'type', 'process')
        this.$set(item, 'processTypeCn', this.processAllocationMap[item.processType].value)
        this.$set(item, 'isChangeLabel', item.isChangeLabel ? '换标' : '')
      })
      this.selectedReplaceData.forEach(item => {
        let specificationList = item.variationSpecifics.split(/[,，]/)
        this.$set(item, 'specificationList', specificationList)
        for (let i = 0; i < item.printNum; i++) {
          resultReplaceList.push({ ...item })
        }
      })
      resultProcessList = this.selectedProcessData
      setTimeout(() => {
        if (resultProcessList.length > 0) {
          getPrintHtml(resultProcessList, this.processLabel).then(res => {
            if (!res.success || this.$common.isEmpty(res.data)) return;
            this.previewData = res.data
            if (resultReplaceList.length > 0) {
              getPrintHtml(resultReplaceList, this.lapaLabel).then(res => {
                this.previewData = [...this.previewData, ...res.data]
                this.printTag()
                // 执行收货操作
                this.receipt()
              })
            } else {
              this.printTag()
              // 执行收获操作
              this.receipt()
            }
          })
        } else {
          if (resultReplaceList.length > 0) {
            getPrintHtml(resultReplaceList, this.lapaLabel).then(res => {
              this.previewData = res.data
              this.printTag()
              this.receipt()
            })
          }
        }
      }, 200)
    }
  }
}
</script>
<style lang="less">
.modal-box {
    .ivu-modal-body {
            height: 700px;
            overflow: scroll;
        }
}
.printGoodsTop{
  display: flex;
  justify-content: space-between;
  background: #E4E4E4;
  .l36{
    line-height: 36px;
  }
}
</style>