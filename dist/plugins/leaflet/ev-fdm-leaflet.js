angular.module('ev-leaflet', ['leaflet-directive'])
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
                        focus: true
                    }
                };
                centerOnMarker();

                // Double binding between coordinate and marker's position
                $scope.$watch('coordinate.latitude', function (lat) {
                    $scope.markers.marker.lat = $scope.coordinate.latitude;
                    centerOnMarker();
                });

                $scope.$watch('coordinate.longitude', function (lng) {
                    $scope.markers.marker.lng = $scope.coordinate.longitude;
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
