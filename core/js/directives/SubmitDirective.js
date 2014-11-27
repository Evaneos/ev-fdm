var module = angular.module('ev-fdm')
.directive('evSubmit', ['$parse', function($parse) {
    return {
        restrict: 'A',
        require: 'form',
        controller: function($scope, $element, $attrs) {
            var validables = [];

            this.$addValidable = function(makeValidable) {
                validables.push(makeValidable)
            };

            var fn = $parse($attrs['evSubmit'], /* interceptorFn */ null, /* expensiveChecks */ true);

            $element.on('submit', function(event) {
                var callback = function() {
                    if ($scope.form.$valid) {
                        fn($scope, {$event:event});
                    }
                };

                validables.forEach(function(makeValidable) {
                  makeValidable();
                });

                $scope.$apply(callback);
            });
        },
        link: function(scope, element, attrs, form) {
            scope.form = form;
        }
    };
}]);
