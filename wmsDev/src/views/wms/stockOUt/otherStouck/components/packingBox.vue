<template>
  <div class="packing-box-page">
    <detailModel @backList="backList" class="packing-head" :pageLoading="pageLoading">
      <div slot="rights">
        <!-- 未装箱过不能完成装箱 -->
        <template v-if="(!repackInfo.noPacking && pickingDetail.skuInBoxNum > 0) ||
          repicking
          ">
          <Button @click="finishPacking" :loading="finishLoading">完成装箱</Button>
        </template>
        <template v-if="repackInfo.noPacking && !repackInfo.isPicking">
          <Button @click="repackFun">重新装箱</Button>
        </template>
      </div>
      <div>
        <Form ref="formValidate" :model="formValidate" inline :label-width="100" @submit.native.prevent>
          <div class="page-content">
            <div class="page-content__left">
              <div class="page-content__left__title">
                <div class="left__title__flex">
                  <span class="left__title__flex__sku">
                    <FormItem label="商品条码" prop="sku" class="sku" :label-width="80">
                      <Input type="text" v-model.trim="formValidate.sku" placeholder="SKU/货箱编号"
                        @on-keyup.enter="skuChange" :disabled="skuLoading" ref="skuDom"></Input>
                    </FormItem>
                  </span>
                  <span>
                    <FormItem label="" :label-width="0">
                      <span style="margin: 0 4px">*</span>
                      <Input type="number" v-model.trim="formValidate.num" @on-blur="numChange" :disabled="skuLoading || !!pickingDetail.pickingBoxZHDetailVO
                        " class="num-style spinButton"></Input>
                    </FormItem>
                  </span>

                  <span class="left__title__flex__remove" v-if="skuStatus == 'single'">
                    <FormItem label="" :label-width="0">
                      <Checkbox v-model="formValidate.remove" @on-change="numChange" :disabled="repackInfo.noPacking && !repackInfo.isPicking
                        ">移出扫描</Checkbox>
                    </FormItem>
                  </span>
                </div>
              </div>
              <div class="page-content__left__main">
                <div class="combination-tips">
                  批量装箱需先输入数量再录入/扫描sku
                </div>
                <div class="left__main__back">
                  <img :src="imgUrl" alt="sku图片" class="left__main__back__img" />
                </div>
                <div style="padding-top: 20px" :class="skuStatus">
                  <div v-for="(item, index) in skuForm[skuStatus] || {}" :key="index + 'skuForm'" class="skuForm">
                    <FormItem :label="skuitem.label" :label-width="skuitem.labelWidth" v-for="(skuitem, skuindex) in item"
                      :key="skuindex + 'skuitem'">
                      <span :style="{ color: skuitem.color }">{{
                        skuDetail[skuitem.feild] || ""
                      }}</span>
                    </FormItem>
                  </div>
                  <!-- 组合产品 -->
                  <template v-if="skuStatus == 'combination'">
                    <Table border highlight-row ref="selection" :columns="skuColumns" :data="combinatList"
                      maxHeight="200"></Table>
                    <div style="text-align: right; margin-top: 20px">
                      <Button @click="cancalCombination" :loading="cancelLoading">取消</Button>
                    </div>
                  </template>
                </div>
                <div class="page-content__left__spin" v-if="skuLoading">
                  <Spin fix></Spin>
                </div>
              </div>
            </div>
            <div class="page-content__right">
              <div class="page-content__right__detail">
                <FormItem label="SKU总数量:">
                  <span class="special-span">{{
                    pickingDetail.skuSum || 0
                  }}</span>
                </FormItem>
                <FormItem label="已装箱sku数量:">
                  <span class="special-span" style="color: #3cb034">{{
                    pickingDetail.skuInBoxNum || 0
                  }}</span>
                </FormItem>
                <FormItem label="未装箱sku数量:">
                  <span class="special-span" style="color: #ff0001">{{
                    skuUnBoxNum
                  }}</span>
                </FormItem>
                <FormItem label="已装货箱数量:">
                  <span class="special-span">{{
                    pickingDetail.boxedNum || 0
                  }}</span>
                </FormItem>
                <FormItem label="本次装箱数量:">
                  <span class="special-span">{{
                    pickingDetail.boxingSkuNum || 0
                  }}</span>
                </FormItem>
                <FormItem label="本次装袋数量:">
                  <span class="special-span">{{
                    pickingDetail.subPackageCount || 0
                  }}</span>
                </FormItem>
                <FormItem label="出库单号:">
                  <span>{{ rowData.pickingNo || "" }}</span>
                </FormItem>
                <FormItem label="货箱编号:">
                  <span>{{ pickingDetail.pickingBoxNo }}</span>
                </FormItem>
                <FormItem label="容器框号:">
                  <span v-if="basketNoList.length <= 1">{{
                    basketNoList[0] || ""
                  }}</span>
                  <Tooltip placement="top" v-else transfer max-width="500">
                    <span>{{ basketNoList[0] || "" }}</span>
                    <div slot="content">
                      <span v-for="(item, index) in basketNoList" :key="'pickingGoodsNo' + index">
                        {{ item }}；
                      </span>
                    </div>
                  </Tooltip>
                </FormItem>
                <template v-if="['O5'].includes(rowData.pickingType)">
                  <FormItem label="标签类型：">
                    <div v-if="labelTypeList[rowData.labelType]"
                      :style="{ color: (rowData.labelType == 1) ? '#ed4014' : '' }">
                      {{ labelTypeList[rowData.labelType].label }}
                    </div>
                  </FormItem>
                </template>
              </div>
              <div>
                <Table border highlight-row ref="selection" :columns="columns" :data="tableList.slice(
                  (pageInfo.pageNum - 1) * pageInfo.pageSize,
                  pageInfo.pageNum * pageInfo.pageSize
                )
                  " maxHeight="600" :loading="tableLoading" class="expendTable">
                  <template slot-scope="{ row }" slot="acceptableType">
                    <span v-for="(accpItem, accpIndex) in row.acceptableTypeList" :style="electrifiedList.includes(accpItem)
                      ? 'color: red;font-weight:bold;'
                      : ''
                      " :key="accpIndex">
                      <span>{{ accpItem }}</span>
                      <span v-if="accpIndex < row.acceptableTypeList.length - 1">、</span>
                    </span>
                  </template>
                  <template slot-scope="{ row }" slot="action">
                    <a href="javascript:;" class="a-action" @click="printLabel(row)">打印</a>
                  </template>
                </Table>
                <div class="inset-bag-page">
                  <Page :total="pageInfo.total" :current="pageInfo.pageNum" :page-size="pageInfo.pageSize" show-total
                    show-sizer show-elevator @on-change="pageNumChange" @on-page-size-change="pageSizeChange"
                    :page-size-opts="pageInfo.pageArray" size="small"></Page>
                </div>
              </div>
              <!-- 装袋 -->
              <insetBagTable v-if="showPackingBagTag" :work-show="workShow" :picking-detail.sync="pickingDetail"
                @singlePrint="singlePrint" />
            </div>
          </div>
        </Form>
        <!-- 打印商品标签 -->
        <print-common ref="printCommon" :printModal.sync="printModal" :printData="printData" :pintField="pintField"
          :printMessage="printMessage" :linkPrint="linkPrint" @linkPirntFun="linkPirntFun"></print-common>
        <!-- 装箱 -->
        <packing-exception :modelVisible.sync="exceptionVisible" :pickingDetail="pickingDetail" :rowData="rowData"
          :repicking="repicking" @refreshBox="refreshBox" ref="packException"
          :temuVisible.sync="temuVisible"></packing-exception>
        <!-- temu寄样打印数量 -->
        <send-print-num :modelVisible.sync="sendVisible" :sendTemp="sendTemp"
          @temuSendReturn="temuSendReturn"></send-print-num>
      </div>
    </detailModel>
  </div>
