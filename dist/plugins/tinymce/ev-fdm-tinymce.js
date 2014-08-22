angular.module('ev-tinymce', ['ui.tinymce'])
    .directive('evTinymce', [function () {
        return {
            template: '<textarea ui-tinymce="tinymceFinalOptions"></textarea>',
            restrict: 'AE',
            replace: true,
            controller: ['$scope', function($scope) {
                var defaultOptions = {
                    menubar: false,
                    statusbar: false,
                    resize: false,
                    toolbar: 'bold italic underline | alignleft aligncenter alignright | bullist',
                    'content_css': '/bower_components/ev-fdm/dist/css/ev-fdm.min.css',
                    skin: false,
                    'verify_html': true,
                    'convert_fonts_to_spans': true,

                    // We choose to have a restrictive approach here.
                    // The aim is to output the cleanest html possible.
                    // See http://www.tinymce.com/wiki.php/Configuration:valid_elements
                    // 'valid_elements':
                    //     'strong,em' +
                    //     'span[!style<text-decoration: underline;],' +
                    //     '@[style<text-align: right;?text-align: left;?text-align: center;],' +
                        // 'p,!div,ul,li'
                };
                $scope.tinymceFinalOptions = angular.extend({}, defaultOptions, $scope.tinymceOptions);
            }]
        };
    }]);
