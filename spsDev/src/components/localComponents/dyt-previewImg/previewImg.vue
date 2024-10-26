<!-- 预览图片 -->
<template>
  <div class="preview-main">
    <slot>
      <!-- 单个图片 -->
      <div class="image__inner" v-if="imgConfig.mode === 'single'" :class="imgConfig.className">
        <img :src="urlSetting(pictureUrl)" @click="handleView"
          :style="{ width: imgConfig.width + 'px', height: imgConfig.height + 'px' }">
      </div>
      <!-- 图片缩略图 -->
      <div class="pic-list" :class="abbreviationClass" v-if="imgConfig.mode === 'multiple'">
        <div v-for="(item, index) in fileList" :key="index + 'previewImg' + index" class="pic-items">
          <div :style="{ width: imgConfig.listWidth + 'px', height: imgConfig.listHeight + 'px' }" class="pic-items_div">
            <img :src="urlSetting(item.url)" @click="handleView(index)" :class="imgConfig.className">
            <div class="delete-pic" @click="deletePicFun(index)" v-if="imgConfig.isDelete">
              <span class="iconfont dyt-preview-close close-pic"></span>
            </div>
          </div>
        </div>
      </div>
    </slot>

    <!-- 大图 -->
    <transition name="img-dialog">
      <div class="img-dialog" v-if="visible">
        <div class="img-view">
          <div class="img-view_imgcontent" @click="closeFun">
            <transition name="load-img">
              <div class="load-img" v-if="imgLoading">
                <span class="iconfont dyt-preview-loading1"></span>
              </div>
            </transition>
          </div>
          <!-- 关闭图标 -->
          <div class="close-icon" @click="closeFun">
            <span class="iconfont dyt-preview-close preview-common"></span>
          </div>
          <!-- 左右 -->
          <div class="picture-browsing" v-if="imgConfig.mode === 'multiple' && fileList.length > 1">
            <span class="picture-browsing__left" @click="switchingSheets('previous')">
              <span class="iconfont dyt-preview-zuo preview-common"></span>
            </span>
            <span class="picture-browsing__right" @click="switchingSheets('next')">
              <span class="iconfont dyt-preview-you preview-common"></span>
            </span>
          </div>
          <!-- 操作栏 -->
          <div class="image-viewer__actions">
            <!-- 缩小 -->
            <span class="iconfont dyt-preview-small preview-bottom" @click="contractionImg('narrow')"></span>
            <!-- 放大 -->
            <span class="iconfont dyt-preview-sousuofangda preview-bottom" @click="contractionImg('enlarge')"></span>
            <!-- 全屏 -->
            <span class="iconfont  preview-bottom" :class="fullScreen ? 'dyt-preview-icon-one' : 'dyt-preview-quanping1'"
              @click="screenAll"></span>
            <!-- 右旋转 -->
            <span class="iconfont dyt-preview-xuanzhuan-1 preview-bottom" @click="rotateFun('add')"></span>
            <!-- 左旋转 -->
            <span class="iconfont dyt-preview-xuanzhuan-2 preview-bottom" @click="rotateFun('reduce')"></span>
            <!-- 下载图片 -->
            <span class="iconfont dyt-preview-downLoad preview-bottom" @click="downLoadImg"></span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import './css/iconfont.css';
