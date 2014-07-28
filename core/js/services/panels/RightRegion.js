var module = angular.module('ev-fdm');

module.directive('rightPanelWindow', [ '$timeout', '$rootScope', function($timeout, $rootScope) {

    var BREAKS = [ 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000 ];

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
        scope: false,
        replace: true,
        transclude: true,
         templateUrl: 'panels/right-window.phtml',
        link: function(scope, element, attrs) {
            var inner = element.find('.panel-inner');
            element.resizable({
                handles: "w",
                resize: function(event, ui) {
                    var bp = getBPMatching(inner.outerWidth());
                    applyBPAttribute(element, bp);
                    $rootScope.$broadcast('panel-resized', element);
                }
            });
            $(window).on('resize', function(event) {
                var bp = getBPMatching(inner.outerWidth());
                applyBPAttribute(element, bp);
            });
            scope.$on('animation-complete', function() {
                var bp = getBPMatching(inner.outerWidth());
                applyBPAttribute(element, bp);
            });
            $timeout(function() {
                var bp = getBPMatching(inner.outerWidth());
                applyBPAttribute(element, bp);
                // focus a freshly-opened modal
                element[0].focus();
            });
        }
    };
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
        var savedWidth = stylesCache[options.panelName];
        if (savedWidth) {
            return 'width: ' + savedWidth + 'px;';
        }

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
                if (j++ < i){
                    return memo + STACKED_WIDTH;
                } else {
                    var el = getEl(instance);
                    if (!el) {
                        return memo;
                    }
                    if (instance.$$stacked) {
                        return memo + instance.$$actualWidth;
                    }
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

    function createPlaceholder(depth) {
        var isMain = depth === 0;
        return angular.element('<div ' +
            'class="panel-placeholder ' + (isMain ? 'panel-main' : '') + '" ' +
            'style="z-index:' + (2000 + depth) + ';"></div>');
    }

    function createPanelView(instance, options) {
        var inner = angular.element('<div right-panel-window style="' + getStylesFromCache(instance, options) + '"></div>');
        inner.html(options.content);
        options.scope.panelClass = options.panelClass;
        return $compile(inner)(options.scope);
    }

    /**
     * Whenever a layout is changed
     */
    function updateLayout() {
        updateMainPanelWidth();
    }

    /**
     * Update the main panel width based on other panels sizes
     */
    function updateMainPanelWidth() {
        var windowWidth = $(window).innerWidth();

        // We calculate the panels width (expect the main one)
        var panels = _(region.panels).toArray().slice(1);
        var panelsWidth = _(panels).reduce(function(memo, instance) {

            var el = getEl(instance);
            if (!el) {
                return memo;
            }
            if (instance.$$stacked) {
                return memo + instance.$$actualWidth;
            }
            var width = el.outerWidth();
            if (width < 50) {
                // most probably before animation has finished landing
                // we neeed to anticipate a final w
                return memo + 300;
            } else {
                return memo + width;
            }
        }, 0);

        var mainPanel = _(region.panels).first();
        var mainPanelElement = getEl(mainPanel);
        var mainPanelWidth = windowWidth - panelsWidth;
        mainPanelElement.innerWidth(mainPanelWidth + 'px');
    }

    var checkStackingThrottled = _(checkStacking).debounce(50);

    $(window).on('resize', function() {
        region.updateLayout();
    });

    var stylesCache = window.stylesCache = {};
    var container = angular.element('.lisette-module-region.right');
    var panelZero = container.find('.panel-zero');

    var region = sidonieRegion.create(true, {
        updateLayout: function() {
            // return $timeout(checkStackingThrottled);
            updateLayout();
        },
        open: function(instance, options) {
            instance.$$depth = options.depth;
            var el = createPlaceholder(instance.$$depth);
            var inner = createPanelView(instance, options);
            el.html(inner);
            els[instance.$$id] = el;
            $animate.enter(el, container, panelZero, function() {
                options.scope.$emit('animation-complete');
                $rootScope.$broadcast('module-layout-changed');
                region.updateLayout();
            });
            el.on('resize', function(event, ui) {
                stylesCache[options.panelName] = ui.size.width;
                region.updateLayout();
            });
            region.updateLayout();
            return instance;
        },
        replace: function(fromInstance, toInstance, options) {
            if (typeof(els[fromInstance.$$id]) != 'undefined') {
                var el = els[fromInstance.$$id];
                toInstance.$$depth = options.depth - 1;
                var inner = createPanelView(toInstance, options);
                el.html(inner);
                els[toInstance.$$id] = el;
                delete els[fromInstance.$$id];
                region.updateLayout();
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
                    region.updateLayout();
                });
                region.updateLayout();
            }
        }
    });

    return region;

}]);