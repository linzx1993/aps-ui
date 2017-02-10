/**
 * Created by yiend on 2016/11/19.
 */
const path = require("path");
var webpack = require("webpack");
var ExtractTextPlugin = require('extract-text-webpack-plugin');
// var CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");//合并公共文件
var HtmlWebpackPlugin = require('html-webpack-plugin');
var HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
module.exports = {
    // devtool: 'eval-source-map',
    // entry:  __dirname + "/main.js",
    entry : {
        mainController: __dirname + "/source/scripts/controllers/mainController",
        previewController: __dirname + "/source/scripts/controllers/previewController",
        progressController: __dirname + "/source/scripts/controllers/progressController",
        resultController: __dirname + "/source/scripts/controllers/resultController",
        helpController: __dirname + "/source/scripts/controllers/helpController",
        configController: __dirname + "/source/scripts/controllers/config/allConfigController",
        // configController: __dirname + "/configControllerDemo",
        // config : __dirname + "/source/css/config.scss"
        // reset : __dirname + "/source/styles/reset.css",
        // main : __dirname + "/main.js",
    },
    output: {
        path: __dirname + "/dist",
        // publicPath: './images',
        // publicPath : "../dist",
        // filename: '[name].[chunkhash].js'
        filename: '/scripts/controllers/[name].js?' + new Date().valueOf()+"",//人为js加上时间戳
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
                include:[
                    path.join(process.cwd(),"./source"),
                ],
                loader: 'babel',//在webpack的module部分的loaders里进行配置即可
                query: {presets: ['es2015']}

            },
            {test: /\.(png|jpg|gif)$/, loader: 'url-loader?limit=1024&name=images/[name].[ext]'}
        ]
    },
    scripts : {

    },
    plugins : [
        // new webpack.HotModuleReplacementPlugin()//热加载插件
        // new webpack.optimize.UglifyJsPlugin(),//压缩js代码
        // new webpack.optimize.CommonsChunkPlugin('common.js'),
        new ExtractTextPlugin("./styles/[name].css"),//相对于output的path进行定位
        //将css，js文件内联到html中
        new HtmlWebpackPlugin({
            title: 'APS',
            filename : "./index.html",
            template: './source/index.html', // Load a custom template (ejs by default but can be changed)
            inject: 'body', // Inject all scripts into the body (this is the default so you can skip it)
            // hash:true,//通过加时间戳，也可以起到清缓存的作用
            // inlineSource:  '.(js|css)',//内联所有 javascript、css
        }),
        // new HtmlWebpackInlineSourcePlugin()
    ],
    // devServer: {
    //     contentBase: "./public",
    //     colors: true,
    //     historyApiFallback: true,
    //     inline: true
    // }
}