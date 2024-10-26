<template>
  <Modal
    :title="modalTitle"
    class="batch-update-remark"
    v-model="modalVisible"
    width="600px"
  >
    <Form ref="batchRemarkForm" :model="fromData" :rules="fromRule" :label-width="80">
      <FormItem label="备注" prop="remarkContent">
        <Input
          v-model="fromData.remarkContent"
          type="textarea"
          :disabled="loading"
          :autosize="{minRows: 4, maxRows: 8}"
          placeholder="请输入备注, 最多 200 字符"
        />
        <!-- show-word-limit -->
      </FormItem>
      <Spin v-if="loading" fix></Spin>
    </Form>
    <div slot="footer">
      <Button @click="modalVisible = false">取 消</Button>
      <Button @click="confirm" type="primary" :loading="loading">确 认</Button>
    </div>
  </Modal>
</template>
<script>
// import api from '@/api/api';

export default {
  name: 'batchRemarkModal',
  components: {},
  props: {
    moduleVisible: { type: Boolean, default: false },
    moduleData: {
      type: Object,
      default: () => {
        return {
          filterParams: {},
          url: ''
        }
      }
    }
  },
  data () {
    return {
      modalVisible: false,
      loading: false,
      fromData: {
        remarkContent: ''
      },
      fromRule: {
        remarkContent: [
          { required: true, validator: this.validateRemark, trigger: 'change' },
          { required: true, validator: this.validateRemark, trigger: 'blur' }
        ]
      },
      oldFromData: {}
    }
  },
  watch: {
    moduleVisible: {
      deep: true,
      immediate: true,
      handler (val) {
        this.modalVisible = val;
        this.$nextTick(() => {
          val && this.initData();
        })
      }
    },
    modalVisible: {
      deep: true,
      handler (val) {
        this.$emit('update:moduleVisible', val);
        this.$nextTick(() => {
          !val && this.closeModal();
        })
      }
    }
  },
  computed: {
    upateUrl () {
      return this.moduleData.url;
    },
    filterParams () {
      return this.moduleData.filterParams;
    },
    modalTitle () {
      if (this.$common.isEmpty(this.moduleData.titl)) return '批量订单备注';
      return this.moduleData.title;
    }
  },
  created () {},
  mounted () {},
  methods: {
    // 初始化数据
    initData () {
      this.oldFromData = this.$common.copy(this.fromData);
    },
    // 确认保存
    confirm () {
      if (this.loading) return;
      this.$refs.batchRemarkForm.validate((valid) => {
        if (!valid) return;
        this.loading = true;
        this.axios.post(this.upateUrl, {
          ...this.filterParams,
          ...this.fromData
        }).then((res) => {
          this.loading = false;
          if (res && res.data && res.data.code === 0) {
            this.$Message.success("操作成功");
            this.modalVisible = false;
            this.$emit('updateList');
          }
        }).catch(() => {
          this.loading = false;
        })
      })
    },
    // 关闭弹窗时，重置数据
    closeModal () {
      this.fromData = this.$common.copy(this.oldFromData);
      this.$nextTick(() => {
        this.$refs.batchRemarkForm.resetFields();
      })
    },
    // 验证备注
    validateRemark (rule, value, callback) {
      if (this.$common.isEmpty(value)) return callback(new Error('请输入备注信息'));
      if (value.length > 200) return callback(new Error('备注信息最多可输入 200 字符'));
      callback();
    }
  }
};
</script>
<style lang="less" scoped>
.batch-update-remark{
  position: relative;
}
</style>
