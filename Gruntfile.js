module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['js.app.js', 'js/**/*.js'],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },
    less: {
        options: {
                paths: [
                    'less',
                    '.'
                ]
        },
        production: {
            options: {
                compress: true
            },
            src: "less/generators/production.less",
            dest: "dist/ev-fdm.min.css"
        },
        // vendors: {
        //     options: {
        //         outputSourceFiles: true,
        //         sourceMap: true,
        //         sourceMapFilename: 'dist/vendors.css.map',
        //         sourceMapURL: 'dist/vendors.css.map'
        //     },
        //     src: 'less/vendors.less',
        //     dest: 'dist/vendors.css'
        // }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('js', ['concat', 'uglify']);
  grunt.registerTask('css', [/*'less:development',*/ 'less:production' /*, 'less:vendors'*/]);

  grunt.registerTask('default', ['js', 'uglify']);

};