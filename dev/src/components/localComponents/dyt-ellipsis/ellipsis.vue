<template>
  <div class="mm-ellipsis-container">
    <div class="container-template">
      <textarea :rows="line" readonly></textarea>
      <div class="container-shadow" ref="container">
        {{ showContent }}
        <span>
          {{ isExpand ? ' ' : ellipsisText }}
          <slot name="ellipsis">
            <span class="ellipsis-btn">{{ isExpand ? collapseText : expandText }}</span>
          </slot>
        </span>
        <span ref="tail"></span>
      </div>
    </div>
    <div class="real-container">{{ showContent }}<span>{{ isExpand ? ' ' : (content.length > textLength) ? ellipsisText : '' }}<slot name="ellipsis" v-if="(!isExpand && textLength < content.length && showExpand) || (isExpand && showExpand && overflow)"><span class="ellipsis-btn" @click="clickBtn">{{ isExpand ? collapseText : expandText }}</span></slot></span></div>
  </div>
</template>

<script>
export default {
  props: {
    content: { type: String, default: '' },
    expandText: { type: String, default: '展开' },
    collapseText: { type: String, default: '收起' },
    ellipsisText: { type: String, default: '...' },
    line: { type: Number, default: 2 },
    showExpand: { type: Boolean, default: true }
  },
  data () {
    return {
      textLength: 0,
      beforeRefresh: null,
      boxWidth: 0,
      boxHeight: 0,
      isExpand: false,
      overflow: false
    }
  },
  computed: {
    showContent () {
      // const length = this.beforeRefresh ? this.content.length : this.textLength
      return this.content.substr(0, this.textLength);
    }
  },
  watch: {},
  created () {},
  mounted () {
    // 订阅事件
    window.addEventListener('resize', this.refresh);
    this.init();
  },
  beforeDestroy () {
    // 解除订阅
    window.removeEventListener('resize', this.refresh);
  },
  methods: {
    // 初始化准备
    init () {
      const el = this.$refs.container;
      if (!el) return;
      if (el.offsetWidth == this.boxWidth && el.offsetHeight == this.boxHeight) return;
      this.boxWidth = el.offsetWidth;
      this.boxHeight = el.offsetHeight;
      this.refresh();
    },
    // 更新显示文本，判断是否超出设置行使用容器边距判断
    refresh () {
      // 展开情况下，判断是否超出设置行
      if (this.isExpand) {
        const boxRect = this.$refs.container.getBoundingClientRect();
        const tailRect = this.$refs.tail.getBoundingClientRect();
        this.overflow = tailRect.bottom > boxRect.bottom;
        return;
      };
      this.beforeRefresh && this.beforeRefresh();
      let stopLoop = false;
      this.beforeRefresh = () => {
        stopLoop = true;
      }
      this.textLength = this.content.length;
      const checkLoop = (start, end) => {
        if (stopLoop || start + 1 >= end) {
          if (stopLoop) {
            this.beforeRefresh = null;
            return;
          }
          // 遇到换行符号时
          const index = this.content.indexOf('\n');
          if (index > -1 && index < this.textLength) {
            this.textLength = index;
          }
          return;
        }
        const boxRect = this.$refs.container.getBoundingClientRect();
        const tailRect = this.$refs.tail.getBoundingClientRect();
        const overflow = tailRect.bottom > boxRect.bottom;
        overflow ? (end = this.textLength) : (start = this.textLength);
        // console.log(overflow);
        this.textLength = Math.floor((start + end) / 2);
        this.$nextTick(() => checkLoop(start, end));
      }
      this.$nextTick(() => checkLoop(0, this.textLength));
    },
    // 点击展开收起按钮时处理
    clickBtn (event) {
      this.isExpand = !this.isExpand;
      if (this.isExpand) {
        this.textLength = this.content.length;
      }
      this.$nextTick(() => {
        this.refresh();
        this.$emit('expand', this.isExpand, event);
      })
    }
  }
}
</script>
<style lang="less" scoped>
.mm-ellipsis-container{
  text-align: left;
  position: relative;
  line-height: 1.5em;
  .real-container{
    white-space: pre-wrap;
  }
  .container-template {
    width: 100%;
    display: flex;
    pointer-events: none;
    opacity: 0;
    user-select: none;
    position: absolute;
    outline: green solid 1px;
    textarea{
      border: none;
      flex: auto;
      padding: 0;
      resize: none;
      overflow: hidden;
      font-size: inherit;
      line-height: inherit;
      outline: none;
    }
    .container-shadow{
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
    }
  }
  .ellipsis-btn{
    display: inline-block;
    cursor: pointer;
    text-decoration: underline;
    color: #4791ff;
  }
}
</style>
