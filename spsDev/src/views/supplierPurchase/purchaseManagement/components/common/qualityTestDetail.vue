<template>
  <div>
    <div class="topper">
      <div class="arrowLeft" @click="closeOrder">
        <Icon type="ios-arrow-back" class="IconBack"></Icon>返回
      </div>
      <div style="margin-left: 130px; position: absolute">
        <Button @click="closeOrder" v-if="isEdit">取消</Button>
        <Button
          type="primary"
          style="margin-left: 10px"
          @click="saveData"
          v-if="isEdit"
          >保存</Button
        >
      </div>
    </div>
    <div class="mainContent fmb10" style="margin-top: -17px">
      <Form ref="form" :model="formData" :label-width="120">
        <div class="ml10">
          <div class="paraTitle borb titleLeft">基本信息</div>
          <Row>
            <Col span="6">
              <FormItem label="质检单号:">
                <span>{{ wmsReceiptCheckBase.receiptCheckNo }}</span>
              </FormItem>
              <FormItem label="供应商:">
                <span>{{ wmsReceiptCheckBase.supplierName }}</span>
              </FormItem>
              <FormItem label="送检数量:">
                <span>{{ wmsReceiptCheckBase.expectedCheckNumber }}</span>
              </FormItem>
              <FormItem label="质检类型:">
                <span v-if="wmsReceiptCheckBase.checkType == '0'">免检</span>
                <span v-if="wmsReceiptCheckBase.checkType == '2'">全检</span>
                <span v-if="wmsReceiptCheckBase.checkType == '1'">抽检</span>
              </FormItem>
              <FormItem label="质检时间:">
                <span>{{ pageData.checkFinishTime }}</span>
              </FormItem>
            </Col>
            <Col span="6">
              <FormItem label="质检状态:">
                <span v-if="wmsReceiptCheckBase.checkStatus == '0'"
                  >待质检</span
                >
                <span v-if="wmsReceiptCheckBase.checkStatus == '1'"
                  >质检中</span
                >
                <span v-if="wmsReceiptCheckBase.checkStatus == '2'"
                  >质检完成</span
                >
              </FormItem>
              <FormItem label="下单数量:">
                <span>{{ wmsReceiptCheckBase.purchaseNumber }}</span>
              </FormItem>
              <FormItem label="已检合格数量:">
                <span>{{ wmsReceiptCheckBase.qualifiedCheckedNumber }}</span>
              </FormItem>
              <FormItem label="创建时间:">
                <span>{{ wmsReceiptCheckBase.createdTime }}</span>
              </FormItem>
              <FormItem label="类型:">
                <span>
                  {{ wmsReceiptCheckBase.qualityInspectionType ? '维修' : '质检' }}
                </span>
              </FormItem>
            </Col>
            <Col span="6">
              <FormItem label="采购单号:">
                <span>{{ wmsReceiptCheckBase.purchaseNo }}</span>
              </FormItem>
              <FormItem label="应检数量:">
                <span>{{ wmsReceiptCheckBase.planCheckNumber }}</span>
              </FormItem>
              <FormItem label="已捡问题数量:">
                <span>{{ wmsReceiptCheckBase.failedCheckedNumber }}</span>
              </FormItem>
              <FormItem label="备货仓库:">
                <span>{{ wmsReceiptCheckBase.warehouseName }}</span>
              </FormItem>
              <FormItem label="维修内容:">
                <span>
                  {{ wmsReceiptCheckBase.maintenanceContent || '' }}
                </span>
              </FormItem>
            </Col>
            <Col span="6">
              <FormItem label="入库单号:">
                <span>{{ wmsReceiptCheckBase.receiptNo }}</span>
              </FormItem>
              <FormItem label="质检比例:" prop="freightCharge">
                <div>{{ wmsReceiptCheckBase.checkRate }}%</div>
              </FormItem>
              <FormItem label="待检数量:">
                <span>{{ wmsReceiptCheckBase.awaitCheckedNumber }}</span>
              </FormItem>
              <FormItem label="采购员:">
                <span>{{ wmsReceiptCheckBase.purchaserName }}</span>
              </FormItem>
            </Col>
          </Row>
          <!-- 编辑备注 -->
          <template>
            <add-remark
              :isEdit="isEdit"
              :showRemarkList="receiptCheckRemarkDTO"
              :receiptCheckId="wmsReceiptCheckBase.receiptCheckId"
            ></add-remark>
          </template>
        </div>
        <div class="formSearch ml10" style="padding: 0; margin-top: 40px">
          <div class="paraTitle titleLeft">商品信息</div>
          <div style="display: flex; justify-content: flex-end" v-if="isEdit">
            <span class="mr10">质检类型:</span>
            <RadioGroup
              v-model="wmsReceiptCheckBase.checkType"
              @on-change="radioChange"
            >
              <Radio label="0" class="mr20">免检</Radio>
              <Radio label="2" class="mr20" value="2">全检</Radio>
              <Radio label="1" class="mr20" value="3">抽检</Radio>
            </RadioGroup>
            <span
              style="
                color: #001ef5;
                text-decoration: underline;
                cursor: pointer;
              "
              class="mr20"
              v-if="wmsReceiptCheckBase.checkType == '1'"
              @click="openModal"
              >批量设置抽检数量</span
            >
            <span>质检总比例:</span>
            <span>{{ checkRateSum }}%</span>
          </div>
          <div style="border-top: 1px dashed #dddee1; margin: 5px 0"></div>

          <div class="table-box">
            <Table
              highlight-row
              max-height="590"
              :columns="columns"
              :data="wmsReceiptCheckDetailBaseList"
              :border="true"
              :loading="Tableloading"
            >
              <template slot-scope="{ row }" slot="basic">
                <basicDataCom :dataRow="row"> </basicDataCom>
                <div></div>
              </template>
              <!-- 质检状态 -->
              <template slot-scope="{ row }" slot="checkStatus">
                <div v-if="row.checkStatus == 0">待质检</div>
                <div v-if="row.checkStatus == 1">质检中</div>
                <div v-if="row.checkStatus == 2">质检完成</div>
              </template>
              <!-- 下单数 -->
              <template slot-scope="{ row }" slot="purchaseNumber">
                <div>{{ row.purchaseNumber }}</div>
              </template>
              <!-- 应检数量 -->
              <template slot-scope="{ row }" slot="planCheckNumber">
                <div>{{ row.planCheckNumber }}</div>
              </template>
              <!-- 质检标准 -->
              <template slot-scope="{ row }" slot="checkRateStandard">
                <div class="qualityCheck" style="color:#001ef5" @click="getQualityCheckModal(row)">
                <div>
                  {{ row.checkRate}}%
                </div>
                <div>
                {{ row.goodsQualityInfo.qualityTemplateName }}
                </div>
                </div>
              </template>
              <!-- 送检数 -->
              <template slot-scope="{ row }" slot="expectedCheckNumber">
                <div>{{ row.expectedCheckNumber }}</div>
              </template>
              <!-- 已检合格数 -->
              <template slot-scope="{ row }" slot="qualifiedCheckedNumber">
                <div>{{ row.qualifiedCheckedNumber }}</div>
              </template>
              <!-- 已检问题数 -->
              <template slot-scope="{ row }" slot="failedCheckedNumber">
                <div>{{ row.failedCheckedNumber }}</div>
              </template>
              <!-- 待检数 -->
              <template slot-scope="{ row }" slot="awaitCheckedNumber">
                <div>{{ row.awaitCheckedNumber }}</div>
              </template>
              <!-- 待应检数 -->
              <template slot-scope="{ row }" slot="awaitPlanCheckedNumber">
                <div>{{ row.awaitPlanCheckedNumber }}</div>
              </template>
              <!-- 退货数 -->
              <template slot-scope="{ row }" slot="refundNumber">
                <div>{{ row.refundNumber }}</div>
              </template>
              <!-- 销毁数 -->
              <template slot-scope="{ row }" slot="destructionNumber">
                <div>{{ row.destructionNumber }}</div>
              </template>
              <!-- 剩余数 -->
              <template slot-scope="{ row }" slot="remainNumber">
                <div>{{ row.remainNumber }}</div>
              </template>
              <!-- 质检员 -->
              <template slot-scope="{ row }" slot="checkerId">
                <div>{{ row.checkerId }}</div>
              </template>
            </Table>
          </div>
        </div>

        <div class="formSearch ml10" style="padding: 0; margin-top: 40px">
          <div class="paraTitle borb titleLeft">送检批次信息</div>

          <div class="table-box">
            <Table
              highlight-row
              max-height="590"
              :columns="column1"
              :data="queryBatchCheckResultList"
              :border="true"
              :loading="Tableloading"
            >
              <!-- 送检批次号 -->
              <template slot-scope="{ row }" slot="receiptBatchNo">
                <div
                  style="
                    color: #001ef5;
                    text-decoration: underline;
                    cursor: pointer;
                  "
                  @click="seeDetail(row)"
                >
                  {{ row.receiptBatchNo }}
                </div>
              </template>
              <!-- 质检状态 -->
              <template slot-scope="{ row }" slot="checkStatus">
                <div>
                {{ row.checkStatus === 0 ? '待质检' : row.checkStatus === 1 
                ? '质检中' : '质检完成'}}
                </div>
              </template>
              <!-- 入库单编号 -->
              <template slot-scope="{ row }" slot="receiptNo">
                <div style="color: #4b8ef7; text-decoration: underline">
                  {{ row.receiptNo }}
                </div>
              </template>
              <!-- sku -->
              <template slot-scope="{ row }" slot="goodsSku">
                <div>{{ row.goodsSku }}</div>
              </template>
              <!-- 送检数量 -->
              <template slot-scope="{ row }" slot="expectedCheckNumber">
                <div>{{ row.expectedCheckNumber }}</div>
              </template>
              <!-- 应检数量 -->
              <template slot-scope="{ row }" slot="planCheckNumber">
                <div>{{ row.planCheckNumber }}</div>
              </template>
              <!-- 质检比例 -->
              <template slot-scope="{ row }" slot="checkRate">
                <div>{{ row.checkRate }}%</div>
              </template>
              <!-- 已检合格数 -->
              <template slot-scope="{ row }" slot="passCheckNumber">
                <div>{{ row.passCheckNumber }}</div>
              </template>
              <!-- 已检问题 -->
              <template slot-scope="{ row }" slot="problemCheckNumber">
                <div>{{ row.problemCheckNumber }}</div>
              </template>
              <!-- 待质检数 -->
              <template slot-scope="{ row }" slot="waitCheckNumber">
                <div>{{ row.waitCheckNumber }}</div>
              </template>
              <!-- 待应检数 -->
              <template slot-scope="{ row }" slot="awaitPlanCheckedNumber">
                <div>{{ row.awaitPlanCheckedNumber }}</div>
              </template>
              <!-- 质检人 -->
              <template slot-scope="{ row }" slot="checkCreatedByName">
                <div>{{ row.checkCreatedByName }}</div>
              </template>
              <!-- 创建时间 -->
              <template slot-scope="{ row }" slot="createdTime">
                <div>{{ row.createdTime }}</div>
              </template>
            </Table>
          </div>
        </div>

        <div class="formSearch ml10" style="padding: 0; margin-top: 40px">
          <div class="paraTitle borb titleLeft">质检批次信息</div>

          <div class="table-box">
            <Table
              highlight-row
              max-height="590"
              :columns="column2"
              :data="queryQualityBatchInfoList"
              :border="true"
              :loading="Tableloading"
            >
              <!-- 质检记录号 -->
              <template slot-scope="{ row }" slot="receiptBatchCheckDetailNo">
                <div>
                  {{ row.receiptBatchCheckDetailNo }}
                </div>
              </template>
              <!-- 送检批次号 -->
              <template slot-scope="{ row }" slot="receiptBatchNo">
                <div>{{ row.receiptBatchNo }}</div>
              </template>
              <!-- 问题原因 -->
              <template slot-scope="{ row }" slot="problemCheckReason">
                <div style="color: #4b8ef7; text-decoration: underline">
                  {{ row.problemCheckReason }}
                </div>
              </template>
              <!-- 质检图片 -->
              <template slot-scope="{ row }" slot="checkAttachment">
                <div style="display: flex;flex-wrap: wrap;" v-if="row.checkAttachment">
                  <div
                    v-for="(item, index) in row.checkAttachmentList"
                    :key="index"
                    style="margin-right: 5px"
                  >
                    <large-picture :url="item" imageHigh="60px">
                      <slot name="picslot"></slot>
                    </large-picture>
                  </div>
                </div>
              </template>
              <!-- 备注 -->
              <template slot-scope="{ row }" slot="remark">
                <div>{{ row.remark }}</div>
              </template>
              <!-- 质检数 -->
              <template slot-scope="{ row }" slot="awaitPlanCheckedNumber">
                <div>{{ row.awaitPlanCheckedNumber }}</div>
              </template>
              <!-- 合格数 -->
              <template slot-scope="{ row }" slot="passCheckNumber">
                <div>{{ row.passCheckNumber }}</div>
              </template>
              <!-- 问题数 -->
              <template slot-scope="{ row }" slot="problemCheckNumber">
                <div>{{ row.problemCheckNumber }}</div>
              </template>
              <!-- 质检时间 -->
              <template slot-scope="{ row }" slot="createdTime">
                <div>{{ row.createdTime }}</div>
              </template>
              <!-- 质检人 -->
              <template slot-scope="{ row }" slot="createdBy">
                <div>{{ row.createdBy }}</div>
              </template>
            </Table>
          </div>
        </div>
      </Form>
    </div>
    <Modal v-model="modal1" title="质检详情" width="1300px">
      <qualityTestDetail2
        v-if="modal1"
        :detailParams="detailParams"
        :productGoodsId="productGoodsId"
      ></qualityTestDetail2>
    </Modal>
    <Modal
      v-model="settingModalVisible"
      :width="620"
      class-name="vertical-center-modal"
      title="提示"
    >
      <div>批量设置规则:</div>
      <RadioGroup
        v-model="settingRule.radio1"
        @on-change="settingRuleChange"
        vertical
        class="ml20 settingModal"
      >
        <Radio label="1" class="mt10">
          <span>相同SPU的产品，总抽检比例：</span>
          <Input
            v-model="settingRule.input1"
            ref="input1"
            style="width: 50px"
            @input="inputLimit('input1')"
            v-if="settingRule.radio1 == '1'"
          />
          <span class="ml10" v-if="settingRule.radio1 == '1'">%，四舍五入</span>
        </Radio>
        <Radio label="2" class="mt10">
          <span>每款产品（SKU），抽检比例：</span>
          <Input
            v-model="settingRule.input2"
            ref="input2"
            style="width: 50px"
            v-if="settingRule.radio1 == '2'"
            @input="inputLimit('input2')"
          />
          <span class="ml10" v-if="settingRule.radio1 == '2'">%，四舍五入</span>
        </Radio>
        <Radio label="3" class="mt10">
          <span>每款产品（SKU），抽检件数：</span>
          <Input
            v-model="settingRule.input3"
            style="width: 80px"
            ref="input3"
            v-if="settingRule.radio1 == '3'"
            @input="inputLimit('input3')"
          />
        </Radio>
      </RadioGroup>
      <div slot="footer">
        <Button
          type="primary"
          style="margin-right: 30px"
          @click="confirmCheckNumberRule"
          >确定
        </Button>
        <Button type="primary" @click="settingModalVisible = false"
          >取消</Button
        >
      </div>
    </Modal>
    <qualityCheckModal :module-visible.sync="visibleQualityCheckModal" :qualityCheckInfo="qualityCheckInfo"></qualityCheckModal>
  </div>
