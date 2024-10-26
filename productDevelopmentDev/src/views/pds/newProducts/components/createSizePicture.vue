<template>
  <div class="promote-pic">
    <div class="sizePicture" v-if="dataItem.size && tableColumns.length > 0" :class="{'woman-shoe-plan': [4].includes(planType)}">
      <div class="size-image-main pichtml" :class="sizeForm[dataItem.size].size" ref="pichtml">
        <div class="fmb0">
          <div class="text-center text-title text-weight" v-if="![4].includes(planType)">{{dataItem.titlelist[0]&&dataItem.titlelist[0].title}}</div>
          <div class="text-center text-title text-weight" v-if="[4].includes(planType)">Product Attributes</div>
          <Form :model="formItem" :label-width="sizeForm[dataItem.size].label" label-position="left">
            <div class="form-item">
              <div class="flex-sty">
                <div class="flex-form">
                  <div class="flex-form-top" v-if="[1].includes(planType) && dataItem.labellist && dataItem.labellist.length">
                    <FormItem
                      :label="`${dataItem&&!$common.isEmpty(dataItem.labellist)?dataItem.labellist[0].label:''}:`"
                      :label-width="sizeForm[dataItem.size].formWidth" class="form-border--bot"
                    >
                      <span>{{dataItem.fabric || ''}}</span>
                    </FormItem>
                    <FormItem :label="`${dataItem&&!$common.isEmpty(dataItem.labellist)?dataItem.labellist[1].label:''}:`" :label-width="sizeForm[dataItem.size].formWidth" class="form-border--bot">
                      <span v-for="(item,key) in dataItem.colorlist" :key="key+'color'">{{item.colorName}}{{key===dataItem.colorlist.length-1?'':'，'}}</span>
                    </FormItem>
                    <template v-if="tableColumns && tableColumns.length">
                      <FormItem
                        :label="`${dataItem&&!$common.isEmpty(dataItem.labellist)?dataItem.labellist[2].label:''}:`"
                        :label-width="sizeForm[dataItem.size].formWidth"
                        class="form-border--bot"
                      >
                        <span>{{tagMulfun()}}</span>
                      </FormItem>
                    </template>
                    <!-- 多属性 -->
                    <div class="mul-attr">
                      <div v-for="(item,index) in dataItem.attrLists" :key="index+'attr'" class="mb10">
                        <FormItem :label="item.attr+':'">
                          <template>
                            <Button v-for="(citem,cindex) in item.value" class="mr5 btn-mb" :class="{'active-btn':(item.attrValue==citem.attributeValueId)}" :key="cindex+'attrvalue'">{{citem.name}}</Button>
                          </template>
                        </FormItem>
                      </div>
                    </div>
                  </div>
                  <div class="img-box-content">
                    <div class="img-father ml15" v-if="dataItem.piclist && dataItem.piclist.isChecked">
                      <img :src="dataItem.piclist.pictureUrl" alt="" style="object-fit: cover;">
                    </div>
                    <div class="img-father ml15" v-if="dataItem.goodsPic && dataItem.goodsPic.isChecked && [1].includes(planType)">
                      <img :src="dataItem.goodsPic.pictureUrl" alt="" style="object-fit: cover;">
                    </div>
                  </div>
                </div>
              </div>
              <div class="text-center split-line text-weight">
                <span v-if="![4].includes(planType)">{{dataItem.titlelist[1]&&dataItem.titlelist[1].title}}</span>
              </div>
              <div style="width:100%;">
                <Table :columns="tableColumns" :data="tableData" border ref="picTable" style="width:100%;" v-if="isShowTable">
                  <template slot-scope="{row}" slot="nameValue">
                    <span class="row-col-txt">{{row.size||''}}</span>
                  </template>
                  <template slot-scope="{row}" slot="anValue">
                    <span class="row-col-txt">{{row.anValue||''}}</span>
                  </template>
                  <template slot-scope="{row}" slot="enValue">
                    <span class="row-col-txt">{{row.enValue||''}}</span>
                  </template>
                  <template slot-scope="{row}" slot="gerValue">
                    <span class="row-col-txt">{{row.gerValue||''}}</span>
                  </template>
                  <template slot-scope="{row}" slot="fraValue">
                    <span class="row-col-txt">{{row.fraValue||''}}</span>
                  </template>
                  <template slot-scope="{row}" slot="spnValue">
                    <span class="row-col-txt">{{row.spnValue||''}}</span>
                  </template>
                  <template slot-scope="{row}" slot="itValue">
                    <span class="row-col-txt">{{row.itValue||''}}</span>
                  </template>
                  <template slot-scope="{row}" slot="porValue">
                    <span class="row-col-txt">{{row.porValue||''}}</span>
                  </template>
                  <template slot-scope="{row}" slot="polValue">
                    <span class="row-col-txt">{{row.polValue||''}}</span>
                  </template>
                  <template slot-scope="{row}" slot="cnValue">
                    <span class="row-col-txt">{{row.cnValue||''}}</span>
                  </template>
                  <template slot-scope="{index,column}" slot="cmInputs">
                    <span class="row-col-txt" v-if="tableData[index]&&tableData[index][column.attr+'cm']">{{tableData[index][column.attr+'cm']}}</span>
                    <span class="row-col-txt" v-else>/</span>
                  </template>
                  <template slot-scope="{index,column}" slot="inchInputs">
                    <span class="row-col-txt" v-if="tableData[index]&&tableData[index][column.attr+'inch']">{{tableData[index][column.attr+'inch']}}</span>
                    <span class="row-col-txt" v-else>/</span>
                  </template>
                </Table>
              </div>
              <div class="text-center text-line text-weight">{{dataItem.titlelist[2]&&dataItem.titlelist[2].title}}</div>
              <div class="text-center text-weight">{{dataItem.titlelist[3]&&dataItem.titlelist[3].title}}</div>
            </div>
          </Form>
        </div>
      </div>
      <div class="size-pic--main print-self-use" ref="selfUsehtml" v-if="isShowSelfUse">
        <Table :columns="selfUseColumns" :data="tableData" border ref="picTable" style="width:100%;">
          <template slot-scope="{row}" slot="nameValue">
            <span class="row-col-txt">{{row.size||''}}</span>
          </template>
          <template slot-scope="{row}" slot="anValue">
            <span class="row-col-txt">{{row.anValue||''}}</span>
          </template>
          <template slot-scope="{row}" slot="enValue">
            <span class="row-col-txt">{{row.enValue||''}}</span>
          </template>
          <template slot-scope="{row}" slot="gerValue">
            <span class="row-col-txt">{{row.gerValue||''}}</span>
          </template>
          <template slot-scope="{row}" slot="fraValue">
            <span class="row-col-txt">{{row.fraValue||''}}</span>
          </template>
          <template slot-scope="{row}" slot="spnValue">
            <span class="row-col-txt">{{row.spnValue||''}}</span>
          </template>
          <template slot-scope="{row}" slot="itValue">
            <span class="row-col-txt">{{row.itValue||''}}</span>
          </template>
          <template slot-scope="{row}" slot="porValue">
            <span class="row-col-txt">{{row.porValue||''}}</span>
          </template>
          <template slot-scope="{row}" slot="polValue">
            <span class="row-col-txt">{{row.polValue||''}}</span>
          </template>
          <template slot-scope="{row}" slot="cnValue">
            <span class="row-col-txt">{{row.cnValue||''}}</span>
          </template>
          <template slot-scope="{index,column}" slot="cmInputs">
            <span class="row-col-txt" v-if="tableData[index]&&tableData[index][column.attr+'cm']">{{tableData[index][column.attr+'cm']}}</span>
            <span class="row-col-txt" v-else>/</span>
          </template>
          <template slot-scope="{index,column}" slot="inchInputs">
            <span class="row-col-txt" v-if="tableData[index]&&tableData[index][column.attr+'inch']">{{tableData[index][column.attr+'inch']}}</span>
            <span class="row-col-txt" v-else>/</span>
          </template>
        </Table>
      </div>
    </div>
    <div class="real-image" v-if="dataItem.size && urlPic" :style="{width:dataItem.screenSize.split('*')[0]+'px',height:dataItem.screenSize.split('*')[1]+'px'}">
      <img :src="urlPic" alt="" style="width:100%;height:100%;">
    </div>
  </div>
