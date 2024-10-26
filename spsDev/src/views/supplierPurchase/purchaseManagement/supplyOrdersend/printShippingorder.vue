<template>
  <div class="pritmain">
    <!-- 需要打印的内容 begin -->
    <div id="printShip">
      <div class="pritContent">
        <div class="flexSty">
          <barcode v-if="sendDetail.supplierDespatchId" :option="{id: 'printShippingorder',content: sendDetail.supplierDespatchId}"></barcode>
          <div class="ml10" style="font-size:18px;">发货单</div>
        </div>

        <div class="flexForm mb10">
          <div class="formBolck">
            <div class="formItem">
              <div class="formLabel">发货单号:</div>
              <div class="formCon">{{sendDetail.supplierDespatchId || '-'}}</div>
            </div>
            <div class="formItem">
              <div class="formLabel">供应商名称:</div>
              <div class="formCon">{{sendDetail.supplierName || '-'}}</div>
            </div>
            <div class="formItem">
              <div class="formLabel">公司地址:</div>
              <div class="formCon">{{sendDetail.no || '-'}} </div>
            </div>
            <div class="formItem">
              <div class="formLabel">快递公司:</div>
              <div class="formCon">{{sendDetail.logisticsName || '-'}} </div>
            </div>
            <div class="formItem">
              <div class="formLabel">包裹数量:</div>
              <div class="formCon">{{sendDetail.packageNumber || 0}} </div>
            </div>
            <div class="formItem">
              <div class="formLabel">地址(发货):</div>
              <div class="formCon">{{sendDetail.despatchWarehouse || '-'}} </div>
            </div>
            <div class="formItem">
              <div class="formLabel">发货地址:</div>
              <div class="formCon">{{sendDetail.despatcheAddress || '-'}} </div>
            </div>
            <div class="formItem">
              <div class="formLabel">发货人及电话:</div>
              <div class="formCon">{{sendDetail.despatcher || '-'}} {{sendDetail.despatcherPhone || '-'}}</div>
            </div>
          </div>
          <div class="formBolck">
            <div class="formItem">
              <div class="formLabel">备货类型:</div>
              <div class="formCon">{{sendDetail.no || '-'}}</div>
            </div>
            <div class="formItem">
              <div class="formLabel">公司名称:</div>
              <div class="formCon">{{sendDetail.no || '-'}}</div>
            </div>
            <div class="formItem">
              <div class="formLabel">送货方式:</div>
              <div class="formCon">{{sendWaylist[sendDetail.despatchType]&&sendWaylist[sendDetail.despatchType].label}}</div>
            </div>
            <div class="formItem">
              <div class="formLabel">快递单号:</div>
              <div class="formCon">{{sendDetail.trackingNumber || '-'}}</div>
            </div>
            <div class="formItem">
              <div class="formLabel">包裹重量(kg):</div>
              <div class="formCon">{{sendDetail.weight || '-'}}</div>
            </div>
            <div class="formItem">
              <div class="formLabel">地址(收货):</div>
              <div class="formCon">{{sendDetail.receiptWarehouse || '-'}}</div>
            </div>
            <div class="formItem">
              <div class="formLabel">收货地址:</div>
              <div class="formCon">{{sendDetail.receiptAddress || '-'}}</div>
            </div>
            <div class="formItem">
              <div class="formLabel">收货人及电话:</div>
              <div class="formCon">{{sendDetail.receiver || '-'}} {{sendDetail.receiverPhone || '-'}}</div>
            </div>
          </div>
        </div>

        <div class="table-list" v-for="(val, key) in orderList" :key="key">
          <div>
            <barcode :option="{id: key,content: key}"></barcode>
            <div>订单号：{{key}}</div>
          </div>

          <div class="tables">
            <div class="thead">
              <div class="tr">
                <div class="th" v-for="item in columns" :key="item.prop">{{item.label}}</div>
              </div>
            </div>

            <div class="tbody">
              <div class="tr" v-for="(item,cindex) in val" :key="cindex">
                <div class="td" v-for="child in columns" :key="'y'+child.prop">
                  <div>{{item[child.prop] || ''}}</div>
                </div>
              </div>
            </div>

          </div>

          <!-- <table border="1" cellspacing="0" cellpadding="0" class="tables">
          <thead>
            <tr>
              <th v-for="item in columns" :key="item.prop">{{item.label}}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item,cindex) in val" :key="cindex">
              <td v-for="child in columns" :key="'y'+child.prop">
                <div>{{item[child.prop] || ''}}</div>
              </td>
            </tr>
          </tbody>
        </table> -->
        </div>

        <div class="sign">
          <div class="formItem">
            <div class="formLabel">供应商签字:</div>
            <div class="formSpace"></div>
          </div>
          <div class="formItem">
            <div class="formLabel">收货人签字:</div>
            <div class="formSpace"></div>
          </div>
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
      tableList: [],
      sendDetail: {},
      orderList: {},
      printObj: {
        id: "printShip",    // 这里是要打印元素的ID
        popTitle: '打印发货单',  // 打印的标题
      },
      columns: [
        { label: '序号', prop: 'number' },
        { label: 'SKU', prop: 'skuNo' },
        { label: '供方货号', prop: 'supplierNo' },
        { label: '规格', prop: 'specifications' },
        { label: '数量', prop: 'despatchNumber' },
      ],
      sendWaylist: {
        0: { label: "快递/物流送货", value: 0 },
        1: { label: "自送", value: 1 }
      },
    };
  },
  methods: {
    open () {
      this.getSendetail();
    },
    // 获取发货单详情
    getSendetail () {
      let supplierDespatchId = this.dialogObj.data.supplierDespatchId;
      this.$Spin.show();
      this.axios.post(api.despatchqueryDetails + `?supplierDespatchId=${supplierDespatchId}`).then(({ data }) => {
        if (data.code == 0) {
          let obj = data.datas || {};
          this.sendDetail = obj.despatchDetails || {};

          let orderObj = {};
          let list = obj.orderInfoList || [];
          list.forEach((k, i) => {
            if (!orderObj[k.supplierOrderId]) {
              orderObj[k.supplierOrderId] = [];
            }
            orderObj[k.supplierOrderId].push(k);
          });
          Object.keys(orderObj).forEach(k => {
            let [totalDespatchNumber, totalskuNo] = [0, 0];
            orderObj[k].forEach((j, y) => {
              orderObj[k][y].number = y + 1;
              totalDespatchNumber += j.despatchNumber - 0;
              totalskuNo += 1;
            });
            orderObj[k].push({
              number: "合计",
              skuNo: totalskuNo,
              despatchNumber: totalDespatchNumber
            });
          });
          this.orderList = orderObj;
          this.$nextTick(() => {
            this.$refs.btn.click();
          });
        }
      }).finally(() => {
        this.$Spin.hide();
      });
    }
  }
};
</script>
<style scoped>
/*去除页眉页脚*/
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
  padding: 20px 10px;
}
.flexSty {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}
.flexForm {
  display: flex;
}
.flexForm .formBolck {
  flex: 1;
}
.formItem {
  display: flex;
  margin-bottom: 10px;
}
.formItem .formLabel {
  width: 90px;
  text-align: right;
}
.formItem .formCon {
  margin-left: 10px;
  flex: 1;
  flex-wrap: wrap;
}
.formItem .formSpace {
  margin-left: 10px;
  width: 200px;
}

.tables {
  margin: 20px 0;
  border-top: 1px solid #000;
  border-left: 1px solid #000;
}
.thead .tr,
.tbody .tr {
  display: flex;
  align-items: center;
}

.tables .th,
.tables .td {
  flex: 1;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border-right: 1px solid #000;
  border-bottom: 1px solid #000;
  box-sizing: border-box;
}
.tables .th {
  background-color: #f8f8f9;
}
.tables .td {
  background-color: #ffffff;
}
.sign {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-end;
}
</style>