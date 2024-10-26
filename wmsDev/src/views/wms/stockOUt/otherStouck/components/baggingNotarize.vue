<template>
  <Modal
    title="装袋确认"
    class="modal-visible-windows"
    v-model="modalVisible"
    width="600px"
  >
    <Form ref="modalRefForm" :model="fromData" :rules="fromRule" :label-width="100">
      <FormItem label="物流商单号" prop="logisticsProvidersNo">
        <Input
          v-model="fromData.logisticsProvidersNo"
          :disabled="loading"
          placeholder="请输入物流商单号"
        />
        <!-- show-word-limit -->
      </FormItem>
      <Spin v-if="loading" fix></Spin>
    </Form>
    <div class="error-txt">PS：请确认出库单总数，确认后不可重新上传和修改</div>
    <div slot="footer">
      <Button @click="modalVisible = false">取 消</Button>
      <Button @click="confirm" type="primary" :loading="loading">确 认</Button>
    </div>
  </Modal>
</template>
<script>
import api from '@/api/api';

export default {
  name: 'batchRemarkModal',
  components: {},
  props: {
    moduleVisible: { type: Boolean, default: false },
    moduleData: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
      modalVisible: false,
      loading: false,
      fromData: {
        logisticsProvidersNo: ''
      },
      fromRule: {
        logisticsProvidersNo: [
          { required: true, validator: this.validateLogisticsProvidersNo, trigger: 'change' },
          { required: true, validator: this.validateLogisticsProvidersNo, trigger: 'blur' }
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
  computed: {},
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
      this.$refs.modalRefForm.validate((valid) => {
        if (!valid) return;
        this.loading = true;
        this.axios.post(`${api.checkUploadPackage}${this.fromData.logisticsProvidersNo}`).then(({ data }) => {
          this.loading = false;
          if (data && data.code === 0) {
            this.modalVisible = false;
            this.$emit('refreshList');
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
        this.$refs.modalRefForm.resetFields();
      })
    },
    // 验证
    validateLogisticsProvidersNo (rule, value, callback) {
      if (this.$common.isEmpty(value)) {
        return callback(new Error('请输入物流商单号'));
      }
      callback();
    }
  }
};
</script>
<style lang="less" scoped>
.modal-visible-windows{
  position: relative;
}
.error-txt {
  margin-top: 50px;
  color: #ed4014;
}
</style>
