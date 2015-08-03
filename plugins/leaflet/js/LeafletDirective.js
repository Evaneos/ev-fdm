angular.module('ev-leaflet', ['leaflet-directive'])
    .provider('evLeaflet', function() {
        this.$get = function() {
            return {
                icons: this.icons,
                tiles: this.tiles
            };
        };

        this.setIcons = function(icons) {
            this.icons = icons;
        };

        this.setTiles = function(tiles) {
            this.tiles = tiles;
        };
    })
    .directive('evLeaflet', ['leafletData', 'evLeaflet', '$log', function (leafletData, evLeaflet, $log) {
        return {
            template: '<leaflet class="ev-leaflet" defaults="defaults" markers="markers" center="center" tiles="tiles" bounds="bounds"></leaflet>',
            restrict: 'AE',
            scope: {
                coordinates: '=',
                defaultCoordinates: '=?',
                boundingbox: '=?',
                editable: '='
            },
            controller: function($scope) {

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

                var tiles = evLeaflet.tiles;
                if (tiles) {
                    $scope.tiles = tiles;
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

                // Double binding between coordinates and marker's position
                $scope.$watch('coordinates.latitude', function(lat) {
                    if (isNaN(lat) || lat == null) { // simple == : null or undefined
                        if ($scope.defaultCoordinates && $scope.defaultCoordinates.latitude != null) {
                            lat = $scope.defaultCoordinates.latitude;
                        } else {
                            lat = 0;
                        }
                        $log.warn('ev-leaflet: latitude is not a number');
                    }
                    $scope.markers.marker.lat = lat;
                    centerOnMarkerOrBoungingbox();
                });

                $scope.$watch('coordinates.longitude', function(lng) {
                    if (isNaN(lng) || lng == null) { // simple == : null or undefined
                        if ($scope.defaultCoordinates && $scope.defaultCoordinates.longitude != null) {
                            lng = $scope.defaultCoordinates.longitude;
                        } else {
                            lng = 0;
                        }
                        $log.warn('ev-leaflet: longitude is not a number');
                    }
                    $scope.markers.marker.lng = lng;
                    centerOnMarkerOrBoungingbox();
                });

                centerOnMarkerOrBoungingbox();

                var previousBoundingbox = $scope.boundingbox;

                $scope.$watch('boundingbox', function(boundingbox) {
                    if (boundingbox && !angular.equals(boundingbox, previousBoundingbox)) {
                        previousBoundingbox = boundingbox;
                        centerOnMarkerOrBoungingbox();
                    }
                });

                $scope.$watch('markers.marker.lat', function(lat) {
                    if (lat != null && $scope.editable) {
                        $scope.coordinates.latitude = lat;
                    }
                });

                $scope.$watch('markers.marker.lng', function(lng) {
                    if (lng != null && $scope.editable) {
                        $scope.coordinates.longitude = lng;
                    }
                });

                // Setting map center
                function centerOnMarkerOrBoungingbox() {
                    if ($scope.boundingbox) {
                        $scope.bounds = {
                            southWest: {
                                lat: $scope.boundingbox.southLatitude,
                                lng: $scope.boundingbox.westLongitude,
                            },
                            northEast: {
                                lat: $scope.boundingbox.northLatitude,
                                lng: $scope.boundingbox.eastLongitude,
                            },
                        };
                        return;
                    }
                    if (!$scope.center) {
                        $scope.center = {
                            lat: $scope.markers.marker.lat,
                            lng: $scope.markers.marker.lng,
                            zoom: 8
                        };
                    } else {
                        $scope.center.lat = $scope.markers.marker.lat;
                        $scope.center.lng = $scope.markers.marker.lng;
                    }
                }

                $scope.$watch('editable', function () {
                    var edited = $scope.editable;
                    $scope.markers.marker.icon = edited ? icons.draggable : icons['default'];
                    $scope.markers.marker.draggable = edited;
                });
            }
        };
    }]);
