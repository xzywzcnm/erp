<template>
  <div>
    <Modal v-model="isVisible" title="选择供应商" :width="500" :mask-closable="false" class="selectSupplierName-page">
      <div class="formDetail detail-form">
        <div style="padding: 0 0 15px 0; color:#f60;">您选择的数据中包含多个供应商，请选择其中一个供应商后再创建处理单</div>
        <Form ref="formCustom" :model="formData"  :label-width="100" inline class="fmb18">
          <FormItem label="供应商:" prop="supplierName">
            <dyt-select v-model="formData.supplierName">
              <Option v-for="(item,index) in selectList" :value="item" :key="index" :label="item"></Option>
            </dyt-select>
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
        <Button type="primary" @click="confirmHand">确定</Button>
        <Button @click="isVisible = false">取消</Button>
      </div>
    </Modal>
  </div>
</template>

<script>

export default {
  name: 'problemGoodHandSheet',
  props: {
    modelVisible: {
      type: Boolean,
      default() {
        return false
      }
    },
    moduleList: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      isVisible: false,
      selectList: [],
      formData: {
        supplierName: '',
      }
    }
  },
  watch: {
    modelVisible: {
      handler(val) {
        val && this.openModal();
      },
      deep: true
    },
    isVisible: {
      handler(val) {
        if (val) return;
        this.$emit('update:modelVisible', val);
        this.clearData();
      },
      deep: true
    }
  },
  computed: {},
  methods: {
    // 窗口打开
    openModal() {
      this.isVisible = true;
      this.selectList = Object.keys(this.moduleList);
    },
    // 确定
    confirmHand () {
      if (!this.formData.supplierName) {
        this.$Message.error('请选择供应商');
        return;
      }
      this.isVisible = false;
      this.$emit('confirm', this.formData.supplierName);
    },
    // 清空数据
    clearData () {
      this.formData = {
        supplierName: ''
      };
    }
  }
}
</script>

<style lang="less">
.selectSupplierName-page {
  .ivu-modal-body{
    max-height: calc(100vh - 300px);
    overflow: auto;
  }
}
</style>
