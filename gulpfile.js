/**
 * Created by yiend on 2017/2/13.
 */
const gulp = require('gulp');
//颜色log
const util = require("gulp-util");
//报错继续执行任务
const notify = require("gulp-notify");
//ES6编译
const babel = require("gulp-babel");
//监听
const watch = require('gulp-watch');
//sass编译，注意：只支持sass，不支持compass
const sass = require("gulp-sass");
//生成map文件对应
const sourcemaps = require('gulp-sourcemaps');
//压缩html
const htmlmin = require('gulp-htmlmin');
//压缩js === ES6语法压缩会报错，必须先编译成ES5
const uglify = require('gulp-uglify');
//压缩cs
const minifycss = require("gulp-minify-css");
//压缩图片
const imagemin = require("gulp-imagemin"),
    //深度压缩图片
    pngquant = require('imagemin-pngquant');
//文件重命名
const rename = require('gulp-rename');
//文件合并
const concat = require("gulp-concat");
//过滤文件
const filter = require('gulp-filter'),
    gulpIgnore = require('gulp-ignore');
//只编译改动的文件
const changed = require('gulp-changed');
//md5加密
const md5 = require("gulp-md5-plus");
//添加版本号
const assetRev = require('gulp-asset-rev'),
    rev = require('gulp-rev'),//- 对文件名加MD5后缀
    revCollector = require('gulp-rev-collector');//路径替换
//顺序执行任务
const runSequence = require('run-sequence');
const sequence = require("gulp-sequence");
//清空文件夹
const clean = require("gulp-clean");
//debug
const debug = require("gulp-debug");
//自动刷新浏览器
const browserSync = require('browser-sync');
//引入文件配置
const config = require("./gulp/config");
//是否为发布环境
const isProduct = false;

//拷贝已经编译好的css,js,html,json
gulp.task("copyHtml",function(){
    // if(isProduct){
    //     gulp.src(config.view.src)
    //         .pipe(htmlmin({
    //             collapseWhitespace:true,  //清除空格，压缩html，这一条比较重要，作用比较大，引起的改变压缩量也特别大。
    //             collapseBooleanAttributes:true,  //省略布尔属性的值，比如：<input checked="checked"/>,那么设置这个属性后，就会变成 <input checked/>。
    //             removeComments:true,  //清除html中注释的部分，我们应该减少html页面中的注释。
    //             removeEmptyAttributes:true,  //清除所有的空属性。
    //             removeScriptTypeAttributes:true,  //清除所有script标签中的type="text/javascript"属性。
    //             removeStyleLinkTypeAttributes:true,  //清楚所有Link标签上的type属性。
    //             minifyJS:true,  //压缩html中的javascript代码。
    //             minifyCSS:true  //压缩html中的css代码。
    //         }))
    //         .pipe(gulp.dest(config.view.dest))
    // }else{
        gulp.src(config.view.src)
            .pipe(gulp.dest(config.view.dest));
    // }
});

gulp.task('copyLanguage', function () {
    return gulp.src(config.language.src)
        .pipe(gulp.dest(config.language.dest))
});

gulp.task("copyCss",function(){
    if(isProduct){
        gulp.src(config.styles.src)
            // .pipe(rename({ suffix: '.min' }))
            // .pipe(sourcemaps.init())
            .pipe(sass().on('error', sass.logError))
            // .pipe(sourcemaps.write('.'))
            .pipe(minifycss())
            .pipe(rev())
            .pipe(gulp.dest(config.styles.css.dest))
            .pipe(rev.manifest())    //- 生成一个rev-manifest.json
            .pipe(gulp.dest('./rev'))    //- 将 rev-manifest.json 保存到 rev 目录内
            .pipe(notify({ message:'copyCss task complete' }));
    }else{
        gulp.src(config.styles.src)
            // .pipe(changed(config.styles.css.src))
            // .pipe(debug({"a":"item"}))
            .pipe(sourcemaps.init())
            .pipe(sass().on('error', sass.logError))
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest(config.styles.css.src))
            .pipe(gulp.dest(config.styles.css.dest));
    }
});

//合并文件
gulp.task("concat",function(){
    gulp.src(config.combine.configController.src)
        .pipe(concat('configController.js'))
        .pipe(babel({presets: ['es2015']}))
        .pipe(gulp.dest(config.combine.configController.dest));
});

gulp.task("copyJs",function(){
    //发布环境进行压缩，改名，加上hash
    if(isProduct){
        gulp.src([config.scripts.src,"!source/scripts/lib/**/*.*"])
            .pipe(babel({presets: ['es2015']}))
            // .pipe(uglify())
            .pipe(rev())
            // .pipe(debug({"title":"item:"}))
            .pipe(gulp.dest(config.scripts.dest))
            .pipe(rev.manifest())    //- 生成一个rev-manifest.json
            .pipe(gulp.dest('./rev'))    //- 将 rev-manifest.json 保存到 rev 目录内
            .pipe(notify({ message:'copyJs task complete' }));
    }else{
        gulp.src([config.scripts.src,"!source/scripts/lib/**/*.*"])
            .pipe(babel({presets: ['es2015']}))
            .pipe(gulp.dest(config.scripts.dest));
    }
    // //将一些图片相关文件进行迁移
    gulp.src("source/scripts/lib/**/*.*")
        .pipe(gulp.dest(config.scripts.dest));

});

