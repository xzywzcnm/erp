<template>
  <dyt-model :modalVisible.sync="modalVisible" @backList="backList" :pageLoading="pageLoading">
    <div class="model-content">
      <!-- 入库单详情组件 -->
      <inWareDetails :inWareOrderId="modalData.receiptNo" :inWareOrderNo="modalData.receiptNo" @backPage="backPage"
        :batchNo="modalData.checkStatus" @getPrintDate="getPrintDate">
      </inWareDetails>
      <!-- 打印sku -->
      <printSkuCode :printSkuObj="printDate" :printType="printType"
        :qualityCheckProcurementId="qualityCheckProcurementId" @printsuccess="printsuccess" :tipsDataLength="data2"
        :barCodeShow="barCodeShow" :printSource="'qualityManage'">
      </printSkuCode>
    </div>
  </dyt-model>
</template>
<script>
import api from '@/api/api';
import printSkuCode from '@/views/wms/components/common/printSkuCode';
import inWareDetails from '@/views/wms/components/wms-inWareManage/inWareDetails';
export default {
  name: "warehouseOrderDetails",
  components: { inWareDetails, printSkuCode },
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    modalData: {
      type: Object,
      default: () => { return {} }
    },
  },
  data() {
    return {
      pageLoading: false,
      modalVisible: false,
      printDate: [],
      barCodeShow: '', // 打印参数
      printType: 'single', // 打印参数
      qualityCheckProcurementId: '', // 打印参数
      data2: [], // 打印参数
    }
  },
  watch: {
    dialogVisible: {
      handler(nval, oval) {
        nval && this.open();
      },
      deep: true
    },
    modalVisible: {
      handler(nval, oval) {
        !nval && this.$emit('update:dialogVisible', nval);
      },
      deep: true
    }
  },
  methods: {
    // 窗口打开
    open() {
      this.modalVisible = true;
    },
    // 关闭窗口
    backList() {
      this.modalVisible = false;
    },
    // 返回列表
    backPage(value) { },
    // 打印的数据
    getPrintDate(returnData) {
      let activeRow = returnData.activeRow || {};
      this.axios.post(api.queryAllByReceiptNo, { receiptNoList: [returnData.inWareOrderNo] }).then(res => {
        if (res.data.code === 0) {
          let list = res.data.datas || [];
          // 添加参考编号
          list.forEach(item => {
            if (activeRow.referenceNo2) {
              item.referenceNo = activeRow.referenceNo + '/' + this.sepCommasFn(activeRow.referenceNo2).join('/');
            } else {
              item.referenceNo = activeRow.referenceNo;
              if (returnData.referenceNo) {
                item.referenceNo = returnData.referenceNo;
              }
            }
          });
          this.barCodeShow = list[0] && list[0].barcode;
          this.printDate = res.data.datas;
          this.$store.commit('printSkuModal', true);
        }
      })
    },
    sepCommasFn(params) {
      // 中英文逗号分隔
      let arr = [];
      if (params) {
        if (params.includes(',') && params.includes('，') && params.includes('\n')) {
          arr = params.split(',').join('\n').split('，').join('\n').split('\n');
        } else if (params.includes('，') && params.includes('\n')) {
          arr = params.split('，').join('\n').split('\n');
        } else if (params.includes('，') && params.includes(',')) {
          arr = params.split('，').join(',').split(',');
        } else if (params.includes(',') && params.includes('\n')) {
          arr = params.split(',').join('\n').split('\n');
        } else if (params.includes(',')) {
          arr = params.split(',');
        } else if (params.includes('，')) {
          arr = params.split('，');
        } else if (params.includes('\n')) {
          arr = params.split('\n');
        } else {
          arr.push(params);
        }
      }
      return arr;
    },
    // 打印完成
    printsuccess() {
    },
  }
}
</script>
<style lang="less">
.model-content {
  .addBinding {
    display: none;
  }

  .dataSort {
    margin-top: 0px;
    border-top: 1px solid #eee;
  }
}
</style>