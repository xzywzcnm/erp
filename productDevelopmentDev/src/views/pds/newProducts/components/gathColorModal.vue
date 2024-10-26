<template>
  <Modal v-model="pageVisible" title="1688颜色匹配" :mask-closable="false" width="80%">
    <div class="modal-contain">
      <div class="contain-flex">
        <span>1688颜色：</span>
        <div class="flex-full">
          <Tag
            v-for="(tag, index) in groupByColor"
            :key="`tag-${index}`"
            :color="selectName.includes(tag.attributeValue) ? 'blue' : 'red'" 
          >{{ tag.attributeValue }}</Tag>
        </div>
      </div>
      <div class="module-title">匹配情况：</div>
      <div v-for="(item, index) in groupByColor" :key="`color-${index}`" class="match-content">
        <span>
          1688颜色
          <Tag color="default">{{ item.attributeValue }}</Tag>
        </span>
        <span>{{ `---> ERP颜色`}}</span>
        <dyt-select
          v-model="selectItemVal[item.attributeValue]"
          class="match-select"
          v-if="inited"
        >
          <Option
            v-for="(option, sIndex) in allColorData"
            :key="`option-${sIndex}`"
            :value="option.colorId"
            :disabled="option.disabled && selectItemVal[item.attributeValue] != option.colorId"
          >{{ option.color }}</Option>
        </dyt-select>
      </div>

    </div>
    <div slot="footer">
      <Button @click="pageVisible = false">取消</Button>
      <Button @click="clearMatch">清空匹配信息</Button>
      <Button type="primary" @click="handleSubmit">确定</Button>
    </div>
    <Spin v-if="pageLoading" fix></Spin>
  </Modal>
</template>

<script>
// import api from '@/api/api.js';

export default {
  name: 'gathSizeModal',
  props: {
    modelVisible: {type: Boolean, default: false},
    modelData: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  data () {
    return {
      pageVisible: false,
      pageLoading: false,
      allColorJson: {},
      selectItemVal: {},
      inited: false,
    };
  },
  watch: {
    modelVisible: {
      handler (newVal) {
        this.pageVisible = newVal;
        if (!newVal) return;
        this.$nextTick(() => {
          this.initData();
        })
      },
      deep: true,
      immediate: true
    },
    pageVisible: {
      deep: true,
      handler (newVal) {
        this.$emit('update:modelVisible', newVal);
        if (newVal) return;
        this.resetData();
      }
    },
    colorList: {
      deep: true,
      handler (newVal) {
        this.$common.copy(newVal || []).forEach((item) => {
          this.$set(this.allColorJson, item.colorId, item);
        })
      }
    },
  },
  computed: {
    // 采集到的颜色信息
    groupByColor () {
      if (this.$common.isEmpty(this.modelData.groupByColor)) return [];
      return this.modelData.groupByColor;
    },
    // 已选的颜色信息
    selectColor () {
      if (this.$common.isEmpty(this.modelData.selectColor)) return [];
      return this.modelData.selectColor;
    },
    // 当前分类绑定的所有颜色
    colorList () {
      if (this.$common.isEmpty(this.modelData.colorList)) return [];
      return this.modelData.colorList;
    },
    // 颜色下拉
    allColorData () {
      const selectId = Object.values(this.selectItemVal);
      return this.colorList.map(item => {
        return {
          ...item,
          disabled: selectId.includes(item.colorId)
        }
      });
    },
    // 匹配到的1688尺码名称
    selectName () {
      const oldVal = Object.keys(this.selectItemVal).filter(item => {
        return !this.$common.isEmpty(this.selectItemVal[item]);
      })
      return oldVal;
    }
  },
  methods: {
    // 初始化数据
    initData () {
      this.groupByColor.forEach((item) => {
        this.$set(this.selectItemVal, item.attributeValue, null);
      })
      this.selectColor.forEach((item) => {
        this.$set(this.selectItemVal, item.color, item.colorId);
      })
      this.inited = true;
    },
    // 重置数据
    resetData () {
      this.pageLoading = false;
      this.inited = false;
      this.selectItemVal = {};
    },
    // 确定
    handleSubmit () {
      const originaKeys = Object.keys(this.selectItemVal);
      const originalVal = this.groupByColor.filter(item => {
        return originaKeys.includes(item.attributeValue) && !this.$common.isEmpty(this.selectItemVal[item.attributeValue]);
      }).map(m => {
        return {
          ...m,
          color: this.allColorJson[this.selectItemVal[m.attributeValue]].color,
          colorId: this.selectItemVal[m.attributeValue]
        }
      })
      this.$emit('colorConfirm', {
        colorIds: originalVal.map(m => m.colorId),
        originalVal: originalVal
      });
      this.$nextTick(() => {
        this.pageVisible = false;
      })
    },
    // 清空匹配信息
    clearMatch () {
      this.selectItemVal = Object.keys(this.selectItemVal).map(key => {
        return { [key]: null }
      })
    }
  }
};
</script>

<style lang="less" scoped>
.modal-contain{
  position: relative;
  .contain-flex{
    display: flex;
    .flex-full{
      flex: 100
    }
  }
  .module-title{
    padding: 10px 0;
    font-size: 16px;
    font-weight: bold;
  }
  .match-content{
    margin-bottom: 10px;
    padding-left: 50px;
    .match-select{
      width: 150px;
      margin-left: 5px;
    }
  }
}
</style>