gulp.task("copyImage",function(){
    if(isProduct){
        gulp.src(config.images.src)
            .pipe(imagemin({
                optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
                progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
                interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
                multipass: false, //类型：Boolean 默认：false 多次优化svg直到完全优化
                use: [pngquant()] //使用pngquant深度压缩png图片的imagemin插件
            }))
            .pipe(gulp.dest(config.images.dest))
    }else{
        gulp.src(config.images.src)
            .pipe(gulp.dest(config.images.dest))

    }
});

//文件加hash值，防缓存
gulp.task("md5",function(done){
    gulp.src("dist/scripts/controller/*.js")
        .pipe(md5(10, 'dist/*.html'))
        .pipe(gulp.dest("dist/scripts/controller"))
        .on('end', done);
});

//清空文件夹，清空图片、样式、js
gulp.task('clean', function() {
    gulp.src(['dist/*',"rev/*"], {read: false})
        .pipe(clean());
});
//==================================监测所有文件实时刷新==========================================//
//自动监测方案一
gulp.task('watch', ["clean"],function() {
    if(isProduct){
        console.log("\033[36m-------------------------------------\n开发状态下，请将isProduct设置为false\n-------------------------------------\033[33m");
        return;
    }
    // runSequence("clean",['copyHtml', 'copyCss','concat',"copyJs","copyImage","copyLanguage"]);
    // runSequence('clean', ['copyHtml', 'copyCss',"copyJs","copyImage","copyLanguage",]);
    browserSync({
        files: [config.source + "/index.html",config.scripts.src,config.styles.src,config.view.src], //--files 路径是相对于运行该命令的项目（目录）
        server: {
            baseDir: config.source//监听下面所有文件夹的文件
        }
    });
    gulp.watch(config.scripts.controllers.src,["concat"]);
    // gulp.watch([config.scripts.src,"!" + config.scripts.controllers.src],['copyJs']);
    gulp.watch(config.styles.src,['copyCss']);
    gulp.watch(config.view.src,['copyHtml']);
});

//==================================只监测scss文件，改变时自动编译，但不实时刷新==========================================//
gulp.task("watchScss",function () {
    gulp.watch(config.styles.src,["copyCss"]);
})

//==================================发布产品，添加版本号==========================================//
gulp.task('revCssAndJs', function(){
    gulp.src([config.styles.css.dest + "/*.css",config.scripts.dest + "/**/*.js"])
        .pipe(rev())
        .pipe(rev.manifest())
        .pipe(gulp.dest('./rev'))
});

//修改替换名字后文件路径
gulp.task('revHtml',["revCssAndJs"], function() {
        gulp.src(['rev/*.json', "dist/*.html"])   //- 读取 rev-manifest.json 文件以及需要进行css名替换的文件
            .pipe(revCollector())                                   //- 执行文件内css名的替换
            .pipe(gulp.dest(config.dist));                     //- 替换后的文件输出的目录
});

//生成环境：1、删除dist目录 2、编译sass，编译ES6，加上版本号，并把编译后的结果发送到dist目录；3、合并js请求
//先执行gulp default,然后执行 gulp revHtml,原因：js文件生成滞后，无法获取js的rev.json文件进行替换版本号
gulp.task('default',["clean",'copyHtml', 'copyCss','concat',"copyJs","copyImage","copyLanguage"],function (cb) {
    if(!isProduct){
        console.log("\033[36m-------------------------------------\n开发状态下，请将isProduct设置为true\n-------------------------------------");
        return;
    }
    // sequence("clean",['copyHtml', 'copyCss','concat',"copyJs","copyImage","copyLanguage"],"revHtml")(cb)
});

//============================================================================//
//为css中引入的图片/字体等添加hash编码
gulp.task('assetRev', function(){
    return gulp.src(config.styles.src)   //该任务针对的文件
        .pipe(assetRev())  //该任务调用的模块
        .pipe(gulp.dest(config.styles.css.dest)); //编译后的路径
});

//开发构建
gulp.task('testVersion', function (done) {
    runSequence(       //需要说明的是，用gulp.run也可以实现以上所有任务的执行，只是gulp.run是最大限度的并行执行这些任务，而在添加版本号时需要串行执行（顺序执行）这些任务，故使用了runSequence.
        ['assetRev'],
        ['revCss'],
        ['revHtml'],
        done);
});
//============================================================================//