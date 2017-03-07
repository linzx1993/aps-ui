//是否发布发布环境
var gIsRelease = false;
var CONFIG = require('./gulp/config');
//A ternary gulp plugin: conditionally control the flow of vinyl objects.
var gulpif = require('gulp-if');
//导入配置
//删除
var del = require('del');
var path = require('path');
//监听
var watch = require('gulp-watch');
//gulp插件
var gulp = require("gulp");
//sass编译，注意：只支持sass，不支持compass
var sass = require("gulp-sass");
//自动刷新浏览器
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;

//文件名加MD5后缀
var rev = require("gulp-rev");
//样式瘦身
var cleanCss = require("gulp-clean-css");
//对应规则
var sourcemaps = require('gulp-sourcemaps');
//替换html内容js、css
var revCollector = require("gulp-rev-collector");
//postcss
var postcss = require('gulp-postcss');
//PostCSS插件 CSSNext 用下一代CSS书写方式兼容现在浏览器
// var cssnext = require('cssnext');
//PostCSS插件 Autoprefixer 为CSS补全浏览器前缀
var autoprefixer = require('autoprefixer');
//PostCSS插件 CSS Grace 让CSS兼容旧版IE 
var cssgrace = require('cssgrace');
//PostCSS插件 处理样式中的图片，支持内联图片base64，svg图片，支持获取图片高度宽度，cachebuster=true 没测试通过
var assets = require('postcss-assets');
//PostCSS插件 给图片添加后缀
var urlrev = require('postcss-urlrev');
//PostCSS插件 支持图片精灵
var postcssSprites = require('postcss-sprites');
//This plugin does not support streaming. If you have files from a streaming source, such as browserify, you should use gulp-buffer before gulp-rev in your pipeline:
var buffer = require('gulp-buffer');
//require optimize
var requirejsOptimize = require('gulp-requirejs-optimize');
//A tiny wrapper around Node streams.Transform (Streams2) to avoid explicit subclassing noise
var through = require('through2');
//压缩html
var htmlmin = require('gulp-htmlmin');

var modify = require('gulp-modify');

var md5 = require('md5');

var filter = require('gulp-filter');

var px2rem = require('postcss-px2rem');

//这里替换了以后gulp-rev-collector就无法替换，目前是移植到gulp-rev-collector的dirReplacements来配置
function customRevHash(file, enc, cb) {
    // if (CONFIG.revHash) {
    //     // write the NEW path
    //     file.path = file.revOrigPath + '?v=' + file.revHash;
    // }
    // send back to stream
    cb(null, file);
}

//sass合并
gulp.task("sass", function() {
    var postcssProcessors = [
        assets,
        urlrev,
        autoprefixer(CONFIG.autoprefixer)
        // postcssSprites({
        //     stylesheetPath: './dist/css',
        //     spritePath: './dist/images' //雪碧图合并后存放地址
        // }),
        // cssgrace
    ];
    if (CONFIG.px2rem.isExecute) {
        postcssProcessors.push(px2rem(CONFIG.px2rem.options));
    }
    return gulp.src(CONFIG.sass.src)
        .pipe(sass(CONFIG.sassOptions).on('error', sass.logError))
        .pipe(gulpif(gIsRelease, cleanCss()))
        // .pipe(sourcemaps.init())
        .pipe(postcss(postcssProcessors))
        // .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(CONFIG.sass.dest))
        .pipe(buffer())
        .pipe(rev())
        .pipe(through.obj(customRevHash))
        .pipe(gulpif(!CONFIG.revHash, gulp.dest(CONFIG.sass.dest)))
        .pipe(rev.manifest())
        .pipe(gulp.dest(CONFIG.sass.dest))
        // .pipe(gulpif(!gIsRelease,reload({ stream: true })));
});

gulp.task('rev-html', function() {
    return gulp.src(CONFIG.html.filter)
        .pipe(revCollector(CONFIG.revCollector))
        .pipe(gulpif(gIsRelease, htmlmin(CONFIG.htmlmin)))
        .pipe(gulp.dest(CONFIG.html.dest))
        .pipe(gulpif(!gIsRelease, reload({ stream: true })));
});

//./dist目录
gulp.task('clear-dist', function() {
    return del([CONFIG.dist]).then(paths => {
        console.log('Deleted files and folders:\n', paths.join('\n'));
    });
});

//copy-fonts
gulp.task('copy-fonts', function() {
    return gulp.src(CONFIG.fonts.src)
        .pipe(gulp.dest(CONFIG.fonts.dest));
});

//copy-images
gulp.task('copy-images', function() {
    return gulp.src(CONFIG.images.src)
        .pipe(gulp.dest(CONFIG.images.dest))
        .pipe(rev())
        .pipe(through.obj(customRevHash))
        .pipe(gulpif(!CONFIG.revHash, gulp.dest(CONFIG.images.dest)))
        .pipe(rev.manifest())
        .pipe(gulp.dest(CONFIG.images.dest))
        // .pipe(gulpif(!gIsRelease,reload({ stream: true })));
});

//requirejs 合并
gulp.task('scripts', function() {
    // var replace = require('gulp-replace');
    return gulp.src([CONFIG.js.src])
        .pipe(gulpif(gIsRelease, filter(CONFIG.js.filter)))
        .pipe(gulpif(gIsRelease, requirejsOptimize(function(file) {
            if (file.relative == 'app.js') {
                return Object.assign({}, CONFIG.requirejs.common, CONFIG.requirejs.app);
            }
            return Object.assign({}, CONFIG.requirejs.common, CONFIG.requirejs.modules);
        })))
        .pipe(gulpif(gIsRelease, modify({
            fileModifier: function(file, contents) {
                if (file.history && file.history[0] == CONFIG.appName) {
                    var md5Cnt = md5(new Date().getTime()).substring(0, 10);
                    return contents + 'require.config({urlArgs : "' + md5Cnt + '"});';
                }
                return contents;
            }
        })))
        .pipe(gulp.dest(CONFIG.js.dest))
        .pipe(rev())
        .pipe(through.obj(customRevHash))
        .pipe(gulpif(!CONFIG.revHash, gulp.dest(CONFIG.js.dest)))
        .pipe(rev.manifest())
        .pipe(gulp.dest(CONFIG.js.dest))
        // .pipe(gulpif(!gIsRelease,reload({ stream: true })));
});

gulp.task('watch', function() {
    browserSync.init(CONFIG.browserSync);
    gulp.watch(CONFIG.sass.src, gulp.series('sass', 'rev-html'));
    gulp.watch(CONFIG.fonts.src, gulp.series('copy-fonts', 'rev-html'));
    gulp.watch(CONFIG.images.src, gulp.series('copy-images', 'rev-html'));
    gulp.watch(CONFIG.js.src, gulp.series('scripts', 'rev-html'));
    gulp.watch(CONFIG.html.src, gulp.series('rev-html'));
});


gulp.task('release', function() {
    gIsRelease = true;
    return gulp.src('___/*___', function() {});
});

//开发环境：只要编译sass即可
gulp.task('default', gulp.series('clear-dist', gulp.parallel('scripts', 'sass', 'copy-fonts', 'copy-images'), 'rev-html', 'watch'));

//生成环境：1、删除dist目录 2、编译sass，并把编译后的结果发送到dist目录；3、合并js请求
gulp.task('release', gulp.series('release', 'clear-dist', gulp.parallel('scripts', 'sass', 'copy-fonts', 'copy-images'), 'rev-html', 'watch'));