<template>
  <div class="selectSizePic" style="min-height: 200px;">
    <Spin v-if="pageLoading" fix ></Spin>
    <Modal
      v-model="visibleModal"
      :title="modalTitle"
      :width="80"
      :mask-closable="false"
      class-name="modal-custom selectSizePic-modal"
    >
      <Form ref="pageForm"
        :model="formParams"
        :rules="ruleValidate"
        :label-width="100"
        :disabled="isDisabled"
      >
        <Form-item label="图片名称" prop="sizePictureName" style="display: inline-block;width: 350px;">
          <dyt-input type="text" placeholder="请输入图片名关键字" v-model="formParams.sizePictureName" />
        </Form-item>
      </Form>
      <div v-if="pictureList.length > 0" class="img-list">
        <div
          v-for="(img, index) in pictureList"
          :key="index"
          class="img-list-group"
          @click="checkPicHand(img.pictureId)"
          :class="{'check-pic-group': picInfo.pictureId == img.pictureId}"
        >
          <div
            class="img-list-item"
            :title="img.pictureName"
            :class="{'check-pic-item': picInfo.pictureId == img.pictureId}"
          >{{img.pictureName}}</div>
          <template v-if="img.pictureUrlList && img.pictureUrlList.length > 0">
            <div>
              <Poptip
                trigger="hover"
                :transfer="true"
                placement="bottom-start"
                v-for="(item, itemIndex) in img.pictureUrlList"
                :key="`pic-${itemIndex}`"
              >
                <img class="min-img" :src="item" />
                <template slot="content">
                  <img class="selectSizePic-slot-big-img" :src="item" />
                </template>
              </Poptip>
            </div>
          </template>
        </div>
      </div>
      <div v-else>暂无图片信息！</div>
      <div slot="footer">
        <Button @click="visibleModal = false"> {{pageLoading ? '关 闭' : '取 消'}}</Button>
        <Button style="margin-left: 10px;" type="primary" @click="confirm" v-if="!isDisabled || pageLoading">确 定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from '@/api/api.js';

