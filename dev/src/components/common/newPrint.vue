<template >
  <div class="print">
    <Form :label-width="120">
      <!--介质材料-->
      <FormItem label="介质材料">
        <Row>
          <Col span="7" style="margin-right: 10px;">
          <Input v-model.trim="paperWidth" @on-blur="paperWidthChange"> <span slot="prepend">宽</span>
          <span slot="append">mm</span> </Input>
          </Col>
          <Col span="7">
          <Input v-model.trim="paperHeight" @on-blur="paperHeightChange"> <span slot="prepend">高</span>
          <span slot="append">mm</span> </Input>
          </Col>
        </Row>
        <span style="display: inline-block;color: #f00">最大支持100mm X 100mm</span>
      </FormItem>
      <!--打印字体设置-->
      <FormItem label="标签大小">
        <Row style="margin-top: -10px;">
          <Col span="7" style="margin-bottom: 10px;margin-right: 10px" v-for="(item,index) in printList" v-if="item.show === 1" :key="index">
          <Input v-model.trim="item.fontSize" @on-blur="setStorage"> <span slot="prepend">{{ item.label }}字体</span>
          <span slot="append">pt</span> </Input>
          </Col>
        </Row>
        <span style="display: inline-block;color: #f00">每pt约占0.35mm宽</span>
      </FormItem>

      <Row type="flex" justify="space-between" class="code-row-bg">
        <!--控制是否打印-->
        <Col :span="12" style="padding-right: 10px">
        <template v-for="(item,index) in printList">
          <FormItem :label="item.label" :key="index" v-if="item.settingShow">
            <dyt-select v-model="item.show" @on-change="setStorage($event,index)">
              <Option v-for="(itemD,indexD) in settingList" :key="indexD" :value="itemD.value"> {{ itemD.label }}{{ item.label }}</Option>
            </dyt-select> <Input v-if="item.editContent && item.show" @on-change="changeDefineContent" v-model="item.content" />
          </FormItem>
        </template>
        <FormItem label="起止信息" v-if="startEndShow">
          <div class="flexBox">
            <dyt-select v-model="startEnd" style="width: 100px;" @on-change="setStartEndStorage">
              <Option v-for="(itemD,indexD) in settingList" :key="indexD" :value="itemD.value"> {{ itemD.label }}</Option>
            </dyt-select> *打印内容可拖动改变位置
          </div>
        </FormItem>
        </Col>
        <!--打印预览-->
        <Col :span="12">
        <div class="container" ref="container">
          <div class="print-box" :style="containerStyle">
            <div v-for="(item,index) in printList" class="draggable" :style="{
                                     left:item.left,
                                     top:item.top,
                                     display:item.axis === 'y' ? 'block' : 'inline-block',
                                     width:item.axis === 'y' ? '100%' : 'auto',
                                     fontFamily: item.IdName === 'PRINT_001' ? 'IDAutomationC128S' : 'Arial'
                                 }" :data-id-name="item.IdName" :key="index" :id="item.IdName">
              <span v-if="item.show === 1" :data-id-name="item.IdName" :style="{fontSize: item.fontSize + 'pt'}" v-html="item.content"></span>
            </div>
          </div>
        </div>
        </Col>
      </Row>
      <!---->
    </Form>
  </div>
</template>

<script>
import Draggabilly from 'draggabilly';
import commonMixin from '@/components/mixin/common_mixin';

/**
 *
 * onSetPrintView 设置打印设置
 * setInitData 设置初始打印
 * */
