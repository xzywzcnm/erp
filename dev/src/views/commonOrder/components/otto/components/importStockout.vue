<template>
  <div>
    <Modal v-model="isVisible" :styles="{ top: '80px', width: '700px' }" title="导入出库单" :mask-closable="false"
      class="importStockoutPage">
      <div class="fmb10">
        <Form ref="formItem" :model="formItem" :label-width="160">
          <FormItem label="选择导入文件：">
            <div style="display:flex;justify-content: space-between;">
              <Button icon="ios-cloud-upload-outline" class="upload-btn" @click="uploadLoading = true">
                选择文件
                <input type="file" name="file" class="upload-file" @change="handleFileChange" />
              </Button>
              <a href="javascript:;" style="margin-right: 40px;line-height: 32px;" @click="download">下载模板</a>
            </div>
          </FormItem>
          <FormItem label="文件：">
            <div v-for="(item, index) in formItem.fileList" :key="index + 'f'">
              <span>{{ item.name }}</span>
              <Icon type="md-checkmark-circle" style="color:#19be6b;margin-left: 20px;" />
            </div>
          </FormItem>
          <FormItem label="导入的退货跟踪号一致时：">
            <RadioGroup v-model="formItem.type">
              <Radio :label="1">覆盖</Radio>
              <Radio :label="0">忽略</Radio>
            </RadioGroup>
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
        <Button @click="isVisible = false">取消</Button>
        <Button type="primary" @click="successUpload" :loading="loading">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from '@/api/api';
export default {
  name: 'importStockout',
  data () {
    return {
      isVisible: false,
      formItem: {
        fileList: [],
        type: 0
      },
      uploadLoading: false,
      loading: false
    }
  },
  props: {
    switchInportModal: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    switchInportModal (val) {
      if (val) this.open();
    },
    isVisible (val) {
      if (!val) this.$emit('update:switchInportModal', val);
    }
  },
  created () { },
  methods: {
    open () {
      this.isVisible = this.switchInportModal;
      this.formItem.fileList = [];
      this.formItem.type = 0;
    },
    // 前端拼接的形式
    download () {
      let erpCommon = this.$store.state.erpConfig;
      let url = erpCommon.filenodeViewTargetUrl + '/order-service/template/returnPackageTemplate.xlsx';
      window.open(url, '_self');
    },
    // 导入成功
    successUpload () {
      if (!this.formItem.fileList.length) {
        this.$Message.error('请选择导入文件~');
        return;
      }
      let formData = new FormData();
      formData.append('file', this.formItem.fileList[0]);
      formData.append('importType', this.formItem.type);
      formData.append('platformId', 'otto');
      // console.log(formData)
      // return;
      this.loading = true;
      this.axios.post(api.otto_importReturnPackage, formData).then(({ data }) => {
        if (!(data && data.code === 0)) return;
        this.$Message.success('导入成功!');
        this.isVisible = false;
        this.$emit('search');
      }).finally(() => {
        this.loading = false;
      })
    },
    handleFileChange (e) {
      this.uploadLoading = true;
      const input = e.target;
      const files = e.target.files;
      if (!(files && files[0])) {
        this.uploadLoading = false;
        return;
      };
      const file = files[0];
      const format = ['xlsx', 'xls', 'xml']; // 接受上传的文件类型
      const testFile = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase();// 获取后缀
      // console.log(file, testFile, "文件");
      if (file.size > 5242880) {
        this.$Message.error(file.name + '文件大小不能超过5MB');
        return;
      }
      if (!format.includes(testFile)) {
        this.$Message.error({
          content: file.name + `文件格式不正确, 请选择${format.toString()}格式的文件~`,
          duration: 2
        });
        return;
      }
      this.formItem.fileList = [file];
      input.value = '';
      this.$nextTick(() => {
        this.uploadLoading = false;
      })
    }
  }
}
</script>

<style lang="less">
.importStockoutPage {
  .fmb10 {
    .ivu-form-item {
      margin-bottom: 10px;
    }
  }

  .upload-btn {
    position: relative;
    overflow: hidden;
  }

  .upload-file {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    opacity: 0;
    cursor: pointer;
  }
}
</style>
