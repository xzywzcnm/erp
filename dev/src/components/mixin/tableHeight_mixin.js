export default {
  data () {
    return {
      tableHeight: 400 // 表格高度
    };
  },
  methods: {
    // 展开或收起
    expand (val) {
      this.computedTableHeight();
    },
    // 计算表格高度
    computedTableHeight () {
      this.$nextTick(() => {
        let dom = document.querySelector('.tableBox');
        if (!dom) return;
        let rect = dom.getClientRects() ? dom.getClientRects()[0] : {};
        this.tableHeight = rect && rect.height ? rect.height : 200;// 默认200高度
      })
    }
  },
  mounted () {
    this.computedTableHeight();
    window.addEventListener('resize', this.computedTableHeight);
    this.$once('hook:beforeDestory', () => {
      window.removeEventListener('resize', this.computedTableHeight);
    })
  },
  activated () {
    this.computedTableHeight();
  }
};
