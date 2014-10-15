'use strict';

function MenuManagerProvider() {

    var self = this;
    this.tabs = [];
    this.activeTab = null;
    this.lastTab = null;

    this.addTab = function(tab) {
        this.tabs.push(tab);
        return this;
    };

    function findTab(stateName) {
        var res = null;
        angular.forEach(self.tabs, function(tab) {
            if(stateName === tab.state) {
                res = tab;
            }
        });

        return res;
    }

    function selectTab(tab) {
        tab = tab || {};
        tab = findTab(tab.state);

        if(!tab) {
            return;
        }

        if(self.activeTab) {
            self.lastTab = self.activeTab;
            self.activeTab.active = false;
        }

        tab.active = true;
        self.activeTab = tab;
    }

    this.$get = ['$rootScope', '$state', function($rootScope, $state) {

        // Handle first page load
        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState) {
            if (fromState.name === '') {
                var toTab = findTab(toState.name);

                if(toTab) {
                    selectTab(toTab);
                }
            }
        });

        $rootScope.$on('$stateChangeError', function(event) {
            selectTab(self.lastTab);
        });

        return {
            tabs: self.tabs,
            selectTab: selectTab
        };
    }];
}

function EvMenuDirective(menuManager) {
    return {
        restrict: 'E',
        replace: true,
        template:   '<ul class="module-tabs nav nav-tabs" ng-cloak>' +
                        '<li ng-repeat="tab in tabs" ng-class="{active: tab.active}">' +
                            '<a ng-click="selectTab(tab)">{{ tab.name }}</a>' +
                        '</li>' +
                    '</ul>',
        controller: [ '$scope', '$state', '$rootScope', function($scope, $state, $rootScope) {
            console.warn('%c [Phoenix team] %c Remove evMenuDirective, please', 'background: #c0392b; color:white', 'background: #e67e22; color: white');

            $scope.tabs = menuManager.tabs;

            if($rootScope['evmenu-state']) {
                menuManager.selectTab($rootScope['evmenu-state']);
            }

            $scope.selectTab = function(tab) {
                menuManager.selectTab(tab);
                $state.go(tab.state);
            };
        }]
    };
}

angular.module('ev-fdm')
    .provider('menuManager', [MenuManagerProvider])
    .directive('evMenu', ['menuManager', EvMenuDirective]);