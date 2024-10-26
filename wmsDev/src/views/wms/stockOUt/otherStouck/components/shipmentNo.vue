<template>
  <div>
    <Modal v-model="isVisible" title="填写发货单号" :width="500" :mask-closable="false" class="shipmentNoPage">
      <Form :ref="formName" :model="formValidate" :rules="ruleValidate" :label-width="80" class="formDetail">
        <FormItem label="发货单号" prop="deliveryOrderSn">
          <Input v-model="formValidate.deliveryOrderSn" placeholder="请输入"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" @click="handleSubmit()" :loading="loading">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from '@/api/api';
export default {
  name: 'shipmentNo',
  props: {
    modelVisible: {
      type: Boolean,
      default() {
        return false
      }
    },
    detailData: {// 出库单详情信息
      type: Object,
      default() {
        return {}
      }
    },
    sendData: {// 箱号信息
      type: Object,
      default() {
        return {}
      }
    },
  },
  data() {
    return {
      formName: 'formValidate',
      isVisible: false,
      formValidate: {
        deliveryOrderSn: '',
      },
      ruleValidate: {
        deliveryOrderSn: [
          { required: true, message: '请输入发货单号', trigger: 'blur' },
        ],
      },
      loading: false,
    }
  },
  watch: {
    modelVisible: {
      handler(val) {
        val && this.open();
      },
      deep: true
    },
    isVisible: {
      handler(val) {
        if (!val) {
          this.$emit('update:modelVisible', val);
        }
      },
      deep: true
    },
  },
  methods: {
    // 窗口打开
    open() {
      this.isVisible = true;
      this.$nextTick(() => {
        this.$refs[this.formName].resetFields();
        this.formValidate.deliveryOrderSn = this.sendData.deliveryOrderSn || '';
      })
    },
    // 完成
    handleSubmit() {
      this.$refs[this.formName].validate((valid) => {
        if (!valid) return;
        let fdeliveryOrderSn = this.formValidate.deliveryOrderSn;
        let sdeliveryOrderSn = this.sendData.deliveryOrderSn;

        // 原值无变更结束
        if (fdeliveryOrderSn && sdeliveryOrderSn && (fdeliveryOrderSn === sdeliveryOrderSn)) {
          this.$Message.success('操作成功~');
          this.isVisible = false;
          return;
        }

        let temp = {};
        temp.pickingId = this.detailData.pickingId;
        temp.deliveryOrderSn = fdeliveryOrderSn;
        temp.pickingBoxNo = this.sendData.boxCode;
        // console.log(temp)
        this.loading = true;
        this.axios.post(api.addDeliveryOrderSn, temp).then(({ data }) => {
          if (!(data && data.code === 0)) return;
          this.isVisible = false;
          this.$Message.success('操作成功~');
          this.$emit('refreshDetail');
        }).finally(() => {
          this.loading = false;
        })
      })
    },
  }
}
</script>

<style lang="less">

</style>
