import api from '@/api/api';

export default {
  data () {
    return {
      placeholderUrl: require('../../../public/static/images/placeholder.jpg'),
      localeUrl: window.location.origin
                ? window.location.origin
                : window.location.protocol +
                  '//' +
                  window.location.hostname +
                  (window.location.port ? ':' + window.location.port : '') // 兼容性写法
    };
  },
  methods: {
    batchPrintFn () {
      // 批量打印拣货单函数
      let obj = {
        pickingGoodsNos: this.tableSltData.map(
          val => val.pickingGoodsNo
        ),
        status: '1',
        isPage: '1'
      };
      this.axios
        .post(api.get_pickListDtl, obj)
        .then(res => {
          return new Promise((resolve, reject) => {
            if (res.data.code === 0) {
              this.batchPrintData = res.data.datas;
            }
            resolve(res);
          });
        })
        .then(res1 => {
          if (res1.data.code === 0) {
            this.getBar().then(res => {
              this.print();
            });
          }
        });
    },
    getBar () {
      return new Promise(resolve => {
        let arr = this.batchPrintData.map(val => val.pickingGoodsNo);
        this.axios.post(api.getBarCode, arr).then(res => {
          if (res.data.code === 0) {
            this.batchPrintData.forEach(val1 => {
              res.data.datas.forEach(val2 => {
                let key = Object.getOwnPropertyNames(val2)[0];
                if (val1.pickingGoodsNo === key) {
                  let value = val2[key] ? val2[key] : '';
                  this.$set(val1, 'barcode', value);
                }
              });
            });
            console.log(this.batchPrintData);
            resolve(this.batchPrintData);
          }
        });
      });
    },
    print () {
      let v = this;
      let instance = this.axios.create({
        timeout: 3000,
        transformRequest: [
          function (data) {
            let ret = '';
            for (let it in data) {
              ret +=
                                encodeURIComponent(it) +
                                '=' +
                                encodeURIComponent(data[it]) +
                                '&';
            }
            return ret;
          }
        ],
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      instance
        .post('http://localhost:10099/print', {
          content: this.htm5Doc(),
          postId: '1'
        })
        .then(response => {
          if (response.status === 200) {
            this.changePrintStatus();
          }
        })
        .catch(() => {
          v.axios.get(api.get_downloadPrint).then(response => {
            if (response.data.code === 0) {
              v.$Modal.info({
                title: '提示',
                okText: '取消',
                render: (h, params) => {
                  return h(
                    'div',
                    {
                      class: 'normalTop20'
                    },
                    [
                      h(
                        'div',
                        {
                          class:
                                                        'flexBox flexBoxJustContent',
                          style: {
                            fontSize: '16px'
                          }
                        },
                        '该功能需使用打印控件，请下载安装'
                      ),
                      h(
                        'a',
                        {
                          attrs: {
                            href:
                                                            v.$store.state
                                                              .erpConfig
                                                              .filenodeViewTargetUrl +
                                                            response.data.datas,
                            target: '_blank'
                          },
                          class:
                                                        'flexBox flexBoxJustContent normalTop',
                          style: {
                            fontSize: '16px',
                            fontWeigh: 'bold'
                          }
                        },
                        '点击下载'
                      ),
                      h(
                        'div',
                        {
                          class:
                                                        'flexBox flexBoxJustContent normalTop',
                          style: {
                            fontSize: '16px'
                          }
                        },
                        '如果已安装，请开启打印控件'
                      ) // 如果已安装，请开启打印控件
                    ]
                  );
                }
              });
            }
          });
        });
    },
    changePrintStatus () {
      if (this.pickingGoodsNos.length) {
        let paramsObj = {
          pickingGoodsNos: this.pickingGoodsNos
        };
        this.axios.post(api.printListNum, paramsObj).then(res => {
          if (res.data.code === 0) {
            this.$Message.success(res.data.message);
          }
        });
      }
    },
    forTable (tableList) {
      let str = '';
      for (let i = 0; i < tableList.length; i++) {
        let val = tableList[i];
        str += `
          <tr>
            <td align='center' style='width: 112px;word-break: break-all;'>${
  val.warehouseBlockName
}</td>
            <td align='center' style='width: 160px;'>${
  val.warehouseLocationName
}</td>
             <td align='center' style='width: 112px;word-break: break-all;'>${
  val.goodsSku
}</td>
                <td align='center'>${val.expectedNumber}</td>
                 <td align='center' style='width: 112px;word-break: break-all;'>${
                     val.goodsCnDesc ? val.goodsCnDesc : ''
}</td>
            <td align='center' style='width: 112px;word-break: break-all;'>${
                val.goodsAttributes ? val.goodsAttributes : ''
}</td>
           
           
            <td align='center' style='width: 112px;word-break: break-all;'>${
                val.goodsEnDesc ? val.goodsEnDesc : ''
}</td>
            <td align='center'>${val.receiptBatchNo}</td>
          </tr>
		    `;
      }
      return str;
    },
    htm5Doc () {
      return (
        `<!DOCTYPE html>
        <html lang="zh-CN">
          <head>
          <meta charset="UTF-8">
          <title>Title</title>
         <style type="text/css">
        @media print {.btn{display: none;}}
         table{
    -webkit-border-horizontal-spacing: 0px;
    -webkit-border-vertical-spacing: 0px;
    border-top-width: 0px;
    border-right-width: 0px;
    border-bottom-width: 0px;
    border-left-width: 0px;
  }
  .table-cell{display: table-cell}
  table{
            -webkit-border-horizontal-spacing: 0px;
            -webkit-border-vertical-spacing: 0px;
            border-top-width: 0px;
            border-right-width: 0px;
            border-bottom-width: 0px;
            border-left-width: 0px;
            border-top: 1px solid #9a9a9a;
            border-left: 1px solid #9a9a9a;
        }
        .table-border{border: 1px solid #666;border-bottom: 0;border-right: 0}
        table td, table th {
            border-bottom: 1px solid #9a9a9a;
            border-right:1px solid #9a9a9a;
        }
        .wid-block {width: 350px;display: inline-block}
        .wid1-block {width: 250px;display: inline-block}
        .bug-free{background:url('${window.location.origin}/wms-service/static/css/printFont/IDAutomationC128S.eot?#iefix')}
         #printSkuBarCode{background:url('${window.location.origin}/wms-service/static/css/printFont/IDAutomationC128S.eot?#iefix')}
        @font-face {
            font-family: 'IDAutomationC128S';
            src: url('${window.location.origin}/wms-service/static/css/printFont/IDAutomationC128S.eot'); /* IE9 Compat Modes */
            src: url('${window.location.origin}/wms-service/static/css/printFont/IDAutomationC128S.eot?#iefix') format('embedded-opentype'), /* IE6-IE8 */
            url('${window.location.origin}/wms-service/static/css/printFont/IDAutomationC128S.woff') format('woff'), /* Modern Browsers */
            url('${window.location.origin}/wms-service/static/css/printFont/IDAutomationC128S.ttf') format('truetype'), /* Safari, Android, iOS */
            url('${window.location.origin}/wms-service/static/css/printFont/IDAutomationC128S.svg#IDAutomationC128S') format('svg'); /* Legacy iOS */
        }
        #printSkuBarCode{background:url('${window.location.origin}/wms-service/static/css/printFont/IDAutomationSC39S.eot?#iefix')}
        @font-face {
            font-family: 'IDAutomationSC39S';
            src: url('${window.location.origin}/wms-service/static/css/printFont/IDAutomationSC39S.eot'); /* IE9 Compat Modes */
            src: url('${window.location.origin}/wms-service/static/css/printFont/IDAutomationSC39S.eot?#iefix') format('embedded-opentype'), /* IE6-IE8 */
            url('${window.location.origin}/wms-service/static/css/printFont/IDAutomationSC39S.ttf') format('truetype');
        }
    </style>
          </head>
          <body>` +
                this.htmlText() +
                `
        </body>
        </html>`
      );
    },
    htmlText () {
      let str = '';
      let v = this;
      // printPickingGoodsNo
      let text1 = '物流商'; // 物流商
      let text2 = '等'; // 等
      let text3 = '物流渠道'; // 物流渠道
      let text4 = '多种物流渠道'; // 多种物流渠道
      for (let i = 0; i < this.batchPrintData.length; i++) {
        let item = this.batchPrintData[i];
        str += `<div style='background-color: #ccc;height: 100%;font-size: 16pt;${
                    i !== 0 ? 'page-break-before:always;' : ''
        }'>
          <div style='width: 1000px;background-color: #fff;margin: 0 auto;height: 100%;padding: 20px;position: relative'>
            <div style='font-size: 24px;font-weight: 600;border-bottom: 1px solid #ccc;padding-bottom: 15px'>
              <span>拣货单:</span><span>${item.pickingGoodsNo}</span>
              <font id='printSkuBarCode' style='font-family: IDAutomationC128S;margin-left: 10px'>${
  item.barcode
}</font>
            </div>
            
            <div style='padding: 20px 0;border-bottom: 1px solid #ccc'>
              <div>
                <span><span class='textTitle'>拣货仓库：</span><span>${
  item.warehouseName
}</span></span>
              </div>
              <div>
              <span  class="wid-block"><span class='textTitle'>物流商:</span><span>${
                  item.carrierNameList.length > 1
                      ? text1 + '，' + item.carrierNameList[0] + text2
                      : item.carrierNameList[0]
}</span></span>
</div>
              <div>
              <div>
              <span  class="wid-block"><span class='textTitle'>${text3}:</span><span>${
                    item.carrierMethodNameList.length > 1
                        ? '' +
                          text4 +
                          '，' +
                          item.carrierMethodNameList[0] +
                          text2
                        : item.carrierMethodNameList[0]
}</span></span>
</div>
              <div>
                <span  class="wid-block"><span class='textTitle'>拣货单类型：</span><span>${
                    item.packageGoodsType === 'MM' ? '多品' : '单品'
}</span></span>
                <span  class="wid1-block"><span class='textTitle'>出库单数量：</span><span>${
  item.pickingNumber
}</span></span>
              </div>
              <div>
                <span class="wid-block"><span class='textTitle'>创建时间：：</span><span>${v.$uDate.dealTime(
    item.createdTime
  )}</span></span>
                <span class="wid1-block"><span class='textTitle'>SKU总数：</span><span>${
  item.goodsQuantityNumber
}</span></span>
             
              </div>
              <div>
                <span class="wid-block"><span class='textTitle'>拣货人员：</span><span>${
                    item.pickingGoodsUser !== null ? item.pickingGoodsUser : ''
}</span></span>
                <span><span class='textTitle'>SKU种类：</span><span>${
  item.goodsSkuNumber
}</span></span>
              </div>
            </div>
              <table width='100%'  class="table-border" style='margin-top: 10px' border="0">
              <thead style='background-color: #ccc'>
              <tr>
                <th style='padding: 6px'>所在库区</th>
                <th style='padding: 6px'>所在库位</th>
                 <th style='padding: 6px'>SKU</th>
                <th style='padding: 6px;width: 110px;'>需拣货数量</th>
                <th style='padding: 6px;'>中文描述</th>
                
                <th style='padding: 6px'>产品规格</th>
               
                
                <th style='padding: 6px'>英文描述</th>
                <th style='padding: 6px'>批次号</th>
               
              </tr>
              </thead>
              <tbody>
              ${this.forTable(item.queryByGoodsDetailResultPage.list)}
              </tbody>
              </table>
              <div style='position: absolute;right: -100px;top:0'>
              </div>
              </div>
              </div>`;
      }
      console.log(str);
      return str;
    }
  }
};
