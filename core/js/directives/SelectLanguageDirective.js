angular.module('ev-fdm')
    .provider('evSelectLanguage', function() {
        this.$get = function () {
            return {
                availableLang: this.availableLang || [],
                defaultLang: this.defaultLang
            };
        };

        this.setAvailableLang = function (availableLang) {
            this.availableLang = availableLang;
        };
        this.setDefaultLang =function (defaultLang) {
            this.defaultLang = defaultLang;
        };
    })
    .directive('evSelectLanguage', ['evSelectLanguage', function (cfg) {
        return {
            template:
                '<div class="ev-language-tabs">' +
                    '<div class="btn-group">' +
                        '<button class="btn btn-lg" ng-repeat="lang in availableLang"'+
                            'ng-class="{selected: selectedLang===lang}"' +
                            'ng-click="$parent.selectedLang=lang">' +
                            '<span class="ev-icons-flags" ng-class="\'icon-\' + lang"></span>' +
                        '</button>' +
                    '</div>' +
                '</div>',
            restrict: 'AE',
            scope: {
                selectedLang: '=lang'
            },
            link: function($scope) {
                $scope.availableLang = cfg.availableLang;
                if (!$scope.selectedLang) {
                    $scope.selectedLang = cfg.defaultLang;
                }
            }
        };
    }]);
