var module = angular.module('ev-fdm')
.directive('evErrors', function () {
    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        template: '<ul class="errors text-danger" ng-transclude></ul>'
    };
});
