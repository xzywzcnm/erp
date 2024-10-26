<template>
  <div>
    <Page v-bind="defaultConfig" v-on="$listeners" />
  </div>
</template>

<script>
export default {
  name: 'dytPagination',
  data() {
    return {}
  },
  computed: {
    defaultConfig() {
      return {
        showTotal: true, // 总数
        showSizer: true, // 可以切换每页显示的数量
        showElevator: true, // 快速跳转到某一页
        placement: "top", // 条数切换弹窗的展开方向，可选值为 bottom 和 top
        pageSizeOpts: [10, 30, 50, 100], // 分页可选条数
        ...this.$attrs
      }
    }
  },
};
</script>
