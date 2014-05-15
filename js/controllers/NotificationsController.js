'use strict';

var NotificationsController = ['$scope', 'NotificationsService', function($scope, NotificationsService) {
    $scope.notifications = NotificationsService.list;
    
    $scope.$watch(function() {
        return NotificationsService.activeNotification;
    }, function() {
        $scope.activeNotification = NotificationsService.activeNotification;
    });
    
    $scope.getClass = function (notification){
        if (!notification) return '';
        switch (notification.type){
            case NotificationsService.type.ERROR:
                return 'danger';
            case NotificationsService.type.SUCCESS:
                return 'success';
            case NotificationsService.type.WARNING:
                return 'warning';
            case NotificationsService.type.INFO:
                return 'info';
            default:
                return 'success';
        }
    };

    $scope.remove = function(notification) {
        NotificationsService.remove(notification);
    };
}];

angular.module('ev-fdm')
    .controller('NotificationsController', NotificationsController);