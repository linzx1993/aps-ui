/**
 * Created by linzx on 2018/6/4.
 */
'use strict'
const path = require("path")
const rm = require('rimraf')    //删除文件夹
const chalk = require('chalk')  //字体颜色

const baseConfig = require("./webpack.base.config.js")
const config = require("./config")

const webpack = require("webpack")
const merge = require("webpack-merge")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const CopyWebpackPlugin = require('copy-webpack-plugin') // 拷贝静态文件
const WebpackParallelUglifyPlugin = require('webpack-parallel-uglify-plugin') // 压缩
const ExtractTextPlugin = require('extract-text-webpack-plugin') // 踩坑：ExtractTextPlugin还不支持webpack4.0的代码,需要使用@next版本


rm(path.resolve(__dirname,"../dist"),function (err) {
    if (err) throw err
    console.log(chalk.green("\n remove dist success \n"))
})

process.env.NODE_ENV = config.build.NODE_ENV

const webpackConfig = merge(baseConfig, {
    devtool: (config.build.productionSourceMap ? config.build.devtool :false),
    module: {
        rules: [
            {// loader sass and css
                test: /\.(scss|css)$/,
                use: ExtractTextPlugin.extract({
                    // sass配合css3编译需要注意loader的顺序
                    use: [{
                        loader: "css-loader",
                        options: {// some options
                            sourceMap: true,
                            minimize: true
                        }
                    }, {// fix the css3
                        loader: "postcss-loader",
                        options: {
                            sourceMap: true,
                            config: {
                                // path: 'postcss.config.js'
                            }
                        }
                    }, {
                        loader: "sass-loader",
                        options: {
                            sourceMap: true
                        }
                    }],
                    fallback: "style-loader",
                    publicPath: "../"
                })
            }
        ]
    },
    externals: {
        // jquery: 'jquery',
        tool: 'tool',
        t: 't',
    },
    plugins: [
        new ExtractTextPlugin({
            filename:"./styles/[name].css",
            allChunks: false,
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, "..", "src/index.html"),//new 一个这个插件的实例，并传入相关的参数
            inject: 'body', //js插入的位置，true:'head';false:body
            minify: {
                // removeAttributeQuotes:true, //压缩 去掉引号
                removeComments: true, //移除HTML中的注释
                collapseWhitespace: false //删除空白符与换行符
            }
        }),
        new WebpackParallelUglifyPlugin({
            // 有兴趣可以探究一下使用uglifyES
            uglifyJS: {
                output: {
                    beautify: false, //不需要格式化
                    comments: false //不保留注释
                },
                compress: {
                    warnings: false, // 在UglifyJs删除没有用到的代码时不输出警告
                    drop_console: true, // 删除所有的 `console` 语句，可以兼容ie浏览器
                }
            }
        }),
        //原有分隔代码模块的优化
        new webpack.optimize.SplitChunksPlugin({
            chunks: "all",  // initial(初始块)、async(按需加载块)、all(全部块)，默认为all;
            minSize: 30000, // 压缩前的最小模块大小, 太小体积的代码块被分割，可能还会因为额外的请求，拖慢加载性能
            minChunks: 1,   // 被引用次数
            maxAsyncRequests: 5,
            maxInitialRequests: 3,
            name: "bundle", // 默认由块名和hash值自动生成
            cacheGroups: {
                default: {
                    minChunks: 2,
                    priority: -20,
                    reuseExistingChunk: true,
                },
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10
                }
            }
        }),
        new CopyWebpackPlugin([
            {
                from: path.resolve(__dirname, '../src/scripts/lib/vue.js'),
                to: path.resolve(__dirname, '../dist/scripts/lib'),
            },{
                from: path.resolve(__dirname, '../src/scripts/utils/tool.js'),
                to: path.resolve(__dirname, '../dist/scripts/utils'),
            }
        ]),
    ],
    mode: "production"
})

if (config.build.bundleAnalyzerReport) {
    const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
    webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig
