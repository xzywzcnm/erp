<template>
  <div class="dytLoadingText">
    <div :class="{ 'dyt-loading': loading || disabled }">
      <div
        class="unlinkText cursorClick dispalyFlex alignCenter"
        @click="domClick"
      >
        <Icon type="ios-loading" class="loadingIcon" v-if="loading" />
        <div><slot /></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "dytLoadingText",
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {};
  },
  methods: {
    domClick() {
      if (this.loading) return;
      this.$emit("click");
    },
  },
};
</script>

<style lang="less" scoped>
.dytLoadingText {
  display: inline-block;

  .dyt-loading {
    user-select: none;
    cursor: not-allowed;

    .cursorClick {
      pointer-events: none;
      color: #999;
    }
  }

  .loadingIcon {
    line-height: 20px;
    animation: spin 1s infinite linear;
  }
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
}
</style>
