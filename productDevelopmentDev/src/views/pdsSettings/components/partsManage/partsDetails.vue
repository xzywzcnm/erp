<template>
  <div class="partsDetails">
    <Modal
      v-model="visibleEdit"
      :title="modalTitle"
      :width="80"
      :mask-closable="false"
      class-name="modal-custom"
    >
      <Form ref="pageForm" class="" :model="formParams" :rules="ruleValidate" :label-width="90" :disabled="isDisabled">
        <div class="parts-form-block">
          <div class="parts-form-label">测量部位名称</div>
          <div class="parts-form-item">
            <Form-item
              v-for="(item, index) in languageList"
              :key="`lang-${index}`"
              :label="item.title"
              :prop="item.key"
              :rules="(item.rules||[])"
              style="display:inline-block; width:280px;"
            >
              <dyt-input type="text" placeholder="请输入测量部位尺寸名称" v-model="formParams[item.key]" />
            </Form-item>
          </div>
        </div>
        <div class="parts-form-block">
          <div class="parts-form-label">测量方式描述</div>
          <div class="parts-form-item">
            <Form-item prop="measurementDescription" :label-width="0">
              <dyt-input
                type="textarea"
                placeholder="请输入测量方式描述"
                v-model="formParams.measurementDescription"
                :autosize="{ minRows: 4, maxRows: 6 }"
              />
            </Form-item>
          </div>
        </div>
      </Form>
      <div slot="footer">
        <Button @click="visibleEdit = false">取 消</Button>
        <Button style="margin-left: 10px;" type="primary" @click="confirm" v-if="!isDisabled">确 定</Button>
      </div>
      <Spin v-if="pageLoading" fix ></Spin >
    </Modal>
  </div>
</template>

<script>
import api from '@/api/api.js';

export default {
  name: 'partsDetails',
  components: {},
  mixins: [],
  props: {
    visibleModule: { type: Boolean, default: false },
    moduleData: { type: Object, default: () => { return {} } }
  },
  data () {
    return {
      api: api.sizeManageApiConfig.sizePartsManage,
      pageLoading: false,
      languageList: [
        {
          title: '中文',
          key: 'cnName',
          rules: [
            { required: true, message: '请输入中文部位尺寸名称', trigger: 'change' },
            { required: true, message: '请输入中文部位尺寸名称', trigger: 'blur' }
          ]
        },
        {
          title: '英语',
          key: 'enName',
          rules: [
            { required: true, message: '请输入英语部位尺寸名称', trigger: 'change' },
            { required: true, message: '请输入英语部位尺寸名称', trigger: 'blur' }
          ]
        },
        {
          title: '德语',
          key: 'gerName',
          rules: [
            { required: true, message: '请输入德语部位尺寸名称', trigger: 'change' },
            { required: true, message: '请输入德语部位尺寸名称', trigger: 'blur' }
          ]
        },
        { title: '法语', key: 'fraName' },
        { title: '西班牙语', key: 'spnName' },
        { title: '意大利语', key: 'itName' },
        { title: '葡萄牙语', key: 'porName' },
        { title: '波兰语', key: 'polName' }
      ],
      isDisabled: false,
      modalTitle: '添加',
      visibleEdit: false,
      formParams: {
        cnName: '',
        enName: '',
        fraName: '',
        gerName: '',
        itName: '',
        measurementDescription: '',
        partId: '',
        polName: '',
        porName: '',
        spnName: ''
      },
      oldFormData: {},
      ruleValidate: {},
      pictureList: [],
      pageData: {}
    }
  },
  watch: {
    visibleModule: {
      deep: true,
      immediate: true,
      handler (val) {
        this.visibleEdit = val;
        val && this.initPage();
      }
    },
    visibleEdit: {
      deep: true,
      handler (val) {
        !val && this.resetData();
        this.$emit('update:visibleModule', val);
      }
    }
  },
  created () {},
  methods: {
    initPage () {
      this.oldFormData = this.$common.copy(this.formParams);
      this.modalTitle = this.$common.isEmpty(this.moduleData) ? '添加' : '编辑';
      this.$nextTick(() => {
        this.pageData = this.$common.copy(this.moduleData);
        Object.keys(this.formParams).forEach(key => {
          if (!this.$common.isUndefined(this.pageData[key])) {
            this.formParams[key] = this.pageData[key];
          }
        })
      })
    },
    // 重置数据
    resetData () {
      this.$refs.pageForm && this.$refs.pageForm.resetFields();
      this.formParams = this.$common.copy(this.oldFormData);
      this.isDisabled = false;
    },
    confirm () {
      this.$refs.pageForm && this.$refs.pageForm.validate((validate) => {
        if (!validate) return;
        this.pageLoading = true;
        const url = this.api[this.$common.isEmpty(this.formParams.partId) ? 'addProductSizePart' : 'editProductSizePart'];
        this.axios.post(url, this.formParams).then((data) => {
          if (data.code === 0) {
            this.$Message.success('保存成功！');
            this.visibleEdit = false;
            this.$emit('refreshPage');
          }
        }).finally(() => {
          this.pageLoading = false;
        })
      });
    }
  }
}
</script>
<style lang="less" scoped>
.parts-form-block{
  display: flex;
  .parts-form-label{
    padding-right: 10px;
    width: 120px;
    text-align: right;
  }
  .parts-form-item{
    flex: 1;
  }
}
</style>
