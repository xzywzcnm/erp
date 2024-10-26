<template>
  <Modal
    v-model="modal1"
    title="导入退货跟踪号"
    :loading="loading">
    <div class="flexBox line32">
      <p style="flex-shrink: 0">选择导入文件：</p>
      <div>
        <dytUpload
          ref="importUpload"
          name="files"
          handleSuccess
          :headers="headObj"
          :data="uploadData"
          :show-upload-list="false"
          :on-success="handleSuccess"
          :on-format-error="handleFormatError"
          :action="uploadFiles"
          :format="['xlsx','xls']"
          :before-upload="handleUpload">
          <Button>选择文件</Button>
        </dytUpload>
        <div
          v-if="file !== null" style="max-width: 360px;"> 上传文件：{{ file.name }}
        </div>
      </div>
      <Button
        type="text" @click="loadTemplate">下载模板 </Button>
    </div>
    <div class="mt10">
      导入的数据已存在时：
      <RadioGroup v-model="uploadData.updateIgnore">
        <Radio label="0">覆盖</Radio>
        <Radio label="1">忽略</Radio>
      </RadioGroup>
    </div>
    <div class="flexBox mt10">
      <div style="flex-shrink: 0">提示：</div>
      <div>
        <p>1、只能导入未标发货订单的退货跟踪号数据，不能导入已标发货的退货跟踪号数据；</p>
        <p>2、发货物流资料在物流渠道的设置中，可以设置自动获取；</p>
        <p>3、当一个订单有多个包裹时，须填写包裹的对应的出库单号；</p>
      </div>
    </div>
    <div slot="footer">
      <Button @click="confirm" type="primary">确定</Button>
      <Button @click="modal1 = false">取消</Button>
    </div>
  </Modal>
</template>

<script>
import Mixin from '@/components/mixin/common_mixin';
import api from '@/api/api';

export default {
  name: 'returnTrackingNumberModal',
  mixins: [Mixin],
  data () {
    return {
      file: null,
      modal1: false,
      loading: false,
      confirmUpload: false,
      uploadData: {
        updateIgnore: '0',
        platformId: 'otto'
      },
      uploadFiles: api.post_orderInfo_excelImportHandReturnTrackingNumber // 上传文件
    };
  },
  created () {

  },
  props: {},
  watch: {},
  methods: {
    open () {
      this.modal1 = true;
    },
    confirm () { // 导入sku模态框 确认
      if (this.file !== null) {
        this.confirmUpload = true;
        this.$refs.importUpload.upload(this.file);
      } else {
        this.addSkuModalLoading = false;
        this.$nextTick(function () {
          this.addSkuModalLoading = true;
        });
        this.$Message.error('请选择文件');
      }
    },
    handleUpload (file) { // Excel 导入
      this.file = file;
      return this.confirmUpload;
    },
    handleSuccess (res, file, fileList) { // 上传成功
      if (res.code === 0) {
        this.file = null;
        this.$Message.success('已生成导入任务，可在“查看导入任务”中查询导入结果');
        this.confirmUpload = false;
        this.addSku = false;
      }
    },

    handleFormatError () { // 上传失败
      this.$Message.error('文件格式有误');
      this.addSkuModalLoading = false;
      this.$nextTick(function () {
        this.addSkuModalLoading = true;
        this.confirmUpload = false;
      });
    },
    loadTemplate () { // 下载模板
      let v = this;
      let newTab = window.open('about:blank');
      v.axios.get(api.get_orderInfo_getTemplet).then(response => {
        if (response.data.code === 0) {
          // let filenodeViewTargetUrl = v.$store.state.erpConfig.filenodeViewTargetUrl;
          newTab.location.href = v.filenodeViewTargetUrl + response.data.datas;
        }
      });
    }
  }
};
</script>

<style scoped>

</style>
