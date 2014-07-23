(function () {
    'use strict';
    angular.module('ev-fdm')
        .directive('popover', ['$timeout', function ($timeout) {
        	return {
        		restrict: 'A',
				link: function ($scope, elem, attrs) {
                    var showTimeout;
                    elem.bind('focus', function () {
                        elem.triggerHandler('focus-not-typing');
                    });
					elem.bind('blur', function () {
                        elem.triggerHandler('blur-or-typing');
                    });
                    elem.bind('keypress', function () {
                        if (showTimeout) {$timeout.cancel(showTimeout);}
                        elem.triggerHandler('blur-or-typing');
                        showTimeout = $timeout(function () {
                            elem.triggerHandler('focus-not-typing');
                        }, 1000);
                    });
				}
        	};
        }]);
}) ();
