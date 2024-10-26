<template>
  <div class="form-contain form-contain-disabled">
    <Form ref="pformValidate" :model="formValidate" :rules="ruleValidate" :label-width="130">
      <FormItem label="供应商名称:">
        <span v-for="item in supplyList" :key="item.supplierId">{{productData.supplierId === item.supplierId ? item.supplierName : ''}}</span>
      </FormItem>
      <FormItem label="商品中文名称:" prop="cname">
        <Input v-model="formValidate.cname" placeholder="请输入" clearable :disabled="disabledIf" style="width: 1000px"></Input>
      </FormItem>
      <FormItem label="商品英文名称:" prop="ename">
        <Input v-model="formValidate.ename" placeholder="请输入" clearable :disabled="disabledIf" style="width: 1000px"></Input>
      </FormItem>
      <FormItem label="材质中文描述:" prop="materialCnDesc">
        <Input v-model="formValidate.materialCnDesc" placeholder="请输入" :maxlength="50" clearable :disabled="disabledIf" style="width: 1000px"></Input>
      </FormItem>
      <FormItem label="材质英文描述:" prop="materialEnDesc">
        <Input v-model="formValidate.materialEnDesc" placeholder="请输入" :maxlength="50" clearable :disabled="disabledIf" style="width: 1000px"></Input>
      </FormItem>
      <FormItem label="用途中文描述:" prop="usageCnDesc">
        <Input v-model="formValidate.usageCnDesc" placeholder="请输入" :maxlength="50" clearable :disabled="disabledIf" style="width: 1000px"></Input>
      </FormItem>
      <FormItem label="用途英文描述:" prop="usageEnDesc">
        <Input v-model="formValidate.usageEnDesc" placeholder="请输入" :maxlength="50" clearable :disabled="disabledIf" style="width: 1000px"></Input>
      </FormItem>
      <FormItem label="水洗唛:" prop="washedLabel">
        <Input
          v-model="formValidate.washedLabel"
          placeholder="请输入水洗唛，最多300字符"
          :autosize="{minRows: 1,maxRows: 3}"
          type="textarea"
          :maxlength="300"
          clearable
          :disabled="disabledIf"
          class="common400"
        />
      </FormItem>
      <Form-item
        label="水洗唛标识:"
        prop="washedLabelTag"
      >
        <div class="washed-label-sgin">
          <div class="washed-label-content">
            <div
              v-for="wash in (formValidate.washedLabelTag ? formValidate.washedLabelTag.split(',') : [])"
              :key="`washd-${wash}`"
              class="washed-content-item"
            >
              <img :src="checkWashedData[wash].image" width="80" />
              <div>{{ checkWashedData[wash].label }}</div>
            </div>
          </div>
          <div class="washed-label-btn" @click="openWashedSginModal" v-if="!disabledIf">
            编辑
          </div>
        </div>
      </Form-item>
      <FormItem label="生产要求:" prop="outerPackageRequirement" :rules="{ validator: validateOutPack, trigger: 'change' }">
        <Input
          v-model="formValidate.outerPackageRequirement"
          placeholder="请输入生产要求，最多200字符"
          :autosize="{minRows: 1,maxRows: 3}"
          type="textarea"
          clearable
          :disabled="disabledIf"
          class="common400"
        />
      </FormItem>
      <FormItem label="中文报关名称:" prop="decaleCname">
        <Input v-model="formValidate.decaleCname" placeholder="请输入" clearable :disabled="disabledIf" style="width: 1000px"></Input>
        <Button type="primary" size="small" style=" margin-left:60px;" @click="getExport" v-if="!disabledIf">引用填入</Button>
      </FormItem>
      <FormItem label="英文报关名称:" prop="decaleEname">
        <Input v-model="formValidate.decaleEname" placeholder="请输入" clearable :disabled="disabledIf" style="width: 1000px"></Input>
      </FormItem>
      <FormItem label="报关编码:" prop="decaleCode">
        <Input v-model="formValidate.decaleCode" placeholder="请输入" clearable :disabled="disabledIf" style="width: 1000px"></Input>
      </FormItem>
      <div class="form-line-flex">
        <FormItem label="EAN:">
          <Input v-model="formValidate.ean" placeholder="请输入" clearable :disabled="disabledIf"></Input>
        </FormItem>
        <FormItem label="ISBN:">
          <Input v-model="formValidate.isbn" placeholder="请输入" clearable :disabled="disabledIf"></Input>
        </FormItem>
      </div>
      <FormItem label="商品分类:" prop="productCategory">
        <span>{{formValidate.productCategory || '-'}}</span>
      </FormItem>
      <FormItem label="品牌:">
        <dyt-select v-model="formValidate.brand" placeholder="请选择" filterable clearable :disabled="disabledIf">
          <Option v-for="item in brandList" :value="item.productBrandId" :key="item.productBrandId">{{ item.name }}</Option>
        </dyt-select>
      </FormItem>
      <FormItem label="特性标签:">
        <dyt-select v-model="formValidate.featureLabel" placeholder="请选择" filterable clearable :disabled="disabledIf" multiple>
          <Option v-for="item in featureLabelList" :value="item.productTagId" :key="item.productTagId">{{ item.name }}</Option>
        </dyt-select>
      </FormItem>
      <FormItem label="商品状态:">
        <RadioGroup v-model="formValidate.commodityStatus">
          <Radio v-for="(item,index) in commodityStatusList" :key="index" :label="item.value" class="mr10" :disabled="true">{{item.label}}</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="商品开发员:">
        <span v-for="item in purchaserArr" :key="item.userId">{{productData.createdBy === item.userId ? item.userName : ''}}</span>
      </FormItem>
      <!-- <FormItem label="采购员:">
        <dyt-select v-model="formValidate.buyer" filterable clearable :disabled="disabledIf">
          <Option v-for="item in purchaserArr" :key="item.userId" :value="item.userId">{{item.userName}}</Option>
        </dyt-select>
      </FormItem> -->
      <FormItem label="产品类型:">
        <div class="form-line-flex">
          <Radio v-model="formValidate.normalGood" class="mr10" @on-change="normalGoodChange" :disabled="disabledIf">普货</Radio>
          <CheckboxGroup v-model="formValidate.productType" @on-change="otherGoodChange">
            <Checkbox :label="item.value" class="mr10" v-for="item in productTypeList" :key="item.value" :disabled="disabledIf">{{item.label}}</Checkbox>
          </CheckboxGroup>
        </div>
      </FormItem>

      <FormItem label="多属性:" prop="attriblist">
        <Button type="primary" class="mb10" @click="attrChange('add')" size="small" v-if="formValidate.productCategory" :disabled="disabledIf">增加</Button>
        <div class="fmb0">
          <Table :columns="columns" :data="formValidate.attriblist" border highlight-row>
            <template slot-scope="{ index }" slot="picture">
              <div style="display:flex;align-items:center;">
                <!-- <large-picture :url="row.picture ? row.picture.split(',')[0] : ''"></large-picture> -->
                <updateLargePicture :module-data.sync="formValidate.attriblist[index]" :disabled="disabledIf" :product-data="productData" />
              </div>
            </template>
            <template slot-scope="{ index }" slot="price">
              <FormItem label="" :prop="`attriblist.${index}.price`" :label-width="0" :rules="ruleValidate.price">
                <Input v-model="formValidate.attriblist[index].price" placeholder="请输入" clearable style="width:100%;" :disabled="disabledIf"></Input>
              </FormItem>
            </template>
            <template slot-scope="{ index }" slot="goodWeight">
              <FormItem label="" :prop="`attriblist.${index}.goodWeight`" :label-width="0" :rules="ruleValidate.goodWeight">
                <Input v-model="formValidate.attriblist[index].goodWeight" placeholder="请输入" clearable style="width:100%;" :disabled="disabledIf"></Input>
              </FormItem>
            </template>
            <template slot-scope="{ index }" slot="goodLength">
              <FormItem label="" :prop="`attriblist.${index}.goodLength`" :label-width="0" :rules="ruleValidate.goodLength">
                <Input v-model="formValidate.attriblist[index].goodLength" placeholder="请输入" clearable style="width:100%;" :disabled="disabledIf"></Input>
              </FormItem>
            </template>
            <template slot-scope="{ index }" slot="goodWidth">
              <FormItem label="" :prop="`attriblist.${index}.goodWidth`" :label-width="0" :rules="ruleValidate.goodWidth">
                <Input v-model="formValidate.attriblist[index].goodWidth" placeholder="请输入" clearable style="width:100%;" :disabled="disabledIf"></Input>
              </FormItem>
            </template>
            <template slot-scope="{ index }" slot="goodHeight">
              <FormItem label="" :prop="`attriblist.${index}.goodHeight`" :label-width="0" :rules="ruleValidate.goodHeight">
                <Input v-model="formValidate.attriblist[index].goodHeight" placeholder="请输入" clearable style="width:100%;" :disabled="disabledIf"></Input>
              </FormItem>
            </template>
            <!-- <template slot-scope="{ row, index }" slot="action">
              <a href="javascript:;" @click="attrChange('reduce',index)">删除</a>
            </template> -->
            <template slot-scope="{ index }" slot="action">
              <Button type="error" @click="attrChange('reduce',index)" size="small" :disabled="disabledIf">删除</Button>
            </template>
          </Table>
        </div>
      </FormItem>
    </Form>
    <edit-attr :modelVisible.sync="modelVisible" :attrList="attrList" :selectedList="formValidate.attriblist" @changeAttr="getAttr"></edit-attr>
    <!-- 洗水唛编辑弹窗 -->
    <washedSginModal
      :modelVisible.sync="washedSginModalVisible"
      :moduleData="checkWashedTag"
      @confirmModal="washedTagChange"
    />
  </div>
