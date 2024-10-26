<template>
  <!-- v-on="$listeners" -->
  <div class="logistics-mode-treeselect">
    <erpTreeSelect
      :ref="random"
      v-bind="selectConfig"
      v-model="erpTreeSelectVal"
      :options="shippingMethodData"
      :load-options="loadTreeOptions"
      :normalizer="treeNormalizer"
      @input="treeChange"
      @open="openOption"
      @close="closeOption"
      :alwaysOpen="isOpenOption"
    >
      <!-- 不带参数插槽 -->
      <template v-for="slot in slots.keys" :slot="slot">
        <slot :name="slot" />
      </template>
      <!-- 带参数插槽 -->
      <template v-for="scopedSlots in scopedSlots.keys" :slot="scopedSlots" slot-scope="scope">
        <slot :name="scopedSlots" v-bind="scope" />
      </template>
    </erpTreeSelect>
  </div>
</template>
<script>
// https://vue-treeselect.js.org/#events vue-treeselect文档
import api from '@/api/api';
import { LOAD_CHILDREN_OPTIONS } from '@riophae/vue-treeselect';
// 当前业务组件只是用于物流方式选择
export default {
  name: 'logisticsModeTree',
  components: {},
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    // 是否一次性加载所有子级
    loadingChildren: { type: Boolean, default: false },
    // 绑定值
    value: { type: Array | String | Number },
    // 仓库ID
    warehouseId: { type: String },
    // 仓库类型
    warehouseType: { type: Number | String },
    // 当存在仓库ID时，是否获取仓库类型的数据
    isType: { type: Boolean, default: true },
    // 是否获取所有存在物流方式的物流商(包含停用和启用)
    allLogisticsMode: { type: Boolean, default: false },
    // 是否获取所有物流商(包含停用和启用，包含无物流方式的物流商)
    allChannel: { type: Boolean, default: false },
    // 是否默认加载数据
    autoLoading: { type: Boolean, default: false },
    // 默认加载所有数据时过滤数据
    allLoadedDataFilterTreedData: { type: Function },
  },
  data() {
    return {
      random: `ref-${Number((Math.random()).toString().substring(2)).toString(32)}-${(new Date().getTime()).toString(32)}`,
      treeJson: {},
      treeInstanceId: '',
      isOpenOption: false,
      isValChange: false,
      isLoading: false,
      allWarehouseData: [],
      warehouseJson: {},
      oldPropStrVal: '',
      newPropStrVal: '',
      defaultConfig: {
        multiple: true,
        'append-to-body': true,
        'default-expand-level': 0,
        noResultsText: '无匹配数据',
        placeholder: '请选择',
        retryText: '重试？',
        retryTitle: '重试',
        noOptionsText: '暂无选项',
        limit: 1,
        clearable: true,
        // searchable: true,
        // 'open-on-focus': true,
        // 'open-on-click': true,
        zIndex: 99999999999,
        // valueConsistsOf: 'ALL',
        sortValueBy: 'LEVEL', // 选项级别
      },
      erpTreeSelectVal: null,
      treeOptionJson: {},
      shippingMethodData: [],
    }
  },
  watch: {
    value: {
      deep: true,
      immediate: true,
      handler(val, oldVal) {
        let newVal = val;
        let isMultiple = this.defaultConfig.multiple;
        if (!this.$common.isEmpty(this.$attrs.multiple)) {
          isMultiple = this.$common.isBoolean(this.$attrs.multiple) ? this.$attrs.multiple : true;
        }
        if (isMultiple) {
          if (!this.$common.isArray(newVal)) {
            newVal = this.$common.isEmpty(newVal) ? [] : [val];
          }
        } else {
          if (this.$common.isArray(newVal)) {
            this.erpTreeSelectVal = null;
            return console.error('单选情况，绑定值不能为数组');
          }
          if (this.$common.isEmpty(newVal)) {
            newVal = null;
          }
        }
        if (JSON.stringify(newVal) == JSON.stringify(oldVal)) return;
        this.erpTreeSelectVal = newVal;
      }
    },
    propStrVal: {
      deep: true,
      immediate: true,
      handler(val) {
        if (!this.autoLoading) return;
        // 自动加载数据
        this.$nextTick(() => {
          this.oldPropStrVal = val;
          this.newPropStrVal = val;
          this.isLoading = true;
          this.$emit('loadingData');
          this.getAllWarehouseData().then(() => {
            // 一次性获取所有子级时
            if (this.loadingChildren) {
              this.getAllData().finally(() => {
                this.isLoading = false;
                this.setOrRemoveLoading(this.treeInstanceId || '', this.isLoading);
                this.$emit('loadingCompleted', this.shippingMethodData);
              });
              return;
            }
            // 只获取父级时
            this.getShippingList().finally(() => {
              this.isLoading = false;
              this.setOrRemoveLoading(this.treeInstanceId || '', this.isLoading);
              this.$emit('loadingCompleted', this.shippingMethodData);
            });
          }).catch((err) => {
            console.error(err);
            this.isLoading = false;
            this.setOrRemoveLoading(this.treeInstanceId || '', this.isLoading);
            this.$emit('loadingCompleted', this.shippingMethodData);
          });
        })
      }
    }
  },
  computed: {
    slots () {
      return {
        keys: Object.keys(this.$slots),
        value: Object.values(this.$slots)
      }
    },
    scopedSlots () {
      return {
        keys: Object.keys(this.$scopedSlots),
        value: Object.values(this.$scopedSlots)
      }
    },
    selectConfig() {
      let isMultiple = this.defaultConfig.multiple;
      if (!this.$common.isEmpty(this.$attrs.multiple)) {
        isMultiple = this.$common.isBoolean(this.$attrs.multiple) ? this.$attrs.multiple : true;
      }
      const config = { ...this.defaultConfig, ...this.$attrs, multiple: isMultiple };
      // if (config.disabled) config.placeholder = '';
      return config;
    },
    // 是否多选
    isMultiple () {
      return this.selectConfig.multiple;
    },
    // 客户编号
    merchantId () {
      if (this.$common.isEmpty(this.$store.state.erpConfig) || this.$common.isEmpty(this.$store.state.erpConfig.userInfo)) return '';
      return this.$store.state.erpConfig.userInfo.merchantId || '';
    },
    // 参数是否改变
    propStrVal () {
      const warehouseId = this.warehouseId || 'warehouseId';
      const warehouseType = this.$common.isEmpty(this.warehouseType) ? 'warehouseType' : this.warehouseType;
      return `${this.random}-${warehouseId}-${this.loadingChildren}-${warehouseType}-${this.allLogisticsMode}-${this.allChannel}-${this.isType}`;
    },
  },
  created() {},
  // 组件销毁时，移除监听事件
  beforeDestroy () {
    // document.removeEventListener('click', this.clickModuleOut);
  },
  mounted () {
    // document.addEventListener('click', this.clickModuleOut);
  },
  methods: {
    // 处理树节点
    treeNormalizer (node) {
      return {
        id: node.value,
        label: node.label,
        children: node.children
      }
    },
    // 获取有数据处理
    getAllData () {
      return new Promise((resolve) => {
        this.shippingMethodData = [];
        // 默认只获取启用的物流商
        let awaitRes = [this.getParentAndChild];
        if (this.allLogisticsMode || this.allChannel) {
          awaitRes.push(() => {
            // 获取停用的物流商
            return this.getParentAndChild(0);
          });
        }
        this.$common.promiseAll(awaitRes).then((arrRes) => {
          let newTreeData = [];
          let newRes = this.$common.flat(this.$common.copy(arrRes) || []);
          this.$set(this.treeJson, 'LOAD_CHILDREN_OPTIONS', []);
          newRes.forEach((part) => {
            if (!this.$common.isEmpty(part.carrierShippingMethods)) {
              part.value = part.carrierId;
              part.label = part.carrierName;
              part.labelPath = part.carrierName;
              (part.carrierShippingMethods || []).forEach(child => {
                child.value = child.shippingMethodId;
                child.label = child.carrierShippingMethodName;
                child.parentMerchantId = part.carrierId;
                child.labelPath = `${part.carrierName}/${child.carrierShippingMethodName}`;
                child.carrierAccounts = part.carrierAccounts;
                this.$set(this.treeJson, child.shippingMethodId, child);
              });
              part.children = this.$common.isEmpty(part.carrierShippingMethods) ? null : part.carrierShippingMethods;
              this.treeJson.LOAD_CHILDREN_OPTIONS.push(part.carrierId);
              this.$set(this.treeJson, part.carrierId, part);
              newTreeData.push(part);
            }
          });
          this.shippingMethodData = newTreeData;
          resolve(this.shippingMethodData);
        }).catch(() => {
          resolve([]);
        });
      })
    },
    // 获取所有数据
    getParentAndChild (status = 1) {
      return new Promise((resolve) => {
        let queryPar = {
          merchantId: this.merchantId,
          isFilter: !this.allChannel,
          status: status,
          more: true
        };
        if (!this.$common.isEmpty(this.warehouseType)) {
          queryPar.warehouseType = this.warehouseType;
        }
        let warehouseInfo = {};
        if (!this.$common.isEmpty(this.warehouseId)) {
          queryPar.warehouseId = this.warehouseId;
          warehouseInfo = this.allWarehouseData.find(f => f.warehouseId == this.warehouseId);
          if (!this.$common.isEmpty(warehouseInfo) && this.isType) {
            queryPar.warehouseType = warehouseInfo.warehouseType;
          }
        }
        this.axios.post(api.queryLogisticsChannel, queryPar, { hiddenError: true }).then((res) => {
          if (!res || !res.data || res.data.code != 0) return resolve([]);
          // 过滤数据
          if (this.$common.isFunction(this.allLoadedDataFilterTreedData)) {
            this.allLoadedDataFilterTreedData(res.data.datas, (newRes) => {
              resolve(newRes);
            });
          } else {
            resolve(res.data.datas);
          }
        }).catch(() => {
          resolve([]);
        })
      });
    },
    // 获取所有的仓库列表
    getAllWarehouseData () {
      return new Promise((resolve) => {
        this.$store.dispatch('getAllstore').then((list) => {
          this.allWarehouseData = list || [];
          list.forEach(item => {
            this.$set(this.warehouseJson, item.warehouseId, item);
          });
          resolve(list);
        }).catch(err => {
          console.error(err);
          resolve([]);
        })
      })
    },
    // 获取父级
    getShippingList () {
      return new Promise((resolve) => {
        let queryPar = {
          isFilter: !this.allChannel,
          time: (new Date().getTime()).toString(32)
        };
        this.shippingMethodData = [];
        let warehouseInfo = {};
        if (!this.$common.isEmpty(this.warehouseType)) {
          queryPar.warehouseType = this.warehouseType;
        }
        if (!this.$common.isEmpty(this.warehouseId)) {
          queryPar.warehouseId = this.warehouseId;
          warehouseInfo = this.allWarehouseData.find(f => f.warehouseId == this.warehouseId);
          if (!this.$common.isEmpty(warehouseInfo) && this.isType) {
            queryPar.warehouseType = warehouseInfo.warehouseType;
          }
        }
        this.allWarehouseData.find(f => f.warehouseId == this.warehouseId)
        this.treeJson = {};
        this.$set(this.treeJson, 'LOAD_CHILDREN_OPTIONS', []);
        this.axios.get(`${api.erpServiceCommon}${api.get_enableCarriersApi}`, {
          params: queryPar,
          hiddenError: true
        }).then(response => {
          if (!response || !response.data || response.data.code != 0) return resolve([]);
          let newData = {};
          this.shippingMethodData = (response.data.datas || []).map(k => {
            newData = {
              ...k,
              value: k.carrierId,
              label: k.carrierName,
              labelPath: k.carrierName,
              children: null,
            }
            this.$set(this.treeJson, k.carrierId, newData);
            return newData;
          });
          return resolve(this.shippingMethodData);
        }).catch(() => {
          resolve([]);
        });
      })
    },
    // 展开父级加载子级
    loadTreeOptions ({ action, parentNode, callback, checked, loaded }) {
      if (action === LOAD_CHILDREN_OPTIONS || action === 'LOAD_CHILDREN_OPTIONS') {
        let queryPar = {
          carrierId: parentNode.value,
        };
        if (!this.$common.isEmpty(this.warehouseId)) {
          queryPar.warehouseId = this.warehouseId;
        }
        if (!this.$common.isEmpty(parentNode.children)) {
          return callback();
        }
        this.axios.get(`${api.erpServiceCommon}${api.get_enableShippingMethodsApi}`, {
          params: queryPar,
          hiddenError: true
        }).then(response => {
          if (response && response.data && response.data.code === 0) {
            const newChild = (response.data.datas || []).map(item => {
              const newItem = {
                ...item,
                value: item.shippingMethodId,
                label: item.carrierShippingMethodName,
                parentMerchantId: parentNode.value,
                labelPath: `${parentNode.labelPath}/${item.carrierShippingMethodName}`,
                carrierAccounts: parentNode.carrierAccounts
              }
              this.$set(this.treeJson, item.shippingMethodId, newItem);
              return newItem;
            });
            this.treeJson.LOAD_CHILDREN_OPTIONS.push(parentNode.value);
            callback();
            if (!this.$common.isEmpty(newChild)) {
              parentNode.children = newChild;
            }
            checked && checked(parentNode, newChild);
            loaded && loaded(newChild);
          } else {
            loaded && loaded(null);
            callback(new Error('加载失败'));
          }
        }).catch((err) => {
          console.error(err);
          loaded && loaded(null);
          callback(new Error('加载失败'));
        });
      }
    },
    // 选中值改变
    treeChange (treeVal) {
      let val = treeVal;
      if (!this.$common.isEmpty(treeVal) && !this.isMultiple) {
        this.isOpenOption = false; // 单选时，关闭下拉选项
      }
      if (this.isMultiple) {
        this.isValChange = true;
        setTimeout(() => {
          this.isValChange = false;
        }, 300)
      }
      if (!this.$common.isArray(treeVal)) {
        val = this.$common.isEmpty(treeVal) ? [] : [treeVal];
      }
      if (this.$common.isEmpty(val)) {
        this.$emit('change', (this.isMultiple ? val : null));
        this.$emit('on-change', {
          carrierId: (this.isMultiple ? [] : null),
          shippingMethodId: (this.isMultiple ? [] : null),
          choseNode: (this.isMultiple ? [] : null),
          parentNode: (this.isMultiple ? [] : null),
          titlePath: (this.isMultiple ? [] : null)
        });
        return;
      }
      let getVal = [];
      val.forEach(item => {
        if (this.treeJson[item]) {
          getVal.push(() => {
            return new Promise(resolve => {
              if (this.treeJson[item].parentMerchantId) {
                resolve(this.treeJson[item]);
              } else {
                if (!this.treeJson.LOAD_CHILDREN_OPTIONS.includes(this.treeJson[item].value)) {
                  this.loadTreeOptions({
                    action: 'LOAD_CHILDREN_OPTIONS',
                    parentNode: this.treeJson[item],
                    callback: (err) => {
                      if (this.$common.isEmpty(err)) return;
                      resolve(this.treeJson[item]);
                    },
                    checked: (parentNode, children) => {
                      resolve(parentNode);
                    },
                    loaded: (children) => {
                      this.shippingMethodData.forEach((pNode, index) => {
                        if (pNode.value == item) {
                          this.$set(this.shippingMethodData[index], 'children', children);
                          this.$set(this.treeJson[item], 'children', children);
                        }
                      });
                    }
                  });
                } else {
                  resolve(this.treeJson[item]);
                }
              }
            })
          });
        }
      });
      // 调用变更
      this.$common.promiseAll(getVal).then((res) => {
        let carrierId = [];
        let shippingMethodId = [];
        let choseNode = [];
        let choseParent = {};
        let titlePath = [];
        res.forEach(item => {
          if (item.parentMerchantId) {
            if (!this.$common.isEmpty(this.treeJson[item.parentMerchantId]) && !carrierId.includes(this.treeJson[item.parentMerchantId].value)) {
              carrierId.push(this.treeJson[item.parentMerchantId].value);
              if (this.$common.isUndefined(choseParent[this.treeJson[item.parentMerchantId].value])) {
                choseParent[this.treeJson[item.parentMerchantId].value] = [this.treeJson[item.parentMerchantId]];
              } else {
                choseParent[this.treeJson[item.parentMerchantId].value].push(this.treeJson[item.parentMerchantId]);
              }
            }
            if (!shippingMethodId.includes(item.value)) {
              shippingMethodId.push(item.value);
              choseNode.push(item);
              titlePath.push(item.labelPath);
            }
          } else {
            if (!carrierId.includes(item.value)) {
              carrierId.push(item.value);
              if (this.$common.isUndefined(choseParent[item.value])) {
                choseParent[item.value] = [item];
              } else {
                choseParent[item.value].push(item);
              }
            }
            if (item.children) {
              item.children.forEach(child => {
                if (!this.$common.isEmpty(child) && !shippingMethodId.includes(child.value)) {
                  shippingMethodId.push(child.value);
                  choseNode.push(child);
                  titlePath.push(child.labelPath);
                }
              })
            }
          }
        });

        this.$emit('change', (this.isMultiple ? val : val.join(',')));
        const isChosePrant = !this.isMultiple && carrierId.includes(val.join(','));
        let parentNode = [];
        if (this.isMultiple) {
          carrierId.forEach(id => {
            parentNode.push(choseParent[id] || []);
          });
        } else {
          parentNode.push(choseParent[carrierId[0]] || []);
        }
        parentNode = this.$common.flat(parentNode);
        this.$emit('on-change', {
          carrierId: (this.isMultiple ? carrierId : carrierId[0]),
          shippingMethodId: (this.isMultiple ? shippingMethodId : isChosePrant ? null : val.join(',')),
          choseNode: (this.isMultiple ? choseNode : isChosePrant ? this.treeJson[val] : choseNode[0]),
          parentNode: (this.isMultiple ? parentNode : parentNode[0]),
          titlePath: (this.isMultiple ? titlePath : isChosePrant ? this.treeJson[val].labelPath : titlePath[0])
        });
      });
    },
    // 获取所有名称
    getAllLbaelName (data = [], labelList = []) {
      let newList = labelList;
      data.forEach(item => {
        !this.$common.isEmpty(item.label) && newList.push((item.label).toString());
        if (!this.$common.isEmpty(item.children)) {
          this.getAllLbaelName(item.children, newList);
        }
      });
      return newList;
    },
    // 获取下拉弹窗的容器
    getSelectOptionContainer (instanceId) {
      let optionDemo = document.querySelector(`[data-instance-id="${instanceId}"]`);
      if (!optionDemo) {
        optionDemo = this.$refs[this.random] ? this.$refs[this.random].$el : null;
      }
      if (!optionDemo) return null;
      const container = optionDemo.querySelector('.vue-treeselect__menu-container');
      if (!container) return null;
      return container;
    },
    // 测量一段文本的宽度
    getTextWidth (text, font) {
      if (this.$common.isEmpty(text)) return 0;
      // 创建一个canvas元素用于测量文本
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      // 设置文本的样式，与你页面上字体样式一致
      context.font = font || '14px Arial';
      // 测量文本
      const metrics = context.measureText(text);
      return metrics.width;
    },
    // 下拉弹窗打开时
    openOption (instanceId) {
      document.addEventListener('click', this.clickModuleOut); // 下拉展开时添加监听
      this.newPropStrVal = this.propStrVal;
      this.isOpenOption = true;
      this.treeInstanceId = instanceId;
      if (!this.$common.isEmpty(this.oldPropStrVal) && this.oldPropStrVal == this.newPropStrVal) {
        this.setSelectDomeWidth(instanceId);
        this.setOrRemoveLoading(instanceId, this.isLoading);
        return;
      }
      this.oldPropStrVal = this.newPropStrVal;
      this.isLoading = true;
      this.$emit('loadingData');
      this.setOrRemoveLoading(instanceId, this.isLoading);
      this.getAllWarehouseData().then(() => {
        // 一次性获取所有子级时
        if (this.loadingChildren) {
          this.getAllData().finally(() => {
            this.isLoading = false;
            this.setOrRemoveLoading(instanceId, this.isLoading);
            this.setSelectDomeWidth(instanceId);
            this.$emit('loadingCompleted', this.shippingMethodData);
          });
          return;
        }
        // 只获取父级时
        this.getShippingList().finally(() => {
          this.isLoading = false;
          this.setOrRemoveLoading(instanceId, this.isLoading);
          this.setSelectDomeWidth(instanceId);
          this.$emit('loadingCompleted', this.shippingMethodData);
        });
      }).catch((err) => {
        console.error(err);
        this.isLoading = false;
        this.setOrRemoveLoading(instanceId, this.isLoading);
        this.setSelectDomeWidth(instanceId);
        this.$emit('loadingCompleted', this.shippingMethodData);
      });
    },
    // 根据下拉内容动态设置下拉宽度
    setSelectDomeWidth (instanceId) {
      const container = this.getSelectOptionContainer(instanceId);
      if (!container) return;
      this.$nextTick(() => {
        let fontSize = '14px';
        let label = container.querySelector('.vue-treeselect__menu');
        if (label) {
          label = label.querySelector('.vue-treeselect__label');
        }
        if (label) {
          const getStyle = window.getComputedStyle(label);
          if (getStyle) {
            fontSize = getStyle.fontSize || '14px';
          }
        }
        const allLabelTxt = this.getAllLbaelName(this.shippingMethodData).map(m => {
          return this.getTextWidth(m, `${fontSize} Arial`);
        });
        if (this.$common.isEmpty(allLabelTxt)) {
          container.style.width = "100%";
          return;
        }
        const maxValue = Math.max(...allLabelTxt) + 110;
        this.$nextTick(() => {
          container.style.width = maxValue > container.offsetWidth ? `${maxValue}px` : "100%";
        });
      })
    },
    // 增加或移除加载状态
    setOrRemoveLoading (instanceId, type) {
      this.$nextTick(() => {
        const newId = instanceId || this.treeInstanceId;
        const container = this.getSelectOptionContainer(newId);
        const loadingDome = [...document.querySelectorAll(`.loading-${this.random}`)];
        if (type) {
          if (loadingDome.length > 0) return;
          if (!container) return;
          const loadingHtml = `<div class="ivu-spin ivu-spin-default ivu-spin-fix loading-${this.random}">
            <div class="ivu-spin-main">
              <span class="ivu-spin-dot"></span>
              <div class="ivu-spin-text"></div>
            </div>
          </div>`;
          container.insertAdjacentHTML('beforeend', loadingHtml);
          container.style.minHeight = '200px';
          return;
        }
        (loadingDome || []).forEach(demo => {
          demo && demo.remove();
        });
        if (container) {
          container.style.minHeight = '';
        }
      })
    },
    // 下拉弹窗关闭时
    closeOption (val, instanceId) {
      document.removeEventListener('click', this.clickModuleOut); // 关闭时移除监听
      const container = this.getSelectOptionContainer(instanceId);
      if (!container) return;
      container.style.width = "100%";
      this.setOrRemoveLoading(instanceId, false);
    },
    // 鼠标组件外隐藏弹窗
    clickModuleOut (event) {
      this.$nextTick(() => {
        const target = event.target || event.srcElement;
        let treeEle = null;
        let container = null;
        let isChildOf = false;
        if (this.$refs[this.random] && this.$refs[this.random].$el) {
          treeEle = this.$refs[this.random].$el;
        }
        if (!this.$common.isEmpty(this.treeInstanceId)) {
          container = this.getSelectOptionContainer(this.treeInstanceId);
        }
        isChildOf = (container && container.contains(target)) || (treeEle && treeEle.contains(target));
        if (isChildOf || this.isValChange) return;
        this.isOpenOption = false;
      });
    }
  }
};
</script>
<style lang="less" scoped>
.logistics-mode-treeselect {
  :deep(.vue-treeselect) {
    .vue-treeselect__value-container {
      white-space: nowrap;
      overflow: hidden;
    }
  }
}
</style>
