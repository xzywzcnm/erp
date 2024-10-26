<template>
  <div>
    <Modal
      v-model="isVisible"
      title="水洗唛标识编辑"
      :mask-closable="false"
      width="640px"
    >
      <CheckboxGroup v-model="checkWashedTag" class="wash-checkbox-group">
        <Checkbox
          v-for="(wash, wIndex) in Object.values(checkWashedData)"
          :key="`wash-${wIndex}`"
          :label="wash.value"
          class="wash-checkbox-item"
        >
          <img :src="wash.image" width="80" />
          <div>{{ wash.label }}</div>
        </Checkbox>
      </CheckboxGroup>
      <div slot="footer">
        <Button @click="isVisible = false">取 消</Button>
        <Button type="primary" @click="confirmWashedSgin">确 定</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import { checkWashedData } from './productData';

export default {
  name: "washedSginModal",
  components: {},
  mixins: [],
  props: {
    modelVisible: {
      type: Boolean,
      default: false
    },
    moduleData: {
      type: Array,
      default () {
        return [];
      }
    }
  },
  data () {
    return {
      checkWashedData: checkWashedData,
      checkWashedTag: [],
      isVisible: false
    };
  },
  watch: {
    modelVisible (newVal) {
      if (newVal) this.open();
    },
    isVisible (newVal) {
      this.$emit('update:modelVisible', newVal);
      !newVal && this.closeModal();
    }
  },
  computed: {},
  methods: {
    // 打开窗口
    open () {
      this.isVisible = this.modelVisible;
      this.initData();
    },
    // 关闭弹窗
    closeModal () {
      this.checkWashedTag = [];
    },
    // 数据初始化
    initData () {
      this.checkWashedTag = this.moduleData;
    },
    // 确定
    confirmWashedSgin () {
      this.$emit('confirmModal', this.checkWashedTag);
      this.$nextTick(() => {
        this.isVisible = false;
      })
    }
  }
};
</script>
<style lang="less" scoped>
.wash-checkbox-group{
  .wash-checkbox-item{
    position: relative;
    padding-top: 6px;
    padding-right: 20px;
    display: inline-block;
    text-align: center;
    margin-right: 10px;
    &:last-child{
      margin-right: 0;
    }
    :deep(.ivu-checkbox){
      position: absolute;
      right: 5px;
    }
  }
}
</style>
