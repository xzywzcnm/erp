<template >
  <Modal v-model="printModal" title="打印标签" @on-visible-change="visible" :styles="{top: '80px',width:'870px'}" class="headerBar" :closable="false" :mask-closable="false">
    <div>
      <Card dis-hover v-if="showPrintItem.indexOf('widthAndHeight') > -1">
        <div>
          <span>介质材料</span> <span style="marginLeft:20px;marginRight:10px;">宽</span>
          <InputNumber v-model.trim="printParams.width" :max="100" @on-change="changeWidth" style="width:50px;marginRight:10px;" size="small"></InputNumber>
          mm <span style="marginLeft:20px;marginRight:10px;">高</span>
          <InputNumber v-model.trim="printParams.height" :max="100" @on-change="changeHeight" style="width:50px;marginRight:10px;" size="small"></InputNumber>
          mm <span style="marginLeft:20px;color:red;fontSize:12px;">最大支持100mm X 100mm</span>
        </div>
        <div style="marginTop:15px;" v-if="showPrintItem.indexOf('fontSize') > -1">
          <span>标签大小</span> <span style="marginLeft:20px;marginRight:10px;">条码字体</span>
          <InputNumber v-model.trim="printParams.barcodeSize" style="width:50px;marginRight:10px;" size="small" @on-change="changeBarSize"></InputNumber>
          pt <span style="marginLeft:20px;color:red;fontSize:12px;">每pt约占0.35mm宽，请确保最长的SKU字符数*左侧pt值*0.35小于介质尺寸</span>
        </div>
        <div style="marginTop:15px;" v-if="showPrintItem.indexOf('productNo')">
          <span>商品编号</span> <dyt-select style="width:150px;marginLeft:35px;" v-model="printParams.productNo" @on-change="changeProNo">
            <Option :value="0">不打印SKU</Option>
            <Option :value="1">打印SKU</Option>
          </dyt-select>
        </div>
        <div style="marginTop:15px;" v-if="showPrintItem.indexOf('customContent')">
          <span>自定义内容</span> <dyt-select style="width:150px;marginLeft:20px;" v-model="printParams.custom" @on-change="changeCustom">
            <Option :value="0">不打印自定义内容</Option>
            <Option :value="1">打印自定义内容</Option>
          </dyt-select> <Input v-if="printParams.custom" v-model.trim="tagContent" style="width:150px;marginLeft:20px;"></Input>
          <Button v-if="printParams.custom" style="marginLeft:10px;" type="primary" size="small" @click="addTag">增加 </Button>
          <Tag class="tag" v-if="printParams.custom" v-for="(item, index) in tagList" :key="index" closable @on-close="delConfirm(index)" style="margin:5px;">
            {{ item }}
          </Tag >
          <span style="float:right;fontSize:12px;color:green;marginTop:20px;" >注:打印内容可拖动改变位置</span >
        </div >
      </Card >
    </div >
    <div style="marginTop:15px;" >
      <Row >
        <Col span="12" >
          <div >
            <Row style="marginBottom:10px;" >
              <Col span="14" >货品</COl >
              <Col span="10" >
                统一设置打印数量
                <InputNumber
                    v-model.trim="printNum" style="width:50px" size="small" @on-blur="changePrintNum" ></InputNumber >
              </COl >
            </Row >
            <Table border :columns="printColumns" :data="printDataNew" ></Table>
          </div >
        </COl >
        <Col span="12" >
          <Card
              dis-hover
              style="marginLeft:5px;height:420px;background:#e8e8e8;overflow:auto;display:flex;justify-content:center;align-items:center;" >
            <div :style="pageClass" ref="container" class="container" v-if="printDataNew.length > 0" >
              <div
                  ref="draggable1"
                  class="draggable"
                  data-name="barCode"
                  :style="barCodeClass"
                  v-show="printDataNew.length"
                  v-html="printDataNew[0][printViewParams[0]]" ></div >
              <div
                  ref="draggable2"
                  class="draggable"
                  data-name="title"
                  v-show="printDataNew.length" >{{ printDataNew[0][printViewParams[1]] }}
              </div >
              <div
                  ref="draggable3"
                  class="draggable"
                  data-name="sku"
                  v-show="printDataNew.length && printParams.productNo" >{{ printDataNew[0][printViewParams[2]] }}
              </div >
              <template v-if="tagList.length">
                <div v-for="(item, index) in tagList" style="float:left;" :ref="'draggable' + (index + 4)" class="draggable" :key="`${index}`" >
                  {{ item }}
                </div >
              </template >
            </div >
          </Card >
        </COl >
      </Row >
    </div >
    <div slot="footer" >
      <Button type="primary" @click="printBarcode" >打印 </Button >
      <Button @click="cancelPrintBarcode" >取消</Button >
    </div >
    <div ref="tagTemp" style="display: none;" ></div >
  </Modal >
