'use strict';

angular.module('ev-fdm')
    .directive('sortableSet', function() {
        return {
            restrict: 'A',
            scope: false,
            controller: ['$scope', '$parse', '$element', '$attrs', function($scope, $parse, $element, $attrs) {
                var _this = this;
                this.reverseSort = false;
                this.sortKey = '';

                $scope.reverseSort = $scope.reverseSort || false;

                var reverseSortGet = $parse($attrs.reverseSort);
                var reverseSortSet = reverseSortGet.assign;
                var sortKeyGet = $parse($attrs.sortBy);
                var sortKeySet = sortKeyGet.assign;

                $scope.$watch(function() {
                    return reverseSortGet($scope);
                }, function(newReverseSort) {
                    _this.reverseSort = newReverseSort;
                });

                $scope.$watch(function() {
                    return sortKeyGet($scope);
                }, function(newSortKey) {
                    _this.sortKey = newSortKey;
                });

                this.sortBy = function(key) {
                    if (key == this.sortKey) {
                        // get back to the default state here (remove the sorting)
                        // reverseSort flow: false (default) -> true -> sorketKey = '' (reset);
                        if (this.reverseSort) {
                            this.sortKey = '';
                        } else {
                            this.reverseSort = !this.reverseSort;
                        }
                    } else {
                        this.reverseSort = false;
                        this.sortKey = key;
                    }

                    if (reverseSortSet) {
                        reverseSortSet($scope, this.reverseSort);
                    }

                    if (sortKeySet) {
                        sortKeySet($scope, this.sortKey);
                    }

                    $scope.$eval($attrs.sortChange);
                };
            },
        ],};
    })
    .directive('sortable', function() {
        return {
            restrict: 'A',
            scope: false,
            require: '^sortableSet',
            link: function(scope, element, attr, ctrl) {
                var key = attr.sortable;
                element.addClass('sortable sort');

                scope.$watch(function() { return ctrl.sortKey;}, function() {
                    setClasses();
                });

                scope.$watch(function() { return ctrl.reverseSort;}, function() {
                    setClasses();
                });

                element.on('click', function() {
                    scope.$apply(function() {
                        ctrl.sortBy(key);
                    });
                });

                function setClasses() {
                    if (ctrl.sortKey === key) {
                        element.removeClass('no-sort');
                        if (ctrl.reverseSort) {
                            element.removeClass('sort-down').addClass('sort-up');
                        } else {
                            element.removeClass('sort-up').addClass('sort-down');
                        }
                    } else {
                        element.removeClass('sort-up sort-down').addClass('no-sort');
                    }
                }
            },
        };
    });
