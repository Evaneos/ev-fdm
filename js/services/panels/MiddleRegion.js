var module = angular.module('common.services.panels');

/**
 * Taken from Angular-UI > $modal
 * A helper directive for the $modal service. It creates a backdrop element.
 */
module.directive('middlePanelBackdrop', ['$timeout', 
    function($timeout) {
        return {
            restrict: 'EA',
            replace: true,
            template: '<div class="modal-backdrop fade" ng-class="{in: animate}" ng-style="{\'z-index\': 1040 + index*10}"></div>',
            link: function(scope, element) {
                scope.animate = false;
                //trigger CSS transitions
                $timeout(function() {
                    scope.animate = true;
                });
            }
        };
    }
]);

/**
 * Taken from Angular-UI > $modal
 */
module.directive('middlePanelWindow', ['$timeout', 'middleRegion',
    function($timeout, middleRegion) {
        return {
            restrict: 'EA',
            scope: {
                index: '@'
            },
            replace: true,
            transclude: true,
            templateUrl: 'panels/middle-window.phtml',
            link: function(scope, element, attrs) {
                $timeout(function() {
                    // trigger CSS transitions
                    scope.animate = true;
                    // focus a freshly-opened modal
                    element[0].focus();
                });
                scope.close = function(evt) {
                    if (evt.target === evt.currentTarget) {
                        evt.preventDefault();
                        evt.stopPropagation();
                        middleRegion.dismissAll();
                    }
                };
            }
        };
    }
]);

module.service('middleRegion', ['$compile', '$document', '$rootScope', 'sidonieRegion', function($compile, $document, $rootScope, sidonieRegion) {

    var els = {};
    var body = $document.find('body').eq(0);

    var region = sidonieRegion.create(false, {

        open: function(instance, options) {

            // create backdrop element
            var backdropjqLiteEl, backdropDomEl;
            backdropjqLiteEl = angular.element('<div middle-panel-backdrop></div>');
            backdropDomEl = $compile(backdropjqLiteEl)($rootScope.$new(true));
            body.append(backdropDomEl);
            
            // create window
            var angularDomEl = angular.element('<div middle-panel-window></div>');
            angularDomEl.addClass(options.panelClass);
            angularDomEl.html(options.content);
            // dom el
            var modalDomEl = $compile(angularDomEl)(options.scope);
            body.append(modalDomEl);

            els[instance.$$id] = {
                window: modalDomEl,
                backdrop: backdropDomEl
            }

            return instance;
        },

        replace: function(fromInstance, toInstance, options) {
            throw new Error('Not implemented');
        },

        close: function(instance, result) {
            if (typeof(els[instance.$$id]) != 'undefined') {
                els[instance.$$id].window.remove();
                els[instance.$$id].backdrop.remove();
                delete els[instance.$$id];
            }
        }
    });

    $document.bind('keydown', function(evt) {
        if (evt.which === 27) {
            var instance = region.last();
            if (instance) {
                $rootScope.$apply(function() {
                    instance.dismiss('escape');
                });
            }
        }
    });

    return region;
}]);