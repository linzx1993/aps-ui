var path = require('path')
var utils = require('./utils')
var webpack = require('webpack')
var config = require('../config')
var merge = require('webpack-merge')
var baseWebpackConfig = require('./webpack.base.conf')
var CopyWebpackPlugin = require('copy-webpack-plugin')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
//针对编译文件速度的优化，启用node的多线程 ---2017-07-04
// const os = require('os');
var HappyPack = require('happypack');
// var happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });
//针对压缩文件的优化，启用内部的多线程 ---2017-07-29
// const UglifyJsParallelPlugin = require('webpack-uglify-parallel');
//启用dllplugin进行文件的预
// 编译 ---2017-08-07
const manifest = require('./dll/vendor-manifest.json');

var env = process.env.NODE_ENV === 'testing'
  ? require('../config/test.env')
  : config.build.env;

// console.log(JSON.stringify(utils.styleLoaders()));
//针对happypackcss的优化
// const arr = [
//   {
//     "test": {},
//     "use": ["vue-style-loader", {"loader": "css-loader", "options": {"minimize": true}}]
//   },
//   {
//     "test": {},
//     "use": ["vue-style-loader", {"loader": "css-loader", "options": {"minimize": true}}, {"loader": "sass-loader", "options": {"indentedSyntax": true}}]
//   },
//   {
//     "test": {},
//     "use": ["vue-style-loader", {"loader": "css-loader", "options": {"minimize": true}}, {"loader": "sass-loader", "options": {}}]
//   }];
var webpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.build.productionSourceMap,
      extract: true
    })
  },
  devtool: config.build.productionSourceMap ? '#source-map' : false,
  output: {
    path: config.build.assetsRoot,
    filename: utils.assetsPath('js/[name].[chunkhash].js'),
    chunkFilename: utils.assetsPath('js/[id].[chunkhash].js')
  },
  // //需提前引入cdn文件
  externals: {
    jquery: 'jQuery',
  },
  plugins: [
    new webpack.ProvidePlugin({
      JQuery : "jquery",
      $:"jquery",
    }),
    new webpack.DllReferencePlugin({
      context: __dirname,
      manifest,
    }),
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    new webpack.DefinePlugin({
      'process.env': env
    }),
    //======生产环境压缩优化,构建时间大头   ---2017-07-29
    //  再添加了DllReferencePlugin的预编译之后，这部分时间被极大压缩，猜测是因为原来已经被压缩过过了
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      sourceMap: true
    }),
    new webpack.HashedModuleIdsPlugin(),// 2017-08-12,使用标识符而不是模块名称来压缩输出,实现持久化缓存
    // new UglifyJsParallelPlugin({
    //   workers: os.cpus().length,
    //   sourceMap: true,
    //   mangle: true,
    //   compressor: {
    //     warnings: false,
    //     // drop_console: true,
    //     // drop_debugger: true
    //   }
    // }),

    // extract css into its own file
    new ExtractTextPlugin({
      filename: utils.assetsPath('css/[name].[contenthash].css'),
    }),
    // Compress extracted CSS. We are using this plugin so that possible
    // duplicated CSS from different components can be deduped.
    new OptimizeCSSPlugin({
      cssProcessorOptions: {
        safe: true
      }
    }),
    // generate dist index.html with correct asset hash for caching.
    // you can customize output by editing /index.html
    // see https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: process.env.NODE_ENV === 'testing'
        ? 'index.html'
        : config.build.index,
      template: 'index.html',
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      },
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      chunksSortMode: 'dependency',
    }),
    // split vendor js into its own file
    new webpack.optimize.CommonsChunkPlugin({
      name: ['reset','url','vendor'],
      minChunks: function (module, count) {
        // any required modules inside node_modules are extracted to vendor
        return (
          module.resource &&
          /\.js$/.test(module.resource) &&
          module.resource.indexOf(
            path.join(__dirname, '../node_modules')
          ) === 0
        )
      }
    }),
    // extract webpack runtime and module manifest to its own file in order to
    // prevent vendor hash from being updated whenever app bundle is updated
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      chunks: ['vendor']
    }),
    // new webpack.optimize.CommonsChunkPlugin(["common"]),
    // copy custom static assets
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: config.build.assetsSubDirectory,
        ignore: ['.*']
      }
    ]),
    //happypack对对 url-loader 和 file-loader 支持度有限，会有报错
    new HappyPack({
      id: 'happybabel',
      loaders: ['babel-loader'],
      threads: 4,
      // threadPool: happyThreadPool,
    }),
    //  2017-08-13配合最新升级的webpack3提供的新功能，可以使压缩的代码更
    new webpack.optimize.ModuleConcatenationPlugin()
  ]
})
// console.log(JSON.stringify(webpackConfig));

if (config.build.productionGzip) {
  var CompressionWebpackPlugin = require('compression-webpack-plugin');

  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: new RegExp(
        '\\.(' +
        config.build.productionGzipExtensions.join('|') +
        ')$'
      ),
      threshold: 10240,
      minRatio: 0.8
    })
  )
}

if (config.build.bundleAnalyzerReport) {
  var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig
