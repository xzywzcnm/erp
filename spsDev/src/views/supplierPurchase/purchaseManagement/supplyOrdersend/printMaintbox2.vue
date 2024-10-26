<template>
  <div class="pritmain">
    <!-- 需要打印的内容 begin -->
    <div id="printTest">
      <div class="pritContent">
        <div v-for="(item,index) in dialogPrintmaint" :key="index">
          <div class="box mb10">
            <div class="box-li">第{{index+1}}箱(共{{dialogPrintmaint.length}}箱)</div>
            <div class="box-li">{{dialogObj.data.supplierName || ''}}</div>
            <div class="box-li">
              <div>发货单号：{{dialogObj.data.supplierDespatchId || ''}}</div>
              <div>下单数：{{dialogObj.data.allOrderQuantity || 0}}</div>
              <div>发货数：{{dialogObj.data.allSendQuantity || 0}}</div>
            </div>
            <div class="box-li">物流运单号：{{dialogObj.data.trackingNumber || ''}}</div>
          </div>
        </div>

        <div v-for="(item,index) in orderList" class="mt10 mb10" :key="item">
          <barcode :option="{id: 'printbox'+index, content: item}"></barcode>
          <div>{{item || ''}}</div>
        </div>
      </div>
    </div>

    <!-- 需要打印的内容 end -->
    <button v-print="printObj" ref="btn">打印</button>
  </div>
</template>

<script>
import api from '@/api/api';
import barcode from '@/components/Barcode';
export default {
  components: { barcode },
  props: {
    dialogObj: {
      type: Object,
      default () {
        return {
          data: {}
        };
      }
    }
  },
  data () {
    return {
      printObj: {
        id: "printTest",    // 这里是要打印元素的ID
        popTitle: '打印箱唛',  // 打印的标题
      },
      dialogPrintmaint: [],
      orderList: [],
    };
  },
  methods: {
    open () {
      this.$Spin.show();
      this.getDetail().then(() => {
        this.$refs.btn.click();
      }).finally(() => {
        this.$Spin.hide();
      });
    },
    // 获取需要的数据
    async getDetail () {
      let supplierDespatchId = this.dialogObj.data.supplierDespatchId;
      await this.getBoxlist(supplierDespatchId);
      await this.getPrintlist(supplierDespatchId);
    },
    // 查看箱唛
    getBoxlist (supplierDespatchId) {
      return new Promise((resolve, reject) => {
        this.axios.post(api.queryShippingMark + `?supplierDespatchId=${supplierDespatchId}`).then(({ data }) => {
          if (data.code == 0) {
            this.dialogPrintmaint = data.datas || [];
            resolve();
          } else {
            reject(new Error(data));
          }
        }).catch((err) => {
          reject(err);
        });
      });
    },
    // 打印箱唛
    getPrintlist (supplierDespatchId) {
      return new Promise((resolve, reject) => {
        this.axios.post(api.printShippingMark + `?supplierDespatchId=${supplierDespatchId}`).then(({ data }) => {
          if (data.code == 0) {
            let datas = data.datas || {};
            this.orderList = datas.supplierOrderIdList || [];
            resolve();
          } else {
            reject(new Error(data));
          }
        }).catch((err) => {
          reject(err);
        });
      });
    },
  }
};
</script>
<style scoped>
/*打印媒体查询去除页眉页脚*/
@media print {
  @page {
    size: auto;
    margin: 3mm;
  }
}
.pritmain {
  display: none;
}
.pritContent {
  page-break-before: always;
  text-align: center;
}
.box {
  display: inline-block;
  border: 1px solid #000;
  min-width: 350px;
}
.box .box-li {
  padding: 12px 6px;
}
.box .box-li:not(:last-child) {
  border-bottom: 1px solid #000;
}
</style>