/**
 * Created by linzx on 2018/6/2.
 */
'use strict'
module.exports = {
    dev: {
        NODE_ENV: "development",
        devtool: "'eval-source-map'"
    },
    build: {
        NODE_ENV: "production",
        devtool: "#source-map",
        assetPath: "",
        productionSourceMap: true, // 是否需要打包的map文件
        bundleAnalyzerReport: false, // 启动文件分析
    }
}
