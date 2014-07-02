/* jshint node: true */
"use strict";



var gulp = require('gulp');
var less = require('gulp-less');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var csso = require('gulp-csso');
var sourcemaps = require('gulp-sourcemaps');
var rename = require('gulp-rename');
var jshint = require('gulp-jshint');
var pkg = require('./package.json');
var fs = require('fs');


var bowerDirectory = './bower_components';

var dest = 'dist';
var plugins = fs.readdirSync('plugins/').filter(function(name) {
    return fs.statSync('plugins/' + name).isDirectory();
});

var assets = ['images', 'fonts'];


// ///////////////////////////////////////////////////
// JS
// //////////////////////////////////////////////////


function minifySrc(src, dest, name) {
    return gulp.src(src)
        .pipe(sourcemaps.init())
            .pipe(concat(name + '.js'))
            .pipe(gulp.dest(dest))
            .pipe(uglify({
                banner: '/*! ' + name + ' ' + new Date().toJSON().split('T')[0] + ' */\n'
            }))
            .pipe(rename(name + '.min.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(dest));
}


function jsConcatCorePlugins() {
    return gulp.src([dest + '/**/*.min.js', '!' + dest + '/' +  pkg.name + '.min.js'])
        .pipe(sourcemaps.init())
            .pipe(concat(pkg.name + '.min.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(dest));
}

(function() {
    var src = ['core/js/app.js', 'core/js/**/*.js'];

    // Uglification
    gulp.task('core-js', function () {
        return minifySrc(src, dest + '/core', pkg.name + '-core');
    });
    // Watchers
    gulp.task('watch-core-js', function () {
        gulp.watch(src, ['core-js', 'concat-core-plugins']);
    });
    // Concatenation with plugins
    gulp.task('js-concat-core-plugins', jsConcatCorePlugins);
})();



plugins.forEach(function(name) {
    var dir = 'plugins/' + name;
    var src = [dir + '/js/app.js', dir + '/js/**/*.js'];
    gulp.task('plugin-' + name + '-js-hint', function () {
        return gulp.src(src)
            .pipe(jshint())
            .pipe(jshint.reporter('jshint-stylish'))
            .pipe(jshint.reporter('fail'));
    });

    gulp.task('plugin-' + name + '-js', ['plugin-' + name + '-js-hint'], function () {
        return minifySrc(src, dest + '/' + dir, pkg.name + '-' + name);
    });

    gulp.task('watch-plugin-' + name + '-js', function () {
        gulp.watch(src, ['plugin-' + name + '-js', 'js-concat-core-plugins']);
    });
});

var tasks = plugins.map(function(name) { return 'plugin-' + name + '-js'; });
tasks.unshift('core-js');
gulp.task('js-all', tasks, jsConcatCorePlugins);


tasks = plugins.map(function(name) { return 'watch-plugin-' + name + '-js'; });
tasks.unshift('js-all', 'watch-core-js');
gulp.task('watch-js', tasks);


// ///////////////////////////////////////////////////
// LESS
// //////////////////////////////////////////////////

function minifyLess(src, paths, dest, name) {
    return gulp.src(src)
        .pipe(sourcemaps.init())
            .pipe(less({
                paths: paths
            }))
            .pipe(csso())
            .pipe(rename(name + '.min.css'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(dest));
}


function lessConcatCorePlugins() {
    return gulp.src([dest + '/**/*.min.css', '!' + dest +'/css/' +  pkg.name + '.min.css'])
        .pipe(sourcemaps.init())
            .pipe(concat(pkg.name + '.min.css'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(dest + '/css'));
}


(function() {
    var src = 'core/less/index.less';
    var paths = ['core/less', bowerDirectory];
    gulp.task('less-concat-core-plugins', lessConcatCorePlugins);
    gulp.task('core-less', function () {
        return minifyLess(src, paths, dest + '/core/css', pkg.name + '-core');
    });
    gulp.task('watch-core-less', function () {
        gulp.watch(src, ['core-less', 'concat-core-plugins']);
    });
})();

plugins.forEach(function(name) {
    var dir = 'plugins/' + name;
    var src = [dir + '/less/index.less'];
    var paths = [dir + '/less', bowerDirectory];
    gulp.task('plugin-' + name + '-less', function () {
        minifyLess(src, paths, dest + '/' + dir + '/css', pkg.name + '-' + name);
    });

    gulp.task('watch-plugin-' + name + '-less', function () {
        gulp.watch(src, ['plugin-' + name + '-less', 'less-concat-core-plugins']);
    });
});

var tasks = plugins.map(function(name) { return 'plugin-' + name + '-less'; });
tasks.unshift('core-less');
gulp.task('less-all', tasks, lessConcatCorePlugins);


tasks = plugins.map(function(name) { return 'watch-plugin-' + name + '-less'; });
tasks.unshift('less-all', 'watch-core-less');
gulp.task('watch-less', tasks);


// ///////////////////////////////////////////////////
// COPY
// //////////////////////////////////////////////////


gulp.task('core-copy', function() {
    gulp.src(bowerDirectory + '/jquery-ui/themes/smoothness/images/*')
        .pipe(gulp.dest(dest + '/images'));
    gulp.src([
            bowerDirectory + '/bootstrap/fonts/*',
            'fonts/*'
        ])
        .pipe(gulp.dest(dest + '/fonts'));
});
gulp.task('watch-core-copy', function () {
    gulp.watch([
        bowerDirectory + '/jquery-ui/themes/smoothness/images/*',
        bowerDirectory + '/bootstrap/fonts/*',
        'fonts/*'
    ], ['core-copy']);
});

plugins.forEach(function(name) {
    var dir = 'plugins/' + name;
    var src = assets.map(function (asset) {
        return dir + '/' + asset + '/**/*';
    });
    gulp.task('plugin-' + name + '-copy', function () {
        gulp.src(src, {base: dir})
                .pipe(rename(function (path) {
                    var tmp = path.dirname.split('/');
                    path.dirname = tmp[0] + '/' + name + '/' + tmp.splice(1).join('/');
                }))
                .pipe(gulp.dest(dest));
    });


    gulp.task('watch-plugin-' + name + '-copy', function () {
        gulp.watch(src, ['plugin-' + name + '-copy']);
    });
});

var tasks = plugins.map(function(name) { return 'plugin-' + name + '-copy'; });
tasks.unshift('core-copy');
gulp.task('copy-all', tasks, lessConcatCorePlugins);


tasks = plugins.map(function(name) { return 'watch-plugin-' + name + '-copy'; });
tasks.unshift('copy-all', 'watch-core-copy');
gulp.task('watch-copy', tasks);



gulp.task('default', ['js-all', 'less-all', 'copy-all']);
gulp.task('watch', ['watch-copy', 'watch-less', 'watch-js']);
