<template>
  <div>
    <div class="titles">产品图片</div>
    <Card :bordered="false" dis-hover>
      <p slot="title">参考图片</p>
      <div slot="extra" class="form-line-flex">
        <Button type="primary" class="mr10" @click="changePic()" :loading="downLoading" v-if="permissionStatus() && btnoperat == 'verifyPic'">修改颜色图片</Button>
        <Button
          type="primary"
          class="mr10"
          @click="choseAllImage"
          v-if="((winFileList.length && tab == '1') || (detailFileList.length && tab == '2'))"
        >{{ ((tab == '1' && winFileListChose) || tab == '2' && detailFileListChose) ? '取消' : '' }}全选</Button>
        <Button
          type="error"
          class="mr10"
          @click="delPic()"
          v-if="permissionStatus() && ['verifyPic','finishPic'].includes(btnoperat) && ((winFileList.length && tab == '1') || (detailFileList.length && tab == '2'))"
        >删除图片</Button>
        <Button
          type="primary"
          class="mr10"
          @click="download"
          :loading="downLoading"
          v-if="(winFileList.length || detailFileList.length)"
        >下载图片</Button>

        <!-- 上传图片 -->
        <template v-if="permissionStatus() && btnoperat === 'finishPic'">
          <button-upload class="mr10" v-model="winFileList" :is-sort="true" :options="{multiple:true,limit:100}" v-if="tab==1" />
          <button-upload class="mr10" v-model="detailFileList" :is-sort="true" :options="{multiple:true,limit:100}" v-if="tab==2" />
        </template>
      </div>
      <div>
        <Tabs value="1" @on-click="tabsClick">
          <TabPane label="橱窗图库" name="1">
            <preview-img
              :fileList="winFileList"
              :isDisabled="!(permissionStatus() && ['verifyPic','finishPic'].includes(btnoperat))"
              :sort="permissionStatus() && ['verifyPic','finishPic'].includes(btnoperat)"
              @dragList="winFileDarg"
              :isChecked="true"
              @delPic="delPic"
            />
          </TabPane>
          <TabPane label="详情图片" name="2">
            <preview-img
              :fileList="detailFileList"
              :isDisabled="!(permissionStatus() && ['verifyPic','finishPic'].includes(btnoperat))"
              :sort="permissionStatus() && ['verifyPic','finishPic'].includes(btnoperat)"
              @dragList="detailFileDarg"
              :isChecked="true"
              @delPic="delPic"
            />
          </TabPane>
        </Tabs>
      </div>
    </Card>
  </div>
</template> 

<script>
import api from '@/api/api.js'; 
import buttonUpload from '@/components/uploadImg/buttonUpload';
import previewImg from '@/components/uploadImg/previewImg';
const imageKeyObj = { '1': 'winFileList', '2': 'detailFileList' };

