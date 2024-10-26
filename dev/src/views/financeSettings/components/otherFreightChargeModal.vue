<template>
  <div>
    <Modal
      v-model="isVisible"
      :title="modalTitle"
      :mask-closable="false"
      class-name="edit-modal-box"
    >
      <div class="edit-modal-contain">
        <Form
          ref="editModalContain"
          :model="formData"
          :rules="ruleValidate"
          :label-width="110"
        >
          <div class="form-separate-item">基础信息</div>
          <FormItem label="费用模板名称：" prop="templateName">
            <dyt-input
              placeholder="请输入费用模板名称"
              v-model.trim="formData.templateName"
              :disabled="!isEdit || isDefaultTemplate"
            />
          </FormItem>
          <div class="form-separate-item">条件</div>
          <FormItem label="总折扣：" prop="discount">
            <dyt-input
              placeholder="请输入不小于 0 的数字"
              v-model.trim="formData.discount"
              :disabled="!isEdit"
            >
              <span slot="suffix" style="line-height: 32px;"> %</span>
            </dyt-input>
          </FormItem>
          <FormItem label="费用币种：" prop="currency">
            <dyt-select v-model="formData.currency" placeholder="请选择费用币种" :disabled="!isEdit">
              <Option
                v-for="(item, index) in currencyList"
                :key="`c-${index}`"
                :label="item.targetCurrencyCode"
                :value="item.targetCurrencyCode"
              />
            </dyt-select>
          </FormItem>
          <FormItem label="邮寄方式：" prop="shippingMethodIdList">
            <erpTreeSelect
              style="width:100%"
              v-model="formData.shippingMethodIdList"
              :multiple="true"
              :normalizer="treeNormalizer"
              :options="shippingMethodData"
              :append-to-body="true"
              :default-expand-level="0"
              :limit="1"
              :disabled="!isEdit || isDefaultTemplate"
              placeholder="请选择邮寄方式"
              noResultsText="无匹配数据"
              @input="treeChange"
              zIndex="99999999999"
            />
          </FormItem>
          <div class="ivu-form-item">
            <label style="display: inline-block; padding-right: 12px; width: 110px;text-align: right;">指定格式：</label>
            <span>订单收货邮编</span>
            <Poptip
              trigger="click"
              placement="bottom-start"
              width="400px"
              :disabled="!isEdit || isDefaultTemplate"
              @on-popper-hide="popperHide"
              transfer
            >
              <span class="btn-cursor-text" :class="{'btn-no-drop': isDefaultTemplate}">
                <span v-if="showDefualtTxt">指定格式设置</span>
                <span v-else>
                  <span v-if="!$common.isEmpty(viewPrefixs)">以{{ viewPrefixs }}开头</span>
                  <span v-if="!$common.isEmpty(viewPrefixs) && !$common.isEmpty(viewContains)">
                    ，{{ formData.postalCodeLink == 0 ? '并且' : '或者' }}
                  </span>
                  <span v-if="!$common.isEmpty(viewContains)">包含{{ viewContains }}</span>
                </span>
              </span>
              <div slot="content">
                <div>订单邮编至少符合以下选中的条件中的任意一个条件(输入内容仅限数字、英文字母、中划线和空格)：</div>
                <div style="margin-top: 10px;">
                  <FormItem label="" :label-width="0" style="display: inline-block;" prop="prefixsCheckbox">
                    <Checkbox v-model="formData.prefixsCheckbox" :disabled="!isEdit || isDefaultTemplate">以</Checkbox>
                  </FormItem>
                  <FormItem label="" :label-width="0" style="display: inline-block;" prop="postalCodePrefixs">
                    <Input
                      style="width:400px;marginLeft:10px;"
                      type="textarea"
                      placeholder="可输入多个，中间用逗号或回车隔开"
                      v-model.trim="formData.postalCodePrefixs"
                      :disabled="!isEdit || isDefaultTemplate || !formData.prefixsCheckbox"
                      :autosize="{ minRows: 2, maxRows: 6 }"
                    />
                  </FormItem>
                  开头
                </div>
                <FormItem label="" :label-width="0" style="display: inline-block;" prop="postalCodeLink">
                  <dyt-select
                    v-model="formData.postalCodeLink"
                    style="width:100px;margin:10px 0;"
                    :disabled="!isEdit || isDefaultTemplate || !formData.containsCheckbox"
                    :clearable="false"
                  >
                    <Option :value="0" >并且</Option>
                    <Option :value="1" >或者</Option>
                  </dyt-select>
                </FormItem>
                <div>
                  <FormItem label="" :label-width="0" style="display: inline-block;" prop="containsCheckbox">
                    <Checkbox v-model="formData.containsCheckbox" :disabled="!isEdit || isDefaultTemplate">包含</Checkbox>
                  </FormItem>
                  <FormItem label="" :label-width="0" style="display: inline-block;" prop="postalCodeContains">
                    <Input
                      style="width:400px;marginLeft:10px;"
                      type="textarea"
                      placeholder="可输入多个，中间用逗号或回车隔开"
                      v-model.trim="formData.postalCodeContains"
                      :disabled="!isEdit || isDefaultTemplate || !formData.containsCheckbox"
                      :autosize="{ minRows: 2, maxRows: 6 }"
                    />
                  </FormItem>
                </div>
              </div>
            </Poptip>
            <!-- <span v-else style="display: inline-block; color:#f60; "></span> -->
            <div class="prefixsContainsError" v-if="tipsError['postalCodePrefixs'] || tipsError['postalCodeContains']">
              指定的订单收货邮编输入不符合规范，请重新输入
            </div>
          </div>
          <div class="m-form-line-item">
            <FormItem label="操作费用：" prop="weightHandleCost" class="before-item">
              <dyt-input
                placeholder="请输入不小于 0 的数字"
                v-model.trim="formData.weightHandleCost"
                :disabled="!isEdit"
              />
            </FormItem>
            <span>{{ formData.currency }}/kg，并且</span>
            <FormItem label="" prop="numberHandleCost" :label-width="0" class="after-item">
              <dyt-input
                placeholder="请输入不小于 0 的数字"
                v-model.trim="formData.numberHandleCost"
                :disabled="!isEdit"
              />
            </FormItem>
            <span>{{ formData.currency }}/件</span>
            <div class="weightAndNumberTipsError" v-if="weightAndNumberError">
              操作费用必须填写一个条件，也可同时填写两个条件
            </div>
          </div>
        </Form>
      </div>
      <div slot="footer">
        <Button @click="isVisible = false">取 消</Button>
        <Button v-if="isEdit" type="primary" @click="submitForm" :loading="modalLoading">确 定</Button>
      </div>
      <Spin fix v-if="modalLoading">正在处理数据中....</Spin>
    </Modal>
  </div>
