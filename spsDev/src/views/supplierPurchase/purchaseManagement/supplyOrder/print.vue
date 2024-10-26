<template >
  <Modal v-model="printModal" title="打印标签" @on-visible-change="visible" :styles="{top: '80px',width:'870px'}" class="headerBar" :mask-closable="false">
    <div>
      <Card dis-hover v-if="showPrintItem.indexOf('widthAndHeight') > -1">
        <div>
          <span>介质材料</span> <span style="marginLeft:20px;marginRight:10px;">宽</span>
          <InputNumber v-model.trim="printParams.width" :max="100" @on-change="changeWidth" style="width:50px;marginRight:10px;" size="small"></InputNumber>
          mm <span style="marginLeft:20px;marginRight:10px;">高</span>
          <InputNumber v-model.trim="printParams.height" :max="100" @on-change="changeHeight" style="width:50px;marginRight:10px;" size="small"></InputNumber>
          mm <span style="marginLeft:20px;color:red;fontSize:12px;">最大支持100mm X 100mm</span>
        </div>
      </Card>
    </div>
    <div style="marginTop:15px;">
      <div class="mb10">
        <div class="mb10">货品</div>
        <Table highlight-row max-height="200" :columns="printColumns" :data="printDataNew" :border="true"></Table>
      </div>
      <Card dis-hover style="height:260px;background:#e8e8e8;overflow:auto;display:flex;justify-content:center;align-items:center;">
        <div :style="pageClass" ref="container" class="container" v-if="printDataNew.length">
          <div ref="draggable1" data-name="skuNoCode" class="barcode-code">
            <barcode :option="{id: 'barcode3', content: printDataNew[0].skuNo}" :config="printDataNew[0].skuNo.length <= 10 ? shotcodeConfig : codeConfig"></barcode>
          </div>
          <div ref="draggable2" data-name="supplierNo" :style="positionKey.supplierNo">
            <div class="barcode-supply">{{printDataNew[0].supplierNo}}</div>
            <div v-for="item in printDataNew[0].specificationslist" :key="item+'x'" class="barcode-text">{{ item }}</div>
          </div>
        </div>
      </Card>
    </div>
    <div slot="footer">
      <Button type="primary" @click="printBarcode">打印 </Button>
      <Button @click="cancelPrintBarcode">取消</Button>
    </div>

    <div ref="tagTemp" style="display: none;">
      <div class="conthtml">
        <div v-for="(pitem,pindex) in printDataNew" :key="pindex">
          <div v-for="(item,index) in pitem.printNum" :key="pindex+' '+index" :style="pageClass" class="barcode">
            <div class="barcode-item barcode-code" :style="positionKey.skuNoCode">
              <barcode :option="{id: 'barcode'+pindex+index, content: pitem.skuNo}" :config="printDataNew[0].skuNo.length <= 10 ? shotcodeConfig : codeConfig"></barcode>
            </div>
            <div class="barcode-item" :style="positionKey.supplierNo">
              <div class="barcode-supply">{{pitem.supplierNo}}</div>
              <div v-for="item in pitem.specificationslist" :key="item+'y'" class="barcode-text">{{ item }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script >
import Draggabilly from 'draggabilly';
import barcode from '@/components/Barcode';

export default {
  name: 'print',
  // eslint-disable-next-line vue/no-unused-components
  components: { Draggabilly, barcode },
  props: {
    printData: {
      type: Array,
      default: () => {
        return [];
      }
    },
    showPrintItem: {
      type: Array,
      default: () => {
        return ['widthAndHeight', 'fontSize', 'productNo', 'customContent'];
      }
    },
  },
  data () {
    // 数量 num
    return {
      printModal: false,
      FixedValue: 2.83,
      printNum: 1,
      printParams: {
        width: 70,
        height: 20,
        barcodeSize: 12,
        productNo: 0,
        custom: 0
      },
      pageClass: {
        width: '169.8pt',
        height: '56.6pt',
        background: '#fff',
        textAlign: 'center'
      },
      barCodeClass: {
        fontFamily: 'IDAutomationC128S',
        lineHeight: '22pt',
        fontSize: '12pt'
      },
      positionKey: {},
      printColumns: [
        {
          title: "供方货号",
          key: "supplierNo",
          align: "center",
          minWidth: 120,
          render: (h, params) => {
            return h("div", [h("div", params.row.supplierNo)]);
          },
        },
        {
          title: "订单号",
          key: "purchaseNumber",
          align: "center",
          minWidth: 120,
          render: (h, params) => {
            return h("div", [h("div", params.row.purchaseNumber)]);
          },
        },
        {
          title: "SKU",
          key: "skuNo",
          align: "center",
          minWidth: 120,
          render: (h, params) => {
            return h("div", [h("div", params.row.skuNo)]);
          },
        },
        {
          title: "规格",
          key: "specifications",
          align: "center",
          minWidth: 120,
          render: (h, params) => {
            return h("div", [h("div", params.row.specifications)]);
          },
        },
        {
          title: "打印数量",
          key: "printNum",
          align: "center",
          minWidth: 100,
          render: (h, params) => {
            return h("div", [h("div", params.row.printNum)]);
          },
        },
      ],
      codeConfig: {
        displayValue: true,
        height: 34,
        width: 1.1
      },
      shotcodeConfig: {
        displayValue: true,
        height: 34,
        width: 1.2
      }
    };
  },
  methods: {
    // 窗口打开
    visible (open) {
      if (open) {
        let url = 'http://localhost:10099/check?callback=checkHandler&_=' + new Date().getTime();
        this.myjsonp(url, function (data) { }, "checkHandler");
        this.$nextTick(() => {
          this.showPrint();
          this.getLocal();
          // let data = localStorage.getItem('positionPrintorder') ? JSON.parse(localStorage.getItem('positionPrintorder')) : null;
          let data = null;
          // 存储位置
          if (!data) {
            this.positionKey = {
              // madein: { top: '56px', left: '178px' },
              // purchaseNumber: { top: '40px', left: '8px' },
              // skuNo: { top: '52px', left: '8px' },

              // skuNoCode: { top: '3pt', left: '3pt' },
              // supplierNo: {
              //   top: '1.5pt', left: '139.5pt', width: '58.5pt', wordWrap: 'break-word', paddingLeft: '1.5pt'
              // },

              skuNoCode: { top: '4px', left: '0px' },
              supplierNo: {
                top: '2px', left: '160px', width: '76pt', wordWrap: 'break-word'
              },

              // specifications: { top: '16px', left: '184px', width: '80px', wordWrap: 'break-word', fontSize: '14px', lineHeight: '16px' },
            };
            localStorage.setItem('positionPrintorder', JSON.stringify(this.positionKey));
            this.getPosition(this.positionKey);
          } else {
            this.positionKey = data;
            this.getPosition(data);
          }
        });
      }
    },
    // 添加拽动事件
    showPrint () {
      let el = this.$refs.container.childNodes || [];
      let arr = [];
      el.forEach(n => {
        let drag = new Draggabilly(n, {
          containment: '.container', // 选项...
          axis: 'xy'
        });
        arr.push(drag);
      });
      arr.forEach((i, index) => {
        i.on('dragEnd', (e) => {
          let [key, ls, obj] = ['', ['supplierNo', 'purchaseNumber', 'madein', 'skuNoCode', 'skuNo', 'specifications'], null];
          e.path.forEach(k => {
            if (k.getAttribute && (ls.includes(k.getAttribute('data-name')))) {
              key = k.getAttribute('data-name');
              obj = k;
            }
          });
          if (!(key && obj)) return;//拿不到调整位置的节点
          // 设置位置
          let data = localStorage.getItem('positionPrintorder') ? JSON.parse(localStorage.getItem('positionPrintorder')) : [];
          data[key].left = obj.style.left;
          data[key].top = obj.style.top;
          localStorage.setItem('positionPrintorder', JSON.stringify(data));
          this.positionKey = data;
        });
      });
    },
    // 获取打印配置
    getLocal () {
      let data = localStorage.getItem('printSettingorder');
      if (data) {
        let localDate = JSON.parse(data);
        this.printParams.width = localDate.width;
        this.printParams.height = localDate.height;
        this.pageClass.width = (localDate.width * this.FixedValue) + 'pt';
        this.pageClass.height = (localDate.height * this.FixedValue) + 'pt';

        this.printParams.barcodeSize = localDate.barcodeSize;
        this.printParams.productNo = localDate.productNo;
        this.printParams.custom = localDate.custom;
      } else {
        localStorage.setItem('printSettingorder', JSON.stringify(this.printParams));
      }
    },
    // 设置打印配置
    setLocal (key, value) {
      let data = localStorage.getItem('printSettingorder') ? JSON.parse(localStorage.getItem('printSettingorder')) : {};
      data[key] = value;
      localStorage.setItem('printSettingorder', JSON.stringify(data));
    },
    // 获取本地位置
    getPosition (data) {
      let el = this.$refs.container.childNodes || [];
      el.forEach(k => {
        let key = k.getAttribute('data-name') || '';
        if (key && data[key]) {
          k.style.top = data[key].top;
          k.style.left = data[key].left;
        }
      });
    },
    // jsonp跨域处理
    myjsonp (URL, callback, callbackname) {
      //给系统中创建一个全局变量，叫做callbackname，指向callback函数
      window[callbackname] = callback;
      //创建一个script节点
      var oscript = document.createElement("script");
      //和image不一样，设置src并不会发出HTTP请求 
      oscript.src = URL;
      oscript.type = "text/javascript";
      // 出错
      oscript.onerror = () => {
        this.downloadPrint();
      };
      //script标签的请求是在上树的时候发出，请求的是一个函数的执行语句
      document.head.appendChild(oscript);
      //为了不污染页面，瞬间把script拿掉
      document.head.removeChild(oscript);
    },
    // 打印控件下载
    downloadPrint () {
      let data = 'http://172.20.200.30/sps-service/filenode/s/wms-service/tool/TongtoolPrinter.exe';
      this.$Modal.info({
        width: 400,
        content: `请下载打印控件<a href=${data}>点击下载</a>`
      });
    },
    changeWidth (val) {
      let v = this;
      v.pageClass.width = (val * v.FixedValue) + 'pt';
      v.setLocal('width', val);
    },
    changeHeight (val) {
      let v = this;
      v.pageClass.height = (val * v.FixedValue) + 'pt';
      v.setLocal('height', val);
    },
    changeBarSize (val) {
      let v = this;
      v.barCodeClass.fontSize = val + 'pt';
      v.setLocal('barcodeSize', val);
    },
    // 打印条码
    printBarcode () {
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
        content: this.htm5Doc(),
        postId: '1'
      }).then(response => {
        if (response.status === 200) {
          this.$Message.success('操作成功');
          this.cancelPrintBarcode();
        }
      }).catch(e => {
        console.log(e);
        this.downloadPrint();
      });
    },
    htm5Doc () {
      // let path = `${window.location.origin}/sps-service/static/printFont/`;
      return (`<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <title>Title</title>
            <style type="text/css">
              *{margin: 0;padding: 0}
              .barcode {
                position: relative;
                background-color: rgb(255, 255, 255);
                break-before: page;
                margin:0 auto;
              }
              .barcode-code {
                width: 110pt !important;
                display: flex !important;
                justify-content: center !important;
              }
              .barcode-item {
                position: absolute;
                display: inline-block;
                width: auto;
                font-family: Arial;
                touch-action: none;
                text-align:left;
              }
             .barcode-supply {
                font-size: 9pt;
                line-height: 9pt;
                font-weight: 400;
              }
              .barcode-text {
                font-size: 12pt;
                line-height: 12pt;
                font-weight: bold !important;
              }
              .box {background: #8e8e8e;}
              @media print {.btn{display: none;}}
            </style>
          </head>
          <body class="box">` + (this.$refs.tagTemp && this.$refs.tagTemp.innerHTML) + `</body>
        </html>`);
    },
    // 取消打印条码
    cancelPrintBarcode () {
      this.printModal = false;
    },
  },
  computed: {
    printDataNew () {
      this.printData.forEach(k => {
        let list = [];
        let specifications = k.specifications ? k.specifications.split(' ') : [];
        specifications.forEach((j, y) => {
          if (j && (y < 2)) list.push(j.split(':')[1]);
        });
        k.specificationslist = list;
      });
      return this.printData;
    }
  }
};
</script>

<style scoped >
.container {
  position: relative;
}
.container > div {
  cursor: move;
  position: absolute;
  text-align: left;
}
.container > div.is-pointer-down {
  background: #09f;
  z-index: 2; /* above other draggies */
}
.container > div.is-dragging {
  opacity: 0.7;
}
.barcode {
  position: relative;
}
.barcode-code {
  width: 110pt;
  display: flex;
  justify-content: center;
}
.barcode-item {
  position: absolute;
  text-align: left;
}
.barcode-supply {
  font-size: 9pt;
  line-height: 9pt;
  font-weight: 400;
}
.barcode-text {
  font-size: 12pt;
  line-height: 12pt;
  font-weight: bold;
}
</style>
