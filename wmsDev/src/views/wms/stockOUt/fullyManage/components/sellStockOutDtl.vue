<template>
  <dyt-model :modalVisible.sync="modalVisible" @backList="backLists('back')" :pageLoading="pageLoading">
    <div slot="lefts">
      <Button type="primary" @click="saveObsoletepick(pickingItem.obsoletepick)" class="ml10"
        v-if="buttonEdit && pickingItem.detailOperator">
        {{ pickingItem.detailOperator }}
      </Button>
      <Button type="primary" @click="infoSave()" class="ml10" :disabled="!isChange" :loading="saveLoading"
        v-if="showSave">
        保存
      </Button>
      <Button @click="backLists('back')" class="ml10">取消</Button>
    </div>
    <div slot="rights" v-if="delPower">
      <Button type="error" @click="delObsoletePicking">删除</Button>
    </div>
    <div class="stockOutDlt formDetail sellStockPage">
      <statusStep :stepsInfo="detailApiObj" />
      <Tabs :value="name" @on-click="tabClick" :animated="false" class="mb10">
        <TabPane label="主信息" name="main" class="formWidth240 fmb0" :index="1">
          <Form :label-width="100" inline>
            <FormItem label="出库单编号：">
              <span>{{ detailApiObj.pickingNo }}</span>
            </FormItem>
            <FormItem label="出库单类型：">
              <span>全托管出库</span>
            </FormItem>
            <FormItem label="出库单状态：">
              <span v-if="pickingItem">{{ pickingItem.label }}</span>
            </FormItem>
            <FormItem label="发货仓库：">
              <span>{{ detailApiObj.warehouseName }}</span>
            </FormItem>
            <FormItem label="平台订单号：">
              <span>{{ detailApiObj.platformOrderNo }}</span>
            </FormItem>
            <FormItem label="参考编号：">
              <span>{{ detailApiObj.referenceNo }}</span>
            </FormItem>
            <FormItem label="拣货单编号：">
              <span v-for="(item, index) in detailApiObj.wmsPickingGoodsRelation" :key="index">
                <span>{{ index > 0 ? "," : "" }}{{ item.pickingGoodsNo }}</span>
              </span>
            </FormItem>
            <FormItem label="拣货状态：">
              <span v-for="(item, index) in detailApiObj.wmsPickingGoodsRelation" :key="index">
                <span v-if="packagePickStatus[item.packageGoodsRelationStatus]">
                  {{ index > 0 ? "," : "" }}
                  {{
                    packagePickStatus[item.packageGoodsRelationStatus].label
                  }}</span>
              </span>
            </FormItem>
            <FormItem label="创建人：">
              <span>{{ detailApiObj.createName }}</span>
            </FormItem>
            <FormItem label="创建时间：">
              <span>{{ $uDate.dealTime(detailApiObj.createdTime) }}</span>
            </FormItem>
            <FormItem label="最后修改人：">
              <span>{{ detailApiObj.updateName }}</span>
            </FormItem>
            <FormItem label="最后修改时间：">
              <span>{{ $uDate.dealTime(detailApiObj.updatedTime) }}</span>
            </FormItem>
            <FormItem label="平台主体：">
              <span v-if="outListTypeList[detailApiObj.platformType]">{{
                outListTypeList[detailApiObj.platformType].label
              }}</span>
            </FormItem>
            <FormItem label="店铺：">
              <span>{{ detailApiObj.saleAccount || "" }}</span>
            </FormItem>
            <FormItem label="质检类型：">
              <span v-if="checkTypeList[detailApiObj.qualityCheckType]">{{
                checkTypeList[detailApiObj.qualityCheckType].label
              }}</span>
            </FormItem>
            <FormItem label="质检比例：">
              <span>{{ detailApiObj.showQualityCheckScale }} %</span>
            </FormItem>
            <FormItem label="订单类型：">
              <span v-if="orderTypeList[detailApiObj.orderType]">{{
                orderTypeList[detailApiObj.orderType].label
              }}</span>
            </FormItem>
            <FormItem label="匹配库存模式：">
              <span v-if="autoInventoryList[detailApiObj.distributionType]">{{
                autoInventoryList[detailApiObj.distributionType].label
              }}</span>
            </FormItem>
            <FormItem label="备注：">
              <Input v-model.trim="mainInfo.fbaRemark" type="textarea" :autosize="{ minRows: 2, maxRows: 7 }"
                placeholder="备注信息" v-if="remarkEdit"></Input>
              <span v-else>{{ detailApiObj.fbaRemark || "" }}</span>
            </FormItem>
          </Form>
        </TabPane>
        <TabPane label="分配信息" name="assignInfo" :index="2">
          <assignPage :data="detailApiObj" />
        </TabPane>
        <TabPane label="货箱信息" name="boxingInfo" v-if="detailApiObj.pickingNewStatus > 1" :index="3">
          <containerList ref="containerList" :data="detailApiObj" :isEdit="isEdit" @searchData="searchData"
            @backLists="backLists" @infoSave="infoSave" @containerChange="containerChange" />
        </TabPane>
        <!-- <TabPane :label="valAddServiceLabel" name="valAddService" :index="4"
          v-if="[4, '4'].includes(detailApiObj.pickingNewStatus)">
          <valAddService :valAddServiceData="detailApiObj" @searchData="searchData" :list="completeList" />
        </TabPane> -->
      </Tabs>
      <!-- 商品-->
      <productManage ref="productManage" :data="detailApiObj" :isEdit="isEdit" @infoSave="infoSave"
        @searchData="searchData" @backEdit="backEdit" @productChange="productChange" @backLists="backLists"
        @returnProductData="returnProductData" />
      <!-- 操作日志 -->
      <template v-if="['detail'].includes(isEdit)">
        <optionDaily :operationLog="optionNoteData" from="directStock" :params="{
          pickingId: detailApiObj.pickingId,
          relatedBusinessNo: detailApiObj.pickingNo,
        }
          " @addSuccessBack="searchData" falgType="otherStockOut"
          :isHide="!getPermission('wmsDirectPicking_createLog')">
        </optionDaily>
      </template>
      <Spin size="large" fix v-if="beingCreateBoxing">
        出库单打包中，请耐心等待...
      </Spin>
    </div>
  </dyt-model>
