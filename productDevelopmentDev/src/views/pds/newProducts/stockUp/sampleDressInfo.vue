<template>
  <!-- 物料资料 -->
  <div class="page-main-contain">
    <div>
      <Form ref="formRefsDome" :model="formData" :rules="ruleValidate" :label-width="100">
        <FormItem label="纸样文件:" prop="fileList" style="width: 100%;">
          <div class="form-pic-item">
            <dytUpload
              ref="washedUploadRef"
              name="files"
              :show-upload-list="false"
              :multiple="true"
              :accept="fileAccept.join(',')"
              :before-upload="fileUploadBefore"
              :action="uploadFilesUrl"
              class="upload-item"
              :class="{'upload-item-disabled': !isEdit}"
              :disabled="!isEdit"
            >
              <div class="upload-icon">
                <Icon type="ios-camera" size="40"></Icon>
              </div>
              <Spin v-if="isUploadLoading" fix></Spin>
            </dytUpload>
          </div>
          <div>支持格式：pdf、excel、prj并且大小不超过30M</div>
          <div class="uploaded-file-list">
            <div
              v-for="(item, pIndex) in formData.fileList"
              :key="`file-${pIndex}`"
              class="uploaded-file-item"
            >
              <span class="file-title" :title="item.fileName" @click="dowFile(item)">{{ item.fileName }}</span>
              <span class="remove-uploaded-file" title="移除" v-if="isEdit">
                <Icon type="md-close" @click="removeFile(item)" />
              </span>
            </div>
          </div>
        </FormItem>
      </Form>
    </div>
    <Spin v-if="pageLoading" fix></Spin>
  </div>
</template> 

<script>
import api from "@/api/api";

