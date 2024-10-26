<template>
  <div class="form-contain form-contain-disabled commodityInformationPage">
    <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="130">
      <FormItem label="供应商名称:" v-if="platformType != 'plate'">
        {{ selectSupplier.supplierName || '' }}
      </FormItem>
      <FormItem label="商品中文名称:" prop="cname">
        <Input v-model="formValidate.cname" placeholder="请输入" clearable :disabled="disabledIf" class="common400"></Input>
      </FormItem>
      <FormItem label="商品英文名称:" prop="ename">
        <Input v-model="formValidate.ename" placeholder="请输入" :maxlength="50" clearable :disabled="disabledIf"
          class="common400"></Input>
      </FormItem>
      <FormItem label="材质中文描述:" prop="materialCnDesc">
        <Input v-model="formValidate.materialCnDesc" placeholder="请输入" :maxlength="50" clearable :disabled="disabledIf"
          class="common400"></Input>
      </FormItem>
      <FormItem label="材质英文描述:" prop="materialEnDesc">
        <Input v-model="formValidate.materialEnDesc" placeholder="请输入" :maxlength="50" clearable :disabled="disabledIf"
          class="common400"></Input>
      </FormItem>
      <FormItem label="用途中文描述:" prop="usageCnDesc">
        <Input v-model="formValidate.usageCnDesc" placeholder="请输入" :maxlength="50" clearable :disabled="disabledIf"
          class="common400"></Input>
      </FormItem>
      <FormItem label="用途英文描述:" prop="usageEnDesc">
        <Input v-model="formValidate.usageEnDesc" placeholder="请输入" :maxlength="50" clearable :disabled="disabledIf"
          class="common400"></Input>
      </FormItem>
      <FormItem label="水洗唛:" prop="washedLabel">
        <Input v-model="formValidate.washedLabel" placeholder="请输入水洗唛，最多300字符" :autosize="{ minRows: 1, maxRows: 3 }"
          type="textarea" :maxlength="300" clearable :disabled="disabledIf" class="common400" />
      </FormItem>
      <Form-item prop="washedLabelPdfPath">
        <div slot="label">
          <div>水洗唛文件：</div>
          <div>(PDF/JPG/PNG)</div>
        </div>
        <dytUpload v-show="false" ref="washedUploadRef" name="files" :show-upload-list="false"
          accept="application/pdf,image/jpg,image/jpeg,image/png"
          :before-upload="washedUploadBefore" :action="uploadFilesUrl" />
        <div class="washed-operate">
          <Poptip trigger="hover" placement="right-start" v-if="!$common.isEmpty(formValidate.washedLabelPdfPath)">
            <div class="washed-image-content">
              <img :src="pdfFirstImgPreview" @click="previewWashedPdf" />
              <Spin fix v-if="isWashedUploadLoading"></Spin>
            </div>
            <div class="washed-image-preview-content" slot="content">
              <img :src="pdfFirstImgPreview" @click="previewWashedPdf" />
            </div>
          </Poptip>
          <Button v-if="$common.isEmpty(formValidate.washedLabelPdfPath)" type="primary"
            @click="opentCheckFile('washedUploadRef')" :disabled="disabledIf"
            :loading="isWashedUploadLoading">点击上传</Button>
          <template v-if="!$common.isEmpty(formValidate.washedLabelPdfPath)">
            <span class="click-text-underline" @click="previewWashedPdf">预览</span>
            <span class="click-text-underline" @click="opentCheckFile('washedUploadRef')" v-if="!disabledIf">更换</span>
            <span class="click-text-underline" @click="removeWashedPdf" v-if="!disabledIf">删除</span>
          </template>
        </div>
      </Form-item>
      <Form-item label="水洗唛word文件:" prop="washedLabelWordPath">
        <uploadSampleFile style="width: 400px;" v-model="washedLabelWordFile" :disabled="disabledIf"
          accept-error-txt="文件格式不对，请上传格式为 docx、doc 的 word文档格式文件" :file-max-size="30" :upload-props="{
            multiple: false,
            'show-upload-list': false,
            accept: [
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ]
          }" />
      </Form-item>
      <FormItem label="SPU生产要求:" prop="outerPackageRequirement"
        :rules="{ validator: validateOutPack, trigger: 'change' }">
        <Input v-model="formValidate.outerPackageRequirement" placeholder="请输入SPU生产要求，最多200字符"
          :autosize="{ minRows: 1, maxRows: 3 }" type="textarea" clearable :disabled="disabledIf" class="common400" />
      </FormItem>
      <FormItem label="中文报关名称:" prop="decaleCname">
        <div class="flexCenter">
          <Input v-model="formValidate.decaleCname" placeholder="请输入" clearable :disabled="disabledIf"
            class="common400"></Input>
          <Button type="primary" size="small" style="margin-left:20px;" @click="getExport"
            v-if="!disabledIf">引用填入</Button>
        </div>
      </FormItem>
      <FormItem label="英文报关名称:" prop="decaleEname">
        <Input v-model="formValidate.decaleEname" placeholder="请输入" clearable :disabled="disabledIf"
          class="common400"></Input>
      </FormItem>
      <FormItem label="报关编码:" prop="decaleCode">
        <Input v-model="formValidate.decaleCode" placeholder="请输入" clearable :disabled="disabledIf"
          class="common400"></Input>
      </FormItem>
      <div class="form-line-flex">
        <FormItem label="EAN:">
          <Input v-model="formValidate.ean" placeholder="请输入" clearable :disabled="disabledIf" class="common236"></Input>
        </FormItem>
        <FormItem label="ISBN:">
          <Input v-model="formValidate.isbn" placeholder="请输入" clearable :disabled="disabledIf" class="common236"></Input>
        </FormItem>
      </div>
      <FormItem label="商品分类:" prop="productCategory">
        <span>{{ formValidate.productCategory || "-" }}</span>
      </FormItem>
      <FormItem label="品牌:">
        <dyt-select v-model="formValidate.brand" placeholder="请选择" filterable clearable :disabled="disabledIf"
          class="common400">
          <Option v-for="item in brandList" :value="item.productBrandId" :key="item.productBrandId">{{ item.name }}
          </Option>
        </dyt-select>
      </FormItem>
      <FormItem label="特性标签:">
        <dyt-select v-model="formValidate.featureLabel" placeholder="请选择" filterable clearable :disabled="deleteDisable()"
          multiple class="common400">
          <Option v-for="item in featureLabelList" :value="item.productTagId" :key="item.productTagId">{{ item.name }}
          </Option>
        </dyt-select>
      </FormItem>
      <FormItem label="商品状态:">
        <RadioGroup v-model="formValidate.commodityStatus">
          <Radio v-for="(item, index) in commodityStatusList" :key="index" :label="item.value" class="mr10"
            :disabled="disabledIf || (platformType != 'plate' && productData.productSource > 1)">{{ item.label }}</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="商品开发员:">
        <span v-for="item in purchaserArr" :key="item.userId">{{
          productData.createdBy === item.userId ? item.userName : ""
        }}</span>
      </FormItem>
      <FormItem label="产品类型:">
        <div class="form-line-flex">
          <Radio v-model="formValidate.normalGood" class="mr10" @on-change="normalGoodChange" :disabled="disabledIf">普货
          </Radio>
          <CheckboxGroup v-model="formValidate.productType" @on-change="otherGoodChange">
            <Checkbox :label="item.value" class="mr10" v-for="item in productTypeList" :key="item.value"
              :disabled="disabledIf">{{ item.label }}</Checkbox>
          </CheckboxGroup>
        </div>
      </FormItem>
      <FormItem label="多属性:" prop="attriblist">
        <Button type="primary" class="mb10" @click="attrChange('add')" size="small"
          v-if="formValidate.productCategory && platformType != 'plate'" :disabled="disabledIf">增加</Button>
        <div class="fmb0">
          <Table :columns="columns" :data="formValidate.attriblist" border highlight-row>
            <template slot-scope="{ index }" slot="picture">
              <div style="display: flex; align-items: center">
                <updateLargePicture :module-data.sync="formValidate.attriblist[index]" :disabled="picDisable()"
                  :product-data="productData" :module-data-length.sync="formValidate.attriblist.length"
                  :all-data.sync="formValidate.attriblist" :dialogObj='dialogObj' @getList='getList' />
              </div>
            </template>
            <template slot-scope="{ row, index }" slot="alibaba">
              <div class="productStyle" v-if="row.platformSkuId">
                <upload-img v-model="mateInfo.attrObj[row.platformSkuId].fileList" :options="{ accept: 'image/*' }"
                  :isDisabled="true" />
                <div class="attrSty" @click="singleMate(index)">
                  <div v-for="(item, index) in mateInfo.attrObj[row.platformSkuId].attrList" :index="index"
                    :key="`attr-${index}`" :style="{ marginTop: index > 0 ? '4px' : '0' }">
                    <span>{{ item }}</span>
                  </div>
                </div>
              </div>
              <div v-else>
                <a href="javascript:void(0);" style="text-decoration:underline;" @click="singleMate(index)"
                  v-if="!disabledIf">
                  匹配
                </a>
              </div>
            </template>
            <template slot-scope="{ index }" slot="action">
              <Button type="error" @click="attrChange('reduce', index)" size="small"
                :disabled="deleteDisable()">删除</Button>
            </template>
          </Table>
        </div>
      </FormItem>
    </Form>
    <edit-attr :modelVisible.sync="modelVisible" :attrList="attrList" :selectedList="formValidate.attriblist"
      @changeAttr="getAttr"></edit-attr>
    <!-- 1688商品匹配 -->
    <mateAlibabaProduct :modelVisible.sync="mateInfo.visible" :list="mateInfo.list" :columnsList="mateInfo.columnsList"
      @chooseData="chooseData" />
    <editDistribution :modelVisible.sync="distributionVisible" :distribution-info="distributionInfo"
      @distributionConfirm="distributionConfirm" />

  </div>
