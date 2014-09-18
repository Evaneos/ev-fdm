var module = angular.module('ev-fdm');

/**
 * STACKING AND PANELS SIZE MANAGEMENT
 */
module.service('PanelLayoutEngine', ['$animate', '$rootScope', '$window', function($animate, $rootScope, $window) {

    var STACKED_WIDTH = 35;

    /**************************
     *           #1           *
     *  Extract panels infos  *
     **************************/

    /**
     * Extract all useful panels informations
     * The (min-/max-/stacked-)width and the stacked state
     * @param  {Array} panels the panels
     * @return {Array}        Array containing the extracted values
     */
    function getDataFromPanels(panels) {
        var datas = [];
        var i = 0;
        var panelsLength = panels.size();

        angular.forEach(panels, function(panelDom) {
            var panelElement = angular.element(panelDom);

            var data = {
                minWidth: parseInt(panelElement.children().first().css('min-width')) || STACKED_WIDTH,
                maxWidth: parseInt(panelElement.children().first().css('max-width')) || 0,
                stacked:  panelElement.hasClass('stacked'),
                width:    panelElement.width(),
                stackedWidth: STACKED_WIDTH
            };

            if (data.width < data.minWidth) {
                data.width = data.minWidth;
            }

            if (data.width > data.maxWidth && data.maxWidth > 0) {
                data.width = data.maxWidth;
            }

            datas.push(data);
        });

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

                var width = data.minWidth;
                if(width < data.stackedWidth) {
                    width = data.stackedWidth;
                }

                totalMinWidth += width;
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

                var width = data.maxWidth;
                if(width < data.stackedWidth) {
                    width = data.stackedWidth;
                }

                totalMaxWidth += width;
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

        angular.forEach(datas, function(element) {
            element.stacked = false;
        });

        var nbStacked = minStacked;

        /**
         * Specific rule where, for more readability, we stack a panel.
         */
        if (((datas.length - minStacked) > 3) && (datas.length - maxStacked <= 3)) {
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
        var totalWidth = 0;

        angular.forEach(datas, function(data) {
            // Ensures the width aren't below the min
            if (data.width < data.minWidth) {
                data.width = data.minWidth;
            }

            totalWidth += data.stacked ? data.stackedWidth : data.width;
        });

        // Delta is the gap we have to reach the limit
        var delta = limit - totalWidth,
            datasLength = datas.length
            data = null;

        for (var i = 0; i < datasLength; i++) {
            data = datas[i];

            if (data.stacked) {
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
            if (delta === 0) {
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
     */
    function resizeAndStackPanels(panels, dataPanels, windowWidth) {
        // If we need to stack all the panels
        // We don't stack the last one, but we hide all the stacked panels
        var isMobile  = false;
        var lastPanel = dataPanels[dataPanels.length - 1];

        if (lastPanel.stacked === true) {
            lastPanel.stacked = false;
            lastPanel.width = windowWidth;
            isMobile = true;
        }

        var panelsSize = panels.size();
        var panel, element = null;

        panels.css('left', 0);

        angular.forEach(panels, function(domElement, i) {
            var element   = angular.element(domElement),
                dataPanel = dataPanels[i];

            if (!element) {
                console.log('no element for this panel)');
                return;
            }

            if (element.hasClass('stacked') && !dataPanel.stacked) {
                $animate.removeClass(element, 'stacked');
                $animate.removeClass(element, 'stacked-mobile');
            } else if (!element.hasClass('stacked') && dataPanel.stacked) {
                $animate.addClass(element, 'stacked');

                if (isMobile) {
                    $animate.addClass(element, 'stacked-mobile');
                }
            }

            element.width(dataPanel.width + "px");
        });
    }

    /**************************
     *         MAIN           *
     **************************/

    /**
     * Check the stacking and so on
     */
    function checkStacking(panels) {
        var windowWidth   = angular.element($window).innerWidth();

        // #1 - We extract the data from our panels (width, and so on)
        var rawDataPanels = getDataFromPanels(panels);

        // #2 - We compute these new data with our specifics rules (agnostic algorithm)
        var dataPanels    = calculateStackingFromData(rawDataPanels, windowWidth);

        // #3 - We apply these new values to our panels
        resizeAndStackPanels(panels, dataPanels, windowWidth);

        $rootScope.$broadcast('module-layout-changed');
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
