<template>
  <Modal v-model="isVisible" title="添加尺码" :mask-closable="false">
    <div class="form-contain">
      <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="60">
        <FormItem label="尺码:" prop="size">
          <dyt-input v-model="formValidate.size" placeholder="请输入"></dyt-input>
        </FormItem>
      </Form>
    </div>
    <div slot="footer">
      <Button @click="isVisible = false">取消</Button>
      <Button type="primary" @click="handleSubmit('formValidate')" :loading="loading">确定</Button>
    </div>
  </Modal>
</template>

<script>
import api from '@/api/api.js';
export default {
  name: 'addSize',
  data () {
    return {
      formValidate: {
        size: ''
      },
      ruleValidate: {
        size: [
          { required: true, message: '尺码必填', trigger: 'blur' }
        ]
      },
      loading: false,
      isVisible: false
    }
  },
  props: {
    modelVisible: {
      type: Boolean,
      default () { return false }
    }
  },
  watch: {
    modelVisible (newVal) {
      if (newVal) this.open();
    },
    isVisible (newVal) {
      if (!newVal) this.$emit('update:modelVisible', false);
    }
  },
  methods: {
    // 打开窗口
    open () {
      this.$refs['formValidate'].resetFields();
      this.isVisible = this.modelVisible;
    },
    handleSubmit (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          let [temp, formData] = [{}, this.formValidate];
          temp.size = formData.size;
          // console.log(temp)
          // return;
          this.loading = true;
          this.axios
            .post(api.saveProductSize, temp)
            .then(({ data }) => {
              if (data.code === 0) {
                this.$Message.success('操作成功');
                this.isVisible = false;
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
