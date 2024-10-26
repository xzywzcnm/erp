<template>
  <div>
    <Modal v-model="isVisible" title="质检详情" :width="1200" :mask-closable="false" :closable="modalClose"
      class="qualityReport-dialog">
      <Form class="formDetail" ref="formValidate" :model="formData" :rules="ruleValidate" :label-width="80">
        <div class="fmb18">
          <FormItem label="问题原因:" prop="problemCheckReason">
            <CheckboxGroup v-model="formData.problemCheckReason">
              <Checkbox :label="item.qualityProject" v-for="(item, index) in standardList"
                :key="index + 'problemCheckReason'">{{ item.qualityProject }}</Checkbox>
            </CheckboxGroup>
          </FormItem>
          <FormItem label="备注:" prop="remark">
            <Input v-model="formData.remark" maxlength="200" show-word-limit type="textarea" placeholder="请输入备注" />
          </FormItem>
          <FormItem label="质检图片:" prop="fileList">
            <dyt-previewImg :fileList.sync="formData.fileList"
              :imgOption="{ listWidth: 90, listHeight: 90, isDelete: true, mode: 'multiple' }" @deletePic="deletePic">
            </dyt-previewImg>
          </FormItem>
          <FormItem label="摄像头:">
            <div class="picture-main">
              <div class="camera-img">
                <div v-show="cameraSuccess">
                  <video id="video" width="620" height="450"></video>
                  <canvas id="canvas"></canvas>
                </div>
                <div v-show="!cameraSuccess">
                  <img :src="cameraImg" alt="">
                  <span class="img-tips">摄像头即时图像</span>
                </div>
              </div>
              <div class="shot-content">
                <div class="shot-img" @click="takePicture">
                  <img :src="shotImg" alt="">
                  <span>拍摄</span>
                </div>
                <div class="ashTips">快捷键：Space</div>
                <div class="linkText cursorClick" v-if="!cameraSuccess" @click="openCamera">打开本地摄像头</div>
                <!-- <div class="linkText cursorClick" v-if="cameraSuccess" @click="closeMedia">关闭本地摄像头</div> -->
              </div>
              <div class="upload-btn linkText cursorClick">
                从电脑添加图片
                <input type="file" accept="image/*" class="upload-file" @change="handleFileChange" multiple />
              </div>
            </div>
          </FormItem>
        </div>
      </Form>
      <div slot="footer">
        <Button type="primary" @click="saveReport">保存</Button>
        <Button @click="isVisible = false">取消</Button>
      </div>
    </Modal>
  </div>
</template>

<script>

