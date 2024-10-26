<template >
  <div >
    <!--返回列表按钮-->
    <div class="addBinding" style="margin-bottom:10px;" >
      <Icon type="ios-arrow-back" ></Icon >
      <a @click="backPage">返回列表</a>
      <Button type="success" class="ml10" @click="nextOrLastStep">
        {{ firstEdit ? '下一步：质检比例' : '上一步：入库商品' }}
      </Button>
      <Button @click="cancelCreateASNButton" class="ml10">取消</Button>
      <Button type="primary" v-if="secondEdit" class="ml10" @click="createASNBtn('pageParams')" :loading="loading">提交</Button>
    </div >
    <div class="dataSort grayBg" >
      <h3 >基本信息</h3 >
    </div >
    <div style="background-color: #fff;margin:0 10px 0 10px;padding:16px 0 0 16px;" >
      <Form ref="pageParams" class="create-in-ware" :model="pageParams" label-position="right" :label-width="140" :rules="ruleCreateReceipt" :inline="true">
        <Form-item label="入库单类型：" prop="receiptType">
          <Select v-model="pageParams.receiptType" disabled filterable>
            <Option
              v-for="item in receiptTypeList"
              :value="item.receiptType"
              :key="item.receiptType"
            >{{ item.receiptTypeName }}</Option>
          </Select>
        </Form-item>
        <Form-item label="预期到货时间：">
          <div class="flex">
            <DatePicker
              type="date"
              format="yyyy-MM-dd"
              transfer
              placeholder="选择开始日期"
              v-model="pageParams.expectedStartTime"
              :options="pickerBeginDateBefore"
              :disabled="secondEdit"
            ></DatePicker>
            <span>到</span>
              <DatePicker
              type="date"
              format="yyyy-MM-dd"
              transfer
              placeholder="选择结束日期"
              v-model="pageParams.expectedEndTime"
              :options="pickerBeginDateAfter"
              :disabled="secondEdit"
            ></DatePicker>
          </div>
        </Form-item>
        <FormItem label="参考编号1" prop="referenceNo">
          <Input :maxlength="100" v-model="pageParams.referenceNo" :disabled="secondEdit" />
        </FormItem >
        <FormItem label="参考编号2" prop="referenceNo2">
          <Input :maxlength="100" v-model="pageParams.referenceNo2" :disabled="secondEdit" />
        </FormItem>
        <FormItem label="参考编号3" prop="referenceNo3">
          <Input :maxlength="100" v-model="pageParams.referenceNo3" :disabled="secondEdit" />
        </FormItem >
        <Form-item label="运费/报关费/其他费用：">
          <div class="flex">
            <Form-item prop="feeFreight">
              <Input v-model.trim="pageParams.feeFreight" placeholder="0.00" @on-blur="freightFloatPoint" :disabled="secondEdit" />
            </Form-item>
            <Form-item prop="feeDeclaration">
              <Input v-model.trim="pageParams.feeDeclaration" placeholder="0.00" @on-blur="declareFloatPoint" :disabled="secondEdit" />
            </Form-item>
            <Form-item prop="feeOther">
              <Input v-model.trim="pageParams.feeOther" placeholder="0.00" @on-blur="amountFloatPoint" :disabled="secondEdit" />
            </Form-item>
          </div>
        </Form-item>
        <Form-item label="币种：" prop="currency">
          <Select v-model="pageParams.currency" filterable :disabled="secondEdit">
            <Option
              v-for="item in currencyList"
              :value="item.currency"
              :key="item.currency"
            >{{ item.currencyName }}</Option>
          </Select>
        </Form-item>
        <FormItem label="备注" prop="remark">
          <Input v-model="pageParams.remark" :rows="2" type="textarea" :disabled="secondEdit" />
        </FormItem>
        <Form-item label="所属事业部：" prop="businessDeptId">
          <Select v-model="pageParams.businessDeptId" filterable :disabled="secondEdit">
            <Option
              v-for="(item, index) in businessDeptList"
              :value="item.id"
              :key="`${index}-${item.id}`"
              :label="item.name"
            ></Option>
          </Select>
        </Form-item>
      </Form >
    </div>

    <div v-show="firstEdit">
      <div class="dataSort grayBg">
        <h3 >明细信息</h3>
      </div >
      <!-- 添加货品和删除货品按钮 -->
      <div class="addBinding" >
        <Button
            type="primary" icon="md-add" @click="showAddProductModal" style="margin-right: 10px" >添加货品</Button >
        <Button
            type="error" icon="md-trash" @click="deleteProductBtn(selectTableData)" >移除货品</Button >
      </div >
      <div class="shopTable" >
        <!--表格-->
        <dTable
          v-if="firstEdit"
          highlight-row
          border
          :columns="columns7"
          :data="productData"
          ref="selection"
          @on-selection-change="selectItem"
        />
        <!--分页按钮-->
        <div class="table-page" >
          <div class="table-page-right" >
            <Page
                :total="productData.length"
                :current="pageParams.pageNum"
                show-total
                :page-size="pageParams.pageSize"
                show-elevator
                :page-size-opts="pageArray" ></Page>
          </div>
        </div>
      </div>
    </div>
    <div v-if="secondEdit">
      <div class="dataSort grayBg">
        <h3 >质检比例</h3>
      </div>
      <Card style="margin: 15px 0;">
        <div style="margin-bottom: 15px; text-align: center;">
          <Button @click="batchQualityCheckModal(null)">批量修改质检标准</Button>
          <div style="display:inline-block; margin-left: 30px;">
            <span style="display:inline-block;">应检最少数量：</span>
            <dytInput v-model="qualityNumber" style="display:inline-block; width: 200px;"/>
            <Button style="margin-left: 20px;" @click="batchQualitySetData">设置</Button>
          </div>
        </div>
        <Table
          ref="qualityTableRefs"
          highlight-row
          border
          :columns="qualityColumns"
          :data="qualityData"
          :span-method="handleSpan"
        />
      </Card>
    </div>
    <!-- 创建入库单和取消按钮 -->
    <!-- <div class="addBinding" style="margin-top:80px; text-align:center;" >
      <Button
          type="primary"
          style="margin-right:50px;"
          @click="createASNBtn('pageParams')"
          :loading="loading" >创建入库单</Button >
      <Button type="default" icon="md-close" @click="cancelCreateASNButton" >取消</Button >
    </div > -->
    <div class="addBinding" style="display:inline-block;">
      <Affix :offset-bottom="10" style="display:inline-block;">
        <Alert show-icon style="width:360px;display:inline-block;">
          <span >温馨提示：</span > <span style="display:inline-block;">1、创建入库单时，仓库和入库单类型为必选项！</span>
          <span style="display:inline-block;">2、创建入库单时，请先添加货品！</span>
          <span style="display:inline-block;">3、创建入库单时，请输入预期数量！</span>
            <span style="display:inline-block;">4、创建入库单时，请设置质检比例！</span>
        </Alert>
      </Affix>
    </div>
    <!-- 新建货品模态框 -->
    <div v-if="addProductModal" >
      <Modal
          v-model="addProductModal"
          :styles="{ top: '80px', width: '1200px' }"
          class="headerBar addProductBar"
          :title="addProductTitle" >
        <div class="content" >
          <addProduct
              from="inware"
              :disabledSlt="false"
              @addProductSuccess="addProductSuccess"
              @addProductCancel="addProductCancel"
              :wareId="wareId"
              :eliminateData="productData" ></addProduct >
        </div >
        <!--<div slot="footer">-->
        <!--<Button type="primary" @click="addNewProductBtn">确认添加货品</Button>-->
        <!--<Button @click="cancelButton">取消</Button>-->
        <!--</div>-->
      </Modal >
    </div >
    <!-- 是否继续添加提示模态框 -->
    <Modal v-model="showProductTipModal" :styles="{ top: '320px', width: '400px' }" class="headerBar" title="提示" >
      <div class="content" >
        <p >要不要再添加产品！</p >
      </div >
      <div slot="footer" >
        <Button type="default" >关闭</Button >
        <Button type="primary" >继续添加</Button >
      </div >
    </Modal>
    <Modal v-model="editModal" title="修改质检标准" width="800px" >
      <Form
        ref="modalRefForm"
        :model="modalForm"
        :rules="ruleValidate"
        label-position="right"
        :label-width="100"
        @submit.native.prevent
      >
        <FormItem prop="checkRate" label="质检比例：" @keyup.enter.native="confirmEditRate">
          <RadioGroup v-model="modalForm.qualityTestNum">
            <div style="display: flex;">
              <Radio :label="0" class="mr20">免检：0%</Radio>
              <Radio :label="2" class="mr20">全检：100%</Radio>
              <Radio :label="1">抽检：
                <div style="display: inline-block" v-if="modalForm.qualityTestNum == 1">
                  <FormItem prop="randomCheckRate" id="spotCheck">
                    <Input
                      v-model="modalForm.randomCheckRate"
                      style="width: 80px"
                      class="radom"
                    />%
                  </FormItem>
                </div>
              </Radio>
            </div>
          </RadioGroup>
        </FormItem>
       <div v-if="!$common.isEmpty(editIndex)">
        <FormItem prop="waterWashLabel" label="水洗唛成分：" >
         <span>{{modalForm.waterWashLabel}}</span>
        </FormItem>
        <FormItem prop="qualityCheckTemplate" label="质检模板：" >
         <span>{{ modalForm.qualityClassification }}</span>
        </FormItem>
        <div style="margin-left: 25px">
          <Table :columns="projectColumns" :data="modalForm.qualityProjectVOList" border width="700"></Table>
          <div style="padding: 15px 20px 0 0; text-align: right;">质检价格合计：{{ editModalTotal.toFixed(2) }}</div>
        </div>
       </div>
      </Form>
      <div slot="footer" style="text-align: right">
        <Button type="primary" @click="confirmEditRate">确定</Button>
        <Button @click="editModal = false">取消</Button>
      </div>
    </Modal>
  </div >
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import addProduct from '../wms-inStock/newAddProduct';
// import addProduct from './addProduct';
const checkJson = {
  0: '免检',
  1: '抽检',
  2: '全检'
}

