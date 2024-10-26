<template>
  <div>
    <ul class="demandBoxImgUl">
      <div v-show="$store.state.curNodeId === 6">
        <!--<p class="mb10"><Checkbox
          v-if="($store.state.pictureCurNodeId === 1 && $store.state.curNodeControl === 999)"
          v-model="sendErpPicture" @on-change="setSendPictureStatus" disabled>同步至erp</Checkbox><Checkbox v-else v-model="sendErpPicture" disabled>同步至erp</Checkbox><Checkbox v-model="isTrue" disabled>同步至listing</Checkbox></p>-->
      </div>
      <!--参考图片-->
      <li class="liItem f14">
        <Card dis-hover>
          <div
            slot="title"
            class="img-card"
          >
            <div class="img-header-text">参考图片</div>
            <div v-show="tabName == 'name1'">
              <Dropdown
                style="margin-left: 20px"
                v-show="
                  $store.state.curNodeId === 6 &&
                  $store.state.pictureCurNodeId === 1
                "
              >
                <Button type="primary">
                  操作
                  <Icon type="ios-build"></Icon>
                </Button>
                <DropdownMenu slot="list">
                  <DropdownItem @click.native="moveList1(imgList1)">移动至可使用图片橱窗图库</DropdownItem>
                  <DropdownItem @click.native="moveList2(imgList1)">移动至可使用图片详情图片</DropdownItem>
                </DropdownMenu>
              </Dropdown>
              <dytUpload
                ref="upload1"
                v-show="
                  $store.state.curNodeId === 0 &&
                  $store.state.curNodeControl === 999
                "
                multiple
                type="drag"
                name="files"
                :headers="headObj"
                :action="fileApi"
                :show-upload-list="false"
                :on-success="handleSuccessA"
                :format="['jpg', 'jpeg', 'png', 'gif', 'bmp']"
                accept="image/*"
                :max-size="2048"
                :on-format-error="handleFormatError"
                :on-exceeded-size="handleMaxSize"
                class="ios-upload-t"
              >
                <Button type="primary">上传图片</Button>
              </dytUpload>
              <Button
                type="primary"
                @click="downImgs(imgList1)"
              >下载图片</Button>
            </div>
            <div v-show="tabName == 'name2'">
              <Dropdown
                style="margin-left: 20px"
                v-show="
                  $store.state.curNodeId === 6 &&
                  $store.state.pictureCurNodeId === 1
                "
              >
                <Button type="primary">
                  操作
                  <Icon type="ios-build"></Icon>
                </Button>
                <DropdownMenu slot="list">
                  <DropdownItem @click.native="moveList1(imgList2)">移动至可使用图片橱窗图库</DropdownItem>
                  <DropdownItem @click.native="moveList2(imgList2)">移动至可使用图片详情图片</DropdownItem>
                </DropdownMenu>
              </Dropdown>
              <dytUpload
                ref="upload2"
                v-show="$store.state.curNodeId === 0 && $store.state.curNodeControl === 999"
                multiple
                type="drag"
                name="files"
                :headers="headObj"
                :action="fileApi"
                :show-upload-list="false"
                :on-success="handleSuccessB"
                :format="['jpg', 'jpeg', 'png', 'gif', 'bmp']"
                accept="image/*"
                :max-size="2048"
                :on-format-error="handleFormatError"
                :on-exceeded-size="handleMaxSize"
                class="ios-upload-t"
              >
                <Button type="primary">上传图片</Button>
              </dytUpload>
              <Button
                type="primary"
                @click="downImgs(imgList2)"
              >下载图片</Button>
            </div>
          </div>
          <Tabs
            style="width: 100%"
            v-model="tabName"
          >
            <TabPane
              label="橱窗图库"
              name="name1"
            >
              <div
                class="img-list"
                v-show="tabName == 'name1'"
              >
                <div v-show="imgList1.length == 0">暂无图片</div>
                <ul class="img-ul">
                  <!-- <li><Checkbox v-model="checkAllImgList1" @on-change="handleCheckAll" /></li>-->
                  <li
                    class="img-item img-box"
                    v-for="(item, index) in imgList1"
                    :key="index"
                  >
                    <Icon
                      v-show="
                        $store.state.curNodeId === 0 &&
                        $store.state.curNodeControl === 999
                      "
                      type="md-close-circle"
                      class="imgDel"
                      @click="delPicture(item)"
                    ></Icon>
                    <img
                      :src="item.pictureUrl"
                      @click="openImg(item.pictureUrl)"
                    />
                  </li>
                  <li v-if="
                      uploadList1.length > 0 &&
                      uploadList1[uploadList1.length - 1] !== 'finished'
                    ">
                    <Progress
                      v-if="uploadList1[uploadList1.length - 1].showProgress"
                      :percent="uploadList1[uploadList1.length - 1].percentage"
                      hide-info
                    ></Progress>
                  </li>
                </ul>
              </div>
            </TabPane>
            <TabPane
              label="详情图片"
              name="name2"
            >
              <div
                class="img-list"
                v-show="tabName == 'name2'"
              >
                <div v-show="imgList2.length == 0">暂无图片</div>
                <ul class="img-ul">
                  <li
                    class="img-item img-box"
                    v-for="(item, index) in imgList2"
                    :key="index"
                  >
                    <Icon
                      v-show="
                        $store.state.curNodeId === 0 &&
                        $store.state.curNodeControl === 999
                      "
                      type="md-close-circle"
                      class="imgDel"
                      @click="delPicture(item)"
                    ></Icon>
                    <img
                      :src="item.pictureUrl"
                      @click="openImg(item.pictureUrl)"
                    />
                  </li>
                  <li v-if="
                      uploadList2.length > 0 &&
                      uploadList2[uploadList2.length - 1] !== 'finished'
                    ">
                    <Progress
                      v-if="uploadList2[uploadList2.length - 1].showProgress"
                      :percent="uploadList2[uploadList2.length - 1].percentage"
                      hide-info
                    ></Progress>
                  </li>
                </ul>
              </div>
            </TabPane>
          </Tabs>
        </Card>
        <!-- <p v-show="tabName=='name1'"><span class="fr" >

                <span class="downClass"  @click="downImgs(imgList1)">下载图片</span>
           &lt;!&ndash;    <Icon type="ios-download" class="demand-down" @click="downImgs(imgList1)"></Icon>&ndash;&gt;
                   </span></p>
         <p v-show="tabName=='name2'">参考图片<span class="fr" >

                <span class="downClass"  @click="downImgs(imgList2)">下载图片</span>
           &lt;!&ndash;    <Icon type="ios-download" class="demand-down" @click="downImgs(imgList1)"></Icon>&ndash;&gt;
                   </span></p>-->
      </li>
      <!--可使用图片-->
      <li
        class="liItem f14"
        v-show="isShow"
      >
        <Card dis-hover>
          <div
            slot="title"
            class="img-card"
          >
            <div class="img-header-text">可使用图片</div>
            <div v-show="tabName1 == 'name1'">
              <dytUpload
                ref="upload3"
                v-show="
                  $store.state.pictureCurNodeId == 1 &&
                  $store.state.curNodeControl === 999
                "
                multiple
                type="drag"
                name="files"
                :headers="headObj"
                :action="fileApi"
                :show-upload-list="false"
                :on-success="handleSuccessC"
                :format="['jpg', 'jpeg', 'png', 'gif', 'bmp']"
                accept="image/*"
                :max-size="2048"
                :on-format-error="handleFormatError"
                :on-exceeded-size="handleMaxSize"
                class="ios-upload-t"
              >
                <Button
                  type="primary"
                  class="ml5"
                >上传图片</Button>
              </dytUpload>
              <Button
                type="primary"
                @click="downImgs(imgList3)"
              >下载图片</Button>
            </div>
            <div v-show="tabName1 == 'name2'">
              <dytUpload
                ref="upload4"
                v-show="
                  $store.state.pictureCurNodeId == 1 &&
                  $store.state.curNodeControl === 999
                "
                multiple
                type="drag"
                name="files"
                :headers="headObj"
                :action="fileApi"
                :show-upload-list="false"
                :on-success="handleSuccessD"
                :format="['jpg', 'jpeg', 'png', 'gif', 'bmp']"
                accept="image/*"
                :max-size="2048"
                :on-format-error="handleFormatError"
                :on-exceeded-size="handleMaxSize"
                class="ios-upload-t"
              >
                <Button type="primary">上传图片</Button>
              </dytUpload>
              <Button
                type="primary"
                @click="downImgs(imgList4)"
              >下载图片</Button>
            </div>
          </div>
          <div>
            <Tabs v-model="tabName1">
              <TabPane
                label="橱窗图库"
                name="name1"
              >
                <div
                  class="img-list"
                  v-show="tabName1 === 'name1'"
                >
                  <div v-show="imgList3.length == 0">暂无图片</div>
                  <ul class="img-ul">
                    <li
                      class="img-item img-box"
                      v-for="(item, index) in imgList3"
                      :key="index"
                    >
                      <Icon
                        v-show="
                          ($store.state.curNodeId === 0 ||
                            $store.state.pictureCurNodeId === 1) &&
                          $store.state.curNodeControl === 999
                        "
                        type="md-close-circle"
                        class="imgDel"
                        @click="delPicture(item)"
                      >
                      </Icon>
                      <img
                        :src="item.pictureUrl"
                        @click="openImg(item.pictureUrl)"
                      />
                    </li>
                    <li v-if="
                        uploadList3.length > 0 &&
                        uploadList3[uploadList3.length - 1] !== 'finished'
                      ">
                      <Progress
                        v-if="uploadList3[uploadList3.length - 1].showProgress"
                        :percent="
                          uploadList3[uploadList3.length - 1].percentage
                        "
                        hide-info
                      >
                      </Progress>
                    </li>
                  </ul>
                </div>
              </TabPane>
              <TabPane
                label="详情图片"
                name="name2"
              >
                <div
                  class="img-list"
                  v-show="tabName1 === 'name2'"
                >
                  <div v-show="imgList4.length == 0">暂无图片</div>
                  <ul class="img-ul">
                    <li
                      class="img-item img-box"
                      v-for="(item, index) in imgList4"
                      :key="index"
                    >
                      <Icon
                        v-show="
                          $store.state.pictureCurNodeId === 1 &&
                          $store.state.curNodeControl === 999
                        "
                        type="md-close-circle"
                        class="imgDel"
                        @click="delPicture(item)"
                      >
                      </Icon>
                      <img
                        :src="item.pictureUrl"
                        @click="openImg(item.pictureUrl)"
                      />
                    </li>
                    <li v-if="
                        uploadList4.length > 0 &&
                        uploadList4[uploadList4.length - 1] !== 'finished'
                      ">
                      <Progress
                        v-if="uploadList4[uploadList4.length - 1].showProgress"
                        :percent="
                          uploadList4[uploadList4.length - 1].percentage
                        "
                        hide-info
                      >
                      </Progress>
                    </li>
                  </ul>
                </div>
              </TabPane>
            </Tabs>
          </div>
        </Card>
      </li>
    </ul>
    <Modal
      v-model="imgModal"
      class="clearMarginAuto"
      :fullscreen="isTrue"
      ref="imgModal"
      title="图片"
    >
      <p
        slot="header"
        @mousedown="moveMt"
        class="moveHead"
        @dblclick="fullscreenImgModal"
      >
        <span>图片</span>
        <Icon
          type="ios-qr-scanner"
          style="position: absolute; right: 40px; top: 16px; color: #999; z-index: 99; cursor: pointer;"
          size="18"
          @click="fullscreenImgModal"
        >
        </Icon>
      </p>
      <div>
        <img
          width="100%"
          :src="imgUrl"
        />
      </div>
    </Modal>
  </div>
