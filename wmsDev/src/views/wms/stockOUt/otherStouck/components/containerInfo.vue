<template>
  <div>
    <Form ref="formItem" :model="containerData" :inline="true" :label-width="100" class="form-box-detail">
      <FormItem label="sku总数:">
        <div>{{ containerData.skuSum || 0 }}</div>
      </FormItem>
      <FormItem label="已装箱sku数量:">
        <div>{{ containerData.skuInBoxNum || 0 }}</div>
      </FormItem>
      <FormItem label="未装箱sku数量:">
        <div>{{ containerData.skuUnBoxNum || 0 }}</div>
      </FormItem>
      <FormItem label="货箱数量:">
        <div>{{ containerData.boxedNum || 0 }}</div>
      </FormItem>
      <FormItem label="异常sku数量:" class="error-formitem">
        <div>{{ containerData.missNumber || 0 }}</div>
      </FormItem>
      <FormItem label="货箱总重量:">
        <div>{{ containerData.sumWeigth || 0 }}kg</div>
      </FormItem>
      <FormItem label="temu发货标签:" v-if="isTemuStockup">
        <Button type="primary" @click="temuPrint" :loading="loading" size="small">前往打印</Button>
      </FormItem>
    </Form>

    <!-- 发货标签打印 -->
    <shipping-label :modelVisible.sync="sendVisible" :detailData="detailData"></shipping-label>
  </div>
</template>

<script>
import shippingLabel from './shippingLabel';
export default {
  name: 'containerInfo',
  components: { shippingLabel },
  data() {
    return {
      containerData: {},
      loading: false,
      sendVisible: false, // 发货标签打印
    }
  },
  props: {
    detailData: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  watch: {
    detailData: {
      handler(val) {
        if (!val.pickingId) return;
        this.setData(JSON.parse(JSON.stringify(val)));
      },
      deep: true,
      immediate: true
    }
  },
  computed: {
    // 是否temu备货
    isTemuStockup() {
      let { pickingType, pickingSubType, pickingNewStatus } = this.detailData || {};
      return pickingType === 'O11' && pickingSubType === 1 && ['11', '12', '8', '4'].includes(pickingNewStatus);
    }
  },
  methods: {
    setData(val) {
      let pickingBoxes = val.pickingBoxes || {};
      // 未装箱数量
      let skuUnBoxNum = (pickingBoxes.skuSum || 0) - (pickingBoxes.skuInBoxNum || 0);
      pickingBoxes.skuUnBoxNum = skuUnBoxNum >= 0 ? skuUnBoxNum : 0;
      this.containerData = val.pickingBoxes;
    },
    // temu获取箱唛标签
    temuPrint() {
      this.sendVisible = true;
    }
  }
}
</script>
<style lang="less">
.form-box-detail {
  .ivu-form-item {
    width: 200px;
    margin-bottom: 10px;
  }

  .error-formitem,
  .error-formitem .ivu-form-item-label {
    color: #d9001b;
  }
}
</style>
