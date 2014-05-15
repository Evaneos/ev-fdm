'use strict';

angular.module('common.directives')
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