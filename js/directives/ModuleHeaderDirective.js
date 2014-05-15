'use strict';

angular.module('common.directives')
.directive('evModuleHeader', function ($timeout) {

    var self = this;

    function _sync($wrapper) {
        var $header = $wrapper.find('.lisette-module-header');

        // make sure the wrapper spans the right height
        // even when the header is position fixed
        $wrapper.height($header.height() - 1);

        // declaring affix to bootstrap
        // bs will watch the scroll for us and add the affix css class to $header
        $header.affix({
            offset: {
                top: 1 //$('#lisette-menu').attr('data-offset-top')
            }
        });
    }

    return function($scope, element, attrs) {
        var $wrapper = $(element);
        $timeout(function() {
            _sync($wrapper);
        }, 0, false);
        $(window).on('resize', function() {
            _sync($wrapper);
        });
        $scope.$on('itemsLoaded', function() {
            _sync($wrapper);
        });
    }
});