</template>
<script>
import Big from "big.js";
import api from "@/api/api";
import statusStep from "./statusStep";
import optionDaily from "@/views/wms/components/common/commonDaily";
import {
  outListTypeList,
  arrayToObj,
  statusReturn,
  packageStatusList,
  checkTypeList,
  packagePickStatus,
  orderTypeList,
  autoInventoryList,
} from "./fileData";
import { getWarehouseId } from "@/utils/getService";
import permission_mixin from "@/components/mixin/permission_mixin";
import assignPage from "./assignPage";
import productManage from "./productManage";
import containerList from "./containerList";
// import valAddService from "./valAddService";
const mainInfo = {
  fbaRemark: null,
};
export default {
  name: "fullySellStockOutDtl",
  mixins: [permission_mixin],
  components: {
    optionDaily,
    statusStep,
    assignPage,
    productManage,
    containerList,
    // valAddService,
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
    isEdit: {
      type: String,
      default: "",
    },
  },
  data() {
    const v = this;
    return {
      packagePickStatus: arrayToObj(packagePickStatus),
      beingCreateBoxing: false,
      name: "main",
      modalVisible: false,
      saveLoading: false,
      pageLoading: false,
      apiSendTypeList: [],
      apiLogisterList: [], // 物流商下拉
      mainInfo: {},
      addNotesInput: "",
      optionNoteData: [],
      detailApiObj: {},
      carrierId: "",
      deProductList: [], // 用来比较产品列表是否更改
      dataDeclare: [],
      label: (h) => {
        let list = v.detailApiObj.packageDeclareList || [];
        return h("div", [
          h("span", "申报信息"),
          h("Icon", {
            props: { type: "md-close" },
            style: {
              color: "#f00",
              marginLeft: "5px",
              display: !list.length ? "inline-block" : "none",
            },
          }),
          h("Icon", {
            props: { type: "md-checkmark" },
            style: {
              color: "#18b566",
              marginLeft: "5px",
              display: list.length ? "inline-block" : "none",
            },
          }),
        ]);
      },
      countryList: [],
      // reservoirList: {},
      packageStatusList: arrayToObj(packageStatusList),
      outListTypeList: arrayToObj(outListTypeList),
      checkTypeList: arrayToObj(checkTypeList),
      orderTypeList: arrayToObj(orderTypeList),
      autoInventoryList: arrayToObj(autoInventoryList),
      contentEdit: false,
      deMainInfo: {},
      changeList: { containerChange: false, productChange: false },
      productData: [],
      // valAddServiceLabel: (h) => {
      //   return h("div", [
      //     h("span", "增值服务"),
      //     h("Icon", {
      //       props: { type: "md-close" },
      //       style: {
      //         color: "#f00",
      //         marginLeft: "5px",
      //         display: v.tableList.length === 0 ? "inline-block" : "none",
      //       },
      //     }),
      //     h("Icon", {
      //       props: { type: "md-checkmark" },
      //       style: {
      //         color: "#18b566",
      //         marginLeft: "5px",
      //         display: v.tableList.length !== 0 ? "inline-block" : "none",
      //       },
      //     }),
      //   ]);
      // },
    };
  },
  computed: {
    warehouseId() {
      return this.$store.state.warehouseId || getWarehouseId();
    },
    pickingItem() {
      return statusReturn(this.detailApiObj.pickingNewStatus) || {};
    },
    // 保存是否有变动
    isChange() {
      let [arr] = [[]];
      let fun = (name, deName) => {
        return JSON.stringify(this[name]) === JSON.stringify(this[deName]);
      };
      arr.push(!fun("mainInfo", "deMainInfo"));
      Object.keys(this.changeList).forEach((key) => {
        arr.push(this.changeList[key]);
      });
      return !!arr.filter((k) => k).length;
    },
    // 删除权限
    delPower() {
      const { pickingNewStatus } = this.detailApiObj;
      const power = this.getPermission("fullTrusteeshipPicking_delete");
      const allowOne = ["edit", "button"].includes(this.isEdit);
      const allowTwo = ["0", "1", "2", "13", "16"].includes(pickingNewStatus);
      return power && allowOne && allowTwo;
    },
    // 编辑进来的
    savePower() {
      return (
        ["edit"].includes(this.isEdit) &&
        this.getPermission("fullTrusteeshipPicking_update")
      );
    },
    // 按钮进来具保存权限
    buttonPower() {
      return (
        this.buttonEdit && this.getPermission("fullTrusteeshipPicking_update")
      );
    },
    // 按钮进来的
    buttonEdit() {
      return ["button"].includes(this.isEdit);
    },
    // 具保存权限（完成分配前、打包装箱）可以保存
    showSave() {
      let status = ["0", "1", "14"].includes(
        this.detailApiObj.pickingNewStatus
      );
      return this.savePower || (status && this.buttonPower);
    },
    // 备注是否可以编辑
    remarkEdit() {
      let status = ["0", "1", "2"].includes(this.detailApiObj.pickingNewStatus);
      return this.savePower || (this.buttonEdit && status);
    },
    // completeList() {
    //   let list = this.$common.copy(this.productData).map(k => {
    //     k.replacePackingNumber = k.replacePackingNumber || 0;
    //     return k;
    //   })
    //   return list;
    // },
    // tableList() {
    //   return this.completeList.filter(k => {
    //     return k.replacePackingNumber > 0;
    //   });
    // },
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
  methods: {
    containerChange(e) {
      this.changeList.containerChange = e;
    },
    productChange(e) {
      this.changeList.productChange = e;
    },
    // 改动记录
    backEdit() {
      this.contentEdit = true;
    },
    // 窗口打开
    open() {
      this.name = "main";
      this.contentEdit = false;
      this.detailApiObj = {};
      this.mainInfo = this.$common.copy(mainInfo);
      this.searchData();
      // this.getWareAreaGroup();
      this.modalVisible = true;
    },
    // 关闭窗口
    backLists(type) {
      this.modalVisible = false;
      if (!this.contentEdit && ["back"].includes(type)) return;
      this.$emit("backReturn");
    },
    tabClick(name) {
      if (name === "logistic") {
        this.axios
          .get(api.get_logisterList + `?carrierId=${null}`)
          .then((res) => {
            if (res.data.code === 0) {
              this.apiLogisterList = res.data.datas;
              if (this.detailApiObj.logisticsDealerCode) {
                let obj = this.apiLogisterList.filter((i) => {
                  return i.code === this.detailApiObj.logisticsDealerCode;
                });
                this.logisticDealerChange({
                  value: obj[0].code,
                  code: obj[0].code,
                });
              }
            }
          });
      } else if (name === "receiver") {
        this.getCountrys();
      }
      this.name = name;
    },
    // 物流商信息
    logisticDealerChange(item) {
      if (!item) return;
      this.carrierId = this.apiLogisterList.find((val) => {
        return val.code === item.value;
      }).code;
      this.axios
        .get(api.get_sendType + `?carrierId=${this.carrierId}`)
        .then((res) => {
          if (res.data.code === 0) {
            this.apiSendTypeList = res.data.datas;
          }
        });
    },
    // 获取国家列表
    getCountrys() {
      if (
        localStorage.getItem("area") === undefined ||
        localStorage.getItem("area") === []
      ) {
        localStorage.removeItem("area");
      }
      if (
        localStorage.getItem("area") !== "null" &&
        localStorage.getItem("area")
      ) {
        this.countryList = JSON.parse(localStorage.getItem("area"));
      } else {
        this.axios.get(api.get_countrys).then((response) => {
          if (response.data.code === 0) {
            let data = response.data.datas;
            this.countryList = data;
            localStorage.setItem("area", JSON.stringify(data));
          }
        });
      }
    },
    // // 获取库区组下拉
    // getWareAreaGroup() {
    //   this.$store
    //     .dispatch("getReservoirList", { warehouseId: this.warehouseId })
    //     .then((list) => {
    //       this.reservoirList = arrayToObj(list, "warehouseBlockGroupId");
    //     });
    // },
    // 保存出库单
    saveObsoletepick(status) {
      status && this[status]();
    },
    // 信息保存
    async infoSave(cb) {
      let _self = this;
      let detailArr = [
        "pickingExtendId",
        "platformType",
        "saleAccount",
        "warehouseId",
        "pickingId",
      ];
      let temp = Object.assign({}, this.mainInfo);
      detailArr.forEach((key) => {
        temp[key] = this.detailApiObj[key];
      });
      let productComponent = this.$refs["productManage"];
      if (!productComponent.deliveryListData.length) {
        this.$Message.error("商品为空");
        return;
      }
      let containerComponent = _self.$refs["containerList"];
      let func = {
        // 商品信息保存
        product() {
          return new Promise((resolve) => {
            temp.queryPickingGoodsResult = productComponent.deliveryListData.map((k) => {
              let columns = {
                barCode: 'barCode',
                productGoodsId: 'productGoodsId',
                expectedNumber: 'expectedNumber',
                pickingDetailId: 'pickingDetailId',
                platSku: 'platformSku',
                platSkc: 'productSkcId',
                pickingDetailStatus: 'pickingDetailStatus',
                qualityCheckNumber: 'qualityCheckNumber',
              };
              let temp = {};
              Object.keys(columns).forEach((key) => {
                if (key === "expectedNumber") {
                  temp[key] = k[columns[key]] - 0;
                  return;
                }
                temp[key] = k[columns[key]];
              });
              return temp;
            });
            // 筛选出商品id
            let productIds = productComponent.deliveryListData.map((k) => k.pickingDetailId).filter((k) => k);
            // 要删除的商品id
            temp.removeDetailIds = _self.detailApiObj.queryPickingGoodsResult.map((k) => k.pickingDetailId).filter((k) => !productIds.includes(k));
            // 质检比例 = 总质检数量 / 总订单数量 * 100 %，百分比保留二位小数；
            // 质检类型，免检：当质检比例为0 %；全检：当质检比例为100 %；抽检：当质检比例为大于0 %，小于100 %；
            let qualityTotal = productComponent.deliveryListData.reduce((total, current) => {
              return total + (current.qualityCheckNumber || 0);
            }, 0);
            let expectedTotal = productComponent.deliveryListData.reduce((total, current) => {
              return total + (current.expectedNumber || 0);
            }, 0);
            let scaletotal = Number((new Big(qualityTotal).div(expectedTotal).times(100)).toFixed(2));
            scaletotal = new Big(scaletotal).div(100) - 0;
            let qualityCheckType = null;
            if (scaletotal === 0) qualityCheckType = '0';
            if (scaletotal === 1) qualityCheckType = '2';
            if (scaletotal > 0 && scaletotal < 1) qualityCheckType = '1';
            temp.qualityCheckType = qualityCheckType;
            temp.qualityCheckScale = scaletotal;
            resolve();
          });
        },
        // 装箱信息保存
        trusteeship() {
          return new Promise((resolve) => {
            if (!containerComponent) {
              resolve();
              return;
            }
            let list = containerComponent.tableList || [];
            if (!list.length) {
              resolve();
              return;
            }
            let arr = ["pickingBoxId", "platformBoxNo", "boxRemark"];
            temp.trusteeshipPickingBoxVOS = list.map((k) => {
              let obj = {};
              arr.forEach((key) => {
                obj[key] = k[key];
              });
              return obj;
            });
            resolve();
          });
        },
        // 发货单信息保存
        invoiceList() {
          return new Promise((resolve) => {
            if (!containerComponent) {
              resolve();
              return;
            }
            let list = containerComponent.invoiceList || [];
            if (!list.length) {
              resolve();
              return;
            }
            let arr = ["dispatchOrderFileId", "dispatchOrderNo"];
            temp.dispatchOrderFileList = list.map((k) => {
              let obj = {};
              arr.forEach((key) => {
                obj[key] = k[key];
              });
              return obj;
            });
            resolve();
          });
        },
        // 物流信息保存
        uploadData() {
          return new Promise((resolve, reject) => {
            if (!containerComponent) {
              resolve();
              return;
            }
            containerComponent.uploadData().then((resultData) => {
              let { valid, data } = resultData;
              if (!valid) {
                reject("验证不通过");
                return;
              }
              Object.keys(data).forEach((key) => {
                temp[key] = data[key];
              });
              resolve();
            });
          });
        },
      };
      await func.product();
      await func.trusteeship();
      await func.invoiceList();
      await func.uploadData();
      // console.log(temp);
      // return;
      !cb && (this.saveLoading = true);
      this.axios
        .post(api.fullManage_update, temp)
        .then((response) => {
          if (response.data.code === 0) {
            this.backEdit();
            if (cb) {
              cb();
            } else {
              this.$Message.success("保存成功");
              this.searchData();
            }
          }
        })
        .finally(() => {
          !cb && (this.saveLoading = false);
        });
    },
    // 货箱保存
    boxSave() {
      let {
        pickingNo,
        trusteeshipPickingBoxVOS,
        pickingId,
        queryPickingGoodsResult,
      } = this.detailApiObj;
      // 完成打包时，如果出库单所有商品的“待装箱数”为0，则可以完成打包
      let waitList = queryPickingGoodsResult.filter(
        (k) => k.waitQuantitySum > 0
      );
      this.$Modal.confirm({
        width: 550,
        title: `确认是否完成出库单的打包工作：<span style="color:#FF9900;">${pickingNo}</span>`,
        content: waitList.length
          ? '<div style="background-color: #e6f7ff;border:1px solid #66ccff;border-radius: 3px;display: inline-block;padding: 4px 8px;">提示：所有货箱完成装箱后，才能完成打包</div>'
          : "",
        loading: true,
        onOk: () => {
          if (waitList.length) {
            // 装箱列表
            let list = trusteeshipPickingBoxVOS || [];
            if (!list.length) {
              this.$Modal.remove();
              this.$Message.warning("请先进行装箱操作!");
              return;
            }
            //  检查出库单是否存在有“正在装箱”的货箱，完成打包失败
            let boxingList = list.filter((k) => [0, "0"].includes(k.boxStatus));
            if (boxingList.length) {
              this.$Modal.remove();
              this.$Message.warning("必须全部完成所有货箱装箱，才能完成打包!");
              return;
            }
          }
          this.axios
            .post(api.fullManage_finishPickingBox + pickingId)
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
    // 标记发货
    markShipment() {
      this.$Modal.confirm({
        width: 500,
        title: "操作提示",
        content: `确认是否完成出库单的发货工作：<span style="color:#FF9900;">${this.detailApiObj.pickingNo}</span>`,
        loading: true,
        onOk: () => {
          this.axios
            .post(api.directMoidfyDeliverGoods, [this.detailApiObj.pickingNo])
            .then((res) => {
              if (res.data.code === 0) {
                this.$Message.success("操作成功!");
                this.backLists();
              }
            })
            .finally(() => {
              this.$Modal.remove();
            });
        },
      });
    },
    // 完成上传文件
    uploadSave() {
      let containerComponent = this.$refs["containerList"];
      if (!containerComponent) {
        this.$Message.error("货箱组件获取异常，请联系技术人员!");
        return;
      }
      containerComponent.uploadFinish().then((resultData) => {
        let { valid, data } = resultData;
        if (!valid) return;
        let { pickingNo } = this.detailApiObj;
        this.$Modal.confirm({
          width: 500,
          title: "操作提示",
          content: `确认是否完成出库单的上传文件工作：<span style="color:#FF9900;">${pickingNo}</span>`,
          loading: true,
          onOk: () => {
            this.axios
              .post(api.fullManage_finishUploadFile, data)
              .then((res) => {
                if (res.data.code === 0) {
                  this.infoSave(() => {
                    this.$Message.success("操作成功");
                    this.backLists();
                  });
                }
              })
              .finally(() => {
                this.$Modal.remove();
              });
          },
        });
      });
    },
    // 查询出库单详情
    searchData(cb) {
      let obj = {
        pickingNo: this.detailData.pickingNo,
        warehouseId: this.warehouseId,
      };
      this.pageLoading = true;
      this.axios
        .post(api.fullManage_detail, obj)
        .then((res) => {
          if (res.data.code === 0) {
            let resData = res.data.datas || {};
            if (cb) {
              // 文件上传的获取文件需要更新信息，其余不需要更新
              cb(resData);
              return;
            }
            resData.problemNumbers = this.detailData.problemNumbers;
            resData.showQualityCheckScale = new Big(resData.qualityCheckScale || 0).times(100) - 0;
            this.detailApiObj = this.$common.copy(resData);
            Object.keys(this.mainInfo).forEach((key) => {
              this.mainInfo[key] = resData[key];
            });
            this.optionNoteData = resData.wmsPickingLog || [];
            // 保留编辑前的信息，用于比较差异
            this.deMainInfo = this.$common.copy(this.mainInfo);
            if (["2", "14"].includes(resData.pickingNewStatus)) {
              this.name = "boxingInfo";
            } else {
              this.$nextTick(() => {
                let containerComponent = this.$refs["containerList"];
                if (!containerComponent && this.name === "boxingInfo") {
                  this.name = "main";
                }
              });
            }
            this.boxDetermine();
          } else {
            this.$Message.warning({
              content: "详情加载失败",
              duration: 3,
            });
          }
        })
        .finally(() => {
          this.pageLoading = false;
        });
    },
    // 自动完成装箱
    boxDetermine() {
      let resData = this.detailApiObj;
      let queryPickingGoodsResult = resData.queryPickingGoodsResult || [];
      let trusteeshipPickingBoxVOS = resData.trusteeshipPickingBoxVOS || [];

      // 装箱中，信息分栏为“货箱信息”选中
      if (resData.pickingNewStatus != 14) return;
      // 所有商品的 已装箱数-待装箱数 大于或等于0
      let unboxGoodList = queryPickingGoodsResult.filter((k) => {
        let num = new Big(k.quantitySum || 0).minus(k.waitQuantitySum) - 0;
        return num < 0;
      });
      // 检查出库单是否存在有“正在装箱”的货箱，完成打包失败
      let boxingList = trusteeshipPickingBoxVOS.filter((k) =>
        [0, "0"].includes(k.boxStatus)
      );
      // console.log(unboxGoodList, boxingList);
      if (
        !trusteeshipPickingBoxVOS.length ||
        boxingList.length ||
        unboxGoodList.length
      )
        return;
      this.beingCreateBoxing = true;
      this.axios
        .post(api.fullManage_finishPickingBox + resData.pickingId)
        .then((res) => {
          if (res.data.code === 0) {
            this.$Message.success("打包完成~");
            this.backLists();
          }
        })
        .finally(() => {
          this.beingCreateBoxing = false;
        });
    },
    // 删除出库单
    delObsoletePicking() {
      this.$Modal.confirm({
        width: 500,
        title: "操作提示",
        content: `确认是否删除该出库单：<span style="color:#FF9900;">${this.detailApiObj.pickingNo}</span>`,
        loading: true,
        onOk: () => {
          this.axios
            .put(`${api.directObsoletePicking}${this.detailApiObj.pickingId}`)
            .then((res) => {
              if (res.data.code === 0) {
                this.$Message.success("删除成功");
                this.backLists();
              }
            })
            .finally(() => {
              this.$Modal.remove();
            });
        },
      });
    },
    returnProductData(data) {
      this.productData = data;
    }
  },
};
</script>
<style lang="less">
.sellStockPage {
  .mbfu10 {
    margin-bottom: -10px;
  }
}
</style>
