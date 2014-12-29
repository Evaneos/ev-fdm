
'use strict';

var app = angular.module('demo', ['ev-fdm'])

	.run(['$rootScope', function($rootScope) {
		$rootScope.RegExp = RegExp;
	}]);
