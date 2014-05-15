/**
 * Common Application
 */

// Angular depedencies for this app
var commonModule = angular.module('ev-fdm', [ 'chieffancypants.loadingBar', 'ui.bootstrap.tooltip', 'ui.bootstrap.tooltip', 'ui.select2', 'angularMoment', 'ngAnimate', 'ngRoute', 'checklist-model', 'ui.bootstrap']);

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


/**
 * Initializer constructor
 */
var Initalizer = function() {
    // nada
}


// ----------------------------------------------------
// COMMON RUN o_O !
// ----------------------------------------------------

Initalizer.prototype.run = function($rootScope, $state, $location, notificationsService, uiSelect2Config) {

    // defaults for select2
    uiSelect2Config.minimumResultsForSearch = 7;
    uiSelect2Config.allowClear = true;

    // add some utilities to the Root Scope
    this._decorateScope($rootScope);

    var language = $rootScope.__languageIso2;
    // language for the user OR navigator language OR english
    window.moment.lang([language, window.navigator.language, 'en']);

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
            text: t('Erreur de chargement'),
            type: notificationsService.type.ERROR
        });
    });
}


// ----------------------------------------------------
// ROOT SCOPE UTILITIES
// ----------------------------------------------------

Initalizer.prototype._decorateScope = function($rootScope) {

    console.warn("Penser a corriger cette zone");
    // attach some global variables to the $rootScope
    /*if (evaneos._frontData) {
        var scopeKeys = evaneos.frontData('__scopeKeys');
        _(scopeKeys).each(function(key) {
            $rootScope[key] = evaneos.frontData(key);
        });
    }

    // In specific scenarios we need to tell angular
    // we changed something on the scope and that it
    // needs to recompute the view
    $rootScope.safeApply = function(scope, fn) {
        fn = fn || function() {};
        var phase = scope.$root.$$phase;
        if (phase == '$apply' || phase == '$digest'){
            scope.$eval(fn);
        } else {
            scope.$apply(fn);
        }
    }
    */
}


// ----------------------------------------------------
// ATTACH TO MODULE
// ----------------------------------------------------

commonModule.run(['$rootScope', '$state', '$location', 'NotificationsService', 'uiSelect2Config', function() {
    var initializer = new Initalizer();
    initializer.run.apply(initializer, arguments);
}]);