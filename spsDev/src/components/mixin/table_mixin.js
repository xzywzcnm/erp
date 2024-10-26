export default {
  watch: {
    tableWidth (n, o) {
      if (n != o) {
        this.pw(this.num);
      }
    }
  },
  data () {
    return {
      tableWidth: document.documentElement.clientWidth || document.body.clientWidth || 0
    };
  },
  methods: {
    pw (num) {
      if (num != undefined) {
        if (typeof num === 'number') {
          this.orderColumn[num].width = this.tableWidth <= 1280 ? this.minWidth : null;
        } else if (typeof num === 'object') {
          num.forEach((n, i) => {
            this.orderColumn[n].width = this.tableWidth <= 1280 ? this.minWidth[i] : null;
          });
        }
      }
    },
    tableResize (fn) {
      var originFn = window.onresize;
      window.onresize = function () {
        originFn && originFn();
        fn();
      };
    }
  },
  mounted () {
    let v = this;
    v.tableResize(function () {
      v.tableWidth = document.documentElement.clientWidth || document.body.clientWidth || 0;
    });
  }
};
