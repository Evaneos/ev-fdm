'use strict';

angular.module('ev-fdm')
    .directive('activableSet', function() {
        return {
            restrict: 'A',
            controller: ['$scope', '$attrs', '$parse', function($scope, $attrs, $parse) {
                this.activeElement;

                var activeElementGet = $parse($attrs.activeElement),
                    activeElementSet = activeElementGet.assign;
               
                var self = this;
                $scope.$watch(function() {
                    return activeElementGet($scope);
                }, function(newActiveElement) {
                    self.activeElement = newActiveElement;
                });

               this.toggleActive = function(value) {
                    if(value !== this.activeElement) {
                        if(activeElementSet) {
                            activeElementSet($scope, value);
                        }
                        
                        this.activeElement = value;
                    }
                    else {
                        if(activeElementSet) {
                            activeElementSet($scope, null);
                        }

                        this.activeElement = undefined;
                    }

                    $scope.$eval($attrs.activeChange);
               };

            }]
        };
    })
    .directive('activable', function() {
        return {
            restrict: 'A',
            require: '^activableSet',
            link: function(scope, element, attr, ctrl) {
                element.addClass('clickable');

                var currentElement = scope[attr.activable];

                scope.$watch(function() { return ctrl.activeElement; }, function(newActiveElement, oldActiveElement) {
                    if(newActiveElement && currentElement === newActiveElement) {
                        element.addClass('active');
                    }
                    else {
                        element.removeClass('active');
                    }
                });

                element.on('click', function(event) {
                    if(!$(event.target).closest('.block-active').length && !event.ctrlKey && ! event.shiftKey) {
                        scope.$apply(function() {
                            ctrl.toggleActive(currentElement);
                        });
                    }
                });
            }
        }
    });