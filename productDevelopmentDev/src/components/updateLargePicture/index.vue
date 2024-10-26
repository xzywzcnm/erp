<template>
  <div class="updateLargePicture" @click="picModalShow">
    <Poptip trigger="hover" placement="top-start" :transfer="true" v-if="disabled">
      <img :src="imgUrl" alt="图片" class="large-picture" crossOrigin="Anonymous">
      <div slot="content">
        <img :src="imgUrl" class="list-big-picture" />
      </div>
    </Poptip>
    <img v-else :src="imgUrl" alt="图片" class="large-picture" crossOrigin="Anonymous">

    <Modal v-model="showUpload" title="变更图片" :width="1000" class="large-pic-page" :mask-closable="false">
      <div class="pic-main">
        <Spin fix v-if="loading"></Spin>
        <div class="large-pic-preview">
          <img :src="previewImg" v-if="previewImg" />
          <span v-else>鼠标移至小图查看</span>
        </div>
        <div class="pic-list">
          <div class="pic-list-block" v-for="(item, index) in filePiclist" :key="index">
            <div class="pic-list-items" @mousemove="picHover(item.url)" @click="secectImg(item.url)" @mouseout="picHover()" v-if="item.url">
              <img :src="urlconnect(item.url)" alt="">
              <span class="span-check-box" v-if="urlconnect(item.url) == imgUrl">
                <Icon type="md-checkmark-circle" />
              </span>
            </div>
          </div>
        </div>
      </div>
      <div slot="footer">
        <Button @click="cancel(false)">取消</Button>
        <Button @click="chooseConfirm" type="primary" :disabled="disabled || loading">确认</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from "@/api/api.js";