</template>
<script>
import api from '@/api/api';
// import { LOAD_CHILDREN_OPTIONS } from '@riophae/vue-treeselect';

export default {
  name: "thirdpartyTagManage",
  components: {},
  mixins: [],
  props: {
    modelVisible: { type: Boolean, default: false },
    // 视图类型
    viewType: { type: String, default: 'view' },
    moduleData: {
      type: Object,
      default () {
        return {};
      }
    }
  },
  data () {
    return {
      modalLoading: false,
      weightAndNumberError: false,
      shippingMethodData: [],
      tipsError: {},
      treeJson: {},
      currencyList: [],
      // 表单默认数据
      formData: {
        id: '',
        // isDefault: null,
        templateType: null,
        // merchantShippingMethodId: null,
        templateName: '',
        discount: '',
        currency: '',
        prefixsCheckbox: false,
        containsCheckbox: false,
        postalCodeLink: 0,
        postalCodePrefixs: '',
        postalCodeContains: '',
        weightHandleCost: null,
        numberHandleCost: null,
        shippingMethodIdList: []
      },
      detail: {},
      // 表单验证
      ruleValidate: {
        templateName: [
          { required: true, validator: this.validatorTemplateName, trigger: 'blur' },
          { required: true, validator: this.validatorTemplateName, trigger: 'change' }
        ],
        discount: [
          { validator: this.validatorDiscount, trigger: 'blur' },
          { validator: this.validatorDiscount, trigger: 'change' }
        ],
        currency: [
          { required: true, message: '请选择费用币种', trigger: 'change', type: 'string' }
        ],
        shippingMethodIdList: [
          { required: true, validator: this.validatorMethodId, trigger: 'change' }
        ],
        weightHandleCost: [
          { validator: this.validateExpenser, trigger: 'blur' },
          { validator: this.validateExpenser, trigger: 'change' }
        ],
        numberHandleCost: [
          { validator: this.validateExpenser, trigger: 'blur' },
          { validator: this.validateExpenser, trigger: 'change' }
        ],
        postalCodePrefixs: [
          { validator: this.validatePrefixsAndContains, trigger: 'blur' },
          { validator: this.validatePrefixsAndContains, trigger: 'change' }
        ],
        postalCodeContains: [
          { validator: this.validatePrefixsAndContains, trigger: 'blur' },
          { validator: this.validatePrefixsAndContains, trigger: 'change' }
        ]
      },
      isVisible: false
    };
  },
  watch: {
    modelVisible (newVal) {
      if (newVal) this.open();
    },
    isVisible (newVal) {
      this.$emit('update:modelVisible', newVal);
      !newVal && this.closeModal();
    }
  },
  computed: {
    // 权限
    permission () {
      return {
        // add: this.getPermission('thirdpartyTagManage_add')
      }
    },
    // 标题
    modalTitle () {
      if (this.viewType === 'add') return '新增费用类型';
      if (this.viewType === 'edit') return '编辑费用类型';
      return '查看费用类型';
    },
    showDefualtTxt () {
      if (this.$common.isEmpty(this.formData.postalCodePrefixs) && this.$common.isEmpty(this.formData.postalCodeContains)) return true;
      return !(this.formData.prefixsCheckbox || this.formData.containsCheckbox);
    },
    viewPrefixs () {
      if (this.$common.isEmpty(this.formData.postalCodePrefixs) || !this.formData.prefixsCheckbox) return '';
      return this.$common.split(this.formData.postalCodePrefixs, [',', '，', '\n'], true).join(',');
    },
    viewContains () {
      if (this.$common.isEmpty(this.formData.postalCodeContains) || !this.formData.containsCheckbox) return '';
      if (this.$common.isEmpty(this.formData.postalCodeLink) || !(this.formData.postalCodeLink == 0 || this.formData.postalCodeLink == 1)) return '';
      return this.$common.split(this.formData.postalCodeContains, [',', '，', '\n'], true).join(',');
    },
    // 是否可编辑
    isEdit () {
      if (['add', 'edit'].includes(this.viewType)) return true;
      return false;
    },
    isInitForm () {
      if (!['add'].includes(this.viewType)) return false;
      return true;
    },
    // 是默认模板
    isDefaultTemplate () {
      return !!this.moduleData.isDefaultTemplate
    }
  },
  methods: {
    // 打开窗口
    open () {
      this.isVisible = this.modelVisible;
      this.$refs.editModalContain && this.$refs.editModalContain.resetFields();
      this.$nextTick(() => {
        this.initData();
      })
    },
    // 关闭弹窗
    closeModal () {
      this.$refs.editModalContain && this.$refs.editModalContain.resetFields();
      this.weightAndNumberError = false;
      this.$nextTick(() => {
        this.modalLoading = false;
      });
    },
    // 初始化数据
    initData () {
      this.modalLoading = true;
      this.$common.promiseAll([
        this.queryCurrency,
        this.getEnableCarriersAndShipping,
        this.initForm
      ]).then((resArr) => {
        const formInitData = resArr.slice(-1)[0];
        this.detail = this.$common.copy(formInitData);
        if (!this.$common.isEmpty(formInitData)) {
          Object.keys(this.formData).forEach((key) => {
            if (!this.$common.isUndefined(formInitData[key])) {
              if (['postalCodePrefixs', 'postalCodeContains', 'shippingMethodIdList'].includes(key)) {
                if (['postalCodePrefixs'].includes(key)) {
                  this.$set(this.formData, key, formInitData[key]);
                  this.$set(this.formData, 'prefixsCheckbox', !this.$common.isEmpty(formInitData[key]));
                }
                if (['postalCodeContains'].includes(key)) {
                  this.$set(this.formData, key, formInitData[key]);
                  this.$set(this.formData, 'containsCheckbox', !this.$common.isEmpty(formInitData[key]));
                }
                if (['shippingMethodIdList'].includes(key)) {
                  this.$set(this.formData, key, this.handInitSelect(formInitData[key]));
                }
              } else {
                this.$set(this.formData, key, formInitData[key]);
              }
            }
          })
        }
      }).finally(() => {
        this.modalLoading = false;
      })
    },
    // 初始化表单数据
    initForm () {
      return new Promise((resolve) => {
        if (this.isInitForm || this.$common.isEmpty(this.moduleData)) return resolve({});
        this.axios.post(`${api.settingService.queryRemoteAreaCostTemplateDetail}/${this.moduleData.id}`).then((res) => {
          if (this.$common.isEmpty(res.data) || this.$common.isEmpty(res.data.datas)) return resolve({});
          resolve(res.data.datas);
        }).catch(() => {
          resolve({});
        })
      })
    },
    // 对选中的邮寄方式进行初始化
    handInitSelect (keys = []) {
      let childenKey = [];
      let removeKey = [];
      let addKey = [];
      Object.entries(this.treeJson).forEach((item) => {
        if (!this.$common.isEmpty(item[1].children)) {
          childenKey = [];
          item[1].children.forEach(m => {
            if (keys.includes(m.id)) {
              childenKey.push(m.id);
            }
          })
          if (childenKey.length === item[1].children.length) {
            addKey.push(item[0]);
            removeKey = [...removeKey, ...childenKey];
          }
        }
      });
      let selectKey = keys.filter(key => {
        return !removeKey.includes(key);
      })
      return [...selectKey, ...addKey];
    },
    // 获取币种
    queryCurrency() {
      return new Promise((resolve) => {
        const date = this.$common.dateTransform(new Date(), 'YYYY-MM');
        this.axios.post(`${api.queryCurrency}?date=${date}`, {}, { hiddenError: true }).then((res) => {
          this.currencyList = res.data.datas;
        }).finally(() => {
          resolve(true);
        })
      })
    },
    // 获取邮寄方式
    getEnableCarriersAndShipping () {
      return new Promise((resolve) => {
        this.shippingMethodData = [];
        this.treeJson = {};
        this.axios.get(api.settingService.queryEnableCarriersAndShippingMethod, { hiddenError: true }).then((res) => {
          if (this.$common.isEmpty(res.data) || this.$common.isEmpty(res.data.datas)) return;
          this.shippingMethodData = this.enableCarriersHand(res.data.datas);
        }).finally(() => {
          resolve(true);
        })
      })
    },
    // 邮寄方式处理
    enableCarriersHand (list = []) {
      list.forEach((item) => {
        item.id = this.$common.isEmpty(item.shippingMethodId) ? item.carrierId : item.shippingMethodId;
        if (this.$common.isEmpty(item.carrierShippingMethodName) && !this.$common.isEmpty(item.carrierName)) {
          item.label = item.carrierName;
        } else {
          item.label = item.carrierShippingMethodName;
        }
        if (!this.$common.isEmpty(item.shippingMethodVOList)) {
          item.children = this.enableCarriersHand(item.shippingMethodVOList);
        }
        this.$set(this.treeJson, item.id, item);
      })
      return list;
    },
    // 处理树节点
    treeNormalizer (node) {
      return {
        id: node.id,
        label: node.label,
        children: node.children
      }
    },
    // 处理指定格式
    popperHide () {
      const selectItem = (this.formData.shippingMethodIdList || []).filter(id => {
        return !this.$common.isEmpty(this.treeJson[id]);
      }).map(key => {
        return this.treeJson[key];
      });
      let selectId = [];
      selectItem.forEach(item => {
        selectId = [...selectId, ...this.getTreeId(item)];
      });
      return this.$common.arrRemoveRepeat(selectId);
    },
    getTreeId (list) {
      let backList = [];
      if (this.$common.isArray(list)) {
        list.forEach(item => {
          backList.push(item.id);
          if (!this.$common.isEmpty(item.children)) {
            backList = [...backList, ...this.getTreeId(item.children)];
          }
        })
      } else if (this.$common.isObject(list)) {
        if (this.$common.isArray(list.children)) {
          backList = [...backList, ...this.getTreeId(list.children)];
        } else if (!this.$common.isEmpty(list.shippingMethodId)) {
          backList.push(list.id);
        }
      }
      return backList;
    },
    // 获取表单数据
    getFormData () {
      const paramData = this.$common.copy(this.formData);
      paramData.numberHandleCost = this.$common.isEmpty(paramData.numberHandleCost) ? null : Number(paramData.numberHandleCost);
      paramData.weightHandleCost = this.$common.isEmpty(paramData.weightHandleCost) ? null : Number(paramData.weightHandleCost);
      paramData.discount = this.$common.isEmpty(paramData.discount) ? null : Number(paramData.discount);
      paramData.shippingMethodIdList = this.popperHide();
      paramData.postalCodePrefixs = paramData.prefixsCheckbox ? this.viewPrefixs : '';
      paramData.postalCodeContains = paramData.containsCheckbox ? this.viewContains : '';
      if (['add'].includes(this.viewType)) {
        delete paramData.id;
      }
      delete paramData.containsCheckbox;
      delete paramData.prefixsCheckbox;
      return paramData;
    },
    // 费用模板名称验证
    validatorTemplateName (rule, value, callback) {
      if (!this.isEdit) return callback();
      if (this.$common.isEmpty(value)) {
        return callback(new Error('请输入费用模板名称'));
      }
      if (value.length > 200) {
        return callback(new Error('输入字符长度不符合标准，最多可输入200个字符'));
      }
      callback();
    },
    // 验证总折扣
    validatorDiscount (rule, value, callback) {
      if (!this.isEdit) return callback();
      if (!this.$common.isEmpty(value)) {
        let newVal = Number(value);
        if (this.$common.isEmpty(newVal) || newVal < 0) {
          return callback(new Error('请输入不小于 0 且最多4位小数的数字'));
        }
        if ((value.toString()).includes('.')) {
          const decimals = (value.toString()).split('.')[1];
          if (decimals.length > 4) {
            return callback(new Error('请输入不小于 0 且最多4位小数的数字'));
          }
        }
      }
      callback();
    },
    // 邮寄方式改变时
    treeChange (val) {
      // 触发验证
      this.$nextTick(() => {
        this.$refs.editModalContain && this.$refs.editModalContain.validateField('shippingMethodIdList');
      })
    },
    // 验证邮寄方式
    validatorMethodId (rule, value, callback) {
      if (!this.isEdit || this.isDefaultTemplate) return callback();
      if (this.$common.isEmpty(value)) {
        return callback(new Error('请选择邮寄方式'));
      }
      callback();
    },
    // 操作费用验证
    validateExpenser (rule, value, callback) {
      this.$nextTick(() => {
        if (!this.isEdit) return callback();
        // let newVal = this.formData[rule.field];
        const otherKey = rule.field == 'weightHandleCost' ? 'numberHandleCost' : 'weightHandleCost';
        const otherVal = this.formData[otherKey];
        if (this.$common.isEmpty(value) && this.$common.isEmpty(otherVal)) {
          if (!this.weightAndNumberError) {
            this.weightAndNumberError = true;
            this.$refs.editModalContain.validateField(otherKey);
          }
          return callback(new Error(' '));
        }
        if (this.weightAndNumberError) {
          this.weightAndNumberError = false;
          this.$refs.editModalContain.validateField(otherKey);
        }
        const newVal = (this.$common.isEmpty(value) ? '' : value).toString();
        if (this.$common.isEmpty(Number(newVal)) || Number(newVal) < 0) {
          return callback(new Error('请输入不小于 0 且最多2位小数的数字'));
        }
        if (newVal.includes('.')) {
          const decimals = newVal.split('.')[1];
          if (decimals.length > 2) {
            return callback(new Error('请输入不小于 0 且最多2位小数的数字'));
          }
        }
        callback();
      })
    },
    // 验证指定格式
    validatePrefixsAndContains (rule, value, callback) {
      if (rule.field == 'postalCodePrefixs') {
        if (!this.formData.prefixsCheckbox || this.$common.isEmpty(value)) {
          this.$set(this.tipsError, rule.field, false);
          return callback();
        }
      }
      if (rule.field == 'postalCodeContains') {
        if (!this.formData.containsCheckbox || this.$common.isEmpty(value)) {
          this.$set(this.tipsError, rule.field, false);
          return callback();
        }
      }
      const reg = /^[\w -,，\n]+$/;
      if (!reg.test(value)) {
        this.$set(this.tipsError, rule.field, true);
        return callback(new Error('输入内容仅限数字、英文字母、中划线和空格'));
      }
      this.$set(this.tipsError, rule.field, false);
      callback();
    },
    // 提交(保存)数据
    submitForm () {
      if (this.modalLoading) return;
      this.$refs.editModalContain.validate((valid) => {
        if (!valid) return;
        const apiUrl = api.settingService[['add'].includes(this.viewType) ? 'insertRemoteAreaCostTemplate' : 'updateRemoteAreaCostTemplate'];
        this.modalLoading = true;
        this.axios.post(apiUrl, this.getFormData()).then((res) => {
          if (!res.data || res.data.code != 0) return;
          this.$Message.success("操作成功");
          this.$emit('searchTable', false);
          this.isVisible = false;
        }).finally(() => {
          this.modalLoading = false;
        })
      })
    }
  }
};
</script>
<style lang="less" scoped>
:deep(.edit-modal-box){
  .ivu-modal{
    top: 60px;
    // width: 80% !important;
    width: 700px !important;
    // min-width: 400px;
    .ivu-modal-body{
      max-height: calc(100vh - 200px);
    }
  }
  .ivu-modal-body{
    padding: 0
  }
  .ivu-input[disabled] {
    color: #333;
  }
  .ivu-form-item {
    position: relative;
    padding-left: 15px;
    padding-right: 30px;
  }
  .m-form-line-item{
    position: relative;
    padding-left: 15px;
    padding-right: 30px;
    .ivu-form-item{
      display: inline-block;
      padding-left: 0;
      padding-right: 0;
      &.before-item{
        width: calc(50% - 30px);
      }
      &.after-item{
        width: calc(50% - 150px);
      }
    }
    >span {
      display: inline-block;
      padding: 0 5px;
      line-height: 32px;
    }
  }
  .ivu-form-item-error-tip{
    padding-top: 3px;
    font-size: 12px;
    line-height: initial;
  }
}
.edit-modal-contain{
  position: relative;
  max-height: calc(100vh - 200px);
  padding: 16px 16px 0px 16px;
  overflow: auto;
}
.form-separate-item{
  padding: 0 10px 5px 10px;
  margin-bottom: 15px;
  border-bottom: 1px solid #ccc;
  font-size: 16px;
}
.btn-cursor-text{
  cursor: pointer;
  color: #57a3f3;
  &.btn-no-drop{
    cursor: no-drop;
  }
  >span{
    padding-left: 5px;
  }
}
.weightAndNumberTipsError{
  position: absolute;
  padding-left: 110px;
  top: 36px;
  font-size: 12px;
  color: #ed4014;
}
.prefixsContainsError{
  position: absolute;
  padding-left: 110px;
  top: 20px;
  font-size: 12px;
  color: #ed4014;
}
</style>
