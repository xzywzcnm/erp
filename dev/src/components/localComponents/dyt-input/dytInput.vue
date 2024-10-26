<template>
  <!-- <Input v-bind="selectConfig" v-on="$listeners"></Input> -->
  <span class="dyt-custom-input-box" :class="{'dyt-custom-input-disabled': selectConfig.disabled || selectConfig.readonly}">
    <Input
      :ref="`input-${random}`"
      v-model="inputVal"
      v-bind="selectConfig"
      v-on="$listeners"
      class="dyt-custom-input"
      @input="inputChange"
      @on-blur="inputBlur"
    >
      <!-- 不带参数插槽 -->
      <template v-for="slot in slots.keys" :slot="slot">
        <slot :name="slot" />
      </template>
      <!-- 带参数插槽 -->
      <template v-for="scopedSlots in scopedSlots.keys" :slot="scopedSlots" slot-scope="scope">
        <slot :name="scopedSlots" v-bind="scope" />
      </template>
    </Input>
    <i
      v-if="showClear && selectConfig.clearable"
      :id="`icon-${random}`"
      class="ivu-icon ivu-icon-ios-close-circle ivu-input-icon ivu-input-icon-clear ivu-input-icon-normal"
      @click="clearVal"
      :style="`${appendRight}`"
    />
  </span>
</template>
<script>

export default {
  name: 'dytInput',
  components: {},
  model: {
    prop: 'value',
    event: 'valueChange'
  },
  props: {
    value: {
      type: String | Number,
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
        clearable: true
      },
      appendRight: '',
      iconDome: null
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
      if (['textarea'].includes(this.$attrs.type) && !this.$common.isEmpty(this.$attrs.maxlength)) {
        this.$set(this.defaultConfig, 'show-word-limit', true);
        delete this.defaultConfig.clearable;
      } else if ((this.$slots && (this.$slots.suffix || this.$slots.append)) || this.$attrs['show-word-limit']) {
        delete this.defaultConfig.clearable;
      }
      let config = { ...this.defaultConfig, ...this.$attrs };
      if (config.disabled || config.readonly) {
        delete config.clearable
        delete config.placeholder
      }
      this.isAddColse() && this.appendColse();
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

    inputVal: {
      deep: true,
      handler () {
        this.$nextTick(() => {
          this.$attrs['show-word-limit'] && this.limitHand();
          this.isAddColse() && this.appendColse();
        })
      }
    }
  },
  created () {},
  mounted () {
    this.$nextTick(() => {
      this.$attrs['show-word-limit'] && this.limitHand();
      // 等待渲染，，nextTick 时还存在 未渲染完成
      this.isAddColse() && setTimeout(() => {
        this.appendColse();
      }, 50)
    })
  },
  methods: {
    // 更新父级 v-model 绑定(由于表单验证优先级机制，需采用 @input 监听而不是使用 watch 监听)
    inputChange (val) {
      this.$emit('valueChange', val);
    },
    inputBlur () {
      if (this.$common.isString(this.inputVal) && this.inputVal !== this.inputVal.trim()) {
        this.inputVal = this.inputVal.trim();
        this.$emit('valueChange', this.inputVal);
      }
    },
    // 计算 padding 值
    limitHand () {
      if (!['textarea'].includes(this.$attrs.type)) {
        const dome = this.$refs[`input-${this.random}`].$el;
        const width = dome.querySelector('.ivu-input-word-count').offsetWidth;
        const inputDome = dome.querySelector('.ivu-input');
        inputDome.style.paddingRight = `${width + 6}px`;
      }
    },
    // 判断是否可添加清空按钮
    isAddColse () {
      if (this.$slots && (this.$slots.suffix || this.$slots.append)) {
        return true;
      }
      if (!this.$common.isEmpty(this.$attrs.maxlength) || ['textarea'].includes(this.$attrs.type)) {
        return true;
      }
      return false;
    },
    // 添加清空值按钮
    appendColse () {
      this.showClear = !this.$common.isEmpty(this.inputVal);
      this.$nextTick(() => {
        if (!this.$refs[`input-${this.random}`]) return;
        const dome = document.querySelector(`#icon-${this.random}`);
        const refsDome = this.$refs[`input-${this.random}`].$el;
        const inputDome = refsDome.querySelector('.ivu-input');
        this.iconDome = !this.$common.isEmpty(this.iconDome) ? this.iconDome : dome;
        if (!inputDome || !this.iconDome) return;
        if (!this.showClear) {
          dome && dome.remove();
        } else if (!this.$attrs.disabled && !this.$attrs.readonly) {
          inputDome.parentNode.appendChild(this.iconDome);
        }
        if (this.$slots && (this.$slots.suffix || this.$slots.append)) {
          const domeClass = this.$slots.append ? 'ivu-input-group-append' : 'ivu-input-suffix'
          const append = refsDome.querySelector(`.${domeClass}`).offsetWidth;
          this.appendRight = `right:${append + 1}px;`;
          if (this.$slots.suffix) {
            inputDome.style.paddingRight = `${append + ((this.$attrs.disabled || this.$attrs.readonly) ? 0 : 21)}px`;
          }
          if (this.$slots.prefix) {
            const prefix = refsDome.querySelector('.ivu-input-prefix').offsetWidth;
            inputDome.style.paddingLeft = `${prefix}px`;
          }
        }
      })
    },
    // 清除值方法
    clearVal () {
      this.$emit('valueChange', null);
      this.inputVal = null;
    },
    focus (config = {}) {
      this.$refs[`input-${this.random}`].focus(config);
    }
  }
};
</script>
<style lang="less">
.dyt-custom-input-box{
  display: inline-block;
  width: 100%;
  &.dyt-custom-input-disabled{
    .ivu-input{
      padding-right: 7px;
      opacity: 0.72;
      outline: none;
      color: #555;
      background-color: #f3f3f3;
      border-color: #dcdee2;
      &:focus{
        box-shadow: none;
      }
    }
  }
  display: inline-block;
  .dyt-custom-input{
    .ivu-input-prefix,
    .ivu-input-suffix{
      width: auto;
      padding: 0 8px;
    }
    .ivu-input-icon{
      top: 2px;
      right: 1px;
      width: 20px;
      height: 28px;
      line-height: 28px;
      background: #fff;
      border-radius: 0 5px 5px 0;
    }
    .ivu-input{
      padding-right: 21px;
    }
    .ivu-input-word-count{
      padding-left: 5px;
    }
  }
  .ivu-input[disabled],
  fieldset[disabled] .ivu-input{
    padding-right: 7px;
    opacity: 0.72;
    outline: none;
    color: #555;
    background-color: #f3f3f3;
    border-color: #dcdee2;
  }
}
</style>
