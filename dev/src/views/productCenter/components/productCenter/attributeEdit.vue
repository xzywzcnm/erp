<template>
  <Modal
    v-model="showAttribute"
    :width="80"
    :title="modalTitle"
    :mask-closable="false"
    class="modal-detail-form-center"
  >
    <Form ref="formValidate" :model="formData" :disabled="!isEdit" :rules="ruleValidate" :label-width="110" class="form-style">
      <div style="border-bottom: 1px solid #ccc;">
        <div class="form-row">
          <FormItem
            label="属性别名"
            prop="aliasName"
            class="form-row-item"
          >
            <dyt-input
              v-model="formData.aliasName"
              :placeholder="`${!isEdit ? '' : `请输入属性别名`}`"
              :maxlength="60"
              :disabled="!isEdit"
            />
          </FormItem>
          <FormItem
            v-for="(item, index) in defaultFormRows"
            :label="item.attrTitle"
            :prop="item.name"
            class="form-row-item"
            :key="`attr-${index}`"
          >
            <dyt-input
              v-model="formData[item.name]"
              :placeholder="`${!isEdit ? '' : `请输入${item.tips}属性名称`}`"
              :maxlength="item.max"
              :disabled="!isEdit"
            />
          </FormItem>
        </div>
      </div>
      <div class="attr-item" v-for="(item, index) in formData.attributeValueList" :key="`f-${index}`">
        <div class="form-row">
          <FormItem
            v-for="(attrVal, vIndex) in defaultFormRows"
            :label="attrVal.title"
            :prop="`attributeValueList.${index}.${attrVal.key}`"
            class="form-row-item"
            :key="`val-${vIndex}`"
            :rules="[
              {required: attrVal.required, validator: validateEnName, trigger: 'blur'},
              {required: attrVal.required, validator: validateEnName, trigger: 'change'}
            ]"
          >
            <dyt-input
              v-model="item[attrVal.key]"
              :placeholder="`${!isEdit ? '' : `请输入${attrVal.tips}属性值`}`"
              :maxlength="attrVal.max"
              :disabled="!isEdit"
            />
          </FormItem>
        </div>
        <div class="row-item-btn">
          <div
            v-if="index < 1 && isEdit"
            @click="addFormRow"
          >添加</div>
          <div
            v-if="formData.attributeValueList && formData.attributeValueList.length > 1 && isEdit"
            @click="delFormRow(index)"
          >删除</div>
          <div v-if="formDeleteTips[index]" @click="cancelDeleteRow">取消</div>
        </div>
        <div
          v-if="formDeleteTips[index]"
          class="form-delete-tips"
        >提示:是否确认删除？确认删除, 请再次点击 "删除" 执行操作</div>
      </div>
      <div style="margin-top: 24px;">
        <FormItem label="类型" prop="type">
          <RadioGroup v-model="formData.type">
            <Radio label="0">单选</Radio>
            <Radio label="1">多选</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="必选" prop="isMandatory">
          <RadioGroup v-model="formData.isMandatory">
            <Radio label="1">是</Radio>
            <Radio label="0">否</Radio>
            <Radio label="2">重要非必填</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="生成标题及文本" prop="isTitleAndText">
          <RadioGroup v-model="formData.isTitleAndText">
            <Radio label="1">是</Radio>
            <Radio label="0">否</Radio>
          </RadioGroup>
        </FormItem>
      </div>
    </Form>
    <div slot="footer">
      <Button v-if="isEdit" type="primary" @click="saveAttribute">保 存</Button>
      <Button @click="cancelAttribute">{{`${isEdit?'取 消':'关 闭'}`}}</Button>
    </div>
  </Modal>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  mixins: [Mixin],
  components: {},
  props: {
    modalVisual: {
      type: Boolean,
      default: false
    },
    modalType: {
      type: String,
      default: 'view'
    },
    moduleData: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  data () {
    return {
      isEdit: false,
      showAttribute: false,
      modalTitle: '属性详情',
      formDeleteTips: {},
      formData: {
        aliasName: '',
        // 属性ID
        attributeClassifyId: '',
        // 属性值数组
        attributeValueList: [],
        isMandatory: null, // 是否必选 0-否,1-是
        type: null, // 类型 0-单选,1-多选
        isTitleAndText: null// 生成标题及文本 0-否,1-是
      },
      defaultFormRows: [
        // 中文
        { key: 'cnValue', name: 'cnName', title: '属性值', attrTitle: '属性名(中)', max: 60, required: true, tips: '中文' },
        // 德语
        { key: 'deValue', name: 'deName', title: '(德语)', attrTitle: '(德语)', max: 300, tips: '德语' },
        // 法语
        { key: 'frValue', name: 'frName', title: '(法语)', attrTitle: '(法语)', max: 300, tips: '法语' },
        // 西班牙
        { key: 'esValue', name: 'esName', title: '(西班牙语)', attrTitle: '(西班牙语)', max: 300, tips: '西班牙语' },
        // 英文
        { key: 'enValue', name: 'enName', title: '(英文)', attrTitle: '(英文)', max: 300, required: true, tips: '英文' },
        // 意大利语
        { key: 'itValue', name: 'itName', title: '(意大利语)', attrTitle: '(意大利语)', max: 300, tips: '意大利语' },
        // 葡萄牙语
        { key: 'ptValue', name: 'ptName', title: '(葡萄牙语)', attrTitle: '(葡萄牙语)', max: 300, tips: '葡萄牙语' },
        // 波兰语
        { key: 'plValue', name: 'plName', title: '(波兰语)', attrTitle: '(波兰语)', max: 300, tips: '波兰语' }
      ],
      // 转化下标
      formKeys: {
        attributeClassifyId: 'attributeId'
      },
      toString: ['type', 'isMandatory', 'isTitleAndText'],
      ruleValidate: {
        aliasName: [
          { required: true, message: '属性别名不能为空', trigger: 'blur' },
          { required: true, message: '属性别名不能为空', trigger: 'change' }
        ],
        cnName: [
          { required: true, message: '中文名称不能为空', trigger: 'blur' },
          { required: true, message: '中文名称不能为空', trigger: 'change' }
        ],
        enName: [
          { required: true, validator: this.validateEnName, trigger: 'blur' },
          { required: true, validator: this.validateEnName, trigger: 'change' }
        ],
        // enName: [
        //   { required: true, message: '英文名称不能为空', trigger: 'blur' },
        //   { required: true, message: '英文名称不能为空', trigger: 'change' }
        // ],
        type: [
          { required: true, message: '请选择类型', trigger: 'change' }
        ],
        isMandatory: [
          { required: true, message: '请选择', trigger: 'change' }
        ],
        isTitleAndText: [
          { required: true, message: '请选择', trigger: 'change' }
        ]
      }
    };
  },
  watch: {
    modalVisual: {
      immediate: true,
      deep: true,
      handler (val) {
        val && this.init()
        this.$nextTick(() => {
          this.showAttribute = val
        })
      }
    },
    showAttribute: {
      deep: true,
      handler (val) {
        setTimeout(() => {
          this.$emit('update:modalVisual', val)
        }, 500)
      }
    },
    modalType: {
      immediate: true,
      deep: true,
      handler (val) {
        const v = {
          view: '属性详情',
          add: '新增属性',
          edit: '编辑属性'
        }
        this.modalTitle = v[val]
      }
    },
    // 简单表单变化
    formData: {
      deep: true,
      handler () {
        this.cancelDeleteRow()
      }
    }
  },
  created () {},
  computed: {},
  methods: {
    // 初始化页面数据
    init () {
      this.formData.attributeValueList.push({});
      this.defaultFormRows.forEach(item => {
        this.$set(this.formData, item.name, '');
        this.$set(this.formData.attributeValueList[0], item.key, '');
      })
      if (this.moduleData.attributeClassifyId) {
        this.getDetails()
      } else {
        this.isEdit = ['add', 'edit'].includes(this.modalType)
      }
    },
    // 获取分类详情
    getDetails () {
      this.axios.get(api.attributeDetails, {
        params: {
          attributeId: this.moduleData.attributeClassifyId
        }
      }).then(res => {
        if (res.data && res.data.code == 0 && res.data.datas) {
          Object.keys(this.formData).forEach(key => {
            if (this.formKeys[key]) {
              const keyV = res.data.datas[this.formKeys[key]]
              if (this.toString.includes(key)) {
                const item = isNaN(keyV) ? keyV : (keyV).toString()
                this.$set(this.formData, this.formKeys[key], item)
              } else {
                this.$set(this.formData, key, keyV)
              }
            } else {
              if (this.toString.includes(key)) {
                const item = isNaN(res.data.datas[key]) ? res.data.datas[key] : (res.data.datas[key]).toString()
                this.$set(this.formData, key, item)
              } else {
                this.$set(this.formData, key, res.data.datas[key])
              }
            }
          })
          this.isEdit = ['add', 'edit'].includes(this.modalType)
        }
      })
    },
    // 保存
    saveAttribute () {
      const v = {
        hand: () => {
          const newForm = JSON.parse(JSON.stringify(this.formData))
          Object.keys(newForm).forEach(key => {
            if (this.toString.includes(key)) {
              newForm[key] = Number(newForm[key])
            }
          })
          this.axios.post(api[this.modalType == 'add' ? 'addAttribute' : 'editAttribute'], newForm).then(res => {
            if (res.data.code == 0) {
              this.$Message.success('操作成功');
              // 刷新父级列表
              this.$emit('update:refresh', true)
              this.$nextTick(() => {
                this.showAttribute = false
              })
            } else if (res.data.code == 500000) {
              this.$Message.error('该属性已存在，请修改属性名称')
            }
          })
        }
      }
      this.$refs.formValidate.validate((valid) => {
        valid && v.hand()
      })
    },
    // 关闭窗口
    cancelAttribute () {
      this.$refs.formValidate.resetFields()
      this.$nextTick(() => {
        this.showAttribute = false
      })
    },
    // 验证
    validateEnName (rule, value, callback) {
      if (rule.required && !value) {
        return callback(new Error('此项不能为空'));
      }
      const field = rule.field.split('.')
      const regex = /.*[\u4e00-\u9fa5]+.*$/;
      if (regex.test(value) && (field.includes('enValue') || field.includes('enName'))) {
        return callback(new Error('不能含有汉字'));
      }
      let isHas = false;
      if (field.includes('attributeValueList') && field[2] && !field[2].includes('cnValue')) {
        const keys = this.$common.copy(this.defaultFormRows).map(item => {
          return item.key
        })
        let newform = JSON.parse(JSON.stringify(this.formData))
        const nowItem = this.formData.attributeValueList[field[1]]
        newform.attributeValueList.splice(field[1], 1)
        if (keys.includes(field[2])) {
          const sameVal = newform.attributeValueList.map(item => {
            return item[field[2]]
          })
          isHas = Array.from(new Set(sameVal)).includes(nowItem[field[2]])
        }
      }
      if (isHas && value) {
        return callback(new Error('该名称已存在'));
      }
      callback();
    },
    // 新增属性值行
    addFormRow () {
      let row = {};
      this.$common.copy(this.defaultFormRows).forEach(item => {
        row[item.key] = '';
      })
      // this.formData.attributeValueList.push(row)
      this.formData.attributeValueList = [...[row], ...this.formData.attributeValueList]
      this.cancelDeleteRow()
    },
    // 删除属性值行
    delFormRow (index) {
      // 清除其他行标记
      Object.keys(this.formDeleteTips).forEach(key => {
        key != index && this.$set(this.formDeleteTips, key, false)
      })
      if (this.formDeleteTips[index]) {
        this.formData.attributeValueList.splice(index, 1);
        this.cancelDeleteRow()
      } else {
        const item = this.formData.attributeValueList[index]
        // 检查是否为空
        const isDelete = Object.keys(item).filter(key => {
          return item[key]
        }).length
        if (isDelete == 0) {
          this.formData.attributeValueList.splice(index, 1);
          this.cancelDeleteRow()
        } else {
          this.$set(this.formDeleteTips, index, true)
        }
      }
    },
    // 取消删除属性行
    cancelDeleteRow () {
      this.formDeleteTips = {}
    }
  }
};
</script>
<style scoped lang="less">
.modal-detail-form-center{
  .form-row{
    // display: flex;
    width: calc(100% - 60px);
    .form-row-item{
      display: inline-block;
      width: 25%;
      // max-width: 400px;
    }
  }
  .form-delete-tips{
    padding: 0 0 0 100px;
    font-size: 12px;
    color: #f20;
  }
}
</style>
<style lang="less">
.modal-detail-form-center{
  .ivu-modal{
    top: 0;
    height: 100%;
    .ivu-modal-content{
      position: absolute;
      width: 100%;
      top: 50%;
      transform: translate(0, -50%);
    }
    .ivu-modal-body{
      max-height: 70vh;
      overflow: auto;
    }
  }
  .attr-item{
    position: relative;
    margin-top: 24px;
    border-bottom: 1px solid #ccc;
  }
  .row-item-btn{
    position: absolute;
    right: 0;
    top: 0;
    div{
      padding: 0 0 5px 0;
      color: #2d8cf0;
      cursor: pointer;
    }
  }
  .ivu-form-item-error-tip{
    padding-top: 1px;
    font-size: 12px;
  }
}
</style>
