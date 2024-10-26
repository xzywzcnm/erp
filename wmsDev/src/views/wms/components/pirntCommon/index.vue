<template >
  <Modal v-model="isVisible" title="打印标签" :styles="{ top: '80px', width: '900px' }" class="headerBar pirntCommonPage"
    :mask-closable="false">
    <Card dis-hover v-if="pintField.printParams">
      <div class="input-disabled">
        <span>介质材料</span> <span style="margin-left:20px;margin-right:10px;">宽</span>
        <InputNumber v-model.trim="pintField.printParams.width" :max="100" disabled style="width:50px;margin-right:10px;"
          size="small"></InputNumber>
        mm <span style="margin-left:20px;margin-right:10px;">高</span>
        <InputNumber v-model.trim="pintField.printParams.height" :max="100" disabled style="width:50px;margin-right:10px;"
          size="small"></InputNumber>
        mm
      </div>
    </Card>
    <div class="mb10 mt20">
      <div class="mb10">货品</div>
      <Table highlight-row max-height="200" :columns="printColumns" :data="tableList" :border="true">
        <template slot-scope="{ row, index }" slot="printNum">
          <Input v-model.trim="row.printNum" type="number" style="text-align: center;"
            @on-keyup="printNumInput(row, index)"></Input>
        </template>
      </Table>
    </div>
    <div class="mb10" v-if="!linkPrint">
      <div>示例</div>
      <Card dis-hover class="tips-style">
        <div ref="container" class="container" :style="pageClass" v-if="tableList.length && configFinish">
          <div v-for="(item, index) in  pintField.columns " :key="index" :ref="item.key" :data-name="item.key"
            :style="pintField.positionKey[item.key]">
            <template v-if="!item.noprint">
              <!-- 条形码 -->
              <template v-if="item.barcode">
                <div class="barcode-code">
                  <barcode :option="{ id: `barcode${index}${item.key}`, content: data[item.key] }"
                    :codeParams="pintField.codeOption[item.key] || {}">
                  </barcode>
                </div>
              </template>
              <!-- 图片 -->
              <template v-else-if="item.isImage">
                <img :src="data[item.key]" style="width: 100%;" />
              </template>
              <!-- 文字 -->
              <template v-else>
                <div class="barcode-text">
                  {{ data[item.key] }}</div>
              </template>
              <!-- 二维码 -->
              <!-- <template v-else-if="item.qrcode">
                <qrcode></qrcode>
              </template> -->

            </template>

          </div>
        </div>
      </Card>
    </div>
    <div slot="footer">
      <Button type="primary" @click="pintAll" v-if="tableList.length">打印 </Button>
      <Button @click="cancelPrintBarcode">取消</Button>
    </div>

    <!-- 隐藏的打印内容 -->
    <div ref="tagTemp" style="display: none;" v-if="!linkPrint">
      <div class="conthtml" v-if="pintList.length">
        <div v-for="( pitem, pindex ) in  pintList " :key="pindex">
          <div class="barcode" :style="pageClass">
            <div v-for="( item, cindex ) in  pintField.columns " :style="pintField.positionKey[item.key]" :key="cindex">
              <template v-if="!item.noprint">
                <!-- 条形码 -->
                <template v-if="item.barcode">
                  <div class="barcode-code">
                    <barcode :codeParams="pintField.codeOption[item.key] || {}" @valid="validCode"
                      :key="'ckey' + pindex + cindex"
                      :option="{ id: `barcode-${pindex}${cindex}${item.key}`, content: pitem[item.key], pindex: pindex }">
                    </barcode>
                  </div>
                </template>
                <!-- 图片 -->
                <template v-else-if="item.isImage">
                  <img :src="data[item.key]" style="width: 100%;" />
                </template>
                <!-- 其余内容 -->
                <template v-else>
                  <div class="barcode-text">
                    {{ pitem[item.key] }}</div>
                </template>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Spin fix v-if="loading">准备打印，耐心等候，请勿中断操作...</Spin>
  </Modal>
</template>

