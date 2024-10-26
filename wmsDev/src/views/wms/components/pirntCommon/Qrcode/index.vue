<template>
  <div>
    <div class="qrcode" ref="qrCodeUrl"></div>
  </div>
</template>

<script>
import QRCode from 'qrcodejs2'
export default {
  props: {
    // option: {
    //   type: Object,
    //   default () {
    //     return {
    //       id: '',//svg id
    //       content: '', //条形码内容
    //       noCodesvg: false,//条形码是否显示下方文字
    //       pindex: null,//条形码位置
    //     };
    //   }
    // },
    // config: {
    //   type: Object,
    //   default () { return {}; }
    // }
  },
  data () {
    return {
      // barcodeConfig: {
      //   format: "CODE128",  //条形码的格式
      //   width: 2, //线宽
      //   height: 40,  //条码高度
      //   displayValue: false, //是否显示文字信息
      //   margin: 0,
      //   textShow: false,
      //   valid: this.validCode
      // },
    };
  },
  created () { },
  methods: {
    creatQrCode () {
      // eslint-disable-next-line no-unused-vars
      var qrcode = new QRCode(this.$refs.qrCodeUrl, {
        text: 'xxxx', // 需要转换为二维码的内容
        width: 60,
        height: 60,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
      })
    }
    // validCode (e) {
    //   this.$emit('valid', e, this.option.pindex);
    // },
    // init () {
    //   let [data, config, barcodeConfig] = [this.option, this.config, this.barcodeConfig];
    //   let codeOption = { 60: { 20: 1, 30: 0.9 }, 70: { 20: 1.2, 30: 1 } };
    //   Object.keys(config).forEach(k => {
    //     config[k] ? barcodeConfig[k] = config[k] : '';
    //   });
    //   if (barcodeConfig.codeWidth && data.content && data.content.length) {
    //     let codeWidth = codeOption[barcodeConfig.codeWidth] || {};
    //     Object.keys(codeWidth).forEach(k => {
    //       if (data.content.length > k) {
    //         barcodeConfig.width = codeWidth[k];
    //       }
    //     })
    //   }
    //   console.log(barcodeConfig, "barcodeConfig打印配置")
    //   JsBarcode('#' + data.id, data.content, barcodeConfig);
    // },
    // drawSvg (id, content) {
    //   let dom = document.getElementById(id);// 二维码
    //   let container = document.querySelector('.container'); // 整个标签快
    //   let width = (dom ? dom.clientWidth : container.clientWidth);
    //   width = Math.floor(width);

    //   let svg = dom.parentNode.innerHTML;
    //   let str = `
    //     <div style="position: absolute;bottom:${this.config.svgMarginTop};left:0;">
    //       <svg :id="option.id+'svg'" height="10" width="${width}">
    //         <text x="0" y="8" style="fill:black; font-size:${this.config.svgFontSize}; font-weight:bold;" lengthAdjust="spacing" textLength="${width}" stroke-width="3" stroke="balck">${content}</text>
    //       </svg>
    //     </div>
    //   `;
    //   dom.parentNode.innerHTML = svg + str;
    // },
  },
  mounted () {
    // this.init();
    // let { id, content, noCodesvg } = this.option;
    // if (!noCodesvg) this.drawSvg(id, content);
    // var qrcode = new QRCode.toCanvas(document.getElementById('qrcode'), 'https://www.baidu.com', function (error) {
    //   if (error) console.error(error)
    //   console.log('success!');
    // })
    this.creatQrCode();
  }
};
</script>
<style lang="less" scoped>
.qrcode {
  display: inline-block;
  img {
    width: 132px;
    height: 132px;
    background-color: #fff; //设置白色背景色
    padding: 6px; // 利用padding的特性，挤出白边
    box-sizing: border-box;
  }
}
</style>