</template>

<script>
import api from "@/api/api";
import addRemark from "./addRemark.vue";
import basicDataCom from "./basicDataCom.vue";
import largePicture from "@/components/largePicture";
import qualityTestDetail2 from "./qualityTestDetail2.vue";
import qualityCheckModal from "./qualityCheckModal.vue"
export default {
  components: { addRemark, basicDataCom, largePicture, qualityTestDetail2, qualityCheckModal },
  props: {
    isEdit: {
      type: Boolean,
      default() {
        return false;
      },
    },
    pageData: {
      type: Object,
      default() {
        return {};
      },
    },
  },

  data() {
    return {
      formData: {},
      columns: [
        {
          title: "商品信息",
          slot: "basic",
          width: 340,
        },
        {
          title: "质检状态",
          slot: "checkStatus",
          width: 90,
        },
        {
          title: "下单数",
          slot: "purchaseNumber",
          width: 80,
        },
        {
          title: "应检数",
          slot: "planCheckNumber",
          render: (h, params) => {
            return h("InputNumber", {
              props: {
                value: params.row.planCheckNumber,
                min: 0,
                max: 99999999,
                formatter: (value) => {
                  let str = `${value}`.replace(/B(?=(d{3})+(?!d))/g, ",");
                  str = `${value}`.replace(/[^\d]/g, ""); // 清除"数字"和"."以外的字符
                  return str;
                },
                disabled:
                  !this.isEdit ||
                  ["0", "2"].includes(this.wmsReceiptCheckBase.checkType),
              },
              // style: {
              //   width: "50px",
              // },
              on: {
                "on-change": (val) => {
                  params.row.checkRate = (
                    (val * 100) /
                    params.row.purchaseNumber
                  ).toFixed(0);
                  this.wmsReceiptCheckDetailBaseList[
                    params.index
                  ].planCheckNumber = val;
                  this.wmsReceiptCheckDetailBaseList[params.index].checkRate =
                    params.row.checkRate;
                },
              },
            });
          },
        },
        {
          title: "质检标准",
          slot: "checkRateStandard",
        },
        {
          title: "送检数",
          slot: "expectedCheckNumber",
        },
        {
          title: "已检合格数",
          slot: "qualifiedCheckedNumber",
        },
        {
          title: "已检问题数",
          slot: "failedCheckedNumber",
        },
        {
          title: "待检数",
          slot: "awaitCheckedNumber",
        },
        {
          title: "待应检数",
          slot: "awaitPlanCheckedNumber",
        },
        {
          title: "退货数",
          slot: "refundNumber",
        },
        {
          title: "销毁数",
          slot: "destructionNumber",
        },
        {
          title: "剩余数",
          slot: "remainNumber",
        },
        {
          title: "质检员",
          slot: "checkerId",
        },
      ],
      column1: [
        {
          title: "送检批次号",
          slot: "receiptBatchNo",
          width: 200,
        },
        {
          title: "质检状态",
          slot: "checkStatus",
        },
        {
          title: "入库单编号",
          slot: "receiptNo",
          width: 200,
        },
        {
          title: "SKU",
          slot: "goodsSku",
        },
        {
          title: "送检数量",
          slot: "expectedCheckNumber",
        },
        {
          title: "应检数量",
          slot: "planCheckNumber",
        },
        {
          title: "质检比例",
          slot: "checkRate",
        },
        {
          title: "已捡合格数",
          slot: "passCheckNumber",
        },
        {
          title: "已捡问题数",
          slot: "problemCheckNumber",
        },
        {
          title: "待质检数量",
          slot: "waitCheckNumber",
        },
        {
          title: "待应检数量",
          slot: "awaitPlanCheckedNumber",
        },
        {
          title: "质检人",
          slot: "checkCreatedByName",
        },
        {
          title: "创建时间",
          slot: "createdTime",
        },
      ],
      column2: [
        {
          title: "质检记录号",
          slot: "receiptBatchCheckDetailNo",
          width: 180,
        },
        {
          title: "送检批次号",
          slot: "receiptBatchNo",
          width: 180,
        },
        {
          title: "问题原因",
          slot: "problemCheckReason",
        },
        {
          title: "质检图片",
          slot: "checkAttachment",
        },
        {
          title: "备注",
          slot: "remark",
        },
        {
          title: "质检数",
          slot: "awaitPlanCheckedNumber",
          width: 80,
        },
        {
          title: "合格数",
          slot: "passCheckNumber",
          width: 80,
        },
        {
          title: "问题数",
          slot: "problemCheckNumber",
          width: 80,
        },
        {
          title: "质检时间",
          slot: "createdTime",
          width: 100,
        },
        {
          title: "质检人",
          slot: "createdBy",
          width: 180,
        },
      ],
      Tableloading: false,
      modal1: false,
      checkRateSum: 0,
      settingModalVisible: false,
      settingRule: {},
      //基本信息
      wmsReceiptCheckBase: {},
      //商品信息
      wmsReceiptCheckDetailBaseList: [],
      //送检批次信息
      queryBatchCheckResultList: [],
      //质检批次信息
      queryQualityBatchInfoList: [],
      //评论列表
      receiptCheckRemarkDTO: [],
      //送检批次信息详情
      detailParams: {
        warehouseId: null,
        receiptNo: null,
        receiptBatchNo: null,
      },
      gooodsId: null,
      visibleQualityCheckModal: false,
      qualityCheckInfo: {}
    };
  },
  mounted() {
    this.getList();
  },
  deactivated() {
    this.closeOrder();
  },
  methods: {
    getList() {
      let temp = { receiptCheckNo: this.pageData.receiptCheckNo };
      this.axios.post(api.getReceiptCheckDetail, temp).then((res) => {
        this.wmsReceiptCheckBase = res.data.datas.wmsReceiptCheckBase;
        this.wmsReceiptCheckDetailBaseList =
          res.data.datas.wmsReceiptCheckDetailBaseList;
        this.queryBatchCheckResultList =
          res.data.datas.queryBatchCheckResultList;
        this.queryQualityBatchInfoList =
          res.data.datas.queryQualityBatchInfoList;
        this.queryQualityBatchInfoList.forEach(item => {
          let checkAttachmentList = item.checkAttachment.split(',')
          this.$set(item, 'checkAttachmentList', checkAttachmentList)
        })
        this.receiptCheckRemarkDTO = res.data.datas.receiptCheckRemarkDTO;
        //计算质检总比例
        this.countCheckSumRate();
      });
    },
    countCheckSumRate() {
      let temp = this.wmsReceiptCheckDetailBaseList
        .map((item) => {
          return item.planCheckNumber;
        })
        .reduce((pre, cur) => {
          return pre + cur;
        });
      let temp2 = this.wmsReceiptCheckDetailBaseList
        .map((item) => {
          return item.purchaseNumber;
        })
        .reduce((pre, cur) => {
          return pre + cur;
        });
      this.checkRateSum = ((temp * 100) / temp2).toFixed(0);
    },
    closeOrder() {
      this.$emit("closePage");
    },
    seeDetail(row) {
      this.detailParams.warehouseId = this.wmsReceiptCheckBase.warehouseId;
      this.detailParams.receiptNo = this.wmsReceiptCheckBase.receiptNo;
      this.detailParams.receiptBatchNo = row.receiptBatchNo;
      this.productGoodsId = row.productGoodsId;
      this.modal1 = true;
    },
    radioChange() {
      if (this.wmsReceiptCheckBase.checkType == "0") {
        this.wmsReceiptCheckDetailBaseList.forEach((item) => {
          item.planCheckNumber = 0;
          item.checkRate = 0;
        });
        this.checkRateSum = 0;
      }
      if (this.wmsReceiptCheckBase.checkType == "2") {
        //应捡=下单数
        this.wmsReceiptCheckDetailBaseList.forEach((item) => {
          item.planCheckNumber = item.purchaseNumber;
          item.checkRate = 100;
        });
        this.checkRateSum = 100;
      }
    },
    confirmCheckNumberRule() {
      if (this.settingRule.radio1 == "1") {
        let spuList = [
          ...new Set(
            this.wmsReceiptCheckDetailBaseList.map((item) => {
              return item.spu;
            })
          ),
        ];
        //根据相同spu分为一组
        let spuArr = [];
        spuList.forEach((itema) => {
          let arr = [];
          this.wmsReceiptCheckDetailBaseList.forEach((itemb) => {
            if (itemb.spu == itema) {
              arr.push(itemb);
            }
          });
          spuArr.push(arr);
        });
        spuArr.forEach((item) => {
          this.countDemo(item, this.settingRule.input1);
        });
        this.wmsReceiptCheckDetailBaseList.forEach((item) => {
          item.checkRate = (
            (item.planCheckNumber * 100) /
            item.purchaseNumber
          ).toFixed(0);
        });
        this.countCheckSumRate();
      }
      if (this.settingRule.radio1 == "2") {
        this.wmsReceiptCheckDetailBaseList.forEach((item) => {
          item.planCheckNumber = parseFloat(
            ((item.purchaseNumber * this.settingRule.input2) / 100).toFixed(0)
          );
          item.checkRate = this.settingRule.input2;
        });
        // this.checkRateSum = this.settingRule.input2;
        this.countCheckSumRate();
      }
      if (this.settingRule.radio1 == "3") {
        this.wmsReceiptCheckDetailBaseList.forEach((item) => {
          item.planCheckNumber = parseFloat(this.settingRule.input3);
          item.checkRate = (
            (item.planCheckNumber * 100) /
            item.purchaseNumber
          ).toFixed(0);
        });
        this.countCheckSumRate();
      }

      this.settingModalVisible = false;
    },
    countDemo(array, confirmSpuRate) {
      array.forEach((item) => {
        item.isContinue = 0;
      });
      let sum = 0;
      sum = array
        .map((item) => {
          return item.purchaseNumber;
        })
        .reduce((pre, cur) => {
          return pre + cur;
        });
      let sumCheck = ((sum * confirmSpuRate) / 100).toFixed(0);
      //1.先用质检比例*下单数
      array.forEach((item) => {
        item.planCheckNumber = item.purchaseNumber * (confirmSpuRate / 100);
      });
      //2.有小数向下四舍五入，整数不做处理但isContinue为1
      array.forEach((item) => {
        if (item.planCheckNumber % 1 === 0) {
          item.isContinue = 1;
        } else {
          item.planCheckNumber = Math.floor(item.planCheckNumber);
        }
      });
      let restCheck =
        sumCheck -
        array
          .map((item) => {
            return item.planCheckNumber;
          })
          .reduce((pre, cur) => {
            return pre + cur;
          });
      if (restCheck == 0) return;
      let test = function (array, restCheck) {
        //可以循环的skuIndex列表,isContinue为1的不循环
        let randomIndexList = array
          .map((item, index) => {
            if (item.isContinue == 0) return index;
          })
          .filter((item) => {
            return item != undefined;
          });
        //筛选出的randomIndex
        let randomIndex =
          randomIndexList[Math.floor(Math.random() * randomIndexList.length)];
        //选出的的那一个sku质检数+1，然后不再进行循环(isContinue为1)
        array[randomIndex].planCheckNumber =
          array[randomIndex].planCheckNumber + 1;
        array[randomIndex].isContinue = 1;
        //循环一次剩余数-1
        restCheck = restCheck - 1;
        //当剩余数为0时推出
        if (restCheck != 0) {
          test(array, restCheck);
        }
      };
      test(array, restCheck);
    },
    saveData() {
      let temp = {
        receiptCheckId: this.wmsReceiptCheckBase.receiptCheckId,
        planCheckNumber: null,
        checkRate: this.checkRateSum,
        checkType: this.wmsReceiptCheckBase.checkType,
        // createdBy: this.$store.state.userInfo.userName,
        receiptCheckDetailBaseList: [],
      };
      temp.planCheckNumber = this.wmsReceiptCheckDetailBaseList
        .map((item) => {
          return item.planCheckNumber;
        })
        .reduce((pre, cur) => {
          return pre + cur;
        });
      this.wmsReceiptCheckDetailBaseList.forEach((item) => {
        let obj = {};
        obj.receiptCheckDetailId = item.receiptCheckDetailId;
        obj.planCheckNumber = item.planCheckNumber;
        obj.checkRate = item.checkRate;
        temp.receiptCheckDetailBaseList.push(obj);
      });
      if (this.wmsReceiptCheckBase.checkType == "1") {
        let result = this.validateNumber();
        if (!result) return;
      }
      this.axios.post(api.updateReceiptCheckType, temp).then((res) => {
        this.$Message.success("保存成功");
        this.$emit("closePage");
      });
    },
    openModal() {
      this.settingModalVisible = true;
      this.$nextTick(() => {
        this.$refs["input1"].$refs.input.focus();
      });
      this.settingRule = {
        radio1: "1",
        input1: "",
        input2: "",
        input3: "",
      };
    },
    validateNumber() {
      let isAllZero = true;
      let isAllReplenishQuantity = true;
      this.wmsReceiptCheckDetailBaseList.forEach((item) => {
        if (item.planCheckNumber != 0) isAllZero = false;
        if (item.planCheckNumber != item.purchaseNumber) {
          isAllReplenishQuantity = false;
        }
      });
      if (isAllZero || isAllReplenishQuantity) {
        this.$Message.warning(
          "质检类型为抽检时，应检数量不能都为0或都为下单数量"
        );
        return false;
      } else {
        return true;
      }
    },
    inputLimit(data) {
      this.settingRule[data] = this.settingRule[data].replace(/[^\d]/g, "");

      if (data != "input3" && this.settingRule[data] > 100) {
        this.$nextTick(() => {
          this.settingRule[data] = 100;
        });
      }
    },
    settingRuleChange(val) {
      let temp = "input" + val;
      this.$nextTick(() => {
        this.$refs[temp].$refs.input.focus();
      });
    },
    getQualityCheckModal(val){
      let type = ''
      if(val.checkRate > 0) {
        type = val.checkRate === 100 ? '全检' : '抽检'
      } else {
        type = '免检'
      }
      this.qualityCheckInfo = {
        qualityType : type,
        qualityCheckRate: val.checkRate,
        qualityClassification: val.goodsQualityInfo.qualityTemplateName,
        washedLabel: val.washedLabel,
        qualityProjectVOList: val.goodsQualityInfo.goodsQualityDetailList,
        washedLabelPdfPath: val.washedLabelPdfPath,
        templateType: val.goodsQualityInfo.templateType,
        loading: true,
      }
      this.visibleQualityCheckModal = true;
      if(!this.$common.isEmpty(val.washedLabelPdfPath)) {
        const url = val.washedLabelPdfPath;
        const suffix = url.substring(url.lastIndexOf('.'), url.length);
        if (suffix.toLocaleLowerCase() == '.pdf') {
          this.$common.getPdfRes({
            pdfUrl: `./filenode/s${url}`,
            pageNumber: 1,
            scale: 10
          }).then(img => {
            this.$set(this.qualityCheckInfo, 'imgData', img);
          }).finally(() => {
            this.$nextTick(() => {
              this.$set(this.qualityCheckInfo, 'loading', false);
            });
          })
        } else {
          this.$set(this.qualityCheckInfo, 'imgData', `./filenode/s${url}`);
          this.$nextTick(() => {
            this.$set(this.qualityCheckInfo, 'loading', false);
          });
        }
      } else {
        this.$nextTick(() => {
          this.$set(this.qualityCheckInfo, 'loading', false);
        });
      }
    },
  },
};
</script>

<style scoped>
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

.remarkItemTextarea >>> .ivu-form-item-content {
  margin-left: 30px !important;
}

.textareaContent >>> textarea {
  width: 500px !important;
  height: 60px !important;
}

.itemRemark {
  margin-left: 20px;
  display: inline;
  white-space: pre-wrap;
  width: 400px;
}

.remarkItemTextarea >>> .ivu-form-item-content {
  line-height: 20px !important;
}
.qualityCheck{
  display: inline-block;
  cursor: pointer;
  text-decoration: underline;
}
</style>