<script>
import api from '@/api/api';
import Draggabilly from 'draggabilly';
import barcode from './Barcode';
export default {
  name: 'print',
  components: { Draggabilly, barcode },
  props: {
    printModal: { // 打印弹框控制
      type: Boolean,
      default: () => {
        return false;
      }
    },
    printData: { // 打印数据
      type: Array,
      default: () => {
        return [];
      }
    },
    pintField: { // 打印数据
      type: Object,
      default: () => {
        return {
          columns: [], // 表头
          pintContent: [], // 打印内容
          printParams: {
            width: 70,
            height: 20,
          }, // 打印大小
          positionKey: {}, // 标签初始位置
          isDraggle: false, // 是否可以拖拽
          codeOption: {}, // code配置参数
        };
      }
    },
    printMessage: { // 是否提示打印成功
      type: Boolean,
      default: () => {
        return true
      }
    },
    linkPrint: { // 是否链接打印
      type: Boolean,
      default: () => {
        return false
      }
    }
  },
  data() {
    // 数量 num
    return {
      isVisible: false,
      FixedValue: 3.779, // 1 毫米 [mm] = 3,779像素 [px]
      pageClass: {// 实例画布大小
        width: 0,
        height: 0,
        background: '#fff',
        textAlign: 'center'
      },
      printColumns: [], // 表头
      data: {}, // 默认第一个标签数据
      printAllList: [],
      pintList: [], // 打印内容
      index: 0,
      loading: false,
      last: false,
      configFinish: false,
      clearTime: null, // 打印定时器
      waitTime: null, // 打印超时定时器
      tableList: [], // 示例表格数据
      messageLoading: false, // 打印数量提示
      copyTablelist: {}// 复制表格数据
    };
  },
  watch: {
    printModal: {
      handler(val) {
        if (val) {
          this.isVisible = true;
          this.setData();
        }
      },
      deep: true,
      immediate: true
    },
    isVisible: {
      handler(val) {
        if (!val) this.$emit('update:printModal', false);
      },
      deep: true,
      immediate: true
    },
    printData: {
      handler(val) {
        let list = this.$common.copy(val || []);
        this.tableList = list.map(k => {
          delete k._expanded;
          return k;
        });
        this.data = this.tableList[0] || {};
      },
      deep: true,
      immediate: true
    },
    loading: {
      handler(val) {
        // 当弹框没有打开，且loading为true开始打印的时候，全局添加加载框显示
        if (this.isVisible) return;
        if (val) {
          this.$Spin.show({
            render: (h) => {
              return h('div', {}, '准备打印，耐心等候，请勿中断操作...')
            }
          });
        } else {
          this.$Spin.hide();
        }
      },
      deep: true,
      immediate: true
    },
    tableList: {
      handler(val) {
        this.printAllList = [];
        (val || []).forEach(k => {
          for (let i = 0; i < k.printNum; i++) {
            this.printAllList.push(k);
          }
        })
      },
      deep: true,
      immediate: true
    },
  },
  methods: {
    // 条形码是否生成
    validCode(e, index) {
      // console.log("条形码是否生成", e);
      this.$set(this.pintList[index], 'valid', e);
    },
    // 限制打印条数
    pintComput() {
      return new Promise((resolve, reject) => {
        this.pintList = []; // 置空先

        let list = this.printAllList || [];
        let [total, flag, totalNum] = [0, false, 50];
        let index = this.index || 0;
        list.forEach((k, i) => {
          if (flag) return;
          if (i >= index) {
            if (total < totalNum) {
              total++;
              if (i >= (list.length - 1)) {
                this.index = i + 1;
              }
            } else {
              flag = true;
              this.index = i;
            }
          }
        })
        let lastIndex = this.index > 0 ? this.index : list.length;
        let pintList = list.slice(index, lastIndex);
        this.$nextTick(() => {
          this.pintList = [...pintList];
          // console.log(index, lastIndex, pintList, '打印开始位置，打印结束位置，打印数据');
          resolve();
        })
      })
    },
    // 窗口打开
    async setData() {
      let url = 'http://localhost:10099/check?callback=checkHandler&_=' + new Date().getTime();
      this.myjsonp(url, function (data) { }, 'checkHandler');
      await this.columnsHead();
      await this.setCanvaSize();
      this.configFinish = true;
      this.$nextTick(() => {
        this.pintField.isDraggle && this.addDragFun();
        this.saveLocal();
      })
    },
    // 计算表头显示内容
    columnsHead() {
      return new Promise((resolve, reject) => {
        this.printColumns = [];
        this.pintField.columns.forEach(k => {
          if (k.barcode || k.hide || k.isImage) return;// 过滤条形码/不需要展示的
          // if (k.qrcode) return;//过滤二维码
          let propname = k.key === 'printNum' ? 'slot' : 'key';
          let temp = {};
          temp.title = k.label;
          temp[propname] = k.okey || k.key;
          temp.align = 'center';
          temp.minWidth = 120;
          this.printColumns.push(temp);
        })
        resolve();
      })
    },
    // 添加拽动事件
    addDragFun() {
      if (!this.$refs.container) return;
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
          let [key, ls, obj] = ['', this.pintField.pintContent, null];
          e.path.forEach(k => {
            if (k.getAttribute && (ls.includes(k.getAttribute('data-name')))) {
              key = k.getAttribute('data-name');
              obj = k;
            }
          });
          if (!(key && obj)) return;// 拿不到调整位置的节点
          // 设置位置
          let data = localStorage.getItem('positionPrintorder') ? JSON.parse(localStorage.getItem('positionPrintorder')) : [];
          if (data[key]) {
            data[key].left = obj.style.left;
            data[key].top = obj.style.top;
          }
          localStorage.setItem('positionPrintorder', JSON.stringify(data));
          this.positionKey = data;
        });
      });
    },
    // 设置画布大小
    setCanvaSize() {
      return new Promise((resolve, reject) => {
        let data = this.pintField.printParams;
        this.pageClass.width = (data.width * this.FixedValue) + 'px';
        this.pageClass.height = (data.height * this.FixedValue) + 'px';
        resolve();
      })
    },
    // 存储打印配置
    saveLocal() {
      // let data = localStorage.getItem('positionPrintorder') ? JSON.parse(localStorage.getItem('positionPrintorder')) : null;
      // let data = null;
      // // 存储位置
      // if (!data) {
      //   this.positionKey = this.pintField.positionKey;
      //   localStorage.setItem('positionPrintorder', JSON.stringify(this.positionKey));
      //   this.getPosition(this.positionKey);
      // } else {
      //   this.positionKey = data;
      //   this.getPosition(data);
      // }
      // this.getPosition(this.pintField.positionKey);
    },
    // 设置打印配置
    setLocal(key, value) {
      let data = localStorage.getItem('printSettingorder') ? JSON.parse(localStorage.getItem('printSettingorder')) : {};
      data[key] = value;
      localStorage.setItem('printSettingorder', JSON.stringify(data));
    },
    // // 获取本地位置
    // getPosition(data) {
    //   if (!this.$refs.container) return;
    //   let el = this.$refs.container.childNodes || [];
    //   el.forEach(k => {
    //     let key = k.getAttribute('data-name') || '';
    //     if (key && data[key]) {
    //       k.style.top = data[key].top;
    //       k.style.left = data[key].left;
    //     }
    //   });
    // },
    // jsonp跨域处理
    myjsonp(URL, callback, callbackname) {
      // 给系统中创建一个全局变量，叫做callbackname，指向callback函数
      window[callbackname] = callback;
      // 创建一个script节点
      var oscript = document.createElement('script');
      // 和image不一样，设置src并不会发出HTTP请求
      oscript.src = URL;
      oscript.type = 'text/javascript';
      // 出错
      oscript.onerror = () => {
        this.downloadPrint();
      };
      // script标签的请求是在上树的时候发出，请求的是一个函数的执行语句
      document.head.appendChild(oscript);
      // 为了不污染页面，瞬间把script拿掉
      document.head.removeChild(oscript);
    },
    // 打印控件下载
    downloadPrint() {
      // this.$emit('printFault');//调起打印失败，通知
      let defaultUrl = '/wms-service/tool/TongtoolPrinter.exe';// 默认通途打印插件下载路径
      let tipPopup = (url) => {
        let path = this.$store.state.erpConfig.filenodeViewTargetUrl + (url || defaultUrl);
        this.$Modal.info({
          title: '提示',
          okText: '关闭',
          render: (h, params) => {
            return h('div', {
              class: 'normalTop20'
            }, [
              h('div', {
                class: 'flexBox flexBoxJustContent',
                style: {
                  fontSize: '16px'
                }
              }, '该功能需使用打印控件，请下载安装'), h('a', {
                attrs: {
                  href: path,
                  // href: this.$store.state.erpConfig.filenodeViewTargetUrl + response.data.datas,
                  target: '_blank'
                },
                class: 'flexBox flexBoxJustContent normalTop',
                style: {
                  fontSize: '16px',
                  fontWeigh: 'bold'
                }
              }, '点击下载'), h('div', {
                class: 'flexBox flexBoxJustContent normalTop',
                style: {
                  fontSize: '16px'
                }
              }, '如果已安装，请开启打印控件')
            ]);
          }
        });
      }
      this.axios.get(api.get_downloadPrint).then(response => {
        let data = response.data || {};
        if (data.code === 0) {
          tipPopup(data.datas);
        } else {
          tipPopup();
        }
      }).catch(() => {
        tipPopup();
      })
    },
    // 打印
    pintAll() {
      if (this.linkPrint) {
        this.$emit('linkPirntFun', this.tableList);
        this.cancelPrintBarcode();
        return;
      }
      this.loading = true;
      this.last = false;
      this.index = 0;
      this.readyPrint();
    },
    // 是否准备好打印
    readyPrint() {
      let contentRender = () => {
        if (!this.pintList.length) {
          this.loading = false;
          this.printMessage && this.$Message.success('操作成功');
          this.cancelPrintBarcode();
          return;
        };
        let conthtml = document.querySelector('.conthtml');
        // console.log(conthtml, 'conthtml', this.pintList);
        // 假如打印内容渲染不存在，则不需要一直加载等
        if (!conthtml) {
          this.$Message.error('打印失败，标签生成异常!');
          this.loading = false;
          return;
        }
        // 生成节点跟要打印的内容长度一致，则开始打印
        let domList = conthtml ? conthtml.childNodes : [];
        // console.log(domList, this.pintList, '准备打印');
        if (domList.length == this.pintList.length) {
          this.printBarcode();
        } else {
          contentRender(); // 可能存在渲染不及时的情况，多次调用直至内容渲染完
        }
      }
      this.pintComput().then(() => {
        this.$nextTick(() => {
          contentRender();
        })
      })
    },
    // 打印条码
    printBarcode() {
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
      const postId = parseInt(Math.random() * 1000000000);// 看通途的代码，是面单id，但是总觉得是每一次打印带过去的标识 所以这里用了随机数代替
      instance.post('http://localhost:10099/print', {
        content: this.htm5Doc(),
        postId: postId
      }).then(response => {
        if (response.status === 200) {
          if (this.index >= (this.printAllList.length - 1)) {
            if (!this.last) {
              this.last = true;
              this.startPrintMonitor(postId, () => {
                this.readyPrint();
              })
            } else {
              this.startPrintMonitor(postId, () => {
                // this.index = 0;// 恢复默认值
                this.loading = false;
                this.printMessage && this.$Message.success('操作成功');
                this.cancelPrintBarcode();
              })
            }
          } else {
            this.startPrintMonitor(postId, () => {
              this.readyPrint();
            })
          }
        } else {
          this.downloadPrint();
          this.loading = false;
        }
      }).catch(e => {
        this.downloadPrint();
        this.loading = false;
      })
    },
    htm5Doc() {
      let content = '';
      // if (!this.pintField.svgConfig.displayValue) {
      //   let svgStyle = this.pintField.svgStyle || {};
      //   let fontSize = svgStyle.fontSize || '8pt';
      //   let num = fontSize.replace(/[^0-9]/ig, '');
      //   content = `
      //     let drawText = function (id, content) {
      //       let dom = document.getElementById(id); // 二维码
      //       let container = document.querySelector('.container'); // 整个标签快
      //       let width = (dom ? dom.clientWidth : container.clientWidth);
      //       width = Math.floor(width);
      //       let svg = dom.parentNode.innerHTML;
      //       let str = '<div style="position: absolute;left:0;margin-top:2px;"><svg id="'+id+'svg" height="${(num - 0) + 2}" width="'+width+'"><text x="0" y="${num}" style="fill:black; font-size:${num}; font-weight:bold;" lengthAdjust="spacing" textLength="'+width+'" stroke-width="3" stroke="balck">'+content+'</text></svg></div>';
      //       dom.parentNode.innerHTML = svg + str;
      //     }
      //     let barcodelist = document.querySelectorAll('.barcodeCon');
      //       barcodelist.forEach(k => {
      //         let id = k.querySelector('svg').getAttribute('id');
      //         let content = k.querySelector('svg').getAttribute('data-content');
      //         drawText(id, content);
      //   })`;
      // }
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
                height: 100%;
              }
              .barcode-text {
                font-weight: bolder;
                display: inline-block;
              }
              .box {background: #8e8e8e;}
              @media print {.btn{display: none;}}
            </style>
          </head>
          <body class="box">` + (this.$refs.tagTemp && this.$refs.tagTemp.innerHTML) + `</body>
          <` + `script >` + content + `</` + `script></html>`);
    },
    // 取消打印条码
    cancelPrintBarcode() {
      this.isVisible = false;
      this.$emit('update:printModal', false);
    },
    // 查询打印状态
    startPrintMonitor(postId, callback) {
      delete this.axios.defaults.headers.post['X-Requested-With'];
      this.axios.jsonp('http://localhost:10099/printResult?_=' + Date.now() + '&postId=' + postId).then(response => {
        if (response.data === '0') {
          // 设定200条，响应时间为1分钟
          if (!this.waitTime) {
            let time = Math.ceil(this.printAllList.length / 200) * 60000;
            this.waitTime = setTimeout(() => {
              this.clearPrintTime();
              callback && callback();
            }, time);
          }
          // 查询打印状态
          this.clearTime = setTimeout(() => {
            this.startPrintMonitor(postId, callback);
          }, 800);
          return;
        }
        this.clearPrintTime();
        if (response.data === '2') {
          console.log('打印失败');
        } else if ([1, '1'].includes(response.data)) {
          console.log('完成打印');
        }
        callback && callback();
      }).catch(() => {
        console.log('打印失败');
        callback && callback();
      })
    },
    clearPrintTime() {
      clearTimeout(this.clearTime);
      clearTimeout(this.waitTime);
      this.waitTime = this.clearTime = null;
    },
    // 打印数量变化
    printNumInput(row, index) {
      let printNum = Number(row.printNum);
      if (!this.messageLoading && (printNum <= 0 || printNum > 200)) {
        this.messageLoading = true;
        this.$Message.error('打印数量大于0且小于200，请修改数量~');
        setTimeout(() => {
          this.messageLoading = false;
        }, 1000);
      }
      if (printNum <= 0) row.printNum = 1;
      if (printNum > 200) row.printNum = 200;
      this.$set(this.tableList, index, row);
    }
  }
};
</script>
<style scoped lang="less">
.pirntCommonPage {
  .input-disabled .ivu-input-number-disabled .ivu-input-number-input {
    color: #444;
  }

  .tips-style {
    overflow: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #e8e8e8;
  }

  .container {
    position: relative;

    >div.is-pointer-down {
      background: #09f;
      z-index: 2;
      /* above other draggies */
    }

    >div.is-dragging {
      opacity: 0.7;
    }
  }

  .barcode {
    position: relative;
  }

  .barcode-code {
    height: 100%;
  }

  .barcode-text {
    font-weight: bolder;
    display: inline-block;
  }
}
</style>
