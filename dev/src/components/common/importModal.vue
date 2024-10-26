<template >
  <Modal
    v-model="modal"
    :title="title"
    width="700px"
  >
    <div class="odal-main-body">
      <div class="flex-block" v-if="platformId && !hiddenStore">
        <div class="label-style required-label">选择店铺</div>
        <dyt-select v-model="saleAccountId" placeholder="请选择店铺">
          <Option
            v-for="item in shopDataList"
            :key="item.saleAccountId"
            :value="item.saleAccountId"
            :label="item.accountCode"
          />
        </dyt-select>
      </div>
      <div class="flex-block mt10">
        <div class="label-style required-label">选择需要导入的文件</div>
        <dytUpload
          ref="upload"
          :name="name"
          :data="uploadParams"
          :headers="headObj"
          :show-upload-list="false"
          :on-success="handleSuccess"
          :on-format-error="handleFormatError"
          :action="action"
          :format="['xlsx','xls']"
          accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          :before-upload="handleUpload"
        >
          <Button type="primary">选择文件</Button >
        </dytUpload>
      </div>
      <slot ></slot >
      <div class="flex-block mt10 between">
        <div v-if="file !== null"> 上传文件：{{ file.name }}</div>
        <div v-else></div>
        <div class="mr20">
          <Button type="text" @click="loadTemplate" style="color:#2d8cf0">下载模板 </Button >
        </div>
      </div>
      <div class="tips-error mt20">
        <span v-if="platformId">备注：手动订单默认“未付款”，需要“标记付款”</span>
      </div>
      <Spin fix v-if="pageLoading">正在处理数据中...</Spin>
    </div>
    <div slot="footer">
      <Button @click="uploadCancel">取 消</Button>
      <Button type="primary" @click="modalConfirm" :loading="pageLoading">确 定</Button>
    </div>
  </Modal>
</template>

<script>
import Mixin from '@/components/mixin/common_mixin';

export default {
  name: 'importModal',
  mixins: [Mixin],
  props: {
    hiddenStore: { type: Boolean, default: false },
    action: {
      type: String, // 上传地址
      required: true
    },
    title: {
      type: String, // modal title
      required: true
    },
    downloadApi: {
      type: String // 下载模板接口
    },
    loadTemplateLocalApi: { // 模板本地下载地址
      type: String
    },
    uploadData: {
      type: Object // 上传参数
    },
    service: {
      type: String // 当前系统
    },
    name: {
      type: String, // 当前系统
      default: 'file'
    },
    // 其他数据
    otherData: {
      type: Object, // 上传参数
      default: () => {
        return {}
      }
    },
  },
  data () {
    return {
      modal: false,
      file: null,
      saleAccountId: '',
      pageLoading: false,
      confirmUpload: false // 是否确认上传文件
    };
  },
  watch: {
    modal (newVal) {
      !newVal && this.uploadCancel();
    }
  },
  computed: {
    platformId () {
      if (this.$common.isEmpty(this.otherData) || this.$common.isEmpty(this.otherData.platformId)) return '';
      return this.otherData.platformId;
    },
    shopDataList () {
      if (this.$common.isEmpty(this.otherData) || this.$common.isEmpty(this.otherData.shopList)) return [];
      return this.otherData.shopList;
    },
    // 上传文件额外参数
    uploadParams () {
      let uploadParams = this.$common.copy(this.uploadData);
      if (!this.$common.isEmpty(this.platformId)) {
        uploadParams = { ...uploadParams, platformId: this.platformId, saleAccountId: this.saleAccountId };
      }
      if (this.hiddenStore) {
        delete uploadParams.saleAccountId;
      }
      return uploadParams;
    }
  },
  methods: {
    loadTemplate () { // 下载模板
      let v = this;
      let newTab = window.open('about:blank');
      if (v.loadTemplateLocalApi) {
        newTab.location.href = v.filenodeViewTargetUrl + v.loadTemplateLocalApi;
        return;
      }
      v.axios.get(v.downloadApi).then(response => {
        if (response.data.code === 0) {
          newTab.location.href = v.filenodeViewTargetUrl + response.data.datas;
        }
      });
    },
    // 导入模态框 确认
    modalConfirm () {
      if (!this.hiddenStore && !this.$common.isEmpty(this.platformId) && this.$common.isEmpty(this.saleAccountId)) {
        this.$Message.error('请选择店铺');
        return;
      }
      if (this.file !== null) {
        this.confirmUpload = true;
        this.pageLoading = true;
        this.$refs.upload.upload(this.file);
        return;
      }
      this.importModalLoading = false;
      this.$nextTick(() => {
        this.importModalLoading = true;
      });
      this.$Message.error('请选择文件');
    },
    uploadCancel () { // 导入模态框 取消
      this.modal = false;
      this.$nextTick(() => {
        this.file = null;
      })
    },
    handleSuccess (res, file, fileList) { // 上传成功
      this.pageLoading = false;
      if (res.code === 0) {
        this.file = null;
        this.$Message.success('已生成导入任务，可在“查看导入任务”中查询导入结果');
        this.confirmUpload = false;
        this.importModal = false;
        this.pageParamsStatus = true;
        this.uploadCancel();
        this.$emit('refreshTable');
      } else if (res.code === 310008) {
        this.importModalLoading = false;
        this.$nextTick(function () {
          this.importModalLoading = true;
        });
        this.$Message.error('包材名称存在空值');
      } else if (res.code === 310002) {
        this.importModalLoading = false;
        this.$nextTick(function () {
          this.importModalLoading = true;
        });
        this.$Message.error('包材名称存在重复');
      } else if (res.code === 310001) {
        this.importModalLoading = false;
        this.$nextTick(function () {
          this.importModalLoading = true;
        });
        this.$Message.error('数据库中存在包材名称');
      } else {
        this.importModalLoading = false;
        this.$nextTick(function () {
          this.importModalLoading = true;
        });
        (!res || ![999993, '999993'].includes(res.code)) && this.$Message.error('操作失败，请重新尝试');
      }
    },
    handleFormatError () { // 上传失败
      this.$Message.error('文件格式有误');
      this.importModalLoading = false;
      this.pageLoading = false;
      this.$nextTick(function () {
        this.importModalLoading = true;
        this.confirmUpload = false;
      });
    },
    handleUpload (file) { // Excel 导入
      this.file = file;
      return this.confirmUpload;
    }
  }
};
</script>

<style lang="less" scoped >
.tips-error{
  color: #f20;
}
.flex-block {
  display: flex;
  align-items: center;
  .label-style{
    margin-right: 10px;
    width: 140px;
    text-align: right;
  }
  .required-label{
    position: relative;
    &:before{
      content: '*';
      display: inline-block;
      margin-right: 4px;
      line-height: 1;
      font-family: SimSun;
      font-size: 14px;
      color: #ed4014;
    }
  }
  :deep(.dyt-select-demo) {
    width: 200px;
  }
  &.between{
    justify-content: space-between;
  }
}
</style>
