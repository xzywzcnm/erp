<style>
.textTitle {
  font-size: 15px;
  width: 150px;
}
</style>
<template>
  <div style='background-color: #ccc;padding: 34px 56px'>
    <div style='width: 1000px;background-color: #fff;margin: 0 auto;height: 100%;padding: 34px 56px;position: relative'>
      <div id='printBox'>
        <div style='font-size: 24px;font-weight: 600;padding-bottom: 15px;text-align: center;'>
          <span>备货建议单</span>
          <!--<font id='printSkuBarCode' style='font-family: IDAutomationC128S;margin-left: 10px'>{{barCodeString}}</font>-->
          <!-- <font id='printSkuBarCode' style='font-family: IDAutomationC128S;margin-left: 10px' v-html='barCodeString'></font> -->
          <!--<font id='printSkuBarCode' style='font-family: IDAutomationC128S;margin-left: 10px'>{{barCodeString}}</font>-->
          <!--<span v-if='type==="pickList"' id='printSkuBarCode' style='font-family: IDAutomationC128S;margin-left: 10px'>{{detailInfo.pickingGoodsNo}}</span>-->
          <!--<span v-if='type==="checkList"' id='printSkuBarCode' style='font-family: IDAutomationC128S;margin-left: 10px'>{{detailInfo.inventoryCheckNo}}</span>-->
        </div>
        <!--表格-->
        <table width='100%' style='padding-top: 10px' cellpadding='0' cellspacing='0' border='0'>
          <thead style='font-size: 14px;'>
            <tr>
              <td colspan='5' style='padding: 10px 15px;border:1px solid #e9eaec;'>备货日期:</td>
              <td colspan='3' style='padding: 10px 15px;border:1px solid #e9eaec;'></td>
            </tr>
            <tr>
              <th style='padding: 6px 0;border:1px solid #e9eaec;' width='120'>图片</th>
              <th style='padding: 6px 0;border:1px solid #e9eaec;'>SKU编号</th>
              <th style='padding: 6px 0;border:1px solid #e9eaec;'>商品名称</th>
              <th style='padding: 6px 0;border:1px solid #e9eaec;'>备货仓库</th>
              <th style='padding: 6px 0;border:1px solid #e9eaec;'>日均销量</th>
              <th style='padding: 6px 0;border:1px solid #e9eaec;'>备货建议数量</th>
              <th style='padding: 6px 0;border:1px solid #e9eaec;'>实际备货数量</th>
              <th style='padding: 6px 0;border:1px solid #e9eaec;'>负责人</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for='(val,i) in stockData' :key='i'>
              <td align='center' style='padding: 6px 0;border:1px solid #e9eaec;'><img :src="val.thumbUrl" alt="" height='80'></td>
              <td align='center' style='padding: 6px 0;border:1px solid #e9eaec;'>{{ val.skuNo }}</td>
              <td align='center' style='padding: 6px 0;border:1px solid #e9eaec;'>{{ val.goodsName }}</td>
              <td align='center' style='padding: 6px 0;border:1px solid #e9eaec;'>{{ val.backupWarehouseName }}</td>
              <td align='center' style='padding: 6px 0;border:1px solid #e9eaec;'>{{ val.averageDailySales }}</td>
              <td align='center' style='padding: 6px 0;border:1px solid #e9eaec;'>{{ val.proposedQuantity }}</td>
              <td align='center' style='padding: 6px 0;border:1px solid #e9eaec;'>{{ val.replenishQuantity }}</td>
              <td align='center' style='padding: 6px 0;border:1px solid #e9eaec;'>{{ val.salesmanName }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style='position: absolute;right: -100px;top:0'>
        <div style='margin-bottom: 10px'>
          <Button type='primary' @click='print'>打印</Button>
        </div>
        <!-- <div style='margin-bottom: 10px'>
          <Button type='primary' @click='download'>下载</Button>
        </div> -->
        <div>
          <Button type='primary' @click='cancelPrint'>取消打印</Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api/api';
import common from '@/components/mixin/common_mixin';
// import JsPDF from 'jspdf';
export default {
  mixins: [common],
  data () {
    return {
      stockData: [],
      totalItem: '',
      detailInfo: '',
      barCodeString: '',
      type: ''
    };
  },
  computed: {
    htm5Doc () {
      return (`<!DOCTYPE html>
        <html lang="en">
          <head>
          <meta charset="UTF-8">
          <title>Title</title>
          <style type="text/css">
            .bug-free{background:url('http://10.0.0.96/static/theme/ocean/css/IDAutomationC128S.eot?#iefix')}
            #printSkuBarCode{background:url('http://10.0.0.96/static/theme/ocean/css/IDAutomationC128S.eot?#iefix')}
            @font-face {
              font-family: 'IDAutomationC128S';
              src: url('http://10.0.0.96/static/theme/ocean/css/IDAutomationC128S.eot'); /* IE9 Compat Modes */
              src: url('http://10.0.0.96/static/theme/ocean/css/IDAutomationC128S.eot?#iefix') format('embedded-opentype'), /* IE6-IE8 */
              url('http://10.0.0.96/static/theme/ocean/css/IDAutomationC128S.woff') format('woff'), /* Modern Browsers */
              url('http://10.0.0.96/static/theme/ocean/css/IDAutomationC128S.ttf') format('truetype'), /* Safari, Android, iOS */
              url('http://10.0.0.96/static/theme/ocean/css/IDAutomationC128S.svg#IDAutomationC128S') format('svg'); /* Legacy iOS */
            }
          </style>
          </head>
          <body>` + this.htmlText + `
        </body>
        </html>`);
    },
    forTable () {
      let str = '';
      for (let i = 0; i < this.stockData.length; i++) {
        let val = this.stockData[i];
        str += `
		      <tr>
            <td align='center' style='padding: 6px 0;border:1px solid #e9eaec;'><img src=${val.thumbUrl} alt="" height='80'></td>
            <td align='center' style='padding: 6px 0;border:1px solid #e9eaec;'>${val.skuNo}</td>
            <td align='center' style='padding: 6px 0;border:1px solid #e9eaec;'>${val.goodsName}</td>
            <td align='center' style='padding: 6px 0;border:1px solid #e9eaec;'>${val.backupWarehouseName}</td>
            <td align='center' style='padding: 6px 0;border:1px solid #e9eaec;'>${val.averageDailySales}</td>
            <td align='center' style='padding: 6px 0;border:1px solid #e9eaec;'>${val.proposedQuantity}{</td>
            <td align='center' style='padding: 6px 0;border:1px solid #e9eaec;'>${val.replenishQuantity}</td>
            <td align='center' style='padding: 6px 0;border:1px solid #e9eaec;'>${val.salesmanName}</td>
          </tr>
		    `;
      }
      return str;
    },
    htmlText () {
      let str = `<div style='background-color: #ccc;height: 100%;padding: 34px 56px'>
        <div style='width: 1000px;background-color: #fff;margin: 0 auto;height: 100%;padding: 34px 56px;position: relative'>
          <div style='font-size: 24px;font-weight: 600;padding-bottom: 15px;text-align: center;'>
            <span>备货建议单</span>
          </div>
          <table width='100%' style='padding-top: 10px' cellpadding='0' cellspacing='0' border='0'>
            <thead style='style='font-size: 14px;''>
              <tr>
                <td colspan='5' style='padding: 10px 15px;border:1px solid #e9eaec;'>备货日期:</td>
                <td colspan='3' style='padding: 10px 15px;border:1px solid #e9eaec;'> </td>
              </tr>
              <tr>
                <th style='padding: 6px 0;border:1px solid #e9eaec;' width='120'>图片</th>
                <th style='padding: 6px 0;border:1px solid #e9eaec;'>SKU编号</th>
                <th style='padding: 6px 0;border:1px solid #e9eaec;'>商品名称</th>
                <th style='padding: 6px 0;border:1px solid #e9eaec;'>备货仓库</th>
                <th style='padding: 6px 0;border:1px solid #e9eaec;'>日均销量</th>
                <th style='padding: 6px 0;border:1px solid #e9eaec;'>备货建议数量</th>
                <th style='padding: 6px 0;border:1px solid #e9eaec;'>实际备货数量</th>
                <th style='padding: 6px 0;border:1px solid #e9eaec;'>负责人</th>
              </tr>
            </thead>
            <tbody>
              ${this.forTable}
            </tbody>
          </table>
        </div>
      </div>`;
      return str;
    }
  },
  created () {
    // let obj = this.$route.query.data;
    this.type = this.$route.query.type;
    document.title = '打印页面';
    this.init();
  },
  methods: {
    init () {
      let v = this;
      v.stockData = JSON.parse(localStorage.getItem('printData'));
      if (v.stockData.length == 0) {
        v.$Message.error({
          content: '未选择打印数据！！',
          duration: 10,
          closable: true,
          onClose: () => {
          }
        });
      }
      var instance = v.axios.create({});
      instance.post('http://localhost:10099/check').then(res => {
      }).catch(error => {
        v.$Modal.info({
          width: 400,
          content: `请下载打印控件<a href=${window.location.origin}/file/tongtoolPrinter/tongtoolPrinter.exe>点击下载</a>`,
          okText: '关闭',
          onOk: v.cancelPrint
        });
      });
    },
    print () {
      let instance = this.axios.create({
        timeout: 3000,
        transformRequest: [
          function (data) {
            let ret = '';
            for (let it in data) {
              ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&';
            }
            return ret;
          }
        ],
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      instance.post('http://localhost:10099/print', {
        content: this.htm5Doc,
        postId: '1'
      }).then(response => {
        if (response.status === 200) {
          let obj = this.$route.query.data;
          this.changePrintStatus(obj);
        }
      });
    },
    cancelPrint () {
      localStorage.removeItem('printData');
      let userAgent = navigator.userAgent;
      if (userAgent.indexOf('Firefox') != -1 || userAgent.indexOf('Chrome') != -1) {
        window.location.href = 'about:blank';
        window.close();
      } else {
        window.opener = null;
        window.open('', '_self');
        window.close();
      }
    },
    changePrintStatus (obj) {
      let paramsObj = {
        pickingGoodsNos: [obj]
      };
      this.axios.post(api.printListNum, paramsObj).then(res => {
        if (res.data.code === 0) {
          this.$Message.success(res.data.message);
        } else {
          this.$Message.warning({
            content: res.data.message,
            duration: 5
          });
        }
      });
    },
    download () {
      /* var pdf = new JsPDF('p', 'pt', 'a4');
       pdf.internal.scaleFactor = 2;
       var options = {
       pagesplit: true
       };
       let node = document.querySelector('#printBox');
       node.style.backgroundColor = '#fff';
       node.style.padding = '20px 40px';
       node.style.margin = '0 auto';
       pdf.addHTML(node, options, function () {
       pdf.save('web.pdf');
       }); */
    }
  }
};
</script>
