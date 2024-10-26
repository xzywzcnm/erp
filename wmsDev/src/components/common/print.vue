<template >
  <div class="print printPage formDetail">
    <Form :label-width="100">
      <div class="fmb0">
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
          <span class="fontTips">最大支持100mm X 100mm</span>
        </FormItem>
        <!--打印字体设置-->
        <FormItem label="标签大小">
          <Row>
            <template v-for="(item, index) in printList">
              <Col span="7" style="margin:0 10px 10px 0" v-if="item.show === 1 && !item.hidenLabel" :key="index">
              <Input v-model.trim="item.fontSize" @on-blur="setStorage" :key="index">
              <span slot="prepend" :key="index">{{ item.label }}字体</span>
              <span slot="append" :key="index">pt</span>
              </Input>
              </Col>
            </template>
          </Row>
          <span class="fontTips fontTipsTop">每pt约占0.35mm宽</span>
        </FormItem>
      </div>
      <Row type="flex" justify="space-between" class="code-row-bg fmb18">
        <!--控制是否打印-->
        <Col :span="12" style="padding-right: 10px">
        <template v-for="(item, index) in printList">
          <FormItem :label="item.label" :key="index" v-if="item.settingShow">
            <Select v-model="item.show" @on-change="setStorage($event, index)">
              <Option v-for="(itemD, indexD) in settingList" :key="indexD" :value="itemD.value"
                :label="itemD.label + item.label">
              </Option>
            </Select>
            <Input v-if="item.editContent && item.show" @on-change="changeDefineContent" v-model="item.content" />
          </FormItem>
        </template>
        <FormItem label="起止信息">
          <div class="flexBox">
            <Select v-model="startEnd" style="width: 100px;" @on-change="setOtherCache">
              <Option v-for="(itemD, indexD) in settingList" :key="indexD" :value="itemD.value"> {{ itemD.label }}
              </Option>
            </Select>
            <span> *注:打印内容可拖动改变位置</span>
          </div>
        </FormItem>
        </Col>
        <!--打印预览-->
        <Col :span="12">
        <div class="container" ref="container">
          <div class="print-box" :style="containerStyle">
            <div v-for="(item, index) in printList" class="draggable" :style="{
              left: item.left,
              top: item.top,
              display: item.axis === 'y' ? 'block' : 'inline-block',
              width: item.axis === 'y' ? '100%' : 'auto',
              fontFamily: item.IdName === 'PRINT_001' ? 'IDAutomationC128S' : 'Arial'
            }" :data-id-name="item.IdName" :key="index" :id="item.IdName">
              <span v-if="item.show === 1" :data-id-name="item.IdName" :style="{ fontSize: `${item.fontSize}pt` }"
                v-html="item.content"></span>
            </div>
          </div>
        </div>
        </Col>
      </Row>
    </Form>
  </div>
</template>

