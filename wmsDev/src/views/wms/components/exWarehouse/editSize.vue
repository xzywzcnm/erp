<template>
  <div>
    <Modal v-model="isVisible" title="修改尺寸" :width="800" :mask-closable="false" class="editSizePage">
      <div>
        <Form ref="editSizeForm" :model="formData" :rules="rules" :label-width="80" :inline="true">
          <FormItem label="包裹长" prop="length">
            <Input v-model.number="formData.length" placeholder="单行输入" type="number"></Input>
          </FormItem>
          <FormItem label="包裹宽" prop="width">
            <Input v-model.number="formData.width" placeholder="单行输入" type="number"></Input>
          </FormItem>
          <FormItem label="包裹高" prop="height">
            <Input v-model.number="formData.height" placeholder="单行输入" type="number"></Input>
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
        <Button @click="isVisible = false">取消</Button>
        <Button type="primary" @click="handleForm" :loading="loading">修改并重新申请运单号</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from '@/api/api';
export default {
  name: 'EditSize',
  props: {
    modelVisible: {
      type: Boolean,
      default() {
        return {}
      }
    },
    detailData: {
      type: Object,
      default() {
        return {}
      }
    },
    enableConfirm: {
      type: Number,
      default: null
    },
  },
  data() {
    return {
      isVisible: false,
      loading: false,
      formData: {
        length: null,
        width: null,
        height: null,
      },
      rules: {
        length: [
          { required: true, validator: this.$common.validatorMaxNumber, min: 0, notIncludes: ['min'], point: 2, msg: '请输入数字,限两位小数', trigger: 'change' },
          { required: true, validator: this.$common.validatorMaxNumber, min: 0, notIncludes: ['min'], point: 2, msg: '请输入数字,限两位小数', trigger: 'blur' },
        ],
        width: [
          { required: true, validator: this.$common.validatorMaxNumber, min: 0, notIncludes: ['min'], point: 2, msg: '请输入数字,限两位小数', trigger: 'change' },
          { required: true, validator: this.$common.validatorMaxNumber, min: 0, notIncludes: ['min'], point: 2, msg: '请输入数字,限两位小数', trigger: 'blur' },
        ],
        height: [
          { required: true, validator: this.$common.validatorMaxNumber, min: 0, notIncludes: ['min'], point: 2, msg: '请输入数字,限两位小数', trigger: 'change' },
          { required: true, validator: this.$common.validatorMaxNumber, min: 0, notIncludes: ['min'], point: 2, msg: '请输入数字,限两位小数', trigger: 'blur' },
        ],
      }
    }
  },
  watch: {
    modelVisible: {
      handler(val) {
        val ? this.open() : this.$refs['editSizeForm'].resetFields();
      },
      deep: true
    },
    isVisible: {
      handler(val) {
        !val && this.$emit('update:modelVisible', val);
      },
      deep: true
    }
  },
  methods: {
    // 窗口打开
    open() {
      this.isVisible = true;
      let data = this.detailData;
      Object.keys(this.formData).forEach(k => {
        this.formData[k] = data[k] || null;
      })
    },
    // 提交表单
    handleForm() {
      this.$refs['editSizeForm'].validate((valid) => {
        if (valid) {
          let temp = this.$common.copy(this.formData);
          temp.orderShippingId = this.detailData.orderShippingId;

          // let warehouseId = sessionStorage.getItem('warehouseId') || this.$store.state.warehouseId || localStorage.getItem('warehouseId');
          // temp.warehouseId = warehouseId;
          // temp.enableConfirm = this.enableConfirm;
          // temp.packageIdList = [this.detailData.packageId];

          this.loading = true;
          this.axios.put(api.restCreateTracking, temp).then(response => {
            if (response.data.code === 0) {
              this.$Message.success('操作成功');
              this.isVisible = false;
              this.$emit('getList');
            }
          }).finally(() => {
            this.loading = false;
          })
        }
      })
    }
  }
}
</script>