</template>
 
<script>
import api from "@/api/api";
import html2canvas from 'html2canvas';
export default {
  name: "sizePicture",
  props: {},
  data () {
    return {
      /** ----需要通信传过来---- */
      isPrintAll: false, // 是否打印全部(暂时不用到)
      otherCheck: [], // 其他勾选类别
      planType: 1,
      checkLanguage: [], // 选择的语言
      tableConfig: {},
      goodsPicJson: {},
      partImgList: {},
      detailInfo: {
        tableData: [], // 表格内容
        formItem: {}, // 表单信息
        productData: {}, // 新品信息
        language: [], // 八种语言
        measurementJson: {
          method: '测量方法',
          tableTitle: '尺码图',
          partName: '部位'
        },
        allList: {}// 全部语言数据
      },
      /** ---- */
      tableData: [],
      tableColumns: [],
      // 表格组件使用多级表头时会造成无限循环，用移除列表来做处理
      isShowTable: false,
      formItem: {},
      sizeForm: {
        midPic: { size: "midPic", label: 110, formWidth: 90, screenSize: '1000*1000' },
        bigPic: { size: "bigPic", label: 130, formWidth: 110, screenSize: '1500*2000' },
        smallpic: { size: "smallpic", label: 90, formWidth: 70, screenSize: '600*800' },
      },
      allLists: [],//全部语言和尺寸分辨率列表
      dataItem: {},//单个语言和尺寸分辨率块
      index: 0,
      selfUseColumns: [], // 自用尺码图列
      urlList: [],//存放生成尺码图片列表
      formatList: [],//存放图片file和对应的图片信息
      urlPic: ''
    }
  },
  watch: {
    'dataItem.columns': {
      immediate: true,
      deep: true,
      handler (val) {
        if (JSON.stringify(val) == JSON.stringify(this.tableColumns) || this.$common.isUndefined(val)) return;
        this.tableColumns = val;
      }
    }
  },
  computed: {
    // 选中的语言(排除指定值)
    validLanguage () {
      const notIncludes = this.otherCheck.map(m => m.value);
      return (this.formItem.language || []).filter(item => {
        return !notIncludes.includes(item)
      })
    },
    // 是否展示自用尺码图
    isShowSelfUse () {
      const checkItem = this.otherCheck.find(item => {
        return this.checkLanguage.includes(item.value)
      })
      if (this.$common.isEmpty(checkItem)) return false;
      return !this.$common.isEmpty(this.selfUseColumns);
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
      if (this.$common.isEmpty(obj)) return;
      this.isPrintAll = obj.isPrintAll;
      this.otherCheck = obj.otherCheck;
      this.planType = obj.planType;
      this.checkLanguage = obj.checkLanguage;
      this.detailInfo = obj.detailInfo;
      this.tableConfig = obj.tableConfig;
      this.goodsPicJson = obj.goodsPicJson;
      this.partImgList = obj.partImgList;

      this.$nextTick(() => {
        Object.keys(this.tableConfig).forEach(key => {
          this.colorChange(this.tableConfig[key], key);
        });
        if (!this.$common.isEmpty(this.detailInfo)) {
          this.init(this.detailInfo).then(() => {
            this.setItem();
          });
        } else {
          this.parentEvent.finishModel(false);
        }
      })
    },
    async init (data) {
      this.resetPic();
      this.formItem = data.formItem || {};
      await this.setTabledata(data);
      if (JSON.stringify(data.allList) === '{}') return;
      this.setAllColumns(data);
    },
    // 筛选表格数据
    setTabledata (data) {
      return new Promise((resolve, reject) => {
        try {
          let list = [];
          let tableData = this.$common.copy(data.tableData || []);
          tableData.forEach(k => {
            let flag = false;
            k.partIdList.forEach(item => {
              k[item + 'cm'] || k[item + 'inch'] ? flag = true : '';
            })
            if (flag) list.push(k);
          })
          this.tableData = list;
        } catch (err) {
          console.error(err)
        }
        resolve();
      })
    },
    // 设置表格表头
    setAllColumns (data) {
      let { language } = data;
      let allList = this.$common.copy(data.allList);
      let sizeForm = this.sizeForm;
      let lanCheck = this.$common.isEmpty(this.validLanguage) ? ['cn'] : this.validLanguage;
      let selfColumns = [];

      // 去掉表格的宽度限制(不去掉会存在滚动条，到时候页面截图截取不全)
      Object.keys(allList).forEach(k => {
        let list = allList[k].columnlist || []; //columns
        let columns = [];
        list.forEach(item => {
          if (!item) return;
          if ("minWidth" in item) delete item.minWidth;
          //部位不填写该列需要去掉
          let flag = false;
          (item.children || []).forEach(citem => {
            if ("minWidth" in citem) delete citem.minWidth;
            //部位不填写该列需要去掉
            data.tableData.forEach(tdata => {
              let list = [];
              Object.keys(tdata).forEach(odata => {
                if (odata.indexOf(citem.attr) >= 0) {
                  list.push(tdata[odata]);
                }
              })
              if (!list.length) {
                flag = true;
                return;
              }
              list.forEach(k => {
                k ? flag = true : '';
              })
            })
          })
          if (!flag) return;
          columns.push(item);
        })
        allList[k].columns = columns;
      })

      // 设置自用尺码图列
      if (!this.$common.isEmpty(allList['cn']) && !this.$common.isEmpty(allList['cn'].columns)) {
        let mySelf = this.$common.copy(allList['cn'].columns);
        mySelf.forEach(item => {
          if (!item.isLanguage) {
            if (item.lanType == 'name') {
              if (!item.isValueChange) {
                item.title = this.detailInfo.measurementJson.partName == 'Tag Size' ? '部位' : this.detailInfo.measurementJson.partName;
              }
              item.children = [{
                align: "center",
                title: this.detailInfo.measurementJson.method,
                children: item.children
              }];
            } else if (item.selfChildren) {
              item.children = item.selfChildren;
              delete item.selfChildren;
            }
            selfColumns.push(item);
          }
        });
        if (!this.$common.isEmpty(selfColumns)) {
          this.selfUseColumns = [{
            align: 'center',
            title: this.detailInfo.measurementJson.tableTitle == 'Size-Details' ? '尺码图' : this.detailInfo.measurementJson.tableTitle,
            children: selfColumns
          }];
        }
      }

      // 组成区分语言和分辨率大小的数据列
      let arr = [];
      Object.keys(sizeForm).forEach(k => {
        Object.keys(allList).forEach(j => {
          if (!lanCheck.includes(j)) return;
          let obj = {};
          obj.size = k;
          // obj.size = 'smallpic'; //调试用
          // obj.columns = allList[j].columnlist || [];
          obj.columns = allList[j].columns || [];
          obj.lanType = j;
          obj.screenSize = sizeForm[k].screenSize; //分辨率
          obj.language = allList[j].language;
          obj.attrLists = allList[j].attrLists || []; //对应语言的属性列表
          obj.colorlist = allList[j].colorlist || []; //对应语言的颜色列表
          obj.sizelist = allList[j].sizelist || []; //对应语言的尺码列表
          obj.labellist = allList[j].labellist || []; //对应语言的label列表
          obj.titlelist = allList[j].titlelist || []; //对应语言的标题
          obj.piclist = this.partImgList[j] || {}; // 对应语言的部位图片(尺寸图)
          obj.goodsPic = this.goodsPicJson[j] || {}; // 对应语言的商品图
          language.forEach(y => {
            if (j === y.type) {
              obj.fabric = y.fabric;
            }
          })
          arr.push(obj);
        })
      })
      if (this.$common.isEmpty(this.validLanguage)) {
        arr = [arr[0]];
      }
      this.allLists = this.$common.copy(arr);
      // this.dataItem = arr[0] || {}; //调试用
    },
    setItem (type, domClass) {
      if (this.$common.isEmpty(this.checkLanguage)) {
        this.$Message.error('请勾选要生成尺码图的语言!');
        this.parentEvent.finishModel(false);
        console.error('请勾选要生成尺码图的语言!');
        return;
      }
      this.urlPic = '';
      this.dataItem = this.allLists[this.index] || {};
      this.$nextTick(() => {
        // 表格组件使用多级表头时会造成无限循环，等表头数据更新完在显示列表
        this.isShowTable = true;
        setTimeout(() => {
          if (!this.$refs.pichtml) {
            this.resetPic();
            this.$Message.error('尺码图生成异常，请检查!');
            this.parentEvent.finishModel(false);
            console.error('尺码图生成异常，请检查!');
            return;
          }
          if ([4].includes(this.planType)) {
            const thList = [...(document.querySelectorAll('.measurement-tag-size') || [])];
            thList.forEach(rowTh => {
              rowTh.setAttribute('rowspan', 2)
            })
          }
          setTimeout(() => {
            if (!type && this.$common.isEmpty(domClass) && this.isShowSelfUse) {
              this.generatePic('.print-self-use', this.isShowSelfUse);
            } else {
              this.generatePic(domClass || '.pichtml');
            }
          }, 400)
        }, 500);
      })
      
    },
    htmlPic () {
      return new Promise((resolve, reject) => {
        // 获取想要转换的 DOM 节点
        const dom = document.querySelector('.pichtml');
        const box = window.getComputedStyle(dom);
        // DOM 节点计算后宽高
        const width = parseInt(box.width, 10);
        const height = parseInt(box.height, 10);
        // 获取像素比
        const scaleBy = 2;
        // 创建自定义 canvas 元素
        const canvas = document.createElement('canvas');
        // 设定 canvas 元素属性宽高为 DOM 节点宽高 * 像素比
        canvas.width = width * scaleBy;
        canvas.height = height * scaleBy;
        // 设定 canvas css宽高为 DOM 节点宽高
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        // 获取画笔
        const context = canvas.getContext('2d');
        // 将所有绘制内容放大像素比倍
        context.scale(scaleBy, scaleBy);
        html2canvas(dom, {
          canvas,
          background: '#ffffff',
          dpi: 160,
          allowTaint: true, // 是否支持跨域内容渲染到 canvas
          useCORS: true, // 是否支持 canvas 中跨域资源转为 base64
        }).then((canvas) => {
          this.urlPic = canvas.toDataURL();// 图片地址
          resolve();
        })
      })
    },
    // 生成图片
    generatePic (domClass, isSelfUse = false) {
      const dom = document.querySelector(domClass);
      let screenSize = this.dataItem.screenSize ? this.dataItem.screenSize.split('*') : [];
      let width = screenSize[0]; //获取dom 宽度
      let height = screenSize[1]; //获取dom 高度
      if (isSelfUse && !this.$common.isEmpty(dom)) {
        width = dom.clientWidth;
        height = dom.clientHeight;
      }
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
        this.waitImage(base64).then(res => {
          let obj = {};
          let file = this.$common.base64ToFile(base64, ''); // 将base64转为文件格式
          obj.language = isSelfUse ? '' : this.dataItem.language;
          obj.productId = this.detailInfo.productData.productId;
          obj.resolvingPower = res || this.dataItem.screenSize;
          obj.file = file;
          // pictureType 图片类型（0橱窗图片，1详情图片，2通用自用尺码图，3婴童自用尺码图，4儿童自用尺码图），默认传的是0
          obj.pictureType = isSelfUse ? 2 : 0;
          this.formatList.push(obj);
          if (this.index < (this.allLists.length - 1)) {
            if (this.$common.isEmpty(this.validLanguage) || !isSelfUse) {
              this.index++;
            }
            // 表格组件使用多级表头时会造成无限循环，用移除列表来做处理
            this.isShowTable = false;
            this.$nextTick(() => {
              this.setItem(true, '.pichtml');
            })
          } else {
            this.mulUploadPic();
          }
        }).catch((err) => {
          this.parentEvent.finishModel(false);
          console.error('绘制尺码图失败：', err);
        })
      })
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
        res.datas.forEach((k, index) => {
          this.$set(this.formatList[index], 'pictureUrl', k);
          delete this.formatList[index].file;
        })
        this.saveSizePicture();
      }).catch(err => {
        console.error(err);
        this.parentEvent.finishModel(false);
        this.resetPic();
      })
    },
    // 保存图片
    saveSizePicture () {
      this.$axios.post(api.saveSizePicture, this.formatList).then(res => {
        this.$Message.success('成功生成尺码图!');
        // 通知父级生成尺码图完成
        this.parentEvent.finishModel(true);
      }).finally(() => {
        this.resetPic();
      }).catch((err) => {
        console.error(err);
        this.parentEvent.finishModel(false);
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
      let aLink = document.createElement('a');
      let blob = base64ToBlob(base64); //new Blob([content]);
      let evt = document.createEvent("HTMLEvents");
      evt.initEvent("click", true, true);//initEvent 不加后两个参数在FF下会报错  事件类型，是否冒泡，是否阻止浏览器的默认行为
      aLink.download = this.dataItem.size + 'fileName';
      aLink.href = URL.createObjectURL(blob);
      aLink.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(aLink.href);
      }, 50)
    },
    // 重置图片
    resetPic () {
      this.index = 0;
      this.dataItem = {};
      this.formatList = [];
      this.selfUseColumns = [];
    },
    tagMulfun () {
      let list = this.tableData.filter(k => {
        return k['size'];
      }).map(k => {
        return k['size'];
      })
      return list.join('，');
    },
    // 颜色值改变时修改 CSS 变量
    colorChange (color, key) {
      let root = document.documentElement;
      if (!root) return;
      // 修改 CSS 变量的值
      root.style.setProperty(`--size-chart-${key}`, color);
    }
  }
}
</script>
<style lang="less">
@color: #000000;
.sizePicture {
  color: @color;
  .pichtml{
    background: #fff;
    padding: 3px;
  }
  .flex-form{
    display: flex;
    justify-content: space-between;
  }
  .img-box-content{
    display: flex;
    flex: 60;
    justify-content: center;
  }
  &.woman-shoe-plan{
    .bigPic, .midPic, .smallpic{
      .flex-sty {
        min-width: initial;
        min-height: auto;
        width: 100%;
        padding-right: 0;
        padding-left: 0;
      }
      .img-father{
        position: relative;
        width: 100%;
        height: auto;
        overflow: hidden;
        display: flex;
        align-items: center;
        border-radius: 0;
        margin-left: 0;
        justify-content: center;
        img{
          width: auto;
          height: auto;
          max-width: 90%;
          max-height: 300px;
        }
      }
    }
    .size-pic--main{
      .ivu-table-header {
        thead tr {
          &:nth-child(1), &:nth-child(3) {
            display: none;
          }
        }
      }
    }
    .size-image-main{
      .ivu-table-header {
        thead tr {
          th {
            &.measurement-value {
              display: none;
            }
          }
        }
      }
    }
  }
  .text-center {
    text-align: center;
  }
  .form-item {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .ivu-table th.is-leaf,
  .ivu-table-border th{
    border-color: var(--size-chart-headBorderColor);
    font-weight: bold;
  }
  .ivu-table td,
  .ivu-table-border td,
  .ivu-table-wrapper-with-border {
    border-color: var(--size-chart-tableBorderColor);
    font-weight: bold;
  }
  .ivu-table:before{
    background-color: var(--size-chart-tableBorderColor);
  }
  .ivu-table-border {
    &:after {
      background-color: var(--size-chart-tableBorderColor);
    }
    .ivu-table-header{
      position: relative;
      .ivu-table-cell{
        span{
          text-align: left;
          display: inline-block;
          padding: 0 5px;
          margin: 0 auto;
        }
      }
      &:after {
        background-color: var(--size-chart-headBorderColor);
        z-index: 10;
      }
    }
  }
  .ivu-table-column-center {
    .ivu-table-cell {
      white-space: pre-line;
      &:first-child {
        white-space: pre-line;
      }
    }
  }
  .ivu-table {
    th {
      background: var(--size-chart-headBackground);
      color: var(--size-chart-headFontColor);
      .ivu-input{
        color: var(--size-chart-headFontColor);
      }
    }
    td {
      background: var(--size-chart-tableBackground);
      color: var(--size-chart-tableFontColor);
      .ivu-input{
        color: var(--size-chart-tableFontColor);
      }
    }
  }
  // 属性内容
  .flex-sty {
    width: 100%;
    position: relative;
    display: inline-block;
    .ivu-form-item-label,
    .ivu-form-item,
    .ivu-btn,
    .ivu-table {
      color: @color;
      font-weight: bold;
    }
    .form-border--bot {
      border-bottom: 1px solid #000000;
      .ivu-form-item-label {
        text-align: left;
      }
    }
  }
  // label加粗
  .mul-attr {
    .ivu-form-item-label {
      color: #000;
      font-weight: bold;
    }
    .ivu-btn {
      border-color: #000;
      border-radius: 0;
    }
    .active-btn {
      background-color: #adadad;
      color: @color;
    }
  }
  // 图片
  .img-father {
    position: relative;
    flex: 100;
    // top: 0;
    // right: 0;
    overflow: hidden;
    display: flex;
    align-items: center;
    border-radius: 2px;
    img {
      width: 100%;
      height: auto;
      object-fit: cover;
    }
  }
  // 加粗标题
  .text-weight {
    font-weight: bold;
  }
  // 字母强制换行
  .text-over {
    word-wrap: break-word;
  }
  // 分割线
  .split-line {
    width: 100%;
    font-weight: bold;
    // border-bottom: 1px dashed @color;
  }
  // 不同分辨率下
  .bigPic {
    width: 1500px;
    min-height: 2000px;
    font-size: 18px;
    .ivu-form {
      .ivu-form-item-label {
        font-size: 18px;
        padding: 14px 16px 14px 0;
      }
      .ivu-form-item-content {
        font-size: 18px;
        line-height: 44px;
      }
    }
    .flex-sty {
      min-width: 1000px;
      min-height: 400px;
      .ivu-btn {
        padding: 0 5px;
        font-size: 18px;
        height: 40px;
      }
      .flex-form-top {
        margin-bottom: 18px;
        flex: 40;
      }
      .btn-mb {
        margin-bottom: 5px;
      }
      .mul-attr {
        margin-top: 14px;
      }
    }
    .img-father {
      max-width: 360px;
      max-height: 400px;
    }
    .text-title {
      font-size: 40px;
      margin-bottom: 10px;
    }
    .split-line {
      padding: 20px 0 16px 0;
      margin-bottom: 24px;
      font-size: 24px;
    }
    .ivu-table {
      font-size: 18px;
    }
    .ivu-table td {
      height: 50px;
    }
    .ivu-table-header thead tr th {
      padding: 10px 0;
    }
    .text-line {
      margin-top: 10px;
    }
    .btn-mb {
      margin-bottom: 5px;
    }
  }
  .midPic {
    width: 1000px;
    min-height: 1000px;
    font-size: 16px;
    .ivu-form {
      .ivu-form-item-label {
        font-size: 16px;
        padding: 10px 12px 10px 0;
      }
      .ivu-form-item-content {
        font-size: 16px;
        line-height: 34px;
      }
    }
    .flex-sty {
      min-width: 700px;
      min-height: 300px;
      .ivu-btn {
        padding: 0 5px;
        font-size: 16px;
        height: 30px;
      }
      .flex-form-top {
        margin-bottom: 14px;
        flex: 40;
      }
      .btn-mb {
        margin-bottom: 5px;
      }
      .mul-attr {
        margin-top: 10px;
      }
    }
    .img-father {
      max-width: 280px;
      max-height: 300px;
    }
    .text-title {
      font-size: 28px;
      margin-bottom: 6px;
    }
    .split-line {
      padding: 12px 0 8px 0;
      margin-bottom: 12px;
      font-size: 18px;
    }
    .ivu-table {
      font-size: 16px;
    }
    .ivu-table td {
      height: 40px;
    }
    .ivu-table-header thead tr th {
      padding: 6px 0;
    }
    .text-line {
      margin-top: 6px;
    }
    .btn-mb {
      margin-bottom: 5px;
    }
  }
  .smallpic {
    width: 600px;
    min-height: 800px;
    font-size: 14px;
    .ivu-form {
      .ivu-form-item-label {
        font-size: 14px;
        padding: 7px 6px 7px 0;
      }
      .ivu-form-item-content {
        font-size: 14px;
        line-height: 26px;
      }
    }
    .flex-sty {
      min-width: 500px;
      min-height: 220px;
      .ivu-btn {
        padding: 0 5px;
        height: 26px;
        font-size: 14px;
        height: 26px;
      }
      .flex-form-top {
        margin-bottom: 10px;
        flex: 65;
        min-width: 240px;
      }
      .img-box-content{
        display: grid;
        flex: 35;
        justify-content: center;
      }
      .img-father {
        img {
          max-height: 100%;
        }
      }
      .btn-mb {
        margin-bottom: 5px;
      }
      .mul-attr {
        margin-top: 5px;
        .mb10{
          margin-bottom: 5px;
        }
      }
    }
    .img-father {
      max-width: 200px;
      max-height: 110px;
    }
    .text-title {
      font-size: 22px;
      margin-bottom: 4px;
    }
    .split-line {
      padding: 0;
      margin-bottom: 5px;
      font-size: 16px;
    }
    .ivu-table {
      font-size: 14px;
    }
    .ivu-table td {
      height: 36px;
    }
    .ivu-table-header thead tr th {
      padding: 6px 0;
    }
    .text-line {
      margin-top: 4px;
    }
    .btn-mb {
      margin-bottom: 4px;
    }
  }
  // 整块
  .size-pic--main, .size-image-main {
    padding: 5px;
    overflow: hidden;
    background: #fff;
    // border: 1px solid #ccc;
    display: flex;
    flex-direction: column;
    justify-content: center;
    .ivu-table-cell {
      padding: 0;
    }
  }
  .print-self-use{
    width: 1000px;
    min-height: 1000px;
  }
  .row-col-txt{
    text-align: left;
    display: inline-block;
    padding: 0 5px;
    margin: 0 auto;
  }
}
</style>