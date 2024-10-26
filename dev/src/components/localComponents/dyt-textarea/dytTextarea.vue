<template>
  <div :class="className">
    <dyt-input v-model="textareaVal" v-bind="selectConfig" v-on="$listeners" @on-focus="focusFun" class="dyt-textarea"></dyt-input>
  </div>
</template>

<script>
export default {
  name: 'dytTextarea',
  model: {
    prop: 'value',
    event: 'valueChange'
  },
  data () {
    return {
      className: 'area' + new Date().getTime(), // 类名
      defaultConfig: {
        clearable: true
      },
      textareaVal: ''
    }
  },
  computed: {
    selectConfig () {
      let config = Object.assign({}, this.defaultConfig, this.$attrs);
      if (config.disabled || config.readonly) {
        config.placeholder = '';
      }
      return config;
    }
  },
  watch: {
    value: {
      handler (newVal, oldVal) {
        this.textareaVal = newVal || '';
      },
      deep: true,
      immediate: true
    },
    // 更新父级 v-model 绑定
    textareaVal: {
      deep: true,
      handler (val) {
        if (!val) return;
        let list = this.strChangeArr(val);
        this.$emit('valueChange', list.join(','));
      }
    }
  },
  props: {
    multiple: {// 是否为数组
      type: Boolean,
      default () {
        return false
      }
    },
    arrList: {
      type: [Array, String],
      required: false,
      validator (val) {
        if (Array.isArray(val)) return [];
        return '';
      }
    },
    value: {
      type: String,
      default: ''
    }
  },
  methods: {
    // 聚焦
    focusFun (e) {
      this.createArea(e).then(() => {
        let areaText = document.querySelector('.area-text');
        let areainput = areaText && areaText.querySelector('textarea');
        if (!areainput) return;
        // 文本框聚焦
        areainput.focus();
        // 修复光标没有在内容后面
        var len = areainput.value.length;
        if (document.selection) {
          var sel = areainput.createTextRange();
          sel.moveStart('character', len);
          sel.collapse();
          sel.select();
        } else if (typeof areainput.selectionStart == 'number' && typeof areainput.selectionEnd == 'number') {
          areainput.selectionStart = areainput.selectionEnd = len;
        }
        // 监听窗口变化 关闭文本框
        window.addEventListener('resize', this.destoryDom);
        // 监听文本框失焦
        areainput.addEventListener('blur', this.destoryDom);
        // 销毁监听事件
        this.$once('hook:beforeDestroy', () => {
          window.removeEventListener('resize', this.destoryDom);
          areainput.removeEventListener('blur', this.destoryDom);
        })
      })
    },
    // 销毁节点
    destoryDom () {
      let areaText = document.querySelector('.area-text');
      let areainput = areaText && areaText.querySelector('textarea');
      if (!areainput) return;
      this.textareaVal = areainput.value;
      // 是否存在别名变量arrList
      let { arrList } = this.$props;
      if (arrList) {
        let list = this.strChangeArr(areainput.value);
        this.$emit('update:arrList', this.multiple ? list : list.join(','));// 结果赋值
      }
      // 是否存在valEmit方法
      let { valEmit } = this.$listeners;
      valEmit && this.$emit('valEmit', areainput.value);
      try {
        areaText && areaText.parentNode && document.body.removeChild(areaText.parentNode);
      } catch (err) { throw err };
    },
    // 增加多行文本框
    createArea (e) {
      return new Promise((resolve, reject) => {
        let dom = document.querySelector('.' + this.className);
        let domPos = dom.getBoundingClientRect();
        let areaText = document.querySelector('.area-text');
        if (areaText) { // 防止生成多个areatext
          areaText.style.left = domPos.left + 'px';
          areaText.style.top = (domPos.top + dom.offsetHeight + 6) + 'px';
          return;
        }
        let area = document.createElement('div');
        let innerDom = `<div class="area-text" style="left:${domPos.left}px;top:${domPos.top + dom.offsetHeight + 6}px;width:${dom.offsetWidth}px">
          <textarea class="mul-textarea" placeholder="多个用回车或逗号分开">${this.textareaVal}</textarea>
        </div>`;
        area.innerHTML = innerDom;
        document.body.append(area);
        resolve();
      })
    },
    // 多个用逗号或回车分开
    strChangeArr (val) {
      return val
        .trim()
        .replace(/\n/g, ',')
        .replace(/，/g, ',') // 中文逗号
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item !== '');
    }
  }
}
</script>

<style lang="less">
.area-text {
  position: absolute;
  z-index: 9999;
}
.mul-textarea {
  width: 100%;
  min-height: 120px;
  resize: none;
  border: 1px solid #dcdfe6;
  background-color: #fff;
  -webkit-appearance: none;
  color: #515a6e;
  outline: none;
  padding: 10px;

  &::-webkit-input-placeholder {
    color: #c0c4cc;
  }
  &::-moz-placeholder {
    /* Mozilla Firefox 19+ */
    color: #c0c4cc;
  }
  &:-moz-placeholder {
    /* Mozilla Firefox 4 to 18 */
    color: #c0c4cc;
  }
  &:-ms-input-placeholder {
    /* Internet Explorer 10-11 */
    color: #c0c4cc;
  }
}
.dyt-textarea .el-input__inner {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
