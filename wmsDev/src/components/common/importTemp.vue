<template >
  <Modal v-model="model1" title="导入" @on-ok="upload" @on-visible-change="visibleFn" @on-cancel="exportCancel">
    <div class="clear">
      <div class="fl">
        <!-- 选择导入文件 -->
        <p class="urlText">选择导入文件：</p>
        <div>
          <dytUpload
            ref="upload1"
            :name="files"
            :data="uploadData"
            :headers="headObj"
            :show-upload-list="false"
            :on-success="handleSuccess"
            :on-error="handleError"
            :on-format-error="handleFormatError"
            :action="actionUrl"
            :format="['xlsx','xls']"
            :before-upload="handleUpload"
          >
            <Button style="marginLeft:10px;marginTop:10px;">选择文件</Button>
          </dytUpload>
          <div v-if="file !== null" style="marginTop:10px"> 上传文件：{{ file.name }}</div>
        </div>
      </div>
      <div style="margin-top: 15px;float: right">
        <!-- 下载模板 -->
        <Button type="text" @click="loadTemplate">下载模板</Button>
      </div>
    </div>
  </Modal>
</template>

<script>
// import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
// import { getToken } from '@/utils/cookie';

export default {
  name: 'exportTemp',
  mixins: [Mixin],
  props: {
    actionUrl: {
      // 上传地址
      type: String
    },
    loadTemplateApi: {
      // 模板下载地址
      type: String
    },
    loadTemplateLocalApi: {
      // 模板本地下载地址
      type: String
    },
    files: {
      // files name
      type: String
    }
  },
  data () {
    return {
      model1: false,
      confirmUpload: false,
      file: null,
      uploadData: {
        updateIgnore: '0',
        warehouseId: this.getWarehouseId()
      }
    };
  },
  created () { },
  computed: {
    headObj () {
      return {
        ...this.$store.getters.erpRequestHeaders,
        ...this.$store.getters.dytRequestHeaders
      }
    }
  },
  watch: {},
  methods: {
    visibleFn (open) {
      if (open) {
        this.confirmUpload = false;
        this.file = null;
      }
    },
    handleUpload (file) {
      // Excel 导入
      this.file = file;
      return this.confirmUpload;
    },
    // 失败处理
    // eslint-disable-next-line handle-callback-err
    handleError (error, file, fileList) {
      console.error(error);
      // this.$Message.error('操作失败，请重新尝试');
    },
    // 成功处理
    handleSuccess (res, file, fileList) {
      // 上传成功
      if (res.code === 0) {
        this.file = null;
        this.confirmUpload = false;
        this.$Message.success('上传成功');
        this.$nextTick(() => {
          this.$emit('getList');
        })
      }
      // else if (res.code === 554127) {
      //   this.$Message.error('存在空的LAPA SKU');
      // } else if (res.code === 554128) {
      //   this.$Message.error('存在空的skuCode');
      // } else if (res.code === 554129) {
      //   this.$Message.error('LAPA SKU系统不存在');
      // } else if (res.code === 554130) {
      //   this.$Message.error('skuCode 系统不存在');
      // } else if (res.code === 554132) {
      //   this.$Message.error('头程成本必须是数字');
      // } else {
      //   this.$Message.error('操作失败，请重新尝试');
      // }
    },
    loadTemplate () {
      // 下载模板
      let newTab = window.open('about:blank');
      let filenodeViewTargetUrl = this.$store.state.imgUrlPrefix;
      if (this.loadTemplateLocalApi) {
        newTab.location.href = '/wms-service/' + filenodeViewTargetUrl + this.loadTemplateLocalApi;
        return;
      }
      this.axios.get(this.loadTemplateApi).then(response => {
        if (response.data.code === 0) {
          newTab.location.href = '/wms-service/' + filenodeViewTargetUrl + response.data.datas;
        }
      });
    },
    exportCancel () {
      // 导入模态框 取消
      this.file = null;
    },
    upload () {
      // 导入模态框 确认
      this.confirmUpload = true;
      this.$refs.upload1.upload(this.file);
    },
    handleFormatError () {
      // 上传失败
      this.$Message.error('选择的文件格式不正确，请确认文件后缀为：“xlsx”或“xls”');
    }
  }
};
</script>

<style scoped ></style >
