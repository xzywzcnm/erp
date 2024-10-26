<template>
  <div
    :ref="`tag-${pageId}`"
    class="dyt-input-tag-content"
    :class="{
      'dyt-tag-content-limit': limit > 0,
      'tag-content-focus': isFocus,
      'dyt-tag-is-disabled': disabled
    }"
    @click="focus"
  >
    <template v-if="limit > 0">
      <Poptip
      v-if="limit > 0"
      ref="tagPopover"
      placement="bottom"
      :width="popoverWidth"
      @on-popper-show="popoverShow"
      v-model="isFocus"
      transfer
      :popper-class="`dyt-input-tag-content${disabled ? ' tag-is-disabled' : ''}`"
    >
       <div
        v-if="vModel.length > 0"
        class="tag-limit"
      >
        <span
          v-for="(tag, index) in vModel.slice(0, limit)"
          :key="`tag-${index}`"
          class="el-tag el-tag--info el-tag--small"
          @click="clickTag(tag)"
        >
          <span
            class="el-tag-text"
            :title="defaultProp.label ? tag[defaultProp.label] : tag"
          >{{ defaultProp.label ? tag[defaultProp.label] : tag }}</span>
          <i
            v-if="selectConfig.closable"
            class="ivu-icon ivu-icon-md-close tag-icon-close"
            @click.stop="closeTag(tag)"
          />
        </span>
      </div>
      <span
        v-else
        class="input-new-tag el-input__inner"
        style="padding-left: 12px; color: #ccc;"
      >
        {{ placeholder }}
      </span>
      <div
        v-if="vModel.length - limit > 0 && limit > 0"
        class="more-tag"
        @click="moreHand"
      >
        + {{ vModel.length - limit }}
      </div>
      <div
        v-if="vModel.length"
        class="clearable-all poptip-clearable"
      >
        <i
          class="ivu-icon ivu-icon-md-close tag-icon-close"
          title="清空"
          @click.stop="clearableHand"
        />
      </div>
      <div class="tag-popper-content" slot="content">
        <dyt-input
          v-if="!disabled && !readonly && selectConfig.addTag"
          :ref="`popoverTagInput-${pageId}`"
          v-model="inputValue"
          :class="{
            'input-empty-tag': vModel.length === 0
          }"
          :type="type"
          :placeholder="placeholder"
          :autosize="{minRows: 2, maxRows: (preview ? 4 : 15)}"
          style="padding: 0 13px 8px 13px;"
          @on-enter="addTagHand"
          @on-keyup="tagkeyup"
          @on-blur="blur"
        />
        <div class="popover-content" v-if="(preview && type === 'textarea') || type !== 'textarea'">
          <template v-if="vModel.length > 0">
            <span
              v-for="(tag, index) in vModel"
              :key="`tag-${index}`"
              class="el-tag el-tag--info el-tag--small"
              @click="clickTag(tag)"
            >
              <span
                class="el-tag-text"
                :title="(defaultProp.label || defaultProp.value) ? tag[defaultProp.label || defaultProp.value] : tag"
              >{{ (defaultProp.label || defaultProp.value) ? tag[defaultProp.label || defaultProp.value] : tag }}</span>
              <i
                v-if="selectConfig.closable"
                class="ivu-icon ivu-icon-md-close tag-icon-close"
                @click.stop="closeTag(tag)"
              />
            </span>
          </template>
          <span v-else>暂无数据!</span>
        </div>
      </div>
    </Poptip>

    </template>
    <template v-else>
      <div class="default-tag-constent">
        <span
          v-for="(tag, index) in vModel"
          :key="`tag-${index}`"
          class="el-tag el-tag--info el-tag--small"
          @click="clickTag(tag)"
        >
          <span
            class="el-tag-text"
            :title="(defaultProp.label || defaultProp.value) ? tag[defaultProp.label || defaultProp.value] : tag"
          >{{ (defaultProp.label || defaultProp.value) ? tag[defaultProp.label || defaultProp.value] : tag }}</span>
          <i
            v-if="selectConfig.closable"
            class="ivu-icon ivu-icon-md-close tag-icon-close"
            @click.stop="closeTag(tag)"
          />
        </span>
        <Input
          v-if="!disabled && !readonly && !(limit > 0) && selectConfig.addTag"
          :ref="`saveTagInput-${pageId}`"
          v-model="inputValue"
          class="input-new-tag el-input__inner"
          :class="{
            'input-empty-tag': vModel.length === 0
          }"
          :autosize="true"
          :type="type"
          :placeholder="vModel.length <= 0 ? placeholder : ''"
          :style="`width:${ vModel.length && !inputValue.includes('\n') > 0 ? inputWidth: '100%;'}`"
          @on-enter="addTagHand"
          @on-keyup="tagkeyup"
          @on-blur="blur"
        />
      </div>
      <div
        v-if="vModel.length"
        class="clearable-all"
      >
        <i
          class="ivu-icon ivu-icon-md-close tag-icon-close"
          title="清空"
          @click.stop="clearableHand"
        />
      </div>
    </template>
  </div>
