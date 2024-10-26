<template>
  <div class="pictureDetails">
    <Modal
      v-model="visibleEdit"
      :title="modalTitle"
      :width="80"
      :mask-closable="false"
      class-name="modal-custom"
      :closable="false"
    >
      <Spin v-if="pageLoading" fix ></Spin >
      <Form ref="pageForm" class="" :model="formParams" :rules="ruleValidate" :label-width="100" :disabled="isDisabled">
        <Form-item label="图片名称" prop="pictureName">
          <dyt-input type="text" placeholder="请输入图片名称" v-model="formParams.pictureName" :disabled="isDisabled" />
        </Form-item>
        <Form-item label="图片" prop="language">
          <dyt-select v-model="formParams.language"  placeholder="请选择" multiple :disabled="isDisabled">
            <Option v-for="(item, index) in Object.values(pictureList)" :value='item.value' :key="`picture-${index}`">
              {{item.label}}
           </Option>
          </dyt-select>
          <div>
            <div
              v-for="(lang, lIndex) in formParams.language"
              :key="`lang-${lIndex}`"
              style="display: inline-block;margin-top: 15px; margin-right: 15px;"
              @click.stop="tagLanguage(lang)"
              :class="{'selectedPicture': formParams.productPictureList[lang] && formParams.productPictureList[lang].length > 0}"
            >
              <dytViewUpload
                :disabled="isDisabled"
                action=""
                v-model="formParams.productPictureList[lang]"
                :show-upload-list="true"
                :format="['jpg','jpeg','png', 'GIF', 'BMP']"
                accept="image/*"
                :multiple="false"
                :view-type="false"
                :is-drag-sort="false"
                :is-check-file="false"
                :is-file-title="false"
                :is-delete="true"
                :before-upload="beforeUpload"
                :on-remove="onRemove"
                view-width="80px"
                view-height="80px"
              ></dytViewUpload>
              <p style="text-align: center;">{{ pictureList[lang].label }}</p>
            </div>
          </div>
        </Form-item>
        <Form-item label="备注" prop="remarks">
          <dyt-input :disabled="isDisabled" type="textarea" placeholder="请输入备注" v-model="formParams.remarks" :autosize="{ minRows: 4, maxRows: 6 }" />
        </Form-item>
      </Form>
      <div slot="footer">
        <Button @click="visibleEdit = false">{{isDisabled ? '关 闭': '取 消'}}</Button>
        <Button style="margin-left: 10px;" type="primary" @click="confirm" v-if="!isDisabled">确 定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from '@/api/api.js';

