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
          <template slot-scope="{ index, row }" slot="supplierId">
            <FormItem label="" :label-width="0" :prop="`${key}[${index}].supplierId`" :rules="tableValidate.supplierId">
              <dytSelect
                v-model="tableDataObj[key][index].supplierId"
                :disabled="!isEdit"
                @on-change="materialSupplierChange(tableDataObj[key][index])"
                @on-open-change="supplierSelectOpen($event, index)"
              >
                <Option
                  v-for="(item, sIndex) in (supplyJson[`${row.materialId}${row.productMaterialDetailId || ''}`] || [])"
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
                  v-for="(item, cIndex) in (colorJson[`${row.materialId}-${row.supplierId}${row.productMaterialDetailId || ''}`] || [])"
                  :key="`c-${cIndex}`"
                  :value="item.colorId"
                  :disabled="item.disabled"
                >{{ item.color }}</Option>
              </dytSelect>
            </FormItem>
          </template>
          <!-- 色卡编码 -->
          <template slot-scope="{ index }" slot="colorChartCode">
            <FormItem
              label=""
              :label-width="0"
            >
              {{ tableDataObj[key][index] ? tableDataObj[key][index].colorChartCode : '' }}
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
          <template slot-scope="{ index }" slot="netUnitUsage">
            <FormItem
              label=""
              :prop="`${key}[${index}].netUnitUsage`"
              :label-width="0"
              :rules="tableValidate.netUnitUsage"
            >
              <Input
                v-model.trim="tableDataObj[key][index].netUnitUsage"
                placeholder="请输入单位净用量"
                clearable
                :disabled="disabled"
              />
            </FormItem>
          </template>
          <!-- 损耗率 -->
          <template slot-scope="{ index }" slot="wastageRate">
            <FormItem
              label=""
              :prop="`${key}[${index}].wastageRate`"
              :label-width="0"
              :rules="tableValidate.wastageRate"
            >
              <Input
                v-model.trim="tableDataObj[key][index].wastageRate"
                placeholder="请输入损耗率"
                clearable
                :disabled="disabled"
              />
            </FormItem>
          </template>
        </Table>

        <div style="padding: 10px 10px 0 10px;text-align: right;">
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
import { materialTypeData, meteringUnit } from './productData';

