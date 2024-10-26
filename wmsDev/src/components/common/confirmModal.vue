<template>
  <Modal
    v-model="isVisible"
    :title="title"
    :width="width"
    :mask-closable="false"
    class="confirmModalPages"
  >
    <div>
      <div class="contents">
        <Icon type="md-alert" class="mr10 icons" />
        <div class="content_one">
          <slot name="tips">{{ tips }}</slot>
        </div>
      </div>
      <slot />
    </div>
    <slot slot="footer" name="footer">
      <Button @click="isVisible = false">取消</Button>
      <Button type="primary" @click="confirmClick" :loading="loading"
        >确定</Button
      >
    </slot>
  </Modal>
</template>

<script>
export default {
  name: "confirmModal",
  props: {
    modelVisible: {
      type: Boolean,
      default() {
        return {};
      },
    },
    title: {
      type: String,
      default: () => {
        return "操作提示";
      },
    },
    tips: {
      type: String,
      default: () => {
        return "";
      },
    },
    width: {
      type: Number,
      default: 500,
    },
  },
  data() {
    return {
      isVisible: false,
      loading: false,
    };
  },
  watch: {
    modelVisible: {
      handler(val) {
        val && this.open();
      },
      deep: true,
    },
    isVisible: {
      handler(val) {
        !val && this.$emit("update:modelVisible", val);
      },
      deep: true,
    },
  },
  methods: {
    open() {
      this.isVisible = true;
    },
    confirmClick() {
      this.loading = true;
      this.$emit("confirmClick", () => {
        this.loading = false;
        this.isVisible = false;
      });
    },
  },
};
</script>

<style lang="less">
.confirmModalPages {
  .contents {
    display: flex;
    padding: 6px 16px 8px;
    .content_one {
      flex: 1;
      overflow: hidden;
      line-height: 28px;
    }
  }

  .icons {
    font-size: 28px;
    color: #f90;
  }
}
</style>