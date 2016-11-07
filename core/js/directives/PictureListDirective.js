/* global console */
angular.module('ev-fdm').directive('evPictureList', function() {
    return {
        restrict: 'EA',
        scope: {
          pictures: '=',
          editable: '=',
          onDelete: '&',
          onChange: '&',
          showUpdate: '=',
          language: '=',
          colNumber: '=',
          download: '=',
          onPictureDeleted: '&'
        },
        templateUrl: 'ev-picture-list.html',
        link: function($scope, elem, attrs) {
            $scope.pictures = $scope.pictures || [];

            // Number of columns for pictures
            var colNumber = $scope.colNumber || 2;
            // Convert it to bootstrap convention (12)
            $scope.colNumberBootstrap = 12 / colNumber;

            if (!attrs.onDelete) {
                $scope.onDelete = function(params) {
                    $scope.pictures.splice(params.index, 1);
                    $scope.onPictureDeleted();
                };
                $scope.onUpdate = function(params) {
                    // Not implemented yet
                    console.log(params);
                };
            }
        }
    };
});
