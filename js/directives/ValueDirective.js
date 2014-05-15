'use strict';

angular.module('ev-fdm')
    .directive('evValue', function ($document) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                value: '=',
                noValue: '@',
            },
            templateUrl: 'value.phtml'
        };
    });