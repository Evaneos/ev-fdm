'use strict';

var module = angular.module('ev-fdm');

module.directive('evFilters', function() {
    return {
        restrict: 'E',
        replace: true,
        transclude: true,
        templateUrl: 'filters.phtml'
    };
});