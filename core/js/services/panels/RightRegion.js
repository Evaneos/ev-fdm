var module = angular.module('ev-fdm');

module.directive('rightPanelWindow', [ '$timeout', '$rootScope', 'rightRegion', function($timeout, $rootScope, rightRegion) {

    var BREAKS = [ 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100 ];

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

    function updateBreakpoints(element) {
        var inner = element.find('.panel-inner');
        var bp = getBPMatching(inner.outerWidth());
        applyBPAttribute(element, bp);
    }

    return {
        restrict: 'A',
        scope: false,
        replace: true,
        transclude: true,
         templateUrl: 'panels/right-window.phtml',
        link: function(scope, element, attrs) {
            /**
             * Listener to update the breakpoints properties
             */
            element.resizable({
                handles: "w",
                resize: function(event, ui) {
                    updateBreakpoints(element);
                    rightRegion.updateLayout();
                    $rootScope.$broadcast('panel-resized', element);
                }
            });
            $(window).on('resize', function(event) {
                updateBreakpoints(element);
            });
            scope.$on('animation-complete', function() {
                updateBreakpoints(element);
            });
            // Specific case if it's the main panel.
            // Whenever an update on the layout is trigger, we recalculate his breakpoints
            var isMainPanel = element.parent().hasClass('panel-main');
            if(isMainPanel) {
                $rootScope.$on('module-layout-changed', function() {
                    updateBreakpoints(element);
                });
            }
            $timeout(function() {
                updateBreakpoints(element);
                // focus a freshly-opened modal
                element[0].focus();
            });
        }
    };
}]);

module.service('rightRegion', [ '$rootScope', '$compile', '$animate', '$timeout', 'sidonieRegion', function($rootScope, $compile, $animate, $timeout, sidonieRegion) {

    var STACKED_WIDTH = 75;
    var MAIN_PANEL_MIN_WIDTH = 600;
    var elements = {};

    function getElement(instance) {
        if (elements[instance.$$id]) {
            return elements[instance.$$id];
        } else {
            return null;
        }
    }

    /**
     * Return the panels sizes (if the user resized them)
     */
    function getStylesFromCache(instance, options) {
        var savedWidth = stylesCache[options.panelName];
        if (savedWidth) {
            return 'width: ' + savedWidth + 'px;';
        }

        return '';
    }

    /**
     * Create a panel container in the DOM
     */
    function createPlaceholder(depth) {
        var isMain = depth === 0;
        return angular.element('<div ' +
            'class="panel-placeholder ' + (isMain ? 'panel-main' : '') + '" ' +
            'style="z-index:' + (2000 + depth) + ';"></div>');
    }

    /**
     * Create a panel view section
     */
    function createPanelView(instance, options) {
        var inner = angular.element('<div right-panel-window style="' + getStylesFromCache(instance, options) + '"></div>');
        inner.html(options.content);
        options.scope.panelClass = options.panelClass;
        return $compile(inner)(options.scope);
    }

    /**
     * Stack/unstack a panel
     * @param  {Object}  panel the panel we want to stack unstack
     * @param  {Boolean} shouldStack either it should stack/unstack
     */
    function changeStackPanelState(panel, shouldStack) {

        if(!panel) {
            return false;
        }

        var element = getElement(panel);

        if(!element) {
            return false;
        }

        if (!shouldStack) {
            delete panel.$$actualWidth;
            $animate.removeClass(element, 'stacked');
        } else if (shouldStack) {
            panel.$$actualWidth = getElement(panel).outerWidth();
            $animate.addClass(element, 'stacked');
        }
        panel.$$stacked = shouldStack;

        return true;
    }

    /**
     * Check if there is some panels to stack
     */
    function checkStacking() {
        var maxWidth = $(window).innerWidth();
        // var panels = _(region.panels).toArray().slice(1);
        for (var i = 0; i < region.panels.size(); i++) {
            var j = 0;
            var totalWidth = _(region.panels).reduce(function(memo, instance) {
                if (j++ < i){
                    return memo + STACKED_WIDTH;
                } else {
                    var el = getElement(instance);
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
                changeStackPanelState(region.at(i), true);
            } else if (totalWidth < maxWidth) {
                changeStackPanelState(region.at(i), false);
            }
        }
        // stack all
        // changeStackPanelState(region.panels.size() - 1);
    }

    /**
     * Whenever a layout is changed
     */
    function updateLayout() {
        checkStacking();
        updateMainPanelWidth();
        $timeout(function() { $rootScope.$broadcast('module-layout-changed'); }, 250);
    }

    /**
     * Update the main panel width based on other panels sizes
     */
    function updateMainPanelWidth() {
        var windowWidth = $(window).innerWidth();
        var mainPanel = _(region.panels).first();
        var mainPanelElement = getElement(mainPanel);

        if(mainPanelElement === null) {
            return;
        }

        // We calculate the panels width (expect the main one)
        var panels = _(region.panels).toArray().slice(1);
        var panelsWidth = _(panels).reduce(function(memo, instance) {

            var el = getElement(instance);
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

        var mainPanelWidth = windowWidth - panelsWidth;
        if(mainPanelWidth < MAIN_PANEL_MIN_WIDTH) {
            changeStackPanelState(region.at(0), true);
        } else {
            changeStackPanelState(region.at(0), false);
            mainPanelElement.innerWidth(mainPanelWidth + 'px');
        }
    }

    $(window).on('resize', function() {
        region.updateLayout();
    });

    var stylesCache = window.stylesCache = {};
    var container = angular.element('.lisette-module-region.right');
    var panelZero = container.find('.panel-zero');

    var region = sidonieRegion.create(true, {
        updateLayout: function() {
            _(updateLayout()).debounce(50);
        },
        open: function(instance, options) {
            instance.$$depth = options.depth;
            var el = createPlaceholder(instance.$$depth);
            var inner = createPanelView(instance, options);
            el.html(inner);
            elements[instance.$$id] = el;
            $animate.enter(el, container, panelZero, function() {
                options.scope.$emit('animation-complete');
                $rootScope.$broadcast('module-layout-changed');
                region.updateLayout();
            });
            el.on('resize', function(event, ui) {
                stylesCache[options.panelName] = ui.size.width;
                region.updateLayout();
            });
            return instance;
        },
        replace: function(fromInstance, toInstance, options) {
            if (typeof(elements[fromInstance.$$id]) != 'undefined') {
                var el = elements[fromInstance.$$id];
                toInstance.$$depth = options.depth - 1;
                var inner = createPanelView(toInstance, options);
                el.html(inner);
                elements[toInstance.$$id] = el;
                delete elements[fromInstance.$$id];
                return toInstance;
            } else {
                return region.open(toInstance, options);
            }
        },
        close: function(instance) {
            if (typeof(elements[instance.$$id]) != 'undefined') {
                var el = elements[instance.$$id];
                $animate.leave(el, function() {
                    delete elements[instance.$$id];
                    region.updateLayout();
                });
            }
        }
    });

    return region;
}]);