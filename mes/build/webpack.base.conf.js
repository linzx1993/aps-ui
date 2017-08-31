const path = require('path');
const utils = require('./utils');
const config = require('../config');
const vueLoaderConfig = require('./vue-loader.conf');

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

module.exports = {
  entry: {
    // 'babel-polyfill' : "babel-polyfill",
    vendor : ['vue','vue-router','axios','element-ui','./src/scripts/ajaxInterceptors.js'],
    echarts : ['echarts/lib/echarts','echarts/lib/chart/bar','echarts/lib/chart/line','echarts/lib/chart/pie','echarts/lib/component/tooltip',
      'echarts/lib/component/title','echarts/lib/component/legend','echarts/lib/component/dataZoom','echarts/lib/component/toolbox'],
    url: './src/scripts/url.js',
    app: './src/main.js',
    // app: ['core-js/fn/promise','./src/main.js']
  },
  output: {
      path: config.build.assetsRoot,
      filename: '[name].js',
      publicPath: process.env.NODE_ENV === 'production'
          ? config.build.assetsPublicPath
          : config.dev.assetsPublicPath
  },
  resolve: {
    //自动扩展文件后缀名，意味着我们require模块可以省略不写后缀名
    extensions: ['.js', '.vue', '.json'],
    //模块别名定义，方便后续直接引用别名，无须多写长长的地址
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': resolve('src'),
    }
  },
  module: {
    rules: [
      // {
      //   test: /\.(js|vue)$/,
      //   loader: 'eslint-loader',
      //   enforce: 'pre',
      //   include: [resolve('src'), resolve('test')],
      //   options: {
      //     formatter: require('eslint-friendly-formatter')
      //   }
      // },
      {
        test: /\.vue$/,
        // loader: 'happypack/loader?id=happyvue',//很奇怪，构建时间增加了10s
        loader: 'vue-loader',
        options: vueLoaderConfig
      },
      {
        test: /\.js$/,
        loader:[ 'happypack/loader?id=happybabel'],
        include: [resolve('src')]
        // include: [resolve('src'), resolve('test')]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          // name: "../../static/img/[name].[hash:7].[ext]"
          name: utils.assetsPath('img/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
        }
      }
    ]
  }
};
