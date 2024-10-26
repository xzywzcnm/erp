<template>
  <div>
    <Tabs @on-click="tabsClick" v-model="pageActiveTab">
      <TabPane label="商品资料" name="commodity" :style="`height: ${pageActiveTab == 'commodity' ? 'auto' : '0px'}`">
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
      <TabPane label="属性信息" name="attribute" v-if="attributeVisible" :style="`height: ${pageActiveTab == 'attribute' ? 'auto' : '0px'}`">
        <attributeInformation
          ref="attributeInformation"
          :commodity-info-data.sync="commodityData"
          :is-visible.sync="attributeVisible"
          :active-tab="pageActiveTab"
          :is-disabled="disabledIf"
          v-bind="$attrs"
        />
      </TabPane>
      <TabPane label="质检要求" name="qualityPro" :style="`height: ${pageActiveTab == 'qualityPro' ? 'auto' : '0px'}`">
        <qualityInformation
          ref="qualityInformation"
          v-bind="$attrs"
          :commodity-info-data.sync="commodityData"
          :active-tab="pageActiveTab"
          :is-disabled="disabledIf"
          @getQualityVisble='getQualityVisble'
        />
      </TabPane>
      <!-- <TabPane label="质检要求" name="qualityInspection">质检要求</TabPane> -->
    </Tabs>
  </div>
</template>
<script>
import api from '@/api/api.js';
import commodityInformation from '../components/commodityInformation';
import attributeInformation from '../components/attributeInformation';
import qualityInformation from './qualityInformation';

export default {
  name: "commodityInformationTab",
  components: { commodityInformation, attributeInformation, qualityInformation },
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
  data() {
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
    disabledIf() {
      const userInfo = this.$store.state.erpConfig && this.$store.state.erpConfig.userInfo;
      return this.openType === 'view' || this.$attrs.productData.status !== 2 || (this.$attrs.productData.requireVerifyBy !== userInfo.userId);
    }
  },
  created() {
    this.getDetail()
  },
  methods: {
    // 获取详情
    getDetail() {
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
    save(parameter, type) {
      this.$Spin.show();
      parameter.laPaProductGoodsInfo.modelNo = this.$attrs.productData.modelNo;
      parameter.laPaProductGoodsInfo.productSource = this.$attrs.productData.productSource;
      const checkInfo = this.$refs.qualityInformation.getFormData();
      if (this.qualityVisble) {
        parameter = { ...parameter, ...checkInfo.data }
      }
      parameter.laPaProductGoodsInfo = { ...parameter.laPaProductGoodsInfo, ...checkInfo.updateType };

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
    handleSubmit(type) {
      //保存资料
      if (['save', 'saveDelete'].includes(type)) {
        this.$refs.commodityInformation.getFormData().then((commodityInformation) => {
          if (this.$common.isBoolean(commodityInformation) && !commodityInformation) return;
          if (commodityInformation.laPaProductGoodsInfo.declareCode && commodityInformation.laPaProductGoodsInfo.declareCode.length > 30) {
            this.$refs.commodityInformation.validateField();
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
        })
        return;
      }
      let awaitList = [];
      // 对商品资料验证
      awaitList.push(this.$refs.commodityInformation.validate());
      // 对属性验证并获取
      awaitList.push(this.getAttributeData());
      if (this.qualityVisble) {
        awaitList.push(this.$refs.qualityInformation.validate());
      }
      Promise.all(awaitList).then(res => {
        if (!res[0]) {
          this.pageActiveTab = 'commodity';
          return;
        }
        if (!res[1]) {
          this.pageActiveTab = 'attribute';
          return;
        }
        if (this.qualityVisble && !res[2]) {
          this.pageActiveTab = 'qualityPro';
          return;
        }
        res[0].qualityTemplateId = res[2] ? res[2].qualityTemplateId || [] : [];
        this.save({ ...res[0], attributeValueQOList: res[1].attributeValueIds }, 'handle');
      })
    },
    tabsClick(name) {
      this.pageActiveTab = name;
    },
    // 获取属性值并验证必填项
    getAttributeData() {
      return this.attributeVisible ? this.$refs.attributeInformation.getFormData() : new Promise(resolve => {
        resolve({
          attributeValueIds: [],
          attributeValueList: []
        })
      })
    },
    //获取质检的显示(有绑定质检分类为显示)
    getQualityVisble(val) {
      this.qualityVisble = val
    },
  }
};
</script>