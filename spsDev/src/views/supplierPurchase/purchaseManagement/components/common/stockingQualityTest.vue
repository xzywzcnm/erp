<template>
  <div>
    <div style="display: flex">
      <div style="width: 4px; height: 20px; background: #2c74f6"></div>
      <span class="ml10">基本信息</span>
    </div>

    <Row style="margin-top: 20px">
      <Col span="5" :offset="1">备货计划编号：保存后创建</Col>
      <Col span="6">备货类型：{{ baseInfo.readyType }}</Col>
      <Col span="6">备货仓库：{{ baseInfo.backupWarehouseId }}</Col>
      <Col span="6" v-if="baseInfo.readyType == 2"
        >中转仓库：{{ baseInfo.purchaseWarehouseId }}</Col
      >
    </Row>
    <Row class="mt10">
      <Col span="5" :offset="1">创建人： {{ baseInfo.createdName }}</Col>
      <Col span="6">SKU总数量： {{ baseInfo.planDetailsList.length }}</Col>
      <Col span="6">商品总数量：{{ baseInfo.totalQty }}</Col>
    </Row>
    <Row class="mt10">
      <Col span="10" :offset="1">备货备注： {{ baseInfo.remark }}</Col>
    </Row>
    <div style="display: flex; margin-top: 20px">
      <div style="width: 4px; height: 20px; background: #2c74f6"></div>
      <span class="ml10">质检比例信息</span>
      <span style="margin-left: 20px"
        >SKU总数量：{{ baseInfo.planDetailsList.length }}，商品总数量：{{
          baseInfo.totalQty
        }}，总金额：{{ baseInfo.totalPrice || 0 }}，应检总数量：{{
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
      <Button @click="batchEditQualityTest(null)">批量修改质检标准</Button>
      <div style="margin-left: 200px">
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
    ></Table>
    <Modal v-model="editModal" title="修改质检标准" width="800px" >
      <Form ref="modalForm" :model="modalForm" :rules="ruleValidate" label-position="right" :label-width="100"
      @submit.native.prevent>
        <FormItem prop="checkRate" label="质检比例：" @keyup.enter.native="confirmEditRate">
          <RadioGroup v-model="modalForm.qualityTestNum">
          <div
            style="display: flex;"
          >
            <Radio :label="0" class="mr20">免检：0%</Radio>
            <Radio :label="2" class="mr20">全检：100%</Radio>
            <Radio :label="1" 
              >抽检：
              <div
                style="display: inline-block"
                v-if="modalForm.qualityTestNum == 1"
              >
                <FormItem prop="randomCheckRate" id="spotCheck">
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
        </FormItem>
       <div v-if="editIndex !== null">
        <FormItem prop="waterWashLabel" label="水洗唛成分：" >
         <span>{{modalForm.waterWashLabel}}</span>
        </FormItem>
        <FormItem prop="qualityCheckTemplate" label="质检模板：" >
          <div class="flexBox">
            <div>{{ modalForm.qualityClassification }}</div>
            <div class="templateTypeStyle">
              <Tooltip transfer content="模板类型">
                <Tag v-if="!$common.isEmpty(modalForm.templateType)" :color="templateTypeMap[modalForm.templateType].color">
                {{ templateTypeMap[modalForm.templateType].text }}
              </Tag>
            </Tooltip>
          </div>
          </div>
        </FormItem>
        <div style="margin-left: 25px">
          <Table :columns="qualityColumns" :data="modalForm.qualityProjectVOList" border></Table>
          <div style="padding: 15px 20px 0 0; text-align: right;">质检价格合计：{{ editModalTotal.toFixed(2) }}</div>
        </div>
       </div>
      </Form>

      <div slot="footer" style="text-align: right">
        <Button type="primary" @click="confirmEditRate">确定</Button>
        <Button @click="editModal = false">取消</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import Mixin from "@/components/mixin/common_mixin";
export default {
  mixins: [Mixin],
  props: {
    planData: {
      type: Object,
      default: () => {
        return {};
      },
    },
    warehouseArr: {
      type: Array,
      default: () => {
        return [];
      }, //备货仓库list
    },
    transferWarehouseArr: {
      type: Array,
      default: () => {
        return [];
      }, //中转仓库list
    },
    totalQty: {
      type: Number,
      default: () => {
        return 0;
      },
    }, //商品总数量
    totalPrice: {
      type: String,
      default: () => {
        return null;
      },
    }, //商品总金额
    proList: {
      type: Array,
      default: () => {
        return [];
      },
    }, //table
  },
  watch: {
    data1: {
      handler(val){
        const spuInfo = {
          spuList: this.data1.map(item => item.spu)
        }
        this.getProductQualityInfo(spuInfo)
      }
    }
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
          width: "400",
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
                placement: 'top'
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
                      this.batchEditQualityTest(params.index, params.row);
                    },
                  },
                },
                `${temp}:${params.row.planCheckRate}%`
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
                      this.batchEditQualityTest(params.index, params.row);
                    },
                  },
                },
                `${params.row.qualityClassification || ''}`
              ),
            ];
          },
        },
        {
          title: "SKU",
          key: "skuNo",
          width: "140px",
        },
        {
          title: "规格",
          key: "specification",
          width: "150px",
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
          title: "备货数量",
          key: "replenishQuantity",
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
                    this.data1[params.index].skuCheckRate = temp;
                  });
                  // 计算spu质检比例;
                  this.calculateSpuRate();
                  this.calculateTotalCheckNumberAndRate();
                },
              },
            });
          },
        },
        {
          title: "SKU质检比例",
          key: "skuCheckRate",
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
        waterWashLabel: '', // 水洗唛标签
        qualityProjectVOList:[],
        qualityClassification:'',
        templateType: null
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
      }, //基本信息
      editIndex: "", //单个修改备货质检比例
      qualityColumns: [
        {
          title: '质检项目',
          key: 'qualityProject',
          width: 140,
          align: 'left',
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.price) || row.price < 0) {
              return h('span', {
                style: {
                  color: '#f20'
                }
              }, row.qualityProject || '')
            }
            return h('span', {}, row.qualityProject || '');
          }
        },
        {
          title: '质检内容描述',
          key: 'qualityDescription',
          minWidth: 200,
          align: 'left',
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.price) || row.price < 0) {
              return h('span', {
                style: {
                  color: '#f20'
                }
              }, row.qualityDescription || '')
            }
            return h('span', {}, row.qualityDescription || '');
          }
        },
        {
          title: '价格',
          key: 'price',
          width: 120,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.price) || row.price < 0) {
              return h('Poptip', {
                props: {
                  placement: 'right',
                  trigger: 'hover',
                  transfer: true
                }
              }, [
                h('div', {
                  style: {
                    color: '#f20'
                  }
                }, '不可用'),
                h('div', {
                  slot: 'content',
                  props: {},
                  attrs: {},
                }, '质检价格为空，不可用，请先完善价格信息')
              ]);
            }
            return h('span', row.price);
          }
        }
      ],
      templateTypeMap: {
        0 : { text: '常规', color: 'green' },
        1 : { text: 'Temu', color: 'red' },
        2 : { text: 'Shein', color: 'purple' },
        3 : { text: 'Tiktok', color: 'orange' },
        4 : { text: 'Otto', color: 'blue' },
      }
    };
  },
  computed: {
    editModalTotal () {
      if (this.$common.isEmpty(this.modalForm) || this.$common.isEmpty(this.modalForm.qualityProjectVOList)) return 0;
      let priceTotal = 0;
      this.modalForm.qualityProjectVOList.forEach(row => {
        if (!(this.$common.isEmpty(row.price) || row.price < 0)) {
          priceTotal += row.price;
        }
      })
      return priceTotal;
    }
  },
  mounted() {
    this.getBaseInfo();
  },
  methods: {
    //获取基本信息
    getBaseInfo() {
      if (this.planData.status == 1) {
        this.planData.planDetailsList.forEach((item) => {
          item.checkType = item.productCheckType;
          item.checkRate = item.productCheckRate;
        });
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
        this.data1 = this.planData.planDetailsList;
        this.calculateTotalCheckNumberAndRate();
        this.calculateSkuRate();
        this.calculateSpuRate();
        return;
      }
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
      //set 增加sku质检比例
      this.planData.planDetailsList.forEach((item, index) => {
        this.$set(this.planData.planDetailsList[index], "skuCheckRate", 0);
        this.$set(this.planData.planDetailsList[index], "planCheckNumber", 0);
        this.$set(this.planData.planDetailsList[index], "planCheckType", 0);
        this.$set(this.planData.planDetailsList[index], "planCheckRate", 0);
        this.$set(this.planData.planDetailsList[index], "spuCheckRate", 0);
      });
      this.classifySpu();
      this.initTableNum();
      this.calculateTotalCheckNumberAndRate();
      this.data1 = this.planData.planDetailsList;
    },
    //初始化备货质检类型和比例
    initTableNum() {
      this.planData.planDetailsList.forEach((item) => {
        if (item.checkType != 0) {
          if (!item.checkType) {
            item.checkType = item.productCheckType;
            item.checkRate = item.productCheckRate;
          }
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
    batchEditQualityTest(index, data) {
      if(index === null) {
        this.editIndex = index;
        this.modalForm.qualityTestNum = 0;
        this.modalForm.randomCheckRate = "";
        this.modalForm.templateType = null;
        this.editModal = true;
      } else {
        this.editIndex = index;
        this.modalForm.qualityTestNum = data.planCheckType;
        this.modalForm.randomCheckRate = data.planCheckRate;
        this.modalForm.templateType = data.templateType;
        let obj = {
          spuList: [data.spu]
        }
        const batchFlag = true
        this.getProductQualityInfo(obj, batchFlag)
      }
    },
    getProductQualityInfo(data , flag = false){
      this.axios.post('/product-service/productInfo/queryProductQualityInfoList',  data).then(res => {
        if(res.data.code === 0) {
          if(data.spuList.length === 1 && flag) {
            this.modalForm.waterWashLabel = res.data.datas[0].washedLabel
            this.modalForm.qualityProjectVOList = res.data.datas[0].qualityProjectVOList || []
            this.modalForm.qualityClassification = res.data.datas[0].qualityClassification
            this.editModal = true;
          }  else {
            this.data1.forEach(item => {
              const qualityInfo = res.data.datas.filter(el => el.spu === item.spu)
              this.$set(item, 'qualityClassification',  qualityInfo[0].qualityClassification)
              this.$set(item, 'templateType',  qualityInfo[0].templateType)
            })
          }
        }
      })
    },
    //确定修改
    confirmEditRate() {
      this.$refs["modalForm"].validate((valid) => {
        if (valid) {
          //在单列设置
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
                item.qualityTemplate = this.modalForm.qualityClassification
                spuList.push(item);
              }
            });

            //如果是抽检单独对那一部分相同spu的进行处理
            this.modalForm.qualityTestNum == 1
              ? this.countDemo(spuList, this.modalForm.randomCheckRate)
              : null;
            //计算spu质检比例
            this.calculateSpuRate();
            //计算sku质检比例
            this.calculateSkuRate();
            this.calculateTotalCheckNumberAndRate();
            this.editModal = false;
            return;
          }
          //批量设置
          this.planData.planDetailsList.forEach((item) => {
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
          });
          //设置应检数量
          if (this.modalForm.qualityTestNum == 1) {
            this.calculateCheckNum();
          }
          //计算spu质检比例
          this.calculateSpuRate();
          //计算sku质检比例
          this.calculateSkuRate();
          this.calculateTotalCheckNumberAndRate();
          this.editModal = false;
        }
      });
    },
    //设置最少数量
    settingLowestNum() {
      if (this.lowestNum == null || this.lowestNum == "") {
        return this.$Message.warning("请输入应检最少数量");
      }
      this.lowestNum = parseInt(this.lowestNum);
      if (this.lowestNum) {
        this.planData.planDetailsList.forEach((item) => {
          this.lowestNum > item.replenishQuantity
            ? (item.planCheckNumber = item.replenishQuantity)
            : this.lowestNum < item.planCheckNumber
            ? ""
            : (item.planCheckNumber = this.lowestNum);
        });
        this.calculateSpuRate();
        this.calculateSkuRate();
      }
    },
    //合并表格
    handleSpan({ row, column, rowIndex, columnIndex }) {
      if ([0, 1, 2, 3, 10].includes(columnIndex)) {
        return { rowspan: row.rowspan, colspan: row.colspan };
      }
    },
    //根据spu分类
    classifySpu() {
      let spuList = this.planData.planDetailsList.map((item) => {
        return item.spu;
      });
      spuList = new Set(spuList);
      let tempList = [];
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
        tempList.push(...tempSkuList);
      });
      this.planData.planDetailsList = tempList;
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
        return item.spu;
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
        if (checkRate == undefined) {
          checkRate = 0;
        }
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
  },
};
</script>

<style scoped  lang="less">
::v-deep .radom .ivu-input {
  height: 25px;
}
::v-deep #spotCheck .ivu-form-item-content {
  line-height: 0;
}
.templateTypeStyle {
  margin-left: 20px;
}
</style>