export default {
  mixins: [Mixin],
  components: {
    addProduct: addProduct
  },
  data () {
    let v = this;
    return {
      wareId: v.getWarehouseId(),
      loading: false, // 加载中
      showProductTipModal: false, // 是否继续添加产品提示框
      qualityNumber: '',
      stepStatus: 1,
      editIndex: null,
      editModal: false,
      modalForm: {
        qualityTestNum: 0, // 质检标准（免检全检抽检）
        randomCheckRate: '', // 抽检比例
        waterWashLabel: '', // 水洗唛标签
        qualityProjectVOList: [], // 质检标准列表
        qualityClassification: '' // 质检模板名称
      },
      ruleValidate: {
        randomCheckRate: [
          { required: true, validator: this.validaterNumber, trigger: "blur" },
          { required: true, validator: this.validaterNumber, trigger: "change" }
        ],
      },
      pageParams: {
        receiptType: '4', // 入库单类型
        expectedStartTime: null, // 选择开始日期
        expectedEndTime: null, // 选择结束日期
        feeFreight: '', // 运费
        feeDeclaration: '', // 报关费
        feeOther: '', // 其他费用
        currency: '', // 币种
        remark: '', // 备注
        referenceNo: '', // 参考编号1
        referenceNo2: '', // 参考编号2
        referenceNo3: '', // 参考编号3
        businessDeptId: '', // 事业部
        pageNum: 1,
        pageSize: 10000
      }, // 开始时间
      pickerBeginDateBefore: {
        disabledDate: time => {
          let endDateVal = this.pageParams.expectedEndTime;
          let start = Date.now() - 86400000;
          if (endDateVal) {
            return ((time && time.valueOf() < start) || time.valueOf() > endDateVal);
          } else {
            return Date.now() - 86400000 > time && time.valueOf();
          }
        }
      }, // 结束时间
      pickerBeginDateAfter: {
        disabledDate: time => {
          let beginDateVal = this.pageParams.expectedStartTime;
          if (beginDateVal) {
            return time.getTime() < beginDateVal;
          } else {
            return Date.now() - 86400000 > time && time.valueOf();
          }
        }
      }, // 表单验证
      ruleCreateReceipt: {
        receiptType: [
          { required: true, message: '入库单类型不能为空', trigger: 'change' }
        ],
        feeFreight: [
          { validator: this.validateFee(), trigger: 'blur' } // 运费
        ],
        feeDeclaration: [
          { validator: this.validateFee(), trigger: 'blur' } // 报关费
        ],
        feeOther: [
          { validator: this.validateFee(), trigger: 'blur' } // 其他费用
        ],
        businessDeptId: [
          { required: true, message: '请选择所属事业部', trigger: 'change', type: 'number' }
        ]
      },
      userSelectTable: [], // 用户选择的表格数组集合
      wareHouseTypeList: [], // 仓库选择列表
      receiptTypeList: [
        {
          receiptType: '0',
          receiptTypeName: '备货入库'
        }, {
          receiptType: '1',
          receiptTypeName: '生产入库'
        }, {
          receiptType: '2',
          receiptTypeName: '调拨入库'
        }, {
          receiptType: '3',
          receiptTypeName: '退货入库'
        }, {
          receiptType: '4',
          receiptTypeName: '其他入库'
        }, {
          receiptType: '5',
          receiptTypeName: '急采入库'
        }
      ],
      currencyList: [
        {
          currency: '0',
          currencyName: '人民币'
        }, {
          currency: '1',
          currencyName: '美元'
        }
      ],
      total: 0, // 总条数
      addProductModal: false, // 新增货品模态框
      addProductTitle: '添加产品',
      columns7: [
        {
          type: 'selection',
          width: 60,
          align: 'center',
          fixed: 'left'
        }, {
          type: 'index',
          title: '序号',
          minWidth: 120,
          align: 'center'
        }, {
          title: '图片',
          key: 'goodsUrl',
          minWidth: 100,
          align: 'center',
          render: (h, params) => {
            return this.tableImg(h, params, 'goodsUrl');
          }
        }, {
          title: 'SKU',
          key: 'goodsSku',
          align: 'center',
          minWidth: 120
        }, {
          title: '中文描述',
          key: 'goodsCnDesc',
          align: 'center',
          minWidth: 160
        }, {
          title: '英文描述',
          key: 'goodsEnDesc',
          align: 'center',
          minWidth: 160
        }, {
          title: '重量' + '(g)',
          key: 'goodsWeight',
          align: 'center',
          minWidth: 100
        }, {
          title: '体积' + '（cm*3）',
          key: 'goodsVolume',
          align: 'center',
          minWidth: 100
        }, {
          title: '预期数量',
          key: 'expectedNumber',
          minWidth: 150,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('InputNumber', {
                props: {
                  // size: 'small',
                  value: params.row.expectedNumber ? params.row.expectedNumber : null,
                  min: 0
                },
                style: {
                  width: '100%'
                },
                on: {
                  'on-change': num => {
                    let obj = this.productData.find(val => {
                      return val.goodsSku === params.row.goodsSku;
                    });
                    obj.expectedNumber = num;
                  }
                }
              })
            ]);
          }
        }, {
          title: '操作',
          key: 'action',
          align: 'center',
          minWidth: 150,
          render: (h, params) => {
            return h('Poptip', {
              props: {
                confirm: true,
                title: '您确定要删除这条数据吗' + '?',
                transfer: true
              },
              on: {
                'on-ok': () => {
                  this.removeProduct(params.index);
                }
              }
            }, [
              h('Button', {
                style: {
                  margin: '0 5px'
                },
                props: {
                  type: 'error',
                  placement: 'top'
                }
              }, '删除')
            ]);
          }
        }
      ],
      // 质检列表
      qualityData: [],
      // 质检比例列表
      qualityColumns: [
        {
          title: '图片',
          key: 'goodsUrl',
          minWidth: 100,
          align: 'center',
          render: (h, params) => {
            return this.tableImg(h, params, 'goodsUrl');
          }
        },
        {
          title: '产品SPU/产品中英文名称',
          key: 'cnHsName',
          align: 'center',
          minWidth: 150,
          render: (h, { row }) => {
            return h('div', {}, [
              h('div', {}, `spu：${row.spu || ''}`),
              h('div', {}, `中文名称：${row.cnHsName || ''}`),
              h('div', {}, `英文名称：${row.enHsName || ''}`),
            ])
          }
        },
        {
          title: '产品质检比例',
          key: 'checkType',
          align: 'center',
          width: 120,
          render: (h, { row }) => {
            const temp = checkJson[row.checkType];
            return h("span", {
              style: {
                display: "inline-block",
              },
            }, `${temp || ''}， ${row.checkRate}%`);
          },
        },
        {
          title: '备货质检标准',
          key: 'planCheckType',
          align: 'center',
          width: 120,
          render: (h, { row, index }) => {
            const temp = checkJson[row.planCheckType];
            return [
              h("span", {
                style: {
                  display: "inline-block",
                  cursor: "pointer",
                  textDecoration: "underline",
                  color: "#001ef5",
                },
                on: {
                  click: () => {
                    this.batchQualityCheckModal(index, row);
                  },
                },
              }, `${temp || ''}，${row.planCheckRate}%`),
              h("div", {
                style: {
                  cursor: "pointer",
                  textDecoration: "underline",
                  color: "#001ef5",
                },
                on: {
                  click: () => {
                    this.batchQualityCheckModal(index, row)
                  },
                },
              }, `${row.qualityClassification || ''}`)
            ];
          },
        },
        {
          title: 'SKU',
          key: 'goodsSku',
          align: 'center',
          minWidth: 100
        },
        {
          title: '规格',
          key: 'goodsAttributes',
          align: 'center',
          width: 100,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.goodsAttributes)) return h('span', {}, '');
            return h('span', {
              style: {
                color: "#377d22"
              }
            }, row.goodsAttributes);
            // const spec = row.productGoodsSpecifications.map((i) => i.name + ":" + i.value).join(",");
            // return h("span", {
            //   style: {
            //     display: "inline-block",
            //     color: "#377d22",
            //   },
            // }, spec);
          },
        },
        {
          title: '入库数量',
          key: 'expectedNumber',
          minWidth: 150,
          align: 'center',
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.expectedNumber)) return h('div', {}, '0');
            return h('div', {}, row.expectedNumber);
          }
        },
        {
          title: '应检数量',
          key: 'planCheckNumber',
          minWidth: 150,
          align: 'center',
          render: (h, { row, index }) => {
            return h('div', [
              h('InputNumber', {
                props: {
                  value: this.$common.isEmpty(row.planCheckNumber) ? null : row.planCheckNumber,
                  min: 0,
                  max: Number(row.expectedNumber),
                },
                style: {
                  width: '100%'
                },
                on: {
                  'on-change': num => {
                    this.planNumberChange(num, index);
                  }
                }
              })
            ]);
          }
        },
        {
          title: 'SKU质检比例',
          key: 'detailRate',
          align: 'center',
          width: 120,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.detailRate)) return h("span", '');
            return h("span", `${row.detailRate}%`);
          }
        },
        {
          title: 'SPU质检比例',
          key: 'spuCheckRate',
          align: 'center',
          width: 120,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.spuCheckRate)) return h("span", '');
            return h("span", `${row.spuCheckRate}%`);
          }
        },
      ],
      projectColumns: [
        {
          title: '质检项目',
          key: 'qualityProject',
          width: 150,
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
      productData: [], // 表格数据
      selectTableData: [] // 勾选表格行
    };
  },
  computed: {
    // 第一步编辑
    firstEdit () {
      return this.stepStatus == 1;
    },
    // 第二步编辑
    secondEdit () {
      return this.stepStatus == 2;
    },
    // 事业部下拉
    businessDeptList() {
      if (this.$common.isEmpty(this.$store.getters)) return [];
      return this.$store.getters.getBusinessDeptList || [];
    },
    editModalTotal () {
      if (this.$common.isEmpty(this.modalForm.qualityProjectVOList)) return 0;
      let priceTotal = 0;
      this.modalForm.qualityProjectVOList.forEach(row => {
        if (!(this.$common.isEmpty(row.price) || row.price < 0)) {
          priceTotal += row.price;
        }
      })
      return priceTotal;
    }
  },
  created () {
    this.getWareHouseName();
  },
  methods: {
    addProductSuccess (data) {
      let v = this;
      v.addProductModal = false;
      data.forEach(val => {
        val.goodsVolume = val.goodsLength * val.goodsWidth * val.goodsHeight;
        val.source = 'P';
        val.expectedNumber = '';
      });
      var obj = {};
      for (var i = 0; i < data.length; i++) {
        obj[data[i].goodsSku] = 1;
        for (var j = 0; j < v.productData.length; j++) {
          v.productData[j].source = 'P';
          if (obj[v.productData[j].goodsSku]) {
            v.$Message.info('添加货品失败，你已经添加了该货品，不能重复添加');
            v.addProductModal = true;
            return;
          }
        }
      }
      v.productData = v.productData.concat(data); // 待审核
      if (v.productData[0].inventoryId) {
        v.productData = v.repeatArrayObject(v.productData, 'inventoryId');
      } else {
        v.productData = v.repeatArrayObject(v.productData, 'goodsId');
      }
    },
    addProductCancel () {
      this.addProductModal = false;
    }, // 返回列表按钮
    backPage () {
      this.stepStatus = 1;
      this.$emit('backPage', 'list');
    }, // 费用转成两位小数
    freightFloatPoint () {
      let v = this;
      // 判断是否为空或非数字
      if (v.pageParams.feeFreight !== null && !isNaN(v.pageParams.feeFreight)) {
        v.pageParams.feeFreight = Number(v.pageParams.feeFreight).toFixed(2);
      }
    },
    declareFloatPoint () {
      let v = this;
      if (v.pageParams.feeDeclaration !== null && !isNaN(v.pageParams.feeDeclaration)) {
        v.pageParams.feeDeclaration = Number(v.pageParams.feeDeclaration).toFixed(2);
      }
    },
    amountFloatPoint () {
      let v = this;
      if (v.pageParams.feeOther !== null && !isNaN(v.pageParams.feeOther)) {
        v.pageParams.feeOther = Number(v.pageParams.feeOther).toFixed(2);
      }
    }, // 勾选删除当前行
    selectItem (data) {
      this.selectTableData = data;
    },
    // 获取仓库下拉列表
    getWareHouseName: function () {
      // var v = this;
      // v.axios.post(api.selectReceiptWareName).then(res => {
      //   if (res.data.code === 0) {
      //     v.wareHouseTypeList = res.data.datas;
      //   }
      // });
    }, // 费用校验
    validateFee () {
      let v = this;
      var validateFee = function (rule, value, callback) {
        var re = v.$regular.integer;
        var result = [];
        result = re.test(value);
        if (value !== '') {
          if (result === false) {
            callback(new Error('正整数'));
          } else {
            callback();
          }
        } else {
          callback();
        }
      };
      return validateFee;
    }, // 创建入库单校验
    createReceiptValidFn () {
      let v = this;
      let valid = true;
      for (var i = 0; i < v.productData.length; i++) {
        if (v.productData[i].expectedNumber === '') {
          v.$Message.info({
            content: '预期收货数量不能为空',
            duration: 4
          });
          valid = false;
          return;
        }
        if (v.productData[i].expectedNumber <= 0) {
          this.$Message.info({
            content: '预期收货数量不能小于等于0',
            duration: 4
          });
          valid = false;
          return;
        }
        var re = v.$regular.NoDecima;
        if (re.test(v.productData[i].expectedNumber)) {
          v.$Message.info({
            content: '移动数量不能为小数',
            duration: 5
          });
          valid = false;
          return;
        }
      }
      return valid;
    },
    // 下一步（上一步）
    nextOrLastStep () {
      if (this.firstEdit) {
        if (this.productData.length === 0) {
          this.$Message.error('下一步之前，需要先添加货品');
          return;
        }
        const isPass = this.createReceiptValidFn();
        if (!isPass) return;
        this.$refs.pageParams.validate(valid => {
          if (!valid) return;
          let dataJson = {};
          let qualityInfo = {};
          let planNumber = {};
          const spuList = this.$common.arrRemoveRepeat(this.productData.map(row => row.spu));
          this.getQualityInfoList(spuList).then(res => {
            this.stepStatus = 2;
            if (!this.$common.isEmpty(res.data)) {
              res.data.forEach(row => {
                if (this.$common.isEmpty(row.checkRate)) {
                  row.checkRate = '0.00';
                }
                dataJson[row.spu] = row;
              })
            }
            let qualityData = this.productData.map(row => {
              if (this.$common.isEmpty(row.expectedNumber)) {
                row.expectedNumber = 0;
              }
              qualityInfo = (this.$common.isEmpty(dataJson[row.spu]) ? {} : dataJson[row.spu]);
              planNumber = {
                0: 0,
                1: Number((Number(qualityInfo.checkRate) * Number(row.expectedNumber) / 100).toFixed(0)),
                2: row.expectedNumber
              };
              const planNum = this.$common.isEmpty(planNumber[qualityInfo.checkType]) ? 0 : planNumber[qualityInfo.checkType];
              return {
                ...row,
                checkType: this.$common.isEmpty(qualityInfo.checkType) ? '' : qualityInfo.checkType,
                checkRate: (Number(this.$common.isEmpty(qualityInfo.checkRate) ? 0 : qualityInfo.checkRate)).toFixed(0),
                planCheckType: this.$common.isEmpty(qualityInfo.checkType) ? '' : qualityInfo.checkType,
                planCheckRate: (Number(this.$common.isEmpty(qualityInfo.checkRate) ? 0 : qualityInfo.checkRate)).toFixed(0),
                qualityClassification: qualityInfo.qualityClassification || '',
                planCheckNumber: planNum,
                detailRate: ((planNum / row.expectedNumber) * 100).toFixed(0),
                spuCheckRate: '0',
                qualityInfo: qualityInfo,
              }
            });
            qualityData = this.qualityCalculate(qualityData);
            let newList = [];
            spuList.forEach(spu => {
              let getMeRow = qualityData.filter(f => f.spu == spu);
              getMeRow.forEach((row, index) => {
                row.colspan = index == 0 ? 1 : 0;
                row.rowspan = index == 0 ? getMeRow.length : 0;
              });
              newList = [...newList, ...getMeRow];
            });
            this.qualityData = newList;
          })
        })
      } else {
        this.stepStatus = 1;
      }
    },
    // 计算值 SPU 比例
    qualityCalculate (qualityData) {
      let qualitSpuObj = {};
      qualityData.forEach(row => {
        if (this.$common.isEmpty(qualitSpuObj[row.spu])) {
          this.$set(qualitSpuObj, row.spu, {
            expectedNumber: row.expectedNumber,
            planCheckNumber: row.planCheckNumber
          });
        } else {
          qualitSpuObj[row.spu].expectedNumber += row.expectedNumber;
          qualitSpuObj[row.spu].planCheckNumber += row.planCheckNumber;
        }
      });
      const newList = qualityData.map(row => {
        if (!this.$common.isEmpty(qualitSpuObj[row.spu]) && !this.$common.isEmpty(qualitSpuObj[row.spu].expectedNumber)) {
          if (row.rowSpan != 0) {
            row.spuCheckRate = ((qualitSpuObj[row.spu].planCheckNumber / qualitSpuObj[row.spu].expectedNumber) * 100).toFixed(0);
          }
        }
        return row;
      })
      return newList;
    },
    // 获取质检列表数据
    getQualityInfoList (spuList) {
      return new Promise((resolve) => {
        if (this.$common.isEmpty(spuList)) return resolve({ success: false, data: [] });
        this.axios.post(api.queryProductQualityInfoList, { spuList: spuList }).then(res => {
          if (!res || !res.data || res.data.code != 0) return resolve({ success: false, data: [] });
          resolve({ success: true, data: res.data.datas || [] });
        }).catch(() => {
          resolve({ success: false, data: [] });
        })
      })
    },
    // 验证抽检数量
    validaterNumber (rule, value, callback) {
      if (this.$common.isEmpty(value)) return callback(new Error('抽检比例不能为空'));
      const val = Number(value);
      if (this.$common.isEmpty(val) || value.includes('.') || val < 1 || val > 99) return callback(new Error('请输入 1 至 99 之间的整数'));
      callback();
    },
    // 应检数量改变
    planNumberChange (num, rowIndex) {
      let newData = this.$common.copy(this.qualityData);
      const newVal = Number((this.$common.isEmpty(num) ? 0 : num).toFixed(0));
      const expectedNumber = newData[rowIndex].expectedNumber;
      if (newVal > expectedNumber) {
        this.qualityData[rowIndex] = expectedNumber;
        newData[rowIndex].planCheckNumber = expectedNumber;
      } else {
        this.qualityData[rowIndex] = newVal > 0 ? newVal : 0;
        newData[rowIndex].planCheckNumber = newVal > 0 ? newVal : 0;
      }
      newData = this.tableChangeHand(newData, null, null, true);
      this.$nextTick(() => {
        this.qualityData = this.qualityCalculate(newData);
      })
    },
    // 修改质检比例确认
    confirmEditRate () {
      if (!this.$refs.modalRefForm) return;
      this.$refs.modalRefForm.validate((valid) => {
        if (!valid) return;
        const rate = {
          0: 0,
          1: Number(this.modalForm.randomCheckRate),
          2: 100
        }
        const planRate = rate[this.modalForm.qualityTestNum];
        let newData = this.$common.copy(this.qualityData);
        if (this.$common.isEmpty(this.editIndex)) {
          newData = this.tableChangeHand(newData, planRate, this.modalForm.qualityTestNum);
        } else {
          const nowSpu = newData[this.editIndex].spu;
          newData.forEach((row, index) => {
            if (nowSpu == row.spu) {
              newData[index] = this.tableChangeHand(newData[index], planRate, this.modalForm.qualityTestNum);
            }
          })
        }
        this.qualityData = this.qualityCalculate(newData);
        this.$nextTick(() => {
          this.editModal = false;
          this.modalForm.qualityTestNum = 0;
          this.modalForm.randomCheckRate = '';
        })
      })
    },
    // 应检最少数处理
    batchQualitySetData () {
      let newData = this.$common.copy(this.qualityData);
      if (this.$common.isEmpty(this.qualityNumber.trim())) return;
      const qualityNumber = Number(this.qualityNumber);
      if (this.$common.isEmpty(qualityNumber) || this.qualityNumber.includes('.')) {
        return this.$Message.error('应检最少数量必须是大于 0 的整数');
      }
      newData = newData.map((row) => {
        if (qualityNumber > row.planCheckNumber) {
          if (qualityNumber > row.expectedNumber) {
            row.planCheckNumber = row.expectedNumber;
          } else {
            row.planCheckNumber = qualityNumber;
          }
        }
        return row;
      });
      newData = this.tableChangeHand(newData, null, null, true);
      this.qualityData = this.qualityCalculate(newData);
    },
    // 质检表格数据改变
    tableChangeHand (data, planRate, planCheckType, isSet = false) {
      let planNumber = {};
      let planCheckRate = planRate;
      const newData = this.$common.isArray(data) ? data : [data];
      let qualityData = newData.map(row => {
        if (this.$common.isEmpty(planCheckRate)) {
          planCheckRate = this.$common.isEmpty(Number(row.planCheckRate)) ? 0 : Number(row.planCheckRate);
        }
        planNumber = {
          0: 0,
          1: Number((planCheckRate * Number(row.expectedNumber) / 100).toFixed(0)),
          2: row.expectedNumber
        };
        return {
          ...row,
          planCheckType: isSet ? row.planCheckType : planCheckType,
          planCheckRate: planCheckRate.toFixed(0),
          detailRate: (((isSet ? row.planCheckNumber : planNumber[planCheckType]) / row.expectedNumber) * 100).toFixed(0),
          planCheckNumber: (isSet ? row.planCheckNumber : planNumber[planCheckType])
        }
      });
      return this.$common.isArray(data) ? qualityData : qualityData[0] || {};
    },
    // 合并表格
    handleSpan({ row, column, rowIndex, columnIndex }) {
      const mergeKey = ['goodsUrl', 'cnHsName', 'checkType', 'planCheckType', 'spuCheckRate'];
      if (mergeKey.includes(column.key)) {
        return { rowspan: row.rowspan, colspan: row.colspan };
      } else {
        return { rowspan: 1, colspan: 1 };
      }
    },
    // 手工创建入库单
    createASNBtn (name) {
      let v = this;
      if (this.productData.length === 0) {
        this.$Message.info({
          content: '在创建入库单之前，需要先添加货品',
          duration: 4
        });
        return;
      }
      // 质检信息匹配
      let infoObj = {};
      this.qualityData.forEach(row => {
        infoObj[row.goodsId] = row;
      })
      let obj = {
        abnormalStatus: '',
        lastReceivedTime: '', // 最后收货时间
        receiptStatus: '0', // 收货状态
        referenceNo: '', // 参考编号1
        referenceNo2: '', // 参考编号2
        referenceNo3: '', // 参考编号3
        // 商品列表
        receiptDetailList: (() => {
          return v.productData.map(row => {
            if (this.$common.isEmpty(infoObj[row.goodsId])) {
              return {
                ...row,
                planCheckNumber: '',
                detailRate: ''
              }
            }
            return {
              ...row,
              planCheckNumber: infoObj[row.goodsId].planCheckNumber,
              detailRate: infoObj[row.goodsId].detailRate,
            }
          })
        })(),
        warehouseId: v.getWarehouseId()
      };
      obj = Object.assign(obj, v.pageParams);
      obj.expectedStartTime = obj.expectedStartTime ? this.$uDate.getDateTime(obj.expectedStartTime) : null;
      obj.expectedEndTime = obj.expectedEndTime ? this.$uDate.getDateTime(obj.expectedEndTime) : null;
      v.$refs[name].validate(valid => {
        if (valid) {
          if (this.createReceiptValidFn()) {
            v.axios.post(api.createInWareOrder, JSON.stringify(obj)).then(res => {
              if (res.data.code === 0) {
                this.loading = true;
                v.$emit('createSuccess');
                v.$Message.success('创建入库单成功');
                setTimeout(() => {
                  v.$emit('backPage', 'list');
                  v.$emit('stockOrder', true);
                }, 600);
              } else if (res.data.code === -1) {
                v.$Message.info('预期收货数量不能为空');
              }
            });
          }
        } else {
          v.$Message.info({
            content: '创建失败，请检查你输入的值是否符合要求',
            duration: 4
          });
        }
      });
    }, // 取消创建入库单
    cancelCreateASNButton () {
      this.stepStatus = 1;
      this.$Message.info('取消创建入库单');
      this.$emit('backPage', 'list');
    }, // 删除表格行
    removeProduct (index) {
      var v = this;
      v.productData.splice(index, 1);
      v.$Message.success('成功删除选中的货品');
    },
    // 批量移除货品按钮
    deleteProductBtn (selectTableData) {
      if (this.selectTableData.length === 0) {
        this.$Message.info('请勾选你要删除的货品');
        return
      }
      const deleteIds = selectTableData.map(item => {
        return item.goodsSku
      })
      this.productData = this.productData.filter(item => {
        return !deleteIds.includes(item.goodsSku)
      })
      this.$Message.success('成功删除选中的货品');
      this.selectTableData = [];
    }, // 添加货品模态框
    showAddProductModal () {
      this.addProductModal = true;
    }, // 用户选择的表格数据
    userSelectOk (data) {
      for (let i = 0; i < data.length; i++) {
        data[i].source = 'P';
      }
      this.userSelectTable = data;
    },
    // 保存添加产品
    addNewProductBtn () {
      var v = this;
      v.userSelectTable.forEach((n, i) => {
        n.expectedNumber = '';
      });
      var obj = {};
      for (var i = 0; i < v.userSelectTable.length; i++) {
        obj[v.userSelectTable[i].goodsSku] = 1;
        for (var j = 0; j < v.productData.length; j++) {
          v.productData[j].source = 'P';
          if (obj[v.productData[j].goodsSku]) {
            v.$Message.info('添加货品失败，你已经添加了该货品，不能重复添加');
            v.addProductModal = true;
            return;
          }
        }
      }
      if (v.userSelectTable.length === 0) {
        v.addProductModal = true;
        v.$Message.info('请勾选你要添加的货品');
      } else {
        v.addProductModal = false;
        v.$Message.success('成功添加货品');
        v.userSelectTable.forEach(val => {
          val.goodsVolume = val.goodsLength * val.goodsWidth * val.goodsHeight;
        });
        v.productData = v.productData.concat(v.userSelectTable);
      }
    },
    // 打开编辑质检弹窗
    batchQualityCheckModal (index, row) {
      this.editIndex = this.$common.isEmpty(row) ? null : index;
      let qualityInfo = {};
      if (this.$common.isEmpty(row)) {
        this.modalForm.qualityTestNum = 0;
        this.modalForm.randomCheckRate = '';
      } else {
        const rate = Number(row.planCheckRate).toFixed(0);
        const planCheckType = Number(row.planCheckType);
        this.modalForm.qualityTestNum = this.$common.isEmpty(planCheckType) ? 0 : planCheckType;
        this.modalForm.randomCheckRate = (Number(rate) > 0 && Number(rate) < 100) ? rate : '';
        qualityInfo = this.$common.isEmpty(row.qualityInfo) ? {} : row.qualityInfo;
      }
      this.modalForm.waterWashLabel = qualityInfo.waterWashLabel || '';
      this.modalForm.qualityProjectVOList = qualityInfo.qualityProjectVOList || [];
      this.modalForm.qualityClassification = qualityInfo.qualityClassification || '';
      this.$nextTick(() => {
        this.editModal = true;
      })
    },
    // 模态框取消按钮
    cancelButton () {
      var v = this;
      v.$Message.info('取消添加货品');
      v.addProductModal = false;
    }
  }
};
</script>
<style>
.headerBar .ivu-modal-header p,
.headerBar .ivu-modal-header-inner {
  color: #fff;
}
</style>
<style lang="less" scoped>
.create-in-ware{
  :deep(.ivu-form-item){
    width: calc(33.33% - 10px);
    min-width: 300px;
  }
  .flex{
    display: flex;
    :deep(.ivu-form-item){
      width: auto;
      min-width: auto;
    }
  }
}

</style>
