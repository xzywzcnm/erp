<template>
  <dyt-model :modalVisible.sync="modalVisible" @backList="backLists('back')" :pageLoading="pageLoading"
    class="qualityInspectionPage">
    <div slot="lefts">
      <Button type="primary" @click="processProblem" class="mr10" v-if="totalCheckBatchInfo.problemNumberSum > 0 ||
        totalCheckBatchInfo.acceptanceNumberSum > 0
        ">完成质检</Button>
      <Button @click="backLists('back')">取消</Button>
    </div>
    <div>
      <statusStep :stepsInfo="detailData" class="mb10 mt10 qualityTest" />
      <div>
        <div class="start-qualityInspect">
          <div class="start-qualityInspect__left">
            <Form class="formDetail start-qualityInspect__left__detail" :model="commodity" :label-width="70"
              @submit.native.prevent>
              <div class="fmb0">
                <div class="quality-relative">
                  <FormItem label="出库单:">
                    <div>{{ detailData.pickingNo }}</div>
                  </FormItem>
                </div>
                <FormItem label="商品条码:" class="large-label">
                  <Input v-model="commodity.barcode" placeholder="扫描商品SKU条码" size="large" ref="barcode"
                    @on-keyup.enter="scanSku"></Input>
                </FormItem>
              </div>
            </Form>
            <Table border :columns="columns" :data="tableList" class="mt10" @on-row-click="rowClickFun"
              :loading="tableLoading" maxHeight="650">
              <template slot-scope="{ row }" slot="productImage">
                <div class="picture-width">
                  <dyt-previewImg :url="row.productImage" :imgOption="{ width: 40, height: 40 }"></dyt-previewImg>
                </div>
              </template>
              <template slot-scope="{ row }" slot="goodsSku">
                <div>{{ row.sku || "" }}</div>
                <div>{{ row.barCode || "" }}</div>
              </template>
              <template slot-scope="{ row }" slot="checkRate">
                <span>{{ row.qualityCheckScale }}%</span>
              </template>
            </Table>
          </div>

          <div class="start-qualityInspect__right">
            <div class="start-qualityInspect__right_detail">
              <Form ref="formValidate" :label-width="90" class="formDetail form-width200 total-sku-detail">
                <div class="fmb8 fmlabel0" style="padding: 6px">
                  <Row>
                    <Col span="5">
                    <FormItem label="SKU:">
                      <div>{{ singleCheckBatchInfo.sku || "" }}</div>
                    </FormItem>
                    <FormItem label="重量(g):">
                      <div>{{ singleCheckBatchInfo.goodsWeight || 0 }}</div>
                    </FormItem>
                    </Col>
                    <Col span="5">
                    <FormItem label="SPU:">
                      <div>{{ singleCheckBatchInfo.spu || "" }}</div>
                    </FormItem>
                    <FormItem label="尺寸(cm):">
                      <div>
                        {{ singleCheckBatchInfo.length || 0 }} *
                        {{ singleCheckBatchInfo.width || 0 }} *
                        {{ singleCheckBatchInfo.height || 0 }}
                      </div>
                    </FormItem>
                    </Col>
                    <Col span="8">
                    <FormItem label="中文描述:">
                      <div>{{ singleCheckBatchInfo.cnName || "" }}</div>
                    </FormItem>
                    <FormItem label="开发员:">
                      <div v-if="personnelRoleTypeList[
                        singleCheckBatchInfo.productDeveloperUserId
                      ]
                        ">
                        {{
                          personnelRoleTypeList[
                            singleCheckBatchInfo.productDeveloperUserId
                          ].userName || ""
                        }}
                      </div>
                    </FormItem>
                    </Col>
                    <Col span="6">
                    <FormItem label="规格:">
                      <div>
                        {{ singleCheckBatchInfo.goodsAttributes || "" }}
                      </div>
                    </FormItem>
                    </Col>
                  </Row>
                  <!-- 总质检数 -->
                  <Row>
                    <Col span="5">
                    <FormItem label="下单总数:">
                      <div>
                        {{ totalCheckBatchInfo.expectedNumberSum || 0 }}
                      </div>
                    </FormItem>
                    <FormItem label="已检合格总数:">
                      <div>
                        {{ totalCheckBatchInfo.acceptanceNumberSum || 0 }}
                      </div>
                    </FormItem>
                    </Col>
                    <Col span="5">
                    <FormItem label="质检总数:">
                      <div>
                        {{ totalCheckBatchInfo.qualityCheckNumberSum || 0 }}
                      </div>
                    </FormItem>
                    <FormItem label="已检问题总数:">
                      <div>
                        {{ totalCheckBatchInfo.problemNumberSum || 0 }}
                      </div>
                    </FormItem>
                    </Col>
                    <Col span="8">
                    <FormItem label="质检比例:">
                      <div>{{ totalCheckBatchInfo.qualityCheckScale }}%</div>
                    </FormItem>
                    <FormItem label="待检总数:">
                      <div>
                        {{ totalCheckBatchInfo.awaitCheckedNumberSum || 0 }}
                      </div>
                    </FormItem>
                    </Col>
                    <Col span="6">
                    <FormItem label="">
                      <div style="height: 20px"></div>
                    </FormItem>
                    <FormItem label="待应检总数:">
                      <div>
                        {{
                          totalCheckBatchInfo.awaitPlanCheckedNumberSum || 0
                        }}
                      </div>
                    </FormItem>
                    </Col>
                  </Row>
                </div>
              </Form>
            </div>

            <div class="has-quality">
              <div>
                下单数:
                <span>{{ singleCheckBatchInfo.expectedNumber || "" }}</span>
              </div>
              <div>
                质检数:
                <span>{{ singleCheckBatchInfo.qualityCheckNumber || 0 }}</span>
              </div>
              <div>
                质检比例:
                <span>{{ singleCheckBatchInfo.qualityCheckScale }} %</span>
              </div>
              <div>
                已检合格数:
                <span>{{ singleCheckBatchInfo.acceptanceNumber || 0 }}</span>
              </div>
              <div>
                已检问题数:
                <span>{{ singleCheckBatchInfo.problemNumber || 0 }}</span>
              </div>
            </div>

            <div class="quality-working mb10">
              <Form class="formDetail spinButton" :model="qualityResult" inline :showMessage="false" ref="qualityResult">
                <div class="form-content">
                  <div class="fmb0 form-flex">
                    <FormItem label="待检数:" :label-width="60">
                      <div class="red-text">
                        {{ singleCheckBatchInfo.awaitCheckedNumber || 0 }}
                      </div>
                    </FormItem>
                    <FormItem label="待应检数:" :label-width="70">
                      <div class="red-text">
                        {{ singleCheckBatchInfo.awaitPlanCheckedNumber || 0 }}
                      </div>
                    </FormItem>
                    <FormItem label="合格数:" :label-width="60" class="large-label">
                      <Input v-model="qualityResult.passCheckNumber" class="input60" size="large" type="number"
                        @on-change="passCheckNumberFun"></Input>
                    </FormItem>
                    <FormItem label="问题数:" :label-width="60" class="large-label">
                      <div class="question-num">
                        <span class="img-btn" @click="btnComputedFun('reduce')"><img :src="reduceImg" /></span>
                        <Input v-model="qualityResult.problemCheckNumber" class="input60 input-question" size="large"
                          type="number" @on-change="problemCheckNumberFun"></Input>
                        <span class="img-btn" @click="btnComputedFun('add')"><img :src="addImg" /></span>
                      </div>
                    </FormItem>
                    <!-- v-if="singleCheckBatchInfo.receiptBatchNo" -->
                    <div style="text-align: center">
                      <div class="linkText cursorClick ml10 mr10 report-question" @click="qualityReportFun">
                        质检问题报告
                      </div>
                      <div class="ashTips">快捷键：Pause Break</div>
                    </div>
                    <div class="question-sty">
                      <div>
                        <FormItem label="问题原因:" :label-width="70">
                          <div style="max-width: 260px">
                            {{
                              reportInfo.problemCheckReason &&
                              reportInfo.problemCheckReason.toString()
                            }}
                          </div>
                        </FormItem>
                      </div>
                      <FormItem label="问题图片:" :label-width="70">
                        <div v-if="reportInfo.fileList">
                          {{ reportInfo.fileList.length }}
                        </div>
                      </FormItem>
                    </div>
                  </div>
                  <Button type="primary" @click="submitQualityResult" :loading="submitLoading"
                    :disabled="!(singleCheckBatchInfo.awaitCheckedNumber > 0)">提交质检结果</Button>
                </div>
              </Form>
            </div>

            <div class="flexBox">
              <div class="block-sty mb10 testStandard">
                <div class="title">质检标准</div>
                <div class="contents paddSty" v-if="!$common.isEmpty(productQualityInfoVO)">
                  <Form ref="formValidate" :label-width="80" class="formDetail">
                    <div class="fmb0">
                      <FormItem :label="item.qualityProject + ':'" v-for="(
                          item, index
                        ) in productQualityInfoVO.qualityProjectVOList || []" :key="index + 'qualityProjectVOList'">
                        <div>{{ item.qualityDescription || "" }}</div>
                      </FormItem>
                    </div>
                  </Form>
                </div>
                <div class="empty-style" v-else>暂无数据</div>
              </div>
              <div class="block-sty mb10 waterLabel" v-if="productQualityInfoVO.washedLabel ||
                productQualityInfoVO.washedLabelPdfPath ||
                productQualityInfoVO.outerPackageRequirement
                ">
                <div class="title">水洗唛标准</div>
                <div class="waterLabel-contents" v-if="productQualityInfoVO.washedLabel">
                  <div class="waterLabe-label">水洗唛描述：</div>
                  <div class="waterLabel-item">
                    {{ productQualityInfoVO.washedLabel }}
                  </div>
                </div>
                <div class="waterLabel-contents" v-if="productQualityInfoVO.washedLabelPdfPath">
                  <div class="waterLabe-label" style="padding-top: 15px">
                    水洗唛(PDF/JPG/PNG)：
                  </div>
                  <div class="waterLabel-item">
                    <Poptip trigger="hover" placement="left">
                      <div class="washed-image-content">
                        <img :src="productQualityInfoVO.washedLabelPdfImagePath"
                          @click="previewWashedPdf(productQualityInfoVO.washedLabelPdfPath)" />
                        <Spin fix v-if="isWashedUploadLoading"></Spin>
                      </div>
                      <div class="washed-image-preview-content" slot="content">
                        <img :src="productQualityInfoVO.washedLabelPdfImagePath"
                          @click="previewWashedPdf(productQualityInfoVO.washedLabelPdfPath)" />
                      </div>
                    </Poptip>
                  </div>
                </div>
                <div class="waterLabel-contents" v-if="productQualityInfoVO.outerPackageRequirement">
                  <div class="waterLabe-label">生产要求：</div>
                  <div class="waterLabel-item">
                    {{ productQualityInfoVO.outerPackageRequirement }}
                  </div>
                </div>
              </div>
            </div>

            <div class="goods-detail">
              <div class="tabs-title">
                <div class="tabs-item tabs-itemAction" :class="{ tabsAction: tabActive == 1 }" @click="tabActive = 1">
                  图片
                </div>
                <div class="tabs-item" :class="{ tabsAction: tabActive == 2 }" @click="tabActive = 2">
                  商品描述
                </div>
              </div>
              <div class="tabs-content">
                <div class="tabs-content__pic" v-show="tabActive == 1">
                  <dyt-previewImg :fileList="fileList" :imgOption="{
                    listWidth: 90,
                    listHeight: 90,
                    mode: 'multiple',
                  }" v-if="fileList.length">
                  </dyt-previewImg>
                  <div class="empty-style" v-else>暂无数据</div>
                </div>
                <div class="tabs-content__desc" v-show="tabActive == 2">
                  <vue-ueditor-wrap v-model="singleCheckBatchInfo.description" :config="myConfig" ref="ueditor"
                    @ready="ueReady">
                  </vue-ueditor-wrap>
                </div>
              </div>
            </div>
            <Spin fix v-if="rightLoading"></Spin>
          </div>
        </div>
      </div>
    </div>
    <Spin size="large" fix v-if="beingCreateBoxing">
      出库单完成质检中，请耐心等待...
    </Spin>
    <!-- 质检问题报告 -->
    <quality-report :modelVisible.sync="reportVisible"
      :qualityInspectionStandard="productQualityInfoVO.qualityProjectVOList" @getReportInfo="getReportInfo"
      ref="qualityReport" />
    <!-- 问题件 -->
    <!-- <qualityProblemProducts
      :modelVisible.sync="problemInfo.visible"
      :modalData="detailData"
      :totalCheckBatchInfo="totalCheckBatchInfo"
      :type="2"
      @backReturnList="backLists"
    /> -->
  </dyt-model>
