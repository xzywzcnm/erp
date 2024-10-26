<template>
  <div>
    <Modal class="modal-main radioForm" v-model="formData.modelVisible" :mask-closable="false" :title="dialogObj.title" :width="700">
      <div class="content">
        <Form ref="formValidate" :model="formValidate" :label-width="120">
          <div class="mt10 mb10 tips-flex">
            <Icon type="md-alert" class="mr10" />
            <span v-if="formData.purExpType==1">确认是否要导出采购单：<span class="text">{{formData.purchaseNumber}}</span></span>
            <span v-else-if="formData.purExpType==0">确认是否要导出列表？</span>
            <span v-if="dialogObj.len">确认是否要导出所有查询的订单：<span class="text">{{dialogObj.len}}</span></span>
          </div>
          <FormItem label="是否导出图片:" v-if="formData.purExpType != 0">
            <div class="tips-flex">
              <RadioGroup v-model="formValidate.export">
                <Radio :label="1">导出图片</Radio>
                <Radio :label="0" class="ml10">不导出图片</Radio>
              </RadioGroup>
              <div class="ml10 num">导出商品图片，数据量大，导出速度慢，请耐心等待</div>
            </div>
          </FormItem>
        </Form>
      </div>
      <div slot="footer" style="text-align: center;">
        <Button type="primary" @click="handleSubmit('formValidate')" :loading="loading">确定</Button>
        <Button @click="formData.modelVisible = false">关闭</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
export default {
  data () {
    return {
      formValidate: {
        export: 0,
        purExpType: null,
      },
      loading: false,
      formData: this.dialogObj,
    }
  },
  props: {
    dialogObj: {
      type: Object,
      default () {
        return {
          modelVisible: false,
          title: '导出',
          len: 0,
          type: ''
        }
      }
    }
  },
  watch: {
    "dialogObj.modelVisible": {
      handler (newVal, oldVal) {
        if(this.dialogObj.modelVisible == true) {
          this.formData = this.dialogObj
        }
        if (newVal) this.handleReset();
      },
      immediate: true
    }
  },
  methods: {
    // 提交
    handleSubmit () {
      this.$emit('dialogExportReturn', this.formValidate.export);
      this.formData.modelVisible = false;
    },
    // 重置
    handleReset () {
      this.formValidate.export = 0;
    },
  }
}
</script>
<style scoped>
.tips-flex {
  display: flex;
  align-items: center;
}
.radioForm .ivu-icon {
  font-size: 26px;
  color: #ff9900;
}
.radioForm .num {
  color: #ff9900;
}
.radioForm .text {
  color: #ff6600;
}
</style>