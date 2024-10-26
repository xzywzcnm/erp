<template>
  <div>
    <Modal
      v-model="isVisible"
      title="导入资料"
      :mask-closable="false"
      class-name="edit-modal-box"
    >
      <div class="edit-modal-contain">
        <Form
          ref="editModalContain"
          :model="formData"
          :rules="ruleValidate"
          :label-width="180"
        >
          <FormItem label="选择导入文件：">
            <div class="form-item-line">
              <dytUpload
                ref="editUpload"
                name="file"
                :action="uploadPath"
                :before-upload="beforeUpload"
                accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                :show-upload-list="false"
              >
                <Button icon="ios-cloud-upload-outline" type="primary" class="form-upload-file">请选择文件</Button>
              </dytUpload>
              <div class="download-file" @click="downloadTemplate">下载模板</div>
            </div>

          </FormItem>
          <FormItem label="文件：">
            <span>{{ `${$common.isEmpty(file) ? '' : file.name || ''}` }}</span>
          </FormItem>
          <FormItem label="导入的平台SKU一致时：" prop="importType">
            <RadioGroup v-model="formData.importType">
              <Radio :label="1">覆盖</Radio>
              <Radio :label="0">忽略</Radio>
            </RadioGroup>
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
        <Button @click="isVisible = false">取 消</Button>
        <Button
          type="primary"
          @click="saveThirdparty"
          :disabled="modalLoading"
        >确 定</Button>
      </div>
      <Spin fix v-if="modalLoading">正在处理数据中....</Spin>
    </Modal>
  </div>
</template>
<script>
import api from '@/api/api';

export default {
  name: "importThirdPartyTag",
  components: {},
  props: {
    modelVisible: {
      type: Boolean,
      default: false
    },
    moduleData: {
      type: Object,
      default () {
        return {};
      }
    }
  },
  data () {
    return {
      modalLoading: false,
      file: null,
      // 表单默认数据
      formData: {
        platformId: '', // 平台id
        saleAccountId: '', // 店铺id
        importType: 1, // 导入类型（0：忽略 1：覆盖）
      },
      // 表单验证
      ruleValidate: {},
      isVisible: false,
      uploadPath: api.importThirdPartyTag
    };
  },
  watch: {
    modelVisible (newVal) {
      if (newVal) this.open();
    },
    isVisible (newVal) {
      this.$emit('update:modelVisible', newVal);
      !newVal && this.closeModal();
    }
  },
  computed: {},
  created () {},
  methods: {
    // 打开窗口
    open () {
      this.$nextTick(() => {
        this.initData();
        this.$nextTick(() => {
          this.isVisible = this.modelVisible;
        })
      })
    },
    // 关闭弹窗
    closeModal () {
      this.modalLoading = false;
      this.isVisible = false;
      this.file = null;
      this.$nextTick(() => {
        this.$refs.editModalContain && this.$refs.editModalContain.resetFields();
        this.$nextTick(() => {
          this.$refs.editModalContain && this.$refs.editModalContain.resetFields();
        })
      })
    },
    initData () {
      this.modalLoading = true;
      if (!this.$common.isEmpty(this.moduleData)) {
        Object.keys(this.formData).forEach(key => {
          if (!this.$common.isUndefined(this.moduleData[key])) {
            this.formData[key] = this.moduleData[key];
          }
        })
      }
      this.$common.promiseAll([]).then((resArr) => {
        // console.log(resArr);
      }).finally(() => {
        this.modalLoading = false;
      })
    },
    // 文件上传前
    beforeUpload(file) {
      if (!file) {
        this.$Message.error('请上传文件!');
        return false;
      }
      if (!['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'].includes(file.type)) {
        this.$Message.error('文件格式不对，请上传 excel 文件');
        return false;
      }
      this.file = file;
      return false;
    },
    // 保存
    saveThirdparty () {
      if (this.modalLoading) return;
      this.modalLoading = true;
      let newForm = new FormData(); // 创建form对象
      newForm.append('files', this.file);
      Object.keys(this.formData).forEach(key => {
        newForm.append(key, this.formData[key]);
      });
      this.axios.post(this.uploadPath, newForm).then(res => {
        if (res || res.data || res.data.code != 0) {
          this.$Message.error('导入资料失败！');
          this.modalLoading = false;
          return;
        }
        setTimeout(() => {
          this.$Message.success('导入资料成功');
          this.isVisible = false;
          this.modalLoading = false;
          // 保存成功后刷新父级列表
          this.$emit('refreshParentPage', false);
        }, 1000)
      }).catch(() => {
        this.modalLoading = false;
      })
    },
    // 下载模板
    async downloadTemplate() {
      let url = await this.getTemplateFromApi();
      if (!url) {
        this.$Message.error('下载模板路径丢失~');
        return;
      }
      const fileUrl = `${window.location.origin}/product-service/filenode/s${url}`;
      this.$common.downloadFile(fileUrl);
    },
    getTemplateFromApi() {
      return new Promise(resolve => {
        this.axios.get(`${api.thirdTemplate}`).then(res => {
          if (res.data.code === 0 && !this.$common.isEmpty(res.data.datas)) {
            resolve(res.data.datas);
          } else {
            resolve(null);
          }
        }).catch(() => {
          resolve(null);
        })
      })
    },
  }
};
</script>
<style lang="less" scoped>
:deep(.edit-modal-box){
  .ivu-modal{
    top: 60px;
    width: 80% !important;
    max-width: 700px;
    min-width: 400px;
    .ivu-modal-body{
      max-height: calc(100vh - 200px);
    }
  }
  .ivu-modal-body{
    padding: 0
  }
  .ivu-input[disabled] {
    color: #878787;
  }
}
.form-item-line{
  display: flex;
  padding-right: 30px;
  justify-content: space-between;
}
.download-file{
  color: #2d8cf0;
  text-decoration: underline;
  cursor: pointer;
}
.edit-modal-contain{
  position: relative;
  max-height: calc(100vh - 200px);
  padding: 16px 16px 0px 16px;
  overflow: auto;
}

.ivu-modal-body {
  position: relative;
  .ivu-modal-confirm-footer{
    position: sticky;
    bottom: -16px;
    padding: 20px 0;
    text-align: right;
    background: #fff;
  }
}
</style>
