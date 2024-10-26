import { getWarehouseId } from '@/utils/getService';
/*
 *** 布局路由方法文件,请不要在这里写特例或者业务代码
 */
export default {
  methods: {
    routeTo (e) {
      // 单页路由和业务路由
      let v = this;
      console.log(e);
      let p2 = Number(e.split('-')[1]);
      let inGroupId = v.$store.state.inGroupId;
      let url = window.location.href;
      v.$store.commit('active', e);
      v.$store.commit('activeDate', Date.now());
      let _to = this.menuMap.filter(val => {
        return val.id === p2;
      })[0];
      if (this.getInGroupIdByMenu(_to) === inGroupId) {
        v.$router.push({ path: _to.link.split('#')[1], query: { warehouseId: getWarehouseId() } });
      } else {
        let domain = url.split('/')[0] + _to.link;
        window.location.href = `${domain}${domain.includes('?') ? '&' : '?'}warehouseId=${getWarehouseId()}`;
      }
    },
    getLastPageName (url) {
      let l;
      if (url !== undefined && url.indexOf('?') > 0) {
        url = url.split('?')[0].split('/');
        l = url.length;
      } else if (url !== undefined && url.indexOf('?') < 0) {
        url = url.split('/');
        l = url.length;
      }
      return url[l - 1];
    },
    getInGroupIdByMenu (data) {
      let _InGroupId = '';
      let _func = function (targetId) {
        this.menuMap.forEach(val => {
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
    }, // 页面不够撑开自动填白
    whiteAuto (main) {
      let paddingH = function () {
        this.$nextTick(function () {
          let totalHeight = document.body.clientHeight;
          let taskBoxHeight = document.querySelector('.' + main).offsetHeight;
          let navHeight = document.querySelector('.ivu-menu-horizontal').offsetHeight;
          let breadHeight = document.querySelector('.layout-breadcrumb').offsetHeight + 9;
          let paddingHeight = totalHeight - taskBoxHeight - navHeight - breadHeight + 'px';
          document.querySelector('.' + main).style.paddingBottom = paddingHeight;
        });
      };
      paddingH();
      /* window.onresize = function () {
       paddingH();
       }; */
    }
  }
};
