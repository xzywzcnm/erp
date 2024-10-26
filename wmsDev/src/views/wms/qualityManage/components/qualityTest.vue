<template>
  <div class="qualityTest-page" :style="{ background: isScan ? '' : '#fff' }">
    <scan
      title="扫描或输入搜索：采购单、入库单、SKU"
      placeholder="支持通过入库单、采购单、快递单、退货跟踪号、SKU查询"
      @enter="scanning"
      class="qulity-scan"
      ref="scan"
      v-if="isScan"
    >
    </scan>

    <div class="start-qualityInspect" v-else>
      <div class="start-qualityInspect__left">
        <Form
          class="formDetail"
          :model="commodity"
          :label-width="70"
          @submit.native.prevent
        >
          <div class="fmb0">
            <div class="quality-relative">
              <FormItem label="采购单:">
                <div>{{ scanInfo.referenceNo }}</div>
              </FormItem>
              <FormItem label="入库单:">
                <div>{{ scanInfo.receiptNo }}</div>
              </FormItem>
              <Button class="quality-finish" @click="qualityFinishFun"
                >结束质检</Button
              >
            </div>
            <FormItem label="商品条码:" class="large-label">
              <Input
                v-model="commodity.barcode"
                placeholder="扫描商品SKU条码"
                size="large"
                @on-keyup.enter="scanSku"
                ref="barcode"
              ></Input>
            </FormItem>
          </div>
        </Form>
        <Table
          border
          :columns="columns"
          :data="tableList"
          class="mt10"
          @on-row-click="rowClickFun"
          :loading="tableLoading"
          maxHeight="650"
        >
          <template slot-scope="{ row }" slot="productImage">
            <div class="picture-width">
              <dyt-previewImg
                :url="row.productImage"
                :imgOption="{ width: 40, height: 40 }"
              ></dyt-previewImg>
            </div>
          </template>
          <template slot-scope="{ row }" slot="goodsSku">
            <div>{{ row.sku || "" }}</div>
            <div>{{ row.barCode || "" }}</div>
          </template>
          <template slot-scope="{ row }" slot="checkRate">
            <span>{{ row.checkRate || 0 }}%</span>
          </template>
        </Table>
      </div>
      <!-- 类型为维修 -->
      <div
        class="start-qualityInspect__right"
        v-if="
          singleCheckBatchInfo.qualityInspectionType ||
          scanInfo.qualityInspectionType
        "
      >
        <!-- 质检详情 :qualityInspectionStandard="qualityInspectionStandard" -->
        <common-quality-detail
          class="start-qualityInspect__right_detail"
          :totalCheckBatchInfo="totalCheckBatchInfo"
          :singleCheckBatchInfo="singleCheckBatchInfo"
        >
          <div
            slot="qualityWorking"
            class="quality-working mb10"
            style="background: #cc99ff"
          >
            <Form
              class="formDetail spinButton"
              :model="qualityResult"
              inline
              :showMessage="false"
              ref="qualityResult"
            >
              <div class="form-content">
                <div class="fmb0 form-flex">
                  <div class="orderType" style="background: #9900ff">维修</div>
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
                  <FormItem
                    label="合格数:"
                    :label-width="60"
                    class="large-label"
                  >
                    <Input
                      v-model="qualityResult.passCheckNumber"
                      class="input60"
                      size="large"
                      type="number"
                      @on-change="passCheckNumberFun"
                    ></Input>
                  </FormItem>
                  <FormItem
                    label="问题数:"
                    :label-width="60"
                    class="large-label"
                  >
                    <div class="question-num">
                      <span class="img-btn" @click="btnComputedFun('reduce')"
                        ><img :src="reduceImg"
                      /></span>
                      <Input
                        v-model="qualityResult.problemCheckNumber"
                        class="input60 input-question"
                        size="large"
                        type="number"
                        @on-change="problemCheckNumberFun"
                      ></Input>
                      <span class="img-btn" @click="btnComputedFun('add')"
                        ><img :src="addImg"
                      /></span>
                    </div>
                  </FormItem>
                  <div
                    style="text-align: center"
                    v-if="singleCheckBatchInfo.receiptBatchNo"
                  >
                    <div
                      class="linkText cursorClick ml10 mr10 report-question"
                      @click="qualityReportFun"
                    >
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
                <Button
                  type="primary"
                  @click="submitQualityResult"
                  :loading="submitLoading"
                  v-if="singleCheckBatchInfo.receiptBatchNo"
                  >提交维修结果</Button
                >
              </div>
            </Form>
          </div>
        </common-quality-detail>
        <div class="goods-detail">
          <div class="tabs-title">
            <div
              class="tabs-item tabs-itemAction"
              :class="{ tabsAction: tabActive == 1 }"
              @click="tabActive = 1"
            >
              图片
            </div>
            <div
              class="tabs-item"
              :class="{ tabsAction: tabActive == 2 }"
              @click="tabActive = 2"
            >
              商品描述
            </div>
          </div>
          <div class="tabs-content">
            <div class="tabs-content__pic" v-show="tabActive == 1">
              <dyt-previewImg
                :fileList="fileList"
                :imgOption="{ listWidth: 90, listHeight: 90, mode: 'multiple' }"
                v-if="fileList.length"
              >
              </dyt-previewImg>
              <div class="empty-style" v-else>暂无数据</div>
            </div>
            <div class="tabs-content__desc" v-show="tabActive == 2">
              <vue-ueditor-wrap
                v-model="singleCheckBatchInfo.description"
                :config="myConfig"
                ref="ueditor"
                @ready="ueReady"
              >
              </vue-ueditor-wrap>
            </div>
          </div>
        </div>
        <Spin fix v-if="rightLoading"></Spin>
      </div>
      <!-- 类型为质检 -->
      <div class="start-qualityInspect__right" v-else>
        <!-- 质检详情 :qualityInspectionStandard="qualityInspectionStandard" -->
        <common-quality-detail
          class="start-qualityInspect__right_detail"
          :totalCheckBatchInfo="totalCheckBatchInfo"
          :singleCheckBatchInfo="singleCheckBatchInfo"
        >
          <div slot="qualityWorking" class="quality-working mb10">
            <Form
              class="formDetail spinButton"
              :model="qualityResult"
              inline
              :showMessage="false"
              ref="qualityResult"
            >
              <div class="form-content">
                <div class="fmb0 form-flex">
                  <div class="orderType" style="background: #17e569">质检</div>
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
                  <FormItem
                    label="合格数:"
                    :label-width="60"
                    class="large-label"
                  >
                    <Input
                      v-model="qualityResult.passCheckNumber"
                      class="input60"
                      size="large"
                      type="number"
                      @on-change="passCheckNumberFun"
                    ></Input>
                  </FormItem>
                  <FormItem
                    label="问题数:"
                    :label-width="60"
                    class="large-label"
                  >
                    <div class="question-num">
                      <span class="img-btn" @click="btnComputedFun('reduce')"
                        ><img :src="reduceImg"
                      /></span>
                      <Input
                        v-model="qualityResult.problemCheckNumber"
                        class="input60 input-question"
                        size="large"
                        type="number"
                        @on-change="problemCheckNumberFun"
                      ></Input>
                      <span class="img-btn" @click="btnComputedFun('add')"
                        ><img :src="addImg"
                      /></span>
                    </div>
                  </FormItem>
                  <div
                    style="text-align: center"
                    v-if="singleCheckBatchInfo.receiptBatchNo"
                  >
                    <div
                      class="linkText cursorClick ml10 mr10 report-question"
                      @click="qualityReportFun"
                    >
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
                <Button
                  type="primary"
                  @click="submitQualityResult"
                  :loading="submitLoading"
                  v-if="singleCheckBatchInfo.receiptBatchNo"
                  >提交质检结果</Button
                >
              </div>
            </Form>
          </div>
        </common-quality-detail>
        <div class="goods-detail">
          <div class="tabs-title">
            <div
              class="tabs-item tabs-itemAction"
              :class="{ tabsAction: tabActive == 1 }"
              @click="tabActive = 1"
            >
              图片
            </div>
            <div
              class="tabs-item"
              :class="{ tabsAction: tabActive == 2 }"
              @click="tabActive = 2"
            >
              商品描述
            </div>
          </div>
          <div class="tabs-content">
            <div class="tabs-content__pic" v-show="tabActive == 1">
              <dyt-previewImg
                :fileList="fileList"
                :imgOption="{ listWidth: 90, listHeight: 90, mode: 'multiple' }"
                v-if="fileList.length"
              >
              </dyt-previewImg>
              <div class="empty-style" v-else>暂无数据</div>
            </div>
            <div class="tabs-content__desc" v-show="tabActive == 2">
              <vue-ueditor-wrap
                v-model="singleCheckBatchInfo.description"
                :config="myConfig"
                ref="ueditor"
                @ready="ueReady"
              >
              </vue-ueditor-wrap>
            </div>
          </div>
        </div>
        <Spin fix v-if="rightLoading"></Spin>
      </div>
    </div>

    <!-- 质检问题报告 -->
    <quality-report
      :modelVisible.sync="reportVisible"
      :qualityInspectionStandard="qualityInspectionStandard"
      @getReportInfo="getReportInfo"
      v-if="!isScan"
      ref="qualityReport"
    />
    <!-- 修改存放编码 -->
    <modify-storage-code
      :modelVisible.sync="codeInfo.modelVisible"
      :data="codeInfo.data"
      @returnStorageCode="returnStorageCode"
    />
    <!-- 打印问题存放清单 -->
    <storage-list
      :modelVisible.sync="questionInfo.modelVisible"
      :data="questionInfo.data"
      @printReturn="printReturn"
    />
  </div>