export default {
  name: 'selectSizePic',
  components: {},
  mixins: [],
  model: {
    prop: 'moduleData',
    event: 'moduleData'
  },
  props: {
    visibleModule: { type: Boolean, default: false },
    moduleData: { type: Object, default: () => { return {} } }
  },
  data () {
    return {
      picApi: api.sizeManageApiConfig.pictureManage,
      pageLoading: false,
      isDisabled: false,
      modalTitle: '添加图片',
      visibleModal: false,
      formParams: {
        sizePictureName: ''
      },
      ruleValidate: {},
      pictureList: [],
      oldPictureList: [],
      picInfo: {}
    }
  },
  watch: {
    visibleModule: {
      deep: true,
      immediate: true,
      handler (val) {
        this.visibleModal = val;
        val && this.initPage();
      }
    },
    visibleModal: {
      deep: true,
      handler (val) {
        !val && this.resetData();
        this.$emit('update:visibleModule', val);
      }
    },
    'formParams.sizePictureName': {
      deep: true,
      handler (val) {
        this.searchPic(val)
      }
    }
  },
  created () {},
  methods: {
    // 初始化
    initPage () {
      this.serach(() => {
        if (!this.$common.isEmpty(this.moduleData)) {
          this.modalTitle = this.moduleData.classificationId ? '更换图片' : '添加图片';
          if (!this.$common.isEmpty(this.moduleData.picInfo)) {
            const checkPic = this.pictureList.filter(item => {
              return item.pictureId === this.moduleData.pictureId;
            })[0];
            this.picInfo = this.$common.copy(checkPic || {});
          }
        }
      });
    },
    // 获取列表数据
    serach (callBack) {
      this.pageLoading = true;
      this.axios.post(this.picApi.queryProductSizePictureList, { pictureName: '' }).then(res => {
        if (res && res.data && res.data.code === 0) {
          let imgList = [];
          res.data.datas.forEach((item) => {
            if (item.pictureUrlList) {
              item.pictureUrlList.forEach((img, index) => {
                if (!img.includes('http:') && !img.includes('https:') && !img.includes('/pds-service/filenode/s')) {
                  item.pictureUrlList[index] = `/pds-service/filenode/s${img}`;
                }
              })
              imgList.push(item);
            }
          })
          this.pictureList = [...this.pictureList, ...imgList];
          this.oldPictureList = this.$common.copy(this.pictureList);
          this.$nextTick(() => {
            typeof callBack === 'function' && callBack();
          })
        }
      }).catch(() => {
        typeof callBack === 'function' && callBack();
      }).finally(() => {
        this.pageLoading = false;
      })
    },
    // 图片名称搜索
    searchPic (str) {
      let lists = this.$common.copy(this.oldPictureList);
      if (!str.trim()) {
        this.pictureList = lists;
        return;
      }
      this.pictureList = lists.filter(item => {
        if (item.pictureName) {
          return item.pictureName.includes(str);
        } else {
          return false
        }
      })
    },
    // 重置数据
    resetData () {
      this.modalTitle = '添加图片';
      this.pictureList = [];
      this.picInfo = {};
      this.isDisabled = false;
    },
    // 确认
    confirm () {
      this.$emit('moduleData', {
        ...this.moduleData,
        pictureId: this.picInfo.pictureId || '',
        pictureName: this.picInfo.pictureName || '',
        picInfo: this.$common.copy(this.picInfo.pictureUrlList).map(item => {
          return {
            pictureId: this.picInfo.pictureId || '',
            pictureUrl: item
          }
        })
      })
      this.$nextTick(() => {
        this.visibleModal = false;
      })
    },
    // 选中图片
    checkPicHand (val) {
      const checkPic = this.pictureList.filter(item => {
        return val === item.pictureId;
      })[0];
      this.picInfo = checkPic;
    }
  }
}
</script>
<style lang="less">
.selectSizePic-modal{
  .img-list{
    .img-list-group{
      padding: 10px 10px 0 10px;
      margin: 10px 0;
      border: 1px solid #ccc;
      border-radius: 5px;
      &.check-pic-group{
        background: #bccfe3;
      }
      .ivu-poptip{
        margin: 0 15px 15px 0;
        font-size: 0;
        line-height: 0;
        box-shadow: 0 1px 5px 1px #868686;
        border-radius: 5px;
        vertical-align: top;
        overflow: hidden;
        &:last-child{
          margin: 0 0 15px 0;
        }
      }
    }
    .img-list-item{
      display: inline-block;
      position: relative;
      margin: 0 0 15px 0;
      width: 100%;
      padding: 0 30px 10px 10px;
      // text-align: center;
      border-bottom: 1px solid #dcdee2;
      &:before {
        content: "";
        position: absolute;
        display: block;
        height: 18px;
        width: 18px;
        top: 2px;
        right: 10px;
        background-color: #fff;
        border: 1px solid #dcdee2;
        z-index: 9;
        cursor: pointer;
      }
      &.check-pic-item{
        &:before {
          border: 1px solid #2d8cf0;
          background-color: #2d8cf0;
        }
        &:after {
          content: "";
          position: absolute;
          display: block;
          width: 7px;
          height: 16px;
          top: 1px;
          right: 15px;
          border: 2px solid #fff;
          border-top: none;
          border-left: none;
          -webkit-transform: rotate(45deg) scale(1);
          transform: rotate(45deg) scale(1);
          -webkit-transition: all 0.2s ease-in-out;
          transition: all 0.2s ease-in-out;
          border-radius: 0;
          z-index: 9;
        }
      }
      p{
        width: 100%;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
    .min-img {
      width: 100%;
      height: 100px;
    }
  }
}
.selectSizePic-slot-big-img{
  max-width: 600px;
  max-height: 600px;
}
</style>
