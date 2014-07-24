angular.module('ev-tinymce')
    .directive('evTinymce', [function () {
        return {
            template: '<textarea ui-tinymce="options" ng-model="model"></textarea>',
            restrict: 'AE',
            require: '^ngModel',
            scope: {
                options: '=',
                model: '=ngModel'
            },
            controller: function ($scope) {
                var options = {
                    menubar: false,
                    statusbar: false,
                    resize: false,
                    toolbar: 'bold italic underline | alignleft aligncenter alignright | bullist',
                    theme: 'modern',
                    theme_advanced_toolbar_location : 'bottom'
                }

                console.log($scope.options);

                if (undefined !== $scope.options) {
                    angular.extend(options, $scope.options);
                }

                $scope.options = options;

                console.log($scope.options);
            }
        };
    }]);
