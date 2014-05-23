'use strict';

angular.module('ev-fdm').directive('body', ['$rootScope', '$state', function ($rootScope, $state) {
    return {
        restrict: 'E',
        link: function(scope, element, attrs) {

            $rootScope.$on('$stateChangeStart', function(event, toState) {
                if (!$state.current.name || toState.name.indexOf($state.current.name) !== 0) {
                    element.addClass('state-resolving');
                }
            });

            $rootScope.$on('$stateChangeSuccess', function() {
                element.removeClass('state-resolving');
            });

            $rootScope.$on('$stateChangeError', function() {
                element.removeClass('state-resolving');
            });
        }
    };
}]);