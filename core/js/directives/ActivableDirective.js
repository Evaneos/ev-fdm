'use strict';

angular.module('ev-fdm').directive('activableSet', function() {
    return {
        restrict: 'A',
        scope: false,
        controller: ['$scope', '$attrs', '$parse', function($scope, $attrs, $parse) {

            var activeElementGet = $parse($attrs.activeElement);
            var activeElementSet = activeElementGet.assign;

            var self = this;
            $scope.$watch(function() {
                return activeElementGet($scope);
            }, function(newActiveElement) {
                self.activeElement = newActiveElement;
            });

            this.toggleActive = function(value) {
                if(value !== this.activeElement) {
                    if (activeElementSet) {
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
});
angular.module('ev-fdm').directive('activable', ['$parse', function($parse) {
    return {
        restrict: 'A',
        require: '^activableSet',
        link: function(scope, element, attr, ctrl) {
            element.addClass('clickable');
            var elementGetter = $parse(attr.activable);
            var currentElement = elementGetter(scope);


            scope.$watch(function() { return elementGetter(scope); }, function(newCurrentElement) {
                currentElement = newCurrentElement;
            });

            scope.$watch(
                function() { return ctrl.activeElement; },
                function(newActiveElement, oldActiveElement) {
                    if(newActiveElement && currentElement === newActiveElement) {
                        element.addClass('active');
                    }
                    else {
                        element.removeClass('active');
                    }
                }
            );

            var clicks = 0, timeout;
            element.on('click', function(event) {
                if (timeout) {
                    clearTimeout(timeout);
                }
                timeout = setTimeout(function() {
                    clicks = 0;
                }, 800);
                if (clicks++ === 0) {
                    if(!$(event.target).closest('.block-active').length && !event.ctrlKey && ! event.shiftKey) {
                        scope.$apply(function() {
                            ctrl.toggleActive(currentElement);
                        });
                    }
                }
            });
        }
    };
}]);
