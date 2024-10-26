<template>
  <!--打印箱唛-->
  <Modal v-model="printCaseMarkTalg" class-name="printCaseMarkStyle" title="打印箱唛" width="500" :transfer="false" :mask-closable="false">
    <div class="printCaseMarkBox" ref="container" :style="styles">
      <p class="print_item">{{ '创建时间：' + details.createdTime }}</p>
      <span class="bar_code" style='font-family: IDAutomationC128S; margin-top: 10px;'>{{ details.skuBarcode }}</span>
      <p class="print_item" style="margin: 10px auto 5px">{{ details.pickupOrderNumber }}</p>
      <p class="print_item">{{ '出库单数量：' + details.packageQuantity }}</p>
    </div>
    <div slot="footer" style="text-align: center;">
      <Button @click="closeBtn">关闭</Button>
      <Button type="primary" @click="printBtn">打印</Button>
    </div>
    <div ref="tagTemp" style="display: none;"></div>
  </Modal>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  name: 'printCaseMarkModal',
  mixins: [Mixin],
  props: {
    wmsPickupOrderId: {
      type: String,
      default: null
    }
  },
  data () {
    return {
      details: {},
      printCaseMarkTalg: false,
      styles: {
        paddingTop: '15px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '17px',
        color: '#333',
        minWidth: '400px'
      }
    };
  },
  created () {
    this.getPrintData();
  },
  methods: {
    // 派发关闭打印箱唛的弹窗
    closeBtn () {
      this.printCaseMarkTalg = false;
      this.$emit('closeBtn', false);
    },
    // 获取打印箱唛的详情的数据
    getPrintData () {
      let v = this;
      v.axios.put(api.put_wmsPickupOrder_printWmsPickupOrder + `${v.wmsPickupOrderId}`).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          data.createdTime = data.createdTime
            ? v.$uDate.getDataToLocalTime(data.createdTime, 'fulltime')
            : '';
          data.skuBarcode = v.entityToString(data.wmsPickupOrderNumberBarcode);
          v.details = data;
          v.printCaseMarkTalg = true;
        }
      });
    },
    htm5Doc () {
      let path = `${window.location.origin}/wms-service/static/printFont/`;
      return (`<!DOCTYPE html>
                  <html lang="en">
                    <head>
                    <meta charset="UTF-8">
                    <title>Title</title>
                    <style type="text/css">
                    *{margin: 0;padding: 0}
                @media print {.btn{display: none;}}
                  @font-face {
                  font-family: 'IDAutomationC128S';
                  src: url('${path}IDAutomationC128S.eot'); /* IE9 Compat Modes */
                  src: url('${path}IDAutomationC128S.eot?#iefix') format('embedded-opentype'), /* IE6-IE8 */
                  url('${path}IDAutomationC128S.woff') format('woff'), /* Modern Browsers */
                  url('${path}IDAutomationC128S.ttf') format('truetype'), /* Safari, Android, iOS */
                  url('${path}IDAutomationC128S.svg#IDAutomationC128S') format('svg'); /* Legacy iOS */
                }

                @font-face {
                  font-family: 'IDAutomationSC39S';
                  src: url('${path}IDAutomationSC39S.eot'); /* IE9 Compat Modes */
                  src: url('${path}IDAutomationSC39S.eot?#iefix') format('embedded-opentype'), /* IE6-IE8 */
                  url('${path}IDAutomationSC39S.ttf') format('truetype');
                }
                </style>
                    </head>
                     <body class="box">` + this.htmlText() + `
                     </body>
                  </html>`);
    },
    htmlText (callback) {
      let v = this;
      let str = '';
      let dom = v.deepCopy(v.$refs.container);
      let tagTemp = v.$refs.tagTemp;
      tagTemp.innerHTML = dom.parentNode.innerHTML;
      let container = tagTemp.childNodes[0];
      if (v.details) {
        container.childNodes[0].innerText = '创建时间：' + v.details.createdTime;
        container.childNodes[1].innerText = v.details.skuBarcode;
        container.childNodes[2].innerText = v.details.pickupOrderNumber;
        container.childNodes[3].innerText = '出库单数量：' + v.details.packageQuantity;
        callback && callback();
        str += tagTemp.innerHTML;
        return str;
      }
    },
    // 打印
    printBtn () {
      let v = this;
      let instance = v.axios.create({
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
        content: v.htm5Doc(),
        postId: '1'
      }).then(response => {
        if (response.status === 200) {
          v.$Message.success('操作成功');
          v.closeBtn();
        }
      }).catch(() => {
        let url = this.$store.state.erpConfig.filenodeViewTargetUrl + '/wms-service/tool/TongtoolPrinter.exe';
        v.$Modal.info({
          width: 400,
          content: `请下载打印控件<a href=${url}>点击下载</a>`
        });
      });
    }
  }
};
</script>

<style lang="less">
/deep/ .printCaseMarkStyle {
  .printCaseMarkBox {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-size: 17px;
    color: #333;

    .print_item {
      margin-bottom: 10px;
    }

    .bar_code {
      padding: 5px 10px;
    }
  }
}
</style>
