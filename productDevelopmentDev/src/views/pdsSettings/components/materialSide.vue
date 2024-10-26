<template>
  <transition name="material">
    <div class="transition-contain" v-show="materialVisible">
      <div class="transition-head">
        <div>
          <span class="go-back" @click="goBack">返 回</span>
        </div>
        <div>
          <Button type="primary" :disabled="pageLoading" @click="saveDetail" v-if="isEdit">保 存</Button>
        </div>
      </div>
      <div class="material-side">
        <Form ref="formValidate" :model="formData" :rules="ruleValidate" :label-width="100">
          <div class="base-item-head">基本信息</div>
          <div class="base-item-contain form-item-line">
            <FormItem label="物流编码:" prop="materialCode" v-if="!$common.isEmpty(materialId)">
              <span>{{ formData.materialCode }}</span>
            </FormItem>
            <FormItem label="物料名称:" prop="materialName">
              <Input v-model.trim="formData.materialName" placeholder="请输入物料名称" clearable :disabled="!isEdit" />
            </FormItem>
            <FormItem label="物料类型:" prop="materialType">
              <dytSelect v-model="formData.materialType" placeholder="请选择物料类型" :disabled="!isEdit" @on-change="materialChange">
                <Option v-for="(item, index) in Object.values(materialTypeData)" :value="item.value" :key="`s-${index}`">{{ item.label }}</Option>
              </dytSelect>
            </FormItem>
            <FormItem label="计量单位:" prop="unitMeasurement">
              <dytSelect v-model="formData.unitMeasurement" placeholder="请选择计量单位" :disabled="!isEdit">
                <Option v-for="(item, index) in Object.values(meteringUnit)" :value="item.value" :key="`u-${index}`">{{ item.label }}</Option>
              </dytSelect>
            </FormItem>
            <FormItem label="是否启用:" prop="enableStatus">
              <dytSelect v-model="formData.enableStatus" placeholder="请选择" :disabled="!isEdit">
                <Option :value="0">停用</Option>
                <Option :value="1">启用</Option>
              </dytSelect>
            </FormItem>
            <FormItem label="成分:" prop="materialIngredient">
              <Input v-model.trim="formData.materialIngredient" placeholder="请输入成分" clearable :disabled="!isEdit" />
            </FormItem>
            <FormItem label="图片:" prop="materialPictureDetails" style="width: 100%;">
              <div class="form-pic-item">
                <Poptip trigger="hover" placement="right-start" v-for="(pic, pIndex) in formData.materialPictureDetails" :key="`pic-${pIndex}`">
                  <div class="pic-item-view">
                    <img :src="`./filenode/s${pic.path}`" />
                    <div class="pic-view-cover" v-if="isEdit">
                      <div class="pic-view-btn">
                        <Icon title="删除" type="ios-trash-outline" @click.native="removeImg(pic.path)" />
                      </div>
                    </div>
                  </div>
                  <div class="image-preview-content" slot="content">
                    <img :src="`./filenode/s${pic.path}`" />
                  </div>
                </Poptip>
                <dytUpload
                  v-if="isEdit"
                  ref="washedUploadRef"
                  name="files"
                  :show-upload-list="false"
                  :multiple="true"
                  accept="image/*"
                  :before-upload="fileUploadBefore"
                  :action="uploadFilesUrl"
                  class="upload-item"
                >
                  <div class="upload-icon">
                    <Icon type="ios-camera" size="20"></Icon>
                  </div>
                  <Spin v-if="isUploadLoading" fix></Spin>
                </dytUpload>
              </div>
            </FormItem>
          </div>
          <div class="base-item-head">供应商信息</div>
          <div class="base-item-contain">
            <div style="padding-bottom: 10px;">
              <Button type="primary" @click="tablePushRow" v-if="isEdit">新 增</Button>
            </div>
            <Table :columns="columns" :data="formData.materialSupplierDetails" border highlight-row class="form-table-contain">
              <!-- 操作列 -->
              <template slot-scope="{ row, index }" slot="type">
                <span v-if="row.type == 1">首选</span>
                <template v-else-if="isEdit">
                  <span @click="setFirstChoice(row, index)" style="cursor: pointer; color: #2d8cf0;">设为首选</span>
                  <span @click="removeTableRow(row, index)" style="cursor: pointer; color: #2d8cf0;margin-left: 10px;">移除</span>
                </template>
              </template>
              <!-- 供应商 -->
              <template slot-scope="{ index }" slot="supplierId">
                <FormItem
                  label=""
                  :label-width="0"
                  :prop="`materialSupplierDetails.${index}.supplierId`"
                  :rules="tableValidate.supplierId"
                >
                  <dytSelect
                    v-model="formData.materialSupplierDetails[index].supplierId"
                    :disabled="!isEdit"
                    :clearable="false"
                    @on-select="supplierChange($event, index)"
                  >
                    <Option v-for="item in supplyList" :key="`supp-${item.supplierId}`" :value="item.supplierId" >{{ item.supplierName }}</Option>
                  </dytSelect>
                </FormItem>
              </template>
              <!-- 颜色 -->
              <template slot-scope="{ index }" slot="colorNameList">
                <FormItem
                  label=""
                  :label-width="0"
                  :prop="`materialSupplierDetails.${index}.colorNameList`"
                  :rules="tableValidate.colorNameList"
                >
                  <!-- :limit="1" -->
                  <dyt-input-tag
                    style="min-width: auto;"
                    type="textarea"
                    :disabled="$common.isEmpty(formData.materialSupplierDetails[index].supplierId) || !isEdit"
                    :string="false"
                    :placeholder="$common.isEmpty(formData.materialSupplierDetails[index].supplierId)?'请选选中供应商后再输入颜色':'请输入颜色, 多个逗号或回车分隔'"
                    v-model="formData.materialSupplierDetails[index].colorNameList"
                    @change="colorNameChange($event, index)"
                  />
                </FormItem>
              </template>
              <template slot-scope="{ index }" slot="colorCardCode">
                <div
                  style="color: #2d8cf0; cursor: pointer;"
                  v-if="!$common.isEmpty(formData.materialSupplierDetails[index]) && !$common.isEmpty(formData.materialSupplierDetails[index].colorNameList)"
                  @click="matchingColorCard(formData.materialSupplierDetails[index], index)"
                >
                  {{ isEdit ? '匹 配' : '查 看' }}
                </div>
              </template>
              
              <!-- 供应商物料编码 -->
              <template slot-scope="{ index }" slot="productCode">
                <FormItem
                  label=""
                  :prop="`materialSupplierDetails.${index}.productCode`"
                  :label-width="0"
                  :rules="tableValidate.productCode"
                >
                  <Input
                    v-model.trim="formData.materialSupplierDetails[index].productCode"
                    placeholder="请输入供应商物料编码"
                    clearable
                    :disabled="!isEdit"
                  />
                </FormItem>
              </template>
              <!-- 单价 -->
              <template slot-scope="{ index }" slot="price">
                <FormItem
                  label=""
                  :prop="`materialSupplierDetails.${index}.price`"
                  :label-width="0"
                  :rules="tableValidate.price"
                >
                  <Input
                    v-model="formData.materialSupplierDetails[index].price"
                    placeholder="请输入单价"
                    clearable
                    :disabled="!isEdit"
                  />
                </FormItem>
              </template>
              <!-- 起订量 -->
              <template slot-scope="{ index }" slot="minimumQuantity">
                <FormItem
                  label=""
                  :prop="`materialSupplierDetails.${index}.minimumQuantity`"
                  :label-width="0"
                  :rules="tableValidate.minimumQuantity"
                >
                  <Input
                    v-model="formData.materialSupplierDetails[index].minimumQuantity"
                    placeholder="请输入起订量"
                    clearable
                    :disabled="!isEdit"
                  />
                </FormItem>
              </template>
              <!-- 幅宽(cm) -->
              <template slot-scope="{ index }" slot="breadth">
                <FormItem
                  label=""
                  :prop="`materialSupplierDetails.${index}.breadth`"
                  :label-width="0"
                  :rules="tableValidate.breadth"
                >
                  <Input
                    v-model="formData.materialSupplierDetails[index].breadth"
                    placeholder="请输入幅宽"
                    clearable
                    :disabled="!isEdit"
                  />
                </FormItem>
              </template>
              <!-- 克重(g/㎡) -->
              <template slot-scope="{ index }" slot="weight">
                <FormItem
                  label=""
                  :prop="`materialSupplierDetails.${index}.weight`"
                  :label-width="0"
                  :rules="tableValidate.weight"
                >
                  <Input
                    v-model="formData.materialSupplierDetails[index].weight"
                    placeholder="请输入克重"
                    clearable
                    :disabled="!isEdit"
                  />
                </FormItem>
              </template>
              <!-- 备注 -->
              <template slot-scope="{ index }" slot="remark">
                <FormItem
                  label=""
                  :prop="`materialSupplierDetails.${index}.remark`"
                  :label-width="0"
                  :rules="tableValidate.remark"
                >
                  <Input
                    v-model.trim="formData.materialSupplierDetails[index].remark"
                    placeholder="请输入备注"
                    clearable
                    :disabled="!isEdit"
                  />
                </FormItem>
              </template>
            </Table>
          </div>
        </Form>
        <Spin v-if="pageLoading" fix></Spin>
      </div>
      <Modal
        width="600px"
        v-model="visibleModalColorCard"
        :mask-closable="false"
        :transfer="true"
        class-name="color-card-modal"
        title="色卡编码匹配"
        @on-ok="colorCardConfirm"
        @on-cancel="colorCardCancel"
      >
        <div class="color-card-table">
          <div class="color-card-head">
            <div class="color-card-row">
              <div class="color-card-td color-card-4">颜色</div>
              <div class="color-card-td">色卡编码</div>
            </div>
          </div>
          <div class="color-card-body">
            <div v-for="(item, index) in matchColorCardData.colorNameList" :key="`card-${index}`" class="color-card-row">
              <div class="color-card-td color-card-4">{{ item }}</div>
              <div class="color-card-td">
                <Input
                  v-model="matchColorCardData.colorCodeJson[item]"
                  placeholder="请输入色卡编码"
                  clearable
                  :disabled="!isEdit"
                />
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  </transition>
</template>

