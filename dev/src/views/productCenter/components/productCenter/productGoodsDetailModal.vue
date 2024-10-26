<template>
  <div>
    <Form ref="productGoodsForm" :rules="ruleValidate" :model="productGoods" :label-width="100" label-position="left">
      <!--左边区域-->
      <h2>{{ highlightRow.sku }}</h2>
      <div class="margin-bottom-10" style="height:35px;line-height:35px;">
        <Icon v-show="!isDisabled" size="20" type="ios-copy-outline"></Icon>
        <span v-show="!isDisabled" @click="copySku" class="cursor">复制此SKU</span>
        <div class="float-right margin-bottom-10" v-show="!isDisabled">
          <Button type="primary" :loading="waitingOk" @click="beforeSave">保存 </Button>
          <Button @click="cancel">取消</Button>
        </div>
        <Alert v-show="productGoods.productGoodsId == null" class="float-right margin-right-10" type="warning" show-icon>
          复制SKU：先修改属性值和SKU,然后点击保存
        </Alert>
      </div>
      <div class="float-left clear" style="width:45%">
        <div class="block-border padding-15" style="height:100px;">
          <div class="float-left" style="width:33%;">
            <img :src="productInfo.productPrimaryImage" />
          </div>
          <div class="float-left" style="width:33%;">
            <h3 :title="productInfo.cnName" class="text-overflow-ellipsis">{{ productInfo.cnName }}</h3>
            <div class="normalTop">
              {{ productGoodsData.length }} 个多属性商品
            </div>
            <div @click="backSpu" class="normalTop text-underline cursor blueColor">返回SPU
            </div>
          </div>
          <div class="float-left" style="width:33%;text-align:right;">
            <h3 v-if="productInfo.productCategoryNavigation" :title="productInfo.productCategoryNavigation" class="text-overflow-ellipsis">所属分类：{{ productInfo.productCategoryNavigation }}</h3>
          </div>
        </div>
        <div class="normalTop">
          <div style="background-color:white;color:black;border-bottom:0;" class="block-border productsTit padding-10">
            多属性商品
          </div>
          <Table id="productGoodsDataTable" ref="productGoodsDataTable" highlight-row :border="true" @on-row-click="onRowClick" @on-current-change="onCurrentChange" :show-header="false" :columns="productGoodsColumn" :data="productGoodsData"></Table>
        </div>
      </div>
      <!--右边区域-->
      <div class="float-right" style="width:52%">
        <div class="block-border min-height-150">
          <div class="productsTit padding-10">属性值维护</div>
          <div class="padding-10" style="display:inline-block;">
            <template>
              <Form-item
                v-for="(productGoodsSpecification,index) in productGoods.productGoodsSpecifications"
                :key="index"
                :class="['ivu-form-item-required', {'ivu-form-item-error':productGoodsSpecification.value == null || productGoodsSpecification.value == ''}]"
                :label="productGoodsSpecification.name + '：'"
              >
                <Input :maxlength="100" class="w300" :disabled="isDisabled" :placeholder="'请输入' + productGoodsSpecification.name" v-model.trim="productGoodsSpecification.value"></Input>
                <div v-show="productGoodsSpecification.value == null || productGoodsSpecification.value == ''" class="ivu-form-item-error-tip">
                  {{ productGoodsSpecification.name + '不能为空' }}
                </div>
              </Form-item>
            </template>
          </div>
          <!--修改图片-->
          <div class="float-right padding-10 text-align-center">
            <img class="w60 h60" :src="productGoods.productGoodsImages.length < 1 ? this.placeholderSrc : filenodeViewTargetUrl + productGoods.productGoodsImages[0]" />
            <div @click="modifyImg" class="text-underline cursor blueColor" v-show="!isDisabled">
              修改图片
            </div>
          </div>
        </div>
        <div class="block-border normalTop">
          <div class="productsTit padding-10">基础信息</div>
          <div class="padding-10">
            <Form-item label="SKU：" prop="sku">
              <!-- :disabled="isDisabled" -->
              <Input class="w360" :maxlength="100" :disabled="true" placeholder="请输入SKU" v-model.trim="productGoods.sku"></Input>
            </Form-item>
            <Form-item label="SKC：" prop="skc">
              <Input class="w360" :maxlength="100" :disabled="isDisabled" placeholder="请输入SKC" v-model="productGoods.skc" />
            </Form-item>
            <Form-item label="UPC：" v-if="!isSupplierTalg">
              <Input :maxlength="100" class="w360" :disabled="isDisabled" placeholder="请输入UPC" v-model.trim="productGoods.upc"></Input>
            </Form-item>
            <Form-item label="EAN：" v-if="!isSupplierTalg">
              <Input :maxlength="100" class="w360" :disabled="isDisabled" placeholder="请输入EAN" v-model.trim="productGoods.ean"></Input>
            </Form-item>
            <Form-item label="ISBN：" v-if="!isSupplierTalg">
              <Input :maxlength="100" class="w360" :disabled="isDisabled" placeholder="请输入ISBN" v-model.trim="productGoods.isbn"></Input>
            </Form-item>
            <Form-item label="特性标签：" v-if="!isSupplierTalg">
              <dyt-select
                @on-enter="addCustomTag"
                :disabled="isDisabled"
                ref="productGoodsTagsSelect"
                v-model.trim="productGoods.productGoodsTags"
                filterable
                multiple
                class="w360"><Option
                v-for="(name,index) in customProductTagList" :key="index" :value="name">{{ name }}</Option>
              </dyt-select>
            </Form-item>
            <Form-item :label="textTalg + '：'">
              <InputNumber :min="0" :disabled="isDisabled" class="w360" :placeholder="'请输入' + textTalg" v-model.trim="productGoods.suggestPrice"></InputNumber>
            </Form-item>
            <Form-item v-if="!isSupplierTalg">
              <label slot="label">
                <span>商品状态：</span>
                <Tooltip placement="right-start" style="vertical-align: middle;">
                  <Icon type="ios-help-circle-outline" style="color: #f60; font-size: 18px;cursor: pointer;font-weight: bold;" />
                  <div slot="content">
                    <p v-for="(text, index) in statusTips" :key="`tips-${index}`">{{text}}</p>
                  </div>
                </Tooltip>
              </label>
              <RadioGroup v-model="productGoods.status">
                <Radio v-for="(item, index) in productStatus" :key="`radio-${index}`" :disabled="isDisabled" :label="item.value" style="marginRight:15px">{{item.label}}</Radio>
              </RadioGroup>
            </Form-item>
            <Form-item label="上架状态：">
              <span>{{ productInfo.statusText }}</span>
            </Form-item>
            <Form-item label="驳回原因：">
              <Input v-model.trim="productInfo.shelvedRejectReason" disabled type="textarea" :rows="4"></Input>
            </Form-item>
          </div>
        </div>
        <div class="block-border normalTop">
          <div class="productsTit padding-10">商品规格</div>
          <div class="padding-10">
            <Form-item label="商品重量（g）：">
              <InputNumber :min="0" :precision="0" :disabled="isDisabled" class="w360" placeholder="请输入商品重量（g）" v-model.trim="productGoods.weight"></InputNumber>
            </Form-item>
            <Form-item label="商品尺寸（cm）：">
              <InputNumber :min="0" :max="9999.99" :disabled="isDisabled" style="width:80px" placeholder="长" v-model.trim="productGoods.length"></InputNumber>
              <InputNumber :min="0" :max="9999.99" :disabled="isDisabled" style="width:80px" placeholder="宽" v-model.trim="productGoods.width"></InputNumber>
              <InputNumber :min="0" :max="9999.99" :disabled="isDisabled" style="width:80px" placeholder="高" v-model.trim="productGoods.height"></InputNumber>
            </Form-item>
            <Form-item label="商品体积（cm³）：">
              {{ Math.round(productGoods.length * productGoods.width * productGoods.height * 100) / 100 }}
            </Form-item>
          </div>
        </div>
        <!-- 组装信息 -->
        <div class="productsCont normalTop" v-if="!isSupplierTalg">
          <div class="productsTit padding-10">
            <div id="assemble">
              组装信息
            </div>
          </div>
          <div class="products-content padding-10">
            <div class="isAssemble">
              是否组装：
              <i-switch style="marginLeft:20px;" v-model="isAssemble" @on-change="assembleChange" :disabled="isDisabled">
                <span slot="open">开启</span> <span slot="close">关闭</span>
              </i-switch>
            </div>
            <div style="marginTop:10px;" v-if="isAssemble">
              组装信息： <span @click="addAssemble" v-show="!isDisabled" style="color:#349EFA;text-decoration:underline;cursor:pointer;marginLeft:10px;">添加组装信息</span>
              <Table highlight-row border style="margin:20px 20px 10px;" :show-header="false" v-show="addAssembleData.length > 0" :columns="addAssembleColumns" :data="addAssembleData"></Table>
            </div>
          </div>
        </div>
        <div class="productsCont normalTop" v-if="!isSupplierTalg">
          <div class="productsTit padding-10">
            <!-- 物流匹配属性 -->
            <div id="matchingLogistics">
              物流匹配属性
            </div>
          </div>
          <div class="products-content padding-10">
            <!-- 产品类型 -->
            <FormItem label="产品类型:">
              <CheckboxGroup v-model="productTypeListValue" @on-change="productTypeChange">
                <Checkbox :disabled="isDisabled" v-for="(item,index) in productTypeList" :key="index" :label="item.value">
                  <span>{{ item.name }}</span>
                </Checkbox>
              </CheckboxGroup>
            </FormItem>
          </div>
        </div>
      </div>
    </Form>
    <keep-alive>
      <Modal v-model="modifyProductGoodsImgModal" v-if="renderModifyProductGoodsImgModal" title="变参SKU图片选择">
        <h2>SKU图片</h2>
        <div class="product-upload-list" v-for="(productGoodsImage, uploadIndex) in productGoodsImageArray" :key="`upload-${uploadIndex}`">
          <img :src="filenodeViewTargetUrl + productGoodsImage">
          <div class="product-upload-list-cover">
            <Icon style="marginLeft:5px" title="设为主图" type="ios-home-outline" @click.native="setProductGoodsPrimaryImg(productGoodsImage)"></Icon>
            <Icon style="marginRight:5px" title="删除" type="ios-trash-outline" @click.native="removeProductGoodsImg(productGoodsImage)"></Icon>
          </div>
        </div>
        <template v-for="(file,index) in uploadList">
          <div :key="index" v-if="file.status !== 'finished'" class="product-upload-list">
            <Progress v-if="file.showProgress" :percent="file.percentage"></Progress>
          </div>
        </template>
        <dytUpload name="files" ref="uploadProductGoodsImg" :headers="uploadFilesHeader" :show-upload-list="false" :max-size="uploadFilesMaxSize" :on-exceeded-size="uploadExceedSize" :format="['jpg', 'png', 'gif']" :on-error="uploadFilesError" :on-success="uploadFilesSuccess" :on-format-error="handleFormatError" :action="uploadFilesUrl" multiple :before-upload="beforeUpload" type="drag" style="display: inline-block;width:100px;">
          <div style="width: 100px;height:100px;line-height: 100px;">
            <Icon type="md-add" size="20"></Icon>
          </div>
        </dytUpload>
        <p style="margin-top:5px;margin-bottom:10px;">说明：<span style="color:red">上传图片会自动添加至SPU图库中</span>
        </p>
        <hr>
        <h2 style="margin-top:5px;margin-bottom:5px;">从SPU图库选择</h2>
        <template v-for="(productGoodsImage,index) in productInfo.productImages">
          <div class="product-upload-list" v-if="productInfo.productImages" :key="`imageView-${index}`">
            <img :src="filenodeViewTargetUrl + productGoodsImage">
            <div class="product-upload-list-cover">
              <Button @click="addSkuPic(index)" style="outline:none;box-shadow:none;" size="small" type="text">添加至SKU </Button>
            </div>
          </div>
        </template>
        <div class="product-spu-list" v-if="productInfo.productImages  && productInfo.productImages.length === 0">
          <Icon type="image" size="30" color="#d4d4d4"></Icon>
          <p>未添加图片</p>
        </div>
        <div slot="footer">
          <Button type="primary" size="small" @click="uploadModalConfirm">确定 </Button>
          <Button size="small" @click="uploadModalCancel">取消 </Button>
        </div>
      </Modal>
    </keep-alive>
    <!-- 添加组装模态框 -->
    <addAssembleModal ref="addAssembleModal" @addTabData="addTabData" :openType="openType"></addAssembleModal>
  </div>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import productMixin from '@/components/mixin/product_mixin';
