<template >
  <Modal v-model="isVisible" title="导出" width="800">
    <div class="quality-edit">
      <Form
        class="quality-edit-form"
        ref="batchQualityEdit"
        :model="formData"
        :rules="formRule"
        label-position="top"
      >
        <Form-item label="导出数据类型: " prop="exportImage">
          <RadioGroup v-model="formData.exportImage">
            <Radio label="1">{{ tabType }}信息（不含图片路径）</Radio>
            <Radio label="2">{{ tabType }}信息（含图片路径）</Radio>
            <Radio label="3">{{ tabType }}图片</Radio>
          </RadioGroup>
        </Form-item>
      </Form>
      <Spin v-if="pageLoading" fix></Spin>
    </div>
    <div slot="footer">
      <span style="display:inline-block; margin-right:25px;">
        导出{{ tabType }}数量：
        <span style="color: #f20; font-size: 16px;">{{total}}</span>
      </span>
      <Button @click="isVisible = false">取 消</Button>
      <Button type="primary" @click="saveData" :disabled="pageLoading">确 定</Button>
    </div>
  </Modal>
</template>

<script>
// import api from '@/api/api';

export default {
  name: 'batchQualityEdit',
  props: {
    modalVisible: { type: Boolean, default: false },
    refreshTable: { type: Boolean, default: false },
    modalData: {
      type: Object,
      default: () => {
        return {
          reqApi: '',
          params: {},
          tabType: '',
          total: 0
        }
      }
    }
  },
  data () {
    return {
      isVisible: false,
      // 表单数据组
      formData: {
        exportImage: '1'
      },
      // 表单验证规则
      formRule: {},
      oldFormData: {},
      pageLoading: false
    }
  },
  watch: {
    modalVisible: {
      immediate: true,
      handler (val) {
        this.isVisible = val;
        val ? this.initData() : this.restData();
      }
    },
    isVisible: {
      handler (val) {
        this.$emit('update:modalVisible', val);
      }
    }
  },
  created () {},
  computed: {
    reqApi () {
      return this.modalData.reqApi;
    },
    params () {
      let formData = this.$common.copy(this.formData);
      if (formData.exportImage == '1') {
        formData.exportAllImage = null;
        formData.exportImage = '2';
      } else if (formData.exportImage == '2') {
        formData.exportAllImage = null;
        formData.exportImage = '1';
      } else if (formData.exportImage == '3') {
        formData.exportAllImage = '1';
        formData.exportImage = '1';
      }
      return { ...this.modalData.params, ...formData };
    },
    tabType () {
      return this.modalData.tabType || 'SPU';
    },
    total () {
      return this.modalData.total;
    }
  },
  methods: {
    // 初始化页面数据
    initData () {
      // this.pageLoading = true;
      this.oldFormData = this.$common.copy(this.formData);
    },
    // 保存
    saveData () {
      this.pageLoading = true;
      this.axios.post(this.reqApi, this.params).then((response) => {
        this.pageLoading = false;
        if (response.data.code === 0) {
          let data = response.data.datas;
          this.$Message.success({
            content: '已生成导入/导出任务，任务编号' + '：' + data,
            duration: 10,
            closable: true
          });
          this.$nextTick(() => {
            this.isVisible = false;
          })
        }
      }).catch(() => {
        this.pageLoading = false;
      })
    },
    // 重置页面数据
    restData () {
      !this.$common.isEmpty(this.oldFormData) && (this.formData = this.$common.copy(this.oldFormData));
    }
  }
};
</script>

<style lang="less" scoped>
.quality-edit-form{
  :deep(.ivu-form-item-content) {
    margin-left: 25px;
    .ivu-radio-wrapper{
      display: block;
    }
  }
}
</style>
