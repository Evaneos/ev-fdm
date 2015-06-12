angular.module('ev-fdm').factory('confirmBox', [
    '$modal',
    function($modal) {
        return function(title, message, positive, negative) {
            return $modal.open({
                backdrop: 'static',
                templateUrl: 'ev-confirm-box.html',
                controller: ['$scope', function($scope) {
                    $scope.title    = title;
                    $scope.message  = message;
                    $scope.positive = positive;
                    $scope.negative = negative;
                }]
            }).result;
        };
    }
]);