import { urlSetting } from "@/utils/urlSet.js";
export default {
  name: 'updateLargePicture',
  components: {},
  data () {
    return {
      loading: true,
      options: { multiple: true, limit: 1, sizes: 'small' },
      filePiclist: [],
      oldImgUrl: '',
      showUpload: false,
      receiveImg: '',
      imgUrl: '',
      previewImg: '',//预览图片
    }
  },
  props: {
    productData: {
      type: Object,
      default () {
        return {};
      },
    },
    moduleData: {
      type: Object,
      default: () => {
        return {}
      }
    },
    disabled: {
      type: Boolean,
      default: false
    },
    moduleDataLength: {
      type: Number,
      default: () => {
        return null
      }
    },
    allData: {
      type: Array,
      default: () => {
        return []
      }
    },
    dialogObj: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  watch: {
    showUpload: {
      deep: true,
      handler (val) {
        if (!val && this.oldImgUrl != this.imgUrl) {
          this.imgUrl = this.oldImgUrl;
        }
        this.picHover();
      }
    },
    moduleData: {
      immediate: true,
      deep: true,
      handler (val) {
        if (this.dialogObj.btnoperat == 'verifyPic' || this.dialogObj.btnoperat == 'finishData' || this.dialogObj.btnoperat == 'finishPic') val && this.initPage(this.moduleData);
      },
    },
    moduleDataLength: {
      immediate: true,
      deep: true,
      handler (val) {
        val && this.initPage(this.moduleData);
      },
    },
  },
  created () { },
  methods: {
    initPage (data) {
      if (data.picture) {
        // if(this.imgUrl == ''){
        this.imgUrl = this.urlconnect(data.picture.split(',')[0]);
        this.receiveImg = data.picture.split(',')[0];
        this.oldImgUrl = this.imgUrl;
        // }
        // if(this.imgUrl != ''){
        //   this.receiveImg = data.picture.split(',')[0];
        //   this.oldImgUrl = this.imgUrl;
        // }
      }
    },
    imgListHand (data, colorList) {
      // 把颜色ID转为颜色值
      data.forEach(item => {
        if (!item.diyColor && typeof item.colorId == 'number') {
          const color = colorList.filter(color => {
            return item.colorId == color.colorId
          })
          if (color[0]) {
            item.diyColor = color[0].color
          }
        }
      })
      let listUrl = data.filter(item => {
        return item.diyColor == this.moduleData.color
      })
      if (listUrl[0]) {
        this.filePiclist = listUrl[0].pictureUrl.split(',').map(item => {
          return { url: item }
        })
      }
      if (this.filePiclist.length == 0) {
        this.filePiclist.push({ url: this.receiveImg });
      }
      this.$nextTick(() => {
        this.loading = false;
      })
    },
    // 点击弹出
    async updateImg () {
      if (this.disabled) return;
      this.showUpload = true;
      if (this.productData.productId) {
        this.loading = true;
        const colorList = await this.getColorList();
        this.$axios.get(api.queryLaPaProductInfo, {
          params: { productId: this.productData.productId }
        }).then(({ code, datas }) => {
          this.loading = false;
          if (code !== 0) return;
          this.imgListHand(datas.laPaPictureColorRelList || [], colorList);
        }).catch(() => {
          this.loading = false;
        });
      }
    },
    // 获取颜色列表
    getColorList () {
      return new Promise((res) => {
        this.$axios.get(api.queryProductColorList).then(({ code, datas }) => {
          res(code == 0 ? datas : []);
        }).catch((e) => {
          console.error(e)
          res([]);
        })
      })
    },
    secectImg (url) {
      if (this.disabled) return;
      this.imgUrl = this.urlconnect(url);
    },
    chooseConfirm () {
      if (this.dialogObj.btnoperat == 'verifyPic' || this.dialogObj.btnoperat == 'finishData' || this.dialogObj.btnoperat == 'finishPic') {
        return this.editColorPic()
      }
      this.confirm()
    },
    editColorPic () {
      if (this.disabled) {
        this.imgUrl = this.oldImgUrl;
        this.showUpload = false;
        return;
      }
      this.loading = true;
      const fristPic = this.filePiclist.filter(item => {
        return this.urlconnect(item.url) == this.imgUrl;
      })
      let list = []
      this.allData.forEach((item) => {
        if (item.color == this.moduleData.color) {
          list.push({ quotationId: item.quotationId, productId: this.productData.productId, picture: fristPic[0] ? fristPic[0].url || this.receiveImg : this.receiveImg })
        }
      })

      this.$axios.post(api.updateProductVariQuotation, list).then(res => {
        this.loading = false;
        if (!res || res.code != 0) {
          this.$Message.error('操作失败！');
          return;
        }
        this.$Message.success('操作成功！');
        this.cancel(true);
      }).catch(() => {
        this.loading = false;
      }).finally(() => {
        this.$emit('getList')
      })
      //this.$emit('getList')

    },
    // 确认
    confirm () {
      if (this.disabled) {
        this.imgUrl = this.oldImgUrl;
        this.showUpload = false;
        return;
      }
      this.loading = true;
      const fristPic = this.filePiclist.filter(item => {
        return this.urlconnect(item.url) == this.imgUrl;
      })
      this.$axios.post(api.updateProductVariQuotation, [
        {
          productId: this.productData.productId,
          quotationId: this.moduleData.quotationId,
          picture: fristPic[0] ? fristPic[0].url || this.receiveImg : this.receiveImg
        }
      ]).then(res => {
        this.loading = false;
        if (!res || res.code != 0) {
          this.$Message.error('操作失败！');
          return;
        }
        this.$Message.success('操作成功！');
        this.cancel(true);
      }).catch(() => {
        this.loading = false;
      })
    },
    // 取消(取消时重置数据)
    cancel (rest) {
      if (rest) {
        this.oldImgUrl = this.imgUrl;
      } else {
        this.imgUrl = this.oldImgUrl;
      }
      this.$nextTick(() => {
        this.showUpload = false;
      })
    },
    urlconnect (url) {
      if (!url) return this.defaultImg;
      //let reg = /http[s]{0,1}:\/\/([\w.]+\/?)\S*/;
      //let preUrl = 'http://dyt-srm-test.oss-cn-guangzhou.aliyuncs.com/';
      //return !reg.test(url) ? `${preUrl}${url}` : url;
      return urlSetting(url);
    },
    picModalShow () {
      if (this.dialogObj.btnoperat == 'verifyPic' || this.dialogObj.btnoperat == 'finishPic' || this.dialogObj.btnoperat == 'finishData') {
        let arr = []
        this.loading = true;
        this.$axios
          .get(api.queryPicture, { params: { productId: this.productData.productId } })
          .then(({ code, datas }) => {
            if (code === 0) {
              let list = datas || [];
              list.forEach(k => {
                if (k.pictureType === 0) {
                  arr.push({ pictureId: k.pictureId, url: k.pictureUrl, name: k.pictureId });
                }
              });
              this.filePiclist = arr
              this.showUpload = true
              this.loading = false;
            }
          })
      } else {
        this.updateImg()
      }
    },
    // hover查看图片
    picHover (url) {
      if (url || this.imgUrl) {
        this.previewImg = url ? this.urlconnect(url) : this.imgUrl;
      }
    }
  }
};
</script>
<style lang="less" scoped>
.large-picture {
  display: inline-block;
  width: 46px;
  height: 46px;
  object-fit: cover;
  cursor: pointer;
  display: block;
  border: 1px solid #ccc;
}
.list-big-picture {
  max-width: 500px;
  max-height: 500px;
}
.large-pic-page {
  .ivu-modal-body {
    background: #f8f8f9;
  }
  .pic-main {
    display: flex;
    align-items: flex-start;
    .large-pic-preview {
      width: 500px;
      height: 550px;
      overflow: hidden;
      margin-right: 20px;
      padding: 10px;
      border: 1px solid #ccc;
      display: flex;
      align-items: center;
      justify-content: center;
      img {
        width: auto;
        height: 100%;
        vertical-align: middle;
        object-fit: cover;
      }
    }
    .pic-list {
      flex: 1;
      max-height: 550px;
      overflow: auto;
      display: flex;
      flex-wrap: wrap;
      margin: -4px;
      .pic-list-block {
        .pic-list-items {
          width: 80px;
          height: 100px;
          cursor: pointer;
          margin: 4px;
          padding: 6px;
          border: 1px solid #ccc;
          position: relative;
          .span-check-box {
            position: absolute;
            height: 22px;
            width: 22px;
            top: 5px;
            right: 5px;
            cursor: pointer;
            border-radius: 100%;
            background: #fff;
            font-size: 30px;
            i {
              position: absolute;
              top: -5px;
              left: -3px;
              color: green;
            }
          }
          &:hover {
            border: 1px solid #2d8cf0;
          }
        }
      }
    }
    .pic-list {
      img {
        width: 100%;
        height: 100%;
        vertical-align: middle;
        object-fit: cover;
      }
    }
  }
}
</style>