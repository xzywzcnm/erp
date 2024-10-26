<template>
  <Modal v-model="pageVisible" title="1688尺码匹配" :mask-closable="false" width="850">
    <div class="modal-contain">
      <div class="contain-flex">
        <span>1688尺码：</span>
        <div class="flex-full">
          <Tag
            v-for="(tag, index) in groupByQuality"
            :key="`tag-${index}`"
            :color="selectName.includes(tag.attributeValue) ? 'blue' : 'red'" 
          >{{ tag.attributeValue }}</Tag>
        </div>
      </div>
      <div class="module-title">匹配情况：</div>
      <div v-for="(size, index) in groupByQuality" :key="`size-${index}`" class="match-content">
        <span>
          1688尺码
          <Tag color="default">{{ size.attributeValue }}</Tag>
        </span>
        <span>{{ `--->${sizeGroupName}`}}</span>
        <dyt-select
          v-model="selectItem[size.attributeValue]"
          class="match-select"
          v-if="inited"
        >
          <Option
            v-for="(item, sIndex) in sizeList"
            :key="`option-${sIndex}`"
            :value="item.sizeId"
            :disabled="item.disabled && selectItem[size.attributeValue] != item.sizeId"
          >{{item.size}}</Option>
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
      inited: false,
      // 尺码对象
      sizeObj: {},
      // 匹配到的尺码
      selectItem: {}
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
    pageVisible : {
      deep: true,
      handler (newVal) {
        this.$emit('update:modelVisible', newVal);
        if (newVal) return;
        this.resetData();
      },
      
    }
  },
  computed: {
    // 1688 尺码信息
    groupByQuality () {
      if (this.$common.isEmpty(this.modelData.groupByQuality)) return [];
      return this.modelData.groupByQuality;
    },
    // 选中的尺码组信息
    selectSizeGroup () {
      if (this.$common.isEmpty(this.modelData.selectSizeGroup)) return {};
      return this.modelData.selectSizeGroup;
    },
    // 尺码组名称
    sizeGroupName () {
      return this.selectSizeGroup.sizeName || '';
    },
    // 选中的尺码价格
    pricelist () {
      if (this.$common.isEmpty(this.modelData.pricelist)) return [];
      return this.modelData.pricelist;
    },
    // 上传选中的值
    originalVal () {
      if (this.$common.isEmpty(this.modelData.originalVal)) return [];
      return this.modelData.originalVal;
    },
    // 选择尺码组的尺码列表
    sizeList () {
      if (this.$common.isEmpty(this.selectSizeGroup.list)) return [];
      const selectVal = Object.values(this.selectItem);
      return this.selectSizeGroup.list.map((size) => {
        return {
          ...size,
          disabled: selectVal.includes(size.sizeId)
        }
      });
    },
    // 匹配到的1688尺码名称
    selectName () {
      const oldVal = Object.keys(this.selectItem).filter(item => {
        return !this.$common.isEmpty(this.selectItem[item])
      })
      return this.$common.arrRemoveRepeat([...this.pricelist.map(m => m.size), ...oldVal]);
    }
  },
  methods: {
    // 初始化数据
    initData () {
      this.$nextTick(() => {
        this.sizeList.forEach(size => {
          this.$set(this.sizeObj, size.size, size);
        });
        const originalKey = Object.keys(this.originalVal);
        this.groupByQuality.forEach((item) => {
          const val = this.$common.isEmpty(this.originalVal[item.attributeValue]) ? null : this.originalVal[item.attributeValue];
          if (originalKey.includes(item.attributeValue)) {
            this.$set(this.selectItem, item.attributeValue, val);
          } else if (!this.$common.isEmpty(this.sizeObj[item.attributeValue])) {
            this.$set(this.selectItem, item.attributeValue, this.sizeObj[item.attributeValue].sizeId);
          } else {
            this.$set(this.selectItem, item.attributeValue, null);
          }
        });
        this.$nextTick(() => {
          this.inited = true;
        })
      })
    },
    // 重置数据
    resetData () {
      this.pageLoading = false;
      this.inited = false;
      this.selectItem = {};
    },
    // 清空匹配信息
    clearMatch () {
      this.selectItem = Object.keys(this.selectItem).map(key => {
        return { [key]: null }
      })
    },
    // 确定
    handleSubmit () {
      // const sizeIds = Object.values(this.selectItem).filter(item => !this.$common.isEmpty(item));
      const originaKeys = Object.keys(this.selectItem);
      const originalVal = this.groupByQuality.filter(item => {
        return originaKeys.includes(item.attributeValue) && !this.$common.isEmpty(this.selectItem[item.attributeValue]);
      }).map(m => {
        return {
          ...m,
          sizeId: this.selectItem[m.attributeValue],
          prices: m.price
        }
      })
      this.$emit('sizeConfirm', {sizeIds: originalVal.map(m => m.sizeId), sizeGroup: this.selectSizeGroup, originalVal: originalVal });
      this.$nextTick(() => {
        this.pageVisible = false;
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