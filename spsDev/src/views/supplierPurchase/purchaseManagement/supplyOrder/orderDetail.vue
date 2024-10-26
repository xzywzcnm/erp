<template>
  <div>
    <div class="topper">
      <span class="arrowLeft" @click="closeOrder()">
        <Icon type="ios-arrow-back" class="IconBack"></Icon>返回
      </span>
    </div>
    <div class="mainContent fmb10">
      <Form ref="form" :model="formItem" :label-width="120" :rules="ruleValidate">
        <div class="paraTitle mb10">
          订单单号：{{ formItem.purchaseNumber || "-" }}
        </div>
        <div>
          <div class="paraTitle borb">供应商下单信息</div>
          <div class="basic-information">
            <FormItem label="采购员:">
              <span>{{ purchaserArr[formItem.purchaserId] && purchaserArr[formItem.purchaserId].userName }}</span>
            </FormItem>
            <FormItem label="备货仓库:">
              <span>{{ orderDetail.warehouseName || "-" }}</span>
            </FormItem>
            <FormItem label="供应商:">
              <span>{{ formItem.supplierName || "-" }}</span>
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
              <span>{{ formItem.settleTypeName || "-" }}</span>
            </FormItem>
            <FormItem label="下单商品金额:">
              <span>{{ formItem.supplierName == "*" ? "*" : formItem.totalPrice || "0" }}</span>
            </FormItem>
            <FormItem label="超发商品金额:">
              <span>{{ formItem.sumOvershootPrice == "*" ? "*" : formItem.sumOvershootPrice || 0 }}</span>
            </FormItem>
            <FormItem label="运费:">
              <span>{{ formItem.freightCharge || "0" }}</span>
            </FormItem>
            <FormItem label="优惠:">
              <span>{{ formItem.discountAmount || "0" }}</span>
            </FormItem>
            <FormItem label="币种:">
              {{ formItem.currency || "-" }}
            </FormItem>
            <FormItem label="采购类型:">
              <span>{{ supplierTypeArr[formItem.supplierType] && supplierTypeArr[formItem.supplierType].dataDesc }}</span>
            </FormItem>
            <FormItem label="订单金额:">
              <!-- <span>{{ formItem.supplierName == "*" ? "*" : formItem.amountPay || "0"}}</span> -->
              <span>{{ formItem.supplierName == "*" ? "*" : formItem.totalAmount || "0" }}</span>
            </FormItem>
            <FormItem label="已付金额:">
              <span>{{ formItem.paidAmount || "0" }}</span>
            </FormItem>
            <FormItem label="收库商品金额:">
              <span>{{ shelvesTotalPrice || "0" }}</span>
            </FormItem>
            <FormItem label="收库金额:">
              <span class="colorRed">{{ formItem.receiptAmount }}</span>
            </FormItem>
            <FormItem label="未收库商品金额:">
              <span>{{ formItem.notReceiptAmount }}</span>
            </FormItem>
            <FormItem label="超发数量:">
              <span class="colorRed">{{ formItem.sumOvershootNumber || 0 }}</span>
            </FormItem>
            <FormItem label="采购总数量:">
              <span>{{ formItem.purchaseNum || "0" }}</span>
            </FormItem>
            <FormItem label="取消数量:">
              <span>{{ formItem.surplusQuantityTotal }}</span>
            </FormItem>
            <FormItem label="少货数量:">
              <span>{{ formItem.lessGoodsQuantityTotal }}</span>
            </FormItem>
            <FormItem label="未发货数量:">
              <span class="colorRed">{{ formItem.notDespatchNumberTotal }}</span>
            </FormItem>
            <FormItem label="已发货数量:">
              <span class="colorRed">{{ formItem.despatchNumberTotal }}</span>
            </FormItem>
            <FormItem label="收货正品数量:">
              <span>{{ formItem.shelveNumberTotal }}</span>
            </FormItem>
            <FormItem label="收货次品数量:">
              <span>{{ formItem.substandardNumberTotal }}</span>
            </FormItem>
            <FormItem label="未收货数量:">
              <span>{{ formItem.notReceivedNumberTotal }}</span>
            </FormItem>
            <FormItem label="质检类型:">
              <span v-if="formItem.checkType == 0">免检</span>
              <span v-if="formItem.checkType == 1">抽检</span>
              <span v-if="formItem.checkType == 2">全检</span>
            </FormItem>
            <FormItem label="质检总比例:">
              <span> {{ formItem.checkRateSum }}%</span>
            </FormItem>
            <FormItem label="所属事业部:">
              <span>{{ formItem.businessDeptName }}</span>
            </FormItem>
            <FormItem label="1688账号类型:">
              <span>{{ formItem.alibabaAccountType }}</span>
            </FormItem>
            <FormItem label="外部流水号:">
              <span>{{ formItem.setupStatus == 0 ? formItem.externalSerialNo : formItem.aliPlatformOrderNo }}</span>
            </FormItem>
            <FormItem label="总重量(g):">
              <span>{{ formItem.weightTotal || "0" }}</span>
            </FormItem>
            <FormItem label="下单状态:">
              <span v-if="examineStatusList[formItem.status - 1]">{{ examineStatusList[formItem.status - 1].label
              }}</span>
            </FormItem>

            <FormItem label="下单时间:">
              <span>{{ getDataToLocalTime(formItem.orderTime, "fulltime", true) }}</span>
            </FormItem>
            <FormItem label="发货要求:">
              <div style="width: 200px" class="overText" :title="purchaseInfoVO.requireDespatch">
                <span>{{ purchaseInfoVO.requireDespatch || "-" }}</span>
              </div>
            </FormItem>
            <FormItem label="平台订单号:">
                <span> {{ formItem.platformOrderNo }}</span>
              </FormItem>
          </div>
        </div>
        <!-- <div>
          <div class="paraTitle borb">备注
            <Icon type="md-add" class="desc-icon" @click="descFlag=!descFlag" />
          </div>
          
          <template v-if="remarksList.length">
            <div class="fmb0" v-for="(item,index) in remarksList" :key="index">
              <FormItem label="供方:" :label-width="80" v-if="item.remarkSide===1">
                <div class="remark">
                  <span>{{item.remarks || '-'}}</span>
                  <span class="time">{{item.createdTime || '-'}}</span>
                </div>
              </FormItem>
              <FormItem label="需方:" :label-width="80" v-if="item.remarkSide===0">
                <div class="remark">
                  <span>{{item.remarks || '-'}}</span>
                  <span class="time">{{item.createdTime || '-'}}</span>
                </div>
              </FormItem>
            </div>
          </template>
          <template v-if="descFlag">
            <FormItem label="需方备注:" :label-width="80" prop="desc">
              <div class="remark" style="align-items:center;">
                <Input v-model="formItem.desc" type="textarea" style="width:300px;" />
                <Button type="primary" class="ml10" @click="handleSubmit('form')" :loading="loading">保存</Button>
              </div>
            </FormItem>
          </template>
        </div> -->

        <div class="formSearch ml10" style="padding: 0; margin-top: 40px">
          <div class="paraTitle mb10 titleLeft">采购定制</div>
          <div class="basic-information">
            <FormItem label="允许超发：">
              {{ overshootState ? '是' : '否' }}
            </FormItem>
            <FormItem label="允许超发状态：" v-if="overshootState">
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

        <div class="formSearch" style="padding: 0">
          <div class="paraTitle borb">商品信息</div>
          <div class="product-info-head">
            <FormItem label="SKU收货状态:" :label-width="100">
              <RadioGroup v-model="searchFix.receiveStatus" type="button" size="small" @on-change="filterSku">
                <Radio :label="item.value" v-for="item in statusList" :key="item.value">{{ item.label }}</Radio>
              </RadioGroup>
            </FormItem>
            <FormItem label="" :label-width="0">
              <Checkbox :disabled="true" v-model="overshootState">允许超发</Checkbox>
              <span :style="overshootText.style">{{ overshootText.text }}</span>
            </FormItem>
          </div>
          <div class="table-box">
            <Table highlight-row max-height="590" :columns="columns" :data="tableList" :border="true"
              :loading="Tableloading">
              <template slot-scope="{ row }" slot="basic">
                <basicDataCom :dataRow="row" :isOrderChange="isOrderChange">
                  <a slot="link" class="alink" href="javascript:;">{{
                    row.purchaseNumber || "-"
                  }}</a>
                </basicDataCom>
                <div></div>
              </template>
              <template slot-scope="{ row }" slot="threeNum">
                <div>下单：{{ row.salesNumber || 0 }}</div>
                <div>超发：{{ row.overshootNumber || 0 }}</div>
                <div>取消：{{ row.surplusQuantity || 0 }}</div>
                <div :class="row.lessGoodsQuantity > 0 ? 'red' : ''">
                  少货：{{ row.lessGoodsQuantity || 0 }}
                </div>
              </template>
              <template slot-scope="{ row }" slot="salesTime">
                <div style="width: 70px">
                  {{ getDataToLocalTime(row.salesTime, "fulltime", true) }}
                </div>
              </template>
              <template slot-scope="{ row }" slot="requireDespatchTime">
                <div style="width: 70px">
                  {{
                    getDataToLocalTime(
                      row.requireDespatchTime,
                      "fulltime",
                      true
                    )
                  }}
                </div>
              </template>
              <template slot-scope="{ row }" slot="deliver">
                <div>已发：{{ row.despatchNumber || 0 }}</div>
                <div>未发：{{ row.notDespatchNumber || 0 }}</div>
              </template>
              <template slot-scope="{ row }" slot="receive">
                <div>正品：{{ row.qualityNumber || 0 }}</div>
                <div>次品：{{ row.substandardNumber || 0 }}</div>
                <div>未收：{{ row.notReceivedNumber || 0 }}</div>
              </template>
              <template slot-scope="{ row }" slot="price">
                <div>原价：{{ row.suggestPrice || 0 }}</div>
                <div>单价：{{ row.unitPrice || 0 }}</div>
              </template>
              <template slot-scope="{ row }" slot="stockType">
                <div>
                  {{
                    purchaseTypeList[row.stockType] &&
                    purchaseTypeList[row.stockType].label
                  }}
                </div>
              </template>
              <!-- <template slot-scope="{ row }" slot="stockType">
                <div>{{stockTypelist[row.stockType]&&stockTypelist[row.stockType].label}}</div>
              </template> -->
              <!-- <template slot-scope="{ row }" slot="logistic">
                <div>发货单号：{{row.supplierDespatchId || '-'}}</div>
                <div>发货时间：{{getDataToLocalTime(row.despatchTime, 'fulltime',true)}}</div>
                <div>完成时间：{{getDataToLocalTime(row.finishTime, 'fulltime',true)}}</div>
              </template> -->
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
                <div>
                  <div :title="row.purchaserRemark" class="overText">
                    需：{{ row.purchaserRemark || "-" }}
                  </div>
                  <div :title="row.supplierRemark" class="overText">
                    供：{{ row.supplierRemark || "-" }}
                  </div>
                  <div :title="row.followRemark" class="overText">
                    跟：{{ row.followRemark || "-" }}
                  </div>
                </div>
              </template>
            </Table>
            <div class="table-page clear">
              <div class="table-page-right">
                <Page :total="proPage.total" @on-change="proChangePage" show-total :page-size="proPage.pageSize"
                  show-elevator :current="proPage.pageNum" show-sizer @on-page-size-change="proChangePageSize"
                  placement="top" :page-size-opts="pageArray"></Page>
              </div>
            </div>
          </div>
        </div>
      </Form>
    </div>
  </div>
