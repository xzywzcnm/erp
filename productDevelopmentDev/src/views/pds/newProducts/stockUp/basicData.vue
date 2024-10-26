<template>
  <div class="form-contain form-contain-disabled">
    <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="100">
      <!-- <FormItem label="引用款号或SPU:" class="quote-sty">
        <dyt-select v-model="quoteType" style="width:100px" :disabled="canedit">
          <Option v-for="item in quoteList" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </dyt-select> 
        <Input v-model="formValidate.quote" placeholder="请输入" clearable style="width:300px" class="mr10" :disabled="canedit"></Input>
        <Button type="primary" size="small" v-if="!canedit">引用</Button>
      </FormItem> -->

      <FormItem prop="styleName">
        <div slot="label" class="custom-label">
          <Tooltip class="label-icon" v-if="matchingInfo.styleName.status != 'init'" placement="right-start">
            <span>
              <Icon v-if="matchingInfo.styleName.status == 'pass'" type="md-checkmark-circle" />
              <Icon v-else type="md-alert" />
            </span>
            <div slot="content">
              {{ `1688信息匹配${matchingInfo.styleName.status == 'pass' ? '成功' : '异常'}` }}
            </div>
          </Tooltip>
          款式名称:
        </div>
        <Input v-model="formValidate.styleName" placeholder="款式名称描述不作为正式商品名" clearable :disabled="canedit"
          style="width:400px"></Input>
      </FormItem>
      <div class="form-line-flex" style="flex-flow: wrap;">
        <FormItem label="是否有库存:" prop="stock">
          <RadioGroup v-model="formValidate.stock" style="width: 80px;">
            <Radio :label="0" :disabled="canedit">有</Radio>
            <Radio :label="1" :disabled="canedit">无</Radio>
          </RadioGroup>
        </FormItem>
        <!-- <template v-if="formValidate.stock===1"> -->
        <FormItem prop="deliveryDate" :label-width="100">
          <div slot="label" class="custom-label">
            <Tooltip class="label-icon" v-if="matchingInfo.deliveryDate.status != 'init'" placement="right-start">
              <span>
                <Icon v-if="matchingInfo.deliveryDate.status == 'pass'" type="md-checkmark-circle" />
                <Icon v-else type="md-alert" />
              </span>
              <div slot="content">
                {{ `1688信息匹配${matchingInfo.deliveryDate.status == 'pass' ? '成功' : '异常'}` }}
              </div>
            </Tooltip>
            货期(天):
          </div>
          <Input v-model.number="formValidate.deliveryDate" placeholder="请输入" type="number" :disabled="canedit"></Input>
        </FormItem>
        <FormItem prop="minquantity" :label-width="100">
          <div slot="label" class="custom-label">
            <Tooltip class="label-icon" v-if="matchingInfo.minquantity.status != 'init'" placement="right-start">
              <span>
                <Icon v-if="matchingInfo.minquantity.status == 'pass'" type="md-checkmark-circle" />
                <Icon v-else type="md-alert" />
              </span>
              <div slot="content">
                {{ `1688信息匹配${matchingInfo.minquantity.status == 'pass' ? '成功' : '异常'}` }}
              </div>
            </Tooltip>
            起订量:
          </div>
          <Input v-model.number="formValidate.minquantity" placeholder="请输入" type="number" :disabled="canedit"></Input>
        </FormItem>
        <FormItem label="倍数备货值:" prop="stockMultiple">
          <dytInput v-model.trim="formValidate.stockMultiple" number placeholder="请输入倍数备货值" :disabled="canedit" />
        </FormItem>
        <FormItem label="供应商:" :label-width="100" prop="supplier">
          <dyt-select v-model="formValidate.supplier" filterable clearable :disabled="canedit">
            <Option v-for="item in supplyList" :key="item.supplierId" :value="item.supplierId"
              :disabled="![3].includes(Number(item.auditStatus))"
              :class="{ 'ineffective-option': ![3].includes(Number(item.auditStatus)) }">{{ item.supplierName }}</Option>
          </dyt-select>
        </FormItem>
        <!-- :class="{ 'ivu-form-item-required': (productSource > 2 || isAlBaba) }" -->
        <FormItem label="商品链接:" :label-width="100" prop="goodLink" style="width: 500px;">
          <Input v-model="formValidate.goodLink" clearable placeholder="请输入商品链接" :disabled="canedit" />
        </FormItem>
      </div>
      <FormItem style="width: 500px;">
        <div slot="label" class="custom-label">
          <Tooltip class="label-icon" v-if="matchingInfo.supplierNo.status != 'init'" placement="right-start">
            <span>
              <Icon v-if="matchingInfo.supplierNo.status == 'pass'" type="md-checkmark-circle" />
              <Icon v-else type="md-alert" />
            </span>
            <div slot="content">
              {{ `1688信息匹配${matchingInfo.supplierNo.status == 'pass' ? '成功' : '异常'}` }}
            </div>
          </Tooltip>
          供方货号:
        </div>
        <Input v-model="formValidate.supplierNo" clearable :disabled="canedit" @on-keyup="btKeyUp"></Input>
      </FormItem>
      <FormItem label="商品分类:" prop="productCategory">
        <Cascader :data="productList" v-model="formValidate.productCategory" @on-change="productCategoryChange"
          :disabled="canedit" change-on-select></Cascader>
      </FormItem>

      <template v-if="isListing">
        <FormItem label="listing商品分类:">
          <div class="text-height">{{ laPaProductInfo.listingClassification || '-' }}</div>
        </FormItem>
        <FormItem label="listing尺码:">
          <div class="text-height" v-if="laPaProductInfo.size && laPaProductInfo.size.length">{{
            laPaProductInfo.size.join(' / ') }}</div>
        </FormItem>
      </template>
      <!-- 可售尺码要根据商品分类的不同来展示 -->
      <FormItem>
        <div slot="label" class="custom-label">
          <Tooltip class="label-icon" v-if="matchingInfo.sizeMatching.status != 'init'" placement="right-start">
            <span @click="openMatchSzieModal">
              <Icon v-if="matchingInfo.sizeMatching.status == 'pass'" type="md-checkmark-circle" />
              <Icon v-else type="md-alert" />
            </span>
            <div slot="content">
              {{ `1688信息匹配${matchingInfo.sizeMatching.status == 'pass' ? '成功' : '异常'}${isSizeType ? '，点击可进行手动匹配' : ''}` }}
            </div>
          </Tooltip>
          可售尺码:
        </div>
        <template v-if="formValidate.productCategory.length">
          <template v-if="!isSizeType">
            <Button type="primary" size="small" @click="sizeChange('add')" :disabled="canedit">增加尺码/型号</Button>
          </template>
          <template v-if="isSizeType">
            <div v-for="(item, key) in sizeTypeList" :key="key">
              <div class="form-flex" v-if="item.list && item.list.length">
                <div class="form-flex__titile" v-if="visibleSizeGroupName">{{ item.sizeName }}:</div>
                <div class="form-flex">
                  <CheckboxGroup v-model="item.sizeList" @on-change="sizeCheckbox(key)">
                    <Checkbox :label="citem.sizeId" class="mr10" v-for="citem in item.list" :key="citem.sizeId"
                      :disabled="canedit">{{ citem.size }}</Checkbox>
                  </CheckboxGroup>
                </div>
              </div>
            </div>
          </template>
        </template>
      </FormItem>
      <FormItem label="尺码表:" v-if="isSizeType">
        <upload-img v-model="formValidate.sizeImageUrl" :options="{ accept: 'image/*' }"
          :isDisabled="canedit"></upload-img>
      </FormItem>
      <FormItem label="价格:" prop="pricelist">
        <div class="fmb0">
          <Table :columns="columns" :data="formValidate.pricelist" border highlight-row width="500" maxHeight="450"
            ref="priceTableRef">
            <template slot-scope="{ row, index }" slot="size">
              <FormItem label="" :label-width="0" v-if="!isSizeType" :prop="`pricelist.${index}.size`"
                :rules="ruleValidate.size">
                <Input v-model="formValidate.pricelist[index].size" placeholder="请输入" clearable style="width:100%;"
                  :disabled="canedit"></Input>
              </FormItem>
              <span v-else>{{ row.size }}</span>
            </template>
            <template slot-scope="{ index }" slot="price">
              <FormItem label="" :prop="`pricelist.${index}.prices`" :label-width="0" :rules="ruleValidate.prices">
                <Input v-model.number="formValidate.pricelist[index].prices" placeholder="请输入" clearable
                  style="width:88%;margin-right: 10px;" :disabled="canedit"></Input>
                <Icon type="md-close" class="icon-sty" @click="sizeChange('reduce', index)" v-if="!canedit" />
              </FormItem>
            </template>
          </Table>
        </div>
      </FormItem>

      <template v-if="isListing">
        <FormItem label="listing商品价格:">
          <div class="text-height" v-if="laPaProductInfo.listingPrice && laPaProductInfo.listingPrice.length"
            style="display:flex;flex-wrap: wrap;">
            <div v-for="(item, index) in laPaProductInfo.listingPrice" style="margin-right: 30px;width: 220px;"
              :key="`list-${index}`">{{ item.Color }}+{{ item.Size }}={{ item.Price }}元</div>
          </div>
        </FormItem>
        <FormItem label="listing颜色:">
          <div class="text-height" v-if="laPaProductInfo.color && laPaProductInfo.color.length">
            {{ laPaProductInfo.color.join(' / ') }}</div>
        </FormItem>
      </template>

      <Row>
        <Col span="12" style="padding-right: 8px;">
        <FormItem label="颜色及图片:">
          <span>首图作为商品图片，每个颜色至少上传1张，每个颜色最多可上传5张图片，每张图片大小不超过5M</span>
        </FormItem>
        <FormItem prop="color">
          <div slot="label" class="custom-label">
            <Tooltip class="label-icon" v-if="matchingInfo.colorMatching.status != 'init'" placement="right-start">
              <span @click="openMatchColorModal">
                <Icon v-if="matchingInfo.colorMatching.status == 'pass'" type="md-checkmark-circle" />
                <Icon v-else type="md-alert" />
              </span>
              <div slot="content">
                {{ `1688信息匹配${matchingInfo.colorMatching.status == 'pass' ? '成功' : '异常'}${isSizeType ? '，点击可进行手动匹配' : ''}`
                }}
              </div>
            </Tooltip>
            颜色:
          </div>
          <template v-if="formValidate.productCategory.length">
            <template v-if="isSizeType">
              <Select v-model="formValidate.color" transfer filterable clearable multiple :disabled="canedit"
                @on-change="colorChange">
                <Option v-for="citem in colorList" :value="citem.colorId" :key="citem.colorId">{{ citem.color }}</Option>
              </Select>
            </template>
            <template v-if="!isSizeType">
              <local-tag-input style="display: inline-block; line-height:normal;" :tags="formValidate.color"
                @tagsMt="tagsMt" :disabled="canedit" placeholder="enter确定颜色"></local-tag-input>
            </template>
          </template>
        </FormItem>
        <FormItem v-for="(item, key) in formValidate.colorPiclist" label="" :prop="`colorPiclist.${key}.fileLists`"
          :rules="{ required: true, message: '图片必填', trigger: 'change', type: 'array' }" :key="`f-${key}`">
          <div style="line-height:normal;">
            <div :key="`d-${key}`" style="padding-bottom:4px;">{{ item.color }}</div>
            <!-- <upload-img v-model="item.fileLists" :options="{multiple:true,limit:5}" :isDisabled="canedit"></upload-img> -->
            <preview-img :fileList="item.fileLists" :isDisabled="canedit">
              <div class="upload-imgsty" @click="uploadGalley(key)" v-if="maxLength > item.fileLists.length">
                <Icon type="ios-camera" size="30"></Icon>
              </div>
            </preview-img>
          </div>
        </FormItem>
        <FormItem label="备注:">
          <Input v-model="formValidate.desc" type="textarea" :autosize="{ minRows: 2, maxRows: 5 }" placeholder="请输入"
            :disabled="canedit"></Input>
        </FormItem>
        <FormItem label="审款意见:" v-if="[1, 2].includes(productData.productSource)">
          <span v-if="canedit">{{ formValidate.reviewOpinions }}</span>
        </FormItem>
        </Col>
        <Col span="12" style="padding-left: 8px;">
        <!-- 图库 -->
        <basis-gallery ref="basisgallery" :modelVisible.sync="modelVisible" @picReturn="picReturn" :picList="picList"
          :isDisabled="canedit" />
        </Col>
      </Row>
    </Form>
    <!-- 指派弹框 -->
    <assign-user ref="assignUser" :productData="detailData" v-on="$listeners" v-if="JSON.stringify(productData) === '{}'"
      :productSource="productSource" />
    <!-- 手动匹配 1688 尺码 -->
    <gathSizeModal :model-visible.sync="matchingInfo.sizeMatching.visible" :model-data="matchingInfo.sizeMatching.data"
      @sizeConfirm="matchSizeHand" />
    <!-- 手动匹配 1688 颜色 -->
    <gathColorModal :model-visible.sync="matchingInfo.colorMatching.visible" :model-data="matchingInfo.colorMatching.data"
      @colorConfirm="matchColorHand" />
  </div>