export default {
  name: "sampleDressInfo",
  components: {},
  props: {
    openType: {type: String, default: 'info'},
    btnoperat: {type: String, default: ''},
    productData: { type: Object, default () { return {} } },
    modelVisible: { type: Boolean, default: false },
  },
  data () {
    return {
      pageLoading: false,
      isUploadLoading: false,
      uploadFilesUrl: api.upload_files + '?basePath=/product',
      formData: {
        fileList: []
      },
      fileAccept: [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        '.prj'
      ]
    }
  },
  watch: {
    modelVisible: {
      immediate: true,
      handler (val) {
        this.$nextTick(() => {
          setTimeout(() => {
            val && this.pageInit();
          }, 300);
        })
      }
    }
  },
  computed: {
    // 是否可编辑
    isEdit () {
      return ['edit'].includes(this.openType) && ['sampleConfirm', 'perfectSample'].includes(this.btnoperat);
    },
    // 商品ID
    productId () {
      if (this.$common.isEmpty(this.productData) || this.$common.isEmpty(this.productData.productId)) return '';
      return this.productData.productId;
    },
    // 文件是否必填
    fileRequired () {
      return ['edit'].includes(this.openType) && ['perfectSample'].includes(this.btnoperat);
    },
    // 表单验证规则
    ruleValidate () {
      return {
        fileList: [
          { required: this.fileRequired, message: '请上传纸样文件', trigger: 'change', type: 'array' }
        ]
      }
    }
  },
  created () {},
  methods: {
    pageInit () {
      this.pageLoading = true;
      let awaitRes = [this.getSampleClothingFileUrl];
      this.$common.promiseAll(awaitRes).then(resArr => {
        this.pageLoading = false;
        // console.log(resArr);
      }).catch(() => {
        this.pageLoading = false;
      })
    },
    // 获取文件路径
    getSampleClothingFileUrl () {
      return new Promise((resolve) => {
        this.axios.get(api.querySampleClothingFileUrl, {params: {productId: this.productId}}).then(res => {
          if (!res || res.code != 0 || !res.datas) return resolve([]);
          this.formData.fileList = (res.datas || []);
          resolve(res.datas || []);
        }).catch((err) => {
          console.error(err);
          resolve([]);
        })
      })
    },
    // 上传图片
    fileUploadBefore (file) {
      let fileType = file.type;
      if (this.$common.isEmpty(fileType)) {
        fileType = file.name.substring(file.name.lastIndexOf('.'), file.name.length);
      }
      fileType = this.fileAccept.find(type => {
        return type.toLocaleLowerCase() == fileType
      })
      if (this.$common.isEmpty(fileType)) {
        this.$Message.error('文件格式不对，请上传格式为 pdf、excel、prj 的文件');
        return false;
      }
      // 最大为 30 M
      if (file.size > 1024 * 1024 * 30) {
        this.$Message.error('文件过大，请上传30M以内的文件');
        return false;
      }
      this.isUploadLoading = true;
      let newForm = new FormData(); // 创建form对象
      newForm.append('files', file);
      const uploadUrl = `${this.uploadFilesUrl}&random=${(Math.random()).toString().substring(2, 5) + (new Date().getTime()).toString()}`;
      this.axios.post(uploadUrl, newForm).then(res => {
        if (!res || res.code != 0) return;
        this.formData.fileList.push({
          fileName: file.name.replace(/,|:/g, '-'),
          fileUrl: res.datas[0]
        });
      }).finally(() => {
        this.isUploadLoading = false;
      })
      return false;
    },
    // 返回表单值 type 为 1 时验证， 其他值不验证
    getFormData (type) {
      return new Promise((resolve) => {
        let backRes = this.$common.copy(this.formData);
        if (type == 1 && this.$refs.formRefsDome) {
          this.$refs.formRefsDome.validate((valid) => {
            if (!valid) {
              this.$Message.error('“纸样文件”表单验证不通过，请检查');
              return resolve({ success: false, message: '“纸样文件”表单验证不通过，请检查' });
            }
            resolve({ success: true, data: backRes });
          })
          return;
        }
        resolve({ success: true, data: backRes });
      })
    },
    // 保存当前值 type 为 1 时验证， 其他值不验证
    saveFormData (type) {
      return new Promise((resolve) => {
        this.getFormData(type).then(res => {
          if (!res.success) return resolve({ success: false, message: '表单验证不通过' });
          this.pageLoading = true;
          this.$axios.post(`${api.saveSampleClothing}?productId=${this.productId}`, (res.data.fileList || [])).then(({ code, datas }) => {
            if (code != 0) return resolve({ success: false, message: '请求失败' });
            type != 1 && this.$Message.success('操作成功!');
            resolve({ success: true, data: datas, isColose: type != 1  });
          }).catch(err => {
            resolve({ success: false, data: err  });
          }).finally(() => {
            this.pageLoading = false;
          })
        })
      })
    },
    // 移除文件
    removeFile (file) {
      if (!this.isEdit) return;
      this.$Modal.confirm({
        title: '操作',
        content: `<p>确认移除文件：${file.fileName}？</p>`,
        loading: true,
        onOk: () => {
          this.formData.fileList = this.formData.fileList.filter((item) => {
            return item.fileUrl != file.fileUrl;
          })
          this.$Modal.remove();
        }
      });
    },
    // 下载文件
    dowFile (file) {
      const fileUrl = `./filenode/s${file.fileUrl}`;
      window.open(fileUrl);
    }
  }
};
</script>

<style lang="less" scoped>
.page-main-contain{
  .form-pic-item{
    display: flex;
    justify-content: flex-start;
    flex-flow: wrap;
    .upload-item{
      position: relative;
      display: inline-block;
      width: 100px;
      height: 100px;
      border: 1px solid #ccc;
      border-radius: 5px;
      cursor: pointer;
      &.upload-item-disabled{
        cursor: no-drop;
      }
    }
    .upload-icon{
      width: 100px;
      height: 100px;
      i>{
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }
  }
  .uploaded-file-list{
    font-size: 14px;
    .uploaded-file-item{
      display: flex;
      justify-content: space-between;
      width: 400px;
      line-height: 32px;
      padding: 5px 10px;
      border-radius: 5px;
      &:hover{
        background: #e7e7e7;
        color: #03A9F4;
        .remove-uploaded-file{
          display: inline-block;
        }
      }
      .file-title{
        display: inline-block;
        max-width: calc(100% - 30px);
        line-height: 1.4em;
        cursor: pointer;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .remove-uploaded-file{
        display: none;
        margin-left: 10px;
        font-size: 20px;
        line-height: 0;
        cursor: pointer;
      }
    }
  }
}
</style>