<style scoped >
.demo-upload-list {
  display: inline-block;
  width: 60px;
  height: 60px;
  text-align: center;
  line-height: 60px;
  border: 1px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
  position: relative;
  box-shadow: 0 1px 1px rgba(0, 0, 0, .2);
  margin-right: 4px;
  z-index: 10;
  vertical-align: top;
}

.demo-upload-list img {
  width: 100%;
  height: 100%;
}

.demo-upload-list-cover {
  display: none;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, .6);
}

.demo-upload-list:hover .demo-upload-list-cover {
  display: block;
}

.demo-upload-list-cover i {
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  margin: 0 2px;
}

.blockUp {
  width: 300px;
  height: 200px;
  overflow: auto;
  margin: auto;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  vertical-align: middle;
}

.bigPic {
  width: 200px;
  height: 200px;
  overflow: hidden;
}

.bigPic img {
  max-width: 100%;
  height: auto;
}
</style>
<template>
  <div >
    <div :class="['demo-upload-list',{ bigPic: index==0 }]" v-for="(item,index) in uploadList" :key="index" >
      <template v-if="item.status === 'finished'" >
        <img :src="item.url" >
        <div class="demo-upload-list-cover" >
          <Icon type="ios-eye-outline" @click.native="handleView(item.url)" ></Icon >
          <Icon type="ios-trash-outline" @click.native="handleRemove(item)" ></Icon >
        </div >
      </template >
      <template v-else >
        <Progress v-if="item.showProgress" :percent="item.percentage" hide-info ></Progress >
      </template >
    </div >
    <!--<dytUpload
      ref="upload"
      name='files'
      :headers = headObj
      :show-upload-list="false"
      :default-file-list="imgList"
      :on-success="handleSuccess"
      :format="['jpg','jpeg','png','gif']"
      :max-size="2048"
      :on-format-error="handleFormatError"
      :on-exceeded-size="handleMaxSize"
      :before-upload="handleBeforeUpload"
      multiple
      type="drag"
      :action="actionUrl"
      style="display: inline-block;width:58px;position:relative;z-index:10">
      <div style="width: 58px;height:58px;line-height: 58px;">
        <Icon type="camera" size="20"></Icon>
      </div>
    </dytUpload>-->

    <dytUpload
        ref="upload"
        name='files'
        :headers=headObj
        :show-upload-list="false"
        :default-file-list="imgList"
        :on-success="handleSuccess"
        :format="['jpg','jpeg','png','gif']"
        :max-size="2048"
        :on-format-error="handleFormatError"
        :on-exceeded-size="handleMaxSize"
        :before-upload="handleBeforeUpload"
        multiple
        type="drag"
        :action="actionUrl"
        class="blockUp" >
      <div style="padding: 20px 0" >
        <Icon type="ios-cloud-upload" size="52" style="color: #3399ff" ></Icon >
        <p style="color:#999;" >点击或是拖拽上传</p >
      </div >
    </dytUpload >
    <Modal title="浏览图片" v-model="visible" >
      <img :src="imgName" v-if="visible" style="width: 100%" >
    </Modal >

  </div >

</template >

<script >
import api from '../../api/api';

export default {
  props: ['uploadData', 'imgList'],
  data () {
    return {
      defaultList: [
        /* {
         'name': 'a42bdcc1178e62b4694c830f028db5c0',
         'url': 'https://o5wwk8baw.qnssl.com/a42bdcc1178e62b4694c830f028db5c0/avatar'
         },
         {
         'name': 'bc7521e033abdd1e92222d733590f104',
         'url': 'https://o5wwk8baw.qnssl.com/bc7521e033abdd1e92222d733590f104/avatar'
         } */
      ],
      imgName: '',
      visible: false,
      actionUrl: api.fileUpLoad,
      uploadList: []
    };
  },
  created () {
    this.initImgList();
  },
  mounted () {
    this.$nextTick(function () {
      this.uploadList = this.$refs.upload.fileList;
    });
  },
  methods: {
    initImgList () {
      this.imgList.forEach((item, index) => {
        if (!item.name) {
          let arr = item.url.split('/');
          let name = arr[arr.length - 1];
          item.name = name.split('.')[0];
        }
      });
    },
    handleView (name) {
      this.imgName = name;
      this.visible = true;
    },
    handleRemove (file) {
      const fileList = this.$refs.upload.fileList;
      let params = {
        imageId: file.id,
        pathUrl: file.url
      };
      this.axios.post(api.deleteFile, params).then(response => {
        if (response.data.code == 0) {
          let isExistImgUrl = -1; // 所删除图片是否在列表中
          fileList.forEach((item, index) => {
            return isExistImgUrl = item.url == file.url ? index : -1;
          });
          if (isExistImgUrl !== -1) {
            this.$refs.upload.fileList.splice(isExistImgUrl, 1);
            this.uploadList.splice(isExistImgUrl, 1);
            this.$Message.success('删除成功');
          }
        }
      }).catch((error) => {
        console.log(error);
      });
    },
    handleSuccess (res, file, fileList) {
      let v = this;
      if (res.code == 0) {
        file.url = res.datas;
        let arr = file.url.split('/');
        let name = arr[arr.length - 1];
        file.name = name.split('.')[0];
        v.imgList.push(file);
        if (v.uploadList.indexOf(file) == -1) {
          v.uploadList.push(file);
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
       return check;
       } */
    }
  }
};
</script >
