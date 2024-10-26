<template>
  <Modal :title="modalTitle" v-model="pageVisible" width="800px" :mask-closable="false">
    <div class="modal-body-contain">
      <Form ref="formValidate" :model="formData" :rules="ruleValidate" :label-width="100">
        <FormItem label="二次工艺名称:" prop="secondaryProcessName">
          <dyt-input
            class="textarea-resize-none"
            placeholder="请输入二次工艺名称"
            v-model="formData.secondaryProcessName"
          />
        </FormItem>
        <FormItem label="二次工艺类型:" prop="secondaryProcessType">
          <dytSelect v-model="formData.secondaryProcessType" placeholder="请选择二次工艺类型" :disabled="!isEdit">
            <Option v-for="(item, index) in Object.values(craftType)" :value="item.value" :key="`c-${index}`">{{ item.label }}</Option>
          </dytSelect>
        </FormItem>
        <FormItem label="供应商:" prop="supplierId">
          <dytSelect v-model="formData.supplierId" placeholder="请选择供应商" :disabled="!isEdit" @on-change="supplierChange">
            <Option
              v-for="(item, index) in supplyList"
              :key="`supply-${index}`"
              :value="item.supplierId"
              :disabled="![3].includes(Number(item.auditStatus))"
              :class="{'ineffective-option': ![3].includes(Number(item.auditStatus))}"
            >{{ item.supplierName }}</Option>
          </dytSelect>
        </FormItem>
        <FormItem label="二次工艺价格:" prop="price">
          <dyt-input
            class="textarea-resize-none"
            placeholder="请输入二次工艺价格"
            v-model="formData.price"
          />
        </FormItem>
      </Form>
    </div>
    <div slot="footer" style="text-align: right;">
      <Button @click="goBack">取 消</Button>
      <Button type="primary" @click="saveDetail">确 定</Button>
    </div>
    <Spin v-if="pageLoading" fix></Spin>
  </Modal>
</template>

<script>
import api from '@/api/api';
import { twiceCraftType } from '@/utils/pdsSettingConstant';

export default {
  components: {},
  props: {
    modelVisible: { type: Boolean, default: false },
    modalData: { type: Object, default: () => { return {} } },
    modalType: { type: String, default: 'view' },
    supplyList: { type: Array, default: () => { return [] } },
  },
  data () {
    return {
      pageVisible: false,
      pageLoading: false,
      craftType: twiceCraftType,
      formData: {
        secondaryProcessId: '',
        secondaryProcessName: '',
        secondaryProcessType: null,
        supplierId: null,
        supplierName: null,
        price: null
      },
      ruleValidate: {
        secondaryProcessName: [
          { required: true, validator: this.strMaxVerify, maxLength: 200, msg: '请输入二次工艺名称', trigger: 'blur' },
          { required: true, validator: this.strMaxVerify, maxLength: 200, msg: '请输入二次工艺名称', trigger: 'change' }
        ],
        secondaryProcessType: [
          { required: true, message: '请选择二次工艺类型', trigger: 'change', type: 'number' }
        ],
        supplierId: [
          { required: true, message: '请选择供应商', trigger: 'change', type: 'string' }
        ],
        price: [
          { required: true, validator: this.validatorMaxNumber, min: 0, point: 2, notIncludes: ['min'], msg: '请输入二次工艺价格', trigger: 'blur' },
          { required: true, validator: this.validatorMaxNumber, min: 0, point: 2, notIncludes: ['min'], msg: '请输入二次工艺价格', trigger: 'change' }
        ],
      }
    }
  },
  watch: {
    modelVisible: {
      immediate: true,
      handler (val) {
        this.pageVisible = val;
        this.$nextTick(() => {
          val && this.initData();
        })
      }
    },
    pageVisible: {
      handler (val) {
        this.$emit('update:modelVisible', val);
      }
    }
  },
  created () {},
  computed: {
    // 是否可编辑
    isEdit () {
      return this.modalType == 'edit';
    },
    // 工艺ID
    secondaryProcessId () {
      if (this.$common.isEmpty(this.modalData) || this.$common.isEmpty(this.modalData.secondaryProcessId)) return '';
      return this.modalData.secondaryProcessId;
    },
    // 标题
    modalTitle () {
      return this.$common.isEmpty(this.secondaryProcessId) ? '新增二次工艺' : '编辑二次工艺';
    }
  },
  methods: {
    // 初始化数据
    initData () {
      this.pageLoading = true;
      this.$refs.formValidate && this.$refs.formValidate.resetFields();
      this.$nextTick(() => {
        let awaitRes = [];
        this.materialDetail = {};
        if (!this.$common.isEmpty(this.modalData) && !this.$common.isEmpty(this.secondaryProcessId)) {
          awaitRes.push(this.getDetail);
        }
        this.$common.promiseAll(awaitRes).then(resArr => {
          // console.log(resArr);
        }).finally(() => {
          this.pageLoading = false;
        })
      })
    },
    // 获取详情
    getDetail () {
      return new Promise((resolve) => {
        // this.$axios.post(api.queryProductMaterialDetail, {secondaryProcessId: this.secondaryProcessId}).then(({ code, datas }) => {
        //   if (code != 0 || this.$common.isEmpty(datas)) return resolve({});
        //   resolve(datas);
        // }).catch(err => {
        //   console.error(err);
        //   resolve({});
        // })
        Object.keys(this.formData).forEach((key) => {
          if (!this.$common.isUndefined(this.modalData[key])) {
            this.$set(this.formData, key, this.modalData[key]);
          }
        })
        resolve(this.modalData);
      })
    },
    // 供应商改变
    supplierChange (val) {
      if (this.$common.isEmpty(val)) {
        this.formData.supplierName = null;
        return;
      }
      const finSupplyInfo = this.supplyList.find(f => {
        return f.supplierId == val;
      })
      if (this.$common.isEmpty(finSupplyInfo)) {
        this.formData.supplierName = null;
        return;
      }
      this.formData.supplierName = finSupplyInfo.supplierName;
    },
    // 返回
    goBack () {
      this.$refs.formValidate && this.$refs.formValidate.resetFields();
      this.pageVisible = false;
    },
    // 字符长度验证
    strMaxVerify (rule, value, callback) {
      const maxLength = Number(rule.maxLength);
      const minLength = Number(rule.minLength);
      if (rule.required && this.$common.isEmpty(value)) {
        return callback(new Error(rule.msg || '必填项不能为空'));
      }
      if (!this.$common.isEmpty(minLength) && !this.$common.isEmpty(value) && minLength > value.length) {
        return callback(new Error(`最少需要输入 ${minLength} 字符长度`));
      }
      if (!this.$common.isEmpty(maxLength) && !this.$common.isEmpty(value) && value.length > maxLength) {
        return callback(new Error(`最多可输入 ${maxLength} 字符长度`));
      }
      callback();
    },
    // 验证数字
    validatorMaxNumber (rule, value, callback) {
      this.$nextTick(() => {
        if (rule.required && this.$common.isEmpty(value)) {
          return callback(new Error(rule.msg || '必填项不能为空'));
        }
        const point = Number(rule.point);
        const max = Number(rule.max);
        const min = Number(rule.min);
        const notIncludes = rule.notIncludes || [];
        if (!this.$common.isEmpty(value)) {
          const newVal = Number(value);
          const decimals = (value.toString()).split('.');
          if (this.$common.isEmpty(newVal) || (decimals.length > 1 && this.$common.isEmpty(decimals[0]))) {
            return callback(new Error('请输入数字'));
          }
          if (!this.$common.isEmpty(max) && newVal >= max) {
            if (notIncludes.includes('max') && newVal >= max) {
              if (!this.$common.isEmpty(point)) {
                if (point <= 0) return callback(new Error(`请输入小于${max}的整数`));
                return callback(new Error(`请输入小于${max}且最多${point}位小数的数字`));
              }
              return callback(new Error(`请输入小于${max}的数字`));
            }
            if (newVal > max) {
              if (!this.$common.isEmpty(point)) {
                if (point <= 0) return callback(new Error(`请输入不大于${max}的整数`));
                return callback(new Error(`请输入不大于${max}且最多${point}位小数的数字`));
              }
              return callback(new Error(`请输入不大于${max}的数字`));
            }
          }
          if (!this.$common.isEmpty(min) && min >= newVal) {
            if (notIncludes.includes('min') && min >= newVal) {
              if (!this.$common.isEmpty(point)) {
                if (point <= 0) return callback(new Error(`请输入大于${min}的整数`));
                return callback(new Error(`请输入大于${min}且最多${point}位小数的数字`));
              }
              return callback(new Error(`请输入大于${max}的数字`));
            }
            if (min > newVal) {
              if (!this.$common.isEmpty(point)) {
                if (point <= 0) return callback(new Error(`请输入不小于${min}的整数`));
                return callback(new Error(`请输入不小于${min}且最多${point}位小数的数字`));
              }
              return callback(new Error(`请输入不小于${max}的数字`));
            }
          }
          if (!this.$common.isEmpty(point)) {
            if (point <= 0) return callback(new Error(`请输入整数`));
            if (!this.$common.isEmpty(decimals[1]) && decimals[1].length > point) {
              return callback(new Error(`请输入最多为${point}的位小数`));
            }
          }
        }
        callback();
      })
    },
    // 保存
    saveDetail () {
      if (!this.$refs.formValidate || this.pageLoading) return;
      this.$refs.formValidate.validate((valid) => {
        if (!valid) return;
        this.pageLoading = true;
        const apiUrl = api[this.$common.isEmpty(this.secondaryProcessId) ? 'saveTwiceCraft' : 'editTwiceCraftList'];
        const formData = this.$common.copy(this.formData);
        if (this.$common.isEmpty(this.secondaryProcessId)) {
          delete formData.secondaryProcessId;
        }
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
    }
  }
};
</script>
<style scoped lang="less">
.ineffective-option {
  text-decoration: line-through 2px;
  text-decoration-color: rgba(255, 0, 0, 0.4);
}
.modal-body-contain{
  position: relative;
  .textarea-resize-none{
    :deep(textarea){
      resize: none;
    }
  }
}
</style>
