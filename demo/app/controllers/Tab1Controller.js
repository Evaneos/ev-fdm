
angular.module('demo')
    .controller('Tab1Controller', ['$scope', 'SidonieModalService', 'PanelService', 'NotificationsService', function($scope, sidonieModalService, panelService, notificationsService) {

    this.test = function() {
        alert('test');
    }

    $scope.openMiddlePanel = function(panelClass) {
        panelService.open('middle', {
            templateUrl: 'modal.phtml',
            panelClass: panelClass ? panelClass : ''
        });
    }

    $scope.openRightPanel = function(push, panelClass) {
        panelService.open('right', {
            templateUrl: 'demopanel.phtml',
            push: push === true,
            controller: 'PanelController',
            panelClass: panelClass ? panelClass : '',
            resolve: {
                item: false,
                cols: false
            }
        });
    }

    $scope.notify = function(type) {
        notificationsService.add({
            type: type,
            text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
            delay: type == notificationsService.type.ERROR ? -1 : 0
        });
    }
}]);