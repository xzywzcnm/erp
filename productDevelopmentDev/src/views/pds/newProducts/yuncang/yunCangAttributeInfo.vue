<template>
  <div class="attributeinformation">
    <Form class="normalTop20" ref="attributeDome" :model="attributeFom" :label-width="150" label-position="left">
      <div class="padding-10">
        <!-- :label="`${attr.cnName}：`" -->
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
  </div>
</template>
<script>

export default {
  name: "attributeInformation",
  components: {},
  props: {
    isDisabled: {
      type: Boolean,
      default: false
    },
    attributeData: {
      type: Object,
      default () {
        return {};
      }
    },
    attributeValueIds: {
      type: Array,
      default () {
        return [];
      }
    },
  },
  data () {
    return {
      attributeFom: {
        attributeValueQOList: []
      },
      attributeValueVOList: []
    };
  },
  created () { },
  computed: {},
  watch: {
    attributeData: {
      immediate: true,
      deep: true,
      handler (val) {
        if (!val) return;
        this.getAttributeData();
      }
    },
    attributeValueIds: {
      immediate: true,
      deep: true,
      handler (val) {
        if (!val) return;
        this.attributeValueVOList = [...val];
        this.getAttributeData();
      }
    }
  },
  methods: {
    // 获取分类属性值
    getAttributeData () { // type 为 false 时为清空选中值
      let res = this.$common.copy(this.attributeData);
      // 选中值在商品资料详情接口返回，在此处赋值 
      res.attributeValueIds = this.attributeValueVOList;
      (res.attributeClassifyVOList || []).forEach(item => {
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
            return res.attributeValueIds.includes(op.attributeValueId);
          }).map(vItem => {
            return vItem.attributeValueId;
          })
        }
        item.valueVOList = item.attributeValueList;
      })
      this.$set(this.attributeFom, 'attributeValueQOList', res.attributeClassifyVOList || []);
    },
    getFormData (str) {
      if(str == 'save'){
      
        let attributeValueIds = [];
        this.attributeFom.attributeValueQOList.forEach(item => {
          if (Array.isArray(item.attributeValueIdList)) {
            attributeValueIds = [...attributeValueIds, ...item.attributeValueIdList]
          } else if (typeof item.attributeValueIdList != 'undefined' && item.attributeValueIdList != '') {
            attributeValueIds.push(item.attributeValueIdList)
          }
        })
        return({
          attributeValueIds: attributeValueIds,
          // attributeValueList: this.attributeFom.attributeValueQOList
        })
        
     
      }
      return new Promise(resolve => {
        this.$refs.attributeDome.validate((valid) => {
          if (!valid) {
            return resolve(valid)
          }
          let attributeValueIds = [];
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
<style lang="less">
.attributeinformation {
  .important-attribute{
    .ivu-form-item-label{
      color: #f20;
      font-weight: bold;
    }
  }
}
</style>
