var path = require('path');

var PROJECT_NAME = 'm-youyong';
var STATIC_SERVER = 's1.zzhstatic.com';
var CDN = '//' + STATIC_SERVER + '/' + PROJECT_NAME + '/';
var PATH_SOURCE = 'source';
var PATH_DIST = 'dist';

//主配置文件
var APP_NAME = 'app';

var CONFIG = {
    appName: APP_NAME + '.js',
    cdn: CDN,
    dist: './' + PATH_DIST,
    revHash: true, //gulp-ref默认是：filename-hashcode.css，如果此项为true，就会以以下格式显示:filename.css?hascode
    images: {
        src: './' + PATH_SOURCE + '/images/**/*',
        dest: './' + PATH_DIST + '/images'
    },
    fonts: {
        src: './' + PATH_SOURCE + '/fonts/**/*',
        dest: './' + PATH_DIST + '/fonts'
    },
    html: {
        src: './' + PATH_SOURCE + '/html/**/*.{html,htm}',
        dest: './' + PATH_DIST + '/html',
        filter: ['./' + PATH_DIST + '/**/*.json', './' + PATH_SOURCE + '/html/**/*.html']
    },
    sass: {
        src: './' + PATH_SOURCE + '/sass/**/*.{sass,scss}',
        dest: './' + PATH_DIST + '/css'
    },
    px2rem: {
        isExecute: true,
        options: {
            remUnit: 46.875
        }
    },
    js: {
        src: './' + PATH_SOURCE + '/js/**/*.js',
        filter: [PATH_SOURCE + '/js/conf/**/*.js', PATH_SOURCE + '/js/app.js'], //注意入口文件规定为'+PATH_SOURCE+'/js/app.js
        dest: './' + PATH_DIST + '/js/'
    },
    //开发和生成环境通用,生产环境会用gulp-clean-css瘦身压缩
    sassOptions: {
        outputStyle: 'nested' // Can be nested (default), compact, compressed, or expanded
    },
    revCollector: {
        replaceReved: true,
        dirReplacements: {
            '/css': function(manifestValue) {
                return CDN + PATH_DIST + '/css/' + getManifestValueByRevHash(manifestValue);
            },
            '/js': function(manifestValue) {
                return CDN + PATH_DIST + '/js/' + getManifestValueByRevHash(manifestValue);
            },
            '/images': function(manifestValue) {
                return CDN + PATH_DIST + '/images/' + getManifestValueByRevHash(manifestValue);
                // return '//s' + (Math.floor(Math.random() * 4) + 1) + '.zzhstatic.com' + '/example-project/'+PATH_DIST+'/images/' + getManifestValueByRevHash(manifestValue);
            }
        }
    },
    //只有开发环境使用
    browserSync: {
        proxy: {
            target: "http://" + STATIC_SERVER,
            middleware: function(req, res, next) {
                next();
            }
        }
    },
    //只有生产环境才启用
    htmlmin: {
        // removeComments: true, //清除HTML注释
        // ignoreCustomFragments: [/^<!--#include[\s\S]*-->$/g],
        collapseWhitespace: true, //压缩HTML
        collapseBooleanAttributes: true, //省略布尔属性的值
        removeEmptyAttributes: true, //删除所有空格作属性值
        removeScriptTypeAttributes: true, //删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true, //删除<style>和<link>的type="text/css"
        minifyJS: true, //压缩页面JS
        minifyCSS: true, //压缩页面CSS
        maxLineLength: 1024
    },
    //autoprefixer 配置，自动添加需要兼容浏览器前缀
    autoprefixer: {
        browsers: [
            'last 10 versions',
            'safari 5',
            'ie 8',
            'ie 9',
            'opera 12.1',
            'ios 6',
            'android 4'
        ],
        cascade: false
    },
    //只有生产环境才启用
    requirejs: {
        //公共配置
        common: {
            findNestedDependencies: true,
            // baseUrl: 'http://s1.zhongzhihui.com/p-youyong/dist/js/',
            paths: {
                // 'lib': 'http://s1.zhongzhihui.com/lib',
                'template': 'lib/template/3.0/template-simple',
                'css': 'lib/require/2.1/plugins/css/css', // or whatever the path to require-css is
                'text': 'lib/require/2.1/plugins/text/text', // or whatever the path to require-css is
                'jquery': 'lib/jquery/1.11.1/jquery'
            },
            shim: {},
            //打包相关
            optimize: 'uglify2',
            uglify2: {
                mangle: {
                    screw_ie8: false
                },
                compress: {
                    screw_ie8: false,
                    sequences: false,
                    global_defs: {
                        DEBUG: false
                    }
                },
                output: {
                    screw_ie8: false,
                    beautify: false
                }
            }
        },
        //app.js配置文件专门入口
        app: {
            name: APP_NAME,
            include: ['jquery']
        },
        //其他页面入口文件配置
        modules: {
            exclude: ['jquery']
        }
    }
};

//根据
function getManifestValueByRevHash(manifestValue) {
    if (CONFIG.revHash) {
        try {
            var matchArr = manifestValue.match(/\/?[a-zA-Z-\.0-9]+-([0-9a-zA-Z]{10})(\.[a-zA-Z]+)+/);
            var file = manifestValue;
            file = file.replace(/-([0-9a-zA-Z]{10})\./, '.') + '?v=' + matchArr[1];
            return file;
        } catch (e) {
            console.error('getManifestValueByRevHash is failed：', manifestValue, '=>', e.message);
        }
    }
    return manifestValue;
}

module.exports = CONFIG;
