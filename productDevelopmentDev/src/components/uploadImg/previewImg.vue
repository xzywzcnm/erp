<!-- 预览图片 -->
<template>
  <div class="preview-main">
    <draggable v-model="dragList" chosenClass="chosen" forceFallback="true" group="people" animation="1000"
      @start="onStart" @end="onEnd" :disabled="!sort">
      <transition-group>
        <!-- 列表缩略图 style="display:inline-flex;" -->
        <div v-for="(item, index) in fileList" :key="index" class="upload-div">
          <div class="demo-upload-list" :style="sort ? 'cursor: pointer;' : ''">
            <img :src="urlSetting(item.url)">
            <div class="demo-upload-list-cover">
              <div class="icon-line">
                <Icon type="ios-eye-outline" @click.native="handleView(item, index)"></Icon>
                <Icon type="ios-trash-outline" @click.native="handleRemove(item, index)" v-if="!isDisabled"></Icon>
              </div>
              <span v-if="resolvPower(item.url)">{{ resolvPower(item.url) }}</span>
            </div>
          </div>
          <Checkbox class="checxbox" v-model="item.selected" v-if="isChecked"></Checkbox>
        </div>
      </transition-group>
    </draggable>

    <!-- 自定义内容 -->
    <div style="display:inline-flex;" v-if="!isDisabled">
      <slot></slot>
    </div>

    <!-- 预览图片 -->
    <transition name="fade">
      <div class="img-dialog" v-if="fileList.length && visibleDialog.visible" v-dom-portal>
        <div class="img-view">
          <div class="img-view_imgcontent" @click="closeBigImg">
            <img :src="urlSetting(visibleDialog.prePic)" data-type="img" id="img">
          </div>
          <div class="close-icon" @click="closeBigImg">
            <Icon type="ios-close" class="icon-btn" />
          </div>
          <div class="picture-browsing" v-if="fileList.length > 1">
            <span @click="browPic('pre')" class="picture-browsing__left">
              <Icon type="ios-arrow-back" class="icon-btn" data-type="img" />
            </span>
            <span @click="browPic('next')" class="picture-browsing__right">
              <Icon type="ios-arrow-forward" class="icon-btn" data-type="img" />
            </span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
 
