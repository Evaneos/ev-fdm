/**
 * Common Application
 */

// Angular depedencies for this app
var commonModule = angular.module('ev-fdm', ['ui.date', 'chieffancypants.loadingBar', 'ui.bootstrap.tooltip', 'ui.select2', 'angularMoment', 'ngAnimate', 'ui.router', 'checklist-model', 'ui.bootstrap']);

// configure the loading bar to be displayed
// just beneath the menu
commonModule.config(function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = false;
    cfpLoadingBarProvider.parentSelector = '#lisette-menu';
});

commonModule.config(function($tooltipProvider) {
    $tooltipProvider.options({
        placement: 'bottom',
        popupDelay: 100
    });
});


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
    $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, error) {
        $('body').removeClass('state-resolving');
        notificationsService.add({
            text: 'Loading error',
            type: notificationsService.type.ERROR
        });
    });

    /*if (evaneos._frontData) {
        var scopeKeys = evaneos.frontData('__scopeKeys');
        _(scopeKeys).each(function(key) {
            $rootScope[key] = evaneos.frontData(key);
        });
    }
    */


}]);