</template>

<script>
// import qs from "qs";
import api from "@/api/api";
import {
  detailList,
  tablist,
  supplyStatusList,
  progressList,
  purchaseTypeList,
  examineStatusList,
  checkWashedData
} from "./configFile";
import { math } from "@/utils/comfun";
import Mixin from "@/components/mixin/common_mixin";
import pagemixin from "@/components/mixin/page_mixin";
// import largePicture from '@/components/largePicture';
import { intercepTime } from "@/utils/comfun.js";
import basicDataCom from "./basicDataCom";

export default {
  components: { basicDataCom },
  mixins: [Mixin, pagemixin],
  data() {
    return {
      formItem: {}, //订单详情
      checkWashedData: checkWashedData,
      ruleValidate: {
        desc: [
          {
            required: true,
            message: "请输入需方备注",
            trigger: "blur",
            type: "string",
          },
        ],
      },
      purchaseInfoVO: {}, //备注信息
      statusList: [
        { label: "全部", value: "" },
        { label: "未收货", value: 0 },
        { label: "部分收货", value: 1 },
        { label: "全部收货", value: 2 },
        { label: "超量收货", value: 3 },
      ],
      isOrderChange: true,
      loading: false,
      searchFix: {
        purchaseNumber: "",
        receiveStatus: "",
      },
      columns: detailList,
      tableList: [],
      supplierTypeArr: {},
      purchaserArr: {},
      warehouseArr: {},
      currencyArr: {},
      remarksList: [],
      shelvesTotalPrice: 0,
      tablist: tablist,
      supplyStatusList: supplyStatusList,
      progressList: progressList,
      purchaseTypeList: purchaseTypeList,
      descFlag: false,
      orderDetail: {},
      examineStatusList,
      productTagList: {},
      overseaTagList:{}
    };
  },
  props: {
    dialogObj: {
      type: Object,
      default() {
        return {
          modelVisible: false,
          data: {},
          supplyList: {},
        };
      },
    },
  },
  watch: {
    "dialogObj.data": {
      handler(newVal, oldVal) {
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
          text: ' (允许超发中)'
        }
      }
      if ([2, '2'].includes(this.formItem.overshootState)) {
        return {
          style: {
            color: '#f30',
            'font-size': '12px'
          },
          text: ' (允许超发结束)'
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
  created() { 
    this.getOverseaTagList()
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
    // 添加备注
    /* handleSubmit (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          let data = this.formItem;
          let temp = {};
          temp.purchaseId = data.purchaseId;
          temp.purchaseNumber = data.purchaseNumber;
          temp.remarkSide = 0; //备注方: 0:需方,1:供方
          temp.remarks = data.desc;
          this.loading = true;
          this.axios.post(api.addRemarks, temp).then(({ data }) => {
            if (data.code == 0) {
              this.$Message.info('添加成功');
              this.descFlag = false;
              this.formItem.desc = '';
              this.getqueryRemarks();
            }
          }).finally(() => {
            this.loading = false;
          });
        }
      });
    }, */
    // 获取详情
    handleReset() {
      this.resetData();
      this.getSupplierType();
      this.getpurchaserArr();
      // this.getwarehouse();
      this.getbaseDataList();
      this.getSkulist();
      this.GetTotalNumber();
      this.getqueryRemarks();
      this.getComingSpecialList();
    },
    // 获取订单详情
    getOrderdetail() {
      let [data, temp] = [this.dialogObj.data, {}];
      temp.purchaseId = data.purchaseId;
      temp.purchaseNumberList = [data.purchaseNumber];
      temp.businessDeptIds = this.authUserInfo.securityUser.businessDeptIds;
      this.$Spin.show();
      this.axios.post(api.queryDetails, temp).then((res) => {
        if (res.data.code === 0) {
          this.computedData(res.data);
          let list = this.tableList;
          for (let i = 0; i < list.length; i++) {
            if (res.data.datas && res.data.datas.purchaseCustom && res.data.datas.purchaseCustom.detailsResultList && res.data.datas.purchaseCustom.detailsResultList[i]) {
              list[i].goodsName = res.data.datas.purchaseCustom.detailsResultList[i].goodsName;
            }
          }
          // if (res.data.datas && res.data.datas.purchaseCustom && res.data.datas.purchaseCustom.detailsResultList) {
          //   if (this.$common.isEmpty(this.tableList)) {
          //     this.tableList = res.data.datas.purchaseCustom.detailsResultList || [];
          //     return;
          //   }
          //   let detailsObj = {};
          //   (res.data.datas.purchaseCustom.detailsResultList || []).forEach((item) => {
          //     detailsObj[`${item.goodsId}`] = item;
          //   })
          //   this.tableList.forEach((row, index) => {
          //     if (detailsObj[`${row.goodsId}`]) {
          //       this.tableList[index] = { ...row, ...detailsObj[row.goodsId] };
          //     }
          //   })
          // }
        }
      }).finally(() => {
        this.$Spin.hide();
      });

      // this.axios({
      //   url: api.queryDetails,
      //   method: 'POST',
      //   headers: { 'content-type': 'application/x-www-form-urlencoded' },
      //   // data: qs.stringify(temp),
      //   data: temp,
      // }).then(({ data }) => {
      //   if (data.code === 0) {
      //     this.computedData(data);
      //     let list = this.tableList;
      //     for (let i = 0; i < list.length; i++) {
      //       list[i].goodsName = data.datas.purchaseCustom.detailsResultList[i].goodsName
      //     }
      //   }
      // }).finally(() => {
      //   this.$Spin.hide();
      // });
    },
    // 处理要的数据格式
    computedData(data) {
      this.orderDetail = data.datas;
      let purchaseCustom = data.datas ? data.datas.purchaseCustom || {} : {};
      this.formItem = purchaseCustom;
      this.purchaseInfoVO = data.datas.purchaseInfoVO;
      // 计算应付金额
      this.formItem.amountPay = math.sub(
        math.add(
          purchaseCustom.totalPrice || 0,
          purchaseCustom.freightCharge || 0
        ),
        purchaseCustom.discountAmount || 0
      );
      // 计算已收货总数量
      this.formItem.receiveNum = 0;
      // 计算采购总数量
      this.formItem.purchaseNum = 0;
      if (purchaseCustom.detailsResultList && purchaseCustom.detailsResultList.length) {
        this.formItem.receiveNum = purchaseCustom.detailsResultList.reduce((prev, next) => prev + next.receiveQuantity, 0);
        this.formItem.purchaseNum = purchaseCustom.detailsResultList.reduce((prev, next) => prev + next.replenishQuantity, 0);
      }
      // 备注
      this.$set(this.formItem, "desc", "");
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
    // 查看订单详情
    closeOrder() {
      // this.dialogObj.modelVisible = false;
      this.$emit("goBack");
    },
    // 获取SKU信息
    getSkulist() {
      this.searchFix.purchaseNumber = this.dialogObj.data.purchaseNumber;
      this.fetch(api.querySKUDetails, "post", "").finally(() => {
        this.getOrderdetail();
      });
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
      this.search();
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
  },
};
</script>
<style scoped lang="less">
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

.overText {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.fmb10 .ivu-form-item {
  margin-bottom: 5px;
}

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