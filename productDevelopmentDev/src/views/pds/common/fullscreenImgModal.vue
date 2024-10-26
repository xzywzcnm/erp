<template>
  <Modal v-model="imgModal" class="clearMarginAuto" ref="imgModal" title="图片">
    <p
      slot="header"
      @mousedown="moveMt"
      class="moveHead"
      @dblclick="fullscreenImgModal"
    >
      <span>图片</span>
      <Icon
        type="md-qr-scanner"
        style="
          position: absolute;
          right: 40px;
          top: 16px;
          color: #999;
          z-index: 99;
          cursor: pointer;
        "
        size="18"
        @click="fullscreenImgModal"
      ></Icon>
    </p>
    <div>
      <img width="100%" :src="imgUrl" />
    </div>
  </Modal>
</template>

<script>
import CommonMixin from "@/components/mixin/commonMixin";

export default {
  name: "fullscreenImgModal",
  mixins: [CommonMixin],
  props: ["imgUrl"],
  components: {},
  data () {
    return {};
  },
  methods: {}
};
</script>

<style scoped></style>
