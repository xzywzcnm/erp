<template >
  <!-- eslint-disable-next-line vue/no-mutating-props -->
  <Modal v-model="dialogObj.modelVisible" title="打印箱唛" @on-visible-change="visible" :styles="{top: '80px',width:'870px'}" class="headerBar" :mask-closable="false">
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
        <div class="mb10">箱唛</div>
        <Table highlight-row max-height="200" :columns="printColumns" :data="tableList" :border="true"></Table>
      </div>

      <Card dis-hover style="height:500px;background:#e8e8e8;overflow:auto;display:flex;justify-content:center;align-items:center;">
        <div :style="pageClass" ref="printMaintbox" class="printMaintbox">
          <div class="box mb10" data-name="box" :style="positionKey.box" v-if="dialogPrintmaint.length">
            <div class="box-li">第{{1}}箱(共{{dialogPrintmaint.length}}箱)</div>
            <div class="box-li">{{dialogObj.data.supplierName || ''}}</div>
            <div class="box-li">
              <div>发货单号：{{dialogObj.data.supplierDespatchId || ''}}</div>
              <div>下单数：{{dialogObj.data.allOrderQuantity || 0}}</div>
              <div>发货数：{{dialogObj.data.allSendQuantity || 0}}</div>
            </div>
            <div class="box-li">物流运单号：{{dialogObj.data.trackingNumber || ''}}</div>
          </div>
          <div class="code-main" :style="positionKey.code" data-name="code">
            <div v-for="(item,index) in orderList" class="mt10 mb10" :key="index">
              <barcode :option="{id: 'printbox'+index, content: item}"></barcode>
              <div>{{item || ''}}</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
    <div slot="footer">
      <Button type="primary" @click="printBarcode" v-if="dialogPrintmaint.length">打印 </Button>
      <!-- eslint-disable-next-line vue/no-mutating-props -->
      <Button @click="dialogObj.modelVisible = false">取消</Button>
    </div>

    <div ref="tagTemp" style="display: none;">
      <div class="pritContent">
        <div v-for="(item,index) in dialogPrintmaint" :key="index" :style="pageClass" class="barcode">
          <div class="box mb10" :style="positionKey.box">
            <div class="box-li">第{{index+1}}箱(共{{dialogPrintmaint.length}}箱)</div>
            <div class="box-li">{{dialogObj.data.supplierName || ''}}</div>
            <div class="box-li">
              <div>发货单号：{{dialogObj.data.supplierDespatchId || ''}}</div>
              <div>下单数：{{dialogObj.data.allOrderQuantity || 0}}</div>
              <div>发货数：{{dialogObj.data.allSendQuantity || 0}}</div>
            </div>
            <div class="box-li">物流运单号：{{dialogObj.data.trackingNumber || ''}}</div>
          </div>
          <div class="code-main" :style="positionKey.code" data-name="code">
            <div v-for="(item,index) in orderList" class="mt10 mb10" :key="item">
              <barcode :option="{id: 'printbox'+index, content: item}"></barcode>
              <div>{{item || ''}}</div>
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
import api from '@/api/api';

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
    dialogObj: {
      type: Object,
      default () {
        return {
          data: {},
          modelVisible: false
        };
      }
    }
  },
  data () {
    // 数量 num
    return {
      FixedValue: 2.83,
      printNum: 1,
      printParams: {
        width: 100,
        height: 100,
        barcodeSize: 12,
        productNo: 0,
        custom: 0
      },
      pageClass: {
        width: '283pt',
        height: '283pt',
        background: '#fff',
        textAlign: 'center'
      },
      positionKey: {},
      printColumns: [
        {
          title: "供应商名称",
          key: "supplierName",
          align: "center",
        },
        {
          title: "发货单号",
          key: "supplierDespatchId",
          align: "center",
        },
        {
          title: "下单数",
          key: "allOrderQuantity",
          align: "center",
        },
        {
          title: "发货数",
          key: "allSendQuantity",
          align: "center",
        },
        {
          title: "物流运单号",
          key: "trackingNumber",
          align: "center",
        },
        {
          title: "总箱数",
          key: "totalBox",
          align: "center",
        },
      ],
      printObj: {
        id: "printTest",    // 这里是要打印元素的ID
        popTitle: '打印箱唛',  // 打印的标题
      },
      dialogPrintmaint: [],
      orderList: [],
      tableList: []
    };
  },
  methods: {
    // 窗口打开
    visible (open) {
      if (open) {
        this.$Spin.show();
        this.getDetail().finally(() => {
          this.$Spin.hide();
          if (!this.dialogPrintmaint.length) {
            this.$Message.error('请先维护箱唛再打印喔~');
            return;
          }
          let url = 'http://localhost:10099/check?callback=checkHandler&_=' + new Date().getTime();
          this.myjsonp(url, function (data) { }, "checkHandler");

          this.showPrint();
          this.getLocal();

          let data = localStorage.getItem('positionPrintbox') ? JSON.parse(localStorage.getItem('positionPrintbox')) : null;

          // 存储位置
          if (!data) {
            // 获取箱内容高度(因为内容高度不固定)
            let code = document.getElementsByClassName('box')[0];
            this.positionKey = {
              box: { top: "10px" },
              code: { top: (code.offsetHeight + 10) + 'px' },
            };
            localStorage.setItem('positionPrintbox', JSON.stringify(this.positionKey));
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
      let el = this.$refs.printMaintbox.childNodes || [];
      let arr = [];
      el.forEach(n => {
        let drag = new Draggabilly(n, {
          containment: '.printMaintbox', // 选项...
          axis: 'y'
        });
        arr.push(drag);
      });
      arr.forEach((i, index) => {
        i.on('dragEnd', (e) => {
          let [key, ls, obj] = ['', ['box', 'code'], null];
          e.path.forEach(k => {
            if (k.getAttribute && (ls.includes(k.getAttribute('data-name')))) {
              key = k.getAttribute('data-name');
              obj = k;
            }
          });
          if (!(key && obj)) return;//拿不到调整位置的节点
          // 设置位置
          let data = localStorage.getItem('positionPrintbox') ? JSON.parse(localStorage.getItem('positionPrintbox')) : {};
          data[key] = { top: obj.style.top };
          localStorage.setItem('positionPrintbox', JSON.stringify(data));
          this.positionKey = data;
        });
      });
    },
    // 获取打印配置
    getLocal () {
      let data = localStorage.getItem('printSettingbox');
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
        localStorage.setItem('printSettingbox', JSON.stringify(this.printParams));
      }
    },
    // 设置打印配置
    setLocal (key, value) {
      let data = localStorage.getItem('printSettingbox') ? JSON.parse(localStorage.getItem('printSettingbox')) : {};
      data[key] = value;
      localStorage.setItem('printSettingbox', JSON.stringify(data));
    },
    // 设置位置
    getPosition (data) {
      let el = this.$refs.printMaintbox.childNodes || [];
      el.forEach(k => {
        let key = k.getAttribute('data-name') || '';
        if (key && data[key]) {
          k.style.top = data[key].top;
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
        console.log("出错，需要安装打印插件");
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
    // 调整宽度
    changeWidth (val) {
      let v = this;
      v.pageClass.width = (val * v.FixedValue) + 'pt';
      v.setLocal('width', val);
    },
    // 调整高度
    changeHeight (val) {
      let v = this;
      v.pageClass.height = (val * v.FixedValue) + 'pt';
      v.setLocal('height', val);
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
    // 打印内容
    htm5Doc () {
      return (`<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <title>Title</title>
            <style type="text/css">
              *{margin: 0;padding: 0}
              .barcode {
                position: relative;
                font-size:12pt;
                background-color: rgb(255, 255, 255);
                break-before: page;
                margin:0 auto;
              }
              .box {
                border: 1px solid #000;
              }
              .box .box-li {
                padding: 10px 6px;
              }
              .box .box-li:not(:last-child) {
                border-bottom: 1px solid #000;
              }
              .box,
              .code-main {
                left: 10px;
                right: 10px;
                position: absolute;
                cursor: move;
                text-align: center;
              }
              .boxs {background: #8e8e8e;}
              @media print {.btn{display: none;}}
            </style>
          </head>
          <body class="boxs">` + (this.$refs.tagTemp && this.$refs.tagTemp.innerHTML) + `</body>
        </html>`);
    },
    // 获取需要的数据
    async getDetail () {
      let supplierDespatchId = this.dialogObj.data.supplierDespatchId;
      await this.getBoxlist(supplierDespatchId);
      await this.getPrintlist(supplierDespatchId);

      let obj = JSON.parse(JSON.stringify(this.dialogObj.data));
      obj.totalBox = this.dialogPrintmaint.length;
      this.tableList = [obj];
    },
    // 查看箱唛
    getBoxlist (supplierDespatchId) {
      return new Promise((resolve, reject) => {
        this.axios.post(api.queryShippingMark + `?supplierDespatchId=${supplierDespatchId}`).then(({ data }) => {
          if (data.code == 0) {
            this.dialogPrintmaint = data.datas || [];
            resolve();
          } else {
            reject(new Error(data));
          }
        }).catch((err) => {
          reject(err);
        });
      });
    },
    // 打印箱唛
    getPrintlist (supplierDespatchId) {
      return new Promise((resolve, reject) => {
        this.axios.post(api.printShippingMark + `?supplierDespatchId=${supplierDespatchId}`).then(({ data }) => {
          if (data.code == 0) {
            let datas = data.datas || {};
            let arr = Array.from(new Set(datas.supplierOrderIdList || []));
            this.orderList = arr;
            resolve();
          } else {
            reject(new Error(data));
          }
        }).catch((err) => {
          reject(err);
        });
      });
    },
    // 取消打印条码
    cancelPrintBarcode () {
      // eslint-disable-next-line vue/no-mutating-props
      this.dialogObj.modelVisible = false;
    },
  },
};
</script>

<style scoped>
.printMaintbox,
.barcode {
  position: relative;
  font-size: 12px;
}
.printMaintbox > div.is-pointer-down {
  background: #09f;
  z-index: 2; /* above other draggies */
}
.printMaintbox > div.is-dragging {
  opacity: 0.7;
}
.box {
  border: 1px solid #000;
}
.box .box-li {
  padding: 10px 6px;
}
.box .box-li:not(:last-child) {
  border-bottom: 1px solid #000;
}
.box,
.code-main {
  left: 10px;
  right: 10px;
  position: absolute;
  cursor: move;
  text-align: center;
}
</style>