</template>

<script>
import Big from "big.js";
import api from "@/api/api";
import detailModel from "./detailModel";
import packingException from "./packingException";
import printCommon from "@/views/wms/components/pirntCommon/index";
import {
  commodityLabel,
  skuForm,
  temuLabel,
  labelTypeList,
  labelTypeOption,
} from "@/views/wms/stockOUt/otherStouck/components/fileData.js";
import { playVoice, stopVoice } from "./voiceBroadcast.js";
import PrintTongtu from "@/utils/printCommon.js";
import combinationProducts from "./combinationProducts.vue";
import insetBagTable from "./insetBagTable.vue";
import sendPrintNum from "./sendPrintNum";
export default {
  name: "packingBox",
  components: {
    detailModel,
    packingException,
    printCommon,
    combinationProducts,
    insetBagTable,
    sendPrintNum,
  },
  props: {
    workShow: {
      type: String,
      default: "",
    },
    rowData: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  data() {
    return {
      showPackingBagTag: false,
      pageLoading: false,
      formValidate: {
        sku: "",
        remove: false,
        num: 1,
      },
      tableList: [],
      exceptionVisible: false, // 装箱异常弹框
      pickingDetail: {}, // 出库单装箱详情
      skuLoading: false, // sku扫描加载
      skuDetail: {}, // sku信息
      printModal: false, // 打印弹框
      printData: [], // 打印的数据
      printPath: "", // 批量打印路径
      printMessage: false, // 打印提示
      defaultImg: require("@/assets/images/placeholder.jpg"), // 默认图片路径
      pageInfo: {
        total: 0,
        pageNum: 1,
        pageSize: 10,
        pageArray: [10, 20, 50, 100],
      },
      tableLoading: false, // 表格加载
      printLoading: false, // 打印加载
      skuStatus: "single", // 单个single 组合combination
      skuForm: skuForm, // sku扫描展示信息
      skuColumns: [
        {
          title: "组合sku",
          key: "goodsSku",
          align: "left",
          minWidth: 80,
        },
        {
          title: "产品数量",
          key: "mapperCount",
          align: "center",
          minWidth: 80,
        },
        {
          title: "未装箱产品数量",
          key: "notScanCount",
          align: "center",
          minWidth: 90,
        },
      ], // 组合sku表格
      electrifiedList: ["内置电池", "纽扣电池", "纯电池", "配套电池"],
      cancelLoading: false, // 取消组合装箱
      combinatList: [], // 组合产品列表
      pickingAccount: "", // 谷仓账号
      basketNoList: [], // 拣货单号显示
      skuUnBoxNum: 0, // 未装箱sku数量
      repackInfo: {
        pickingBoxNo: "", // 箱号
        noPacking: false, // 非最新装箱，区分正在装箱和重新装箱 true就是重新装箱 false当前最新箱
        isPicking: false, // 是否重新装箱
      },
      printNum: 1, // 打印标签数量
      linkPrint: false, // 是否链接打印
      temuVisible: false, // temu确认弹框
      sendSampleInfo: {}, // 寄样标签信息
      finishLoading: false, // 完成装箱loading
      sendVisible: false,
      sendTemp: {}, // 某一列寄样数据
      temuForm: {}, // 保存寄样打印数
      limitHtmlNum: 10, // 限制图片html内容为10张
      labelTypeList: labelTypeList,
      boxInfoList: {},//所有sku的相关信息
    };
  },
  watch: {
    rowData: {
      handler(val) {
        if (!val) return;
        this.getDetail();
        // 是否第三方链接打印
        this.linkPrint = ["O8", "O10"].includes(val.pickingType) || (val.pickingType === "O11" && val.pickingSubType == 1);
      },
      deep: true,
      immediate: true,
    },
    workShow: {
      handler(val) {
        if (!val) return;
        this.$nextTick(() => {
          this.$refs["skuDom"] && this.$refs["skuDom"].focus();
        });
      },
      deep: true,
      immediate: true,
    },
  },
  computed: {
    // 根据不同出库类型不同打印内容
    pintField() {
      let { pickingType, pickingSubType, labelType } = this.rowData || {};
      !pickingType && (pickingType = "O5"); // 不存在出库单类型，则默认为FBA出库单
      if (pickingType === "O11") {
        return temuLabel["label" + pickingSubType] || {};
      }
      if (['O5'].includes(pickingType)) {
        let option = labelTypeOption[pickingType + labelType];
        if (option) return option;
      }
      return commodityLabel[pickingType] || {};
    },
    // sku图片
    imgUrl() {
      let [url, img] = [this.defaultImg, null];
      if (this.skuStatus === "combination") {
        img = this.skuDetail.zhskuUrl;
      } else {
        img = this.skuDetail.img;
      }
      if (img) url = this.$store.state.imgUrlPrefix + img;
      return url;
    },
    // 是否处于重新装箱
    repicking() {
      return this.repackInfo.noPacking && this.repackInfo.isPicking;
    },
    // 表头
    columns() {
      let { pickingType, pickingSubType } = this.rowData;
      let str = "";
      if (pickingType === "O11") {
        str = pickingSubType == 1 ? "平台skc" : "平台spu"; // pickingSubType:0寄样;1备货
      } else if (pickingType === "O13") {
        str = "EAN"; // FBK出库单
      } else if (pickingType === "O5") {
        str = "FNSKU";
      } else if (pickingType === "O20") {
        str = "YMS SKU";
      } else if (pickingType === "O21") {
        str = "商品ID";
      } else {
        str = "平台sku";
      }
      return [
        {
          key: "expand",
          type: "expand",
          align: "center",
          width: 2,
          render: (h, params) => {
            let row = params.row || {};
            if (row.skuCountMap) {
              let skulist = Object.keys(row.skuCountMap).map((k) => {
                let num = row.skuCountMap[k] || 0;
                return {
                  goodSku: k,
                  scanCount: Number(new Big(num).times(row.scanCount || 0)),
                  notScanCount: Number(
                    new Big(num).times(row.notScanCount || 0)
                  ),
                };
              });
              const columnFeild = ["goodSku", "scanCount", "notScanCount"]; // 子sku显示字段
              return h(combinationProducts, {
                props: {
                  index: params.index,
                  lists: skulist,
                  columns: this.columns,
                  columnFeild: columnFeild,
                },
              });
            }
          },
        },
        {
          title: "sku",
          key: "goodSku",
          align: "center",
          minWidth: 120,
        },
        {
          title: str,
          key: "platSku",
          align: "center",
          minWidth: 100,
        },
        {
          title: "产品类型",
          slot: "acceptableType",
          align: "center",
          minWidth: 100,
        },
        {
          title: "已装箱数量",
          key: "scanCount",
          align: "center",
          minWidth: 100,
        },
        {
          title: "未装箱数量",
          key: "notScanCount",
          align: "center",
          minWidth: 100,
        },
        {
          title: "操作",
          slot: "action",
          align: "center",
          width: 100,
        },
      ];
    },
    // temu寄样
    isTemuSend() {
      return (
        this.rowData.pickingType === "O11" && this.rowData.pickingSubType === 0
      );
    },
  },
  methods: {
    // 返回列表
    backList() {
      this.$emit("searchData");
      this.$emit("update:workShow", "list");
      stopVoice(); // 组件销毁时停止播放
    },
    // 获取装箱详情
    getDetail() {
      this.pageLoading = true;
      this.axios
        .get(api.wmsPickingBoxesGetInit, {
          params: { pickingId: this.rowData.pickingId },
        })
        .then(async ({ data }) => {
          if (!(data && data.code === 0)) return;
          let pickingDetail = data.datas || {};
          this.pickingAccount = pickingDetail.pickingAccount; // 接口初始化才给与账号
          await this.getBoxInfo();
          this.handleDetail(pickingDetail);
        })
        .finally(() => {
          this.pageLoading = false;
        });
    },
    // 获取所有产品内的信息
    getBoxInfo() {
      return this.axios.get(api.queryBoxingExtendInfo + this.rowData.pickingId).then(({ data }) => {
        if (!(data && data.code === 0)) return;
        let list = data.datas || [];
        this.boxInfoList = this.$common.arrayToObj(list, 'goodsSku');
      })
    },
    // 完成装箱
    finishPacking() {
      // 组合产品正在装箱时，完成装箱需二次确认提示
      const arr = this.isCombinatList();
      if (arr.length > 0) {
        this.$Modal.warning({
          title: "装箱异常",
          content: `<p>请将组合sku <span style="color:red;word-break: break-all;">${arr.toString()}</span> 完成扫描再装箱</p>`,
        });
        return;
      }
      // temu出库单增加多一层询问(非重新装箱)
      if (this.rowData.pickingType === "O11") {
        // 重新装箱
        if (this.repicking) {
          let temp = {};
          temp.pickingId = this.rowData.pickingId;
          this.finishLoading = true;
          return this.$refs["packException"]
            .continuePacking(temp)
            .finally(() => {
              this.finishLoading = false;
            });
        } else {
          // 存在装完箱但没有结束出库单的情况
          if (this.skuUnBoxNum <= 0) {
            this.exceptionVisible = true;
            return false;
          }
          this.temuVisible = true;
          return false;
        }
      }
      this.exceptionVisible = true;
    },
    // 清空sku信息
    resetScan() {
      return new Promise((resolve, reject) => {
        this.skuDetail = {};
        this.skuStatus = "single";
        this.combinatList = [];
        this.pageInfo.total = 0;
        this.pageInfo.pageNum = 1;
        this.pageInfo.pageSize = 10;
        resolve();
      });
    },
    // 扫码条形码
    skuChange(type) {
      const [_self, formValidate, rowData] = [
        this,
        this.formValidate,
        this.rowData,
      ];
      let innerFun = {
        sku: _self.formValidate.sku,
        isRemove: _self.formValidate.remove,
        isBagType: ["O10"].includes(rowData.pickingType), // 万邑通
        isTemu: ["O11"].includes(rowData.pickingType), // temu
        // 是否箱号查询
        isBox() {
          let isBox = false;
          const boxNoPrefix = _self.repackInfo.pickingBoxNo.split("-"); // 箱号切割
          if (!_self.$common.isEmpty(boxNoPrefix)) {
            const newPrefix = `${boxNoPrefix[0]}-`;
            const skuPrefix = innerFun.sku.substring(0, newPrefix.length);
            isBox =
              innerFun.sku.length > newPrefix.length && skuPrefix === newPrefix;
          }
          return isBox;
        },
        // 校验
        validate() {
          const repackInfo = _self.repackInfo;
          const boxNoPrefix = repackInfo.pickingBoxNo.split("-");
          // 判断是否有权限
          let roleList = _self.$store.state.roleList || [];
          let isAdmin = _self.$store.state.isAdmin;
          if (!(isAdmin || roleList["wmsFbaPicking_scan"])) {
            _self.$Message.error("无权限装箱~");
            return false;
          }
          if (!this.sku) {
            _self.$Message.error("请输入SKU/货箱编号~");
            return false;
          }
          if (/^\w+-\w+$/g.test(this.sku)) {
            let boxSku = this.sku.split("-");
            let str = boxSku[1] && boxSku[1].substring(0, 1);
            if (boxSku[0] === boxNoPrefix[0] && str === "0") {
              _self.$Message.error("扫描箱号不存在~");
              this.resetFormValidate();
              return false;
            }
          }
          // 防止多次扫描接口
          if (_self.skuLoading) {
            _self.$Message.error("正在扫描，请等待~");
            return false;
          }
          // 等待打印接口完毕
          if (_self.$refs.printCommon.loading || _self.printLoading) {
            _self.$Message.warning({
              content: "正在打印中，请耐心等待打印完成后再做此操作！",
              top: 150,
              duration: 3,
            });
            this.resetFormValidate();
            return false;
          }
          // 万邑通装袋校验
          if (innerFun.isBagType) return innerFun.bagValidate();
          return true;
        },
        // 装袋校验
        bagValidate() {
          let [repackInfo, combinatList, isBox] = [
            _self.repackInfo,
            [],
            innerFun.isBox(),
          ];
          const isBagNum =
            this.sku.length === 20 && this.sku.substring(0, 2) === "BC"; // 袋标
          if (
            !isBagNum &&
            !isBox &&
            _self.$common.isEmpty(_self.pickingDetail.subPackageNo)
          ) {
            _self.$Modal.warning({
              title: `装箱异常`,
              content: `请选扫描袋号后再装袋`,
              onOk: () => {
                _self.$nextTick(() => {
                  this.resetFormValidate();
                });
              },
            });
            return false;
          }
          if (isBagNum) {
            combinatList = _self.isCombinatList();
            const isEqualBag = this.sku === _self.pickingDetail.subPackageNo;
            if (combinatList.length > 0) {
              _self.$Modal.warning({
                title: `${this.isRemove ? "移除袋子" : isEqualBag ? "结袋" : "换袋"
                  }异常`,
                content: `<p>
                  请将组合sku 
                  <span style="color:red;word-break: break-all;">
                    ${combinatList.toString()}
                  </span> 
                  完成扫描后再${this.isRemove ? "移除袋子" : isEqualBag ? "结袋" : "换袋"
                  }
                </p>`,
                onOk: () => {
                  _self.$nextTick(() => {
                    this.resetFormValidate();
                  });
                },
              });
              return false;
            }
          }
          if (
            !_self.$common.isEmpty(_self.pickingDetail.subPackageNo) &&
            !isBox
          ) {
            const isRelieveBag =
              !isBagNum &&
              type !== "unbindBag" &&
              [0, "0"].includes(_self.pickingDetail.subPackageStatus);
            if (repackInfo.noPacking && !repackInfo.isPicking) {
              _self.repackFun();
              return false;
            }
            if (isRelieveBag) {
              _self.unbindBag();
              return false;
            }
          }
          return true;
        },
        // 扫码
        scanCode() {
          _self.printNum = formValidate.num; // 保留打印数量
          const isBagNum =
            innerFun.sku.length === 20 && innerFun.sku.substring(0, 2) === "BC";
          let [temp, repackInfo, apiUrl] = [{}, _self.repackInfo, ""];
          temp.item = innerFun.sku;
          temp.pickingId = rowData.pickingId;
          temp.isRemove = innerFun.isRemove ? 1 : null;
          temp.count = formValidate.num;
          // 袋号
          if (innerFun.isBagType) {
            temp.subPackageNo = _self.$common.isEmpty(
              _self.pickingDetail.subPackageNo
            )
              ? innerFun.sku
              : _self.pickingDetail.subPackageNo;
          }
          // 重新装箱 变更api
          if (_self.repicking || (_self.repackInfo.noPacking && isBagNum)) {
            temp.pickingBoxNo = repackInfo.pickingBoxNo; // 箱号
            if (isBagNum || type === "unbindBag") {
              delete temp.item;
              delete temp.count;
              if (type === "unbindBag") {
                apiUrl = `${api.pickingSubPackageBarcodeOpen}/${_self.pickingDetail.subPackageNo}`;
              } else if (innerFun.isRemove) {
                apiUrl = `${api.removeSubPackage}/${innerFun.sku}`;
              } else {
                apiUrl = `${api.pickingSubPackageBarcode}/${innerFun.sku}`;
              }
            } else {
              apiUrl = api.reBoxingScan;
            }
          } else if (isBagNum) {
            delete temp.item;
            temp.pickingBoxNo = repackInfo.pickingBoxNo; // 箱号
            if (
              innerFun.isRemove &&
              !_self.$common.isEmpty(
                _self.pickingDetail.wmsPickingBoxesDetailsSubPackageList
              )
            ) {
              apiUrl = `${api.removeSubPackage}/${innerFun.sku}`;
            } else {
              apiUrl = `${api.pickingSubPackageBarcode}/${innerFun.sku}`;
            }
          } else if (type === "unbindBag") {
            delete temp.item;
            delete temp.count;
            temp.pickingBoxNo = repackInfo.pickingBoxNo; // 箱号
            apiUrl = `${api.pickingSubPackageBarcodeOpen}/${_self.pickingDetail.subPackageNo}`;
          } else {
            apiUrl = api.wmsPickingBoxesSacn;
          }
          // console.log(temp);
          _self.skuLoading = true;
          _self.axios
            .get(apiUrl, { params: temp })
            .then(async (res) => {
              if (res && !(res.data && res.data.code === 0)) {
                _self.skuLoading = false;
                return false;
              }
              let datas = res.data.datas || {};

              // isScan: 0获取以前的货箱信息；1扫描sku
              if (datas.isScan == 1) {
                _self.$Message.success(
                  innerFun.isRemove ? "移除成功~" : "扫描成功~"
                );
                // temu特殊处理
                if (innerFun.isTemu && !innerFun.isRemove) {
                  await _self.temuGetDetail(innerFun.sku, datas); // 获取寄养标签信息(放这是接口增加的时长非打印时长)
                  await _self.temuDetail(datas); // 自动装箱/完成装箱
                }
              }
              _self.skuLoading = false;
              _self.resetScan().then(() => {
                innerFun.refreshDetail(datas, isBagNum, type);
              });
            })
            .catch(() => {
              _self.skuLoading = false;
            })
            .finally(() => {
              innerFun.resetFormValidate();
            });
        },
        // 更新信息
        refreshDetail(datas, isBagNum, type) {
          _self.handleDetail(datas, isBagNum, type).then(() => {
            // 移除完毕后
            if (!(datas.wmsPickingBoxesDetailsVo || []).length) {
              _self.formValidate.remove = false;
            }
            // 更新打印条码(移除和非sku扫描不打印标签;isScan: 0获取以前的货箱信息；1扫描sku)
            // datas.pickingBoxZHDetailVO:组合产品需扫描完子sku才能继续打印
            if (
              !innerFun.isRemove &&
              datas.isScan == 1 &&
              !datas.pickingBoxZHDetailVO
            ) {
              innerFun.electrifiedVoice(datas); // 声音提示
              innerFun.printCode(datas);
            }
          });
        },
        // 打印条码
        printCode(datas) {
          let wmsPickingBoxesDetailsVo = datas.wmsPickingBoxesDetailsVo || [];
          let list = wmsPickingBoxesDetailsVo.filter(
            (k) => datas.labelSku == k.goodSku
          );
          let printData = null; // 要打印的数据
          if (list.length) {
            printData = list[0];
          } else {
            printData = wmsPickingBoxesDetailsVo[wmsPickingBoxesDetailsVo.length - 1] || {}; // 取最后最新一条打印
          }
          let { pickingSubType, pickingType } = _self.rowData;
          // temu出库单
          if (pickingType === "O11") {
            // pickingSubType:0寄样;1备货;
            if (pickingSubType === 1) {
              this.singleBarnPrint(printData);
            } else {
              this.commonPrint(printData);
            }
          } else if (["O8", "O10"].includes(pickingType)) {
            // 谷仓/万邑通
            this.singleBarnPrint(printData);
          } else {
            this.commonPrint(printData);
          }
        },
        // 谷仓/万邑通标签打印
        singleBarnPrint(datas) {
          _self.printLoading = true;
          _self
            .urlRequestPrint(datas, 2)
            .then((data) => {
              // printNum:打印总条数 reduceNum:随打印减少的条数 limitHtmlNum:限制打印的条数
              let [printNum, reduceNum, limitHtmlNum] = [
                _self.printNum,
                _self.printNum,
                _self.limitHtmlNum,
              ];
              let forNum = Math.ceil(printNum / limitHtmlNum); // 向上取整

              let fun = () => {
                let htmlNum =
                  reduceNum >= limitHtmlNum ? limitHtmlNum : reduceNum; // 图片张数
                let htmlStr = "";
                for (let i = 0; i < htmlNum; i++) {
                  // 多张图片拼接
                  htmlStr += data;
                }
                let completeHtml = this.docHtml(htmlStr);
                PrintTongtu.htmlPrint(completeHtml).finally(() => {
                  forNum--;
                  reduceNum -= htmlNum; // 减少已打印的条数

                  if (forNum < 0) {
                    _self.printLoading = false;
                  } else {
                    fun();
                  }
                });
              };
              fun();
            })
            .catch(() => {
              _self.printLoading = false;
            });
        },
        docHtml(imgStr) {
          return `
            <!DOCTYPE html>
              <html lang="en">
              <head>
                  <meta charset="UTF-8">
                  <meta http-equiv="X-UA-Compatible" content="IE=edge">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>标签打印</title>
              </head>
              <style>
                  body {
                      margin: 0;
                  }
                  img {
                      vertical-align: top;
                  }
              </style>
              <body>
                  ${imgStr}
              </body>
              </html>
            `;
        },
        // fba/wfs/ef 打印
        commonPrint(datas) {
          _self.printFeild(datas).then(() => {
            let printCommon = _self.$refs.printCommon;
            printCommon.setData().then(() => {
              printCommon.pintAll();
            });
          });
        },
        // 带电产品类型，需要声音提示
        electrifiedVoice(datas) {
          // let wmsPickingBoxesDetailsVo = datas.wmsPickingBoxesDetailsVo || [];
          // let list = wmsPickingBoxesDetailsVo.filter(k => datas.labelSku == k.goodSku);
          let tableList = _self.tableList;
          let list = tableList.filter((k) => datas.labelSku == k.goodSku);
          let printData = null; // 要打印的数据
          if (list.length) {
            printData = list[0];
          } else {
            printData = tableList[tableList.length - 1] || {}; // 取最后最新一条打印
          }
          let str = "";
          (printData.acceptableTypeList || []).forEach((k) => {
            _self.electrifiedList.includes(k) && (str += k + " ");
          });
          if (!str) return;
          // 播放声音
          playVoice({
            text: str,
            start: (e) => {
              //   console.log('开始播放', e)
            },
            complete: (e) => {
              //   console.log('播放完成', e)
            },
            pause: (e) => {
              //   console.log('暂停播放', e)
            },
          });
        },
        // 重置表单信息
        resetFormValidate() {
          _self.formValidate.sku = ""; // 清空sku
          _self.$nextTick(() => {
            _self.$refs["skuDom"] && _self.$refs["skuDom"].focus();
          });
        },
      };
      if (!innerFun.validate()) return;
      innerFun.scanCode();
    },
    // 解袋操作
    unbindBag() {
      this.$Modal.confirm({
        title: "温馨提示",
        content: "需要解袋后再操作，是否确认解袋？",
        onOk: () => {
          this.skuChange("unbindBag");
        },
      });
    },
    // 是否存在组合未装箱(袋)
    isCombinatList() {
      if (this.skuStatus === "combination" && this.combinatList.length) {
        return this.combinatList.map((k) => {
          return k.goodsSku;
        });
      }
      return [];
    },
    // 转换打印需要的格式(row某一条sku,type:single需要表格弹框遮罩)
    printFeild(row, type) {
      return new Promise((resolve) => {
        this.printData = []; // 先清空
        let printNum = this.printNum || 1;
        let single = type === "single"; // 点击打印按钮
        let [_self, way, printData] = [this, null, {}];
        let { pickingType, labelType } = this.rowData || {};
        let fun = {
          // ef
          ef(printData) {
            let temp = Object.assign({}, printData);
            temp.platSku = "OC SKUID：" + row.platSku;
            temp.goodsSku = "Seller SKUID：" + row.goodSku;
            temp.warehouseLocationName = "MADE IN China";
            return Promise.resolve([temp]);
          },
          fba(printData) {
            if ([2, '2'].includes(labelType)) {
              let boxInfo = _self.boxInfoList[row.goodSku] || {};
              let temp = Object.assign({}, row, boxInfo, printData);
              temp.platformSkuTitle = "SKU";//平台SKU标题
              temp.timesTitle = "Month & Year of importing:";//打标签时的年月标题
              temp.mrpTitle = "MRP(Inclusive of all Taxes)";//INR后的数值取MRP标题
              temp.originTitle = "Country of Origin:";//发源地标题
              temp.importerInfoTitle = "Importing By/Marketed By";//出口商信息标题
              temp.times = _self.$common.dayjs().format("MM/YYYY");//打标签时的年月
              temp.mrp = "INR " + (temp.mrp || '');//INR后的数值取MRP
              temp.origin = "China";//发源地
              return Promise.resolve([temp]);
            } else {
              return fun.common(printData);
            }
          },
          // FBA，WFS，谷仓，SHL，万邑通，FBK
          common(printData) {
            let temp = Object.assign({}, printData);
            temp.platSku = row.platSku;
            temp.goodsSku = row.goodSku;
            temp.warehouseLocationName = "Made in China";
            if (pickingType === "O9") {
              // shl账号
              temp.pickingAccount = _self.pickingAccount;
            }
            if (pickingType === "O17") {
              // sku中文名称处理
              temp.goodsCnDesc = temp.labelName;
            }
            return Promise.resolve([temp]);
          },
          // pickingSubType:0寄样;1备货;
          async temu() {
            let pickingSubType = _self.rowData.pickingSubType;
            if (pickingSubType == 1) {
              let temp = {};
              temp.platSkc = row.platSku;
              temp.goodSku = row.goodSku;
              temp.goodsSku = row.goodSku;
              temp.printNum = 1; // 默认一张
              return [temp];
            }
            let printList = [];
            let item = await _self.temuGetDetail(row.goodSku); // 获取寄养标签信息
            item.printNum = 1; // 默认一张
            if (single) {
              let { min, max } = _self.temuForm;
              for (let i = min; i <= max; i++) {
                let temp = Object.assign({}, item);
                temp.sampleNum = "样品" + i;
                printList.push(temp);
              }
            } else {
              // 因为每张temu寄样标签样品数不一致，需要做特殊处理
              let pickingDetail = _self.pickingDetail;
              // 包数:printCount(当前sku总数量) - notScanCount(未装箱数量)
              let count = Number(
                new Big(pickingDetail.printCount || 0).minus(
                  row.notScanCount || 0
                )
              );
              // 样品数随减
              for (let i = 1; i <= printNum; i++) {
                let temp = Object.assign({}, item);
                temp.sampleNum = "样品" + count;
                printList.push(temp);
                count--;
              }
              printList = printList.reverse(); // 因为count数量是倒数，所以这里要处理
            }
            return printList;
          },
          // 艾姆勒
          aimule(printData) {
            let temp = Object.assign({}, printData);
            temp.productCode = _self.pickingAccount + '-' + row.platSku;
            temp.printDate = _self.$common.dayjs().format('YYYY-MM-DD');
            temp.fnCode = temp.productCode;
            temp.platSku = row.platSku;
            return Promise.resolve([temp]);
          },
          // yms
          yms(printData) {
            let temp = Object.assign({}, printData);
            let boxInfo = _self.boxInfoList[row.goodSku] || {};
            temp.platSku = row.platSku;
            temp.ymsMerchantId = boxInfo.ymsMerchantId;
            temp.ymsSupplierSku = boxInfo.ymsSupplierSku;
            temp.ymsProductSpec = boxInfo.ymsProductSpec;
            return Promise.resolve([temp]);
          },
          'FBP-URAL'(printData) {
            let temp = Object.assign({}, printData);
            let boxInfo = _self.boxInfoList[row.goodSku] || {};
            temp.merchantInfo = boxInfo.ymsMerchantId + '-' + boxInfo.platSku;
            temp.fnCode = temp.merchantInfo;
            temp.ural = window.location.origin + '/wms-service/static/images/ural.jpg';
            return Promise.resolve([temp]);
          },
        };
        // 标签格式略微不同
        if (pickingType === "O11") {
          way = fun["temu"];
        } else {
          printData.printNum = printNum || 1;
          printData.fnCode = row.platSku;
          printData.labelName = row.labelName;

          if (pickingType === "O7") {
            way = fun["ef"];
          } else if (pickingType === "O19") {
            way = fun["aimule"];
          } else if (pickingType === "O5") {
            way = fun["fba"];
          } else if (pickingType === "O20") {
            way = fun["yms"];
          } else if (pickingType === "O21") {
            way = fun["FBP-URAL"];
          } else {
            way = fun["common"];
          }
        }
        this.tableLoading = single || false;
        way(printData)
          .then((list) => {
            console.log(list)
            this.printData = list;
            resolve();
          })
          .finally(() => {
            this.tableLoading = false;
          });
      });
    },
    printLabel(row) {
      if (this.isTemuSend) {
        this.sendTemp = row;
        this.sendVisible = true;
      } else {
        this.singlePrint(row);
      }
    },
    temuSendReturn(form) {
      this.temuForm = form;
      this.$nextTick(() => {
        this.singlePrint(this.sendTemp);
      });
    },
    // 单个打印
    singlePrint(row) {
      this.printFeild(row, "single").then(() => {
        this.printModal = true;
      });
    },
    // 第三方链接请求打印标签 type:0 pdf 1html 2img
    urlRequestPrint(row, type) {
      let _self = this;
      let { pickingType, pickingId } = this.rowData;
      row.printNum = row.printNum || 1; // 默认打印数量为1
      let stockType = {
        O8: {
          requestType: "get",
          requestApi: `${api.printLabel}?count=${row.printNum}&sku=${row.platSku}&pickingAccount=${this.pickingAccount}&type=${type}`,
          requestData: "",
          printReplace(content) {
            return stockType.commonDocHtml(
              content,
              'style="height:214px;display:flex;align-items:center;justify-content: center;"',
              'style="width: auto;height:105px;"'
            );
          },
        },
        O10: {
          requestType: "post",
          requestApi: `${api.printWytLabel}?type=${type}`, // 返回内容是否html字符串，否则链接
          requestData: [
            {
              printQty: row.printNum,
              productCode: row.goodSku || row.goodsSku,
            },
          ],
          printReplace(content) {
            return stockType.commonDocHtml(
              content,
              'style="height:140px;"',
              'style="width: auto;height:100%;"'
            );
          },
        },
        O11: {
          requestType: "get",
          requestApi: `${api.printStockLabel}/${pickingId}?sku=${row.goodSku}${type == 2 ? "" : `&number=${row.printNum}`
            }`, // 返回内容是否html字符串，否则链接
          requestData: "",
          printReplace(content) {
            return stockType.commonDocHtml(
              content,
              'style="height:76px;"',
              'style="width: auto;height:100%;"'
            );
          },
        },
        async commonDocHtml(content, divStyle, imgStyle) {
          let allUrl = _self.$common.splicingPath(content);
          let url = await _self.$common.getBase64(allUrl); // 处理成base64
          let imgStr = `<div ${divStyle}><img ${imgStyle} src="${url}" /></div><div style="page-break-after: always;"></div>`;
          return imgStr;
        },
      };
      let sendData = stockType[pickingType];
      return new Promise((resolve, reject) => {
        this.axios[sendData.requestType](
          sendData.requestApi,
          sendData.requestData
        )
          .then((res) => {
            let data = res.data || {};
            if (data.code === 0) {
              if (!data.datas) {
                this.$Message.error("无法打印，打印内容为空!");
                reject(new Error(false));
                return;
              }
              let htmlcontent =
                type == 2 ? sendData.printReplace(data.datas) : data.datas;
              resolve(htmlcontent);
            } else {
              reject(new Error(false));
            }
          })
          .catch((err) => {
            reject(err);
          });
      });
    },
    // 链接打印
    linkPirntFun(val) {
      let row = val[0] || {};
      this.tableLoading = true;
      this.urlRequestPrint(row, 0)
        .then((data) => {
          this.urlPrint(data);
        })
        .finally(() => {
          this.tableLoading = false;
        });
    },
    // url链接打印
    urlPrint(pdfUrl) {
      let url = this.$common.splicingPath(pdfUrl);
      window.open("/wms-service/static/pdf/web/viewer.html?file=" + url);
    },
    // 由装箱决定是否刷新装箱详情，还是完成装箱并退出本装箱页面
    refreshBox(val) {
      let _self = this;
      let fun = {
        // 结束装箱操作
        closePage() {
          _self.backList();
        },
        // 继续装箱停留在装箱页面并刷新装箱信息
        refreshPage() {
          _self.resetScan();
          _self.getDetail();
        },
      };
      val && fun[val] && fun[val]();
    },
    pageNumChange(e) {
      this.pageInfo.pageNum = e || 1;
    },
    pageSizeChange(e) {
      this.pageInfo.pageSize = e || 10;
    },
    // 取消组合装箱
    cancalCombination() {
      this.$Modal.confirm({
        title: "取消组合产品装箱",
        content:
          '<p>是否确认取消组合产品装箱？取消后需 <span style="color:red;">重新扫描产品库</span> ! </p>',
        onOk: () => {
          let [temp, repackInfo, apiUrl] = [{}, this.repackInfo, ""];
          temp.pickingId = this.rowData.pickingId;
          temp.zHSku = this.skuDetail.zhsku;

          if (this.repicking) {
            apiUrl = api.cancelZHCratedReBox;
            temp.pickingBoxNo = repackInfo.pickingBoxNo;
          } else {
            apiUrl = api.cancelZHCrated;
          }

          this.cancelLoading = true;
          this.axios
            .get(apiUrl, { params: temp })
            .then(({ data }) => {
              if (!(data && data.code === 0)) return;
              this.handleDetail(data.datas || {});
            })
            .finally(() => {
              this.cancelLoading = false;
            });
        },
        onCancel: () => { },
      });
    },
    // 处理数据
    handleDetail(pickingDetail, isBagNum, type) {
      this.showPackingBagTag =
        !this.$common.isEmpty(pickingDetail) &&
        !this.$common.isEmpty(pickingDetail.subPackageNo);
      const isScanBag = isBagNum || ["unbindBag"].includes(type);
      if (isScanBag) {
        Object.keys(pickingDetail || {}).forEach((key) => {
          this.$set(this.pickingDetail, key, pickingDetail[key]);
        });
        if (this.$common.isEmpty(pickingDetail.subPackageNo)) {
          this.$set(this.pickingDetail, "subPackageNo", null);
          this.$set(this.pickingDetail, "subPackageStatus", null);
          this.$set(
            this.pickingDetail,
            "wmsPickingBoxesDetailsSubPackageList",
            []
          );
        }
      } else {
        this.pickingDetail = this.$common.copy(pickingDetail);
      }
      Object.keys(pickingDetail || {}).forEach((key) => {
        this.$set(this.pickingDetail, key, pickingDetail[key]);
      });
      let newDetail = this.$common.copy(this.pickingDetail);
      return new Promise((resolve, reject) => {
        // 右边列表
        this.tableList = (newDetail.wmsPickingBoxesDetailsVo || []).map((k) => {
          k._expanded = true; // 默认展开
          k.acceptableTypeList = k.acceptableType ? k.acceptableType.split(",") : [];
          if (k.skuCountMap) {
            k.cellClassName = {
              expand: "expand-table-info-cell-age",
            };
          }
          return k;
        });
        this.pageInfo.total = this.tableList.length;
        if (newDetail.pickingBoxZHDetailVO) {
          let pickingBoxZHDetailVO = newDetail.pickingBoxZHDetailVO; // 组合信息
          this.skuDetail = pickingBoxZHDetailVO;
          this.skuStatus = "combination";
          this.combinatList =
            pickingBoxZHDetailVO.pickingBoxZHMapperVOList || [];
          this.formValidate.num = newDetail.pickingBoxZHDetailVO.scanCount; // 重置数量为1
        } else {
          this.skuDetail = newDetail;
          this.skuStatus = "single";
          this.combinatList = [];
          this.formValidate.num = 1; // 重置数量为1
        }
        // 计算未装箱sku数量
        this.skuUnBoxNumFun(newDetail);
        // 拣货单处理
        this.basketNoList = newDetail.basketNo
          ? newDetail.basketNo.split(",")
          : [];
        if (!this.$common.isEmpty(newDetail.pickingBoxNo)) {
          // 重新装箱信息处理
          let boxCode = newDetail.pickingBoxNo
            ? newDetail.pickingBoxNo.split("-")
            : [];
          let result = boxCode[1] < newDetail.pickingBoxNoTotalNum;
          this.repackInfo.pickingBoxNo = newDetail.pickingBoxNo;
          this.repackInfo.noPacking = result;
          this.repackInfo.isPicking = newDetail.isPicking;
        }
        resolve();
      });
    },
    // 计算未装箱sku数量
    skuUnBoxNumFun(totalData) {
      let skuUnBoxNum = (totalData.skuSum || 0) - (totalData.skuInBoxNum || 0);
      skuUnBoxNum = skuUnBoxNum >= 0 ? skuUnBoxNum : 0;
      this.pickingDetail.skuUnBoxNum = skuUnBoxNum;
      this.skuUnBoxNum = skuUnBoxNum;
      return skuUnBoxNum;
    },
    // 重新装箱
    repackFun() {
      this.$Modal.confirm({
        title: "提示",
        content: "<p>该货箱状态为已装箱，是否重新装箱？</p>",
        loading: true,
        onOk: () => {
          let temp = {};
          temp.pickingId = this.rowData.pickingId;
          temp.pickingBoxNo = this.repackInfo.pickingBoxNo;
          this.axios
            .get(api.reBoxingInit, { params: temp })
            .then(({ data }) => {
              if (!(data && data.code === 0)) return;
              this.handleDetail(data.datas || {});
            })
            .finally(() => {
              this.$Modal.remove();
            });
        },
        onCancel: () => { },
      });
    },
    // 限制打印数量
    numChange() {
      let num = String(this.formValidate.num);
      let result = num;
      // 只取数字
      if (num !== "" && num.replace(/\d/g, "") != "") {
        result = num.replace(/\D/g, "");
      }
      if (result === "" || result === "0") result = 1;
      // 扫描装箱情况限定100
      if (!this.formValidate.remove && result > 100) result = 100;
      this.formValidate.num = result;
    },
    // temu出库单额外要处理的数据
    temuDetail(data) {
      return new Promise((resolve, reject) => {
        // 整箱sku装完时自动弹出装箱重量弹框
        let skuUnBoxNum = this.skuUnBoxNumFun(data); // 计算未装箱sku数量
        if (skuUnBoxNum <= 0) {
          this.exceptionVisible = true;
          return resolve(true);
        }
        // SPU/SKC 如果spu装完自动完成装箱
        if (data.skcOrSpuCount <= 0) {
          this.pickingDetail = this.$common.copy(data); // 由于寄样标签需要spu，单个情况下来不及刷新列表数据
          let temp = {};
          temp.pickingId = this.rowData.pickingId;
          this.$refs["packException"].continuePacking(temp).then(() => {
            resolve(true);
          });
          return;
        }
        resolve(true);
      });
    },
    // temu获取寄样标签明细信息(goodsSku 扫描sku，如果不存在就是获取整单的寄样地址信息)
    temuGetDetail(goodsSku) {
      return new Promise((resolve) => {
        let { pickingId } = this.rowData;
        let [temp, sendSampleInfo] = [{}, this.sendSampleInfo];
        if (goodsSku) {
          let item = sendSampleInfo[goodsSku];
          // 已存在该sku的寄样标签信息
          if (item) return resolve(item);
          temp.goodsSku = goodsSku;
        } else {
          let item = sendSampleInfo[pickingId];
          if (item) return resolve(item); // 返回任一一条寄样地址信息
        }
        temp.pickingId = pickingId;
        this.axios
          .get(api.querySendLabelDetailInfo, { params: temp })
          .then(({ data }) => {
            if (!(data && data.code === 0)) return resolve({});
            let item = data.datas || {};
            if (goodsSku) {
              item.consigneeName1 = "收 " + item.consigneeName;
              item.sender1 = "寄 " + item.sender;
              item.goodsSku1 = "SKU货号 " + item.goodsSku;
              item.consigneeAddress1 = item.consigneeCity + item.consigneeAddress;
            }
            this.sendSampleInfo[goodsSku || temp.pickingId] = item;
            resolve(item);
          })
          .catch(() => {
            resolve({});
          });
      });
    },
  },
};
</script>
<style lang="less">
.packing-box-page {
  background-color: #fff;
  padding: 16px;

  .packing-head {
    border: none !important;

    .return-back {
      height: 52px;
      background: #2978e4;

      &>a {
        color: white;
      }
    }
  }

  .page-content {
    display: flex;
    align-items: flex-start;
    margin-top: 16px;

    .ivu-form-item {
      margin-bottom: 0;
    }

    .page-content__left {
      width: 40%;
      min-width: 400px;
      max-width: 800px;
      border: 2px solid #2978e4;
      border-radius: 2px;

      .page-content__left__title {
        height: 60px;
        background: #2978e4;
      }

      .left__title__flex {
        height: 100%;
        display: flex;
        align-items: center;

        .ivu-form-item,
        .ivu-form-item-label {
          color: #fff;
        }

        .left__title__flex__sku {
          flex: 1;
          max-width: 400px;
          overflow: hidden;

          .sku {
            width: 100%;
          }

          .ivu-input {
            border-radius: 2px;
          }
        }

        .left__title__flex__remove {
          width: 100px;
          overflow: hidden;
          margin-left: 10px;
        }
      }

      .page-content__left__main {
        display: flex;
        flex-direction: column;
        padding: 0 20px 20px;
        position: relative;

        .combination-tips {
          padding: 10px 0;
          font-size: 12px;
          font-weight: bold;
          color: rgb(255 0 1);
        }

        .combination .skuForm {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;

          .ivu-form-item {
            flex: 1;
          }
        }

        .left__main__back {
          width: 100%;
          padding: 10px;
          height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f1f1f1;
          box-sizing: border-box;

          .left__main__back__img {
            max-width: 100%;
            max-height: 100%;
            min-width: 200px;
            object-fit: cover;
          }
        }

        .single {
          text-align: center;
        }

        .page-content__left__spin {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }
      }
    }

    .page-content__right {
      width: 60%;
      margin-left: 16px;

      .page-content__right__detail {
        border: 1px solid #2978e4;
        border-radius: 2px;
        padding: 8px 0;
        margin-bottom: 10px;

        .special-span {
          font-size: 24px;
          font-weight: 500;
        }

        .mr30 {
          margin-right: 30px;
        }
      }

      .a-action {
        text-decoration: none;
        color: #2d8cf0;
      }
    }
  }

  .addstock-container {
    padding: 0px;
  }

  .num-style {
    width: 60px;
  }

  .inset-bag-page {
    padding: 10px;
    text-align: right;
  }
}
</style>
