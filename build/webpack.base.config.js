/**
 * Created by linzx on 2018/5/29.
 */
'use strict'
const path = require("path")
const config = require("./config")

function resolve(dir) {
    return path.join(__dirname, "..",  dir)
}

const webpackConfig = {
    entry: {
        index: path.resolve(__dirname, '../src/index.js'),
        reset: path.resolve(__dirname, '../src/styles/reset.scss')
    },
    output: {
        path: path.resolve(__dirname, "..", 'dist'),
        filename: 'scripts/[name].[hash].js',
        chunkFilename: 'scripts/[name].[hash].js',
    },
    resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: {
            'vue$': 'vue/dist/vue.esm.js',
            '@': resolve('src'),
            'src': resolve('src'),
        }
    },
    module: {
        rules:[
            {
                test: /\.html$/,
                loader: 'html-withimg-loader',
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                //踩坑：使用vue-loader14版本没有报错。一开始使用的13版本编译失败,报错代码:
                // vue-loader was used without the corresponding plugin. Make sure to include VueLoaderPlugin in your webpack config.
            },
            // 踩坑：webpack不允许混用import和module.exports，推荐统一改成ES6的方式import和export default
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                },
                include: resolve('src'),
            },
            {
                test: /\.otf|ttf|woff2?|eot(\?\S*)?$/,
                use: [{
                    loader: "file-loader",
                    options: {
                        name: "[name].[ext]",
                        outputPath: "assets/fonts/"
                    }
                }]
            },
            {
                test: /\.(png|jpe?g|gif)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 1 * 1024,
                    name: "assets/[name].[ext]"
                }
            },
            {
                test: /\.(svg)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 1 * 1024,
                    name: "assets/svg/[name].[hash:7].[ext]"
                }
            },
        ]
    }
}

module.exports = webpackConfig