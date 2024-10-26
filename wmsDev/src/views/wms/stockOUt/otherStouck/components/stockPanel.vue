<template>
  <div class="stockPanel">
    <Tabs v-model="name" @on-click="tabClick">
      <TabPane label="主信息" name="main" :index="1">
        <Form :label-width="150" :rules="mainValidate" :model="mainInfo" ref="main" :inline="true"
          class="inline-form disable-color">
          <template v-if="isEdit &&
            (!detailData.pickingNewStatus ||
              detailData.pickingNewStatus === '0')
            ">
            <FormItem label="出库单类型：" prop="pickingType">
              <dyt-select v-model="mainInfo.pickingType">
                <Option :value="item.value" v-for="item in outListTypeList" :key="item.value" :label="item.label"
                  @click.native="pickingTypeChange(item.value)" />
              </dyt-select>
            </FormItem>
            <!-- temu出库 -->
            <FormItem label="出库类型：" prop="pickingSubType" v-show="mainInfo.pickingType === 'O11'" :rules="[
              {
                required: ['O11'].includes(mainInfo.pickingType),
                message: '出库类型必填',
                trigger: 'change',
                type: 'number',
              },
            ]">
              <dyt-select v-model="mainInfo.pickingSubType">
                <Option :value="item.value" v-for="item in issueTypeList" :key="item.value" :label="item.label"
                  @click.native="pickingSubTypeChange(item.value)" />
              </dyt-select>
            </FormItem>
            <FormItem label="参考编号：">
              <dytInput v-model.trim="mainInfo.referenceNo" placeholder="请输入"></dytInput>
            </FormItem>
            <FormItem label="店铺：" prop="saleAccount" :rules="[
              {
                message: '店铺必填',
                trigger: 'blur',
                required: ['O5', 'O6', 'O7', 'O11'].includes(
                  mainInfo.pickingType
                ),
              },
              {
                message: '店铺必填',
                trigger: 'change',
                required: ['O5', 'O6', 'O7', 'O11'].includes(
                  mainInfo.pickingType
                ),
              },
            ]" v-if="!['O20'].includes(mainInfo.pickingType)">
              <dyt-select v-if="['O11'].includes(mainInfo.pickingType) &&
                [1, '1'].includes(mainInfo.pickingSubType)
                " v-model="mainInfo.saleAccount">
                <Option v-for="(item, index) in temuShopList" :key="`temu-${index}`" :value="item.saleAccountId">
                  {{
                    `${item.account || ""}${[0, "0"].includes(item.temuStatus)
                      ? " (未授权)"
                      : [2, "2"].includes(item.temuStatus)
                        ? " (授权失效)"
                        : ""
                      }`
                  }}</Option>
              </dyt-select>
              <dytInput v-else v-model.trim="mainInfo.saleAccount" placeholder="请输入" />
            </FormItem>
            <template v-if="isBarn">
              <FormItem :label="pickingAccountLabel" prop="pickingAccount" :rules="{
                required: ['O8', 'O9', 'O19'].includes(mainInfo.pickingType),
                message: '必填',
                trigger: 'blur',
              }">
                <dytInput v-model.trim="mainInfo.pickingAccount" placeholder="请输入"
                  :maxlength="!!['O19'].includes(mainInfo.pickingType) ? 10 : ''"
                  :show-word-limit="!!['O19'].includes(mainInfo.pickingType)"></dytInput>
              </FormItem>
            </template>
            <template v-if="['O5'].includes(mainInfo.pickingType)">
              <FormItem label="标签类型：">
                <dyt-select v-model="mainInfo.labelType" :clearable="false">
                  <Option :value="item.value" v-for="item in labelTypeList" :key="item.value" :label="item.label" />
                </dyt-select>
              </FormItem>
            </template>
            <template v-if="['O20', 'O21'].includes(mainInfo.pickingType)">
              <FormItem :label="typeListObj[mainInfo.pickingType].oname + '商户编号：'" prop="ymsMerchantId">
                <Input v-model.trim="mainInfo.ymsMerchantId" placeholder="请输入" maxlength="10" show-word-limit>
                </Input>
              </FormItem>
            </template>
            <div>
              <FormItem label="备注：">
                <dytInput v-model.trim="mainInfo.fbaRemark" type="textarea" :autosize="{ minRows: 3, maxRows: 7 }"
                  placeholder="请输入" style="width: 590px"></dytInput>
              </FormItem>
            </div>
          </template>
          <div class="fmb10 form-disable-div" v-else>
            <FormItem label="出库单编号：">
              <div>{{ detailData.pickingNo }}</div>
            </FormItem>
            <FormItem label="出库单类型：">
              <template v-for="(item, index) in outListTypeList">
                <span v-if="item.value === detailData.pickingType" :key="index">{{ item.label }}</span>
              </template>
            </FormItem>
            <template v-if="mainInfo.pickingType === 'O11'">
              <FormItem label="出库类型：">
                <div v-if="issueTypeList[detailData.pickingSubType]">
                  {{ issueTypeList[detailData.pickingSubType].label }}
                </div>
              </FormItem>
            </template>
            <FormItem label="拣货单编号：">
              <div>
                <span v-if="pickingGoodsNoList.length <= 1">{{
                  pickingGoodsNoList[0] || ""
                }}</span>
                <Tooltip v-else placement="top" transfer max-width="500">
                  <span>{{ pickingGoodsNoList[0] || "" }}</span>
                  <div slot="content">
                    <span v-for="(item, index) in pickingGoodsNoList" :key="'pickingGoodsNo' + index">{{ item }}；</span>
                  </div>
                </Tooltip>
              </div>
            </FormItem>
            <FormItem label="出库单状态：">
              <template v-for="item in outListStatusList">
                <div class="disable-div" v-if="detailData.pickingNewStatus == item.value" :key="item.value">
                  <span v-if="boxStatusKey.includes(detailData.isUploadWytPackage) &&
                    [8, '8'].includes(detailData.pickingNewStatus) &&
                    ['O10'].includes(detailData.pickingType)
                    ">
                    {{
                      `${item.label || ""}(${boxStatus[detailData.isUploadWytPackage].txt
                      })`
                    }}
                  </span>
                  <span v-else>
                    {{ item.label }}
                  </span>
                </div>
              </template>
            </FormItem>
            <FormItem label="发货仓库：">
              <div>{{ detailData.warehouseName }}</div>
            </FormItem>
            <FormItem label="参考编号：">
              <div>
                <span>{{ detailData.referenceNo }}</span>
                <span style="margin-left: 10px">{{
                  detailData.shipmentId
                }}</span>
              </div>
            </FormItem>
            <FormItem label="拣货状态：">
              <div v-if="pickingGoodsList[detailData.pickingGoodsStatus]">
                {{ pickingGoodsList[detailData.pickingGoodsStatus].label }}
              </div>
            </FormItem>
            <FormItem label="创建时间：">
              <div>{{ $uDate.dealTime(detailData.createdTime) }}</div>
            </FormItem>
            <FormItem label="创建人：">
              <div>{{ detailData.createdBy }}</div>
            </FormItem>
            <FormItem label="最后修改时间：" key="updatedTime">
              <div>{{ $uDate.dealTime(detailData.updatedTime) }}</div>
            </FormItem>
            <FormItem label="最后修改人：" key="updatedBy">
              <div>{{ detailData.updatedBy }}</div>
            </FormItem>
            <FormItem label="店铺：" key="saleAccount" v-if="!['O20'].includes(mainInfo.pickingType)">
              <div v-if="!['O11'].includes(mainInfo.pickingType) ||
                !temuShopJson[detailData.saleAccount]
                ">
                {{ detailData.saleAccount }}
              </div>
              <div v-else-if="temuShopJson[detailData.saleAccount]">
                {{ temuShopJson[detailData.saleAccount].account || "" }}
                <span v-if="[0, '0'].includes(
                  temuShopJson[detailData.saleAccount].temuStatus
                )
                  ">
                  (未授权)
                </span>
                <span v-else-if="[2, '2'].includes(
                  temuShopJson[detailData.saleAccount].temuStatus
                )
                  ">
                  (授权失效)
                </span>
              </div>
            </FormItem>
            <template v-if="isBarn">
              <FormItem :label="pickingAccountLabel">
                <div>{{ detailData.pickingAccount }}</div>
              </FormItem>
            </template>
            <template v-if="['O5'].includes(mainInfo.pickingType)">
              <FormItem label="标签类型：">
                <div v-if="labelTypeList[detailData.labelType]">
                  {{ labelTypeList[detailData.labelType].label }}
                </div>
              </FormItem>
            </template>
            <template v-if="['O20', 'O21'].includes(mainInfo.pickingType)">
              <FormItem :label="typeListObj[mainInfo.pickingType].oname + '商户编号：'">
                <div>{{ detailData.ymsMerchantId }}</div>
              </FormItem>
            </template>
            <FormItem label="备注：">
              <div class="desc-line">{{ detailData.fbaRemark }}</div>
            </FormItem>
          </div>
        </Form>
      </TabPane>

      <TabPane label="收货人信息" name="receiver" :index="2">
        <Form :label-width="120" :rules="receiveValidate" :model="receiverInfo" ref="receiver" :inline="true"
          class="inline-form disable-color">
          <FormItem label="仓储名称/代码：" prop="warehouseName" :class="{
            'form-item-remove-required': ['O11', 'O20', 'O21'].includes(
              mainInfo.pickingType
            ),
          }">
            <dyt-select v-model.trim="receiverInfo.warehouseName" :disabled="isDisabled">
              <Option v-for="(item, index) in getWareHouseList" :key="index + 'getWareHouseList'"
                :value="item.warehouseId" :label="item.warehouseName"></Option>
            </dyt-select>
          </FormItem>
          <FormItem label="收货人名称：" prop="consigneeName" :rules="{
            required: isTemuSender,
            message: '收货人名称必填',
            trigger: 'blur',
          }">
            <dytInput v-model.trim="receiverInfo.consigneeName" :disabled="isDisabled" placeholder="请输入"></dytInput>
          </FormItem>
          <FormItem label="联系人：" prop="consigneeLinkMan">
            <dytInput v-model.trim="receiverInfo.consigneeLinkMan" :disabled="isDisabled" placeholder="请输入"></dytInput>
          </FormItem>
          <FormItem label="联系电话：" prop="consigneeLinkTel" :rules="[
            {
              required: isTemuSender,
              message: '联系电话必填',
              trigger: 'blur',
            },
            {
              pattern: $regular.isPhone,
              message: '请输入正确的手机号',
              trigger: 'blur',
            },
          ]">
            <dytInput v-model.trim="receiverInfo.consigneeLinkTel" :disabled="isDisabled" placeholder="请输入"></dytInput>
          </FormItem>
          <FormItem label="国家：" prop="consigneeCountry">
            <dyt-select v-model.trim="receiverInfo.consigneeCountry" :disabled="isDisabled">
              <Option v-for="(item, index) in formValidate.country" :key="index" :value="item.twoCode"
                :label="item.cnName">
              </Option>
            </dyt-select>
          </FormItem>
          <FormItem label="省/州：" prop="consigneeProvince">
            <dytInput v-model.trim="receiverInfo.consigneeProvince" :disabled="isDisabled" placeholder="请输入"></dytInput>
          </FormItem>
          <FormItem label="城市：" prop="consigneeCity" :rules="{
            required: isTemuSender,
            message: '城市必填',
            trigger: 'blur',
          }">
            <dytInput v-model.trim="receiverInfo.consigneeCity" :disabled="isDisabled" placeholder="请输入"></dytInput>
          </FormItem>
          <FormItem label="邮政编码：">
            <dytInput v-model.trim="receiverInfo.consigneeZipCode" :disabled="isDisabled" placeholder="请输入"></dytInput>
          </FormItem>
          <FormItem label="邮箱：" prop="consigneeMail">
            <dytInput v-model.trim="receiverInfo.consigneeMail" :disabled="isDisabled" placeholder="请输入"></dytInput>
          </FormItem>
          <FormItem :label="`详细地址${detailData.pickingNewStatus ? 1 : ''}：`" prop="consigneeAddress" :rules="{
            required: isTemuSender,
            message: '详细地址必填',
            trigger: 'blur',
          }">
            <dytInput v-model.trim="receiverInfo.consigneeAddress" :disabled="isDisabled" placeholder="请输入"></dytInput>
          </FormItem>
          <FormItem label="详细地址2：" v-if="detailData.pickingNewStatus" prop="consigneeAddressOther">
            <dytInput v-model.trim="receiverInfo.consigneeAddressOther" :disabled="isDisabled" placeholder="请输入">
            </dytInput>
          </FormItem>
          <template v-if="isTemuSender">
            <FormItem label="寄件人：" prop="sender">
              <dytInput v-model.trim="receiverInfo.sender" :disabled="isDisabled" placeholder="请输入" maxlength="30"
                show-word-limit></dytInput>
            </FormItem>
            <FormItem label="地址打印：" v-if="['4', '8', '11', '12'].includes(detailData.pickingNewStatus)
              ">
              <Button type="primary" @click="addressPrint">打印</Button>
            </FormItem>
          </template>

          <!-- 打印标签 -->
          <print-common ref="printCommon" :printModal.sync="printModal" :printData="printData"
            :pintField="pintField"></print-common>
        </Form>
      </TabPane>

      <!-- temu出库单类型 -->
      <TabPane label="质检" name="qualityTesting" :index="3" v-if="mainInfo.pickingType === 'O11'">
        <quality-test ref="qualityTesting" :detailData="detailData" :isEdit="isEdit"></quality-test>
      </TabPane>

      <!-- temu装完箱就可以编辑物流商信息 -->
      <TabPane label="物流商信息" name="logistic" :index="4" v-if="showLogisticians">
        <Form :label-width="100" :rules="logisValidate" :model="logisticInfo" ref="logistic" :inline="true"
          class="inline-form disable-color">
          <FormItem label="物流商：" prop="logisticsProvidersCode">
            <dyt-select v-model="logisticInfo.logisticsProvidersCode" @on-change="logisticDealerChange"
              :disabled="logisDisabled">
              <Option v-for="v in apiLogisterList" :value="v.code" :key="v.code" :label="v.name"></Option>
            </dyt-select>
          </FormItem>
          <FormItem label="物流商单号：">
            <div class="flexCenter">
              <dytInput v-model.trim="logisticInfo.logisticsProvidersNo" :disabled="logisDisabled || disabledProvidersNo"
                placeholder="请输入"></dytInput>
              <Button type="primary" @click="getLogisticInfo" class="ml10" :disabled="false" :loading="logisticLoading"
                v-if="isOutBoLabel &&
                  getPermission('wmsFbaPicking_obtainTrackingNumber') &&
                  !isEdit &&
                  isPms &&
                  logisticInfo.logisticsProvidersNo
                  ">获取</Button>
            </div>
          </FormItem>
          <FormItem label="邮寄方式：">
            <dyt-select v-model="logisticInfo.shippingMethod" placeholder="请先选择物流商" :disabled="logisDisabled">
              <Option v-for="v in apiSendTypeList" :value="v.name" :key="v.code" :label="v.name"></Option>
            </dyt-select>
          </FormItem>
          <FormItem label="跟踪号：">
            <dytInput v-model.trim="logisticInfo.trackingNumber" :disabled="logisDisabled" placeholder="请输入"></dytInput>
          </FormItem>
          <FormItem label="运输方式：" prop="transportMethod">
            <dyt-select v-model="logisticInfo.transportMethod" :disabled="logisDisabled">
              <Option v-for="(item, index) in shippingList" :value="item.value" :key="index + 'shippingList'"
                :label="item.label"></Option>
            </dyt-select>
          </FormItem>
          <div class="mt20" v-if="pintShow && getPermission('wmsFbaPicking_printBulkLabel') && isPms
            ">
            <FormItem>
              <Button type="primary" :disabled="!(
                detailData.fbaPickingBase &&
                detailData.fbaPickingBase.labelFlag == 1
              )
                " @click="printFbaboxLabel()" :loading="boxLabelLoading">打印{{ pickingTypeName }}大货标签</Button>
            </FormItem>
          </div>
        </Form>
      </TabPane>

      <TabPane label="申报信息" name="declareInfo" :index="5" v-if="detailData.pickingNewStatus > 0">
        <declare-info ref="declareInfo" class="disable-color" :detailData="detailData" :isEdit="isEdit"></declare-info>
      </TabPane>

      <TabPane label="货箱信息" name="containerInfo" :index="6" v-if="detailData.boxFinishStatus > 0">
        <container-info ref="containerInfo" class="disable-color" :detailData="detailData" :isEdit="isEdit">
        </container-info>
      </TabPane>

      <TabPane :label="pickingTypeName + '外箱标签'" name="outerbox" :index="7" v-if="!['O11'].includes(mainInfo.pickingType) &&
        detailData.boxFinishStatus > 1
        ">
        <outerbox-info ref="outerboxInfo" :detailData="detailData" :isEdit="isEdit" v-on="$listeners"></outerbox-info>
      </TabPane>

      <TabPane label="运费明细" name="freightDetails" :index="8" v-if="detailData.pickingNewStatus == 4">
        <freight-details ref="freightDetails" :detailData="detailData" :isEdit="isEdit"></freight-details>
      </TabPane>

      <!-- <TabPane :label="valAddServiceLabel" name="valAddService" :index="9"
        v-if="[4, '4'].includes(detailData.pickingNewStatus)">
        <valAddService :valAddServiceData="detailData" @searchData="searchData" />
      </TabPane> -->
    </Tabs>
  </div>
