module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.initConfig({
    components_dir: 'bower_components',
    dist_dir: 'dist',
    less: {
        options: {
                paths: [
                    '<%= components_dir %>'
                ]
        },
        demo: {
            options: {
                compress: true
            },
            src: "less/demo.less",
            dest: "<%= dist_dir %>/css/demo.min.css"
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
            cwd: '<%= components_dir %>/ev-fdm/fonts',
            src: '**',
            dest: '<%= dist_dir %>/fonts/'
        }
    },
  });

  grunt.registerTask('default', ['less:demo', 'copy']);
};