<script>
import Draggabilly from 'draggabilly';
export default {
  name: 'printModal',
  mixins: [],
  data() {
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
      defineContent: '',
      paperWidth: 60,
      paperHeight: 40,
      localStorageName: 'positionPrint2020', // 打印设置缓存名称
      printOtherSetting: 'printOtherSetting2020', // 宽 高 起止
      baseList: {
        'PRINT_001': {
          IdName: 'PRINT_001', // 打印id
          label: '条码',
          show: 1, // 默认展示
          settingShow: false,
          axis: 'y', // 控制拖拽方向
          content: '',
          left: 0,
          top: 0,
          fontSize: 12
        },
        'PRINT_002': {
          IdName: 'PRINT_002', // 打印id
          label: 'SKU',
          show: 1, // 默认展示
          settingShow: false,
          content: '',
          left: 0,
          top: 0,
          fontSize: 12
        },
        'PRINT_003': {
          IdName: 'PRINT_003', // 打印id
          label: '中文名称',
          show: 1, // 默认展示
          settingShow: true,
          content: '',
          left: 0,
          top: 0,
          fontSize: 12
        },
        'PRINT_004': {
          IdName: 'PRINT_004', // 打印id
          label: '商品规格', // '商品规格',
          show: 1, // 默认展示
          settingShow: true,
          content: '',
          left: 0,
          top: 0,
          fontSize: 12
        },
        'PRINT_005': {
          IdName: 'PRINT_005', // 打印id
          label: '自定义内容', // '自定义内容',
          show: 1, // 1 show 0 hide  默认展示
          settingShow: true, // 能否进行show hide的操作
          content: '',
          left: 0,
          top: 0,
          fontSize: 12,
          editContent: true //
        },
      }, // 公用显示
      printList: [],
    };
  },
  props: {
    // 打印映射
    mapping: {
      type: Object,
      default() {
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
          PRINT_0010: 'receiptNo', // 入库单号
          PRINT_0011: 'qualityTestHtml', // 质检标识
        };
      }
    },
    // 打印初始值
    initData: {
      type: Object,
      default() { return {} }
    },
    // 要显示的打印下拉内容
    sourceList: {
      type: Array,
      default() { return [] }
    },
    // 打印初始化内容
    printObject: {
      type: Object,
      default() { return {} }
    }
  },
  watch: {
    // 要显示的打印下拉内容
    sourceList: {
      handler(data) {
        let arr = data || [];
        let selectTemp = {
          'PRINT_006': {
            IdName: 'PRINT_006', // 打印id
            label: '产品库位', // '产品库位',
            show: 0, // 1 show 0 hide  默认不展示
            settingShow: true, // 能否进行show hide的操作
            content: '产品库位预览占位', // '产品库位预览占位',
            left: 0,
            top: 0,
            fontSize: 12
          },
          'PRINT_007': {
            IdName: 'PRINT_007', // 打印id
            label: '产品绑定库区', // '产品绑定库区'
            show: 0, // 默认不展示
            settingShow: true,
            content: '产品绑定库区预览占位', // '产品绑定库区预览占位',
            left: 0,
            top: 0,
            fontSize: 12
          },
          'PRINT_008': {
            IdName: 'PRINT_008', // 打印id
            label: '批次号', // '批次号',
            show: 0, // 1 show 0 hide  默认不展示
            settingShow: true, // 能否进行show hide的操作
            content: '',
            left: 0,
            top: 0,
            fontSize: 12
          },
          'PRINT_009': {
            IdName: 'PRINT_009', // 打印id
            label: '参考编号', // '参考编号',
            show: 0, // 1 show 0 hide  默认不展示
            settingShow: true, // 能否进行show hide的操作
            content: '参考编号预览占位', // '参考编号预览占位',
            left: 0,
            top: 0,
            fontSize: 12
          },
          'PRINT_0010': {
            IdName: 'PRINT_0010', // 入库单号
            label: '入库单号', // '入库单号',
            show: 0, // 1 show 0 hide  默认不展示
            settingShow: true, // 能否进行show hide的操作
            content: '',
            left: 0,
            top: 0,
            fontSize: 12
          },
          'PRINT_0011': {
            IdName: 'PRINT_0011', // 质检标识
            label: '质检标识', // '质检标识',
            show: 0, // 1 show 0 hide  默认不展示
            settingShow: true, // 能否进行show hide的操作
            content: '',
            left: 0,
            top: 0,
            fontSize: 12,
            hidenLabel: true, // 是否隐藏设置标签大小
          }
        }
        let list = {};
        arr.forEach(k => {
          selectTemp[k] && (list[k] = selectTemp[k]);
        })
        let totalObject = Object.assign({}, this.baseList, list);
        let totalList = Object.keys(totalObject).map(k => totalObject[k]);
        this.printList = this.$common.copy(totalList);
        this.setInitData(this.printObject);
        this.$nextTick(() => {
          this.printInit();
          this.getPosition();
        })
      },
      deep: true,
      immediate: true
    },
    // 打印初始化内容
    printObject: {
      handler(data) {
        this.setInitData(data || {});
      },
      deep: true,
      immediate: true
    },
  },
  methods: {
    changeDefineContent(e) {
      this.defineContent = e.target.value;
    },
    onPrint(data) {
      return new Promise(resolve => {
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
        });
      });
    },
    htm5Doc(data) {
      let path = `${window.location.origin}/wms-service/static/printFont/`;
      return (`<!DOCTYPE html>
              <html lang="zh-CN">
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
    htmlText(data) {
      let v = this;
      let dom = v.$refs.container.cloneNode(true);
      let text = '';
      data.forEach(item => {
        if (v.startEnd === 1) {
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
            } else if (idName === 'PRINT_0011') { // 需要质检的商品才需要展示标签
              childNodes[i].childNodes[0].innerHTML = item.haveCheck == 2 ? item[v.mapping[idName]] : '';
            } else {
              let text = item[v.mapping[idName]] || '';
              childNodes[i].childNodes[0].innerText = text;
            }
          }
          text += dom.innerHTML;
        }
        if (v.startEnd === 1) {
          text += v.startEndHtml('End', item[v.mapping['PRINT_002']], item.printNumber); // 添加接收信息
        }
      });
      return text;
    },
    toLowerLine(str) {
      return str.replace(/[A-Z]/g, function (match) {
        return '-' + match.toLowerCase();
      });
    },
    /**
     * 起止html
     * @params
     * type Start End 设置分别返回html
     * */
    startEndHtml(type = 'Start', sku, number) {
      let v = this;
      let style = 'font-size:11pt;text-align:center;display:flex;align-items:center;justify-content:center;';
      for (let key in v.containerStyle) {
        style += v.toLowerLine(key) + ':' + v.containerStyle[key] + ';';
      }
      let dom = `<div style="${style}" class="print-box"><div><p style="word-break:break-all">${type}SKU:${sku}</p><p>Total:${number}</p></div></div>`;
      return dom;
    },
    // 设置打印内容初始值
    setInitData(data) {
      this.printList.forEach(i => {
        if (data[this.mapping[i.IdName]]) i.content = data[this.mapping[i.IdName]];
      });
    },
    // 设置其他缓存 宽高 起止
    setOtherCache() {
      let obj = {
        paperWidth: this.paperWidth,
        paperHeight: this.paperHeight,
        startEnd: this.startEnd
      };
      localStorage.setItem('printOtherSetting', JSON.stringify(obj));
    },
    // 获取本地位置
    getPosition() {
      let v = this;
      let data = localStorage.getItem(v.localStorageName);
      if (data) {
        // 如果有本地缓存
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
        // 无本地缓存，设置初始位置
        let index = 0;
        const left = Math.ceil(parseInt(v.containerStyle.width) / 2);
        const top = (Math.floor(parseInt(v.containerStyle.width))) / (Math.ceil(v.printList.length / 2));
        v.printList.forEach(i => {
          if (i.show === 1) {
            i.left = Math.floor((index % 2) * left) + 'pt';
            if ((index / 2).toString().includes('.')) {
              i.top = Math.floor((index % 2 + (index / 2) - 0.5) * top) + 'pt';
            } else {
              i.top = Math.floor((index % 2 + (index / 2)) * top) + 'pt';
            }
            index++;
          }
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
    // 拖拽初始化
    printInit() {
      let v = this;
      let arr = [];
      v.printList.forEach((n) => {
        let drag;
        let el = document.querySelector('#' + n.IdName);
        if (!el) return;
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
          let dom = e.target;
          let num = 0;
          let fun = (target) => {
            let domName = target.getAttribute('data-id-name');
            if (domName) return domName;
            if (num >= 10) return null;// 超过10层就不找了
            let pDom = target.parentNode;// 寻找父级
            num++;
            fun(pDom);
          }
          let elName = fun(dom);
          if (!elName) {
            this.$message.error('拖拽容器丢失，请联系技术人员');
            return;
          }
          // 设置位置
          // let name = e.target.dataset.idName;
          // let pathIndex = 1;
          // if (!name && e.path && e.path.length) {
          //   e.path.forEach((k, index) => {
          //     if (!name && k.id && k.id.indexOf('PRINT_') >= 0) {
          //       name = k.id;
          //       pathIndex = index;
          //     }
          //   })
          // }
          v.printList.forEach(i => {
            if (i.IdName === elName) {
              let dom = document.getElementById(elName);
              let left = Math.floor(parseInt(dom.style.left)) + 'px';
              let top = Math.floor(parseInt(dom.style.top)) + 'px';
              //     let left = Math.floor(parseInt(e.path[pathIndex].style.left)) + 'px';
              //     let top = Math.floor(parseInt(e.path[pathIndex].style.top)) + 'px';
              v.$set(i, 'left', left);
              v.$set(i, 'top', top);
            }
          });
          localStorage.setItem(this.localStorageName, JSON.stringify(v.printList));
        });
      });
    },
    // printList存缓存
    setStorage() {
      localStorage.setItem(this.localStorageName, JSON.stringify(this.printList));
    },
    // 介质宽度变化
    paperWidthChange() {
      if (this.paperWidth > 100) this.paperWidth = 100;
      this.containerStyle.width = Math.floor(this.paperWidth / this.printXI) + 'pt';
      this.setOtherCache();
    },
    // 介质高度变化
    paperHeightChange() {
      if (this.paperHeight > 100) this.paperHeight = 100;
      this.containerStyle.height = Math.floor(this.paperHeight / (this.printXI)) + 'pt';
      this.setOtherCache();
    }
  }
};
</script >

<style scoped lang="less">
.printPage {
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

  .print-box {
    position: relative;

    .draggable {
      position: absolute;
      text-align: center;

      .is-pointer-down {
        background: #09F;
        z-index: 2;
      }

      .is-dragging {
        opacity: 0.7;
      }
    }
  }

  .fontTips {
    color: #f00;
    display: inline-block;
  }

  .fontTipsTop {
    position: relative;
    top: -10px;
  }
}
</style>