<script>
import draggable from 'vuedraggable';// https://juejin.cn/post/6844904150350692366 使用文档总结
export default {
  name: "PreviewImg",
  components: { draggable },
  model: {
    prop: 'fileList',
    event: 'change',
  },
  props: {
    fileList: {
      type: Array,
      default() {
        return [];
      }
    },
    isDisabled: {
      type: Boolean,
      default() {
        return false;
      }
    },
    isChecked: {
      type: Boolean,
      default() {
        return false;
      }
    },
    sort: {
      type: Boolean,
      default() {
        return false;
      }
    },
  },
  watch: {
    fileList: {
      handler(data) {
        this.dragList = this.$common.copy(data || []);
      },
      deep: true,
      immediate: true
    },
    'visibleDialog.visible': {
      handler(val) {
        if (val) return;
        this.destroyImgFun();
      },
      deep: true,
    },
  },
  data() {
    return {
      visibleDialog: {
        visible: false,
        title: '查看图片',
        prePic: '',
        normalPic: './static/images/placeholder.jpg',
      },
      //定义要被拖拽对象的数组
      dragList: [],
      picTag: '',//图片位置
      zoomVal: 1
    };
  },
  mounted() {
    window.addEventListener('keyup', this.keyupEsc);//添加键盘事件
  },
  // 组件销毁前
  beforeDestroy() {
    this.destroyImgFun();
  },
  methods: {
    urlSetting(url) {
      if (!url) return;
      let exp = /(http|https):\/\/([\w.]+\/?)\S*/;
      let { filenodeViewTargetUrl } = this.$store.state.erpConfig || {};
      if (exp.test(url) || !filenodeViewTargetUrl || (url.indexOf(filenodeViewTargetUrl) >= 0)) return url;
      return filenodeViewTargetUrl + url;
    },
    // 通过有名函数 解除事件订阅
    destroyImgFun() {
      window.removeEventListener('keyup', this.keyupEsc);//销毁键盘事件

      // 图片放大缩小
      let imgView = document.querySelector('.img-view_imgcontent');
      if (imgView) {
        // IE/Opera 注册事件
        if (document.detachEvent) {
          imgView.detachEvent('mousewheel', this.mouseWeel.changes, false);
        }
        // firefox 注册事件
        if (document.removeEventListener) {
          imgView.removeEventListener('DOMMouseScroll', this.mouseWeel.changes, false);
        }
      }

      // 图片拖拽移动
      let dv = document.getElementById('img');
      if (dv) {
        window.removeEventListener('mousemove', this.mouseDowns.dvmousemove);
        dv.removeEventListener('mousedown', this.mouseDowns.dvmousedown);
        dv.removeEventListener('mouseup', this.mouseDowns.dvmouseup);
      }
    },
    // 预览图片
    handleView(file, index) {
      this.picTag = index;
      this.visibleDialog.prePic = file.url || this.normalPic;
      this.visibleDialog.title = file.name || '查看图片';
      this.visibleDialog.visible = true;
      // this.keyupEsc();

      setTimeout(() => {
        this.resetZoom();
        this.mouseWeel();
        this.mouseDowns();
      }, 300);
    },
    // 删除
    handleRemove(file, index) {
      if (this.$listeners['delPic']) { //$listeners:记录父组件传给子组件的所有方法集合
        this.$emit('delPic', file)
      } else {
        // eslint-disable-next-line vue/no-mutating-props
        this.fileList.splice(index, 1);
        return;
      }
    },
    // 关闭
    closeBigImg(e) {
      const tag = e.target.getAttribute('data-type');
      if (tag === 'img') return;
      this.visibleDialog.visible = false;
    },
    // 添加键盘Esc事件
    keyupEsc(e) {
      let ev = e || window.event;
      if (ev.keyCode == 27) this.visibleDialog.visible = false;
    },
    // 图片放大缩小
    mouseWeel() {
      let fun = {
        changes: (ev) => {
          let target = ev.target;
          if (ev.target.getAttribute('id') !== 'img') {
            target = ev.target.querySelector('img');
          }
          if (ev.wheelDelta) {//ie/opera/chrome
            fun.mouseScroll(target, ev.wheelDelta);
          } else if (ev.detail) {//firefox
            fun.mouseScroll(target, ev.detail);
          }
        },
        mouseScroll: (event, data) => {
          this.zoomVal += (data / 1200);
          if (this.zoomVal >= 0.2) {
            event.style.transform = "translateX(-50%) translateY(-50%) scale(" + this.zoomVal + ")";
          } else {
            this.zoomVal = 0.2;
            event.style.transform = "translateX(-50%) translateY(-50%) scale(" + this.zoomVal + ")";
            return false;
          }
        }
      }

      let imgView = document.querySelector('.img-view_imgcontent');
      // IE/Opera 注册事件
      if (document.attachEvent) {
        imgView.attachEvent('mousewheel', fun.changes, false);
      }
      // firefox 注册事件
      if (document.addEventListener) {
        imgView.addEventListener('DOMMouseScroll', fun.changes, false);
      }
      imgView.onmousewheel = fun.changes;//ie/opera/chrome
      return fun;
    },
    // 图片拖拽移动
    mouseDowns() {
      //获取元素
      let dv = document.getElementById('img');
      let [x, y, l, t, isDown] = [0, 0, 0, 0, false];
      let fun = {
        //鼠标按下事件
        dvmousedown: (e) => {
          e.preventDefault();
          //获取x坐标和y坐标
          x = e.clientX;
          y = e.clientY;
          //获取左部和顶部的偏移量
          l = dv.offsetLeft;
          t = dv.offsetTop;
          //开关打开
          isDown = true;
          //设置样式  
          dv.style.cursor = 'move';
        },
        //鼠标抬起事件
        dvmouseup: () => {
          isDown = false;
          dv.style.cursor = 'default';
        },
        //鼠标移动
        dvmousemove: (e) => {
          e.preventDefault();
          if (isDown == false) {
            return;
          }
          //获取x和y
          let nx = e.clientX;
          let ny = e.clientY;
          //计算移动后的左偏移量和顶部的偏移量
          let nl = nx - (x - l);
          let nt = ny - (y - t);

          dv.style.left = nl + 'px';
          dv.style.top = nt + 'px';
        }
      };
      dv.addEventListener('mousedown', fun.dvmousedown);
      window.addEventListener('mousemove', fun.dvmousemove);
      dv.addEventListener('mouseup', fun.dvmouseup);
      return fun;
    },
    //开始拖拽事件
    onStart() { },
    //拖拽结束事件(拖拽列表返回父组件，更新父组件顺序)
    onEnd() {
      this.$emit("dragList", this.dragList);
    },
    // 上一张/下一张
    browPic(type) {
      let fun = {
        pre: () => {
          if (this.picTag === 0) {
            this.picTag = this.dragList.length - 1;
          } else {
            this.picTag--;
          }
        },
        next: () => {
          if (this.picTag === this.dragList.length - 1) {
            this.picTag = 0;
          } else {
            this.picTag++;
          }
        }
      }
      fun[type]();

      this.resetZoom();
      let file = this.dragList[this.picTag];
      this.handleView(file, this.picTag);
    },
    // 重置缩放
    resetZoom() {
      this.zoomVal = 1;
      let event = document.getElementById('img');
      event.style.transform = "translateX(-50%) translateY(-50%) scale(" + this.zoomVal + ")";
      event.style.top = "50%";
      event.style.left = "50%";
    },
    // 分辨率
    resolvPower(url) {
      if (!url) return;
      let start = 'sizePicture-';
      let end = '.PNG';
      let maxlength = 9;//最长的长度
      let stindex = url.indexOf(start);
      let enindex = url.indexOf(end);
      if (stindex < 0 || (enindex < 0 || enindex < stindex)) return;//无法截取到返回空
      stindex += start.length;
      let resp = (enindex - stindex) > maxlength ? url.slice(stindex, stindex + maxlength) : url.slice(stindex, enindex);
      return resp;
    }
  },
};
</script>

