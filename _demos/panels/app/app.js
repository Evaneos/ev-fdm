// global angular
(function (angular) {
'use strict';
angular.module('demo', ['ev-fdm'])
    .run(function (PanelService) {
        // Open panel for the first demo
        PanelService.open({
            name: 'ResponsivePanel1',
            templateUrl: 'responsive-panel.html',
        }, 'responsive-example');
        PanelService.open({
            name: 'ResponsivePanel2',
            templateUrl: 'responsive-panel.html',
        }, 'responsive-example');
    })

    .run(function (PanelService) {
        PanelService.open({
            name: 'stacked-panel-1',
            templateUrl: 'stacked-panel.html',
        }, 'stacked-example');
        PanelService.open({
            name: 'stacked-panel-2',
            templateUrl: 'stacked-panel.html',
        }, 'stacked-example');
        PanelService.open({
            name: 'stacked-panel-3',
            templateUrl: 'stacked-panel.html',
        }, 'stacked-example');
    })

    .run(function (PanelService) {
        PanelService.open({
            name: 'fixed-header-panel-1',
            templateUrl: 'fixed-header-panel.html',
        }, 'fixed-header-example');        
        PanelService.open({
            name: 'fixed-header-panel-2',
            templateUrl: 'fixed-header-panel.html',
        }, 'fixed-header-example');
    })

    .controller('introController', function (PanelService, $scope) {
        PanelService.open({
            name: 'intro-panel-1',
            templateUrl: 'intro-panel-1.html',
        });
    });

})(angular);
