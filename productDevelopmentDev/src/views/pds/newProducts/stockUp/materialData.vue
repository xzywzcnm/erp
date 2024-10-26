<template>
  <!-- 物料资料 -->
  <div class="material-contain">
    <Tabs :value="activeTab" @on-click="tabSwitch">
      <TabPane v-for="(item, index) in getCheckColor" :label="item.color" :name="item.colorId" :key="`TabPane-${index}`" />
    </Tabs>
    <div class="table-contain">
      <div class="table-head" v-if="isEdit">
        <Button type="primary" @click="pushMaterial">新增物料</Button>
      </div>
      <Form
        class="page-filter-content"
        label-position="right"
        ref="filterRefsDome"
        :model="tableDataObj"
        :rules="formRule"
        :label-width="80"
      >
        <Table
          v-for="(key, kIndex) in Object.keys(tableDataObj)"
          :key="`t-${kIndex}`"
          v-show="key === activeTab"
          :columns="tablecolumns"
          :data="(tableDataObj[key] || [])"
          :loading="tableLoading"
          border
          highlight-row
          class="form-table-contain"
        >
        <!-- 供应商 -->
          <template slot-scope="{ index, row }" slot="materialSupplierId">
            <FormItem label="" :label-width="0" :prop="`${key}[${index}].materialSupplierId`" :rules="tableValidate.materialSupplierId">
              <dytSelect
                v-model="tableDataObj[key][index].materialSupplierId"
                :disabled="!isEdit"
                @on-change="materialSupplierChange(tableDataObj[key][index])"
                @on-open-change="supplierSelectOpen($event, index)"
              >
                <Option
                  v-for="(item, sIndex) in (supplyJson[`${row.materialId}${row.productMaterialId || ''}`] || [])"
                  :key="`supp-${sIndex}`"
                  :value="item.supplierId"
                  :disabled="item.disabled"
                >{{ item.supplierName }}</Option>
              </dytSelect>
            </FormItem>
          </template>
          <!-- 物料颜色 -->
          <template slot-scope="{ index, row }" slot="materialColor">
            <FormItem label="" :label-width="0" :prop="`${key}[${index}].materialColor`" :rules="tableValidate.materialColor">
              <dytSelect
                v-model="tableDataObj[key][index].materialColor"
                :disabled="!isEdit"
                @on-change="materialColorChange(tableDataObj[key][index])"
                @on-open-change="colorSelectOpen($event, index)"
              >
                <Option
                  v-for="(item, cIndex) in (colorJson[`${row.materialId}-${row.materialSupplierId}${row.productMaterialId || ''}`] || [])"
                  :key="`c-${cIndex}`"
                  :value="item.colorId"
                  :disabled="item.disabled"
                >{{ item.color }}</Option>
              </dytSelect>
            </FormItem>
          </template>
          <!-- 色卡编码 -->
          <template slot-scope="{ index }" slot="colorCardCoding">
            <FormItem
              label=""
              :label-width="0"
            >
              {{ tableDataObj[key][index] ? tableDataObj[key][index].colorCardCoding : '' }}
            </FormItem>
          </template>
          <!-- 物料供应商编码 -->
          <template slot-scope="{ index }" slot="productCode">
            <FormItem
              label=""
              :label-width="0"
            >
              {{ tableDataObj[key][index] ? tableDataObj[key][index].productCode : '' }}
            </FormItem>
          </template>
          
          <!-- 单位净用量 -->
          <template slot-scope="{ index }" slot="unitNetUsage" v-if="isShowTotal.show">
            <FormItem
              label=""
              :prop="`${key}[${index}].unitNetUsage`"
              :label-width="0"
              :rules="tableValidate.unitNetUsage"
            >
              <Input
                v-model.trim="tableDataObj[key][index].unitNetUsage"
                placeholder="请输入单位净用量"
                clearable
                :disabled="!isShowTotal.edit"
              />
            </FormItem>
          </template>
          <!-- 损耗率 -->
          <template slot-scope="{ index }" slot="lossRate" v-if="isShowTotal.show">
            <FormItem
              label=""
              :prop="`${key}[${index}].lossRate`"
              :label-width="0"
              :rules="tableValidate.lossRate"
            >
              <Input
                v-model.trim="tableDataObj[key][index].lossRate"
                placeholder="请输入损耗率"
                clearable
                :disabled="!isShowTotal.edit"
              />
            </FormItem>
          </template>
        </Table>

        <div style="padding: 10px 10px 0 10px;text-align: right;" v-if="isShowTotal.show">
          合计：{{ $common.isEmpty(summation[activeTab]) ? '0.00' : summation[activeTab].toFixed(2) }}
        </div>
      </Form>
    </div>
    <materialModal :modelVisible.sync="pushVisible" :modelData="pushModelData" @confirm="pushFhConfirm" />
    <Spin v-if="pageLoading" fix></Spin>
  </div>
</template> 

<script>
import api from "@/api/api";
import materialModal from './materialModal';
import { materialTypeData, meteringUnit } from '@/utils/pdsSettingConstant';

