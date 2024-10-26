<template>
  <div>
    <div class="topper">
      <div class="arrowLeft" @click="closeOrder()">
        <Icon type="ios-arrow-back" class="IconBack"></Icon>返回
      </div>
      <div style="margin-left: 130px; position: absolute">
        <Button @click="closeOrder">取消</Button>
        <Button type="primary" @click="save" v-if="checkType == 2" style="margin-left: 10px">保存</Button>
      </div>
    </div>
    <div class="mainContent fmb10" style="margin-top: -17px">
      <Form ref="form" :model="formItem" :label-width="132" :rules="ruleValidate">
        <div class="paraTitle mb10">
          采购单号：{{ formItem.purchaseNumber || "-" }}
        </div>
        <div class="ml10">
          <div class="paraTitle borb titleLeft">基本信息</div>
          <div class="basic-information">
            <FormItem label="采购员:">
              <span>{{
                purchaserArr[formItem.purchaserId] &&
                purchaserArr[formItem.purchaserId].userName
              }}</span>
            </FormItem>
            <FormItem label="备货仓库:">
              <span>{{ formItem.backupWarehouseName || "-" }}</span>
            </FormItem>
            <FormItem label="供应商:">
              <span>{{ formItem.supplierName }}</span>
            </FormItem>
            <FormItem label="备货类型:">
              <span v-if="formItem.readyType == 0">{{ "急采" }}</span>
              <span v-if="formItem.readyType == 1">{{ "普通备货" }}</span>
              <span v-if="formItem.readyType == 2">{{ "海外仓备货" }}</span>
              <span v-if="formItem.readyType == 3">{{ "FBA备货" }}</span>
              <span v-if="formItem.readyType == 4">{{ "全托管备货" }}</span>
              <span v-if="formItem.readyType == 5">{{ "直发备货" }}</span>
            </FormItem>
            <FormItem label="结算方式:">
              <span>{{ formItem.settleTypeName }}</span>
            </FormItem>
            <FormItem label="下单商品金额:">
              <span>{{ formItem.supplierName == "*" ? "*" : formItem.totalPrice }}</span>
            </FormItem>
            <FormItem label="超发商品金额:">
              <span>{{ formItem.sumOvershootPrice == "*" ? "*" : formItem.sumOvershootPrice || 0 }}</span>
            </FormItem>
            <FormItem label="运费:" prop="freightCharge">
              <div v-if="checkType == 1">{{ formItem.freightCharge }}</div>
              <div v-else>
                <Input v-model="formItem.freightCharge"> </Input>
              </div>
            </FormItem>
            <FormItem label="优惠:">
              <span>{{ formItem.discountAmount }}</span>
            </FormItem>
            <FormItem label="币种:">
              <span>{{ formItem.currency }}</span>
            </FormItem>
            <FormItem label="订单金额:">
              <span class="colorRed">{{ formItem.supplierName == "*" ? "*" : formItem.totalAmount }}</span>
            </FormItem>
            <FormItem label="已付金额:">
              <span class="colorRed">{{ formItem.supplierName == "*" ? "*" : formItem.paidAmount || 0 }}</span>
            </FormItem>
            <FormItem label="收库商品金额:">
              <span class="colorRed">{{ formItem.supplierName == "*" ? "*" : shelvesTotalPrice }}</span>
            </FormItem>
            <FormItem label="收库金额:">
              <span class="colorRed">{{ formItem.receiptAmount }}</span>
            </FormItem>
            <FormItem label="采购类型:">
              <span>{{ supplierTypeArr[formItem.supplierType] && supplierTypeArr[formItem.supplierType].dataDesc }}</span>
            </FormItem>
            <FormItem label="下单数量:">
              <span class="colorRed">{{ formItem.salesNumberTotal }}</span>
            </FormItem>
            <FormItem label="超发数量:">
              <span class="colorRed">{{ formItem.sumOvershootNumber || 0 }}</span>
            </FormItem>
            <FormItem label="取消数量:">
              <span class="colorRed">{{ formItem.surplusQuantityTotal }}</span>
            </FormItem>
            <FormItem label="少货数量:">
              <span class="colorRed">{{ formItem.lessGoodsQuantityTotal }}</span>
            </FormItem>
            <FormItem label="未发货数量:">
              <span class="colorRed">{{ formItem.notDespatchNumberTotal }}</span>
            </FormItem>
            <FormItem label="已发货数量:">
              <span class="colorRed">{{ formItem.despatchNumberTotal }}</span>
            </FormItem>
            <FormItem label="收货正品数量:">
              <span class="colorRed">{{ formItem.shelveNumberTotal }}</span>
            </FormItem>
            <FormItem label="收货次品数量:">
              <span class="colorRed">{{
                formItem.substandardNumberTotal
              }}</span>
            </FormItem>
            <FormItem label="未收货数量:">
              <span class="colorRed">{{ formItem.notReceivedNumberTotal }}</span>
            </FormItem>
            <FormItem label="未收库商品金额:">
              <span>{{ formItem.notReceiptAmount }}</span>
            </FormItem>
            <FormItem label="1688账号类型:">
              <span v-if="checkType == 1">{{ formItem.alibabaAccountType }}</span>
              <dyt-select v-else v-model="formItem.alibabaAccountType" filterable clearable placeholder="请选择">
                <Option v-for="(item, index) in alibabaList" :value="item.label" :key="index">{{ item.label }}
                </Option>
              </dyt-select>
            </FormItem>
            <FormItem label="所属事业部:">
              <span>{{ formItem.businessDeptName }}</span>
            </FormItem>
            <FormItem label="外部流水号:">
              <div v-if="checkType == 1" class="textOver" :title="formItem.externalSerialNo">
                {{ formItem.type == 2 ? formItem.aliPlatformOrderNo : formItem.externalSerialNo }}
              </div>
              <template v-else>
                <Input v-if="formItem.type == 2" v-model="formItem.aliPlatformOrderNo" />
                <Input v-else v-model="formItem.externalSerialNo" />
              </template>
            </FormItem>
            <FormItem label="总重量(g):">
              <span>{{ formItem.weightTotal }}</span>
            </FormItem>
            <FormItem label="质检类型:">
              <span v-if="formItem.checkType == 0">免检</span>
              <span v-if="formItem.checkType == 1">抽检</span>
              <span v-if="formItem.checkType == 2">全检</span>
            </FormItem>
            <FormItem label="1688运费:">
              <span>{{ formItem.aliPlatformFreightAmount }}</span>
            </FormItem>
            <FormItem label="下单状态:">
              <span v-if="formItem.status">{{ examineStatusList[formItem.status - 1].label }}</span>
            </FormItem>
            <FormItem label="下单时间:">
              <span>{{ getDataToLocalTime(formItem.orderTime, "fulltime", true) }}</span>
            </FormItem>
            <FormItem label="发货要求:">
              <div class="textOver" :title="formItem.requireDespatch">
                {{ formItem.requireDespatch }}
              </div>
            </FormItem>
            <FormItem label="质检总比例:">
              <span> {{ formItem.checkRateSum }}%</span>
            </FormItem>
            <FormItem label="1688实际付款金额:">
              <span>{{ formItem.aliPlatformOrderAmount }}</span>
            </FormItem>
            <FormItem label="平台订单号:">
              <span>{{ formItem.platformOrderNo }}</span>
            </FormItem>
            <!-- <FormItem label="供应商类型:">
              <span>{{
                supplierTypeArr[formItem.supplierType] &&
                supplierTypeArr[formItem.supplierType].dataDesc
              }}</span>
            </FormItem> -->
            <!-- <FormItem label="总商品金额:">
              <span>{{
                formItem.supplierName == "*" ? "*" : formItem.totalPrice
              }}</span>
            </FormItem> -->
            <!-- <FormItem label="已收库商品总金额:">
              <span class="colorRed">{{
                formItem.supplierName == "*" ? "*" : shelvesTotalPrice
              }}</span>
            </FormItem> -->
          </div>
          <!-- 编辑备注 -->
          <template>
            <add-remark :isVisible.sync="isEditRemark" :showRemarkList="showRemarkList"
              :purchaseId="formItem.purchaseId"></add-remark>
          </template>
        </div>
        <div v-if="formItem.setupStatus">
          <div class="titleLeft" style="font-size: 16px; font-weight: bold; margin-top: 40px">
            1688信息
          </div>
          <div style="border-top: 1px dashed #dddee1; margin: 5px 0"></div>
          <Row class="normalTop">
            <Col :span="4">
            <FormItem label="1688账号：">
              <span>{{ formItem.aliAccount }}</span>
            </FormItem>
            </Col>
            <Col :span="4" :offset="2">
            <template>
              <FormItem label="1688交易方式：">
                <span v-if="formItem.aliTradeType == 'fxassure'">{{
                  "担保交易"
                }}</span>
                <span v-if="formItem.aliTradeType == 'creditBuy'">{{
                  "先采后付（免费赊账）"
                }}</span>
                <span v-if="formItem.aliTradeType == 'period'">{{
                  "账期交易"
                }}</span>
                <span v-if="formItem.aliTradeType == 'bank'">{{
                  "银行转账"
                }}</span>
              </FormItem>
            </template>
            </Col>
            <Col :span="4" :offset="2">
            <template>
              <FormItem label="1688订单：">
                <span>{{
                  formItem.aliOrderType == 0
                  ? "大市场普通订单"
                  : "代销市场订单"
                }}</span>
              </FormItem>
            </template>
            </Col>
          </Row>
          <Row>
            <Col :span="10">
            <FormItem label="1688留言：">
              <span>{{ formItem.aliRemarks }}</span>
            </FormItem>
            </Col>
          </Row>
          <!-- <Row class="normalTop">
            <Col :span="10">
              <FormItem label="采购备注">
                <Input
                  v-model="accountParamQO.purchaseMessage"
                  type="textarea"
                  :rows="2"
                ></Input>
              </FormItem>
            </Col>
          </Row> -->
        </div>

        <div class="formSearch ml10" style="padding: 0; margin-top: 40px">
          <div class="paraTitle mb10 titleLeft">采购定制</div>
          <div class="basic-information">
            <FormItem label="允许超发：">
              {{ overshootState ? '是' : '否' }}
            </FormItem>
            <FormItem label="允许超发状态：" v-if="overshootState">
              <!-- <span :style="overshootText.style">{{ overshootText.text.replace('(', '').replace(')', '') }}</span> -->
              {{ overshootText.text }}
            </FormItem>
            <FormItem label="打印商品标签：">
              {{ `${isThirdPartyTag ? '第三方标签' : 'LAPA标签'}` }}
            </FormItem>
            <FormItem label="第三方商品标签：" v-if="isThirdPartyTag">
              {{ thirdPartyTagName }}
            </FormItem>
          </div>
          <div>
            <FormItem label="来货特项：">
              <template v-if="formItem.comingSpecial">
                <span v-for="(item, index) in formItem.comingSpecial.split(',')" :key="index">
                  <span>
                    {{ index > 0 ? ',' : '' }}
                    {{ productTagList[item] ? productTagList[item].comingSpecial : item }}
                  </span>
                </span>
              </template>
            </FormItem>
          </div>
        </div>

        <div class="formSearch ml10" style="padding: 0; margin-top: 40px">
          <div class="paraTitle borb titleLeft">商品信息</div>
          <div class="product-info-head">
            <FormItem label="SKU收货状态:" :label-width="100">
              <RadioGroup v-model="skuStatus" type="button" size="small" @on-change="filterSku" button-style="solid">
                <Radio :label="item.value" v-for="(item, index) in statusList" :key="index">{{ item.label }}</Radio>
              </RadioGroup>
            </FormItem>
          </div>
          <div class="table-box">
            <Table highlight-row max-height="590" :columns="columns" :data="tableList" :border="true"
              :loading="Tableloading">
              <template slot-scope="{ row }" slot="basic">
                <basicDataCom :dataRow="row" :isOrderChange="isOrderChange" :enterType="'detail'">
                  <span>{{ row.purchaseNumber }}</span>
                </basicDataCom>
                <div></div>
              </template>
              <template slot-scope="{ row }" slot="weight">
                <div>{{ row.weight }}</div>
              </template>
              <template slot-scope="{ row }" slot="stock">
                <div>可用：{{ row.availableNumber }}</div>
                <div>未发：{{ row.onWayNoDespatchNumber }}</div>
                <div>在途：{{ row.onWayDespatchNumber }}</div>
              </template>
              <template slot-scope="{ row }" slot="price">
                <div>
                  原价：{{
                    formItem.supplierName == "*" ? "*" : row.currentCost
                  }}
                </div>
                <div>
                  单价：{{ formItem.supplierName == "*" ? "*" : row.unitPrice }}
                </div>
              </template>
              <template slot-scope="{ row }" slot="requireDespatchTime">
                <div style="width: 70px">
                  {{
                    intercepTime(row.queryOrderInfoListVO.requireDespatchTime)
                  }}
                </div>
              </template>
              <template slot-scope="{ row }" slot="logistic">
                <div>
                  发货单号：
                  <span class="clickGesture" @click="showDeliverOrderDia(row)">{{
                    row.queryOrderInfoListVO.supplierDespatchId }}</span>
                </div>
                <div>
                  发货时间：
                  {{
                    getDataToLocalTime(
                      row.queryOrderInfoListVO.despatchTime,
                      "fulltime",
                      true
                    ) || "-"
                  }}
                </div>
                <div>
                  完成时间：
                  {{
                    getDataToLocalTime(
                      row.queryOrderInfoListVO.finishTime,
                      "fulltime",
                      true
                    ) || "-"
                  }}
                </div>
              </template>
              <template slot-scope="{ row }" slot="threeNum">
                <div>下单：{{ row.replenishQuantity }}</div>
                <div>超发：{{ row.overshootNumber || 0 }}</div>
                <div>取消：{{ row.queryOrderInfoListVO.surplusQuantity }}</div>
                <div :class="row.queryOrderInfoListVO.lessGoodsQuantity > 0 ? 'red' : ''">
                  少货：{{ row.queryOrderInfoListVO.lessGoodsQuantity }}
                </div>
              </template>
              <template slot-scope="{ row }" slot="deliver">
                <div>已发：{{ row.queryOrderInfoListVO.despatchNumber }}</div>
                <div>
                  未发：{{ row.queryOrderInfoListVO.notDespatchNumber }}
                </div>
              </template>
              <template slot-scope="{ row }" slot="receive">
                <div>正品：{{ row.queryOrderInfoListVO.shelveNumber }}</div>
                <div>
                  次品：{{ row.queryOrderInfoListVO.substandardNumber }}
                </div>
                <div>
                  未收：{{ row.queryOrderInfoListVO.notReceivedNumber }}
                </div>
              </template>
              <template slot-scope="{ row }" slot="washedLabel">
                <div>
                  <div style="display:inline-block; width:calc(100% - 40px);">
                    {{ row.washedLabel }}
                  </div>
                </div>
              </template>
              <!-- 水洗唛PDF -->
              <template slot-scope="{ row }" slot="washedLabelPDF">
                <div v-if="!$common.isEmpty(row.imgData)">
                  <Poptip trigger="hover" placement="top" transfer>
                    <div class="washed-image-content">
                      <img :src="row.imgData" @click="previewWashedPdf(row.washedLabelPdfPath)" />
                    </div>
                    <div class="washed-image-preview-content" slot="content">
                      <img :src="row.imgData" @click="previewWashedPdf(row.washedLabelPdfPath)" />
                    </div>
                  </Poptip>
                </div>
              </template>
              <!-- 生产要求 -->
              <template slot-scope="{ row }" slot="outPackRequire">
                <div style="white-space: pre-wrap; word-break: break-all;">{{ row.outerPackageRequirement }}</div>
              </template>
              <template slot-scope="{ row }" slot="remark">
                <div class="remarkOver" :title="row.queryOrderInfoListVO.purchaserRemark || '-'">
                  需：{{ row.queryOrderInfoListVO.purchaserRemark || "-" }}
                </div>
                <div class="remarkOver" :title="row.queryOrderInfoListVO.supplierRemark || '-'">
                  供：{{ row.queryOrderInfoListVO.supplierRemark || "-" }}
                </div>
              </template>
            </Table>
          </div>
        </div>
      </Form>
    </div>

    <!-- 发货单详情 -->
    <send-orderdetail :dialogObj="dialogOrderdetail" :isVisible.sync="isVisible"></send-orderdetail>
  </div>
