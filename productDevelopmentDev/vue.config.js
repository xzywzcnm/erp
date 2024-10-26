/*
 * @Author: w
 * @Date: 2021-02-19 15:21:05
 * @LastEditors: w
 * @LastEditTime: 2021-02-24 11:08:12
 */
const path = require('path');
const fs = require('fs');
const getProxyConfig = require(resolve('proxy/index'));
const isProd = ["production", "prod"].includes(process.env.NODE_ENV);
const FileManagerPlugin = require('filemanager-webpack-plugin');
const packageFileName = 'pds-service';
// 设置连接认证中心对应环境值(目前没有开发环境，只有测试环境，本地运行使用, 打包配置请到 getAuthHost 文件做逻辑判断)
let runVal = (process.env.npm_lifecycle_event || 'test').trim();
const IS_PROD = runVal.includes('build') && isProd;

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

module.exports = {
  outputDir: IS_PROD ? packageFileName : 'dist',
  chainWebpack: (config) => {
    /**
     * @Description: 是一个函数，会接收一个基于 webpack-chain 的 ChainableConfig 实例。允许对内部的 webpack 配置进行更细粒度的修改。
     * @author gan
     * @date: 2020/10/13 11:59
     * @params:
     */
    config.resolve.alias
      .set('vue$', 'vue/dist/vue.esm.js')
      .set('#@', resolve('public'))
      .set('@v', resolve('src/views'))
      .set('@', resolve('src'));
    config.resolve.extensions
      .add('.css');
  },
  configureWebpack: config => {
    /**
     * @Description: 如果这个值是一个对象，则会通过 webpack-merge 合并到最终的配置中。

     如果这个值是一个函数，则会接收被解析的配置作为参数。该函数既可以修改配置并不返回任何东西，也可以返回一个被克隆或合并过的配置版本
     * @author gan
     * @date: 2020/10/13 12:00
     * @params:
     */
    if (IS_PROD) {
      config.plugins.push(new FileManagerPlugin({
        events: {
          onEnd: {
            delete: [`./${packageFileName}.zip`],
            archive: [
              { source: `./${packageFileName}`, destination: `./${packageFileName}.zip` },
            ]
          }
        },
      }));
    }

    config.devtool = 'source-map'
  },
  publicPath: !IS_PROD ? '/' : './',
  lintOnSave: !IS_PROD,
  css: {
    loaderOptions: {
      less: {
        lessOptions: {
          javascriptEnabled: true,
        }
      },
    },
  },
  productionSourceMap: true,
  devServer: {
    open: 'Chrome',
    openPage: 'pds-service/pds.html#/index',
    host: '0.0.0.0',
    port: proxyFile.port,
    https: false,
    hotOnly: true,
    proxy: proxyFile.proxy,
    //在浏览器上全屏显示编译的errors或warnings
    overlay: {
      warnings: false,
      errors: false
    }
  },
  pages: {
    pds: {
      entry: 'src/views/pds/pds.js',
      template: 'src/views/pds/pds.html',
      filename: 'pds.html'
    },
    generalSettings: {
      entry: 'src/views/setCenter/generalSettings.js',
      template: 'src/views/setCenter/generalSettings.html',
      filename: 'generalSettings.html'
    }
  }
};
function resolve (dir) {
  return path.join(__dirname, dir);
}

