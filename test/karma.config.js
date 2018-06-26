/**
 * Created by linzx on 2018/6/19.
 */
'use strict'
const webpackConfig = require('../build/webpack.test.config.js')

module.exports = function (config) {
    config.set({
        frameworks: ['mocha'],

        files: [
            '**/*.spec.js'
        ],

        preprocessors: {
            '**/*.spec.js': ['webpack', 'sourcemap', 'coverage']
        },

        webpack: webpackConfig,

        reporters: ['spec', 'coverage'],

        browsers: ['Chrome'],

        coverageReporter: {
            type: "html",
            dir: 'coverage/'
        }
    })
}