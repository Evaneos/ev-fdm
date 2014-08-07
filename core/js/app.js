/**
 * Core Application
 */

// Angular depedencies for this app
angular.module('ev-fdm', ['ui.router', 'ui.date', 'chieffancypants.loadingBar',
        'ui.bootstrap.tooltip', 'ui.bootstrap.popover', 'ui.select2', 'angularMoment', 'ngAnimate', 'checklist-model',
        'ui.bootstrap', 'restangular'])


// configure the loading bar to be displayed
// just beneath the menu
.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = false;
    cfpLoadingBarProvider.parentSelector = '#lisette-menu';
}])

.config(['$tooltipProvider', function($tooltipProvider) {
    $tooltipProvider.options({
        placement: 'bottom',
        popupDelay: 100
    });
    $tooltipProvider.setTriggers({
        'mouseenter': 'mouseleave',
        'click': 'click',
        'focus': 'blur',
        'never': 'mouseleave',

        // Custom event, the tooltip appears when the element has the focus, and disappear when a key
        // in pressed (or the element has blurred).
        'focus-not-typing': 'blur-or-typing'
    });
}])

/**
 * Define a default error state for our app
 */
.config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('ev-error', {
        templateUrl: 'ev-error.phtml'
    });
}])

.config(['RestangularProvider', function(restangularProvider) {

}])


// ----------------------------------------------------
// ATTACH TO MODULE
// ----------------------------------------------------

.run(['$rootScope', '$state', '$location', 'uiSelect2Config', function($rootScope,
        $state, $location, uiSelect2Config) {

    // defaults for select2
    uiSelect2Config.minimumResultsForSearch = 7;
    uiSelect2Config.allowClear = true;

    // On the first loading state, we set this value
    // It used by the ev-menu directive which is loaded asynchronously
    // and can't listen to this event on the first load.
    $rootScope.$on('$stateChangeStart', function(event, toState) {
        toState.state = toState.name;
        $rootScope['evmenu-state'] = toState;
    });


    // language for the user OR navigator language OR english
    window.moment.lang([window.navigator.language, 'en']);

}]);