</template> 

<script>
import CommonMixin from "@/components/mixin/commonMixin";
import api from "@/api/api";

export default {
  name: "gallery",
  mixins: [CommonMixin],
  data() {
    return {
      isDownImg: 0,
      isDownImgTimer: null,
      checkAllImgList1: false,
      checkAllImgList2: false,
      checkAllImgList3: false,
      checkAllImgList4: false,
      imgModal: false,
      imgUrl: "",
      sendErpPicture: false, // 推送erp
      tabName: "name1",
      tabName1: "name1",
      swiperOption: {
        slidesPerView: 5,
        centeredSlides: false,
        spaceBetween: 30,
        pagination: {
          el: ".swiper-pagination",
          type: "fraction",
        },
        navigation: {
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        },
      },
      imgList: [
        /* {
         pictureUrl:'https://i.ebayimg.com/images/g/wrIAAOSwezVWvQ7x/s-l500.jpg',
         pictureType:0,  //图片类型（0橱窗图片，1详情图片）
         isAcquired:1    //是否采集而来(0否，1是)
         } */
      ],
      delImgs: [],
      imgListD: [],
      uploadList: [],
      uploadList1: [],
      uploadList2: [],
      uploadList3: [],
      uploadList4: [],
      downZip: "",
      localDate: {},
    };
  },
  created() {
    // this.getImg();
  },
  mounted() {
    this.uploadList1 = this.$refs.upload1.fileList;
    this.uploadList2 = this.$refs.upload2.fileList;
    this.uploadList3 = this.$refs.upload3.fileList;
    this.uploadList4 = this.$refs.upload4.fileList;
  },
  computed: {
    isShow() {
      let v = this;
      if (
        v.$store.state.pictureCurNodeId >= 1 &&
        v.$store.state.curNodeId === 6
      ) {
        return true;
      } else {
        return false;
      }
    },
    isDisable() {
      let v = this;
      if (
        v.$store.state.pictureCurNodeId !== 1 ||
        v.$store.state.curNodeControl !== 999
      ) {
        return true;
      } else {
        return false;
      }
    },
    imgList1() {
      // 参考图片 橱窗图片
      let v = this;
      let arr = [];
      if (v.imgList) {
        v.imgList.forEach((item) => {
          if ([0, 2, 3, 4, '0', '2', '3', '4'].includes(item.pictureType) && (item.isAcquired === 1 || item.isAcquired === "1")) {
            arr.push(item);
          }
        });
      }
      return arr;
    },
    imgList2() {
      // 参考图片 详情图片
      let v = this;
      let arr = [];
      if (v.imgList) {
        v.imgList.forEach((item) => {
          if (
            (item.pictureType === 1 || item.pictureType === "1") &&
            (item.isAcquired === 1 || item.isAcquired === "1")
          ) {
            arr.push(item);
          }
        });
      }
      return arr;
    },
    imgList3() {
      // 可使用图片 橱窗图片
      let v = this;
      let arr = [];
      if (v.imgList) {
        v.imgList.forEach((item) => {
          if ([0, 2, 3, 4, '0', '2', '3', '4'].includes(item.pictureType) && (item.isAcquired === 0 || item.isAcquired === "0")) {
            arr.push(item);
          }
        });
      }
      return arr;
    },
    imgList4() {
      // 可使用图片 详情图片
      let v = this;
      let arr = [];
      if (v.imgList) {
        v.imgList.forEach((item) => {
          if (
            (item.pictureType === 1 || item.pictureType === "1") &&
            (item.isAcquired === 0 || item.isAcquired === "0")
          ) {
            arr.push(item);
          }
        });
      }
      return arr;
    },
  },
  methods: {
    addImgTime(pictureUrl) {
      let url = pictureUrl;
      if (url.indexOf("?") > -1) {
        url = url.replace(/\?.*/, "?addTime" + new Date().getTime());
      } else {
        url = url + "?addTime" + new Date().getTime();
      }
      return url;
    },
    moveList1(list) {
      let v = this;
      // 移动 可使用图片 橱窗图片
      list.forEach((item) => {
        v.imgList.push({
          pictureUrl: v.addImgTime(item.pictureUrl),
          pictureType: [ 2, 3, 4, '2', '3', '4'].includes(item.pictureType) ? item.pictureType : 0,
          isAcquired: 0,
        });
      });
    },
    moveList2(list) {
      let v = this;
      list.forEach((item) => {
        v.imgList.push({
          pictureUrl: v.addImgTime(item.pictureUrl),
          pictureType: [ 2, 3, 4, '2', '3', '4'].includes(item.pictureType) ? item.pictureType : 1,
          isAcquired: 0,
        });
      });
    },
    handleCheckAll(val) {
      let v = this;
      if (val === 1) {
        v.checkAllImgList1 = !v.checkAllImgList1;
        v.imgList.forEach((item) => {
          if ([0, 2, 3, 4, '0', '2', '3', '4'].includes(item.pictureType) && (item.isAcquired === 1 || item.isAcquired === "1")) {
            v.$set(item, "check", v.checkAllImgList1);
          }
        });
      } else if (val === 2) {
        v.checkAllImgList2 = !v.checkAllImgList2;
        v.imgList.forEach((item) => {
          if (
            (item.pictureType === 1 || item.pictureType === "1") &&
            (item.isAcquired === 1 || item.isAcquired === "1")
          ) {
            v.$set(item, "check", v.checkAllImgList2);
          }
        });
      } else if (val === 3) {
        v.checkAllImgList3 = !v.checkAllImgList3;
        v.imgList.forEach((item) => {
          if ([0, 2, 3, 4, '0', '2', '3', '4'].includes(item.pictureType) && (item.isAcquired === 0 || item.isAcquired === "0")) {
            v.$set(item, "check", v.checkAllImgList3);
          }
        });
      } else {
        v.checkAllImgList4 = !v.checkAllImgList4;
        v.imgList.forEach((item) => {
          if (
            (item.pictureType === 1 || item.pictureType === "1") &&
            (item.isAcquired === 0 || item.isAcquired === "0")
          ) {
            v.$set(item, "check", v.checkAllImgList4);
          }
        });
      }
    },
    setSendPictureStatus(value) {
      let v = this;
      let val = value ? 1 : 0;
      v.$store.commit("isCheckedSendErp", val);
      v.$axios
        .post(api.setSendErpPicture, {
          productId: v.$store.state.createId, // 需求ID
          sendErpPicture: val, // 是否推送图片至erp:0否，1是
        })
        .then((res) => {
          if (res.code === 0) {
            v.$msg.success("保存成功");
          }
        });
    },
    openImg(url) {
      this.imgUrl = url;
      this.imgModal = true;
    },
    downImgs(data) {
      let arr = [];
      let v = this;
      data.forEach((item) => {
        arr.push(item.pictureUrl);
      });
      if (arr.length < 1) {
        v.$msg.error({
          content: "未选择图片",
          duration: 5,
        });
        return;
      }
      if (JSON.stringify(data) === v.localDate) {
        v.$msg.info("压缩包已下载，刷新页面可重新下载");
        return;
      }
      v.localDate = JSON.stringify(data); // 缓存数据
      let index = v.$store.state.downIndex.length;
      let downIndex = [];
      v.$store.state.downIndex.forEach((item) => {
        downIndex.push(item);
      });
      downIndex.push({
        index: index,
        href: "",
      });
      v.$store.commit("downIndex", downIndex);
      this.$Notice.open({
        title:
          "图片压缩包" +
          v.$store.state.downIndex[v.$store.state.downIndex.length - 1].index,
        duration: 0,
        name: index,
        render(h) {
          return h("div", {
            domProps: {
              innerHTML: (function () {
                if (v.$store.state.downIndex[index].href === "") {
                  return "正在生成压缩包...";
                } else {
                  return (
                    '<a href="' +
                    v.$store.state.downIndex[index].href +
                    '" target="_blank">' +
                    "点击下载压缩包" +
                    "</a>"
                  );
                }
              })(),
            },
            on: {
              click() {
                v.$Notice.close(index);
              },
            },
          });
        },
      });
      v.$axios
        .post(api.downloadImg, arr)
        .then((res) => {
          v.$Spin.hide();
          if (res.code === 0) {
            let arr = v.$store.state.downIndex;
            arr[index].href = res.datas;
            v.$store.commit("downIndex", arr);
          } else {
            this.$Notice.close(index);
            v.$msg.error("下载失败");
          }
        })
        .catch(() => {
          v.$Spin.hide();
        });
    },
    delPicture(data) {
      let v = this;
      v.imgList.forEach((item, index) => {
        if (item.pictureUrl == data.pictureUrl) {
          if (data.pictureId) {
            v.delImgs.push(data.pictureId);
          }
          v.imgList.splice(index, 1);
        }
      });
    },
    handleSuccessA(res) {
      let v = this;
      if (res.code === 0) {
        v.imgList.push({
          pictureUrl: res.datas[0],
          productId: v.$store.state.createId,
          pictureType: [ 2, 3, 4, '2', '3', '4'].includes(res.pictureType) ? res.pictureType : 0, // 图片类型（0橱窗图片，1详情图片）
          isAcquired: 1, // 是否参考图片(0否，1是)
        });
      }
    },
    handleSuccessB(res) {
      let v = this;
      if (res.code === 0) {
        v.imgList.push({
          pictureUrl: res.datas[0],
          productId: v.$store.state.createId,
          pictureType: [ 2, 3, 4, '2', '3', '4'].includes(res.pictureType) ? res.pictureType : 1,
          isAcquired: 1,
        });
      }
    },
    handleSuccessC(res) {
      let v = this;
      if (res.code === 0) {
        v.imgList.push({
          pictureUrl: res.datas[0],
          productId: v.$store.state.createId,
          pictureType: [ 2, 3, 4, '2', '3', '4'].includes(res.pictureType) ? res.pictureType : 0, // 图片类型（0橱窗图片，1详情图片）
          isAcquired: 0, // 是否参考图片(0否，1是)
        });
      }
    },
    handleSuccessD(res) {
      let v = this;
      if (res.code === 0) {
        v.imgList.push({
          pictureUrl: res.datas[0],
          productId: v.$store.state.createId,
          pictureType: [ 2, 3, 4, '2', '3', '4'].includes(res.pictureType) ? res.pictureType : 1,
          isAcquired: 0,
        });
      }
    },
    // 获取图片信息
    getImg() {
      let v = this;
      v.$axios
        .get(api.queryPicture + "?productId=" + v.$store.state.createId)
        .then((res) => {
          if (res.code === 0) {
            v.imgList = res.datas;
            // v.$store.commit('imgList',v.imgList)
          }
        })
        .catch(() => {});
    },
    // 删除图片
    delAll() {
      return new Promise((resolve) => {
        if (this.delImgs && this.delImgs.length) {
          this.$axios
            .post(api.removePicture, this.delImgs)
            .then((res) => {
              if (res.code === 0) {
                this.delImgs = [];
              }
            })
            .finally(() => {
              resolve();
            });
        }
        resolve();
      });
    },
    // 保存图片,将没有图片id 的上传;
    save() {
      return new Promise((resolve, reject) => {
        if (!(this.imgList && this.imgList.length)) {
          resolve();
          return;
        }
        this.delAll().finally(() => {
          let newImgList = [];
          this.imgList.forEach((item) => {
            if (!item.pictureId) {
              item.productId = this.$store.state.createId;
              newImgList.push(item);
            }
          });
          this.$axios
            .post(api.savePicture, newImgList)
            .then((res) => {
              resolve();
              if (res.code === 0) {
                this.getImg();
              }
            })
            .catch(() => {
              reject();
            });
        });
      });
    },
  },
  watch: {
    imgList() {
      let v = this;
      v.$store.commit("imgList", v.imgList);
    },
    /* '$store.state.isCheckedSendErp' (value) {
     let v = this;
     if (value === null) {
     value = 0;
     }
     v.sendErpPicture = value !== 0;
     } */
  },
};
</script>

