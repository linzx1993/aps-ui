/**
 * Created by yiend on 2016/11/19.
 */
var webpack = require("webpack");
var ExtractTextPlugin = require('extract-text-webpack-plugin');
// var CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");//合并公共文件
module.exports = {
    // devtool: 'eval-source-map',
    // entry:  __dirname + "/main.js",
    entry : {
        previewController: __dirname + "/source/scripts/controllers/previewController",
        progressController: __dirname + "/source/scripts/controllers/progressController",
        resultController: __dirname + "/source/scripts/controllers/resultController",
        helpController: __dirname + "/source/scripts/controllers/helpController",
        configController: __dirname + "/source/scripts/controllers/config/allConfigController",
        // configController: __dirname + "/configControllerDemo",
        // config : __dirname + "/source/css/config.scss",
        // main : __dirname + "/main.js",
    },
    output: {
        path: __dirname + "/dist/scripts/controllers/",
        // publicPath: './images',
        // publicPath : "../dist",
        filename: '[name].js'
    },
    module: {
        loaders: [
            {test: /\.json$/, loader: "json"},
            {test: /\.css$/,loader : ExtractTextPlugin.extract("style-loader","css-loader")},
            {test:  /\.scss$/, loader:   ExtractTextPlugin.extract("style", 'css!sass')},
            {test:  /\.less$/, loader:  "style!css!less"},
            {
                test: /\.js$/,
                exclude: /node_modules/,
                // include:/scripts\controllers/,
                loader: 'babel',//在webpack的module部分的loaders里进行配置即可
                query: {
                    presets: ['es2015'
                        // ,'react'
                    ]
                }
            },
            {test: /\.(png|jpg|gif)$/, loader: 'url-loader?limit=8192'}
        ]
    },
    plugins : [
        // new webpack.HotModuleReplacementPlugin()//热加载插件
        // new webpack.optimize.UglifyJsPlugin(),//压缩js代码
        // new webpack.optimize.CommonsChunkPlugin('common.js'),
        new ExtractTextPlugin("../../styles/[name].css"),//相对于output的path进行定位
    ],
    // devServer: {
    //     contentBase: "./public",
    //     colors: true,
    //     historyApiFallback: true,
    //     inline: true
    // }
}