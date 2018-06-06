/**
 * Created by linzx on 2018/6/4.
 */
'use strict'
const path = require("path")

const baseConfig = require("./webpack.base.config.js")
const config = require("./config")

const webpack = require("webpack")
const merge = require("webpack-merge")
const HtmlWebpackPlugin = require("html-webpack-plugin")

process.env.NODE_ENV = config.dev.NODE_ENV

const webpackConfig = merge(baseConfig, {
    module: {
        rules:[{// loader sass and css
            test: /\.(scss|css)$/,
            use:[
                'style-loader',
                {
                    loader: 'css-loader',
                    options: {
                        importLoaders: 2 // 0 => no loaders (default); 1 => postcss-loader; 2 => postcss-loader, sass-loader
                    }
                },
                'postcss-loader',
                'sass-loader'
            ]
        }],
    },
    devtool: config.dev.devtool,
    devServer: {
        contentBase: path.join(__dirname, "../src"),
        historyApiFallback: true, // 不跳转
        inline: true, //实时刷新
        port: 8081,
        open: true,
        host: "localhost",  // 需要在package.json文件中指定ip地址才能分享
        // disableHostCheck: true,
        clientLogLevel: "none", // 取消热编译时无用console
        // proxy: {
        //     "/api/location/noCalendar": {
        //         target: "http:192.168.200.181:8081/api/location/noCalendar",
        //         port: 8081,
        //         pathRewrite: {'^/api' : '/wechat/api_test'},
        //         changeOrigin: true
        //     }
        // }
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(__dirname, "..", "src/index.html"),//new 一个这个插件的实例，并传入相关的参数
            inject: 'body', //js插入的位置，true:'head';false:body
        }),
        new webpack.HotModuleReplacementPlugin(), //热加载插件
    ],
    mode: "development"
})

module.exports = webpackConfig