<style>
.img-list .ivu-checkbox-inner {
  border: 1px solid #5d6e9e;
}

.demandBoxImgUl .ivu-upload-drag {
  border: none;
}

.ivu-modal-body {
  overflow-y: auto;
}

.demandBoxImgUl .ivu-card-body {
  padding: 0;
  border-bottom: 0;
}

.demandBoxImgUl .liItem .ivu-card-head {
  padding: 5px 16px;
}
</style>
<style scoped>
.img-header-text {
  line-height: 32px;
  color: #222;
}

.img-card {
  display: flex;
  justify-content: space-between;
}

.checkAll {
  position: absolute;
  top: 0px;
  right: -6px;
}

.downClass {
  color: #2b85e4;
  cursor: pointer;
  float: right;
  margin-right: 10px;
}

.img-ul {
  width: 100%;
  overflow: hidden;
  position: relative;
}

.img-ul .img-item {
  float: left;
  width: 100px;
  height: 100px;
  margin-right: 10px;
  margin-bottom: 10px;
  position: relative;
}

.img-ul .img-item img {
  width: 100%;
}

.img-box {
  width: 100%;
  height: 100%;
  text-align: center;
  border: 1px solid #ddd;
}

.img-box img {
  margin: 0 auto;
  max-height: 100%;
  max-width: 100%;
  position: relative;
  top: 50%;
  -webkit-transform: translateY(-50%);
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
}

.imgDel {
  position: absolute;
  right: 5px;
  top: 5px;
  cursor: pointer;
  z-index: 10;
}

.imgDel:hover {
  color: red;
}

.ios-upload-t {
  float: right;
}

.demand-up {
  font-size: 14px;
  color: #2b85e4;
  cursor: pointer;
}

.demand-down {
  font-size: 24px;
  position: absolute;
  right: 35px;
  top: -8px;
  color: rgb(51, 153, 255);
  cursor: pointer;
}

.demandBoxImgUl {
  padding: 0 10px;
}

.demandBoxImgUl .liItem {
  border-bottom: 1px solid #ddd;
  margin-bottom: 10px;
}

.demandBoxImgUl .liItem .tit {
  position: relative;
  height: 30px;
}

.demandBoxImgUl .liItem .itemBox {
  position: relative;
  padding-bottom: 20px;
}

.demandBoxImgUl .liItem .itemBox img {
  width: 100%;
}

.img-list {
  padding: 10px 0 0 10px;
  position: relative;
  overflow: hidden;
}
</style>
