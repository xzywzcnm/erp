<template>
  <div class="status-button">
    <div v-for="(item,index) in list" :key="`div-${index}`">
      <Button :key="index" @click="handleClick(item)" size="large" :class="{activeBtn: tab == item.event}" v-if="statusBtn(item)">{{item.name}}</Button>
    </div>
  </div>
</template>

<script>

const constant = {
  list: [
    { name: "基础资料", event: "basicData", status: 0 },
    { name: "商品资料", event: "commodityInformation", status: 2 },
    { name: "审样", event: "sampleReview", status: 4, productSource: [0, 1] },
    { name: "文本资料", event: "textMaterial", status: 5 },
    { name: "图片资料", event: "pictureMaterial", status: 5 },
    { name: "生成SKU", event: "generateSku", status: 7 },
    { name: "日志", event: "log", status: 0 },
  ],
  plate: [
    { name: "基础资料", event: "basicData", status: 0 },
    { name: "打版资料", event: "editBasicData", status: 0 },
    { name: "物料资料", event: "materialData", status: 1 },
    { name: "纸样文件", event: "sampleManufacturing", status: 13 },
    { name: "车缝工价", event: "sampleDressAudit", status: 15 },
    { name: "工艺要求", event: "processRequirement", status: 15 },
    { name: "二次工艺", event: "twiceProcessTag", status: 15 },
    { name: "大货价格", event: "priceConfirmation", status: 16 },
    { name: "商品资料", event: "commodityInformation", status: 17 },
    { name: "文本资料", event: "textMaterial", status: 18 },
    { name: "图片资料", event: "pictureMaterial", status: 18 },
    { name: "生成SKU", event: "generateSku", status: 19 },

    // { name: "审样", event: "sampleReview", status: 4, productSource: [0, 1] },
    
    // { name: "生成SKU", event: "generateSku", status: 7 },
    { name: "日志", event: "log", status: 0 }
  ]
}
// 
const stepStaus = {
  17: 1,
  2: 17,
  5: 18,
  6: 18,
  18: 13,
  11: 19,
  12: 20,
  10: 21
}
        
export default {
  name: "statuButton",
  data () {
    return {
      tab: ''
    };
  },
  props: {
    index: {
      type: String,
      default () {
        return '';
      }
    },
    productData: {
      type: Object,
      default () {
        return {};
      }
    },
    dialogObj: {
      type: Object,
      default () {
        return {};
      }
    },
    platformType: { type: String, default: '' }
  },
  watch: {
    index: {
      immediate: true,
      deep: true,
      handler (val) {
        this.tab = val;
      }
    },
    isMateTab: {
      immediate: true,
      deep: true,
      handler (val) {
        !val && this.handleClick(this.list[0]);
      }
    }
  },
  computed: {
    list () {
      if (['plate'].includes(this.platformType)) return constant.plate;
      const list = this.$common.copy(constant.list);
      if (!this.$common.isEmpty(this.productData) && !this.$common.isEmpty(this.productData.productSource)) {
        list[1].status = this.productData.productSource > 1 ? 0 : 2;
      }
      return list;
    },
    isMateTab () {
      const tagKey = this.list.map(m => m.event);
      return tagKey.includes(this.tab);
    }
  },
  created () {
    this.tab = this.index || 'basicData';
  },
  methods: {
    handleClick (item) {
      if (this.tab == item.event) return;
      this.tab = item.event || 'basicData';
      this.$emit('statusButton', item.event);
    },
    statusBtn (item) {
      let { status, lastStatus, productSource } = this.productData;
      
      if (['plate'].includes(this.platformType)) {
        if (status == 8) {
          status = this.$common.isEmpty(lastStatus) ? -1 : lastStatus;
        }
        if (!this.$common.isEmpty(stepStaus[status])) {
          status = stepStaus[status];
        }
        return status >= item.status;
      }
      if (item.productSource && !item.productSource.includes(productSource)) return false;
      if ([8, 9].includes(status)) { //8-不通过 9-已取消
        let step = lastStatus || lastStatus === 0 ? lastStatus : -1;
        return step >= item.status;
      } else {
        return status >= item.status;
      }
    }
  },
};
</script>
<style>
.status-button .ivu-btn {
  width: 110px;
}
.status-button .activeBtn {
  border-color: #2d8cf0;
  color: #2d8cf0;
}
</style>