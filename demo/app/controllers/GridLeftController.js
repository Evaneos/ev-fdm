
angular.module('demo')
    .controller('GridLeftController', [ '$scope', 'DemoContextService', function($scope, context) {

    $scope.context = context;

}]);