var module = angular.module('ev-fdm');

module.directive('rightPanelWindow', [ '$timeout', '$rootScope', 'rightRegion', function($timeout, $rootScope, rightRegion) {

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
                    rightRegion.updateLayout();
                    $rootScope.$broadcast('panel-resized', element);
                }
            });
            $(window).on('resize', function(event) {
                var bp = getBPMatching(inner.outerWidth());
                applyBPAttribute(element, bp);
                rightRegion.updateLayout();
            });
            scope.$on('animation-complete', function() {
                var bp = getBPMatching(inner.outerWidth());
                applyBPAttribute(element, bp);
                rightRegion.updateLayout();
            });
            $timeout(function() {
                var bp = getBPMatching(inner.outerWidth());
                applyBPAttribute(element, bp);
                rightRegion.updateLayout();
                // focus a freshly-opened modal
                element[0].focus();
            });
        }
    };
}]);

module.service('rightRegion', [ '$rootScope', '$compile', '$animate', '$timeout', 'sidonieRegion', function($rootScope, $compile, $animate, $timeout, sidonieRegion) {

    var STACKED_WIDTH = 75;
    var MAIN_PANEL_MIN_WIDTH = 600;
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

    /**
     * Stack/unstack all panels from a given instance index
     * Example:
     *     index: 2, then the panels 0,1 and 2 will be stacked
     * @param  {int} instanceIndex index
     */
    function stackPanelsFrom(instanceIndex, shouldStack) {
        var panelsSize = region.panels.size();

        if(instanceIndex > panelsSize) {
            return false;
        }

        for (; instanceIndex >= 0; instanceIndex--) {
            var instance = region.at(instanceIndex);
            var el = getEl(instance);
            if (!shouldStack) {
                delete instance.$$actualWidth;
                $animate.removeClass(el, 'stacked');
            } else if (shouldStack) {
                instance.$$actualWidth = getEl(instance).outerWidth();
                $animate.addClass(el, 'stacked');
            }
            instance.$$stacked = shouldStack;
        }

        return true;
    }

    /**
     * Check if there is some panels to stack
     */
    function checkStacking() {
        var maxWidth = $(window).innerWidth();

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
                    // if (width < 50) {
                    //     // most probably before animation has finished landing
                    //     // we neeed to anticipate a final w
                    //     return memo + 300;
                    // } else {
                        return memo + width;
                    // }
                }
            }, 0);
            if (totalWidth > maxWidth) {
                return stackPanelsFrom(i, true);
            }
        }
        // stack all
        // stackPanelsFrom(region.panels.size() - 1);
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
        $rootScope.$broadcast('module-layout-changed');
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
            // if (width < 50) {
            //     // most probably before animation has finished landing
            //     // we neeed to anticipate a final w
            //     return memo + 300;
            // } else {
                return memo + width;
            // }
        }, 0);

        var mainPanel = _(region.panels).first();
        var mainPanelElement = getEl(mainPanel);
        var mainPanelWidth = windowWidth - panelsWidth;
        if(mainPanelElement !== null) {
            if(mainPanelWidth < MAIN_PANEL_MIN_WIDTH) {
                stackPanelsFrom(0, true);
            } else {
                stackPanelsFrom(0, false);
                mainPanelElement.innerWidth(mainPanelWidth + 'px');
            }
        }
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
            $timeout(checkStackingThrottled);
            _(updateLayout()).debounce(50);
        },
        open: function(instance, options) {
            instance.$$depth = options.depth;
            var el = createPlaceholder(instance.$$depth);
            var inner = createPanelView(instance, options);
            el.html(inner);
            els[instance.$$id] = el;
            $animate.enter(el, container, panelZero, function() {
                options.scope.$emit('animation-complete');
                region.updateLayout();
            });
            el.on('resize', function(event, ui) {
                stylesCache[options.panelName] = ui.size.width;
                region.updateLayout();
            });
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
            }
        }
    });

    return region;

}]);