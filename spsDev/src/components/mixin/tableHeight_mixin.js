export default {
  data() {
    return {
      tableHeight: 0, // 表格高度
      tableBoxClass: 'tableBox' + (new Date().getTime() + parseInt(Math.random() * 10000)), // 对应表格类名
    };
  },
  methods: {
    // 展开或收起
    expand(val) {
      this.computedTableHeight();
    },
    // 计算表格高度
    computedTableHeight() {
      let tableBox = document.querySelector('.tableBox');
      let tableBoxClass = document.querySelector('.' + this.tableBoxClass);
      let dom = tableBoxClass || tableBox;
      if (!dom) return;
      let rect = dom.getClientRects() ? dom.getClientRects()[0] : {};
      this.tableHeight = rect && rect.height ? rect.height : 300;// 默认200高度
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.computedTableHeight();
      window.addEventListener('resize', this.computedTableHeight);
      this.$once('hook:beforeDestory', () => {
        window.removeEventListener('resize', this.computedTableHeight);
      })
    })
  },
  activated() {
    this.computedTableHeight();
  }
};
