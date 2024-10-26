<template>
  <div class="dyt-filter-style">
    <div class="content">
      <Form ref="productGoodsForm" :model="productGoods" :label-width="100" :rules="formRule">
        <dyt-filter
          :filter-row="1"
          @width-change="widthChange"
          @operation="operation"
          @expand="expand"
        >
        <Form-item label="dytTags" prop="dytTags">
          <dyt-inputTag
            v-model="productGoods.dytTags"
            style="width: 300px;"
            :string="true"
            :limit="1"
          />
        </Form-item>
          <Form-item label="带SKU" prop="sku">
            <dytInput placeholder="请输入SKU" v-model.trim="productGoods.name" @input="inputChange" :disabled="true">
              <span slot="prepend">http://</span>
              <span slot="append">.com9999</span>
            </dytInput>
          </Form-item>
          <Form-item label="SKU" prop="sku">
            <dytInput v-model="productGoods.name" placeholder="请输入SKU" @on-blur="inputBlur">
              <dytSelect v-model="productGoods.name1" slot="prepend" style="width: 80px">
                <Option value="http">http://</Option>
                <Option value="https">https://</Option>
              </dytSelect>
              <dytSelect v-model="productGoods.name2" slot="append" style="width: 70px">
                <Option value="com">.com</Option>
                <Option value="org">.org</Option>
                <Option value="io">.io</Option>
             </dytSelect>
            </dytInput>
          </Form-item>
          <Form-item label="98SKU" prop="sku">
            <dytInput placeholder="请输入SKU" v-model.trim="productGoods.name" @input="inputChange">
              <span slot="prepend">http://</span>
              <span slot="append">.com</span>
            </dytInput>
          </Form-item>
          <Form-item label="是SHU" prop="sku">
            <dytInput placeholder="请输入SKU" v-model.trim="productGoods.name">
              <Icon type="ios-contact" slot="prefix" />
              <Icon type="ios-search" slot="suffix" />
            </dytInput>
          </Form-item>
          <Form-item label="禁用" prop="sku">
            <dytInput placeholder="请输入SKU" v-model.trim="productGoods.name" :disabled="true">
              <Icon type="ios-contact" slot="prefix" />
              <Icon type="ios-search" slot="suffix" />
            </dytInput>
          </Form-item>
          <Form-item label="SKU：" prop="sku">
            <dytInput placeholder="请输入SKU" v-model.trim="productGoods.name" maxlength="100" type="textarea" />
          </Form-item>
          <Form-item label="文本" prop="sku">
            <dytInput placeholder="请输入SKU" v-model.trim="productGoods.name" type="textarea" />
          </Form-item>
          <Form-item label="textarea禁用" prop="sku">
            <dytInput placeholder="请输入SKU" v-model.trim="productGoods.name" maxlength="100" type="textarea" :disabled="true" />
          </Form-item>
          <Form-item label="SKU：" prop="sku">
            <Poptip trigger="focus">
              <dytInput placeholder="请输入SKU" v-model.trim="productGoods.name" />
              <div slot="content">请输入SKU</div>
            </Poptip>
          </Form-item>
          <Form-item label="SKU：" prop="sku">
            <dytInput placeholder="请输入SKU" v-model.trim="productGoods.name" maxlength="100" />
          </Form-item>
          <Form-item label="number" prop="sku">
            <dytInput placeholder="请输入SKU" v-model="productGoods.number" maxlength="100" type="number" />
          </Form-item>
          <Form-item label="数字" prop="sku">
            <dytInput placeholder="请输入SKU" v-model="productGoods.number" type="number" />
          </Form-item>
          <Form-item label="SKU：" prop="sku" style="width: 350px;">
            <dytInput placeholder="请输入SKU" v-model.trim="productGoods.name" />
          </Form-item>
          <Form-item label="SKU：" prop="sku">
            <dytInput placeholder="请输入SKU" v-model.trim="productGoods.name" />
          </Form-item>
          <Form-item label="SKU：" prop="sku">
            <dytInput placeholder="请输入SKU" v-model.trim="productGoods.name" />
          </Form-item>
          <Form-item label="SKU：" prop="sku">
            <dytInput placeholder="请输入SKU" v-model.trim="productGoods.name" />
          </Form-item>
          <Form-item label="SKU：" prop="sku">
            <dytInput placeholder="请输入SKU" v-model.trim="productGoods.name" />
          </Form-item>
          <Form-item label="SKU：" prop="sku" style="width: 500px;">
            <dytInput placeholder="请输入SKU" v-model.trim="productGoods.name" />
          </Form-item>
          <Form-item label="SKU：" prop="sku">
            <dytInput placeholder="请输入SKU" v-model.trim="productGoods.name" />
          </Form-item>
          <Form-item label="SKU：" prop="sku" style="width: 360px;">
            <dytInput placeholder="请输入SKU" v-model.trim="productGoods.name" />
          </Form-item>
          <Form-item label="SKU：" prop="sku">
            <dytInput placeholder="请输入SKU" v-model.trim="productGoods.name" />
          </Form-item>
          <Form-item label="SKU：" prop="sku">
            <dytInput placeholder="请输入SKU" v-model.trim="productGoods.name" />
          </Form-item>
          <Form-item label="SKU：" prop="sku">
            <dytInput placeholder="请输入SKU" v-model.trim="productGoods.name" />
          </Form-item>
          <Form-item label="inputNumber" prop="inputNumber">
            <dyt-inputNumber placeholder="请输入数字" v-model="productGoods.inputNumber" />
          </Form-item>
          <Form-item label="SKU：" prop="sku">
            <dytInput placeholder="请输入SKU" v-model.trim="productGoods.name" :disabled="true" />
          </Form-item>
          <Form-item label="SKU" prop="sku">
            <dytInput placeholder="请输入SKU" v-model.trim="productGoods.name" :disabled="nameDisabled" />
          </Form-item>
          <Form-item label="SKU" prop="sku">
            <dytInput placeholder="请输入SKU" v-model.trim="productGoods.name" :disabled="nameDisabled1" />
          </Form-item>
          <Form-item label="SKU" prop="sku">
            <dytInput placeholder="请输入SKU" v-model.trim="productGoods.name" :readonly="true" />
          </Form-item>
          <Form-item label="下拉" prop="select">
            <dytSelect v-model="productGoods.select">
              <Option value="com">com</Option>
              <Option value="org">org</Option>
              <Option value="io">io</Option>
            </dytSelect>
          </Form-item>
          <Form-item label="下拉" prop="select">
            <dytSelect v-model="productGoods.select" :disabled="true">
              <Option value="com">com</Option>
              <Option value="org">org</Option>
              <Option value="io">io</Option>
            </dytSelect>
          </Form-item>

          <!-- 操作插槽 operation -->
          <!-- <div slot="operation">
            <Button type="primary" icon="md-search">查询</Button>
            <Button style="marginLeft:10px;" icon="md-refresh">重置</Button>
          </div> -->
        </dyt-filter>
      </Form>
    </div>
  </div>
