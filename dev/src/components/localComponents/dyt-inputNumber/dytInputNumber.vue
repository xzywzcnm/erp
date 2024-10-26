<template>
  <!-- <Input v-bind="selectConfig" v-on="$listeners"></Input> -->
  <span class="dyt-custom-inputNumber" :class="{'dyt-custom-inputNumber-disabled': selectConfig.disabled || selectConfig.readonly}">
    <InputNumber :ref="`inputNumber-${random}`" v-model="inputVal" v-bind="selectConfig" v-on="$listeners">
      <template v-for="slot in slots.keys" :slot="slot">
        <slot :name="slot" />
      </template>
      <template v-for="scopedSlots in scopedSlots.keys" :slot="scopedSlots" slot-scope="scope">
        <slot :name="scopedSlots" v-bind="scope" />
      </template>
    </InputNumber>
    <i v-if="showClear" :id="`icon-${random}`" class="ivu-icon ivu-icon-ios-close-circle ivu-input-icon ivu-input-icon-clear ivu-input-icon-normal" @click="clearVal" :style="`${appendRight}`" />
  </span>
</template>
<script>

export default {
  name: 'dytInputNumber',
  components: {},
  model: {
    prop: 'value',
    event: 'valueChange'
  },
  props: {
    value: {
      type: Number,
      default: null
    }
  },
  data () {
    return {
      showClear: true,
      // 时间戳和随机数组合ID
      random: `${new Date().getTime()}-${(Math.random() * Math.pow(10, 10)).toFixed(0)}`,
      inputVal: null,
      defaultConfig: {
        // max: Number.MAX_VALUE,
        // min: Number.MIN_VALUE,
        placeholder: '请输入数字',
        max: Number.MAX_SAFE_INTEGER,
        min: Number.MIN_SAFE_INTEGER
      },
      iconDome: null,
      appendRight: ''
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
      let rest = {};
      if (this.$attrs) {
        this.$common.isEmpty(this.$attrs.max) && this.$attrs.max > Number.MAX_SAFE_INTEGER && this.$set(rest, 'max', Number.MAX_SAFE_INTEGER);
        this.$common.isEmpty(this.$attrs.min) && Number.MIN_SAFE_INTEGER > this.$attrs.min && this.$set(rest, 'min', Number.MIN_SAFE_INTEGER);
      }
      let config = { ...this.defaultConfig, ...this.$attrs, ...rest };
      if (config.disabled || config.readonly) {
        delete config.placeholder
      }
      return config
    }
  },
  watch: {
    value: {
      deep: true,
      immediate: true,
      handler (val) {
        this.inputVal = val;
      }
    },
    // 更新父级 v-model 绑定
    inputVal: {
      deep: true,
      handler (val) {
        this.$emit('valueChange', val);
        this.$nextTick(() => {
          this.appendColse();
        })
      }
    }
  },
  created () { },
  mounted () {
    this.$nextTick(() => {
      setTimeout(() => {
        this.appendColse();
      }, 50)
    })
  },
  methods: {
    // 添加清空值按钮
    appendColse () {
      if (!this.$attrs || this.$attrs.disabled || this.$attrs.readonly) return;
      this.showClear = !this.$common.isEmpty(this.inputVal);
      this.$nextTick(() => {
        if (!this.$refs[`inputNumber-${this.random}`]) return;
        const dome = document.querySelector(`#icon-${this.random}`);
        const refsDome = this.$refs[`inputNumber-${this.random}`].$el;
        const inputDome = refsDome.querySelector('.ivu-input-number-input');
        this.iconDome = !this.$common.isEmpty(this.iconDome) ? this.iconDome : dome;
        if (!this.showClear) {
          dome && dome.remove();
        } else {
          inputDome.parentNode.appendChild(this.iconDome);
        }
      })
    },
    clearVal () {
      this.inputVal = null;
    }
  }
};
</script>
<style lang="less">
.dyt-custom-inputNumber {
  display: inline-block;
  .ivu-input-number {
    width: 100%;
    min-width: 60px;
    max-width: 200px;
  }
  .ivu-input-number-input {
    padding: 4px 43px 4px 7px;
  }

  .ivu-input-number-input-wrap {
    .ivu-input-icon {
      width: 20px;
      right: 22px;
      background: #fff;
    }
    &:hover {
      .ivu-input-icon-clear {
        display: inline-block;
      }
    }
  }
  &.dyt-custom-inputNumber-disabled {
    .ivu-input-number-focused {
      border-color: #dcdee2;
      box-shadow: none;
    }
    .ivu-input-number {
      &:hover,
      &:focus {
        border-color: #dcdee2;
        box-shadow: none;
        .ivu-input-number-handler-wrap {
          display: none;
        }
      }
    }
    .ivu-input-number-input {
      opacity: 0.72;
      padding-right: 7px;
      color: #555;
      background-color: #f3f3f3;
      &:focus {
        box-shadow: none;
      }
    }
  }
}
</style>
