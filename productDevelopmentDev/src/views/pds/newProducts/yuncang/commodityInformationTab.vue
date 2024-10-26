<template>
  <div>
    <Tabs v-model="pageActiveTab" @on-click="tabsClick">
      <TabPane label="商品资料" name="commodity">
        <commodityInformation
          ref="commodityInformation"
          :commodity-info-data.sync="commodityData"
          :active-tab="pageActiveTab"
          :is-disabled="disabledIf"
          v-bind="$attrs"
          v-on="$listeners"
          :dialogObj='dialogObj'
        />
      </TabPane>
      <TabPane label="属性信息" name="attribute" v-if="attributeVisible">
        <attributeInformation
          ref="attributeInformation"
          :commodity-info-data.sync="commodityData"
          :active-tab="pageActiveTab"
          :is-visible.sync="attributeVisible"
          :is-disabled="disabledIf"
          v-bind="$attrs"
        />
      </TabPane>
      <!-- <TabPane label="质检要求" name="qualityPro" v-if="qualityVisble">
        <qualityInformation ref="qualityInformation" v-bind="$attrs" :commodity-info-data.sync="commodityData" :is-disabled="disabledIf" @getQualityVisble='getQualityVisble' />
      </TabPane> -->
      <!-- <TabPane label="质检要求" name="qualityInspection">质检要求</TabPane> -->
    </Tabs>
  </div>
</template>
<script>
import api from '@/api/api.js';
import commodityInformation from '../components/commodityInformation';
import attributeInformation from '../components/attributeInformation';
// import qualityInformation from './qualityInformation';
export default {
  name: "commodityInformationTab",
  components: { commodityInformation, attributeInformation },
  // components: { commodityInformation, attributeInformation, qualityInformation },
  props: {
    openType: {
      type: String,
      default: 'edit'
    },
    dialogObj: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
      pageActiveTab: 'commodity',
      commodityData: {},
      attributeVisible: true,
      qualityVisble: true
    }
  },
  watch: {
    pageActiveTab: {
      immediate: true,
      deep: true,
      handler (val) {
        this.$emit('activeTab', val);
      }
    }
  },
  computed: {
    // 是否禁用
    disabledIf () {
      const userInfo = this.$store.state.erpConfig && this.$store.state.erpConfig.userInfo;
      return this.openType === 'view' || this.$attrs.productData.status !== 2 || (this.$attrs.productData.requireVerifyBy !== userInfo.userId);
    }
  },
  created () {
    this.getDetail()
  },
  methods: {
    // 获取详情
    getDetail () {
      if (this.$attrs.productData && this.$attrs.productData.productId) {
        this.$Spin.show();
        this.$axios.get(api.queryLaPaProductGoodsInfo, {
          params: { productId: this.$attrs.productData.productId }
        }).then(({ code, datas }) => {
          if (code !== 0) return;
          this.commodityData = { ...datas, pageStateCode: code };
        }).finally(() => {
          this.$Spin.hide();
        })
      }
    },
    // 保存数据
    save (parameter, type) {
      this.$Spin.show();
      //新增现在要多传一个productSource和model款号
      parameter.laPaProductGoodsInfo.modelNo = this.$attrs.productData.modelNo
      parameter.laPaProductGoodsInfo.productSource = this.$attrs.productData.productSource
      // if (this.qualityVisble) {
      //   const checkInfo = this.$refs.qualityInformation.getFormData();
      //   parameter = {...parameter, ...checkInfo}
      // }
      this.$axios.post(api.saveGoods, parameter).then(({ code }) => {
        if (code === 0) {
          //提交审核
          if (type == 'handle') {
            this.$emit('goodVerifyHandle');
          }
          //保存
          if (type == 'save') {
            this.$emit('closeDialog');
          }
          this.$Message.success('保存成功');
        }
      }).catch(() => {
        // this.$Message.error('保存失败')
      }).finally(() => {
        this.$Spin.hide();
      });
    },
    handleSubmit (type) {
      //保存资料
      if (['save', 'saveDelete'].includes(type)) {
        this.$refs.commodityInformation.getFormData().then(commodityInformation => {
          if (this.$common.isBoolean(commodityInformation) && !commodityInformation) return;
          if (commodityInformation.laPaProductGoodsInfo.declareCode && commodityInformation.laPaProductGoodsInfo.declareCode.length > 30) {
            this.$refs.commodityInformation.validateField('declareCode');
            this.pageActiveTab = 'commodity';
            return;
          }
          if (!this.attributeVisible) {
            this.save({ ...commodityInformation }, type);
            return;
          }
          this.$refs.attributeInformation.getFormData().then(res => {
            this.save({ ...commodityInformation, attributeValueQOList: res.attributeValueIds }, type);
          })
        });
        return;
      }
      // 对商品资料验证
      this.$refs.commodityInformation.validate().then(commodityInformation => {
        Promise.all([commodityInformation, this.getAttributeData()]).then(res => {
          if (!res[0] || !res[1]) {
            this.pageActiveTab = !res[0] ? 'commodity' : 'attribute';
            return;
          }
          this.save({ ...res[0], attributeValueQOList: res[1].attributeValueIds }, 'handle');
        })
      })
    },
    tabsClick (name) {
      this.pageActiveTab = name
    },
    // 获取属性值并验证必填项
    getAttributeData () {
      return this.attributeVisible ? this.$refs.attributeInformation.getFormData() : new Promise(resolve => {
        resolve({
          attributeValueIds: [],
          attributeValueList: []
        })
      })
    },
    //获取质检的显示(有绑定质检分类为显示)
    getQualityVisble (val) {
      this.qualityVisble = val;
    },
  }
};
</script>