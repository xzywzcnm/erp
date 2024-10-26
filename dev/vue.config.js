/**
 * 配置打包服务
 * @author gan
 * @date: 2021/6/23 13:58
 */
const path = require('path');
const fs = require('fs');
const getProxyConfig = require(resolve('proxy/index'));
const isEnvProd = process.env.NODE_ENV == 'production';
const FileManagerPlugin = require('filemanager-webpack-plugin');
const SERVICES = ['setting-static', 'order-static', 'cs-static', 'product-static', 'test-static'];

function resolve(dir) {
  return path.join(__dirname, dir);
}

// 设置连接认证中心对应环境值(目前没有开发环境，只有测试环境，本地运行使用, 打包配置请到 getAuthHost 文件做逻辑判断)
let runVal = (process.env.npm_lifecycle_event || 'test').trim();
const isProduction = runVal.includes('build') && isEnvProd;

if (['dev', 'build', 'serve'].includes(runVal) || runVal.includes('build')) {
  if (runVal.includes('build')) {
    runVal = 'prod';
  } else {
    runVal = ['dev', 'serve'].includes(runVal) ? 'test' : 'prod';
  }
}
// 设置代理对应环境值(目前没有开发环境，只有测试环境；代理文件中，uat就是测试环境)
const proxyRunVal = runVal == 'test' ? 'uat' : runVal;

// 指定文件名和目录
const fileName = 'envVariableVal.js';
const targetDirectory = './src/envConfig';
// 创建文件内容
const fileContent = `export const appointEnv = '${runVal}';`;
// 确保目录存在
if (!fs.existsSync(targetDirectory)) {
  fs.mkdirSync(targetDirectory);
}
// 创建并写入文件
const filePath = path.join(targetDirectory, fileName);
fs.writeFileSync(filePath, fileContent);

const proxyFile = getProxyConfig.getConfig(proxyRunVal);

let project = {
  // 设置中心
  'setting-static': {
    generalSettings: { // 设置中心
      entry: 'src/views/generalSettings/generalSettings.js',
      template: 'src/views/generalSettings/generalSettings.html',
      chunks: ['chunk-vendors', 'chunk-common', 'generalSettings']
    },
    orderSettings: { // 设置中心-订单
      entry: 'src/views/orderSettings/orderSettings.js',
      template: 'src/views/orderSettings/orderSettings.html'
    },
    logistics: { // 设置中心-物流设置
      entry: 'src/views/logistics/logistics.js',
      template: 'src/views/logistics/logistics.html'
    },
    customSettings: { // 设置中心-客服设置
      entry: 'src/views/customSettings/customSettings.js',
      template: 'src/views/customSettings/customSettings.html'
    },
    pdsSettings: { // 设置中心-新品开发管理
      entry: 'src/views/pdsSettings/pdsSettings.js',
      template: 'src/views/pdsSettings/pdsSettings.html'
    },
    financeSettings: { // 设置中心-财务计费设置
      entry: 'src/views/financeSettings/financeSettings.js',
      template: 'src/views/financeSettings/financeSettings.html'
    }
  },
  // 订单系统
  'order-static': {
    commonOrder: { // 订单系统-公共订单
      entry: 'src/views/commonOrder/commonOrder.js',
      template: 'src/views/commonOrder/commonOrder.html'
    },
    ebay: { // 订单系统-ebay订单
      entry: 'src/views/ebay/ebay.js',
      template: 'src/views/ebay/ebay.html'
    },
    aliexpress: { // 订单系统-速卖通
      entry: 'src/views/aliexpress/aliexpress.js',
      template: 'src/views/aliexpress/aliexpress.html'
    },
    amazon: { // 订单系统-速卖通
      entry: 'src/views/amazon/amazon.js',
      template: 'src/views/amazon/amazon.html'
    },
    wish: { // 订单系统-wish
      entry: 'src/views/wish/wish.js',
      template: 'src/views/wish/wish.html'
    },
    tiktok: { // 订单系统 - tiktok
      entry: 'src/views/tiktok/tiktok.js',
      template: 'src/views/tiktok/tiktok.html'
    },
    ozon: { // 订单系统 - ozon
      entry: 'src/views/ozon/ozon.js',
      template: 'src/views/ozon/ozon.html'
    },
    definePlatform: { // 订单系统-自定义渠道
      entry: 'src/views/channel/channel.js',
      template: 'src/views/channel/definePlatform.html'
    }
  },
  // 客服系统
  'cs-static': {
    customer: { // 客服管理-ebay站内信
      entry: 'src/views/customerCenter/customer.js',
      template: 'src/views/customerCenter/customer.html',
    }
  },
  // 商品系统
  'product-static': {
    productCenter: { // 商品中心
      entry: 'src/views/productCenter/productCenter.js',
      template: 'src/views/productCenter/productCenter.html'
    }
  },
  // 登录页面
  'test-static': {
    domeTest: {
      entry: 'src/views/testDome/domeTest.js',
      template: 'src/views/testDome/domeTest.html'
    }
  },
}
let packageDirectory = ''
for (let index in SERVICES) {
  if (process.argv.includes(SERVICES[index])) {
    packageDirectory = SERVICES[index];
    break;
  }
}
const packageFileName = packageDirectory.replace('static', 'service');
let pages = {};
if (isProduction) {
  pages = project[packageDirectory];
} else {
  for (let key in project) {
    pages = Object.assign(pages, project[key]);
  }
}

module.exports = {
  outputDir: packageFileName || 'devServe',
  configureWebpack: config => {
    if (isProduction) {
      // 为生产环境修改配置...
      /*return {
        plugins: [
          new CompressionPlugin({
            test: /\.js$|\.html$|\.css/,
            threshold: 10240,
            deleteOriginalAssets: false
          })
        ]
      }*/
      config.plugins.push(new FileManagerPlugin({
        events: {
          onEnd: {
            delete: [`./${packageFileName}.zip`],
            archive: [
              {
                source: `./${packageFileName}`,
                destination: `./${packageFileName}.zip`
              },
            ]
          }
        },
      }));
    } else {
      // 为开发环境修改配置...
    }
  },
  chainWebpack: (config) => {
    config.resolve.alias
      .set('vue$', 'vue/dist/vue.esm.js')
      .set('#@', resolve('public'))
      .set('@', resolve('src'));
    config.resolve.extensions
      .add('.css');
    if (isProduction) {
      if (process.env.npm_config_report) {
        config
          .plugin('webpack-bundle-analyzer')
          .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin)
      }
    }
  },
  publicPath: process.env.NODE_ENV === 'development' ? '/' : './',
  lintOnSave: isProduction,
  /*productionSourceMap: false,*/
  css: {
    extract: false
  },
  devServer: {
    // open: process.platform === 'darwin',
    open: true,
    overlay: { //在浏览器上全屏显示编译的errors或warnings
      warnings: true,
      errors: true
    },
    host: '0.0.0.0', //默认情况下是localhost. 如果希望server被外部访问使用"0.0.0.0"
    port: proxyFile.port,
    https: false, //默认情况下dev-server使用http协议，通过配置可以支持https
    hotOnly: true, //启用Hot Module Replacement，当编译失败时，不刷新页面
    proxy: proxyFile.proxy, // string | Object
    openPage: 'setting-service/generalSettings.html',
  },
  pages: pages
};
