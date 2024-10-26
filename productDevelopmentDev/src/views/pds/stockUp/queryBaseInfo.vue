<!--
 * @Author: w
 * @Date: 2021-02-06 17:30:18
 * @LastEditors: w
 * @LastEditTime: 2021-02-06 18:25:09
-->
<template>
  <div>
    <Form ref="basicForm" :model="baseInfoParam" :rules="basicRuleValidate" class="rest baseInfo">
      <FormItem prop="referenceUrl">
        <span slot="label">参考链接:</span>
        <Input style="width: 300px" v-model.trim="baseInfoParam.referenceUrl" :maxlength="500" :disabled="
            $store.state.curNodeId !== 0 || $store.state.curNodeControl !== 999
          " />
        <!-- 需要采集的地址容器，插件将会从这个id的元素中读取地址去采集数据 -->
         <!-- eslint-disable vue/no-textarea-mustache -->
        <textarea style="display: none" id="dataConllectionUrl">{{ baseInfoParam.referenceUrl}}</textarea>
        <!-- 采集joom必须要的数据 -->
        <input style="display: none" id="joomApiToken" type="text" value="aMxCPqwvDGacKArED5dCBsGNxoDMgzM8" />
        <!-- 地址来源，pds-service代表新品开发系统 -->
        <input style="display: none" id="urlSource" type="text" value="pds-service" />
        <Button id="listingStartDataCollection" type="primary" @click.native="collectData()" v-if="
            $store.state.curNodeId === 0 && $store.state.curNodeControl === 999
          ">采集</Button>
        <Button type="primary" v-else @click="openUrl">打开</Button>
        <Poptip trigger="hover" content="目前支持的平台有：eBay、速卖通、Wish、1688、淘宝、天猫、阿里巴巴(国际站)、亚马逊、京东，Walmart，敦煌网，其他平台后续会陆续开放，敬请期待。">
          <Icon type="md-help-circle" size="20" style="vertical-align: middle; color: #f80"></Icon>
        </Poptip>
      </FormItem>
      <Row>
        <Col span="10">
        <FormItem prop="productName">
          <span class="redDot" slot="label">产品名称:</span>
          <Input class="ipt-wid" v-model.trim="baseInfoParam.productName" :maxlength="200" :disabled="
                $store.state.curNodeId !== 0 ||
                $store.state.curNodeControl !== 999
              " />
        </FormItem>
        </Col>
        <Col span="10">
        <FormItem prop="productType">
          <span class="redDot" slot="label">产品分类:</span>
          <span style="
                position: relative;
                display: inline-block;
                min-width: 1px;
                line-height: 20px;
                width: calc(100% - 120px);
              ">{{ productTypeName }}
            <Button :class="{
                  typeTop:
                    baseInfoParam.productType &&
                    baseInfoParam.productType.length > 0,
                }" class="productTypeBtn" type="primary" size="small" @click="showProcuct" v-show="
                  $store.state.curNodeId === 0 &&
                  $store.state.curNodeControl === 999
                ">
              <span v-if="baseInfoParam.productType">
                <span v-if="
                      baseInfoParam.productType &&
                      baseInfoParam.productType.length == 0
                    ">选择产品类型</span>
                <span v-else>重新选择</span>
              </span>
              <span v-else>选择产品类型</span>
            </Button>
          </span>
          <input type="hidden" class="fl" v-show="
                baseInfoParam.productType &&
                baseInfoParam.productType.length > 0
              " v-model="baseInfoParam.productType" :disabled="
                $store.state.curNodeId !== 0 ||
                $store.state.curNodeControl !== 999
              " :maxlength="36" />
        </FormItem>
        </Col>
        <Col span="4" style="">
        <div style="
              position: absolute;
              left: 0px;
              top: -80px;
              width: 100%;
              cursor: pointer;
              z-index: 2;
            ">
          <div style="width: 100%" v-if="$store.state.curNodeId === 0">
            <dytUpload
              ref="upload"
              type="drag"
              name="files"
              v-show="$store.state.curNodeControl === 999"
              :headers="headObj"
              :action="fileApi"
              :show-upload-list="false"
              :on-success="handleSuccess"
              :format="['jpg', 'jpeg', 'png', 'gif', 'bmp']"
              accept="image/*"
              :max-size="2048"
              :on-format-error="handleFormatError"
              :on-exceeded-size="handleMaxSize"
              style="
                  position: absolute;
                  top: -21px;
                  left: -0px;
                  width: 100%;
                  border-left: 1px solid #ddd;
                  border-bottom: 1px solid #ddd;
                "
            >
              <div v-if="
                    baseInfoParam.pictureUrl !== '' &&
                    baseInfoParam.pictureUrl !== null
                  ">
                <img :src="baseInfoParam.pictureUrl" style="width: 100%; max-height: 235px; object-fit: contain" />
                <p class="text1688" @click.stop="goPicrtureUrl(baseInfoParam.pictureUrl)">
                  1688同款开发
                </p>
              </div>
              <div v-else>
                <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
                <p>图片上传</p>
              </div>
              <!-- <Button  icon="ios-cloud-upload-outline">图片上传</Button>-->
              <div v-if="
                    fileList.length > 0 &&
                    fileList[fileList.length - 1].status !== 'finished'
                  ">
                <Progress v-if="fileList[fileList.length - 1].showProgress" :percent="fileList[fileList.length - 1].percentage" hide-info></Progress>
              </div>
            </dytUpload>
          </div>
          <div style="width: 100%" v-else>
            <img :src="baseInfoParam.pictureUrl" style="width: 100%; max-height: 235px; object-fit: contain" />
            <p class="text1688" @click="goPicrtureUrl(baseInfoParam.pictureUrl)">
              1688同款开发
            </p>
          </div>
        </div>
        </Col>
      </Row>
      <Row>
        <Col span="10">
        <FormItem prop="saleChannel">
          <span class="redDot" slot="label">平台:</span>
          <dyt-select class="ipt-wid" v-model="baseInfoParam.saleChannel" filterable @on-change="getQueryPlatformSiteInfo()" :disabled="
                $store.state.curNodeId !== 0 ||
                $store.state.curNodeControl !== 999
              ">
            <Option v-for="(item, index) in saleChannelList" :key="index" :value="item.platformId">{{ item.platformName }}</Option>
          </dyt-select>
        </FormItem>
        </Col>
        <Col span="10">
        <FormItem>
          <span slot="label">站点:</span>
          <dyt-select class="ipt-wid" v-model="baseInfoParam.station" filterable :disabled="
                $store.state.curNodeId !== 0 ||
                $store.state.curNodeControl !== 999
              ">
            <Option v-for="(item, index) in stationlList" :key="index" :value="item.siteId">{{ item.siteCnName }}</Option>
          </dyt-select>
        </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="10">
        <FormItem prop="expectedSellPrice">
          <span class="redDot" slot="label">预期售价:</span>
          <div class="ipt-wid clearfix">
            <Input style="width: 100px; float: left" v-model.trim="baseInfoParam.expectedSellPrice" :maxlength="22" :disabled="
                  $store.state.curNodeId !== 0 ||
                  $store.state.curNodeControl !== 999
                " />
            <dyt-select style="width: calc(100% - 110px); margin-left: 10px" v-model="baseInfoParam.sellPriceCurrency" @on-change="sellPriceCurrencyChange" filterable :disabled="
                  $store.state.curNodeId !== 0 ||
                  $store.state.curNodeControl !== 999
                ">
              <Option v-for="(item, index) in $store.state.currencyList" :key="index" :value="item.code">{{ item.name }}</Option>
            </dyt-select>
          </div>
        </FormItem>
        </Col>
        <Col span="10">
        <FormItem>
          <span slot="label">预计重量(g)</span>
          <div class="ipt-wid clearfix">
            <InputNumber style="width: calc(100%)" v-model="baseInfoParam.netWeight" :precision="0" :min="0" :max="1000000000" :disabled="
                  $store.state.curNodeId !== 0 ||
                  $store.state.curNodeControl !== 999
                "></InputNumber>
          </div>
        </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="10">
        <FormItem prop="profitRate">
          <span class="redDot" slot="label">销售利润率(%):</span>
          <div class="ipt-wid clearfix">
            <Input style="width: calc(100%)" v-model.trim="baseInfoParam.profitRate" :maxlength="20" :disabled="
                  $store.state.curNodeId !== 0 ||
                  $store.state.curNodeControl !== 999 ||
                  costDisabled
                " />
          </div>
        </FormItem>
        </Col>
        <Col span="10">
        <FormItem label="目标采购价:" prop="estimatedPurchasePrice">
          <div class="ipt-wid clearfix">
            <Input style="width: 100px" v-model.trim="baseInfoParam.estimatedPurchasePrice" :disabled="
                  $store.state.curNodeId !== 0 ||
                  $store.state.curNodeControl !== 999 ||
                  costDisabled
                " />
            <dyt-select style="width: calc(100% - 115px); margin-left: 10px" v-model="baseInfoParam.purchasePriceCurrency" :disabled="
                  $store.state.curNodeId !== 0 ||
                  $store.state.curNodeControl !== 999
                " filterable @on-change="sellValidateNub">
              <Option v-for="(item, index) in $store.state.currencyList" :key="index" :value="item.code">{{ item.name }}</Option>
            </dyt-select>
          </div>
        </FormItem>
        </Col>
        <Col span="3"><Button @click="openCalc">成本及费用设置</Button> </Col>
      </Row>
      <Row>
        <Col span="10">
        <FormItem label="附件:">
          <Row class="annex" v-show="$store.state.curNodeId === 0">
            <dytUpload ref="annex" :headers="headObj" :action="uploadUserFilesApi" name="files" :max-size="2048" accept=".xls, .xlsx, .jpg, .jpeg, .png, .gif, .bmp, .word, .txt, .zip ,.rar" :before-upload="handleBeforeUpload1" :on-success="handleSuccess1" :on-format-error="handleFormatError1" :on-exceeded-size="handleMaxSize1" :on-remove="handleRemove1">
              <Button icon="ios-cloud-upload-outline" :loading="uploadLoading" @click="handleUploadFile">上传文件</Button>
            </dytUpload>
          </Row>
          <Row style="margin-left: 120px">
            <div class="ivu-upload-list-file" v-if="file !== null">
              <Icon type="ios-stats"></Icon>
              <span @click="downFile(file.url)">{{ file.name }}</span>
              <Icon type="ios-close-empty" class="ivu-upload-list-remove" v-show="$store.state.curNodeId === 0" @click.native="handleRemove(file.url)"></Icon>
            </div>
          </Row>
        </FormItem>
        </Col>
      </Row>
      <div class="demandBoxTit">
        <h3>
          开发备注
          <Icon type="ios-add-circle-outline" @click="demandAdd" class="demandAdd"></Icon>
        </h3>
      </div>
      <Table class="remarks" :columns="remarkColumns" :data="productRemarkList" height="150"></Table>
    </Form>
    <pruductType ref="pruductType" @addProductType="addProductType"></pruductType>
    <!--新增备注-->
    <calc ref="calc" :platform="baseInfoParam.saleChannel" :epSellPrice="baseInfoParam.expectedSellPrice" :sellPriceCurrency="baseInfoParam.sellPriceCurrency" :curType="'created'" @setCost="setCost"></calc>
    <!--<oldcalc ref="oldcalc"></oldcalc>-->
    <Modal v-model="modalRemarks" width="360" title="新增备注" class="clearMarginAuto">
      <p slot="header" @mousedown="moveMt" class="moveHead">
        <span>新增备注</span>
      </p>
      <Input ref="addRerks" type="textarea" v-model.trim="addRemarkContent" autofocus="autofocus" :maxlength="200" />
      <div slot="footer">
        <Button type="text" @click="modalRemarks = false">取消</Button>
        <Button type="primary" @click="addRemarks" :loading="loadingBtn">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from "@/api/api";