import uploadCommon from '../../stockOUt/otherStouck/components/uploadCommon.vue';
export default {
  name: 'qualityReport',
  components: { uploadCommon },
  props: {
    modelVisible: {
      type: Boolean,
      default() {
        return false
      }
    },
    qualityInspectionStandard: {// 质检标准
      type: Array,
      default() {
        return []
      }
    },
  },
  data() {
    return {
      formData: {
        problemCheckReason: [],
        remark: '',
        fileList: [],
      },
      ruleValidate: {
        problemCheckReason: [
          { required: true, type: 'array', message: '请选择问题原因', trigger: 'change' }
        ],
      },
      isVisible: false,
      cameraImg: require('@/assets/images/camera.png'),
      shotImg: require('@/assets/images/shot.png'),
      video: null, // 视频对象
      realVideoWidth: 0, // 真实视频宽高
      realVideoHeight: 0, // 真实视频宽高
      cameraSuccess: false, // 是否返回媒体流
      mediaStreamTrack: null, // 媒体流对象
    }
  },
  watch: {
    modelVisible: {
      handler(val) {
        val && this.open();
      },
      deep: true
    },
    isVisible: {
      handler(val) {
        if (val) return;
        this.$emit('update:modelVisible', val);
        this.closeMedia();
      },
      deep: true
    },
    qualityInspectionStandard: {
      handler(val) {
        this.$refs['formValidate'].resetFields();
      },
      deep: true
    }
  },
  computed: {
    standardList() {
      let list = this.$common.copy(this.qualityInspectionStandard || []);
      list.push({
        qualityProject: '其它',
      })
      return list;
    },
    modalClose() {
      return !this.$store.getters.getSelfPreviewDialog;
    }
  },
  methods: {
    // 窗口打开
    open() {
      this.isVisible = true;
      this.$nextTick(() => {
        this.video = document.getElementById('video');
        this.openCamera();
      })
    },
    // 开启摄像头
    openCamera() {
      // 获取本机屏幕大小
      let screenWidth = window.screen.width;
      let screenHeight = window.screen.height;
      this.cameraSuccess = false;
      try {
        if (navigator.mediaDevices.getUserMedia || navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia) {
          this.getUserMedia({ audio: true, video: { width: screenWidth, height: screenHeight } }, this.success, this.error)
        } else {
          this.$Message.error('本机不支持拍摄');
        }
      } catch (err) {
        this.$Message.error('本机不支持拍摄');
        throw new Error(err);
      }
    },
    // 关闭摄像头
    closeMedia() {
      let mediaStreamTrack = this.mediaStreamTrack;
      this.cameraSuccess = false;
      if (!(this.video && mediaStreamTrack)) return;

      // 清空视频内容
      this.video.pause();
      this.video.src = '';

      if (typeof mediaStreamTrack.stop === 'function') {
        mediaStreamTrack.stop();
        return;
      }
      let tracks = mediaStreamTrack.getTracks();
      // console.log(tracks, 88)
      tracks.forEach(item => {
        item.stop();
      })
    },
    // 点击下载图片
    takePicture() {
      if (!this.cameraSuccess) {
        return this.$Message.error('请打开摄像头!');
      }
      let canvas = document.getElementById('canvas');
      canvas.width = this.realVideoWidth;
      canvas.height = this.realVideoHeight;
      let context = canvas.getContext('2d');
      context.drawImage(this.video, 0, 0, this.realVideoWidth, this.realVideoHeight);
      this.saveFile();
    },
    // 下载图片
    saveFile() {
      // 下载后的文件名规则
      // const filename = 'image.png';
      // 获取canvas标签里的图片内容
      let imgData = document.getElementById('canvas').toDataURL('image/png');
      // console.log(imgData, 'imgData', this.base64toFile(imgData));
      this.formData.fileList.push({ url: imgData, file: this.base64toFile(imgData) });

      // let save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
      // save_link.href = imgData; // base64码
      // save_link.download = filename;// 图片名称
      // let event = document.createEvent('MouseEvents');
      // event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
      // save_link.dispatchEvent(event);
    },
    // base64转文件流
    base64toFile(dataurl, filename = 'file') {
      let arr = dataurl.split(',')
      let mime = arr[0].match(/:(.*?);/)[1]
      let suffix = mime.split('/')[1]
      let bstr = atob(arr[1])
      let n = bstr.length
      let u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      return new File([u8arr], `${filename}.${suffix}`, {
        type: mime
      })
    },
    // 摄像头返回媒体流失败
    error(error) {
      this.$Message.error('访问用户媒体失败');
      this.cameraSuccess = false;
      throw new Error(error);
    },
    // 摄像头返回媒体流成功
    success(stream) {
      this.mediaStreamTrack = stream;// 保存媒体流对象

      this.cameraSuccess = true;
      this.video.srcObject = stream;
      // 在视频的元数据加载后执行
      this.video.onloadedmetadata = (e) => {
        this.video.play();
      };
      // 视频达到可以播放时触发
      this.video.addEventListener('canplay', (e) => {
        const videoRatio = e.target.videoHeight / e.target.videoWidth; // 原视频比例
        const domHeight = this.video.offsetHeight;// 元素宽高
        const domWidth = this.video.offsetWidth;

        let realW = 0;
        let realH = 0;
        if (domHeight / domWidth >= videoRatio) { // 宽度占满，计算高度
          realW = domWidth
          realH = domWidth * videoRatio
        } else { // 高度占满，计算宽度
          realH = domHeight
          realW = domHeight / videoRatio
        }
        this.realVideoWidth = realW;
        this.realVideoHeight = realH;
      });
    },
    // https://blog.csdn.net/fesfsefgs/article/details/105752202
    // 用来匹配不同的浏览器
    getUserMedia(constraints, success, error) {
      // constraints 参数是一个包含video 和 audio两个成员的MediaStreamConstraints 对象
      if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia(constraints).then(success).catch(error);
      } else if (navigator.webkitGetUserMedia) {
        navigator.webkitGetUserMedia(constraints, success, error);
      } else if (navigator.mozGetUserMedia) {
        navigator.mozGetUserMedia(constraints, success, error);
      } else if (navigator.getUserMedia) {
        navigator.getUserMedia(constraints, success, error)
      }
    },
    // 图片上传
    handleFileChange(e) {
      const input = e.target;
      const files = e.target.files;
      let list = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const format = ['png', 'jpg', 'jpeg', 'bmp', 'gif']; // 接受上传的文件类型
        const testFile = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase();// 获取后缀
        // 1MB=1024KB 1KB=1024字节
        if (file.size > 5242880) {
          this.$Message.error(file.name + '文件大小不能超过5MB');
          return;
        }
        if (!format.includes(testFile)) {
          this.$Message.error({
            content: file.name + `文件格式不正确, 请选择${format.toString()}格式的文件~`,
            duration: 2
          });
          return;
        }
        const windowURL = window.URL || window.webkitURL;
        const src = windowURL.createObjectURL(file);
        // 返回一个url，就可以直接放在img的src中渲染了。
        // 但是该url对象会一直存在在document对象中，只有当document卸载时（关闭窗口）才会释放这个内存。
        // 所以，最好在你不需要的时候，主动释放。释放方式如下：
        // windowURL.revokeObjectURL(src);
        list.push({ url: src, file: file });
      }
      // console.log(list)
      this.formData.fileList.push(...list);
      input.value = '';
    },
    // 删除图片
    deletePic(index) {
      const windowURL = window.URL || window.webkitURL;
      let file = this.formData.fileList[index] || '';
      windowURL.revokeObjectURL(file.url);// 主动释放

      let list = this.formData.fileList.filter((k, i) => i !== index);
      this.formData.fileList = list;
    },
    // 保存报告
    saveReport() {
      this.$refs['formValidate'].validate((valid) => {
        if (!valid) return;
        this.$emit('getReportInfo', this.formData);
        this.isVisible = false;
      })
    }
  }
}
</script>

<style lang="less">
.qualityReport-dialog {
  .ivu-checkbox-wrapper {
    display: inline-block;
    margin-right: 20px;
  }

  .picture-main {
    display: flex;
    align-items: center;

    .camera-img {
      width: 620px;
      height: 450px;
      position: relative;

      #video {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 10;
        border: 1px solid rgba(215, 215, 215, 1);
        padding: 10px;
      }

      #canvas {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 0;
        opacity: 0;
      }

      img {
        width: 100%;
        height: 100%;
      }

      .img-tips {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translateX(-50%) translateY(-50%);
        color: #FF0000;
      }
    }

    .shot-content {
      text-align: center;
    }

    .shot-img {
      width: 94px;
      height: 96px;
      margin: 0 40px;
      border: 1px solid rgba(215, 215, 215, 1);
      display: flex;
      align-items: center;
      flex-direction: column;
      justify-content: center;
      line-height: 20px;

      img {
        width: 50px;
        height: auto;
        margin-bottom: 10px;
      }
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
}
</style>
