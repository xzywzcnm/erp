<template>
  <div class="order-block">
    <large-picture :url="dataRow.allImageUrl">
      <slot name="picslot"></slot>
    </large-picture>
    <div class="order-item">
      <div class="order-li">
        SKU：<span>{{ dataRow.sku }}</span>
      </div>
      <div class="order-li">
        {{ dataRow.description }}
        <slot name="sku"></slot>
      </div>
      <div class="order-li">
        <span style="color: #377d22">{{ dataRow.goodsAttributes }}</span>
      </div>
    </div>
  </div>
</template>
<script>
import largePicture from "@/components/largePicture";
export default {
  name: "BasicDataCom",
  components: { largePicture },
  data() {
    return {
      row: {},
    };
  },
  props: {
    dataRow: {
      type: Object,
      default() {
        return { skuNo: "123" };
      },
    },
  },
  watch: {},
  methods: {},
};
</script>
<style scoped>
.order-block,
.order-li {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}
.order-block {
  padding: 4px 0;
}
.order-item {
  margin-left: 10px;
  flex: 1;
  overflow: hidden;
  margin-bottom: -4px;
}
.order-item .order-li .alink {
  text-decoration: underline;
}
.btn-list > span,
.btn-list > div {
  white-space: nowrap;
}
.btn-list > span:not(:last-child),
.btn-list > div:not(:last-child) {
  margin-right: 6px;
}
.iconSty {
  font-size: 16px;
  cursor: pointer;
}
.order-li--text,
.order-li--text .ivu-tooltip,
.order-li--text .ivu-tooltip-rel {
  width: 100%;
  height: 18px;
  margin-bottom: 4px;
}
.order-li--text {
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tags-span {
  font-size: 12px;
  font-weight: 400;
  padding: 2px 4px;
  line-height: 16px;
  border-radius: 2px;
  /* margin-bottom: 4px; */
}
.iconContent {
  margin-left: 15px;
  font-size: 18px;
  color: orange;
}
.test {
  justify-content: reverse;
}
</style>