</template>

<script>
import Draggabilly from 'draggabilly';
import common from '@/components/mixin/common_mixin';

export default {
  name: 'print',
  mixins: [common],
  components: { Draggabilly },
  props: {
    printData: {
      type: Array,
      default: () => {
        return [
          {
            sku: '123',
            title: '55555',
            num: 2,
            skuBarCode: '48787'
          }
        ];
      }
    },
    printColumns: {
      type: Array,
      default: () => {
        return [
          {
            title: 'SKU',
            key: 'sku',
            align: 'center',
            minWidth: 120,
            render: (h, params) => {
              return h('div', [
                h('div', params.row.sku), h('div', params.row.fnsku)
              ]);
            }
          }, {
            title: '标题',
            key: 'title',
            align: 'center',
            minWidth: 120
          }, {
            title: '打印数量',
            key: 'num',
            align: 'center',
            minWidth: 100,
            render: (h, params) => {
              return h('Input', {
                props: {
                  value: this.printDataNew[params.index].number,
                  size: 'small'
                },
                on: {
                  'input': (val) => {
                    this.printDataNew[params.index].number = val;
                  }
                }
              });
            }
          }
        ];
      },
      required: true
    },
    showPrintItem: {
      type: Array,
      default: () => {
        return ['widthAndHeight', 'fontSize', 'productNo', 'customContent'];
      }
    },
    printViewParams: {
      type: Array,
      default: () => {
        return ['skuBarCode', 'cnName', 'sku'];
      }
    }
  },
  data () {
    // 数量 num
    return {
      printModal: false,
      FixedValue: 2.83,
      offsetXY: [],
      printNum: 1,
      printParams: {
        width: 60,
        height: 40,
        barcodeSize: 12,
        productNo: 0,
        custom: 0
      },
      pageClass: {
        width: '169.8pt',
        height: '113.2pt',
        background: '#fff',
        textAlign: 'center'
      },
      pageClassCopy: null,
      barCodeClass: {
        fontFamily: 'IDAutomationC128S',
        lineHeight: '22pt',
        fontSize: '12pt'
      },
      barCodeClassCopy: null,
      tagContent: null,
      tagList: []
    };
  },
  methods: {
    getLocal () {
      let data = localStorage.getItem('printSetting');
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
        localStorage.setItem('printSetting', JSON.stringify(this.printParams));
      }
      this.getPosition();
    },
    setLocal (key, value) {
      let data = localStorage.getItem('printSetting') ? JSON.parse(localStorage.getItem('printSetting')) : {};
      data[key] = value;
      localStorage.setItem('printSetting', JSON.stringify(data));
    },
    getPosition () {
      // 获取本地位置
      let data = localStorage.getItem('positionPrint');
      if (data) {
        let localDate = JSON.parse(data);
        localDate.forEach((i) => {
          if (i.key === 'barCode') {
            // 条形码
            this.$refs.draggable1.style.top = i.top;
          } else if (i.key === 'title') {
            this.$refs.draggable2.style.top = i.top;
          } else if (i.key === 'sku') {
            this.$refs.draggable3.style.top = i.top;
          }
        });
      }
    },
    jsonp (url) {
      if (!url) {
        return;
      }
      return new Promise((resolve, reject) => {
        window.jsonCallBack = (result) => {
          resolve(result);
        };
        var JSONP = document.createElement('script');
        JSONP.type = 'text/javascript';
        JSONP.src = url;
        JSONP.onerror = function () {
          resolve('error');
        };
        document.getElementsByTagName('head')[0].appendChild(JSONP);
        setTimeout(() => {
          document.getElementsByTagName('head')[0].removeChild(JSONP);
        }, 500);
      });
    },
    visible (open) {
      if (open) {
        this.jsonp('http://localhost:10099/check?callback=checkHandler&_=' + new Date().getTime()).then((res) => {
          if (res === 'error') {
            this.getPrintExeUrl().then(data => {
              if (data) {
                this.$Modal.info({
                  width: 400,
                  content: `请下载打印控件<a href=${data}>点击下载</a>`
                });
              } else {
                return new Error('未获取到打印控件');
              }
            });
          }
        });
        this.$nextTick(() => {
          this.showPrint();
          this.getLocal();
        });
      }
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
    changeProNo (val) {
      if (val) {
        this.showPrint();
      }
      this.setLocal('productNo', val);
    },
    changeCustom (val) {
      this.setLocal('custom', val);
    },
    addTag () {
      let v = this;
      if (v.tagContent) {
        v.tagList.push(v.tagContent);
        v.tagContent = null;
        v.$nextTick(() => {
          // let draggie = new Draggabilly(this.$refs['draggable' + (v.tagList.length + 3)][0], {
          //   containment: true,
          //   axis: 'xy'
          // });
        });
      }
    },
    showPrint () {
      let el = [];
      el.push(this.$refs.draggable1);
      el.push(this.$refs.draggable2);
      el.push(this.$refs.draggable3);
      let arr = [];
      el.forEach((n, i) => {
        let drag;
        drag = new Draggabilly(n, {
          // 选项...
          containment: true,
          axis: 'y'
        });
        arr.push(drag);
      });
      arr.forEach((i, index) => {
        i.on('dragEnd', (e) => {
          // 设置位置
          let data = localStorage.getItem('positionPrint') ? JSON.parse(localStorage.getItem('positionPrint')) : [];
          data[index] = {
            left: e.target.style.left,
            top: e.target.style.top,
            key: el[index].getAttribute('data-name')
          };
          localStorage.setItem('positionPrint', JSON.stringify(data));
        });
      });
    },
    changePrintNum () {
      let v = this;
      v.printDataNew.forEach((n, i) => {
        v.$set(v.printDataNew[i], 'number', v.printNum);
        v.$set(v.printDataNew[i], 'num', v.printNum);
      });
    },
    printBarcode () { // 打印条码
      let v = this;
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
      }).catch(() => {
        v.getPrintExeUrl().then(data => {
          if (data) {
            v.$Modal.info({
              width: 400,
              content: `请下载打印控件<a href=${data}>点击下载</a>`
            });
          } else {
            return new Error('未获取到打印控件');
          }
        });
      });
    },
    htm5Doc () {
      return (`<!DOCTYPE html>
        <html lang="en">
          <head>
          <meta charset="UTF-8">
          <title>Title</title>
          <style type="text/css">
      @media print {.btn{display: none;}}
      .bug-free{background:url('${window.location.origin}/setting-service/static/printFont/IDAutomationC128S.eot?#iefix')}
       #barcode{background:url('${window.location.origin}/setting-service/static/printFont/IDAutomationC128S.eot?#iefix')}
      @font-face {
        font-family: 'IDAutomationC128S';
        src: url('${window.location.origin}/setting-service/static/printFont/IDAutomationC128S.eot'); /* IE9 Compat Modes */
        src: url('${window.location.origin}/setting-service/static/printFont/IDAutomationC128S.eot?#iefix') format('embedded-opentype'), /* IE6-IE8 */
        url('${window.location.origin}/setting-service/static/printFont/IDAutomationC128S.woff') format('woff'), /* Modern Browsers */
        url('${window.location.origin}/setting-service/static/printFont/IDAutomationC128S.ttf') format('truetype'), /* Safari, Android, iOS */
        url('${window.location.origin}/setting-service/static/printFont/IDAutomationC128S.svg#IDAutomationC128S') format('svg'); /* Legacy iOS */
      }
      .bug-free{background:url('${window.location.origin}/setting-service/printFont/IDAutomationSC39S.eot?#iefix')}
      @font-face {
        font-family: 'IDAutomationSC39S';
        src: url('${window.location.origin}/setting-service/static/printFont/IDAutomationSC39S.eot'); /* IE9 Compat Modes */
        src: url('${window.location.origin}/setting-service/static/printFont/IDAutomationSC39S.eot?#iefix') format('embedded-opentype'), /* IE6-IE8 */
        url('${window.location.origin}/setting-service/static/printFont/IDAutomationSC39S.ttf') format('truetype');
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
      if (v.printDataNew.length) {
        v.printDataNew.forEach((n) => {
          for (let i = 0; i < n.num; i++) {
            container.childNodes[0].innerText = n[v.printViewParams[0]];
            container.childNodes[1].innerText = n[v.printViewParams[1]];
            if (v.printParams.productNo) {
              container.childNodes[2].innerText = n[v.printViewParams[2]];
            }
            callback && callback();
            str += tagTemp.innerHTML;
          }
        });
        return str;
      }
    },
    cancelPrintBarcode () { // 取消打印条码
      this.printModal = false;
      // this.printParams = this.deepCopy(this.printParamsCopy);
      // this.pageClass = this.deepCopy(this.pageClassCopy);
      // this.barCodeClass = this.deepCopy(this.barCodeClassCopy);
      this.tagList = [];
    },
    delConfirm (idnex) {
      let v = this;
      v.tagList.splice(idnex, 1);
    }
  },
  created () {

  },
  computed: {
    printDataNew () {
      return this.printData;
    }
  }
};
</script >

<style scoped >
.draggable {
  cursor: move;
}

.draggable.is-pointer-down {
  background: #09f;
  z-index: 2; /* above other draggies */
}

.draggable.is-dragging {
  opacity: 0.7;
}
</style >
