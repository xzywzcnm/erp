<template>
  <div class="childSizePicture">
    <template v-if="dataItem.size">
      <div class="chartMains" :class="sizeForm[dataItem.size].size" id="sizePicture">
        <div class="chartChild">
          <Table
            :columns="dataItem.columns"
            :data="dataItem.tableData"
            border
            class="childSizeChart__tables"
            :disabled-hover="true"
            id="childSizeChartID"
            :size="dataItem.tableSize"
          />
          <div class="describes" v-if="!$common.isEmpty(language)">
            <p v-for="(item,index) in dataItem.describe" :key="index + 'describe'">{{item}}</p>
          </div>
        </div>
      </div>
      <canvas id="myCanvas" :width="dataItem.screenWidth" :height="dataItem.screenHeight"></canvas>
    </template>
    <div class="chartMains self-use-chart" v-if="!$common.isEmpty(dataItem.useColumns)">
      <div class="chartChild">
        <Table
          :columns="dataItem.useColumns"
          :data="dataItem.useTableData"
          border
          class="childSizeChart__tables"
          :disabled-hover="true"
        />
      </div>
    </div>
  </div>
</template>
<script>
import Big from 'big.js';
import api from "@/api/api";
import html2canvas from 'html2canvas';
// import { selfAttrList } from './childSizeConfig.js';
export default {
  name: "childSizePicture",
  data () {
    return {
      feild: ['tagSize', 'cmrecommend', 'inchrecommend', 'euSize', 'cmtops', 'inchtops', 'cmbust', 'inchbust', 'cmbottoms', 'inchbottoms', 'cmwaistline', 'inchwaistline', 'cmhips', 'inchhips', 'cmsleeve', 'inchsleeve'],//表格input字段
      pictures: ['onePieceGarment', 'jacket', 'trousers', 'shortSkirt', 'jumpsuits', 'onePieceSkirt'],//图片后缀名
      sizeForm: {
        midPic: { size: "midPic", tableSize: 'default', tdHeight: '48', thPadding: '8', screenWidth: 1000, screenHeight: 1000, clothersHeight: 178, clothersWidth: 160, clothersPadding: 20 },
        bigPic: { size: "bigPic", tableSize: 'large', tdHeight: '90', thPadding: '18', screenWidth: 1500, screenHeight: 2000, clothersHeight: 264, clothersWidth: 236, clothersPadding: 30 },
      },
      printIndex: 0,
      selfAttrList: {},
      tableJsonData: {},
      partDetail: {},
      measurementJson: {
        method: '测量方法',
        size: '尺寸'
      },
      dataItem: {},
      totalData: [],//全部数据
      formatList: [],//需要传递给后端的数据
      otherCheck: [], // 其他勾选类别
      childType: null, // 尺码图类型
      otherTableColumns: {}, // 自用次尺码图列
      tableData: [], // 尺码图数据
      language: [], // 选中的语言
      checkLanguage: [], // 所有选中
      productInfo: {}, // 商品信息
    }
  },
  props: {},
  watch: {},
  computed: {
    // 是否展示自用尺码图
    isShowSelfUse () {
      const checkItem = this.otherCheck.find(item => {
        return this.checkLanguage.includes(item.value)
      })
      if (this.$common.isEmpty(checkItem)) return false;
      return true;
    }
  },
  mounted () {
    if (this.$common.isEmpty(window.iframeId)) return;
    this.$bus.on(window.iframeId, this.getPageData);
  },
  methods: {
    // 参数改变时触发
    getPageData (obj) {
      this.parentEvent = window.events;
      this.selfAttrList = obj.selfAttrList;
      this.tableJsonData = obj.tableJsonData;
      this.partDetail = obj.partDetail;
      this.measurementJson = obj.measurementJson;
      this.otherCheck = obj.otherCheck; // 其他勾选类别
      this.childType = obj.childType; // 尺码图类型
      this.otherTableColumns = obj.otherTableColumns; // 自用次尺码图列
      this.tableData = obj.tableData; // 尺码图数据
      this.language = obj.language; // 选中的语言
      this.checkLanguage = obj.checkLanguage; // 所有选中
      this.productInfo = obj.productInfo; // 商品信息
      this.$nextTick(() => {
        this.getTotalData().then(totalData => {
          this.dataItem = {};
          this.printIndex = 0;
          this.totalData = totalData || [];
          this.setItem();
        })
      })
    },
    setItem () {
      let dataItem = this.totalData[this.printIndex] || {};
      this.dataItem = dataItem;
      if (dataItem.isSelfUse) {
        this.$nextTick(() => {
          setTimeout(() => {
            this.beginOpera('.self-use-chart', dataItem.isSelfUse);
          }, 800);
        });
        return;
      }
      this.$nextTick(() => {
        // 计算高度，均匀分配表格高度
        let [childType, language] = [this.childType, this.language];
        let tableTemplate = this.selfAttrList[language[0]] ? this.selfAttrList[language[0]].tableData : {};
        let list = tableTemplate[childType] || [];
        let totalNum = list.length - dataItem.tableData.length;
        const totalHeight = Math.round(new Big(totalNum).times(dataItem.tdHeight));// 相差td总高度
        // th和td 3:7 分
        const thHeight = Math.round(new Big(totalHeight).times(0.3));//th总高度
        const tdHeight = Math.round(new Big(totalHeight).times(0.7));//th总高度
        const fixTh = 3;//表头固定有三行，所以要计算上
        const fixTd = list.length - totalNum;//剩余的td个数
        // 查找对应生成的表格
        let childSizePicture = document.querySelector('.childSizePicture');
        let tdDom = childSizePicture.querySelector('.ivu-table-body').querySelectorAll('.ivu-table-cell');
        let thDom = childSizePicture.querySelector('.ivu-table-header').querySelectorAll('th');
        if (tdDom && tdDom.length) {
          tdDom.forEach(tdItem => {
            let num = Math.round(new Big(tdHeight).div(fixTd).plus(dataItem.tdHeight));
            tdItem.style = `min-height: ${num}px;`;
          })
        }
        if (thDom && thDom.length) {
          thDom.forEach(thItem => {
            let num = Math.round(new Big(thHeight).div(fixTh).div(2).plus(dataItem.thPadding));
            thItem.style = `padding: ${num}px 0;`;
          })
        }
        setTimeout(() => {
          this.beginOpera('#sizePicture');
        }, 800);
      })
    },
    // 开始截图
    beginOpera (selectDome, isSelfUse = false) {
      this.generatePic(selectDome).then((base64) => {
        this.assemblePic(base64, isSelfUse).then(base64 => {
          // 根据返回图片查询图片的真实大小
          this.waitImage(base64).then(res => {
            // // 调试
            // this.baseUrl(base64);
            // if (this.printIndex < (this.totalData.length - 1)) {
            //   this.printIndex++;
            //   this.setItem();
            // } else {
            //   this.resetPic();
            // }

            let [obj, dataItem] = [{}, this.dataItem];
            let file = this.$common.base64ToFile(base64, ''); // 将base64转为文件格式
            obj.language = isSelfUse ? '' : dataItem.language;
            obj.productId = this.productInfo.productId;
            obj.resolvingPower = res || `${dataItem.screenWidth}*${dataItem.screenHeight}`;
            obj.file = file;
            // pictureType 图片类型（0橱窗图片，1详情图片，2通用自用尺码图，3婴童自用尺码图，4儿童自用尺码图），默认传的是0
            obj.pictureType = isSelfUse ? this.childType == 2 ? 3 : 4 : 0;
            this.formatList.push(obj);
            if (this.printIndex < (this.totalData.length - 1)) {
              this.printIndex++;
              this.setItem();
            } else {
              this.mulUploadPic();
            }
          })
        })
      })
    },
    // 拼凑图片（整张图片由两部分组成，表格描述和下部分童装图）
    assemblePic (base64, isSelfUse) {
      return new Promise((resolve, reject) => {
        if (isSelfUse) return resolve(base64);
        let _self = this;
        let dataItem = _self.dataItem;
        // 拿到图片后放到canvas绘制
        let canvas = document.getElementById("myCanvas");
        var ctx = canvas.getContext("2d");//创建 context 对象：
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, dataItem.screenWidth, dataItem.screenHeight);
        // 获取 dom 高度
        const dom = document.querySelector('#sizePicture');
        let domHeight = dom.clientHeight;
        // 童装图高度
        const childHeight = dataItem.clothersHeight;
        // 计算出开始绘制的点
        let surplusHeight = new Big(dataItem.screenHeight).minus(domHeight).minus(childHeight).div(2);
        // 开始绘制上部分
        let img = new Image();
        img.src = base64;
        //图片加载完后，将其显示在canvas中
        img.onload = function () {
          ctx.drawImage(this, 0, surplusHeight, dataItem.screenWidth, domHeight);
        }
        // 计算出下部分童装图的绘制点并开始绘制下部分
        let [list, interNum] = [[], 0];
        let secondY = new Big(surplusHeight).plus(domHeight);
        dataItem.pictures.forEach((picItem, index) => {
          let img = new Image();
          img.src = picItem;
          //图片加载完后，将其显示在canvas中
          img.onload = function () {
            list.push(index);
            let posX = new Big(dataItem.clothersWidth).times(index).plus(dataItem.clothersPadding).plus(10);
            ctx.drawImage(this, posX, secondY, dataItem.clothersWidth, dataItem.clothersHeight)
          }
        })
        let timer = setInterval(() => {
          interNum++;//记录循环次数，到达10自动停止循环
          if (list.length >= dataItem.pictures.length || interNum > 10) {
            clearInterval(timer);
            let base64 = canvas.toDataURL("image/png", 1.0);// 图片地址
            resolve(base64);
          }
        }, 200);
        _self.$once('hook:beforeDestroy', () => {
          clearInterval(timer);
        })
      })
    },
    // 将对应语言和尺码图大小的数据整合到一起
    async getTotalData () {
      let becomeChartList = await this.becomeChartList();
      return await Promise.all(becomeChartList.map(async (titem) => {
        let temp = Object.assign({}, titem);
        if (titem.isSelfUse) {
          temp.useTableData = await this.getTableData(titem.language, true);
          temp.useColumns = await this.getColumns(titem.language, temp.useTableData, true);
        } else {
          temp.pictures = this.getPictures(titem.language);
          temp.describe = this.getDescribe(titem.language);
          temp.tableData = await this.getTableData(titem.language);
          temp.columns = await this.getColumns(titem.language, temp.tableData);
        }
        return temp;
      }))
    },
    // 区分语言和区分尺码图大小，拿到总共要生成的尺码图列表
    becomeChartList () {
      return new Promise((resolve) => {
        let [temp, sizeForm] = [[], this.sizeForm];
        this.language.forEach(item => {
          Object.keys(sizeForm).forEach(sizeItem => {
            let obj = this.$common.copy(sizeForm[sizeItem]);
            obj.language = item;
            temp.push(obj);
          })
        })
        if (this.isShowSelfUse) {
          let obj = {};
          obj.language = 'cn';
          obj.isSelfUse = true;
          temp.push(obj);
        }
        resolve(temp);
      })
    },
    // 区分语言拿到尺码图数据
    getTableData (language) {
      return new Promise((resolve) => {
        if (this.$common.isEmpty(language)) return [];
        let [childType, tableData, tableList] = [this.childType, this.$common.copy(this.tableData), []];
        let tableTemplate = this.selfAttrList[language] ? this.selfAttrList[language].tableData : {};
        let list = tableTemplate[childType] || [];
        const otherTableVal = this.$common.isEmpty(this.tableJsonData[language]) ? list : this.tableJsonData[language];
        tableData.forEach((item, index) => {
          // 这里是区分语言的，要更换对应的数据
          item.cmrecommend = otherTableVal[index].cmrecommend;
          item.inchrecommend = otherTableVal[index].inchrecommend;
          item.euSize = otherTableVal[index].euSize;
          // 将未填入数值的数据剔除
          let flag = false;
          let ignoreList = ['tagSize', 'cmrecommend', 'inchrecommend', 'euSize'];//要忽略的字段
          Object.keys(item).forEach(nameItem => {
            if (!ignoreList.includes(nameItem) && !this.$common.isEmpty(item[nameItem])) flag = true;
          })
          if (flag) tableList.push(item);
        })
        resolve(tableList);
      })
    },
    // 区分语言拿到表头数据
    getColumns (language, tableData, isSelfUse) {
      return new Promise((resolve) => {
        const self = this;
        let tableColumns = this.$common.copy(this.otherTableColumns[language]);
        let tempObj = {};
        if (!this.$common.isEmpty(tableColumns)) {
          tableColumns.forEach(item => {
            tempObj[item.colKey] = {
              ...(item.children ? item.children[0] || {} : {}),
              title: item.title,
              minWidth: 30,
              model: item.colKey,
              language: language,
              funWay: 'childrenColumn',
            }
          })
        }
        let fun = {
          language: language,
          temp: {
            tagSize: {
              minWidth: 40,
              model: 'tagSize',
              funWay: 'tagSizeColumn',
            },
            recommend: {
              minWidth: 90,
              model: 'recommend',
              funWay: 'recommendColumn',
            },
            euSize: {
              minWidth: 50,
              model: 'euSize',
              funWay: 'commonColumn',
            },
            ...tempObj
          },
          // 渲染
          renderCom (h, params, conversion) {
            let { column, row } = params;
            return h('div', {
              style: {
                wordBreak: 'break-all'
              }
            }, row[column.model] || '/');
          },
          // recommend 处理是因为表格框不支持表头合并
          recommendColumn (obj, item) {
            obj.render = (h, params) => {
              let { row } = params;
              return h('div', {
                style: {
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                }
              }, [
                h('span', {
                  style: {
                    flex: 1,
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingRight: '2px',
                    borderRight: '1px solid #020202',
                  }
                }, row.cmrecommend),
                h('span', {
                  style: {
                    flex: 1,
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingLeft: '2px',
                  }
                }, row.inchrecommend)
              ])
            }
            return obj;
          },
          // cm,inch 处理
          childrenColumn (obj, item) {
            const language = item.language || 'en';
            if (self.$common.isEmpty(self.selfAttrList[language].partHand[obj.model])) {
              self.$set(self.selfAttrList[language].partHand, obj.model, { cm: 'cm', inch: 'inch' });
            }
            const childList = self.selfAttrList[language].partHand[obj.model] || {};
            const partInfo = self.partDetail[language] ? self.partDetail[language].find(f => f.partId == item.partId) : item;
            if (isSelfUse) {
              obj.children = [
                {
                  align: 'center',
                  title: partInfo.measurementDescription,
                  minWidth: item.minWidth,
                  children: [
                    {
                      align: 'center',
                      title: childList['cm'],
                      model: `cm${item.model}`,
                      minWidth: item.minWidth,
                      render: (h, params) => {
                        return this.renderCom(h, params, true);
                      }
                    }
                  ]
                }
              ]
              return obj;
            }
            obj.children = Object.keys(childList).map(key => {
              return {
                align: 'center',
                title: childList[key],
                model: `${key}${item.model}`,
                minWidth: item.minWidth,
                render: (h, params) => {
                  let conversion = key === 'cm';
                  return this.renderCom(h, params, conversion);
                }
              }
            })
            return obj;
          },
          // 尺码 size
          tagSizeColumn (obj, item) {
            if (!isSelfUse) {
              obj.render = (h, params) => {
                return this.renderCom(h, params);
              }
              return obj;
            }
            // obj.title = '部位';
            obj.children = [
              {
                title: self.measurementJson.method,
                minWidth: item.minWidth,
                align: 'center',
                children: [{
                  title: self.measurementJson.size,
                  model: item.model,
                  minWidth: item.minWidth,
                  align: 'center',
                  render: (h, params) => {
                    return this.renderCom(h, params);
                  }
                }]
              }
            ];
            return obj;
          },
          // 通用
          commonColumn (obj, item) {
            obj.render = (h, params) => {
              return this.renderCom(h, params);
            }
            return obj;
          },
          // 返回展示的表格头
          defaultColumn (language) {
            let childData = self.selfAttrList[language] || {};
            let [list, temp] = [[], this.temp];
            Object.keys(temp).forEach(item => {
              // 过滤空值的列
              let flag = false;
              // let ignoreList = isSelfUse ? ['recommend', 'euSize'] : ['tagSize', 'recommend', 'euSize'];// 要忽略的字段
              let ignoreList = isSelfUse ? ['recommend', 'euSize'] : [];
              if (!ignoreList.includes(item)) {
                if (!['tagSize', 'recommend', 'euSize'].includes(item)) {
                  let isColEmpty = [];
                  // 判断当前列所有行是否为空
                  tableData.forEach(tableItem => {
                    isColEmpty.push(self.$common.isEmpty(tableItem['cm' + item]) && self.$common.isEmpty(tableItem['inch' + item]));
                  })
                  isColEmpty = self.$common.arrRemoveRepeat(isColEmpty);
                  if (isColEmpty.length == 1 && isColEmpty[0]) {
                    flag = true;
                  }
                }
              } else {
                flag = true;
              }
              if (flag) return;
              if (childData.column && childData.column[item] && temp && temp[item]) {
                temp[item].title = childData.column[item] || '';
              }
              list.push(temp[item]);
            })
            return list;
          },
          // 表格列
          splicingColumn () {
            let list = this.defaultColumn(this.language);
            return list.map(item => {
              let obj = {};
              obj.align = 'center';
              obj.model = item.model;
              obj.title = item.title;
              obj.minWidth = item.minWidth;
              return this[item.funWay](obj, item, this.language);
            })
          }
        }
        let list = fun.splicingColumn();
        let tableHead = self.selfAttrList[fun.language] ? self.selfAttrList[fun.language].tableHead : '';
        resolve([
          {
            title: tableHead,
            align: 'center',
            children: list,
            cellClassName: 'sizeChart'
          }
        ]);
      })
    },
    getDescribe (language) {
      let data = this.selfAttrList[language] ? this.selfAttrList[language].describe : [];
      return data;
    },
    getPictures (language) {
      return this.pictures.map(item => {
        // eslint-disable-next-line no-undef
        return require(`#@/static/images/sizechart/${language}/${item}.png`);
      })
    },
    // 生成图片
    generatePic (selectDome) {
      return new Promise((resolve, reject) => {
        const dom = document.querySelector(selectDome);
        let width = dom.clientWidth; //获取dom 宽度
        let height = dom.clientHeight; //获取dom 高度
        let canvas = document.createElement("canvas"); //创建一个canvas节点
        // 兼容清晰度
        const scale = 1; //定义任意放大倍数 支持小数
        canvas.width = width * scale; //定义canvas 宽度 * 缩放
        canvas.height = height * scale; //定义canvas高度 *缩放
        let context = canvas.getContext('2d');
        // 去图片锯齿 官网
        context.mozImageSmoothingEnabled = false;
        context.webkitImageSmoothingEnabled = false;
        context.msImageSmoothingEnabled = false;
        context.imageSmoothingEnabled = false;
        // options配置
        let opts = {
          scale: scale,
          canvas: canvas,
          logging: false,
          width: width,
          height: height,
          dpi: 300,
          useCORS: true,
          backgroundColor: "transparent",
          allowTaint: false,
        };
        // const dom = document.querySelector('.real-image');// 获取想要转换的 DOM 节点
        html2canvas(dom, opts).then((canvas) => {
          let base64 = canvas.toDataURL("image/png", 1.0);// 图片地址
          resolve(base64);
        })
      })
    },
    // 批量上传图片
    mulUploadPic () {
      let formData = new FormData();
      this.formatList.forEach(k => {
        formData.append('files', k.file);
      })
      this.$axios({
        method: "post",
        url: api.upload,
        data: formData,
        isFile: true
      }).then(res => {
        res.datas.forEach((k, key) => {
          this.formatList[key].pictureUrl = k;
          delete this.formatList[key].file;
        })
        this.saveSizePicture();
      }).catch(err => {
        this.resetPic();
      })
    },
    // 保存图片
    saveSizePicture () {
      this.$axios.post(api.saveSizePicture, this.formatList).then(res => {
        this.$Message.success('生成尺码图成功!');
        this.parentEvent.finishPicture(true);
      }).finally(err => {
        this.resetPic();
      })
    },
    // baseurl下载
    baseUrl (base64) {
      function base64ToBlob (code) {
        let parts = code.split(';base64,');
        let contentType = parts[0].split(':')[1];
        let raw = window.atob(parts[1]);
        let rawLength = raw.length;
        let uInt8Array = new Uint8Array(rawLength);
        for (let i = 0; i < rawLength; ++i) {
          uInt8Array[i] = raw.charCodeAt(i);
        }
        return new Blob([uInt8Array], { type: contentType });
      }
      let screenSizeData = `${this.dataItem.screenWidth}*${this.dataItem.screenHeight}`;
      let aLink = document.createElement('a');
      let blob = base64ToBlob(base64); //new Blob([content]);
      let evt = document.createEvent("HTMLEvents");
      evt.initEvent("click", true, true);//initEvent 不加后两个参数在FF下会报错  事件类型，是否冒泡，是否阻止浏览器的默认行为
      aLink.download = (screenSizeData || '') + 'fileName';
      aLink.href = URL.createObjectURL(blob);
      aLink.click();
    },
    // 检测多种返回情况
    waitImage (base64) {
      return new Promise((resolve, reject) => {
        this.imgReady(base64, function () {
          resolve(this.width + '*' + this.height);
        }, function () {
          resolve(this.width + '*' + this.height);
        }, function () {
          resolve();
          console.error('size error');
        });
      })
    },
    // 获取图片真实尺寸
    imgReady (url, ready, load, error) {
      let [list, intervalId] = [[], null];
      let fun = {
        // 用来执行队列
        tick () {
          for (let i = 0; i < list.length; i++) {
            list[i].end ? list.splice(i--, 1) : list[i]();
          }
          !list.length && fun.stop();
        },
        // 停止所有定时器队列
        stop () {
          clearInterval(intervalId);
          intervalId = null;
        }
      }
      let onready, width, height, newWidth, newHeight, img = new Image();
      img.src = url;
      // 如果图片被缓存，则直接返回缓存数据
      if (img.complete) {
        ready.call(img);
        load && load.call(img);
        return;
      }
      width = img.width;
      height = img.height;
      // 加载错误后的事件
      img.onerror = function () {
        error && error.call(img);
        onready.end = true;
        img = img.onload = img.onerror = null;
      };
      // 图片尺寸就绪
      onready = function () {
        newWidth = img.width;
        newHeight = img.height;
        if (newWidth !== width || newHeight !== height || newWidth * newHeight > 1024) {
          // 如果图片已经在其他地方加载可使用面积检测
          ready.call(img);
          onready.end = true;
        }
      };
      onready();
      // 完全加载完毕的事件
      img.onload = function () {
        // onload在定时器时间差范围内可能比onready快
        // 这里进行检查并保证onready优先执行
        !onready.end && onready();
        load && load.call(img);
        // IE gif动画会循环执行onload，置空onload即可
        img = img.onload = img.onerror = null;
      };
      // 加入队列中定期执行
      if (!onready.end) {
        list.push(onready);
        // 无论何时只允许出现一个定时器，减少浏览器性能损耗
        if (intervalId === null) intervalId = setInterval(fun.tick, 40);
      }
    },
    // 重置图片
    resetPic () {
      this.printIndex = 0;
      this.dataItem = {};
      this.totalData = [];
      this.formatList = [];
      this.parentEvent.finishPicture(false);
    },
  },
}
</script>
<style lang="less">
.childSizePicture {
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
  color: #020202;
  font-weight: bold;
  .self-use-chart{
    width: 1000px;
    min-height: 1000px;
    padding: 10px;
  }
  .chartMains {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    .chartChild {
      width: 100%;
    }
    .childSizeChart__tables {
      .ivu-table,
      .ivu-input {
        color: #020202;
      }
      .ivu-table-tbody {
        .ivu-table-cell {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          white-space: pre-wrap;
        }
      }
      .ivu-table-header {
        .ivu-table-cell {
          word-break: break-all;
          white-space: pre-wrap;
          font-weight: bold;
        }
      }
      .ivu-table th {
        background: #9bc2e6;
      }
      .ivu-table thead tr:first-child th {
        background: #fff;
      }
    }
    .childSizeChart__tables,
    .ivu-table-border td,
    .ivu-table-border th {
      border-color: #020202;
    }
    .ivu-table:before,
    .ivu-table-border:after {
      background: #020202;
    }
    .describes {
      p:first-child {
        color: #ec7d4e;
      }
    }
    .picturess {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      .imgBlock {
        flex: 1;
        img {
          width: 100%;
          vertical-align: top;
        }
      }
    }
  }
  // 小图
  .smallpic {
    width: 600px;
    min-height: 800px;
    padding: 0 4px;
    font-size: 14px;
    .ivu-table {
      font-size: 12px;
    }
    .describes {
      margin-top: 10px;
      padding: 0 10px;
      p {
        line-height: 18px;
        margin-bottom: 6px;
      }
    }
    .picturess {
      margin-top: 10px;
      padding: 0 10px;
    }
    .childSizeChart__tables {
      .ivu-table-header .ivu-table-cell {
        padding: 0 2px;
      }
      .ivu-table-tbody .ivu-table-cell {
        min-height: 40px;
        padding: 0 2px;
      }
      .ivu-table th {
        padding: 4px 0;
      }
    }
  }
  // 中图
  .midPic {
    width: 1000px;
    min-height: 822px;
    font-size: 16px;
    padding: 0 6px;
    .ivu-table {
      font-size: 14px;
    }
    .describes {
      margin-top: 20px;
      padding: 0 20px;
      p {
        line-height: 20px;
        margin-bottom: 12px;
      }
    }
    .picturess {
      margin-top: 20px;
      padding: 0 20px;
    }
    .childSizeChart__tables {
      .ivu-table-header .ivu-table-cell {
        padding: 0 2px;
      }
      .ivu-table-tbody .ivu-table-cell {
        min-height: 48px;
        padding: 0 2px;
      }
      .ivu-table th {
        padding: 8px 0;
      }
    }
  }
  // 大图
  .bigPic {
    width: 1500px;
    min-height: 1500px;
    font-size: 22px;
    padding: 0 10px;
    .ivu-table {
      font-size: 18px;
    }
    .describes {
      margin-top: 30px;
      padding: 0 30px;
      p {
        line-height: 28px;
        margin-bottom: 30px;
      }
    }
    .picturess {
      margin-top: 30px;
      padding: 0 30px;
    }
    .childSizeChart__tables {
      .ivu-table-header .ivu-table-cell {
        padding: 0 2px;
      }
      .ivu-table-tbody .ivu-table-cell {
        min-height: 90px;
        padding: 0 2px;
      }
      .ivu-table th {
        padding: 18px 0;
      }
    }
  }
}
</style>