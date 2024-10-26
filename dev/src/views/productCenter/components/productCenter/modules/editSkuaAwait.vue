<template>
  <Modal
    v-model="isVisible"
    :title="modalTitle"
    :mask-closable="false"
    width="600px"
    class-name="bindSizeGroupModal"
  >
    <div class="modal-body-main">
      <Form ref="modalFormRef" :rules="ruleValidate" :model="formData" :label-width="100" label-position="right">
        <Form-item label="待办项名称" prop="backlogName" :class="`${isBatchEdit ? '' : 'ivu-form-item-required'}`">
          <dytInput placeholder="请输入待办项名称" v-model="formData.backlogName" />
        </Form-item>
        <Form-item label="备注" prop="remark" :class="`${isBatchEdit ? '' : 'ivu-form-item-required'}`">
          <dytInput placeholder="请输入备注" v-model="formData.remark" type="textarea" :rows="3" />
        </Form-item>
        <Form-item label="到期时间" prop="expireTime" :class="`${isBatchEdit ? '' : 'ivu-form-item-required'}`">
          <DatePicker
            transfer
            :editable="false"
            style="width: 100%"
            v-model="formData.expireTime"
            placeholder="请选择到期时间"
            type="datetime"
            format="yyyy-MM-dd HH:mm:ss"
            placement="bottom-start"
          />
        </Form-item>
      </Form>
      <div v-if="isBatchEdit" class="mt5 batch-tips">
        <div>注意：批量修改将会修改选中的待办项，无需修改的项留空即可</div>
        <div class="mt10 tips-error">选中的待办项：{{ rowList.length }} 条</div>
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
  name: "editSkuaAwait",
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
      pageLoading: false,
      formData: {
        backlogName: '',
        remark: '',
        expireTime: ''
      },
      // 表单验证
      ruleValidate: {
        backlogName: [
          {
            getRequired: () => {
              return !this.isBatchEdit;
            },
            validator: this.$common.strMaxVerify,
            maxLength: 10,
            msg: '请输入待办项名称',
            trigger: 'blur'
          },
          {
            getRequired: () => {
              return !this.isBatchEdit;
            },
            validator: this.$common.strMaxVerify,
            maxLength: 10,
            msg: '请输入待办项名称',
            trigger: 'change'
          }
        ],
        remark: [
          {
            getRequired: () => {
              return !this.isBatchEdit;
            },
            validator: this.$common.strMaxVerify,
            maxLength: 200,
            msg: '请输入备注',
            trigger: 'blur'
          },
          {
            getRequired: () => {
              return !this.isBatchEdit;
            },
            validator: this.$common.strMaxVerify,
            maxLength: 200,
            msg: '请输入备注',
            trigger: 'change'
          }
        ],
        expireTime: [
          {
            getRequired: () => {
              return !this.isBatchEdit;
            },
            validator: this.$common.formItemVerify,
            msg: '请选择到期时间',
            trigger: 'change'
          }
        ]
      },
    };
  },
  watch: {
    modelVisible (newVal) {
      // if (newVal) this.open();
      this.isVisible = newVal;
      this.$nextTick(() => {
        setTimeout(() => {
          newVal && this.initData();
        }, 100);
      })
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
      return this.isBatchEdit ? '批量编辑待办项' : '编辑待办项';
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
    initData () {
      if (!this.isBatchEdit) {
        const choseRow = this.rowList[0];
        if (this.$common.isEmpty(choseRow)) return;
        this.formData.backlogName = choseRow.backlogName;
        this.formData.remark = choseRow.remark;
        this.formData.expireTime = choseRow.expireTime;
      }
    },
    // 关闭弹窗
    closeModal () {
      this.$refs.modalFormRef && this.$refs.modalFormRef.resetFields();
      this.$nextTick(() => {
        this.$refs.modalFormRef && this.$refs.modalFormRef.resetFields();
        setTimeout(() => {
          this.$refs.modalFormRef && this.$refs.modalFormRef.resetFields();
        }, 500);
      });
      this.isVisible = false;
    },
    // 确认
    modalConfirm () {
      if (this.pageLoading) return;
      this.$refs.modalFormRef.validate((valid) => {
        if (!valid) return this.$Message.error('验证不通过');
        let formData = this.$common.copy(this.formData);
        formData.expireTime = this.$common.toLocaleDate(formData.expireTime, 'fulltime', 0);
        if (this.isBatchEdit) {
          formData.productBacklogIdList = this.rowIds;
        } else {
          formData.productBacklogId = this.rowIds[0];
        }
        this.pageLoading = true;
        this.axios.post(this.isBatchEdit ? api.skuAwaitBatchEdit : api.skuAwaitEdit, formData).then((res) => {
          if (!res || !res.data || res.data.code != 0) return;
          this.$Message.success('修改成功');
          // 刷新列表
          this.$emit('refreshTable');
          this.$nextTick(() => {
            this.isVisible = false;
          })
        }).finally(() => {
          this.pageLoading = false;
        })
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
