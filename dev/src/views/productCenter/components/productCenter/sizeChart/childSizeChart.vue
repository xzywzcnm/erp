<template>
  <div>
    <Modal v-model="modelVisible" width="1100px" :title="title[childType] || '尺码图'" :mask-closable="false" class="childSizeChart">
      <div class="chartMain midPic sizeChartPos">
        <div class="chartChild" v-if="defaultLanguage" :class="{'not-select-self-size': !selectSelfSize}">
          <Table
            :columns="totalColumns"
            :data="tableData"
            border
            class="childSizeChart__table"
            :disabled-hover="true"
            id="childSizeChartID"
            size="small"
          ></Table>
          <template v-if="!$common.isEmpty(validLanguage)">
            <div class="describe mt10">
              <p v-for="(item,index) in describe" :key="index + 'describe'">{{item}}</p>
            </div>
            <div class="pictures mt10">
              <div v-for="(item,index) in pictures" :key="index + 'pictures'" class="imgBlock">
                <img :src="imgURL(item)" alt="img">
              </div>
            </div>
          </template>
        </div>
        <Spin fix v-if="loading">图片生成中，请勿中断操作...</Spin>
        <Spin fix v-if="pageLoading">数据加载中...</Spin>
      </div>
      <div slot="footer">
        <div class="footers">
          <div class="footers__left">
            <span class="mr10">选择生成的尺码图语言:</span>
            <CheckboxGroup v-model="language" @on-change="lanChecked" v-if="!(loading || pageLoading)">
              <template v-for="(oItem, oIndex) in otherCheck">
                <Checkbox :label="oItem.value" class="mr15" :key="`oIndex-${oIndex}`" v-if="!oItem.hidden">{{oItem.label}}</Checkbox>
              </template>
              <Checkbox :label="item.type" class="mr15" v-for="(item,index) in languageList" :key="index">{{item.label}}</Checkbox>
            </CheckboxGroup>
          </div>
          <div class="footers__right">
            <div></div>
            <div>
              <Checkbox v-model="syncInformation" style="margin-right: 100px;">同步生成文本资料尺码图表格</Checkbox>
              <Button @click="modelVisible = false">取消</Button>
              <Button type="primary" @click="confirm" :loading="pageLoading || loading">确定</Button>
            </div>
          </div>
        </div>
      </div>

    </Modal>
  </div>
</template>
<script>
import api from '@/api/api';
import Big from 'big.js';
import { selfAttrList, tableLangInfo } from './childSizeConfig.js';

