<template>
  <Modal v-model="dialogObj.modelVisible" title="添加SKC颜色" :mask-closable="false">
    <div class="form-contain">
      <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="150">
        <FormItem label="颜色中文名称" prop="color">
          <dyt-input v-model="formValidate.color" placeholder="请输入"></dyt-input>
        </FormItem>
        <FormItem label="颜色英文名称（英式）" prop="colorEn">
          <dyt-input v-model="formValidate.colorEn" placeholder="请输入"></dyt-input>
        </FormItem>
        <FormItem label="颜色英文名称（美式）" prop="colorAmerican">
          <dyt-input v-model="formValidate.colorAmerican" placeholder="请输入"></dyt-input>
        </FormItem>
        <FormItem label="颜色英文名称（澳式）" prop="colorAustralian">
          <dyt-input v-model="formValidate.colorAustralian" placeholder="请输入"></dyt-input>
        </FormItem>
        <FormItem label="颜色德文名称" prop="colorGerman">
          <dyt-input v-model="formValidate.colorGerman" placeholder="请输入"></dyt-input>
        </FormItem>
        <FormItem label="颜色波兰名称" prop="colorPoland">
          <dyt-input v-model="formValidate.colorPoland" placeholder="请输入"></dyt-input>
        </FormItem>
        <FormItem label="颜色法文名称" prop="colorFrance">
          <dyt-input v-model="formValidate.colorFrance" placeholder="请输入"></dyt-input>
        </FormItem>
        <FormItem label="颜色西班牙文名称" prop="colorSpanish">
          <dyt-input v-model="formValidate.colorSpanish" placeholder="请输入"></dyt-input>
        </FormItem>
      </Form>
    </div>
    <div slot="footer">
      <Button @click="dialogObj.modelVisible = false">取消</Button>
      <Button type="primary" @click="handleSubmit('formValidate')" :loading="loading">确定</Button>
    </div>
  </Modal>
</template>

<script>
import api from '@/api/api.js';
export default {
  name: 'addColor',
  data () {
    return {
      formValidate: {
        color: '',
        colorEn: '',
        colorAmerican: '',
        colorAustralian: '',
        colorFrance: '',
        colorGerman: '',
        colorPoland: '',
        colorSpanish: ''
      },
      ruleValidate: {
        color: [
          { required: true, message: '颜色中文名称必填', trigger: 'blur' }
        ],
        colorEn: [
          { required: true, message: '颜色英文名称（英式）必填', trigger: 'blur' },
          {
            // eslint-disable-next-line no-useless-escape
            pattern: /^[a-zA-Z `~!@#$%^&*()_+<>?:"{},.\/;'·！#￥（——）：；“”‘、，|《。》？【】[\]]+$/,
            message: '只能输入英文',
            trigger: 'blur'
          }
        ],
        colorAmerican: [
          { required: true, message: '颜色英文名称（美式）必填', trigger: 'blur' },
          {
            // eslint-disable-next-line no-useless-escape
            pattern: /^[a-zA-Z `~!@#$%^&*()_+<>?:"{},.\/;'·！#￥（——）：；“”‘、，|《。》？【】[\]]+$/,
            message: '只能输入英文',
            trigger: 'blur'
          }
        ],
        colorAustralian: [
          { required: true, message: '颜色英文名称（澳式）必填', trigger: 'blur' },
          {
            // eslint-disable-next-line no-useless-escape
            pattern: /^[a-zA-Z `~!@#$%^&*()_+<>?:"{},.\/;'·！#￥（——）：；“”‘、，|《。》？【】[\]]+$/,
            message: '只能输入英文',
            trigger: 'blur'
          }
        ],
        colorGerman: [
          { required: true, message: '颜色德文名称必填', trigger: 'blur' }
        ],
        colorPoland: [
          { required: true, message: '颜色波兰文名称必填', trigger: 'blur' }
        ],
        colorFrance: [
          { required: true, message: '颜色法文名称必填', trigger: 'blur' }
        ],
        colorSpanish: [
          { required: true, message: '颜色西班牙文名称必填', trigger: 'blur' }
        ],
      },
      loading: false
    }
  },
  props: {
    dialogObj: {
      type: Object,
      default () {
        return {
          modelVisible: false,
          data: {}
        }
      }
    }
  },
  watch: {
    'dialogObj.modelVisible': {
      handler (newVal, oldVal) {
        if (newVal) {
          this.open();
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    // 打开窗口
    open () {
      this.$refs['formValidate'].resetFields();
    },
    handleSubmit (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          this.loading = true;
          this.axios
            .post(api.saveProductColor, this.formValidate)
            .then((data) => {
              if (data.code === 0) {
                this.$Message.success('操作成功');
                this.dialogObj.modelVisible = false;
                this.$emit('fetch');
              }
            })
            .finally(() => {
              this.loading = false;
            });
        }
      })
    }
  }
}
</script>

<style>
</style>
