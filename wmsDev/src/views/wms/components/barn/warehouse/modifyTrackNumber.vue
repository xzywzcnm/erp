<template>
  <div>
    <Modal v-model="isVisible" title="修改追踪号" width="500" :mask-closable="false" class="modifyTrackNumberPage">
      <div class="formDetail detail-form">
        <Form ref="formCustom" :model="formData" :rules="formDataRules" :label-width="110" class="fmb18">
          <div class="formWidth300 fmb18">
            <FormItem label="入库单号:">
              <span>{{ formData.receiptNo || '' }}</span>
            </FormItem>
            <FormItem label="跟踪号/海柜号:" prop="trackingNumber">
              <Input v-model="formData.trackingNumber" maxlength="200" show-word-limit />
            </FormItem>
          </div>
        </Form>
      </div>
      <div slot="footer">
        <Button type="primary" @click="submitSave" :loading="loading">确 定</Button>
        <Button @click="isVisible = false">取 消</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from '@/api/api';
export default {
  name: 'fillOrderData',
  props: {
    dialogVisible: {
      type: Boolean,
      default() {
        return false
      }
    },
    modalData: {
      type: Object,
      default() {
        return {}
      }
    },
  },
  data() {
    return {
      loading: false,
      isVisible: false,
      formData: {
        receiptNo: '',
        trackingNumber: '',
      },
      // 表单验证
      formDataRules: {
        trackingNumber: [
          { required: true, message: '请输入', trigger: 'blur' }
        ],
      },
    }
  },
  watch: {
    dialogVisible: {
      handler(val) {
        val && this.openModal();
      },
      deep: true,
    },
    isVisible: {
      handler(val) {
        if (val) return;
        this.$emit('update:dialogVisible', val);
      },
      deep: true,
    }
  },
  methods: {
    // 窗口打开
    openModal() {
      this.isVisible = true;
      this.$nextTick(() => {
        this.$refs.formCustom.resetFields();
        let { receiptNo, trackingNumber } = this.modalData;
        this.formData.receiptNo = receiptNo;
        this.formData.trackingNumber = trackingNumber;
      })
    },
    // 提交保存数据
    submitSave() {
      this.$refs.formCustom.validate((valid) => {
        if (!valid) return false;
        this.loading = true;
        this.axios.post(api.updateTrackingNumber, this.formData).then(({ data }) => {
          if (data.code !== 0) return;
          this.isVisible = false;
          this.$Message.success('操作成功~');
          this.$emit('search');
        }).finally(() => {
          this.loading = false;
        });
      })
    },
  }
}
</script>

<style lang="less">
// .fillOrderDataPage {}
</style>
