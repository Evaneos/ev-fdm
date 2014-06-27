var gulp = require('gulp');
var less = require('gulp-less');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-minify-css');
var sourcemaps = require('gulp-sourcemaps');
var rename = require('gulp-rename');
var pkg = require('./package.json');
var bowerDirectory = './bower_components';
var fs = require('fs');



var dest = 'dist'
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
    return gulp.src([dest + '/**/*.min.js', '!' + dest +  pkg.name + '-core-and-plugins.min.css'])
        .pipe(sourcemaps.init())
            .pipe(concat(pkg.name + '-core-and-plugins.min.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(dest));
}

gulp.task('js-concat-core-plugins', jsConcatCorePlugins);

var src = ['core/js/app.js', 'core/js/**/*.js'];
gulp.task('core-js', function () {
    return minifySrc(src, dest + '/core', pkg.name);
})

gulp.task('watch-core-js', function () {
    gulp.watch(src, ['core-js', 'concat-core-plugins']);
})



plugins.forEach(function (name) {
    var dir = 'plugins/' + name;
    var src = [dir + '/js/app.js', dir + '/js/**/*.js']
    gulp.task('plugin-' + name + '-js', function () {
        minifySrc(src, dest + '/plugins', pkg.name + '-' + name);
    })

    gulp.task('watch-plugin-' + name + '-js', function () {
        gulp.watch(src, ['plugin-' + name + '-js', 'js-concat-core-plugins']);
    })
})

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

function minifyLess (src, dest, name) {
    return gulp.src(src)
        .pipe(sourcemaps.init())
            .pipe(less())
            .pipe(concat(name + '.css'))
            .pipe(gulp.dest(dest))
            .pipe(minifyCss())
            .pipe(rename(name + '.min.css'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(dest));
}


function lessConcatCorePlugins() {
    return gulp.src([dest + '/**/*.min.css', '!' + dest + '/css/'+  pkg.name + '-core-and-plugins.min.css'])
        .pipe(sourcemaps.init())
            .pipe(concat(pkg.name + '-core-and-plugins.min.css'))
        .pipe(sourcemaps.write('./css'))
        .pipe(gulp.dest(dest + '/css'));
}

gulp.task('less-concat-core-plugins', lessConcatCorePlugins);

var src = ['core/less/**/*.less'];
gulp.task('core-less', function () {
    return minifySrc(src, dest + '/core/css', pkg.name);
})

gulp.task('watch-core-less', function () {
    gulp.watch(src, ['core-less', 'concat-core-plugins']);
})



plugins.forEach(function (name) {
    var dir = 'plugins/' + name;
    var src = [dir + '/less/**/*.less']
    gulp.task('plugin-' + name + '-less', function () {
        minifySrc(src, dest + '/plugins/css', pkg.name + '-' + name);
    })

    gulp.task('watch-plugin-' + name + '-less', function () {
        gulp.watch(src, ['plugin-' + name + '-less', 'less-concat-core-plugins']);
    })
})

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
})



gulp.task('default', ['watch-js', 'watch-less', 'copy']);


// var tasks = plugins.map(function(name) { return 'watch-plugin-' + name + '-js'; });