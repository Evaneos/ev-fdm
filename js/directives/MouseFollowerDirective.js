'use strict';

angular.module('common.directives')
    .directive('mouseFollower', ['$document', function ($document) {
        return {
            restrict: 'A',
            link : function (scope, element, attr){
                element = angular.element(element);
                element.css('position', 'absolute');
                element.css('z-index', 1500);

                $document.on('mousemove', function(evt) {
                    element.css({
                        left:  evt.pageX,
                        top:   evt.pageY
                    });
                });
            }
        }
    }]);