</template>

<script>
import api from "@/api/api";
import {
  PurDetailList,
  tablist,
  supplyStatusList,
  progressList,
  // stockTypelist,
  examineStatusList,
  alibabaList,
  checkWashedData
} from "./configFile";
import Mixin from "@/components/mixin/common_mixin";
import pagemixin from "@/components/mixin/page_mixin";
import { intercepTime, time_now } from "@/utils/comfun.js";
import basicDataCom from "./basicDataCom";
import sendOrderdetail from "../supplyOrdersend/sendOrderdetail.vue";
import addRemark from "@/views/supplierPurchase/purchaseManagement/supplyOrder/addRemark";

export default {
  components: { basicDataCom, sendOrderdetail, addRemark },
  mixins: [Mixin, pagemixin],
  data() {
    const validateFee = (rule, value, callback) => {
      let reg = /^(([0-9]|([1-9][0-9]{0,100}))((\.[0-9]{1,3})?))$/;
      if (!reg.test(value)) {
        callback(new Error("只能输入正整数且最多保留3位小数"));
      }
      callback();
    };
    return {
      formItem: {}, //订单详情
      ruleValidate: {
        freightCharge: [{ validator: validateFee, trigger: "blur" }],
      },
      purchaseInfoVO: {}, //备注信息
      statusList: [
        { label: "全部", value: "" },
        { label: "未收货", value: 0 },
        { label: "部分收货", value: 1 },
        { label: "全部收货", value: 2 },
        { label: "超量收货", value: 3 },
        { label: "次品收货", value: 4 },
      ],
      checkWashedData: checkWashedData,
      loading: false,
      searchFix: {
        purchaseNumber: "",
        receiveStatus: "",
      },
      dialogOrderdetail: {
        modelVisible: false,
        data: {},
        source: null,
      },
      columns: PurDetailList,
      overseaTagList: {},
      tableList: [],
      allTableList: [],
      supplierTypeArr: {},
      purchaserArr: {},
      warehouseArr: {},
      currencyArr: {},
      remarksList: [],
      shelvesTotalPrice: 0,
      skuStatus: "",
      tablist: tablist,
      supplyStatusList,
      progressList,
      examineStatusList,
      alibabaList,
      descFlag: false,
      checkType: 0,
      isVisible: false,
      isOrderChange: true,
      id: "",
      showRemarkList: [],
      isEditRemark: false,
      remarksNew: [],
      productTagList: {},
    };
  },
  props: [
    "dialogObj",
    "showType",
    "orderType",
    "orderData",
    "purchaserArrT",
    "editType",
    "purchaseOrderIds",
  ],
  watch: {
    "dialogObj.data": {
      handler(newVal, oldVal) {
        this.formItem = this.dialogObj.data;
        this.checkType = this.dialogObj.type;
        this.pageFrom = this.dialogObj.from; // 'paymentRequest' 来自付款申请页面
        if (newVal) this.handleReset();
      },
      immediate: true,
    },
    tableList: {
      handler(newVal, oldVal) {
        this.tableList.forEach((item, index) => {
          if (item.washedLabelPdfPath) {
            const url = item.washedLabelPdfPath;
            const suffix = url.substring(url.lastIndexOf('.'), url.length);
            if (suffix.toLocaleLowerCase() == '.pdf') {
              this.$common.getPdfRes({
                pdfUrl: `./filenode/s${url}`,
                pageNumber: 1,
                scale: 10
              }).then(img => {
                this.$set(this.tableList[index], 'imgData', img);
              })
            } else {
              this.$set(this.tableList[index], 'imgData', `./filenode/s${url}`);
            }
          }
        })
      }
    }
  },
  created() {
    this.getOverseaTagList()
  },
  computed: {
    authUserInfo() {
      return this.$store.getters["authUserInfo"];
    },
    overshootState() {
      return !this.$common.isEmpty(this.formItem.overshootState) && ![0, '0'].includes(this.formItem.overshootState);
    },
    overshootText() {
      if ([1, '1'].includes(this.formItem.overshootState)) {
        return {
          style: {
            color: '#2d8cf0',
            'font-size': '12px'
          },
          text: '允许超发中'
        }
      }
      if ([2, '2'].includes(this.formItem.overshootState)) {
        return {
          style: {
            color: '#f30',
            'font-size': '12px'
          },
          text: '允许超发结束'
        }
      }
      return {
        style: {},
        text: ''
      };
    },
    // 是否为第三方标签
    isThirdPartyTag() {
      if (this.$common.isEmpty(this.formItem) || this.$common.isEmpty(this.formItem.tagType) || [0, '0'].includes(this.formItem.tagType)) return false;
      return true;
    },
    // 第三方标签名称
    thirdPartyTagName() {
      if(this.formItem.platformAndAccountCode) {
        let result = this.sliceStr(this.formItem.platformAndAccountCode, '-', 2, 0)
        return result
      } 
      return this.overseaTagList[this.formItem.overseaTagId].name
    },
  },
  methods: {
    // 获取来货特项列表
    getComingSpecialList() {
      this.$store.dispatch('getComingSpecialList').then(list => {
        let temp = {};
        (list || []).forEach(k => {
          temp[k.comingSpecialId] = k;
        })
        this.productTagList = temp;
      })
    },
    intercepTime,
    time_now,
    // 获取详情
    handleReset() {
      this.resetData();
      this.getOrderdetail();
      this.getSupplierType();
      this.getpurchaserArr();
      this.getbaseDataList();
      this.GetTotalNumber();
      this.getqueryRemarks();
      this.getComingSpecialList();
    },
    getOrderdetail() {
      let id = this.dialogObj.data.purchaseId;
      let temp = {
        purchaseIdList: [id],
        businessDeptIds: "",
      };
      temp.businessDeptIds = this.authUserInfo.securityUser.businessDeptIds;
      this.axios.post(api.purchaseInfo, temp).then((res) => {
        if (res.data.code === 0) {
          this.formItem = res.data.datas;
          this.allTableList = this.deepCopy(res.data.datas.detailsResultList);
          this.tableList = res.data.datas.detailsResultList;
          this.remarksNew = res.data.datas.remarks;
          this.showRemarkList = this.remarksNew;
          for (let i in this.showRemarkList) {
            this.showRemarkList[i].createdTime = this.getDataToLocalTime(
              this.showRemarkList[i].createdTime,
              "fulltime"
            );
            this.showRemarkList[i].name =
              this.$store.state.allUser[
                this.showRemarkList[i].updatedBy
              ].userName;
          }
        }
      });
    },
    // 获取供应商类型
    getSupplierType() {
      this.axios
        .get(api.baseDataList + "?dataType=" + "supplierType")
        .then(({ data }) => {
          if (data.code == 0) {
            let obj = {};
            let list = data.datas || [];
            list.forEach((k) => {
              obj[k.dataValue] = k;
            });
            this.supplierTypeArr = obj;
          }
        });
    },
    // 获取第三方标签数据
    getOverseaTagList() {
      return new Promise((resolve) => {
        this.axios.post(api.getOverseaTaglist).then((res) => {
          if (res.data && res.data.code == 0) {
            (res.data.datas || []).forEach(item => {
              this.$set(this.overseaTagList, item.overseaTagId, item);
            })
          }
          resolve(res);
        }).catch((error) => {
          console.error(error);
          resolve({});
        })
      })
    },
    // 获取采购人
    getpurchaserArr() {
      this.axios.get(api.userList).then(({ data }) => {
        if (data.code == 0) {
          this.purchaserArr = data.datas || {};
        }
      });
    },
    // 获取仓库
    getwarehouse() {
      this.axios.post(api.warehouse, { pageParams: 1 }).then(({ data }) => {
        if (data.code == 0) {
          let obj = {};
          let list = data.datas || [];
          list.forEach((k) => {
            obj[k.warehouseId] = k;
          });
          this.warehouseArr = obj;
        }
      });
    },
    // 获取币种
    getbaseDataList() {
      this.axios
        .get(api.baseDataList + "?dataType=currencyType")
        .then(({ data }) => {
          if (data.code == 0) {
            let obj = {};
            let list = data.datas || [];
            list.forEach((k) => {
              obj[k.dataValue] = k;
            });
            this.currencyArr = obj;
          }
        });
    },
    closeOrder() {
      if (this.pageFrom == "paymentRequest") {
        //来自付款申请页面
        this.$emit("update:isToPurDetail", false);
      } else {
        this.$emit("goBackFromAdd");
      }
    },

    // 获取已入库商品总金额
    GetTotalNumber() {
      this.axios
        .put(api.get_TotalNumber, [this.dialogObj.data.purchaseId])
        .then(({ data }) => {
          if (data.code == 0) {
            this.shelvesTotalPrice = data.datas[0].receiptTotalPrice;
          }
        });
    },
    // 查看备注
    getqueryRemarks() {
      this.axios
        .post(
          api.queryRemarks +
          `?purchaseNumber=${this.dialogObj.data.purchaseNumber}`
        )
        .then(({ data }) => {
          if (data.code == 0) {
            this.remarksList = data.datas || [];
          }
        });
    },
    // 切换sku状态
    filterSku() {
      if (this.skuStatus || this.skuStatus === 0) {
        this.tableList = this.allTableList.filter((k) => {
          if (
            k.queryOrderInfoListVO.receiveStatus == this.skuStatus ||
            (k.queryOrderInfoListVO.receiveStatus == null &&
              this.skuStatus === 0)
          ) {
            return k;
          } else if(this.skuStatus === 4) { // 次品收货状态，不需要后端传值  直接根据商品是否有次品数量进行筛选
            return k.queryOrderInfoListVO.substandardNumber > 0
          }
        });
      } else {
        this.tableList = this.allTableList;
      }
    },
    // 状态
    statusText(status) {
      let name = "";
      this.tablist.forEach((k) => {
        if (k.value !== "" && k.value == status) {
          name = k.label;
        }
      });
      return name;
    },
    // 重置
    resetData() {
      this.descFlag = false;
      this.searchFix.receiveStatus = "";
      this.shelvesTotalPrice = 0;
      this.remarksList = [];
      this.tableList = [];
      this.orderDetail = {};
      this.formItem = {};
    },
    showDeliverOrderDia(row) {
      this.isVisible = true;
      this.dialogOrderdetail.data = row;
      this.dialogOrderdetail.source = 2; // 2--采购单 -> 发货单详情；else 订单 -> 发货单详情
    },
    save() {
      let temp = {
        freightCharge: this.formItem.freightCharge,
        paymentLinkType: this.formItem.paymentLinkType,
        alibabaAccountType: this.formItem.alibabaAccountType,
        externalSerialNo: this.formItem.externalSerialNo,
        purchaseNumber: this.formItem.purchaseNumber,
      };
      this.axios.post(api.changeOrder, temp).then((res) => {
        if (res.data.code == 0) {
          this.$emit("goBackFromAdd");
          this.$emit("getList");
          this.$Message.success("保存成功");
        }
      });
    },
    // 水洗唛PDF文件预览
    previewWashedPdf(path) {
      if (this.$common.isEmpty(path)) return;
      const url = path;
      const suffix = url.substring(url.lastIndexOf('.'), url.length);
      if (suffix.toLocaleLowerCase() == '.pdf') {
        this.axios.get(`./filenode/s${url}`, { responseType: 'blob' }).then(res => {
          this.$common.blobToBase64(res.data || res.resData).then(data => {
            const fileBold = this.$common.base64ToBlob(data, 'application/pdf');
            this.$common.previewFile(fileBold);
          })
        })
      } else {
        window.open(`./filenode/s${url}`);
      }
    },
    // 截取字符串方法
    sliceStr(str, symbol ,endIndex , startIndex) {
      const parts = str.split(symbol)
      let result = ''
      if(startIndex===0 || startIndex){
        result = parts.slice(startIndex, endIndex).join(symbol)
      } else {
        result = parts.slice(endIndex).join(symbol)
      }
      return result
    },
  }
}
</script>
<style lang="less" scoped>
.basic-information {
  position: relative;

  .ivu-form-item {
    width: 17.3%;

    &:nth-of-type(5n - 2) {
      width: 30%;
    }

    &:nth-of-type(5n) {
      width: 18%;
    }

    display: inline-block;

    :deep(.ivu-form-item-label) {
      padding: 5px 0;
      line-height: 1.3em;
      font-size: 14px;
    }

    :deep(.ivu-form-item-content) {
      padding: 5px 0;
      line-height: 1.3em;
      font-size: 14px;
    }
  }
}

