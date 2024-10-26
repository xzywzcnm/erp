<template>
  <div class="barcodeCon">
    <svg :id="option.id"></svg>
  </div>
</template>

<script>
import JsBarcode from 'jsbarcode';
export default {
  props: {
    option: {
      type: Object,
      default () {
        return {
          id: '',
          content: '',
        };
      }
    },
    config: {
      type: Object,
      default () { return {}; }
    }
  },
  data () {
    return {
      barcodeConfig: {
        format: "CODE128",  //条形码的格式
        width: 2, //线宽
        height: 40,  //条码高度
        displayValue: false, //是否显示文字信息
        margin: 0,
        fontSize: 15,
        fontOptions: "bold",//使文字加粗体或变斜体
        textMargin: -3,//设置条形码和文本之间的间距
      }
    };
  },
  created () { },
  methods: {
    init () {
      let data = this.option;
      let config = this.config;
      Object.keys(config).forEach(k => {
        config[k] ? this.barcodeConfig[k] = config[k] : '';
      });
      JsBarcode('#' + data.id, data.content, this.barcodeConfig);
    }
  },
  mounted () {
    this.init();
  }
};
</script>