// import { getToken } from '@/utils/cookie';
import addAssembleModal from './addAssembleModal';
import productData from '@/views/productCenter/components/productCenter/staticData/productData';

export default {
  mixins: [Mixin, productMixin],
  components: { addAssembleModal },
  props: ['editProductGoods', 'productTagList', 'productGoodsDetailModal', 'editStatus'],
  data () {
    var self = this;
    return {
      productStatus: productData.productStatus,
      statusTips: productData.statusTips,
      productTypeListValue: ['01'],
      pageParamsStatus: false, // 是否重新加载sku列表数据
      customProductTagList: [], // 这个标签列表包含自定义标签
      highlightRow: {}, // 当前高亮行
      waitingOk: false, // 点击确认按钮是否需要显示loading遮罩
      modifyProductGoodsImgModal: false, // 修改货品图片模态窗口
      renderModifyProductGoodsImgModal: false, // 渲染修改货品图片模态窗口
      filenodeViewTargetUrl: self.$store.state.erpConfig.filenodeViewTargetUrl, // filenode根路径
      uploadList: [], // 新增的图片列表
      productGoodsImageArray: [], // 临时存放上传图片的数组
      uploadFilesUrl: api.upload_files + '?basePath=/product&&actoin="uploadImage"', // 上传url
      uploadFilesMaxSize: 10240, // 上传文件大小上线（kb）
      uploadMaxLength: 5, // 一次最多选中5个图片上传
      specificationColorList: [ // 规格颜色
        '#169BD5', '#009900', '#763EAF', '#CC0033', '#FF9900', '#999999', '#33CC99', '#663300'
      ],
      ruleValidate: { // 表单校验规则
        sku: [
          {
            required: true,
            message: 'SKU' + '不能为空',
            trigger: 'blur'
          }, {
            validator: this.validateFormSku,
            trigger: 'blur'
          }
        ],
        skc: [
          { required: true, validator: this.validateFormSkc, trigger: 'blur' },
          { required: true, validator: this.validateFormSkc, trigger: 'change' }
        ]
      },
      productInfo: { // 商品信息
        cnName: null,
        productPrimaryImage: null,
        productCategoryNavigation: null,
        productImages: [],
        statusText: '', // 上架状态
        shelvedRejectReason: '' // 驳回原因
      },
      productGoodsPrototype: null, // 当前货品信息原型(重置用到)
      productGoods: { // 当前货品信息
        productGoodsId: null,
        skc: null,
        sku: null,
        upc: null,
        ean: null,
        isbn: null,
        productGoodsTags: [],
        suggestPrice: 0,
        status: null,
        weight: 0,
        length: 0,
        width: 0,
        height: 0,
        productGoodsImages: [],
        productGoodsSpecifications: [],
        isAssemble: false, // 组装信息
        productGoodsAssembles: []
      },
      productGoodsData: [], // 货品数据
      productGoodsColumn: [ // 货品列定义
        {
          key: 'productGoodsPic',
          align: 'left',
          render: function (h, params) {
            let productGoodsImages = params.row.productGoodsImages;
            return self.tableImg(h, params, '', productGoodsImages[0]);
          }
        }, {
          key: 'sku',
          align: 'left'
        }, {
          key: 'specification',
          align: 'left',
          render: function (h, params) {
            let productGoodsSpecifications = params.row.productGoodsSpecifications;
            let doms = [];
            productGoodsSpecifications.forEach(function (productGoodsSpecification, i) {
              doms.push(h('span', {
                style: {
                  color: self.specificationColorList[i]
                }
              }, productGoodsSpecification.value));
              if (i + 1 < productGoodsSpecifications.length) {
                doms.push(h('span', {
                  attrs: {
                    class: 'margin-left-10 margin-right-10'
                  }
                }, '‧'));
              }
            });
            return h('div', doms);
          }
        }
      ],
      addAssembleData: [], // 组装信息数据
      addAssembleColumns: [
        {
          title: 'picture',
          key: '',
          width: 200,
          align: 'center',
          render: (h, params) => {
            return self.tableImg(h, params, 'pictureUrl');
          }
        }, {
          title: 'sku',
          key: 'sku',
          width: 150,
          align: 'center'
        }, {
          title: 'value',
          key: '',
          minWidth: 200,
          align: 'center',
          render: (h, params) => {
            let specificationsList = params.row.value;
            let pos = '';
            if (!this.$common.isEmpty(specificationsList)) {
              if (specificationsList.length) {
                specificationsList.forEach((n, i) => {
                  pos += n.name + ':' + n.value + ';';
                });
                pos = pos.substr(0, pos.length - 1);
              }
              return h('div', [
                h('div', params.row.name), h('div', '(' + pos + ')')
              ]);
            } else {
              return h('div', params.row.name);
            }
          }
        }, {
          title: 'quantity',
          key: '',
          minWidth: 100,
          align: 'center',
          render: (h, params) => {
            return h('InputNumber', {
              props: {
                min: 1,
                value: params.row.quantity,
                disabled: (() => {
                  return self.isDisabled;
                })()
              },
              style: {
                width: '80px'
              },
              on: {
                'input': (val) => {
                  self.addAssembleData[params.index].quantity = val;
                  self.addData[params.index].quantity = val;
                }
              }
            });
          }
        }, {
          title: 'delete',
          key: '',
          width: 100,
          align: 'center',
          render: (h, params) => {
            if (!self.isDisabled) {
              return h('Icon', {
                props: {
                  type: 'md-close-circle',
                  color: '#f00',
                  size: 20
                },
                class: 'cursor',
                on: {
                  click: () => {
                    self.delAssembleData(params.index);
                  }
                }
              });
            }
          }
        }
      ],
      addData: [], // 临时组装信息数据
      isAssemble: false, // 是否组装
      openType: null // 1 普通商品  2 变参商品
    };
  },
  created () {
    this.productGoodsPrototype = this.deepCopy(this.productGoods);
    this.customProductTagList = this.deepCopy(this.productTagList);
  },
  methods: {
    removeProductGoodsImg (productGoodsImage) { // 删除货品图片
      let productGoodsImages = this.productGoodsImageArray;
      productGoodsImages.splice(productGoodsImages.indexOf(productGoodsImage), 1);
    },
    setProductGoodsPrimaryImg (productGoodsImage) { // 设置货品主图
      this.removeProductGoodsImg(productGoodsImage);
      let productGoodsImages = this.productGoodsImageArray;
      productGoodsImages.unshift(productGoodsImage);
    },
    modifyImg () { // 修改图片
      let self = this;
      self.renderModifyProductGoodsImgModal = true;
      self.$nextTick(function () {
        self.modifyProductGoodsImgModal = true;
        self.productGoodsImageArray = self.deepCopy(self.productGoods.productGoodsImages);
      });
    },
    validateCustomFields () { // 校验规格属性
      let self = this;
      let error = false;
      for (let i = 0; i < self.productGoods.productGoodsSpecifications.length; i++) {
        let productGoodsSpecification = self.productGoods.productGoodsSpecifications[i];
        if (productGoodsSpecification.value == null || productGoodsSpecification.value === '') {
          error = true;
          break;
        }
      }
      return !error;
    },
    beforeSave () {
      let self = this;
      self.waitingOk = true;
      self.$refs['productGoodsForm'].validate((valid) => {
        if (valid && self.validateCustomFields()) {
          new Promise((resolve, reject) => {
            self.save(resolve);
          }).finally(() => {
            self.waitingOk = false;
          });
        } else {
          self.waitingOk = false;
        }
      });
    },
    cancel () { // 取消
      this.$parent.$parent.productGoodsDetailModal = false;
    },
    save (resolve) { // 保存
      let self = this;
      // 组装信息
      if (self.isAssemble) {
        self.productGoods.isAssemble = 1;
        if (self.addAssembleData.length) {
          let pos = [];
          self.addAssembleData.forEach((n, i) => {
            pos.push({
              materialProductGoodsId: n.productGoodsId,
              quantity: n.quantity
            });
          });
          self.productGoods.productGoodsAssembles = pos;
        } else {
          self.productGoods.isAssemble = 0;
          self.productGoods.productGoodsAssembles = [];
        }
      } else {
        self.productGoods.isAssemble = 0;
        self.productGoods.productGoodsAssembles = [];
      }
      self.productGoods.productGoodsAcceptableTc = self.productTypeListValue.join(',');
      if (self.productGoods.productGoodsId) {
        resolve(self.axios.put(api.update_productGoods, self.productGoods).then(response => {
          if (response.data.code === 0) {
            self.$Message.success('更新成功');
            self.pageParamsStatus = true;
          }
        }));
      } else {
        resolve(self.axios.post(api.insert_productGoods, self.productGoods).then(response => {
          if (response.data.code === 0) {
            self.$Message.success('新增成功');
            self.productGoods.productGoodsId = response.data.datas;
            self.pageParamsStatus = true;
          }
        }));
      }
    },
    copySku () { // 拷贝SKU
      let self = this;

      self.highlightRow = {
        sku: '未保存'
      };
      self.productGoods.sku = null;
      self.productGoods.productGoodsId = null;
      self.productGoods.productGoodsSpecifications.forEach(function (productGoodsSpecification, i) {
        productGoodsSpecification.value = null;
      });
      self.$refs['productGoodsDataTable'].clearCurrentRow();

      self.$refs['productGoodsForm'].validateField('sku');
    },
    getList () { // 查询列表数据
      let self = this;
      self.axios.get(api.productGoods_detail + self.productGoods.productGoodsId).then(response => {
        if (response.data.code === 0) {
          let productInfo = response.data.datas;

          self.initProductGoods(productInfo.productGoodsList);
          self.initProductInfo(productInfo);
          let productImageList = [];
          productInfo.productImageList.forEach((n, i) => {
            productImageList.push(n.path);
          });
          self.productInfo.productImages = productImageList;
        }
      });
    },
    initProductInfo (productInfo) { // 初始化商品信息
      let self = this;
      self.productInfo.cnName = productInfo.cnName;
      if (productInfo.productImageList && productInfo.productImageList.length > 0) {
        self.productInfo.productPrimaryImage = self.filenodeViewTargetUrl + '/thumb' + productInfo.productImageList[0].path;
      } else {
        self.productInfo.productPrimaryImage = self.placeholderSrc;
      }
      // 0 未上架 1已上架 2已下架 3待审核 4审核驳回 5待提交
      let statusList = [
        { value: 0, title: '未上架' },
        { value: 1, title: '1已上架' },
        { value: 2, title: '已下架' },
        { value: 3, title: '待审核' },
        { value: 4, title: '审核驳回' },
        { value: 5, title: '待提交' }
      ];
      statusList.map((item) => {
        if (item.value === productInfo.shelveStatus) {
          self.productInfo.statusText = item.title;
        }
      });
      self.productInfo.shelvedRejectReason = productInfo.shelvedRejectReason;
    },
    initProductGoods (productGoodsList) { // 初始化货品信息
      let self = this;
      self.productGoodsData = productGoodsList;
      self.productGoodsData.forEach(function (productGoods, i) {
        let productGoodsTagNames = [];
        let productGoodsImagePaths = [];
        let productGoodsTags = productGoods.productGoodsTags;
        let productGoodsImages = productGoods.productGoodsImages;

        if (productGoodsTags) {
          productGoodsTags.forEach(function (productGoodsTag, i) {
            productGoodsTagNames.push(productGoodsTag.tagName);
          });
        }
        productGoods.productGoodsTags = productGoodsTagNames;
        if (productGoodsImages) {
          productGoodsImages.forEach(function (productGoodsImage, i) {
            productGoodsImagePaths.push(productGoodsImage.path);
          });
        }
        productGoods.productGoodsImages = productGoodsImagePaths;

        // 设置默认选中第一行
        if (productGoods.productGoodsId === self.productGoods.productGoodsId) {
          self.onCurrentChange(productGoods);
        }
      });
    },
    onCurrentChange (currentRow) { // 当选中行时触发
      if (currentRow) {
        let self = this;
        self.productGoods = self.deepCopy(currentRow);
        if (self.productGoods.productGoodsAcceptableTypes) {
          self.productTypeListValue = self.productGoods.productGoodsAcceptableTypes.map(i => {
            return i.typeCode;
          });
        } else {
          self.productTypeListValue = ['01'];
        }

        // 组装信息
        self.addAssembleData = []; // 切换数据前 先初始化组装信息的值
        self.addData = [];
        self.isAssemble = false;
        if (self.productGoods.productGoodsAssembles) {
          let pos = [];
          let pic = null;
          self.productGoods.productGoodsAssembles.forEach((n, i) => {
            pic = n.productGoodsImages ? n.productGoodsImages[0].path : null;
            pos.push({
              productGoodsId: n.materialProductGoodsId,
              sku: n.sku,
              name: n.cnName,
              value: n.productGoodsSpecifications,
              quantity: n.quantity,
              pictureUrl: pic
            });
          });
          self.addAssembleData = pos;
          self.addData = pos;
        }
        if (self.productGoods.isAssemble) {
          self.isAssemble = true;
        } else {
          self.isAssemble = false;
        }
        // 设置高亮
        self.highlightRow = currentRow;
        self.highlightRow._highlight = true;

        // 把自定义标签添加到特性标签列表
        self.customProductTagList = self.deepCopy(self.productTagList);
        if (self.productGoods.productGoodsTags) {
          self.productGoods.productGoodsTags.forEach(function (productTag, i) {
            if (self.customProductTagList.indexOf(productTag) === -1) {
              self.customProductTagList.push(productTag);
            }
          });
        }
      }
    },
    onRowClick (clickRow) {
      if (clickRow) {
        this.pageParamsStatus = true;
      }
    },
    uploadFilesSuccess (response, file, fileList) { // 上传文件成功
      this.productGoodsImageArray.push(file.response.datas[0]);
      this.productInfo.productImages.push(file.response.datas[0]);
    },
    uploadFilesError () { // 上传文件异常
      this.$Message.error('系统繁忙，请重新尝试');
    },
    uploadExceedSize () { // 控制上传图片大小
      this.$Message.error('文件大小超出限制，最大为10M');
    },
    handleFormatError () { // 上传文件格式异常
      this.$Message.error('文件格式有误');
    },
    beforeUpload (file) { // 控制图片多选数量
      let selectedFiles = this.$refs.uploadProductGoodsImg.$refs.input.files;
      let curFileIndex = -1;
      for (let i = 0; i < selectedFiles.length; i++) {
        if (selectedFiles[i] === file) {
          curFileIndex = i;
        }
      }
      if (curFileIndex === 0 && selectedFiles.length > this.uploadMaxLength) {
        this.$Message.error('文件数量超出限制，一次最多可上传5张');
        return false;
      } else if (selectedFiles.length > this.uploadMaxLength) {
        return false;
      }
      return true;
    },
    uploadModalConfirm () { // 上传图片模态框确定
      this.productGoods.productGoodsImages = this.productGoodsImageArray;
      this.modifyProductGoodsImgModal = false;
    },
    uploadModalCancel () { // 上传图片模态框取消
      this.productGoodsImageArray = [];
      this.modifyProductGoodsImgModal = false;
    },
    backSpu () { // 返回spu
      this.$parent.$parent.productGoodsDetailModal = false;
      this.$parent.$parent.editSpu(this.productGoods.productId, 2);
    },
    addSkuPic (index) { // 添加至SKU
      this.productGoodsImageArray.push(this.productInfo.productImages[index]);
    },
    addCustomTag (event) { // 添加自定义标签
      let v = this;
      let productGoodsTagsSelectInput = event.target;
      let value = productGoodsTagsSelectInput.value === null ? '' : v.trim(productGoodsTagsSelectInput.value);
      if (value !== '' && value.length <= 50 && v.customProductTagList.indexOf(value) === -1) {
        v.customProductTagList.push(value);
        let arr = v.productGoods.productGoodsTags;
        arr.push(value);
        this.$nextTick(function () {
          v.productGoods.productGoodsTags = arr;
        });
      } else {
        v.$Message.error('新增标签长度不能超过50且不能与已存在标签重复');
      }
    },
    assembleChange (val) { // 是否组装
      let v = this;
      if (val) {
        v.isAssemble = true;
      } else {
        v.isAssemble = false;
      }
    },
    addAssemble () { // 打开组装信息模态框
      let v = this;
      v.$refs.addAssembleModal.matchingGoodsStatus = true;
      v.$refs.addAssembleModal.matchingGoodsModal = true;
      v.$refs.addAssembleModal.getNormalGoodsData();
      v.openType = 1; // 不需要显示已选值
    },
    delAssembleData (index) { // 删除组装数据
      let v = this;
      v.addAssembleData.splice(index, 1);
    },
    addTabData (val) { // 接收子组件传值
      let v = this;
      if (v.addData.length) {
        let status = false; // 判断是否有相同项
        let index = null; // 记录相同项的下标
        for (let m = 0; m < val.length; m++) {
          for (let n = 0; n < v.addData.length; n++) {
            if (v.addData[n].productGoodsId === val[m].productGoodsId) {
              status = true;
              index = n;
            }
          }
          if (status) {
            v.addData[index].quantity += val[m].quantity;
          } else {
            v.addData.push(val[m]);
          }
          status = false;
        }
      } else {
        v.addData = val;
      }
      v.addAssembleData = v.addData;
    },
    validateFormSkc (rule, value, callback) {
      if (this.isDisabled) {
        callback();
        return;
      }
      let reg = /^[0-9]*$/g;
      if (!value) {
        callback(new Error('SKC 不能为空'));
        return;
      }
      if (!reg.test(value)) {
        callback(new Error('请输入数字'));
        return;
      }
      callback();
    }
  },
  watch: {
    pageParamsStatus (n, o) { // 监听重置列表数据
      var self = this;
      if (n) {
        self.$Loading.start();
        Promise.resolve(self.getList()).then(function () {
          self.$Loading.finish();
        });
        self.pageParamsStatus = false;
      }
    },
    editProductGoods (n, o) { // 初始化数据
      if (n) {
        this.$refs['productGoodsForm'].resetFields();
        this.$nextTick(() => {
          this.pageParamsStatus = true;
          this.productGoods.productGoodsId = this.editProductGoods.productGoodsId;
          this.productInfo.productCategoryNavigation = this.editProductGoods.productCategoryNavigation;
          this.$parent.$parent.editProductGoods = null;
        })
      }
    },
    // productGoodsDetailModal (n, o) { // 监听窗口显示隐藏
    //   if (n) {
    //     this.productGoodsData = [];
    //     this.$refs['productGoodsForm'].resetFields();
    //     this.productGoods = this.deepCopy(self.productGoodsPrototype);
    //   }
    // },
    renderModifyProductGoodsImgModal (n, o) {
      if (n) {
        var self = this;
        self.$nextTick(function () {
          self.uploadList = self.$refs.uploadProductGoodsImg.fileList;
        });
      }
    }
  },
  computed: {
    uploadFilesHeader () {
      return {
        ...this.$store.getters.erpRequestHeaders,
        ...this.$store.getters.dytRequestHeaders
      }
    },
    isDisabled () {
      if (this.editStatus === 'look') {
        return true;
      } else {
        return false;
      }
    },
    // 是否是供应商商户
    isSupplierTalg () {
      return this.$store.state.erpConfig.merchant.isSupplier === 1;
    },
    textTalg () {
      return this.$store.state.erpConfig.merchant.isSupplier === 1
        ? '分销价格'
        : '采购成本价';
    }
  }
};
</script>
<style scoped>
.product-upload-list {
  width: 100px;
  height: 100px;
  display: inline-block;
}

.product-upload-list-cover {
  padding-top: 50px;
}

.product-upload-list-cover i {
  margin: 0 10px;
}
</style>
<style lang="less">
#productGoodsDataTable {
  .ivu-table-border td,
  .ivu-table-border th {
    border-right: none;
  }
  .ivu-table-wrapper {
    border-top: none;
  }
  .ivu-table td,
  .ivu-table th {
    border-bottom: none;
  }
  .ivu-progress-show-info {
    .ivu-progress-outer {
      padding-right: 15px;
      margin-right: -20px;
    }
  }
}
</style>
