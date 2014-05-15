'use strict';

var module = angular.module('common.directives');

module.directive('evFilters', function() {
    return {
        restrict: 'E',
        replace: true,
        transclude: true,
        templateUrl: 'filters.phtml'
    };
});