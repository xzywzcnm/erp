const path = require('path');
const fs = require('fs');
const getProxyConfig = require(resolve('proxy/index'));
const isProd = ["production", "prod"].includes(process.env.NODE_ENV);
const FileManagerPlugin = require('filemanager-webpack-plugin');
const packageFileName = 'wms-service';
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

const webpack = require('webpack');

// 设置连接认证中心对应环境值(目前没有开发环境，只有测试环境，本地运行使用, 打包配置请到 getAuthHost 文件做逻辑判断)
let runVal = (process.env.npm_lifecycle_event || 'test').trim();
const IS_PROD = runVal.includes('build') && isProd;

if (['dev', 'build', 'serve', 'start'].includes(runVal) || runVal.includes('build')) {
  if (runVal.includes('build')) {
    runVal = 'prod';
  } else {
    runVal = ['dev', 'serve', 'start'].includes(runVal) ? 'test' : 'prod';
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
  outputDir:IS_PROD?packageFileName:'dist',
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
      .set('@', resolve('src'))
    config.resolve.extensions
      .add('.css')
    if (IS_PROD) {
       // 压缩图片 linux 打包存在问题 安装了libpng也不行
      /*config.module
        .rule("images")
        .test(/\.(png|jpe?g|gif|svg)(\?.*)?$/)
        .use("image-webpack-loader")
        .loader("image-webpack-loader")
        .options({
          mozjpeg: { progressive: true, quality: 65 },
          optipng: { enabled: false },
          pngquant: { quality: [0.65, 0.90], speed: 4 },
          gifsicle: { interlaced: false }
        });*/
      /*config.plugin("webpack-report").use(BundleAnalyzerPlugin, [
        {
          analyzerMode: "static"
        }
      ]);*/
      /*config.optimization.splitChunks({
        chunks: 'async', // 仅提取按需载入的module  initial(初始块)、async(按需加载块)、all(默认，全部块)
        minSize: 30000, // 提取出的新chunk在两次压缩(打包压缩和服务器压缩)之前要大于30kb
        maxSize: 0, // 提取出的新chunk在两次压缩之前要小于多少kb，默认为0，即不做限制
        minChunks: 1, // 被提取的chunk最少需要被多少chunks共同引入
        maxAsyncRequests: 5, // 最大按需载入chunks提取数
        maxInitialRequests: 3, // 最大初始同步chunks提取数
        automaticNameDelimiter: '~', // 默认的命名规则（使用~进行连接）
        name: true,
        cacheGroups: { // 缓存组配置，默认有vendors和default
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10
          },
          viewUI: {
            test: /[\\/]node_modules[\\/]_?view-design(.*)/,
            chunks: "all",
            priority: 1
          },
          echarts: {
            test: /[\\/]node_modules[\\/]_?echarts(.*)/,
            priority: 2
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true
          }
        }
      });*/
      config.plugin('chunkPlugin').use(webpack.optimize.LimitChunkCountPlugin,[{
        maxChunks:20, // 必须大于或等于 1
        minChunkSize: 10000
      }])
    }
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
          onEnd:{
            delete:[`./${packageFileName}.zip`],
            archive: [
              {source: `./${packageFileName}`, destination: `./${packageFileName}.zip`},
            ]
          }
        },
      }));
    }
  },
  publicPath: !IS_PROD ? '/' : './',
  lintOnSave: !IS_PROD,
  //productionSourceMap: !IS_PROD,
  devServer: {
    open: true,
    // open: process.platform === 'darwin',
    // overlay: {
    //   warnings: true,
    //   errors: true
    // },
    host: '0.0.0.0',
    port: proxyFile.port,
    https: false,
    hotOnly: true,
    proxy: proxyFile.proxy, // string | Object
    openPage: 'wms-service/wms.html#/index',
  },
  pages: {
    wms: { // wms
      entry: 'src/views/wms/wms.js',
      template: 'src/views/wms/wms.html',
      filename: 'wms.html',
    },
     sortingInfo: { // 分拣
       entry: 'src/views/sortingInfo/sortingInfo.js',
       template: 'src/views/sortingInfo/sortingInfo.html',
       filename: 'sortingInfo.html',
     },
     packingWork: { // 商品中心
       entry: 'src/views/packingWork/packingWork.js',
       template: 'src/views/packingWork/packingWork.html',
       filename: 'packingWork.html',
     },
     printSheet: { // 打印拣货单
       entry: 'src/views/printSheet/printSheet.js',
       template: 'src/views/printSheet/printSheet.html',
       filename: 'printSheet.html',
     }
  }
}
function resolve (dir) {
  return path.join(__dirname, dir)
}
function pathKeyWord () {
  return path.join(__dirname);
}
