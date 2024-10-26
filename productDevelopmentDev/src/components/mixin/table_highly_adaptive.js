/*
 * @Author: Jaycee 
 * @Date: 2022-01-05 10:15:09 
 * @Last Modified by: Jaycee
 * @Last Modified time: 2022-01-06 13:51:31
 * 表格高度自适应
 */
export default {
  data () {
    return {
      tableHeight: 500,//默认高度400
      isMounted: true,//是否在mounted钩子开始调用
      tableClass: `table-list-${new Date().getTime()}`,//加类名区别
    };
  },
  mounted () {
    this.isMounted && this.computedTableHeight();
  },
  methods: {
    // 计算表格高度
    computedTableHeight () {
      let fun = () => {
        this.$nextTick(() => {
          let tableDom = document.getElementsByClassName(this.tableClass);
          if (!(tableDom && tableDom[0])) return;
          this.tableHeight = Number(tableDom[0].offsetHeight);
          // console.log(tableDom[0], tableDom[0].offsetHeight);
        })
      }
      fun();
      window.addEventListener('resize', fun);
      this.$once('hook:beforeDestroy', () => {
        window.removeEventListener("resize", fun);
      })
    }
  },
};

