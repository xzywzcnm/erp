export default {
  watch: {
    tableWidth (n, o) {
      if (n !== o) {
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
      tableWidth: document.documentElement.clientWidth || document.body.clientWidth || 0
    };
  },
  methods: {
    pw (num, objName) {
      let v = this;
      if (num !== undefined) {
        let minWidth = v.minDomWidth;
        if (minWidth === undefined) minWidth = 1280;
        if (typeof num === 'number') {
          if (objName) {
            v[objName][num].width = v.tableWidth <= minWidth ? v.minWidth : null;
          } else {
            v.orderColumn[num].width = v.tableWidth <= minWidth ? v.minWidth : null;
          }
        } else if (typeof num === 'object') {
          num.forEach((n, i) => {
            v.orderColumn[n].width = v.tableWidth <= minWidth ? v.minWidth[i] : null;
          });
        }
      }
    },
    getTableHeight (curHeight) {
      let v = this;
      return v.domHeight - curHeight < 400 ? 400 : v.domHeight - curHeight;
    },
    tableResize () {
      this.tableWidth = document.documentElement.clientWidth || document.body.clientWidth || 0;
    }
  },
  mounted () {
    window.addEventListener('resize', this.tableResize);
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.tableResize); // 通过有名函数 解除事件订阅
  }
};
