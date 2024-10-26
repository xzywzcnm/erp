<template>
  <!-- eslint-disable-next-line vue/no-mutating-props -->
  <Modal v-model="dialogObj.modelVisible" title="添加SKC颜色" :mask-closable="false">
    <div class="form-contain">
      <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="80">
        <FormItem label="颜色" prop="color">
          <Input v-model="formValidate.color" placeholder="请输入"></Input>
        </FormItem>
      </Form>
    </div>
    <div slot="footer">
      <!-- eslint-disable-next-line vue/no-mutating-props -->
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
      },
      ruleValidate: {
        color: [
          { required: true, message: '颜色必填', trigger: 'blur' }
        ],
      },
      loading: false
    };
  },
  props: {
    dialogObj: {
      type: Object,
      default () {
        return {
          modelVisible: false,
          data: {}
        };
      }
    }
  },
  watch: {
    'dialogObj.modelVisible': {
      handler (newVal) {
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
          this.$axios
            .post(api.saveProductColor, this.formValidate)
            .then((res) => {
              if (res.code === 0) { 
                this.$Message.success('操作成功');
                // eslint-disable-next-line vue/no-mutating-props
                this.dialogObj.modelVisible = false;
                this.$emit('fetch');
              }
            })
            .finally(() => {
              this.loading = false;
            });
        }
      });
    },
  }
};
</script>

<style>
</style>