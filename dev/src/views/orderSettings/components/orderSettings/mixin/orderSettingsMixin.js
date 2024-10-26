/*
 *** 设置中心-订单mixin模块
 */
export default {
  data () {
    return {
      pageParamsStatus: false,
      curPage: 1,
      totalPage: 0,
      total: 0
    };
  },
  watch: {
    pageParamsStatus: {
      handler (n) {
        let v = this;
        if (n) {
          v.getList();
          v.pageParamsStatus = false;
        }
      },
      immediate: true
    }
  },
  methods: {}
};
