<template>
  <Modal
    v-model="isVisible"
    :title="modelTitle"
    :mask-closable="false"
    class-name="edit-modal-box"
    width="700"
    transfer
    :before-close="modelBeforeClose"
  >
    <div class="edit-modal-main">
      <Form
        ref="editModalForm"
        :model="formData"
        :rules="ruleValidate"
        :label-width="135"
      >
        <FormItem label="模板名称：" prop="name" :class="`${isDisabled ? '' : 'ivu-form-item-required'}`">
          <dyt-input placeholder="请输入模板名称" v-model="formData.name" :disabled="isDisabled" />
        </FormItem>
        <FormItem label="指定店铺：" prop="saleAccountIdList" :class="`${isDisabled ? '' : 'ivu-form-item-required'}`">
          <!-- :max-tag-count="1" -->
          <dyt-select
            v-model="formData.saleAccountIdList"
            :disabled="isDisabled"
            :multiple="true"
            placeholder="请选择指定店铺"
            :selectInvert="true"
            :option="storeAccountData"
            :replaceKey="replaceSelectKey"
          />
        </FormItem>
        <FormItem label="回复内容：" prop="content" :class="`${isDisabled ? '' : 'ivu-form-item-required'}`">
          <dyt-input
            type="textarea"
            placeholder="请输入回复内容"
            v-model="formData.content"
            :rows="4"
            :show-word-limit="true"
            :disabled="isDisabled"
          />
        </FormItem>
        <FormItem label="图片：" prop="mediaUrl">
          <transition-group name="flip-list">
            <div
              class="image-item"
              v-for="(item, index) in uploadFileList"
              :key="`img-${index}`"
              :draggable="isDisabled ? false : true"
              @dragstart="dragStart(index)"
              @dragenter="dragEnter(index)"
              @dragend="dragend(index)"
            >
              <img :src="item.url" />
              <div class="operate-mark" :class="{'upload-disabled-mark': isDisabled}">
                <div class="operate-btn">
                  <Icon type="ios-eye" size="25" @click="imageView(index, uploadFileList)" title="图片预览" v-if="!item.loading" />
                  <Icon class="ml5" type="md-refresh" size="20" @click="deleteImage(index)" title="重新上传" v-if="item.fail" />
                  <Icon class="ml5" type="ios-trash" size="20" @click="deleteImage(index)" title="删除图片" v-if="!isDisabled" />
                </div>
              </div>
              <Spin v-if="item.loading" fix></Spin>
            </div>
          </transition-group>
          <dytUpload
            ref="uploadImageRef"
            name="file"
            :show-upload-list="false"
            :multiple="true"
            accept="image/*"
            :before-upload="uploadImageBefore"
            :on-format-error="fileFormatError"
            :action="uploadFilesUrl"
            class="upload-image"
            :disabled="isDisabled"
          >
            <div class="upload-icon" :class="{'upload-disabled': isDisabled}" v-if="uploadFileList.length <= 0 && isDisabled || !isDisabled">
              <Icon type="ios-add" size="100" />
            </div>
          </dytUpload>
        </FormItem>
        <FormItem label="备注：" prop="remark">
          <dyt-input
            type="textarea"
            placeholder="请输入备注"
            v-model="formData.remark"
            :rows="4"
            :show-word-limit="true"
            :disabled="isDisabled"
          />
        </FormItem>
        <FormItem label="重复发送：" prop="reSend" class="item-content-flex">
          <Checkbox v-model="formData.reSend" :disabled="isDisabled" @on-change="reSendChange" />
          <span v-if="formData.reSend" class="error-color">PS：勾选后则客户下单都会自动发送邮件</span>
        </FormItem>
        <FormItem
          label="自动回复发送时间："
          prop="type"
          class="item-content-flex"
          :class="`${!typeRequired ? '' : 'ivu-form-item-required'}`"
        >
          <dyt-select v-model="formData.type" :disabled="!typeRequired" placeholder="请选择自动回复发送周期">
            <Option label="天" :value='0' />
            <Option label="周" :value='1' />
            <Option label="月" :value='2' />
          </dyt-select>
          <div class="ml5">次</div>
        </FormItem>
      </Form>
      <Spin fix v-if="modalLoading"></Spin>
    </div>
    <div slot="close" class="modal-close">
      <Icon type="md-close" size="20" @click="closeModal" />
    </div>
    <div slot="footer">
      <Button @click="closeModal">取 消</Button>
      <Button :loading="modalLoading" type="primary" @click="saveInfo" v-if="!isDisabled">确 定</Button>
    </div>
  </Modal>