</template>
<script>
import Big from "big.js";
import api from "@/api/api";
import regular from "@/utils/regular.js";
import statusStep from "./statusStep";
import qualityReport from "@/views/wms/qualityManage/components/qualityReport.vue";
import VueUeditorWrap from "vue-ueditor-wrap"; // ES6 Module//引入VueUeditorWrap组件
// import qualityProblemProducts from "./qualityProblemProducts";
export default {
  name: "qualityInspection",
  components: {
    statusStep,
    qualityReport,
    VueUeditorWrap,
    // qualityProblemProducts,
  },
  props: {
    detailData: {
      // 列表页某一行数据
      type: Object,
      default: () => {
        return {};
      },
    },
    dialogVisible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      beingCreateBoxing: false,
      modalVisible: false,
      pageLoading: false,
      commodity: {
        barcode: "", // 商品条码
      },
      qualityResult: {
        passCheckNumber: 0,
        problemCheckNumber: 0,
      }, // 质检结果
      columns: [
        {
          title: "图片",
          key: "productImage",
          slot: "productImage",
          align: "center",
          width: 70,
        },
        {
          title: "SKU/条码编码",
          key: "goodsSku",
          slot: "goodsSku",
          align: "center",
          minWidth: 100,
        },
        {
          title: "下单",
          key: "expectedNumber",
          align: "center",
          width: 62,
        },
        {
          title: "待检",
          key: "awaitCheckedNumber",
          align: "center",
          width: 62,
        },
        {
          title: "质检比例",
          key: "checkRate",
          slot: "checkRate",
          align: "center",
          width: 90,
        },
        {
          title: "待应捡",
          key: "awaitPlanCheckedNumber",
          align: "center",
          width: 80,
        },
      ],
      tableLoading: false, // 表格加载
      tableList: [],
      reduceImg: require("@/assets/images/reduce.png"),
      addImg: require("@/assets/images/add.png"),
      tabActive: 1,
      reportVisible: false, // 质检问题报告弹框
      cellClassNameTemp: {}, // cellClassName 表格每格
      myConfig: {
        UEDITOR_HOME_URL: "./static/ueditor/", // 你的UEditor资源存放的路径,相对于打包后的index.html
        autoHeightEnabled: false, // 编辑器是否自动被内容撑高
        autoFloatEnabled: false, // 工具栏是否可以浮动
        initialFrameHeight: 300, // 初始容器高度
        initialFrameWidth: "100%", // 初始容器高度
        serverUrl: api.ueditorEnter,
        enableAutoSave: false, // 自动保存
        scaleEnabled: true, // 设置自动调整高度
        zIndex: 999,
      }, // 富文本配置
      submitLoading: false, // 提交质检结果加载
      totalCheckBatchInfo: {}, // 当前批次总信息(右边质检详情数据)
      singleCheckBatchInfo: {}, // 当前批次信息
      rowTabData: {}, // 表格选中某一行的数据（用来对比是否要刷新右边详情数据）
      reportInfo: {}, // 质检问题报告
      rightLoading: false, // 右侧加载
      codeInfo: {
        // 存放编码修改
        data: {},
        modelVisible: false,
      },
      questionInfo: {
        // 打印问题清单
        data: [],
        modelVisible: false,
      },
      // problemInfo: {
      //   //质检问题产品详情
      //   visible: false,
      // },
      productQualityInfoVO: {},
      fileList: [],
      isWashedUploadLoading: false,
      contentEdit: false,
      personnelRoleTypeList: {},
    };
  },
  watch: {
    dialogVisible: {
      handler(nval, oval) {
        nval && this.open();
      },
      deep: true,
    },
    modalVisible: {
      handler(nval, oval) {
        !nval && this.$emit("update:dialogVisible", nval);
      },
      deep: true,
    },
  },
  deactivated() {
    window.removeEventListener("keydown", this.controlFun);
  },
  methods: {
    // PDF文件预览
    previewWashedPdf(path) {
      if (this.$common.isEmpty(path)) return;
      const suffix = path.substring(path.lastIndexOf('.'), path.length);
      if (suffix.toLocaleLowerCase() == '.pdf') {
        this.axios.get(`./filenode/s${path}`, { responseType: "blob" }).then((res) => {
          this.$common.blobToBase64(res.data || res.resData).then((data) => {
            const fileBold = this.$common.base64ToBlob(data, "application/pdf");
            this.$common.previewFile(fileBold);
          });
        });
      } else {
        window.open(`./filenode/s${path}`);
      }
    },
    // pdf转图片
    transferImg(path, loading) {
      return new Promise((resolve) => {
        if (!path) {
          resolve("");
          return;
        }
        this[loading] = true;
        const suffix = path.substring(path.lastIndexOf('.'), path.length);
        if (suffix.toLocaleLowerCase() == '.pdf') {
          this.$common.getPdfRes({
            pdfUrl: `./filenode/s${path}`,
            pageNumber: 1,
            scale: 10,
          }).then((img) => {
            resolve(img);
          }).catch(() => {
            resolve("");
          }).finally(() => {
            this[loading] = false;
          });
        } else {
          resolve(`./filenode/s${path}`);
          this[loading] = false;
        }
      });
    },
    // 窗口打开
    open() {
      this.modalVisible = true;
      this.contentEdit = false;
      this.getUserInfo();
      this.keydownListerns(); // 添加键盘监听
      this.cellClassNameFun();
      this.resetData();
      this.getQualityInspectionBatch();
      this.getQualityDetail();
    },
    // 关闭窗口
    backLists(type) {
      this.modalVisible = false;
      if (!this.contentEdit && ["back"].includes(type)) return;
      this.$emit("backReturn", 111);
    },
    // 重置质检数据
    resetData() {
      this.commodity.barcode = "";
      this.tableList = [];
      this.reportVisible = false;
      this.rowTabData = {};
      this.totalCheckBatchInfo = {};
      this.resetRowData();
    },
    // 清空选中批次数据
    resetRowData() {
      this.tabActive = 1;
      this.fileList = [];
      this.singleCheckBatchInfo = {};
      this.productQualityInfoVO = {};
      this.qualityResult.passCheckNumber = 0;
      this.qualityResult.problemCheckNumber = 0;
      this.reportInfo = {};
      this.rightLoading = false;
      this.submitLoading = false;
    },
    // 查询当前所有质检批次
    getQualityInspectionBatch() {
      let { pickingId } = this.detailData;
      this.tableLoading = true;
      return this.axios
        .post(api.fullManage_getCheckBatch, { pickingId })
        .then(async ({ data }) => {
          if (data.code !== 0) return;
          let list = data.datas || [];
          this.tableList = list.map((k) => {
            k.qualityCheckScale = new Big(k.qualityCheckScale || 0).times(100) - 0;
            return k;
          });
          this.$refs.barcode && this.$refs.barcode.focus();

          // 恢复上一次选中记录
          let rowTabData = this.rowTabData || {};
          if (JSON.stringify(rowTabData) === "{}") return;
          let checkedIndex = null;
          list.forEach((k, i) => {
            k.productGoodsId === rowTabData.productGoodsId &&
              (checkedIndex = i);
          });
          this.rowClickFun(list[checkedIndex] || {}, checkedIndex);
        })
        .finally(() => {
          this.tableLoading = false;
        });
    },
    // 查询当前入库单SKU总信息
    getQualityDetail() {
      return new Promise((resolve) => {
        let { pickingId } = this.detailData;
        this.axios
          .post(api.fullManage_getCheckBatchSum, { pickingId })
          .then(({ data }) => {
            resolve();
            if (data.code !== 0) return;
            let temps = data.datas || {};
            temps.qualityCheckScale = new Big(temps.qualityCheckScale || 0).times(100) - 0;
            this.totalCheckBatchInfo = temps;
            this.finishQuality();
          })
          .catch(resolve());
      });
    },
    // 查询选中批次信息
    getCheckBatchInfo(batchInfo) {
      this.rightLoading = true;
      let params = {
        pickingId: this.detailData.pickingId, // 出库单id
        productGoodsId: batchInfo.productGoodsId || "", // 商品id
      };
      this.axios
        .post(api.fullManage_getCheckBatchInfo, params)
        .then(({ data }) => {
          if (data.code !== 0) return;
          let _self = this;
          let singleInfo = data.datas || {};
          let func = {
            handleZero(val) {
              return Number(Number(val).toFixed(2));
            },
            // 处理数据
            handleSingleInfo() {
              // // 质检数
              // singleInfo.checkedNumber = Math.round(
              //   new Big(singleInfo.expectedNumber || 0).times(
              //     singleInfo.qualityCheckScale || 0
              //   )
              // );
              singleInfo.goodsWeight = this.handleZero(singleInfo.goodsWeight);
              singleInfo.length = this.handleZero(singleInfo.length);
              singleInfo.width = this.handleZero(singleInfo.width);
              singleInfo.height = this.handleZero(singleInfo.height);
              // 详情没有返回数据
              singleInfo = _self.$common.copy(
                Object.assign(singleInfo, _self.rowTabData)
              );
            },
            // 文本值
            numberInput() {
              _self.qualityResult.passCheckNumber = singleInfo.awaitCheckedNumber || 0; // 合格数默认为：待检数
              _self.qualityResult.problemCheckNumber = 0; // 问题数默认为：0
            },
            // 水洗唛信息
            async washedInfo() {
              let data = singleInfo.productQualityInfoVO || {};
              data.washedLabelPdfImagePath = await _self.transferImg(
                data.washedLabelPdfPath,
                "isWashedUploadLoading"
              );
              _self.productQualityInfoVO = data;
            },
            // 商品图片信息
            productInfo() {
              if (!_self.$common.isEmpty(singleInfo.selfUseSizeImagePath)) {
                singleInfo.productGoodsImageList = [
                  singleInfo.selfUseSizeImagePath,
                  ...(singleInfo.productGoodsImageList || []),
                ];
              }
              // 处理图片
              let productGoodsImageList = (
                singleInfo.productGoodsImageList || []
              ).map((k) => {
                return { url: k };
              });
              _self.fileList = productGoodsImageList;
            },
          };
          func.handleSingleInfo();
          func.numberInput();
          func.washedInfo();
          func.productInfo();
          this.singleCheckBatchInfo = singleInfo;
        })
        .finally(() => {
          this.rightLoading = false;
        });
    },
    // 质检问题报告
    qualityReportFun() {
      this.reportVisible = true;
    },
    // 提交质检结果
    submitQualityResult() {
      this.$refs["qualityResult"].validate((valid) => {
        if (!valid) return false;
        this.submitLoading = true;
        // 先上传图片再上传质检结果
        this.uploadImg().then((picList) => {
          let { pickingId } = this.detailData;
          let [qualityResult, reportInfo, singleCheckBatchInfo] = [
            this.qualityResult,
            this.reportInfo,
            this.singleCheckBatchInfo,
          ];

          let params = {};
          params.pickingId = pickingId;
          params.qualityCheckId = singleCheckBatchInfo.qualityCheckId;
          // 合格/问题数
          params.acceptanceNumber = qualityResult.passCheckNumber;
          params.problemNumber = qualityResult.problemCheckNumber;
          // 质检问题
          params.reason =
            reportInfo.problemCheckReason &&
            reportInfo.problemCheckReason.toString();
          params.remark = reportInfo.remark;
          params.checkAttachment = picList;
          // console.log(params);
          this.axios
            .post(api.fullManage_submitCheckResult, params)
            .then(({ data }) => {
              if (data.code !== 0) return;
              this.$Message.success("操作成功~");
              this.getQualityInspectionBatch();
              this.getQualityDetail();
              this.resetRowData();
              this.contentEdit = true;
            })
            .finally(() => {
              this.submitLoading = false;
            });
        });
      });
    },
    // 上传要质检的图谱按
    uploadImg() {
      return new Promise((resolve, reject) => {
        let fileList = this.reportInfo.fileList || [];
        if (!fileList.length) return resolve("");
        let formData = new FormData();
        fileList.forEach((k) => {
          formData.append("files", k.file);
        });
        this.axios
          .post(api.upload_Img, formData)
          .then(({ data }) => {
            if (!(data && data.code === 0)) return resolve("");
            resolve(data.datas);
          })
          .catch(() => {
            resolve("");
          });
      });
    },
    // 取表格字段生成表格高亮需要的数据
    cellClassNameFun() {
      let columnsArr = this.columns.map((k) => {
        return k.key || k.slot;
      });
      let obj = {};
      columnsArr.forEach((k) => {
        if (k in obj || !k) return;
        obj[k] = "table-info-column-hightLine";
      });
      this.cellClassNameTemp = obj;
    },
    // 表格行点击
    rowClickFun(row, index) {
      let data = {};
      this.tableList.forEach((k, i) => {
        if (index === i) {
          this.$set(this.tableList[i], "cellClassName", this.cellClassNameTemp);
          data = k;
        } else {
          delete this.tableList[i].cellClassName;
        }
      });
      if (JSON.stringify(this.rowTabData) === JSON.stringify(data)) return;
      this.rowTabData = this.$common.copy(data);
      this.resetRowData(); // 清空右侧数据
      if (JSON.stringify(data) === "{}") return;
      this.getCheckBatchInfo(data);
    },
    // 富文本加载完毕
    ueReady(editorInstance) {
      this.$nextTick(() => {
        editorInstance.setDisabled("fullscreen"); // 不可编辑
      });
    },
    // 加/减
    btnComputedFun(type) {
      let singleCheckBatchInfo = this.singleCheckBatchInfo || {};
      let { problemCheckNumber, passCheckNumber } = this.qualityResult;
      if (
        problemCheckNumber === "" ||
        problemCheckNumber === undefined ||
        problemCheckNumber === null
      ) { return false; }
      if (!regular.integerZero.test(problemCheckNumber)) return false;
      if (type == "reduce") {
        let surplusNum = Number(
          new Big(singleCheckBatchInfo.awaitCheckedNumber || 0).minus(
            passCheckNumber || 0
          )
        );
        // 问题数不能超过：待检数-合格数
        if (surplusNum <= 0 || problemCheckNumber <= 0) return false;
        this.qualityResult.problemCheckNumber--;
        this.qualityResult.passCheckNumber++;
      } else {
        // 问题数不能超过：合格数
        if (passCheckNumber <= 0) return false;
        this.qualityResult.problemCheckNumber++;
        this.qualityResult.passCheckNumber--; // 合格数相对应减1，直至0
      }
    },
    // 合格数输入
    passCheckNumberFun() {
      let num = String(this.qualityResult.passCheckNumber);
      let result = num;
      if (num !== "" && num.replace(/\d/g, "") != "") {
        result = num.replace(/\D/g, "");
      }
      if (result === "") result = 0;
      let awaitCheckedNumber = this.singleCheckBatchInfo.awaitCheckedNumber || 0;
      // 合格数 不超过 待检数
      if (result >= awaitCheckedNumber) result = awaitCheckedNumber;
      // 问题数变化：质检数 - 合格数 < 原问题数
      let problemSurplusNum = Number(
        new Big(awaitCheckedNumber || 0).minus(result)
      );
      // 是否超出问题数
      let problemResult = Number(
        new Big(problemSurplusNum).minus(this.qualityResult.problemCheckNumber)
      );
      if (problemResult < 0) {
        this.$nextTick(() => {
          // 问题数=质检数-合格数
          this.qualityResult.problemCheckNumber = problemSurplusNum;
        });
      }
      this.$nextTick(() => {
        this.qualityResult.passCheckNumber = Number(result);
      });
    },
    // 问题数输入
    problemCheckNumberFun() {
      let num = String(this.qualityResult.problemCheckNumber);
      let result = num;
      if (num !== "" && num.replace(/\d/g, "") != "") {
        result = num.replace(/\D/g, "");
      }
      if (result === "") result = 0;
      let awaitCheckedNumber = this.singleCheckBatchInfo.awaitCheckedNumber || 0;
      // 问题数 不超过 待检数
      if (result >= awaitCheckedNumber) result = awaitCheckedNumber;
      // 合格数变化：质检数 - 问题数 < 原合格数
      let passSurplusNum = Number(
        new Big(awaitCheckedNumber || 0).minus(result)
      );
      // 是否超出合格数
      let passResult = Number(
        new Big(passSurplusNum).minus(this.qualityResult.passCheckNumber)
      );
      if (passResult < 0) {
        this.$nextTick(() => {
          // 合格数=质检数-问题数
          this.qualityResult.passCheckNumber = passSurplusNum;
        });
      }
      this.$nextTick(() => {
        this.qualityResult.problemCheckNumber = Number(result);
      });
    },
    // 扫描商品条码
    scanSku() {
      let sku = this.commodity.barcode;
      let list = this.tableList || [];
      if (!sku) return this.$Message.error("内容不能为空~");
      if (!list.length) return this.$Message.error("质检列表内容为空~");
      let index = null;
      list.forEach((k, i) => {
        if (
          (this.$common.isEmpty(index) && sku === k.barCode) ||
          sku === k.sku
        ) {
          index = i;
        }
      });
      this.commodity.barcode = "";
      if (this.$common.isEmpty(index)) {
        this.$Message.error("当前出库单没有搜索到SKU商品信息");
        return;
      }
      this.$refs.barcode.focus();
      this.rowClickFun(this.tableList[index] || {}, index);
    },
    // 拿取质检问题报告数据
    getReportInfo(data) {
      this.reportInfo = data;
    },
    // Control 键监听事件
    keydownListerns() {
      window.addEventListener("keydown", this.controlFun);
      this.$once("hook:beforeDestory", () => {
        window.removeEventListener("keydown", this.controlFun);
      });
    },
    // 控制质检报告打开页面和触发摄像头拍摄动作
    controlFun(e) {
      // space
      if (e && e.keyCode == 32 && this.reportVisible) {
        let nodeName = e.target.nodeName;
        nodeName == "BODY" &&
          this.$refs.qualityReport &&
          this.$refs.qualityReport.takePicture();
      }
      // Pause
      if (e && e.keyCode == 19 && JSON.stringify(this.rowTabData) != "{}") { this.qualityReportFun(); }
    },
    // 问题件处理
    processProblem() {
      // this.problemInfo.visible = true;
      let { pickingNo, pickingId } = this.detailData;
      this.$Modal.confirm({
        width: 500,
        title: "操作提示",
        content: `确认是否完成出库单的质检工作：<span style="color:#FF9900;">${pickingNo}</span>`,
        loading: true,
        onOk: () => {
          this.axios
            .post(`${api.fullManage_finishQualityCheck}${pickingId}`)
            .then((res) => {
              if (res.data.code === 0) {
                this.$Message.success("操作成功");
                this.backLists();
              }
            })
            .finally(() => {
              this.$Modal.remove();
            });
        },
      });
    },
    // 提交质检结果后，进行“自动完成质检的”判定： 当出库单的总“待检数”为0，则出库单自动完成质检
    finishQuality() {
      let temp = this.totalCheckBatchInfo;
      if (!(temp.awaitCheckedNumberSum <= 0)) return;
      let { pickingId } = this.detailData;
      this.beingCreateBoxing = true;
      this.axios
        .post(api.fullManage_finishQualityCheck + pickingId)
        .then((res) => {
          if (res.data.code === 0) {
            this.$Message.success("质检完成~");
            this.backLists();
          }
        })
        .finally(() => {
          this.beingCreateBoxing = false;
        });
    },
    // 获取开发人员列表
    getUserInfo() {
      this.axios
        .get(api.query_allDeveloper, { hiddenError: true })
        .then((res) => {
          if (res.data.code == 0 && res.data.datas) {
            let newList = {};
            res.data.datas.forEach((item) => {
              newList[item.userId] = item;
            });
            this.personnelRoleTypeList = newList;
          }
        });
    },
  },
};
</script>
<style lang="less">
.qualityInspectionPage {
  .start-qualityInspect {
    display: flex;
    align-items: flex-start;

    .start-qualityInspect__left {
      width: 480px;
      margin-right: 10px;

      .start-qualityInspect__left__detail {
        padding: 10px;
        border: 1px solid rgb(228 228 228);
      }

      .quality-relative {
        position: relative;
        padding-right: 80px;
      }

      .quality-finish {
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
      }
    }

    .start-qualityInspect__right {
      position: relative;
      flex: 1;

      .quality-working {
        padding: 6px;
        background-color: rgba(237, 255, 243, 1);
        box-sizing: border-box;
        border: 1px solid rgba(140, 230, 176, 1);

        .form-flex,
        .form-content {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
        }

        .form-content {
          justify-content: space-between;
        }

        .form-flex {
          flex: 1;
        }

        .input60 {
          width: 70px;
          font-size: 0;

          .ivu-input {
            font-size: 16px;
            font-weight: bold;
          }
        }

        .input-question {
          width: 50px;
          margin: 0 6px;
        }

        .question-num {
          display: flex;
          align-items: center;
        }

        .img-btn {
          display: inline-block;
          width: 22px;
          height: 22px;
          cursor: pointer;

          img {
            vertical-align: top;
            width: 100%;
            height: 100%;
          }
        }

        .question-sty {
          .ivu-form-item-label {
            padding: 4px 12px 4px 0;
          }

          .ivu-form-item-content {
            line-height: 20px;
          }
        }

        // .large-label {
        //   .ivu-form-item-label {
        //     padding: 14px 12px 14px 0;
        //   }
        // }

        .report-question {
          padding: 0 20px;
        }

        .red-text {
          color: #ff0000;
        }
      }

      .start-qualityInspect__right_detail {
        .total-sku-detail {
          border: 1px solid rgb(228 228 228);
        }
      }

      .goods-detail {
        border: 1px solid #dcdee2;

        .tabs-title {
          display: flex;
          align-items: center;
          background-color: rgba(242, 242, 242, 1);
          border-bottom: 1px solid #dcdee2;

          .tabs-item {
            width: 90px;
            height: 36px;
            line-height: 36px;
            text-align: center;
            border-right: 1px solid #dcdee2;
            cursor: pointer;
          }

          .tabsAction {
            background-color: rgba(201, 201, 201, 1);
          }
        }

        .tabs-content {
          // .tabs-content__pic {}

          .tabs-content__desc {
            padding: 10px;
          }
        }
      }
    }
  }

  .table-info-column-hightLine {
    background-color: #2db7f5ab;
  }

  .large-label {
    .ivu-form-item-label {
      padding: 14px 12px 14px 0;
    }
  }

  .form-width200 {
    .ivu-form-item-content {
      >div {
        word-break: break-all;
      }
    }
  }

  .has-quality {
    margin: 10px 0;
    padding: 6px 10px;
    border: 1px solid rgb(228 228 228);
    display: flex;
    align-items: center;

    span {
      display: inline-block;
      word-break: break-all;
      min-width: 60px;
      margin-right: 20px;
    }

    .sku-width {
      min-width: 170px;
    }
  }

  .block-sty {
    border: 1px solid rgb(228 228 228);

    .title {
      padding: 6px 10px;
      background-color: #f2f2f2;
      border-bottom: 1px solid rgb(228 228 228);
    }

    .contents {
      padding: 10px;
    }
  }

  .paddSty {
    padding: 4px 10px;
  }

  .testStandard {
    flex: 1;
    overflow: hidden;
  }

  .waterLabel {
    width: 30%;
    min-width: 160px;
    overflow: hidden;

    .waterLabel-contents {
      display: flex;
      padding: 5px;

      .waterLabe-label {
        white-space: nowrap;
      }
    }
  }

  .washed-image-content {
    position: relative;
    width: 60px;
    height: 60px;
    box-shadow: 0 0 5px #ccc;
    border-radius: 5px;

    img {
      cursor: pointer;
      height: 100%;
      width: 100%;
    }
  }

  .washed-image-preview-content {
    position: relative;

    img {
      max-width: 400px;
      max-height: 400px;
      min-width: 100px;
    }
  }

  .qualityTest {
    background-color: #f2f2f2;

    .ivu-steps-item {

      .ivu-steps-head,
      .ivu-steps-title {
        background-color: #f2f2f2;
      }

      .ivu-steps-tail>i {
        background-color: #808695;
      }

      .ivu-steps-head,
      .ivu-steps-title,
      .ivu-steps-head-inner>.ivu-steps-icon,
      .ivu-steps-tail>i,
      .ivu-steps-content {
        color: #808695;
      }
    }
  }
}
</style>
