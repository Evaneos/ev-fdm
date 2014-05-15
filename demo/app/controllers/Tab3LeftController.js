
angular.module('demo')
    .controller('Tab3LeftController', [ '$scope', 'NotificationsService', 'DemoContextService', function($scope, notificationsService, demoContext) {

    $scope.context = demoContext;
    
    $scope.onSearch = function() {
        notificationsService.add({
            text: 'Search: ' + JSON.stringify(demoContext.selectedFilters, undefined, 0),
            type: notificationsService.type.INFO
        });
    }
}]);