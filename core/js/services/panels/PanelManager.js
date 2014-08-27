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

module.service('panelManager', [ '$rootScope', '$compile', '$animate', '$timeout', 'PanelManagerFactory', function($rootScope, $compile, $animate, $timeout, PanelManagerFactory) {

    var STACKED_WIDTH = 35;
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
     * STACKING AND PANELS SIZE MANAGEMENT
     */

    /**
     * Our main function for the stacking and panels management
     */
    function checkStacking() {

        var windowWidth = $(window).innerWidth();

        var dataPanels    = getDataFromPanels(panelManager.panels);
        var newDataPanels = calculateStackingFromData(dataPanels, windowWidth);

        var isMobile = false;
        var lastPanel = newDataPanels[newDataPanels.length -1];
        if(lastPanel.stacked === true) {
            lastPanel.stacked = false;
            lastPanel.width = windowWidth;
        }

        resizeAndStackPanels(panelManager.panels, newDataPanels, isMobile);
    }

    /**
     * Extract all useful panels informations
     * The (min-/max-/stacked-)width and the stacked state
     * @param  {Array} panels the panels
     * @return {Array}        Array containing the extracted values
     */
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


    function countMinStacked(datas, limit) {
        var minStacked = 0;

        for (var i = 0; i < datas.length; i++) {
            var memo = 0;
            var data = null;

            for(var j = 0; j < datas.length; j++) {
                data = datas[j];

                if (j < i) {
                    memo += data.stackedWidth;
                    continue;
                }

                var _width = data.minWidth;
                if(_width < data.stackedWidth) {
                    _width = data.stackedWidth;
                }

                memo += _width;
            }

            if (memo > limit) {
                minStacked++;
            }
        }

        return minStacked;
    }

    function countMaxStacked(datas, limit) {
        var maxStacked = datas.length;

        for (var i = datas.length; i > 0; i--) {
            var memo = 0;
            var data = null;

            for(var j = 0; j < datas.length; j++) {
                data = datas[j];

                if (j < i) {
                    memo += data.stackedWidth;
                    continue;
                }

                var _width = data.maxWidth;
                if(_width < data.stackedWidth) {
                    _width = data.stackedWidth;
                }

                memo += _width;
            }

            if (memo < limit) {
                maxStacked--;
            }
        }

        return maxStacked;
    }

    /**
     * Calculate datas from the dataPanels received accordingly to a max width
     * @param  {Array}  datas Panels data
     * @param  {Int}    limit limit width]
     * @return {Array}  datas computed
     */
    function calculateStackingFromData(datas, limit) {

        /**
         * For each panels, test if he needs to be stacked
         */
        function stackedDatas() {

            var minStacked = countMinStacked(datas, limit);
            var maxStacked = countMaxStacked(datas, limit);

            _(datas).each(function(element) {
                element.stacked = false;
            });

            var nbStacked = minStacked;

            if(((datas.length - minStacked) > 3) && datas.length - maxStacked <= 3) {
                nbStacked = datas.length - 3;
            }

            for(var i = 0; i < nbStacked; i++) {
                datas[i].stacked = true;
            }

            return nbStacked;
        }


        /**
         * Update the size of each panels
         */
        function updateSize() {
            var data = null;
            var i = 0;
            for (; i < datas.length; i++) {
                data = datas[i];
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

            var delta = limit - totalWidth;

            for (i = 0; i < datas.length; i++) {
                data = datas[i];

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
                    data.width = data.maxWidth;
                } else {
                    data.width = data.width + delta;
                }

                delta = delta - (data.width - oldWidth);

                if(delta === 0) {
                    break;
                }
            }

            if (delta !== 0) {
                return false;
            }
        }

        var nbStacked = stackedDatas(datas);

        if(nbStacked !== datas.length) {
            updateSize(datas);
        }

        return datas;
    }

    /**
     * Apply our results to the panels
     * @param  {Array}   panels      the panels
     * @param  {Array}   dataPanels  the datas we want to apply
     * @param  {Boolean} isMobile    hide the stacked panels
     */
    function resizeAndStackPanels(panels, dataPanels, isMobile) {
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
                $animate.removeClass(element, 'stacked-mobile');
            } else if (!panel.$$stacked && dataPanel.stacked) {
                $animate.addClass(element, 'stacked');

                if(isMobile) {
                    $animate.addClass(element, 'stacked-mobile');
                }
            }

            panel.$$stacked = dataPanel.stacked;

            element.children().first().width(dataPanel.width);

        }
    }

    /**
     * Whenever a layout is changed
     */
    function updateLayout() {
        checkStacking();
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