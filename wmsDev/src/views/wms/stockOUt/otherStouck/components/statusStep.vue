<template>
  <div class="status-steps">
    <Steps :current="step">
      <Step title="已创建" icon="md-cart" :content="$uDate.dealTime(detailData.createdTime)"></Step>
      <Step title="已配货" icon="md-cash" :content="$uDate.dealTime(detailData.pickingTime)"></Step>
      <Step title="已拣货" icon="ios-basket" :content="$uDate.dealTime(detailData.pickingGoodsTime)"></Step>
      <Step title="已装箱" icon="md-cube" :content="$uDate.dealTime(detailData.boxFinishTime)"></Step>
      <Step title="已发货" icon="ios-send" :content="$uDate.dealTime(detailData.deliverFinishTime)"></Step>
    </Steps>
  </div>
</template>

<script>
import common from '@/components/mixin/common_mixin';
export default {
  mixins: [common],
  name: 'statusStep',
  data () {
    return {
      step: 0,
      stepStatus: {
        createdTime: 0,
        pickingTime: 1,
        pickingGoodsTime: 2,
        boxFinishTime: 3,
        deliverFinishTime: 4
      }
    }
  },
  props: {
    detailData: {
      type: Object,
      default: () => { return {} }
    }
  },
  watch: {
    detailData: {
      handler (val) {
        if (!val.pickingId) return;
        this.setData(JSON.parse(JSON.stringify(val)));
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    setData (val) {
      let step = 0;
      Object.keys(this.stepStatus).forEach(k => {
        val[k] && (step = this.stepStatus[k]);
      })
      this.step = step;
    }
  }
}
</script>

<style lang="less" scoped>
.status-steps {
  width: 70%;
  margin: 0 auto;
  padding: 30px 0;
}
</style>
