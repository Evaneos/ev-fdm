var module = angular.module('ev-fdm');

/**
 * STACKING AND PANELS SIZE MANAGEMENT
 */
module.service('PanelLayoutEngine', ['$animate', function($animate) {

    var STACKED_WIDTH = 35;

    /**************************
     *           #1           *
     *  Extract panels infos  *
     **************************/

    /**
     * Extract all useful panels informations
     * The (min-/max-/stacked-)width and the stacked state
     * @param  {Array} panels the panels
     * @param  {Object}  panelManager (we need a function from it.. TO refactor.)
     * @return {Array}        Array containing the extracted values
     */
    function getDataFromPanels(panels, panelManager) {
        var datas = [];
        var i = 0;
        var panelsLength = panels.size();

        for (; i < panelsLength; i++) {
            var panel = panels._wrapped[i]; // Dealing with a _ object, yeah..
            var panelElement = panelManager.getElement(panel);
            datas.push({
                minWidth: parseInt(panelElement.children().first().css('min-width')) || STACKED_WIDTH,
                maxWidth: parseInt(panelElement.children().first().css('max-width')) || 0,
                stacked:  panel.$$stacked,
                width:    panelElement.width(),
                stackedWidth: STACKED_WIDTH
            });
        }

        return datas;
    }

    /**************************
     *           #2           *
     *      Compute datas     *
     **************************/

    /**
     * Count the minimal number of panels that need to be stacked
     */
    function countMinStacked(datas, limit) {
        var minStacked = 0;
        var i = 0;
        var j = 0;
        var datasLength = datas.length;
        var totalMinWidth = 0;
        var data = null;

        for (; i < datasLength; i++) {
            totalMinWidth = 0;

            for(j = 0; j < datasLength; j++) {
                data = datas[j];

                if (j < i) {
                    totalMinWidth += data.stackedWidth;
                    continue;
                }

                var _width = data.minWidth;
                if(_width < data.stackedWidth) {
                    _width = data.stackedWidth;
                }

                totalMinWidth += _width;
            }

            if (totalMinWidth > limit) {
                minStacked++;
            }
        }

        return minStacked;
    }

    /**
     * Count the maximal number of panels that can be stacked
     */
    function countMaxStacked(datas, limit) {
        var maxStacked = datas.length;
        var datasLength = datas.length;
        var i = datasLength;
        var j = 0;
        var totalMaxWidth = 0;
        var data = null;

        for (; i > 0; i--) {
            totalMaxWidth = 0;

            for(j = 0; j < datasLength; j++) {
                data = datas[j];

                if (j < i) {
                    totalMaxWidth += data.stackedWidth;
                    continue;
                }

                var _width = data.maxWidth;
                if(_width < data.stackedWidth) {
                    _width = data.stackedWidth;
                }

                totalMaxWidth += _width;
            }

            if (totalMaxWidth < limit) {
                maxStacked--;
            }
        }

        return maxStacked;
    }

    /**
     * For each panels, test if he needs to be stacked
     */
    function updateStackState(datas,limit) {

        var minStacked = countMinStacked(datas, limit);
        var maxStacked = countMaxStacked(datas, limit);

        _(datas).each(function(element) {
            element.stacked = false;
        });

        var nbStacked = minStacked;

        /**
         * Specific rule where, for more readability, we stack a panel.
         */
        if(((datas.length - minStacked) > 3) && (datas.length - maxStacked <= 3)) {
            nbStacked = datas.length - 3;
        }

        var i = 0;
        for(; i < nbStacked; i++) {
            datas[i].stacked = true;
        }

        return {
            nbStacked: nbStacked,
            datas: datas
        };
    }

    /**
     * Update the size of each panels
     */
    function updateSize(datas, limit) {
        var data = null;

        // Ensures the width aren't below the min
        _(datas).each(function(data) {
            if(data.width < data.minWidth) {
                data.width = data.minWidth;
            }
        });

        // Total width of all datas
        var totalWidth = _(datas).reduce(function(memo, data) {
            if(data.stacked) {
                return memo + data.stackedWidth;
            }

            return memo + data.width;
        }, 0);

        // Delta is the gap we have to reach the limit
        var delta = limit - totalWidth;
        var i = 0;
        var datasLength = datas.length;
        for (i = 0; i < datasLength; i++) {
            data = datas[i];

            if(data.stacked) {
                data.width = data.stackedWidth;
                continue;
            }

            // Try to add all the delta at once
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

            // Break if there is no more delta
            if(delta === 0) {
                break;
            }
        }

        // if (delta !== 0) {
        //     return false;
        // }

        return datas;
    }

    /**
     * Calculate datas from the dataPanels received accordingly to a max width
     * @param  {Array}  datas Panels data
     * @param  {Int}    limit limit width]
     * @return {Array}  datas computed
     */
    function calculateStackingFromData(datas, limit) {

        var result = updateStackState(datas, limit);
        datas      = result.datas;

        // If we don't need to stack all the panels (which is a specific case not handled here)
        if(result.nbStacked !== datas.length) {
            datas = updateSize(datas, limit);
        }

        return datas;
    }

    /*****************************
     *           #3              *
     * Apply new datas to panels *
     *****************************/

     /**
     * Apply our results to the panels
     * @param  {Array}   panels      the panels
     * @param  {Array}   dataPanels  the datas we want to apply
     * @param  {Int}     windowWidth the windowWidth
     * @param  {Object}  panelManager (we need a function from it.. TO refactor.)
     */
    function resizeAndStackPanels(panels, dataPanels, windowWidth, panelManager) {
        // If we need to stack all the panels
        // We don't stack the last one, but we hide all the stacked panels
        var isMobile  = false;
        var lastPanel = dataPanels[dataPanels.length - 1];
        if(lastPanel.stacked === true) {
            lastPanel.stacked = false;
            lastPanel.width = windowWidth;
            isMobile = true;
        }

        var i = 0;
        var panelsSize = panels.size();
        var panel, dataPanel, element = null;
        for (; i < panelsSize; i++) {
            panel = panels._wrapped[i]; // Dealing with a _ object, yeah..
            dataPanel = dataPanels[i];
            element = panelManager.getElement(panel);

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

    /**************************
     *         MAIN           *
     **************************/

    /**
     * Check the stacking and so on
     * The first args is panelManager because we need panels and a (stupid! to refactor) method from it..
     */
    function checkStacking(panelManager) {

        var panels = panelManager.panels;

        var windowWidth   = $(window).innerWidth();

        // #1 - We extract the data from our panels (width, and so on)
        var rawDataPanels = getDataFromPanels(panels, panelManager);

        // #2 - We compute these new data with our specifics rules (agnostic algorithm)
        var dataPanels    = calculateStackingFromData(rawDataPanels, windowWidth);

        // #3 - We apply these new values to our panels
        resizeAndStackPanels(panels, dataPanels, windowWidth, panelManager);
    }


    /**
     * The panelLayoutEngine
     * @type {Object}
     */
    var panelLayoutEngine = {
        checkStacking: checkStacking
    };

    return panelLayoutEngine;
}]);