export default {
  name: 'pictureDetails',
  components: {},
  mixins: [],
  props: {
    visibleModule: { type: Boolean, default: false },
    moduleData: { type: Object, default: () => { return {} } }
  },
  data () {
    return {
      pageLoading: false,
      api: api.sizeManageApiConfig.pictureManage,
      uploadAction: api.sizeManageApiConfig.pictureManage.upload,
      isDisabled: false,
      modalTitle: '添加',
      visibleEdit: false,
      formParams: {
        pictureName: '',
        language: [],
        productPictureList: {},
        remarks: ''
      },
      oldFormParams: {},
      ruleValidate: {
        pictureName: [
          { required: true, message: '请输入图片名称', trigger: 'change' },
          { required: true, message: '请输入图片名称', trigger: 'blur' }
        ],
        language: [
          { required: true, message: '请选择', trigger: 'change', type: 'array' }
        ]
      },
      pictureList: {
        EN: { value: 'EN', label: '英语' },
        GER: { value: 'GER', label: '德语' },
        FRA: { value: 'FRA', label: '法语' },
        SPN: { value: 'SPN', label: '西班牙语' },
        IT: { value: 'IT', label: '意大利语' },
        POR: { value: 'POR', label: '葡萄牙语' },
        CN: { value: 'CN', label: '中文' }
      },
      pageData: {},
      activeLage: ''
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
      this.modalTitle = this.$common.isEmpty(this.moduleData) ? '添加' : '编辑';
      Object.keys(this.pictureList).forEach(key => {
        this.$set(this.formParams.productPictureList, key, []);
      });
      this.oldFormParams = this.$common.copy(this.formParams);
      this.$nextTick(() => {
        this.pageData = this.$common.copy(this.moduleData);
        this.pageData.pictureId && this.getDetails();
      })
    },
    // 获取详情
    getDetails () {
      this.pageLoading = true;
      this.axios.get(this.api.queryProductSizePictureInfo, {
        params: {
          pictureId: this.pageData.pictureId
        }
      }).then(res => {
        this.pageLoading = false;
        let labelObj = {};
        Object.values(this.pictureList).forEach(item => {
          labelObj[item.label] = item;
        })
        let language = [];
        if (res && res.code === 0) {
          this.$set(this.formParams, 'pictureName', res.datas.pictureName);
          this.$set(this.formParams, 'remarks', res.datas.remarks);
          res.datas.laPaProductPictureLanguageVOS.forEach(item => {
            if (this.pictureList[item.language]) {
              language.push(item.language);
            } else if (labelObj[item.language]) {
              language.push(labelObj[item.language].value);
            }
            this.$set(this.formParams, 'language', language);
            if (!item.pictureUrl.includes('http:') && !item.pictureUrl.includes('https:') && !item.pictureUrl.includes('/pds-service/filenode/s')) {
              item.pictureUrl = `/pds-service/filenode/s${item.pictureUrl}`;
            }
            this.$set(this.formParams.productPictureList, item.language, [{ url: item.pictureUrl, name: item.language }]);
          });
        } else {
          this.isDisabled = true;
        }
      }).catch(() => {
        this.pageLoading = false;
        this.isDisabled = true;
      })
    },
    // 重置数据
    resetData () {
      this.formParams = this.$common.copy(this.oldFormParams);
      this.$refs.pageForm && this.$refs.pageForm.resetFields();
      this.$nextTick(() => {
        this.isDisabled = false;
      })
    },
    // 标记当前上传语言图片
    tagLanguage (lang) {
      this.activeLage = lang;
    },
    // 上传图片前
    beforeUpload (file) {
      this.upload(file);
      return false;
    },
    // 上传图片
    upload (file) {
      let formData = new FormData();
      formData.append('files', file);
      // 额外参数
      // Object.keys(this.uploadData).forEach(key => {
      //   formData.append(key, this.uploadData[key]);
      // })
      this.axios({
        method: 'post',
        url: this.uploadAction,
        data: formData,
        // headers: this.$common.requestHeaders(),
        isFile: true
      }).then(res => {
        if (res && res.code === 0) {
          if (res.datas[0] && !res.datas[0].includes('http:') && !res.datas[0].includes('https:') && !res.datas[0].includes('/pds-service/filenode/s')) {
            res.datas[0] = `/pds-service/filenode/s${res.datas[0]}`;
          }
          const img = [
            { url: res.datas[0], name: this.activeLage }
          ]
          this.$set(this.formParams.productPictureList, this.activeLage, img);
          this.$Message.succsse('上传成功！');
          // console.log(this.formParams.productPictureList)
        } else {
          this.$Message.error('上传失败，请重新上传！');
        }
      }).catch(() => {})
    },
    // 移除
    onRemove (file) {
      if (file && file.name && this.formParams.productPictureList[file.name]) {
        this.$set(this.formParams.productPictureList, file.name, []);
      }
    },
    // 提交
    confirm () {
      this.$refs.pageForm && this.$refs.pageForm.validate((validate) => {
        if (!validate) return;
        let notPass = [];
        let requerParams = this.$common.copy(this.formParams);
        requerParams.laPaProductPictureLanguageQOList = [];
        this.formParams.language.forEach(item => {
          if (this.formParams.productPictureList[item] && this.formParams.productPictureList[item][0]) {
            requerParams.laPaProductPictureLanguageQOList.push({
              language: item,
              pictureUrl: this.formParams.productPictureList[item][0].url
            })
          } else {
            notPass.push(this.pictureList[item].label);
          }
        });
        if (this.pageData.pictureId) {
          requerParams.pictureId = this.pageData.pictureId;
          requerParams.laPaProductPictureLanguageQOList.forEach(item => {
            item.pictureId = this.pageData.pictureId;
          })
        }
        if (notPass.length > 0) {
          this.$Message.error(`请上传 ${notPass.join('、')} 语言的图片`);
          return;
        }
        this.pageLoading = true;
        delete requerParams.productPictureList;
        delete requerParams.language;
        this.axios.post(this.api[requerParams.pictureId ? 'editProductSizePicture' : 'addProductSizePicture'], requerParams).then(res => {
          if (res && res.code === 0) {
            this.$Message.success('保存成功！');
            this.$emit('refreshPage');
            this.visibleEdit = false;
          }
        }).finally(() => {
          this.pageLoading = false;
        })
      });
    }
  }
}
</script>
<style lang="less">
.selectedPicture{
  .ivu-upload{
    display: none;
  }
}
</style>>
