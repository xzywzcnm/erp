<template>
  <!--  @on-ok="upload" -->
  <Modal v-model="model1" title="导入" @on-visible-change="visibleFn" @on-cancel="exportCancel" width="760"
    :mask-closable="false">
    <div class="clear">
      <div style="display: flex;align-items:center">
        <p class="urlText">选择导入文件：</p>
        <dytUpload ref="upload1" :name="files" :data="uploadData" :headers="headObj" :show-upload-list="false"
          :on-success="handleSuccess" :on-format-error="handleFormatError" :action="actionUrl"
          :format="['xlsx', 'xls', 'xlsm']" :before-upload="handleUpload">
          <Button>选择文件</Button>
        </dytUpload>
        <Button type="text" @click="loadTemplate" class="ml10">下载模板</Button>
      </div>
      <div v-if="file !== null" style="marginTop:10px"> 上传文件：{{ file.name }}</div>
    </div>
    <span class="mt10" style="display:block;background-color:#e3e5e8;padding: 4px 6px;">
      提示：采购价不填写时，使用商品的采购成本价；
    </span>

    <div slot="footer">
      <Button @click="model1 = false">取消</Button>
      <Button type="primary" @click="upload">确认</Button>
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
  data() {
    return {
      model1: false,
      confirmUpload: false,
      file: null,
      uploadData: {
        // updateIgnore: '0',
        // warehouseId: this.getWarehouseId()
      }
    };
  },
  created() {
  },
  computed: {
    headObj() {
      return {
        ...this.$store.getters.erpRequestHeaders,
        ...this.$store.getters.dytRequestHeaders
      }
    }
  },
  watch: {},
  methods: {
    visibleFn(open) {
      if (open) {
        this.confirmUpload = false;
        this.file = null;
      }
    },
    handleUpload(file) {
      // Excel 导入
      this.file = file;
      return this.confirmUpload;
    },
    handleSuccess(res, file, fileList) {
      // 上传成功
      let v = this;
      if (res.code === 0) {
        v.file = null;
        v.confirmUpload = false;
        v.$Message.success('上传成功');
        v.$emit('getList');
        this.model1 = false;
      } else if (res.code === 554127) {
        v.$Message.error('存在空的LAPA SKU');
      } else if (res.code === 554128) {
        v.$Message.error('存在空的skuCode');
      } else if (res.code === 554129) {
        v.$Message.error('LAPA SKU系统不存在');
      } else if (res.code === 554130) {
        v.$Message.error('skuCode 系统不存在');
      } else if (res.code === 554132) {
        v.$Message.error('头程成本必须是数字');
      } else if (res.code === 999993) {
        v.$Message.error(res.message);
      } else if (res.code === 554150) {
        v.$Message.error('出库单编号为空');
      } else if (res.code === 554151) {
        v.$Message.error('发货时间为空');
      } else if (res.code === 554152) {
        v.$Message.error('发货数量为空');
      } else if (res.code === 554148) {
        v.$Message.error('sku为空');
      } else {
        v.$Message.error('操作失败，请重新尝试');
      }
    },
    loadTemplate() {
      // 下载模板
      let v = this;
      // let newTab = window.open('about:blank');
      let filenodeViewTargetUrl = v.$store.state.imgUrlPrefix;
      // 模版本地下载
      if (v.loadTemplateLocalApi) {
        // newTab.location.href = '/wms-service/' + filenodeViewTargetUrl + v.loadTemplateLocalApi;
        window.open('/wms-service/' + filenodeViewTargetUrl + v.loadTemplateLocalApi, '_self');
      }
      // 模版下载
      // v.axios.get(v.loadTemplateApi).then(response => {
      //   if (response.data.code === 0) {
      //     newTab.location.href = '/wms-service/' + filenodeViewTargetUrl + response.data.datas;
      //   }
      // });
    },
    exportCancel() {
      // 导入模态框 取消
      let v = this;
      v.file = null;
    },
    upload() {
      if (!this.file) {
        this.$Message.error('请选择要导入的文件~');
        return false;
      }
      // 导入模态框 确认
      // console.log(this.actionUrl, 'this.actionUrl');
      this.confirmUpload = true;
      this.$refs.upload1.upload(this.file);
    },
    handleFormatError() {
      // 上传失败
      this.$Message.error('上传失败');
    }
  }
};
</script >

<style scoped ></style >
