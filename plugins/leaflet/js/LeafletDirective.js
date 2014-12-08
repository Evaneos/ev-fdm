angular.module('ev-leaflet', ['leaflet-directive'])
    .provider('evLeaflet', function() {
        this.$get =function () {
            return {icons: this.icons};
        };

        this.setIcons =function (icons) {
            this.icons = icons;
        };
    })
    .directive('evLeaflet', ['leafletData', 'evLeaflet', '$log', function (leafletData, evLeaflet, $log) {
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
                    angular.extend(angular.copy(baseIcon), icons.default);
                }
                if ('draggable' in icons) {
                    angular.extend(angular.copy(baseIcon), icons.draggable);
                }


                $scope.defaults = {
                    scrollWheelZoom: false,
                    doubleClickZoom: false
                };

                // Setting a marker in location
                $scope.markers = {
                    marker: {
                        focus: true
                    }
                };
                centerOnMarker();

                // Double binding between coordinate and marker's position
                $scope.$watch('coordinate.latitude', function (lat) {
                    if(isNaN(lat)) {
                        lat = 0;
                        $log.warn('ev-leaflet: latitude is not a number');
                    }
                    $scope.markers.marker.lat = lat;
                    centerOnMarker();
                });

                $scope.$watch('coordinate.longitude', function (lng) {
                    if(isNaN(lng)) {
                        lng = 0;
                        $log.warn('ev-leaflet: longitude is not a number');
                    }
                    $scope.markers.marker.lng = lng;
                    centerOnMarker();
                });

                $scope.$watch('markers.marker.lat', function (lat) {
                    $scope.coordinate.latitude = lat;
                });

                $scope.$watch('markers.marker.lng', function (lng) {
                    $scope.coordinate.longitude = lng;
                });

                // Setting map center
                function centerOnMarker() {
                    $scope.center = {
                        lat: $scope.markers.marker.lat,
                        lng: $scope.markers.marker.lng,
                        zoom: 8
                    };
                }

                $scope.$watch('editable', function () {
                    var edited = $scope.editable;
                    $scope.markers.marker.icon = edited ? icons.draggable : icons['default'];
                    $scope.markers.marker.draggable = edited;
                });
            }
        };
    }]);
