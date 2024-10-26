<template>
  <div
    class="dyt-select-demo"
    :class="{
      'max-tag-count-style': selectConfig['max-tag-count'] === 1 || selectConfig.nowrap
    }"
  >
    <Select
      :ref="`select-${random}`"
      v-model="nowVal"
      v-bind="selectConfig"
      v-on="selectListeners"
      @on-select="onSelect"
      @on-change="onChange"
      @on-query-change="queryChange"
    >
      <template v-for="slot in slots.keys" :slot="slot">
        <slot :name="slot" v-if="slot !== 'default'" />
      </template>
      <template v-for="scopedSlots in scopedSlots.keys" :slot="scopedSlots" slot-scope="scope">
        <slot :name="scopedSlots" v-bind="scope" v-if="slot !== 'default'" />
      </template>
      <slot :list="list">
        <Option
          v-for="(item, index) in list"
          :value="item[replaceKey.value]"
          :key="`${index}-${item[replaceKey.value]}`"
        >{{ `${item[replaceKey.value].includes(selectInvertKey) && isSelectAll ? '取消' : '' }${item[replaceKey.label]}` }}</Option>
      </slot>
    </Select>
  </div>
</template>
<script>
import localforage from 'localforage';

export default {
  name: 'dytSelect',
  components: {},
  model: {
    prop: 'value',
    event: 'valueChange'
  },
  props: {
    // 绑定值
    value: {
      type: [String, Number, Array, Object],
      default: null
    },
    // 下拉数据
    option: { type: Array, default: () => [] },
    // 保存排序时的键值
    sortKey: { type: String, default: '' },
    handleReach: {
      type: Function,
      default: () => {
        return new Promise(resolve => {
          resolve([]);
        })
      }
    },
    // 置顶项
    topItem: { type: String, default: '' },
    // 键值替换
    replaceKey: {
      type: Object,
      default: () => {
        return {
          value: 'value', label: 'label'
        }
      }
    },
    selectInvert: { type: Boolean, default: false },
  },
  data () {
    return {
      random: `${new Date().getTime()}-${(Math.random() * Math.pow(10, 10)).toFixed(0)}`,
      selectInvertKey: `${new Date().getTime()}-${(Math.random() * Math.pow(10, 10)).toFixed(0)}-selectInvertAllCkeckOption`,
      values: null,
      nowVal: null,
      defaultConfig: {
        transfer: true,
        clearable: true,
        filterable: true,
        'max-tag-placeholder': (num) => {
          return `+ ${num}`;
        }
      },
      list: [],
      copyList: [],
      selectListeners: {},
      selectVal: null
    }
  },
  watch: {
    value: {
      deep: true,
      immediate: true,
      handler (val, oldVal) {
        if (JSON.stringify(val) == JSON.stringify(oldVal)) return;
        this.nowVal = val;
      }
    },
    nowVal: {
      deep: true,
      handler (val, oldVal) {
        if (JSON.stringify(val) == JSON.stringify(oldVal)) return;
        this.$emit('valueChange', val);
        this.$emit('on-change', val);
      }
    },
    option: {
      deep: true,
      immediate: true,
      handler (val) {
        this.$nextTick(() => {
          if (this.$common.isEmpty(val)) {
            this.list = [];
            this.copyList = [];
            return;
          }
          let newVal = this.$common.copy(val);
          if (!this.$common.isEmpty(this.topItem)) {
            let otherOption = [];
            const topOption = [];
            newVal.forEach(fTop => {
              if (fTop[this.replaceKey.value] != this.topItem) {
                otherOption.push(fTop);
              } else {
                topOption.push(fTop);
              }
            })
            newVal = [...topOption, ...otherOption];
          }
          if (this.selectInvert && this.isMultiple) {
            const allOption = newVal.find(f => f[this.replaceKey.value].includes(this.selectInvertKey));
            if (this.$common.isEmpty(allOption)) {
              newVal = [{ [this.replaceKey.label]: '全选', [this.replaceKey.value]: this.selectInvertKey }, ...newVal];
            }
          }
          this.list = this.$common.copy(newVal);
          this.copyList = this.$common.copy(newVal);
          this.listSortHand();
        })
      }
    },
    list: {
      deep: true,
      handler (val) {
        if (JSON.stringify(val) !== JSON.stringify(this.option)) {
          if (this.$scopedSlots.default || this.$slots.default) {
            this.$emit('update:option', this.$common.copy(val))
          }
        }
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
    selectConfig () {
      let config = { ...this.defaultConfig, ...this.$attrs };
      if (config.disabled || config.readonly) {
        config.placeholder = '';
      }
      config['transfer-class-name'] = `${config['transfer-class-name'] ? config['transfer-class-name'] : ''}`;
      // if (typeof config.multiple !== 'undefined') {
      //   config['max-tag-count'] = 1;
      // }
      return config;
    },
    isSelectAll () {
      if (!this.selectInvert || !this.isMultiple) return false;
      let allList = [];
      let selectVal = [];
      this.list.filter((row) => {
        if (!row[this.replaceKey.value].includes(this.selectInvertKey)) {
          allList.push(row);
          if ((this.nowVal || []).includes(row[this.replaceKey.value])) {
            selectVal.push(row[this.replaceKey.value]);
          }
        }
      });
      return selectVal.length === allList.length;
    },
    isMultiple () {
      if (typeof this.selectConfig.multiple === 'string') {
        return true;
      }
      if (typeof this.selectConfig.multiple === 'boolean') {
        return this.selectConfig.multiple;
      }
      return false;
    },
    filterByLabel () {
      if (typeof this.selectConfig['filter-by-label'] === 'string') {
        return true;
      }
      if (typeof this.selectConfig['filter-by-label'] === 'boolean') {
        return this.selectConfig['filter-by-label'];
      }
      return false;
    }
  },
  created () {
    let newListeners = this.$common.copy(this.$listeners);
    delete newListeners['on-change'];
    this.selectListeners = newListeners;
  },
  mounted () {},
  methods: {
    // 初始化排序
    listSortHand () {
      if (this.$common.isEmpty(this.sortKey)) return;
      localforage.getItem(this.sortKey).then(res => {
        if (!res) return;
        if (this.$listeners['option-sort']) {
          this.$listeners['option-sort']({ value: null, cache: res });
        } else {
          this.updateList(res);
        }
      })
    },
    // 值改变时执行
    onChange (value) {
      this.values = this.$refs[`select-${this.random}`].values;
      // 排序处理
      this.$nextTick(() => {
        if (this.$common.isEmpty(this.sortKey) || !this.selectVal) {
          if (this.$listeners['option-sort']) {
            console.error('缺少 sort-key 参数');
          }
          return;
        }
        let nvewVal = this.$common.copy(value);
        if (this.$common.isEmpty(nvewVal)) return;
        if (!this.selectConfig.multiple) {
          nvewVal = [nvewVal];
        }
        if (this.selectConfig['label-in-value']) {
          nvewVal = nvewVal.map(item => {
            return item.value
          })
        }
        const isIncludes = (this.$common.isArray(nvewVal) && nvewVal.includes(this.selectVal.value)) || nvewVal == this.selectVal.value;
        localforage.getItem(this.sortKey).then(async res => {
          if (this.$listeners['option-sort']) {
            const setVal = await this.$listeners['option-sort']({
              value: isIncludes ? this.selectConfig['label-in-value'] ? this.selectVal : this.selectVal.value : null,
              cache: res
            })
            localforage.setItem(this.sortKey, setVal);
            return;
          }
          if (!isIncludes) return;
          if (!res) {
            const addSort = [{ value: this.selectVal.value, sortNo: 1 }];
            localforage.setItem(this.sortKey, addSort);
            this.updateList(addSort);
          } else {
            let sortVal = res.filter(item => {
              return item.value == this.selectVal.value;
            });
            if (sortVal[0]) {
              sortVal[0].sortNo++;
            } else {
              res.push({ value: this.selectVal.value, sortNo: 1 });
            }
            res.sort((small, big) => {
              return big.sortNo - small.sortNo;
            });
            let index = 0;
            let nowVal = null;
            const arrLength = (this.$common.arrRemoveRepeat(res.map(m => m.sortNo))).length;
            res.forEach(item => {
              if (nowVal == item.sortNo) {
                item.sortNo = arrLength - (index - 1);
              } else {
                nowVal = item.sortNo;
                item.sortNo = arrLength - index;
                index++;
              }
            });
            this.updateList(res);
            localforage.setItem(this.sortKey, res);
          }
        })
      })
    },
    // 选中时执行
    onSelect (obj) {
      if (!(obj.value.toString()).includes(this.selectInvertKey)) {
        this.selectVal = obj;
        return;
      }
      let allList = [];
      let oldSelectVal = [];
      this.list.filter((row) => {
        if (!(row[this.replaceKey.value].toString()).includes(this.selectInvertKey)) {
          allList.push(row);
          if ((this.nowVal || []).includes(row[this.replaceKey.value])) {
            oldSelectVal.push(row[this.replaceKey.value]);
          }
        }
      });
      this.selectVal = allList[0];
      this.$nextTick(() => {
        if (oldSelectVal.length === allList.length) {
          this.nowVal = (this.nowVal || []).filter(f => !oldSelectVal.includes(f) && !(f.toString()).includes(this.selectInvertKey));
        } else {
          const addSelectVal = allList.map(m => m[this.replaceKey.value]);
          const oldVal = (this.nowVal || []).filter(f => !(f.toString()).includes(this.selectInvertKey));
          this.nowVal = this.$common.arrRemoveRepeat([...oldVal, ...addSelectVal]);
        }
      })
    },
    // 搜索值改变时
    queryChange (str) {
      if (!this.selectInvert || !this.isMultiple || typeof this.$listeners['on-query-change'] === 'function') return;
      if (this.$common.isEmpty(str)) {
        this.list = this.$common.copy(this.copyList);
        return;
      }
      const newStr = str.toLocaleLowerCase();
      let label = '';
      let value = '';
      let newList = this.copyList.filter(f => {
        label = (f[this.replaceKey.label].toString()).toLocaleLowerCase();
        value = (f[this.replaceKey.value].toString()).toLocaleLowerCase();
        if (this.filterByLabel) {
          return label.includes(newStr) && !value.includes(this.selectInvertKey);
        }
        return (label.includes(newStr) || value.includes(newStr)) && !value.includes(this.selectInvertKey);
      });
      if (newList.length > 0) {
        newList.splice(0, 0, { [this.replaceKey.label]: '全选', [this.replaceKey.value]: `${this.selectInvertKey}-${str}` });
      }
      this.list = newList;
    },
    // 更新下拉排序
    updateList (res) {
      if (!this.$common.isObject(res)) return;
      let sortList = [];
      let selectInvert = [];
      if (this.selectInvert && this.isMultiple) {
        selectInvert = this.list.filter((row) => {
          return (row[this.replaceKey.value].toString()).includes(this.selectInvertKey);
        });
      }
      res.forEach(item => {
        this.list.forEach(row => {
          item.value == row[this.replaceKey.value] && sortList.push(row);
        })
      })
      const sortValue = sortList.map(item => {
        return item[this.replaceKey.value]
      })
      const noSortList = this.list.filter(item => {
        return !sortValue.includes(item[this.replaceKey.value]);
      })
      let temporaryVal = [...selectInvert, ...sortList, ...noSortList];
      // 设置置选项
      if (!this.$common.isEmpty(this.topItem)) {
        let otherOption = [];
        const topOption = [];
        temporaryVal.forEach(fTop => {
          if (fTop[this.replaceKey.value] != this.topItem) {
            otherOption.push(fTop);
          } else {
            topOption.push(fTop);
          }
        })
        temporaryVal = [...topOption, ...otherOption];
      }
      this.list = temporaryVal;
      this.copyList = this.$common.copy(this.list);
    },
    setQuery (query) {
      this.$refs[`select-${this.random}`].setQuery(query);
    },
    clearSingleSelect () {
      this.$refs[`select-${this.random}`].clearSingleSelect();
    },
    reset () {
      this.$refs[`select-${this.random}`].reset();
    }
  }
};
</script>
<style lang="less">
.dyt-select-demo{
  display: inline-block;
  width: 100%;
  .ivu-select-input[disabled]{
    opacity: 0.72;
    color: #555;
    -webkit-text-fill-color: #555;
  }
  &.max-tag-count-style{
    .ivu-select-selection{
      > div{
        display: flex;
      }
      .ivu-tag{
        flex: 100;
        padding: 0 5px;
        white-space: nowrap;
        &:last-of-type{
          flex: none;
          .ivu-tag-text{
            color: #b9b9b9;
          }
        }
        &:first-of-type{
          flex: 100;
          .ivu-tag-text{
            color: #515a6e;
          }
        }
      }
    }
  }

}
</style>