export default {
  name: 'previewImg',
  props: {
    url: { // 预览图片
      type: String,
      default() {
        return '';
      }
    },
    fileList: { // 图片列表
      type: Array, // {name:'',url:''}
      default() {
        return []
      }
    },
    imgOption: { // 图片样式
      type: Object,
      default() {
        return {}
      }
    },
    abbreviationClass: { // 缩略图样式
      type: String,
      default() {
        return '';
      }
    }
  },
  watch: {
    url: { // 预览图片
      handler(data) {
        this.imgConfig.mode === 'single' && (this.pictureUrl = data);
      },
      deep: true,
      immediate: true
    },
    fileList: { // 预览图片
      handler(data) {
        if (!this.pictureUrl && data.length) {
          this.pictureUrl = data[0].url;
        }
      },
      deep: true,
      immediate: true
    },
  },
  computed: {
    imgConfig() {
      return { ...this.defaultConfig, ...this.imgOption };
    }
  },
  data() {
    return {
      normalPic: './static/images/placeholder.jpg', // 默认图片路径
      pictureUrl: '', // 小图
      visible: false, // 弹框预览
      imgLoading: false, // 图片加载
      zoomVal: 1, // 图标缩放程度
      visibleDialog: {
        previewUrl: '',
        title: '查看图片',
        index: 0// 图片位置标识
      },
      fullScreen: false, // 全屏
      rotateDeg: 0, // 旋转角度
      translateFeild: 'translateX(-50%) translateY(-50%)',
      defaultConfig: { // 默认配置
        width: 50,
        height: 50,
        listWidth: 100,
        listHeight: 100,
        className: '', // 自定义类名
        isDelete: false, // 是否删除
        mode: 'single', // 默认单张显示
      },
    };
  },
  // 组件销毁前
  beforeDestroy() {
    this.destroyImgFun();
  },
  methods: {
    // 图片路径配置
    urlSetting(url) {
      if (!url) return this.normalPic;
      let exp = /(http|https):\/\/([\w.]+\/?)\S*/;
      let { filenodeViewTargetUrl } = this.$store.state.erpConfig || {};
      let isBase64 = !!(url.indexOf('data:image') >= 0);
      if (exp.test(url) || !filenodeViewTargetUrl || (url.indexOf(filenodeViewTargetUrl) >= 0) || isBase64) return url;
      return filenodeViewTargetUrl + url;
    },
    // 通过有名函数 解除事件订阅
    destroyImgFun() {
      return new Promise((resolve, reject) => {
        window.removeEventListener('keyup', this.keyupEsc);// 销毁键盘事件

        // 图片放大缩小
        let imgView = document.querySelector('.img-view_imgcontent');
        if (imgView) {
          let fun = this.mouseWeelFun();
          // IE/Opera 注册事件
          if (document.detachEvent) {
            imgView.detachEvent('mousewheel', fun.changes, false);
          }
          // firefox 注册事件
          if (document.removeEventListener) {
            imgView.removeEventListener('DOMMouseScroll', fun.changes, false);
          }
        }

        // 图片拖拽移动
        let dv = document.getElementById('img');
        if (dv) {
          let fun = this.mouseFun(dv);
          window.removeEventListener('mousemove', fun.dvmousemove);
          dv.removeEventListener('mousedown', fun.dvmousedown);
          dv.removeEventListener('mouseup', fun.dvmouseup);
        }

        this.resetZoom();
        resolve();
      })
    },
    // 预览图片(插入文本)
    handleView(index) {
      this.visible = true;
      this.$store.commit('SET_SELFPREVIEWDIALOG', true);// 用以esc键的使用
      this.fullScreen = false;// 全屏重置
      this.resetZoom();
      let url = '';
      // 存在多张图片
      if (this.fileList.length) {
        this.visibleDialog.index = index || 0;
        url = this.visibleDialog.previewUrl = this.fileList[this.visibleDialog.index].url;
      } else {
        url = this.pictureUrl;
      }
      this.createImg(url);
    },
    createImg(picurl) {
      this.imgLoading = true;
      this.$nextTick(() => {
        let img = new Image();
        let url = this.urlSetting(picurl);
        img.src = url;
        img.setAttribute('id', 'img');
        img.setAttribute('data-type', 'ignoreImg');
        img.setAttribute('class', 'transition-img');
        let view_imgcontent = document.querySelector('.img-view_imgcontent');
        img.onload = () => {
          this.imgLoading = false;
          view_imgcontent.appendChild(img);
          this.mouseWeel();
          this.mouseDowns();
          window.addEventListener('keyup', this.keyupEsc);// 添加键盘事件
        }
        img.onerror = () => {
          // 插入默认图片
          this.imgLoading = false;
        }
      })
    },
    // 重置缩放
    resetZoom() {
      this.zoomVal = 1;
      this.rotateDeg = 0;
      let img = document.getElementById('img');
      if (!img) return;
      img.removeAttribute('class');
      img.style.transform = `${this.translateFeild} scale(${this.zoomVal}) rotate(${this.rotateDeg}deg)`;
      img.style.top = '50%';
      img.style.left = '50%';
    },
    // 鼠标滚轮图片放大缩小
    mouseWeel() {
      let imgView = document.querySelector('.img-view_imgcontent');
      let fun = this.mouseWeelFun();
      // IE/Opera 注册事件
      if (document.attachEvent) {
        imgView.attachEvent('mousewheel', fun.changes, false);
      }
      // firefox 注册事件
      if (document.addEventListener) {
        imgView.addEventListener('DOMMouseScroll', fun.changes, false);
      }
      imgView.onmousewheel = fun.changes;// ie/opera/chrome
    },
    // 图片放大缩小
    mouseWeelFun() {
      let fun = {
        changes: (ev) => {
          let target = ev.target;
          if (ev.target.getAttribute('id') !== 'img') {
            target = ev.target.querySelector('img');
          }
          if (ev.wheelDelta) { // ie/opera/chrome
            fun.mouseScroll(target, ev.wheelDelta);
          } else if (ev.detail) { // firefox
            fun.mouseScroll(target, ev.detail);
          }
        },
        mouseScroll: (event, data) => {
          this.zoomVal += (data / 1200);
          if (this.zoomVal >= 0.2) {
            event.style.transform = `${this.translateFeild} scale(${this.zoomVal}) rotate(${this.rotateDeg}deg)`;
          } else {
            this.zoomVal = 0.2;
            event.style.transform = `${this.translateFeild} scale(${this.zoomVal}) rotate(${this.rotateDeg}deg)`;
            return false;
          }
        }
      }
      return fun;
    },
    // 图片拖拽移动
    mouseDowns() {
      let dv = document.getElementById('img');// 获取元素
      let fun = this.mouseFun(dv);
      dv.addEventListener('mousedown', fun.dvmousedown);
      window.addEventListener('mousemove', fun.dvmousemove);
      dv.addEventListener('mouseup', fun.dvmouseup);
    },
    // 图片拖拽移动
    mouseFun(dv) {
      let [x, y, l, t, isDown] = [0, 0, 0, 0, false];
      return {
        // 鼠标按下事件
        dvmousedown: (e) => {
          e.preventDefault();
          // 获取x坐标和y坐标
          x = e.clientX;
          y = e.clientY;
          // 获取左部和顶部的偏移量
          l = dv.offsetLeft;
          t = dv.offsetTop;
          // console.log(x, y, l, t)
          // 开关打开
          isDown = true;
          // 设置样式
          dv.style.cursor = 'move';
        },
        // 鼠标抬起事件
        dvmouseup: () => {
          isDown = false;
          dv.style.cursor = 'default';
        },
        // 鼠标移动
        dvmousemove: (e) => {
          e.preventDefault();
          if (isDown == false) {
            return;
          }
          // 获取x和y
          let nx = e.clientX;
          let ny = e.clientY;
          // 计算移动后的左偏移量和顶部的偏移量
          let nl = nx - (x - l);
          let nt = ny - (y - t);

          dv.style.left = nl + 'px';
          dv.style.top = nt + 'px';
        }
      };
    },
    // 关闭按钮click监听事件
    closeFun(e) {
      let flag = e.target && e.target.getAttribute('data-type') === 'ignoreImg'; // 忽略
      if (flag) return;
      // 移除所有绑定的事件
      this.destroyImgFun().finally(() => {
        this.visible = false;
        this.$store.commit('SET_SELFPREVIEWDIALOG', false);// 用以esc键的使用
      })
    },
    // 添加键盘Esc事件
    keyupEsc(e) {
      let ev = e || window.event;
      if (ev.keyCode != 27) return;
      this.closeFun(e);
    },
    // 全屏
    screenAll() {
      this.fullScreen = !this.fullScreen;
      let img = document.getElementById('img');// 获取元素
      if (!img) return;
      this.resetZoom();
      setTimeout(() => {
        img.setAttribute('class', this.fullScreen ? 'limit-img transition-img' : 'transition-img');
      }, 0)
    },
    // 图片缩小
    contractionImg(type) {
      let img = document.getElementById('img');// 获取元素
      if (!img) return;
      let zoomVal = this.zoomVal;
      // 缩小
      if (type === 'narrow') {
        zoomVal -= 0.2;
        if (zoomVal <= 0.2) zoomVal = 0.2;
      }
      // 放大
      if (type === 'enlarge') {
        zoomVal += 0.2;
      }
      img.style.transform = `${this.translateFeild} scale(${zoomVal}) rotate(${this.rotateDeg}deg)`;
      this.zoomVal = zoomVal;
    },
    // 旋转
    rotateFun(type) {
      let event = document.getElementById('img');
      if (!event) return;
      let rotateDeg = this.rotateDeg || 0;
      if (type == 'add') {
        rotateDeg += 90;
      } else {
        rotateDeg -= 90;
      }
      this.rotateDeg = rotateDeg;
      event.style.transform = `${this.translateFeild} scale(${this.zoomVal}) rotate(${rotateDeg}deg)`;
    },
    // 切换图片
    switchingSheets(type) {
      if (this.imgLoading) return;
      this.fullScreen = false;// 全屏重置
      this.resetZoom();

      // 移除原有的图片
      let view_imgcontent = document.querySelector('.img-view_imgcontent');
      let img = document.getElementById('img');// 获取元素
      img && view_imgcontent.removeChild(img);

      let fileList = this.fileList;
      let len = fileList.length;
      let index = this.visibleDialog.index;
      // 上一张
      if (type === 'previous') {
        index--;
        if (index < 0) index = fileList.length - 1;
      } else {
        // 下一张
        index++;
        if (index > (len - 1)) index = 0;
      }
      this.visibleDialog.index = index;
      this.visibleDialog.previewUrl = fileList[index] ? fileList[index].url : '';
      this.createImg(this.visibleDialog.previewUrl);
    },
    // 删除图片
    deletePicFun(index) {
      if ('deletePic' in this.$listeners) {
        return this.$emit('deletePic', index);
      }
      let list = this.fileList.filter((k, i) => i !== index);
      this.$emit('update:fileList', list);
      this.$emit('deleteFileList', list);
    },
    // 下载图片
    downLoadImg() {
      let event = document.getElementById('img');
      let url = event ? event.src : null;
      if (!url) return;
      const aLink = document.createElement('a');
      let name = url.slice(url.lastIndexOf('/') + 1, url.length);
      aLink.download = name;
      aLink.href = url;
      aLink.dispatchEvent(new MouseEvent('click', {}));
    },
  }
};
</script>

