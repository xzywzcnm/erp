<template>
  <div>
    <Modal
      v-model="isVisible"
      title="编辑资料"
      :mask-closable="false"
      class-name="edit-modal-box"
    >
      <div class="edit-modal-contain">
        <Form
          ref="editModalContain"
          :model="formData"
          :rules="ruleValidate"
          :label-width="100"
        >
          <FormItem label="图片：">
            <dytUpload
              :action="uploadPath"
              :before-upload="beforeUpload"
              :headers="uploadHeader"
              accept="image/*"
              :show-upload-list="false"
              :disabled="uploadImg"
            >
              <Button
                v-if="$common.isEmpty(backImage)"
                icon="ios-cloud-upload-outline"
                type="primary"
                class="form-upload-file"
                :disabled="uploadImg"
              >请选择图片</Button>
              <img v-else :src="backImage" class="upload-img" />
            </dytUpload>
          </FormItem>
          <FormItem label="平台SKU：" prop="platformSku">
            <dytInput v-model="formData.platformSku" placeholder="请输入平台SKU" :disabled="true" />
          </FormItem>
          <FormItem label="款式编码：" prop="productSkcId">
            <dytInput v-model="formData.productSkcId" placeholder="请输入款式编码" />
          </FormItem>
          <FormItem label="名称：" prop="productName">
            <dytInput v-model="formData.productName" placeholder="请输入名称" />
          </FormItem>
          <FormItem label="条码编码：" prop="labelCode" :rules="{required: isTemu, msg: '请输入条码编码', strQuantity: 50, validator: barCodeValidator, trigger: 'blur'}">
            <dytInput v-model="formData.labelCode" placeholder="请输入条码编码" />
          </FormItem>
          <FormItem label="主属性：" prop="skcSpecName">
            <dytInput v-model="formData.skcSpecName" placeholder="请输入主属性" />
          </FormItem>
          <FormItem label="次属性：" prop="skuSpecName">
            <dytInput v-model="formData.skuSpecName" placeholder="请输入次属性" />
          </FormItem>
          <FormItem label="产地：" prop="countryName" v-if="isTemu">
            <dytInput v-model="formData.countryName" placeholder="请输入产地" />
          </FormItem>
          <FormItem :label="productSkuLabel+'：'" prop="extCode">
            <dytInput v-model="formData.extCode" placeholder="请输入客户SKU" />
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
        <Button @click="isVisible = false">取 消</Button>
        <Button
          :disabled="modalLoading"
          type="primary"
          @click="saveThirdparty"
        >确 定</Button>
      </div>
      <Spin fix v-if="modalLoading">正在处理数据中....</Spin>
    </Modal>
  </div>
</template>
<script>
import api from '@/api/api';

