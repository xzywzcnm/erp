<template>
  <div>
    <div style="display: flex">
      <div style="width: 4px; height: 20px; background: #2c74f6"></div>
      <span class="ml10">基本信息</span>
    </div>

    <Row style="margin-top: 20px">
      <Col span="5" :offset="1"
        >备货计划编号：{{ baseInfo.planSerialNumber }}</Col
      >
      <Col span="6">备货类型：{{ baseInfo.readyType }}</Col>
      <Col span="6">备货仓库：{{ baseInfo.backupWarehouseId }}</Col>
      <Col span="6" v-if="baseInfo.readyType == 2 || baseInfo.readyType == '全托管备货'"
        >中转仓库：{{ baseInfo.purchaseWarehouseId }}</Col
      >
    </Row>
    <Row class="mt10">
      <Col span="5" :offset="1">平台主体： {{ baseInfo.platformSubject || '-'}}</Col>
      <Col span="6">备货店铺： {{ baseInfo.accountCode || '-'}}</Col>
      <Col span="6">SKU总数量： {{ baseInfo.planDetailsList.length }}</Col>
      <Col span="6" >平台订单号： {{ baseInfo.platformOrderNo }}</Col>
    </Row>
    <Row class="mt10">
      <Col span="5" :offset="1">商品总数量：{{ baseInfo.totalQty }}</Col>
      <Col span="6" >创建人： {{ baseInfo.createdName }}</Col>
      <Col span="6">所属事业部：{{ baseInfo.businessDeptName }}</Col>
      <Col span="6">备货备注： {{ baseInfo.remark }}</Col>
    </Row>
    <div style="display: flex; margin-top: 20px">
      <div style="width: 4px; height: 20px; background: #2c74f6"></div>
      <span class="ml10">质检比例信息</span>
      <span style="margin-left: 20px"
        >SKU总数量：{{ baseInfo.planDetailsList.length }}，商品总数量：{{
          baseInfo.totalQty
        }}，总金额：{{ baseInfo.estimatedAmount }}，应检总数量：{{
          baseInfo.totalCheckNumber
        }}，总质检比例：{{ baseInfo.totalCheckRate }}%</span
      >
    </div>
    <div
      style="
        margin-top: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
      "
    >
      <Button @click="batchEditQualityTest(null)" v-if="plansType != 2"
        >批量修改质检标准</Button
      >
      <div style="margin-left: 200px" v-if="plansType != 2">
        应检最少数量：
        <Input v-model="lowestNum" style="width: 100px" />
        <Button style="margin-left: 20px" @click="settingLowestNum"
          >设置</Button
        >
      </div>
    </div>
    <Table
      border
      :columns="columns1"
      :data="data1"
      class="mt10"
      :height="500"
      :span-method="handleSpan"
    >
      <template slot-scope="{ row }" slot="voidedQuantity">
        <div style="color: #eb3223">
          <Tooltip
            :content="row.orderPlacementInfo"
            placement="top-start"
            v-if="row.voidedQuantity != 0"
          >
            {{ row.voidedQuantity }}
          </Tooltip>
          <!-- <span v-if="row.voidedQuantity == 0"> {{ row.voidedQuantity }}</span> -->
        </div>
      </template>
      <template slot-scope="{ row }" slot="purchaseNumberList">
        <div v-for="(item, index) in row.purchaseNumberList" :key="index">
          {{ item }}
        </div>
      </template>
    </Table>
    <!-- <div class="table-page clear">
      <div class="table-page-right">
        <Page
          :total="planData.planDetailsList.length"
          @on-change="proChangePage"
          show-total
          :page-size="proPage.pageSize"
          show-elevator
          :current="proPage.pageNum"
          show-sizer
          @on-page-size-change="proChangePageSize"
          placement="top"
          :page-size-opts="pageArray"
        ></Page>
      </div>
    </div> -->
    <Modal v-model="editModal" title="修改质检标准">
      <Form ref="modalForm" :model="modalForm" :rules="ruleValidate">
        <RadioGroup v-model="modalForm.qualityTestNum">
          <div
            style="display: flex; flex-direction: column; padding-left: 50px"
          >
            <Radio :label="0" class="mt10">免检：0%</Radio>
            <Radio :label="2" class="mt20">全检：100%</Radio>
            <Radio :label="1" class="mt20"
              >抽检：
              <div
                style="display: inline-block"
                v-if="modalForm.qualityTestNum == 1"
              >
                <FormItem prop="randomCheckRate">
                  <Input
                    v-model="modalForm.randomCheckRate"
                    style="width: 80px"
                    class="radom"
                    @input="inputLimit()"
                  />%</FormItem
                >
              </div>
            </Radio>
          </div>
        </RadioGroup>
      </Form>

      <div slot="footer" style="text-align: center">
        <Button type="primary" @click="confirmEditRate">确定</Button>
        <Button @click="editModal = false">取消</Button>
      </div>
    </Modal>
    <qualityCheckModal :qualityCheckInfo="curQualityCheckInfo" :module-visible.sync="visibleQualityCheckModal"></qualityCheckModal>
  </div>
