'use strict';

var module = angular.module('common.directives');

module.directive('clearable', function($timeout) {

    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attr, ctrl) {

            var clearButton = angular.element('<button class="clear" ng-click="clear()">×</button>');
            element.after(clearButton);

            clearButton.on('click', function() {
                scope.$apply(function() {
                    element.val(''); 
                    ctrl.$setViewValue('');
                });
            });

            scope.$watch(function() { return ctrl.$isEmpty(ctrl.$viewValue); }, function(isEmpty) {
                if(isEmpty) {
                    clearButton.hide();
                }
                else {
                    clearButton.show();
                }
            });

        }
    }
});