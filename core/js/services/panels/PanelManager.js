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

    PanelManager.prototype.dismissChildrenId = function(rank) {
        var children = this.panels.slice(rank);
        var reason = '';
        for (var i = children.length - 1; i >= 0; i--) {
            var child = children[i];
            var result = child.dismiss(reason);
            if (!result) {
                return false;
            }
        }

        return true;
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

module.service('panelManager', [ '$rootScope', '$compile', '$animate', '$timeout', 'PanelManagerFactory', 'PanelLayoutEngine', function($rootScope, $compile, $animate, $timeout, PanelManagerFactory, panelLayoutEngine) {

    var elements = {};

    var stylesCache = window.stylesCache = {};
    var container = angular.element('.ev-panels-container');
    var panelZero = container.find('.ev-panel-zero');

    var panelManager = PanelManagerFactory.create({
        updateLayout: function() {
            updateLayout();
        },
        getElement: function(instance) {
            if (elements[instance.$$id]) {
                return elements[instance.$$id];
            } else {
                return null;
            }
        },
        open: function(instance, options) {
            instance.$$stacked = false;
            instance.$$depth = options.depth;
            var isMain = options.depth === 0;
            if(isMain) {
                instance.isMain = true;
            }

            var el = createPlaceholder(instance.$$depth);
            var inner = createPanelView(instance, options);
            el.html(inner);
            elements[instance.$$id] = el;
            $animate.enter(el, container, panelZero, function() {
                panelManager.updateLayout();
            });
            var timerResize = null;
            el.on('resize', function(event, ui) {
                if(timerResize !== null) {
                    $timeout.cancel(timerResize);
                }
                timerResize = $timeout(function() {
                    stylesCache[options.panelName] = ui.size.width;
                    panelManager.updateLayout();
                }, 100);
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
            'class="ev-panel-placeholder ' + (isMain ? 'ev-panel-main' : '') + '" ' +
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
     * Whenever a layout is changed
     */
    function updateLayout() {
        panelLayoutEngine.checkStacking(panelManager);
        $rootScope.$broadcast('module-layout-changed');
    }

    var timerWindowResize = null;
    $(window).on('resize', function() {
        if(timerWindowResize !== null) {
            $timeout.cancel(timerWindowResize);
        }
        timerWindowResize = $timeout(function() {
            panelManager.updateLayout();
        }, 100);
    });

    return panelManager;
}]);