export default {
  name: "materialData",
  components: {
    materialModal
  },
  props: {
    openType: {type: String, default: 'info'},
    btnoperat: {type: String, default: ''},
    productData: { type: Object, default () { return {} } },
    modelVisible: { type: Boolean, default: false },
  },
  data () {
    return {
      pageLoading: false,
      pushVisible: false,
      pushModelData: {},
      tabs: {},
      productDetail: {},
      colorObj: {},
      activeTab: '',
      tableDataObj: {},
      supplyList: [],
      // 价格对象
      priceJson: {},
      // 物料颜色对应的信息对象
      materialInfoJson: {},
      materialTypeData: materialTypeData,
      meteringUnit: meteringUnit,
      // 记录当前物料最多可以增加多少条
      meteringColorTotal: {},
      tableLoading: false,
      // 物料相关的信息
      materialCorrelation: {},
      // 供应商匹配物料和供应商ID
      supplyJson: {},
      // 颜色匹配物料和供应商ID
      colorJson: {},
      // 表单验证规则
      formRule: {},
      // 表格验证规则
      tableValidate: {
        materialSupplierId: [
          { required: true, message: '请选择供应商', trigger: 'change', type: 'string' }
        ],
        materialColor: [
          { required: true, validator: this.validatorColor, msg: '请选择颜色', trigger: 'change' }
        ],
        unitNetUsage: [
          { required: true, validator: this.validatorMaxNumber, point: 2, msg: '请输入不小于0的整数或两位小数', trigger: 'change' },
          { required: true, validator: this.validatorMaxNumber, point: 2, msg: '请输入不小于0的整数或两位小数', trigger: 'blur' },
        ],
        lossRate: [
          { validator: this.validatorMaxNumber, point: 2, msg: '请输入不小于0的整数或两位小数', trigger: 'change' },
          { validator: this.validatorMaxNumber, point: 2, msg: '请输入不小于0的整数或两位小数', trigger: 'blur' },
        ]
      },
      columns: [
        {
          title: '物料编码',
          key: 'materialCode',
          align: 'center',
          minWidth: 100
        },
        {
          title: '物料名称',
          key: 'materialName',
          align: 'center',
          minWidth: 100
        },
        {
          title: '图片',
          key: 'materialImage',
          align: 'center',
          width: 120,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.materialImage)) return h('span', '');
            let imgUrl = row.materialImage;
            return h('Poptip', {
              props: {
                placement: 'right',
                trigger: 'hover',
                transfer: true
              },
              style: {
                width: '46px',
                height: '46px',
                objectFit: 'cover',
                verticalAlign: 'middle',
                margin: '2px'
              }
            }, [
              h('div', {}, [
                h('img', {
                  attrs: {
                    src: `./filenode/s${imgUrl}`,
                    onerror: 'javascript:this.src=\'./static/images/placeholder.jpg\''
                  },
                  style: {
                    width: '46px',
                    height: '46px',
                    objectFit: 'cover',
                    verticalAlign: 'middle',
                    cursor: 'pointer'
                  }
                }),
                h('span')
              ]), !imgUrl || h('img', {
                slot: 'content',
                props: {},
                attrs: {
                  src: `./filenode/s${imgUrl}`,
                },
                style: {
                  width: '400px',
                  height: 'auto',
                  verticalAlign: 'middle'
                }
              })
            ]);
          }
        },
        {
          title: '物料单价',
          key: 'materialUnitPrice',
          align: 'center',
          minWidth: 100
        },
        {
          title: '物料类型',
          key: 'materialType',
          align: 'center',
          width: 100,
          render: (h, { row }) => {
            if (this.$common.isEmpty(this.materialTypeData[row.materialType])) return h('span','');
            return h('span', `${this.materialTypeData[row.materialType].label}`);
          }
        },
        {
          title: '供应商',
          slot: 'materialSupplierId',
          align: 'center',
          minWidth: 200,
          renderHeader: (h, params) => {
            return h('div', {
              class: 'table-col-required'
            }, '供应商');
          }
        },
        {
          title: '物料单位',
          key: 'unitMeasurement',
          width: 100,
          align: 'center',
          render: (h, { row }) => {
            if (this.$common.isEmpty(this.meteringUnit[row.unitMeasurement])) return h('span','');
            return h('span', `${this.meteringUnit[row.unitMeasurement].label}`);
          }
        },
        {
          title: '物料颜色',
          slot: 'materialColor',
          align: 'center',
          minWidth: 150,
          renderHeader: (h, params) => {
            return h('div', {
              class: 'table-col-required'
            }, '物料颜色');
          }
        },
        {
          title: '色卡编码',
          slot: 'colorCardCoding',
          align: 'center',
          minWidth: 100
        },
        {
          title: '供应商物料编码',
          slot: 'productCode',
          align: 'center',
          minWidth: 130
        },
        {
          title: '幅宽(cm)',
          key: 'breadth',
          align: 'center',
          minWidth: 100
        }
      ],
    }
  },
  watch: {
    modelVisible: {
      immediate: true,
      handler (val) {
        this.$nextTick(() => {
          setTimeout(() => {
            val && this.pageInit();
          }, 300);
        })
      }
    }
  },
  computed: {
    // 登录人事业部信息
    securityUser () {
      if (this.$store.getters["authUserInfo"] && this.$store.getters["authUserInfo"].securityUser) {
        return this.$store.getters["authUserInfo"].securityUser;
      }
      return {}
    },
    // 表格列
    tablecolumns () {
      const operationCol = [{
        title: '操作',
        align: 'center',
        width: 90,
        render: (h, { row, index }) => {
          return h('div', {
            style: {
              cursor: 'pointer',
              color: '#2d8cf0'
            },
            on: {
              click: () => {
                this.removeTableRow(row, index);
              }
            }
          }, '移除');
        }
      }];
      const pushCol = [
        {
          title: '单位净用量',
          slot: 'unitNetUsage',
          align: 'center',
          minWidth: 100,
          renderHeader: (h, params) => {
            return h('div', {
              class: 'table-col-required'
            }, '单位净用量');
          }
        },
        {
          title: '损耗率(%)',
          slot: 'lossRate',
          align: 'center',
          minWidth: 120
        },
        {
          title: '金额(元)',
          key: 'amount',
          align: 'center',
          minWidth: 100,
          render: (h, { row }) => {
            // 金额（元）：展示，计算公式=物料单价*单位净用量*（1+损耗率%）
            return h('span', {}, this.getRowAmount(row));
          }
        }
      ];
      if (this.isShowTotal.show) {
        if (this.isShowTotal.edit) return [...operationCol, ...this.columns, ...pushCol];
        return [...this.columns, ...pushCol];
      }
      if (this.isEdit) return [...operationCol, ...this.columns];
      return this.columns;
    },
    // 商品ID
    productId () {
      if (this.$common.isEmpty(this.productData) || this.$common.isEmpty(this.productData.productId)) return '';
      return this.productData.productId;
    },
    // 是否可编辑
    isEdit () {
      return ['edit'].includes(this.openType) && ['materialConfirm'].includes(this.btnoperat);
    },
    // 是否展示 单位净用量、损耗率、金额、金额合计
    isShowTotal () {
      const status = ![0,17,13,14].includes(this.productData.status);
      return {
        show: status && !['subverify', 'edit', 'materialConfirm', 'sampleConfirm', 'sDressConfirm'].includes(this.btnoperat),
        edit: ['pEvaluationConfirm'].includes(this.btnoperat)
      };
    },
    // 颜色ID
    getCheckColor () {
      if (this.$common.isEmpty(this.productDetail) || this.$common.isEmpty(this.productDetail.laPaPictureColorRelList)) return [];
      let colorList = [];
      this.productDetail.laPaPictureColorRelList.forEach(m => {
        if (this.$common.isEmpty(this.colorObj[m.colorId])) return;
        if (this.$common.isEmpty(this.activeTab)) {
          this.activeTab = this.colorObj[m.colorId].colorId;
        }
        // tab 表格为空时赋值
        if (this.$common.isEmpty(this.tableDataObj) || this.$common.isUndefined(this.tableDataObj[this.colorObj[m.colorId].colorId])) {
          this.$set(this.tableDataObj, this.colorObj[m.colorId].colorId, []);
        }
        colorList.push(this.colorObj[m.colorId]);
      });
      return colorList;
    },
    // 合计
    summation () {
      if (!this.isShowTotal.show) return {};
      let tableTotal = {};
      Object.keys(this.tableDataObj).forEach(key => {
        this.tableDataObj[key].forEach(row => {
          if (this.$common.isEmpty(tableTotal[key])) {
            tableTotal[key] = 0;
          }
          tableTotal[key] += Number(this.getRowAmount(row));
        })
      })
      return tableTotal;
    }
  },
  created () {},
  methods: {
    pageInit () {
      this.tableDataObj = {};
      this.priceJson = {};
      this.materialInfoJson = {};
      this.supplyJson = {};
      this.colorJson = {};
      this.meteringColorTotal = {};
      this.isRemoveSupply = {};
      this.materialCorrelation = {};
      this.activeTab = '';
      this.pageLoading = true;
      let awaitRes = [this.getBaseDetail, this.getColorList, this.getSupplierList];
      this.$common.promiseAll(awaitRes).then(resArr => {
        // console.log(resArr);
        this.getMaterialInfo().finally(() => {
          this.pageLoading = false;
        })
      }).catch(() => {
        this.pageLoading = false;
      })
    },
    // 获取基础资料
    getBaseDetail () {
      return new Promise((resolve) => {
        if (this.$common.isEmpty(this.productId)) return resolve({});
        this.$axios.get(api.queryLaPaProductInfo, { params: { productId: this.productId } }).then(({ code, datas }) => {
          if (code != 0 || this.$common.isEmpty(datas)) return resolve({});
          this.productDetail = datas;
          resolve(datas);
        }).catch((err) => {
          console.error(err);
          resolve({});
        });
      })
    },
    // 获取颜色列表
    getColorList () {
      return new Promise((resolve) => {
        this.$axios.get(api.queryProductColorList).then(({ code, datas }) => {
          if (code !== 0) return resolve({});
          (datas || []).forEach(item => {
            if (!this.$common.isEmpty(item.colorId)) {
              item.colorId = item.colorId.toString();
            }
            this.$set(this.colorObj, item.colorId, item);
          })
          resolve(this.colorObj);
        }).catch(() => {
          resolve({});
        })
      })
    },
    // 计算行金额
    getRowAmount (row) {
      // 金额（元）：展示，计算公式=物料单价*单位净用量*（1+损耗率%）
      if (this.$common.isEmpty(row)) return '0.00';
      const materialUnitPrice = Number(row.materialUnitPrice);
      const unitNetUsage = Number(row.unitNetUsage);
      const lossRate = Number(row.lossRate);
      if (this.$common.isEmpty(materialUnitPrice) || this.$common.isEmpty(unitNetUsage)) return '0.00';
      const amount = materialUnitPrice * unitNetUsage * (1 + (this.$common.isEmpty(lossRate) ? 0 : (lossRate / 100)));
      return amount.toFixed(2);
    },
    // tab 切换
    tabSwitch (tab) {
      this.tableLoading = true;
      this.activeTab = tab;
      setTimeout(() => {
        this.tableLoading = false;
      }, 500);
    },
    // 获取供应商列表
    getSupplierList() {
      return new Promise((resolve) => {
        this.$axios.get(api.queryAllSupplierInfo).then((res) => {
          this.supplyList = res.code === 0 ? res.datas || [] : [];
          resolve(this.supplyList);
        }).catch((err) => {
          console.error(err);
          resolve([]);
        })
      })
    },
    // 获取物料信息
    getMaterialInfo () {
      return new Promise((resolve) => {
        this.$axios.get(api.queryMaterialInfo, { params: { productId: this.productId } }).then(({ code, datas }) => {
          if (code !== 0) return resolve([]);
          let otherInfo = [];
          (datas || []).forEach(item => {
            if (!this.$common.isEmpty(item.laPaProductMaterialInfoList) && !this.$common.isEmpty(item.colorId)) {
              item.laPaProductMaterialInfoList.forEach(m => {
                otherInfo.push(() => {
                  return this.getMaterialColorPiceSupplier(m.materialId, m);
                });
              })
              // 给物料表格赋值
              this.$set(this.tableDataObj, item.colorId, item.laPaProductMaterialInfoList);
            }
          });
          this.$common.promiseAll(otherInfo).finally(() => {
            let copyData = [];
            let findInfo = {};
            let findItemInfo = {};
            let itemKey = '';
            Object.keys(this.tableDataObj).forEach((key) => {
              copyData = this.$common.copy(this.tableDataObj[key] || []);
              copyData.forEach((row) => {
                if (!this.$common.isEmpty(this.materialCorrelation[row.materialId])) {
                  itemKey = `${row.materialId}-${row.materialSupplierId}-${row.materialColor}`;
                  findInfo = this.priceJson[itemKey];
                  findItemInfo = this.materialInfoJson[itemKey];
                  row.materialUnitPrice = this.$common.isEmpty(findInfo) ? null : findInfo.price;
                  if ([17].includes(this.productData.status) || ['materialConfirm'].includes(this.btnoperat)) {
                    if (this.$common.isEmpty(findItemInfo)) {
                      row.colorCardCoding = null;
                      row.productCode = null;
                      row.breadth = null;
                    } else {
                      row.colorCardCoding = findItemInfo.colorCardCoding;
                      row.productCode = findItemInfo.productCode;
                      row.breadth = findItemInfo.breadth;
                    }
                  }
                }
                if (row.wastageRate == 0) {
                  row.wastageRate = null;
                }
              })
              this.tableDataObj[key] = copyData;
            })
            resolve(datas|| []);
          })
        }).catch(() => {
          resolve([]);
        })
      })
    },
    // 根据物料 ID 获取对应供应商、颜色、单价
    getMaterialColorPiceSupplier (materialId, row) {
      return new Promise((resolve) => {
        if (this.$common.isEmpty(materialId)) return resolve([]);
        if (!this.$common.isEmpty(this.materialCorrelation[materialId])) {
          this.handMaterialInfo(this.materialCorrelation[materialId], row);
          return resolve(this.materialCorrelation[materialId]);
        }
        this.$set(this.materialCorrelation, materialId, []);
        this.$axios.get(api.queryProductMaterialSupplierInfo, { params: { materialId: materialId } }).then(({ code, datas }) => {
          if (code != 0 || this.$common.isEmpty(datas)) return resolve([]);
          this.handMaterialInfo(datas, row);
          this.$set(this.materialCorrelation, materialId, datas);
          resolve(datas);
        }).catch((err) => {
          console.error(err);
          resolve([]);
        })
      })
    },
    // 处理物流数据
    handMaterialInfo (datas, row) {
      let colorIdList = {};
      let supplyObj = {};
      const materialId = row.materialId;
      const supplierId = row.materialSupplierId;
      const pushKey = row.productMaterialId || '';
      if (!this.$common.isEmpty(supplierId)) {
        const isSetSupplier = datas.find(fin => {
          return fin.supplierId == supplierId
        })
        if (this.$common.isEmpty(isSetSupplier)) {
          datas.push({
            colorId: row.materialColor,
            price: row.materialUnitPrice,
            supplierId: supplierId,
          });
        }
      }
      let priceObj = {};
      let materialJson = {};
      if (!this.$common.isEmpty(row)) {
        if (!this.$common.isEmpty(materialId) && !this.$common.isEmpty(supplierId) && !this.$common.isEmpty(row.materialColor)) {
          this.$set(priceObj, `${materialId}-${supplierId}-${row.materialColor}`, { price: row.materialUnitPrice });
          this.$set(materialJson, `${materialId}-${supplierId}-${row.materialColor}`, row);
        }
      }

      let priceKey = '';
      let colorItemObj = {};
      datas.forEach((item) => {
        if (!this.$common.isEmpty(row.materialColor)) {
          priceKey = `${materialId}-${item.supplierId}-${row.materialColor}`;
          this.$set(this.priceJson, priceKey, (this.isShowTotal.show ? {...item, ...(priceObj[priceKey] || {})} : item));
        }
        if (!this.$common.isEmpty(item.colorName)) {
          (item.colorName || '').split(',').forEach(cItem => {
            if (!this.$common.isEmpty(cItem)) {
              colorItemObj = cItem.includes('{') && cItem.includes('}') ? JSON.parse(cItem) : {[cItem]: ''};
              Object.keys(colorItemObj).forEach(oItem => {
                priceKey = `${materialId}-${item.supplierId}-${oItem}`;
                this.$set(this.priceJson, priceKey, (this.isShowTotal.show ? {...item, ...(priceObj[priceKey] || {})} : item));
                this.$set(this.materialInfoJson, priceKey, {
                  ...(materialJson[priceKey] || {}),
                  ...item,
                  colorCardCoding: colorItemObj[oItem]
                });
                if (this.$common.isEmpty(colorIdList[`${materialId}-${item.supplierId}`])) {
                  colorIdList[`${materialId}-${item.supplierId}`] = [{
                    colorId: oItem,
                    color: oItem,
                    disabled: false
                  }];
                } else {
                  colorIdList[`${materialId}-${item.supplierId}`].push({
                    colorId: oItem,
                    color: oItem,
                    disabled: false
                  });
                }
                if (this.$common.isEmpty(this.meteringColorTotal[materialId])) {
                  this.$set(this.meteringColorTotal, materialId, [oItem]);
                } else if (!this.meteringColorTotal[materialId].includes(oItem)) {
                  this.meteringColorTotal[materialId].push(oItem);
                }
              })
            }
          })
        } else if (!this.$common.isEmpty(row.materialColor)) {
          this.$set(this.materialInfoJson, priceKey, {
            ...(materialJson[priceKey] || {}),
            ...item,
            colorCardCoding: ''
          });
        }
        supplyObj[item.supplierId] = this.supplyList.find(fin => {
          return fin.supplierId == item.supplierId;
        })
      });
      Object.keys(colorIdList).forEach(key => {
        this.$set(this.colorJson, `${key}${pushKey}`, colorIdList[key]);
      });
      this.$set(this.supplyJson, `${materialId}${pushKey}`, Object.values(supplyObj).filter(item => {
        return !this.$common.isEmpty(item)
      }));
    },
    // 物料供应商改变
    materialSupplierChange (row) {
      if (this.tableLoading) return;
      row.materialColor = null;
      row.materialUnitPrice = '';
      row.colorCardCoding = null;
      row.productCode = null;
      row.breadth = null;
    },
    // 物料颜色改变
    materialColorChange (row) {
      if (this.tableLoading || this.$common.isEmpty(row.materialSupplierId)) return;
      const itemKey = `${row.materialId}-${row.materialSupplierId}-${row.materialColor}`;
      const findInfo = this.priceJson[itemKey];
      const findItemInfo = this.materialInfoJson[itemKey];
      row.materialUnitPrice = this.$common.isEmpty(findInfo) ? null : findInfo.price;
      if (this.$common.isEmpty(findItemInfo)) {
        row.colorCardCoding = null;
        row.productCode = null;
        row.breadth = null;
      } else {
        row.colorCardCoding = findItemInfo.colorCardCoding;
        row.productCode = findItemInfo.productCode;
        row.breadth = findItemInfo.breadth;
      }
      this.$nextTick(() => {
        let disabledSupplyIds = [];
        this.tableDataObj[this.activeTab] = this.tableDataObj[this.activeTab].map((item, index) => {
          disabledSupplyIds = this.supplierSelectOpen(true, index, true).filter(f => f.disabled).map(m => m.supplierId);
          if (disabledSupplyIds.includes(item.materialSupplierId) && this.$common.isEmpty(item.materialColor)) {
            return {...item, materialSupplierId: ''}
          }
          return item;
        })
      })
    },
    // 新增物料弹窗
    pushMaterial () {
      this.pushModelData = {
        fhTableData: [],
        tableData: this.$common.copy(this.tableDataObj[this.activeTab])
      };
      this.$nextTick(() => {
        this.pushVisible = true;
      })
    },
    // 确认料数据
    pushFhConfirm (res) {
      this.tableLoading = true;
      let meteringTotal = {};
      let pushRow = [];
      let unnecessary = {};
      if (res.type) {
        const awaitFun = Object.keys(this.tableDataObj).map(key => {
          return () => {
            return new Promise((resolve) => {
              this.tableDataObj[key].forEach(row => {
                if (!this.$common.isEmpty(this.meteringColorTotal[row.materialId])) {
                  if (this.$common.isEmpty(meteringTotal[`${key}-${row.materialId}`])) {
                    meteringTotal[`${key}-${row.materialId}`] = this.meteringColorTotal[row.materialId].length - 1;
                  } else {
                    meteringTotal[`${key}-${row.materialId}`] -= 1;
                  }
                }
              });
              // 将多出的数据过滤掉（同一个物料有多少个颜色最多可以添加多少个）
              this.handPush(res.data || []).then(filterData => {
                pushRow = [];
                filterData.forEach(nRow => {
                  if (this.$common.isEmpty(meteringTotal[`${key}-${nRow.materialId}`])) {
                    pushRow.push(nRow);
                  } else if (meteringTotal[`${key}-${nRow.materialId}`] > 0) {
                    pushRow.push(nRow);
                    meteringTotal[`${key}-${nRow.materialId}`] -= 1;
                  } else {
                    if (this.$common.isEmpty(unnecessary[key])) {
                      unnecessary[key] = [nRow.materialName];
                    } else if (!unnecessary[key].includes(nRow.materialName)) {
                      unnecessary[key].push(nRow.materialName);
                    }
                  }
                });
                this.tableDataObj[key] = [...this.tableDataObj[key], ...pushRow];
                const pushIndex = this.tableDataObj[key].length - 1;
                const disabledSupplyIds = this.supplierSelectOpen(true, pushIndex, true, key).filter(f => {
                  return f.disabled;
                }).map(m => {
                  return m.supplierId;
                });
                const tableSupplier = this.tableDataObj[key][pushIndex].materialSupplierId;
                if (disabledSupplyIds.includes(tableSupplier)) {
                  this.tableDataObj[key][pushIndex].materialSupplierId = '';
                }
              }).finally(() => {
                resolve();
              })
            })
          }
        })
        this.$common.promiseAll(awaitFun).finally(() => {
          this.tableLoading = false;
          if (this.$common.isEmpty(unnecessary)) return;
          const tipsTxt = Object.keys(unnecessary).map(key => {
            return `<div>${this.colorObj[key].color}：物料${unnecessary[key].join('、')} 添加已达上限</div>`
          }).join('');
          this.$Modal.confirm({
            title: "温馨提示",
            content: `${tipsTxt}`,
            onOk: () => {},
            onCancel: () => {},
          });
        })
        return;
      }

      this.tableDataObj[this.activeTab].forEach(row => {
        if (!this.$common.isEmpty(this.meteringColorTotal[row.materialId])) {
          if (this.$common.isEmpty(meteringTotal[row.materialId])) {
            meteringTotal[row.materialId] = this.meteringColorTotal[row.materialId].length - 1;
          } else {
            meteringTotal[row.materialId] -= 1;
          }
        }
      });
      // 将多出的数据过滤掉（同一个物料有多少个颜色最多可以添加多少个）
      this.handPush(res.data || []).then(filterData => {
        pushRow = [];
        filterData.forEach(nRow => {
          if (this.$common.isEmpty(meteringTotal[nRow.materialId])) {
            pushRow.push(nRow);
          } else if (meteringTotal[nRow.materialId] > 0) {
            pushRow.push(nRow);
            meteringTotal[nRow.materialId] -= 1;
          } else {
            if (this.$common.isEmpty(unnecessary[this.activeTab])) {
              unnecessary[this.activeTab] = [nRow.materialName];
            } else {
              unnecessary[this.activeTab].push(nRow.materialName);
            }
          }
        });
        this.tableDataObj[this.activeTab] = [...this.tableDataObj[this.activeTab], ...pushRow];
        const pushIndex = this.tableDataObj[this.activeTab].length - 1;
        const disabledSupplyIds = this.supplierSelectOpen(true, pushIndex, true).filter(f => {
          return f.disabled;
        }).map(m => {
          return m.supplierId;
        });
        const tableSupplier = this.tableDataObj[this.activeTab][pushIndex].materialSupplierId;
        if (disabledSupplyIds.includes(tableSupplier)) {
          this.tableDataObj[this.activeTab][pushIndex].materialSupplierId = '';
        }
      }).finally(() => {
        this.tableLoading = false;
        if (this.$common.isEmpty(unnecessary)) return;
        const tipsTxt = Object.keys(unnecessary).map(key => {
          return `<div>${this.colorObj[key].color}：物料${unnecessary[key].join('、')} 添加已达上限</div>`
        }).join('');
        this.$Modal.confirm({
          title: "温馨提示1",
          content: `${tipsTxt}`,
          onOk: () => {},
          onCancel: () => {},
        });
      })
    },
    // 供应商下拉展开时处理
    supplierSelectOpen (isOpen, rowIndex, type, key) {
      if (!isOpen) return;
      const tabKey = key || this.activeTab;
      const row = this.tableDataObj[tabKey][rowIndex];
      const rowKey = `${row.materialId}${row.productMaterialId || ''}`;
      const supplyOption = this.supplyJson[rowKey] || [];
      if (this.$common.isEmpty(supplyOption)) return;
      let colorKey = '';
      let colorOption = [];
      let notDisabled = {};
      const newSupplyList = supplyOption.map(item => {
        this.colorSelectOpen(true, rowIndex, tabKey, item.supplierId);
        colorKey = `${row.materialId}-${item.supplierId}${row.productMaterialId || ''}`;
        colorOption = this.colorJson[colorKey] || [];
        notDisabled = colorOption.find(fin => !fin.disabled);
        return {
          ...item,
          disabled: this.$common.isEmpty(notDisabled)
        }
      });
      if (type) return newSupplyList;
      this.supplyJson[rowKey] = newSupplyList;
    },
    // 颜色下拉展开时的处理
    colorSelectOpen (isOpen, rowIndex, key, supplierId) {
      if (!isOpen) return;
      const tabKey = key || this.activeTab;
      const row = this.tableDataObj[tabKey][rowIndex];
      const newSupplierId = supplierId || row.materialSupplierId;
      const rowKey = `${row.materialId}-${newSupplierId}${row.productMaterialId || ''}`;
      const rowColorOption = this.colorJson[rowKey] || [];
      if (this.$common.isEmpty(rowColorOption)) return;
      let selectColor = [];
      this.tableDataObj[tabKey].forEach((item, index) => {
        if (index != rowIndex && row.materialId == item.materialId && newSupplierId == item.materialSupplierId) {
          selectColor.push(item.materialColor);
        }
      });
      this.colorJson[rowKey] = rowColorOption.map(item => {
        return {
          ...item,
          disabled: selectColor.includes(item.colorId)
        }
      });
    },
    // 根据ID返回对于供应商信息
    getSupplierObj (supplierId, isGetName = false) {
      const findSupply = this.supplyList.find(item => {
        return item.supplierId == supplierId;
      })
      if (!isGetName) return findSupply;
      if (this.$common.isEmpty(findSupply)) return '';
      return findSupply.supplierName;
    },
    // 处理数据
    handPush (data) {
      return new Promise((resolve) => {
        let newRow = {};
        let getMaterialOther = [];
        const filterData = (data || []).map(row => {
          getMaterialOther.push(() => {
            return this.getMaterialColorPiceSupplier(row.materialId, row);
          });
          newRow = {
            ...row,
            materialSupplier: this.getSupplierObj(row.supplierId, true),
            materialSupplierId: row.supplierId,
            materialImage: row.path,
            materialUnitPrice: null,
            materialColor: null,
            colorCardCoding: null,
            productCode: null,
            unitNetUsage: null,
            lossRate: null,
            breadth: null,
            amount: null
          }
          delete newRow.supplierId;
          delete newRow.path;
          delete newRow.price;
          return newRow;
        });
        let findInfo = {};
        let itemKey = '';
        let findItemInfo = {};
        this.$common.promiseAll(getMaterialOther).finally(() => {
          filterData.forEach((row) => {
            itemKey = `${row.materialId}-${row.materialSupplierId}-${row.materialColor}`;
            findInfo = this.priceJson[itemKey];
            findItemInfo = this.materialInfoJson[itemKey];
            row.materialUnitPrice = this.$common.isEmpty(findInfo) ? null : findInfo.price;
            if (this.$common.isEmpty(findItemInfo)) {
              row.colorCardCoding = null;
              row.productCode = null;
              row.breadth = null;
            } else {
              row.colorCardCoding = findItemInfo.colorCardCoding;
              row.productCode = findItemInfo.productCode;
              row.breadth = findItemInfo.breadth;
            }
          })
          resolve(filterData);
        }).catch(() => {
          resolve(filterData);
        })
      })
    },
    // 返回表单值 type 为 1 时验证， 其他值不验证
    getFormData (type) {
      return new Promise((resolve) => {
        let requiredColor = [];
        let amount = null;
        const backRes = Object.keys(this.tableDataObj).map(key => {
          const color = !this.$common.isEmpty(this.colorObj[key]) ? this.colorObj[key].color : '';
          if (type == 1) {
            if (this.$common.isEmpty(this.tableDataObj[key])) {
              requiredColor.push(color);
            }
          }
          return{
            productId: this.productId,
            color: color,
            colorId: key,
            laPaProductMaterialInfoList: (this.tableDataObj[key] || []).map(row => {
              if (this.isShowTotal.show) {
                amount = Number(this.getRowAmount(row))
              }
              return {
                ...row,
                lossRate: this.$common.isEmpty(row.lossRate) ? null : row.lossRate,
                amount: amount,
                materialSupplier: this.getSupplierObj(row.materialSupplierId, true)
              }
            }),
          };
        });

        if (type == 1 && this.$refs.filterRefsDome) {
          this.$refs.filterRefsDome.validate((valid) => {
            if (!valid) {
              this.$Message.error('“物料资料”表单验证不通过，请检查');
              return resolve({ success: false, message: '“物料资料”表单验证不通过，请检查' });
            }
            if (!this.$common.isEmpty(requiredColor)) {
              this.$Message.error(`请为颜色：${requiredColor.join('，')} 添加物料`);
              return resolve({ success: false, message: `请为颜色：${requiredColor.join('，')} 添加物料` });
            }
            resolve({ success: true, data: backRes });
          })
          return;
        }
        resolve({ success: true, data: backRes });
      })
    },
    // 保存当前值 type 为 1 时验证， 其他值不验证
    saveFormData (type) {
      return new Promise((resolve) => {
        this.getFormData(type).then(res => {
          if (!res.success) return resolve({ success: false, message: '“物料资料”表单验证不通过' });
          this.pageLoading = true;
          this.$axios.post(api.saveMaterialInfo, res.data).then(({ code, datas }) => {
            if (code != 0) return resolve({ success: false, message: '“物料资料”请求失败' });
            type != 1 && this.$Message.success('操作成功!');
            resolve({ success: true, data: datas, isColose: type != 1  });
          }).catch(err => {
            resolve({ success: false, data: err  });
          }).finally(() => {
            this.pageLoading = false;
          })
        })
      })
    },
    // 移除表格行
    removeTableRow (row, index) {
      if (this.$common.isEmpty(row)) return;
      this.$Modal.confirm({
        title: '操作',
        content: `<p>确认移除物料：${row.materialName}？</p>`,
        loading: true,
        onOk: () => {
          this.tableLoading = true;
          this.tableDataObj[this.activeTab].splice(index, 1);
          this.$nextTick(() => {
            setTimeout(() => {
              this.tableLoading = false;
            }, 100)
            this.$Modal.remove();
          })
        }
      });
    },
    // 字符长度验证
    strMaxVerify (rule, value, callback) {
      const maxLength = Number(rule.maxLength);
      if (rule.required && this.$common.isEmpty(value)) {
        return callback(new Error(rule.msg || '必填项不能为空'));
      }
      if (!this.$common.isEmpty(maxLength) && !this.$common.isEmpty(value) && value.length > maxLength) {
        return callback(new Error(`最多可输入 ${maxLength} 字符长度`));
      }
      callback();
    },
    // 验证颜色
    validatorColor (rule, value, callback) {
      if (!this.isEdit) return callback();
      if (rule.required && this.$common.isEmpty(value)) {
        return callback(new Error(rule.msg || '必填项不能为空'));
      }
      const allColor = this.$common.flat(Object.values(this.colorJson)).map(item => item.colorId);
      if (!allColor.includes(value)) {
        return callback(new Error(rule.msg || '必填项不能为空'));
      }
      callback();
    },
    // 验证大于0的小数
    validatorMaxNumber (rule, value, callback) {
      this.$nextTick(() => {
        if (rule.required && this.$common.isEmpty(value)) {
          return callback(new Error(rule.msg || '必填项不能为空'));
        }
        const point = rule.point;
        if (!this.$common.isEmpty(value) && !this.$common.isEmpty(point)) {
          const newVal = Number(value);
          const decimals = (value.toString()).split('.');
          if (decimals.length > 1 && this.$common.isEmpty(decimals[0])) {
            return callback(new Error('请输入数字'));
          }
          if (this.$common.isEmpty(newVal) || newVal <= 0 || (!this.$common.isEmpty(decimals[1]) && decimals[1].length > point)) {
            if (point == 0) {
              return callback(new Error(`请输入不小于0的整数`));
            }
            return callback(new Error(`请输入不小于0且最多${point}位小数的数字`));
          }
        }
        callback();
      })
    }
  }
};
</script>

<style lang="less" scoped>
.material-contain{
  position:relative;
  :deep(.ivu-tabs-bar) {
    margin-bottom: 0;
  }
  .table-contain{
    .table-head{
      padding: 15px 0;
      text-align: right;
    }
  }
  .form-table-contain{
    :deep(.ivu-table-header) {
      .table-col-required{
        &:before{
          content: '*';
          display: inline-block;
          margin-right: 4px;
          line-height: 1;
          font-size: 14px;
          color: #ed4014;
        }
      }
    }
    :deep(.ivu-table-tbody){
      .ivu-form-item{
        margin-bottom: 0;
      }
      .ivu-select{
        text-align: left;
      }
    }
  }
}
</style>