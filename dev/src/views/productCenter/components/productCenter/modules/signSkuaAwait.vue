<template>
  <Modal
    v-model="isVisible"
    :title="modalTitle"
    :mask-closable="false"
    width="400px"
    class-name="bindSizeGroupModal"
  >
    <div class="modal-body-main">
      <div class="mt5 batch-tips">
        <div>选中的待办项标记已处理后，将不再进行展示且不可见，是否确认标记已处理</div>
        <div class="mt10 tips-error" v-if="isBatchEdit">选中的待办项：{{ rowList.length }} 条</div>
      </div>
      <Spin fix v-if="pageLoading">正在处理数据中...</Spin>
    </div>
    <div slot="footer">
      <Button @click="closeModal">取 消</Button>
      <Button type="primary" @click="modalConfirm" :loading="pageLoading">确 定</Button>
    </div>
  </Modal>
</template>
<script>
import api from '@/api/api';

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
        return { rows: [], type: 'single' };
      }
    }
  },
  data () {
    return {
      isVisible: false,
      pageLoading: false
    };
  },
  watch: {
    modelVisible (newVal) {
      this.isVisible = newVal;
    },
    isVisible (newVal) {
      this.$emit('update:modelVisible', newVal);
      !newVal && this.closeModal();
    }
  },
  computed: {
    isBatchEdit () {
      if (this.$common.isEmpty(this.moduleData) || this.$common.isEmpty(this.moduleData.type)) return false;
      return this.moduleData.type == 'batch';
    },
    modalTitle () {
      return this.isBatchEdit ? '批量标记已处理' : '标记已处理';
    },
    rowList () {
      if (this.$common.isEmpty(this.moduleData) || this.$common.isEmpty(this.moduleData.rows)) return [];
      return this.moduleData.rows;
    },
    rowIds () {
      return this.rowList.map(item => item.productBacklogId);
    }
  },
  methods: {
    // 关闭弹窗
    closeModal () {
      this.isVisible = false;
    },
    // 确认
    modalConfirm () {
      if (this.pageLoading) return;
      this.pageLoading = true;
      this.axios.post(api.skuAwaitBatchHandle, this.rowIds).then((res) => {
        if (!res || !res.data || res.data.code != 0) return;
        this.$Message.success('标记成功');
        // 刷新列表
        this.$emit('refreshTable');
        this.$nextTick(() => {
          this.isVisible = false;
        })
      }).finally(() => {
        this.pageLoading = false;
      })
    }
  }
};
</script>
<style lang="less" scoped>
.modal-body-main{
  position: relative;
  .batch-tips{
    padding: 0 15px;
  }
  .tips-error{
    color: #f20;
  }
}
</style>
<style lang="less">
.bindSizeGroupModal{
  .ivu-modal{
    position: relative;
    max-width: 1000px;
  }
}
</style>
