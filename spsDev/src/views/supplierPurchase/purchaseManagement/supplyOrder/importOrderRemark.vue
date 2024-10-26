<template>
  <div>
    <Modal class="modal-main radioForm" :mask-closable="false" title="导入数据" :width="700" v-model="formData.modelVisible">
      <div class="content importOrderRemark">
        <Form ref="formValidate" :label-width="200">
          <FormItem label="选择导入文件：">
            <!-- <dytUpload ref="upload" name="file" style="float: left;" action="//jsonplaceholder.typicode.com/posts/" :format="['xlsx','xls']" :show-upload-list="false" :on-success="handleSuccess" :on-format-error="handleFormatError" :before-upload='beforeHandle'>
              <Button class="ml10" type="primary" style="height:25px">选择文件</Button>
            </dytUpload> -->
            <Button icon="ios-cloud-upload-outline" class="upload-btn" @click="uploadLoading = true">
              选择文件
              <input type="file" name="file" class="upload-file" @change="handleFileChange" />
            </Button>

            <span style="margin-left:35px;color:#2700f9;cursor:pointer" @click="downTemplate">下载模版</span>
          </FormItem>
          <FormItem label="文件：">
            <span class="ml10">{{file==null?'':file.name}}</span>
          </FormItem>
          <FormItem label="导入的'采购单号+sku'一致时：">
            <RadioGroup v-model="isCover">
              <Radio :label=0>覆盖</Radio>
              <Radio :label=1 class="ml20">忽略</Radio>
            </RadioGroup>
          </FormItem>
        </Form>
      </div>
      <div slot="footer" style="text-align: center;">
        <Button type="primary" @click="confirm">确定</Button>
        <Button @click="formData.modelVisible = false">关闭</Button>
      </div>
    </Modal>

  </div>

</template>

<script>
import Mixin from '@/components/mixin/common_mixin';
export default {
  mixins: [Mixin],
  props: {
    dialogImport: {
      type: Object,
      default () {
        return {
          modelVisible: false,
        };
      }
    }
  },
  data () {
    return {
      formData: this.dialogImport,
      isCover: 0,
      file: null,
      filenodeViewTargetUrl: this.$store.state.imgUrl, // filenode根路径
    }
  },
  methods: {
    //确定
    confirm () {
      let formData = new FormData();
      formData.append('file', this.file)
      formData.append('isCover', this.isCover)
      this.axios.post('/sps-service/sps/orderInfo/importFollowRemark', formData).then(res => {
        this.$Message.success('导入成功')
        this.file = null
        this.isCover = 0
        this.$emit('searchForm')
        this.formData.modelVisible = false
      })
    },
    //下载模版
    downTemplate () {
      this.axios.post('/sps-service/sps/orderInfo/downloadImportTemplate').then(res => {
        window.open('./filenode' + res.data.datas);
      })
    },
    handleFileChange (e) {
      this.uploadLoading = true;
      let file = e.target.files[0]
      const format = ['xlsx', 'xls', 'xml']; // 接受上传的文件类型
      const testFile = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase();//获取后缀
      if (!format.includes(testFile)) {
        this.$Message.error({
          content: this.file.name + `文件格式不正确, 请选择xlsx, xls, xml格式的文件~`,
          duration: 2
        });
        return;
      }
      if (file.size > 5242880) {
        this.$Message.error(this.file.name + '文件大小不能超过5MB');
        return;
      }
      this.file = e.target.files[0]
    }



  }

}
</script>

<style lang='less'>
.importOrderRemark {
  .ivu-form-item {
    margin-bottom: 8px;
  }
  .upload-btn {
    position: relative;
    overflow: hidden;
  }
  .upload-file {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    opacity: 0;
    cursor: pointer;
  }
}
</style>