import CommonMixin from "@/components/mixin/commonMixin";
import pruductType from "./productType";
import calc from "./costCalculation";

export default {
  name: "queryBaseInfo",
  mixins: [CommonMixin],
  components: {
    pruductType,
    calc,
  },
  data: function () {
    let v = this;
    return {
      costDisabled: false,
      downUrl: "",
      uploadLoading: false,
      progressPercent: 0,
      showProgress: false,
      showRemoveFile: false,
      file: null,
      tableData: [],
      tableTitle: [],
      tableLoading: false,
      isTure: false,
      loadingBtn: false,
      productTypeName: "",
      modalRemarks: false,
      saleChannelList: [],
      referImg: "",
      fileList: [],
      baseInfoParam: {
        productId: "",
        netWeight: 0,
        referenceUrl: "", // 参考链接
        productName: "", // 产品名称
        productType: "", // 产品分类
        saleChannel: "", // 渠道
        station: "", // 站点
        expectedSellPrice: "", // 预期售价
        sellPriceCurrency: "USD", // 售价单位
        profitRate: "", // 利润率%
        estimatedPurchasePrice: "", // 预期采购价
        purchasePriceCurrency: "CNY", // 采购价单位
        pictureUrl: "",
        fileUrl: "", // 附件url
        fileName: "", // 附件url
      },
      fromId: {
        fromNodeId: "", // 当前节点ID，必需
        flowInstanceId: "", // 流程实例ID，必需
        sendType: "", // 流程发送类别：0提交，1打回上级，2打回发起人，3转交，4作废
      },
      addRemarkContent: "", // 备注内容
      productRemarkList: [
        /* {
       createdBy:"",
       createTime: "",
       remarkContent: ""
       } */
      ],
      basicRuleValidate: {
        referenceUrl: [
          {
            message: "请输入正确的网址",
            trigger: "blur",
            type: "url",
          },
        ],
        productName: [
          {
            required: true,
            message: "产品名称不能为空",
            trigger: "blur",
          },
          {
            type: "string",
            max: 200,
            message: "产品名称最大长度为200",
            trigger: "blur",
          },
        ],
        productType: {
          required: true,
          message: "产品分类不能为空",
          trigger: "change",
        },
        estimatedPurchasePrice: {
          validator: v.validateNub,
          trigger: "blur",
        },
        saleChannel: {
          required: true,
          message: "渠道不能为空",
          trigger: "change",
        } /*   station: {required: true, message: '站点不能为空', trigger: 'change'}, */,
        expectedSellPrice: [
          {
            validator: v.validateExpectedSellPrice,
            trigger: "blur",
          },
        ],
        profitRate: {
          validator: v.validateProfitRate,
          trigger: "blur",
        },
      },
      remarkColumns: [
        {
          title: "创建人",
          key: "createdName",
        },
        {
          title: "创建时间",
          key: "createdTime",
          render (h, params) {
            if (params.row.createdTime === "") {
              return h("div", "");
            } else {
              return h(
                "div",
                {
                  attrs: {
                    title: v.getDataToLocalTime(
                      params.row.createdTime,
                      "fulltime"
                    ),
                  },
                },
                v.getDataToLocalTime(params.row.createdTime, "fulltime")
              );
            }
          },
        },
        {
          title: "备注",
          key: "remarkContent",
        },
        {
          title: "操作",
          key: "options",
          render: (h, params) => {
            return h(
              "Button",
              {
                type: "primary",
                on: {
                  click () {
                    v.DeletedRemarks(params);
                  },
                },
              },
              "删除"
            );
          },
        },
      ],
      stationlList: [], // 站点
      productName: [],
      collectForListing: null,
      chromeInit: false,
    };
  },
  mounted () {
    // this.getQueryBaseInfoMe();
    this.getCost();
    this.getSaleChannel();
    if (this.$refs.upload) {
      this.fileList = this.$refs.upload.fileList;
    }
  },
  methods: {
    setCost (obj) {
      this.costDisabled = true;
      this.baseInfoParam.estimatedPurchasePrice =
        obj.estimatedPurchasePriceAuto;
      this.baseInfoParam.profitRate = obj.profitRateType;
    },
    getCost () {
      let v = this;
      v.$axios
        .get(api.costDetail + "?productId=" + v.$store.state.createId)
        .then((response) => {
          if (response.code === 0 && response.datas) {
            v.costDisabled = true;
          } else {
            v.costDisabled = false;
          }
        });
    },
    collectForChrome () {
      let v = this;
      if (v.chromeInit) return;
      var platformId = v.judgePlatformId(v.baseInfoParam.referenceUrl);
      // eslint-disable-next-line no-undef
      if ($("#listingDataCollectoinUrlForChrome").val()) {
        // 判断是否装了采集插件，如果装了就直接走插件
        // eslint-disable-next-line no-undef
        $(document).on(
          "click",
          "#listingDataCollectoinUrlForChrome",
          function () {
            // 当前采集的地址
            v.chromeInit = true;
            if (platformId !== "1688" && platformId !== "ebay") {
              // eslint-disable-next-line no-undef
              var url = $("#listingDataCollectoinUrlForChrome").val();
              // 对应的采集回来的内容\
              v.$emit("collectChrome", {
                // eslint-disable-next-line no-undef
                content: $("#listingDataCollectoinDivForChrome").val(),
                url: url,
              });
            }
          }
        );
      } else {
        if (platformId !== "1688" && platformId !== "ebay") {
          this.$Modal.info({
            title: "温馨提示",
            render: (h) => {
              return h("div", {}, [
                h("p", "请安装LAPA采集插件进行采集！"),
                h("p", {}, [
                  h(
                    "a",
                    {
                      attrs: {
                        href:
                          "http://img2.tongtool.com/s/static/plugin/1.0.8/tongtool-dataCollection.crx",
                        // target: "_blank"
                      },
                      style: {
                        marginRight: "10px",
                      },
                    },
                    "下载插件"
                  ),
                  h(
                    "a",
                    {
                      attrs: {
                        href:
                          "http://help.tongtool.com/service.html?artId=360&&categoryId=194&&groupId=3",
                        target: "_blank",
                      },
                    },
                    "点击查看安装教程"
                  ),
                ]),
              ]);
            },
          });
        }
      }
    },
    downFile (url) {
      let v = this;
      if (url === this.downUrl) {
        v.$msg.error("文件已下载到本地");
      } else {
        v.$Spin.show();
        v.$axios
          .post(api.downloadUserFiles, [url])
          .then((res) => {
            v.$Spin.hide();
            if (res.code === 0) {
              window.location.href = res.datas;
            }
          })
          .catch(() => {
            v.$Spin.hide();
          });
      }
    },
    initUpload () {
      this.file = null;
      this.showProgress = false;
      this.loadingProgress = 0;
      this.tableData = [];
      this.tableTitle = [];
    },
    handleUploadFile () {
      this.initUpload();
    },
    handleRemove (url) {
      let v = this;
      v.isDelModal(() => {
        v.$axios
          .post(api.removeUserFile, {
            productId: v.$store.state.createId,
            fileUrl: url,
          })
          .then((res) => {
            if (res.code === 0) {
              v.$msg.success("删除成功");
              v.initUpload();
            }
          })
          .catch(() => { });
      });
    },
    handleBeforeUpload1 () {
      this.$refs.annex.clearFiles();
    },
    // 读取文件
    readFile (file) {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onloadstart = () => {
        this.uploadLoading = true;
        this.showProgress = true;
      };
      reader.onprogress = (e) => {
        this.progressPercent = Math.round((e.loaded / e.total) * 100);
      };
      reader.onerror = () => {
        // this.$msg.error('文件读取出错')
      };
      reader.onload = (e) => {
        // this.$Message.info('文件读取成功')
        const data = e.target.result;
        // eslint-disable-next-line no-undef
        const { header, results } = excel.read(data, "array");
        const tableTitle = header.map((item) => {
          return {
            title: item,
            key: item,
          };
        });
        this.tableData = results;
        this.tableTitle = tableTitle;
        this.uploadLoading = false;
        this.tableLoading = false;
        this.showRemoveFile = true;
      };
    },
    cccc () {
      let v = this;
      v.loadingBtn = true;
      setTimeout(() => {
        v.loadingBtn = false;
      }, 1000);
    },
    openOldCalc () {
      this.$refs.oldcalc.calcModal = true;
    },
    openCalc () {
      if (
        this.baseInfoParam.expectedSellPrice === "" ||
        this.baseInfoParam.expectedSellPrice === 0 ||
        this.baseInfoParam.saleChannel === "" ||
        this.baseInfoParam.saleChannel === null
      ) {
        this.$msg.error("请先填写预计售价和平台");
        return;
      }
      this.$refs.calc.calcModal = true;
    },
    handleSuccess (res) {
      let v = this;
      if (res.code === 0) {
        v.baseInfoParam.pictureUrl = res.datas[0];
      }
    },
    handleFormatError1 (file) {
      // let v = this;
      this.$Notice.warning({
        title: "上传文件格式有误",
        desc: "文件" + file.name + "格式错误, 请选择[xls,xlsx]",
      });
    },
    handleMaxSize1 (file) {
      this.$Notice.warning({
        title: "文件大小受限",
        desc: "文件" + file.name + "太大, 不能超过2M",
      });
    },
    handleRemove1 (file, fileList) {
      if (fileList.length === 0) {
        this.baseInfoParam.fileUrl = "";
        this.baseInfoParam.fileName = "";
      }
    },
    handleSuccess1 (res, file) {
      // let v = this;
      this.uploadLoading = false;
      if (res.code === 0) {
        this.baseInfoParam.fileUrl = res.datas[0];
        this.baseInfoParam.fileName = file.name;
        this.file = null;
        /* if(this.$refs.annex.fileList.length > 1){
         this.$refs.annex.fileList.splice(0,1)
         } */
      }
    },
    goPicrtureUrl (pic) {
      let v = this;
      const obj = {
        url:
          api.get_samePic +
          "?imgUrl=" +
          pic +
          "&productUrl=" +
          v.baseInfoParam.referenceUrl,
        type: "GET",
      };
      v.ajaxData(obj).then((response) => {
        window.open(response.datas);
      });
      // if (this.baseInfoParam.referenceUrl !== '' || this.baseInfoParam.pictureUrl !== '') {
      //   window.open('https://kj.1688.com/pdt_tongkuan.html?productUrl=' + v.baseInfoParam.referenceUrl);
      // }
    },
    openUrl () {
      window.open(this.baseInfoParam.referenceUrl);
    },
    showProcuct () {
      let v = this;
      v.$refs.pruductType.productTypeModel = true;
      v.$refs.pruductType.productName = [];
      this.$refs.pruductType.getProductTypeListMt();
    },
    addProductType (data) {
      let v = this;
      let names = [];
      v.productName = data;
      v.productName.forEach((item) => {
        names.push(item.name);
      });
      v.baseInfoParam.productType =
        v.productName[v.productName.length - 1].categoryId;
      v.productTypeName = names.join("/");
      setTimeout(() => {
        v.$refs.basicForm.validateField("productType");
      }, 30);
    },
    getQueryPlatformSiteInfo (callback) {
      // 获取站点
      let v = this;
      v.$axios
        .post(api.queryPlatformSiteInfo, {
          platformId: v.baseInfoParam.saleChannel,
        })
        .then((res) => {
          if (res.code === 0) {
            v.stationlList = res.datas;
            v.baseInfoParam.station = "";
            callback();
          }
        })
        .catch(() => { });
    },
    getSaleChannel () {
      // 获取渠道
      let v = this;
      v.$axios
        .post(api.queryPlatformInfo, {})
        .then((res) => {
          if (res.code === 0) {
            v.saleChannelList = res.datas;
          }
        })
        .catch(() => { });
    },
    collectData () {
      let v = this;
      // 采集
      if (!v.baseInfoParam.referenceUrl) {
        v.$Message.error("采集链接为空");
        return;
      }
      v.$refs.basicForm.validateField("referenceUrl", function (str) {
        if (str === "") {
          v.collectForChrome();
          v.getCollectData();
        }
      });
    },
    getCollectData () {
      let v = this;
      let platformId = v.judgePlatformId(v.baseInfoParam.referenceUrl);
      if (platformId === "1688" || platformId === "ebay") {
        v.$emit("collectDataMt", v.baseInfoParam.referenceUrl);
      }
    },
    validateProfitRate (rule, value, callback) {
      var reg = this.nubReg;
      // let v = this;
      if (value === "") {
        callback(new Error("利润率不能为空"));
      } else if (!reg.test(value)) {
        callback(new Error("利润率只能填写数字"));
      } else {
        callback();
      }
    },
    validateNub (rule, value, callback) {
      let v = this;
      var reg = this.nubReg;
      if (value === "" || value === null) {
        callback();
      } else if (!reg.test(value)) {
        callback(new Error("预期采购价只能填写数字"));
      } else if (
        v.baseInfoParam.purchasePriceCurrency === "" ||
        this.baseInfoParam.purchasePriceCurrency === null
      ) {
        callback(new Error("请选择采购价单位"));
      } else {
        callback();
      }
    },
    validateExpectedSellPrice (rule, value, callback) {
      var reg = this.nubReg;
      // let v = this;
      if (value === "" || value === null) {
        callback(new Error("预期售价不能为空"));
      } else if (!reg.test(value)) {
        callback(new Error("预期售价只能填写数字"));
      } else if (
        this.baseInfoParam.sellPriceCurrency === "" ||
        this.baseInfoParam.sellPriceCurrency === null
      ) {
        callback(new Error("请选择售价单位"));
      } else {
        callback();
      }
    },
    sellValidateNub () {
      let v = this;
      if (
        v.baseInfoParam.purchasePriceCurrency !== "" ||
        v.baseInfoParam.purchasePriceCurrency !== undefined ||
        v.baseInfoParam.purchasePriceCurrency != null
      ) {
        v.$refs.basicForm.validateField("estimatedPurchasePrice");
      }
    },
    sellPriceCurrencyChange () {
      let v = this;
      if (
        v.baseInfoParam.sellPriceCurrency !== "" ||
        v.baseInfoParam.sellPriceCurrency !== undefined ||
        v.baseInfoParam.sellPriceCurrency !== null
      ) {
        v.$refs.basicForm.validateField("expectedSellPrice");
      }
    },
    demandAdd () {
      this.modalRemarks = true;
      this.addRemarkContent = "";
    },
    // 新增备注
    addRemarks () {
      let v = this;
      v.loadingBtn = true;
      v.modalRemarks = false;
      setTimeout(() => {
        v.loadingBtn = false;
      }, 1000);
      if (v.productRemarkList === null) {
        v.productRemarkList = [];
      }
      if (v.addRemarkContent === "") {
        return;
      }
      let obj = {
        createdName: sessionStorage.getItem("userInfoName"),
        createdTime: "",
        addTalg: true,
        remarkContent: v.addRemarkContent,
        productId: v.$store.state.createId,
      };
      v.productRemarkList.push(obj);
      let productRemarkList = [];
      if (v.productRemarkList !== null) {
        v.productRemarkList.forEach((item) => {
          if (!item.remarkId) {
            productRemarkList.push(item);
          }
        });
      }
      if (v.$store.state.curNodeId !== 0) {
        v.$axios
          .post(api.saveBase, {
            productInfoResult: null,
            remarkResultList: productRemarkList,
          })
          .then((res) => {
            if (res.code === 0) {
              v.getQueryBaseInfoMe();
              v.modalRemarks = false;
              //  v.$msg.success('基本信息保存成功')
            } else {
              v.$msg.error("保存失败");
            }
          })
          .catch(() => {
            v.$msg.error("服务错误");
          });
      }
    },
    // 保存基本信息
    draft () {
      return new Promise((resolve) => {
        let v = this;
        let baseInfoParam = v.setNull(v.baseInfoParam);
        let productRemarkList = [];
        if (v.productRemarkList !== null) {
          v.productRemarkList.forEach((item) => {
            if (!item.remarkId) {
              productRemarkList.push(item);
            }
          });
        }
        if (productRemarkList.length === 0) {
          productRemarkList = null;
        }
        baseInfoParam.productId = v.$store.state.createId;
        if (
          baseInfoParam.referenceUrl !== "" &&
          baseInfoParam.referenceUrl !== null
        ) {
          baseInfoParam.referenceUrl = encodeURI(
            encodeURI(baseInfoParam.referenceUrl)
          );
        }
        v.$axios
          .post(api.saveBase, {
            productInfoResult: baseInfoParam,
            remarkResultList: productRemarkList,
          })
          .then((res) => {
            if (res.code !== 0) v.$msg.error("基本信息保存失败");
            // if (callback) {
            // callback({
            //   success: "保存成功",
            // });
            // } else {
            // v.$msg.success("基本信息保存成功");
            // }
            // } else {
            // v.$Spin.hide();
            // }
          })
          .finally(() => {
            resolve(); // v.$Spin.hide();
          });
      });
    },
    // 保存(提交时验证表单)
    save () {
      return new Promise((resolve, reject) => {
        let v = this;
        let baseInfoParam = v.setNull(v.baseInfoParam);
        let productRemarkList = [];
        if (v.productRemarkList !== null) {
          v.productRemarkList.forEach((item) => {
            if (!item.remarkId) {
              productRemarkList.push(item);
            }
          });
        }
        if (productRemarkList.length === 0) {
          productRemarkList = null;
        }
        baseInfoParam.productId = v.$store.state.createId;
        if (
          baseInfoParam.referenceUrl !== "" &&
          baseInfoParam.referenceUrl !== null
        ) {
          // eslint-disable-next-line no-self-assign
          baseInfoParam.referenceUrl = baseInfoParam.referenceUrl;
        }

        v.$refs.basicForm.validate((valid) => {
          if (valid) {
            // v.$Spin.show();
            v.$axios
              .post(api.saveBase, {
                productInfoResult: baseInfoParam,
                remarkResultList: productRemarkList,
              })
              .then((res) => {
                if (res.code === 0) {
                  v.getQueryBaseInfoMe(resolve, reject);
                } else {
                  v.$msg.error("保存失败");
                  reject();
                }
              })
              .catch(() => {
                reject();
              });
          } else {
            reject();
          }
        });
      });
    },
    // 获取基本信息
    getQueryBaseInfoMe (callback) {
      let v = this;
      v.$Spin.show();
      if (v.$store.state.createId !== "") {
        v.$axios
          .get(api.getQueryBaseInfo + "?productId=" + v.$store.state.createId)
          .then((res) => {
            if (res.code === 0) {
              v.$Spin.hide();
              v.baseInfoParam = Object.assign({}, res.datas.productInfoResult);
              v.$store.commit("baseInfo", v.baseInfoParam);
              v.$refs.annex.clearFiles(); // 清空文件
              v.$store.commit(
                "isCheckedSendErp",
                res.datas.productInfoResult.sendErpPicture
              );
              if (res.datas.flowInstanceList) {
                v.$store.commit("flowInstance", res.datas.flowInstanceList); // 流程信息
              }
              if (v.baseInfoParam.fileUrl) {
                v.file = {
                  name: v.baseInfoParam.fileName,
                  url: v.baseInfoParam.fileUrl
                };
              }
              if (res.datas.remarkResultList === null) {
                v.productRemarkList = [];
              } else {
                v.productRemarkList = res.datas.remarkResultList;
              }
              v.stationlList = [];
              v.productTypeName = res.datas.productInfoResult.productTypeName;
              v.baseInfoParam.productType =
                res.datas.productInfoResult.productType;
              v.fromId.flowInstanceId =
                res.datas.flowInstanceList[0].flowInstanceId;
              v.fromId.fromNodeId = res.datas.flowInstanceList[0].currentNodeId;
              if (v.baseInfoParam.expectedSellPrice !== null) {
                v.baseInfoParam.expectedSellPrice = v.baseInfoParam.expectedSellPrice.toFixed(
                  2
                );
              }
              if (v.baseInfoParam.profitRate !== null) {
                v.baseInfoParam.profitRate = v.baseInfoParam.profitRate.toFixed(
                  2
                );
              }
              if (v.baseInfoParam.estimatedPurchasePrice !== null) {
                v.baseInfoParam.estimatedPurchasePrice = v.baseInfoParam.estimatedPurchasePrice.toFixed(
                  2
                );
              }
              if (
                res.datas.productInfoResult.station !== undefined &&
                res.datas.productInfoResult.station !== null &&
                res.datas.productInfoResult.station !== ""
              ) {
                v.baseInfoParam.station = "";
                v.getQueryPlatformSiteInfo(function () {
                  v.baseInfoParam.station = res.datas.productInfoResult.station;
                });
              }
              callback && callback(v.fromId);
            } else {
              v.$Spin.hide();
              // v.$msg.error('基本信息获取失败');
            }
          })
          .catch(() => {
            v.$Spin.hide();
          });
      }
    },
    // 删除开发备注
    DeletedRemarks (data) {
      // 没有提交保存之前的删除
      if (data.row.addTalg) {
        this.productRemarkList.splice(data.index, 1);
        this.$msg.success("删除成功");
      } else {
        let userId = this.$store.state.erpConfig.userInfo.userId;
        if (data.row.createdBy === userId) {
          let query = {
            data: [data.row.remarkId],
          };
          this.$axios.delete(api.delete_Remark, query).then((res) => {
            if (res.code === 0) {
              this.getQueryBaseInfoMe();
              this.$msg.success("删除成功");
            }
          });
        } else {
          this.$msg.error("只有备注人能删除自己的备注");
        }
      }
    },
    reset () {
      let v = this;
      for (let key in v.baseInfoParam) {
        v.baseInfoParam[key] = "";
      }
    },
  },
  watch: {
    "$store.state.demandIsOpen": function (old, n) {
      if (!n) {
        this.$refs.basicForm.resetFields();
        this.getQueryBaseInfoMe();
      }
    },
  },
};
</script>

