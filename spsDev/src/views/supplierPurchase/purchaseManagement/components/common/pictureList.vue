<template>
  <div>
    <!-- <div
      class="demo-upload-list"
      v-for="(item, index) in uploadList"
      :key="index"
    >
      <template v-if="item.status === 'finished'">
        <img :src="item.url" />
        <div class="demo-upload-list-cover">
          <Icon
            type="ios-eye-outline"
            @click.native="handleView(item.name)"
          ></Icon>
          <Icon
            type="ios-trash-outline"
            @click.native="handleRemove(item)"
          ></Icon>
        </div>
      </template>
      <template v-else>
        <Progress
          v-if="item.showProgress"
          :percent="item.percentage"
          hide-info
        ></Progress>
      </template>
    </div> -->
    <dytUpload
      ref="upload"
      name="files"
      :show-upload-list="false"
      :headers="headObj"
      :default-file-list="defaultList"
      :format="['jpg', 'jpeg', 'png']"
      :max-size="2048"
      multiple
      type="drag"
      action="/sps-service/sps/applyRefund/upload"
      :on-success="handleSuccess"
      style="display: inline-block; width: 58px"
    >
      <!--:on-format-error="handleFormatError"
      :on-exceeded-size="handleMaxSize"
      :before-upload="handleBeforeUpload"
     -->
      <div style="width: 58px; height: 58px; line-height: 58px">
        <Icon type="ios-camera" size="20"></Icon>
      </div>
    </dytUpload>
    <Modal title="View Image" v-model="visible">
      <img
        :src="'https://o5wwk8baw.qnssl.com/' + imgName + '/large'"
        v-if="visible"
        style="width: 100%"
      />
    </Modal>
  </div>
</template>

<script>
// import api from "@/api/api";
import Mixin from "@/components/mixin/common_mixin";

export default {
  mixins: [Mixin],

  data() {
    return {
      defaultList: [],
      imgName: "",
      visible: false,
      uploadList: [],
    };
  },
  mounted() {
    this.uploadList = this.$refs.upload.fileList;
  },
  methods: {
    //放大图片
    handleView(name) {
      console.log("handleView");
      this.imgName = name;
      this.visible = true;
    },
    //删除图片
    handleRemove(file) {
      console.log("handleRemove");
      const fileList = this.$refs.upload.fileList;
      this.$refs.upload.fileList.splice(fileList.indexOf(file), 1);
    },
    //成功上传
    handleSuccess(res, file) {
      console.log(1);
      console.log(res.datas, "res");
      res.datas.forEach((item, index) => {
        res.datas[index] = this.$store.state.imgUrl + item;
      });
      file.url = this.$store.state.imgUrl + res.datas[0];
      this.$emit("updatePicture", res.datas);
    },
    //上传失败
    handleFormatError(file) {
      console.log("handleFormatError");
      this.$Notice.warning({
        title: "The file format is incorrect",
        desc:
          "File format of " +
          file.name +
          " is incorrect, please select jpg or png.",
      });
    },
    //指定文件大小
    handleMaxSize(file) {
      console.log("handleMaxSize");
      this.$Notice.warning({
        title: "Exceeding file size limit",
        desc: "File  " + file.name + " is too large, no more than 2M.",
      });
    },
    //上传前
    handleBeforeUpload() {
      console.log("handleBeforeUpload");
      const check = this.uploadList.length < 5;
      if (!check) {
        this.$Notice.warning({
          title: "Up to five pictures can be uploaded.",
        });
      }
      return check;
    },
  },
};
</script>

<style>
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
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
  margin-right: 4px;
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
  background: rgba(0, 0, 0, 0.6);
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
</style>