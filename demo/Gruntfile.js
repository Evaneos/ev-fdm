module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-less');

  grunt.initConfig({
    less: {
        options: {
                paths: [
                    'bower_components'
                ]
        },
        demo: {
            options: {
                compress: true
            },
            src: "less/demo.less",
            dest: "dist/demo.min.css"
        }
    },
  });

  grunt.registerTask('default', ['less:demo']);
};