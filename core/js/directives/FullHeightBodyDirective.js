(function () {
    'use strict';
    angular.module('ev-fdm')
        .directive('evFullHeightBody', function () {
            return {
                link: function($scope, $element, $attrs) {
                    $element.addClass('ev-full-height');

                    var header = $element.find('>.ev-full-height-body-header');
                    var body   = $element.find('>.ev-full-height-body');

                    var refreshDimensions = function() {
                        body.hide();
                        var bodyHeight = $element.innerHeight() - header.outerHeight(true);

                        body.show();
                        body.height(bodyHeight);

                        if ($attrs.refreshIdentifier) {
                            $scope.$broadcast('evFullHeightBody::refresh::' + $attrs.refreshIdentifier);
                        }
                    };


                    $scope.$watch(function() {
                        return $element.height() + header.outerHeight(true);
                    }, refreshDimensions);

                    $(window).bind('resize', refreshDimensions);

                    if ($attrs.refreshOn) {
                        $scope.$on('evFullHeightBody::refresh::' + $attrs.refreshOn, refreshDimensions);
                    }

                }
            };
        });
}) ();