</template>

<script>
import api from "@/api/api";
import declareInfo from "./declareInfo";
import outerboxInfo from "./outerboxInfo";
import containerInfo from "./containerInfo";
import freightDetails from "./freightDetails";
import qualityTest from "./qualityTest";
import common from "@/components/mixin/common_mixin";
import {
  outListTypeList,
  shippingList,
  pickingGoodsList,
  issueTypeList,
  outListStatusList,
  labelTypeList,
} from "./fileData";
import printCommon from "@/views/wms/components/pirntCommon/index";
import { temuLabel } from "@/views/wms/stockOUt/otherStouck/components/fileData.js";
// import valAddService from "../fbaStockOut/valAddService";
export default {
  name: "stockPanel",
  mixins: [common],
  components: {
    declareInfo,
    containerInfo,
    outerboxInfo,
    freightDetails,
    qualityTest,
    printCommon,
    // valAddService,
  },
  props: {
    detailData: {
      // 详情数据
      type: Object,
      default() {
        return {};
      },
    },
    isEdit: {
      // 是否可编辑
      type: Boolean,
      default() {
        return false;
      },
    },
    workShow: {
      // 页面是列表还是详情
      type: String,
      default() {
        return "";
      },
    },
    pickingType: {
      // 出库单类型
      type: String,
      default() {
        return "";
      },
    },
  },
  data() {
    return {
      name: "main",
      oldPickingType: "",
      oldPickingSubType: "",
      mainInfo: {
        pickingType: "",
        referenceNo: "",
        pickingAccount: "",
        saleAccount: "",
        fbaRemark: "",
        pickingSubType: "",
        labelType: 0,
        ymsMerchantId: null,
      },
      mainValidate: {
        pickingType: [
          { required: true, message: "出库单类型必填", trigger: "change" },
        ],
        ymsMerchantId: [
          { required: true, message: "请输入", trigger: "blur" },
        ],
      },
      outListStatusList: outListStatusList,
      labelTypeList: labelTypeList,
      boxStatus: {
        0: { txt: "未上传" },
        1: { txt: "已上传" },
        2: { txt: "已确认" },
      },
      receiverInfo: {
        stockName: "",
        consigneeName: "",
        consigneeCountry: "",
        consigneeLinkMan: "",
        consigneeProvince: "",
        consigneeLinkTel: "",
        consigneeCity: "",
        consigneeMail: "",
        consigneeAddress: "",
        consigneeAddressOther: "",
        consigneeZipCode: "",
        warehouseName: "",
        sender: "",
      },
      receiveValidate: {
        consigneeLinkTel: [
          {
            pattern: this.$regular.isPhone,
            message: "请输入正确的手机号",
            trigger: "blur",
          },
        ],
        consigneeMail: [
          {
            pattern: this.$regular.isMailbox,
            message: "请输入正确的邮箱",
            trigger: "blur",
          },
        ],
        consigneeZipCode: [
          {
            pattern: this.$regular.postalCode,
            message: "请输入正确的邮政编码",
            trigger: "blur",
          },
        ],
        warehouseName: [
          { required: true, message: "仓储名称代码必填", trigger: "change" },
        ],
        sender: [{ required: true, message: "寄件人必填", trigger: "blur" }],
      },
      logisticInfo: {
        logisticsProvidersName: "",
        logisticsProvidersCode: "",
        logisticsProvidersNo: "",
        shippingMethod: "",
        trackingNumber: "", // JJD0002255585028851
        pickingId: "",
        transportMethod: "",
      },
      logisValidate: {
        logisticsProvidersCode: {
          required: true,
          message: "物流商必填",
          trigger: "blur",
        },
        transportMethod: {
          required: true,
          message: "运输方式必填",
          trigger: "blur",
        },
      },
      apiLogisterList: [], // 物流商下拉
      apiSendTypeList: [], // 邮寄方式下拉
      stockStatus: {
        0: { label: "订单创建", value: 0 },
        1: { label: "部分分配", value: 1 },
        2: { label: "分配完成", value: 2 },
        3: { label: "部分发货", value: 3 },
        4: { label: "完全发货", value: 4 },
        5: { label: "订单完成", value: 5 },
        99: { label: "订单作废", value: 99 },
      },
      outListTypeList: outListTypeList,
      logisticLoading: false,
      boxLabelLoading: false,
      pickingTypeName: "", // 类型名称
      shippingList: shippingList, // 运输方式
      warehousingOverseasList: [],
      pickingGoodsList: pickingGoodsList, // 拣货状态
      typeListObj: {}, // 对应的出库单状态信息
      issueTypeList: issueTypeList,
      printModal: false, // 打印弹框
      printData: [], // 打印的数据
      temuShopList: [], // Temu 店铺列表
      temuShopJson: {},
      // valAddServiceLabel: (h) => {
      //   return h("div", [
      //     h("span", "增值服务"),
      //     h("Icon", {
      //       props: { type: "md-close" },
      //       style: {
      //         color: "#f00",
      //         marginLeft: "5px",
      //         display: this.tableList.length === 0 ? "inline-block" : "none",
      //       },
      //     }),
      //     h("Icon", {
      //       props: { type: "md-checkmark" },
      //       style: {
      //         color: "#18b566",
      //         marginLeft: "5px",
      //         display: this.tableList.length !== 0 ? "inline-block" : "none",
      //       },
      //     }),
      //   ]);
      // },
    };
  },
  created() {
    let temp = {};
    outListTypeList.forEach((k) => {
      !temp[k.value] && (temp[k.value] = k);
    });
    this.typeListObj = temp;
    this.getTemuShopData();
  },
  watch: {
    detailData: {
      handler(val) {
        if (!val.pickingId) return;
        this.setData(JSON.parse(JSON.stringify(val)));
      },
      deep: true,
      immediate: true,
    },
    workShow: {
      handler(val) {
        if (["create", "detail"].includes(val)) this.getCountrys(); // 获取国家列表(方法在common_mixin中)
      },
      deep: true,
      immediate: true,
    },
    mainInfo: {
      handler(val) {
        this.$emit("getFormInfo", val || {});
      },
      deep: true,
      immediate: true,
    },
    "mainInfo.pickingType": {
      deep: true,
      immediate: true,
      handler(val) {
        const isRequired = !["O11", "O20", "O21"].includes(val);
        const warehouseName = [
          {
            required: isRequired,
            message: "仓储名称代码必填",
            trigger: "change",
            type: "string",
          },
        ];
        this.$set(this.receiveValidate, "warehouseName", warehouseName);
        if (val) {
          this.$nextTick(() => {
            this.$refs.receiver &&
              this.$refs.receiver.validateField("warehouseName");
          });
        }
      },
    },
  },
  computed: {
    // 收货人信息是否可以编辑
    isDisabled() {
      let { checkLogistics } = this.detailData.wmsPickingExtend || {};
      return !(
        this.isEdit &&
        (typeof checkLogistics === "undefined" || checkLogistics === "0")
      );
    },
    boxStatusKey() {
      const keys = Object.keys(this.boxStatus);
      const numberKeys = keys.map((k) => Number(k));
      return [...keys, ...numberKeys];
    },
    // 物流单号是否可编辑
    disabledProvidersNo() {
      const isUploadInfo = ["O10"].includes(this.getPickingType)
        ? [1, 2, "1", "2"].includes(this.detailData.isUploadWytPackage)
        : false;
      return isUploadInfo;
    },
    // 物流商信息编辑
    logisDisabled() {
      let pickingNewStatus = this.detailData.pickingNewStatus; // 出库单状态
      return !(
        this.isEdit &&
        pickingNewStatus != "99" &&
        this.showLogisticians
      );
    },
    // 是否显示获取物流信息按钮和打印大货标签
    pintShow() {
      let { pickingNewStatus } = this.detailData;
      return ["4", "8"].includes(pickingNewStatus);
    },
    // 物流商是否为派敏斯
    isPms() {
      let isPms = false;
      let logisticsProvidersCode = this.logisticInfo.logisticsProvidersCode;
      this.apiLogisterList.forEach((k) => {
        if (logisticsProvidersCode === k.code && k.isPms <= 0) isPms = true;
      });
      return isPms;
    },
    // 出库单类型
    getPickingType() {
      return this.mainInfo.pickingType || "";
    },
    // 出库单类型是否为谷仓、SHL、万邑通
    isBarn() {
      let { pickingType } = this.mainInfo;
      if (["O8", "O9", "O10", "O19"].includes(pickingType)) return pickingType;
      return false;
    },
    // 取可用的仓库类型“第三方”: warehouseType: 1 第三方 0 自营
    getWareHouseList() {
      let list = this.$store.state.warehouseList || [];
      return list.filter((k) => {
        return k.warehouseType == 1;
      });
    },
    // 是否上传外箱标签
    isOutBoLabel() {
      return ['4', '8', '12'].includes(this.detailData.pickingNewStatus);
    },
    // 处理拣货单号显示
    pickingGoodsNoList() {
      let pickingGoodsNo = this.detailData.pickingGoodsNo
        ? this.detailData.pickingGoodsNo.split(",")
        : [];
      return pickingGoodsNo;
    },
    // 出库单类型是否为temu拼多多且为寄样
    isTemuSender() {
      let { pickingType, pickingSubType } = this.mainInfo;
      return pickingType === "O11" && pickingSubType === 0;
    },
    // 展示物流商
    showLogisticians() {
      let temu = this.mainInfo.pickingType === "O11" && ["4", "8", "11", "12"].includes(this.detailData.pickingNewStatus);
      return temu || this.isOutBoLabel;
    },
    // 根据不同出库类型不同打印内容
    pintField() {
      return temuLabel["address"] || {};
    },
    pickingAccountLabel() {
      let label = '';
      let { pickingType } = this.mainInfo;
      let oname = this.typeListObj[this.isBarn] && this.typeListObj[this.isBarn].oname;
      if (["O8", "O9", "O10"].includes(pickingType)) {
        label = oname + '账号：';
      }
      if (["O19"].includes(pickingType)) {
        label = '客户代码：';
      }
      return label;
    },
    // completeList() {
    //   let list = this.$common.copy(this.detailData.fbaPickingDetailList || []).map(k => {
    //     k.vacuumizeNumber = k.vacuumizeNumber || 0;
    //     k.qualityNumber = k.qualityNumber || 0;
    //     return k;
    //   });
    //   return list;
    // },
    // tableList() {
    //   return this.completeList.filter(k => {
    //     return k.vacuumizeNumber > 0 || k.qualityNumber > 0;
    //   });
    // },
  },
  methods: {
    tabClick(name) { },
    // 提交表单(主信息/收货人信息/物流信息)
    handleSubmit(name) {
      return new Promise((resolve, reject) => {
        this.$refs[name].validate((valid) => {
          if (valid) {
            let data = this[name + "Info"];
            resolve(data);
          } else {
            this.name = name;
            resolve(false);
          }
        });
      });
    },
    // 出库类型改变
    pickingSubTypeChange(val) {
      if (["O11"].includes(this.mainInfo.pickingType)) {
        const isClear = [1, "1"].includes(val) || [1, "1"].includes(this.oldPickingSubType);
        if (!isClear) return;
        this.$set(this.mainInfo, "saleAccount", "");
      }
      this.oldPickingSubType = val;
    },
    // 出库单类型改变
    pickingTypeChange(val) {
      const isTemu = ["O11"].includes(val);
      const shopPequired = ["O5", "O6", "O7", "O11", "O20", "O21"].includes(val);
      const isOldTemu = ["O11"].includes(this.oldPickingType);
      if (!isTemu) {
        this.$set(this.mainInfo, "pickingSubType", "");
      }
      if (isTemu || isOldTemu) {
        this.$set(this.mainInfo, "saleAccount", "");
      }
      this.oldPickingType = val;
      this.$nextTick(() => {
        if (!shopPequired) {
          this.$refs.main && this.$refs.main.validateField("saleAccount");
        }
      });
    },
    // 获取 temu 店铺数据
    getTemuShopData() {
      this.temuShopJson = {};
      this.temuShopList = [];
      let queryParams = {};
      if (
        !this.isEdit ||
        !(
          !this.detailData.pickingNewStatus ||
          this.detailData.pickingNewStatus === "0"
        )
      ) {
        queryParams.isAdmin = true;
      }
      this.axios
        .get(api.queryTemuAccounts, {
          params: queryParams,
        })
        .then(({ data }) => {
          if (!data || data.code !== 0) return;
          (data.datas || []).forEach((item) => {
            this.$set(this.temuShopJson, item.saleAccountId, item);
          });
          this.temuShopList = data.datas || [];
        });
    },
    // 提交信息(formName 表单类名 tabName 选项卡位置) (提交申报信息/提交箱唛信息/提交运费明细信息)
    async handleCommon(formName, tabName) {
      // console.log(formName, tabName);
      // console.log(this.$refs[formName], 33);
      let data = await this.$refs[formName].handleSubmit();
      if (!data) {
        this.name = tabName;
        return;
      }
      return data;
    },
    // 获取物流商列表
    getlosgisList() {
      return this.axios
        .get(api.get_logisterList + `?carrierId=${null}`)
        .then(({ data }) => {
          if (data && data.code === 0) {
            this.apiLogisterList = data.datas || []; // 列表值如果是PMS 0,其他为 1
          }
        });
    },
    // 物流商选择
    logisticDealerChange(e) {
      let selectList = this.apiLogisterList.filter((k) => {
        return k.code === e;
      });
      let item = selectList[0] || {};
      this.logisticInfo.logisticsProvidersCode = item.code || "";
      this.logisticInfo.logisticsProvidersName = item.name || "";
      if (!item.code) return;
      // 清空邮寄方式
      this.logisticInfo.shippingMethod = "";
      this.apiSendTypeList = [];
      this.getsendType(item.code);
    },
    // 获取邮寄方式
    getsendType(carrierId) {
      this.axios
        .get(api.get_sendType + `?carrierId=${carrierId}`)
        .then(({ data }) => {
          if (data && data.code === 0) {
            this.apiSendTypeList = data.datas || [];
          }
        });
    },
    // 详情数据获取
    setData(data) {
      // 主信息赋值
      Object.keys(this.mainInfo).forEach((k) => {
        (data[k] || data[k] === 0) && (this.mainInfo[k] = data[k]);
      });
      this.oldPickingType = this.mainInfo.pickingType;
      this.oldPickingSubType = this.mainInfo.pickingSubType;
      // 收货人赋值
      let wmsPickingExtend = data.wmsPickingExtend || {}; // 收货人信息
      Object.keys(this.receiverInfo).forEach((k) => {
        (wmsPickingExtend[k] || wmsPickingExtend[k] === 0) &&
          (this.receiverInfo[k] = wmsPickingExtend[k]);
      });

      // 物流商信息
      let fbaPickingBase = data.fbaPickingBase || {};
      Object.keys(this.logisticInfo).forEach((k) => {
        (fbaPickingBase[k] || fbaPickingBase[k] === 0) &&
          (this.logisticInfo[k] = fbaPickingBase[k]);
      });
      this.logisticInfo.pickingId = data.pickingId;

      // 类型名称
      this.outListTypeList.forEach((k) => {
        if (k.value === data.pickingType) {
          this.pickingTypeName = k.oname || "";
        }
      });

      if (!this.showLogisticians) return;
      this.getlosgisList().then(() => {
        // 获取物流商
        let { logisticsProvidersCode } = this.logisticInfo;
        logisticsProvidersCode && this.getsendType(logisticsProvidersCode); // 获取物流商下的邮寄方式
      });
    },
    // 根据物流单号更新物流信息和获取大货标签
    getLogisticInfo() {
      let logisticsProvidersNo = this.logisticInfo.logisticsProvidersNo;
      if (!logisticsProvidersNo) {
        this.$Message.error("物流单号不能为空!");
        return;
      }

      let temp = {};
      temp.pickingId = this.detailData.pickingId;
      temp.packageCode = logisticsProvidersNo;

      this.logisticLoading = true;
      this.axios
        .post(api.obtainTrackingNumber, temp)
        .then((res) => {
          if (res.data.code === 0) {
            this.$Message.success("获取成功~");
            this.$emit("searchData"); // 调用详情
          }
        })
        .finally(() => {
          this.logisticLoading = false;
        });
    },
    // 打印FBA大货标签
    printFbaboxLabel() {
      let logisticsProvidersNo = this.logisticInfo.logisticsProvidersNo;
      if (!logisticsProvidersNo) return;
      this.boxLabelLoading = true;
      this.axios
        .post(api.printBulkLabel, { packageCode: logisticsProvidersNo })
        .then(({ data }) => {
          if (!(data && data.code === 0)) return;
          window.open(data.datas[0]);
          // let url = data.datas && data.datas[0];
          // window.open('/wms-service/static/pdf/web/viewer.html?file=' + url);
        })
        .finally(() => {
          this.boxLabelLoading = false;
        });
    },
    // 地址标签打印
    addressPrint() {
      this.printData = [];
      let printData = this.$common.copy(this.receiverInfo);
      printData.consigneeName1 = "收货人名称：" + printData.consigneeName;
      printData.consigneeLinkTel1 = "联系电话：" + printData.consigneeLinkTel;
      let address = printData.consigneeCity + printData.consigneeAddress;
      printData.consigneeAddress1 = "详细地址：" + address;
      printData.consigneeAddress2 = address;
      printData.printNum = 1;
      this.printData.push(printData);
      this.printModal = true;
    },
    searchData() {
      this.$emit("searchData"); // 调用详情
    },
  },
};
</script>

<style lang="less">
.stockPanel {
  .inline-form {

    .ivu-select-selection,
    .ivu-input-wrapper {
      width: 240px;
    }

    .form-disable-div .ivu-form-item-content {
      width: 240px;
    }

    .ivu-form-item {
      margin-bottom: 20px;
    }

    .desc-line {
      padding-top: 5px;
      line-height: 22px;
    }
  }

  .fmb10 {
    .ivu-form-item {
      margin-bottom: 8px;
    }
  }

  .form-item-remove-required {
    &.ivu-form-item-required {
      .ivu-form-item-label:before {
        display: none;
      }
    }
  }
}
</style>
