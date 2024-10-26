<template >
  <div>
    <Modal
      v-model="isVisible"
      title="同步至YMS"
      width="1300"
      class-name="modal-edit-class"
      :mask-closable="false"
    >
      <div class="modal-edit-main">
        <Form
          class="modal-edit-form"
          ref="modalForm"
          :model="formData"
          :rules="formRule"
          :label-width="100"
          label-position="right"
        >
          <div>
            <Form-item label="同步至商户" prop="ymsMerchantId" class="form-tree">
              <dyt-select v-model="formData.ymsMerchantId" placeholder="请选择商户">
                <Option
                  v-for="(item, index) in ymsAccountData"
                  :key="`${item.merchantId}-${index}`"
                  :value="item.merchantId"
                  :label="item.merchantName"
                  @click.native="getYmsCategory"
                />
              </dyt-select>
            </Form-item>
          </div>
          <Form-item label="ERP分类" prop="productCategoryId" class="form-tree">
            <erpTreeSelect
              v-model="formData.productCategoryId"
              :normalizer="treeNormalizer"
              :options="productCategory"
              :default-expand-level="1"
              :appendToBody="true"
              :disabled="true"
              placeholder="请选择ERP分类"
              noResultsText="无匹配数据"
            />
          </Form-item>
          <Form-item label="YMS分类" prop="ymsProductCategoryId" class="form-tree">
            <erpTreeSelect
              v-model="formData.ymsProductCategoryId"
              :normalizer="ymsNormalizer"
              :options="ymsProductCategory"
              :default-expand-level="0"
              :disable-branch-nodes="true"
              :appendToBody="true"
              :disabled="isDisabled || pageLoading || $common.isEmpty(formData.ymsMerchantId)"
              zIndex="999999999"
              :placeholder="$common.isEmpty(formData.ymsMerchantId) ? '请先选择商户后在选YMS分类' : '请选择YMS分类'"
              noResultsText="无匹配数据"
              @input="ymsCategoryIdChange"
            />
          </Form-item>
          <div class="mb15 block-head">YMS规格明细</div>
          <Table
            highlight-row
            border
            :columns="tableColumns"
            :data="formData.tableData"
            v-if="!pageLoading"
          >
            <template slot-scope="{ index, row }" slot="ymsColorId">
              <FormItem label="" :label-width="0" :prop="`tableData.${index}.ymsColorId`" :rules="tableValidate.ymsColorId">
                <dytSelect
                  v-model="formData.tableData[index].ymsColorId"
                  :placeholder="$common.isEmpty(formData.ymsProductCategoryId) ? '请选择YMS分类后再选颜色' : '请选择匹配的颜色'"
                  :disabled="isDisabled || pageLoading"
                  @valueChange="tableRowDataChange(row, index, 'ymsColorId')"
                  @on-open-change="openColorOptions($event, index)"
                >
                  <Option
                    v-for="(item, cIndex) in ymsColorList"
                    :key="`c-${cIndex}`"
                    :value="item.ymsProductAttributeDictionaryId"
                    :label="item.cnValue"
                    :disabled="item.isDisabled"
                    @click.native="tableMatchAttr(item, row, 'color')"
                  />
                </dytSelect>
              </FormItem>
            </template>
            <template slot-scope="{ index, row }" slot="ymsSizeId">
              <FormItem label="" :label-width="0" :prop="`tableData.${index}.ymsSizeId`" :rules="tableValidate.ymsSizeId">
                <dytSelect
                  v-model="formData.tableData[index].ymsSizeId"
                  :placeholder="$common.isEmpty(formData.ymsProductCategoryId) ? '请选择YMS分类后再选尺码' : '请选择匹配的尺码'"
                  :disabled="isDisabled || pageLoading"
                  @valueChange="tableRowDataChange(row, index, 'ymsSizeId')"
                  @on-open-change="openSizeOptions($event, index)"
                >
                  <Option
                    v-for="(item, sIndex) in ymsSizeList"
                    :key="`s-${sIndex}`"
                    :value="item.ymsProductAttributeDictionaryId"
                    :label="item.cnValue"
                    :disabled="item.isDisabled"
                    @click.native="tableMatchAttr(item, row, 'size')"
                  />
                </dytSelect>
              </FormItem>
            </template>
            <template slot-scope="{ index, row }" slot="suggestPrice">
              <FormItem label="" :label-width="0" :prop="`tableData.${index}.suggestPrice`" :rules="tableValidate.suggestPrice">
                <dyt-input placeholder="请输入供货价" v-model="formData.tableData[index].suggestPrice" />
              </FormItem>
            </template>
            <template slot-scope="{ index, row }" slot="isMerchantErp">
              <span v-if="row.isMerchantErp" style="color: #00bb08;">是</span>
              <span v-else style="color: #f20;">否</span>
            </template>
          </Table>
          <div class="mt15">
            <div class="mb15 block-head">YMS尺码表</div>
            <Table
              highlight-row
              border
              :columns="ymsSizeColumns"
              :data="formData.ymsSizeData"
              v-if="!pageLoading && ymsSizeSlotKey.length != 0"
            >
              <template v-for="(colSlot, colIndex) in ymsSizeSlotKey" slot-scope="{ index, row }" :slot="colSlot.slotKey">
                <FormItem
                  v-if="colSlot.slotKey"
                  label=""
                  :label-width="0"
                  :prop="`ymsSizeData.${index}.${colSlot.slotKey}`"
                  :rules="tableValidate.ymsSizePart"
                  :key="`${colSlot.slotKey}-${colIndex}`"
                >
                  <dyt-input :placeholder="`请输入${colSlot.partName || ''}`" v-model="formData.ymsSizeData[index][colSlot.slotKey]" />
                </FormItem>
              </template>
            </Table>
            <div v-if="ymsSizeSlotKey.length == 0" class="not-tips">
              无YMS尺码表数据
            </div>
          </div>
          <div class="mt15" v-if="!pageLoading">
            <div class="mb15 block-head">YMS属性信息</div>
            <Form-item
              v-for="(attr, aIndex) in formData.ymsAttribute"
              :key="`yms-attr-${aIndex}`"
              :label="`${attr.cnName || ''}`"
              :prop="`ymsAttribute.${aIndex}.attributeValueIdList`"
              :label-width="160"
              class="attribute-item"
              :class="{ 'important-attribute': [2].includes(Number(attr.attributeRequire)) }"
              :rules="[
                {required: attr.attributeRequire == 0, message: '必填项不能为空', trigger: 'blur', type: attr.chooseType == 0 ? 'array' : 'string'},
                {required: attr.attributeRequire == 0, message: '必填项不能为空', trigger: 'change', type: attr.chooseType == 0 ? 'array' : 'string'}
              ]"
            >
              <dyt-select
                :clearable="true"
                v-model="attr.attributeValueIdList"
                :multiple="attr.chooseType == 0"
                :disabled="isDisabled || pageLoading"
                @valueChange="ymsAttributeChange($event, attr, `ymsAttribute.${aIndex}.attributeValueIdList`)"
              >
                <Option
                  v-for="(attrVal, vIndex) in (attr.attributeValueList || [])"
                  :value="attrVal.attributeValueId"
                  :key="`attrVal-${vIndex}`"
                  :label="`${attrVal.cnValue || ''}`"
                  @click.native="ymsMatchAttr(attr, attrVal)"
                />
              </dyt-select>
            </Form-item>
            <div v-if="formData.ymsAttribute.length == 0" class="not-tips">
              无YMS属性信息
            </div>
          </div>
          <div class="mt15" v-if="!pageLoading">
            <div class="mb15 block-head">ERP属性信息</div>
            <Form-item
              v-for="(attr, aIndex) in formData.erpAttribute"
              :key="`erp-attr-${aIndex}`"
              :label="`${attr.aliasName || ''}`"
              :prop="`erpAttribute.${aIndex}.attributeValueIdList`"
              :label-width="160"
              class="attribute-item attribute-erp-item"
            >
              <dyt-select
                :clearable="true"
                v-model="attr.attributeValueIdList"
                :multiple="attr.type == 1"
                :disabled="true"
              >
                <!-- :label="`${attrVal.cnValue}:${attrVal.enValue}`" -->
                <Option
                  v-for="(attrVal, vIndex) in attr.attributeValueList"
                  :value="attrVal.attributeValueId"
                  :key="`attrVal-${vIndex}`"
                  :label="`${attrVal.cnValue || ''}`"
                />
              </dyt-select>
              <span class="attribute-mtch-icon" :class="{'attribute-show-icon' : attr.isMtchAttribute}">
                <Icon type="md-checkmark-circle" />
              </span>
            </Form-item>
            <div v-if="formData.erpAttribute.length == 0" class="not-tips">
              无ERP属性信息
            </div>
          </div>
        </Form>
        <Spin v-if="pageLoading" fix></Spin>
      </div>
      <div slot="footer">
        <Button @click="isVisible = false">关 闭</Button>
        <Button type="primary" @click="saveData" :disabled="pageLoading" v-if="!isDisabled">确 定</Button>
      </div>
    </Modal>
    <Modal
      v-model="updatePriceVisible"
      title="批量修改供货价"
      width="600"
      :mask-closable="false"
    >
      <Form
        class="update-price-form"
        ref="updatePriceForm"
        :model="updatePriceData"
        :rules="updatePriceRule"
        :label-width="70"
        label-position="right"
      >
        <FormItem label="类型：" prop="type">
          <RadioGroup v-model="updatePriceData.type" @on-change="updatePriceTypeChange">
            <Radio :label="1">按商品成本价</Radio>
            <Radio :label="2">按比例调整</Radio>
            <Radio :label="3">按数值调整</Radio>
          </RadioGroup>
        </FormItem>
        <div class="box-flex" v-if="[2, 3].includes(updatePriceData.type)">
          <FormItem label="修改：" prop="symbol">
            <Select v-model="updatePriceData.symbol" :transfer="true" style="width: 140px" placeholder="请选择修改类型" @on-change="symbolChange">
              <Option :value="1" label="增加" />
              <Option v-if="updatePriceData.type == 3" :value="2" label="等于" />
              <Option :value="3" label="减少" />
            </Select>
          </FormItem>
          <FormItem :label-width="0" label="" prop="scaleVal" class="ml10 spacn-normal" v-if="updatePriceData.type == 2" key="1">
            <dyt-input :placeholder="`请输入大于0${updatePriceData.symbol == 3 ? '小于100' : ''}的数字`" v-model="updatePriceData.scaleVal">
              <span slot="append">%</span>
            </dyt-input>
          </FormItem>
          <FormItem :label-width="0" label="" prop="updateVal" class="ml10 spacn-normal" v-if="updatePriceData.type == 3" key="2">
            <dyt-input placeholder="请输入大于0的数字" v-model="updatePriceData.updateVal" />
          </FormItem>
        </div>
      </Form>
      <div slot="footer">
        <Button @click="updatePriceVisible = false">关 闭</Button>
        <Button type="primary" @click="batchUpdatePrice">确 定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from '@/api/api';

