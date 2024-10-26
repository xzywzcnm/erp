// 公共方法
import api from '@/api/api';

export default {
  data () {
    return {
      productCommonDictionary: {
        userInfoMap: null,
        productCategoryMap: null,
        goodsImageMap: null
      },
      productTypeList: [
        {
          name: '普货',
          value: '01',
          disabled: true
        }, {
          name: '纯电池',
          value: '02',
          disabled: false
        }, {
          name: '配套电池',
          value: '03',
          disabled: false
        }, {
          name: '液体',
          value: '04',
          disabled: false
        }, {
          name: '药品',
          value: '05',
          disabled: false
        }, {
          name: '粉末',
          value: '06',
          disabled: false
        }, {
          name: '危险品',
          value: '07',
          disabled: false
        }, {
          name: '内置电池',
          value: '08',
          disabled: false
        }, {
          name: '纽扣电池',
          value: '09',
          disabled: false
        }, {
          name: '带磁',
          value: '10',
          disabled: false
        }
      ],
      productTypeListValue: ['01'],
      businessRoleTypeList: []
    };
  },
  methods: {
    checkIdenticalDon (h, params, title, data, key, tableData = []) {
      let v = this;
      if (params.column.checkIdentical === undefined) {
        params.column.checkIdentical = false;
      }
      return h('div', {}, [
        h('p', title), h('Checkbox', {
          style: {
            display: (() => {
              return v.isDisabled ? 'none' : 'inline-block';
            })()
          },
          props: {
            value: params.column.checkIdentical
          },
          on: {
            'on-change': (value) => {
              if (value) {
                data.forEach((i, index) => {
                  v.$nextTick(() => {
                    if (v.typeOf(key) === 'array') {
                      key.forEach(k => {
                        v.$set(data[index], k, data[0][k]);
                      });
                    } else {
                      v.$set(data[index], key, data[0][key]);
                    }
                  });
                });
                tableData.forEach((item, index) => {
                  v.$nextTick(() => {
                    if (v.typeOf(key) === 'array') {
                      key.forEach(k => {
                        v.$set(tableData[index], k, tableData[0][k]);
                      });
                    } else {
                      v.$set(tableData[index], key, tableData[0][key]);
                    }
                  });
                });
              }
            }
          }
        }, '相同')
      ]);
    },
    productTypeChange (value) {
      if (value.length > 1 && value.indexOf('01') > -1) {
        value.forEach((i, j) => {
          if (i === '01') {
            value.splice(j, 1);
          }
        });
      } else if (value.length === 0) {
        this.productTypeListValue = ['01'];
      }
    },
    validateFormSku (rule, value, callback) { // 表单校验
      if (this.validateSku(value)) {
        callback();
      } else {
        callback(new Error('只能包含以下字符 0-9, #, &, +, -, ., /, A-Z, [, ], ^, _, a-z, { }, , ~'));
      }
    },
    validateSku (value) { // 非表单校验 [0-9#&\+\-\.\/A-Z\[\]\^\_a-z\}\{\~ ]
      let spuRegExp = this.$regular.spuRegExp;
      if (spuRegExp.test(value)) {
        return true;
      } else {
        return false;
      }
    },
    getUserInfoMap (userIds) {
      return new Promise(resolve => {
        if (userIds.length > 0) {
          let repeat = {
            repeatVal: 'sku/spu'
          }
          this.axios.post(api.get_userInfoMap, userIds, repeat).then((response) => {
            if (response.data.code === 0) {
              this.productCommonDictionary.userInfoMap = response.data.datas;
            }
          }).finally(() => {
            resolve(true);
          });
        } else {
          resolve(true);
        }
      });
    },
    getProductCategoryMap (productCategoryIds) { // 获取产品分类Map
      let v = this;
      return new Promise(resolve => {
        if (productCategoryIds && productCategoryIds.length > 0) {
          v.axios.post(api.productCategory_queryByProductCategoryIds, productCategoryIds).then(function (response) {
            if (response.data.code === 0) {
              v.productCommonDictionary.productCategoryMap = response.data.datas;
              resolve(true);
            }
          });
        } else {
          resolve(true);
        }
      });
    },
    getGoodsImageMap (productGoodsIds) { // 获取货品图片Map
      let v = this;
      return new Promise(resolve => {
        if (productGoodsIds && productGoodsIds.length > 0) {
          v.axios.post(api.productGoodsImage_queryByProductGoodsIds, productGoodsIds).then(function (response) {
            if (response.data.code === 0) {
              v.productCommonDictionary.goodsImageMap = response.data.datas;
              resolve(true);
            }
          });
        } else {
          resolve(true);
        }
      });
    },
    showSpin (tip) {
      this.$Spin.show({
        render: (h) => {
          return h('div', [
            h('Icon', {
              class: 'ivu-load-loop',
              props: {
                type: 'load-d',
                size: 18
              }
            }), tip ? h('div', tip) : ''
          ]);
        }
      });
    },
    hideSpin () {
      this.$Spin.hide();
    },
    validatePropertyName (currentSkuProperty) { // 验证属性名是否有重复的
      currentSkuProperty.invalid = false;
      let newName = currentSkuProperty.name;
      this.skuPropertyList.forEach((skuProperty, i) => {
        if (currentSkuProperty !== skuProperty && newName === skuProperty.name) {
          currentSkuProperty.invalid = true;
        }
      });
    },
    delSkuPropertyValue (currentSkuProperty, currentPropertyValue, index) { // 删除属性值
      let self = this;
      // if (self.isDisabled) {
      //   return;
      // }
      // 删除属性时，也要移除尺码表对应的数据
      if (self.sizeChartdata.length > 0) {
        self.sizeChartdata.forEach((item, ids) => {
          if (item.sizeCode === currentPropertyValue) {
            self.sizeChartdata.splice(ids, 1);
          }
        });
      }

      // 判断当前规格的有效属性值个数(不包含当前属性值),和当前属性值是否存在有效的sku
      let validOtherPropertyValueCount = 0;
      let currentPropertyValueIsValid = false;

      self.productInfo.productGoodsList.forEach((productGoods, i) => {
        productGoods.productGoodsSpecifications.forEach((productGoodsSpecification, i) => {
          if (currentSkuProperty.values.indexOf(productGoodsSpecification.value) !== -1 && productGoodsSpecification.value !== currentPropertyValue && productGoodsSpecification.name === currentSkuProperty.name) {
            validOtherPropertyValueCount += i + 1;
          }
          if (productGoodsSpecification.name === currentSkuProperty.name && productGoodsSpecification.value === currentPropertyValue) {
            currentPropertyValueIsValid = true;
          }
        });
      });

      currentSkuProperty.values.splice(index, 1);
      /* if (currentSkuProperty.values.length === 0) {
        self.tagInputValueChange(index);
      } */
      // 如果当前的值是无效的属性直接返回
      if (!currentPropertyValueIsValid) {
        return;
      }
      // 筛选有效的sku
      let filterResult = self.productInfo.productGoodsList.filter((productGoods, i) => {
        let productGoodsSpecificationIndex = -1; // 当前属性值的下标
        productGoods.productGoodsSpecifications.forEach((productGoodsSpecification, i) => {
          if (productGoodsSpecification.name === currentSkuProperty.name && productGoodsSpecification.value === currentPropertyValue) {
            productGoodsSpecificationIndex = i;
          }
        });
        if (productGoodsSpecificationIndex === -1) {
          return true;
        } else if (validOtherPropertyValueCount > 0) {
          return false;
        }

        productGoods.productGoodsSpecifications.splice(productGoodsSpecificationIndex, 1, {});
        if (this.$common.isEmpty(productGoods.productGoodsSpecifications, true)) {
          return false;
        }

        return true;
      });

      if (filterResult.length !== 0) {
        self.productInfo.productGoodsList = self.deepCopy(filterResult);
      } else if (self.skuData.length !== 0) { // 如果筛选出有效的sku数量等于0,那么把最后一个货品做为商品的值
        self.productInfo.productGoodsList = [self.deepCopy(self.skuData[0])];
        self.productInfo.productGoodsList[0].productGoodsSpecifications = [];
      }
      // 存放两种属性所选择的属性值
      let valueList = []
      // 存放表格数据中的属性值
      let tableValueList = []
      // 存放经过删除后同时表格不存在的属性值
      let deleteValue = ''
      for (let i in self.skuPropertyList) {
        valueList = [...valueList, ...self.skuPropertyList[i].values]
      }

      for (let i in filterResult) {
        for (let j in filterResult[i].productGoodsSpecifications) {
          tableValueList.push(filterResult[i].productGoodsSpecifications[j].value || [])
        }
      }
      for (let i in valueList) {
        if (tableValueList.indexOf(valueList[i]) === -1) {
          deleteValue = valueList[i]
        }
      }
      for (let i in self.skuPropertyList) {
        for (let j in self.skuPropertyList[i].values) {
          if (self.skuPropertyList[i].values[j] == deleteValue) {
            self.skuPropertyList[i].values.splice(j, 1)
          }
        }
      }
      self.productInfo.productGoodsList = this.$common.copy(filterResult);
      self.skuData = filterResult;
      // self.reloadSkuColumn();
    },
    /* tagInputValueChange (index) { // 标签输入框值变动重新计算宽度
      let tagInputDom = document.getElementById('tagInput' + index);
      let customTagInputDom = document.getElementById('customTagInput');
      if (customTagInputDom.clientWidth - tagInputDom.offsetLeft < 50) {
        tagInputDom.style.width = customTagInputDom.clientWidth + 'px';
      } else {
        tagInputDom.style.width = customTagInputDom.clientWidth - tagInputDom.offsetLeft + 'px';
      }
      tagInputDom.style.width = '100px';
    }, */
    addSkuPropertyValue (skuProperty, index, type) { // 新增属性值
      let self = this;
      // let input = self.$refs[skuProperty.name][0].$refs.input;
      let input = '';
      if (type == 1) {
        input = self.$refs[skuProperty.name].$refs.input;
      } else if (type == 2) {
        input = self.$refs[skuProperty.name].values[0];
      } else if (type == 3) {
        input = self.$refs[skuProperty.name].selected[1]
        self.productInfo.sizeGroupNo = self.$refs[skuProperty.name].selected[0].value == 'arr1' ? 1 : 2;
      }

      let values = skuProperty.values;
      let value = input.value === null ? '' : this.trim(input.value);

      if (value !== '' && values.indexOf(value) === -1) {
        // let tagInputDom = document.getElementById('tagInput' + index);
        // tagInputDom.style.width = '150px';
        values.push(input.value);
        (function (sp, spv, i) {
          self.$nextTick(function () {
            self.reloadSkuData(sp, spv, i);
            // self.reloadSkuColumn();
          });
        })(skuProperty, value, index);
        input.value = '';
      } else {
        input.value = '';
      }
      // 添加尺码的属性的时候
      if (self.$store.state.erpConfig.merchant.isSupplier && (self.classifyTalg === 'edit' || self.classifyTalg === 'change')) {
        self.handlerSizeData(skuProperty);
      }
      // 隐藏输入框
      this.$nextTick(() => {
        skuProperty.isEdit = true;
      })
    },
    // 重新渲染表格
    reloadSkuData (currentSkuProperty, currentPropertyValue, tagIndex) {
      // const valIndex = (currentSkuProperty.values.indexOf(currentPropertyValue) + 1) * tagIndex;
      this.$nextTick(() => {
        let goodsObj = {};
        let colorSizeObj = {};
        let tableList = [];
        let defualtList = this.deepCopy(this.productInfo.productGoodsList || []);
        defualtList.forEach(productGoods => {
          const sizeKey = (productGoods.productGoodsSpecifications || []).map(m => {
            return `${m.name}${m.value}`;
          }).join('');
          this.$set(colorSizeObj, sizeKey, this.$common.copy(productGoods));
        })
        if (!this.$common.isEmpty(this.productInfoPrototype) && !this.$common.isEmpty(this.productInfoPrototype.productGoodsList)) {
          goodsObj = this.deepCopy(this.productInfoPrototype.productGoodsList[0] || {});
        }
        const skuPropertyList = (this.$common.isEmpty(this.skuPropertyList) ? [] : this.skuPropertyList);
        // 使用 笛卡尔乘积 方法获取多少行
        const tableRows = this.cartesianProduct(skuPropertyList.map(m => {
          const arr = (this.$common.isEmpty(m.values) ? [''] : m.values).map((val) => {
            return {
              name: m.name || '',
              value: val || '',
            }
          });
          return arr;
        }));

        tableRows.forEach((row) => {
          let colorSize = '';
          if (this.$common.isArray(row)) {
            colorSize = row.map(m => {
              return `${m.name}${m.value}`
            }).join('');
          } else {
            colorSize = `${row.name}${row.value}`;
          }
          // 判断是否原来数据中存在对应的属性
          if (!this.$common.isEmpty(colorSizeObj[colorSize])) {
            const newRow = (colorSizeObj[colorSize].productGoodsSpecifications || row);
            tableList.push({
              ...colorSizeObj[colorSize],
              productGoodsSpecifications: this.$common.isArray(newRow) ? newRow : [newRow]
            })
          } else {
            // 不存在的属性增加信息(需要判断是否匹配当前尺码组和颜色属性)
            const isHidden = (this.$common.isArray(row) ? row : [row || {}]).find(item => {
              if (item.name == 'Color' && !this.isOldData) {
                return !this.getColorAll.includes(item.value);
              } else if (item.name == 'Size' && !this.isOldData) {
                return !this.getSizeVal.includes(item.value);
              }
              return false;
            })
            this.$common.isEmpty(isHidden) && tableList.push({
              ...goodsObj,
              productGoodsSpecifications: this.$common.isArray(row) ? row : [row]
            })
          }
        });
        // 新增的属性信息将不匹配尺码组和颜色属性的数据过滤掉
        // const newTableData = this.filterSkuData(tableList);
        this.productInfo.productGoodsList = tableList;
        this.skuData = this.deepCopy(tableList);
      })
    },
    // 笛卡尔乘积 用法： cartesianProduct([['1','2'],['a','b'],['c','d','e']]);
    cartesianProduct(arr) {
      if (this.$common.isEmpty(arr) || arr.length < 2) return this.$common.isEmpty(arr[0]) ? [] : arr[0];
      return [].reduce.call(arr, (col, set) => {
        let res = [];
        col.forEach(item => {
          set.forEach(sInt => {
            let add = [].concat(this.$common.isArray(item) ? item : [item]);
            add.push(sInt);
            res.push(add);
          })
        });
        return res;
      })
    },
    // 重新渲染表格（目前弃用）
    reloadSkuData1 (currentSkuProperty, currentPropertyValue, index) {
      let self = this;
      let newSkuData = [];
      let copyCurrentSkuPropertyValues = self.deepCopy(currentSkuProperty.values);

      currentSkuProperty.values = [currentPropertyValue];
      for (let i = 0; i < self.skuPropertyList.length; i++) {
        let skuProperty = self.skuPropertyList[i];
        if (skuProperty.values.length !== 0) {
          skuProperty.values.forEach((value, i1) => {
            let newSku = {};
            if (i1 === 0 && self.productInfo.productGoodsList.length === 0) {
              newSku = self.deepCopy(self.productInfo.productGoodsList[0]);
              newSku.sku = self.productInfo.spu;
            } else {
              newSku = self.deepCopy(self.productInfoPrototype.productGoodsList[0]);
            }
            newSku.productGoodsSpecifications = [
              {
                name: skuProperty.name,
                value: value
              }
            ];
            newSkuData.push(newSku);
          });
          self.skuPropertyCartesian(newSkuData, self.skuPropertyList[i + 1], i + 1);
          // self.productInfo.productGoodsList = self.productInfo.productGoodsList.concat(newSkuData);
          self.productInfo.productGoodsList = newSkuData;
          self.skuData = self.deepCopy(self.productInfo.productGoodsList);

          currentSkuProperty.values = copyCurrentSkuPropertyValues;
          break;
        }
      }
    },
    skuPropertyCartesian (newSkuData, nextSkuProperty, index) { // 计算sku属性笛卡尔(两个数组乘积后和下个数组乘积)（目前弃用）
      let self = this;
      if (index < self.skuPropertyList.length) {
        let tempSkuData = [];
        newSkuData.forEach((newSku, i1) => {
          if (nextSkuProperty.values.length > 0) {
            let copyNewSku = self.deepCopy(newSku);
            nextSkuProperty.values.forEach((value, i2) => {
              let tempSku = null;
              if (i2 === 0) {
                tempSku = newSku;
              } else {
                tempSku = self.deepCopy(copyNewSku);
                tempSkuData.push(tempSku);
              }
              tempSku.productGoodsSpecifications.push({
                name: nextSkuProperty.name,
                value: value
              });
            });
          }
        });
        tempSkuData.forEach((tempSku, i1) => {
          newSkuData.push(tempSku);
        });
        this.skuPropertyCartesian(newSkuData, this.skuPropertyList[index + 1], index + 1);
      }
    },
    addSkuProperty () { // 新增SKU属性
      this.skuPropertyList.push({
        invalid: false,
        name: '',
        selected: true,
        values: []
      });
    },
    trim (string) {
      if (string) {
        string = string.replace(/(^\s*)|(\s*$)/g, '');
      }
      return string;
    },
    delSkuProperty (currentSkuProperty, index) { // 删除SKU属性
      let self = this;
      for (let i = currentSkuProperty.values.length - 1; i >= 0; i--) {
        let value = currentSkuProperty.values[i];
        self.delSkuPropertyValue(currentSkuProperty, value, i);
      }
      self.skuPropertyList.splice(index, 1);
    }, // addCustomTag (ref) { // 添加自定义标签
    //   let productGoodsTagsSelectInput = this.$refs[ref].$refs.input;
    //   let value = productGoodsTagsSelectInput.value === null ? '' : this.trim(productGoodsTagsSelectInput.value);
    //   if (value !== '' && value.length <= 50 && this.customProductTagList.indexOf(value) === -1) {
    //     this.customProductTagList.push(value);
    //     this.$refs[ref].model.push(value);
    //     this.$refs[ref].setQuery('');
    //   } else {
    //     v.$Message.error('新增标签长度不能超过50且不能与已存在标签重复');
    //     this.$refs[ref].setQuery('');
    //     productGoodsTagsSelectInput.value = '';
    //   }
    // },
    reloadSkuColumn () { // 重新生成表头
      let self = this;
      if (self.skuData.length > 0) {
        let leftSkuColumns = self.skuColumns.slice(0, 1); // 属性左边列定义
        let centerSkuColumns = []; // 属性列定义
        let rightSkuColumns = []; // 属性右边列定义
        let changed = false; // 属性列定义是否有变更
        for (let i = 0; i < self.skuColumns.length; i++) {
          if (self.skuColumns[i].key === 'sku') {
            rightSkuColumns = self.skuColumns.slice(i, self.skuColumns.length);
            let productGoodsSpecifications = self.skuData[0].productGoodsSpecifications;
            if (productGoodsSpecifications && productGoodsSpecifications.length !== self.skuColumns.slice(1, i)) {
              changed = true;
            }
            break;
          }
        }
        if (changed) {
          for (let i = self.productInfo.productGoodsList[0].productGoodsSpecifications.length - 1; i >= 0; i--) {
            let productGoodsSpecification = self.productInfo.productGoodsList[0].productGoodsSpecifications[i];

            rightSkuColumns.unshift({
              title: productGoodsSpecification.name,
              key: 'multiAttribute' + i,
              width: 80,
              align: 'center',
              renderHeader: (h, params) => {
                return h('div', {
                  class: 'required'
                }, params.column.title);
              },
              render: (h, params) => {
                let productGoodsSpecifications = self.productInfo.productGoodsList[params.index].productGoodsSpecifications;
                return h('div', [
                  h('Input', {
                    props: {
                      value: productGoodsSpecifications ? productGoodsSpecifications[i].value : '',
                      maxlength: 100,
                      placeholder: '请输入' + productGoodsSpecification.name,
                      disabled: true
                    },
                    on: {
                      'input': (val) => {
                        productGoodsSpecifications[i].value = self.trim(val);
                      }
                    }
                  }), (productGoodsSpecifications && !productGoodsSpecifications[i].value) ? h('div', {
                    style: {
                      color: 'red',
                      margin: '5px 0',
                      textAlign: 'center'
                    }
                  }, productGoodsSpecification.name + '不能为空') : ''
                ]);
              }
            });
          }
          // 如果供应商商户，sku列表要屏蔽一些字段
          if (self.isSupplierTalg) {
            let data = leftSkuColumns.concat(centerSkuColumns).concat(rightSkuColumns);
            let supplierArr = [
              {
                title: '样品价格',
                key: 'samplePrice',
                minWidth: 100,
                align: 'center',
                renderHeader: (h, params) => {
                  return self.checkIdenticalDon(h, params, '样品价格', self.productInfo.productGoodsList, 'samplePrice');
                },
                render: (h, params) => {
                  return h('InputNumber', {
                    props: {
                      min: 0,
                      value: self.productInfo.productGoodsList[params.index].samplePrice || 0,
                      disabled: (() => {
                        return self.isDisabled;
                      })()
                    },
                    style: {
                      width: '80px'
                    },
                    on: {
                      'input': (val) => {
                        self.productInfo.productGoodsList[params.index].samplePrice = val;
                      }
                    }
                  });
                }
              },
              {
                title: '样品运费',
                key: 'sampleFreight',
                minWidth: 100,
                align: 'center',
                renderHeader: (h, params) => {
                  return self.checkIdenticalDon(h, params, '样品运费', self.productInfo.productGoodsList, 'sampleFreight');
                },
                render: (h, params) => {
                  return h('InputNumber', {
                    props: {
                      min: 0,
                      value: self.productInfo.productGoodsList[params.index].sampleFreight || 0,
                      disabled: (() => {
                        return self.isDisabled;
                      })()
                    },
                    style: {
                      width: '80px'
                    },
                    on: {
                      'input': (val) => {
                        self.productInfo.productGoodsList[params.index].sampleFreight = val;
                      }
                    }
                  });
                }
              }
            ];
            let colums = [];
            // 屏蔽的字段对应的key值
            let arr = ['upc', 'ean', 'isbn', 'tagName', 'status', 'assemble', 'productType'];
            if (data) {
              data.map((item, index) => {
                if (!(arr.includes(item.key))) {
                  colums.push(item);
                }
                if (item.key === 'samplePrice' || item.key === 'sampleFreight') {
                  supplierArr = [];
                }
              });
              colums.push(...supplierArr);
              self.skuColumns = colums;
              this.pw(this.skuColumns.length - 4, 'skuColumns');
            }
          } else {
            this.skuColumns = leftSkuColumns.concat(centerSkuColumns).concat(rightSkuColumns);
            this.pw(this.skuColumns.length - 4, 'skuColumns');
          }
        }
      }
    }, // 获取商品开发人员的数据
    getCommodityDeveloper () {
      let v = this;
      // commodityDeveloper（即商品开发员）
      v.axios.get(api.productServiceCommon + api.get_queryByBusinessRoleType + 'commodityDeveloper').then((res) => {
        if (res.data.code === 0) {
          v.businessRoleTypeList = res.data.datas;
        }
      });
    }
  },
  mounted () {

  }
};
