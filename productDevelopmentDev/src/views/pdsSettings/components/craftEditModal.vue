<template>
  <Modal :title="modalTitle" v-model="pageVisible" width="800px" :mask-closable="false">
    <div class="modal-body-contain">
      <Form ref="formValidate" :model="formData" :rules="ruleValidate" :label-width="100">
        <FormItem label="类型:" prop="technologyType">
          <dytSelect v-model="formData.technologyType" placeholder="请选择工艺类型" :disabled="!isEdit">
            <Option v-for="(item, index) in Object.values(craftType)" :value="item.value" :key="`c-${index}`">{{ item.label }}</Option>
          </dytSelect>
        </FormItem>
        <FormItem label="名称:" prop="technologyName">
          <dyt-input
            class="textarea-resize-none"
            placeholder="请输入工艺名称"
            v-model="formData.technologyName"
          />
        </FormItem>
        <FormItem label="描述:" prop="description">
          <dyt-input
            class="textarea-resize-none"
            type="textarea"
            placeholder="请输入工艺描述"
            v-model="formData.description"
            :autosize="{ minRows: 2, maxRows: 6}"
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
import { craftType } from '@/utils/pdsSettingConstant';

export default {
  components: {},
  props: {
    modelVisible: { type: Boolean, default: false },
    modalData: { type: Object, default: () => { return {} } },
    modalType: { type: String, default: 'view' },
  },
  data () {
    return {
      pageVisible: false,
      pageLoading: false,
      craftType: craftType,
      formData: {
        technologyId: '',
        technologyName: '',
        technologyType: null,
        description: ''
      },
      ruleValidate: {
        technologyName: [
          { required: true, validator: this.strMaxVerify, maxLength: 100, msg: '请输入工艺名称', trigger: 'blur' },
          { required: true, validator: this.strMaxVerify, maxLength: 100, msg: '请输入工艺名称', trigger: 'change' }
        ],
        technologyType: [
          { required: true, message: '请选择工艺类型', trigger: 'change', type: 'number' }
        ],
        description: [
          { required: true, validator: this.strMaxVerify, maxLength: 500, msg: '请输入工艺描述', trigger: 'blur' },
          { required: true, validator: this.strMaxVerify, maxLength: 500, msg: '请输入工艺描述', trigger: 'change' }
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
    technologyId () {
      if (this.$common.isEmpty(this.modalData) || this.$common.isEmpty(this.modalData.technologyId)) return '';
      return this.modalData.technologyId;
    },
    // 标题
    modalTitle () {
      return this.$common.isEmpty(this.technologyId) ? '新增工艺' : '编辑工艺';
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
        if (!this.$common.isEmpty(this.modalData) && !this.$common.isEmpty(this.technologyId)) {
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
        // this.$axios.post(api.queryProductMaterialDetail, {technologyId: this.technologyId}).then(({ code, datas }) => {
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
    // 返回
    goBack () {
      this.$refs.formValidate && this.$refs.formValidate.resetFields();
      this.pageVisible = false;
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
    // 保存
    saveDetail () {
      if (!this.$refs.formValidate || this.pageLoading) return;
      this.$refs.formValidate.validate((valid) => {
        if (!valid) return;
        this.pageLoading = true;
        const apiUrl = api[this.$common.isEmpty(this.technologyId) ? 'pushProductTechnology' : 'updateProductTechnology'];
        const formData = this.$common.copy(this.formData);
        if (this.$common.isEmpty(this.technologyId)) {
          delete formData.technologyId;
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
.modal-body-contain{
  position: relative;
  .textarea-resize-none{
    :deep(textarea){
      resize: none;
    }
  }
}
</style>
