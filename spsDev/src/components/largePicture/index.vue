<template>
  <div class="img-dialog">
    <div class="img-main">
      <img class="img" :src="prefixPic()" alt="图片" :style="style" @click="seePic()" />
      <slot></slot>
    </div>
    <transition name="fade">
      <div class="img-view" v-show="show" @click="closeBigImg">
        <img :src="prefixPic()" data-type="img" />
        <Icon type="md-close-circle" class="close-icon" @click="closeBigImg" />
        <Icon type="md-download" class="down-icon" data-type="downLoad" @click="downLoadImg" />
      </div>
    </transition>
  </div>
</template>

<script>
/*
 * url 图片路径
 * picStyle 根据不同样式需要，覆盖掉原图片样式
 * normalPic 图片路径为空时使用默认无图图片代替显示
 */
export default {
  data() {
    return {
      style: {
        width: "60px",
        height: this.imageHigh,
        objectFit: "cover",
        verticalAlign: "middle",
        cursor: "pointer",
      },
      normalPic: "./static/images/placeholder.jpg",
      filenodeViewTargetUrl: this.$store.state.imgUrl,
      show: false,
    };
  },
  props: {
    url: {
      type: String,
      default: "",
    },
    picStyle: {
      type: Object,
      default: () => {
        return {};
      },
    },
    imageHigh: {
      type: String,
      default: () => {
        return "80px";
      },
    },
  },
  created() {
    Object.keys(this.picStyle).forEach((k) => {
      this.style[k] = this.picStyle[k];
    });
  },
  methods: {
    // sps 有些接口没带前缀 需要前端加上
    prefixPic() {
      const url = this.url;
      if (!url) return this.normalPic;
      if (url.startsWith("http")) return url;
      if (!url.includes("filenode")) return this.filenodeViewTargetUrl + url;
      return url;
    },
    // 查看图片
    seePic() {
      if (!this.url) {
        this.$Message.error("暂无图片!");
        return;
      }
      this.$store.commit("isEsc", false);
      let v = this;
      document.onkeydown = function (event) {
        if (event.code == "Escape") {
          v.$store.commit("isEsc", true);
          v.show = false;
          document.onkeydown = null;
        }
      };
      this.show = true;
    },
    // 关闭
    closeBigImg(e) {
      document.onkeydown = null;
      const tag = e.target.getAttribute("data-type");
      if (['downLoad', 'img'].includes(tag)) return;
      this.$store.commit("isEsc", true);
      this.show = false;
    },
    downLoadImg() {
      let url = this.prefixPic();
      const aLink = document.createElement('a');
      let name = url.slice(url.lastIndexOf('/') + 1, url.length);
      aLink.download = name;
      aLink.href = url;
      aLink.dispatchEvent(new MouseEvent('click', {}));
    },

  },
};
</script>
<style scoped lang="less">
@imageHigh: imageHigh;

/* bigimg */
.img-dialog .img-view {
  position: fixed;
  z-index: 9999;
  top: 0;
  left: 0;
  background: rgba(105, 104, 104, 0.5);
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/*不限制图片大小，实现居中*/
.img-dialog .img-view img {
  display: block;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  z-index: 10000;
  max-width: 95%;
  max-height: 95%;
}

.img-dialog .img-view .close-icon {
  font-size: 54px;
  color: #fff;
  position: absolute;
  top: 50px;
  right: 50px;
  cursor: pointer;
  z-index: 10001;
}

.img-dialog .img-view .down-icon {
  font-size: 54px;
  color: #fff;
  position: absolute;
  bottom: 50px;
  right: 50px;
  cursor: pointer;
  z-index: 10001;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-active {
  opacity: 0;
}

.img-main {
  width: 60px;
  height: @imageHigh;
  position: relative;
  overflow: hidden;
}

.img-main .img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
}

.img-main .cancel-text {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  text-align: center;
  line-height: 46px;
  color: #fff;
  background-color: rgba(105, 104, 104, 0.6);
}
</style>
