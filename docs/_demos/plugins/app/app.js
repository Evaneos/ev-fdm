'use strict';


angular.module('demo', ['ev-fdm', 'ev-leaflet', 'ev-tinymce', 'ev-upload'])
	.config(['evLeafletProvider', function(evLeafletProvider) {
    evLeafletProvider
        .setIcons({
            default: { iconUrl: '/bower_components/ev-fdm/dist/images/leaflet/lecture.png', shadowUrl: '/bower_components/ev-fdm/dist/images/leaflet/blank.png'},
            draggable: { iconUrl: '/bower_components/ev-fdm/dist/images/leaflet/edition.png', shadowUrl: '/bower_components/ev-fdm/dist/images/leaflet/blank.png'}
        });
	}])
	.filter('i18n', function () {
		return function (input) {
			return input;
		};
	})
	.controller('demo', function ($scope) {
		$scope.pictures = [];
		$scope.uploadUrl = "http://uploads.im/api?upload";
		// Tinymce
        $scope.demoText = 'Lorem. (etc).';
	});


