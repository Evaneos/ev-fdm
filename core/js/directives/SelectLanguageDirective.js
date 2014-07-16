angular.module('ev-fdm')
    .provider('evSelectLanguage', function() {
        this.$get =function () {
            return {languages: this.languages || []};
        };

        this.setLanguages =function (languages) {
            this.languages = languages;
        };
    })
    .directive('evSelectLanguage', ['evSelectLanguage', function (cfg) {
        return {
            template:
                '<div class="ev-language-tabs">' +
                    '<div class="btn-group">' +
                        '<button class="btn" ng-repeat="lang in languages" ng-class="{active: selectedLang===lang}"' +
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
                $scope.languages = cfg.languages;
            }
        };
    }]);
