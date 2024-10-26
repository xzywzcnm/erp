/**
 * @Description: 代理配置文件
 */
const { execSync } = require('child_process');
const os = require('os');
const getFreePort = (minPort, maxPorts) => {
  if (minPort > maxPorts) return null;
  let stdout = null;
  let osType = false;
  try {
    osType = os.type();
    // if (osType === 'Windows_NT') {
    //   // windows
    // }
    if (osType === 'Darwin') {
      // mac
      stdout = execSync(`lsof -i:${minPort}`);
    } else if (osType === 'Linux') {
      // Linux
      stdout = execSync(`netstat -anp | grep ${minPort}`);
    }
    if (!stdout) return minPort;
    return getFreePort(minPort + 1, maxPorts);
  } catch (e) {
    return minPort;
  }
}
// 在设置区间内获取遇到的第一个空闲端口
const portStr = getFreePort(8078, 50000);

const erpEnv = {
  dev: 'http://172.20.200.30',
  uat: 'http://testing.lapa.com.cn',
  prod: 'https://erp.lapa.com.cn',
  pd: 'http://172.20.200.116:8122',
  tongtool_dev: 'http://newerp-dev.tongtool.com',
  runlin: 'http://172.20.200.156:8122',
  hsb: 'http://172.20.200.105:8122',
  hl: 'http://172.20.200.103:8122',
  zh: 'http://172.20.200.84:8122',
  llj: 'http://172.20.200.100:8122',
}
const localhost = 'http://localhost:' + portStr;

const proxyToLocality = (e) => {
  return {
    target: localhost + "/",
    changeOrigin: true,
    ws: false,
    onProxyRes: function (proxyRes, req, res) {
      proxyRes.headers["area"] = e;
    },
    pathRewrite: function (path, req, res) {
      const service = path.split("/")[1];
      // eslint-disable-next-line no-useless-escape
      const pattern = new RegExp("^/" + e);
      path = path.replace(pattern, "");
      if (path.indexOf(".html") > -1) {
        path = path.indexOf("?") > -1 ? path + "&" + service : path + "?&" + service;
      } else if ((path.indexOf('http://') == -1 || path.indexOf('https://') == -1) && path.indexOf(".js") == -1) {
        path = '/api-' + service + path;
      }
      return path;
    },
  };
};

const proxyToTargetServe = (target, key, isHtml = false) => {
  return {
    target: target,
    changeOrigin: true,
    logLevel: "debug",
    ws: false,
    onProxyRes: function (proxyRes, req, res) {
      proxyRes.headers["area1"] = isHtml ? 'wms-service' : key;
    },
    pathRewrite: function (path, req) {
      if (isHtml) {
        const service = path.split("&")[path.split("&").length - 1];
        return "/" + service + path.replace("&" + service, "").replace(/\?$/, "");
      }
      return path.replace("api-" + key, key);
    }
  }
}

// eslint-disable-next-line no-undef
module.exports = {
  getConfig: (runVal) => {
    return {
      port: portStr,
      proxy: {
        "^/order-service": proxyToLocality("order-service"),
        "^/cs-service": proxyToLocality("cs-service"),
        "^/wms-service": proxyToLocality("wms-service"),
        "^/product-service": proxyToLocality("product-service"),
        "^/setting-service": proxyToLocality("setting-service"),
        "^/pds-service": proxyToLocality("pds-service"),
        "^/common-service": proxyToLocality("common-service"),
        "^/sps-service": proxyToLocality("sps-service"),
        ".html": proxyToTargetServe(localhost, '', true), // html 页面 固定代理到本地对应的模块下
        "/api-order-service": proxyToTargetServe(erpEnv[runVal], 'order-service'),
        "/api-cs-service": proxyToTargetServe(erpEnv[runVal], 'cs-service'),
        "/api-wms-service": proxyToTargetServe(erpEnv[runVal], 'wms-service'),
        "/api-product-service": proxyToTargetServe(erpEnv[runVal], 'product-service'),
        "/api-setting-service": proxyToTargetServe(erpEnv[runVal], 'setting-service'),
        "/api-pds-service": proxyToTargetServe(erpEnv[runVal], 'pds-service'),
        "/api-common-service": proxyToTargetServe(erpEnv[runVal], 'common-service'),
        "/api-sps-service": proxyToTargetServe(erpEnv[runVal], 'sps-service')
      }
    }
  }

};