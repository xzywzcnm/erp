// 公共方法
export default {
  methods: {
    noPermission () {
      var dom = document.getElementsByClassName("ivu-message");
      setTimeout(() => {
        for (let i = 0; i < dom.length; i++) {
          dom[i].style.display = "none";
        }
      });
      this.$router.push({ path: "/401" });
      this.$msg.config({
        top: -100
      });
      this.$Modal.warning({
        title: "温馨提示",
        closable: false,
        maskClosable: false,
        content: "当前账号没有操作权限，请联系管理员授权"
      });
    },
    routeTo: function (e) {
      // 单页路由和业务路由
      // window.location.reload()
      var v = this,
        // p1 = e.split("-")[0],
        p2 = e.split("-")[1];
        // inGroupId = v.$store.state.inGroupId,
        // url = window.location.href;
      localStorage.setItem("menuActive", e);
      v.$store.commit("active", e);
      var _to = this.catchMap.filter(function (val) {
        return val.id + "" === p2 + "";
      })[0];
      window.location.href = _to.link;
      /* if (this.getInGroupIdByMenu(_to) === inGroupId) {
       v.$store.commit('thisPage', this.getLastPageName(_to.link));
       console.log(this.getLastPageName(_to.link))
       console.log(_to.link.split('#')[1])
       v.$router.push(_to.link.split('#')[1])
       } else {
       var domain = url.split('/')[0]
       window.location.href = domain + _to.link
       } */
    },
    getLastPageName: function (url) {
      var l;
      if (url != undefined && url.indexOf("?") > 0) {
        url = url.split("?")[0].split("/");
        l = url.length;
      } else if (url != undefined && url.indexOf("?") < 0) {
        url = url.split("/");
        l = url.length;
      }
      return url[l - 1];
    },
    getInGroupIdByMenu: function (data) {
      var _InGroupId = "";
      var _func = function (targetId) {
        this.menuMap.forEach(function (val) {
          if (val.id === targetId) {
            if (val.pid) {
              _func(val.pid);
            } else {
              _InGroupId = val.id;
            }
          }
        });
      }.bind(this);
      _func(data.pid);
      return _InGroupId;
    }
  }
};
