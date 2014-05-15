
angular.module('demo')
    .controller('Tab3Controller', [ '$scope', 'DemoContextService', function($scope, demoContext) {

    $scope.context = demoContext;
}]);