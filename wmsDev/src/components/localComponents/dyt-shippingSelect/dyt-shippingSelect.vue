<template>
  <div class="logistics-mode-treeselect">
    <erpTreeSelect
      :ref="random"
      v-model="erpTreeSelectVal"
      :options="shippingMethodData"
      :load-options="loadTreeOptions"
      v-bind="selectConfig"
      :normalizer="treeNormalizer"
      @input="treeChange"
    />
  </div>
</template>
<script>
// https://vue-treeselect.js.org/#events vue-treeselect文档
import api from '@/api/api';
import { LOAD_CHILDREN_OPTIONS } from '@riophae/vue-treeselect';
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
    // 仓库类型
    warehouseType: { type: Number },
  },
  data() {
    return {
      random: `ref-${Number((Math.random()).toString().substring(2)).toString(32)}-${(new Date().getTime()).toString(32)}`,
      treeJson: {},
      defaultConfig: {
        multiple: true,
        'append-to-body': true,
        'default-expand-level': 0,
        noResultsText: '无匹配数据',
        placeholder: '请选择',
        appendToBody: true,
        retryText: '重试？',
        retryTitle: '重试',
        noOptionsText: '无选项',
        limit: 1,
        clearable: true,
        // searchable: true,
        // 'open-on-focus': true,
        // 'open-on-click': true,
        zIndex: 99999999999,
        // valueConsistsOf: 'ALL',
        sortValueBy: 'LEVEL', // 选项级别
      },
      nowWarehouseId: null,
      erpTreeSelectVal: null,
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
    warehouseId: {
      deep: true,
      immediate: true,
      handler(val) {
        console.log(val);
        if (this.nowWarehouseId == val) return;
        this.nowWarehouseId = val;
        console.log('getShippingList', val);
        this.getShippingList();
      }
    }
  },
  computed: {
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
    warehouseId() {
      return this.$store.state.warehouseId || getWarehouseId();
    },
  },
  created() {
    // this.$common.isEmpty(this.warehouseId) && this.getShippingList();
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
    // 处理树节点
    treeNormalizer (node) {
      return {
        id: node.value,
        label: node.label,
        children: node.children
      }
    },
    // 获取父级
    getShippingList () {
      return new Promise((resolve) => {
        this.treeJson = {};
        this.$set(this.treeJson, 'LOAD_CHILDREN_OPTIONS', []);
        let queryPar = {
          isFilter: true,
          time: (new Date().getTime()).toString(32)
        };
        if (!this.$common.isEmpty(this.warehouseId)) {
          queryPar.warehouseId = this.warehouseId;
        }
        if (!this.$common.isEmpty(this.warehouseType)) {
          queryPar.warehouseType = this.warehouseType;
        }
        this.axios.get(`${api.get_enableCarriers}`, {
          params: queryPar,
          hiddenError: true
        }).then(response => {
          if (!response || !response.data || response.data.code != 0) return resolve([]);
          if (!this.loadingChildren) {
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
          }
          let getVal = [];
          (response.data.datas || []).forEach(k => {
            let newData = {
              ...k,
              value: k.carrierId,
              label: k.carrierName,
              labelPath: k.carrierName,
              children: null,
            }
            this.$set(this.treeJson, k.carrierId, newData);
            getVal.push(new Promise((resolve) => {
              this.loadTreeOptions({
                action: 'LOAD_CHILDREN_OPTIONS',
                parentNode: newData,
                callback: () => {},
                checked: () => {},
                loaded: (children) => {
                  this.$set(newData, 'children', children);
                  this.$set(this.treeJson[k.carrierId], 'children', children);
                  resolve(newData);
                }
              });
            }));
          });
          Promise.all(getVal).then((res) => {
            this.shippingMethodData = res;
            resolve(this.shippingMethodData);
          }).catch(() => {
            resolve([]);
          });
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
        this.axios.get(`${api.get_enableShippingMethods}`, {
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
            parentNode.children = newChild;
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
      if (!this.$common.isArray(treeVal)) {
        val = [treeVal];
      }
      if (val && val.length > 0) {
        let getVal = [];
        val.forEach(item => {
          if (this.treeJson[item]) {
            getVal.push(new Promise(resolve => {
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
            }));
          }
        });
        // 调用变更
        Promise.all(getVal).then((res) => {
          let carrierId = [];
          let shippingMethodId = [];
          let choseNode = [];
          let titlePath = [];
          res.forEach(item => {
            if (item.parentMerchantId) {
              if (!this.$common.isEmpty(this.treeJson[item.parentMerchantId]) && !carrierId.includes(this.treeJson[item.parentMerchantId].value)) {
                carrierId.push(this.treeJson[item.parentMerchantId].value);
              }
              if (!shippingMethodId.includes(item.value)) {
                shippingMethodId.push(item.value);
                choseNode.push(item);
                titlePath.push(item.labelPath);
              }
            } else {
              if (!carrierId.includes(item.value)) {
                carrierId.push(item.value);
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
          this.$emit('on-change', {
            carrierId: (this.isMultiple ? carrierId : carrierId[0]),
            shippingMethodId: (this.isMultiple ? shippingMethodId : isChosePrant ? null : val.join(',')),
            choseNode: (this.isMultiple ? choseNode : isChosePrant ? this.treeJson[val] : choseNode[0]),
            titlePath: (this.isMultiple ? titlePath : isChosePrant ? this.treeJson[val].labelPath : titlePath[0])
          });
        });
      } else {
        this.$emit('change', (this.isMultiple ? val : null));
        this.$emit('on-change', {
          carrierId: (this.isMultiple ? [] : null),
          shippingMethodId: (this.isMultiple ? [] : null),
          choseNode: (this.isMultiple ? [] : null),
          titlePath: (this.isMultiple ? [] : null)
        });
      }
    },
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
