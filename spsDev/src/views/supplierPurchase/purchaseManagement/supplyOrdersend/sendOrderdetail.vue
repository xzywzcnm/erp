<template>
  <div class="mainBody">

    <Modal class="modal-main" v-model="modelVisible" :mask-closable="false" title="发货单详情" :width="1000">
      <div class="content">
        <div class="sendOrderTitle" v-if="currentData.source == 2"><h2>发货单明细</h2></div>
        <div class="cards">
          <div>
            <h3 class="titleLeft">基本信息</h3>
          </div>
          <div class="sendOrderContent">
            <Form ref="formValidates" :model="sendDetail" :label-width="90" class="fmb0 mb10">
              <Row>
                <Col span="8">
                <FormItem label="发货单号：">
                  <span>{{sendDetail.supplierDespatchId || '-'}}</span>
                </FormItem>
                <FormItem label="快递单号：">
                  <span>{{sendDetail.trackingNumber || '-'}}</span>
                </FormItem>
                </Col>
                <Col span="8">
                <FormItem label="送货方式：">
                  <span v-if="currentData.source == 2">{{sendDetail.despatchType}}</span>
                  <span>{{sendWaylist[sendDetail.despatchType]&&sendWaylist[sendDetail.despatchType].label}}</span>
                </FormItem>
                <FormItem label="包裹数量：">
                  <span>{{sendDetail.packageNumber || 0}}</span>
                </FormItem>
                </Col>
                <Col span="8">
                <FormItem label="快递公司：">
                  <span>{{sendDetail.logisticsName || '-'}}</span>
                </FormItem>
                <FormItem label="包裹重量(kg)：">
                  <span>{{sendDetail.weight || 0}}</span>
                </FormItem>
                </Col>
              </Row>
            </Form>
          </div>
          
        </div>
        <div class="cards">
          <div><!-- class="title" -->
            <h3 class="titleLeft">订单信息</h3>
          </div>
          <div class="table-box sendOrderContent">
            <Table highlight-row max-height="460" :columns="columns" :data="tableList" :border="true" :loading="tableLoading"></Table>
          </div>
        </div>
      </div>
      <div slot="footer" :style="dialogObj.source === 2 ? 'text-align: right':'text-align: center'">
        <Button type="primary" @click="outputOrder()" :loading="exportLoading" v-if="dialogObj.source === 0 && getPermission('supplierPurchase_exportOrderInfo')">导出订单信息</Button>
        <Button type="primary" @click="outputOrder()" :loading="exportLoading" v-if="dialogObj.source === 1 && getPermission('supplyOrdersend_exportOrderInfo')">导出订单信息</Button>
        <!-- <Button type="primary" @click="printSend()">打印发货单</Button> -->
        <Button @click="modelVisible = false">关闭</Button>
      </div>
    </Modal>

  </div>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
export default {
  mixins: [Mixin],
  data () {
    return {
      tableLoading: false,
      columns: [
        {
          width: 70,
          title: '序号',
          key: 'number'
        },
        {
          title: '订单号',
          key: 'supplierOrderId'
        },
        {
          title: 'SKU',
          key: 'skuNo'
        },
        {
          title: '供方货号',
          key: 'supplierNo'
        },
        {
          title: '规格',
          key: 'specifications',
          render: (h, params) => {
            return h('div', {
              class: 'textOver',
              attrs: {title: params.row.specifications}
            }, params.row.specifications);
          }
        },
        {
          title: '数量',
          key: 'despatchNumber'
        },
      ],
      tableList: [],
      sendDetail: {},
      sendWaylist: {
        0: { label: "快递/物流送货", value: 0 },
        1: { label: "自送", value: 1 }
      },
      exportLoading: false,
      modelVisible: false,
      currentData: {},
    };
  },
  props: {
    dialogObj: {
      type: Object,
      default () {
        return {
          source: null, // 代表由哪个页面调用此组件 0代表供应商订单管理，1代表供应商发货单列表，2代表采购单-采购单详情
          modelVisible: false,
          data: {}
        };
      }
    },
    isVisible: {
      type: Boolean,
      default () { return false }
    },
  },
  watch: {
    "isVisible": {
      handler (newVal, oldVal) {
        if (newVal) {
          this.handleReset();
          this.modelVisible = this.isVisible;
        }
      },
      immediate: true
    },
    modelVisible(nV, oV) {
      this.$emit("update:isVisible", nV);
    }
  },
  methods: {
    // 重置
    handleReset () {
      this.getSendetail();
    },
    // 打印发货单
    printSend () {
      this.$emit("printSend", this.dialogObj.data);
    },
    // 获取发货单详情
    getSendetail () {
      let supplierDespatchId = this.dialogObj.data.supplierDespatchId || this.dialogObj.data.queryOrderInfoListVO.supplierDespatchId;
      this.tableLoading = true;
      this.axios.post(api.despatchqueryDetails + `?supplierDespatchId=${supplierDespatchId}`).then(({ data }) => {
        if (data.code == 0) {
          let obj = data.datas || {};
          this.sendDetail = obj.despatchDetails || {};

          let arr = obj.orderInfoList || [];
          let [orderObj, totalDespatchNumber] = [{}, 0];
          arr.forEach((k, i) => {
            arr[i].number = i + 1;
            totalDespatchNumber += k.despatchNumber - 0;
            orderObj[k.supplierOrderId] = k;
          });

          arr.push({
            number: "合计",
            supplierOrderId: Object.keys(orderObj).length,
            despatchNumber: totalDespatchNumber
          });
          this.tableList = arr;
        }
      }).finally(() => {
        this.tableLoading = false;
      });
      
    },
    // 导出订单信息
    outputOrder () {
      let supplierDespatchId = this.dialogObj.data.supplierDespatchId;
      this.exportLoading = true;
      this.axios.post(api.exportOrderInfo + '?supplierDespatchId=' + supplierDespatchId).then(({ data }) => {
        if (data.code == 0) {
          this.$Message.info('导出成功');
        }
      }).finally(err => {
        this.exportLoading = false;
      });
    }
  }
};
</script>
<style scoped>
.cards .title {
  display: flex;
  align-items: center;
  padding: 6px 14px;
  background-color: #f3f3f3;
  margin-bottom: 12px;
}
.cards .title h2 {
  font-size: 14px;
}
.sendOrderContent {
  margin: 20px;
}
.sendOrderContent /deep/ .ivu-form-item-label{
  width: 95px !important;
}
.sendOrderTitle {
  text-align: center;
  margin-bottom: 20px;
}
</style>