(function () {
    'use strict';
    angular.module('ev-fdm')
        .directive('evFixedHeader', function () {
            return {
                link: function($scope, $element, $attrs) {

                    var header = $element.find('>.ev-header');
                    var body   = $element.find('>.ev-body');
                    body.css({'overflow-y': 'auto'});
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