</template>
<script>
/**
 * 方法 close 配置之后，点击关闭之后需自己处理， 参数返回 当前 tag
 * 方法 click， 参数返回 当前 tag
 * 方法 addTheTag  参数返回 当前输入值
 * disabled 是否禁用，数据类型 Boolean，默认值 false，若设置为 true 则禁用编辑
 * readonly 是否只读，数据类型 Boolean，默认值 false， 若设置为 true 则不能编辑
 * closable 是否显示关闭按钮, 数据类型 Boolean，默认值 true, 只读或禁用时失效
 * addTag 是否可自定义新增, 数据类型 Boolean，默认值 true, 只读或禁用时失效
 * limit 最多显示 tag 个数，数据类型 Number，默认值 0，设置大于 0 数字才生效，设置后内容不换行
 */
export default {
  name: 'dytTagInput',
  components: {},
  model: {
    prop: 'value',
    event: 'valueChange'
  },
  props: {
    value: {
      type: [Array, String],
      default: () => {
        return [];
      }
    },
    string: {
      type: Boolean, default: false
    },
    placeholder: {
      type: String,
      default: '请输入后按回车或使用 , 分隔'
    },
    limit: {
      type: Number,
      default: 0
    },
    disabled: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    addTag: {
      type: Boolean,
      default: true
    },
    // 对输入值进行分割字符集合
    split: {
      type: [String, Array],
      default: () => {
        return [',', '，', '\n']
      }
    },
    // 返回字符串时的分隔符号（string 为 true 时生效）
    separStr: { type: String, default: ',' },
    defaultProp: {
      type: Object,
      default: () => {
        return {}
      }
    },
    // 输入框的类型
    type: { type: String, default: 'text' },
    // 当 type 为 textarea 并且 limit 大于 0 生效， 下拉是否展示 tag 默认 false
    preview: { type: Boolean, default: false }
  },
  data () {
    return {
      pageId: Math.random().toString(36).substr(2),
      inputValue: '',
      vModel: [],
      inputWidth: '100%;',
      isFocus: false,
      popoverWidth: 200,
      isKeepShow: false,
      keepShowTime: -10,
      defaultConfig: {
        type: 'info',
        closable: true,
        size: 'small'
      }
    }
  },
  computed: {
    selectConfig () {
      let config = { ...this.defaultConfig, ...this.$attrs, addTag: this.addTag };
      if (this.disabled || this.readonly) {
        config.closable = false;
        config.addTag = false;
      }
      return config;
    }
  },
  watch: {
    value: {
      deep: true,
      immediate: true,
      handler (val) {
        if (this.string) {
          if (val === this.vModel.join(this.separStr)) return;
          this.vModel = this.$common.isEmpty(val) ? [] : val.split(this.separStr);
        } else {
          if (JSON.stringify(val) === JSON.stringify(this.vModel)) return;
          this.vModel = val;
        }
        // 赋值
        if (!this.preview && this.type === 'textarea' && this.limit > 0 && !this.isFocus) {
          this.inputValue = typeof val === 'string' ? val : this.$common.isEmpty(val) ? '' : this.vModel.join('\n');
        }
        this.inputWidth = this.$common.isEmpty(this.vModel) ? '100%;' : '50px;';
      }
    },
    vModel: {
      deep: true,
      handler (val) {
        this.$emit('valueChange', this.string ? val.join(this.separStr) : val);
        this.$emit('change', this.string ? val.join(this.separStr) : val);
      }
    },
    inputValue: {
      deep: true,
      handler (val) {
        this.inputWidth = this.initInputWidth(val);
      }
    }
  },
  created () {},
  mounted () {
    // 弹出宽度设置
    this.popoverWidthHand();
  },
  methods: {
    popoverWidthHand () {
      this.$nextTick(() => {
        this.$refs[`tag-${this.pageId}`] && (this.popoverWidth = this.$refs[`tag-${this.pageId}`].offsetWidth);
      })
    },
    initInputWidth (val) {
      if (this.limit > 0) return '';
      const cn = val.replace(/[^\u4e00-\u9fa5]/gi, '');
      const valLength = val.length;
      return `${val ? (cn.length * 14.2 + (valLength - cn.length) * 7 + 37) + 'px;' : '50px;'}`;
    },
    clickTag (tag) {
      this.$emit('click', tag);
    },
    // 清空
    clearableHand () {
      if(this.disabled) return;
      this.$emit('clearableHand');
      this.inputValue = '';
      this.vModel = [];
    },
    // 移除单个 tag
    closeTag (tag) {
      if(this.disabled) return;
      if (this.$listeners.close) {
        this.$emit('close', tag);
      } else {
        if (this.defaultProp.value) {
          this.vModel = this.vModel.filter(item => {
            return item[this.defaultProp.value] !== tag[this.defaultProp.value];
          })
        } else {
          this.vModel.splice(this.vModel.indexOf(tag), 1);
        }
      }
      if (this.limit > 0) {
        // 如果是多行文本，不清空输入值的情况
        if (!this.preview && this.type === 'textarea') {
          let index = this.inputValue.indexOf(tag);
          const newSplit = typeof this.split === 'string' ? [this.split] : this.split;
          if (index > -1) {
            let newTag = newSplit.filter(sp => {
              return this.inputValue.includes(`${this.inputValue.substr(index, tag.length)}${sp}`);
            });
            if (newTag[0]) {
              newTag = `${this.inputValue.substr(index, tag.length)}${newTag[0]}`;
              this.inputValue = `${this.inputValue.substr(0, index)}${this.inputValue.substr(index + newTag.length)}`;
            } else {
              this.inputValue = `${this.inputValue.substr(0, index)}${this.inputValue.substr(index + tag.length)}`;
            }
          }
        }
        this.isKeepShow = true;
        this.$refs[`popoverTagInput-${this.pageId}`] && this.$refs[`popoverTagInput-${this.pageId}`].focus();
        clearTimeout(this.keepShowTime);
        this.keepShowTime = setTimeout(() => {
          this.isKeepShow = false;
        }, 500)
      }
    },
    // 键盘事件
    tagkeyup (e) {
      this.$emit('keyup', e);
    },
    // 字符串分割
    strSplit (str, splitStr) {
      if (this.$common.isEmpty(str)) return [];
      if (typeof str !== 'string') return [str];
      if (typeof splitStr === 'string') return str.split(splitStr);
      if (this.$common.isArray(splitStr)) {
        if (splitStr.length === 0) return str;
        let newStr = str;
        const newSplit = splitStr[0];
        splitStr.slice(1).forEach(sp => {
          if (str.includes(sp)) {
            newStr = newStr.replace(new RegExp(sp, 'g'), newSplit);
          }
        });
        return newStr.split(newSplit).filter(item => !this.$common.isEmpty(item, true));
      }
      return [str];
    },
    //
    addTagHand (e) {
      if (e && e.key === 'Enter') {
        this.$emit('keyupEnter', e);
        if (this.type === 'textarea') return;
      }
      if (this.$common.isEmpty(this.inputValue)) {
        if (!this.preview && this.type === 'textarea' && this.limit > 0) {
          this.vModel = [];
        }
        return;
      }
      let addItems = this.strSplit(this.inputValue, this.split).map(item => item.trim());
      if (this.$listeners.addTheTag) {
        this.$emit('addTheTag', addItems);
        this.inputValue = '';
      } else {
        let newTags = [];
        if (this.defaultProp.value || this.defaultProp.label) {
          const keys = this.vModel.map(tag => {
            return tag[this.defaultProp.value || this.defaultProp.label];
          })
          addItems.forEach(item => {
            if (!keys.includes(item)) {
              let newTag = {};
              this.defaultProp.value && (newTag[this.defaultProp.value] = item);
              this.defaultProp.label && (newTag[this.defaultProp.label] = item);
              !this.$common.isEmpty(newTag) && newTags.push(newTag);
            }
          })
        }
        if (!this.preview && this.type === 'textarea' && this.limit > 0) {
          this.vModel = addItems;
        } else {
          this.vModel = [...this.vModel, ...(this.defaultProp.value ? newTags : addItems)];
          this.inputValue = '';
        }
      }
    },
    moreHand () {},
    // 失去焦点
    blur () {
      this.$refs[`saveTagInput-${this.pageId}`] && this.$refs[`saveTagInput-${this.pageId}`].blur();
      this.addTagHand();
      setTimeout(() => {
        !this.isKeepShow && (this.isFocus = false);
      }, 200)
    },
    // 获取焦点
    focus () {
      if (this.limit <= 0) {
        this.$refs[`saveTagInput-${this.pageId}`] && this.$refs[`saveTagInput-${this.pageId}`].focus();
        this.isFocus = (!this.disabled && !this.readonly && this.selectConfig.addTag);
      }
    },
    // 显示时触发
    popoverShow () {
      if(this.disabled) return;
      this.isFocus = true;
      this.$emit('show');
      this.$nextTick(() => {
        this.$refs[`popoverTagInput-${this.pageId}`] && this.$refs[`popoverTagInput-${this.pageId}`].focus();
        this.$emit('showAfter');
        this.popoverWidthHand();
      })
    },
    // 隐藏时触发
    popoverHide () {
      this.$emit('hide');
    },
    // 隐藏动画播放完毕后触发
    afterLeave () {
      this.$emit('hideAfter');
    }
  }
};
</script>
<style lang="less">
@font-size: 14px;
@inputHeight: 24px;
.dyt-input-tag-content{
  display: flex;
  padding: 3px 3px 0px 3px;
  min-width: 200px;
  width: 100%;
  min-height: 32px;
  line-height: 1em;
  -webkit-appearance: none;
  border: 1px solid #DCDFE6;
  box-sizing: border-box;
  color: #606266;
  font-size: inherit;
  background-color: #FFF;
  background-image: none;
  border-radius: 4px;
  transition: border-color .2s cubic-bezier(.645,.045,.355,1);
  &.dyt-tag-is-disabled{
    background-color: #f3f3f3;
    cursor: no-drop;
  }
  &.tag-is-disabled{
    display: none !important;
  }
  .ivu-poptip-content{
    width: 100%;
  }
  .default-tag-constent{
    width: calc(100% - 18px);
  }
  .clearable-all{
    padding-left: 5px;
    width: 18px;
    line-height: @inputHeight;
    text-align: center;
    &.poptip-clearable{
      i {
        top: 5px;
      }
    }
    i {
      top: 9px;
      border-radius: 100%;
      cursor: pointer;
      &:hover{
        color: #FFF;
        background-color: #909399;
      }
    }
  }
  &.ivu-poptip-popper{
    padding: 10px 0 0px 0;
    background: none;
    border: none;
  }
  &.tag-content-focus{
    border-color: #409EFF;
  }
  .tag-icon-close{
    position: absolute;
    right: initial;
    top: 4px;
    right: 3px;
    font-size: 14px;
    vertical-align: top;
  }
  .el-tag--small{
    padding: 0 3px;
    height: 24px;
    line-height: 22px;
  }
  .el-input__suffix{
      right: -2px;
      .el-input__icon{
        width: 16px;
      }
    }
  &.dyt-tag-content-limit{
    display: flex;
    .tag-limit{
      display: flex;
      flex: 100;
      width: calc(100% - 2px);
      overflow: hidden;
      .el-tag{
        position: relative;
        flex: 100;
        min-width: 60px;
        .el-icon-close{
          position: absolute;
          top: 50%;
          right: 0px;
          transform: scale(.8) translate(0, -60%) !important;
        }
      }
    }
    .more-tag{
      padding: 0 5px 0 0;
      color: #ddd;
      line-height: 25px;
    }
  }
  .el-tag{
    display: inline-block;
    position: relative;
    max-width: 100%;
    font-size: @font-size;
    cursor: pointer;
    overflow: hidden;

    border-width: 1px;
    border-style: solid;
    border-radius: 4px;
    box-sizing: border-box;
    white-space: nowrap;
    .el-tag-text{
      display: inline-block;
      max-width: 100%;
      white-space: nowrap;
      // white-space: pre;
      font-size: @font-size;
      text-overflow: ellipsis;
      overflow: hidden;
    }
    .el-icon-close{
      right: initial;
      top: 3px;
      font-size: @font-size;
      vertical-align: top;
    }
    &.el-tag--info{
      margin-bottom: 3px;
      margin-right: 5px;
      padding-right: 20px;
      background-color: #f4f4f5;
      border-color: #e9e9eb;
      color: #909399;
      vertical-align: top;
    }
  }
  .input-new-tag{
    min-width: 50px;
    max-width: 100%;
    outline: 0;
    font-size: 12px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    &.el-input__inner{
      &.input-empty-tag{
        padding: 0 7px;
      }
      .ivu-input{
        padding: 0;
        min-height: 24px;
        line-height: 24px;
        border: none;
        box-shadow: none;
        resize: none;
      }
      padding: 0 5px;
      min-height: 24px;
      line-height: 24px;
      border: none;
      box-shadow: none;
    }
  }
  .ivu-poptip-body{
    padding: 0;
  }
  .popover-content{
    padding: 0 12px;
    max-height: 300px;
    overflow-y: auto;
    overflow-x: hidden;
    white-space: pre-wrap;
  }
  .ivu-poptip{
    width: 100%;
  }
  .ivu-poptip-rel{
    display: flex;
    width: 100%;
  }
}
.tag-popper-content{
  max-width: 500px;
  padding-bottom: 4px;
  padding: 12px 0;
  .ivu-icon.ivu-icon-ios-close-circle.ivu-input-icon-clear{
    display: none;
  }
  .ivu-input{
    resize: none;
  }
  .el-tag{
    margin-right: 8px;
    margin-bottom: 8px;
    max-width: 100%;
    font-size: @font-size;
    cursor: pointer;
    overflow: hidden;
    .el-tag-text{
      display: inline-block;
      max-width: 100%;
      // white-space: nowrap;
      white-space: pre;
      text-overflow: ellipsis;
      overflow: hidden;
    }
    .el-icon-close{
      right: initial;
      top: 3px;
      vertical-align: top;
    }
  }
  .dyt-button-demo{
    width: calc(100% - 24px);
    margin-left: 12px;
    .el-icon-circle-check{
      display: none;
    }
  }
  .el-input__validateIcon{
    display: none;
  }
}
</style>
