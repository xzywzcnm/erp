<template>
  <div>
    <div class="vStep">
      <vSteps :data="stepsDate"></vSteps>
    </div>
    <Row>
      <Col
        style="width: 160px"
        span="4"
      >
      <div
        v-for="(item, index) in sortChoseDate"
        :key="index"
      >
        <Button
          style="width: 150px"
          :class="item.selected ? 'ivu-btn-primary' : ''"
          @click="
              sortChose(item, index, sortChoseDate);
              choseDemand(item.id, sortChoseDate);
            "
        >{{ item.tit }}
        </Button>
      </div>
      </Col>
      <Col span="19">
      <div class="demandBox errorTip">
        <!--需求详情-->
        <div
          v-show="demandBoxIndex === 0"
          class="demandItem"
        >
          <div class="demandBoxTit">
            <h3>需求详情</h3>
          </div>
          <queryBaseInfo
            ref="queryBaseInfo"
            @collectDataMt="collectDataMt"
            @collectChrome="collectChrome"
          ></queryBaseInfo>
        </div>
        <!--基本信息-->
        <div
          v-show="demandBoxIndex === 7"
          class="demandItem"
        >
          <div class="demandBoxTit">
            <h3>基本信息</h3>
          </div>
          <otherInfo></otherInfo>
        </div>
        <!--多属性-->
        <div
          v-show="demandBoxIndex === 1"
          class="demandItem"
        >
          <div class="demandBoxTit">
            <h3>多属性</h3>
          </div>
          <attrView ref="attriButesRef"></attrView>
        </div>
        <!--图片信息-->
        <div
          v-show="demandBoxIndex === 2"
          class="demandItem"
        >
          <div class="demandBoxTit">
            <h3>产品图片</h3>
          </div>
          <gallery ref="gallery"></gallery>
        </div>
        <!--采集描述-->
        <div
          v-show="demandBoxIndex === 3"
          class="demandItem"
        >
          <div class="demandBoxTit">
            <h3>采集描述</h3>
          </div>
          <description
            ref="description"
            :open="open"
          ></description>
        </div>
        <!--询价-->
        <div
          v-show="demandBoxIndex === 4"
          class="demandItem"
        >
          <commonInquiry ref="commonInquiry"></commonInquiry>
        </div>
        <!--取样-->
        <div
          v-show="demandBoxIndex === 5"
          class="demandItem"
        >
          <commonSampling ref="commonSampling"></commonSampling>
        </div>
        <!--操作日志-->
        <div
          v-show="demandBoxIndex === 6"
          class="demandItem"
        >
          <div class="demandBoxTit">
            <h3>操作日志</h3>
          </div>
          <commonOperationLog ref="commonOperationLog"></commonOperationLog>
        </div>
      </div>
      <ButtonGroup
        class="saveBtn"
        solt="footer"
        v-show="isShowBtn"
      >
        <Button
          type="primary"
          class="mr5"
          @click="infoReload"
        >重置</Button>
        <Button
          type="primary"
          class="mr5"
          @click="savesBtn"
          :loading="saveLoadding"
        >保存</Button>
        <Button
          type="primary"
          :loading="submitLoadding"
          @click="subNeed()"
        >提交需求</Button>
      </ButtonGroup>
      </Col>
    </Row>
    <commonAssigned
      ref="commonAssigned"
      :productSubmitParams="productSubmitParams"
      @closeGetList="closeGetList"
    ></commonAssigned>
  </div>
</template>
<script>
import CommonMixin from "@/components/mixin/commonMixin";
import product from "../../../components/mixin/product";
import vSteps from "../common/steps";
import queryBaseInfo from "./queryBaseInfo"; // 基本信息
import attrView from "./attributes"; // 多属性
import gallery from "./gallery"; // 图片管理
import description from "./description"; // 产品描述
import commonInquiry from "./commonInquiry"; // 询价
import commonOperationLog from "./commonOperationLog"; // 操作日志
import commonSampling from "./commonSampling"; // 取样
import commonAssigned from "../../pds/stockUp/commonAssigned"; // 指派弹窗
import commonRepulse from "../../pds/stockUp/commonRepulse"; // 打回弹窗
import commonTransfer from "../../pds/stockUp/commonTransfer"; // 转交弹窗
import api from "@/api/api";
import otherInfo from "./otherInfo";

