export default {
  watch: {
    tableWidth (n, o) {
      if (n != o) {
        if (this.objName) {
          this.pw(this.num, this.objName);
        } else {
          this.pw(this.num);
        }
      }
    }
  },
  data () {
    return {
      tableWidth:
        document.documentElement.clientWidth || document.body.clientWidth || 0,
      tableHeight: null
    };
  },
  methods: {
    pw (num, objName) {
      let v = this;
      if (num != undefined) {
        let domWidth = v.minDomWidth;
        if (domWidth === undefined) domWidth = 1280;
        if (typeof num === "number") {
          if (objName) {
            v[objName][num].width =
              v.tableWidth <= domWidth ? v.minWidth : null;
          } else {
            v.orderColumn[num].width =
              v.tableWidth <= domWidth ? v.minWidth : null;
          }
        } else if (typeof num === "object") {
          num.forEach((n, i) => {
            v.orderColumn[n].width =
              v.tableWidth <= domWidth ? v.minWidth[i] : null;
          });
        }
      }
    },
    getTableHeight (curHeight) {
      let v = this;
      return v.domHeight - curHeight < 400 ? 400 : v.domHeight - curHeight;
    },
    tableResize (fn) {
      let originFn = window.onresize;
      window.onresize = function () {
        originFn && originFn();
        fn();
      };
    }
  },
  mounted () {
    let v = this;
    v.tableResize(function () {
      v.tableWidth =
        document.documentElement.clientWidth || document.body.clientWidth || 0;
    });
  }
};
