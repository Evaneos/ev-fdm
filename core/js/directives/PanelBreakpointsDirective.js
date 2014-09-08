'use strict';

var module = angular.module('ev-fdm');

module.directive('evPanelBreakpoints', [ '$timeout', '$rootScope', function($timeout, $rootScope) {

    var BREAKS = [ 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100 ];

    function getBPMatching(width) {
        var breakp, index;
        for (index = 0; index < BREAKS.length; index++) {
            if (width < BREAKS[index]) {
                breakp = BREAKS[index];
                break;
            }
        }
        if (breakp) return index;
        else return -1;
    }

    function applyBPAttribute(element, breakpIndex) {
        var attributeValue = '';
        if (breakpIndex == -1) {
            attributeValue = 'max';
        } else {
            attributeValue = BREAKS[breakpIndex];
        }
        element.attr('data-breakpoint', attributeValue);
    }

    function updateBreakpoints(element) {
        var bp = getBPMatching(element.outerWidth());
        applyBPAttribute(element, bp);
    }

    return {
        restrict: 'A',
        scope: false,
        replace: true,
        transclude: true,
        template: '<div class="panel-inner" ng-transclude></div>',
        link: function(scope, element, attrs) {
            /**
             * Listener to update the breakpoints properties
             */
            element.resizable({
                handles: "w",
                helper: "ui-resizable-helper",
                resize: function(event, ui) {
                    updateBreakpoints(element);
                }
            });
            $rootScope.$on('module-layout-changed', function() {
                updateBreakpoints(element);
            });
            $timeout(function() {
                updateBreakpoints(element);
                // focus a freshly-opened modal
                element[0].focus();
            });
        }
    };
}]);
