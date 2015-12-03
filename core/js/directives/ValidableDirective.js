var module = angular.module('ev-fdm')
/**
 * DONE: makeValidable only happens after first blur or when ev-validable event occurs.
 * TO DO: expose makeValidable, to provides validation directly
 * on focus or on when a key is entered
 */
.directive('evValidable', function () {
    return {
        restrict: 'A',
        require: ['ngModel', '^?evSubmit', '^?evFormGroup'],
        link: function(scope, element, attrs, controllers) {
            var model = controllers[0],
                evSubmit = controllers[1],
                evFormGroup = controllers[2];

            var markAsBlurred = function() {
                model.evBlurred = true;
            };

            var markAsChanged = function() {
                model.evChanged = true;
            };

            var displayErrors = function() {
                model.evHasError = !!(!model.$valid && model.evBlurred);
                if (evFormGroup) {
                    evFormGroup.toggleError(model.evHasError);
                }
            };

            element.on('blur', function() {
                scope.$evalAsync(function() {
                    markAsBlurred();
                    displayErrors();
                });
            });

            model.$viewChangeListeners.push(function() {
                markAsChanged();
                displayErrors();
            });

            evSubmit && evSubmit.$addValidable(function() {
                markAsBlurred();
                markAsChanged();
                displayErrors();
            });
        }
    };
});
