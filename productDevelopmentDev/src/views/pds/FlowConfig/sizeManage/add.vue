<template>
  <!-- eslint-disable-next-line vue/no-mutating-props -->
  <Modal v-model="dialogObj.modelVisible" title="添加尺码" :mask-closable="false">
    <div class="form-contain">
      <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="0">
        <div class="form-line-flex form-add-size">
          <FormItem label="" prop="type" class="mr10">
            <dyt-select v-model="formValidate.type" clearable filterable>
              <Option v-for="(item,key) in sizeTypeList" :value="item.typeNameGroupId" :key="key">{{ item.typeNameGroup }}</Option>
            </dyt-select>
          </FormItem>
          <FormItem label="" prop="size">
            <Input v-model="formValidate.size" placeholder="请输入" clearable></Input>
          </FormItem>
        </div>
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
  name: 'addSize',
  data () {
    return {
      formValidate: {
        type: '',
        size: ''
      },
      ruleValidate: {
        type: [
          { required: true, message: '必填', trigger: 'change' }
        ],
        size: [
          { required: true, message: '必填', trigger: 'blur' }
        ],
      },
      sizeTypeList: [],
      sizeGroup: [
        { name: "尺码组1", value: 1 },
        { name: "尺码组2", value: 2 }
      ],
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
    },
    sizeList: {
      type: Array,
      default () {
        return [];
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
      let list = [];
      this.sizeList.forEach(k => {
        this.sizeGroup.forEach(j => {
          let obj = JSON.parse(JSON.stringify(k));
          obj.typeNameGroup = `${obj.typeName}-${j.name}`;
          obj.sizeGroupNo = j.value;
          obj.typeNameGroupId = `${obj.sizeTypeId}-${j.value}`;
          list.push(obj);
        });
      });
      // console.log(list)
      this.sizeTypeList = list;
    },
    handleSubmit (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          let [temp, formData] = [{}, this.formValidate];
          let sizeType = formData.type.split('-');
          temp.size = formData.size;
          temp.sizeType = sizeType[0] - 0;
          temp.sizeGroupNo = sizeType[1] - 0;
          // console.log(temp)
          // return;
          this.loading = true;
          this.$axios
            .post(api.saveProductSize, temp)
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

<style scoped>
.form-add-size .ivu-select {
  width: 160px;
}
.form-add-size .ivu-input-wrapper {
  width: 300px;
}
</style>