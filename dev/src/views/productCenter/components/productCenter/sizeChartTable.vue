<template>
  <!--尺码表-->
  <Table v-if="ymsProductCategoryId !== null && hideSizeChart"
    class="sizeChartTable"
    style="margin:20px"
    :columns="sizeChartColumns"
    :data="sizeChartdata"></Table>
</template>

<script>
import api from '@/api/api';

export default {
  name: 'sizeChartTable',
  props: {
    hideSizeChart: { // 是否默认展示尺码表
      type: Boolean,
      default: false
    },
    ymsProductCategoryId: { // 云卖分类id
      type: String,
      default: null
    },
    talgSize: { // 是否可编辑 Tag Size
      type: Boolean,
      default: true
    },
    classifyTalg: { // 记录在编辑页面云卖分类的状态： look -- 查看状态， edit-- 编辑状态， change -- 切换其他云卖分类模板
      type: String,
      default: 'change'
    },
    skuPropertyList: { // 商品多属性列表
      type: Array,
      default: () => []
    },
    isDisabled: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      sizeChartdata: [],
      sizeChartColumns: [],
      templateObj: {},
      editObj: {},
      originalSizeChartdata: [],
      originalSizeJsonData: {},
      sizeJsonData: {}
    };
  },
  methods: {
    // 获取尺码模板的数据 (type 为1 时，走addProduct.vue模块， type 为2 时，走editProduct.vue 模块)
    getTemplateData (ymsProductCategoryId, type) {
      let v = this;
      v.axios.get(api.get_ymsProductSizeTemplate + `${ymsProductCategoryId}`).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data) {
            v.$emit('updateHideSizeChart', true);
            v.sizeJsonData = data;
            if (type === 1) {
              v.sizeChartdata = [
                {
                  sizeCode: '',
                  ukSize: '',
                  euSize: '',
                  usSize: '',
                  sizeDetailBos: [],
                  __edit: true
                }
              ];
              data.productSizePartsBos.forEach(i => {
                v.sizeChartdata[0][i.ymsProductSizePartsId + '_defaultValue'] = null;
                v.sizeChartdata[0][i.ymsProductSizePartsId + '_partName'] = i.name;
                v.sizeChartdata[0][i.ymsProductSizePartsId + '_value'] = null;
                data.productSizeUnitBos.forEach(j => {
                  if (j.isDefault === 1) {
                    v.sizeChartdata[0][i.ymsProductSizePartsId + '_defaultUnitName'] = j.name;
                  }
                });
              });
              let sizeChartdata = v.sizeChartdata;
              v.originalSizeChartdata = JSON.parse(JSON.stringify(sizeChartdata));
              v.originalSizeJsonData = JSON.parse(JSON.stringify(data));
              v.handlerTemplate(data);
            } else if (type === 2) {
              if (v.classifyTalg === 'change') {
                v.handlerTemplate(data);
                if (v.skuPropertyList.length > 0) {
                  let sizeChartdata = [];
                  v.skuPropertyList.map((item) => {
                    if (item.name === '尺码') {
                      item.values.map((ele) => {
                        sizeChartdata.push(Object.assign({}, { size: ele }, v.templateObj));
                      });
                    }
                  });
                  v.$emit('updateSizeChartdata', sizeChartdata);
                }
              }
            }
          } else {
            // 没有绑定尺码模板时，隐藏尺码表
            v.sizeChartdata = [];
            v.sizeChartColumns = [];
            v.$emit('updateHideSizeChart', false);
          }
        }
      });
    },
    // 处理尺码表的单位
    handlerUnit (data, value) {
      let children = [];
      let obj = {};
      let v = this;
      if (data.productSizeUnitBos.length > 0) {
        let list = data.productSizeUnitBos;
        list.map((item) => {
          if (item.isDefault === 1) {
            v.templateObj[value + '_defaultUnitName'] = item.name;
            obj = {
              title: item.name,
              key: value + '_defaultValue',
              align: 'center',
              render: (h, params) => {
                return h('InputNumber', {
                  props: {
                    value: params.row[value + '_defaultValue'] ? Number(params.row[value + '_defaultValue']) : null,
                    min: 0,
                    disabled: (() => {
                      return v.isDisabled;
                    })()
                  },
                  on: {
                    'on-change': val => {
                      params.row[value + '_defaultValue'] = val;
                      v.sizeChartdata[params.index] = params.row;
                    }
                  }
                });
              }
            };
          } else {
            obj = {
              title: item.name,
              key: value + '_value',
              align: 'center',
              render: (h, params) => {
                let num = params.row[value + '_value'];
                let unitValue = params.row[value + '_defaultValue'];
                // 英寸转化厘米
                if (item.name === 'cm') {
                  if (unitValue > 0) {
                    num = unitValue * 2.54;
                    // Math.floor(num * 100) / 100;
                    num = num.toFixed(2);
                  }
                } else {
                  // 厘米转化成英寸
                  if (unitValue > 0) {
                    num = unitValue * 0.393701;
                    // Math.floor(num * 100) / 100;
                    num = num.toFixed(2);
                  }
                }
                params.row[value + '_value'] = Number(num) === 0 || isNaN(Number(num))
                  ? null
                  : Number(num);
                v.sizeChartdata[params.index] = params.row;
                return h('span', num);
              }
            };
          }
          children.push(obj);
        });
        return children;
      }
    },
    // 处理尺码表的数据
    handlerTemplate (data, ymsProductCategoryId) {
      let v = this;
      v.sizeChartColumns = [];
      const fixColumn = [
        {
          title: 'UK Size',
          key: 'ukSize',
          align: 'center',
          render: (h, params) => {
            return h('Input', {
              props: {
                value: isNaN(Number(params.row.ukSize)) ? 0 : params.row.ukSize,
                disabled: v.isDisabled
              },
              style: {
                width: '70px'
              },
              on: {
                'on-change' (e) {
                  if (!isNaN(Number(e.target.value))) {
                    v.sizeChartdata[params.index]['ukSize'] = e.target.value;
                  } else {
                    v.sizeChartdata[params.index]['ukSize'] = 0;
                  }
                }
              }
            });
          }
        },
        {
          title: 'EU Size',
          key: 'euSize',
          align: 'center',
          render: (h, params) => {
            return h('Input', {
              props: {
                value: isNaN(Number(params.row.euSize)) ? 0 : params.row.euSize,
                disabled: v.isDisabled
              },
              style: {
                width: '70px'
              },
              on: {
                'on-change' (e) {
                  if (!isNaN(Number(e.target.value))) {
                    v.sizeChartdata[params.index]['euSize'] = e.target.value;
                  } else {
                    v.sizeChartdata[params.index]['euSize'] = 0;
                  }
                }
              }
            });
          }
        },
        {
          title: 'US Size',
          key: 'usSize',
          align: 'center',
          render: (h, params) => {
            return h('Input', {
              props: {
                value: isNaN(Number(params.row.usSize)) ? 0 : params.row.usSize,
                disabled: v.isDisabled
              },
              style: {
                width: '70px'
              },
              on: {
                'on-change' (e) {
                  if (!isNaN(Number(e.target.value))) {
                    v.sizeChartdata[params.index]['usSize'] = e.target.value;
                  } else {
                    v.sizeChartdata[params.index]['usSize'] = 0;
                  }
                }
              }
            });
          }
        }
      ];
      if (v.classifyTalg === 'look' || v.classifyTalg === 'edit') {
        // 判断当前的单位
        let v = this;
        v.axios.get(api.get_ymsProductSizeTemplate + `${ymsProductCategoryId}`).then(response => {
          if (response.data.code === 0) {
            let unitData = response.data.datas;
            if (unitData) {
              if (data) {
                let size = {
                  title: 'Tag Size',
                  key: 'sizeCode',
                  align: 'center',
                  render: (h, params) => {
                    return h('Input', {
                      props: {
                        size: 'small',
                        value: params.row.sizeCode,
                        disabled: true
                      },
                      style: {
                        width: '70px'
                      }
                    });
                  }
                };
                // 部位
                data.forEach((item) => {
                  let obj = {};
                  v.sizeChartColumns = [];
                  item.sizeDetailBos.forEach((ele, index) => {
                    item['partsName_' + index] = ele.partsName;
                    item['unitName_' + index] = ele.unitName;
                    item['unitValue_' + index] = ele.unitValue;
                    v.editObj['partsName_' + index] = ele.partsName;
                    v.editObj['unitName_' + index] = ele.unitName;
                    v.editObj['unitValue_' + index] = null;
                    if (unitData.productSizeUnitBos.length > 0) {
                      let list = unitData.productSizeUnitBos;
                      let objs = {};
                      let children = [];
                      list.forEach((item) => {
                        if (item.isDefault === 1) {
                          objs = {
                            title: item.name,
                            key: 'unitValue_' + index,
                            align: 'center',
                            render: (h, params) => {
                              let unitValue = Number(params.row['unitValue_' + index]);
                              return h('InputNumber', {
                                props: {
                                  value: unitValue,
                                  min: 0,
                                  disabled: (() => {
                                    return v.isDisabled;
                                  })()
                                },
                                on: {
                                  'on-change': val => {
                                    v.sizeChartdata[params.index]['unitValue_' + index] = val;
                                  }
                                }
                              });
                            }
                          };
                        } else {
                          objs = {
                            title: item.name,
                            key: 'unitValue_' + index,
                            align: 'center',
                            render: (h, params) => {
                              // 英寸转化厘米
                              let unitValue = Number(params.row['unitValue_' + index]);
                              let num = '';
                              if (item.name === 'cm') {
                                if (unitValue > 0) {
                                  num = unitValue * 2.54;
                                  // Math.floor(num * 100) / 100;
                                  num = num.toFixed(2);
                                }
                              } else {
                                // 厘米转化成英寸
                                if (unitValue > 0) {
                                  num = unitValue * 0.393701;
                                  // Math.floor(num * 100) / 100;
                                  num = num.toFixed(2);
                                }
                              }
                              return h('span', num);
                            }
                          };
                        }
                        children.push(objs);
                        obj = {
                          title: ele.partsName,
                          align: 'center',
                          maxWidth: 220,
                          children: children
                        };
                      });
                    }
                    v.sizeChartColumns.push(obj);
                  });
                });
                v.sizeChartColumns.unshift(size, ...fixColumn);
                v.sizeChartdata = data;
              }
            } else {
              v.sizeChartdata = [];
              v.sizeChartColumns = [];
              v.$emit('updateHideSizeChart', false);
            }
          }
        });
      } else {
        if (data) {
          let size = {
            title: 'Tag Size',
            key: 'sizeCode',
            align: 'center',
            render: (h, params) => {
              return h('Input', {
                props: {
                  value: params.row.sizeCode,
                  disabled: v.isDisabled === true ? v.isDisabled : v.talgSize
                },
                style: {
                  width: '70px'
                },
                on: {
                  'on-change' (e) {
                    v.sizeChartdata[params.index]['sizeCode'] = e.target.value;
                  }
                }
              });
            }
          };
          // 部位
          let place = {};
          if (data.productSizePartsBos && data.productSizePartsBos.length > 0) {
            data.productSizePartsBos.map((item, index) => {
              v.templateObj[item.ymsProductSizePartsId + '_partName'] = item.name;
              v.templateObj[item.ymsProductSizePartsId + '_defaultValue'] = null;
              v.templateObj[item.ymsProductSizePartsId + '_value'] = null;
              place = {
                title: item.name,
                align: 'center',
                maxWidth: 220,
                children: v.handlerUnit(data, item.ymsProductSizePartsId)
              };
              v.sizeChartColumns.push(place);
            });
          }
          v.sizeChartColumns.unshift(size, ...fixColumn);
        }
      }
    }
  }
};
</script>

<style lang="less">
.sizeChartTable {
  .ivu-table td, .ivu-table th {
    border-bottom: 1px solid #e8eaec;
    border-left: 1px solid #e8eaec;
  }

  .ivu-table td:last-child, .ivu-table th:last-child {
    border-right: 1px solid #e8eaec;
  }
}
</style>
