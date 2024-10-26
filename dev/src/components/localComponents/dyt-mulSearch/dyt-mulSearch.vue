<template>
  <div class="dytMulSearchPage">
    <div class="contents">
      <Input v-show="comBtnType == 1" v-model="inputModel" v-bind="bindConfig" class="singleInput" />
      <dyt-inputTag v-show="comBtnType == 2" v-model="textareaModel" v-bind="bindConfig" :limit="1" type="textarea" />
    </div>
    <Button class="btn" @click="inputChange">
      {{ comBtnType == 1 ? '模糊' : '精确' }}
    </Button>
  </div>
</template>
<script>

export default {
  name: 'DytMulSearch',
  props: {
    preciseValue: {//精准查询
      type: Array,
      default() {
        return [];
      },
    },
    vagueValue: {//模糊查询
      type: String,
      default: ''
    },
    btnType: { //默认类型
      type: Number,
      default: 2
    }
  },
  data() {
    return {
      inputModel: '',
      textareaModel: [],
      comBtnType: 1,
      compareInputModel: '',
    }
  },
  computed: {
    bindConfig() {
      let config = {
        placeholder: '请输入',
        clearable: true,
      };
      return Object.assign({}, config, this.$attrs);
    },
  },
  watch: {
    btnType: {
      immediate: true,
      handler(val) {
        this.comBtnType = val;
      }
    },
    inputModel: {
      handler(val, oval) {
        if (JSON.stringify(val) === JSON.stringify(oval)) return;
        this.$emit('update:vagueValue', val);
      },
      deep: true,
    },
    textareaModel: {
      handler(val, oval) {
        if (JSON.stringify(val) === JSON.stringify(oval)) return;
        this.$emit('update:preciseValue', val);
      },
      deep: true,
    },
    preciseValue: {
      handler(val, oval) {
        if (JSON.stringify(val) === JSON.stringify(oval)) return;
        this.textareaModel = val;
      },
      deep: true,
    },
    vagueValue: {
      handler(val, oval) {
        if (JSON.stringify(val) === JSON.stringify(oval)) return;
        this.inputModel = val;
      },
      deep: true,
    },
  },
  methods: {
    // 切换输入方式
    inputChange() {
      this.inputModel = '';
      this.textareaModel = [];
      this.comBtnType = this.comBtnType == 1 ? 2 : 1;
    },
  }
};
</script>
<style lang="less">
.dytMulSearchPage {
  display: flex;
  align-items: center;

  .contents {
    flex: 1;
    overflow: hidden;
    line-height: 30px;

    .singleInput {
      font-size: 12px;
    }
  }

  .ivu-input {
    border-radius: 4px 0 0 4px !important;
  }

  .dyt-input-tag-content {
    min-width: auto;
    border-radius: 4px 0 0 4px;
  }

  .btn {
    border-left: none;
    border-radius: 0 4px 4px 0;
    padding: 0 9px;

    &,
    &:hover,
    &:active {
      background: transparent;
      border-color: #DCDFE6;
    }

    &:focus {
      box-shadow: none;
    }
  }
}
</style>