<script>
import api from '@/api/api';
import { materialTypeData, meteringUnit } from '@/utils/pdsSettingConstant';

export default {
  mixins: [],
  components: {

  },
  props: {
    modelVisible: { type: Boolean, default: false },
    modalData: { type: Object, default: () => { return {} } },
    supplyList: { type:Array, default: () => { return [] } },
    openType: { type: String, default: 'view' },
  },
  data () {
    return {
      colorObj: {},
      tableSelectData: [],
      visibleModalColorCard: false,
      matchColorCardData: {},
      matchColorCardIndex: null,
      formData: {
        // 物料名称
        materialName: '',
        // 物料编码
        materialCode: '',
        // 物料类型(1:面料,2:辅料,3:衬布,4:包装材料)
        materialType: null,
        // 计量单位(1:米.2:码.3:条.4:件,5:套,6:个)
        unitMeasurement: null,
        // 成分
        materialIngredient: '',
        // 启用状态(0:未启用,1:启用)
        enableStatus: 1,
        materialPictureDetails: [],
        materialSupplierDetails: []
      },
      ruleValidate: {
        materialName: [
          { required: true, validator: this.strMaxVerify, msg: '请选择物料名称', maxLength: 100, trigger: 'blur' },
          { required: true, validator: this.strMaxVerify, msg: '请选择物料名称', maxLength: 100, trigger: 'change' }
        ],
        materialType: [
          { required: true, message: '请选择物料类型', trigger: 'change', type: 'number' }
        ],
        unitMeasurement: [
          { required: true, message: '请选择计量单位', trigger: 'change', type: 'number' }
        ],
        enableStatus: [
          { required: true, message: '请选择', trigger: 'change', type: 'number' }
        ],
        materialPictureDetails: [
          { required: true, message: '请选择', trigger: 'change', type: 'array' }
        ],
        materialIngredient: [
          { validator: this.strMaxVerify, maxLength: 100, trigger: 'blur' },
          { validator: this.strMaxVerify, maxLength: 100, trigger: 'change' }
        ]
      },
      // 表格的验证
      tableValidate: {
        supplierId: [
          { required: true, message: '请选择供应商', trigger: 'change', type: 'string' }
        ],
        colorNameList: [
          { required: true, validator: this.validatorTag, msg: '请输入颜色', trigger: 'change' },
        ],
        productCode: [
          { validator: this.strMaxVerify, maxLength: 20, trigger: 'blur' },
          { validator: this.strMaxVerify, maxLength: 20, trigger: 'change' }
        ],
        price: [
          { required: true, validator: this.validatorMaxNumber, point: 2, msg: '请输入不小于0的整数或两位小数', trigger: 'change', type: 'number' },
          { required: true, validator: this.validatorMaxNumber, point: 2, msg: '请输入不小于0的整数或两位小数', trigger: 'blur', type: 'number' },
        ],
        minimumQuantity: [
          { required: true, validator: this.validatorMaxNumber, point: 0, msg: '请输入不小于0的整数', trigger: 'change', type: 'number' },
          { required: true, validator: this.validatorMaxNumber, point: 0, msg: '请输入不小于0的整数', trigger: 'blur', type: 'number' },
        ],
        breadth: [
          { validator: this.validatorMaxNumber, point: 2, msg: '请输入不小于0的整数或两位小数', trigger: 'change', type: 'number' },
          { validator: this.validatorMaxNumber, point: 2, msg: '请输入不小于0的整数或两位小数', trigger: 'blur', type: 'number' },
        ],
        weight: [
          { validator: this.validatorMaxNumber, point: 2, msg: '请输入不小于0的整数或两位小数', trigger: 'change', type: 'number' },
          { validator: this.validatorMaxNumber, point: 2, msg: '请输入不小于0的整数或两位小数', trigger: 'blur', type: 'number' },
        ],
        remark: [
          { validator: this.strMaxVerify, maxLength: 100, trigger: 'blur' },
          { validator: this.strMaxVerify, maxLength: 100, trigger: 'change' }
        ]
      },
      // 验证是否大于等于 0 的2位小数
      validatePrice: [
        { required: true, validator: this.validatorMaxNumber, point: 2, msg: '请输入不小于0的整数或两位小数', trigger: 'change', type: 'number' },
        { required: true, validator: this.validatorMaxNumber, point: 2, msg: '请输入不小于0的整数或两位小数', trigger: 'blur', type: 'number' },
      ],
      uploadFilesUrl: api.upload_files + '?basePath=/product',
      pageLoading: false,
      isUploadLoading: false,
      materialVisible: false,
      materialDetail: {},
      materialTypeData: materialTypeData,
      meteringUnit: meteringUnit,
      // 默认行
      tableRow: {
        supplierId: '',
        type: 0,
        colorNameList: [],
        productCode: '',
        price: null,
        minimumQuantity: null,
        breadth: null,
        weight: null,
        remark: ''
      },
      columns: [
        { title: '操作', slot: 'type', align: 'center', width: 120 },
        {
          title: '供应商', slot: 'supplierId', align: 'center', minWidth: 100,
          renderHeader: (h, params) => {
            return h('div', {
              class: 'table-col-required'
            }, '供应商');
          }
        },
        {
          title: '颜色', slot: 'colorNameList', align: 'center', minWidth: 130,
          renderHeader: (h, params) => {
            return h('div', {
              class: 'table-col-required'
            }, '颜色');
          }
        },
        { title: '色卡编码', slot: 'colorCardCode', align: 'center', width: 100 },
        { title: '供应商物料编码', slot: 'productCode', align: 'center', minWidth: 100 },
        {
          title: '单价', slot: 'price', align: 'center', minWidth: 100,
          renderHeader: (h, params) => {
            return h('div', {
              class: 'table-col-required'
            }, '单价');
          }
        },
        {
          title: '最小起订量', slot: 'minimumQuantity', align: 'center', minWidth: 100,
          renderHeader: (h, params) => {
            return h('div', {
              class: 'table-col-required'
            }, '最小起订量');
          }
        },
        {
          title: '幅宽(cm)', slot: 'breadth', align: 'center', minWidth: 100,
          renderHeader: (h, params) => {
            if (this.formData.materialType == 1) {
              return h('div', {
                class: 'table-col-required'
              }, '幅宽(cm)');
            }
            return h('div', {}, '幅宽(cm)');
          }
        },
        { title: '克重(g/㎡)', slot: 'weight', align: 'center', minWidth: 100 },
        { title: '备注', slot: 'remark', align: 'center', minWidth: 100 }
      ]
    }
  },
  watch: {
    modelVisible: {
      immediate: true,
      handler (val) {
        this.materialVisible = val;
        this.$nextTick(() => {
          val && this.initData();
        })
      }
    },
    materialVisible: {
      handler (val) {
        this.$emit('update:modelVisible', val);
      }
    }
  },
  created () {},
  computed: {
    // 是否可编辑
    isEdit () {
      return this.openType == 'edit';
    },
    // 物料ID
    materialId () {
      if (this.$common.isEmpty(this.modalData) || this.$common.isEmpty(this.modalData.materialId)) return '';
      return this.modalData.materialId;
    }
  },
  methods: {
    // 初始化数据
    initData () {
      this.pageLoading = true;
      delete this.formData.materialId;
      this.$refs.formValidate && this.$refs.formValidate.resetFields();
      this.formData.materialCode = '';
      this.$nextTick(() => {
        let awaitRes = [this.getColorList];
        this.materialDetail = {};
        if (!this.$common.isEmpty(this.modalData) && !this.$common.isEmpty(this.materialId)) {
          awaitRes.push(this.getMaterialDetail);
        } else {
          this.formData.materialSupplierDetails = [{
            ...this.$common.copy(this.tableRow),
            type: 1
          }];
        }
        this.$common.promiseAll(awaitRes).then(resArr => {
          // console.log(resArr);
        }).finally(() => {
          this.pageLoading = false;
        })
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
            this.$set(this.colorObj, item.colorId, {...item, disabled: false});
          })
          this.tableSelectData = Object.values(this.colorObj);
          resolve(this.colorObj);
        }).catch(() => {
          resolve({});
        })
      })
    },
    // 供应商改变时
    supplierChange (val, rowIndex) {
      this.$nextTick(() => {
        if (this.$common.isEmpty(this.formData.materialSupplierDetails[rowIndex].colorNameList)) return;
        const supplierIds = this.formData.materialSupplierDetails.filter(row => {
          return row.supplierId == val.value;
        })
        if (supplierIds.length > 1) {
          this.formData.materialSupplierDetails[rowIndex].colorNameList = [];
        }
      })
    },
    // 获取详情
    getMaterialDetail () {
      return new Promise((resolve) => {
        this.$axios.post(api.queryProductMaterialDetail, {materialId: this.materialId}).then(({ code, datas }) => {
          if (code != 0 || this.$common.isEmpty(datas)) return resolve({});
          this.materialDetail = datas;
          let colorCodeJson = {};
          let itemJson = {};
          let itemList = [];
          Object.keys(this.formData).forEach(key => {
            if (!this.$common.isUndefined(datas[key])) {
              if (key == 'materialSupplierDetails') {
                if (!this.$common.isEmpty(datas[key])) {
                  this.formData[key] = datas[key].map(row => {
                    if (!this.$common.isEmpty(row.colorNameList) && this.$common.isArray(row.colorNameList)) {
                      colorCodeJson = {};
                      row.colorNameList = row.colorNameList.map(item => {
                        if (item.includes('{')) {
                          itemJson = JSON.parse(item);
                          itemList = Object.keys(itemJson);
                          colorCodeJson[itemList[0]] = itemJson[itemList[0]];
                          return itemList[0];
                        } else {
                          colorCodeJson[item] = '';
                          return item;
                        }
                      })
                      row.colorCodeJson = colorCodeJson;
                    } else {
                      row.colorCodeJson = {};
                      row.colorNameList = [];
                    }
                    return row;
                  })
                } else {
                  this.formData[key] = [];
                }
              } else {
                this.formData[key] = datas[key];
              }
            }
          })
          
          this.$set(this.formData, 'materialId', this.materialId);
          if (this.$common.isEmpty(this.formData.materialSupplierDetails)) {
            this.formData.materialSupplierDetails = [{
              ...this.$common.copy(this.tableRow),
              type: 1
            }];
          }
          if (!this.$common.isArray(this.formData.materialPictureDetails)) {
            this.formData.materialPictureDetails = [];
          }
          resolve(datas);
        }).catch(err => {
          console.error(err);
          resolve({});
        })
      })
    },
    // 返回
    goBack () {
      this.$refs.formValidate && this.$refs.formValidate.resetFields();
      this.materialVisible = false;
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
    // 上传图片
    fileUploadBefore (file) {
      if (!file.type.includes('image/')) {
        this.$Message.error('文件格式不对，请上传图片格式的文件');
        return false;
      }
      this.isUploadLoading = true;
      let newForm = new FormData(); // 创建form对象
      newForm.append('files', file);
      const uploadUrl = `${this.uploadFilesUrl}&random=${(Math.random()).toString().substring(2, 5) + (new Date().getTime()).toString()}`;
      this.axios.post(uploadUrl, newForm).then(res => {
        if (!res || res.code != 0) return;
        const sortArr = this.formData.materialPictureDetails.map(m => m.sort);
        this.formData.materialPictureDetails.push({
          sort: this.$common.isEmpty(sortArr) ? 0 : Math.max(...sortArr) + 1,
          path: res.datas[0],
        });
      }).finally(() => {
        this.isUploadLoading = false;
      })
      return false;
    },
    // 移除图片
    removeImg (path) {
      this.formData.materialPictureDetails = this.formData.materialPictureDetails.filter(item => {
        return item.path != path;
      })
    },
    // 新增一行
    tablePushRow () {
      this.formData.materialSupplierDetails.push(this.$common.copy(this.tableRow));
    },
    // 返回符号保存格式的表单数据
    getFormData () {
      const formData = this.$common.copy(this.formData);
      if (!this.$common.isEmpty(formData.materialSupplierDetails)) {
        formData.materialSupplierDetails.forEach(row => {
          if (!this.$common.isEmpty(row.colorCodeJson)) {
            row.colorNameList = Object.keys(row.colorCodeJson).map(key => {
              return JSON.stringify({[key]: row.colorCodeJson[key]});
            });
            delete row.colorCodeJson;
          }
          if (!this.$common.isEmpty(row.colorName)) {
            delete row.colorName;
          }
        })
      }
      return formData
    },
    // 保存
    saveDetail () {
      if (!this.$refs.formValidate || this.pageLoading) return;
      this.$refs.formValidate.validate((valid) => {
        
        if (!valid) {
          this.$Message.error('可能存在必填项未填写或不符合填写规范，表单验证不通过!');
          return;
        }
        const formData = this.getFormData();
        this.pageLoading = true;
        const apiUrl = api[this.$common.isEmpty(this.materialId) ? 'saveProductMaterial' : 'updateProductMaterial'];
        this.$axios.post(apiUrl, formData).then(({ code, datas }) => {
          if (code != 0) return;
          this.$Message.success('操作成功!');
          this.$emit('saveAfter');
          this.$nextTick(() => {
            this.goBack();
          })
        }).finally(() => {
          this.pageLoading = false;
        })
      })
    },
    // 删除表格行
    removeTableRow (row, index) {
      if (this.$common.isEmpty(row) || this.formData.materialSupplierDetails.length < 2) return;
      this.formData.materialSupplierDetails.splice(index, 1);
    },
    // 设为首选
    setFirstChoice (row, index) {
      this.formData.materialSupplierDetails = this.formData.materialSupplierDetails.map((fRow, rIndex) => {
        return {
          ...fRow,
          type: index == rIndex ? 1 : 0
        }
      })
    },
    // 匹配色卡
    matchingColorCard (row, index) {
      this.matchColorCardData = this.$common.copy(row);
      if (this.$common.isEmpty(this.matchColorCardData.colorCodeJson)) {
        let colorCodeJson = {}
        this.matchColorCardData.colorNameList.forEach(item => {
          colorCodeJson[item] = '';
        })
        this.$set(this.matchColorCardData, 'colorCodeJson', colorCodeJson);
      }
      this.matchColorCardIndex = index;
      this.$nextTick(() => {
        this.visibleModalColorCard = true;
      })
    },
    // 色卡确认
    colorCardConfirm () {
      this.formData.materialSupplierDetails[this.matchColorCardIndex] = this.$common.copy(this.matchColorCardData);
    },
    // 色卡弹窗关闭
    colorCardCancel () {
      this.$nextTick(() => {
        this.matchColorCardData = {};
        this.matchColorCardIndex = null;
      })
    },
    // 颜色改变时
    colorNameChange (val, rowIndex) {
      this.$nextTick(() => {
        if (this.$common.isEmpty(this.formData.materialSupplierDetails[rowIndex].colorNameList)) {
          this.formData.materialSupplierDetails[rowIndex].colorCodeJson = {};
          return;
        }
        let colorCodeJson = {};
        const oldColor = this.formData.materialSupplierDetails[rowIndex].colorCodeJson;
        (val || []).forEach(item => {
          colorCodeJson[item] = this.$common.isEmpty(oldColor[item]) ? '' : oldColor[item];
        })
        this.formData.materialSupplierDetails[rowIndex].colorCodeJson = colorCodeJson;
        let rows = [];
        this.formData.materialSupplierDetails.forEach((row, index) => {
          if (row.supplierId == this.formData.materialSupplierDetails[rowIndex].supplierId && rowIndex != index) {
            rows = [...rows, ...row.colorNameList];
          }
        })
        if (this.$common.isEmpty(rows)) return;
        this.formData.materialSupplierDetails[rowIndex].colorNameList = this.formData.materialSupplierDetails[rowIndex].colorNameList.filter(txt => {
          return !rows.includes(txt);
        })
      })
    },
    // 物料类型改变
    materialChange (val) {
      if (val == 1) {
        this.$set(this.tableValidate, 'breadth', [
          { required: true, validator: this.validatorMaxNumber, point: 2, msg: '请输入不小于0的整数或两位小数', trigger: 'change', type: 'number' },
          { required: true, validator: this.validatorMaxNumber, point: 2, msg: '请输入不小于0的整数或两位小数', trigger: 'blur', type: 'number' }
        ])
        return;
      }
      this.$set(this.tableValidate, 'breadth', [
        { validator: this.validatorMaxNumber, point: 2, msg: '请输入不小于0的整数或两位小数', trigger: 'change', type: 'number' },
        { validator: this.validatorMaxNumber, point: 2, msg: '请输入不小于0的整数或两位小数', trigger: 'blur', type: 'number' }
      ])
      this.$nextTick(() => {
        if (!this.$refs.formValidate) return;
        this.formData.materialSupplierDetails.forEach((row, index) => {
          this.$refs.formValidate.validateField(`materialSupplierDetails.${index}.breadth`);
        })
      })
    },
    // 验证颜色
    validatorTag (rule, value, callback) {
      if (rule.required && this.$common.isEmpty(value)) {
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
    },
  }
};
</script>
<style lang="less">
  .image-preview-content{
    position: relative;
    img{
      max-width: 600px;
      max-height: 600px;
      min-width: 200px;
    }
  }
  // .color-card-modal{}
