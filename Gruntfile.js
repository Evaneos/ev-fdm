module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    dist_dir: 'dist',
    components_dir: 'bower_components',
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['js/app.js', 'js/**/*.js'],
        dest: '<%= dist_dir %>/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          '<%= dist_dir %>/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },
    copy: {
        'jquery-ui': {
            expand: true,
            cwd: '<%= components_dir %>/jquery-ui/themes/smoothness/images',
            src: '**',
            dest: '<%= dist_dir %>/images/'
        },
        'bootstrap': {
            expand: true,
            cwd: '<%= components_dir %>/bootstrap/fonts',
            src: '**',
            dest: '<%= dist_dir %>/fonts/'
        },
        'fonts': {
            expand: true,
            cwd: 'fonts',
            src: '**',
            dest: '<%= dist_dir %>/fonts/'
        }
    },
    less: {
        options: {
                paths: [
                    'less',
                    // '<%= components_dir %>',
                    'bower_components'
                ]
        },
        production: {
            options: {
                compress: true
            },
            src: "less/generators/production.less",
            dest: "<%= dist_dir %>/ev-fdm.min.css"
        },
        vendors: {
            options: {
                outputSourceFiles: true,
                sourceMap: true,
                sourceMapFilename: '<%= dist_dir %>/vendors.css.map',
                sourceMapURL: '<%= dist_dir %>/vendors.css.map'
            },
            src: 'less/vendors.less',
            dest: '<%= dist_dir %>/vendors.css'
        }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('js', ['concat', 'uglify']);
  grunt.registerTask('css', ['less:production', 'less:vendors']);

  grunt.registerTask('default', ['copy', 'js', 'css']);

};