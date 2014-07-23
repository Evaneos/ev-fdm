'use strict';

angular.module('ev-fdm').directive('body', ['$rootScope', 'NotificationsService', '$state', function ($rootScope, notificationsService, $state) {
    return {
        restrict: 'E',
        link: function(scope, element, attrs) {

            $rootScope.$on('$stateChangeStart', function(event, toState) {
                // not a tab changing
                var dotX = $state.current.name.indexOf('.'),
                     stateName = (dotX != -1) ? $state.current.name.substring(0, dotX) : $state.current.name;

                if (!stateName || toState.name.indexOf(stateName) !== 0) {
                    $('body').addClass('state-resolving');
                }
            });

            $rootScope.$on('$stateChangeSuccess', function() {
                element.removeClass('state-resolving');
            });

            /**
             * When there is an error on a state change
             *
             * In your state config you can add the following.
             * This will allows the router to fallback to this state on error
             * while displaying the specified message

                  fallback: {
                    state: 'list',
                    message: t('Unable to open this transaction!')
                  }
             */
            $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, error) {
                $('body').removeClass('state-resolving');

                var errorMessage = (toState.fallback && toState.fallback.message) || 'Error';

                notificationsService.addError({
                    text: errorMessage
                });

                // Redirect to the fallback we defined in our state
                if(toState && toState.fallback && toState.fallback.state) {
                  $state.go(toState.fallback.state);
                }
            });
        }
    };
}]);
