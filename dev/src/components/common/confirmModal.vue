<template>
  <Modal
    v-model="isVisible"
    :mask-closable="false"
    :title="modalTitle"
    :width="modalWidth"
    class-name="confirm-modal-class"
  >
    <div class="modal-body-main">
      <slot name="content">
        <div v-if="isHtml" v-html="tipsContent" />
        <div v-else>{{ tipsContent }}</div>
      </slot>
      <Spin fix v-if="loading"></Spin>
    </div>
    <div slot="footer">
      <slot name="footer">
        <Button @click="closeModal">取 消</Button>
        <Button type="primary" @click="modalConfirm" :loading="loading">确 定</Button>
      </slot>
    </div>
  </Modal>
</template>
<script>

export default {
  name: "signSkuaAwait",
  components: {},
  mixins: [],
  props: {
    modelVisible: {
      type: Boolean,
      default: false
    },
    moduleData: {
      type: Object,
      default () {
        return { };
      }
    },
    loading: {
      type: Boolean,
      default: false
    },
  },
  data () {
    return {
      isVisible: false
    };
  },
  watch: {
    modelVisible (val) {
      this.isVisible = val;
    },
    isVisible (val) {
      this.$emit('update:modelVisible', val);
      !val && this.closeModal();
    }
  },
  computed: {
    // 标题
    modalTitle () {
      if (this.$common.isEmpty(this.moduleData) || this.$common.isEmpty(this.moduleData.title)) return '';
      return this.moduleData.title;
    },
    // 宽度
    modalWidth () {
      if (this.$common.isEmpty(this.moduleData) || this.$common.isEmpty(this.moduleData.width)) return '300px';
      return this.moduleData.width;
    },
    // 内容
    tipsContent () {
      if (this.$common.isEmpty(this.moduleData) || this.$common.isEmpty(this.moduleData.content)) return '';
      return this.moduleData.content;
    },
    isHtml () {
      if (this.$common.isEmpty(this.moduleData) || this.$common.isEmpty(this.moduleData.isHtml)) return false;
      return this.$common.isBoolean(this.moduleData.isHtml) ? this.moduleData.isHtml : false;
    }
  },
  methods: {
    // 关闭弹窗
    closeModal () {
      this.isVisible = false;
      this.$emit('closeConfirm');
    },
    // 确认
    modalConfirm () {
      this.$emit('modalConfirm');
    }
  }
};
</script>
<style lang="less" scoped>
.modal-body-main{
  position: relative;
  padding: 0 15px;
}
</style>
<style lang="less">
.confirm-modal-class{
  .ivu-modal{
    position: relative;
    max-width: 90%;
  }
}
</style>
