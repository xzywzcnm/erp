<template>
  <div class="attributeinformation">
    <Form class="normalTop20" ref="attributeDome" :model="attributeFom" :label-width="110" label-position="left">
      <div class="padding-10">
        <!-- ${attr.cnName} -->
        <Form-item
          v-for="(attr, aIndex) in attributeFom.attributeValueQOList"
          :label="`${attr.aliasName || ''}：`"
          :key="`attr-${aIndex}`"
          :prop="`attributeValueQOList.${aIndex}.attributeValueIdList`"
          :class="{'important-attribute': [2, '2'].includes(attr.isMandatory)}"
          :rules="[
            {required: attr.isMandatory == 1, message: '必填项不能为空', trigger: 'blur', type: attr.type == 1 ? 'array' : 'number'},
            {required: attr.isMandatory == 1, message: '必填项不能为空', trigger: 'change', type: attr.type == 1 ? 'array' : 'number'}
          ]"
        >
          <dyt-select :disabled="isDisabled" clearable filterable v-model="attr.attributeValueIdList" :multiple="attr.type == 1" style="min-width: 300px; max-width: calc(100% - 100px);">
            <Option v-for="(attrVal, vIndex) in attr.valueVOList" :value="attrVal.attributeValueId" :key="`attrVal-${vIndex}`">{{`${attrVal.cnValue}:${attrVal.enValue}`}}</Option>
          </dyt-select>
        </Form-item>
      </div>
    </Form>
    <Spin class="loading-style" v-if="loading">
      <Icon type="ios-loading" size=18 class="demo-spin-icon-load"></Icon>
      <div>Loading</div>
    </Spin>
  </div>
</template>
<script>
import api from '@/api/api.js';

export default {
  name: "attributeInformation",
  components: {},
  props: {
    isDisabled: {
      type: Boolean,
      default: false
    },
    commodityInfoData: {
      type: Object,
      default () {
        return {
          pageStateCode: -1
        };
      }
    },
    productData: {
      type: Object,
      default () {
        return {};
      }
    }
  },
  data () {
    return {
      attributeFom: {
        attributeValueQOList: []
      },
      attributeValueVOList: [],
      loading: false
    };
  },
  created () { },
  computed: {},
  watch: {
    commodityInfoData: {
      immediate: true,
      deep: true,
      handler (val) {
        if (!val || val.pageStateCode !== 0) return
        this.attributeValueVOList = val.attributeValueVOList || []
        this.getAttributeData({ productCategoryId: this.productData.goodTypeId }, true);
      }
    }
  },
  methods: {
    // 获取分类属性值
    getAttributeData (attr, type) { // type 为 false 时为清空选中值
      if (!attr.productCategoryId) {
        this.$emit('update:isVisible', false);
        return;
      }
      this.loading = true;
      this.getAttributeValueList(attr).then(res => {
        this.loading = false;
        if (!res.attributeClassifyVOList || res.attributeClassifyVOList.length == 0) {
          // 当属性信息返回为空时，隐藏属性信息
          this.$emit('update:isVisible', false);
          return
        }
        // 选中值在商品资料详情接口返回，在此处赋值
        res.attributeValueIds = this.attributeValueVOList;
        (res.attributeClassifyVOList || []).forEach(item => {
          if (type) {
            if (item.type == 0) {
              const itemVal = (item.attributeValueList || []).filter(op => {
                return res.attributeValueIds.includes(op.attributeValueId)
              }).map(vItem => {
                return vItem.attributeValueId
              })
              const val = itemVal.join('')
              item.attributeValueIdList = isNaN(val) ? val : val ? Number(val) : ''
            } else {
              item.attributeValueIdList = (item.attributeValueList || []).filter(op => {
                return res.attributeValueIds.includes(op.attributeValueId)
              }).map(vItem => {
                return vItem.attributeValueId
              })
            }
          } else {
            item.attributeValueIdList = item.type == 0 ? '' : []
          }
          item.valueVOList = item.attributeValueList
        })
        this.$set(this.attributeFom, 'attributeValueQOList', res.attributeClassifyVOList || []);
      })
    },
    // 所属分类下拉
    getAttributeValueList (attr) {
      return new Promise(resolve => {
        this.axios.post(api.query_findAttribute, {
          productCategoryId: attr.productCategoryId
        }).then(res => {
          if (res.code == 0) {
            resolve(res.datas || {});
            return;
          }
          resolve({})
        }).catch(() => {
          resolve({})
        })
      })
    },
    getFormData () {
      return new Promise(resolve => {
        this.$refs.attributeDome.validate((valid) => {
          if (!valid) {
            return resolve(valid)
          }
          let attributeValueIds = []
          this.attributeFom.attributeValueQOList.forEach(item => {
            if (Array.isArray(item.attributeValueIdList)) {
              attributeValueIds = [...attributeValueIds, ...item.attributeValueIdList]
            } else if (typeof item.attributeValueIdList != 'undefined' && item.attributeValueIdList != '') {
              attributeValueIds.push(item.attributeValueIdList)
            }
          })
          resolve({
            attributeValueIds: attributeValueIds,
            attributeValueList: this.attributeFom.attributeValueQOList
          })
        })
      })
    }
  }
};
</script>
<style lang="less" scoped>
.attributeinformation {
  position: relative;
  min-height: 150px;
  .demo-spin-icon-load {
    animation: ani-demo-spin 1s linear infinite;
  }
  .loading-style {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    max-height: 100vh;
    background: rgba(255, 255, 255, 0.8);
  }
}
</style>
<style lang="less">
.attributeinformation {
  .loading-style {
    .ivu-spin-main {
      position: absolute;
      width: 100%;
      top: 50%;
      margin: 0 auto;
      transform: translate(0, -50%);
    }
  }
  .important-attribute{
    .ivu-form-item-label{
      color: #f20;
      font-weight: bold;
    }
  }
}
</style>
