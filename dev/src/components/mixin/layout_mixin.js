/*
 *** 布局路由方法文件,请不要在这里写特例或者业务代码
 */
// import axios from 'axios';
import { getQueryString } from '@/utils/index';

export default {
  methods: {
    routeTo (e) { // 单页路由和业务路由
      let v = this;
      let p2 = e.split('-')[1];
      let inGroupId = v.$store.state.inGroupId;
      let url = window.location.href;
      v.$store.commit('active', e);
      let platform;
      if (url.includes('platform')) {
        platform = getQueryString('platform');
      }
      let map = [];
      v.menuMap.forEach((n, i) => {
        if (n.childrens) {
          map = map.concat(n.childrens);
        } else {
          map.push(n);
        }
      });
      let _to = map.filter(val => {
        return val.id === p2;
      })[0];
      if (this.getInGroupIdByMenu(_to) === inGroupId) {
        v.$router.push(_to.link.split('#')[1]);
      } else {
        if (platform && _to.link.includes('platform') && platform !== _to.link.split('?platform=')[1]) {
          window.location.href = _to.link;
          window.location.reload();
        } else {
          window.location.href = _to.link;
        }
      }
    },
    getLastPageName (url) {
      let l;
      if (url !== undefined && url.includes('?')) {
        url = url.split('?')[0].split('/');
        l = url.length;
      } else if (url !== undefined && !url.includes('?')) {
        url = url.split('/');
        l = url.length;
      }
      return url[l - 1];
    },
    getInGroupIdByMenu (data) {
      let _InGroupId = '';
      let map = [];
      this.menuMap.forEach((n, i) => {
        if (n.childrens) {
          map = map.concat(n.childrens);
        } else {
          map.push(n);
        }
      });
      let _func = function (targetId) {
        map.forEach(val => {
          if (val.id === targetId) {
            if (val.pid) {
              _func(val.pid);
            } else {
              _InGroupId = val.id;
            }
          }
        });
      };
      _func(data.pid);
      return _InGroupId;
    }
  }
};
