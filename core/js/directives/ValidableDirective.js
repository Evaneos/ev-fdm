var module = angular.module('ev-fdm')
/**
 * DONE: makeValidable only happens after first blur or when ev-validable event occurs.
 * TO DO: expose makeValidable, to provides validation directly
 * on focus or on when a key is entered
 */
.directive('evValidable', function () {
    return {
        restrict: 'A',
        require: ['ngModel', '^evSubmit', '^?evFormGroup'],
        link: function(scope, element, attrs, controllers) {
            var model = controllers[0],
                evSubmit = controllers[1],
                evFormGroup = controllers[2];

            var makeValidable = function() {
                model.evValidable = true;
                hasError();
            };

            var hasError = function() {
                model.evHasError = !!(!model.$valid && model.evValidable);

                if (evFormGroup) {
                    evFormGroup.toggleError(model.evHasError);
                }
            };

            evSubmit.$addValidable(makeValidable);

            element.on('blur', function() {
                scope.$apply(makeValidable);
            });

            element.on('keyup', function() {
                scope.$apply(hasError);
            });
        }
    };
});
