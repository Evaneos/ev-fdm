
angular.module('demo')
    .controller('GridController', [ '$scope', 'DemoDataFactory', 'DemoContextService', function($scope, demoData, context) {

    $scope.context = context;

    var demoData = new demoData(30, 6);
    $scope.data = demoData;

    $scope.addRow = function() {
        demoData.addRow();
        if (context.grid.sort.by) {
            demoData.sort(context.grid.sort);
        }
    }

    $scope.sort = function() {
        demoData.sort(context.grid.sort);
    }
}]);