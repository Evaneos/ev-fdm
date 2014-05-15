/**
 * ModalService
 *     Angularization of bootstrap's $.fn.modal into a service
 *     - read template from ng's template cache
 *     - uses ng's $compilation, attaching the provided $scope
 *     - (optional) attach a controller to the view for more advanced modals
 *
 * Usage:
 *     - modalService.open({
 *         .. same as twitter bootstrap options
 *         template:                [html value string],
 *         templateUrl:             [url matching a key in $templateCache],
 *         scope:                   [key values],
 *         parentScope (optional):  [scope will inherit from that scope, $rootScope by default],
 *         controller: (optional):  [that controller will be injected on the view]
 *     })
 *     returns the $dom
 *
 * @author maz
 */

var module = angular.module('common.services');

var ModalService = function($rootScope, $templateCache, $compile, $controller) {
    this.$rootScope = $rootScope;
    this.$templateCache = $templateCache;
    this.$compile = $compile;
    this.$controller = $controller;
};

ModalService.prototype.open = function(options) {
    // extend and check options given
    options = this._readOptions(options);

    // get/create the scope
    var $scope = (options.parentScope || this.$rootScope).$new();
    $scope = _($scope).extend(options.scope);

    // attach a controller if specified
    var $controller;
    if (options.controller) {
        $controller = this.$controller(options.controller, { $scope: $scope });
    }

    // create the dom that will feed bs modal service
    var modalDom = this.$compile(options.template || this.$templateCache.get(options.templateUrl))($scope);

    // attach these to the returned dom el
    modalDom.$scope = $scope;
    modalDom.$controller = $controller;
    // controller has access to the bs dom modal object
    if ($controller) {
        $controller.$modal = modalDom;
    }

    return $(modalDom).modal(options);
}

ModalService.prototype._readOptions = function(options) {
    // read options, adding defaults
    options = _({
        backdrop: true,
        scope: {},
        keyboard: true
    }).extend(options);

    // templateUrl is compulsory
    if (!options.templateUrl && !options.template) {
        throw new Error('Either template or templateUrl have to be defined');
    }

    return options;
}

// injection
module.service('ModalService', [
    '$rootScope',
    '$templateCache',
    '$compile',
    '$controller',
    ModalService
]);