</template>
<script>

export default {
  components: {},
  data () {
    return {
      nameDisabled1: false,
      nameDisabled: true,
      productGoods: {
        name: '',
        name1: '',
        name2: '',
        number: '',
        inputNumber: null,
        select: '',
        dytTags: '123,851'
      },
      formRule: {
        dytTags: [
          { required: true, message: '必填不能为空', trigger: 'change', type: 'string' },
          { required: true, message: '必填不能为空', trigger: 'blur', type: 'string' }
        ]
      }
    }
  },
  computed: {},
  watch: {
    productGoods: {
      deep: true,
      handler (val) {
        console.log(val)
      }
    }
  },
  mounted () {},
  created () {
    setTimeout(() => {
      this.nameDisabled = false;
      this.nameDisabled1 = true;
    }, 2000)
  },
  methods: {
    // 宽度或高度改变时,返回占位宽高
    widthChange (val) {
      // console.log('宽或高变化', val)
    },
    // 当没有 operation 插槽时，使用默认按钮, 返回值refresh为重置，submit为提交
    operation (val) {
      console.log('点击按钮类型', val, this.productGoods)
    },
    expand (val) {
      console.log(val.isExpand ? '展开状态' : '收起状态')
    },
    inputChange (val) {
      console.log('inputChange', val)
    },
    inputBlur (val) {
      // console.log('inputBlur', val)
    }
  }
};
</script>
<style scoped lang="less">
.dyt-filter-style{
  width: 100%;
  padding: 10px;
  .content{
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
}
</style>
