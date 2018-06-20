/**
 * Created by linzx on 2018/6/14.
 */
'use strict'
const webpack = require('webpack');
const path = require('path');

module.exports = {
    entry: {
        //你需要引入的第三方库文件
        vendor: ['element-ui'],
    },

    output: {
        path: path.join(__dirname, 'dist-dll'),
        filename: '[name].js',
        library: '[name]',
    },

    plugins: [
        new webpack.DllPlugin({
            path: path.join(__dirname, 'dll', '[name]-manifest.json'),
            name: '[name]',
        }),
    ]
};