</template>

<script>
import api from '@/api/api.js';
import regular from '@/utils/regular';
// import largePicture from '@/components/largePicture';
import updateLargePicture from "@/components/updateLargePicture";
import editAttr from './editAttr';
import washedSginModal from '../components/washedSginModal';
import { checkWashedData } from '../dataConfig/washedData';

export default {
  name: "basicData",
  components: {
    // largePicture,
    updateLargePicture,
    editAttr,
    washedSginModal
  },
  data () {
    return {
      checkWashedData: checkWashedData,
      checkWashedTag: [],
      washedSginModalVisible: false,
      formValidate: {
        cname: '',
        ename: '',
        decaleCname: '',
        decaleEname: '',
        decaleCode: '',
        ean: '',
        isbn: '',
        productCategory: '',
        brand: '',
        featureLabel: [],
        commodityStatus: 2,
        // buyer: '',
        normalGood: true,
        attriblist: [],
        materialCnDesc: '',
        materialEnDesc: '',
        usageCnDesc: '',
        usageEnDesc: '',
        washedLabel: '',
        washedLabelTag: '', // 水洗唛标识
        outerPackageRequirement: '', // 生产要求
      },
      ruleValidate: {
        materialCnDesc: [
          {
            required: true, message: "材质中文描述必填", trigger: "blur",
          },
          {
            required: true, message: "材质中文描述必填", trigger: "change"
          }
        ],
        materialEnDesc: [
          {
            required: true, message: "材质英文描述必填", trigger: "blur",
          },
          {
            required: true, message: "材质英文描述必填", trigger: "change"
          }
        ],
        usageCnDesc: [
          {
            required: true, message: "用途中文描述必填", trigger: "blur",
          },
          {
            required: true, message: "用途中文描述必填", trigger: "change"
          }
        ],
        usageEnDesc: [
          {
            required: true, message: "用途英文描述必填", trigger: "blur",
          },
          {
            required: true, message: "用途英文描述必填", trigger: "change"
          }
        ],
        cname: [
          { required: true, message: '商品中文名称必填', trigger: 'blur' }
        ],
        ename: [
          { required: true, message: '商品英文名称必填', trigger: 'blur' }
        ],
        decaleCname: [
          { required: true, validator: this.hsNameMaxVerify, msg: '请输入中文报关名称', maxLength: 200, trigger: 'blur' }
        ],
        decaleEname: [
          { required: true, validator: this.enNameMaxVerify, msg: '请输入英文报关名称', maxLength: 200, trigger: 'blur' }
        ],
        decaleCode: [
          { required: true, validator: this.decaleCodeValidator, trigger: 'blur' }
        ],
        productCategory: [
          { required: true, message: '商品分类不能为空', trigger: 'blur' }
        ],
        price: [
          { required: true, pattern: regular.validateGreater, message: '请输入大于0的正数', trigger: 'blur' }
        ],
        goodWeight: [
          { required: true, pattern: regular.validateGreater, message: '请输入大于0的正数', trigger: 'blur' }
        ],
        goodLength: [
          { required: true, pattern: regular.validateGreater, message: '请输入大于0的正数', trigger: 'blur' }
        ],
        goodWidth: [
          { required: true, pattern: regular.validateGreater, message: '请输入大于0的正数', trigger: 'blur' }
        ],
        goodHeight: [
          { required: true, pattern: regular.validateGreater, message: '请输入大于0的正数', trigger: 'blur' }
        ],
        attriblist: [
          { required: true, message: '多属性必填', trigger: 'blur', type: 'array' }
        ],
      },
      columns: [
        {
          type: 'index',
          title: '序号',
          width: 70,
        },
        // {
        //   title: '操作',
        //   slot: 'action',
        //   width: 80,
        // },
        {
          title: '图片',
          slot: 'picture',
          width: 100,
        },
        {
          title: 'Size',
          key: 'sizeOrModelName',
          minWidth: 90,
        },
        {
          title: 'Color',
          key: 'color',
          minWidth: 90,
        },
        // {
        //   title: '价格',
        //   key: 'price',
        //   minWidth: 100,
        // },
        {
          slot: 'price',
          width: 180,
          renderHeader: (h) => {
            return h('div', {
              style: {
                display: "flex",
                flexAligns: 'center'
              }
            }, [
              h('span', '价格11'),
              h('Checkbox', {
                props: {
                  disabled: !this.formValidate.attriblist.length || this.disabledIf
                },
                style: { marginLeft: '20px' },
                on: {
                  "on-change": (event) => {
                    this.sameChange(event, 'price');
                  },
                },
              }, '相同')
            ]);
          },
        },
        {
          slot: 'goodWeight',
          width: 180,
          renderHeader: (h) => {
            return h('div', {
              style: {
                display: "flex",
                flexAligns: 'center'
              }
            }, [
              h('span', '重量（g）'),
              h('Checkbox', {
                props: {
                  disabled: !this.formValidate.attriblist.length || this.disabledIf
                },
                style: { marginLeft: '20px' },
                on: {
                  "on-change": (event) => {
                    this.sameChange(event, 'goodWeight');
                  },
                },
              }, '相同')
            ]);
          },
        },
        {
          slot: 'goodLength',
          width: 190,
          renderHeader: (h) => {
            return h('div', {
              style: {
                display: "flex",
                flexAligns: 'center'
              }
            }, [
              h('span', '尺寸（长）cm'),
              h('Checkbox', {
                props: {
                  disabled: !this.formValidate.attriblist.length || this.disabledIf
                },
                style: { marginLeft: '20px' },
                on: {
                  "on-change": (event) => {
                    this.sameChange(event, 'goodLength');
                  },
                },
              }, '相同')
            ]);
          },
        },
        {
          slot: 'goodWidth',
          width: 190,
          renderHeader: (h) => {
            return h('div', {
              style: {
                display: "flex",
                flexAligns: 'center'
              }
            }, [
              h('span', '尺寸（宽）cm'),
              h('Checkbox', {
                props: {
                  disabled: !this.formValidate.attriblist.length || this.disabledIf
                },
                style: { marginLeft: '20px' },
                on: {
                  "on-change": (event) => {
                    this.sameChange(event, 'goodWidth');
                  },
                },
              }, '相同')
            ]);
          },
        },
        {
          slot: 'goodHeight',
          width: 190,
          renderHeader: (h) => {
            return h('div', {
              style: {
                display: "flex",
                flexAligns: 'center'
              }
            }, [
              h('span', '尺寸（高）cm'),
              h('Checkbox', {
                props: {
                  disabled: !this.formValidate.attriblist.length || this.disabledIf
                },
                style: { marginLeft: '20px' },
                on: {
                  "on-change": (event) => {
                    this.sameChange(event, 'goodHeight');
                  },
                },
              }, '相同')
            ]);
          },
        },
        {
          title: '操作',
          slot: 'action',
          width: 80,
        },
      ],
      brandList: [],
      featureLabelList: [],
      commodityStatusList: {
        // 0: { label: "停售", value: 0 },
        1: { label: "在售", value: 1 },
        2: { label: "试卖", value: 2 },
        // 3: { label: "清仓", value: 3 },
        // 4: { label: "促销", value: 4 },
      },
      productTypeList: [
        { label: "纯电池", value: '02' },
        { label: "配套电池", value: '03' },
        { label: "液体", value: '04' },
        { label: "药品", value: '05' },
        { label: "粉末", value: '06' },
        { label: "危险品", value: '07' },
        { label: "内置电池", value: '08' },
        { label: "纽扣电池", value: '09' },
        { label: "带磁", value: '10' },
      ],
      commodityData: {},
      disabledIf: false,
      modelVisible: false,//添加属性的对话框
      attrList: [],//属性值
    };
  },
  props: {
    productData: {
      type: Object,
      default () {
        return {};
      }
    },
    purchaserArr: {
      type: Array,
      default () {
        return [];
      }
    },
    supplyList: {
      type: Array,
      default () {
        return [];
      }
    },
    operatList: {
      type: Array,
      default () {
        return [];
      }
    },
    isDisabled: {
      type: Boolean,
      default: false
    },
    commodityProductid: {
      type: String,
      default: ''
    },
    pageActiveTab: {
      type: String,
      default: ''
    },
  },
  computed: {},
  watch: {
    isDisabled: {
      immediate: true,
      deep: true,
      handler (val) {
        this.disabledIf = val;
      }
    },
    commodityProductid: {
      immediate: true,
      deep: true,
      handler (val) {
        if (!val) return;
        this.getCommodityinfo();
      }
    },
    pageActiveTab: {
      immediate: true,
      deep: true,
      handler (val) {
        if (!val || val !== 'commodity'&& val !== 'attribute' ) return;
        this.getCommodityinfo();
      }
    },
    productData: {
      immediate: true,
      deep: true,
      handler (val) {
        if (JSON.stringify(val) === '{}') return;
        // console.log(val, "productdata", this.purchaserArr);
        this.findGoodTypeName(val.goodTypeId);
      }
    }
  },
  created () {
    this.getTotalList();
  },
  methods: {
    decaleCodeValidator (rule, value, callback) {
      if (this.$common.isEmpty(value)) {
        callback(new Error('请输入报关编码'));
        return;
      }
      if (value.length > 30) {
        callback(new Error('报关编码不能超过30个字符'));
        return;
      }
      callback();
    },
    // 商品详情获取
    getCommodityinfo () {
      this.$Spin.show();
      this.$axios.get(api.queryLaPaProductGoodsInfo, {
        params: { productId: this.commodityProductid }
      }).then(({ code, datas }) => {
        if (code !== 0) return;
        this.getDetail(datas);
      }).finally(() => {
        this.$Spin.hide();
      })
    },
    // 验证外包装
    validateOutPack (rule, value, callback) {
      if (this.disabledIf) return callback();
      if (!this.$common.isEmpty(value) && value.trim().length > 200) {
        return callback(new Error('输入字符超出规定，最多200字符'));
      }
      return callback();
    },
    // 详情处理
    getDetail (datas) {
      this.commodityData = datas;
      this.$emit('getAttrlist', datas?.attributeValueVOList);
      let laPaProductVariQuotationList = datas.laPaProductVariQuotationList || [];
      let attriblist = this.formValidate.attriblist;
      let attr = []
      const includeKey = ['materialCnDesc', 'materialEnDesc', 'usageCnDesc', 'usageEnDesc'];
      includeKey.forEach(key => {
        this.$set(this.formValidate, key, laPaProductGoodsInfo[key] || '');
      });
      // 属性
      this.attrList = JSON.parse(JSON.stringify(laPaProductVariQuotationList));
      if (attriblist.length) {
        laPaProductVariQuotationList.forEach((k, i) => {
          attriblist.forEach(ck => {
            if (k.quotationId === ck.quotationId) laPaProductVariQuotationList[i] = ck;
          })
        })
      }
      laPaProductVariQuotationList.forEach(item => {
        if(item.choiceStatus == 0){
          attr.push(item)
        }
      })
      this.formValidate.attriblist = attr;

      let laPaProductGoodsInfo = datas.laPaProductGoodsInfo || {};
      if (JSON.stringify(laPaProductGoodsInfo) === '{}') return;

      // 基本信息
      this.formValidate.brand = laPaProductGoodsInfo.brandId;
      this.formValidate.decaleCname = laPaProductGoodsInfo.declareCnName;
      this.formValidate.decaleCode = laPaProductGoodsInfo.declareCode;
      this.formValidate.decaleEname = laPaProductGoodsInfo.declareEnName;
      this.formValidate.featureLabel = laPaProductGoodsInfo.featureTags ? laPaProductGoodsInfo.featureTags.split(',') : [];
      this.formValidate.cname = laPaProductGoodsInfo.goodsCnName;
      this.formValidate.ename = laPaProductGoodsInfo.goodsEnName;
      this.formValidate.ean = laPaProductGoodsInfo.productEan;
      this.formValidate.isbn = laPaProductGoodsInfo.productIsbn;
      this.formValidate.washedLabel = laPaProductGoodsInfo.washedLabel;
      this.formValidate.outerPackageRequirement = laPaProductGoodsInfo.outerPackageRequirement;
      // this.formValidate.buyer = laPaProductGoodsInfo.purchaseUser;
      // this.formValidate.commodityStatus = laPaProductGoodsInfo.saleStatus || 1;
      this.formValidate.commodityStatus = 2;

      let tableTc = laPaProductGoodsInfo.productGoodsAcceptableTc; //产品类型
      if (!tableTc || tableTc === '01') {
        this.formValidate.normalGood = true;
        this.formValidate.productType = [];
      } else {
        this.formValidate.normalGood = false;
        this.formValidate.productType = tableTc ? tableTc.split(',') : [];
      }
      this.getFormData();
    },
    // 处理表单数据
    formDataHand () {
      let data = this.formValidate;
      let commodityData = this.commodityData;
      let [temp, laPaProductGoodsInfo, qualityInspectionList, variQuotationQOList] = [{}, {}, [], []];

      // 基本信息
      laPaProductGoodsInfo.brandId = data.brand;
      laPaProductGoodsInfo.declareCnName = data.decaleCname;
      laPaProductGoodsInfo.declareCode = data.decaleCode;
      laPaProductGoodsInfo.declareEnName = data.decaleEname;
      laPaProductGoodsInfo.featureTags = data.featureLabel.toString();
      laPaProductGoodsInfo.goodsCnName = data.cname;
      laPaProductGoodsInfo.goodsEnName = data.ename;
      // laPaProductGoodsInfo.isElectrierous = data.isElectrierous; //是否带电：0否，1是 默认0
      laPaProductGoodsInfo.productEan = data.ean;
      laPaProductGoodsInfo.productGoodsAcceptableTc = data.normalGood ? '01' : data.productType.toString();
      laPaProductGoodsInfo.productId = this.productData.productId;
      laPaProductGoodsInfo.productIsbn = data.isbn;
      // laPaProductGoodsInfo.purchaseUser = data.buyer;
      laPaProductGoodsInfo.saleStatus = data.commodityStatus;
      laPaProductGoodsInfo.supplierId = commodityData.supplierId;
      laPaProductGoodsInfo.washedLabel = data.washedLabel;
      laPaProductGoodsInfo.outerPackageRequirement = data.outerPackageRequirement;
      // 属性
      variQuotationQOList = data.attriblist.map(k => {
        return {
          productId: this.productData.productId,
          price: k.price,
          goodHeight: k.goodHeight,
          goodLength: k.goodLength,
          goodWeight: k.goodWeight,
          goodWidth: k.goodWidth,
          quotationId: k.quotationId,
          sizeOrModelName: k.sizeOrModelName,
          color: k.color,
        };
      });
      // 检测项目
      // if (data.qualityRequire.length && (data.qualityRequire[0].project || data.qualityRequire[0].requirement)) {
      //   qualityInspectionList = data.qualityRequire.map(k => {
      //     return {
      //       productId: this.productData.productId,
      //       project: k.project,
      //       requirement: k.requirement,
      //     };
      //   });
      // }
      temp.laPaProductGoodsInfo = laPaProductGoodsInfo;
      temp.variQuotationQOList = variQuotationQOList;
      temp.qualityInspectionList = qualityInspectionList;
      temp.goodTypeId = this.productData.goodTypeId || '';
      const includeKey = ['materialCnDesc', 'materialEnDesc', 'usageCnDesc', 'usageEnDesc'];
      includeKey.forEach(key => {
        this.$set(temp.laPaProductGoodsInfo, key, data[key])
      });
      return temp;
    },
    // 增加尺码/型号
    attrChange (type, index) {
      if (type === 'add') this.modelVisible = true;
      if (type === 'reduce') this.formValidate.attriblist.splice(index, 1);
    },
    // attrChange (type, index) {
    //   if (type === 'add') this.formValidate.attriblist.push(
    //     { goodWeight: '', goodLength: '', goodWidth: '', goodHeight: '', price: '' }
    //   );
    //   if (type === 'reduce') this.formValidate.attriblist.splice(index, 1);
    // },
    // 勾选相同
    sameChange (e, type) {
      const val = this.formValidate.attriblist[0][type];
      if (!(e && val)) return;
      this.formValidate.attriblist.forEach((k, i) => {
        this.formValidate.attriblist[i][type] = val;
      });
    },
    // 普货
    normalGoodChange (e) {
      if (e) this.formValidate.productType = [];
    },
    // 除了普货
    otherGoodChange (e) {
      this.formValidate.normalGood = e.length ? false : true;
    },
    // 获取特性标签/品牌列表
    getTotalList () {
      if (this.featureLabelList.length || this.brandList.length) return;

      this.$axios
        .get(api.productTagqueryAll)
        .then(({ code, datas }) => {
          if (code !== 0) return;
          this.featureLabelList = datas || [];
        });

      this.$axios
        .post(api.productBrandquery, {
          pageNum: 1,
          pageSize: 1000,
        })
        .then(({ code, datas }) => {
          if (code !== 0) return;
          let list = datas.list || [];
          let arr = list.filter(k => {
            return k.status === 1;
          });
          this.brandList = arr;
        });
    },
    // 根据商品分类id找到对应的分类名称
    findGoodTypeName (goodTypeId) {
      this.formValidate.productCategory = '';
      this.operatList.forEach(k => {
        if (k.productCategoryId === goodTypeId) {
          this.formValidate.productCategory = k.productCategoryNavigation;
        }
      });
    },
    // 检验部分字段
    validateField (optionKkey) {
      const keys = this.$common.isEmpty(optionKkey) ? ['decaleCode'] : optionKkey;
      if (this.$common.isArray(keys)) {
        keys.forEach((key) => {
          this.$refs["formValidate"].validateField(key);
        })
      } else if (typeof keys === 'string') {
        this.$refs["formValidate"].validateField(keys);
      }
    },
    // 验证表单
    getFormData () {
      return new Promise(resolve => {
        this.$refs['pformValidate'].validate((valid) => {
          if (!valid) return resolve(valid);
          let validateObj = {
            price: [],
            goodWeight: [],
            goodLength: [],
            goodWidth: [],
            goodHeight: []
          }
          const validateKeys = Object.keys(validateObj);
          this.formValidate.attriblist.forEach((row, index) => {
            Object.keys(row).forEach(key => {
              if (validateKeys.includes(key) && row[key] <= 0) {
                validateObj[key].push(index);
              }
            })
          });
          const newKeys = validateKeys.find(key => {
            return validateObj[key].length > 0
          })
          if (newKeys) {
            const newDemo = document.querySelector(`.ref${validateObj[newKeys][0]}${newKeys}`);
            this.$Message.error('多属性列表中价格，重量，尺寸需大于 0 并且最多2位小数的数字');
            this.$nextTick(() => {
              newDemo && newDemo.querySelector('input').focus();
            })
          }
          resolve(this.formDataHand());
        })
      })
    },
    // 打开选择洗水唛选择弹窗
    openWashedSginModal () {
      if (this.disabledIf) return;
      this.checkWashedTag = this.$common.isEmpty(this.formValidate.washedLabelTag) ? [] : this.formValidate.washedLabelTag.split(',');
      this.$nextTick(() => {
        this.washedSginModalVisible = true;
      })
    },
    // 水洗唛标识改变
    washedTagChange (val) {
      this.formValidate.washedLabelTag = (this.$common.isEmpty(val) ? [] : val).join(',');
    },
    // 验证报关中文
    hsNameMaxVerify (rule, value, callback) {
      const newVal = this.$common.isEmpty(value) ? '' : value.trim();
      const regex = /.*[\u4e00-\u9fa5]+.*$/;
      if (!this.$common.isEmpty(newVal) && !regex.test(newVal)) {
        return callback(new Error('报关中文名称必须包含中文'));
      }
      this.$common.strMaxVerify(rule, value, callback);
    },
    // 验证报关英文
    enNameMaxVerify (rule, value, callback) {
      const newVal = this.$common.isEmpty(value) ? '' : value.trim();
      // eslint-disable-next-line no-useless-escape
      const regex = /^(?!_)([A-Za-z ~!@#$%^*()_+\/*\-,.;'\[\]<>?\\:"{}，。、；‘’【】《》？：“”\|`·——]+)$/;
      if (!this.$common.isEmpty(newVal) && this.$common.isEmpty(newVal.match(regex))) {
        return callback(new Error('请输入英文+除 & 以外的符号'));
      }
      this.$common.strMaxVerify(rule, value, callback);
    },
    //导出引入
    getExport () {
      this.axios.get(api.productCategoryqueryAll).then(res => {
        let data = res.datas
        data.forEach(item =>{
          if(item.productCategoryNavigation == this.formValidate.productCategory){
            this.formValidate.decaleCname = item.cnHsName
            this.formValidate.decaleEname = item.enHsName
            this.formValidate.decaleCode = item.hsCode
          }
        })
        if (!this.formValidate.decaleCname && !this.formValidate.decaleEname && !this.formValidate.decaleCode) {
          this.$Message.info('商品分类没有设定报关编码、中文报关名或英文报关名');
        }
      });
    },

    //获取从对话框那里获取的数据
    getAttr (data) {
      data.forEach((resa, index) => {
        this.formValidate.attriblist.forEach(resb => {
          if (resa.quotationId == resb.quotationId) {
            data[index] = resb;
          }
        })
      })
      this.formValidate.attriblist = data
    }
  }
};
</script>

<style>
.form-contain .form-flex {
  display: flex;
}
.form-contain .form-flex .form-flex__titile {
  margin-right: 20px;
}
.form-contain .quote-sty .ivu-select-selection {
  border-radius: 4px 0 0 4px;
  border-right: none;
}
.form-contain .quote-sty .ivu-input {
  border-radius: 0 4px 4px 0;
}
.form-contain .icon-sty {
  cursor: pointer;
  font-weight: bold;
}
</style>