</template>

<script>
import api from '@/api/api.js';
import UploadImg from '@/components/uploadImg';
import regular from '@/utils/regular';
import assignUser from './assignUser';
import basisGallery from '../components/basisGallery';
import previewImg from '@/components/uploadImg/previewImg';
import { compareFun } from '../components/sizeCompare.js';
import gathSizeModal from '@/views/pds/newProducts/components/gathSizeModal';
import gathColorModal from '@/views/pds/newProducts/components/gathColorModal';

export default {
  name: "basicData",
  components: { UploadImg, assignUser, basisGallery, previewImg, gathSizeModal, gathColorModal },
  props: {
    gatherBasic: { type: Boolean, default: false },
    productData: {
      type: Object,
      default() {
        return {};
      }
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
    isedit: {
      type: Object,
      default() {
        return {};
      }
    },
    operatList: {
      type: Array,
      default() {
        return [];
      }
    },
    supplyList: {
      type: Array,
      default() {
        return [];
      }
    },
    productSource: {
      type: Number,
      default: null
    },
  },
  data() {
    return {
      quoteType: 1,
      useStandTypeId: [0, 1],
      quoteList: [
        { label: '设计款号', value: 1 },
        { label: 'SPU', value: 2 },
      ],
      formValidate: {
        quote: '',
        supplierNo: '',
        styleName: '',
        stock: 0,
        deliveryDate: '',
        minquantity: '',
        supplier: '',
        productCategory: [],
        pricelist: [],
        desc: '',
        color: [],
        colorPiclist: [],
        reviewOpinions: '',
        sizeImageUrl: [],
        goodLink: '',
        stockMultiple: '',
      },
      ruleValidate: {
        supplier: [
          { required: true, message: '供应商必填', trigger: 'change' },
        ],
        goodLink: [],
        stock: [
          { required: true, message: '是否有库存必填', trigger: 'change', type: 'number' }
        ],
        deliveryDate: [
          { required: true, message: '货期（天）必填', trigger: 'blur', type: 'number' },
          { required: true, pattern: regular.validateInteger, message: '请输入大于0的正整数', trigger: 'blur' },
        ],
        minquantity: [
          { required: true, message: '起订量必填', trigger: 'blur', type: 'number' },
          { required: true, pattern: regular.validateInteger, message: '请输入大于0的正整数', trigger: 'blur' },
        ],
        productCategory: [
          { required: true, message: '商品分类必填', trigger: 'change', type: 'array' },
        ],
        pricelist: [
          { required: true, message: '价格必填', trigger: 'change', type: 'array' }
        ],
        size: [
          { required: true, message: '尺寸必填', trigger: 'blur' },
        ],
        prices: [
          { required: true, message: '价格（人民币）必填', trigger: 'blur', type: 'number' },
          { pattern: regular.validatePrice, message: '请输入正整数或者两位小数的金额', trigger: 'blur' },
        ],
        color: [
          { required: true, message: '颜色必填', trigger: 'change', type: 'array' },
        ],
        sizeImageUrl: [
          { required: true, message: '尺码表必传', trigger: 'change', type: 'array' },
        ],
        stockMultiple: [{ validator: this.validStockingVal, trigger: "blur" }],
      },
      columns: [
        {
          title: '尺码/型号',
          slot: 'size',
        },
        {
          title: '价格（人民币）',
          slot: 'price',
          width: 240,
          renderHeader: (h) => {
            return h('div', {
              style: {
                display: "flex",
                flexAligns: 'center'
              }
            }, [
              h('span', [
                h('span', {
                  style: {
                    display: 'inline-block',
                    marginRight: '4px',
                    lineHeight: 1,
                    fontFamily: 'SimSun',
                    fontSize: '12px',
                    color: '#ed4014'
                  }
                }, '*'),
                h('span', '价格（人民币）')
              ]),
              h('Checkbox', {
                props: {
                  disabled: !this.formValidate.pricelist.length || this.canedit
                },
                style: { marginLeft: '10px' },
                on: {
                  "on-change": (event) => {
                    this.sameChange(event);
                  },
                },
              }, '相同')
            ]);
          },
        },
      ],
      productList: [],
      colorList: [],
      fileLists: [],
      supplyLoading: false,
      isSizeType: null,
      sizeTypeList: [],
      detailData: {},
      canedit: false,
      isopendetail: false,
      modelVisible: false,
      picKey: null, //记录所在颜色的图片位置
      picList: [],// 图库
      laPaProductInfo: {},//基础信息
      maxLength: 5,//最多上传图片数
      originalVal: {},
      originalColorVal: [],
      selectSizeGroup: {},
      matchingInfo: {
        styleName: { status: 'init' },
        supplierNo: { status: 'init' },
        deliveryDate: { status: 'init' },
        minquantity: { status: 'init' },
        sizeMatching: { visible: false, data: {}, status: 'init', originalVal: {} },
        colorMatching: { visible: false, data: {}, status: 'init' },
      }
    };
  },
  watch: {
    isedit: {
      handler(newVal) {
        if (newVal) {
          this.canedit = !(this.isedit.editBasic || this.isedit.btnoperat === 'edit');
        }
      },
      deep: true,
      immediate: true
    },
    isAlBaba: {
      immediate: true,
      handler(val) {
        if (this.productSource > 2 || val) {
          this.$set(this.ruleValidate, 'goodLink', [
            // { required: true, message: '请输入商品链接', trigger: 'blur' },
            { pattern: regular.validateUrl, message: '请输入正确的网址', trigger: 'blur' }
          ])
          return;
        }
        this.$set(this.ruleValidate, 'goodLink', [
          // { required: false, message: '请输入商品链接', trigger: 'blur' },
          { pattern: regular.validateUrl, message: '请输入正确的网址', trigger: 'blur' }
        ]);
        this.$nextTick(() => {
          this.$refs.formValidate && this.$refs.formValidate.validateField('goodLink');
        })
      }
    },
    'formValidate.supplier': {
      deep: true,
      handler(val) {
        this.backDetail(this.formValidate);
      }
    },
    'formValidate.goodLink': {
      deep: true,
      handler(val) {
        this.backDetail(this.formValidate);
      }
    },
    'formValidate.productCategory': {
      deep: true,
      handler(val) {
        this.backDetail(this.formValidate);
      }
    },
    'formValidate.pricelist': {
      deep: true,
      immediate: true,
      handler(val) {
        if (!this.$common.isEmpty(val) && !this.$common.isEmpty(val[0].sizeGroupNo)) {
          this.selectSizeGroup = this.$common.copy({ ...this.sizeTypeList[val[0].sizeGroupNo], groupNo: val[0].sizeGroupNo });
        }
        this.backDetail(this.formValidate);
      }
    },
    // 采集到的信息
    gatherDetail: {
      deep: true,
      handler(val) {
        if (this.$common.isEmpty(val) || !this.gatherBasic || this.canedit) return;
        this.originalVal = {};
        // 采集到的款式名称
        if (!this.$common.isEmpty(val.subject)) {
          this.$set(this.formValidate, 'styleName', val.subject);
          this.matchingInfo.styleName.status = 'pass';
        }
        // 起批量
        if (!this.$common.isEmpty(val.startQuantity)) {
          this.$set(this.formValidate, 'minquantity', val.startQuantity);
          this.matchingInfo.minquantity.status = 'pass';
        }
        // 货期
        if (!this.$common.isEmpty(val.handlingTime)) {
          this.$set(this.formValidate, 'deliveryDate', val.handlingTime);
          this.matchingInfo.deliveryDate.status = 'pass';
        }
        // 货号
        if (!this.$common.isEmpty(val.handlingNo)) {
          this.$set(this.formValidate, 'supplierNo', val.handlingNo);
          this.matchingInfo.supplierNo.status = 'pass';
        }
        // 采集到的尺码
        if (!this.$common.isEmpty(val.groupByQuality)) {
          if (!this.isSizeType) {
            this.matchingInfo.sizeMatching.status = 'pass';
            this.formValidate.pricelist = val.groupByQuality.map(m => {
              return { size: m.attributeValue, prices: m.price }
            })
          } else if (!this.$common.isEmpty(this.formValidate.pricelist)) {
            let groupSizeJson = {};
            let groupIndex = this.formValidate.pricelist[0].sizeGroupNo;
            const sizeOptions = this.$common.copy(this.sizeTypeList[groupIndex]);
            (sizeOptions.list || []).forEach(m => {
              groupSizeJson[m.size] = m;
            });
            let newPrice = [];
            const newSelect = [];
            val.groupByQuality.forEach(m => {
              if (Object.keys(groupSizeJson).includes(m.attributeValue)) {
                newSelect.push(groupSizeJson[m.attributeValue].sizeId);
                newPrice.push({
                  size: groupSizeJson[m.attributeValue].size,
                  prices: m.price,
                  sizeId: groupSizeJson[m.attributeValue].sizeId,
                  sizeGroupNo: groupIndex
                });
              } else if (this.matchingInfo.sizeMatching.status == 'init') {
                this.matchingInfo.sizeMatching.status = 'fail';
              }
            });
            if (this.matchingInfo.sizeMatching.status == 'init') {
              this.matchingInfo.sizeMatching.status = 'pass';
            }
            this.formValidate.pricelist = newPrice;
            this.selectSizeGroup.sizeList = newSelect;
            this.sizeTypeList[groupIndex].sizeList = newSelect;
            // 当前选中的尺码以及1688的尺码信息
            this.matchingInfo.sizeMatching.data = {
              groupByQuality: this.$common.copy(val.groupByQuality),
              selectSizeGroup: this.$common.copy(this.selectSizeGroup)
            }
          }
        }
        // 采集到的颜色
        if (!this.$common.isEmpty(val.groupByColor)) {
          let colorPice = [];
          let newVal = [];
          let pictureUrl = [];
          if (!this.isSizeType) {
            val.groupByColor.forEach(item => {
              colorPice.push({
                color: item.attributeValue,
                fileLists: this.$common.isEmpty(item.imageUrl) ? [] : [{ url: item.imageUrl }]
              });
              newVal.push({ attrVal: item.attributeValue });
              if (!this.$common.isEmpty(item.imageUrl)) {
                pictureUrl.push({ url: item.imageUrl });
              }
            })
            this.matchingInfo.colorMatching.status = 'pass';
            this.formValidate.color = newVal;
            this.formValidate.colorPiclist = colorPice;
          } else {
            let colorJson = {};
            this.colorList.forEach(item => {
              colorJson[item.color] = item;
            })
            val.groupByColor.forEach(item => {
              if (!this.$common.isEmpty(colorJson[item.attributeValue])) {
                newVal.push(colorJson[item.attributeValue].colorId);
                colorPice.push({
                  colorId: colorJson[item.attributeValue].colorId,
                  color: item.attributeValue,
                  fileLists: this.$common.isEmpty(item.imageUrl) ? [] : [{ url: item.imageUrl }]
                });
              } else if (this.matchingInfo.colorMatching.status == 'init') {
                this.matchingInfo.colorMatching.status = 'fail';
              }
              if (!this.$common.isEmpty(item.imageUrl)) {
                pictureUrl.push({ url: item.imageUrl });
              }
            })
            if (this.matchingInfo.colorMatching.status == 'init') {
              this.matchingInfo.colorMatching.status = 'pass';
            }
            this.formValidate.color = newVal;
            this.formValidate.colorPiclist = colorPice;
            // 当前选中的颜色以及1688的颜色信息
            this.matchingInfo.colorMatching.data = {
              groupByColor: this.$common.copy(val.groupByColor),
              colorList: this.colorList
            }
          }
          this.picList = pictureUrl;
        }
      }
    }
  },
  computed: {
    isListing() {
      return this.productSource === 4;
    },
    // 尺码组名是否显示
    visibleSizeGroupName () {
      if (this.$common.isEmpty(this.sizeTypeList)) return false;
      let allDataList = [];
      Object.values(this.sizeTypeList).forEach(item => {
        if (!this.$common.isEmpty(item.list)) {
          allDataList.push(item.list);
        }
      });
      return allDataList.length > 1;
    },
    // 当前商品分类下的所有尺码
    laPaProductAllSize () {
      if (this.formValidate.productCategory.length <= 0 || !this.isSizeType) return [];
      let sizeDataList = this.$common.copy(this.sizeTypeList);
      if (this.$common.isEmpty(sizeDataList)) return [];
      let allSize = [];
      Object.values(sizeDataList).forEach(item => {
        (item.list || []).forEach(sTem => {
          allSize.push({
            sizeTypeId: item.sizeTypeId,
            sizeGroupNo: item.sizeGroupNo,
            sizeId: sTem.sizeId,
            size: sTem.size,
            sizeCode: sTem.sizeCode,
          });
        });
      });
      return allSize;
    },
    // 商品ID
    productId () {
      if (!this.$common.isEmpty(this.basiclData) && !this.$common.isEmpty(this.basiclData.laPaProductInfo)) {
        return this.basiclData.laPaProductInfo.productId;
      }
      if (!this.$common.isEmpty(this.productData)) {
        return this.productData.productId;
      }
      return '';
    },
    // 选中的供应商
    selectSupplier() {
      if (this.$common.isEmpty(this.formValidate.supplier)) return {};
      return this.supplyList.find(f => f.supplierId === this.formValidate.supplier);
    },
    // 是否为 1688 供应商
    isAlBaba() {
      if (this.$common.isEmpty(this.selectSupplier)) return false;
      return [1, '1'].includes(this.selectSupplier.setupStatus);
    }
  },
  created() {
    this.categoryData();
    if (this.$common.isEmpty(this.productData) || this.$common.isEmpty(this.basiclData)) return;
    this.getProductDetail();
    this.getPicStock();
  },
  methods: {
    // 获取新品详情
    getProductDetail() {
      this.isopendetail = true;
      let temp = this.$common.copy(this.basiclData || {});
      this.detailData = temp;
      this.selectSizeGroup = {};
      this.originalVal = {};

      // listing数据处理
      if (this.isListing) {
        this.laPaProductInfo = this.$common.copy(temp.laPaProductInfo || {});
        let listingPrice = JSON.parse(this.laPaProductInfo.listingPrice);
        this.laPaProductInfo.listingPrice = listingPrice;
      }

      // 后端坑人将sizeid转字符型，这里手动将数据转为数值型（不能转的就不转）
      temp.laPaProductSizeRelList.forEach(k => {
        k.sizeId = this.$common.isEmpty(Number(k.sizeId)) ? k.sizeId : Number(k.sizeId);
      })

      // 推款和非推款（推款：设计号，非推款：款式名称）

      // 基础信息
      this.formValidate.styleName = temp.laPaProductInfo.styleName;
      this.formValidate.supplierNo = temp.laPaProductInfo.supplierNo;
      this.formValidate.stock = temp.laPaProductInfo.isStock;
      this.formValidate.deliveryDate = temp.laPaProductInfo.goodDate;
      this.formValidate.minquantity = temp.laPaProductInfo.minimumOrderQuantity;
      this.formValidate.supplier = temp.laPaProductInfo.supplierId;
      this.formValidate.desc = temp.laPaProductInfo.remark;
      this.formValidate.reviewOpinions = temp.laPaProductInfo.reviewOpinions;
      this.formValidate.productCategory = this.allCategoryId(temp.laPaProductInfo.goodTypeId);
      this.formValidate.goodLink = temp.laPaProductInfo.goodLink;
      this.formValidate.stockMultiple = temp.laPaProductInfo.stockMultiple;
      this.productCategoryChange([temp.laPaProductInfo.goodTypeId], 'init');

      // 尺码
      if (!(temp.laPaProductInfo.sizeType || temp.laPaProductInfo.sizeType === 0)) {
        let arr = [];
        temp.laPaProductSizeRelList.forEach(citem => {
          if (citem.modelName && !citem.sizeId) {
            arr.push({ size: citem.modelName, prices: citem.price, sizeGroupNo: citem.sizeGroupNo });
          }
        });
        this.formValidate.pricelist = arr;
      }

      // 颜色
      let arr = [];
      this.formValidate.color = [];
      temp.laPaPictureColorRelList.forEach(k => {
        let fileList = k.pictureUrl ? k.pictureUrl.split(',') : [];
        fileList = fileList.map((k) => {
          let list = k ? k.split('/') : [];
          let urlname = list[list.length - 1];
          return { name: urlname, url: k };
        });
        if (k.colorId) {
          arr.push({ color: k.color, colorId: k.colorId, fileLists: fileList });
          this.formValidate.color.push(k.colorId);
        } else if (k.diyColor) {
          arr.push({ color: k.diyColor, fileLists: fileList });
          this.formValidate.color.push({ attrVal: k.diyColor });
        }
      });
      this.formValidate.colorPiclist = arr;

      // 尺码表
      let sizeImageUrl = temp.laPaProductInfo.sizeImageUrl;
      if (!sizeImageUrl) return;
      let list = sizeImageUrl ? sizeImageUrl.split('/') : [];
      let urlname = list[list.length - 1];
      this.formValidate.sizeImageUrl = [{ name: urlname, url: sizeImageUrl }];
    },
    // 将商品基本详情信息返回到上一级
    backDetail(data) {
      this.$nextTick(() => {
        this.$emit('backBasicsDetail', this.$common.copy({
          ...data,
          isAlBaba: this.isAlBaba,
          productCategorySize: this.isSizeType
        }));
      })
    },
    // 获取云仓图库
    getPicStock() {
      this.$Spin.show();
      this.$axios
        .get(api.getCloudPicture, { params: { productId: this.productId } })
        .then(({ code, datas }) => {
          if (code !== 0) return;
          let list = datas || [];
          this.picList = list.map(k => {
            return { url: k.pictureUrl }
          })
        })
        .finally(() => {
          this.$Spin.hide();
        });
    },
    // 保存 type:1提交审核 2保存
    handleSubmit(type) {
      return new Promise((resolve) => {
        let [temp, laPaProductInfo, laPaProductSizeRelList, laPaPictureColorRelList] = [{}, {}, [], []];
        let data = this.formValidate;

        laPaProductInfo.styleName = data.styleName;
        laPaProductInfo.supplierNo = data.supplierNo;
        laPaProductInfo.isStock = data.stock;
        laPaProductInfo.goodDate = data.deliveryDate;
        laPaProductInfo.minimumOrderQuantity = data.minquantity;
        laPaProductInfo.supplierId = data.supplier;
        laPaProductInfo.goodTypeId = data.productCategory[data.productCategory.length - 1];
        laPaProductInfo.remark = data.desc;
        laPaProductInfo.reviewOpinions = data.reviewOpinions;
        laPaProductInfo.productId = this.productId;
        laPaProductInfo.sizeImageUrl = data.sizeImageUrl[0] && data.sizeImageUrl[0].url;
        laPaProductInfo.goodLink = data.goodLink;
        laPaProductInfo.stockMultiple = data.stockMultiple;

        // 来源：0-新品需求 1-推款-备货开发 2-推款-云仓开发 3-云仓新建 4-云仓采集
        laPaProductInfo.productSource = this.productSource;

        // 家品类
        if (!this.isSizeType) {
          let [obj, repeat] = [{}, false];
          laPaProductSizeRelList = data.pricelist.map((k, i) => {
            if (obj[k.size]) {
              repeat = true;
            } else {
              obj[k.size] = k;
            }
            return { price: k.prices, sortNo: i + 1, modelName: k.size };
          });
          // 监听重复
          if (repeat) {
            this.$Message.error('尺寸不能重复，请检查~');
            return;
          }
          laPaPictureColorRelList = data.colorPiclist.map((k, i) => {
            let firstPicture = i < 1 ? 0 : 1;
            let url = k.fileLists.map(ck => {
              return ck.url;
            });
            return { diyColor: k.color, pictureUrl: url.toString(), firstPicture: firstPicture };
          });
        }
        // 服装类
        if (this.isSizeType) {
          let [obj, repeat] = [{}, false];
          laPaProductInfo.sizeType = this.isSizeType && this.isSizeType.sizeType;
          laPaProductSizeRelList = data.pricelist.map((k, i) => {
            if (obj[k.sizeId]) {
              repeat = true;
            } else {
              obj[k.sizeId] = k;
            }
            return { price: k.prices, sortNo: i + 1, sizeId: k.sizeId, sizeGroupNo: k.sizeGroupNo - 0 };
          });

          // 监听重复
          if (repeat) {
            this.$Message.error('尺寸不能重复，请检查~');
            return;
          }
          laPaPictureColorRelList = data.colorPiclist.map((k, i) => {
            let firstPicture = i < 1 ? 0 : 1;
            let url = k.fileLists.map(ck => {
              return ck.url;
            });
            return { colorId: k.colorId, pictureUrl: url.toString(), firstPicture: firstPicture };
          });
        }
        //保存时如果没选尺码给后端返回一个属性null的数组
        if (laPaProductSizeRelList.length == 0) {
          laPaProductSizeRelList = [
            {
              "price": null,
              "sortNo": null,
              "sizeId": null,
              "sizeGroupNo": null
            }
          ]
        }
        if (laPaPictureColorRelList.length == 0) {
          laPaPictureColorRelList = [{
            "colorId": null,
            "pictureUrl": "",
            "firstPicture": 0
          }]
        }
        temp.laPaProductInfo = laPaProductInfo;
        temp.laPaProductSizeRelList = laPaProductSizeRelList;
        temp.laPaPictureColorRelList = laPaPictureColorRelList;
        // 当前尺码类型下的所有尺码
        temp.laPaProductSizeInfos = this.laPaProductAllSize;

        let obj = {};
        data.colorPiclist.forEach(k => {
          if (obj[k.color]) {
            obj[k.color] += 1;
          } else {
            obj[k.color] = 1;
          }
        });
        for (let i in obj) {
          if (obj[i] > 1) {
            this.$Message.error('颜色不能重复，请检查~');
            return;
          }
        }

        // 云仓商品图片资料信息
        let filePiclist = this.$refs.basisgallery.filePiclist || [];
        temp.laPaProductPictures = filePiclist.map(k => {
          return { pictureUrl: k.url };
        })

        // console.log(temp, type);
        // return;
        this.$Spin.show();
        if (type === 1) {
          this.$refs['formValidate'].validate((valid) => {
            if (this.formValidate.supplierNo.length != 0 && this.formValidate.supplierNo.length > 18) {
              this.$Message.error('供方货号超过最大长度')
              return
            }
            if (valid) {
              this.$axios.post(api.saveBase, temp).then(({ code, datas }) => {
                if (code === 0) {
                  this.verifySubmit(datas, type);
                }
              })
            }
          }).finally(() => {
            this.$Spin.hide();
            this.$nextTick(() => {
              resolve();
            })
          });
        }

        if (type !== 1) {
          this.$axios.post(api.saveBase, temp).then(({ code, datas }) => {
            if (code === 0) {
              this.$Message.success('操作成功~');
              this.$emit('closeDialog');
            }
          }).finally(() => {
            this.$Spin.hide();
            this.$nextTick(() => {
              resolve();
            })
          });
        }
      })
    },
    // 打开手动匹配尺码弹窗
    openMatchSzieModal() {
      if (!this.isSizeType) return;
      this.$set(this.matchingInfo.sizeMatching.data, 'originalVal', this.$common.copy(this.originalVal));
      this.$set(this.matchingInfo.sizeMatching.data, 'pricelist', this.$common.copy(this.formValidate.pricelist));
      this.$nextTick(() => {
        this.matchingInfo.sizeMatching.visible = true;
      })
    },
    // 确认匹配尺码
    matchSizeHand(data) {
      if (this.$common.isEmpty(data) || this.$common.isEmpty(data.sizeGroup) || this.$common.isEmpty(data.sizeGroup.groupNo)) return;
      this.sizeTypeList[data.sizeGroup.groupNo].sizeList = data.sizeIds;
      this.$set(this.sizeTypeList[data.sizeGroup.groupNo], 'sizeList', data.sizeIds);
      this.originalVal = {};
      let matchSize = {};
      (data.originalVal || []).forEach(item => {
        this.$set(this.originalVal, item.attributeValue, item.sizeId);
        matchSize[item.sizeId] = item;
      });
      this.$nextTick(() => {
        this.sizeCheckbox(data.sizeGroup.groupNo, matchSize);
      })
    },
    // 颜色匹配确认
    matchColorHand(data) {
      if (this.$common.isEmpty(data)) return;
      let colorPice = [];
      (data.originalVal || []).forEach((item) => {
        colorPice.push({
          colorId: item.colorId,
          color: item.color,
          fileLists: this.$common.isEmpty(item.imageUrl) ? [] : [{ url: item.imageUrl }]
        });
      })

      this.formValidate.color = this.$common.copy(data.colorIds);
      this.formValidate.colorPiclist = colorPice;
      this.originalColorVal = this.$common.copy(data.originalVal);
    },
    // 打开手动匹配颜色弹窗
    openMatchColorModal() {
      if (!this.isSizeType) return;
      const selectId = this.originalColorVal.map(m => m.colorId);
      const oldSelect = this.originalColorVal.map(m => {
        return { ...m, color: m.attributeValue }
      })
      const selectColor = this.colorList.filter(item => {
        return this.formValidate.color.includes(item.colorId) && !selectId.includes(item.colorId);
      })
      this.$set(this.matchingInfo.colorMatching.data, 'selectColor', [...selectColor, ...oldSelect]);
      this.$nextTick(() => {
        this.matchingInfo.colorMatching.visible = true;
      })
    },
    // 提交审核
    verifySubmit(productId, type) {
      this.$refs['assignUser'].nextDialogOpen(
        {
          title: "提交审核",
          content: "审核基础资料",
          productId: productId,
          type: type,
          status: 0
        }
      );
    },
    // 增加尺码/型号
    sizeChange(type, index) {
      if (type === 'add') {
        this.formValidate.pricelist.push({ size: '', prices: '' });
        // if (this.$refs.priceTableRef) {
        //   console.log(this.$refs.priceTableRef.$el);
        // }
        return;
      }
      if (type === 'reduce') {
        // 删除同时对可售尺码取消勾选
        Object.keys(this.sizeTypeList).forEach(k => {
          this.sizeTypeList[k].sizeList.forEach((j, y) => {
            if (j === this.formValidate.pricelist[index].sizeId) {
              this.sizeTypeList[k].sizeList.splice(y, 1);
            }
          });
        });
        this.formValidate.pricelist.splice(index, 1);
      }
    },
    // 增加颜色/图片
    colorPichange(type, index) {
      if (type === 'add') this.formValidate.colorPiclist.push({
        color: '', fileLists: []
      });
      if (type === 'reduce') this.formValidate.colorPiclist.splice(index, 1);
    },
    sizeCheckbox(index, gath = {}) {
      let data = this.sizeTypeList;
      let pricelist = {};
      this.formValidate.pricelist.forEach(k => {
        pricelist[k.sizeId] = k;
      });
      let gathInfo = {};
      let priceItem = {};
      let listObj = {};
      const selectBox = data[index].list.filter(item => {
        return data[index].sizeList.includes(item.sizeId);
      })
      const arr = selectBox.map(item => {
        if (!this.$common.isEmpty(gath[item.sizeId])) {
          gathInfo = gath[item.sizeId];
        }
        priceItem = pricelist[item.sizeId];
        listObj = { size: item.size, sizeId: item.sizeId, sizeGroupNo: index };
        if (priceItem && priceItem.sizeGroupNo == index) {
          listObj.prices = this.$common.isEmpty(gathInfo) ? priceItem.prices : (this.$common.isEmpty(gathInfo.price) ? '' : gathInfo.price);
          return listObj;
        }
        listObj.prices = this.$common.isEmpty(gathInfo) ? '' : (this.$common.isEmpty(gathInfo.price) ? '' : gathInfo.price);
        return listObj;
      })
      // 只能对当中某个分类下的尺码进行选择
      Object.keys(data).forEach(k => {
        if (index !== k) {
          this.sizeTypeList[k].sizeList = [];
        }
      });
      this.formValidate.pricelist = arr;
      this.backDetail(this.formValidate);
    },
    // 勾选相同
    sameChange(e) {
      const prices = this.formValidate.pricelist[0].prices;
      if (!(e && prices)) return;
      this.formValidate.pricelist.forEach((k, i) => {
        this.formValidate.pricelist[i].prices = prices;
      });
    },
    // 处理商品分类
    categoryData() {
      this.productList = this.getProductCategoryTree(this.operatList, null);
    },
    // 组装商品分类树
    getProductCategoryTree(productCategoryList, parentId) {
      var tree = [];
      var children;
      productCategoryList.forEach((n) => {
        if (n.parentId === parentId) {
          n.label = n.cnName;
          n.value = n.productCategoryId;
          // // 这里是用来调试的，记得删除
          // if (n.parentId === '519624819411517448') {
          //   n.sizeType = 1;
          // }
          children = this.getProductCategoryTree(productCategoryList, n.productCategoryId);
          if (children.length > 0) {
            n.children = children;
          }
          tree.push(n);
        }
      });
      return tree;
    },
    // 商品分类切换选择(尺码分类是挂钩到商品分类上面的)
    productCategoryChange(e, type) {
      let productCategoryId = e[e.length - 1];
      let result = null;
      let a = (list, id) => {
        list.forEach(k => {
          if (id === k.productCategoryId) {
            if (k.sizeType || (k.sizeType === 0)) {
              result = k;
            } else {
              if (k.parentId) {
                a(this.productList, k.parentId);
              }
            }
          } else {
            if (k.children && k.children.length) {
              a(k.children, id);
            }
          }
        });
      };
      a(this.productList, productCategoryId);
      this.isSizeType = result;

      if (!this.isopendetail) {
        this.formValidate.color = []; //置空颜色值
        this.formValidate.colorPiclist = []; //置空颜色值
        this.formValidate.pricelist = []; //置空价格列表
      }

      let detailData = this.detailData;
      // console.log(detailData, result);

      // 优先取决于详情内存在的sizeType 不存在再从商品分类id找到分类下的尺码id
      let sizeType = detailData.laPaProductInfo && detailData.laPaProductInfo.sizeType;
      if (JSON.stringify(detailData) !== '{}' && (sizeType || sizeType === 0) && this.isopendetail) {
        this.isopendetail = false;
        this.queryProductSizeList(sizeType, type);
        this.isSizeType = { sizeType: sizeType };
      } else if (result) {
        this.queryProductSizeList(result.sizeType, type);
      }
      this.getColorList();
      this.formValidate.colorPiclist.forEach((k, i) => {
        this.formValidate.colorPiclist[i].color = ''; //置空颜色值
      });
      this.formValidate.pricelist = []; //置空价格列表
      this.matchingInfo.sizeMatching.status = 'init';
    },
    // 根据尺码类型获取尺码组
    queryProductSizeList(sizeTypeId, type) {
      this.sizeTypeList = {};
      this.getGoodsSizeData(sizeTypeId, type).then((datas) => {
        let list = this.sortSize(datas);
        let type = {};
        if (!this.$common.isEmpty(sizeTypeId) && this.useStandTypeId.includes(Number(sizeTypeId))) {
          type = { 1: "现货款", 2: "打版款" };
        } else {
          type = { 1: "尺码组1", 2: "尺码组2" };
        }
        let obj = {};
        list.forEach(k => {
          if (!obj[k.sizeGroupNo]) {
            obj[k.sizeGroupNo] = { ...k, sizeList: [], sizeName: type[k.sizeGroupNo], list: [] };
          }
          obj[k.sizeGroupNo].list = obj[k.sizeGroupNo].list.concat(k.sizeList || []);
        });
        this.sizeTypeList = obj;
        this.displaySizeList(obj);
      });
    },
    // 获取对应需要的尺码数据
    getGoodsSizeData (sizeTypeId, type) {
      return new Promise((resolve) => {
        if (type == 'init') {
          this.$axios.get(api.getSizeHistory, { params: { productId: this.productId } }).then(({ code, datas }) => {
            if (code !== 0) return resolve([]);
            resolve(datas || []);
          }).catch(() => {
            resolve([]);
          });
          return;
        }
        this.$axios.get(api.queryProductSizeTypeRel, { params: { sizeTypeId: sizeTypeId } }).then(({ code, datas }) => {
          if (code !== 0) return resolve([]);
          resolve(datas || []);
        }).catch(() => {
          resolve([]);
        });
      })
    },
    // 获取颜色列表
    getColorList() {
      if (this.colorList.length) return;
      this.$axios
        .get(api.queryProductColorList)
        .then(({ code, datas }) => {
          if (code !== 0) return;
          this.colorList = datas || [];
        });
    },
    // 根据末级id找全商品分类id
    allCategoryId(productCategoryId) {
      let arr = [];
      let a = (list, id) => {
        list.forEach(k => {
          if (id === k.productCategoryId) {
            arr.unshift(id);
            a(this.productList, k.parentId);
          } else {
            if (k.children && k.children.length) {
              a(k.children, id);
            }
          }
        });
      };
      a(this.productList, productCategoryId);
      return arr;
    },
    // 根据数据反显可售尺码
    displaySizeList(obj) {
      let data = this.detailData;
      let sizeType = data.laPaProductInfo && data.laPaProductInfo.sizeType;
      if (JSON.stringify(data) !== '{}' && (sizeType || sizeType == 0)) {
        let arr = [];
        data.laPaProductSizeRelList.forEach(citem => {
          Object.keys(obj).forEach(k => {
            if (citem.sizeGroupNo === (k - 0)) {
              obj[k].list.forEach((j) => {
                if (citem.sizeId == j.sizeId) {
                  this.sizeTypeList[k].sizeList.push(citem.sizeId);
                  if (!citem.modelName && citem.sizeId) {
                    arr.push({ size: j.size, prices: citem.price, sizeId: j.sizeId, sizeGroupNo: k });
                  }
                }
              });
            }
          });
        });
        this.formValidate.pricelist = arr;
      }
    },
    // 下拉框颜色选择
    colorChange(e) {
      let list = [];
      let colorPiclist = JSON.parse(JSON.stringify(this.formValidate.colorPiclist));
      this.colorList.forEach(k => {
        if (e.includes(k.colorId)) {
          let flag = false;
          colorPiclist.forEach(item => {
            if (k.colorId === item.colorId) {
              list.push({ ...k, fileLists: item.fileLists });
              flag = true;
            }
          })
          if (flag) return;
          list.push({ ...k, fileLists: [] });
        }
      })
      this.formValidate.colorPiclist = list;
    },
    // 输入框颜色回传
    tagsMt(e) {
      let list = [];
      let colorPiclist = JSON.parse(JSON.stringify(this.formValidate.colorPiclist));
      e.forEach(k => {
        let flag = false;
        colorPiclist.forEach(item => {
          if (k.attrVal === item.color) {
            list.push({ color: k.attrVal, fileLists: item.fileLists });
            flag = true;
          }
        })
        if (flag) return;
        list.push({ color: k.attrVal, fileLists: [] });
      })
      this.formValidate.colorPiclist = list;
    },
    // 上传图片
    uploadGalley(key) {
      this.modelVisible = true;
      this.picKey = key;
    },
    // 图片选择传回
    picReturn(list) {
      let num = this.maxLength - this.formValidate.colorPiclist[this.picKey].fileLists.length;
      list.forEach((k, i) => {
        if (i < num) {
          this.formValidate.colorPiclist[this.picKey].fileLists.push(k);
        }
      })
    },
    // 对尺码排序
    sortSize(list) {
      list.forEach(k => {
        if (!(k.sizeList && k.sizeList.length)) return;
        const newList = k.sizeList.filter(item => {
          return typeof item.sortNo == 'number'
        })
        const noSortList = k.sizeList.filter(item => {
          return typeof item.sortNo != 'number'
        })
        noSortList.sort(compareFun('sizeId'));
        newList.sort(compareFun('sortNo'));
        k.sizeList = [...newList, ...noSortList];
      })
      return list
    },
    getFormdata() {
      return new Promise((resolve) => {
        this.$refs["formValidate"].validate((valid) => {
          if (this.formValidate.supplierNo.length != 0 && this.formValidate.supplierNo.length > 18) {
            this.$Message.error('供方货号超过最大长度')
            return
          }
          resolve(valid ? true : false);
        });
      });
    },
    //控制不能输入特殊字符
    btKeyUp(name) {
      this.formValidate.supplierNo = this.formValidate.supplierNo.replace(/[（）]/g, "");
    },
    validStockingVal(rule, value, callback) {
      if (!this.$common.isEmpty(value)) {
        let reg = this.$regular.validateInteger;
        if ((!reg.test(value)) || (String(value).length > 4)) {
          return callback(new Error('大于0的4位数正整数'));
        }
      }
      callback();
    }
  }
};
</script>

<style lang="less" scoped>
/* .form-contain > form {
  min-width: 1000px;
} */
.form-contain .form-flex {
  display: flex;
}

.ineffective-option {
  text-decoration: line-through 2px;
  text-decoration-color: rgba(255, 0, 0, 0.4);
}

.form-contain .form-flex .form-flex__titile {
  margin-right: 20px;
  min-width: 50px;
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

.custom-label {
  display: inline-block;

  .label-icon {
    font-size: 17px;
    vertical-align: middle;
    cursor: pointer;

    .ivu-icon-md-checkmark-circle {
      color: #2d8cf0;
    }

    .ivu-icon-md-alert {
      color: #f30;
    }
  }

  :deep(.ivu-tooltip-inner) {
    background-color: #fff;
    color: #333;
    cursor: initial;
    white-space: initial;
  }
}

/* .form-contain .text-height {
  max-height: 200px;
  overflow: auto;
} */
</style>