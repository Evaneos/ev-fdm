/* jshint node: true */
"use strict";

var gulp = require('gulp');
var less = require('gulp-less');
var concat = require('gulp-concat');
var watch = require('gulp-watch');
var exec = require('child_process').exec;
var dest = 'docs';
var bowerDirectory = './bower_components';
var nodeModuleDirectory = './node_modules';

var bowerDependancies = [
    'jquery/jquery.js',
    'underscore/underscore.js',
    'select2/select2.js',
    'angular/angular.js',
    'angular-animate/angular-animate.js',
    'angular-loading-bar/src/loading-bar.js',
    'angular-bootstrap/ui-bootstrap-tpls.min.js',
    'angular-ui-date/src/date.js',
    'restangular/dist/restangular.min.js',
    'moment/moment.js',
    'angular-moment/angular-moment.min.js',
    'angular-ui-select2/src/select2.js',
    'angular-ui-router/release/angular-ui-router.min.js',
    'jquery-ui/ui/jquery.ui.core.js',
    'jquery-ui/ui/jquery.ui.datepicker.js',
    'jquery-ui/ui/i18n/jquery.ui.datepicker-fr.js',
    'jquery-ui/ui/minified/jquery-ui.min.js',
    'checklist-model/checklist-model.js',
    'dropzone/downloads/dropzone.js',
    'ev-fdm/dist/ev-fdm.js'
].map(function (path) {
    return bowerDirectory + '/' + path;
});

// ///////////////////////////////////////////////////
// LESS
// //////////////////////////////////////////////////

var src = ['less/main.less'];
gulp.task('less', function() {
    return gulp.src(src)
    .pipe(less())
    .pipe(gulp.dest(dest + '/css'))
    .on('error', console.error.bind(console));
});

gulp.task('watch-less', function () {
    gulp.watch(['less/**/*.less'], ['less']);
});


// ///////////////////////////////////////////////////
// COPY
// //////////////////////////////////////////////////


gulp.task('copy', function() {
    gulp.src([bowerDirectory + '/ev-fdm/dist/fonts/**/*'])
        .pipe(gulp.dest(dest + '/fonts/'));
    gulp.src([bowerDirectory + '/ev-fdm/dist/images/**/*'])
        .pipe(gulp.dest(dest + '/images/'));
    gulp.src([bowerDirectory + '/ev-fdm/dist/css/**/*'])
        .pipe(gulp.dest(dest + '/css/'));
    gulp.src([nodeModuleDirectory + '/kss/lib/template/public/kss.js'])
        .pipe(gulp.dest(dest + '/js/'));
});
gulp.task('watch-copy', function () {
    watch( bowerDirectory + '/ev-fdm/dist/**/*', function(stream, done) {
        // wait for all the watch to trigger
        setTimeout(function() {
            gulp.start('copy');
            done();
        }, 500);

    });
});


// ///////////////////////////////////////////////////
// CONCAT
// //////////////////////////////////////////////////
gulp.task('concat', function () {
    return gulp.src(bowerDependancies)
        .pipe(concat('bower_dependancies.js'))
        .pipe(gulp.dest(dest + '/js'))
        .on('error', console.error.bind(console));
});

gulp.task('watch-concat', function () {
    gulp.watch( [bowerDirectory], ['concat']);
});



// ///////////////////////////////////////////////////
// KSS STYLEGUIDE GENERATION
// //////////////////////////////////////////////////
gulp.task('kss', function (cb) {
    exec('./node_modules/kss/bin/kss-node '+ bowerDirectory + '/ev-fdm/core/less/ docs/_demos/styleguide/' +
        ' -t kss-template/', function (err, stdout, stderr) {
        console.log(stderr);
        cb(err);
    });
});

gulp.task('watch-kss', function () {
    gulp.watch( [bowerDirectory + '/ev-fdm/core/less/**/*.less'], ['kss']);
});


gulp.task('build', ['less', 'copy', 'concat', 'kss']);
gulp.task('watch', ['build', 'watch-copy', 'watch-less', 'watch-concat', 'watch-kss']);
gulp.task('default', ['build']);
