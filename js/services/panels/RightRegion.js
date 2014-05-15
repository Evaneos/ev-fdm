var module = angular.module('common.services.panels');

module.directive('rightPanelWindow', [ '$timeout', function($timeout) {
    
    var BREAKS = [ 100, 200, 300, 400, 500, 600, 700 ];

    function getBPMatching(width) {
        var breakp, index;
        for (index = 0; index < BREAKS.length; index++) {
            if (width < BREAKS[index]) {
                breakp = BREAKS[index];
                break;
            }
        }
        if (breakp) return index;
        else return -1;
    }

    function applyBPAttribute(element, breakpIndex) {
        var attributeValue = '';
        if (breakpIndex == -1) {
            attributeValue = 'max';
        } else {
            attributeValue = BREAKS[breakpIndex];
        }
        element.attr('data-breakpoint', attributeValue);
    }

    return {
        restrict: 'A',
        replace: true,
        transclude: true,
        templateUrl: 'panels/right-window.phtml',
        link: function(scope, element, attrs) {
            element.resizable({
                handles: "w",
                resize: function(event, ui) {
                    var bp = getBPMatching(ui.size.width);
                    applyBPAttribute(element, bp);
                }
            });
            scope.$on('animation-complete', function() {
                var bp = getBPMatching(element.outerWidth());
                applyBPAttribute(element, bp);
            });
            $timeout(function() {
                var bp = getBPMatching(element.outerWidth());
                applyBPAttribute(element, bp);
                // focus a freshly-opened modal
                element[0].focus();
            });
        }
    }
}]);

module.service('rightRegion', [ '$rootScope', '$compile', '$animate', '$timeout', 'sidonieRegion', function($rootScope, $compile, $animate, $timeout, sidonieRegion) {

    var STACKED_WIDTH = 15;
    var els = {};

    function getEl(instance) {
        if (els[instance.$$id]) {
            return els[instance.$$id];
        } else {
            return null;
        }
    }

    function getStylesFromCache(instance, options) {
        var savedWidth = stylesCache[instance.$$depth + '-' + options.panelClass];
        if (savedWidth)
            return 'style="width: ' + savedWidth + 'px;"';
        else
            return '';
    }

    function stack(fromInstanceIndex) {
        for (var i = 0; i < region.panels.size(); i++) {
            var shouldStack = (i < fromInstanceIndex);
            var instance = region.at(i);
            var el = getEl(instance);
            if (instance.$$stacked && !shouldStack) {
                delete instance.$$actualWidth;
                $animate.removeClass(el, 'stacked');
            } else if (!instance.$$stacked && shouldStack) {
                instance.$$actualWidth = getEl(instance).outerWidth();
                $animate.addClass(el, 'stacked');
            }
            instance.$$stacked = shouldStack;
        }
    }

    function checkStacking() {
        var maxWidth = $(window).innerWidth() - 100;
        for (var i = 0; i < region.panels.size(); i++) {
            var j = 0;
            var totalWidth = _(region.panels).reduce(function(memo, instance) {
                if (j++ < i)
                    return memo + STACKED_WIDTH;
                else {
                    var el = getEl(instance);
                    if (!el) return memo;
                    if (instance.$$stacked) return memo + instance.$$actualWidth;
                    var width = el.outerWidth();
                    if (width < 50) {
                        // most probably before animation has finished landing
                        // we neeed to anticipate a final w
                        return memo + 300;
                    } else {
                        return memo + width;
                    }
                }
            }, 0);
            if (totalWidth < maxWidth) {
                return stack(i);
            }
        }
        // stack all
        stack(region.panels.size() - 1);
    }

    var checkStackingThrottled = _(checkStacking).debounce(50);

    $(window).on('resize', function() {
        region.updateStacking();
    });

    var stylesCache = window.stylesCache = {};

    var region = sidonieRegion.create(true, {
        updateStacking: function() {
            return $timeout(checkStackingThrottled);
        },
        open: function(instance, options) {
            instance.$$depth = region.panels.size();
            var el = angular.element('<div class="panel-placeholder"></div>');
            var inner = angular.element('<div right-panel-window ' + getStylesFromCache(instance, options) + '></div>');
            inner.html(options.content);
            options.scope.panelClass = options.panelClass;
            inner = $compile(inner)(options.scope);
            el.html(inner);
            els[instance.$$id] = el;
            $animate.enter(el, $('.lisette-module-region.right'), null, function() {
                options.scope.$emit('animation-complete');
                $rootScope.$broadcast('module-layout-changed');
                region.updateStacking();
            });
            el.on('resize', function(event, ui) {
                stylesCache[instance.$$depth + '-' + options.panelClass] = ui.size.width;
                region.updateStacking();
            });
            region.updateStacking();
            return instance;
        },
        replace: function(fromInstance, toInstance, options) {
            if (typeof(els[fromInstance.$$id]) != 'undefined') {
                var el = els[fromInstance.$$id];
                toInstance.$$depth = region.panels.size() - 1;
                var inner = angular.element('<div right-panel-window ' + getStylesFromCache(toInstance, options) + '></div>');
                inner.html(options.content);
                options.scope.panelClass = options.panelClass;
                inner = $compile(inner)(options.scope);
                el.html(inner);
                els[toInstance.$$id] = el;
                delete els[fromInstance.$$id];
                region.updateStacking();
                return toInstance;
            } else {
                return region.open(toInstance, options);
            }
        },
        close: function(instance) {
            if (typeof(els[instance.$$id]) != 'undefined') {
                var el = els[instance.$$id];
                $animate.leave(el, function() {
                    delete els[instance.$$id];
                    region.updateStacking();
                });
                region.updateStacking();
            }
        }
    });

    return region;

}]);