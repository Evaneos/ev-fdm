var module = angular.module('ev-fdm')
.directive('evErrorMessage', function () {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            input: '=',
            error: '@'
        },
        template: '<li ng-show="input[\'evHasError\'] && input.$error[error]"><div ng-transclude></div></li>'
    };
});
