(function () {
    'use strict';
        // update popover template for binding unsafe html
    angular.module("template/popover/popover.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("template/popover/popover.html",
          "<div class=\"popover {{placement}}\" ng-class=\"{ in: isOpen(), fade: animation() }\">\n" +
          "  <div class=\"arrow\"></div>\n" +
          "\n" +
          "  <div class=\"popover-inner\">\n" +
          "      <h3 class=\"popover-title\" ng-bind-html=\"title\" ng-show=\"title\"></h3>\n" +
          "      <div class=\"popover-content\"ng-bind-html=\"content\"></div>\n" +
          "  </div>\n" +
          "</div>\n" +
          "");
    }]);
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
                        if (showTimeout) {$timeout.cancel(showTimeout);}
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
