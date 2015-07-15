/* jshint node: true */
"use strict";
var gulpPackagejson = require('./node_modules/gulp/package.json');
if (gulpPackagejson.version.split('.')[1] !== '9') {
    throw new Error('Please update your node modules (npm install)');
}


var gulp = require('gulp');
var less = require('gulp-less');
var concat = require('gulp-concat');
var insert = require('gulp-insert');
var uglify = require('gulp-uglify');
var csso = require('gulp-csso');
var sourcemaps = require('gulp-sourcemaps');
var rename = require('gulp-rename');
var jshint = require('gulp-jshint');
var iconfont = require('gulp-iconfont');
var consolidate = require('gulp-consolidate');
// Post CSS
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer-core');

var changed = require('gulp-changed');

var pkg = require('./package.json');
var fs = require('fs');

var bowerrc;
try {
    bowerrc = require('./.bowerrc.json');
} catch (e) {
    bowerrc = {};
}
var bowerDirectory =  (bowerrc.directory) ? bowerrc.directory : './bower_components';

var dest = 'dist';
var plugins = fs.readdirSync('plugins/').filter(function(name) {
    return fs.statSync('plugins/' + name).isDirectory();
});

var assets = ['images', 'fonts'];


function concatCorePlugins(src, suffix, customDest) {
    customDest = customDest || dest;
    return gulp.src(src)
        .pipe(sourcemaps.init({ loadMaps: true }))
            .pipe(concat(pkg.name + suffix))
        .pipe(sourcemaps.write('.', {
            addComment: true,
            includeContent: true,
        }))
        .pipe(gulp.dest(customDest));
}

// ///////////////////////////////////////////////////
// ICONS
// //////////////////////////////////////////////////
var icon = {
    name: 'evfdm-icon',
    path: './fonts/iconfont'
};
gulp.task('core-icon-font', function() {
    return gulp.src([ 'core/iconfont/*.svg' ]) //, { read: false }
    .pipe(iconfont({
        fontHeight: 900,
        normalize: true,
        fontName: icon.name,
        centerHorizontally: true,
    }))
    .on('codepoints', function(codepoints, options) {
        gulp.src('core/iconfont/template.less')
            .pipe(consolidate('lodash', {
                glyphs: codepoints,
                fontName: icon.name,
                fontPath: icon.path,
                version: Date.now()
            }))
            .pipe(rename('icon-compiled.less'))
            .pipe(gulp.dest('./core/less/icons/'));
    })
    .pipe(gulp.dest(icon.path));
});

// ///////////////////////////////////////////////////
// JS
// //////////////////////////////////////////////////


function minifyJs(src, dest, name) {
    return gulp.src(src)
        .pipe(sourcemaps.init({ loadMaps: true }))
            .pipe(concat(name + '.js'))
            .pipe(gulp.dest(dest))
            .pipe(uglify({
                banner: '/*! ' + name + ' ' + new Date().toJSON().split('T')[0] + ' */\n'
            }))
            .pipe(rename(name + '.min.js'))
        .pipe(sourcemaps.write('.', {
            addComment: true,
            includeContent: true,
        }))
        .pipe(gulp.dest(dest));
}


(function() {
    var src = ['core/js/app.js', 'core/js/**/*.js'];

    // Uglification
    gulp.task('core-js', function () {
        return minifyJs(src, dest + '/core', pkg.name + '-core');
    });
    // Watchers
    gulp.task('watch-core-js', function () {
        gulp.watch(src, ['core-js', 'js-concat-core-plugins']);
    });

    // Concatenation with plugins
    gulp.task('js-concat-core-plugins-min', function () {
        return concatCorePlugins([dest + '/**/*.min.js', '!' + dest + '/' +  pkg.name + '.min.js'], '.min.js');
    });
    gulp.task('js-concat-core-plugins-raw', function () {
        return concatCorePlugins([dest + '/**/*.js', '!' + dest + '/' +  pkg.name + '.js', '!**/*.min.js'], '.js');
    });
    gulp.task('js-concat-core-plugins', ['js-concat-core-plugins-min', 'js-concat-core-plugins-raw']);
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
        return minifyJs(src, dest + '/' + dir, pkg.name + '-' + name);
    });

    gulp.task('watch-plugin-' + name + '-js', function () {
        gulp.watch(src, ['plugin-' + name + '-js', 'js-concat-core-plugins']);
    });
});

var tasks = plugins.map(function(name) { return 'plugin-' + name + '-js'; });
tasks.unshift('core-js');

gulp.task('js-all', tasks, function () {
    return gulp.start('js-concat-core-plugins');
});

tasks = plugins.map(function(name) { return 'watch-plugin-' + name + '-js'; });
tasks.unshift('js-all', 'watch-core-js');
gulp.task('watch-js', tasks);


// ///////////////////////////////////////////////////
// LESS
// //////////////////////////////////////////////////