</template>
<script>
import 'viewerjs/dist/viewer.css';
import { api as viewerApi } from 'v-viewer';
import api from '@/api/api';

const titleJson = {
  'add': '新增自动回复模板',
  'edit': '编辑自动回复模板',
  'view': '查看自动回复模板'
}

export default {
  name: 'editOrAddSendInfo',
  props: {
    modalVisible: {
      type: Boolean,
      default: false
    },
    viewType: {
      type: String,
      default: 'view'
    },
    moduleData: {
      type: Object,
      default () {
        return {
          tableRow: {},
          other: {
            platform: ''
          }
        };
      }
    },
    storeAccountData: {
      type: Array,
      default () {
        return []
      }
    }
  },
  data () {
    return {
      modalLoading: false,
      isVisible: false,
      dragItemIndex: null,
      replaceItemIndex: null,
      replaceSelectKey: { value: 'saleAccountId', label: 'accountCode' },
      replyTemplateDetail: {},
      formData: {
        name: '',
        content: '',
        enable: 0,
        remark: '',
        platformId: '',
        saleAccountIdList: [],
        type: '',
        reSend: false,
        mediaUrl: []
      },
      ruleValidate: {
        name: [
          {
            getRequired: () => {
              return !this.isDisabled;
            },
            validator: this.$common.strMaxVerify,
            maxLength: 20,
            msg: '请输入模板名称',
            trigger: 'change'
          },
          {
            getRequired: () => {
              return !this.isDisabled;
            },
            validator: this.$common.strMaxVerify,
            maxLength: 20,
            msg: '请输入模板名称',
            trigger: 'blur'
          }
        ],
        saleAccountIdList: [
          {
            getRequired: () => {
              return !this.isDisabled;
            },
            validator: this.validatorSaleAccount,
            msg: '请选择指定店铺',
            trigger: 'change'
          }
        ],
        content: [
          {
            getRequired: () => {
              return !this.isDisabled;
            },
            validator: this.$common.strMaxVerify,
            maxLength: 2000,
            msg: '请输入回复内容',
            trigger: 'change'
          },
          {
            getRequired: () => {
              return !this.isDisabled;
            },
            validator: this.$common.strMaxVerify,
            maxLength: 2000,
            msg: '请输入回复内容',
            trigger: 'blur'
          }
        ],
        remark: [
          { validator: this.$common.strMaxVerify, maxLength: 100, trigger: 'change' },
          { validator: this.$common.strMaxVerify, maxLength: 100, trigger: 'blur' },
        ],
        type: [
          {
            getRequired: () => {
              return this.typeRequired;
            },
            validator: this.validatorType,
            maxLength: 20,
            msg: '请输入模板名称',
            trigger: 'change'
          },
        ]
      },
      uploadFilesUrl: api.replyTemplate.uploadPicture, // 上传图片url,
      uploadFileList: [],
    };
  },
  watch: {
    modalVisible: {
      immediate: true,
      deep: true,
      handler (val) {
        if (val) {
          this.isVisible = val;
          this.$nextTick(() => {
            this.openModal();
          })
        }
      }
    },
    uploadFilePath: {
      immediate: true,
      deep: true,
      handler (val) {
        this.formData.mediaUrl = this.$common.isEmpty(val) ? [] : val;
      }
    }
  },
  computed: {
    modelTitle () {
      return titleJson[this.viewType] || '';
    },
    // 自动回复频率
    typeRequired () {
      return !this.isDisabled && !this.formData.reSend;
    },
    // 是否禁用编辑
    isDisabled () {
      return !['add', 'edit'].includes(this.viewType);
    },
    // 平台
    platform () {
      if (this.$common.isEmpty(this.moduleData) || this.$common.isEmpty(this.moduleData.other) || this.$common.isEmpty(this.moduleData.other.platform)) return '';
      return this.moduleData.other.platform;
    },
    // 上传图片的路径集合
    uploadFilePath () {
      return this.uploadFileList.filter(f => !this.$common.isEmpty(f.path)).map(m => m.path);
    },
    // 详情信息
    tableRow () {
      if (this.$common.isEmpty(this.moduleData) || this.$common.isEmpty(this.moduleData.tableRow)) return {};
      return this.moduleData.tableRow;
    }
  },
  mounted () {},
  methods: {
    // 打开弹窗
    openModal () {
      this.replyTemplateDetail = {};
      this.$refs.editModalForm && this.$refs.editModalForm.resetFields();
      this.$nextTick(() => {
        this.modalLoading = true;
        let awaitRes = [
          () => {
            return this.getDetail(this.tableRow.replyTemplateId);
          }
        ];
        this.$common.promiseAll(awaitRes).finally(() => {
          Object.keys(this.formData).forEach((key) => {
            if (!this.$common.isUndefined(this.replyTemplateDetail[key])) {
              if (key == 'reSend') {
                this.formData[key] = this.replyTemplateDetail[key] != 0;
              } else if (key == 'mediaUrl') {
                let urlList = [];
                this.replyTemplateDetail[key].forEach(path => {
                  const imgKey = `${new Date().getTime()}-${(Math.random() * Math.pow(10, 10)).toFixed(0)}`;
                  urlList.push({ url: `./filenode/s${path}`, path: path, loading: false, fail: false, imageId: imgKey, name: path });
                })
                this.uploadFileList = urlList;
              } else {
                this.formData[key] = this.replyTemplateDetail[key];
              }
            }
          });
          if (this.formData.reSend) {
            this.formData.type = null;
          }
          this.modalLoading = false;
        })
      })
    },
    // 获取信息
    getDetail (replyTemplateId) {
      return new Promise((resolve) => {
        if (this.$common.isEmpty(replyTemplateId)) return resolve({});
        this.axios.get(api.replyTemplate.detail, {
          params: {
            replyTemplateId: replyTemplateId
          }
        }).then(res => {
          if (!res || !res.data || res.data.code != 0) return resolve({});
          this.replyTemplateDetail = res.data.datas || {};
          resolve(this.replyTemplateDetail);
        }).catch(err => {
          console.error(err);
          resolve({});
        })
      })
    },
    // 关闭弹窗
    closeModal () {
      this.uploadFileList = [];
      this.$nextTick(() => {
        this.$refs.editModalForm && this.$refs.editModalForm.resetFields();
        this.$nextTick(() => {
          this.modalLoading = false;
          this.isVisible = false;
          this.$emit('update:modalVisible', false);
        })
      });
    },
    // 保存
    saveInfo () {
      this.$refs.editModalForm && this.$refs.editModalForm.validate((valid) => {
        if (!valid) return;
        this.modalLoading = true;
        let formParams = this.$common.copy(this.formData);
        formParams.platformId = this.platform;
        formParams.reSend = formParams.reSend ? 1 : 0;
        let saveApi = api.replyTemplate.add;
        if (this.viewType == 'edit') {
          saveApi = api.replyTemplate.edit;
          formParams.enable = this.replyTemplateDetail.enable;
          formParams.replyTemplateId = this.replyTemplateDetail.replyTemplateId;
        }
        if (formParams.reSend == 1) {
          formParams.type = null;
        }
        this.axios.post(saveApi, formParams).then(res => {
          if (!res || !res.data || res.data.code != 0) return;
          this.$Message.success('操作成功！');
          this.closeModal();
          this.$nextTick(() => {
            // 刷新列表
            this.$emit('updateList');
          })
        }).finally(() => {
          this.modalLoading = false;
        })
      });
    },
    // 上传图片
    uploadImageBefore (file) {
      const imgKey = `${new Date().getTime()}-${(Math.random() * Math.pow(10, 10)).toFixed(0)}`;
      this.uploadFileList.push({ url: '', path: '', loading: true, fail: false, imageId: imgKey, name: file.name });
      let newForm = new FormData(); // 创建form对象
      newForm.append('file', file);
      this.axios.post(this.uploadFilesUrl, newForm, { isCache: false }).then(res => {
        if (!res || !res.data || res.data.code != 0 || !res.data.datas) {
          this.uploadFileList.forEach(item => {
            if (item.imageId == imgKey) {
              item.loading = false;
              item.fail = true;
            }
          });
          return;
        }
        this.uploadFileList.forEach(item => {
          if (item.imageId == imgKey) {
            item.loading = false;
            item.url = `./filenode/s${res.data.datas}`;
            item.path = res.data.datas;
          }
        });
      }).catch(err => {
        console.error(err);
        this.uploadFileList.forEach(item => {
          if (item.imageId == imgKey) {
            item.loading = false;
            item.fail = true;
          }
        });
      });
      return false;
    },
    fileFormatError (file, fileList) {
      this.$Message.error(`文件：${file.name} 格式不不符合图片格式，请上传图片`);
    },
    // 图片预览
    imageView (index, imgList = []) {
      let imgIndex = index;
      const viewerImages = imgList.filter(f => !this.$common.isEmpty(f.url));
      if (this.$common.isEmpty(viewerImages)) return;
      const maxIndex = viewerImages.length - 1;
      if (imgIndex > maxIndex) {
        imgIndex = maxIndex;
      }
      viewerApi({
        options: {
          toolbar: true,
          url: 'url',
          initialViewIndex: imgIndex,
          zIndex: 2147483647
        },
        images: viewerImages
      })
    },
    // 删除图片
    deleteImage (index) {
      this.uploadFileList.splice(index, 1);
    },
    // 开始拖拽
    dragStart (index) {
      this.dragItemIndex = index;
    },
    // 拖拽过程
    dragEnter (index) {
      this.replaceItemIndex = index;
    },
    // 结束拖拽
    dragend (index) {
      let imageList = this.$common.copy(this.uploadFileList);
      if (this.dragItemIndex == this.replaceItemIndex) return;
      let dragItem = imageList[this.dragItemIndex];
      dragItem.isInset = true;
      let newItem = this.$common.copy(dragItem);
      delete newItem.isInset;
      // 插入图片
      imageList.splice(this.replaceItemIndex >= this.dragItemIndex ? this.replaceItemIndex + 1 : this.replaceItemIndex, 0, newItem);
      // 将被拖动的图片移除
      imageList = imageList.filter((item) => !item.isInset);
      // 赋值改变位置
      this.uploadFileList = imageList;
      this.$nextTick(() => {
        this.dragItemIndex = null;
        this.replaceItemIndex = null;
      })
    },
    // 关闭前
    modelBeforeClose () {
      return new Promise(() => {});
    },
    // 验证店铺账号
    validatorSaleAccount (rule, value, callback) {
      this.$nextTick(() => {
        const newVal = this.formData.saleAccountIdList;
        this.$common.formItemVerify(rule, newVal, callback);
      })
    },
    // 验证自动回复发送时间
    validatorType (rule, value, callback) {
      this.$nextTick(() => {
        const newVal = this.formData.type;
        this.$common.formItemVerify(rule, newVal, callback);
      })
    },
    // 自动发送选项改变时
    reSendChange (val) {
      if (!val) return;
      this.formData.type = null;
      this.$nextTick(() => {
        setTimeout(() => {
          this.$refs.editModalForm && this.$refs.editModalForm.validateField('type');
        }, 100)
      })
    }
  }
};
</script>
<style lang="less" scoped>
.edit-modal-main{
  position: relative;
  padding-right: 30px;
  padding-left: 10px;
  .item-content-flex{
    :deep(.ivu-form-item-content) {
      display: flex;
    }
  }
  :deep(.ivu-form-item-content) {
    .ivu-input-type-textarea{
      textarea {
        resize: none;
      }
    }
  }
  .error-color {
    color: #f20;
  }
  .image-item{
    position: relative;
    display: inline-block;
    vertical-align: middle;
    width: 100px;
    height: 100px;
    margin-right: 10px;
    margin-bottom: 10px;
    box-shadow: 0px 2px 5px #ccc;
    text-align: center;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .operate-mark {
      display: none;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(#000, 0.6);
      z-index: 120;
      cursor: move;
      &.upload-disabled-mark{
        cursor: initial;
      }
    }
    &:hover{
      .operate-mark{
        display: block;
      }
    }
    .operate-btn{
      display: flex;
      position: absolute;
      top: 50%;
      transform: translate(0, -50%);
      width: 100%;
      justify-content: center;
      color: #e6e6e6;
      i {
        cursor: pointer;
      }
    }

  }
  .upload-image{
    display: inline-block;
    vertical-align: middle;
  }
  .upload-icon {
    display: flex;
    width: 100px;
    height: 100px;
    border: 1px dashed #ccc;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #8b8b8b;
    &.upload-disabled{
      color: #ccc;
      cursor: no-drop;
      &:hover{
        border: 1px dashed #ccc;
        color: #ccc;
      }
    }
    &:hover{
      border: 1px dashed #2196F3;
      color: #2196F3;
    }
  }
}
.flip-list-move {
  transition: transform 0.3s ease-in;
}
.modal-close{
  padding: 7px 0 7px 7px;
  color: #fff;
}
</style>
