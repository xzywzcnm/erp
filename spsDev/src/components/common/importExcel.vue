<template >
  <Modal v-model="modal" :title="title" @on-ok="upload" @on-cancel="uploadCancel" >
    <p style="margin-top: 20px;float: left;" >选择需要导入的文件 </p >
    <div >
      <dytUpload
          ref="upload"
          name="file"
          :data="uploadData"
          :headers="headObj"
          :show-upload-list="false"
          :on-success="handleSuccess"
          :on-format-error="handleFormatError"
          :action="action"
          :format="['xlsx','xls']" >
        <!-- :before-upload="handleUpload" -->
        <Button style="marginLeft:10px;marginTop:10px;" >选择文件</Button >
      </dytUpload >
      <div
          v-if="file !== null" style="marginTop:10px" > 上传文件：{{ file.name }}
      </div >
    </div >
    <div slot="footer" >

    </div >
    <div class="skuModalBtn" >
      <Button type="text" @click="loadTemplate" >下载模板</Button >
    </div >
  </Modal >
</template>

<script>
// import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  name: 'importModal',
  mixins: [Mixin],
  props: {
    action: {
      type: String, // 上传地址
      required: true
    },
    title: {
      type: String, // modal title
      required: true
    },
    downloadApi: {
      type: String, // 下载模板接口
      required: true
    },
    uploadData: {
      type: String // 上传参数
    },
    service: {
      type: String // 当前系统
    }
  },
  data () {
    return {
      modal: false,
      file: null,
      confirmUpload: false // 是否确认上传文件
    };
  },
  methods: {
    loadTemplate () { // 下载模板
      // let v = this;
      const path = this.$store.state.imgUrl + '/sps-service/template/backPlanTemplate.xlsx';
      window.location.href = path;
    },
    upload () { // 导入模态框 确认
      if (this.file !== null) {
        this.confirmUpload = true;
        this.$refs.upload.upload(this.file);
      } else {
        this.importModalLoading = false;
        this.$nextTick(function () {
          this.importModalLoading = true;
        });
        this.$Message.error('请选择文件');
      }
    },
    uploadCancel () { // 导入模态框 取消
      this.file = null;
    },
    handleSuccess (res, file, fileList) { // 上传成功
      if (res.code === 0) {
        this.file = null;
        this.$Message.success('导入成功');
        this.confirmUpload = false;
        this.importModal = false;
        this.pageParamsStatus = true;
        this.modal = false;
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
      } else if (res.code === 222008) {
        this.$Notice.error({
          title: '批量导入失败,详情请下载',
          desc: '<a target="_blank" href="' + this.$store.state.imgUrl + res.datas + '">' + res.datas + '</a>',
          duration: 0
        });
      } else {
        this.importModalLoading = false;
        this.$nextTick(function () {
          this.importModalLoading = true;
        });
        this.$Message.error('操作失败，请重新尝试');
      }
    },
    handleFormatError (file) { // 上传失败
      this.$Notice.warning({
        title: '上传文件格式有误',
        desc: '文件 ' + file.name + ' 格式错误, 请选择[XLS或XLSX]'
      });
      this.importModalLoading = false;
      this.$nextTick(function () {
        this.importModalLoading = true;
        this.confirmUpload = false;
      });
    },
    handleUpload (file) { // Excel 导入
      this.file = file;
      return this.confirmUpload;
    }
  },
  computed: {}
};
</script >

<style scoped >
.skuModalBtn {
  position: absolute;
  top: 63px;
  left: 220px;
}
</style >
