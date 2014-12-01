var module = angular.module('ev-fdm')
.directive('evErrorMessage', function () {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            input: '=',
            error: '@'
        },
        template: '<li ng-if="input[\'evHasError\'] && input.$error[error]" ng-transclude></li>',
    };
});