</style>
<style scoped lang="less">
.transition-contain{
  position: absolute;
  top: 0;
  height: 100%;
  width: calc(100% - 14px);
  padding: 0px 15px;
  background: #fff;
  z-index: 99;
  overflow: auto;
  .transition-head{
    position: sticky;
    top: 0;
    left: 0;
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid #c1c1c1;
    background: #fff;
    z-index: 1;
    .go-back{
      display: inline-block;
      height: 100%;
      font-size: 18px;
      font-weight: blob;
      line-height: 32px;
      cursor: pointer;
    }
  }
  .material-side{
    position: relative;
    width: 100%;
    padding-top: 10px;
    .base-item-head{
      position: relative;
      padding: 6px 5px 6px 20px;
      background: #efefef;
      &:before{
        content: '';
        position: absolute;
        top: 0;
        left: 5px;
        height: 100%;
        width: 8px;
        background: #1fdb26;
      }
    }
    .base-item-contain{
      margin-top: 10px;
      &.form-item-line{
        display: flex;
        justify-content: flex-start;
        flex-flow: wrap;
        :deep(.ivu-form-item) {
          width: 33.333%;
        }
      }
      .form-pic-item{
        display: flex;
        justify-content: flex-start;
        flex-flow: wrap;
        .pic-item-view{
          position: relative;
          margin-right: 10px;
          width: 70px;
          height: 70px;
          >img {
            height: 100%;
            width: 100%;
          }
          .pic-view-cover{
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            &:hover{
              background: rgba(0, 0, 0, 0.5);
              .pic-view-btn{
                display: block;
              }
            }
            .pic-view-btn{
              display: none;
              position: absolute;
              top: 50%;
              width: 100%;
              transform: translate(0, -50%);
              font-size: 20px;
              color: #fff;
              text-align: center;
              >i{
                cursor: pointer;
              }
            }
          }
        }
        .upload-item{
          position: relative;
          display: inline-block;
          width: 70px;
          height: 70px;
          border: 1px solid #ccc;
          border-radius: 5px;
          cursor: pointer;
        }
        .upload-icon{
          width: 70px;
          height: 70px;
          i>{
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }
        }
      }
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
.color-card-table{
  position: relative;
  border: 1px solid #cdcdcd;
  .color-card-head,
  .color-card-body{
    .color-card-row{
      display: flex;
      .color-card-td{
        flex: 60;
        display: inline-block;
        padding: 5px;
        width: 60%;
        text-align: center;
        border-bottom: 1px solid #cdcdcd;
        border-right: 1px solid #cdcdcd;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        &:last-child{
          border-right: none;
        }
        &.color-card-4{
          flex: 40;
          display: inline-block;
          width: 40%;
        }
      }
    }
  }
  .color-card-body{
    max-height: 50vh;
    overflow: auto;
    .color-card-row{
      &:last-child{
        .color-card-td{
          border-bottom: none;
        }
      }
    }
  }
}
</style>
