<template>
  <div class="qualityTestPage">
    <div class="formDetail">
      <Form :label-width="120" :rules="formValidate" :model="formInfo" class="disable-color " :inline="true"
        ref="formValidate">
        <FormItem label="质检标准：" style="width:100%;">
          <!-- <upload-common v-model="formInfo.fileList" :isDisabled="isDisabled" @manualUpload="manualUpload"
            :options="{ name: 'file', maxSize: 40960 }" :showFileName="true"></upload-common> -->
          <div class="file-name">
            <Icon class="icons" type="md-document" @click="fileDownload" />
          </div>
        </FormItem>
        <div class="formWidth180">
          <FormItem label="质检比例：" prop="qualityCheckRatio">
            <dyt-select v-model="formInfo.qualityCheckRatio" :disabled="isDisabled">
              <Option :value="item.value" v-for="item in qualityCheckRatioList" :key="item.value" :label="item.label">
              </Option>
            </dyt-select>
          </FormItem>
          <!-- 创建完出库单显示 -->
          <template v-if="detailData.pickingGoodsStatus == 1">
            <FormItem label="质检sku总数量：">
              <div>{{ detailData.qualityCheckSkuNumber || 0 }}</div>
            </FormItem>
            <FormItem label="质检总数量：">
              <div>{{ detailData.qualityCheckNumber || 0 }}</div>
            </FormItem>
            <FormItem label="已检合格总数：">
              <div>{{ detailData.acceptanceSumNumber || 0 }}</div>
            </FormItem>
            <FormItem label="已检问题总数：">
              <div>{{ detailData.problemSumNumber || 0 }}</div>
            </FormItem>
          </template>
        </div>
      </Form>
    </div>
  </div>
</template>

<script>
import api from '@/api/api';
// import uploadCommon from './uploadCommon';
export default {
  name: 'qualityTest',
  // components: { uploadCommon },
  props: {
    detailData: {
      type: Object,
      default() {
        return {}
      }
    },
    // isEdit: {
    //   type: Boolean,
    //   default: false
    // }
  },
  data() {
    return {
      formInfo: {
        // fileList: [],
        qualityCheckRatio: 100, // 默认100%
      },
      formValidate: {
        // fileList: [
        //   { required: true, message: '请上传质检标准', trigger: 'change', type: 'array' }
        // ],
        qualityCheckRatio: [
          { required: true, message: '请选择质检比例', trigger: 'change', type: 'number' }
        ],
      },
      qualityCheckRatioList: {
        0: { label: '0%', value: 0 },
        100: { label: '100%', value: 100 },
      },
    }
  },
  created() { },
  watch: {
    detailData: {
      handler(val) {
        if (!val.pickingId) return;
        this.setData(JSON.parse(JSON.stringify(val)));
      },
      deep: true,
      immediate: true,
    }
  },
  computed: {
    isDisabled() {
      return !!this.detailData.pickingId;
      // qualityCheckStatus:质检状态(0:未质检，1:质检完成);
      // return !(this.isEdit && this.detailData.qualityCheckStatus === 0);
    }
  },
  methods: {
    setData(val) {
      this.formInfo.qualityCheckRatio = val.qualityCheckRatio;
      // if (val.qualityCheckStandardFilePath && val.qualityCheckStandardFileName) {
      //   this.formInfo.fileList = [{
      //     url: val.qualityCheckStandardFilePath,
      //     name: val.qualityCheckStandardFileName,
      //     isUrl: true,
      //   }];
      // } else {
      //   this.formInfo.fileList = [];
      // }
    },
    // // 手动导入
    // manualUpload(res) {
    //   this.formInfo.fileList = res ? [res] : [];
    // },
    // 保存表单信息
    handleSubmit() {
      return new Promise((resolve, reject) => {
        this.$refs['formValidate'].validate((valid) => {
          if (valid) {
            let formInfo = this.formInfo;
            // let file = formInfo.fileList[0];
            // let fun = (url) => {
            //   let temp = {};
            //   temp.qualityCheckStandardFilePath = url;
            //   temp.qualityCheckStandardFileName = file.name;
            //   temp.qualityCheckRatio = formInfo.qualityCheckRatio;
            //   resolve(temp);
            // }
            // // 文件是否详情返回url
            // if (file.isUrl) {
            //   fun(file.url);
            // } else {
            // let formData = new FormData();
            // formData.append('excelFile', file);
            // let apiUrl = api.uploadFbaQuality;
            // let pickingId = this.detailData.pickingId;
            // if (pickingId) apiUrl += `?pickingId=${pickingId}`;
            // // 上传文件
            // this.axios.post(apiUrl, formData).then(({ data }) => {
            //   if (data.code !== 0) return resolve(false);
            //   fun(data.datas);
            // }).catch(() => {
            //   resolve(false);
            // })
            // }
            let temp = {};
            temp.qualityCheckRatio = formInfo.qualityCheckRatio;
            resolve(temp);
          } else {
            resolve(false);
          }
        })
      })
    },
    // 文件下载
    fileDownload() {
      let fileUrl = this.$common.splicingPath(api.qualityCheckStandard);
      window.open(fileUrl);
    },
  }
}
</script>
<style lang="less" scoped>
.qualityTestPage {

  .file-name {
    color: #2d8cf0;

    .icons {
      font-size: 36px;
      cursor: pointer;
    }
  }
}
</style>
