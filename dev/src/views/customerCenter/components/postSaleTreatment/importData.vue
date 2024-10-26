<template>
  <Modal
    v-model="modalVisible"
    title="导入"
    @on-visible-change="visibleChange"
  >
    <div class="importData">
      <dytUpload
        ref="uploadFileDom"
        :headers="uploadHeader"
        :action="uploadPath"
        :format="['xlsx', 'xls', 'csv', 'PDF', 'XPS']"
        :show-upload-list="false"
        :on-success="uploadFileSuccess"
        :on-error="uploadFileError"
        :on-format-error="handleFormatError"
      >
        <Button type="primary" icon="ios-cloud-upload-outline">选择文件</Button>
      </dytUpload>
      <span class="down-load-module" @click="downLoadModule">下载模板</span>
    </div>
    <div slot="footer">
      <!-- <Button type="primary" @click="saveData">确 定</Button> -->
      <Button style="margin-right: 10px;" @click="cancel">取 消</Button>
    </div>
  </Modal>
</template>

<script>
import api from "@/api/api";

export default {
  components: {},
  props: {
    visible: { type: Boolean, default: false }
  },
  data () {
    return {
      uploadPath: api.saleReasonsTreatment.import,
      modalVisible: false
    };
  },
  watch: {
    visible: {
      deep: true,
      immediate: true,
      handler (val) {
        this.modalVisible = val;
        this.$nextTick(() => {
          val && this.init();
        })
      }
    },
    modalVisible: {
      deep: true,
      handler (val) {
        this.$emit('update:visible', val);
      }
    }
  },
  computed: {
    uploadHeader () {
      return {
        ...this.$store.getters.erpRequestHeaders,
        ...this.$store.getters.dytRequestHeaders
      }
    }
  },
  mounted () {},
  activated () {},
  methods: {
    // 初始数据
    init () {},
    // 上传成功
    uploadFileSuccess (response, file, fileList) {
      this.$Message.success('导入成功!');
      this.cancel();
      this.$emit('searchData', false);
    },
    // 上传失败
    uploadFileError (error, file, fileList) {
      console.log(error, file, fileList);
      this.$Message.error('上传失败!');
      this.clearFiles();
    },
    // 文件格式不对时
    handleFormatError (file) {
      this.clearFiles();
      this.$Notice.warning({
        title: '不支持该文件格式',
        desc: `请检查文件: ${file.name} 是否为表格`
      });
    },
    // 清空
    clearFiles () {
      this.$refs.uploadFileDom.clearFiles();
    },
    // 关闭弹窗
    cancel () {
      this.modalVisible = false;
    },
    // 下载模板
    downLoadModule () {
      const fileUrl = `${window.location.origin}${api.saleReasonsTreatment.file}`;
      console.log(fileUrl)
      this.$common.downloadFile(fileUrl);
    },
    // 弹窗状态改变
    visibleChange (val) {
      if (val) return;
      this.clearFiles();
    }
  }
};
</script>
<style lang="less" scoped>
  .importData{
    .ivu-upload{
      display: inline-block;
    }
    .down-load-module{
      display: inline-block;
      padding: 10px;
      margin-left: 10px;
      color: #2d8cf0;
      cursor: pointer;
    }
  }

</style>