<style>
.baseInfo .ivu-form-item-label {
  width: 120px !important;
}

.baseInfo .ivu-form-item-error-tip {
  left: 120px !important;
}

.annex .ivu-upload-list {
  padding-left: 120px;
}
</style>

<style scoped>
.base-calc {
  font-size: 30px;
  margin-left: 8px;
  cursor: pointer;
  vertical-align: middle;
  z-index: 100;
}

.productTypeBtn {
  position: absolute;
  left: 0px;
  bottom: -6px;
  height: 22px;
}

.typeTop {
  bottom: -25px !important;
}

.text1688 {
  text-align: center;
  cursor: pointer;
  color: #2d8cf0;
}

.text1688:hover {
  text-decoration: underline;
}

.ipt-wid {
  display: inline-block;
  width: calc(100% - 130px);
}

.demandBoxTit h3 {
  font-weight: 600;
  font-size: 16px;
  padding: 10px 0 10px 15px;
}

.remarks {
  margin-left: 14px;
  margin-bottom: 30px;
  margin-right: 14px;
}

.remarks-list {
  border: 1px solid #ddd;
}

.remarks-item {
  padding: 10px;
  border-right: 1px solid #ddd;
}

.demandAdd {
  font-weight: bold;
  margin-left: 10px;
  cursor: pointer;
}
</style>
