<template>
  <div class="merge-switch-select">
    <dyt-select
      v-if="saleAccountType === 'select'"
      v-model="saleAccountIds"
      :max-tag-count="1"
      multiple
      :disabled="disabled"
      :placeholder="placeholder"
      :selectInvert="true"
      :hidden-placeholder="hiddenPlaceholder"
      :option="optionData"
      :replaceKey="replaceSelectKey"
    />
    <dyt-input-tag
      v-if="saleAccountType === 'input'"
      type="textarea"
      :limit="1"
      :placeholder="inputPlaceholder"
      :disabled="disabled"
      :hidden-placeholder="hiddenPlaceholder"
      v-model="textareaSaleAccountIds"
    />
    <Button @click="switchSaleAccountType">{{ saleAccountType === 'select' ? '选择' : '输入'}}</Button>
  </div>
</template>

<script>

export default {
  name: 'storeSelect',
  model: {
    prop: 'moduleValue',
    event: 'valueChange'
  },
  props: {
    moduleValue: {
      type: Array,
      default: () => {
        return [];
      }
    },
    optionData: {
      type: Array,
      default: () => {
        return [];
      }
    },
    replaceOptionKey: {
      type: Object,
      default: () => {
        return { value: 'saleAccountId', label: 'accountCode' }
      }
    },
    placeholder: {
      type: String,
      default: '请选择，可输入搜索'
    },
    inputPlaceholder: {
      type: String,
      default: '请输入，多个可用逗号或换行隔开'
    },
    // 禁用
    disabled: {
      type: Boolean,
      default: false
    },
    hiddenPlaceholder: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      saleAccountType: 'select',
      saleAccountIds: [],
      textareaSaleAccountIds: [],
      defaultReplaceSelectKey: { value: 'saleAccountId', label: 'accountCode' }
    };
  },
  watch: {
    // 传进来的值改变时
    moduleValue: {
      deep: true,
      immediate: true,
      handler (val) {
        if (JSON.stringify(val) === JSON.stringify(this.saleAccountIds)) return;
        this.saleAccountIds = val;
      }
    },
    // 选中的值改变时
    saleAccountIds: {
      deep: true,
      immediate: true,
      handler (val) {
        if (!this.$common.isEmpty(val) && JSON.stringify(val).includes('-selectInvertAllCkeckOption')) return;
        // const allAccount = this.optionData.map(m => m[this.replaceSelectKey.label]);
        // const invalid = (this.textareaSaleAccountIds || []).filter(f => !allAccount.includes(f));
        const newVal = this.optionData.filter(f => val.includes(f[[this.replaceSelectKey.value]])).map(m => m[this.replaceSelectKey.label]);
        // if (JSON.stringify(this.textareaSaleAccountIds) != JSON.stringify([...invalid, ...newVal])) {
        //   this.textareaSaleAccountIds = [...invalid, ...newVal];
        // }
        if (JSON.stringify(this.textareaSaleAccountIds) != JSON.stringify(newVal)) {
          // 改变值需要等待下拉收起
          this.$nextTick(() => {
            this.textareaSaleAccountIds = newVal;
          })
        }
        if (JSON.stringify(val) == JSON.stringify(this.moduleValue)) return;
        this.$emit('valueChange', val);
        this.$nextTick(() => {
          this.$emit('change', val);
          this.$emit('on-change', val);
        })
      }
    },
    // 输入框值改变时
    textareaSaleAccountIds: {
      deep: true,
      handler (val) {
        const newVal = this.$common.arrRemoveRepeat(this.optionData.filter(f => {
          return val.includes(f[this.replaceSelectKey.label]);
        }).map(m => {
          return m[this.replaceSelectKey.value];
        }));
        this.saleAccountIds = newVal;
      }
    },
    optionData: {
      deep: true,
      handler (val) {
        this.optionDataChange(val);
      }
    },
    defaultReplaceSelectKey: {
      deep: true,
      handler (val) {
        this.replaceKeyChange({ ...val, ...this.replaceOptionKey });
      }
    }
  },
  computed: {
    replaceSelectKey () {
      return { ...this.defaultReplaceSelectKey, ...this.replaceOptionKey }
    }
  },
  created () {},
  methods: {
    // 输入选择切换
    switchSaleAccountType () {
      this.saleAccountType = this.saleAccountType === 'select' ? 'input' : 'select';
    },
    // 下拉数据改变时
    optionDataChange (option) {
      this.$nextTick(() => {
        if (this.$common.isEmpty(option)) {
          this.saleAccountIds = [];
          return;
        }
        this.saleAccountIds = option.filter(m => this.saleAccountIds.includes(m[this.replaceSelectKey.value]));
      })
    },
    // 替换键值改变时
    replaceKeyChange (replaceKey) {
      this.$nextTick(() => {
        if (this.$common.isEmpty(this.optionData) || this.$common.isEmpty(replaceKey.value)) {
          this.saleAccountIds = [];
          return;
        }
        this.saleAccountIds = this.optionData.filter(m => this.saleAccountIds.includes(m[replaceKey.value]));
      })
    }
  }
};
</script>

<style lang="less" scoped>
.merge-switch-select{
  display:flex;
  align-items: center;
  border: 1px solid #DCDFE6;
  line-height: 1.6em;
  border-radius: 5px;
  :deep(.dyt-input-tag-content){
    width: 100%;
    min-width: 100px;
    border: none;
  }
  :deep(.ivu-select-selection) {
    border: none;
  }
  :deep(.ivu-btn) {
    border-top: none;
    border-right: none;
    border-bottom: none;
    border-radius: 0 5px 5px 0;
    &:active, &.active, &:hover {
      color: #515a6e;
      background-color: #fff;
      border-color: #dcdee2;
    }
    &:focus {
      box-shadow: none;
    }
  }
}
</style>
