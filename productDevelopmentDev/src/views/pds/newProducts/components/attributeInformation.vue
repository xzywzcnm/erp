<template>
  <div class="attributeinformation">
    <div class="attributein-left">
      <div :class="{ 'visibility-hidden': $common.isEmpty(gathAllAttrList) || showAlbabaInfo }">
        <span class="gather-info-btn" @click="openOrCloseAttrInfo(true)">
          <Icon type="md-alert" />点击此处可查看1688商品属性信息
        </span>
      </div>
      <Form class="normalTop20" ref="attributeDome" :model="attributeFom" :label-width="150" label-position="left">
        <div class="padding-10 attribute-item-content">
          <!-- :label="`${attr.cnName}：`" -->
          <Form-item v-for="(attr, aIndex) in attributeFom.attributeValueQOList" :label="`${attr.aliasName || ''}：`"
            :key="`attr-${aIndex}`" :prop="`attributeValueQOList.${aIndex}.attributeValueIdList`"
            :class="{ 'important-attribute': [2, '2'].includes(attr.isMandatory) }" :rules="[
              { required: attr.isMandatory == 1, message: '必填项不能为空', trigger: 'blur', type: attr.type == 1 ? 'array' : 'number' },
              { required: attr.isMandatory == 1, message: '必填项不能为空', trigger: 'change', type: attr.type == 1 ? 'array' : 'number' }
            ]">
            <Select :disabled="isDisabled" clearable filterable v-model="attr.attributeValueIdList"
              :multiple="attr.type == 1" style="min-width: 300px; max-width: calc(100% - 100px);">
              <Option v-for="(attrVal, vIndex) in attr.valueVOList" :value="attrVal.attributeValueId"
                :key="`attrVal-${vIndex}`" :label="`${attrVal.cnValue}:${attrVal.enValue}`" />
            </Select>
          </Form-item>
        </div>
      </Form>
    </div>
    <div class="attributein-right" v-if="showAlbabaInfo">
      <div class="affix-head">
        <span>1688属性信息</span>
        <span @click="openOrCloseAttrInfo(false)" class="affix-colse">
          <Icon type="md-close" />
        </span>
      </div>
      <div class="affix-content">
        <div v-for="(item, index) in gathAllAttrList" :key="`a-${index}`" class="affix-row">
          <span class="affix-row-label">
            <Tooltip placement="right-start" v-if="!$common.isEmpty(matchTips[item.attrName])">
              <Icon class="label-tips-icon" type="md-checkmark-circle" />
              <div slot="content">
                {{ `1688信息匹配成功` }}
              </div>
            </Tooltip>
            <Icon v-else class="label-tips-icon visibility-hidden" type="md-checkmark-circle" />
            {{ item.attrName }}：
          </span>
          <span class="affix-row-text">{{ (item.attrValList || []).join('，') }}</span>
        </div>
      </div>
    </div>
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
    activeTab: { type: String, default: '' },
    gatherInformation: { type: Boolean, default: false },
    // 采集详情
    gatherDetail: {
      type: Object,
      default() {
        return {};
      }
    },
    isDisabled: {
      type: Boolean,
      default: false
    },
    commodityInfoData: {
      type: Object,
      default() {
        return {
          pageStateCode: -1
        };
      }
    },
    productData: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      attributeFom: {
        attributeValueQOList: []
      },
      attributeValueVOList: [],
      gathAllAttrList: [],
      matchTips: {},
      showAlbabaInfo: false,
      loading: false
    };
  },
  created() { },
  computed: {},
  watch: {
    commodityInfoData: {
      immediate: true,
      deep: true,
      handler(val) {
        if (!val || val.pageStateCode !== 0) return;
        this.attributeValueVOList = val.attributeValueVOList || [];
        this.getAttributeData({ productCategoryId: this.productData.goodTypeId }, true);
      }
    },
    // 采集信息变更
    gatherDetail: {
      deep: true,
      handler(val) {
        if (this.$common.isEmpty(val) || !this.gatherInformation || this.isDisabled || this.activeTab !== 'attribute') return;
        this.gathAllAttrList = [];
        this.matchTips = {};
        let gathJson = {};
        const allGath = [...(val.matchGroupList || []), ...(val.notMatchGroupList || [])];
        const attributeValueQOList = this.$common.copy(this.attributeFom.attributeValueQOList || []);
        allGath.forEach(item => {
          if (this.$common.isEmpty(gathJson[item.attributeDisplayName])) {
            gathJson[item.attributeDisplayName] = {
              attrName: item.attributeDisplayName,
              attrValList: [item.attributeValue],
              isMatchVal: false
            };
          } else if (!gathJson[item.attributeDisplayName].attrValList.includes(item.attributeValue)) {
            gathJson[item.attributeDisplayName].attrValList.push(item.attributeValue);
          }
        });
        let attrIdList = [];
        let isUpdateList = false;
        // 匹配填充值
        (attributeValueQOList || []).forEach((attr, index) => {
          attrIdList = [];
          if (!this.$common.isEmpty(gathJson[attr.aliasName])) {
            (attr.valueVOList || []).forEach((attrVal, aIndex) => {
              if (gathJson[attr.aliasName].attrValList.includes(attrVal.cnValue)) {
                attrIdList.push(attrVal.attributeValueId);
                this.$set(this.matchTips, attr.aliasName, true);
                if (!gathJson[attr.aliasName].isMatchVal) {
                  gathJson[attr.aliasName].isMatchVal = true;
                }
                if (!isUpdateList) {
                  isUpdateList = true;
                }
              }
            })
          }
          if (!this.$common.isEmpty(attrIdList)) {
            if (attr.type == 1) {
              attributeValueQOList[index].attributeValueIdList = this.$common.copy(attrIdList);
            } else {
              attributeValueQOList[index].attributeValueIdList = attrIdList[0];
            }
          }
        });
        this.gathAllAttrList = Object.values(gathJson);
        if (!this.$common.isEmpty(isUpdateList)) {
          this.attributeFom.attributeValueQOList = this.$common.copy(attributeValueQOList);
        }
      }
    }
  },
  methods: {
    // 获取分类属性值
    getAttributeData(attr, type) { // type 为 false 时为清空选中值
      if (!attr.productCategoryId) {
        this.$emit('update:isVisible', false);
        return;
      }
      this.gathAllAttrList = [];
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
    getAttributeValueList(attr) {
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
    // 返回表单数据
    getFormData() {
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
    },
    // 打开 1688 属性信息面板
    openOrCloseAttrInfo(val) {
      this.showAlbabaInfo = val;
    }
  }
};
</script>
<style lang="less" scoped>
.attributeinformation {
  position: relative;
  display: flex;
  justify-content: space-between;
  height: calc(100vh - 400px);
  min-width: 700px;
  overflow: auto;

  .gather-info-btn {
    display: inline-block;
    padding: 5px;
    color: #2d8cf0;
    font-size: 14px;
    text-decoration: underline;
    text-underline-position: under;
    cursor: pointer;

    .ivu-icon {
      padding-right: 5px;
      font-size: 18px;
    }
  }

  .attributein-left {
    max-width: calc(100% - 350px);
    flex: 100;
    padding-right: 30px;
  }

  .attributein-right {
    position: sticky;
    top: 0;
    width: 350px;
    margin-right: 5px;
    margin-bottom: 5px;
    height: calc(100vh - 405px);
    border: 1px solid #ccc;
    border-radius: 5px;
    box-shadow: 1px 2px 5px #a7a7a7;

    .affix-head {
      display: flex;
      padding: 0 10px;
      justify-content: space-between;
      line-height: 32px;
      border-bottom: 1px solid #ccc;

      .affix-colse {
        padding: 0 5px;
        font-size: 18px;
        cursor: pointer;
      }
    }

    .affix-content {
      height: calc(100% - 34px);
      padding: 10px;
      overflow: auto;

      .affix-row-label {
        .label-tips-icon {
          font-size: 16px;
          color: #2d8cf0;
        }
      }

      .affix-row {
        display: flex;
        padding-bottom: 15px;
      }

      .affix-row-text {
        flex: 100;
        word-break: break-all;
      }
    }
  }

  .visibility-hidden {
    visibility: hidden;
  }

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

  .important-attribute {
    .ivu-form-item-label {
      color: #f20;
      font-weight: bold;
    }
  }
}
</style>