</template>

<script>
import api from "@/api/api.js";
import editAttr from './editAttr';
import regular from "@/utils/regular";
import UploadImg from '@/components/uploadImg';
import updateLargePicture from "@/components/updateLargePicture";
import mateAlibabaProduct from './mateAlibabaProduct';
import editDistribution from './editDistribution';
import uploadSampleFile from './uploadSampleFile';

export default {
  name: "basicData",
  components: {
    updateLargePicture,
    editAttr,
    UploadImg,
    mateAlibabaProduct,
    uploadSampleFile,
    editDistribution
  },
  props: {
    platformType: { type: String, default: '' },
    activeTab: { type: String, default: '' },
    gatherInformation: { type: Boolean, default: false },
    commodityInfoData: {
      type: Object,
      default() {
        return {
          pageStateCode: -1,
        };
      },
    },
    productData: {
      type: Object,
      default() {
        return {};
      },
    },
    purchaserArr: {
      type: Array,
      default() {
        return [];
      },
    },
    supplyList: {
      type: Array,
      default() {
        return [];
      },
    },
    operatList: {
      type: Array,
      default() {
        return [];
      },
    },
    // 基础资料
    basiclData: {
      type: Object,
      default() {
        return {};
      }
    },
    // 采集详情
    gatherDetail: {
      type: Object,
      default() {
        return {};
      }
    },
    isDisabled: { type: Boolean, default: false },
    dialogObj: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      pdfFirstImgPreview: '',
      isWashedUploadLoading: false,
      colTipsJson: {
        price: 'init',
        goodWeight: 'init',
        goodLength: 'init',
        goodWidth: 'init',
        goodHeight: 'init'
      },
      uploadFilesUrl: api.upload_files + '?basePath=/product', // 上传url
      washedLabelWordFile: {},
      formValidate: {
        cname: "",
        ename: "",
        decaleCname: "",
        decaleEname: "",
        decaleCode: "",
        ean: "",
        isbn: "",
        productCategory: "",
        brand: "",
        featureLabel: [],
        commodityStatus: 1,
        // buyer: '',
        normalGood: true,
        qualityRequire: [],
        attriblist: [],
        materialCnDesc: '',
        materialEnDesc: '',
        usageCnDesc: '',
        usageEnDesc: '',
        washedLabel: '',
        washedLabelPdfPath: '',
        washedLabelPdfName: '',
        outerPackageRequirement: '', // 生产要求
      },
      distributionVisible: false,
      distributionInfo: {},
      ruleValidate: {
        // materialCnDesc: [
        //   { required: true, message: "材质中文描述必填", trigger: "blur"},
        //   { required: true, message: "材质中文描述必填", trigger: "change"}
        // ],
        // materialEnDesc: [
        //   { required: true, message: "材质英文描述必填", trigger: "blur" },
        //   { required: true, message: "材质英文描述必填", trigger: "change" }
        // ],
        // usageCnDesc: [
        //   { required: true, message: "用途中文描述必填", trigger: "blur" },
        //   { required: true, message: "用途中文描述必填", trigger: "change" }
        // ],
        // usageEnDesc: [
        //   { required: true, message: "用途英文描述必填", trigger: "blur" },
        //   { required: true, message: "用途英文描述必填", trigger: "change" }
        // ],
        cname: [
          { required: true, message: "商品中文名称必填", trigger: "blur" },
        ],
        ename: [
          { required: true, message: "商品英文名称必填", trigger: "blur" },
        ],
        decaleCname: [
          { required: true, validator: this.hsNameMaxVerify, msg: '请输入中文报关名称', maxLength: 200, trigger: 'blur' }
        ],
        decaleEname: [
          { required: true, validator: this.enNameMaxVerify, msg: '请输入英文报关名称', maxLength: 200, trigger: 'blur' }
        ],
        decaleCode: [
          { required: true, validator: this.hsCodeVerify, msg: "请输入报关编码", minLength: 10, maxLength: 10, trigger: "blur" },
        ],
        productCategory: [
          { required: true, message: "商品分类不能为空", trigger: "blur" },
        ],
        // supplierNo: [{ required: true, message: "供方货号不能为空", trigger: "blur" },],
        price: [
          {
            required: true,
            pattern: regular.validateGreater,
            message: "请输入大于0的正数",
            trigger: "blur",
          },
        ],
        goodWeight: [
          { required: true, pattern: regular.validateGreater, message: "请输入大于0的正数", trigger: "blur" }
        ],
        goodLength: [
          { required: true, pattern: regular.validateGreater, message: "请输入大于0的正数", trigger: "blur" }
        ],
        goodWidth: [
          { required: true, pattern: regular.validateGreater, message: "请输入大于0的正数", trigger: "blur" }
        ],
        goodHeight: [
          { required: true, pattern: regular.validateGreater, message: "请输入大于0的正数", trigger: "blur" }
        ],
        attriblist: [
          {
            required: true,
            message: "多属性必填",
            trigger: "blur",
            type: "array",
          },
        ],
      },
      modelVisible: false,//添加属性的对话框
      attrList: [],//属性值
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
        { label: "纯电池", value: "02" },
        { label: "配套电池", value: "03" },
        { label: "液体", value: "04" },
        { label: "药品", value: "05" },
        { label: "粉末", value: "06" },
        { label: "危险品", value: "07" },
        { label: "内置电池", value: "08" },
        { label: "纽扣电池", value: "09" },
        { label: "带磁", value: "10" },
      ],
      commodityData: {},
      disabledIf: false,
      supplierIndex: null,
      tableArr: ['supplierNo', 'price', 'goodWeight', 'goodLength', 'goodWidth', 'goodHeight'],
      productDetail: {},//基础信息
      largeCargoData: {}, // 大货价格信息
      // mateVisible: false,
      mateInfo: {
        visible: false,
        list: [],
        columnsList: {},//属性表头
        productIndex: null,
        attrIndex: null,
        attrObj: {},
      },
    };
  },
  watch: {
    isDisabled: {
      immediate: true,
      deep: true,
      handler(val) {
        this.disabledIf = val;
      },
    },
    commodityInfoData: {
      immediate: true,
      deep: true,
      handler(val) {
        this.$nextTick(() => {
          this.washedLabelWordFile = {};
          if (!val || val.pageStateCode !== 0) return;
          this.getProductDetail().then((res) => {
            this.productDetail = res;
            this.productHandle(res);
            this.getDetail(this.$common.copy(val), res);
          })
          this.getTotalList();
          this.findGoodTypeName();
        })
      },
    },
    dialogObj: {
      immediate: true,
      deep: true,
      handler(val) {
        if (!(val && val.data)) return;
        if (this.platformType != 'plate' && val.data.productSource > 1) {
          // productSource大于1是云仓开发
          this.formValidate.commodityStatus = 2;
        }
      },
    },
    'formValidate.attriblist': {
      deep: true,
      handler(val) {
        if (!(Array.isArray(val) && val.length)) return;
        let platformSkuIdList = val.map(k => k.platformSkuId).filter(k => k);
        this.mateInfo.list.forEach((lk, li) => {
          // 属性带有skuid的，标记1688商品为匹配
          let isMate = !!platformSkuIdList.includes(lk.platformSkuId);
          this.$set(this.mateInfo.list[li], 'isMate', isMate);
        })
      },
    },
    // 采集信息变更
    gatherDetail: {
      deep: true,
      handler(val) {
        if (this.$common.isEmpty(val) || !this.gatherInformation || this.disabledIf || this.activeTab !== 'commodity') return;
        let sizeMatchJson = {};
        const gathGoodsInfo = val.alibabaGrapShippingInfo || {};
        let attriblist = this.$common.copy(this.formValidate.attriblist);
        let newTipsJson = this.$common.copy(this.colTipsJson);
        const colTipsKeys = Object.keys(newTipsJson);
        // 采集的尺码
        (val.groupByQuality || []).forEach(item => {
          sizeMatchJson[item.attributeValue] = {
            ...item,
            // 尺码
            sizeOrModelName: item.attributeValue,
            goodWeight: gathGoodsInfo.unitWeight,
            goodLength: gathGoodsInfo.length,
            goodWidth: gathGoodsInfo.width,
            goodHeight: gathGoodsInfo.height
          }
        });
        attriblist.forEach(row => {
          if (!this.$common.isEmpty(sizeMatchJson[row.sizeOrModelName])) {
            colTipsKeys.forEach(key => {
              if (!this.$common.isEmpty(sizeMatchJson[row.sizeOrModelName][key])) {
                row[key] = sizeMatchJson[row.sizeOrModelName][key];
                if (newTipsJson[key] == 'init') {
                  newTipsJson[key] = 'pass';
                }
              }
            })
          }
        });
        this.formValidate.attriblist = attriblist;
        this.colTipsJson = newTipsJson;
      }
    }
  },
  computed: {
    // 新品基础资料
    laPaProductInfo () {
      if (this.$common.isEmpty(this.basiclData) || this.$common.isEmpty(this.basiclData.laPaProductInfo)) return {}
      return this.basiclData.laPaProductInfo;
    },
    supplyJson() {
      let obj = {};
      this.supplyList.forEach(item => {
        obj[item.supplierId] = item;
      })
      return obj;
    },
    selectSupplier() {
      if (this.$common.isEmpty(this.supplyJson) || this.$common.isEmpty(this.productData.supplierId)) return {};
      if (this.$common.isEmpty(this.supplyJson[this.productData.supplierId])) return {};
      return this.supplyJson[this.productData.supplierId];
    },
    // 是否为 1688 供应商
    isAlBaba() {
      if (this.$common.isEmpty(this.selectSupplier)) return false;
      return [1, '1'].includes(this.selectSupplier.setupStatus);
    },
    columns() {
      let [arr, _self] = [[], this];
      let { aliProductInfoVO } = this.productDetail;
      if (!this.$common.isEmpty(aliProductInfoVO) || this.isAlBaba) {
        arr.push({
          width: 170,
          align: 'center',
          renderHeader: (h) => {
            return h('div', [
              h('span', '匹配1688商品'),
              h('a', {
                style: {
                  marginLeft: '10px',
                  textDecoration: 'underline',
                  display: _self.disabledIf ? 'none' : 'inline',
                },
                on: {
                  click() {
                    _self.bantchAll();
                  }
                }
              }, '一键匹配'),
            ])
          },
          slot: "alibaba",
        })
      }
      if (this.platformType != 'plate') {
        arr.push({
          width: 150,
          renderHeader: (h) => {
            return this.tableHead(h, { title: '供方货号', type: 'supplierNo' });
          },
          render: (h, params) => {
            return this.tableRender(h, params, { type: 'supplierNo' });
          }
        });
      }
      return [
        {
          type: "index",
          title: "序号",
          width: 70,
        },
        {
          title: "图片",
          slot: "picture",
          width: 100,
        },
        {
          title: "Size",
          key: "sizeOrModelName",
          minWidth: 90,
        },
        {
          title: "Color",
          key: "color",
          minWidth: 90,
        },
        ...arr,
        {
          width: 150,
          renderHeader: (h) => {
            return this.tableHead(h, { title: '价格', type: 'price' });
          },
          render: (h, params) => {
            return this.tableRender(h, params, { type: 'price' });
          }
        },
        {
          width: 150,
          renderHeader: (h) => {
            return this.tableHead(h, { title: '重量(g)', type: 'goodWeight' });
          },
          render: (h, params) => {
            return this.tableRender(h, params, { type: 'goodWeight' });
          }
        },
        {
          width: 160,
          renderHeader: (h) => {
            return this.tableHead(h, { title: '尺寸(长) cm', type: 'goodLength' });
          },
          render: (h, params) => {
            return this.tableRender(h, params, { type: 'goodLength' });
          }
        },
        {
          width: 160,
          renderHeader: (h) => {
            return this.tableHead(h, { title: '尺寸(宽) cm', type: 'goodWidth' });
          },
          render: (h, params) => {
            return this.tableRender(h, params, { type: 'goodWidth' });
          }
        },
        {
          width: 160,
          renderHeader: (h) => {
            return this.tableHead(h, { title: '尺寸(高) cm', type: 'goodHeight' });
          },
          render: (h, params) => {
            return this.tableRender(h, params, { type: 'goodHeight' });
          }
        },
        {
          width: 180,
          renderHeader: (h) => {
            return this.tableHead(h, { title: 'SKU生产要求', type: 'productionRequirement' });
          },
          render: (h, params) => {
            return this.tableRender(h, params, { type: 'productionRequirement' });
          }
        },
        {
          width: 160,
          renderHeader: (h) => {
            return this.tableHead(h, { title: '分销', type: ['distributionPriceValue', 'distributionPriceType'] });
          },
          render: (h, { row, index }) => {
            let text = '';
            if (this.$common.isEmpty(row.distributionPriceType) || this.$common.isEmpty(row.distributionPriceValue)) {
              text = `0${(this.$common.isEmpty(row.distributionPriceType) || row.distributionPriceType == 1) ? ' %' : ''}`;
            } else {
              const distributionPriceValue = Number(row.distributionPriceValue);
              const isMaxZeno = distributionPriceValue > 0;
              if (distributionPriceValue == 0) {
                text = `${distributionPriceValue} ${row.distributionPriceType == 1 ? '%' : ''}`;
              } else {
                text = `${isMaxZeno ? '+' : '-'} ${distributionPriceValue * (isMaxZeno ? 1 : -1)} ${row.distributionPriceType == 1 ? '%' : ''}`;
              }
            }
            let item = [h('div', {
              style: {
                'line-height': '20px'
              },
            }, text)];
            if (!this.disabledIf) {
              item.push(h('div', {
                style: {
                  'cursor': 'pointer',
                  'text-decoration': 'underline',
                  'color': '#2d8cf0',
                  'line-height': '20px'
                },
                on: {
                  'click': () => {
                    this.distributionInfo = {
                      index: index,
                      row: row
                    }
                    this.$nextTick(() => {
                      this.distributionVisible = true;
                    })
                  }
                }
              }, '修改'));
            }
            return h('div', item);
            // return this.tableRender(h, params, { type: 'distribution' });
          }
        },
        {
          title: '操作',
          slot: 'action',
          width: 80,
        },
      ]
    }
  },
  methods: {
    decaleCodeValidator(rule, value, callback) {
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
    bantchAll() {
      //匹配过的放进去，防止多个匹配
      let attrList = this.formValidate.attriblist.filter(k => k.platformSkuId).map(k => k.platformSkuId);
      // 根据多属性的属性值匹配1688的属性值（忽略大小写以及前后空格）,若多属性的属性值与1688商品的属性值一致，则匹配成功
      this.formValidate.attriblist.forEach(attr => {
        let obj = null;
        this.mateInfo.list.forEach(lk => {
          let attrValute = lk.attrList.map(vk => {
            let str = vk ? vk.split(':')[1] : '';
            return str ? str.trim() : str;
          }).filter(fk => !this.$common.isEmpty(fk));
          if (attrList.includes(lk.platformSkuId) || obj) return;
          let color = attr.color ? attr.color.trim() : '';
          let sizeOrModelName = attr.sizeOrModelName ? attr.sizeOrModelName.trim() : '';
          // 判断所有属性是否1688的属性一致
          let flag = attrValute.includes(color) && attrValute.includes(sizeOrModelName);
          if (!flag) return;
          obj = {
            platformSkuId: lk.platformSkuId,
            platformSpuId: lk.platformSpuId,
          }
        })
        if (!obj) return;
        attr.platformSkuId = obj.platformSkuId;
        attr.platformSpuId = obj.platformSpuId;
        attrList.push(obj.platformSkuId);
      })
    },
    // 详情处理 
    getDetail(datas, productDetail) {
      this.largeCargoData = {};
      this.$common.promiseAll([this.getLargeCargoPrice]).finally(() => {
        this.commodityData = datas;
        // 基础资料的尺码价格信息
        let laPaProductSizeRelList = productDetail.laPaProductSizeRelList || [];
        let laPaProductGoodsInfo = datas.laPaProductGoodsInfo || {};
        let laPaProductVariQuotationList = (datas.laPaProductVariQuotationList || []).map(row => {
          if (this.platformType != 'plate' || this.$common.isEmpty(this.largeCargoData[row.colorId])) return row;
          const totalAmount = this.largeCargoData[row.colorId].totalAmount;
          return {
            ...row,
            price: this.$common.isEmpty(totalAmount) ? null : totalAmount
          }
        });
        let laPaProductQualityInspectionList = datas.laPaProductQualityInspectionList || [];
        const includeKey = ['materialCnDesc', 'materialEnDesc', 'usageCnDesc', 'usageEnDesc'];
        includeKey.forEach(key => {
          this.$set(this.formValidate, key, laPaProductGoodsInfo[key] || '');
        });
        //  多属性
        this.formValidate.attriblist = laPaProductVariQuotationList.filter(item => {
          laPaProductSizeRelList.forEach(sizeItem => {
            if (item.sizeId) {
              // 服装
              if (item.sizeId == sizeItem.sizeId && !(item.price || item.price === 0)) item.price = sizeItem.price;
            } else {
              // 家居 (不存在sizeId)
              if (item.sizeOrModelName == sizeItem.modelName && !(item.price || item.price === 0)) item.price = sizeItem.price;
            }
          })
          return item.choiceStatus === 0;
        })
        this.formValidate.attriblist.forEach((item, index) => {
          if (item.supplierNo == null) item.supplierNo = this.dialogObj.data.supplierNo;
          this.tableArr.forEach(arrItem => {
            this.$set(this.formValidate.attriblist[index], 'show' + arrItem, false);//显示下拉
            this.$set(this.formValidate.attriblist[index], 'drop' + arrItem, false);
          })
        })
        this.attrList = JSON.parse(JSON.stringify(laPaProductVariQuotationList));
        // 检测项目
        this.formValidate.qualityRequire = laPaProductQualityInspectionList;
        if (!laPaProductQualityInspectionList.length) this.qualitychange("add");
        // 需求要求 styleName 和 laPaProductGoodsInfo 必须相同
        if (!this.$common.isEmpty(this.laPaProductInfo.styleName)) {
          if (this.$common.isEmpty(datas.laPaProductGoodsInfo) || this.$common.isEmpty(datas.laPaProductGoodsInfo.goodsCnName)) {
            // this.formValidate.cname = laPaProductGoodsInfo.goodsCnName;
            this.formValidate.cname = this.laPaProductInfo.styleName;
          }
        }
        if (!datas.laPaProductGoodsInfo && this.productData.status <= 3) return;
        // 基本信息
        this.formValidate.brand = laPaProductGoodsInfo.brandId;
        this.formValidate.decaleCname = laPaProductGoodsInfo.declareCnName;
        this.formValidate.decaleCode = laPaProductGoodsInfo.declareCode;
        this.formValidate.decaleEname = laPaProductGoodsInfo.declareEnName;
        this.formValidate.featureLabel = laPaProductGoodsInfo.featureTags ? laPaProductGoodsInfo.featureTags.split(",") : [];
        if (this.$common.isEmpty(this.formValidate.cname)) {
          this.formValidate.cname = laPaProductGoodsInfo.goodsCnName;
        }
        this.formValidate.ename = laPaProductGoodsInfo.goodsEnName;
        this.formValidate.ean = laPaProductGoodsInfo.productEan;
        this.formValidate.isbn = laPaProductGoodsInfo.productIsbn;
        this.formValidate.washedLabel = laPaProductGoodsInfo.washedLabel;
        this.formValidate.outerPackageRequirement = laPaProductGoodsInfo.outerPackageRequirement;
        this.formValidate.washedLabelPdfPath = laPaProductGoodsInfo.washedLabelPdfPath;
        this.formValidate.washedLabelPdfName = laPaProductGoodsInfo.washedLabelPdfName;
        this.formValidate.washedLabelWordPath = laPaProductGoodsInfo.washedLabelWordPath;
        this.formValidate.washedLabelWordName = laPaProductGoodsInfo.washedLabelWordName;
        if (!this.$common.isEmpty(laPaProductGoodsInfo.washedLabelWordPath)) {
          this.washedLabelWordFile = {
            fileUrl: laPaProductGoodsInfo.washedLabelWordPath,
            fileName: laPaProductGoodsInfo.washedLabelWordName
          }
        }
        const url = laPaProductGoodsInfo.washedLabelPdfPath;
        if (!this.$common.isEmpty(url)) {
          this.isWashedUploadLoading = true;
          const suffix = url.substring(url.lastIndexOf('.'), url.length);
          if (suffix.toLocaleLowerCase() == '.pdf') {
            this.$common.getPdfRes({
              pdfUrl: `./filenode/s${url}`,
              pageNumber: 1,
              scale: 10
            }).then(img => {
              this.pdfFirstImgPreview = img;
            }).finally(() => {
              this.isWashedUploadLoading = false;
            })
          } else {
            this.pdfFirstImgPreview = `./filenode/s${url}`;
            this.isWashedUploadLoading = false;
          }
        }
        // this.formValidate.buyer = laPaProductGoodsInfo.purchaseUser;
        if (this.platformType != 'plate') {
          if (this.productData.productSource > 1) {
            this.formValidate.commodityStatus = 2;//云仓只能是试卖状态
          } else {
            this.formValidate.commodityStatus = laPaProductGoodsInfo.saleStatus || 1;
          }
        }

        let tableTc = laPaProductGoodsInfo.productGoodsAcceptableTc; //产品类型
        if (tableTc === "01") {
          this.formValidate.normalGood = true;
          this.formValidate.productType = [];
        } else {
          this.formValidate.normalGood = false;
          this.formValidate.productType = tableTc ? tableTc.split(",") : [];
        }
      })
    },
    // 获取大货价格
    getLargeCargoPrice() {
      return new Promise((resolve) => {
        if (this.platformType != 'plate') return resolve([]);
        this.axios.get(`${api.queryPrice}?productId=${this.productData.productId}`).then((data) => {
          if (data && data.datas) {
            let obj = {};
            const transferKey = ['materialCost', 'processingCost', 'processingRatio', 'totalAmount'];
            (data.datas || []).forEach(item => {
              obj = {};
              Object.keys(item).forEach(key => {
                if (transferKey.includes(key)) {
                  obj[key] = this.$common.isEmpty(Number(item[key])) ? '0.00' : Number(item[key]).toFixed(2);
                } else {
                  obj[key] = item[key];
                }
              })
              this.$set(this.largeCargoData, item.colorId, obj);
            })
            return resolve(Object.values(this.largeCargoData));
          }
          resolve([]);
        }).catch((err) => {
          console.error(err);
          resolve([]);
        })
      })
    },
    // 检验部分字段
    validateField(optionKkey) {
      const keys = this.$common.isEmpty(optionKkey) ? ['decaleCode'] : optionKkey;
      if (this.$common.isArray(keys)) {
        keys.forEach((key) => {
          this.$refs["formValidate"].validateField(key);
        })
      } else if (typeof keys === 'string') {
        this.$refs["formValidate"].validateField(keys);
      }
    },
    distributionConfirm(option) {
      this.$set(this.formValidate.attriblist[option.index], 'distributionPriceType', option.distributionPriceType);
      this.$set(this.formValidate.attriblist[option.index], 'distributionPriceValue', option.distributionPriceValue);
    },
    productHandle(data) {
      let aliProductInfoVO = data.aliProductInfoVO || {};
      let list = aliProductInfoVO.addAliProductDetailVOList || [];
      let columnsList = {};//拿到所有属性表头
      let attrObj = {};
      let attrList = list.map(k => {
        let attrList = k.attribute ? k.attribute.split(',') : [];
        attrList.forEach(attrK => {
          if (!attrK) return;
          let sAttrList = attrK.split(':');
          if (!sAttrList.length) return;
          columnsList[sAttrList[0]] = 'attr' + sAttrList[0];
          k['attr' + sAttrList[0]] = sAttrList[1];
        })
        k.attrList = attrList;
        k.isMate = false;//是否匹配
        k.platformSpuId = aliProductInfoVO.platformSpuId;
        k.fileList = ((k.imageUrl || aliProductInfoVO.imageUrl || '').split(',')).map(file => {
          return { url: file }
        });
        attrObj[k.platformSkuId] = k;
        return k;
      })
      this.mateInfo.list = attrList;
      this.mateInfo.columnsList = columnsList;
      this.mateInfo.attrObj = attrObj;
      // console.log(attrObj, 11)
      // console.log(columnsList, 'columnsList', this.mateInfo.list)
    },
    // 验证外包装
    validateOutPack(rule, value, callback) {
      if (this.disabledIf) return callback();
      if (!this.$common.isEmpty(value) && value.trim().length > 200) {
        return callback(new Error('输入字符超出规定，最多200字符'));
      }
      return callback();
    },
    // 验证表单
    validate() {
      return new Promise((resolve) => {
        this.$refs["formValidate"].validate((valid) => {
          if (!valid) return resolve(false);
          let validateObj = {
            price: [],
            goodWeight: [],
            goodLength: [],
            goodWidth: [],
            goodHeight: []
          }
          let alBabaValid = true;
          const validateKeys = Object.keys(validateObj);
          this.formValidate.attriblist.forEach((row, index) => {
            // 采购链接不为空时，则”匹配1688商品“变更为必填项
            if (this.laPaProductInfo.goodLink && this.$common.isEmpty(row.platformSkuId) && this.isAlBaba) {
              alBabaValid = false;
            }
            Object.keys(row).forEach(key => {
              if (validateKeys.includes(key) && row[key] <= 0) {
                validateObj[key].push(index);
              }
            })
          });
          const newKeys = validateKeys.find(key => {
            return validateObj[key].length > 0
          })
          if (!alBabaValid) {
            this.$Message.error('存在1688商品未匹配，请在多属性列表中匹配1688商品');
            return resolve(false);
          }
          if (newKeys) {
            const newDemo = document.querySelector(`.ref${validateObj[newKeys][0]}${newKeys}`);
            this.$nextTick(() => {
              this.$Message.error('多属性列表中价格，重量，尺寸需大于 0 并且最多2位小数的数字');
              newDemo && newDemo.querySelector('input').focus();
            })
            return resolve(false);
          }
          return resolve(this.getFormData(false));
        });
      });
    },
    // 验证部分字段
    formValidateField(str) {
      return new Promise((resolve) => {
        if (this.$common.isEmpty(str)) return resolve(true);
        if (this.$common.isString(str)) {
          this.$refs["formValidate"].validateField(str, (valid) => {
            resolve(this.$common.isEmpty(valid));
          })
          return;
        }
        if (this.$common.isArray(str)) {
          this.$common.promiseAll(str.map(key => {
            return () => {
              return new Promise((resolve) => {
                this.$refs["formValidate"].validateField(key, (valid) => {
                  resolve(this.$common.isEmpty(valid));
                })
              })
            }
          })).then((resList) => {
            const isPass = this.$common.arrRemoveRepeat(resList);
            if (isPass.length > 1) return resolve(false);
            resolve(isPass[0]);
          })
        }
      })
    },
    // 处理表单数据
    getFormData(isValid = true) {
      return new Promise((resolve) => {
        this.formValidateField(['outerPackageRequirement']).then((valid) => {
          if (isValid && !valid) {
            this.$Message.error('验证不通过');
            return resolve(valid);
          }
          let data = this.formValidate;
          let commodityData = this.commodityData;
          let [
            temp,
            laPaProductGoodsInfo,
            qualityInspectionList,
            variQuotationQOList,
          ] = [{}, {}, [], []];
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
          laPaProductGoodsInfo.productGoodsAcceptableTc = data.normalGood
            ? "01"
            : data.productType.toString();
          laPaProductGoodsInfo.productId = this.productData.productId;
          laPaProductGoodsInfo.productIsbn = data.isbn;
          // laPaProductGoodsInfo.purchaseUser = data.buyer;
          laPaProductGoodsInfo.saleStatus = data.commodityStatus;
          laPaProductGoodsInfo.supplierId = commodityData.supplierId;
          laPaProductGoodsInfo.washedLabel = data.washedLabel;
          laPaProductGoodsInfo.outerPackageRequirement = data.outerPackageRequirement;
          laPaProductGoodsInfo.washedLabelPdfPath = data.washedLabelPdfPath;
          laPaProductGoodsInfo.washedLabelPdfName = data.washedLabelPdfName;
          if (!this.$common.isEmpty(this.washedLabelWordFile)) {
            laPaProductGoodsInfo.washedLabelWordPath = this.washedLabelWordFile.fileUrl;
            laPaProductGoodsInfo.washedLabelWordName = this.washedLabelWordFile.fileName;
          }

          // 属性
          variQuotationQOList = data.attriblist.map((k) => {
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
              supplierNo: k.supplierNo,
              platformSkuId: k.platformSkuId,
              platformSpuId: k.platformSpuId,
              productionRequirement: k.productionRequirement,
              distributionPriceType: k.distributionPriceType,
              distributionPriceValue: k.distributionPriceValue,

            };
          });
          // 检测项目
          if (
            data.qualityRequire.length &&
            (data.qualityRequire[0].project || data.qualityRequire[0].requirement)
          ) {
            qualityInspectionList = data.qualityRequire.map((k) => {
              return {
                productId: this.productData.productId,
                project: k.project,
                requirement: k.requirement,
              };
            });
          }

          // 检测项目
          if (data.qualityRequire.length && (data.qualityRequire[0].project || data.qualityRequire[0].requirement)) {
            qualityInspectionList = data.qualityRequire.map(k => {
              return {
                productId: this.productData.productId,
                project: k.project,
                requirement: k.requirement,
              };
            });
          }
          temp.laPaProductGoodsInfo = laPaProductGoodsInfo;
          temp.variQuotationQOList = variQuotationQOList;
          temp.qualityInspectionList = qualityInspectionList;
          temp.goodTypeId = this.productData.goodTypeId || '';
          const includeKey = ['materialCnDesc', 'materialEnDesc', 'usageCnDesc', 'usageEnDesc'];
          includeKey.forEach(key => {
            this.$set(temp.laPaProductGoodsInfo, key, data[key])
          });
          resolve(temp);
        })
      })
    },
    // 增加尺码/型号
    attrChange(type, index) {
      if (type === 'add') this.modelVisible = true;
      if (type === 'reduce') this.formValidate.attriblist.splice(index, 1);
      if (this.dialogObj.btnoperat == 'verifyPic' || this.dialogObj.btnoperat == 'verifyData') {
        return false
      }
    },
    // 勾选相同
    sameChange(e, type) {
      const val = this.formValidate.attriblist[0][type];
      if (!(e && val)) return;
      this.formValidate.attriblist.forEach((k, i) => {
        this.formValidate.attriblist[i][type] = val;
      });
    },
    // 增加质检要求
    qualitychange(type, index) {
      if (type === "add")
        this.formValidate.qualityRequire.push({ project: "", requirement: "" });
      if (type === "reduce") this.formValidate.qualityRequire.splice(index, 1);
    },
    // 普货
    normalGoodChange(e) {
      if (e) this.formValidate.productType = [];
    },
    // 除了普货
    otherGoodChange(e) {
      this.formValidate.normalGood = e.length ? false : true;
    },
    // 获取特性标签/品牌列表
    getTotalList() {
      this.$axios.get(api.productTagqueryAll).then(({ code, datas }) => {
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
          let arr = list.filter((k) => {
            return k.status === 1;
          });
          this.brandList = arr;
        });
    },
    // 根据商品分类id找到对应的分类名称
    findGoodTypeName() {
      let { goodTypeId } = this.productData;
      this.operatList.forEach((k) => {
        if (k.productCategoryId === goodTypeId) {
          this.formValidate.productCategory = k.productCategoryNavigation;
        }
      });
    },
    //导出引入
    getExport() {
      this.axios.get(api.productCategoryqueryAll).then(res => {
        let data = res.datas
        data.forEach(item => {
          if (item.productCategoryNavigation == this.formValidate.productCategory) {
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
    getAttr(data) {
      data.forEach((resa, index) => {
        this.formValidate.attriblist.forEach(resb => {
          if (resa.quotationId == resb.quotationId) {
            data[index] = resb;
          }
        })
      })
      this.formValidate.attriblist = data.map((item, index) => {
        this.tableArr.forEach(arrItem => {
          this.$set(item, 'show' + arrItem, false);//显示下拉
          this.$set(item, 'drop' + arrItem, false);
        })
        return item;
      });
    },
    // 选中文件
    opentCheckFile(refStr) {
      if (this.disabledIf) return;
      if (!this.$refs[refStr] || !this.$refs[refStr].$el) return;
      const demo = this.$refs[refStr].$el.querySelector('.ivu-upload-select');
      if (!demo) return;
      demo.click();
    },
    // 水洗唛PDF文件上传
    washedUploadBefore(file) {
      if (this.isWashedUploadLoading || this.isDisabled) return false;
      if (['application/pdf', 'image/jpg', 'image/png', 'image/jpeg'].includes(file.type)) {
        this.isWashedUploadLoading = true;
        let newForm = new FormData(); // 创建form对象
        newForm.append('files', file);
        const uploadUrl = `${this.uploadFilesUrl}&random=${(Math.random()).toString().substring(2, 5) + (new Date().getTime()).toString()}`;
        this.axios.post(uploadUrl, newForm).then(res => {
          if (!res || res.code != 0) return;
          this.$set(this.formValidate, 'washedLabelPdfPath', res.datas[0]);
          this.$set(this.formValidate, 'washedLabelPdfName', file.name);
          if (['application/pdf'].includes(file.type)) {
            this.$common.getPdfRes({
              pdfUrl: `./filenode/s${res.datas[0]}`,
              pageNumber: 1,
              scale: 10
            }).then(img => {
              this.pdfFirstImgPreview = img;
            }).finally(() => {
              this.isWashedUploadLoading = false;
            })
          } else {
            this.pdfFirstImgPreview = `./filenode/s${res.datas[0]}`;
            this.isWashedUploadLoading = false;
          }
        }).catch(() => {
          this.isWashedUploadLoading = false;
        })
        return false;
      }
      this.$Message.error('文件格式不对，请上传 PDF 文件或 PNG、JPG 类型的图片');
      return false;
    },
    // 移除水洗唛PDF文件
    removeWashedPdf() {
      this.$set(this.formValidate, 'washedLabelPdfPath', null);
      this.$set(this.formValidate, 'washedLabelPdfName', null);
    },
    // 水洗唛PDF文件预览
    previewWashedPdf() {
      if (this.$common.isEmpty(this.formValidate.washedLabelPdfPath)) return;
      const url = this.formValidate.washedLabelPdfPath;
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
    // 验证报关中文
    hsNameMaxVerify(rule, value, callback) {
      const newVal = this.$common.isEmpty(value) ? '' : value.trim();
      const regex = this.$regular.MatchChinese;
      if (!this.$common.isEmpty(newVal) && !regex.test(newVal)) {
        return callback(new Error('只允许填中文'));
      }
      this.$common.strMaxVerify(rule, value, callback);
    },
    // 验证报关英文
    enNameMaxVerify(rule, value, callback) {
      const newVal = this.$common.isEmpty(value) ? '' : value.trim();
      // eslint-disable-next-line no-useless-escape
      const regex = /^(?!_)([A-Za-z ~!@#$%^*()_+\/*\-,.;'\[\]<>?\\:"{}，。、；‘’【】《》？：“”\|`·——]+)$/;
      if (!this.$common.isEmpty(newVal) && this.$common.isEmpty(newVal.match(regex))) {
        return callback(new Error('只允许填英文+空格+除&以外的符号'));
      }
      this.$common.strMaxVerify(rule, value, callback);
    },
    hsCodeVerify(rule, value, callback) {
      const newVal = this.$common.isEmpty(value) ? '' : value.trim();
      const regex = this.$regular.AllNumber;
      if (!this.$common.isEmpty(newVal) && !regex.test(newVal)) {
        return callback(new Error('请输入数字'));
      }
      this.$common.strMaxVerify(rule, value, callback);
    },
    //多属性图片的展示分开来
    picDisable() {
      if (this.dialogObj.btnoperat == 'verifyPic' || this.dialogObj.btnoperat == 'finishPic' || this.dialogObj.btnoperat == 'finishData') {
        return false
      }
      return this.disabledIf
    },
    //删除按钮的权限
    deleteDisable() {
      if (this.dialogObj.btnoperat == 'finishPic' || this.dialogObj.btnoperat == 'finishData') {
        return false
      }
      return this.disabledIf
    },
    getList() {
      this.$axios.get(api.queryLaPaProductGoodsInfo, {
        params: { productId: this.productData.productId }
      }).then(({ code, datas }) => {
        if (code !== 0) return;
        this.formValidate.attriblist = []
        datas.laPaProductVariQuotationList.forEach(item => {
          if (item.choiceStatus == 0) this.formValidate.attriblist.push(item)
        })
        this.formValidate.attriblist.forEach((item, index) => {
          this.tableArr.forEach(arrItem => {
            this.$set(this.formValidate.attriblist[index], 'show' + arrItem, false);//显示下拉
            this.$set(this.formValidate.attriblist[index], 'drop' + arrItem, false);
          })
        });
      })
    },
    // 获取新品基础详情
    getProductDetail() {
      return new Promise((resolve) => {
        resolve(this.basiclData || {});
      })
    },
    // 表头相同勾选
    tableHead(h, data) {
      let headItem = [];
      if (this.$common.isString(data.type)) {
        const tips = this.colTipsJson[data.type];
        if (!this.$common.isEmpty(tips) && ['fail', 'pass'].includes(tips)) {
          headItem.push(h('Tooltip', {
            props: {
              placement: 'bottom',
              transfer: true
            }
          }, [
            h('div', {
              slot: 'content'
            }, tips == 'fail' ? '1688信息匹配异常' : '1688信息匹配成功'),
            h("Icon", {
              props: {
                type: tips == 'fail' ? 'md-alert' : 'md-checkmark-circle'
              },
              style: {
                padding: '0 5px 0 0',
                color: tips == 'fail' ? '#f30' : '#2d8cf0',
                'font-size': '18px'
              }
            })
          ], ''));
        }
      }
      headItem.push(h("span", { attributes: { t: '123' } }, data.title));
      headItem.push(h("Checkbox", {
        props: {
          disabled: !this.formValidate.attriblist.length || this.disabledIf,
        },
        style: { marginLeft: "10px" },
        on: {
          "on-change": (event) => {
            if (this.$common.isArray(data.type)) {
              data.type.forEach(key => {
                this.sameChange(event, key);
              })
              return;
            }
            this.sameChange(event, data.type);
          },
        },
      }, "相同"));
      return h("div", {
        style: {
          display: "flex",
          flexAligns: "center",
          'align-items': 'center'
        },
      }, headItem);
    },
    // 表格内容渲染
    tableRender(h, params, data) {
      let { type } = data;//type 类型 
      let { index, row } = params;
      let refsName = 'ref' + index + type;
      return h('FormItem', {
        props: {
          prop: `attriblist.${index}.${type}`,
          labelWidth: 0,
          rules: this.ruleValidate[type],
        },
        style: {
          position: 'relative'
        },
      }, [
        h('Input', {
          style: {
            width: '100%',
          },
          class: `table-input ${refsName}`,
          props: {
            placeholder: '请输入',
            disabled: this.disabledIf,
            value: row[type],
          },
          on: {
            input: (val) => {
              this.$set(this.formValidate.attriblist[index], type, val);
            },
            'on-focus': (val) => {
              this.supplierNoIndex(index, type);
            },
            'on-blur': (val) => {
              this.suppllierBlur(index, type);
            },
          }
        }),
        h('div', {
          style: {
            position: 'absolute',
            top: '50%',
            right: '0px',
            transform: 'translateY(-50%)',
            zIndex: 1000,
            width: '32px',
            textAlign: 'center',
            display: row['show' + type] ? 'block' : 'none',
          },
          on: {
            'mousedown': (e) => { // 鼠标按住不放，设置drop值为true 不让图标消失
              this.$set(this.formValidate.attriblist[index], 'drop' + type, true);
            },
            'mouseup': (e) => {  // 鼠标弹起不放，设置drop值为true 不让图标消失
              this.$set(this.formValidate.attriblist[index], 'drop' + type, true);
            },
          }
        }, [
          h('Dropdown', {
            props: {
              transfer: true,
              trigger: 'click',
            },
            on: {
              'on-visible-change': (val) => {
                this.supplierNoChange(val, type);
              },
              'on-click': (val) => {
                this.supplierNoClick(val, type);
              },
            }
          }, [
            h('a', {
              props: {
                href: 'javascript:void(0)',
              },
            }, [
              h('Icon', {
                props: {
                  type: 'md-funnel'
                }
              })
            ]),
            h('DropdownMenu', {
              slot: 'list',
            }, [
              h('DropdownItem', {
                props: {
                  name: 'all-' + index
                },
              }, '应用到所有'),
              h('DropdownItem', {
                props: {
                  name: 'color-' + index
                },
              }, [
                h('span', '应用到'),
                h('span', {
                  style: {
                    color: '#2d8cf0',
                    marginLeft: '4px'
                  }
                }, 'Color')
              ]),
              h('DropdownItem', {
                props: {
                  name: 'size-' + index
                },
              }, [
                h('span', '应用到'),
                h('span', {
                  style: {
                    color: '#2d8cf0',
                    marginLeft: '4px'
                  }
                }, 'Size')
              ]),
            ]),
          ])
        ])
      ])
    },
    // 供方货号聚焦
    supplierNoIndex(index, type) {
      this.formValidate.attriblist.forEach((item, attrIndex) => {
        this.$set(this.formValidate.attriblist[attrIndex], 'drop' + type, false);
        this.$set(this.formValidate.attriblist[attrIndex], 'show' + type, attrIndex === index ? true : false);
      })
      this.supplierIndex = index;
    },
    // 供方货号失焦
    suppllierBlur(index, type) {
      if (this.formValidate.attriblist[index]['drop' + type]) return;
      this.$set(this.formValidate.attriblist[index], 'show' + type, false);
    },
    // 供方货号打开/关闭
    supplierNoChange(val, type) {
      let supplierIndex = this.supplierIndex;
      this.$set(this.formValidate.attriblist[supplierIndex], 'show' + type, !!val);
      this.$set(this.formValidate.attriblist[supplierIndex], 'drop' + type, !!val);

      // 供方货号关闭，聚焦放回输入框
      if (val) return;
      let refsName = 'ref' + supplierIndex + type;
      let dom = document.querySelector('.' + refsName);
      if (!dom) return;
      dom.querySelector('input').focus();
      // 重新聚焦
      this.supplierNoIndex(supplierIndex, type)
    },
    // 供方货号选择(1:应用到所有；2：应用到color)
    supplierNoClick(e, type) {
      if (!e) return;
      let arr = e.split('-');
      const [status, index, attriblist] = [arr[0], arr[1], this.formValidate.attriblist];
      let data = attriblist[index] || {};
      attriblist.forEach((item, index) => {
        let judgeStag = {
          'all': true,//所有
          'color': data.color === item.color,//颜色
          'size': data.sizeOrModelName === item.sizeOrModelName,//尺寸
        }
        if (judgeStag[status]) this.$set(this.formValidate.attriblist[index], type, data[type]);
      })
    },
    // 单个匹配
    singleMate(index) {
      if (this.disabledIf) return;
      this.mateInfo.visible = true;
      this.mateInfo.productIndex = index;
    },
    // 匹配返回
    chooseData(index) {
      let mateInfo = this.mateInfo;
      let attrInfo = mateInfo.list[index];
      this.mateInfo.list[index].isMate = true;

      // 利用对象引用
      let attriblist = this.formValidate.attriblist;
      // 每个1688商品仅可匹配一条多属性。若多条多属性匹配同一个1688商品，则以最后一次匹配为准，之前的多属性匹配的1688商品信息清空
      attriblist.forEach((k, i) => {
        if (k.platformSkuId === attrInfo.platformSkuId) {
          k.platformSkuId = null;
          k.platformSpuId = null;
        }
      })
      attriblist[mateInfo.productIndex].platformSkuId = attrInfo.platformSkuId;
      attriblist[mateInfo.productIndex].platformSpuId = attrInfo.platformSpuId;
    }
  },
};
</script>
<style lang="less" scoped>
.click-text-underline {
  display: inline-block;
  position: relative;
  padding: 0px 5px;
  cursor: pointer;
  color: #57a3f3;
  text-decoration: underline;
  text-underline-offset: 3px;

  &.click-text-disabled {
    color: #f3f3f3;
    cursor: no-drop;
  }
}

.washed-operate {
  display: flex;

  >button {
    margin-left: 15px;
  }

  .washed-image-content {
    position: relative;
    width: 60px;
    height: 60px;
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
      min-width: 200px;
    }
  }
}
</style>
<style lang="less">
.commodityInformationPage {
  .form-contain .common400 {
    width: 600px;
  }

  .form-contain .common236 {
    width: 235px;
  }

  :deep(.table-input) {
    .ivu-input {
      padding-right: 30px;
    }
  }

  .productStyle {
    padding: 2px 0;
    display: flex;
    justify-content: space-between;

    .attrSty {
      flex: 1;
      overflow: hidden;
      white-space: pre-wrap;
      line-height: 16px;
      text-align: left;
      cursor: pointer;
    }

    .demo-upload-list {
      width: 50px;
      height: 50px;
    }
  }
}
</style>