export default {
  name: "pictureMaterial",
  components: { buttonUpload, previewImg },
  data () {
    return {
      tab: '1',
      winFileList: [],
      detailFileList: [],
      downLoading: false,
    };
  },
  props: {
    productData: {
      type: Object,
      default () {
        return {};
      }
    },
    openType: {//是否查看
      type: String,
      default () {
        return '';
      }
    },
    btnoperat: {//用来判断操作步骤
      type: String,
      default () {
        return '';
      }
    },
  },
  computed: {
    winFileListChose () {
      const notChose = this.winFileList.find(f => !f.selected);
      return this.$common.isEmpty(notChose);
    },
    detailFileListChose () {
      const notChose = this.detailFileList.find(f => !f.selected);
      return this.$common.isEmpty(notChose);
    }
  },
  created () {
    if (JSON.stringify(this.productData) === '{}') return;
    this.getDetail();
  },
  methods: {
    // 获取图片详情
    getDetail () {
      this.winFileList = [];
      this.detailFileList = [];
      let { productId } = this.productData || {};
      this.$Spin.show();
      this.$axios.get(api.queryPicture, { params: { productId: productId } }).then(({ code, datas }) => {
        if (code === 0) {
          let winPicList = [];
          let detailPicList = [];
          (datas || []).forEach(k => {
            if ([0, 2, 3, 4, '0', '2', '3', '4'].includes(k.pictureType)) {
              winPicList.push({ pictureId: k.pictureId, url: k.pictureUrl, name: k.pictureId, pictureType: k.pictureType });
            }
            if (k.pictureType === 1) {
              detailPicList.push({ pictureId: k.pictureId, url: k.pictureUrl, name: k.pictureId, pictureType: k.pictureType });
            }
          });
          this.winFileList = winPicList;
          this.detailFileList = detailPicList;
        }
      }).finally(() => {
        this.$Spin.hide();
      });
    },
    // 标签点击
    tabsClick (name) {
      this.tab = name;
    },
    // 下载图片 
    download () {
      let [winFileList, detailFileList] = [[], []];
      winFileList = this.winFileList.map(k => {
        return k.url;
      });
      detailFileList = this.detailFileList.map(k => {
        return k.url;
      });
      let totalList = [...winFileList, ...detailFileList];
      // 没有新增图片
      if (!totalList.length) {
        this.$Message.error('暂无可下载的图片~');
        return;
      }

      this.downLoading = true;
      this.$axios
        .post(api.download, totalList)
        .then((res) => {
          if (res.code === 0) {
            this.$Message.success('下载成功~');
            window.open(res.datas);
          }
        })
        .finally(() => {
          this.downLoading = false;
        });
    },
    handlePic () {
      let [winFileList, detailFileList, isAcquired] = [[], [], 1]; //是否参考图片(0否，1是)

      let forFun = (list, type) => {
        let arr = [];
        list.forEach(k => {
          //   // if (k.pictureId) return;
          let temp = {};
          temp.isAcquired = isAcquired;
          // pictureType 图片类型（0橱窗图片，1详情图片，2通用自用尺码图，3婴童自用尺码图，4儿童自用尺码图），默认传的是0
          temp.pictureType = [2,3,4,'2','3','4'].includes(k.pictureType) ? k.pictureType : type;
          temp.pictureUrl = k.url;
          temp.merchantId = this.productData.merchantId;
          temp.productId = this.productData.productId;
          arr.push(temp);
        });
        return arr;
      }
      winFileList = forFun(this.winFileList, 0);
      detailFileList = forFun(this.detailFileList, 1);
      let totalList = [...winFileList, ...detailFileList];
      this.$Spin.show();
      this.$axios
        .post(api.savePicture, totalList)
        .then((res) => {
          if (res.code === 0) {
            this.getDetail();
          }
        })
        .finally(() => {
          this.$Spin.hide();
        })
    },
    // 提交图片资料
    handleData (type, callBack) {
      let [winFileList, detailFileList, isAcquired] = [[], [], 1]; //是否参考图片(0否，1是)

      let forFun = (list, type) => {
        let arr = [];
        list.forEach(k => {
          //   // if (k.pictureId) return;
          let temp = {};
          temp.isAcquired = isAcquired;
          // pictureType 图片类型（0橱窗图片，1详情图片，2通用自用尺码图，3婴童自用尺码图，4儿童自用尺码图），默认传的是0
          temp.pictureType = [2,3,4,'2','3','4'].includes(k.pictureType) ? k.pictureType : type;
          temp.pictureUrl = k.url;
          temp.merchantId = this.productData.merchantId;
          temp.productId = this.productData.productId;
          arr.push(temp);
        });
        return arr;
      }
      winFileList = forFun(this.winFileList, 0);
      detailFileList = forFun(this.detailFileList, 1);
      let totalList = [...winFileList, ...detailFileList];
      // 没有新增图片
      // if (!totalList.length && (type !== 1)) {
      //   typeof callBack != 'function' && this.$Message.success('操作成功~');
      //   typeof callBack == 'function' && callBack(true);
      //   return;
      // }
      // console.log(totalList);
      // return;
      this.$Spin.show();
      this.$axios.post(api.savePicture, totalList).then((res) => {
        if (res.code === 0) {
          this.getDetail();
          if (type === 1) {
            this.confirmVerify();
            // this.$emit('confirmVerifyPic');
          } else {
            typeof callBack != 'function' && this.$Message.success('操作成功~');
          }
        }
        typeof callBack == 'function' && callBack(true);
      }).finally(() => {
        this.$Spin.hide();
      }).catch(() => {
        typeof callBack == 'function' && callBack(false);
      })
    },
    // 提交审核
    confirmVerify () {
      this.$Modal.confirm({
        title: '提交审核图片',
        content: '<p>确定提交审核图片？</p>',
        loading: true,
        onOk: () => {
          let temp = {};
          temp.type = 13;
          temp.productId = this.productData.productId;

          this.$axios
            .post(api.productVerify, temp)
            .then((res) => {
              if (res.code === 0) {
                this.$Message.success('操作成功~');
                this.$emit('closeDialog');
              }
            })
            .finally(() => {
              this.$Modal.remove();
            });
        },
        onCancel: () => {
        }
      });
    },
    // 是否具有权限（审核权限>完善权限>创建权限）
    isPermiss () {
      let userInfo = this.$store.state.erpConfig && this.$store.state.erpConfig.userInfo;
      let [data, status] = [this.productData, false];
      if (data.pictureVerifyBy && data.pictureVerifyBy === userInfo.userId) {
        //新增审核也能修改图片
        status = true;
      } else if (data.pictureCompleteBy && data.pictureCompleteBy === userInfo.userId) {
        //前提图片完善人存在做判断
        status = true;
      } else if (data.requireVerifyBy && data.requireVerifyBy === userInfo.userId) {
        //最终才用需求审核人判断
        status = true;
      }
      return status;
    },
    // 是否可编辑
    permissionStatus () {
      let data = this.productData;
      const perOne = data.status === 5;//状态为完善图片资料
      const perTwo = [1, 2].includes(data.pictureVerifyStatus);// 图片完善状态:0-待指派 1-待完善 2-待审核 3-审核通过
      const perthree = this.openType !== 'view';//操作步骤：非查看
      return perOne && perTwo && perthree && this.isPermiss();
    },
    // 橱窗图库
    winFileDarg (list) {
      this.winFileList = this.$common.copy(list);
    },
    // 详情图片
    detailFileDarg (list) {
      this.detailFileList = this.$common.copy(list);
    },
    // 全选图片
    choseAllImage () {
      const key = imageKeyObj[this.tab];
      const isChos = !this[`${key}Chose`];
      (this[key] || []).forEach((item, index) => {
        this.$set(this[key][index], 'selected', isChos);
      });
    },
    // 批量删除
    delPic (data) {
      let totalList = this[imageKeyObj[this.tab]] || [];

      let list = [];
      if (data) { // 单个
        list.push(data);
      } else { // 批量
        totalList.forEach(k => { k.selected ? list.push(k) : ''; });
      }
      if (!list.length) {
        this.$Message.error('请勾选要删除的图片~');
        return;
      }
      let pictureIds = list.filter(k => { // 有pictureid 的图片才调用删除接口
        return k.pictureId;
      })

      // 更新图库
      let refreshList = () => {
        let arr = [];
        totalList.forEach(k => {
          let item = true;
          list.forEach(j => {
            k === j ? item = false : '';
          })
          if (item) arr.push(k);
        })
        this[imageKeyObj[this.tab]] = arr;
      }

      if (!pictureIds.length) {
        refreshList();
        return;
      }
      let temp = pictureIds.map(k => {
        return k.pictureId;
      })

      this.$Modal.confirm({
        title: '提示',
        content: '<p>确认删除图片?</p>',
        loading: true,
        onOk: () => {
          this.$axios
            .post(api.remove, temp)
            .then((res) => {
              if (res.code === 0) {
                // this.getDetail();
                refreshList();
              }
            })
            .finally(() => {
              this.$Modal.remove();
            });
        }
      });
    },
    changePic () {
      this.$emit('statusButton', 'commodityInformation')
      this.$store.commit('getPictureList', this.winFileList)
    },
  },
};
</script>
<style scoped>
.titles {
  padding: 0 16px 0px;
  font-size: 16px;
}
</style>