<style lang="less">
.preview-main {
  img {
    object-fit: cover;
    cursor: pointer;
    vertical-align: bottom;
  }

  .image__inner {
    height: 100%;
    display: inline-flex;
    align-items: center;
    padding: 4px 0;
  }

  .pic-list {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    padding: 5px;

    .pic-items {
      padding: 5px;

      .pic-items_div {
        position: relative;
        border-radius: 4px;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .delete-pic {
        position: absolute;
        top: 0;
        right: 0;
        color: #ff0000;
        transform: translateX(50%) translateY(-50%);

        .close-pic {
          font-size: 20px;
          font-weight: bold;
          cursor: pointer;
        }
      }

    }
  }

  /* bigimg 大图 */
  .img-dialog {
    position: fixed;
    z-index: 99999;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.5);

    .img-view {
      width: 100%;
      height: 100%;
      position: relative;

      /*不限制图片大小，实现居中*/
      .img-view_imgcontent,
      .load-img {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1001;
      }

      .img-view_imgcontent {
        #img {
          display: block;
          position: absolute;
          top: 50%;
          left: 50%;
          z-index: 1000;
          transform: translateX(-50%) translateY(-50%) scale(1) rotate(0deg);
          cursor: pointer;
          max-width: 95%;
          max-height: 90%;
        }

        .limit-img {
          max-width: none !important;
          max-height: none !important;
        }

        .transition-img {
          transition: transform 0.4s;
        }

        .load-img {
          position: absolute;

          .dyt-preview-loading1 {
            color: #ccc;
            font-size: 80px;
            transform-origin: center center;
            animation: ratateAll 1.5s infinite linear;
          }
        }
      }

      .close-icon {
        position: absolute;
        top: 50px;
        right: 50px;
        z-index: 100001;
        cursor: pointer;
      }

      .picture-browsing {
        .picture-browsing__left {
          position: absolute;
          top: 50%;
          left: 40px;
          transform: translateY(-50%);
          z-index: 100001;
        }

        .picture-browsing__right {
          position: absolute;
          top: 50%;
          right: 40px;
          transform: translateY(-50%);
          z-index: 100001;
        }
      }

      .image-viewer__actions {
        position: absolute;
        left: 50%;
        bottom: 30px;
        transform: translateX(-50%);
        width: 282px;
        height: 44px;
        padding: 0 23px;
        background-color: #606266;
        border-color: #fff;
        border-radius: 22px;
        opacity: 0.8;
        display: flex;
        align-items: center;
        justify-content: space-around;
        z-index: 100001;
      }
    }
  }
}



.preview-main {

  // 动画
  @keyframes ratateAll {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }

  // 加载图片
  .load-img-enter-active,
  .load-img-leave-active {
    transition: opacity 0.5s;
  }

  .load-img-enter,
  .load-img-leave-to {
    opacity: 0;
  }

  // 背景图加载
  .img-dialog-enter-active,
  .img-dialog-leave-active {
    transition: opacity 0.3s;
  }

  .img-dialog-enter,
  .img-dialog-leave-to {
    opacity: 0;
  }

  .preview-common {
    font-size: 24px;
    line-height: 1;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    background-color: #606266;
    opacity: 0.8;
    cursor: pointer;
  }

  .preview-bottom {
    font-size: 23px;
    color: #fff;
    cursor: pointer;
  }
}
</style>
