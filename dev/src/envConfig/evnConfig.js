export const envObj = {
  dev: {
    auth: '172.20.200.30:9544',
    upms: '172.20.200.30:9544',
    erp: '172.20.200.30',
  },
  test: {
    auth: 'dyt.pms.com.cn:9544',
    upms: 'dyt.pms.com.cn:9544',
    erp: 'testing.lapa.com.cn',
  },
  prod: {
    auth: 'sso.lapa.com.cn',
    upms: 'sso.lapa.com.cn',
    erp: 'erp.lapa.com.cn',
  }
};
export const envConstant = {
  dev: {
    VUE_APP_BROADCASTKEY: 'broadcastMessage',
    VUE_APP_SYSTEMCODE: 'lapa-erp',
  },
  test: {
    VUE_APP_BROADCASTKEY: 'broadcastMessage',
    VUE_APP_SYSTEMCODE: 'lapa-erp',
  },
  prod: {
    VUE_APP_BROADCASTKEY: 'broadcastMessage',
    VUE_APP_SYSTEMCODE: 'lapa-erp',
  }
};
// 指定测试环境所包含的 host
export const appointTestHost = ['testing.lapa.com.cn', '172.20.200.14:9544'];
// 指定开发环境所包含的 host
export const appointDevHost = ['172.20.200.30'];
