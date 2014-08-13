(function () {
    'use strict';
    angular.module('ev-fdm')
        .directive('evFixedHeader', function () {
            return {
                link: function($scope, $element, $attrs) {
                    $element.addClass('ev-full-height');
                    var header = $element.find('>.ev-header');
                    var body   = $element.find('>.ev-body');
                    body.css({'overflow-y': 'auto'});

                    // Compute and return the height available for the element's body
                    var getBodyHeight = function() {
                        var bodyHeight = $element.innerHeight() - header.outerHeight(true);
                        // This allows us to remove the padding/etc.. from the measurement
                        bodyHeight -= body.innerHeight() - body.height();

                        return bodyHeight;
                    };

                    var refreshDimensions = function() {
                        body.hide();
                        body.height(getBodyHeight());
                        body.show();

                        if ($attrs.refreshIdentifier) {
                            $scope.$broadcast('evFullHeightBody::refresh::' + $attrs.refreshIdentifier);
                        }
                    };


                    $scope.$watch(function() {
                        return getBodyHeight();
                    }, refreshDimensions);

                    $(window).bind('resize', refreshDimensions);

                    if ($attrs.refreshOn) {
                        $scope.$on('evFullHeightBody::refresh::' + $attrs.refreshOn, refreshDimensions);
                    }

                }
            };
        });
}) ();
