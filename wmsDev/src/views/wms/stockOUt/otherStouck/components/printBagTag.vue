<template>
  <Modal
    title="打印装袋标签"
    class="modal-visible-windows"
    v-model="modalVisible"
    width="600px"
  >
    <Form ref="modalRefForm" :model="fromData" :rules="fromRule" :label-width="80">
      <FormItem label="打印数量" prop="printNumber">
        <Input
          v-model="fromData.printNumber"
          :disabled="loading"
          placeholder="请输入 0 到 100 之间的整数(不包括0, 包括100)"
        />
        <!-- show-word-limit -->
      </FormItem>
      <Spin v-if="loading" fix></Spin>
    </Form>
    <div slot="footer">
      <Button @click="modalVisible = false">取 消</Button>
      <Button @click="confirm" type="primary" :loading="loading">确认打印</Button>
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
        printNumber: '1'
      },
      fromRule: {
        printNumber: [
          { required: true, validator: this.validatePrintNumber, trigger: 'change' },
          { required: true, validator: this.validatePrintNumber, trigger: 'blur' }
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
        let openWindow = window.open('');
        this.axios.get(`${api.getWytSubPackageBarcode}/${this.fromData.printNumber}`).then(({ data }) => {
          this.loading = false;
          if (data && data.code === 0 && data.datas) {
            const prefix = 'filenode/s/';
            const path = data.datas.indexOf(prefix) >= 0 ? data.datas : prefix + data.datas;
            const url = window.location.origin + '/wms-service/' + path;
            openWindow.location = `/wms-service/static/pdf/web/viewer.html?file=${url}`;
            this.modalVisible = false;
          }
        }).catch(() => {
          openWindow.close();
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
    validatePrintNumber (rule, value, callback) {
      const newVal = Number(value);
      if (this.$common.isEmpty(newVal) || newVal > 100 || newVal < 1 || value.indexOf('.') > -1) {
        return callback(new Error('请输入 0 到 100 之间的整数(不包括0, 包括100)'));
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
</style>
