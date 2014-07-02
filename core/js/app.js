/**
 * Common Application
 */

// Angular depedencies for this app
var commonModule = angular.module('ev-fdm', ['ui.router', 'ui.date', 'chieffancypants.loadingBar', 'ui.bootstrap.tooltip', 'ui.select2', 'angularMoment', 'ngAnimate', 'checklist-model', 'ui.bootstrap', 'restangular']);


// configure the loading bar to be displayed
// just beneath the menu
commonModule.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = false;
    cfpLoadingBarProvider.parentSelector = '#lisette-menu';
}]);

commonModule.config(['$tooltipProvider', function($tooltipProvider) {
    $tooltipProvider.options({
        placement: 'bottom',
        popupDelay: 100
    });
}]);

/**
 * Define a default error state for our app
 */
commonModule.config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('ev-error', {
        templateUrl: 'ev-error.phtml'
    });
}]);

commonModule.config(['RestangularProvider', function(restangularProvider) {

}]);


// ----------------------------------------------------
// ATTACH TO MODULE
// ----------------------------------------------------

commonModule.run(['$rootScope', '$state', '$location', 'NotificationsService', 'uiSelect2Config', function($rootScope, $state, $location, notificationsService, uiSelect2Config) {
    // defaults for select2
    uiSelect2Config.minimumResultsForSearch = 7;
    uiSelect2Config.allowClear = true;


    // language for the user OR navigator language OR english
    window.moment.lang([window.navigator.language, 'en']);

    $rootScope.$on('$stateChangeStart', function(event, toState) {
        $state.nextState = toState;
        // not a tab changing
        if (!$state.current.name || toState.name.indexOf($state.current.name) !== 0) {
            $('body').addClass('state-resolving');
        }
    });

    $rootScope.$on('$stateChangeSuccess', function() {
        $('body').removeClass('state-resolving');
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
        // Or our default error page
        else {
          $state.go('ev-error');
        }
    });

    /*if (evaneos._frontData) {
        var scopeKeys = evaneos.frontData('__scopeKeys');
        _(scopeKeys).each(function(key) {
            $rootScope[key] = evaneos.frontData(key);
        });
    }
    */


}]);