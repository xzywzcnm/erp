<template>
  <div class="form-contain form-contain-disabled">
    <div class="form-info-contain" :class="{ 'show-switct': visibleSide }">
      <div class="tag-switct" v-if="visibleSide">
        <Button @click="handleClick('base')" size="large" :class="{ 'active-button': tagAction == 'base' }">基础资料</Button>
        <Button @click="handleClick('plate')" size="large"
          :class="{ 'active-button': tagAction == 'plate' }">打版资料</Button>
      </div>
      <!-- <div v-show="tagAction == 'base'"> -->
      <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="100" class="form-contain-item">
        <div class="contain-item-box" v-show="tagAction == 'base'">
          <Row>
            <Col span="12" style="padding-right: 10px;">
            <FormItem label="款式名称:" prop="styleName">
              <Input v-model="formValidate.styleName" placeholder="请输入款式名称，款式名称描述不作为正式商品名" clearable :disabled="canedit"
                style="max-width:400px"></Input>
            </FormItem>
            <FormItem label="编织类型:" :label-width="100" prop="braidType">
              <dyt-select v-model="formValidate.braidType" :disabled="canedit" placeholder="请选择编织类型">
                <Option v-for="(item, index) in braidData" :key="`b-${index}`" :value="item.value">{{ item.label }}
                </Option>
              </dyt-select>
            </FormItem>
            <!-- <FormItem label="描述:" prop="productDescribe">
              <Input v-model="formValidate.productDescribe" placeholder="请输入描述" clearable :disabled="canedit"
                style="max-width:400px" />
            </FormItem> -->
            <FormItem label="商品分类:" prop="productCategory">
              <Cascader :data="productList" v-model="formValidate.productCategory" @on-change="productCategoryChange"
                :disabled="canedit" change-on-select></Cascader>
            </FormItem>
            <template v-if="isListing">
              <FormItem label="listing商品分类:">
                <div class="text-height">{{ laPaProductInfo.listingClassification || '-' }}</div>
              </FormItem>
              <FormItem label="listing尺码:">
                <div class="text-height" v-if="laPaProductInfo.size && laPaProductInfo.size.length">
                  {{ laPaProductInfo.size.join(' / ') }}</div>
              </FormItem>
            </template>
            <!-- 可售尺码要根据商品分类的不同来展示 -->
            <FormItem label="可售尺码:">
              <template v-if="formValidate.productCategory.length">
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
            </Col>
            <Col span="12" class="partRight">
            <FormItem label="备注要求:" class="remarks" prop="productDescribe">
              <Input style="width: 100%;" v-model="formValidate.productDescribe" type="textarea" placeholder="请输入"
                :disabled="canedit" maxlength="2000" show-word-limit />
            </FormItem>
            </Col>
          </Row>

          <Row>
            <Col span="12" style="padding-right: 10px;">
            <FormItem label="颜色及图片:">
              <span>首图作为商品图片，每个颜色至少上传1张，每个颜色最多可上传5张图片，每张图片大小不超过5M</span>
            </FormItem>
            <FormItem label="颜色:" prop="color">
              <template v-if="formValidate.productCategory.length">
                <template v-if="isSizeType">
                  <Select v-model="formValidate.color" filterable transfer clearable multiple :disabled="canedit"
                    @on-change="colorChange">
                    <Option v-for="citem in colorList" :value="citem.colorId" :key="citem.colorId">{{ citem.color }}
                    </Option>
                  </Select>
                </template>
                <template v-if="!isSizeType">
                  <local-tag-input style="width: 540px; display: inline-block; line-height:normal;"
                    :tags="formValidate.color" @tagsMt="tagsMt" :disabled="canedit"
                    placeholder="enter确定颜色"></local-tag-input>
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
            <!-- <FormItem label="备注:">
                <Input
                  style="width: 100%;"
                  v-model="formValidate.remark"
                  type="textarea"
                  :autosize="{minRows: 2,maxRows: 5}"
                  placeholder="请输入"
                  :disabled="canedit"
                />
              </FormItem> -->
            <FormItem label="审款意见:" v-if="[1, 2].includes(productData.productSource)">
              <span v-if="canedit">{{ formValidate.reviewOpinions }}</span>
            </FormItem>
            </Col>
            <Col span="12" style="padding-right: 10px;">
            <!-- 图库 -->
            <basis-gallery ref="basisgallery" :modelVisible.sync="modelVisible" @picReturn="picReturn" :picList="picList"
              :isDisabled="canedit" />
            </Col>
          </Row>
        </div>
        <div class="contain-item-box" v-show="tagAction == 'plate'">
          <FormItem label="样衣颜色:" prop="colorIdList">
            <CheckboxGroup v-model="formValidate.colorIdList">
              <Checkbox v-for="(item, index) in colorPlateData" :key="`s-${index}`" :label="item.colorId"
                :disabled="canedit">{{ item.color }}</Checkbox>
            </CheckboxGroup>
          </FormItem>

          <FormItem label="样衣尺码:" :label-width="100" prop="sizeId">
            <dyt-select v-model="formValidate.sizeId" :disabled="canedit" placeholder="请选择样衣尺码">
              <Option v-for="(item, index) in (formValidate.pricelist || [])" :key="`s-${index}`" :value="item.sizeId">
                {{ item.size }}</Option>
            </dyt-select>
          </FormItem>
          <!-- 样衣尺码参考表 -->
          <div style="margin-top: 10px;">
            <div style="padding-left: 5px;margin-bottom: 5px; font-size: 20px; font-weight: bold;">
              <span>样衣尺码参考表</span>
              <span style="margin-left: 15px; font-size: 12px;">样衣尺码参考表不同步商品系统，仅在新品流程记录</span>
            </div>
            <div style="padding-left: 5px;margin-bottom: 15px; font-size: 20px; font-weight: bold;">
              <Button type="primary" v-if="!canedit" @click="pushFhData">新增</Button>
            </div>
            <Table :columns="[...frameHopping, ...frameTableHopping]" :data="formValidate.fhTableData" border
              highlight-row class="frame-hopping-table">
              <!-- 样衣尺码 -->
              <template slot-scope="{ index }" slot="sampleSize">
                <FormItem label="" :label-width="0" :prop="`fhTableData.${index}.sampleSize`" :rules="validatePrice">
                  <Input v-model="formValidate.fhTableData[index].sampleSize" placeholder="请输入" clearable
                    style="width:100%;" :disabled="canedit" />
                </FormItem>
              </template>
              <!-- 公差 -->
              <template slot-scope="{ index }" slot="publicErrand">
                <FormItem label="" :label-width="0" :prop="`fhTableData.${index}.publicErrand`" :rules="validatePrice">
                  <Input v-model="formValidate.fhTableData[index].publicErrand" placeholder="请输入" clearable
                    style="width:100%;" :disabled="canedit" />
                </FormItem>
              </template>
              <!-- 跳码 -->
              <template slot-scope="{ index }" slot="hoppingCode">
                <FormItem label="" :label-width="0" :prop="`fhTableData.${index}.hoppingCode`" :rules="sizeHoppMaxVerify">
                  <Input v-model="formValidate.fhTableData[index].hoppingCode" placeholder="请输入" clearable
                    style="width:100%;" :disabled="canedit" />
                </FormItem>
              </template>
              <!-- 追加的列(对应的尺码列) -->
              <template v-for="(pCol, Pindex) in frameTableHopping" slot-scope="{ index }" :slot="`${pCol.slot}`">
                <FormItem v-if="pCol.slot" label="" :label-width="0" :prop="`fhTableData.${index}.${pCol.slot}`" :key="`slot-${Pindex}`"
                  :rules="validatePrice">
                  <Input v-model="formValidate.fhTableData[index][pCol.slot]" placeholder="请输入" clearable
                    style="width:100%;" :disabled="canedit" />
                </FormItem>
              </template>
            </Table>
          </div>
          <!-- 生产尺码表 -->
          <div style="margin-top: 20px;" v-if="isShowHopping">
            <div style="padding-left: 5px;margin-bottom: 5px; font-size: 20px; font-weight: bold;">
              <span>生产尺码表</span>
            </div>
            <Table :columns="[...frameHopping, ...frameTableHopping]" :data="formValidate.fhopTableData" border
              highlight-row class="frame-hopping-table">
              <!-- 样衣尺码 -->
              <template slot-scope="{ index }" slot="sampleSize">
                <FormItem label="" :label-width="0" :prop="`fhopTableData.${index}.sampleSize`" :rules="validatePrice">
                  <Input v-model="formValidate.fhopTableData[index].sampleSize" placeholder="请输入" clearable
                    style="width:100%;" :disabled="!isEditHopping" />
                </FormItem>
              </template>
              <!-- 公差 -->
              <template slot-scope="{ index }" slot="publicErrand">
                <FormItem label="" :label-width="0" :prop="`fhopTableData.${index}.publicErrand`" :rules="validatePrice">
                  <Input v-model="formValidate.fhopTableData[index].publicErrand" placeholder="请输入" clearable
                    style="width:100%;" :disabled="!isEditHopping" />
                </FormItem>
              </template>
              <!-- 跳码 -->
              <template slot-scope="{ index }" slot="hoppingCode">
                <FormItem label="" :label-width="0" :prop="`fhopTableData.${index}.hoppingCode`"
                  :rules="sizeHoppMaxVerify">
                  <Input v-model="formValidate.fhopTableData[index].hoppingCode" placeholder="请输入" clearable
                    style="width:100%;" :disabled="!isEditHopping" />
                </FormItem>
              </template>
              <!-- 追加的列(对应的尺码列) -->
              <template v-for="(pCol, Pindex) in frameTableHopping" slot-scope="{ index }" :slot="`${pCol.slot}`">
                <FormItem v-if="pCol.slot" label="" :label-width="0" :prop="`fhopTableData.${index}.${pCol.slot}`" :key="`slot-${Pindex}`"
                  :rules="validatePrice">
                  <Input v-model="formValidate.fhopTableData[index][pCol.slot]" placeholder="请输入" clearable
                    style="width:100%;" :disabled="!isEditHopping" />
                </FormItem>
              </template>
            </Table>
          </div>
        </div>
      </Form>
      <!-- </div> -->
    </div>
    <!-- 指派弹框 -->
    <assign-user ref="assignUser" :productData="detailData" v-on="$listeners" :productSource="productSource" />
    <!-- 添加部分数据弹窗 -->
    <pushFhTable :modelVisible.sync="pushFhVisible" :modelData="pushModelFhData" @confirm="pushFhConfirm" />
    <Spin v-if="pageLoading" fix></Spin>
  </div>
