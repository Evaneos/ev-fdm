/*
    responsive-viewport
    ===================

    I'm a directive that place the proper class responsive class dependanding on the size of the element I'm attached.

*/

"use strict";
angular.module('ev-fdm')
    .provider('evResponsiveViewport', function () {
        var breakpoints = {
            300: 'ev-viewport-xs',
            450: 'ev-viewport-sm',
            700: 'ev-viewport-md'
        };
        this.$get =function () {
            return breakpoints;
        };

        this.setXsBreakpoint = function (breakpoint) {
            breakpoints[breakpoint] = 'ev-viewport-xs';
        };

        this.setSmBreakpoint = function (breakpoint) {
            breakpoints[breakpoint] = 'ev-viewport-sm';
        };

        this.setMdBreakpoint = function (breakpoint) {
            breakpoints[breakpoint] = 'ev-viewport-md';
        };

        this.setBreakpoints = function (breaks) {
            if (breaks.length !== 3) {
                throw new Error('There should be three breakpoints');
            }
            breaks.sort();
            breakpoints[breaks[0]] = 'ev-viewport-xs';
            breakpoints[breaks[1]] = 'ev-viewport-sm';
            breakpoints[breaks[2]] = 'ev-viewport-md';
        };
    })
    .directive('evResponsiveViewport', ['evResponsiveViewport', function (breakpoints) {
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
                        _class = 'ev-viewport-lg';
                    }

                    if (!elm.hasClass(_class)) {
                        Object.keys(breakpoints).forEach(function (key) {
                                elm.removeClass(breakpoints[key]);
                            });
                        elm.removeClass('ev-viewport-lg');
                        elm.addClass(_class);
                    }
                };

                updateViewport();
                scope.$on('module-layout-changed', updateViewport);
            }
        };
    }]);
