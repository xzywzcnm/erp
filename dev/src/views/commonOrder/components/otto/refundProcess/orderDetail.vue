<template>
  <keep-alive>
    <sliderModal v-model="orderDetails" :spinShow="spinShow" :styles="{}" class="slider-model" v-if="orderDetailsBegin">
      <orderDetails :orderDetailsId="orderDetailsId" @reloadTag="reloadTag" :orderNo="orderNo" :timestamp="timestamp"
        @spinLoading="spinLoading" @resetSpinShow="resetSpinShow" :orderTagList="orderTagList"
        :webstoreItemSite="webstoreItemSite" :moal-visible.sync="orderDetails" />
    </sliderModal>
  </keep-alive>
</template>

<script>
import orderDetails from "@/views/commonOrder/components/commonOrder/orderDetails";
import Mixin from '@/components/mixin/common_mixin';
export default {
  name: 'refundOrderDetail',
  mixins: [Mixin],
  components: { orderDetails },
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default() { return {} }
    },
  },
  data() {
    return {
      orderDetailsBegin: false,
      orderDetails: false,
      orderDetailsId: null,
      orderNo: null,
      timestamp: null,
      orderTagList: null, // 标签
      webstoreItemSite: null, // 站点
    }
  },
  watch: {
    dialogVisible: {
      handler(nval) {
        nval && this.openOrderDetail();
      },
      deep: true
    },
    orderDetails: {
      handler(nval) {
        if (nval) return;
        this.$emit('update:dialogVisible', nval);
      },
      deep: true
    }
  },
  methods: {
    // 订单详情
    openOrderDetail() {
      let data = this.data;
      this.orderDetailsBegin = true;
      this.orderDetailsId = data.orderId;
      this.orderNo = data.orderNo;
      this.orderTagList = data.orderTagList;
      this.webstoreItemSite = data.webstoreItemSite;
      let date = new Date().getTime();
      this.$nextTick(function () {
        this.orderDetails = true;
        this.timestamp = date;
      });
    },
  }
}
</script>
