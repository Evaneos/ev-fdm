/*
    responsive-viewport
    ===================

    I'm a directive that place the proper class responsive class dependanding on the size of the element I'm attached.

*/

"use strict";
angular.module('ev-fdm')
    .directive('responsiveViewport', function () {
        var breakpoints = {
            480: 'ev-viewport-xs',
            880: 'ev-viewport-sm',
            1100: 'ev-viewport-md'
        };
        return {
            link: function (scope, elm) {
                var updateViewport = function () {
                    var elmWidth = elm.width();
                    var _class;

                    var largeViewport = !Object.keys(breakpoints).some(function (breakpoint) {
                        _class = breakpoints[breakpoint];
                        return elmWidth < breakpoint;
                    });
                    if (largeViewport) {
                        _class = 'viewport-lg';
                    }

                    if (!elm.hasClass(_class)) {
                        Object.keys(breakpoints).forEach(function (key) {
                            elm.removeClass(breakpoints[key]);
                        });
                        elm.addClass(_class);
                    }
                };

                updateViewport();
                scope.$on('module-layout-changed', updateViewport);
            }
        };
    });
