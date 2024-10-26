<template>
  <div>
    <Modal v-model="isVisible" title="查看货箱信息" width="80%" :mask-closable="false"
      class="packingInformationDetailPage formDetail">
      <information-detail :modelVisible="isVisible" v-bind="$attrs"></information-detail>
      <div slot="footer">
        <Button @click="isVisible = false">关闭</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import informationDetail from './informationDetail.vue';
export default {
  name: 'packingInformationDetail',
  components: { informationDetail },
  props: {
    modelVisible: {
      type: Boolean,
      default() {
        return {}
      }
    },
  },
  data() {
    return {
      isVisible: false,
    }
  },
  watch: {
    modelVisible: {
      handler(val) {
        this.isVisible = val;
      },
      deep: true
    },
    isVisible: {
      handler(val) {
        !val && this.$emit('update:modelVisible', val);
      },
      deep: true
    }
  },
  methods: {}
}
</script>