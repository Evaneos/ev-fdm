// global angular
(function (angular) {
'use strict';
angular.module('demo', ['ev-fdm'])
	.directive('responsiveDemo', function () {
		return {
			template:
				"<div>" +
				"	<p>" +
				"		<button class=\"btn btn-default\" type=\"button\" " +
				"			ng-click=\"containerSize='xs'\" "+
				"			ng-class=\"{ active: containerSize === 'xs' }\"> xs </button>" +
				"		<button class=\"btn btn-default\" type=\"button\" " +
				"			ng-click=\"containerSize='sm'\" "+
				"			ng-class=\"{ active: containerSize === 'sm' }\"> sm </button>" +
				"		<button class=\"btn btn-default\" type=\"button\" " +
				"			ng-click=\"containerSize='md'\" "+
				"			ng-class=\"{ active: containerSize === 'md' }\"> md </button>" +
				"		<button class=\"btn btn-default\" type=\"button\" " +
				"			ng-click=\"containerSize='lg'\" "+
				"			ng-class=\"{ active: containerSize === 'lg' }\"> lg </button>" +
				"	</p>" +
				"	<div class=\"well demo-ev-size\" ng-class=\"'ev-viewport-' + containerSize\" ng-transclude></div>" +
				"</div>",
			transclude: true,
			scope: true,
			link: function linkGridDemo(scope, elem, attrs) {
				scope.containerSize = (attrs.containerSize) ? attrs.containerSize : "md";
			}
		};
	})

	.directive('resizable', function() {
		return {
			template:
    			"<h4> Change the width to <input type=number ng-model=\"width\"></input></h4>" +
        		"<p> The associated viewport class is <code>{{viewport}}</code></p>" +
    			"<div ng-transclude></div>",
    		transclude: true,
    		scope: true,
			link: function($scope, $element, $attrs) {
				$scope.width = $element.width();
				$scope.$watch('width', function (newWidth) {
					$element.width(newWidth);
					$scope.$emit('module-layout-changed');
					$scope.viewport = $element.attr('class').split(" ").filter(function(_class) {
						return _class.indexOf('ev-viewport') === 0;
					})[0];
				});
			}
		};
	});
})(angular);
