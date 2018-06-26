/**
 * Created by linzx on 2018/6/20.
 */
'use strict'
const webpack = require('webpack')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.config')

const webpackConfig = merge(baseWebpackConfig, {
    devtool: '#inline-source-map',
    mode : 'none'
})

delete webpackConfig.entry

module.exports = webpackConfig