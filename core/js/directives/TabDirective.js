(function () {
    'use strict';
    angular.module('ev-fdm')
        .directive('evTab', function () {
            return {
                restrict: 'E',
                transclude: true,
                scope: {},
                controller: function($scope, $element) {
                    var panes = $scope.panes = [];

                    $scope.select = function(pane) {
                        angular.forEach(panes, function(pane) {
                            pane.selected = false;
                        });
                        pane.selected = true;
                    };

                    this.addPane = function(pane) {
                        if (panes.length === 0) { $scope.select(pane); }
                        panes.push(pane);
                    };

                    this.selectPrevious = function() {
                        var selected = $scope.selectedIndex();
                        $scope.select(panes[selected - 1]);
                    };

                    this.selectNext = function() {
                        var selected = $scope.selectedIndex();
                        $scope.select(panes[selected + 1]);
                    };

                    $scope.selectedIndex = function() {
                        for (var i = 0; i < panes.length; i++) {
                            var pane = panes[i];

                            if (pane.selected) {
                                return i;
                            }
                        }
                    };
                },
                template:
                    '<div class="tabbable" ev-fixed-header refresh-on="tab_container">' +
                        '<ul class="nav nav-tabs ev-header">' +
                            '<li ng-repeat="pane in panes" ng-class="{active:pane.selected}" '+
                                'tooltip="{{pane.tabTitle}}" tooltip-placement="bottom" tooltip-append-to-body="true">'+
                                '<a href="" ng-click="select(pane)"> ' +
                                    '<span ng-if="pane.tabIcon" class="{{pane.tabIcon}}"></span> '+
                                    '<span ng-if="!pane.tabIcon">{{pane.tabTitle}}</span>'+
                                '</a>' +
                            '</li>' +
                        '</ul>' +
                        '<div class="tab-content ev-body" ng-transclude></div>' +
                    '</div>',
                replace: true
            };
        })
        .directive('evPane', function() {
            return {
                require: '^evTab',
                restrict: 'E',
                transclude: true,
                scope: { tabTitle: '@', tabIcon: '@' },
                link: function(scope, element, attrs, tabsCtrl, transcludeFn) {
                    tabsCtrl.addPane(scope);

                    transcludeFn(function(clone, transcludedScope) {
                        transcludedScope.$selectNext     = tabsCtrl.selectNext;
                        transcludedScope.$selectPrevious = tabsCtrl.selectPrevious;

                        element.find('.transclude').append(clone);
                    });
                },
                template:
                    '<div class="tab-pane" ng-class="{active: selected}">' +
                        '<div class="section transclude"></div>' +
                    '</div>',
                replace: true
            };
        });
}) ();