</template>
<script>
import Big from "big.js";
import api from "@/api/api";
import regular from "@/utils/regular.js";
import scan from "../../components/common/scan";
import qualityReport from "./qualityReport.vue";
import commonQualityDetail from "./commonQualityDetail.vue";
import VueUeditorWrap from "vue-ueditor-wrap"; // ES6 Module//引入VueUeditorWrap组件
import storageList from "./storageList";
import modifyStorageCode from "./modifyStorageCode";
export default {
  name: "qualityTest",
  components: {
    scan,
    commonQualityDetail,
    qualityReport,
    VueUeditorWrap,
    modifyStorageCode,
    storageList,
  },
  props: {
    qualitySkuData: {
      // 要进行质检的信息
      type: Object,
      default() {
        return {};
      },
    },
    warehouseId: {
      // 仓库id
      type: String,
      default() {
        return "";
      },
    },
    tab: {
      type: String,
      default() {
        return "";
      },
    },
  },
  data() {
    return {
      isScan: true,
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
          title: "送检",
          key: "expectedCheckNumber",
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
      fileList: [],
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
      submitLoading: false, // 提交加载
      scanInfo: {}, // 扫描后拿到的数据（取当中的一条）
      totalCheckBatchInfo: {}, // 当前批次总信息(右边质检详情数据)
      singleCheckBatchInfo: {}, // 当前批次信息
      rowTabData: {}, // 表格选中某一行的数据（用来对比是否要刷新右边详情数据）
      qualityInspectionStandard: [], // 质检标准列表
      reportInfo: {}, // 质检问题报告
      rightLoading: false, // 右侧加载
      // qualityTemplateJson: {}, // 所有模板下的项目
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
    };
  },
  created() {
    this.cellClassNameFun();
    // this.getQualityDetail();
  },
  mounted() {
    this.initPage();
  },
  activated() {
    this.keydownListerns(); // 添加键盘监听
  },
  deactivated() {
    window.removeEventListener("keydown", this.controlFun);
  },
  watch: {
    // 进入质检工作页面
    qualitySkuData: {
      handler(val) {
        if (!val.receiptNo) return;
        this.isScan = false;
        this.scanning(val.receiptNo);
      },
      deep: true,
    },
    tab: {
      handler(val) {
        window.removeEventListener("keydown", this.controlFun);
        if (val == 1) this.keydownListerns(); // 添加键盘监听
      },
      deep: true,
    },
  },
  methods: {
    initPage() {
      // let awaitList = [];
      // awaitList.push(() => {
      //   return this.getAllQuality();
      // })
      // this.$common.promiseAll(awaitList).then(() => {
      this.$refs["scan"] && this.$refs["scan"].$refs["scanIpt"].focus();
      // }).catch((error) => {
      // console.error(error);
      // })
    },
    // // 获取所有质检模板
    // getAllQuality() {
    //   return new Promise((resolve) => {
    //     this.qualityTemplateJson = {};
    //     this.axios.get(api.getAllQualityTemplate).then((res) => {
    //       if (res && res.data && res.data.code === 0) {
    //         resolve(res.data.datas || []);
    //         (res.data.datas || []).forEach(item => {
    //           this.$set(this.qualityTemplateJson, item.qualityClassificationId, item.qualityProjectVOList);
    //         })
    //       } else {
    //         resolve([]);
    //       }
    //     }).catch(() => {
    //       resolve([]);
    //     })
    //   })
    // },
    // 重置质检数据
    resetData() {
      this.commodity.barcode = "";
      this.tableLoading = false;
      this.tableList = [];
      this.reportVisible = false;
      this.scanInfo = {};
      this.rowTabData = {};
      this.resetRowData();
    },
    // 清空选中批次数据
    resetRowData() {
      this.qualityInspectionStandard = [];
      this.qualityResult.passCheckNumber = 0;
      this.qualityResult.problemCheckNumber = 0;
      this.fileList = [];
      this.tabActive = 1;
      this.singleCheckBatchInfo = {};
      this.reportInfo = {};
      this.rightLoading = false;
      this.submitLoading = false;
      this.totalCheckBatchInfo = {};
    },
    /**
      1、输入的数据，优先匹配入库单，可以通过入库单号，采购单号，快递单号，退货跟踪号匹配入库单的数据，如果匹配到入库单数据，则进入质检工作页面；
      2、匹配不到入库单时，改为匹配SKU：
        如果匹配不到数据，则弹窗告知用户：输入数据有误，没有搜索到质检数据，请重新输入；弹窗关闭后，清空输入框数据，重新把焦点定位到输入框；
        如果匹配到SKU对应的入库单号只有一个，则进入质检工作页面；
        如果匹配到SKU对应的入库单号只有多个，则进入质检记录页面，传递参数：质检状态：待质检，部分质检；SKU：输入数据，执行页面的搜索功能，查询数据，由用户选择入库单对应的“质检”操作，进入质检工作页面；
     **/
    scanning(sku) {
      if (!sku) return this.$Message.error("内容不能为空");
      let params = {
        pageNum: 1,
        pageSize: 1000,
        orderSeq: "DESC", // 降序
        orderBy: "WS", // 排序字段，质检状态
        warehouseId: this.warehouseId,
        checkStatusList: ["0", "1"], // 待质检和部分质检
        receiptNoOrPurchaseNo: sku, // 入库单/采购单
        scanSkuOrBarCodeList: [sku],
      };
      this.$Spin.show();
      this.axios
        .post(api.qualitySearchData, params)
        .then(({ data }) => {
          if (data.code !== 0) return;
          let list = data.datas && data.datas.list ? data.datas.list : [];
          if (!list.length) {
            return this.$Message.error("输入数据有误，没有搜索到质检数据~");
          }
          // 筛选有多少条入库单;多条情况需要跳转到质检记录页面
          let receiptNoList = {};
          list.forEach((k) => {
            if (k.receiptNo in receiptNoList) {
              receiptNoList[k.receiptNo].push(k);
            } else {
              receiptNoList[k.receiptNo] = [k];
            }
          });
          let receiptNum = Object.keys(receiptNoList).length;
          if (receiptNum > 1) {
            this.$emit("qualityScan", sku);
          } else {
            this.resetData();
            this.isScan = false;
            this.scanInfo = list[0];
            // this.getQualityDetail();
            this.getQualityInspectionBatch();
            this.$nextTick(() => {
              this.$refs.barcode.focus();
            });
          }
        })
        .finally(() => {
          this.$Spin.hide();
          if (this.$refs["scan"]) {
            this.$refs["scan"].model = "";
            this.$refs["scan"].$refs["scanIpt"].focus();
          }
        });
    },
    // 查询当前所有质检批次
    getQualityInspectionBatch(submit) {
      let params = {
        warehouseId: this.warehouseId, // 仓库id
        receiptNo: this.scanInfo.receiptNo || "", // 入库单号
      };
      this.tableLoading = true;
      return this.axios
        .post(api.quality_getAllCheckBatch, params)
        .then(async ({ data }) => {
          if (data.code !== 0) return;
          let list = data.datas || [];
          this.tableList = list;

          // 是否提交后的更新数据
          if (!(submit && submit === "submit")) return;

          // 更新后表格送检批次为0则退出当前质检工作页面
          if (!list.length) {
            // 检测是否存在编码，存在则弹窗提示
            let slotCodeInfo = await this.getStorageCodeInfo(); // slotCode = 'A-3-6';
            if (slotCodeInfo.slotId) {
              this.codeInfo.data = slotCodeInfo;
              this.storageCodeConfirm(slotCodeInfo);
              return false;
            }
            return (this.isScan = true);
          }

          // 检测存在选中sku是否还在该列表中，如果不在，则清除选中记录
          let rowTabData = this.rowTabData || {};
          if (JSON.stringify(rowTabData) === "{}") return;
          let checkedIndex = null;
          list.forEach((k, i) => {
            k.receiptBatchNo === rowTabData.receiptBatchNo &&
              (checkedIndex = i);
          });
          // console.log(checkedIndex, list[checkedIndex])
          this.rowClickFun(list[checkedIndex] || {}, checkedIndex);
        })
        .finally(() => {
          this.tableLoading = false;
        });
    },
    // 查询当前入库单SKU总信息
    getQualityDetail() {
      let params = {
        warehouseId: this.warehouseId, // 仓库id
        receiptNo: this.scanInfo.receiptNo || "", // 入库单号
        productGoodsId: this.rowTabData.productGoodsId || "", // 商品id
        // receiptBatchNo: this.rowTabData.receiptBatchNo || '', // 批次号
      };
      // this.$Spin.show();
      this.axios
        .post(api.quality_getTotalCheckBatchInfo, params)
        .then(({ data }) => {
          if (data.code !== 0) return;
          this.totalCheckBatchInfo = data.datas || {};
        })
        .finally(() => {
          // this.$Spin.hide();
        });
    },
    // 查询选中批次信息
    getCheckBatchInfo(batchInfo) {
      let params = {
        warehouseId: this.warehouseId, // 仓库id
        receiptNo: this.scanInfo.receiptNo || "", // 入库单号
        receiptBatchNo: batchInfo.receiptBatchNo || "", // 批次号
      };
      this.rightLoading = true;
      this.axios
        .post(api.quality_getCheckBatchInfo, params)
        .then(({ data }) => {
          if (data.code !== 0) return;
          let singleInfo = data.datas || {};
          this.singleCheckBatchInfo = singleInfo;
          this.qualityResult.passCheckNumber =
            singleInfo.awaitCheckedNumber || 0; // 合格数默认为：待检数
          this.qualityResult.problemCheckNumber = 0; // 问题数默认为：0
          if (!this.$common.isEmpty(singleInfo.selfUseSizeImagePath)) {
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
          this.fileList = productGoodsImageList;
          // this.getProductQuality();

          let goodsQualityInfo = singleInfo.goodsQualityInfo || {};
          this.qualityInspectionStandard =
            goodsQualityInfo.goodsQualityDetailList || [];
        })
        .finally(() => {
          this.rightLoading = false;
        });
    },
    // 结束质检
    qualityFinishFun() {
      this.$Modal.confirm({
        title: "操作提示",
        content: `<p>确认是否要结束本次质检： <span style="color:#FF9900;">${this.scanInfo.receiptNo}</span></p>`,
        onOk: () => {
          this.isScan = true;
        },
        onCancel: () => {},
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
          let [qualityResult, reportInfo, singleCheckBatchInfo] = [
            this.qualityResult,
            this.reportInfo,
            this.singleCheckBatchInfo,
          ];

          let params = {};
          // 合格/问题数
          params.passCheckNumber = qualityResult.passCheckNumber;
          params.problemCheckNumber = qualityResult.problemCheckNumber;
          // 质检问题
          params.problemCheckReason =
            reportInfo.problemCheckReason &&
            reportInfo.problemCheckReason.toString();
          params.remark = reportInfo.remark;
          params.checkAttachment = picList;
          // 送检信息
          params.waitCheckNumber = singleCheckBatchInfo.awaitCheckedNumber; // 待质检数量
          params.receiptBatchCheckId = singleCheckBatchInfo.receiptBatchCheckId; // 质检批次ID
          params.receiptBatchNo = singleCheckBatchInfo.receiptBatchNo; // 送检批次号
          params.receiptBatchCheckNo = singleCheckBatchInfo.receiptBatchCheckNo; // 质检编号
          params.warehouseLocationId = singleCheckBatchInfo.warehouseLocationId; // 库位ID
          params.productGoodsId = singleCheckBatchInfo.sku; // sku
          params.goodsSku = singleCheckBatchInfo.sku; // sku
          params.checkStatus = singleCheckBatchInfo.checkStatus; // 质检状态
          params.expectedCheckNumber = singleCheckBatchInfo.expectedCheckNumber; // 送检数量
          params.goodsId = singleCheckBatchInfo.productGoodsId; // 货品id
          params.warehouseLocationId = singleCheckBatchInfo.warehouseLocationId; // 仓库id
          // 入库单信息
          params.receiptNo = this.scanInfo.receiptNo; // 入库单编号
          // 仓库信息
          let warehouseList = this.$store.state.warehouseList || [];
          let warehouse = warehouseList.filter(
            (k) => k.warehouseId === this.warehouseId
          );
          params.warehouseName = warehouse[0] && warehouse[0].warehouseName; // 仓库名称
          params.warehouseId = this.warehouseId; // 仓库id

          this.axios
            .post(api.submitQualityCheck, params)
            .then(({ data }) => {
              if (data.code !== 0) return;
              this.$Message.success("提交质检结果成功~");
              this.resetRowData();
              // this.getQualityDetail();
              this.getQualityInspectionBatch("submit");
              this.$nextTick(() => {
                this.$refs.barcode.focus();
              });
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
      this.getQualityDetail();
      this.getCheckBatchInfo(data);
    },
    // // 获取质检标准列表
    // getProductQuality() {
    //   // const { qualityClassificationId } = this.singleCheckBatchInfo;
    //   // if (this.$common.isEmpty(qualityClassificationId)) {
    //   //   this.qualityInspectionStandard = [];
    //   //   return;
    //   // }
    //   // this.qualityInspectionStandard = this.qualityTemplateJson[qualityClassificationId] || [];
    // },
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
      )
        return false;
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
      let awaitCheckedNumber =
        this.singleCheckBatchInfo.awaitCheckedNumber || 0;
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
          this.qualityResult.problemCheckNumber = Number(
            new Big(awaitCheckedNumber).minus(result)
          );
        });
      }
      this.$nextTick(() => {
        this.qualityResult.passCheckNumber = Number(result);
      });
      // let singleCheckBatchInfo = this.singleCheckBatchInfo;
      // // 合格数范围 = 待检数-问题数
      // let maxNum = Number(new Big(singleCheckBatchInfo.awaitCheckedNumber || 0).minus(this.qualityResult.problemCheckNumber));
      // if (result >= maxNum) result = maxNum;
    },
    // 问题数输入
    problemCheckNumberFun() {
      let num = String(this.qualityResult.problemCheckNumber);
      let result = num;
      if (num !== "" && num.replace(/\d/g, "") != "") {
        result = num.replace(/\D/g, "");
      }
      if (result === "") result = 0;
      let awaitCheckedNumber =
        this.singleCheckBatchInfo.awaitCheckedNumber || 0;
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
          this.qualityResult.passCheckNumber = Number(
            new Big(awaitCheckedNumber).minus(result)
          );
        });
      }
      this.$nextTick(() => {
        this.qualityResult.problemCheckNumber = Number(result);
      });
      // let singleCheckBatchInfo = this.singleCheckBatchInfo;
      // // 问题数范围 = 待检数-合格数
      // let maxNum = Number(new Big(singleCheckBatchInfo.awaitCheckedNumber || 0).minus(this.qualityResult.passCheckNumber));
      // if (result >= maxNum) result = maxNum;
    },
    // 扫描商品条码
    scanSku() {
      let sku = this.commodity.barcode;
      let list = this.tableList || [];
      if (!sku) return this.$Message.error("内容不能为空~");
      if (!list.length) return this.$Message.error("质检列表内容为空~");
      let index = null;
      list.forEach((k, i) => {
        // 条码编码值不为空，商品条码扫描时识别为：条码编码
        let skuCode = k.barCode || k.sku;
        !(index || index === 0) && skuCode === sku && (index = i);
      });
      this.commodity.barcode = "";
      if (!(index || index === 0))
        return this.$Message.error(
          "没有搜索到SKU的送检记录，或SKU不需要质检，或已质检完毕，或还没有收货；"
        );
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
      if (e && e.keyCode == 19 && JSON.stringify(this.rowTabData) != "{}")
        this.qualityReportFun();
    },
    // 获取质检存放编码信息
    getStorageCodeInfo() {
      return new Promise((resolve) => {
        let { receiptCheckId } = this.scanInfo;
        this.axios
          .get(`${api.queryReceiptCheckStoreCode}/${receiptCheckId}`)
          .then(({ data }) => {
            if (data && data.code === 0) {
              resolve(data.datas || {});
            } else {
              resolve({});
            }
          })
          .catch(() => {
            resolve({});
          });
      });
    },
    // 当质检单全部的SKU质检完毕，如果质检单有问题件，且已分配了“存放编码”，自动弹窗提示用户是否要打印“问题件存放清单”
    storageCodeConfirm(slotCodeInfo) {
      let newSlotCode = this.storageCodeShow(slotCodeInfo);
      this.$Modal.confirm({
        width: "550",
        render: (h) => {
          return h(
            "div",
            {
              style: {
                display: "flex",
              },
            },
            [
              h("Icon", {
                style: {
                  color: "#f90",
                  fontSize: "28px",
                  marginRight: "10px",
                },
                props: {
                  type: "md-alert",
                },
              }),
              h("div", {}, [
                h(
                  "p",
                  {
                    style: {
                      fontSize: "16px",
                      fontWeight: "bold",
                    },
                  },
                  "操作提示"
                ),
                h(
                  "p",
                  {
                    attrs: {
                      id: "slotCode",
                    },
                  },
                  `你的质检单有问题件，系统分配的存放编码为：${newSlotCode}`
                ),
                h("p", {}, `是否要打印 "问题存放清单" ？`),
              ]),
              h(
                "span",
                {
                  style: {
                    color: "#2d8cf0",
                    textDecoration: "underline",
                    margin: "24px 0 0 20px",
                  },
                  on: {
                    click: () => {
                      // this.codeInfo.data = this.$common.copy(slotCodeInfo);
                      this.codeInfo.modelVisible = true;
                    },
                  },
                },
                "更改存放编码"
              ),
            ]
          );
        },
        onOk: () => {
          this.questionInfo.data = [this.$common.copy(this.scanInfo)];
          this.questionInfo.modelVisible = true;
        },
        onCancel: () => {
          this.isScan = true;
        },
      });
    },
    // 修改质检编码返回
    returnStorageCode(slotCodeInfo) {
      let newSlotCode = this.storageCodeShow(slotCodeInfo);
      // 只更新编码信息,需保留原有的质检单id
      this.codeInfo.data.slotCode = newSlotCode;
      this.codeInfo.data.slotId = slotCodeInfo.slotId;
      // 重新对弹框的编码更新值
      let dom = document.getElementById("slotCode");
      dom.innerText = `你的质检单有问题件，系统分配的存放编码为：${newSlotCode}`;
    },
    // 打印窗口关闭
    printReturn() {
      this.isScan = true;
    },
    // 处理要显示的编码
    storageCodeShow(row) {
      if (row.slotType == 1 && row.slotCode) {
        return (row.slotCode < 10 ? "0" + row.slotCode : row.slotCode) + "框";
      }
      return row.slotCode || "";
    },
  },
};
</script>
<style lang="less" >
.qualityTest-page {
  height: 100%;
  overflow: auto;

  .qulity-scan {
    width: 700px;
    margin: 50px auto;

    .title {
      font-size: 26px;
      padding: 80px 0 40px;
    }

    .ipt {
      width: 400px;
    }
  }

  .start-qualityInspect {
    padding: 10px;
    display: flex;
    align-items: flex-start;

    .start-qualityInspect__left {
      width: 480px;
      margin-right: 10px;

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
      width: calc(100% - 490px);
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
          .orderType {
            width: 50px;
            height: 100%;
            line-height: 40px;
            text-align: center;
            color: white;
          }
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

        .large-label {
          .ivu-form-item-label {
            padding: 14px 12px 14px 0;
          }
        }

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
}
</style>