<template>
  <div
    class="dyt-virtual-select-demo"
    :class="{
      'max-tag-count-style': selectConfig['max-tag-count'] === 1 || selectConfig.nowrap
    }"
  >
    <Select
      :ref="`select-${random}`"
      v-model="nowVal"
      v-bind="selectConfig"
      v-on="selectListeners"
      @on-change="onChange"
      @on-query-change="queryChange"
      @on-select="onSelect"
      transfer-class-name="virtual-select-options"
    >
      <template v-for="slot in slots.keys" :slot="slot">
        <slot :name="slot" v-if="slot !== 'default'" />
      </template>
      <template v-for="scopedSlots in scopedSlots.keys" :slot="scopedSlots" slot-scope="scope">
        <slot :name="scopedSlots" v-bind="scope" v-if="slot !== 'default'" />
      </template>
      <slot :list="list">
        <RecycleScroller
          :items="list"
          :item-size="33"
          :key-field="replaceKey.value"
          v-slot="{ item }"
        >
          <Option
            :value="item[replaceKey.value]"
            :class="{
              'ivu-select-item-selected ivu-select-item-focus': !$common.isEmpty(nowVal) ? (typeof nowVal === 'string' ? [nowVal] : nowVal).includes(item[replaceKey.value]) : false
            }"
          >{{ `${item[replaceKey.value].includes(selectInvertKey) && isSelectAll ? '取消' : '' }${item[replaceKey.label]}` }}</Option>
        </RecycleScroller>
      </slot>
    </Select>
  </div>
</template>
<script>
import localforage from 'localforage';
import { RecycleScroller } from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

export default {
  name: 'dytVirtualSelect',
  components: {
    RecycleScroller
  },
  model: {
    prop: 'value',
    event: 'valueChange'
  },
  props: {
    value: {
      type: [String, Number, Array, Object],
      default: null
    },
    option: { type: Array, default: () => [] },
    sortKey: { type: String, default: '' },
    handleReach: {
      type: Function,
      default: () => {
        return new Promise(resolve => {
          resolve([]);
        })
      }
    },
    replaceKey: {
      type: Object,
      default: () => {
        return {
          value: 'value', label: 'label', disabled: 'disabled', tag : 'tag '
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
      selectOldVal: null,
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
        console.log('val', val);
        console.log('oldVal', oldVal);
        this.selectOldVal = oldVal;
        this.$emit('valueChange', val);
        this.$emit('on-change', val);
      }
    },
    option: {
      deep: true,
      immediate: true,
      handler (val) {
        if (this.$common.isEmpty(val)) {
          this.list = [];
          this.copyList = [];
          return;
        }
        let newVal = this.$common.copy(val);
        if (this.selectInvert && this.isMultiple) {
          const allOption = newVal.find(f => f[this.replaceKey.value].includes(this.selectInvertKey));
          if (this.$common.isEmpty(allOption)) {
            newVal = [{ [this.replaceKey.label]: '全选', [this.replaceKey.value]: this.selectInvertKey }, ...newVal];
          }
        }
        this.list = this.$common.copy(newVal);
        this.copyList = this.$common.copy(newVal);
        this.listSortHand();
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
      return config;
    },
    isSelectAll () {
      if (!this.selectInvert || !this.isMultiple) return false;
      let allList = [];
      let selectVal = [];
      const getNoVal = this.$common.isEmpty(this.nowVal) ? this.$common.isArray(this.nowVal) ? this.nowVal : [this.nowVal] : [];
      this.list.filter((row) => {
        if (!row[this.replaceKey.value].includes(this.selectInvertKey)) {
          allList.push(row);
          if (getNoVal.includes(row[this.replaceKey.value])) {
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
    delete newListeners['onChange'];
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
        this.$nextTick(() => {
          if (this.$common.isUndefined(this.$attrs.multiple) || (this.$common.isBoolean(this.$attrs.multiple) && !this.$attrs.multiple)) {
            this.nowVal = obj.value;
            setTimeout(() => {
              this.nowVal = obj.value;
            }, 300);
          }
        })
        return;
      }
      let allList = [];
      let oldCheckVal = [];
      const getNoVal = this.$common.isEmpty(this.nowVal) ? this.$common.isArray(this.nowVal) ? this.nowVal : [this.nowVal] : [];
      this.list.filter((row) => {
        if (!(row[this.replaceKey.value].toString()).includes(this.selectInvertKey)) {
          allList.push(row);
          if (getNoVal.includes(row[this.replaceKey.value])) {
            oldCheckVal.push(row[this.replaceKey.value]);
          }
        }
      });
      this.selectVal = allList[0];
      this.$nextTick(() => {
        if (oldCheckVal.length === allList.length) {
          this.nowVal = getNoVal.filter(f => !oldCheckVal.includes(f) && !(f.toString()).includes(this.selectInvertKey));
        } else {
          const addCheckVal = allList.map(m => m[this.replaceKey.value]);
          const oldVal = getNoVal.filter(f => !(f.toString()).includes(this.selectInvertKey));
          this.nowVal = this.$common.arrRemoveRepeat([...oldVal, ...addCheckVal]);
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
      let newList = this.copyList.filter(f => {
        if (this.filterByLabel) {
          return f[this.replaceKey.label].includes(str) && !(f[this.replaceKey.value].toString()).includes(this.selectInvertKey);
        }
        return (f[this.replaceKey.label].includes(str) || f[this.replaceKey.value].includes(str)) && !(f[this.replaceKey.value].toString()).includes(this.selectInvertKey);
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
      this.list = [...selectInvert, ...sortList, ...noSortList];
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
.dyt-virtual-select-demo{
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
.virtual-select-options{
  &.ivu-select-dropdown{
    max-height: 210px;
    .ivu-select-dropdown-list{
      max-height: 210px;
      .vue-recycle-scroller{
        max-height: 200px;
      }
    }
  }
}
</style>