export default {
  name: "materialData",
  components: {
    materialModal
  },
  props: {
    // 是否显示
    modelVisible: { type: Boolean, default: false },
    // 是否禁用
    disabled: { type: Boolean, default: false },
    // 商品数据
    productData: { type: Object, default () { return {} } }
  },
  data () {
    return {
      pageLoading: false,
      pushVisible: false,
      pushModelData: {},
      tabs: {},
      productDetail: [],
      colorObj: {},
      activeTab: '',
      tableDataObj: {},
      isRemoveSupply: {},
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
        supplierId: [
          { required: true, message: '请选择供应商', trigger: 'change', type: 'string' }
        ],
        materialColor: [
          { required: true, validator: this.validatorColor, msg: '请选择颜色', trigger: 'change' }
        ],
        netUnitUsage: [
          { required: true, validator: this.$common.validatorMaxNumber, min: 0, point: 2, msg: '请输入不小于0的整数或两位小数', trigger: 'change' },
          { required: true, validator: this.$common.validatorMaxNumber, min: 0, point: 2, msg: '请输入不小于0的整数或两位小数', trigger: 'blur' },
        ],
        wastageRate: [
          { validator: this.$common.validatorMaxNumber, point: 2, msg: '请输入不小于0的整数或两位小数', trigger: 'change' },
          { validator: this.$common.validatorMaxNumber, point: 2, msg: '请输入不小于0的整数或两位小数', trigger: 'blur' },
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
          key: 'path',
          align: 'center',
          width: 120,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.path)) return h('span', '');
            let imgUrl = row.path;
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
          key: 'price',
          align: 'center',
          minWidth: 100
        },
        {
          title: '物料类型',
          key: 'materialType',
          align: 'center',
          width: 100,
          render: (h, { row }) => {
            if (this.$common.isEmpty(this.materialTypeData[row.materialType])) return h('span', '');
            return h('span', `${this.materialTypeData[row.materialType].label}`);
          }
        },
        {
          title: '供应商',
          slot: 'supplierId',
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
            if (this.$common.isEmpty(this.meteringUnit[row.unitMeasurement])) return h('span', '');
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
          slot: 'colorChartCode',
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
        },
        {
          title: '单位净用量',
          slot: 'netUnitUsage',
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
          slot: 'wastageRate',
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
      ],
    }
  },
  watch: {
    materialInfo: {
      immediate: true,
      deep: true,
      handler (val) {
        this.productDetail = val;
      }
    },
    modelVisible: {
      immediate: true,
      deep: true,
      handler (val) {
        if (val) {
          this.pageLoading = true;
          this.$nextTick(() => {
            setTimeout(() => {
              this.pageInit();
            }, 300)
          })
          return;
        }
        this.resetData();
      }
    }
  },
  computed: {
    // 物料信息
    materialInfo () {
      if (this.$common.isEmpty(this.productData) || this.$common.isEmpty(this.productData.productGoodsMaterialInfoVOList)) return [];
      return this.productData.productGoodsMaterialInfoVOList;
    },
    // 商品多属性（颜色需要从这里来）
    productGoodsList () {
      if (this.$common.isEmpty(this.productData) || this.$common.isEmpty(this.productData.productGoodsList)) return [];
      return this.productData.productGoodsList;
    },
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
      return !this.disabled;
    },
    // 颜色ID
    getCheckColor () {
      if (this.pageLoading) return [];
      let colorList = [];
      let colorIds = [];
      const colorObjList = Object.values(this.colorObj);
      let colorInfo = {};
      let otherInfo = {};
      this.productGoodsList.forEach(m => {
        if (!this.$common.isEmpty(m.productGoodsSpecifications)) {
          colorInfo = m.productGoodsSpecifications.find(fin => fin.name == 'Color');
          if (this.$common.isEmpty(colorInfo) && m.productGoodsSpecifications.length == 1) {
            colorInfo = m.productGoodsSpecifications[0];
          }
          if (!this.$common.isEmpty(colorInfo)) {
            if (!this.$common.isEmpty(colorInfo.typeValueId)) {
              colorIds.push(this.$common.isEmpty(Number(colorInfo.typeValueId)) ? colorInfo.typeValueId : Number(colorInfo.typeValueId));
            } else if (!this.$common.isEmpty(colorInfo.value)) {
              otherInfo = colorObjList.find(fin => fin.color == colorInfo.value);
              if (!this.$common.isEmpty(otherInfo)) {
                colorIds.push(this.$common.isEmpty(Number(otherInfo.colorId)) ? otherInfo.colorId : Number(otherInfo.colorId));
              } else {
                this.$set(this.colorObj, colorInfo.value, {
                  colorId: colorInfo.value,
                  color: colorInfo.value
                });
                colorIds.push(colorInfo.value);
              }
            }
          }
        }
      })
      // this.productDetail.forEach(m => {
      //   colorIds.push(Number(m.colorId));
      // })
      // 去重
      colorIds = this.$common.arrRemoveRepeat(colorIds);
      // 过滤空值
      colorIds = colorIds.filter(f => !this.$common.isEmpty(f));
      colorIds.forEach(colorId => {
        if (this.$common.isEmpty(this.colorObj[colorId])) return;
        // tab 表格为空时赋值
        if (this.$common.isEmpty(this.tableDataObj) || this.$common.isUndefined(this.tableDataObj[this.colorObj[colorId].colorId])) {
          this.$set(this.tableDataObj, this.colorObj[colorId].colorId, []);
        }
        colorList.push(this.colorObj[colorId]);
      });
      const aTab = this.$common.isEmpty(Number(this.activeTab)) ? this.activeTab : Number(this.activeTab);
      if ((this.$common.isEmpty(this.activeTab) || !colorIds.includes(aTab)) && !this.$common.isEmpty(colorList)) {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.activeTab = colorList[0].colorId;
      }
      return colorList;
    },
    // 合计
    summation () {
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
      let awaitRes = [this.getColorList, this.getSupplierList];
      this.$common.promiseAll(awaitRes).then(resArr => {
        // console.log('pageInit', resArr);
        this.getMaterialInfo().finally(() => {
          this.pageLoading = false;
        })
      }).catch((err) => {
        console.error(err);
        this.pageLoading = false;
      })
    },
    // 重置数据
    resetData () {
      this.tableDataObj = {};
      this.priceJson = {};
      this.supplyJson = {};
      this.colorJson = {};
      this.meteringColorTotal = {};
      this.isRemoveSupply = {};
      this.materialCorrelation = {};
    },
    // 获取颜色列表
    getColorList () {
      return new Promise((resolve) => {
        if (!this.$common.isEmpty(this.colorObj)) return resolve(this.colorObj);
        this.axios.get(api.queryProductColorList).then((res) => {
          const { code, datas } = res.data || {};
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
      const price = Number(row.price);
      const netUnitUsage = Number(row.netUnitUsage);
      const wastageRate = Number(row.wastageRate);
      if (this.$common.isEmpty(price) || this.$common.isEmpty(netUnitUsage)) return '0.00';
      const amount = price * netUnitUsage * (1 + (this.$common.isEmpty(wastageRate) ? 0 : (wastageRate / 100)));
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
        if (!this.$common.isEmpty(this.supplyList)) return resolve(this.supplyList);
        this.axios.get(api.queryAllSupplierInfo).then((res) => {
          const { code, datas } = res.data || {};
          this.supplyList = code === 0 ? datas || [] : [];
          resolve(this.supplyList);
        }).catch(() => {
          resolve([]);
        })
      })
    },
    // 获取物料信息
    getMaterialInfo () {
      return new Promise((resolve) => {
        const datas = this.$common.copy(this.productDetail);
        let otherInfo = [];
        (datas || []).forEach(item => {
          if (!this.$common.isEmpty(item.productGoodsMaterialDetailVOList) && !this.$common.isEmpty(item.colorId)) {
            item.productGoodsMaterialDetailVOList.forEach(m => {
              if (!this.$common.isEmpty(m.materialColor)) {
                m.materialColor = m.materialColor.toString();
              }
              otherInfo.push(() => {
                return this.getMaterialColorPiceSupplier(m.materialId, m);
              });
            })
            // 给物料表格赋值
            this.$set(this.tableDataObj, item.colorId, item.productGoodsMaterialDetailVOList);
            // 当颜色对象不存在对应的数据时添加进去
            if (this.$common.isEmpty(this.colorObj[item.colorId])) {
              this.$set(this.colorObj, item.colorId, {
                colorId: item.colorId,
                color: item.color
              })
            }
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
              // 物料供应商被删除后，将供应商和颜色绑定移除
              if (row.isDeleted == 0 && !this.$common.isEmpty(row.productMaterialDetailId) && this.isRemoveSupply[row.productMaterialDetailId]) {
                row.supplierId = '';
                row.materialColor = null;
              }
              if (!this.$common.isEmpty(this.materialCorrelation[row.materialId])) {
                itemKey = `${row.materialId}-${row.supplierId}-${row.materialColor}`;
                findInfo = this.priceJson[itemKey];
                findItemInfo = this.materialInfoJson[itemKey];
                row.price = this.$common.isEmpty(findInfo) ? null : findInfo.price;
                if (this.$common.isEmpty(findItemInfo)) {
                  row.colorChartCode = null;
                  row.productCode = null;
                  row.breadth = null;
                } else {
                  row.colorChartCode = findItemInfo.colorChartCode;
                  row.productCode = findItemInfo.productCode;
                  row.breadth = findItemInfo.breadth;
                }
              }
              if (row.wastageRate == 0) {
                row.wastageRate = null;
              }
            })
            this.tableDataObj[key] = copyData;
          })
          resolve(datas || []);
        })
      })
    },
    // 根据物料 ID 获取对应供应商、颜色、单价
    getMaterialColorPiceSupplier (materialId, row) {
      return new Promise((resolve) => {
        if (this.$common.isEmpty(materialId)) return resolve({ data: [] });
        if (!this.$common.isEmpty(this.materialCorrelation[materialId])) {
          this.handMaterialInfo(this.materialCorrelation[materialId], row);
          return resolve({ data: this.materialCorrelation[materialId] });
        }
        this.$set(this.materialCorrelation, materialId, []);
        this.axios.get(api.queryProductMaterialSupplierInfo, { params: { materialId: materialId } }).then((res) => {
          const { code, datas } = res.data || {};
          if (code != 0 || this.$common.isEmpty(datas)) return resolve({ data: [] });
          this.handMaterialInfo(datas, row);
          this.$set(this.materialCorrelation, materialId, datas);
          resolve({ data: datas });
        }).catch((err) => {
          console.error(err);
          resolve({ data: [] });
        })
      })
    },
    // 处理物流数据
    handMaterialInfo (datas, row) {
      let colorIdList = {};
      let supplyObj = {};
      const materialId = row.materialId;
      const supplierId = row.supplierId;
      const pushKey = row.productMaterialDetailId || '';
      if (!this.$common.isEmpty(supplierId)) {
        const isSetSupplier = datas.find(fin => {
          return fin.supplierId == supplierId
        })
        // 当物料供应商变更，新品则添加(商品则删除供应商)
        if (this.$common.isEmpty(isSetSupplier) && !this.$common.isEmpty(pushKey)) {
          this.$set(this.isRemoveSupply, pushKey, true);
          // datas.push({
          //   colorId: row.materialColor,
          //   price: row.price,
          //   supplierId: supplierId,
          // });
        }
      }
      let priceObj = {};
      let materialJson = {};
      if (!this.$common.isEmpty(row)) {
        if (!this.$common.isEmpty(materialId) && !this.$common.isEmpty(supplierId) && !this.$common.isEmpty(row.materialColor)) {
          this.$set(priceObj, `${materialId}-${supplierId}-${row.materialColor}`, { price: row.price });
          this.$set(materialJson, `${materialId}-${supplierId}-${row.materialColor}`, row);
        }
      }

      let priceKey = '';
      let findSupply = {};
      let colorItemObj = {};
      datas.forEach((item) => {
        if (!this.$common.isEmpty(row.materialColor)) {
          priceKey = `${materialId}-${item.supplierId}-${row.materialColor}`;
          this.$set(this.priceJson, priceKey, { ...item, ...(priceObj[priceKey] || {}) });
        }
        if (!this.$common.isEmpty(item.colorName)) {
          (item.colorName || '').split(',').forEach(cItem => {
            if (!this.$common.isEmpty(cItem)) {
              colorItemObj = cItem.includes('{') && cItem.includes('}') ? JSON.parse(cItem) : { [cItem]: '' };
              Object.keys(colorItemObj).forEach(oItem => {
                priceKey = `${materialId}-${item.supplierId}-${oItem}`;
                this.$set(this.priceJson, priceKey, { ...item, ...(priceObj[priceKey] || {}) });
                this.$set(this.materialInfoJson, priceKey, {
                  ...(materialJson[priceKey] || {}),
                  ...item,
                  colorChartCode: colorItemObj[oItem]
                });
                if (this.$common.isEmpty(colorIdList[`${materialId}-${item.supplierId}`])) {
                  colorIdList[`${materialId}-${item.supplierId}`] = [{
                    colorId: oItem,
                    color: oItem,
                    materialSupplierDetailId: item.id,
                    disabled: false
                  }];
                } else {
                  colorIdList[`${materialId}-${item.supplierId}`].push({
                    colorId: oItem,
                    color: oItem,
                    materialSupplierDetailId: item.id,
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
            colorChartCode: ''
          });
        }
        findSupply = this.supplyList.find(fin => {
          return fin.supplierId == item.supplierId;
        })
        if (!this.$common.isEmpty(findSupply)) {
          supplyObj[item.supplierId] = findSupply;
        }
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
      row.price = '';
      row.materialSupplierDetailId = '';
      row.colorChartCode = null;
      row.productCode = null;
      row.breadth = null;
    },
    // 物料颜色改变
    materialColorChange (row) {
      if (this.tableLoading || this.$common.isEmpty(row.supplierId)) return;
      const itemKey = `${row.materialId}-${row.supplierId}-${row.materialColor}`;
      const colorList = this.colorJson[`${row.materialId}-${row.supplierId}${row.productMaterialDetailId || ''}`] || [];
      const findInfo = this.priceJson[itemKey];
      const findItemInfo = this.materialInfoJson[itemKey];
      row.price = this.$common.isEmpty(findInfo) ? null : findInfo.price;
      const getColorInfo = colorList.find(list => {
        return row.materialColor == list.colorId;
      });
      row.materialSupplierDetailId = this.$common.isEmpty(getColorInfo) ? '' : getColorInfo.materialSupplierDetailId;

      if (this.$common.isEmpty(findItemInfo)) {
        row.colorChartCode = null;
        row.productCode = null;
        row.breadth = null;
      } else {
        row.colorChartCode = findItemInfo.colorChartCode;
        row.productCode = findItemInfo.productCode;
        row.breadth = findItemInfo.breadth;
      }
      this.$nextTick(() => {
        let disabledSupplyIds = [];
        this.tableDataObj[this.activeTab] = this.tableDataObj[this.activeTab].map((item, index) => {
          disabledSupplyIds = this.supplierSelectOpen(true, index, true).filter(f => f.disabled).map(m => m.supplierId);
          if (disabledSupplyIds.includes(item.supplierId) && this.$common.isEmpty(item.materialColor)) {
            return { ...item, supplierId: '', materialSupplierDetailId: '' }
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
                const tableSupplier = this.tableDataObj[key][pushIndex].supplierId;
                if (disabledSupplyIds.includes(tableSupplier)) {
                  this.tableDataObj[key][pushIndex].supplierId = '';
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
        const tableSupplier = this.tableDataObj[this.activeTab][pushIndex].supplierId;
        if (disabledSupplyIds.includes(tableSupplier)) {
          this.tableDataObj[this.activeTab][pushIndex].supplierId = '';
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
      const rowKey = `${row.materialId}${row.productMaterialDetailId || ''}`;
      const supplyOption = this.supplyJson[rowKey] || [];
      if (this.$common.isEmpty(supplyOption)) return;
      let colorKey = '';
      let colorOption = [];
      let notDisabled = {};
      const newSupplyList = supplyOption.map(item => {
        this.colorSelectOpen(true, rowIndex, tabKey, item.supplierId);
        colorKey = `${row.materialId}-${item.supplierId}${row.productMaterialDetailId || ''}`;
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
      const newSupplierId = supplierId || row.supplierId;
      const rowKey = `${row.materialId}-${newSupplierId}${row.productMaterialDetailId || ''}`;
      const rowColorOption = this.colorJson[rowKey] || [];
      if (this.$common.isEmpty(rowColorOption)) return;
      let selectColor = [];
      this.tableDataObj[tabKey].forEach((item, index) => {
        if (index != rowIndex && row.materialId == item.materialId && newSupplierId == item.supplierId) {
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
            price: null,
            materialColor: null,
            colorChartCode: null,
            netUnitUsage: null,
            wastageRate: null,
            // (1:已删除,0:未删除)
            isDeleted: 0,
            breadth: null,
            amount: null
          }
          return newRow;
        });
        let findInfo = {};
        let colorList = [];
        let getColorInfo = {};
        let itemKey = '';
        let findItemInfo = {};
        this.$common.promiseAll(getMaterialOther).finally(() => {
          filterData.forEach((row) => {
            // 物料供应商被删除后，将供应商和颜色绑定移除
            if (row.isDeleted == 0 && !this.$common.isEmpty(row.productMaterialDetailId) && this.isRemoveSupply[row.productMaterialDetailId]) {
              row.supplierId = '';
              row.materialColor = null;
            }
            itemKey = `${row.materialId}-${row.supplierId}-${row.materialColor}`;
            findInfo = this.priceJson[itemKey];
            findItemInfo = this.materialInfoJson[itemKey];
            colorList = this.colorJson[`${row.materialId}-${row.supplierId}${row.productMaterialDetailId || ''}`];
            row.price = this.$common.isEmpty(findInfo) ? null : findInfo.price;

            if (this.$common.isEmpty(findItemInfo)) {
              row.colorChartCode = null;
              row.productCode = null;
              row.breadth = null;
            } else {
              row.colorChartCode = findItemInfo.colorChartCode;
              row.productCode = findItemInfo.productCode;
              row.breadth = findItemInfo.breadth;
            }

            if (!this.$common.isEmpty(colorList)) {
              getColorInfo = colorList.find(list => {
                return row.materialColor == list.colorId;
              });
              row.materialSupplierDetailId = this.$common.isEmpty(getColorInfo) ? '' : getColorInfo.materialSupplierDetailId;
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
        // let requiredColor = [];
        const backRes = Object.keys(this.tableDataObj).map(key => {
          const color = !this.$common.isEmpty(this.colorObj[key]) ? this.colorObj[key].color : '';
          // if (type == 1) {
          //   if (this.$common.isEmpty(this.tableDataObj[key])) {
          //     requiredColor.push(color);
          //   }
          // }
          return {
            productId: this.productId,
            color: color,
            colorId: key,
            productGoodsMaterialDetailVOList: (this.tableDataObj[key] || []).map(row => {
              return {
                ...row,
                wastageRate: this.$common.isEmpty(row.wastageRate) ? null : row.wastageRate,
                amount: Number(this.getRowAmount(row)),
                materialSupplier: this.getSupplierObj(row.supplierId, true)
              }
            }),
          };
        }).filter(fin => {
          return !this.$common.isEmpty(fin.productGoodsMaterialDetailVOList)
        })

        if (type == 1 && this.$refs.filterRefsDome) {
          this.$refs.filterRefsDome.validate((valid) => {
            if (!valid) {
              this.$Message.error('“物料资料”表单验证不通过，请检查');
              return resolve({ success: false, message: '“物料资料”表单验证不通过，请检查' });
            }
            // if (!this.$common.isEmpty(requiredColor)) {
            //   this.$Message.error(`请为颜色：${requiredColor.join('，')} 添加物料`);
            //   return resolve({ success: false, message: `请为颜色：${requiredColor.join('，')} 添加物料` });
            // }
            resolve({ success: true, data: backRes });
          })
          return;
        }
        resolve({ success: true, data: backRes });
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
    }
  }
};
</script>

<style lang="less" scoped>
.material-contain{
  position:relative;
  padding: 0 10px 10px 10px;
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