</template>

<script>
import api from '@/api/api.js';
import pushFhTable from './pushFhTable';
import assignUser from './assignUser';
import basisGallery from '../components/basisGallery';
import previewImg from '@/components/uploadImg/previewImg';
import { compareFun } from '../components/sizeCompare.js';
export default {
  name: "createPlateData",
  components: { assignUser, pushFhTable, basisGallery, previewImg },
  props: {
    addType: { type: String, default: 'info' },
    btnoperat: { type: String, default: '' },
    productData: {
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
    // 供应商
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
    detailTag: { type: String, default: '' },
    visibleSide: { type: Boolean, default: true }
  },
  data() {
    return {
      tagAction: 'base',
      pageLoading: false,
      useStandTypeId: [0, 1],
      pushFhVisible: false,
      colorObj: {},
      pushModelFhData: {},
      partSizeData: {},
      braidData: [
        { label: '针织', value: 0 },
        { label: '梭织', value: 1 },
        { label: '毛织', value: 2 },
      ],
      formValidate: {
        styleName: '',
        productDescribe: '', // 描述
        productCategory: [],
        pricelist: [],
        braidType: null,
        sizeId: null,
        colorIdList: [],
        fhTableData: [],
        fhopTableData: [],
        // remark: '',
        color: [],
        colorPiclist: [],
        reviewOpinions: ''
      },

      ruleValidate: {
        styleName: [
          { required: true, validator: this.strMaxVerify, maxLength: 30, msg: '请输入款式名称', trigger: 'blur' },
          { required: true, validator: this.strMaxVerify, maxLength: 30, msg: '请输入款式名称', trigger: 'change' }
        ],
        braidType: [
          { required: true, message: '请选择编织类型', trigger: 'change', type: 'number' },
        ],
        sizeId: [
          { required: true, message: '请选择编织类型', trigger: 'change', type: 'number' },
        ],
        colorIdList: [
          { required: true, message: '请选择样衣颜色', trigger: 'change', type: 'array' },
        ],
        productCategory: [
          { required: true, message: '商品分类必填', trigger: 'change', type: 'array' },
        ],
        size: [
          { required: true, message: '尺寸必填', trigger: 'blur' },
        ],
        prices: [
          { required: true, validator: this.validatorMaxNumber, point: 2, msg: '请输入不小于0的整数或两位小数', trigger: 'change', type: 'number' },
          { required: true, validator: this.validatorMaxNumber, point: 2, msg: '请输入不小于0的整数或两位小数', trigger: 'blur', type: 'number' },
        ],
        color: [
          { required: true, message: '颜色必填', trigger: 'change', type: 'array' },
        ]
      },
      // 验证是否大于等于 0 的2位小数
      validatePrice: [
        { required: true, validator: this.validatorMaxNumber, point: 2, msg: '请输入不小于0的整数或两位小数', trigger: 'change', type: 'number' },
        { required: true, validator: this.validatorMaxNumber, point: 2, msg: '请输入不小于0的整数或两位小数', trigger: 'blur', type: 'number' },
      ],
      // 验证跳码
      sizeHoppMaxVerify: [
        { required: true, validator: this.strMaxVerify, msg: '请输入跳码值', maxLength: 50, trigger: 'blur' },
        { required: true, validator: this.strMaxVerify, msg: '请输入跳码值', maxLength: 50, trigger: 'change' }
      ],
      // 跳码表列设置
      frameHopping: [],
      frameTbalCol: [
        {
          title: '操作',
          key: 'operation',
          align: 'center',
          width: 90,
          render: (h, { row }) => {
            return h('div', {
              style: {
                cursor: 'pointer',
                color: '#2d8cf0'
              },
              on: {
                click: () => {
                  this.removeFrameData([row]);
                }
              }
            }, '移除');
          }
        },
        {
          title: '部位',
          key: 'position',
          align: 'center',
          minWidth: 100
        },
        {
          title: '量法',
          key: 'measurementDescription',
          align: 'center',
          minWidth: 100,
          render: (h, { row }) => {
            return h('div', {
              style: {
                'text-align': 'left'
              }
            }, row.measurementDescription);
          }
        },
        {
          title: '样衣尺码',
          slot: 'sampleSize',
          align: 'center',
          minWidth: 100,
        },
        {
          title: '公差',
          slot: 'publicErrand',
          align: 'center',
          minWidth: 100,
        },
        {
          title: '跳码',
          slot: 'hoppingCode',
          align: 'center',
          minWidth: 100
        }
      ],
      productList: [],
      colorList: [],
      fileLists: [],
      isEditHopping: false,
      isShowHopping: false,
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
    };
  },
  watch: {
    isedit: {
      deep: true,
      immediate: true,
      handler(newVal) {
        if (newVal) {
          // 待样式审核状态是否可编辑尺码
          if (!this.$common.isEmpty(this.isedit.btnoperat)) {
            // 是否显示生产尺码表数据
            this.isShowHopping = !['edit', 'subverify', 'materialConfirm', 'sampleConfirm'].includes(this.isedit.btnoperat);
            // 是否可编辑生产尺码表数据
            this.isEditHopping = ['perfectSample'].includes(this.isedit.btnoperat);
          } else if (!this.$common.isEmpty(this.productData) && !this.$common.isEmpty(this.productData.status)) {
            // 是否显示生产尺码表数据
            this.isShowHopping = ![0, 17, 13].includes(this.productData.status);
          }
          // 是否可编辑
          this.canedit = !(this.isedit.editBasic || ['edit', 'subverify'].includes(this.isedit.btnoperat));
          if (this.canedit) {
            this.frameHopping = this.frameTbalCol.filter(fil => fil.key != 'operation')
          } else {
            this.frameHopping = this.frameTbalCol;
          }
        }
      }
    },
    detailTag: {
      deep: true,
      immediate: true,
      handler(val) {
        this.tagAction = val == 'editBasicData' ? 'plate' : 'base';
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
      if (!this.$common.isEmpty(this.productData)) {
        return this.productData.productId;
      }
      return '';
    },
    // 样衣颜色
    colorPlateData() {
      if (this.$common.isEmpty(this.colorList) || this.$common.isEmpty(this.formValidate.color)) return [];
      const vals = this.colorList.filter(item => {
        return this.formValidate.color.includes(item.colorId);
      })
      return vals;
    },
    // 跳码表追加的列
    frameTableHopping() {
      let pushCol = [];
      (this.formValidate.pricelist || []).forEach(item => {
        if (!this.$common.isEmpty(item.sizeId)) {
          pushCol.push({
            title: item.size,
            slot: `slot-${item.size}-${item.sizeId}`,
            align: 'center',
            minWidth: 100,
          })
        }
      })
      return pushCol;
    }
  },
  created() {
    this.pageLoading = true;
    this.getColorList().finally(() => {
      this.categoryData();
      let awaitRes = [this.initPage, this.getSizePartList];
      if (!this.$common.isEmpty(this.productData)) {
        awaitRes.push(this.getProductDetail);
        awaitRes.push(this.getPicStock);
        awaitRes.push(this.getPatternInfo);
      }
      this.$common.promiseAll(awaitRes).finally(() => {
        this.pageLoading = false;
      }).catch(err => {
        console.error(err);
      })
    })

  },
  methods: {
    initPage() {
      return new Promise((resolve) => {
        resolve(true);
      })
    },
    // 获取新品详情
    getProductDetail() {
      return new Promise((resolve) => {
        let { productId } = this.productData;
        this.$axios.get(api.queryLaPaProductInfo, { params: { productId: productId } }).then(({ code, datas }) => {
          if (code === 0) {
            this.isopendetail = true;
            let temp = datas || {};
            this.detailData = temp;

            // listing数据处理
            if (this.isListing) {
              this.laPaProductInfo = this.$common.copy(temp.laPaProductInfo || {});
              let listingPrice = JSON.parse(this.laPaProductInfo.listingPrice);
              this.laPaProductInfo.listingPrice = listingPrice;
            }
            // 后端坑人将sizeid转字符型，这里手动将数据转为数值型
            temp.laPaProductSizeRelList.forEach(k => {
              k.sizeId = k.sizeId - 0;
            })
            // 推款和非推款（推款：设计号，非推款：款式名称）
            // 基础信息
            this.formValidate.styleName = temp.laPaProductInfo.styleName;
            this.formValidate.braidType = temp.laPaProductInfo.braidType;
            this.formValidate.productDescribe = temp.laPaProductInfo.productDescribe;
            // this.formValidate.remark = temp.laPaProductInfo.remark;
            this.formValidate.reviewOpinions = temp.laPaProductInfo.reviewOpinions;
            this.formValidate.productCategory = this.allCategoryId(temp.laPaProductInfo.goodTypeId);
            this.productCategoryChange([temp.laPaProductInfo.goodTypeId], 'init');
            // 尺码
            if (!(temp.laPaProductInfo.sizeType || temp.laPaProductInfo.sizeType === 0)) {
              let arr = [];
              temp.laPaProductSizeRelList.forEach(citem => {
                if (citem.modelName && !citem.sizeId) {
                  arr.push({ size: citem.modelName, prices: citem.price });
                }
              });
              this.formValidate.pricelist = arr;
            }
            // 颜色
            let arr = [];
            this.formValidate.color = [];
            let colorInfo = {};
            temp.laPaPictureColorRelList.forEach(k => {
              let fileList = k.pictureUrl ? k.pictureUrl.split(',') : [];
              fileList = fileList.map((k) => {
                let list = k ? k.split('/') : [];
                let urlname = list[list.length - 1];
                return { name: urlname, url: k };
              });
              if (k.colorId) {
                colorInfo = this.colorObj[k.colorId];
                arr.push({ color: this.$common.isEmpty(colorInfo) ? k.color : colorInfo.color, colorId: k.colorId, fileLists: fileList });
                this.formValidate.color.push(k.colorId);
              } else if (k.diyColor) {
                arr.push({ color: k.diyColor, fileLists: fileList });
                this.formValidate.color.push({ attrVal: k.diyColor });
              }
            });
            this.formValidate.colorPiclist = arr;
          }
          resolve(datas || {});
        }).catch((err) => {
          console.error(err);
          resolve({});
        });
      })
    },
    // 查询打版资料信息
    getPatternInfo() {
      return new Promise((resolve) => {
        this.$axios.get(api.queryPatternInfo, { params: { productId: this.productData.productId } }).then(({ code, datas = {} }) => {
          if (code != 0 || this.$common.isEmpty(datas)) return resolve({});
          if (!this.$common.isEmpty(datas.colorIdList)) {
            this.$set(this.formValidate, 'colorIdList', datas.colorIdList.split(',').map(m => Number(m)));
          }
          this.$set(this.formValidate, 'size', datas.size);
          this.$set(this.formValidate, 'sizeId', Number(datas.sizeId));
          let fhTableData = [];
          let fhopTableData = [];
          if (!this.$common.isEmpty(datas.laPaProductPatternInfoTableQOList)) {
            datas.laPaProductPatternInfoTableQOList.forEach(row => {
              if (!this.$common.isEmpty(row.laPaProductPatternInfoTableSizeQOList)) {
                row.laPaProductPatternInfoTableSizeQOList.forEach(item => {
                  row[`slot-${item.size}-${item.sizeId}`] = this.$common.isEmpty(Number(item.value)) ? item.value : Number(item.value);
                })
              }
              delete row.laPaProductPatternInfoTableSizeQOList;
              // 跳码表类型：1: 样衣参考跳码表 2: 生产尺码表 
              if (this.$common.isEmpty(row.type) || row.type == 1) {
                fhTableData.push({ ...row, type: 1 });
                if (this.isEditHopping) {
                  fhopTableData.push({ ...row, type: 2 });
                }
              } else if (row.type == 2) {
                fhopTableData.push(row);
              }
            })
            this.$set(this.formValidate, 'fhTableData', this.$common.copy(fhTableData));
            this.$set(this.formValidate, 'fhopTableData', this.$common.copy(fhopTableData));
          }
          resolve(datas);
        }).catch((err) => {
          console.error(err);
          resolve({});
        });
      })
    },
    // 获取尺码部位部位测量数据
    getSizePartList() {
      return new Promise((resolve) => {
        this.axios.get(api.queryAllProductSizePartList).then((res) => {
          if (res.code !== 0) {
            resolve({});
            return;
          }
          let obj = {};
          (res.datas || []).forEach(k => { obj[k.partId] = k; });
          this.partSizeData = obj;
          this.$set(this.pushModelFhData, 'tableData', (res.datas || []));
          resolve(obj);
        }).catch(() => {
          resolve({});
        })
      })
    },
    // 切换
    handleClick(str) {
      this.tagAction = str;
    },
    // 添加部位测量数据
    pushFhData() {
      this.$set(this.pushModelFhData, 'fhTableData', this.formValidate.fhTableData);
      this.$nextTick(() => {
        this.pushFhVisible = true;
      })
    },
    // 确认添加部位测量数据
    pushFhConfirm(data) {
      let rowsDefaultVal = {};
      [...this.frameHopping, ...this.frameTableHopping].forEach(m => {
        if (m.key !== 'operation') {
          if (!this.$common.isEmpty(m.key)) {
            rowsDefaultVal[m.key] = null;
          } else if (!this.$common.isEmpty(m.slot)) {
            rowsDefaultVal[m.slot] = null;
          }
        }
      });
      let itemVal = {};
      const pushList = data.map(item => {
        itemVal = {
          ...rowsDefaultVal,
          ...item,
          type: 1,
          position: item.cnName,
          positionId: item.partId
        }
        delete itemVal.partId;
        Object.keys(itemVal).forEach(key => {
          if (key.substring(key.length - 4, key.length) === 'Name') {
            delete itemVal[key];
          }
        })
        return itemVal;
      });
      this.formValidate.fhTableData = [...this.formValidate.fhTableData, ...pushList];
    },
    // 获取云仓图库
    getPicStock() {
      return new Promise((resolve) => {
        let { productId } = this.productData;
        this.$axios.get(api.getCloudPicture, { params: { productId } }).then(({ code, datas }) => {
          if (code !== 0) return resolve({});
          let list = datas || [];
          this.picList = list.map(k => {
            return { url: k.pictureUrl }
          })
          resolve(this.picList);
        }).catch((err) => {
          console.error(err);
          resolve({});
        });
      })
    },
    // 保存 type:1提交审核 2保存
    handleSubmit(type, btnoperat) {
      return new Promise((resolve) => {
        let [temp, laPaProductInfo, laPaProductSizeRelList, laPaPictureColorRelList] = [{}, {}, [], []];
        let plateInfo = {};
        let data = this.formValidate;
        laPaProductInfo.styleName = data.styleName;
        laPaProductInfo.goodTypeId = data.productCategory[data.productCategory.length - 1];
        // laPaProductInfo.remark = data.remark;
        laPaProductInfo.reviewOpinions = data.reviewOpinions;
        laPaProductInfo.productId = this.productData.productId || null;
        laPaProductInfo.braidType = data.braidType;
        laPaProductInfo.productDescribe = data.productDescribe;
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
            return resolve({ success: false, message: '尺寸不能重复，请检查' });
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
            return resolve({ success: false, message: '尺寸不能重复，请检查' });
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

        let obj = {};
        data.colorPiclist.forEach(k => {
          if (!this.$common.isEmpty(k.color)) {
            if (obj[k.color]) {
              obj[k.color] += 1;
            } else {
              obj[k.color] = 1;
            }
          }
        });
        for (let i in obj) {
          if (obj[i] > 1) {
            this.$Message.error('颜色不能重复，请检查~');
            return resolve({ success: false, message: '颜色不能重复，请检查' });
          }
        }

        // 云仓商品图片资料信息
        let filePiclist = this.$refs.basisgallery.filePiclist || [];
        temp.laPaProductPictures = filePiclist.map(k => {
          return { pictureUrl: k.url };
        });
        // 当前尺码类型下的所有尺码
        temp.laPaProductSizeInfos = this.laPaProductAllSize;
        // 打版资料信息
        plateInfo.productId = this.productData.productId || null;
        plateInfo.colorList = (this.colorList || []).filter(item => {
          return (data.colorIdList || []).includes(item.colorId)
        }).map(m => {
          return m.color;
        }).join(',');
        plateInfo.colorIdList = (data.colorIdList || []).join(',');
        plateInfo.size = null;
        const getSize = (this.formValidate.pricelist || []).find(item => {
          return item.sizeId == data.sizeId;
        });
        if (!this.$common.isEmpty(getSize)) {
          plateInfo.size = getSize.size;
        }
        plateInfo.sizeId = data.sizeId;
        // isShowHopping 为 true 时则是生产尺码表保存
        if (this.isShowHopping) {
          const fhTableData = this.handFhTableData(this.$common.copy(data.fhTableData));
          const fhopTableData = this.handFhTableData(this.$common.copy(data.fhopTableData));
          plateInfo.laPaProductPatternInfoTableQOList = [...fhTableData, ...fhopTableData];
        } else {
          plateInfo.laPaProductPatternInfoTableQOList = this.handFhTableData(this.$common.copy(data.fhTableData));
        }
        delete temp.pricelist;
        if (type === 1) {
          this.$refs['formValidate'].validate((valid) => {
            if (!valid) {
              this.$Message.error('基础资料或打版资料存在必填项未填写！');
              return resolve({ success: false, message: '基础资料或打版资料存在必填项未填写！' });
            }
            if (this.$common.isEmpty(plateInfo.laPaProductPatternInfoTableQOList)) {
              this.$Message.error('跳码表不能为空');
              return resolve({ success: false, message: '跳码表不能为空' });
            }
            this.pageLoading = true;
            // 提交审核
            this.saveDetailHand(temp, plateInfo, !['perfectSample'].includes(btnoperat)).then(res => {
              if (!res.success) return resolve({ success: false });
              !['perfectSample'].includes(btnoperat) && this.verifySubmit(res.data, type);
              resolve({ success: true, data: res });
            }).finally(() => {
              this.pageLoading = false;
            });
          })
        } else {
          this.pageLoading = true;
          this.saveDetailHand(temp, plateInfo, !['perfectSample'].includes(btnoperat)).then(res => {
            if (!res.success) return resolve({ success: false });
            this.$Message.success('保存成功！');
            resolve({ success: true, data: res, isColose: true });
          }).finally(() => {
            this.pageLoading = false;
          });
        }
      })
    },
    // 保存数据
    saveDetailHand(temp, plateInfo, isSaveBase = true) {
      return new Promise((resolve) => {
        if (!isSaveBase) {
          this.$axios.post(api.savePatternInfo, { ...plateInfo, productId: this.productData.productId }).then((res) => {
            if (res.code != 0 || this.$common.isEmpty(res.datas)) return resolve({ success: false });
            resolve({ success: true, data: this.productData.productId });
          }).catch(() => {
            resolve({ success: false });
          })
          return;
        }
        this.$axios.post(api.saveBase, temp).then(({ code, datas }) => {
          if (code != 0 || this.$common.isEmpty(datas)) return resolve({ success: false });
          this.$axios.post(api.savePatternInfo, { ...plateInfo, productId: datas }).then((res) => {
            if (res.code != 0 || this.$common.isEmpty(res.datas)) return resolve({ success: false });
            resolve({ success: true, data: datas });
          }).catch(() => {
            resolve({ success: false });
          })
        }).catch(() => {
          resolve({ success: false });
        })
      })

    },
    // 处理跳码表数据
    handFhTableData(data) {
      const removeKey = ['classificationIdList', 'classificationNameList']
      const keySplit = 'slot-';
      let startKey = '';
      let endKey = '';
      let keyVal = [];
      const newData = this.$common.copy(data);
      newData.forEach(item => {
        item.laPaProductPatternInfoTableSizeQOList = [];
        Object.keys(item).forEach(key => {
          startKey = key.substring(0, keySplit.length);
          if (startKey === keySplit) {
            endKey = key.substring(keySplit.length, key.length);
            if (this.$common.isEmpty(endKey)) return;
            keyVal = endKey.split('-');
            item.laPaProductPatternInfoTableSizeQOList.push({
              size: keyVal[0],
              sizeId: keyVal[1],
              value: item[key]
            })
            delete item[key];
          }
          if (removeKey.includes(key)) {
            delete item[key];
          }
        })
      });
      return newData;
    },
    // 提交审核
    verifySubmit(productId, type) {
      this.$refs.assignUser && this.$refs.assignUser.nextDialogOpen(
        {
          title: "提交需求确认",
          content: "需求确认",
          productId: productId,
          type: type,
          status: 0
        }
      );
    },
    // 增加尺码/型号
    sizeChange(type, index) {
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
    sizeCheckbox(index) {
      let arr = [];
      let data = this.sizeTypeList;
      let pricelist = {};
      this.formValidate.pricelist.forEach(k => {
        pricelist[k.sizeId] = k;
      });
      data[index].list.filter((item) => {
        data[index].sizeList.forEach(k => {
          if (k === item.sizeId) {
            let priceItem = pricelist[item.sizeId];
            if (priceItem && priceItem.sizeGroupNo == index) {
              arr.push({ size: item.size, prices: priceItem.prices, sizeId: item.sizeId, sizeGroupNo: index });// 保留原先价格
            } else {
              arr.push({ size: item.size, prices: '', sizeId: item.sizeId, sizeGroupNo: index });
            }
          }
        });
      });
      // 只能对当中某个分类下的尺码进行选择
      Object.keys(data).forEach(k => {
        if (index !== k) {
          this.sizeTypeList[k].sizeList = [];
        }
      });
      this.formValidate.pricelist = arr;
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

      // 优先取决于详情内存在的sizeType 不存在再从商品分类id找到分类下的尺码id
      let sizeType = detailData.laPaProductInfo && detailData.laPaProductInfo.sizeType;
      if (JSON.stringify(detailData) !== '{}' && (sizeType || sizeType === 0) && this.isopendetail) {
        this.isopendetail = false;
        this.queryProductSizeList(sizeType, type);
        this.isSizeType = { sizeType: sizeType };
      } else if (result) {
        this.queryProductSizeList(result.sizeType, type);
      }
      this.formValidate.colorPiclist.forEach((k, i) => {
        this.formValidate.colorPiclist[i].color = ''; //置空颜色值
      });
      this.formValidate.pricelist = []; //置空价格列表
    },
    // 根据尺码类型获取尺码组
    queryProductSizeList(sizeTypeId, type) {
      this.sizeTypeList = {};
      this.getGoodsSizeData(sizeTypeId, type).then((datas) => {
        let list = this.sortSize(datas || []);
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
      })
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
      return new Promise((resolve) => {
        if (this.colorList.length) return resolve(this.colorList);
        this.$axios.get(api.queryProductColorList).then(({ code, datas }) => {
          if (code !== 0) return resolve([]);
          this.colorList = datas || [];
          (datas || []).forEach(item => {
            this.$set(this.colorObj, item.colorId, item);
          })
          resolve(datas || []);
        }).catch(() => {
          resolve([]);
        })
      })
    },
    // 移除跳码表数据
    removeFrameData(row) {
      if (this.$common.isEmpty(row)) return;
      const rowName = row.map(item => item.position);
      this.$Modal.confirm({
        title: '操作',
        content: `<p>确认移除部位：${rowName.join('，')}？</p>`,
        loading: true,
        onOk: () => {
          const rowIds = this.$common.isArray(row) ? row.map(item => item.positionId) : [row.positionId];
          this.formValidate.fhTableData = this.formValidate.fhTableData.filter(item => {
            return !rowIds.includes(item.positionId);
          });
          this.$Modal.remove();
        }
      })
    },
    validatorMaxNumber(rule, value, callback) {
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
    // 字符长度验证
    strMaxVerify(rule, value, callback) {
      const maxLength = Number(rule.maxLength);
      if (rule.required && this.$common.isEmpty(value)) {
        return callback(new Error(rule.msg || '必填项不能为空'));
      }
      if (!this.$common.isEmpty(maxLength) && !this.$common.isEmpty(value) && value.length > maxLength) {
        return callback(new Error(`最多可输入 ${maxLength} 字符长度`));
      }
      callback();
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
          resolve(valid ? true : false);
        });
      });
    }
  }
};
</script>

