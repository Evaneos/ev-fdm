'use strict';

var module = angular.module('common.directives');

module.directive('throttle', function($timeout) {

    return {
        restrict: 'A',
        require: 'ngModel',
        priority: 1,
        link: function(scope, element, attr, ctrl) {

            var originalSetViewValue = ctrl.$setViewValue,
                originalViewListeners = angular.copy(ctrl.$viewChangeListeners);

            ctrl.$viewChangeListeners = [];

            var throttleGuard;
            ctrl.$setViewValue = function(value) {
                var callViewListeners = ctrl.$modelValue !== value;

                originalSetViewValue.apply(ctrl, [value]);

                if (callViewListeners) {
                    if(throttleGuard) {
                        $timeout.cancel(throttleGuard);
                    }

                    throttleGuard = $timeout(function() {
                        angular.forEach(originalViewListeners, function(listener) {
                            try {
                                listener();
                            } catch(e) {
                                $exceptionHandler(e);
                            }
                        });
                    }, 600);
                }

            };
        }
    }
});