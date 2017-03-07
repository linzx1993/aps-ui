/**
 * Created by yiend on 2016/11/19.
 */
const path = require("path");
const glob = require('glob');
const webpack = require("webpack");
const ExtractTextPlugin = require('extract-text-webpack-plugin');
// var CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");//合并公共文件
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
let isProduction = true;//判断是否是发版产品阶段，是就是dist，否则source不变
let productPath;
(function () {
    if (isProduction) {
        productPath = "/dist";
        // webpackConfig.plugins.push(
        //     //文件压缩/混淆
        //     new webpack.optimize.UglifyJsPlugin({
        //         compress: {
        //             warnings: false
        //         },
        //     })
        // );
    } else {
        productPath = "/source";
    }
})();
// //=========================//
// //入口文件定义
var srcDir = path.resolve(process.cwd(), 'source/scripts');
//遍历controller下面的所有文件
let entry = (function getEntry() {
    let entry = {};
    let srcDirName = "./source/scripts/controllers/*.js";
    //同步方法获取列表文件
    glob.sync(srcDirName).forEach(function (value) {
        let searchName = "/source";
        let key = value.slice(value.indexOf(searchName) + searchName.length + 1, value.length - 3);
        entry[key] = value;
    });
    return entry
})();
//对象合并
var extend = function (o, n) {
    for (var p in n) {
        if (n.hasOwnProperty(p) && (!o.hasOwnProperty(p) ))
            o[p] = n[p];
    }
};
extend(entry, {
    // "scripts/lib/jquery": __dirname + '/source/scripts/lib/jquery',
    // "scripts/lib/angular1.5": __dirname + '/source/scripts/lib/angular1.5',
    // "scripts/lib/ui-router": __dirname + '/source/scripts/lib/ui-router',
    // "scripts/lib/angular-translate": [__dirname + '/source/scripts/lib/angular-translate', __dirname + '/source/scripts/lib/angular-translate-loader-static-files.min',],
    // "scripts/directives/directive" : [__dirname + "/source/scripts/service/folderTree",__dirname + "/source/scripts/directives/rightClick"],
    // "scripts/directives/service" : [__dirname + "/source/scripts/directives/http",__dirname + "/source/scripts/directives/dataService",
    //     __dirname + "/source/scripts/directives/tool",__dirname + "/source/scripts/directives/scheduleTableViewModel",],
    // "scripts/lib/component": [
    //     __dirname + '/source/scripts/lib/My97DatePicker/WdatePicker', __dirname + '/source/scripts/lib/layer/layer',
    //     __dirname + '/source/scripts/lib/jquery.dragsort-0.5.1'
    // ],
    "scripts/app": __dirname + "/source/scripts/app",
    "scripts/config/routeConfig": __dirname + "/source/scripts/config/routeConfig",
    "scripts/controllers/configController": __dirname + '/source/scripts/controllers/config/allConfigController',
    // config : __dirname + "/source/css/config.scss",
    // reset : __dirname + "/source/styles/reset.css",
    style: __dirname + "/main",
});

// //html_webpack_plugins 定义
// var srcDir = path.resolve(process.cwd(), './source');
// var distDir = path.resolve(process.cwd(), 'dist');
// var html_plugins = function () {
//     var entryHtml = glob.sync(srcDir + '/*.html');
//     var r = [];
//     var entriesFiles = entries();
//     for (var i = 0; i < entryHtml.length; i++) {
//         var filePath = entryHtml[i];
//         var filename = filePath.substring(filePath.lastIndexOf('\/') + 1, filePath.lastIndexOf('.'));
//         var conf = {
//             template: filePath,
//             filename: filename + '.html',
//             // inject : "body",
//         };
//         //如果和入口js文件同名
//         if (filename in entriesFiles) {
//             conf.inject = 'body';
//             conf.chunks = ['vendor', filename]
//         }
//         //跨页面引用，如pageA,pageB 共同引用了common-a-b.js，那么可以在这单独处理
//         //if(pageA|pageB.test(filename)) conf.chunks.splice(1,0,'common-a-b')
//         r.push(new HtmlWebpackPlugin(conf))
//     }
//     return r
// }
let webpackConfig = {
    // devtool: isProduction ? null : 'eval-source-map',
    // devtool: 'cheap-module-eval-source-map',
    entry: entry,
    output: {
        publicPath: __dirname + productPath,
        path: __dirname + productPath,
        // filename: '[name].[chunkhash].js'
        filename: '[name].js?' + new Date().valueOf() + "",//js加上时间戳
    },
    devServer: {
        // contentBase: productPath,//本地服务器所加载的页面所在的目录
        colors: true,//终端中输出结果为彩色
        // historyApiFallback: true,//不跳转
        inline: true,//实时刷新
        hot: true,
        // progress:true,
        // port: 8099,
    },
    module: {
        //eslint审查编译前的代码
        preLoaders: [{
            test: /\.js$/, // 只针对js文件
            loader: 'eslint', // 指定启用eslint-loader
            include: "./source", // 指定审查范围仅为自己团队写的业务代码
            exclude: [/node_modules/], // 剔除掉不需要利用eslint审查的文件
        }],
        loaders: [
            {test: /\.json$/, loader: "json"},
            {test: /\.css$/, loader: ExtractTextPlugin.extract("style-loader", "css-loader")},
            {test: /\.scss$/, loader: ExtractTextPlugin.extract("style", 'css!sass')},
            // {test:  /\.less$/, loader:  "style!css!less"},
            {
                test: /\.js$/,
                exclude: /node_modules/,
                // include:[
                //     path.join(process.cwd(),"./source"),
                // ],
                loader: "babel",//在webpack的module部分的loaders里进行配置即可
                // loaders: ['babel-loader', 'eslint-loader']
                query: {presets: ['es2015']}//query为loaders提供额外的设置选项

            },
            {test: /\.(png|jpg|gif)$/, loader: 'url-loader?limit=1024&name=images/[name].[ext]'}
        ]
    },
    // postcss: [autoprefixer()],//自动补全前缀
    eslint: {
        configFile: './.eslintrc', // 指定eslint的配置文件在哪里
        failOnWarning: false, // eslint报warning了不终止webpack编译
        failOnError: true, // eslint报error了就终止webpack编译
        cache: true, // 开启eslint的cache，cache存在node_modules/.cache目录里
    },
    plugins: [
        // new webpack.BannerPlugin("realtech APS"),//实现版权声明
        // new webpack.HotModuleReplacementPlugin(),//热加载插件
        // new webpack.optimize.UglifyJsPlugin(),//压缩js代码
        // new webpack.optimize.CommonsChunkPlugin({
        //     name: "../common",
        //     minChunks: Infinity,
        // }),
        //提供公共插件
        // new webpack.ProvidePlugin({
        //     jQuery: "jquery",
        //     angular: "angular",
        // }),
        new ExtractTextPlugin("styles/[name].css", {allChunks: true}),//相对于output的path进行定位
        // //将css，js文件内联到html中
        new HtmlWebpackPlugin({
            title: 'APS',
            filename: "./index.html",
            template: './source/index.html', // Load a custom template (ejs by default but can be changed)
            inject: 'body', // Inject all scripts into the body (this is the default so you can skip it)
            // hash:true,//通过加时间戳，也可以起到清缓存的作用
            // inlineSource:  '.(js|css)',//内联所有 javascript、css
        }),
        // new HtmlWebpackInlineSourcePlugin()
    ]
    // .concat(html_plugins()),//导入所有的html
};

module.exports = webpackConfig;