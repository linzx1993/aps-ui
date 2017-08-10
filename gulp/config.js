/**
 * Created by linzx on 2017/2/14.
 */
const PATH_SOURCE = 'source';
const PATH_DIST = 'dist';
const CONFIG = {
    source : PATH_SOURCE,
    dist: PATH_DIST,
    revHash: true, //gulp-ref默认是：filename-hashcode.css，如果此项为true，就会以以下格式显示:filename.css?hascode
    images: {
        src: PATH_SOURCE + '/images/*.*',
        dest: PATH_DIST + '/images'
    },
    language: {
        src: PATH_SOURCE + '/language/*.json',
        dest: PATH_DIST + '/language'
    },
    scripts: {
        controllers : {
            src : PATH_SOURCE + "/scripts/controllers/**/*.js",
            dest : PATH_DIST + '/scripts/controllers'
        },
        src: PATH_SOURCE + '/scripts/**/*.js',
        dest: PATH_DIST + '/scripts'
    },
    view: {
        src: PATH_SOURCE + '/**/*.{html,htm}',
        dest: PATH_DIST + '/',
        filter: [PATH_DIST + '/**/*.json', PATH_SOURCE + '/html/**/*.html']
    },
    styles: {
        src: PATH_SOURCE + '/styles/*.{sass,scss}',
        css : {
            src: PATH_SOURCE + '/styles',
            dest: PATH_DIST + '/styles'
        }
    },
    combine: {
        configController: {
            src: [PATH_SOURCE + "/scripts/controllers/config/*.js"],
            dest: PATH_SOURCE + "/scripts/controllers"
        }
    }
};

module.exports = CONFIG;
