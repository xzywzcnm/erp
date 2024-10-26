<template>
  <Modal v-model="modalVisible" width="460" title="批量修改商品类别" :mask-closable="false" class="productCategory">
    <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="102" :inline="true"
      class="formDetail">
      <div class="tips mt10">
        <Icon type="md-information-circle" />
        <div>是否要修改选中商品的类别，数量 <span style="color:red;">{{ list.length }}</span></div>
      </div>
      <FormItem label="商品类别:" prop="productType">
        <dyt-select v-model="formValidate.productType">
          <Option v-for="item in commodityCategoryList" :value="item.value" :key="item.value" :label="item.label">
          </Option>
        </dyt-select>
      </FormItem>
    </Form>
    <div slot="footer">
      <Button @click="modalVisible = false">取消</Button>
      <Button type="primary" @click="handleSubmit" :loading="loading">确认</Button>
    </div>
  </Modal>
</template>

<script>
import api from '@/api/api';
export default {
  name: 'productCategory',
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    list: {
      type: Array,
      default: () => { return [] }
    }
  },
  data() {
    return {
      modalVisible: false,
      formValidate: {
        productType: ''
      },
      ruleValidate: {
        productType: [{ required: true, message: '请选择商品类别', trigger: 'change', type: 'number' }]
      },
      commodityCategoryList: [
        { label: '常规', value: 0 },
        { label: '童装', value: 1 },
        { label: '宠物', value: 2 }
      ],
      loading: false
    }
  },
  watch: {
    dialogVisible: {
      handler(nval, oval) {
        nval && this.open();
      },
      deep: true
    },
    modalVisible: {
      handler(nval, oval) {
        !nval && this.$emit('update:dialogVisible', nval);
      },
      deep: true
    }
  },
  methods: {
    open() {
      this.modalVisible = true;
      this.$refs['formValidate'].resetFields();
    },
    // 提交表单
    handleSubmit() {
      this.$refs['formValidate'].validate((valid) => {
        if (!valid) return;
        let productType = this.formValidate.productType;
        let list = this.list.map(k => {
          return {
            goodsSku: k.goodsSku,
            account: k.account,
          }
        })
        let apiUrl = `${api.modifyProductType}?productType=${productType}`;
        // console.log(apiUrl, 'apiUrl');
        // return;
        this.loading = true;
        this.axios.post(apiUrl, list).then(({ data }) => {
          if (!(data && data.code === 0)) return;
          this.$Message.success('操作成功~');
          this.modalVisible = false;
          this.$emit('search');
        }).finally(() => {
          this.loading = false;
        })
      })
    }
  }
}
</script>

<style lang="less">
.productCategory {
  .formDetail {
    padding-left: 40px;
  }

  .tips {
    display: flex;
    align-items: center;
    margin-bottom: 16px;

    .ivu-icon {
      color: #f90;
      font-size: 28px;
      margin-right: 12px;
    }
  }
}
</style>