</template>

<script>
import api from "@/api/api";
import Mixin from "@/components/mixin/common_mixin";
import qualityCheckModal from "./qualityCheckModal.vue"
export default {
  mixins: [Mixin],
  components: { qualityCheckModal },
  props: {
    planData: {
      type: Object,
      default: () => {
        return {};
      },
    },

    totalQty: {
      type: Number,
      default: () => {
        return 0;
      },
    }, //商品总数量
    totalPrice: {
      type: String || Number,
      default: () => {
        return 0;
      },
    }, //商品总金额
    proList: {
      type: Array,
      default: () => {
        return [];
      },
    }, //table
    plansType: {
      type: String,
      default: () => {
        return "";
      },
    },
  },
  data() {
    var self = this;
    return {
      lowestNum: null, //应检最少数量
      columns1: [
        {
          key: "picture",
          title: "图片",
          align: "center",
          render: (h, params) => {
            return self.tableImg(h, params, "thumbUrl");
          },
        },
        {
          title: "产品SPU/产品名称",
          key: "age",
          width: "140",
          render: (h, params) => {
            return [
              h(
                "span",
                {
                  style: {
                    display: "inline-block",
                  },
                },
                ` spu:${params.row.spu}`
              ),
              h(
                "div",
                {
                  style: {},
                },
                params.row.goodsName
              ),
            ];
          },
        },
        {
          title: "产品质检比例",
          key: "productRate",
          width: "110",
          render: (h, params) => {
            let temp;
            temp =
              params.row.checkType == 0
                ? "免检"
                : params.row.checkType == 2
                ? "全检"
                : "抽检";
            let typeMap = {
              0 : { text: '常规', color: 'green' },
              1 : { text: 'Temu', color: 'red' },
              2 : { text: 'Shein', color: 'purple' },
              3 : { text: 'Tiktok', color: 'orange' },
              4 : { text: 'Otto', color: 'blue' },
            }
            return [
              h(
                "span",
                {
                  style: {
                    display: "inline-block",
                  },
                },
                `${temp},${params.row.checkRate}%`
              ),
              h('Tooltip', {
                props: {
                  content: '模板类型',
                  transfer: true
                }
              }, 
              this.$common.isEmpty(params.row.templateType) ? '' :
              [h('Tag',{
                props: {
                  color: typeMap[params.row.templateType].color,
                },
                style: {
                  marginTop: '5px'
                }
              } , typeMap[params.row.templateType].text)]),
            ];
          },
        },
        {
          title: "备货质检标准",
          key: "planCheckRate",
          width: "110px",
          render: (h, params) => {
            let temp;
            temp =
              params.row.planCheckType == 0
                ? "免检"
                : params.row.planCheckType == 2
                ? "全检"
                : "抽检";
            let abnormalFlag = false
            if(this.$common.isEmpty(params.row.qualityClassification) && params.row.planCheckType !== 0) {
              abnormalFlag = true
            }
            // params.row.planCheckRate =
            //   params.row.planCheckType == 0
            //     ? 0
            //     : params.row.planCheckType == 2
            //     ? 100
            //     : params.row.planCheckRate;
            return [
              h(
                "span",
                {
                  style: {
                    display: "inline-block",
                    cursor: "pointer",
                    textDecoration: "underline",
                    color: abnormalFlag ? 'red' : "#001ef5",
                  },
                  on: {
                    click: () => {
                      // this.batchEditQualityTest(params.index);
                      this.batchQualityCheckModal(params.index,params.row, temp)
                    },
                  },
                },
                `${temp},${params.row.planCheckRate}%`
              ),
              h(
                "div",
                {
                  style: {
                    cursor: "pointer",
                    textDecoration: "underline",
                    color: "#001ef5",
                  },
                  on: {
                    click: () => {
                      this.batchQualityCheckModal(params.index,params.row, temp)
                    },
                  },
                },
                `${params.row.qualityClassification || ''}`
              )
            ];
          },
        },
        {
          title: "SKU",
          key: "skuNo",
          width: "100px",
        },
        {
          title: "规格",
          key: "specification",
          width: "120px",
          render: (h, params) => {
            let spec = "";
            if (params.row.productGoodsSpecifications) {
              spec = params.row.productGoodsSpecifications
                .map((i) => i.name + ":" + i.value)
                .join(",");
            }
            return [
              h(
                "span",
                {
                  style: {
                    display: "inline-block",
                    color: "#377d22",
                  },
                },
                spec
              ),
            ];
          },
        },
        {
          key: "outerPackageRequirement",
          title: '生产要求',
          align: "center",
          width: '150px',
          render: (h, params) => {
            return h('div', {
              style: {
                whiteSpace: 'pre-wrap',
                wordPreak: 'break-all'
              }
            }, params.row.outerPackageRequirement)
          }
        },
        {
          title: "备货数量",
          key: "replenishQuantity",
          width: "90px",
        },
        {
          title: "应检数量",
          key: "planCheckNumber",
          width: "120px",
          render: (h, params) => {
            return h("InputNumber", {
              props: {
                value: self.data1[params.index].planCheckNumber,
                min: 0,
                max: self.data1[params.index].replenishQuantity,
                formatter: (value) => {
                  let str = `${value}`.replace(/B(?=(d{3})+(?!d))/g, ",");
                  str = `${value}`.replace(/[^\d]/g, ""); // 清除"数字"和"."以外的字符
                  return str;
                },
                //  disabled: this.orderType == "3" || this.orderType == "4",
                disabled: this.plansType == 2,
              },
              // style: {
              //   width: "50px",
              // },
              on: {
                "on-change": (val) => {
                  this.data1[params.index].planCheckNumber = val;
                  let temp = (
                    (val * 100) /
                    this.data1[params.index].replenishQuantity
                  ).toFixed(0);
                  this.$nextTick(() => {
                    // this.$set(this.data1[params.index], "skuCheckRate", temp);
                    this.data1[params.index].skuCheckRate = temp;
                  });
                  this.calculateSpuRate();
                  // 计算spu质检比例;
                },
              },
            });
          },
        },
        {
          title: "SKU质检比例",
          key: "skuCheckRate",
          width: "115px",
          render: (h, params) => {
            return [
              h(
                "span",
                { style: { display: "inline-block" } },
                `${params.row.skuCheckRate}%`
              ),
            ];
          },
        },
        {
          title: "采购员",
          key: "purchaser",
          render: (h, params) => {
            if (params.row.purchaserName) {
              return h("span", params.row.purchaserName);
            } else {
              return h("span", "-");
            }
          },
        },
        {
          title: "采购数量",
          key: "purchaseQuantity",
          width: "80px",
          render: (h, params) => {
            return h("span", params.row.purchaseQuantity);
          },
        },
        {
          title: "作废数量",
          key: "voidedQuantity",
          slot: "voidedQuantity",
          width: "80px",
        },
        {
          title: "采购单号",
          key: "purchaseNumberList",
          slot: "purchaseNumberList",
          width: "150px",
        },

        // {
        //   title: "下单情况",
        //   key: "orderPlacement",
        // },
        {
          title: "SPU质检比例",
          key: "spuCheckRate",
          render: (h, params) => {
            return h("span", `${params.row.spuCheckRate}%`);
          },
        },
      ],
      data1: [],
      editModal: false, //修改质检标准弹窗
      modalForm: {
        qualityTestNum: 0, //质检标准（免检全检抽检）
        randomCheckRate: "", //抽检比例
      },
      ruleValidate: {
        randomCheckRate: [
          {
            type: "number",
            required: true,
            message: "抽检比例不能为空",
            trigger: "blur",
          },
        ],
      },
      baseInfo: {
        readyType: "", //备货类型
        backupWarehouseId: "", //备货仓库
        purchaseWarehouseId: "", //中转仓库
        createdName: "", //创建人
        planDetailsList: [], //挑选商品
        totalQty: 0, //商品总数量
        totalPrice: 0, //总金额
        remark: "", //备货备注
        totalCheckNumber: "", //总的应检数量
        totalCheckRate: "", //总的质检比例
        businessDeptName: "", //事业部
      }, //基本信息
      editIndex: "", //单个修改备货质检比例
      warehouseArr: [],
      transferWarehouseArr: [],
      visibleQualityCheckModal: false,
      curQualityCheckInfo: {},
    };
  },
  mounted() {
    this.getBaseDatas();
  },
  methods: {
    //获取基本信息
    getBaseInfo() {
      this.planData.planDetailsList.forEach((item) => {
        item.checkType = item.productCheckType;
        item.checkRate = item.productCheckRate;
      });
      this.data1 = this.planData.planDetailsList;
      this.getQualityTemplate()
      this.baseInfo.planSerialNumber = this.planData.planSerialNumber;
      let temp = { 0: "急采", 1: "普通备货", 2: "海外仓备货", 3: "FBA备货", 4: "全托管备货", 5: "直发备货" };
      this.baseInfo.readyType = temp[this.planData.readyType];
      this.warehouseArr.forEach((item) => {
        if (item.warehouseId == this.planData.backupWarehouseId) {
          this.baseInfo.backupWarehouseId = item.warehouseName;
        }
      });
      this.transferWarehouseArr.forEach((item) => {
        if (item.warehouseId == this.planData.purchaseWarehouseId) {
          this.baseInfo.purchaseWarehouseId = item.warehouseName;
        }
      });
      this.baseInfo.createdName = this.planData.createdName;
      this.baseInfo.planDetailsList = this.planData.planDetailsList;
      this.baseInfo.totalQty = this.totalQty;
      this.baseInfo.totalPrice = this.totalPrice;
      this.baseInfo.remark = this.planData.remark;
      this.baseInfo.estimatedAmount = this.planData.estimatedAmount;
      this.baseInfo.businessDeptName = this.planData.businessDeptName;
      this.baseInfo.platformSubject = this.planData.platformSubject;
      this.baseInfo.accountCode = this.planData.accountCode;
      this.baseInfo.platformOrderNo = this.planData.platformOrderNo;
      this.calculateTotalCheckNumberAndRate();

      return;
      //set 增加sku质检比例
      // this.planData.planDetailsList.forEach((item, index) => {
      //   this.$set(this.planData.planDetailsList[index], "skuCheckRate", 0);
      //   this.$set(this.planData.planDetailsList[index], "planCheckNumber", 0);
      //   this.$set(this.planData.planDetailsList[index], "planCheckType", 0);
      //   this.$set(this.planData.planDetailsList[index], "planCheckRate", 0);
      //   this.$set(this.planData.planDetailsList[index], "spuCheckRate", 0);
      // });
      // this.classifySpu();
      // this.initTableNum();
      // this.data1 = this.planData.planDetailsList;
    },
    //初始化备货质检类型和比例
    initTableNum() {
      this.planData.planDetailsList.forEach((item) => {
        if (!item.checkType) {
          item.checkType = item.productCheckType;
          item.checkRate = item.productCheckRate;
        }
        //初始化备货质检类型
        item.planCheckType = item.checkType;
        //初始化备货质检比例
        item.planCheckRate = item.checkRate;
        //初始化应检数量
        item.planCheckNumber = item.checkType == 0 ? 0 : item.replenishQuantity;
      });
      //初始化抽检的sku质检数量
      this.initCheckNumber();

      //初始化sku质检比例
      this.calculateSkuRate();
      this.calculateSpuRate();
    },
    //打开修改质检标准对话框
    batchEditQualityTest(index) {
      this.editIndex = index;
      this.modalForm.qualityTestNum = 0;
      this.modalForm.randomCheckRate = "";
      this.editModal = true;
    },
    //确定修改
    confirmEditRate() {
      this.$refs["modalForm"].validate((valid) => {
        if (valid) {
          if (this.editIndex != null) {
            let spuList = [];
            this.planData.planDetailsList.forEach((item) => {
              if (
                item.spu == this.planData.planDetailsList[this.editIndex].spu
              ) {
                item.planCheckType = this.modalForm.qualityTestNum;
                item.planCheckRate =
                  this.modalForm.qualityTestNum == 0
                    ? 0
                    : this.modalForm.qualityTestNum == 1
                    ? this.modalForm.randomCheckRate
                    : 100;
                item.planCheckNumber =
                  this.modalForm.qualityTestNum == 0
                    ? 0
                    : this.modalForm.qualityTestNum == 1
                    ? item.planCheckNumber
                    : item.replenishQuantity;
                spuList.push(item);
              }
            });

            //如果是抽检单独对那一部分相同spu的进行处理
            this.modalForm.qualityTestNum == 1
              ? this.countDemo(spuList, this.modalForm.randomCheckRate)
              : null;
            this.editModal = false;
            return;
          }
          this.planData.planDetailsList.forEach((item) => {
            item.planCheckType = this.modalForm.qualityTestNum;
            item.planCheckRate =
              this.modalForm.qualityTestNum == 0
                ? 0
                : this.modalForm.qualityTestNum == 1
                ? this.modalForm.randomCheckRate
                : 100;
          });
          //设置应检数量
          this.calculateCheckNum();
          this.calculateSpuRate();
          this.calculateSkuRate();
          this.editModal = false;
        }
      });
    },
    //设置最少数量
    settingLowestNum() {
      this.lowestNum = parseInt(this.lowestNum);
      if (this.lowestNum) {
        this.planData.planDetailsList.forEach((item) => {
          this.lowestNum > item.replenishQuantity
            ? (item.planCheckNumber = item.replenishQuantity)
            : (item.planCheckNumber = this.lowestNum);
        });
        this.calculateSpuRate();
        this.calculateSkuRate();
      }
    },
    //合并表格
    handleSpan({ row, column, rowIndex, columnIndex }) {
      if ([0, 1, 2, 3, 13].includes(columnIndex)) {
        return { rowspan: row.rowspan, colspan: row.colspan };
      }
    },
    //根据spu分类
    classifySpu() {
      let spuList = this.planData.planDetailsList.map((item) => {
        return item.spu;
      });
      spuList = new Set(spuList);
      spuList.forEach((itema) => {
        let tempSkuList = [];
        this.planData.planDetailsList.forEach((itemb) => {
          if (itemb.spu == itema) {
            tempSkuList.push(itemb);
            // tempSkuList[0].rowspan = tempSkuList.length;
          }
        });
        tempSkuList.forEach((itemc, index) => {
          if (index == 0) {
            itemc.rowspan = tempSkuList.length;
            itemc.colspan = 1;
          } else {
            itemc.rowspan = 0;
            itemc.colspan = 0;
          }
        });
      });
    },

    //批量设置抽检
    calculateCheckNum() {
      this.planData.planDetailsList.forEach((item) => {
        item.planCheckNumber =
          this.modalForm.qualityTestNum == 0
            ? 0
            : this.modalForm.qualityTestNum == 1
            ? item.planCheckNumber
            : item.replenishQuantity;
      });
      this.calculateRandom();
    },
    //计算随机
    calculateRandom() {
      let spuList = this.planData.planDetailsList.map((item) => {
        return item.spu;
      });
      spuList = new Set(spuList);
      spuList.forEach((itema) => {
        let tempSkuList = [];
        this.planData.planDetailsList.forEach((itemb) => {
          if (itemb.spu == itema) {
            tempSkuList.push(itemb);
          }
        });
        this.countDemo(tempSkuList, this.modalForm.randomCheckRate);
      });
    },
    //抽检spu的算法
    countDemo(array, confirmSpuRate) {
      array.forEach((item) => {
        item.isContinue = 0;
      });
      let sum = 0;
      sum = array
        .map((item) => {
          return item.replenishQuantity;
        })
        .reduce((pre, cur) => {
          return pre + cur;
        });
      let sumCheck = ((sum * confirmSpuRate) / 100).toFixed(0);
      //1.先用质检比例*下单数
      array.forEach((item) => {
        item.planCheckNumber = item.replenishQuantity * (confirmSpuRate / 100);
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
    //计算spu的质检比例
    calculateSpuRate() {
      let spuList = this.planData.planDetailsList.map((item) => {
        return item.spu;
      });
      spuList = new Set(spuList);
      spuList.forEach((itema) => {
        let tempSkuList = [];
        this.planData.planDetailsList.forEach((itemb) => {
          if (itemb.spu == itema) {
            tempSkuList.push(itemb);
          }
        });
        let replenishQuantitySum = tempSkuList
          .map((item) => {
            return item.replenishQuantity;
          })
          .reduce((pre, cur) => {
            return pre + cur;
          });
        let planCheckNumberSum = tempSkuList
          .map((item) => {
            return item.planCheckNumber;
          })
          .reduce((pre, cur) => {
            return pre + cur;
          });
        tempSkuList.forEach((item) => {
          item.spuCheckRate = (
            (planCheckNumberSum / replenishQuantitySum) *
            100
          ).toFixed(0);
        });
      });
    },
    //计算sku质检比例
    calculateSkuRate() {
      this.planData.planDetailsList.forEach((item) => {
        item.skuCheckRate = (
          (item.planCheckNumber / item.replenishQuantity) *
          100
        ).toFixed(0);
      });
    },
    //初始化抽检的sku质检数量
    initCheckNumber() {
      let spuList = this.planData.planDetailsList.map((item) => {
        if (item.checkType == 1) {
          return item.spu;
        }
      });
      spuList = new Set(spuList);
      spuList.forEach((itema) => {
        let tempSkuList = [];
        let checkRate = "";
        this.planData.planDetailsList.forEach((itemb) => {
          if (itemb.spu == itema) {
            checkRate = itemb.checkRate;
            tempSkuList.push(itemb);
          }
        });
        this.countDemo(tempSkuList, checkRate);
      });
    },
    //抽检百分比限制
    inputLimit() {
      this.modalForm.randomCheckRate = this.modalForm.randomCheckRate.replace(
        /[^\d]/g,
        ""
      );
      if (this.modalForm.randomCheckRate > 100) {
        this.$nextTick(() => {
          this.modalForm.randomCheckRate = 100;
        });
      } else {
        this.modalForm.randomCheckRate = parseInt(
          this.modalForm.randomCheckRate
        );
      }
    },
    //计算总应检数和应检比例
    calculateTotalCheckNumberAndRate() {
      this.baseInfo.totalCheckNumber = this.planData.planDetailsList
        .map((item) => {
          return item.planCheckNumber;
        })
        .reduce((pre, cur) => {
          return pre + cur;
        });

      this.baseInfo.totalCheckRate = (
        (this.baseInfo.totalCheckNumber / this.baseInfo.totalQty) *
        100
      ).toFixed(0);
    },
    getBaseDatas() {
      // 获取备货仓库和中转仓库
      let v = this;
      v.warehouseArr = [];
      v.transferWarehouseArr = [];
      v.axios
        .post(api.warehouse, {
          merchantId: v.$store.state.userInfo.merchantId,
          pageNum: 1,
          pageSize: 500,
          warehouseStatus: "0",
        })
        .then((res) => {
          if (res.data.code == 0) {
            v.warehouseArr = res.data.datas;
            v.transferWarehouseArr = res.data.datas;
            //获取基本信息
            this.getBaseInfo();
          }
        });
    },
    batchQualityCheckModal(index,data, type) {
      this.visibleQualityCheckModal = true;
      this.curQualityCheckInfo = {
        qualityType: type,
        qualityCheckRate: data.planCheckRate,
        qualityClassification: data.qualityClassification,
        washedLabel:data.washedLabel,
        qualityProjectVOList:data.qualityProjectVOList,
        washedLabelPdfPath: data.washedLabelPdfPath,
        templateType: data.templateType,
        loading: true,
      }
      if(!this.$common.isEmpty(data.washedLabelPdfPath)) {
        const url = data.washedLabelPdfPath;
        const suffix = url.substring(url.lastIndexOf('.'), url.length);
        if (suffix.toLocaleLowerCase() == '.pdf') {
          this.$common.getPdfRes({
            pdfUrl: `./filenode/s${url}`,
            pageNumber: 1,
            scale: 10
          }).then(img => {
            this.$set(this.curQualityCheckInfo, 'imgData', img);
          }).finally(() => {
            this.$nextTick(() => {
              this.$set(this.curQualityCheckInfo, 'loading', false);
            });
          })
        } else {
          this.$set(this.curQualityCheckInfo, 'imgData', `./filenode/s${url}`);
          this.$nextTick(() => {
            this.$set(this.curQualityCheckInfo, 'loading', false);
          });
        }
      } else {
        this.$nextTick(() => {
          this.$set(this.curQualityCheckInfo, 'loading', false);
        });
      }    
    },
    getQualityTemplate() {
      const spuList = this.data1.map(item => item.spu)
      const obj = {
        spuList: spuList
      }
      this.axios.post('/product-service/productInfo/queryProductQualityInfoList',obj).then(res => {
        if(res.data.code === 0) {
          this.data1.forEach(item => {
            const resultArr = res.data.datas.filter(el => el.spu === item.spu)
            this.$set(item, 'qualityClassification', resultArr[0].qualityClassification)
            this.$set(item, 'washedLabel', resultArr[0].washedLabel)
            this.$set(item, 'qualityProjectVOList', resultArr[0].qualityProjectVOList)
            this.$set(item, 'templateType', resultArr[0].templateType)
          });
        }
      })
    },
  },
};
</script>

<style scoped  lang="less">
::v-deep .radom .ivu-input {
  height: 28px;
}
</style>