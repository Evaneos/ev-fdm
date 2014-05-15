'use strict';

function MenuManagerProvider() {

    var tabs = [];
    var self = this;
    var lastActiveTab = null;
    var resolvingTab = null;

    this.addTab = function(tab) {
        tabs.push(tab);
        return this;
    }

    function findTab(stateName) {
        return _(tabs).find(function(t) {
            return stateName.indexOf(t.state) === 0;
        });
    }

    function getActiveTab() {
        return _(tabs).findWhere({ active: true });
    }

    function selectTab(tab) {
        // a tab was still resolving
        if (resolvingTab) resolvingTab.active = false;
        // cache current and resolving tab
        resolvingTab = tab;
        lastActiveTab = getActiveTab();
        if (tab) tab.active = true;
        if (lastActiveTab) lastActiveTab.active = false;
    }

    function isResolving() {
        return resolvingTab !== null;
    }

    function _reset() {
        lastActiveTab = null;
        resolvingTab = null;
    }

    this.$get = ['$rootScope', '$state', function($rootScope, $state) {
        
        // Handle first page load
        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState) {
            if (fromState.name === '') {
                var toTab = findTab(toState.name);
                selectTab(toTab);
            }
        });

        $rootScope.$on('$stateChangeSuccess', function(event) {
            _reset();
            // state coming from url change or at first page load
            var activeTab = getActiveTab();
            if (activeTab) activeTab.active = false;
            var tab = findTab($state.current.name);
            if (tab) tab.active = true;
        });
        $rootScope.$on('$stateChangeError', function(event) {
            // switch back to last tab
            if (resolvingTab) resolvingTab.active = false;
            if (lastActiveTab) lastActiveTab.active = true;
            _reset();
        });
        return {
            tabs: tabs,
            selectTab: selectTab,
            isResolving: isResolving
        }
    }];
}

function EvMenuDirective(menuManager) {
    return {
        restrict: 'E',
        replace: true,
        template:   '<ul class="lisette-module-tabs nav nav-tabs" ng-cloak>' +
                        '<li ng-repeat="tab in tabs" ng-class="{active: tab.active}">' +
                            '<a ng-click="selectTab(tab)">{{ tab.name }}</a>' +
                        '</li>' +
                    '</ul>',
        controller: [ '$scope', '$state', function($scope, $state) {
            $scope.tabs = menuManager.tabs;
            $scope.selectTab = function(tab) {
                if (!menuManager.isResolving()) {
                    menuManager.selectTab(tab);
                    $state.go(tab.state);
                }
            }
        }]
    }

};

angular.module('evMenu', [])
    .provider('menuManager', [MenuManagerProvider])
    .directive('evMenu', ['menuManager', EvMenuDirective]);