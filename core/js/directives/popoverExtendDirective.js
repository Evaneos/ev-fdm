(function () {
    'use strict';
    angular.module('ev-fdm')
        .directive('popover', function () {
        	return {
        		restrict: 'A',
				link: function ($scope, elem, attrs) {
                    elem.bind('focus', function () {
                        elem.triggerHandler('focus-not-typing');
                    });
					elem.bind('blur', function () {
                        elem.triggerHandler('blur-or-typing');
                    });
                    elem.bind('keypress', function () {
                        elem.triggerHandler('blur-or-typing');
                    });
				}
        	};
        });
}) ();
