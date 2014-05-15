
angular.module('demo.controllers')
    .filter('demoJson',  function($filter) {
        return function(obj) {
            return JSON.stringify(obj, null, 2);
        }
    })
    .controller('Tab3Controller', [ '$scope', 'DemoContextService', function($scope, demoContext) {

    $scope.context = demoContext;
}]);