export default {
  name: 'syncInfoYmsModal',
  props: {
    modalVisible: { type: Boolean, default: false },
    system: { type: String },
    modalData: {
      type: Object,
      default: () => {
        return {
          productCategory: [],
          data: {}
        }
      }
    }
  },
  data () {
    return {
      isVisible: false,
      isDisabled: false,
      updatePriceVisible: false,
      updatePriceData: {
        type: 1,
        symbol: null,
        scaleVal: '',
        updateVal: ''
      },
      updatePriceRule: {
        symbol: [
          { required: true, validator: this.$common.formItemVerify, msg: '请选修改类型', trigger: 'change' }
        ],
        scaleVal: [
          { required: true, validator: this.validatorScaleVal, min: 0, point: 2, notIncludes: ['min'], msg: '请输入大于0的数字', trigger: 'blur' },
          { required: true, validator: this.validatorScaleVal, min: 0, point: 2, notIncludes: ['min'], msg: '请输入大于0的数字', trigger: 'change' }
        ],
        updateVal: [
          { required: true, validator: this.$common.validatorMaxNumber, min: 0, point: 2, notIncludes: ['min'], msg: '请输入大于0的数字', trigger: 'blur' },
          { required: true, validator: this.$common.validatorMaxNumber, min: 0, point: 2, notIncludes: ['min'], msg: '请输入大于0的数字', trigger: 'change' }
        ]
      },
      ymsProductCategory: [],
      productGoodsDetails: {},
      ymsProductAttributeJson: {},
      ymsAttributeList: [],
      ymsColorList: [],
      ymsSizeList: [],
      ymsTableSizeData: [],
      ymsAccountData: [],
      // 表单数据组
      formData: {
        ymsMerchantId: null,
        productCategoryId: null,
        ymsProductCategoryId: null,
        ymsAttribute: [],
        erpAttribute: [],
        tableData: [],
        ymsSizeData: [],
      },
      // 表单验证规则
      formRule: {
        ymsMerchantId: [
          { required: true, validator: this.tableValidator, msg: '请选择商户', trigger: 'change' }
        ],
        ymsProductCategoryId: [
          { required: true, validator: this.tableValidator, msg: '请选择YMS分类', trigger: 'change' }
        ]
      },
      // 表格验证
      tableValidate: {
        ymsColorId: [
          { required: true, validator: this.tableValidator, msg: '请选择颜色', trigger: 'change' }
        ],
        ymsSizeId: [
          { required: true, validator: this.tableValidator, msg: '请选择尺码', trigger: 'change' }
        ],
        ymsSizePart: [
          { required: true, validator: this.validatorNumber, min: 0, point: 2, msg: '必填项不能为空！', trigger: 'blur' },
          { required: true, validator: this.validatorNumber, min: 0, point: 2, msg: '必填项不能为空！', trigger: 'change' }
        ],
        suggestPrice: [
          { required: true, validator: this.validatorNumber, min: 0, point: 2, notIncludes: ['min'], msg: '请输入供货价', trigger: 'blur' },
          { required: true, validator: this.validatorNumber, min: 0, point: 2, notIncludes: ['min'], msg: '请输入供货价', trigger: 'change' }
        ],
      },
      pageLoading: false,
      // YMS规格明细列设置
      tableColumns: [
        {
          title: 'SKU',
          key: 'sku',
          align: 'center',
          minWidth: 100
        },
        {
          title: 'ERP规格',
          key: 'price',
          align: 'center',
          minWidth: 100,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.productGoodsSpecifications)) return h('div', '');
            let txt = '';
            const size = row.productGoodsSpecifications.find(item => {
              return ['size'].includes((item.name || '').toLocaleLowerCase());
            });
            const color = row.productGoodsSpecifications.find(item => {
              return ['color'].includes((item.name || '').toLocaleLowerCase());
            });
            if (!this.$common.isEmpty(color)) {
              txt = color.value;
            }
            if (!this.$common.isEmpty(size)) {
              if (this.$common.isEmpty(txt)) {
                txt = size.value;
              } else if (!this.$common.isEmpty(size.value)) {
                txt = `${txt}·${size.value}`;
              }
            }
            return h('div', txt);
          }
        },
        {
          title: 'YMS颜色',
          slot: 'ymsColorId',
          align: 'center',
          minWidth: 120,
          renderHeader: (h, params) => {
            return h('div', {
              class: 'table-col-required'
            }, 'YMS颜色');
          }
        },
        {
          title: 'YMS尺码',
          slot: 'ymsSizeId',
          align: 'center',
          minWidth: 120,
          renderHeader: (h, params) => {
            return h('div', {
              class: 'table-col-required'
            }, 'YMS尺码');
          }
        },
        {
          title: '供货价',
          slot: 'suggestPrice',
          align: 'center',
          minWidth: 125,
          renderHeader: (h, params) => {
            return h('div', {
              class: 'table-col-required'
            }, [
              h('span', {}, '供货价'),
              h('span', {
                style: {
                  'display': 'inline-block',
                  'padding-top': '6px',
                  'vertical-align': 'top',
                  'padding-left': '10px',
                  'font-size': '12px',
                  'font-weight': 'normal',
                  'text-decoration': 'underline',
                  'text-underline-position': 'under',
                  'cursor': 'pointer',
                  'color': '#2d8cf0',
                },
                on: {
                  click: () => {
                    this.openUpdatePriceModal();
                  }
                },
              }, '批量编辑'),
            ]);
          }
        },
        {
          title: '匹配成功',
          slot: 'isMerchantErp',
          align: 'center',
          width: 100
        },
      ],
      // yms 尺码表列设置
      ymsSizeColumns: [],
      // yms 尺码表插槽key
      ymsSizeSlotKey: [],
    }
  },
  watch: {
    modalVisible: {
      immediate: true,
      handler (val) {
        this.isVisible = val;
      }
    },
    isVisible: {
      handler (val) {
        this.$emit('update:modalVisible', val);
        this.$nextTick(() => {
          val ? this.initData() : this.restData();
        });
      }
    },
    productGoodsList: {
      deep: true,
      immediate: true,
      handler (val) {
        this.formData.tableData = (val || []).map((row) => {
          return {
            ...row,
            oldPrice: row.suggestPrice,
            ymsColorId: '',
            ymsSizeId: '',
            isMerchantErp: false
          }
        })
      }
    }
  },
  created () {},
  computed: {
    // 商品分类树
    productCategory () {
      if (this.$common.isEmpty(this.modalData) || this.$common.isEmpty(this.modalData.productCategory)) return [];
      return this.modalData.productCategory;
    },
    // 选中 SPU 数据
    selectSpuData () {
      if (this.$common.isEmpty(this.modalData) || this.$common.isEmpty(this.modalData.data)) return {};
      return this.modalData.data;
    },
    // 商品多属性
    productGoodsList () {
      if (this.$common.isEmpty(this.productGoodsDetails) || this.$common.isEmpty(this.productGoodsDetails.productGoodsList)) return [];
      return this.productGoodsDetails.productGoodsList;
    }
  },
  methods: {
    // 重置页面数据
    restData () {
      this.pageLoading = false;
    },
    // 初始化页面数据
    initData () {
      this.pageLoading = true;
      this.$refs.modalForm && this.$refs.modalForm.resetFields();
      this.$nextTick(() => {
        this.formData.ymsSizeData = [];
        this.ymsSizeColumns = [];
        this.ymsSizeSlotKey = [];
        this.formData.tableData = [];
        this.ymsTableSizeData = [];
        this.formData.ymsAttribute = [];
        this.formData.erpAttribute = [];
        this.ymsProductAttributeJson = {};
        this.ymsColorList = [];
        this.ymsSizeList = [];
        this.formData.ymsMerchantId = null;
        this.formData.productCategoryId = this.selectSpuData.productCategoryId;
        let awaitRes = [
          () => {
            return this.matchAttribute(this.selectSpuData);
          },
          this.getYmsAccountData,
          this.getYmsCategory,
        ];
        this.system == 'product' && awaitRes.push(() => {
          return this.getProductDetails(this.selectSpuData);
        });
        this.system == 'pds' && awaitRes.push(() => {
          return this.getPdsDetails(this.selectSpuData);
        });
        this.$common.promiseAll(awaitRes).then((arrRes) => {
          // const isHashFail = arrRes.find(fin => {
          //   return this.$common.isBoolean(fin.fail) && fin.fail;
          // });
          // this.isDisabled = !this.$common.isEmpty(isHashFail);
        }).finally(() => {
          this.pageLoading = false;
        })
      })
    },
    // 获取商户信息
    getYmsAccountData () {
      return new Promise((resolve) => {
        this.ymsAccountData = [];
        this.axios.get(api.ymsMerchantAccount).then(res => {
          if (!res || !res.data || res.data.code != 0) return resolve({ success: false, fail: true, data: [] });
          this.ymsAccountData = res.data.datas || [];
          resolve({ success: true, fail: false, data: res.data.datas || [] });
        }).catch(() => {
          resolve({ success: false, fail: true, data: [] });
        })
      })
    },
    // 验证比例
    validatorScaleVal (rule, value, callback) {
      const val = Number(value);
      if (this.updatePriceData.symbol == 3 && !this.$common.isEmpty(val)) {
        if (val >= 100) {
          return callback(new Error('请输入大于0小于100的数字'));
        }
      }
      this.$common.validatorMaxNumber(rule, value, callback);
    },
    // 处理树节点
    treeNormalizer(node) {
      return {
        id: node.productCategoryId,
        label: node.title,
        children: node.children
      }
    },
    // yms 节点处理
    ymsNormalizer (node) {
      return {
        id: node.ymsProductCategoryId,
        label: node.cnName,
        children: node.ymsProductCategoryVOList
      }
    },
    // 获取 YMS 分类
    getYmsCategory () {
      return new Promise(resolve => {
        this.ymsProductCategory = [];
        this.formData.ymsProductCategoryId = null;
        if (this.$common.isEmpty(this.formData.ymsMerchantId)) return resolve({ success: false, fail: true, data: [] });
        this.axios.post(`${api.getYmsProductCategory}?ymsMerchantId=${this.formData.ymsMerchantId}`).then(res => {
          if (!res || !res.data || res.data.code != 0) return resolve({ success: false, fail: true, data: [] });
          this.ymsProductCategory = this.ymsCategoryHand(res.data.datas || []);
          resolve({ success: true, fail: false, data: res.data.datas || [] });
        }).catch(() => {
          resolve({ success: false, fail: true, data: [] });
        })
      })
    },
    // 处理 YMS 分类子级为空的情况
    ymsCategoryHand (data) {
      data.forEach(item => {
        if (this.$common.isEmpty(item.ymsProductCategoryVOList)) {
          delete item.ymsProductCategoryVOList;
        } else {
          this.ymsCategoryHand(item.ymsProductCategoryVOList);
        }
      })
      return data;
    },
    // yms 选中值改变时
    ymsCategoryIdChange (value) {
      this.pageLoading = true;
      this.$refs.modalForm && this.$refs.modalForm.validateField('ymsProductCategoryId');
      this.$nextTick(() => {
        setTimeout(() => {
          this.getYmsCategoryDetails(value).finally(() => {
            if (this.$common.isEmpty(value)) {
              this.pageLoading = false;
              return;
            }
            // 匹配颜色和尺码
            if (!this.$common.isEmpty(this.formData.tableData)) {
              this.formData.tableData.forEach((row) => {
                if (!this.$common.isEmpty(row.productGoodsSpecifications)) {
                  row.productGoodsSpecifications.forEach(item => {
                    if (this.ymsSizeList.length > 0 && ['size'].includes((item.name || '').toLocaleLowerCase())) {
                      const findInfo = this.ymsSizeList.find(f => item.value == f.cnValue);
                      if (!this.$common.isEmpty(findInfo)) {
                        row.ymsSizeId = findInfo.ymsProductAttributeDictionaryId;
                      }
                    }
                    if (this.ymsColorList.length > 0 && ['color'].includes((item.name || '').toLocaleLowerCase())) {
                      const findInfo = this.ymsColorList.find(f => item.value == f.cnValue);
                      if (!this.$common.isEmpty(findInfo)) {
                        row.ymsColorId = findInfo.ymsProductAttributeDictionaryId;
                      }
                    }
                  });
                  row.isMerchantErp = !this.$common.isEmpty(row.ymsSizeId) && !this.$common.isEmpty(row.ymsColorId);
                }
              });
            }
            // 匹配属性
            if (!this.$common.isEmpty(this.formData.erpAttribute)) {
              let erpAttrJson = {};
              this.formData.erpAttribute.forEach(item => {
                erpAttrJson[item.aliasName] = item;
              });
              let isMtchId = [];
              this.formData.ymsAttribute.forEach(item => {
                if (!this.$common.isEmpty(erpAttrJson[item.cnName])) {
                  const checkLabel = erpAttrJson[item.cnName].attributeValueList.filter(fil => {
                    if (fil.type == 1) {
                      return erpAttrJson[item.cnName].attributeValueIdList.includes(fil.attributeValueId);
                    } else {
                      return erpAttrJson[item.cnName].attributeValueIdList == fil.attributeValueId;
                    }
                  });
                  if (!this.$common.isEmpty(checkLabel)) {
                    const checkLabelTxt = checkLabel.map(m => m.cnValue);
                    let attributeId = item.chooseType == 0 ? [] : '';
                    item.attributeValueList.forEach(lab => {
                      if (checkLabelTxt.includes(lab.cnValue)) {
                        if (item.chooseType == 0) {
                          attributeId.push(lab.attributeValueId);
                        } else {
                          attributeId = lab.attributeValueId;
                        }
                      }
                    });
                    if (!this.$common.isEmpty(attributeId)) {
                      item.attributeValueIdList = attributeId;
                      !isMtchId.includes(item.cnName) && isMtchId.push(item.cnName);
                    }
                  }
                }
              });
              if (isMtchId.length > 0) {
                this.formData.erpAttribute.forEach(item => {
                  if (isMtchId.includes(item.aliasName)) {
                    item.isMtchAttribute = true;
                  }
                });
              }
            }
            this.pageLoading = false;
          })
        }, 200);
      })
    },
    // 获取 YMS 对应分类的信息 chooseType: 0 多选 1 单选
    getYmsCategoryDetails (ymsCategoryId) {
      return new Promise(resolve => {
        this.ymsProductAttributeJson = {};
        this.formData.ymsAttribute = [];
        this.ymsColorList = [];
        this.ymsSizeList = [];
        this.ymsTableSizeData = [];
        let erpAttribute = this.$common.copy(this.formData.erpAttribute);
        let tableData = this.$common.copy(this.formData.tableData);
        tableData.forEach(row => {
          (row.productGoodsSpecifications || []).forEach(atrr => {
            if (['size'].includes((atrr.name || '').toLocaleLowerCase()) && !this.ymsTableSizeData.includes(atrr.value)) {
              this.ymsTableSizeData.push(atrr.value);
            }
          });
          row.ymsSizeId = '';
          row.ymsColorId = '';
          row.isMerchantErp = false;
        });
        erpAttribute.forEach(item => {
          item.isMtchAttribute = false;
        });
        this.formData.tableData = tableData;
        this.formData.erpAttribute = erpAttribute;
        this.formData.ymsSizeData = [];
        this.ymsSizeColumns = [];
        this.ymsSizeSlotKey = [];
        if (this.$common.isEmpty(ymsCategoryId) || this.$common.isEmpty(this.formData.ymsMerchantId)) {
          return resolve({ success: false, fail: true, data: [] });
        }
        this.axios.post(`${api.queryYmsProductCategory}/${ymsCategoryId}?ymsMerchantId=${this.formData.ymsMerchantId}`).then(res => {
          if (!res || !res.data || res.data.code != 0) return resolve({ success: false, fail: true, data: [] });
          let ymsAttributeList = [];
          let itemInfo = {};
          // 处理对应的值
          const getRes = this.$common.copy((res.data.datas || {}));
          Object.keys(getRes).forEach(key => {
            if (key == 'LAPA_ERP_COLOR') {
              this.ymsColorList = (getRes.LAPA_ERP_COLOR || []).map(item => {
                return { ...item, isDisabled: false }
              });
            } else if (key == 'LAPA_ERP_SIZE') {
              this.ymsSizeList = (getRes.LAPA_ERP_SIZE || []).map(item => {
                return { ...item, isDisabled: false }
              });
            } else if (key == 'YMS_SIZE_PARTS') {
              let newCol = [];
              let slotKey = '';
              let sizeTableList = [];
              let rowObj = {};
              (getRes.YMS_SIZE_PARTS || []).forEach(item => {
                slotKey = `${(new Date().getTime()).toString(32)}-${Number(((Math.random() * Math.pow(10, 10)).toFixed(0))).toString(32)}`
                // 列表列
                newCol.push({
                  title: `${item || ''}(cm)`,
                  slot: slotKey,
                  align: 'center',
                  minWidth: 120,
                  renderHeader: (h, params) => {
                    return h('div', {
                      class: 'table-col-required'
                    }, `${item || ''}(cm)`);
                  }
                });
                rowObj[slotKey] = '';
                this.ymsSizeSlotKey.push({
                  slotKey: slotKey,
                  label: `${item || ''}(cm)`,
                  partName: item
                });
              });
              this.ymsTableSizeData.forEach(sizeItem => {
                sizeTableList.push({
                  sizeName: sizeItem,
                  ...(this.$common.copy(rowObj))
                });
              });
              // 动态尺码表列
              this.ymsSizeColumns = [
                {
                  title: 'Size',
                  key: 'sizeName',
                  align: 'center',
                  width: 100
                },
                ...newCol
              ];
              this.formData.ymsSizeData = sizeTableList;
            } else if (!this.$common.isEmpty(getRes[key])) {
              itemInfo = getRes[key][0];
              ymsAttributeList.push({
                ...itemInfo,
                attributeValueIdList: itemInfo.chooseType == 0 ? [] : '',
                attributeValueList: getRes[key].map(m => {
                  return { ...m, attributeValueId: m.ymsProductAttributeDictionaryId }
                })
              })
            }
            (getRes[key] || []).forEach(item => {
              this.$set(this.ymsProductAttributeJson, item.ymsProductAttributeDictionaryId, item);
            })
          });
          this.formData.ymsAttribute = ymsAttributeList;
          resolve({ success: true, fail: false, data: res.data.datas || [] });
        }).catch(() => {
          resolve({ success: false, fail: true, data: [] });
        })
      })
    },
    // 打开批量修改供货价弹窗
    openUpdatePriceModal () {
      this.updatePriceData = {
        type: 1,
        symbol: null,
        scaleVal: '',
        updateVal: ''
      }
      this.$nextTick(() => {
        this.updatePriceVisible = true;
        this.$nextTick(() => {
          this.$refs.updatePriceForm && this.$refs.updatePriceForm.resetFields();
        })
      });
    },
    // 改供货价类型改变
    updatePriceTypeChange (val) {
      this.updatePriceData.symbol = 1;
      // this.updatePriceData.scaleVal = '';
      // this.updatePriceData.updateVal = '';
    },
    // 修改类型改变
    symbolChange () {
      this.$refs.updatePriceForm.validate((valid) => {});
    },
    // 批量修改供货价
    batchUpdatePrice () {
      this.$refs.updatePriceForm.validate((valid) => {
        if (!valid) return;
        this.formData.tableData.forEach((row, index) => {
          if (this.updatePriceData.type == 1) {
            this.$set(this.formData.tableData[index], 'suggestPrice', row.oldPrice);
          } else if ([2, 3].includes(this.updatePriceData.type)) {
            let differNumber = this.$common.isEmpty(Number(row.oldPrice)) ? 0 : Number(row.oldPrice);
            if (this.updatePriceData.type == 2) {
              differNumber = differNumber * (1 + (((this.updatePriceData.symbol == 1 ? 1 : -1) * Number(this.updatePriceData.scaleVal)) / 100));
            } else if (this.updatePriceData.type == 3) {
              if (this.updatePriceData.symbol == 1) {
                differNumber = differNumber + Number(this.updatePriceData.updateVal);
              } else if (this.updatePriceData.symbol == 2) {
                differNumber = Number(this.updatePriceData.updateVal);
              } else if (this.updatePriceData.symbol == 3) {
                differNumber = differNumber - Number(this.updatePriceData.updateVal);
              }
            }
            this.$set(this.formData.tableData[index], 'suggestPrice', Number(differNumber.toFixed(2)));
          }
        });
        this.$nextTick(() => {
          this.updatePriceVisible = false;
        })
      })
    },
    // 获取ERP属性
    getAttributeValueList(config) {
      return new Promise(resolve => {
        this.axios.post(api.query_findAttribute, {
          productCategoryId: config.productCategoryId,
          productId: config.productId
        }).then(res => {
          if (!res || !res.data || res.data.code != 0) return resolve({ state: false, res: [] });
          resolve({ state: true, res: res.data.datas || [] });
        }).catch(() => {
          resolve({ state: false, res: [] });
        })
      })
    },
    // 属性单个匹配判断
    ymsMatchAttr (attrItem, option) {
      if (this.formData.erpAttribute.length == 0) return;
      let erpAttr = {};
      let erpIndex = null;
      this.formData.erpAttribute.forEach((item, index) => {
        if (attrItem.cnName == item.aliasName) {
          erpAttr = item;
          erpIndex = index;
        }
      });
      if (this.$common.isEmpty(erpAttr)) return;
      if (attrItem.chooseType == 0 && erpAttr.type == 1) {
        if (erpAttr.attributeValueIdList.length != attrItem.attributeValueIdList.length) {
          this.formData.erpAttribute[erpIndex].isMtchAttribute = false;
          return;
        }
        const ymsCheckTxt = option.attributeValueList.filter(f => attrItem.attributeValueIdList.includes(f.attributeValueId)).map(m => m.cnValue);
        const erpCheckTxt = erpAttr.attributeValueList.filter(f => erpAttr.attributeValueIdList.includes(f.attributeValueId)).map(m => m.cnValue);
        // 合并数组去重后长度还是和原来一直表明2个数组的值是相同
        const isMtchAttribute = this.$common.arrRemoveRepeat([...ymsCheckTxt, ...erpCheckTxt]).length == attrItem.attributeValueIdList.length;
        this.formData.erpAttribute[erpIndex].isMtchAttribute = isMtchAttribute;
      } else if (attrItem.chooseType == 1 && erpAttr.type == 0) {
        const erpCheckOption = erpAttr.attributeValueList.find(f => erpAttr.attributeValueIdList == f.attributeValueId);
        if (this.$common.isEmpty(erpCheckOption)) {
          this.formData.erpAttribute[erpIndex].isMtchAttribute = false;
          return;
        }
        this.formData.erpAttribute[erpIndex].isMtchAttribute = erpCheckOption.cnValue == option.cnValue;
      } else {
        this.formData.erpAttribute[erpIndex].isMtchAttribute = false;
      }
    },
    // 属性改变时
    ymsAttributeChange (val, ymsAttr, propKey) {
      this.$refs.modalForm && this.$refs.modalForm.validateField(propKey);
      if (!this.$common.isEmpty(val)) return;
      // 清空选项时，设置匹配为否
      this.formData.erpAttribute.forEach((item) => {
        if (ymsAttr.cnName == item.aliasName) {
          item.isMtchAttribute = false;
        }
      });
    },
    // 表格行改变时
    tableRowDataChange (row, index, key) {
      this.$nextTick(() => {
        const nowRow = this.formData.tableData[index];
        const val = nowRow[key];
        if (this.$common.isEmpty(val)) {
          this.$set(this.formData.tableData[index], 'isMerchantErp', !this.$common.isEmpty(nowRow.ymsColorId) && !this.$common.isEmpty(nowRow.ymsSizeId));
          return;
        }
        let info = {};
        let rowInfo = {};
        const keyObj = {
          ymsColorId: 'color',
          ymsSizeId: 'size'
        }
        if (!this.$common.isEmpty(keyObj[key])) {
          info = (nowRow.productGoodsSpecifications || []).find(item => {
            return [keyObj[key]].includes((item.name || '').toLocaleLowerCase());
          });
        }
        this.formData.tableData.forEach((tRow, tIndex) => {
          if (tIndex != index && this.$common.isEmpty(tRow[key]) && !this.$common.isEmpty(info)) {
            rowInfo = (tRow.productGoodsSpecifications || []).find(item => {
              return [keyObj[key]].includes((item.name || '').toLocaleLowerCase());
            });
            if (info.value == rowInfo.value) {
              this.$set(this.formData.tableData[tIndex], key, val);
            }
          }
          this.$set(this.formData.tableData[tIndex], 'isMerchantErp', !this.$common.isEmpty(tRow.ymsColorId) && !this.$common.isEmpty(tRow.ymsSizeId));
        });
      });
    },
    // 颜色下拉展开(隐藏)
    openColorOptions (isOpen, rowIndex) {
      if (!isOpen) return;
      const nowRow = this.formData.tableData[rowIndex];
      const sizeId = nowRow.ymsSizeId;
      let colorMatchSize = {};
      let identicalSizes = [];
      this.formData.tableData.forEach((row, index) => {
        if (rowIndex != index) {
          if (this.$common.isEmpty(colorMatchSize[row.ymsColorId])) {
            colorMatchSize[row.ymsColorId] = [row.ymsSizeId];
          } else if (!colorMatchSize[row.ymsColorId].includes(row.ymsSizeId)) {
            colorMatchSize[row.ymsColorId].push(row.ymsSizeId);
          }
          if (sizeId == row.ymsSizeId) {
            identicalSizes.push(row.ymsColorId);
          }
        }
      });
      const ymsSizeList = this.ymsSizeList.length;
      this.ymsColorList = this.ymsColorList.map(item => {
        if (this.$common.isEmpty(colorMatchSize[item.ymsProductAttributeDictionaryId])) {
          item.isDisabled = false;
        } else {
          item.isDisabled = colorMatchSize[item.ymsProductAttributeDictionaryId].length >= ymsSizeList || identicalSizes.includes(item.ymsProductAttributeDictionaryId);
        }
        return item;
      });
    },
    // 尺码下拉展开(隐藏)
    openSizeOptions (isOpen, rowIndex) {
      if (!isOpen) return;
      const nowRow = this.formData.tableData[rowIndex];
      const colorId = nowRow.ymsColorId;
      let sizeMatchColor = {};
      let identicalColors = [];
      this.formData.tableData.forEach((row, index) => {
        if (rowIndex != index) {
          if (this.$common.isEmpty(sizeMatchColor[row.ymsSizeId])) {
            sizeMatchColor[row.ymsSizeId] = [row.ymsColorId];
          } else if (!sizeMatchColor[row.ymsSizeId].includes(row.ymsColorId)) {
            sizeMatchColor[row.ymsSizeId].push(row.ymsColorId);
          }
          if (colorId == row.ymsColorId) {
            identicalColors.push(row.ymsSizeId);
          }
        }
      });
      const ymsColorList = this.ymsColorList.length;
      this.ymsSizeList = this.ymsSizeList.map(item => {
        if (this.$common.isEmpty(sizeMatchColor[item.ymsProductAttributeDictionaryId])) {
          item.isDisabled = false;
        } else {
          item.isDisabled = sizeMatchColor[item.ymsProductAttributeDictionaryId].length >= ymsColorList || identicalColors.includes(item.ymsProductAttributeDictionaryId);
        }
        return item;
      });
    },
    // 列表匹配判断(和产品沟通，表示无需做此匹配判断)
    tableMatchAttr (attrItem, row, type) {},
    // ERP属性选中的值
    matchAttribute (config) {
      return new Promise(resolve => {
        if (this.$common.isEmpty(config)) return resolve({ success: false, fail: true });
        this.getAttributeValueList(config).then(({ state, res }) => {
          let erpAttrList = [];
          (res.attributeClassifyVOList || []).forEach(item => {
            item.isMtchAttribute = false;
            const itemVal = (item.attributeValueList || []).filter(op => {
              return res.attributeValueIds.includes(op.attributeValueId)
            }).map(vItem => {
              return vItem.attributeValueId
            });
            if (item.type == 0) {
              const val = itemVal.join('');
              const newVal = this.$common.isEmpty(val) ? '' : Number(val);
              item.attributeValueIdList = isNaN(newVal) ? val : newVal;
            } else {
              item.attributeValueIdList = itemVal;
            }
            erpAttrList.push(item);
          });
          this.formData.erpAttribute = erpAttrList;
          resolve({ success: state, fail: !state });
        })
      })
    },
    // 获取商品系统的商品详情
    getProductDetails (config) {
      return new Promise(resolve => {
        this.productGoodsDetails = {};
        if (this.$common.isEmpty(config)) return resolve({ success: false, fail: true, data: {} });
        this.axios.get(`${api.productInfo_detail}${config.productId}`).then(res => {
          if (!res || !res.data || res.data.code != 0) return resolve({ success: false, fail: true, data: {} });
          this.productGoodsDetails = res.data.datas || {};
          resolve({ success: true, fail: false, data: res.data.datas || {} });
        }).catch(() => {
          resolve({ success: false, fail: true, data: {} });
        })
      })
    },
    // 验证
    tableValidator (rule, value, callback) {
      this.$nextTick(() => {
        if (this.isDisabled) return callback();
        this.$common.formItemVerify(rule, value, callback);
      })
    },
    // 验证数字
    validatorNumber (rule, value, callback) {
      this.$nextTick(() => {
        if (this.isDisabled) return callback();
        this.$common.validatorMaxNumber(rule, value, callback);
      })
    },
    // 获取新品系统的商品详情
    getPdsDetails (config) {
      return new Promise(resolve => {
        if (this.$common.isEmpty(config)) return resolve({ success: false, fail: true, data: {} });
        resolve({ success: true, fail: false, data: {} });
      })
    },
    // 保存
    saveData () {
      if (this.pageLoading) return;
      this.$refs.modalForm.validate((valid) => {
        if (!valid) {
          this.$nextTick(() => {
            setTimeout(() => {
              const errorDemo = document.querySelector('.modal-edit-main .ivu-form-item-error .ivu-form-item-content');
              if (!errorDemo) return;
              let inputDemo = errorDemo.querySelector('.ivu-select-input');
              if (!inputDemo) {
                inputDemo = errorDemo.querySelector('.vue-treeselect__input');
              }
              if (!inputDemo) return;
              inputDemo.focus();
            })
          }, 300)
          return;
        }
        this.pageLoading = true;
        let params = {
          productId: this.selectSpuData.productId,
          ymsMerchantId: this.formData.ymsMerchantId,
          ymsProductCategoryId: this.formData.ymsProductCategoryId,
          ymcSyncProductSkuQOList: [],
          ymcSyncProductAttributeQOList: []
        };
        let rowColorInfo = {};
        let rowSizeInfo = {};
        let colorAndSize = [];
        this.formData.tableData.forEach(row => {
          rowColorInfo = this.ymsProductAttributeJson[row.ymsColorId];
          rowSizeInfo = this.ymsProductAttributeJson[row.ymsSizeId];
          colorAndSize.push(`${row.ymsColorId}-${row.ymsSizeId}`);
          // 颜色
          params.ymcSyncProductSkuQOList.push({
            cnValue: rowColorInfo.cnValue,
            cnName: rowColorInfo.cnName,
            sku: row.sku,
            suggestPrice: row.suggestPrice,
          });
          // 尺码
          params.ymcSyncProductSkuQOList.push({
            cnValue: rowSizeInfo.cnValue,
            cnName: rowSizeInfo.cnName,
            sku: row.sku,
            suggestPrice: row.suggestPrice,
          });
        });
        let sizeListData = [];
        (this.ymsSizeSlotKey || []).forEach(colObj => {
          (this.formData.ymsSizeData || []).forEach(row => {
            sizeListData.push({
              cnSize: row.sizeName,
              partsName: colObj.partName,
              unitValue: (row[colObj.slotKey] || '').trim(),
            });
          })
        });
        params.ymcSyncProductSkuSizeQOS = sizeListData;
        colorAndSize = this.$common.arrRemoveRepeat(colorAndSize);
        if (colorAndSize.length != this.formData.tableData.length) {
          this.pageLoading = false;
          this.$Message.warning('YMS颜色+YMS尺码出现重复，请检查');
          return;
        }
        this.formData.ymsAttribute.forEach(item => {
          if (!this.$common.isEmpty(item.attributeValueIdList)) {
            if (item.chooseType == 0) {
              item.attributeValueIdList.forEach(val => {
                params.ymcSyncProductAttributeQOList.push({
                  ymsProductAttributeTemplateId: item.ymsProductAttributeTemplateId,
                  type: item.type,
                  ymsProductAttributeDictionaryId: val
                });
              });
            } else {
              params.ymcSyncProductAttributeQOList.push({
                ymsProductAttributeTemplateId: item.ymsProductAttributeTemplateId,
                type: item.type,
                ymsProductAttributeDictionaryId: item.attributeValueIdList
              });
            }
          }
        });
        this.axios.post(api.syncYmsProductInfo, params).then(res => {
          if (!res || !res.data || res.data.code != 0) return;
          this.$Message.success('操作成功！');
          this.isVisible = false;
        }).finally(() => {
          this.pageLoading = false;
        });
      });
    }
  }
};
</script>