.paraTitle {
  font-size: 16px;
  font-weight: bold;
}

.remark {
  display: flex;
  align-items: flex-start;
}

.remark .time {
  width: 200px;
  text-align: right;
}

.borb {
  margin: 5px 0;
  border-bottom: 1px dashed #dddee1;
}

.desc-icon {
  cursor: pointer;
  font-weight: bold;
  color: #2d8cf0;
}

.topper {
  padding-bottom: 16px;
  font-size: 16px;
  font-weight: bold;
  border-bottom: 1px solid #dddee1;
  cursor: pointer;
  margin-bottom: 16px;
}

.colorRed {
  color: red;
}

.remarkOver {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  margin: 10px 0;
}

.addIcon {
  font-size: 20px;
  font-weight: 600;
  color: #2d8cf0;
  margin-left: 10px;
}

.remarkItemTextarea {
  :deep(.ivu-form-item-content) {
    margin-left: 30px !important;
    line-height: 20px !important;
  }
}

.textareaContent {
  :deep(textarea) {
    width: 500px !important;
    height: 60px !important;
  }

}

.itemRemark {
  margin-left: 20px;
  display: inline;
  white-space: pre-wrap;
  width: 400px;
}

.fmb10 .ivu-form-item {
  margin-bottom: 5px;
}

.product-info-head {
  display: flex;
  justify-content: space-between;
}

.washed-image-content {
  position: relative;
  margin-left: 5px;
  width: 160px;
  height: 120px;
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
    max-width: 600px;
    max-height: 600px;
    min-width: 100px;
  }
}
</style>
