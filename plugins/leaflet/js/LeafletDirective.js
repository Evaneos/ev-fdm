angular.module('ev-fdm')
    .provider('evLeaflet', function() {
        this.$get =function () {
            return {icons: this.icons};
        };

        this.setIcons =function (icons) {
            this.icons = icons;
        };
    })
    .directive('evLeaflet', ['leafletData', 'evLeaflet', function (leafletData, evLeaflet) {
        return {
            template: '<leaflet class="ev-leaflet" defaults="defaults" markers="markers" center="center"></leaflet>',
            restrict: 'AE',
            scope: {
                coordinate: '=',
                editable: '='
            },
            controller:function ($scope) {

                // Icons settings
                var baseIcon = {
                    iconSize:   [40, 40],
                    shadowSize: [1, 1],
                    iconAnchor: [1, 20]
                };

                var icons = evLeaflet.icons;

                if ('default' in icons) {
                    angular.extend(icons.default, baseIcon);
                }
                if ('draggable' in icons) {
                    angular.extend(icons.draggable, baseIcon);
                }


                $scope.defaults = {
                    scrollWheelZoom: false,
                    doubleClickZoom: false
                };

                // Setting a marker in location
                $scope.markers = {
                    marker: {
                        lat: $scope.coordinate.latitude,
                        lng: $scope.coordinate.longitude,
                        focus: true
                    }
                };

                // Setting map center
                $scope.center = {
                    lat: $scope.coordinate.latitude,
                    lng: $scope.coordinate.longitude,
                    zoom: 8
                };

                $scope.$watch('editable', function () {
                    var edited = $scope.editable;
                    $scope.markers.marker.icon = edited ? icons.draggable : icons['default'];
                    $scope.markers.marker.draggable = edited;
                });

                // // // Leaflet fix for conflict with ui-view
                // $scope.$watch("showMap", function (value) {
                //     if (value === true) {
                //         leafletData.getMap().then(function (map) {
                //             map.invalidateSize();
                //         });
                //     }
                // });
            }
        };
    }]);