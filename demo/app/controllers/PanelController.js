
angular.module('demo')
    .controller('PanelController', [ '$scope', '$instance', 'DemoDataFactory', 'PanelService', 'NotificationsService', 'item', 'cols', function($scope, $instance, demoData, panelService, notificationsService, item, itemCols) {

    $scope.context = {
        active: null
    };
    $scope.$instance = $instance;

    if (item) {
        $scope.item = _({}).deepExtend(item);
        if (!item.subitems) {
            item.subitems = new demoData(3 + Math.random() * 5, 3);
        }
        $scope.data = item.subitems;
        $scope.itemCols = itemCols;
    } else {
        $scope.data = new demoData(20, 3);
    }

    $instance.addBlocker(function(silent) {
        if ($scope.context.blocked) {
            notificationsService.add({
                type: notificationsService.type.WARN,
                text: 'Please uncheck that checkbox :-)'
            });
            return true;
        }
        return false;
    });

    $scope.$watch('context.active', function(newI, oldI) {
        if (!$scope.context.active) {
            panelService.dismissChildren($instance);
        } else if ($scope.context.active != oldI) {
            var panel = panelService.open('right', {
                controller: 'PanelController',
                templateUrl: 'demopanel.phtml',
                pushFrom: $instance,
                resolve: {
                    item: function() {
                        return $scope.context.active;
                    },
                    cols: function() {
                        return $scope.data.cols;
                    }
                }
            });
            // it is a good practice to check that panel was created
            // because some subpanel might have cancelled it
            if (panel) {
                panel.result.then(function(newItem) {
                    _($scope.context.active).deepExtend(newItem);
                }).finally(function() {
                    $scope.context.active = null;
                });
            }
        }
    });
}]);;;