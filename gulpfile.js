/* global require */
/* jshint -W097 */
"use strict";



var gulp = require('gulp');
var less = require('gulp-less');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-minify-css');
var sourcemaps = require('gulp-sourcemaps');
var rename = require('gulp-rename');
var jshint = require('gulp-jshint');
var pkg = require('./package.json');
var fs = require('fs');


var bowerDirectory = './bower_components';

var dest = 'dist';
var plugins = fs.readdirSync('plugins/').filter(function (name) {
    return fs.statSync('plugins/' + name).isDirectory();
});


// ///////////////////////////////////////////////////
// JS
// //////////////////////////////////////////////////


function minifySrc (src, dest, name) {
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
    return gulp.src([dest + '/**/*.min.js', '!' + dest +  pkg.name + '-core-and-plugins.min.js'])
        .pipe(sourcemaps.init())
            .pipe(concat(pkg.name + '-core-and-plugins.min.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(dest));
}

(function() {
    var src = ['core/js/app.js', 'core/js/**/*.js'];

    // Uglification
    gulp.task('core-js', function () {
        return minifySrc(src, dest + '/core', pkg.name);
    });
    // Watchers
    gulp.task('watch-core-js', function () {
        gulp.watch(src, ['core-js', 'concat-core-plugins']);
    });
    // Concatenation with plugins
    gulp.task('js-concat-core-plugins', jsConcatCorePlugins);
})();



plugins.forEach(function (name) {
    var dir = 'plugins/' + name;
    var src = [dir + '/js/app.js', dir + '/js/**/*.js'];
    gulp.task('plugin-' + name + '-js-hint', function () {
        return gulp.src(src)
            .pipe(jshint())
            .pipe(jshint.reporter('jshint-stylish'))
            .pipe(jshint.reporter('fail'));
    });

    gulp.task('plugin-' + name + '-js', ['plugin-' + name + '-js-hint'], function () {
        return minifySrc(src, dest + '/plugins', pkg.name + '-' + name);
    });

    gulp.task('watch-plugin-' + name + '-js', function () {
        gulp.watch(src, ['plugin-' + name + '-js', 'js-concat-core-plugins']);
    });
});

var tasks = plugins.map(function(name) { return 'plugin-' + name + '-js'; });
tasks.unshift('core-js');
gulp.task('js-all', tasks, jsConcatCorePlugins);


tasks = plugins.map(function(name) { return 'watch-plugin-' + name + '-js'; });
tasks.unshift('watch-core-js');
tasks.unshift('js-all');
gulp.task('watch-js', tasks);


// ///////////////////////////////////////////////////
// LESS
// //////////////////////////////////////////////////

function minifyLess (src, paths, dest, name) {
    return gulp.src(src)
        .pipe(sourcemaps.init())
            .pipe(less({
                paths: paths
            }))
            .pipe(minifyCss())
            .pipe(rename(name + '.min.css'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(dest));
}


function lessConcatCorePlugins() {
    return gulp.src([dest + '/**/*.min.css', '!' + dest +  pkg.name + '-core-and-plugins.min.css'])
        .pipe(sourcemaps.init())
            .pipe(concat(pkg.name + '-core-and-plugins.min.css'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(dest));
}


(function() {
    var src = 'core/less/index.less';
    var paths = ['core/less', bowerDirectory];
    gulp.task('less-concat-core-plugins', lessConcatCorePlugins);
    gulp.task('core-less', function () {
        return minifyLess(src, paths, dest + '/core/css', pkg.name);
    });
    gulp.task('watch-core-less', function () {
        gulp.watch(src, ['core-less', 'concat-core-plugins']);
    });
})();




plugins.forEach(function (name) {
    var dir = 'plugins/' + name;
    var src = [dir + '/less/index.less'];
    var paths = [dir + '/less', bowerDirectory];
    gulp.task('plugin-' + name + '-less', function () {
        minifyLess(src, paths, dest + '/plugins/css', pkg.name + '-' + name);
    });

    gulp.task('watch-plugin-' + name + '-less', function () {
        gulp.watch(src, ['plugin-' + name + '-less', 'less-concat-core-plugins']);
    });
});

var tasks = plugins.map(function(name) { return 'plugin-' + name + '-less'; });
tasks.unshift('core-less');
gulp.task('less-all', tasks, lessConcatCorePlugins);


tasks = plugins.map(function(name) { return 'watch-plugin-' + name + '-less'; });
tasks.unshift('watch-core-less');
tasks.unshift('less-all');
gulp.task('watch-less', tasks);


// ///////////////////////////////////////////////////
// COPY
// //////////////////////////////////////////////////



gulp.task('copy', function () {
    gulp.src(bowerDirectory + '/jquery-ui/themes/smoothness/images', { base: './' })
        .pipe(gulp.dest(dest + '/images'));
    gulp.src([
            bowerDirectory + '/bootstrap/fonts/*',
            '/fonts/*'
        ], { base: './' })
        .pipe(gulp.dest(dest + '/fonts'));
});

gulp.task('default', ['watch-js', 'watch-less', 'copy']);
