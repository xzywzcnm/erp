<template>
  <div class="barcodeCon" style="position: relative;font-size: 0;display:inline-block;">
    <svg :id="option.id" :data-content="option.content"></svg>
  </div>
</template>

<script>
import JsBarcode from 'jsbarcode';
export default {
  props: {
    option: {
      type: Object,
      default() {
        return {
          id: '', // svg id
          content: '', // 条形码内容
          pindex: null// 条形码位置
        };
      }
    },
    codeParams: { // 打印配置
      type: Object,
      default: () => {
        return {}
      }
    },
  },
  data() {
    return {
      barcodeConfig: {
        format: 'CODE128', // 条形码的格式
        width: 1.1, // 线宽
        height: 30, // 条码高度
        displayValue: false, // 是否显示文字信息
        margin: 0,
        textShow: false,
        valid: this.validCode,
      },
      svgConfig: {
        displayValue: false, // 是否展示
      }, // svg配置
    };
  },
  methods: {
    validCode(e) {
      this.$emit('valid', e, this.option.pindex);
    },
    init() {
      let [data, codeConfig, barcodeConfig] = [this.option, this.codeParams.codeConfig || {}, this.barcodeConfig];
      let svgConfig = this.codeParams.svgConfig || {};
      // 更改默认配置
      Object.keys(codeConfig).forEach(k => {
        codeConfig[k] && (barcodeConfig[k] = codeConfig[k]);
      });
      Object.keys(svgConfig).forEach(k => {
        svgConfig[k] && (this.svgConfig[k] = svgConfig[k]);
      });
      // 根据条码内容长度，自适应缩小条形码的宽度大小
      let codeOption = { 60: { 20: 1, 30: 0.9 }, 70: { 20: 1.2, 30: 1 } };
      if (barcodeConfig.codeWidth && data.content && data.content.length) {
        let codeWidth = codeOption[barcodeConfig.codeWidth] || {};
        Object.keys(codeWidth).forEach(k => {
          if (data.content.length > k) {
            barcodeConfig.width = codeWidth[k];
          }
        })
      }
      // console.log(data, barcodeConfig, document.querySelector('#' + data.id))
      JsBarcode('#' + data.id, data.content, barcodeConfig);
    },
    drawSvg(id, content) {
      let dom = document.getElementById(id);
      if (!dom) return;
      let width = dom.getAttribute('width').replace('px', '');
      let svg = dom.parentNode.innerHTML;
      let svgStyle = this.codeParams.svgStyle || {};
      let fontSize = svgStyle.fontSize || '8pt';
      let num = fontSize.replace(/[^0-9]/ig, '');
      let str = `
        <div style="position: absolute;left:0;margin-top:2px;">
          <svg id="${id}svg" height="${fontSize}" width="${width}">
            <text x="0" y="${num}" style="fill:black; font-size:${fontSize}; font-weight:bold;" lengthAdjust="spacing" textLength="${width}" stroke-width="3" stroke="balck">${content}</text>
          </svg>
        </div>
      `;
      dom.parentNode.innerHTML = svg + str;
    }
  },
  mounted() {
    this.init();
    this.$nextTick(() => {
      let svgConfig = this.svgConfig || {};
      if (svgConfig.displayValue) {
        let { id, content } = this.option;
        this.drawSvg(id, content);
      }
    })
  }
};
</script>
<style lang="less" scoped></style>
