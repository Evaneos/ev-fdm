'use strict';

var module = angular.module('common.directives')
.directive('evFlag', function () {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            lang: '='
        },
        template: '<i class="icon icon-flag flag-{{lang}}"></i>'
    };
});