export default {
  name: 'printModal',
  mixins: [commonMixin],
  data () {
    return {
      startEnd: 0,
      containerStyle: {
        width: '180pt', // 系数 0.333  60/0.333
        height: '120pt',
        backgroundColor: '#FFF',
        pageBreakBefore: 'always' // 分页打印
      },
      printXI: 0.3582, // mm转换pt 1mm ~= 0.353
      settingList: [
        {
          label: '打印',
          value: 1
        }, {
          label: '不打印',
          value: 0
        }
      ],
      printList: [
        {
          IdName: 'PRINT_001', // 打印id
          label: '条码',
          show: 1, // 默认展示
          settingShow: false,
          axis: 'y', // 控制拖拽方向
          content: '',
          left: 0,
          top: 0,
          fontSize: 12
        }, {
          IdName: 'PRINT_002', // 打印id
          label: 'SKU',
          show: 0, // 默认展示
          settingShow: false,
          content: '',
          left: 0,
          top: 0,
          fontSize: 12
        }, {
          IdName: 'PRINT_003', // 打印id
          label: '中文名称',
          show: 0, // 默认展示
          settingShow: false,
          content: '',
          left: 0,
          top: 0,
          fontSize: 12
        }, {
          IdName: 'PRINT_004', // 打印id
          label: '商品规格',
          show: 0, // 默认展示
          settingShow: false,
          content: '',
          left: 0,
          top: 0,
          fontSize: 12
        }, {
          IdName: 'PRINT_005', // 打印id
          label: '自定义内容',
          show: 0, // 1 show 0 hide  默认展示
          settingShow: false, // 能否进行show hide的操作
          content: '',
          left: 0,
          top: 0,
          fontSize: 12,
          editContent: true //
        }, {
          IdName: 'PRINT_006', // 打印id
          label: '产品库位',
          show: 0, // 1 show 0 hide  默认不展示
          settingShow: false, // 能否进行show hide的操作
          content: '产品库位预览占位',
          left: 0,
          top: 0,
          fontSize: 12
        }, {
          IdName: 'PRINT_007', // 打印id
          label: '产品绑定库区',
          show: 0, // 默认不展示
          settingShow: false,
          content: '产品绑定库区预览占位',
          left: 0,
          top: 0,
          fontSize: 12
        }, {
          IdName: 'PRINT_008', // 打印id
          label: '批次号',
          show: 0, // 1 show 0 hide  默认不展示
          settingShow: false, // 能否进行show hide的操作
          content: '',
          left: 0,
          top: 0,
          fontSize: 12
        }, {
          IdName: 'PRINT_009', // 打印id
          label: '参考编号',
          show: 0, // 1 show 0 hide  默认不展示
          settingShow: false, // 能否进行show hide的操作
          content: '参考编号预览占位',
          left: 0,
          top: 0,
          fontSize: 12
        }, {
          IdName: 'PRINT_010', // 打印id
          label: '库位名称',
          show: 0, // 1 show 0 hide  默认不展示
          settingShow: false, // 能否进行show hide的操作
          content: '库位名称预览占位',
          left: 0,
          top: 0,
          fontSize: 12
        }, {
          IdName: 'PRINT_011', // 打印id
          label: '库区名称',
          show: 0, // 1 show 0 hide  默认不展示
          settingShow: false, // 能否进行show hide的操作
          content: '库区名称预览占位',
          left: 0,
          top: 0,
          fontSize: 12
        }
      ],
      defineContent: '',
      paperWidth: 60,
      paperHeight: 40, // localStorageName: 'settingPositionPrint2020', // 打印设置缓存名称
      printOtherSetting: 'printOtherSetting2020' // 宽 高 起止
    };
  },
  created () {

  },
  mounted () {
    this.printInit();
  },
  props: {
    mapping: {
      // 打印映射
      type: Object,
      default () {
        // 打印的时候取值
        return {
          PRINT_001: 'skuBarcode',
          PRINT_002: 'goodsSku',
          PRINT_003: 'goodsCnDesc', // 中文名称
          PRINT_004: 'goodsAttributes', // 规格
          PRINT_005: 'defineContent', // 自定义内容
          PRINT_006: 'warehouseLocationName', // 产品库位
          PRINT_007: 'warehouseBlockName', // 产品绑定库区
          PRINT_008: 'receiptBatchNo', // 批次号
          PRINT_009: 'referenceNo', // 参考编号
          PRINT_010: 'warehouseLocationName', // 库位
          PRINT_011: 'warehouseBlockName' // 库位
        };
      }
    },
    initData: {
      // 打印初始值
      type: Object
    },
    startEndShow: {
      // 控制起始打印
      default: false
    },
    localStorageName: {
      // 缓存名称
      default: 'settingPositionPrint2020'
    }
  },
  watch: {},
  methods: {
    changeDefineContent (e) {
      this.defineContent = e.target.value;
    },
    onSetPrintView () {
      /**
       * on 修改页面展示
       * */
      return new Promise(resolve => {
        this.printInit();
        resolve(this.printList);
      });
    },
    onPrint (data) {
      let v = this;
      return new Promise(resolve => {
        if (!data || data.length === 0) {
          this.$Message.info('请选择打印数据');
          return;
        }
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
          content: this.htm5Doc(data),
          postId: '1'
        }).then(response => {
          resolve(response);
        }).catch(() => {
          v.getPrintExeUrl('wms').then(data => {
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
      });
    },
    htm5Doc (data) {
      let path = `${window.location.origin}/setting-service/static/printFont/`;
      return (`<!DOCTYPE html>
                  <html lang="en">
                    <head>
                    <meta charset="UTF-8">
                    <title>Title</title>
                    <style type="text/css">
                    *{margin: 0;padding: 0}
                    .print-box {
                        position: relative;
                        margin: 0 auto;
                    }

                    .print-box .draggable {
                        position: absolute;
                        text-align: center;
                    }
                    .box {
                    background: #8e8e8e;
                    }
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
                    <body class="box">` + this.htmlText(data) + `
                  </body>
                  </html>`);
    },
    htmlText (data) {
      let v = this;
      let dom = v.$refs.container.cloneNode(true);
      let text = '';
      data.forEach(item => {
        if (v.startEnd === 1 && v.startEndShow) {
          text += v.startEndHtml('Start', item[v.mapping['PRINT_002']], item.printNumber); // 添加开始信息
        }
        /* 打印内容 */
        for (let i = 0; i < item.printNumber; i++) {
          // 打印数量
          let childNodes = dom.childNodes[0].childNodes;
          let length = childNodes.length;
          for (let i = 0; i < length; i++) {
            let idName = childNodes[i].dataset.idName;
            if (idName === 'PRINT_005') {
              childNodes[i].childNodes[0].innerText = v.defineContent;
            } else if (idName === 'PRINT_001') {
              childNodes[i].childNodes[0].innerHTML = item[v.mapping['PRINT_001']];
            } else {
              let text = item[v.mapping[idName]] || '';
              childNodes[i].childNodes[0].innerText = text;
            }
          }
          text += dom.innerHTML;
        }
        if (v.startEnd === 1 && v.startEndShow) {
          text += v.startEndHtml('End', item[v.mapping['PRINT_002']], item.printNumber); // 添加接收信息
        }
      });
      return text;
    },
    toLowerLine (str) {
      return str.replace(/[A-Z]/g, function (match) {
        return '-' + match.toLowerCase();
      });
    },
    startEndHtml (type = 'Start', sku, number) {
      /**
       * 起止html
       * @params
       * type Start End 设置分别返回html
       * */
      let v = this;
      let style = 'font-size:11pt;text-align:center;display:flex;align-items:center;justify-content:center;';
      for (let key in v.containerStyle) {
        style += v.toLowerLine(key) + ':' + v.containerStyle[key] + ';';
      }
      let dom = `<div style="${style}" class="print-box"><div><p style="word-break:break-all">${type}SKU:${sku}</p><p>Total:${number}</p></div></div>`;
      return dom;
    },
    setInitData (data) {
      // ON 设置初始值
      if (data) {
        this.printList.forEach(i => {
          if (data[this.mapping[i.IdName]]) {
            i.content = data[this.mapping[i.IdName]];
          }
        });
      }
    },
    setStartEndStorage () {
      this.setOtherCache();
    },
    setOtherCache () {
      // 设置其他缓存 宽高 起止
      let obj = {
        paperWidth: this.paperWidth,
        paperHeight: this.paperHeight,
        startEnd: this.startEnd
      };
      localStorage.setItem('printOtherSetting', JSON.stringify(obj));
    },
    getPosition () {
      /**
       * 获取本地位置
       * */
      let v = this;
      let data = localStorage.getItem(v.localStorageName);
      if (data) {
        /**
         * 如果有本地缓存
         * */
        let localDate = JSON.parse(data);
        v.printList.forEach((i, index) => {
          localDate.forEach(j => {
            if (i.IdName === j.IdName) {
              v.printList[index].left = j.left;
              v.printList[index].top = j.top;
              v.printList[index].fontSize = j.fontSize;
              v.printList[index].show = j.show;
            }
          });
        });
      } else {
        /**
         * 无本地缓存，设置初始位置
         * */
        let index = 0;
        const left = Math.ceil(parseInt(v.containerStyle.width) / 2);
        const top = (Math.floor(parseInt(v.containerStyle.width))) / (Math.ceil(v.printList.length / 2));
        v.printList.forEach(i => {
          i.left = Math.floor((index % 2) * left) + 'pt';
          if ((index / 2).toString().includes('.')) {
            i.top = Math.floor((index % 2 + (index / 2) - 0.5) * top) + 'pt';
          } else {
            i.top = Math.floor((index % 2 + (index / 2)) * top) + 'pt';
          }
          index++;
        });
        v.setStorage();
      }
      // 宽高
      let printOtherSetting = localStorage.getItem('printOtherSetting');
      if (printOtherSetting) {
        let otherData = JSON.parse(printOtherSetting);
        v.paperWidth = otherData.paperWidth;
        v.paperHeight = otherData.paperHeight;
        v.startEnd = otherData.startEnd;
        v.containerStyle.width = (otherData.paperWidth / v.printXI).toFixed(2) + 'pt';
        v.containerStyle.height = (otherData.paperHeight / v.printXI).toFixed(2) + 'pt';
      }
    },
    printInit () {
      /**
       * 拖拽初始化
       * */
      let v = this;
      let arr = [];
      v.printList.forEach((n) => {
        let drag;
        let el = document.querySelector('#' + n.IdName);
        drag = new Draggabilly(el, {
          // 选项...
          containment: true,
          axis: n.axis ? n.axis : 'xy'
        });
        arr.push({
          el: drag, ...n
        });
      });
      arr.forEach((i) => {
        i.el.on('dragEnd', (e) => {
          // 设置位置
          let name = e.target.dataset.idName;
          v.printList.forEach(i => {
            if (i.IdName === name) {
              let left = Math.floor(parseInt(e.path[1].style.left)) + 'px';
              let top = Math.floor(parseInt(e.path[1].style.top)) + 'px';
              v.$set(i, 'left', left);
              v.$set(i, 'top', top);
            }
          });
          localStorage.setItem(this.localStorageName, JSON.stringify(v.printList));
        });
      });
      v.$nextTick(() => {
        v.getPosition();
      });
    },
    setStorage () {
      localStorage.setItem(this.localStorageName, JSON.stringify(this.printList));
    },
    paperWidthChange () {
      /**
       *  介质宽度变化
       * */
      if (this.paperWidth > 100) {
        this.paperWidth = 100;
      }
      this.containerStyle.width = Math.floor(this.paperWidth / this.printXI) + 'pt';
      this.setOtherCache();
    },
    paperHeightChange () {
      /**
       *  介质高度变化
       * */
      if (this.paperHeight > 100) {
        this.paperHeight = 100;
      }
      this.containerStyle.height = Math.floor(this.paperHeight / (this.printXI)) + 'pt';
      this.setOtherCache();
    }
  }
};
</script>

<style scoped>
.ml10 {
  margin-left: 10px;
}

.container {
  position: relative;
  background-color: #999999;
  width: 400px;
  height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #999;
  overflow: hidden;
}
</style>
<style>
.draggable.is-pointer-down {
  background: #09f;
  z-index: 2; /* above other draggies */
}

.draggable.is-dragging {
  opacity: 0.7;
}

.print-box {
  position: relative;
}

.print-box .draggable {
  position: absolute;
  text-align: center;
}
</style>
