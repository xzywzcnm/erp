<template >
  <Modal v-model="pageVisible" title="优先级调整" :mask-closable="false" width="600">
    <div class="modal-body-main">
      <Form
        ref="formRefDemo"
        label-position="right"
        :model="formData"
        :rules="ruleValidate"
        :label-width="80"
        class="modal-form-main"
      >
        <Form-item label="规则名称：" class="not-margin-bottom">
          <span class="pre-wrap-item">{{ choseRow.name || '' }}</span>
        </Form-item>
        <div class="main-title mt10 mb15">优先级调整至</div>
        <div class="flex-main">
          <Form-item label="" :label-width="0" prop="ruleItemIndex" style="flex: 100;">
            <dyt-select v-model="formData.ruleItemIndex">
              <Option
                class="pre-wrap-item"
                v-for="(row, index) in tableList"
                :value="row.sortIndex"
                :key="`sort-${index}`"
                :label="row.name"
                :disabled="choseRow.sortIndex == row.sortIndex"
              />
            </dyt-select>
          </Form-item>
          <Form-item label="" :label-width="0" prop="location" class="ml5" style="width: 100px;">
            <dyt-select v-model="formData.location" :clearable="false" :filterable="false">
              <Option v-for="(item, index) in locaList" :value="item.value" :key="`loca-${index}`" :label="item.label" />
            </dyt-select>
          </Form-item>
        </div>
      </Form>
    </div>
    <div slot="footer">
      <Button type="primary" @click="modalConfirm" :disabled="pageLoading">确定</Button>
      <Button @click="closeModal">取消</Button>
    </div>
    <Spin v-if="pageLoading" fix></Spin>
  </Modal>
</template>
<script>

export default {
  name: 'ruleSortModal',
  props: {
    modelVisible: { type: Boolean, default: false },
    modelData: {
      type: Object,
      default () {
        return {
          rowIndex: null,
          tableList: [],
          row: {}
        }
      }
    }
  },
  data () {
    return {
      pageLoading: true,
      pageVisible: false,
      // 表单数据
      formData: {
        ruleItemIndex: null,
        location: '2'
      },
      // 表单验证规则
      ruleValidate: {
        ruleItemIndex: [
          { required: true, msg: '请选择', validator: this.$common.formItemVerify, trigger: 'change' },
        ]
      },
      // 调整位置数据
      locaList: [
        { label: '前', value: '1' },
        { label: '后', value: '2' }
      ]
    }
  },
  watch: {
    modelVisible: {
      deep: true,
      immediate: true,
      handler (newVal) {
        this.pageVisible = newVal;
        if (!newVal) return;
        this.pageLoading = true;
        this.$nextTick(() => {
          setTimeout(() => {
            this.initData();
          }, 300)
        })
      }
    },
    pageVisible: {
      deep: true,
      handler (newVal) {
        this.$emit('update:modelVisible', newVal);
        if (newVal) return;
        this.resetData();
      }
    },
  },
  computed: {
    // 选中的行
    choseRow () {
      if (this.$common.isEmpty(this.modelData) || this.$common.isEmpty(this.modelData.row)) return {};
      return this.modelData.row;
    },
    // 列表所有数据
    tableList () {
      if (this.$common.isEmpty(this.modelData) || this.$common.isEmpty(this.modelData.tableList)) return [];
      return this.modelData.tableList;
    }
  },
  methods: {
    initData () {
      this.$refs.formRefDemo && this.$refs.formRefDemo.resetFields();
      this.$nextTick(() => {
        this.pageLoading = false;
      })
    },
    // 重置数据
    resetData () {
      this.$refs.formRefDemo && this.$refs.formRefDemo.resetFields();
      this.pageLoading = true;
    },
    // 确定
    modalConfirm () {
      if (this.pageLoading) return;
      this.$refs.formRefDemo.validate((valid) => {
        if (!valid) return;
        let newIndex = this.formData.ruleItemIndex;
        const oldIndex = this.choseRow.sortIndex;
        if (oldIndex > this.formData.ruleItemIndex) {
          if ([2].includes(Number(this.formData.location))) {
            newIndex = this.formData.ruleItemIndex + 1;
          }
        } else {
          if ([1].includes(Number(this.formData.location))) {
            newIndex = this.formData.ruleItemIndex - 1;
          }
        }
        if (newIndex == oldIndex) {
          this.$Message.success('修改成功');
          this.closeModal();
          return;
        }
        this.pageLoading = true;
        this.$emit('modalConfirm', {
          newIndex: newIndex,
          oldIndex: oldIndex,
          callBack: (val) => {
            this.pageLoading = false;
            val && this.closeModal();
          }
        });
      })
    },
    // 关闭弹窗
    closeModal () {
      this.pageVisible = false;
    }
  }
};
</script>
<style lang="less" scoped>
.modal-body-main{
  position: relative;
  .modal-form-main{
    :deep(.ivu-form-item) {
      &.not-margin-bottom{
        margin: 0;
      }
      .ivu-form-item-label{
        font-size: 14px;
        padding-right: 5px;
      }
    }
  }
  .main-title{
    font-size: 20px;
    font-weight: bold;
  }
  .flex-main{
    display: flex;
    width: 400px;
  }
}
.pre-wrap-item{
  white-space: pre-wrap;
}
</style>