<style scoped lang="less">
.preview-main {
  display: flex;
  flex-wrap: wrap;

  >div>span {
    display: flex;
    flex-wrap: wrap;
  }

  .upload-div {
    display: flex;
  }
}

.demo-upload-list {
  width: 80px;
  height: 80px;
  line-height: 80px;
  text-align: center;
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
  object-fit: cover;
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
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  line-height: 20px;
}

.demo-upload-list-cover .icon-line i {
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  margin: 0 2px;
}

.demo-upload-list-cover span {
  color: #fff;
  font-size: 14px;
  padding-top: 2px;
}

/* bigimg */
.img-dialog {
  position: fixed;
  z-index: 99999;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.5);
  overflow: hidden;
  width: 100%;
  height: 100%;
}

.img-dialog .img-view {
  width: 100%;
  height: 100%;
  position: relative;

  .img-view_imgcontent {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

/*不限制图片大小，实现居中*/
.img-dialog .img-view img {
  display: block;
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 1000;
  transform: translateX(-50%) translateY(-50%) scale(1);
  max-width: 95%;
  max-height: 88%;
  vertical-align: middle;
  cursor: pointer;
}

.img-dialog .img-view .close-icon {
  position: absolute;
  top: 50px;
  right: 50px;
  z-index: 100001;
}

.img-dialog .img-view {
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

  .icon-btn {
    font-size: 46px;
    color: #fff;
    background: #606266;
    border-radius: 50%;
    cursor: pointer;
  }
}
</style>