function minifyLess(src, base, paths, dest, name) {
    return gulp.src(src, { base: base })
        .pipe(sourcemaps.init({ loadMaps: true }))
            .pipe(less({
                paths: paths
            }))
            .pipe(postcss([autoprefixer({browsers: ['last 2 versions']})]))
            .pipe(csso())
            .pipe(rename(name + '.min.css'))
        .pipe(sourcemaps.write('.', {
            addComment: true,
            includeContent: true,
        }))
        .pipe(gulp.dest(dest));
}


function lessConcatCorePlugins() {
    return concatCorePlugins(
        [dest + '/**/*.min.css', '!' + dest +'/css/' +  pkg.name + '.min.css'],
        '.min.css',
        dest + '/css'
    );
}


(function() {
    var src = 'core/less/index.less';
    var paths = ['core/less', bowerDirectory];
    gulp.task('less-concat-core-plugins', lessConcatCorePlugins);
    gulp.task('core-less', ['core-icon-font'], function () {
        return minifyLess(src, 'core/less', paths, dest + '/core/css', pkg.name + '-core');
    });
    gulp.task('watch-core-less', function () {
        gulp.watch(['core/less/**/*.less', '!core/less/icons/icon-compiled.less'], ['core-less', 'less-concat-core-plugins']);
    });
})();

plugins.forEach(function(name) {
    var dir = 'plugins/' + name;
    var src = [dir + '/less/index.less'];
    var paths = [dir + '/less', bowerDirectory, 'core/less'];
    gulp.task('plugin-' + name + '-less', function () {
        return minifyLess(src, dir + '/less', paths, dest + '/' + dir + '/css', pkg.name + '-' + name);
    });

    gulp.task('watch-plugin-' + name + '-less', function () {
        gulp.watch([dir + '/less/**/*.less'], ['plugin-' + name + '-less', 'less-concat-core-plugins']);
    });
});

gulp.task('icon', function () {
    minifyLess(['core/less/common/icons.less'], 'core/less', [], dest + '/css', 'icons-standalone');
});

gulp.task('watch-icon', function () {
    gulp.watch(['core/less/common/icons.less'], ['icon']);
});

var tasks = plugins.map(function(name) { return 'plugin-' + name + '-less'; });
tasks.unshift('core-less');
tasks.unshift('icon');
gulp.task('less-all', tasks, lessConcatCorePlugins);



tasks = plugins.map(function(name) { return 'watch-plugin-' + name + '-less'; });
tasks.unshift('less-all', 'watch-core-less', 'watch-icon');
gulp.task('watch-less', tasks);

// ///////////////////////////////////////////////////
// VIEWS
// //////////////////////////////////////////////////

function concatViews(src, dest) {
    return gulp.src(src)
        .pipe(insert.wrap(function(file) {
            return '<script type="text/ng-template" id="' + file.relative + '">';
        }, '</script>'))
        .pipe(concat('ev-templates.html'))
        .pipe(gulp.dest(dest + '/views'));
}

gulp.task('core-views', function() {
    return concatViews(['core/views/**/*'], dest + '/core');
});

gulp.task('watch-core-views', function () {
    gulp.watch([
        'core/views/**/*'
    ], ['core-views']);
});

plugins.forEach(function(name) {
    var dir = 'plugins/' + name;
    var src = [dir + '/views/**/*'];
    gulp.task('plugin-' + name + '-views', function () {
        return concatViews(src, dest + '/' + dir);
    });

    gulp.task('watch-plugin-' + name + '-views', function () {
        gulp.watch([dir + '/views/**/*.html'], ['plugin-' + name + '-views']);
    });
});

var tasks = plugins.map(function(name) { return 'plugin-' + name + '-views'; });
tasks.unshift('core-views');
gulp.task('views-all', tasks);



tasks = plugins.map(function(name) { return 'watch-plugin-' + name + '-views'; });
tasks.unshift('views-all', 'watch-core-views');
gulp.task('watch-views', tasks);


// ///////////////////////////////////////////////////
// COPY
// //////////////////////////////////////////////////

gulp.task('core-copy', ['core-icon-font'], function() {
    gulp.src([
            bowerDirectory + '/bootstrap/fonts/*',
            'fonts/**/*',
        ])
        .pipe(changed(dest + '/fonts'))
        .pipe(gulp.dest(dest + '/fonts'));
    gulp.src([
            bowerDirectory + '/jquery-ui/themes/smoothness/images/*',
            'core/images/**/*'
        ])
        .pipe(changed(dest + '/images'))
        .pipe(gulp.dest(dest + '/images'));
});
gulp.task('watch-core-copy', function () {
    gulp.watch([
        bowerDirectory + '/jquery-ui/themes/smoothness/images/*',
        bowerDirectory + '/bootstrap/fonts/*',
        'fonts/**/*',
        'core/images/**/*',
    ], ['core-copy']);
});

plugins.forEach(function(name) {
    var dir = 'plugins/' + name;
    var src = assets.map(function (asset) {
        return dir + '/' + asset + '/**/*';
    });
    gulp.task('plugin-' + name + '-copy', function () {
        return gulp.src(src, {base: dir})
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


gulp.task('default', ['js-all', 'less-all', 'copy-all', 'views-all']);
gulp.task('watch', ['watch-copy', 'watch-less', 'watch-js', 'watch-views']);
