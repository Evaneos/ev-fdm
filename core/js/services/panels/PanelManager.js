var module = angular.module('ev-fdm');

module.factory('PanelManagerFactory', function() {
    function shouldBeOverriden(name) {
        return function() {
            throw new Error('Method ' + name + ' should be overriden');
        };
    }
    var PanelManager = function() {
        this.panels = _([]);
    };
    PanelManager.prototype.open = shouldBeOverriden('open');
    PanelManager.prototype.close = shouldBeOverriden('close');
    PanelManager.prototype.push = function(instance) {
        this.panels.push(instance);
    };
    PanelManager.prototype.remove = function(instance) {
        var i = this.panels.indexOf(instance);
        if (i > -1) {
            this.panels.splice(i, 1);
        }
        return i;
    };
    PanelManager.prototype.at = function(index) {
        return this.panels._wrapped[index];
    };
    PanelManager.prototype.each = function() {
        return this.panels.each.apply(this.panels, arguments);
    };
    PanelManager.prototype.dismissAll = function(reason) {
        // dismiss all panels except the first one
        var i = 0;
        this.each(function(instance) {
            if(i !== 0) {
                instance.dismiss(reason);
            }
            i++;
        });
    };
    PanelManager.prototype.dismissChildren = function(instance, reason) {
        var children = this.getChildren(instance);
        for (var i = children.length - 1; i >= 0; i--) {
            var child = children[i];
            var result = child.dismiss(reason);
            if (!result) {
                return false;
            }
        }

        return true;
    };
    PanelManager.prototype.last = function() {
        return this.panels.last();
    };
    PanelManager.prototype.getNext = function(instance) {
        var i = this.panels.indexOf(instance);
        if (i < this.panels.size() - 1) {
            return this.at(i + 1);
        } else {
            return null;
        }
    };
    PanelManager.prototype.getChildren = function(instance) {
        var i = this.panels.indexOf(instance);
        if (i > -1) {
            return this.panels.slice(i + 1);
        } else {
            return [];
        }
    };
    PanelManager.prototype.size = function() {
        return this.panels.size();
    };
    PanelManager.prototype.isEmpty = function() {
        return this.panels.size() === 0;
    };

    return {
        create: function(methods) {
            var ChildClass = function() {
                return PanelManager.call(this);
            };
            ChildClass.prototype = _({}).extend(PanelManager.prototype, methods);
            return new ChildClass();
        }
    };
});

module.service('panelManager', [ '$rootScope', '$compile', '$animate', '$timeout', 'PanelManagerFactory', function($rootScope, $compile, $animate, $timeout, PanelManagerFactory) {

    var STACKED_WIDTH = 75;
    var MAIN_PANEL_MIN_WIDTH = 600;
    var elements = {};

    var stylesCache = window.stylesCache = {};
    var container = angular.element('.panels-container');
    var panelZero = container.find('.panel-zero');

    var panelManager = PanelManagerFactory.create({
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
                panelManager.updateLayout();
            });
            el.on('resize', function(event, ui) {
                stylesCache[options.panelName] = ui.size.width;
                panelManager.updateLayout();
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
                return panelManager.open(toInstance, options);
            }
        },
        close: function(instance) {
            if (typeof(elements[instance.$$id]) != 'undefined') {
                var el = elements[instance.$$id];
                $animate.leave(el, function() {
                    delete elements[instance.$$id];
                    panelManager.updateLayout();
                });
            }
        }
    });

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
        var inner = angular.element('<div ev-panel-breakpoints style="' + getStylesFromCache(instance, options) + '"></div>');
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
        /**
         * If the main panel isn't stacked, there is no need to do
         * tese verifications.
         */
        var mainPanel = panelManager.panels.first();
        if(mainPanel && !mainPanel.$$stacked) {
            return;
        }

        var maxWidth = $(window).innerWidth();
        // var panels = _(panelManager.panels).toArray().slice(1);
        for (var i = 0; i < panelManager.panels.size(); i++) {
            var j = 0;
            var totalWidth = _(panelManager.panels).reduce(function(memo, instance) {
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
                changeStackPanelState(panelManager.at(i), true);
            } else if (totalWidth < maxWidth) {
                changeStackPanelState(panelManager.at(i), false);
            }
        }
        // stack all
        // changeStackPanelState(panelManager.panels.size() - 1);
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
        var windowWidth      = $(window).innerWidth();
        var mainPanel        = _(panelManager.panels).first();
        var mainPanelElement = getElement(mainPanel);

        if(mainPanelElement === null) {
            return;
        }

        // We calculate the panels width (expect the main one)
        var panels      = _(panelManager.panels).toArray().slice(1);
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
            changeStackPanelState(panelManager.at(0), true);
        } else {
            changeStackPanelState(panelManager.at(0), false);
            mainPanelElement.innerWidth(mainPanelWidth + 'px');
        }
    }

    $(window).on('resize', function() {
        panelManager.updateLayout();
    });

    return panelManager;
}]);