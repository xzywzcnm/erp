<template>
  <transition name="bounce">
    <template v-if="dialogObj.modelVisible">
      <div class="subLayer">
        <div class="topper topper--flex">
          <span class="title">创建新品需求</span>
          <div class="topper__right">
            <Button type="primary" @click="gatherInformation" v-if="showgatherBtn">1688信息采集</Button>
            <Button type="primary" class="ml10" @click="handleSubmit(1)">提交审核</Button>
            <Button class="ml10" @click="handleSubmit(2)">保存</Button>
            <Button class="ml10" @click="closeDialog(1)" >取消</Button>
          </div>
        </div>
        <div class="mainContent" :style="{'overflow-y':'auto'}">
          <createPlateData v-if="['plate'].includes(addType)" ref="basicData" v-bind="$attrs" @closeDialog="closeDialog" :isedit="{editBasic:true}" />
          <basicData
            v-else
            ref="basicData"
            v-bind="$attrs"
            :gatherDetail="gatherDetail"
            :gatherBasic="true"
            @closeDialog="closeDialog"
            @backBasicsDetail="getBasicsDetail"
            :isedit="{editBasic:true}"
          />
        </div>
        <!-- 加载遮罩层 -->
        <Spin v-if="gatherLoading" fix></Spin>
      </div>
    </template>
  </transition>
</template>

<script>
import api from '@/api/api.js';
import basicData from './basicData';
import createPlateData from './createPlateData';

export default {
  name: "addProducts",
  components: { basicData, createPlateData },
  data () {
    return {
      gatherDetail: {},
      basiclData: {},
      gatherLoading: false
    };
  },
  // inheritAttrs: false,
  props: {
    addType: {type: String, default: 'info'},
    dialogObj: {
      type: Object,
      default () {
        return {
          modelVisible: false,
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
  computed: {
    // 商品链接
    goodLink () {
      if (this.$common.isEmpty(this.basiclData) || this.$common.isEmpty(this.basiclData.goodLink)) return '';
      return this.basiclData.goodLink;
    },
    // 供应商
    supplier () {
      if (this.$common.isEmpty(this.basiclData) || this.$common.isEmpty(this.basiclData.supplier)) return '';
      return this.basiclData.supplier;
    },
    // 分类 ID
    productCategoryId () {
      if (this.$common.isEmpty(this.basiclData) || this.$common.isEmpty(this.basiclData.productCategory)) return '';
      return this.basiclData.productCategory[this.basiclData.productCategory.length - 1];
    },
    // 当前分类对应的尺码
    productCategorySize () {
      if (this.$common.isEmpty(this.basiclData) || this.$common.isEmpty(this.basiclData.productCategorySize)) return {};
      return this.basiclData.productCategorySize;
    },
    // 尺码价格列表
    pricelist () {
      if (this.$common.isEmpty(this.basiclData) || this.$common.isEmpty(this.basiclData.pricelist)) return [];
      return this.basiclData.pricelist;
    },
    // 是否显示采集按钮
    showgatherBtn () {
      return this.basiclData.isAlBaba;
      // return !this.$common.isEmpty(this.goodLink) && !this.$common.isEmpty(this.supplier) && this.basiclData.isAlBaba;
    }
  },
  methods: {
    // 打开窗口
    open () {
      // console.log(this.dialogObj.data)
    },
    // 关闭窗口 (type:1 不需要更新列表接口)
    closeDialog (type) {
      // eslint-disable-next-line vue/no-mutating-props
      this.dialogObj.modelVisible = false;
      !type && this.$emit('fetch');
    },
    // 获取到基本信息
    getBasicsDetail (data) {
      this.basiclData = data;
    },
    // 获取 1688 采集信息
    gatherInformation () {
      if (this.gatherLoading) return;
      this.gatherLoading = true;
      this.gatherDetail = {};
      if (this.$common.isEmpty(this.goodLink)) {
        this.$Message.error('请选择填入"商品链接"后再做此操作');
        this.gatherLoading = false;
        return;
      }
      if (this.$common.isEmpty(this.productCategoryId)) {
        this.$Message.error('请选择"商品分类"后再做此操作');
        this.gatherLoading = false;
        return;
      }
      if (!this.$common.isEmpty(this.productCategorySize) && this.$common.isEmpty(this.pricelist)) {
        this.$Message.error('请选中要使用的尺码组中的任一尺码');
        this.gatherLoading = false;
        return;
      }
      this.$axios.post(api.getGrabInformation, {
        goodLink: this.goodLink,
        productCategoryId: this.productCategoryId
      }).then((res) => {
        if (res.code != 0) return;
        this.gatherDetail = this.$common.trim(res.datas);
      }).finally(() => {
        this.gatherLoading = false;
      })
    },
    // 提交审核 
    handleSubmit (type) {
      this.$refs['basicData'].handleSubmit(type).then(res => {
        if (!res.success) return;
        res && res.isColose && this.closeDialog();
      })
    }
  }
};
</script>