export default {
  name: "childSizeChart",
  components: {},
  data () {
    return {
      modelVisible: false,
      syncInformation: false,
      selfAttrList: this.$common.copy(selfAttrList),
      defaultLanguage: 'en',
      otherCheck: [{ label: '自用尺码图', value: 'selfUseSize' }],
      language: ['en', 'ger', 'selfUseSize'],
      otherTableColumns: {},
      languageKey: ['en', 'ger', 'fra', 'spn', 'it', 'por', 'pol', 'cn', 'an'], // 语言区分 以此为标准
      languageList: [
        { label: '英语', type: 'en' },
        { label: '德语', type: 'ger' },
      ], // 语言列表
      feild: ['tagSize', 'cmrecommend', 'inchrecommend', 'euSize', 'cmtops', 'inchtops', 'cmbust', 'inchbust', 'cmbottoms', 'inchbottoms', 'cmwaistline', 'inchwaistline', 'cmhips', 'inchhips', 'cmsleeve', 'inchsleeve'], // 表格input字段
      pictures: ['onePieceGarment', 'jacket', 'trousers', 'shortSkirt', 'jumpsuits', 'onePieceSkirt'], // 图片后缀名
      tableData: [],
      tableJsonData: {},
      loading: false,
      pageLoading: false,
      partDetail: {},
      measurementJson: {
        method: '测量方法',
        size: '尺寸'
      },
      iframeId: `iframe-${Math.random().toString(36).substring(2)}`,
      title: { 2: '婴童尺码图', 3: '儿童尺码图' },
    }
  },
  props: {
    isVisible: { // 弹框
      type: Boolean,
      default: false
    },
    productCategoryListData: { // requiredetail.vue 组件传过来的商品分类列表
      type: Array,
      default () {
        return [];
      }
    },
    productInfo: {
      type: Object,
      default () { return {} }
    },
    childType: { // 尺码图类型
      type: Number,
      default: null
    },
  },
  watch: {
    isVisible: {
      deep: true,
      immediate: true,
      handler (newVal) {
        newVal && this.open();
      }
    },
    modelVisible: {
      deep: true,
      immediate: true,
      handler (newVal) {
        if (!newVal) {
          this.$emit('update:isVisible', newVal);
          this.loading = false;
          this.removeIframe();
          this.syncInformation = false;
        }
      }
    },
    defaultLanguage: {
      deep: true,
      immediate: true,
      handler (newVal) {
        if (!newVal) return;
        this.getTableData();
      }
    },
  },
  computed: {
    // 选中的语言(排除指定值)
    validLanguage () {
      const notIncludes = this.otherCheck.map(m => m.value);
      return (this.language || []).filter(item => {
        return !notIncludes.includes(item)
      })
    },
    // 是否已存在自用尺码图
    isSelfUsePic () {
      return [1, '1'].includes(this.productInfo.haveSelfSizeImg);
    },
    // 是否选中了自用尺码图
    selectSelfSize () {
      if (this.$common.isEmpty(this.language)) return false;
      return this.language.includes('selfUseSize');
    },
    totalColumns () {
      let _self = this;
      let tableColumns = this.$common.copy(this.otherTableColumns[this.defaultLanguage]);
      let tempObj = {};
      if (!this.$common.isEmpty(tableColumns)) {
        tableColumns.forEach((item, index) => {
          tempObj[item.colKey] = {
            title: item.title,
            minWidth: 30,
            model: item.colKey,
            partInfo: item.partInfo,
            funWay: 'childrenColumn',
            renderHeader: (h, params) => {
              return h('Input', {
                style: {},
                props: {
                  type: 'text',
                  value: params.column.title
                },
                on: {
                  'on-change': (val) => {
                    this.$nextTick(() => {
                      this.$set(this.otherTableColumns[this.defaultLanguage][index], 'title', val.target._value);
                    })
                  }
                }
              });
            }
          }
        })
      }
      let fun = {
        temp: {
          tagSize: {
            minWidth: 40,
            model: 'tagSize',
            funWay: 'commonColumn',
          },
          recommend: {
            minWidth: 80,
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
        // 渲染 (conversion:是否换算)
        renderCom (h, params, conversion) {
          let { column, row, index } = params;
          return h('Input', {
            props: {
              value: row[column.model] || '',
            },
            on: {
              input: (val) => {
                if (column.model == 'euSize') {
                  _self.$set(_self.tableData[index], 'euSize', val);
                  _self.$set(_self.tableJsonData[_self.defaultLanguage][index], 'euSize', val);
                  return;
                }
                const newVal = (_self.$common.isEmpty(val) ? '' : val).trim();
                _self.$set(_self.tableData[index], column.model, newVal);
                // conversion 为true时代表是cm，需要对inch进行价格换算
                if (conversion && val) {
                  const changeModel = column.model ? column.model.replace('cm', 'inch') : '';
                  if (!_self.$common.isEmpty(changeModel)) {
                    _self.$set(_self.tableData[index], changeModel, _self.cmInputFocus(newVal));
                  }
                }
              },
            }
          });
        },
        // recommend 处理是因为表格框不支持表头合并
        recommendColumn (obj, item) {
          obj.render = (h, params) => {
            let { row, index } = params;
            return h('div', {
              style: {
                width: '100%',
                height: '100%',
                display: 'flex',
              }
            }, [
              h('div', {
                style: {
                  flex: 1,
                  overflow: 'hidden',
                  borderRight: '1px solid #020202',
                  display: 'flex',
                  alignItems: 'center',
                  paddingRight: '2px',
                }
              }, [
                h('Input', {
                  props: {
                    value: row.cmrecommend || '',
                  },
                  on: {
                    input: (val) => {
                      _self.$set(_self.tableData[index], 'cmrecommend', val);
                      _self.$set(_self.tableJsonData[_self.defaultLanguage][index], 'cmrecommend', val);
                    }
                  }
                }),
              ]),
              h('div', {
                style: {
                  flex: 1,
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: '2px',
                  justifyContent: 'center',
                }
              },
              [
                h('Input', {
                  props: {
                    value: row.inchrecommend || '',
                  },
                  on: {
                    input: (val) => {
                      _self.$set(_self.tableData[index], 'inchrecommend', val);
                      _self.$set(_self.tableJsonData[_self.defaultLanguage][index], 'inchrecommend', val);
                    }
                  }
                }),
              ])
            ])
          }
          return obj;
        },
        // cm,inch 处理
        childrenColumn (obj, item, type) {
          if (_self.$common.isEmpty(_self.selfAttrList[_self.defaultLanguage].partHand[obj.model])) {
            _self.$set(_self.selfAttrList[_self.defaultLanguage].partHand, obj.model, { cm: 'cm', inch: 'inch' });
          }
          let childList = _self.selfAttrList[_self.defaultLanguage].partHand[obj.model] || {};
          obj.children = [{
            align: 'center',
            title: obj.partInfo.measurementDescription,
            className: 'measurement-method',
            minWidth: item.minWidth * 2,
            renderHeader: (h, params) => {
              return h('Input', {
                style: {},
                props: {
                  type: 'textarea',
                  value: params.column.title
                },
                on: {
                  'on-change': (val) => {
                    _self.$nextTick(() => {
                      Object.keys(_self.partDetail).forEach(key => {
                        (_self.partDetail[key] || []).forEach((item, index) => {
                          if (obj.partInfo.partId == item.partId) {
                            _self.$set(_self.partDetail[key][index], 'measurementDescription', val.target._value);
                          }
                        })
                      })
                    })
                  }
                }
              });
            },
            children: Object.keys(childList).map(key => {
              return {
                align: 'center',
                title: childList[key],
                model: `${key}${item.model}`,
                minWidth: item.minWidth,
                render: (h, params) => {
                  return this.renderCom(h, params, key === 'cm', _self.defaultLanguage);
                },
                renderHeader: (h, params) => {
                  return h('Input', {
                    style: {},
                    props: {
                      type: 'text',
                      value: params.column.title
                    },
                    on: {
                      'on-change': (val) => {
                        _self.$nextTick(() => {
                          _self.$set(_self.selfAttrList[_self.defaultLanguage].partHand[obj.model], key, val.target._value);
                        })
                      }
                    }
                  });
                }
              }
            })
          }];
          return obj;
        },
        // 通用
        commonColumn (obj, item, type, language) {
          obj.render = (h, params) => {
            return this.renderCom(h, params, false, language);
          }
          return obj;
        },
        // 返回展示的表格头
        defaultColumn (language) {
          let childData = _self.selfAttrList[language] || {};
          let [list, temp] = [[], this.temp];
          Object.keys(temp).forEach(item => {
            if (childData.column && childData.column[item] && temp && temp[item]) {
              temp[item].title = childData.column[item] || '';
              temp[item].renderHeader = (h, params) => {
                return h('Input', {
                  style: {},
                  props: {
                    type: 'text',
                    value: params.column.title
                  },
                  on: {
                    'on-change': (val) => {
                      _self.$nextTick(() => {
                        _self.$set(_self.selfAttrList[language].column, item, val.target._value);
                      })
                    }
                  }
                });
              }
            }
            list.push(temp[item]);
          })
          return list;
        },
        // 表格列
        splicingColumn (language, type) {
          let list = this.defaultColumn(language, type).map(item => {
            let obj = {};
            obj.align = 'center';
            obj.model = item.model;
            obj.title = item.title;
            obj.minWidth = item.minWidth;
            if (_self.$common.isFunction(item.renderHeader)) {
              obj.renderHeader = item.renderHeader;
            }
            if (!_self.$common.isEmpty(item.partInfo)) {
              obj.partInfo = item.partInfo;
            }
            return this[item.funWay](obj, item, type, language);
          });
          list = list.map(item => {
            let obj = _self.$common.copy(item);
            const newObj = _self.$common.copy(item);
            if (obj.model == 'tagSize' && _self.selectSelfSize) {
              delete newObj.renderHeader;
              obj.children = [{
                align: 'center',
                title: _self.measurementJson.method,
                minWidth: obj.minWidth,
                children: [{
                  ...newObj,
                  title: language == 'cn' ? _self.measurementJson.size : ' ',
                  renderHeader: (h, params) => {
                    if (language != 'cn') return h('span', params.column.title);
                    return h('Input', {
                      style: {
                        width: '100%',
                      },
                      props: {
                        type: 'text',
                        value: params.column.title
                      },
                      on: {
                        'on-change': (val) => {
                          _self.$nextTick(() => {
                            _self.$set(_self.measurementJson, 'size', val.target._value);
                          })
                        }
                      }
                    });
                  }
                }],
                renderHeader: (h, params) => {
                  return h('Input', {
                    style: {
                      width: '100%',
                    },
                    props: {
                      type: 'text',
                      value: params.column.title
                    },
                    on: {
                      'on-change': (val) => {
                        _self.$nextTick(() => {
                          _self.$set(_self.measurementJson, 'method', val.target._value);
                        })
                      }
                    }
                  });
                }
              }];
              delete obj.render;
            }
            if (['recommend', 'euSize'].includes(obj.model) && _self.selectSelfSize) {
              delete newObj.renderHeader;
              obj.children = [{
                align: 'center',
                title: ' ',
                minWidth: obj.minWidth,
                children: [{
                  ...newObj,
                  title: ' ',
                }]
              }];
              delete obj.render;
            }
            return obj;
          })
          return list;
        }
      }
      let list = fun.splicingColumn(this.defaultLanguage);
      let tableHead = this.selfAttrList[this.defaultLanguage] ? this.selfAttrList[this.defaultLanguage].tableHead : '';
      let newCloumns = [
        {
          title: tableHead,
          align: 'center',
          children: list,
          cellClassName: 'sizeChart',
          renderHeader: (h, params) => {
            return h('Input', {
              style: {
                width: '300px',
              },
              props: {
                type: 'text',
                value: params.column.title
              },
              on: {
                'on-change': (val) => {
                  this.$nextTick(() => {
                    this.$set(this.selfAttrList[this.defaultLanguage], 'tableHead', val.target._value);
                  })
                }
              }
            });
          }
        }
      ];
      return newCloumns;
    },
    describe () {
      let language = this.defaultLanguage;
      let data = this.selfAttrList[language] ? this.selfAttrList[language].describe : [];
      return data;
    },
  },
  methods: {
    // 重置信息
    resetData () {
      this.selfAttrList = this.$common.copy(selfAttrList);
      this.tableData = [];
      this.measurementJson = { method: '测量方法', size: '尺寸' };
      this.tableJsonData = {};
      this.partDetail = {};
      this.language = ['en', 'ger', 'selfUseSize'];
      this.defaultLanguage = 'ger';
    },
    open () {
      this.createIframe();
      this.pageLoading = true;
      this.modelVisible = this.isVisible;
      this.resetData();
      this.getTableData(true);
      this.keyChange();
      this.getSizeDetail().then((res) => {
        this.partDetail = res;
        this.otherTableColumns = this.handSelfUseColumns(res);
        this.pageLoading = false;
      })
    },
    // 创建截图的 iframe
    createIframe () {
      let iframe = document.createElement('iframe');
      iframe.id = this.iframeId;
      iframe.src = `/product-service/productCenter.html#/childSizePicture`;
      // iframe.style.display = 'none';
      iframe.style.position = 'absolute';
      iframe.style.zIndex = '-10';
      iframe.style.width = '100vw';
      iframe.style.height = '100vh';
      iframe.style.top = '100vh';
      document.body.appendChild(iframe);
      window.frames[this.iframeId].contentWindow.iframeId = this.iframeId;
      // 方法需要放到此次，不可以放到参数传递
      window.frames[this.iframeId].contentWindow.events = {
        finishPicture: this.finishPicture, // 生成尺码图成功时回调
        getSizePicture: this.getSizePicture // 更新父级图片
      }
    },
    // 移除截图的 iframe
    removeIframe () {
      const oldIframe = document.querySelector(`#${this.iframeId}`);
      if (this.$common.isEmpty(oldIframe)) return;
      oldIframe.remove();
    },
    getTableData (isFirst) {
      let language = this.defaultLanguage;
      let childType = this.childType;
      let tableData = this.selfAttrList[language] ? this.selfAttrList[language].tableData : {};
      let list = this.$common.copy(tableData[childType] || []);
      if (isFirst) {
        // 第一次确定表格模板
        let tableList = list.map(item => {
          let obj = {};
          this.feild.forEach(feildItem => {
            obj[feildItem] = '';
          })
          Object.keys(item).forEach(specialItem => {
            obj[specialItem] = item[specialItem] || '';
          })
          return obj;
        })
        this.$set(this.tableJsonData, language, this.$common.copy(tableList));
        this.tableData = tableList;
      } else {
        const oldData = this.tableJsonData[language];
        // 语言变更，表格数据变化
        if (this.$common.isEmpty(oldData)) {
          this.tableData.forEach((item, index) => {
            this.$set(this.tableData[index], 'cmrecommend', list[index].cmrecommend);
            this.$set(this.tableData[index], 'inchrecommend', list[index].inchrecommend);
            this.$set(this.tableData[index], 'euSize', list[index].euSize);
          })
          this.$set(this.tableJsonData, language, this.$common.copy(this.tableData));
        } else {
          this.tableData.forEach((item, index) => {
            this.$set(this.tableData[index], 'cmrecommend', oldData[index].cmrecommend);
            this.$set(this.tableData[index], 'inchrecommend', oldData[index].inchrecommend);
            this.$set(this.tableData[index], 'euSize', oldData[index].euSize);
          })
        }
      }
    },
    // 处理自用尺码列
    handSelfUseColumns (selfUseLanguage) {
      let columnsInfo = {};
      Object.keys(selfUseLanguage).forEach((key) => {
        let children = [];
        (selfUseLanguage[key] || []).forEach(item => {
          children.push({
            align: 'center',
            title: item[`${key}Name`],
            colKey: `key${item.partId}`,
            partInfo: item,
            children: [{
              ...item,
              align: 'center',
              className: 'measurement-method',
              title: item.measurementDescription,
            }]
          });
        })
        columnsInfo[key] = children;
      })
      return columnsInfo;
    },
    // 获取尺码部位列表
    getSizePartList () {
      return new Promise((resolve) => {
        this.axios.get(api.queryAllProductSizePartList).then((res) => {
          if (res.data.code !== 0) {
            resolve({});
            return;
          }
          let obj = {};
          (res.data.datas || []).forEach(k => { obj[k.partId] = k; });
          resolve(obj);
        }).catch(() => {
          resolve({});
        })
      })
    },

    // 处理商品分类
    categoryData () {
      const productCategoryId = this.productInfo.productCategoryId;
      return new Promise((resolve) => {
        let productList = this.getProductCategoryTree(this.productCategoryListData, null);
        let result = null;
        const hand = (list, id) => {
          list.forEach(k => {
            if (id === k.productCategoryId) {
              if (!this.$common.isEmpty(k.sizeType)) {
                result = k;
              } else {
                k.parentId && hand(productList, k.parentId);
              }
            } else {
              if (k.children && k.children.length) {
                hand(k.children, id);
              }
            }
          });
        };
        hand(productList, productCategoryId);
        resolve(result || {});
      })
    },
    // 根据尺码类型获取详情
    getSizeDetail () {
      return new Promise((resolve) => {
        this.$common.promiseAll([
          this.categoryData,
          this.getSizePartList
        ]).then(arr => {
          const categoryResult = arr[0];
          const list = arr[1];
          if (this.$common.isEmpty(categoryResult) || this.$common.isEmpty(list)) return resolve({});
          this.axios.get(api.queryProductSizeClassificationInfo, {
            params: {
              classificationId: categoryResult.classificationId
            }
          }).then((res) => {
            if (res.data.code !== 0 || !res.data.datas) return resolve({});
            let { laPaProductSizePartInfoVOList } = res.data.datas;
            let obj = {};
            (laPaProductSizePartInfoVOList || []).forEach(item => {
              let temp = list[item.partId];
              if (this.$common.isEmpty(temp)) return;
              const tempKeys = Object.keys(temp);
              let NewPushItem = {};
              tempKeys.forEach(key => {
                if (!key.includes('Name')) {
                  NewPushItem[key] = temp[key];
                }
              })
              tempKeys.forEach(key => {
                if (!this.$common.isEmpty(key)) {
                  let oname = key.replace('Name', '');
                  if (this.languageKey.includes(oname)) {
                    if (!obj[oname]) obj[oname] = [];
                    obj[oname].push({
                      ...NewPushItem,
                      [oname + 'Name']: temp[key]
                    })
                  }
                }
              })
            });
            resolve(obj);
          }).catch(() => {
            resolve({});
          })
        })
      })
    },
    // 组装商品分类树
    getProductCategoryTree (productCategoryList, parentId) {
      let tree = [];
      let children;
      productCategoryList.forEach((n) => {
        if (n.parentId === parentId) {
          n.label = n.cnName;
          n.value = n.productCategoryId;
          children = this.getProductCategoryTree(productCategoryList, n.productCategoryId);
          if (children.length > 0) {
            n.children = children;
          }
          tree.push(n);
        }
      });
      return tree;
    },
    // 语言切换
    lanChecked (val) {
      this.$nextTick(() => {
        if (!this.$common.isEmpty(val)) {
          if (this.$common.isEmpty(this.validLanguage)) {
            this.defaultLanguage = 'cn';
          } else {
            this.defaultLanguage = this.validLanguage.slice(-1);
          }
        } else {
          this.defaultLanguage = '';
        }
        this.$nextTick(() => {
          this.keyChange();
        })
      })
    },
    // 图片路径拼接
    imgURL (e) {
      let language = this.defaultLanguage;
      if (!(e && language) || this.$common.isEmpty(this.validLanguage) || language == 'cn') return;
      return require(`#@/static/images/sizechart/${language}/${e}.png`);
    },
    // inch值根据cm填写而变化
    cmInputFocus (val) {
      let rate = 0.3937;
      // let reg = /^\d*[.]?\d{1,4}$/;
      // if (!reg.test(val)) return '';
      const cmValue = Number(val);
      if (this.$common.isEmpty(cmValue)) return '';
      return new Big(val).times(rate).toFixed(2);
    },
    // 上下左右
    tableKeydown (event) {
      let e = event || window.event;
      const codelist = [37, 38, 39, 40]; // 左、上、右、下
      if (e && !codelist.includes(e.keyCode)) return;
      const fun = (dom) => {
        if (!dom || this.$common.isEmpty(dom.tagName)) return dom;
        const tagName = dom.tagName.toLowerCase();
        if (tagName === 'td') return dom;
        return fun(dom.parentNode);
      }
      // 聚焦节点的父亲节点=>兄弟节点的子节点
      let parenTarget = this.$common.parents(e.target, 'td');
      if (!parenTarget) return;
      // 这里有个特殊情况就是，表格内嵌套假造的td
      parenTarget = fun(parenTarget);
      if (!parenTarget) return;
      let tdIndex = null;// 记录行所在的td的位置
      if (parenTarget && parenTarget.parentNode && parenTarget.parentNode.children) {
        let children = Array.prototype.slice.call(parenTarget.parentNode.children) || [];
        children.forEach((k, i) => {
          if (k === parenTarget) {
            tdIndex = i;
          }
        })
      }

      if (e.keyCode == 38) {
        if (!(tdIndex || tdIndex === 0)) return;
        if (parenTarget && parenTarget.parentNode && parenTarget.parentNode.previousElementSibling && parenTarget.parentNode.previousElementSibling.children) {
          let td = parenTarget.parentNode.previousElementSibling.children[tdIndex];
          td && td.querySelector('.ivu-input') && td.querySelector('.ivu-input').focus();
        }
      }

      if (e.keyCode == 37) {
        if (parenTarget && parenTarget.previousElementSibling && parenTarget.previousElementSibling.querySelector('.ivu-input')) {
          parenTarget.previousElementSibling.querySelector('.ivu-input').focus();
        }
      }

      if (e.keyCode == 40) {
        if (!(tdIndex || tdIndex === 0)) return;
        if (parenTarget && parenTarget.parentNode && parenTarget.parentNode.nextElementSibling && parenTarget.parentNode.nextElementSibling.children) {
          let td = parenTarget.parentNode.nextElementSibling.children[tdIndex];
          td && td.querySelector('.ivu-input') && td.querySelector('.ivu-input').focus();
        }
      }

      if (e.keyCode == 39) {
        if (parenTarget && parenTarget.nextElementSibling && parenTarget.nextElementSibling.querySelector('.ivu-input')) {
          parenTarget.nextElementSibling.querySelector('.ivu-input').focus();
        }
      }
    },
    // 键盘事件
    keyChange () {
      let table = document.getElementById('childSizeChartID');
      if (!table) return;
      this.cancelKeydown();
      table.addEventListener('keydown', (e) => {
        this.tableKeydown(e)
      }, false);
    },
    // 销毁键盘事件
    cancelKeydown () {
      let table = document.getElementById('childSizeChartID');
      if (!table) return;
      table.removeEventListener('keydown', (e) => {
        this.tableKeydown(e);
      }, false);
    },
    // 确认
    confirm () {
      if (this.pageLoading || this.loading) return;
      if (!this.language.length) {
        this.$Message.error('请勾选要生成尺码图的语言!');
        return;
      }
      if (this.isSelfUsePic && this.selectSelfSize) {
        this.$Modal.confirm({
          title: '操作提醒',
          content: `<div style="font-size: 16px;">该次生成的“自用尺码图”会覆盖之前生成的“自用尺码图”，是否继续？</div>`,
          onOk: () => {
            this.startCreatePic();
          },
          onCancel: () => {}
        });
        return;
      }
      this.startCreatePic();
    },
    startCreatePic () {
      this.loading = true;

      this.$bus.emit(this.iframeId, {
        childType: this.childType,
        tableData: this.tableData,
        selfAttrList: this.selfAttrList,
        tableJsonData: this.tableJsonData,
        partDetail: this.partDetail,
        measurementJson: this.measurementJson,
        validLanguage: this.validLanguage,
        otherTableColumns: this.otherTableColumns,
        otherCheck: this.otherCheck,
        productInfo: this.productInfo,
        checkLanguage: this.language,
        ...(this.$attrs)
      });
      this.syncInformation && this.handSynccontent();
    },
    // 处理对应语言，并且填充到复杂描述里面
    handSynccontent () {
      let tableLangData = {};
      let tableTemplate = {};
      let templateData = [];
      let tableLangCol = {};
      const colKey = [
        { key: 'tagSize', rowKey: 'tagSize', colspan: 1, rowspan: 2 },
        { key: 'recommend', rowKey: 'recommend', colspan: 2, rowspan: 2 },
        { key: 'euSize', rowKey: 'euSize', colspan: 1, rowspan: 2 }
      ];
      let addCol = {};
      // 表格数据处理
      this.validLanguage.forEach(language => {
        tableTemplate = {};
        tableLangCol[language] = [];
        tableLangData[language] = [];
        addCol[language] = {
          allColToal: 0
        };
        if (!this.$common.isEmpty(this.selfAttrList[language])) {
          tableTemplate = this.selfAttrList[language].tableData;
          // 处理固定列表头
          if (!this.$common.isEmpty(this.selfAttrList[language].column)) {
            colKey.forEach(item => {
              if (!this.$common.isEmpty(this.selfAttrList[language].column[item.key])) {
                addCol[language].allColToal += item.colspan;
                if (item.key == 'recommend') {
                  tableLangCol[language].push({
                    colspan: item.colspan,
                    rowspan: item.rowspan,
                    title: this.selfAttrList[language].column[item.key],
                    children: [
                      { rowKey: `cm${item.key}`, colspan: 1, rowspan: 1 },
                      { rowKey: `inch${item.key}`, colspan: 1, rowspan: 1 }
                    ]
                  });
                } else {
                  tableLangCol[language].push({
                    rowKey: item.rowKey,
                    colspan: item.colspan,
                    rowspan: item.rowspan,
                    title: this.selfAttrList[language].column[item.key]
                  });
                }
              }
            });
          }
        }
        // 处理的部件列表头
        if (!this.$common.isEmpty(this.otherTableColumns[language])) {
          this.otherTableColumns[language].forEach(col => {
            addCol[language].allColToal += 2;
            tableLangCol[language].push({
              title: col.title,
              colspan: 2,
              rowspan: 1,
              children: [
                { title: 'cm', rowKey: `cm${col.colKey}`, colspan: 1, rowspan: 1 },
                { title: 'inch', rowKey: `inch${col.colKey}`, colspan: 1, rowspan: 1 },
              ]
            })
          })
        }
        // 处理表格数据
        templateData = tableTemplate[this.childType] || [];
        if (!this.$common.isEmpty(this.tableJsonData[language])) {
          templateData = this.tableJsonData[language];
        }
        this.tableData.forEach((row, index) => {
          tableLangData[language].push({
            ...row,
            cmrecommend: templateData[index].cmrecommend,
            inchrecommend: templateData[index].inchrecommend,
            euSize: templateData[index].euSize,
          });
        });
      });
      let tableId = '';
      let tableInfo = tableLangInfo.default;
      let thHtml = '';
      let tdHtml = '';
      Object.keys(tableLangCol).forEach(key => {
        tableId = `size-chart-${key}`;
        if (!this.$common.isEmpty(tableLangInfo[key])) {
          tableInfo = tableLangInfo[key];
        }
        addCol[key].html = `<table border="1" id="${tableId}" style="text-align:center"><tbody>`;
        addCol[key].html += `<tr style="background:#ffc035;">
          <td colspan="${addCol[key].allColToal}" rowspan="1" style="border:1px solid black;">
            <p>${tableInfo.headTitle || tableLangInfo.default.headTitle}</p>
          </td>
        </tr>`;
        // 表头配置
        addCol[key].html += `<tr style="background:#ffc035;">`;
        thHtml = '';
        tableLangCol[key].forEach((item, index) => {
          if (!this.$common.isEmpty(item.title)) {
            addCol[key].html += `<td colspan="${item.colspan || 1}" rowspan="${item.rowspan || 1}" style="border:1px solid black;">
              <p>${item.title}</p>
            </td>`;
          }
          if (!this.$common.isEmpty(item.children)) {
            item.children.forEach(td => {
              if (!this.$common.isEmpty(td.title)) {
                thHtml += `<td colspan="${td.colspan || 1}" rowspan="${td.rowspan || 1}" style="border:1px solid black;">
                  <p>${td.title}</p>
                </td>`;
              }
            });
            if (index + 1 == tableLangCol[key].length) {
              addCol[key].html += `<tr style="background:#ffc035;">${thHtml}</tr>`;
            }
          }
        });
        addCol[key].html += `</tr>`;
        // 表格数据插入
        tableLangData[key].forEach(row => {
          tdHtml = '';
          tableLangCol[key].forEach(item => {
            if (this.$common.isEmpty(item.children)) {
              tdHtml += `<td colspan="1" rowspan="1" style="border:1px solid black;">
                <p>${this.$common.isEmpty(row[item.rowKey]) ? '' : row[item.rowKey]}</p>
              </td>`;
            } else {
              item.children.forEach(td => {
                tdHtml += `<td colspan="1" rowspan="1" style="border:1px solid black;">
                  <p>${this.$common.isEmpty(row[td.rowKey]) ? '' : row[td.rowKey]}</p>
                </td>`;
              });
            }
          });
          addCol[key].html += `<tr style="background:#fff;">${tdHtml}</tr>`;
        });
        addCol[key].html += `</tbody></table>`;
        // 插入描述
        this.$emit('insetDescription', {
          html: addCol[key].html,
          tabName: key.toLocaleUpperCase(),
          lang: key,
          tableId: tableId
        });
      });
    },
    // 上传图片完毕
    finishPicture (type) {
      this.loading = false;
      if (type) this.modelVisible = false;
    },
    getSizePicture (data) {
      this.$emit('getSizePicture', data)
    }
  },
  destroyed () {
    this.cancelKeydown();
  }
}
</script>
<style lang="less">
.childSizeChart {
  color: #020202;
  .chartMain {
    margin: 0 auto;
    background: #fff;
    .chartChild {
      width: 100%;
      .ivu-input-wrapper {
        white-space: initial;
      }
      .ivu-table-cell{
        width: 100%;
      }
    }
    .childSizeChart__table {
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
          flex-wrap: wrap;
          padding: 0 2px;
          background: #fff;
          white-space: pre-wrap;
          &:active,
          &:focus {
            background: #fff;
          }
        }
        .ivu-input-wrapper {
          display: flex;
          align-items: center;
        }
        .ivu-input {
          padding: 0;
          border: none;
          text-align: center;
          outline: none;
          // font-size: 12px;
          &:active,
          &:focus {
            outline: none;
            box-shadow: none;
          }
        }
      }
      .ivu-table-header {
        .ivu-table-cell {
          padding: 0 2px;
          white-space: pre-wrap;
          word-break: break-all;
        }
      }
      .ivu-table th {
        background: #9bc2e6;
        padding: 4px 0;
      }
      .ivu-table thead tr:first-child th {
        background: #fff;
      }
    }
    .childSizeChart__table,
    .ivu-table-border td,
    .ivu-table-border th {
      border-color: #020202;
    }
    .ivu-table:before,
    .ivu-table-border:after {
      background: #020202;
    }
    .describe {
      p:first-child {
        color: #ec7d4e;
      }
    }
    .pictures {
      padding: 0 20px;
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
  .sizeChartPos {
    position: relative;
  }
  .footers,
  .footers__left {
    display: flex;
    align-items: center;
  }
  .footers {
    justify-content: space-between;
  }
  // 中图
  .midPic {
    width: 1000px;
    // height: 1000px;
    .describe {
      padding: 0 20px;
      p {
        line-height: 18px;
        margin-bottom: 6px;
      }
    }
  }
}
.not-select-self-size{
  .measurement-method{
    display: none;
  }
}
.footers__right{
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
