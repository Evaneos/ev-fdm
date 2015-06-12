'use strict';


angular.module('ev-fdm')
    .directive('evResizableColumn', ['$window', '$rootScope', function($window, $rootScope) {

        function getLimitWidth(elm, minOrMax) {
            var limitWidth  = elm.css(minOrMax + '-width').replace('px', '');
            return (limitWidth !== "none") ? limitWidth : null;
        }
        function getMinDelta (elm, width) {
            return (getLimitWidth(elm, 'min') || 0) - width; 
        }

        function getMaxDelta (elm, width) {
            return (getLimitWidth(elm, 'max') || Number.POSITIVE_INFINITY) - width; 
        }
        return {
            restrict: 'A',
            scope: false,
            link: function (scope, elm, attr) {
                var handleElm = angular.element('<div class="ev-resizable-column-handle"></div>'); 
                elm.append(handleElm);
                handleElm.on('mousedown', function (event) {
                    var x1 = event.pageX;
                    document.body.style.cursor = "ew-resize";
                    event.stopPropagation();
                    var nextElm = elm.next();

                    elm.addClass('unselectable');
                    nextElm.addClass('unselectable');
                    

                    var elmWidth = elm.outerWidth();
                    var nextElmWidth = nextElm.outerWidth();
                    
                    // COMPUTE MAX AND MIN DELTA (reset min width)
                    nextElm.css('min-width', '');
                    elm.css('min-width', '');

                    var maxDelta = Math.min(getMaxDelta(elm, elmWidth), -getMinDelta(nextElm, nextElmWidth));
                    var minDelta = Math.max(getMinDelta(elm, elmWidth), -getMaxDelta(nextElm, nextElmWidth));

                    // Reassign min width
                    nextElm.css('min-width', nextElmWidth);
                    elm.css('min-width', elmWidth);

                    // Creating the helper
                    var helper = angular.element('<div class="ev-resizable-helper"></div>');
                    helper.css('min-width', nextElmWidth - maxDelta);
                    helper.css('max-width', nextElmWidth - minDelta);
                    helper.width(nextElmWidth);
                    nextElm.append(helper);


                    var onMousemove = function (event) {
                        var delta = event.pageX - x1;
                        helper.width(nextElmWidth - delta);
                    };

                    var onMouseup = function (event) {
                        document.body.style.cursor = null;
                        var delta = event.pageX - x1;
                        // Bound the delta based on min/max width of the two columns 
                        if (delta > 0) {
                            delta = Math.min(delta, maxDelta);
                        } else {
                            delta = Math.max(delta, minDelta);
                        }

                        // Apply new width
                        // NB: as we are dealing with flexbox we are obliged to use minWidth
                        elm.css('minWidth', elmWidth + delta);
                        nextElm.css('minWidth', nextElmWidth - delta);

                        // Remove helpers
                        helper.remove();

                        $window.removeEventListener('mouseup', onMouseup);  
                        $window.removeEventListener('mousemove', onMousemove);  

                        elm.removeClass('unselectable');
                        nextElm.removeClass('unselectable');
                        $rootScope.$broadcast('module-layout-changed');
                    };

                    $window.addEventListener('mouseup', onMouseup);  
                    $window.addEventListener('mousemove', onMousemove);
                });

            }
        };
    }]);