export default {
  name: "editThirdpartyTag",
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
  data() {
    return {
      modalLoading: false,
      uploadImg: false,
      // 表单默认数据
      formData: {
        saleAccountId: '', // 店铺ID
        imageUrl: '', // 图片
        productSkcId: '', // 款式编码
        productName: '', // 名称
        labelCode: '', // 条码编码
        skcSpecName: '', // 主属性
        skuSpecName: '', // 次属性
        countryName: '', // 产地
        extCode: '', // 客户SKU
        platformSku: '' // 平台sku
      },
      // 表单验证
      ruleValidate: {
        productSkcId: [
          { required: true, msg: '请输入款式编码', strQuantity: 50, validator: this.barCodeValidator, trigger: 'change' },
          { required: true, msg: '请输入款式编码', strQuantity: 50, validator: this.barCodeValidator, trigger: 'blur' }
        ],
        productName: [
          { msg: '请输入名称', strQuantity: 200, validator: this.barCodeValidator, trigger: 'change' },
          { msg: '请输入名称', strQuantity: 200, validator: this.barCodeValidator, trigger: 'blur' }
        ],
        skcSpecName: [
          { msg: '请输入主属性', strQuantity: 50, validator: this.barCodeValidator, trigger: 'change' },
          { msg: '请输入主属性', strQuantity: 50, validator: this.barCodeValidator, trigger: 'blur' }
        ],
        skuSpecName: [
          { msg: '请输入次属性', strQuantity: 50, validator: this.barCodeValidator, trigger: 'change' },
          { msg: '请输入次属性', strQuantity: 50, validator: this.barCodeValidator, trigger: 'blur' }
        ],
        countryName: [
          { required: true, msg: '请输入产地', strQuantity: 50, validator: this.barCodeValidator, trigger: 'change' },
          { required: true, msg: '请输入产地', strQuantity: 50, validator: this.barCodeValidator, trigger: 'blur' }
        ],
        extCode: [
          { required: true, msg: '请输入客户SKU', strQuantity: 50, validator: this.barCodeValidator, trigger: 'change' },
          { required: true, msg: '请输入客户SKU', strQuantity: 50, validator: this.barCodeValidator, trigger: 'blur' }
        ]
      },
      isVisible: false,
      uploadPath: api.upload_files + '?basePath=/product'
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
  computed: {
    // 权限
    permission () {
      return {
        add: this.getPermission('thirdpartyTagManage_add')
      }
    },
    // 上传组件头部信息
    uploadHeader () {
      return {
        ...this.$store.getters.erpRequestHeaders,
        ...this.$store.getters.dytRequestHeaders
      }
    },
    backImage () {
      let imageUrl = this.formData.imageUrl;
      if (this.$common.isEmpty(imageUrl)) return '';
      if (imageUrl.substring(0, 7) == 'http://' || imageUrl.substring(0, 8) == 'https://') return imageUrl;
      return `${window.location.origin}/product-service/filenode/s${imageUrl}`;
    },
    isTemu() {
      return ['Temu'].includes(this.moduleData.platformId);
    },
    isTiktok() {
      return ['tiktok'].includes(this.moduleData.platformId);
    },
    productSkuLabel() {
      let label = '客户SKU';
      if (this.isTiktok) label = 'LAPA SKU';
      return label;
    },
  },
  methods: {
    // 打开窗口
    open() {
      this.isVisible = this.modelVisible;
      this.initData();
    },
    // 关闭弹窗
    closeModal () {
      this.modalLoading = false;
      this.isVisible = false;
      this.$nextTick(() => {
        this.$refs.editModalContain && this.$refs.editModalContain.resetFields();
        this.$nextTick(() => {
          this.$refs.editModalContain && this.$refs.editModalContain.resetFields();
        })
      })
    },
    // 初始化页面数据
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
    beforeUpload (file) {
      if (this.uploadImg) return;
      if (file.type.includes('image/')) {
        this.uploadImg = true;
        this.uploadFile(file).then((fileUrls) => {
          if (!this.$common.isEmpty(fileUrls[0])) {
            this.$set(this.formData, 'imageUrl', fileUrls[0]);
          }
        }).finally(() => {
          this.uploadImg = false;
        })
        return false;
      }
      this.$Message.error('文件格式不对，请上传图片文件');
      return false;
    },
    // 上传文件
    uploadFile (file) {
      return new Promise((resolve, reject) => {
        let newForm = new FormData(); // 创建form对象
        newForm.append('files', file);
        this.axios.post(`${this.uploadPath}&random=${(Math.random()).toString().substring(2)}`, newForm).then((res) => {
          if (!res.data || res.data.code != 0) {
            return reject(res);
          }
          resolve(res.data.datas);
        }).catch((err) => {
          reject(err);
        })
      })
    },
    // 验证
    barCodeValidator(rule, value, callback) {
      if (rule.required && this.$common.isEmpty(value, true)) {
        return callback(new Error(`${rule.msg || '必填项不能为空'}`));
      }
      if (!this.$common.isEmpty(value) && (value.trim()).length > rule.strQuantity) {
        return callback(new Error(`${`不能超过 ${rule.strQuantity} 字符数`}`));
      }
      callback();
    },
    // 保存
    saveThirdparty () {
      if (this.modalLoading) return;
      this.$refs.editModalContain && this.$refs.editModalContain.validate((valid) => {
        if (!valid) return;
        this.modalLoading = true;
        this.axios.post(api.thirdEdit, this.formData).then((res) => {
          if (!res.data || res.data.code != 0) return;
          this.isVisible = false;
          this.$nextTick(() => {
            // 保存成功后刷新父级列表
            this.$emit('refreshParentPage', false);
          })
        }).finally(() => {
          this.modalLoading = false;
        })
      })
    }
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
.upload-img{
  width: 60px;
  cursor: pointer;
}
</style>