<style lang="less" scoped>
.form-contain {
  height: 100%;

  >form {
    min-width: 1000px;
  }

  .form-flex {
    display: flex;

    .form-flex__titile {
      margin-right: 20px;
      min-width: 50px;
    }
  }

  .quote-sty {
    .ivu-select-selection {
      border-radius: 4px 0 0 4px;
      border-right: none;
    }

    .ivu-input {
      border-radius: 0 4px 4px 0;
    }
  }

  .icon-sty {
    cursor: pointer;
    font-weight: bold;
  }

  .form-info-contain {
    display: flex;
    height: 100%;

    .form-contain-item {
      flex: 100;
      height: 100%;
      width: 100%;

      .contain-item-box {
        max-height: 100%;
        overflow: auto;
      }
    }

    &.show-switct {
      .form-contain-item {
        width: calc(100% - 100px);
      }
    }

    .tag-switct {
      width: 100px;
    }
  }

  .active-button {
    border-color: #2d8cf0;
    color: #2d8cf0;
  }

  .frame-hopping-table {
    :deep(.ivu-form-item) {
      margin: 0;
    }
  }

  :deep(.ivu-table-column-center) {
    .ivu-table-cell {
      &:first-child {
        padding: 8px;
        white-space: initial;
        word-break: break-word;
        text-overflow: initial;
        overflow: initial;
      }
    }
  }

  .partRight {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding-right: 10px;

    .remarks {
      :deep(.ivu-input-wrapper) {
        width: 100%;
        max-width: 100%;
      }

      :deep(.ivu-form-item-label) {
        float: none;
      }

      :deep(.ivu-form-item-content) {
        margin-left: 0 !important;

        textarea {
          resize: none;
          height: 250px !important;
          max-height: 250px !important;
          overflow-y: auto !important;
        }
      }
    }
  }
}
</style>