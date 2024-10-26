<template>
  <div class="table-page">
    <div class="table-page-right">
      <Page :total="total" @on-change="ChangePage" show-total :page-size="pageSize" show-elevator :current="pageNum" show-sizer @on-page-size-change="ChangePageSize" placement="top" :page-size-opts="pageArray" :transfer="true">
      </Page>
    </div>
  </div>
</template>
<script>
export default {
  name: 'dytPage',
  data () {
    return {
      // 分页条数
      pageArray: [10, 20, 50, 100],
      total: 0,
      pageNum: 1,
      pageSize: 10
    }
  },
  props: {
    pageConfig: {
      type: Object,
      default () {
        return {
          total: 0,
          pageNum: 1,
          pageSize: 10
        };
      }
    }
  },
  watch: {
    pageConfig: {
      deep: true,
      immediate: true,
      handler (newVal) {
        if (newVal) this.configChange(newVal);
      }
    }
  },
  methods: {
    // 改变分页传参
    configChange (newVal) {
      Object.keys(newVal).forEach(k => {
        this[k] = newVal[k];
      })
    },
    // 选中条数
    ChangePageSize (pageSize) {
      this.$emit('ChangePageSize', pageSize);
    },
    // 页数
    ChangePage (page) {
      this.$emit('ChangePage', page);
    }
  }
}
</script>