<style lang="less" scoped>
.box-flex{
  display: flex;
  :deep(.ivu-form-item) {
    .ivu-form-item-error-tip{
      font-size: 12px;
    }
    &.spacn-normal{
      .ivu-form-item-content{
        font-size: 0;
        line-height: normal;
      }
    }
  }
}
.modal-edit-main{
  position: relative;
  min-height: 500px;
  :deep(.ivu-spin-main) {
    position: sticky;
    top: 50%;
    left: initial;
    transform: translate(0, -50%);
  }
}
.modal-edit-form{
  :deep(.ivu-table-wrapper) {
    .table-col-required{
      position: relative;
      &:before{
        content: '*';
        display: inline-block;
        margin-right: 4px;
        line-height: normal;
        font-size: 14px;
        color: #ed4014;
      }
    }
    th {
      .ivu-table-cell{
        padding: 0px 8px;
      }
    }
    td {
      .ivu-table-cell{
        padding: 5px 8px;
      }
    }
    .ivu-form-item{
      margin-bottom: 0px;
    }
  }
  .ivu-form-item {
    :deep(.ivu-form-item-label){
      padding-left: 5px;
      padding-right: 5px;
    }
    &.attribute-item{
      display: inline-block;
      width: 33.3333%;
      max-width: 450px;
      min-width: 300px;
      &.important-attribute {
        :deep(.ivu-form-item-label){
          color: #f20;
          font-weight: bold;
        }
      }
      &.attribute-erp-item{
        :deep(.ivu-form-item-content){
          display: flex;
          .attribute-mtch-icon{
            margin-left: 0px;
            color: #00bb08;
            font-size: 16px;
            visibility: hidden;
            &.attribute-show-icon{
              visibility: visible;
              vertical-align: middle;
            }
          }
        }
      }
    }
    &.form-tree{
      display: inline-block;
      width: 50%;
      max-width: 400px;
    }
  }
  .block-head{
    border-bottom: 1px solid #ccc;
  }
  .not-tips{
    text-align: center;
    color: #a5a5a5;
  }
}
:deep(.modal-edit-class){
  .ivu-modal{
    position: relative;
  }
}
</style>