export default {
  name: "myList", // 新品开发
  props: ["isShowBtn", "sortChoseDate", "stepsDate", "open"],
  components: {
    otherInfo,
    vSteps,
    queryBaseInfo,
    attrView,
    gallery,
    description,
    commonAssigned,
    // eslint-disable-next-line vue/no-unused-components
    commonRepulse,
    // eslint-disable-next-line vue/no-unused-components
    commonTransfer,
    commonInquiry,
    commonOperationLog,
    commonSampling,
  },
  mixins: [CommonMixin, product],
  data() {
    return {
      saveLoadding: false,
      submitLoadding: false,
      createDemand: true,
      CreateProductVariParamVal: "",
      demandBoxIndex: 0, // 0 基本信息  1 多属性  2 图片信息  3详细描述
      productSubmitParams: {},
      formDate: {
        referenceUrl: "",
        productName: "",
        productType: "",
        saleChannel: "",
        station: "",
        estimatedPurchasePrice: "",
      },
      messageLen: [],
    };
  },
  created() {
    this.getCurrencyDropdownListMt();
    this.getCurrencyExchangeInfoMt();
  },
  mounted() {
    let v = this;
    // console.log(v.format('yyyy/MM/dd hh:mm:ss'));
    v.sortChoseDateMt(v.demandBoxIndex);
  },
  methods: {
    // 重置
    infoReload() {
      window.location.reload();
    },
    // 按钮切换
    sortChoseDateMt(data) {
      let v = this;
      v.sortChoseDate.forEach((item) => {
        item.selected = false;
      });
      v.sortChoseDate[data].selected = true;
    },
    collectChrome(param) {
      let v = this;
      if (param.content === "") {
        v.$Message.error("未采集到数据");
        return;
      }
      v.axios.post(api.post_collectData, param).then((response) => {
        if (response.code === 0) {
          v.fixCollectData(response.datas, param.url);
        }
      });
    },
    fixCollectData(data, url) {
      let v = this;
      v.$refs.queryBaseInfo.$refs.basicForm.resetFields();
      v.$refs.queryBaseInfo.baseInfoParam.referenceUrl = url;
      v.$refs.queryBaseInfo.baseInfoParam.productName = data.productName;
      v.$refs.queryBaseInfo.baseInfoParam.saleChannel = data.saleChannel;
      v.$refs.queryBaseInfo.stationlList = data.stationList;
      v.$refs.queryBaseInfo.baseInfoParam.station = data.station;
      v.$refs.queryBaseInfo.baseInfoParam.pictureUrl = data.viewImagePath;
      v.$refs.queryBaseInfo.$refs.basicForm.validateField("productName"); // 对产品名称进行校验
      // 多属性    attriButesRef
      v.attriButesRefMt(data.selectVariations);
      // 图片     gallery
      /**
       *
       *  pictureUrl:res.datas[0],
       productId:v.$store.state.createId,
       pictureType:0,  //图片类型（0橱窗图片，1详情图片）
       isAcquired:0    //是否采集而来(0否，1是)
       v.$refs.gallery.imgList1
       * */
      let imgList = [];
      data.galleryImageList.forEach((item) => {
        item.imageList.forEach((child) => {
          child.productId = v.$store.state.createId;
          imgList.push(child);
        });
      });
      v.$refs.gallery.imgList = imgList;
      // 描述信息  description;
      /**
       *
       description:""
       language:"ch"
       productId:"158369271247011840"
       title:"123213213"

       * */
      v.$refs.description.descriptionList.forEach((item) => {
        if (item.language === data.describeInfo.language) {
          item.description = data.describeInfo.description;
          item.title = data.describeInfo.title;
        }
      });
    },
    collectDataMt(url) {
      let v = this;
      v.$Spin.show({
        render: (h) => {
          return h("div", [
            h("Icon", {
              class: "demo-spin-icon-load",
              props: {
                type: "ios-loading",
                size: 18,
              },
            }),
            h("div", "数据采集中"),
            h("Icon", {
              class: "collectClose",
              nativeOn: {
                click: () => {
                  v.$Spin.hide();
                },
              },
              props: {
                type: "ios-close",
                size: 18,
              },
            }),
          ]);
        },
      });
      // 数据采集
      v.$axios
        .post(api.collectData, { url: url })
        .then((res) => {
          v.$Spin.hide();
          if (res.code === 0) {
            // 基本信息  queryBaseInfo
            let data = res.datas;
            v.fixCollectData(data, url);
            // v.$refs.attriButesRef.baseInfoParam.productName=data.productName;
          } else {
            v.$msg.error("采集失败");
          }
        })
        .catch(() => {
          v.$Spin.hide();
        });
    },
    gallery() {},
    attriButesRefMt(data) {
      let params = [];
      let v = this;
      data.forEach((item) => {
        params.push({
          productId: v.$store.state.createId,
          status: "Y",
          productVariType: {
            variTypeName: item.variTypeName,
          },
          variationList: item.variationList,
        });
      });
      v.$axios
        .post(api.createOrModifyVari, params)
        .then((res) => {
          if (res.code === 0) {
            v.$refs.attriButesRef.getVariList();
            v.$refs.attriButesRef.getQueryVariTypeM();
          }
        })
        .catch(() => {});
    },
    // 提交需求
    subNeed() {
      // 基本信息必填项
      this.submitLoadding = true;
      this.productSubmitMt().finally(() => {
        this.submitLoadding = false;
      });
    },
    // 提交事件 1：验证表单 2：提交数据 3：获取数据 4：根据获取数据提交数据
    productSubmitMt() {
      return new Promise((resolve, reject) => {
        let v = this;
        v.demandBoxIndex = 0;
        v.sortChoseDateMt(v.demandBoxIndex);

        v.$refs.queryBaseInfo
          .save()
          .then((data) => {
            v.$refs.gallery.save();
            v.$refs.description.save();
            data.sendType = 0;
            v.$axios
              .post(api.getNextTodoInfo, data)
              .then((res) => {
                resolve();
                if (res.code === 0) {
                  v.productSubmitParams = res.datas;
                  v.$emit("closeDe");
                  v.$refs.commonAssigned.operating = true;
                } else {
                  v.$msg.error({
                    content: "找不到流程接收人，请联系管理员进行流程配置",
                    duration: 5,
                  });
                }
              })
              .catch(() => {
                reject();
              });
          })
          .catch(() => {
            reject();
          });
      });
    },
    // 保存按钮
    savesBtn() {
      this.saveLoadding = true;
      this.saveSectionBtn()
        .then(() => {
          this.$msg.success("保存成功");
        })
        .finally(() => {
          this.saveLoadding = false;
        });
    },
    // 基本信息、多属性、图片信息、详细描述分接口保存
    async saveSectionBtn() {
      try {
        await this.$refs.gallery.save();
        await this.$refs.description.save();
        // await this.$refs.attriButesRef.save();
        await this.$refs.queryBaseInfo.draft();
      } catch (err) {
        return Promise.reject(err);
      }
    },
    closeGetList() {
      this.$emit("closeGetList");
    },
    choseDemand(index) {
      let v = this;
      v.demandBoxIndex = index;
      v.$store.commit("demandBoxIndex", index);

      if (index === 6) {
        v.$refs.commonOperationLog.getList();
      }
      if (index === 1) {
        v.$refs.attriButesRef.getVariList();
        v.$store.commit("editTalg", false);
      }
      if (v.$store.state.curNodeId !== 0 && v.$store.state.demandIsOpen) {
        // 除了创建流程 其他点击刷新
        if (index === 0) {
          v.$refs.queryBaseInfo.getQueryBaseInfoMe();
        } else if (index === 1) {
          // v.$refs.attriButesRef.getQueryVariTypeM().then(() => {
          //   v.$refs.attriButesRef.getVariList();
          // });
        } else if (index === 2) {
          // 设置主属性图片  （图片流程不刷新）
          if (
            v.$store.state.curNodeId === 6 &&
            v.$store.state.pictureCurNodeId === 1
          // eslint-disable-next-line no-empty
          ) {
          } else {
            v.$refs.gallery.getImg();
          }
        } else if (index === 3) {
          v.$refs.description.queryDescriptionMt((data) => {
            let lang = "EN";
            data.some((item) => {
              if (item.title !== "") {
                lang = item.language;
                return true;
              }
            });
            v.$refs.description.tabClick(lang);
          });
        } else if (index === 4) {
          v.$refs.commonInquiry.getList();
          v.$refs.commonInquiry.inquiryTab = "list";
          v.$store.commit("addSupplierType", "");
        } else if (index === 5) {
          v.$refs.commonSampling.getList();
        }
      } else {
        if (index === 3) {
          let lang = "EN";
          v.$refs.description.descriptionList.some((item) => {
            if (item.title !== "") {
              lang = item.language;
              return true;
            }
          });
          v.$refs.description.tabClick(lang);
        }
      }
    },
    fixAttributeDate(data) {
      let result = [];
      if (data.length <= 1) {
        result = data[0] || [];
      } else {
        data.forEach((item) => {
          let arr = [];
          if (result.length > 0) {
            result.forEach((resItem) => {
              item.forEach((child) => {
                arr.push(resItem + child);
              });
            });
            result = arr;
          } else {
            item.forEach((child) => {
              result.push(child);
            });
          }
        });
      }
      return result;
    },
  },
  watch: {
    "$store.state.demandIsOpen": function (old, n) {
      if (!n) {
        let v = this;
        if (v.sortChoseDate) {
          v.sortChoseDate.forEach((item) => {
            if (item.id === v.demandBoxIndex) {
              item.selected = true;
            } else {
              item.selected = false;
            }
          });
        }
      }
    },
  },
};
</script>

<style>
.collectClose {
  position: initial;
  right: 10px;
  top: 10px;
  z-index: 10;
  cursor: pointer;
}

.collectClose:hover {
  color: #007eff;
}

.demandForm .ivu-form-item {
  margin-bottom: 10px;
}

.ivu-form .ivu-form-item-label {
  width: 90px;
}

.errorTip .ivu-form-item-error-tip {
  left: 90px;
}

.normalTop .ivu-upload {
  right: 0 !important;
  top: 0 !important;
  left: auto !important;
  bottom: auto !important;
}

.ivu-upload-drag {
  border: 0;
}

.ivu-upload-drag:hover {
  border: 0;
}
</style>
<style scoped>
.demandItem {
  min-height: 450px;
}

.vStep {
  height: 100px;
  padding-top: 30px;
}

.resetBtn {
  display: block;
  float: none;
  width: 100px;
}

.demandBoxTit h3 {
  font-weight: 600;
  font-size: 16px;
  padding: 10px 0 10px 15px;
}

.demandBox {
  border: 1px solid #ddd;
  margin-left: 20px;
}

.saveBtn {
  float: right;
  margin: 10px;
}
</style>
