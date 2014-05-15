'use strict';
var app = angular.module('demo', [ 'ui.router', 'ev-fdm']);

app.config(['$stateProvider', '$urlRouterProvider', 'menuManagerProvider', 'menuManagerProvider', function($stateProvider, $urlRouterProvider, menuManagerProvider) {

    menuManagerProvider
        .addTab({
            name: '1. Modals, Notifs',
            state: 'tab1'
        })
        .addTab({
            name: '2. Grid features',
            state: 'tab2'
        })
        .addTab({
            name: '3. Filters',
            state: 'tab3'
        })
        .addTab({
            name: '4. Resolved',
            state: 'tab4'
        })
        .addTab({
            name: '5. Rejected',
            state: 'tab5'
        });

    $stateProvider
        .state('tab1', {
            url: '/tab1',
            templateUrl: 'tab1.phtml',
            controller: 'Tab1Controller as tab1ctrl'
        })
        .state('tab1.modal', {
            url: '',
            abstract: true,
            onEnter: ['SidonieModalService', '$state', function(sidonieModalService, $state) {
                sidonieModalService.open('right', 'tab1-modal', {
                        template: '<div ui-view="modal"></div>'
                    })
                    .result
                    .finally(function() {
                        if($state.includes('tab1')){
                            $state.go('tab1');
                        }
                    });
            }],
            onExit: ['$state', 'SidonieModalService', function($state, sidonieModalService) {
                if ($state.nextState.name !== 'tab1.modal'){
                    sidonieModalService.closeAll();
                }
            }]
        })
        .state('tab1.modal.view', {
            url: '/modal',
            parent: 'tab1.modal',
            views: {
                'modal@': {
                    templateUrl: 'modal.phtml',
                    resolve: {
                        bla: [ '$q', function($q) {
                            var deferred = $q.defer();
                            setTimeout(function() {
                                deferred.resolve(true);
                            }, 1000);
                            return deferred.promise;
                        }]
                    }
                }
            }
        })
        .state('tab2', {
            url: '/tab2',
            views: {
                '': {
                    templateUrl: 'grid.phtml',
                    controller: 'GridController'
                },
                'leftbar@': {
                    templateUrl: 'grid-leftbar.phtml',
                    controller: 'GridLeftController'
                }
            }
        })
        .state('tab3', {
            url: '/tab3',
            views: {
                '': {
                    templateUrl: 'tab3.phtml',
                    controller: 'Tab3Controller'
                },
                'leftbar@': {
                    templateUrl: 'tab3-leftbar.phtml',
                    controller: 'Tab3LeftController'
                }
            }
        })
        .state('tab4', {
            url: '/tab4',
            resolve: [ '$q', function($q) {
                var deferred = $q.defer();
                setTimeout(function() {
                    deferred.resolve(true);
                }, 3000);
                return deferred.promise;
            }],
            views: {
                '': {
                    templateUrl: 'grid.phtml',
                    controller: 'GridController'
                },
                'leftbar@': {
                    templateUrl: 'grid-leftbar.phtml',
                    controller: 'GridLeftController'
                }
            }
        })
        .state('tab5', {
            url: '/tab5',
            templateUrl: 'tab2.phtml',
            resolve: [ '$q', function($q) {
                var deferred = $q.defer();
                setTimeout(function() {
                    deferred.reject('bla');
                }, 3000);
                return deferred.promise;
            }]
        });

    $urlRouterProvider.otherwise("/tab1");
}]);