<style scoped >
.demo-upload-list {
  display: inline-block;
  width: 100%;
  height: 100%;
  text-align: center;
  overflow: hidden;
  position: relative;
  z-index: 10;
  vertical-align: middle;
}

.demo-upload-list img {
  min-width: 100%;
  height: 100%;
}

.blockUp {
  width: 100%;
  height: 100%;
  overflow: hidden;
  margin: auto;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  vertical-align: middle;
  z-index: 9;
  box-sizing: border-box;
}

.imgBar {
  box-sizing: border-box;
}

</style>
<template>
  <div >
    <dytUpload
        ref="upload"
        type="drag"
        :class="{ blockUp: !echoImg }"
        name='files'
        :headers=headObj
        :action="uploadData.url"
        :show-upload-list="false"
        :default-file-list="defaultList"
        :on-success="handleSuccess"
        :format="['jpg','jpeg','png','gif']"
        :max-size="2048"
        :on-format-error="handleFormatError"
        :on-exceeded-size="handleMaxSize"
        :before-upload="handleBeforeUpload" >
      <div class="imgBar verMiddle" :style="{'height':upLoadHeight-54+'px'}" >
        <div class="imgNone" v-if="uploadList.length===0" >
          <Icon type="ios-cloud-upload" size="52" style="color: #3399ff" ></Icon >
          <p style="color:#999;" >点击或是拖拽上传</p >
        </div >
        <div class="demo-upload-list" v-if="uploadList[uploadList.length-1]" >
          <template v-if="uploadList[uploadList.length-1].status === 'finished'" >
            <img :src="uploadList[uploadList.length-1].url" alt="点击上传图片" title="点击上传图片" >
          </template >
          <template v-else >
            <p style="color:#999;margin-top:120%;" >上传中请稍候...</p >
            <Progress
                v-if="uploadList[uploadList.length-1].showProgress"
                :percent="uploadList[uploadList.length-1].percentage"
                hide-info ></Progress >
          </template >
        </div >
      </div >
    </dytUpload >
    <Modal title="浏览图片" v-model="visible" >
      <img :src="'https://o5wwk8baw.qnssl.com/' + imgName + '/large'" v-if="visible" style="width: 100%" >
    </Modal >
  </div >
</template >

<script >
export default {
  props: ['upLoadHeight', 'uploadData', 'echoImg'],
  data () {
    return {
      defaultList: [],
      imgName: '',
      visible: false,
      uploadList: [],
      fileObj: {
        imageType: this.uploadData.imageType,
        url: ''
      }
    };
  },
  mounted () {
    this.$nextTick(function () {
      let v = this;
      v.uploadList = v.$refs.upload.fileList;
    });
  },
  created () {
    let v = this;
    let originObj = v.uploadData.defaultList || v.echoImg;
    if (originObj) {
      let url = originObj[0].url;
      let len = url.split('/').length;
      let name = url.split('/')[len - 1].split('.')[0];
      let obj = {
        url: url,
        name: name
      };
      v.defaultList.push(obj);
    }
  },
  methods: {
    handleSuccess (res, file) {
      let v = this;
      if (res.code == 0) {
        file.url = res.datas;
        v.fileObj.url = res.datas;
        if (v.echoImg) {
          v.echoImg[0].url = res.datas;
          v.$emit('getUrl', v.echoImg[0].url);
        }
      } else {
        v.$Message.error('上传失败，请重试');
        new Error('图片上传接口异常！');
      }
    },
    handleFormatError (file) {
      this.$Notice.warning({
        title: '上传文件格式有误',
        desc: '文件 ' + file.name + ' 格式错误, 请选择[jpg、png或gif]'
      });
    },
    handleMaxSize (file) {
      this.$Notice.warning({
        title: '文件大小受限',
        desc: '文件 ' + file.name + ' 太大, 不能超过2M'
      });
    },
    handleBeforeUpload () {
      /* const check = this.uploadList.length < 5;
       if (!check) {
       this.$Notice.warning({
       title: 'Up to five pictures can be uploaded.'
       });
       }
       return check; */
    }
  }
};
</script >
