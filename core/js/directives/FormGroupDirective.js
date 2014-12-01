var module = angular.module('ev-fdm')
.directive('evFormGroup', ['$parse', '$rootScope', function($parse, $rootScope) {
    return {
        restrict: 'EA',
        scope: true,
        transclude: true,
        replace: true,
        template: '<div class="form-group" ng-transclude></div>',
        controller: function($scope, $element, $attrs) {
            this.toggleError = $element.toggleClass.bind($element, 'has-error');
        }
    };
}]);
