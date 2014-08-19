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
    var MAIN_PANEL_MIN_WIDTH = 75;
    var elements = {};

    var stylesCache = window.stylesCache = {};
    var container = angular.element('.panels-container');
    var panelZero = container.find('.panel-zero');

    var panelManager = PanelManagerFactory.create({
        updateLayout: function() {
            updateLayout();
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
     * Check if there is some panels to stack
     */
    function checkStacking() {

        var windowWidth = $(window).innerWidth();

        var dataPanels = getDataFromPanels(panelManager.panels);
        var newDataPanels = calculateStackingFromData(dataPanels, windowWidth);
        resizeAndStackPanels(panelManager.panels, newDataPanels);



        var panelStacked = false;
        var firstStacked = -1;

        // stack all
        // changeStackPanelState(panelManager.panels.size() - 1);
    }

    function getDataFromPanels(panels) {
        var data = [];
        for (var i = 0; i < panels.size(); i++) {
            var panel = panelManager.at(i);
            var panelElement = getElement(panel);
            data.push({
                minWidth: parseInt(panelElement.children().first().css('min-width')) || STACKED_WIDTH,
                maxWidth: parseInt(panelElement.children().first().css('max-width')) || 0,
                stacked:  panel.$$stacked,
                width:    panelElement.width(),
                stackedWidth: STACKED_WIDTH
            });
        }
        return data;
    }

    /**
     * {
            minWidth:
            maxWidth:
            stacked:
            width:
            stackedWidth:
        }
     * @param  array datas [description]
     * @return array       [description]
     */
    function calculateStackingFromData(datas, width) {
        _(datas).each(function(element) {
            element.stacked = false;
        });

        console.log('yo');
        console.table(datas);


        function stackedDatas() {

            for (var i = 0; i < datas.length; i++) {

                var totalMinWidth = _(datas).reduce(function(memo, data) {

                        if (data.stacked) {
                            return memo + data.stackedWidth;
                        }
                        var width = data.minWidth;
                        if(data.minWidth < data.stackedWidth) {
                            width = data.stackedWidth + 1;
                        }

                        return memo + width;
                }, 0);
                if (totalMinWidth > width) {
                    datas[i].stacked = true;
                }
            }
        }

        function updateSize() {
            for (var i = 0; i < datas.length; i++) {
                var data = datas[i];
                if (data.width < data.minWidth) {
                    data.width = data.minWidth;
                }
            }

            var totalWidth = _(datas).reduce(function(memo, data) {
                if (data.stacked) {
                    return memo + data.stackedWidth;
                }

                return memo + data.width;
            }, 0);

            var delta = width - totalWidth;

            for (var i = 0; i < datas.length; i++) {
                var data  = datas[i];

                if(data.stacked) {
                    data.width = data.stackedWidth;
                    continue;
                }

                // try to take all delta
                var oldWidth = data.width;
                var newWidth = data.width + delta;

                // Check limit
                if (data.minWidth > newWidth) {
                    data.width = data.minWidth;
                }

                // Check limit
                 else if (data.maxWidth !== 0 && data.maxWidth < newWidth) {
                    data.width = maxWidth;
                }

                else {
                    data.width = data.width + delta;
                }

                delta = delta - (data.width - oldWidth);

                if(delta === 0) {
                    break;
                }
            }

            if (delta != 0) {
                console.log('impossible to reach the size');
            }


        }
        stackedDatas(datas);
        updateSize(datas);

        return datas;
    }

    function resizeAndStackPanels(panels, dataPanels) {
        for (var i = 0; i < panels.size(); i++) {
            var panel = panelManager.at(i);
            var dataPanel = dataPanels[i];

            var element = getElement(panel);

            if(!element) {
                console.log('no element for this panel)');
                continue;
            }

            if (panel.$$stacked && !dataPanel.stacked) {
                $animate.removeClass(element, 'stacked');
            } else if (!panel.$$stacked && dataPanel.stacked) {
                $animate.addClass(element, 'stacked');
            }

            panel.$$stacked = dataPanel.stacked;

            element.children().first().width(dataPanel.width);

        }
    }

    /**
     * Whenever a layout is changed
     */
    var timerResize = null;

    function updateLayout() {
        if(timerResize !== null) {
            $timeout.cancel(timerResize);
        }

        timerResize = $timeout(function() {
            checkStacking();
            $rootScope.$broadcast('module-layout-changed');
        }, 100);
    }

    $(window).on('resize', function() {
        panelManager.updateLayout()
    });

    return panelManager;
}]);