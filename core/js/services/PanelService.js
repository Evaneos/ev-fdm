const DEFAULT_CONTAINER_ID = 'ev-default-panels-container';
const MAX_VISIBLE_PANEL = 3;

angular.module('ev-fdm')
    .service('PanelService', ['$animate', '$q', '$http', '$templateCache', '$compile', '$rootScope', '$timeout', 
        '$window', function ($animate, $q, $http, $templateCache, $compile, $rootScope, $timeout, 
            $window) {

        var containers   = {};
        var panelsList   = {};
        var stylesCache  = window.stylesCache = {};
        var self         = this;
        
        var addToDom = function (panel, containerId) {
            var container = containers[containerId];
            if (!container || panel.element.parent().length) {
                return;
            }

            // If no panel index, or no panel inside the container, it is added at the end
            if (!panel.index || !container.children().length) {
                $animate.move(panel.element, container, null, function () {
                    updateLayout(null, containerId);
                });
            } else {
                var beforePanel = getBeforePanelElm(panel.index, containerId);
                    $animate.move(panel.element, container, beforePanel.element, function () {
                        updateLayout(null, containerId);
                });
            }
        };

        function getBeforePanelElm(index, containerId) {
            var beforePanel = null;
            var panels = Object.keys(panelsList[containerId]).map(function (panelName) {
                return panelsList[containerId][panelName];
            });
            panels
                .filter(function (panel) {
                    return panel.element.parent().length;
                })
                .filter(function (panel) {
                    return panel.index;
                })
                .some(function (insertedPanel) {
                    var isBeforePanel = insertedPanel.index > index;
                    if (isBeforePanel) {
                        beforePanel = insertedPanel;
                    }
                    return !isBeforePanel;
                });
            return (beforePanel || panels[0]).element;
        }

        /**
         * Panel options are:
         * - name
         * - template or templateURL
         * - index
         */
        this.open = function (panel, id) {
            if (!id) {
                id = DEFAULT_CONTAINER_ID;
            }
            var panels = panelsList[id] = panelsList[id] || {};

            if (!panel.name && panel.panelName) {
                console.log("Deprecated: use name instead of panelName");
                panel.name = panel.panelName;
            }

            if (!panel) {
                console.log("A panel must have a name (options.name)");
                return;
            }

            // Change panelName to panel-name
            var name = panel.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

            if (panels[name]) {
                return panels[name];
            }
            
            var element = angular.element('<div class="container-fluid ev-panel ev-panel-' + 
                    name + '" ev-responsive-viewport style="' + getStylesFromCache(name, panel) + '">' + 
                    '</div>');
            var templatePromises = getTemplatePromise(panel);
            panels[name] = panel;
            panel.element = element;

            return templatePromises.then(function(template) {
                element.html(template);
                element = $compile(element)($rootScope.$new());
                panel.element  = element;
                element.resizable({
                    handles: "e",
                    helper: "ui-resizable-helper",
                });
                
                element.on('resizestop', function(event, ui) {
                    // resizable plugin does an unwanted height resize
                    // so we cancel the height set.
                    $(this).css("height","");

                    var afterPanel = element.next('.ev-panel');
                    var delta = ui.size.width - ui.originalSize.width;
                    afterPanel.width(afterPanel.width() - delta);
                    element.width(ui.size.width);
                    stylesCache[panel.panelName] = ui.size.width;
                    updateLayout(self, id);
                })
                .on('resize', function () {
                    // Prevent jquery ui to do weird things 
                    return false;
                });
                addToDom(panel, id);
                return panel;
            });
        };


        this.getPanels = function (containerId) {
            if (!containerId) {
                containerId = DEFAULT_CONTAINER_ID;
            }
            return panelsList[containerId];
        };

        this.close = function(name, containerId) {
            // Change panelName to panel-name
            name = name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

            if (!containerId) {
                containerId = DEFAULT_CONTAINER_ID;
            }
            var panels = panelsList[containerId];

            if (!name || !panels[name]) {
                console.log("Panel not found for: " + name);
            }

            var element  = panels[name].element;
            delete panels[name];
            $animate.leave(element, function() {
                updateLayout(null, containerId);
            });
        };          

        /**
         * Registers a panels container
         *
         * element : DOM element
         */
        this.registerContainer = function(container, containerId) {
            if (!containerId) {
                containerId = DEFAULT_CONTAINER_ID;
            }
            if (!containers[containerId]) {
                containers[containerId] = container;
                if (!panelsList[containerId]) {
                    return;
                }

                Object.keys(panelsList[containerId]).forEach(function (panelName) {
                    var panel = panelsList[containerId][panelName];
                    addToDom(panel, containerId);
                });
            }
        };



        var timerWindowResize = null;
        angular.element($window).on('resize', function() {
            if(timerWindowResize !== null) {
                $timeout.cancel(timerWindowResize);
            }
            timerWindowResize = $timeout(function() {
                updateLayout();
            }, 200);
        });         

        function getStylesFromCache(name, options) {
            var savedWidth = stylesCache[name];
            if (savedWidth) {
                return 'width: ' + savedWidth + 'px;';
            }

            return '';
        }

        function getTemplatePromise(options) {
            if (options.template || options.templateURL) {
                return $q.when(options.template);
            }

            return $http.get(options.templateUrl, {cache: $templateCache}).then(function (result) {
                return result.data;
            });
        }

       
        function updateLayout(element, containerId) {
            if (!containerId) {
                Object.keys(containers).map(function (id) {
                    updateLayout(null, id);
                });
                return this;
            }
            var container = containers[containerId];
            var panelElements = $.makeArray(angular.element(container).children('.ev-panel'));
            
            if (element) {
                for (var i = 0; i < panelElements.length; i++) {
                    var current = panelElements[i];
                    if (element == current) {
                        panelElements.splice(i, 1);
                        panelElements.push(element);
                        break;
                    }
                }
            }

            checkStacking(panelElements, container);
        }

        function checkStacking(panels, container) {
            panels.forEach(function (panel) {
                angular.element(panel).removeClass('ev-stacked');
            });
            // Check if number of panels > NUM STACKED MAX
            if (panels.length > MAX_VISIBLE_PANEL) {
                panels.slice(0, -MAX_VISIBLE_PANEL).forEach(function (panel) {
                    angular.element(panel).addClass('ev-stacked');
                });
            }
            // Starting from the first non stack panel, 
            var i = panels.slice(0, -MAX_VISIBLE_PANEL).length;
            // Stack until overflow does not exists anymore (or we run out of panels)
            while (container[0].offsetWidth < container[0].scrollWidth && i < panels.length) {
                angular.element(panels[i]).addClass('ev-stacked');
                i ++;
            }
        }

        return this;
    }])
    .directive('evPanels', ['PanelService', function(panelService) {
        return {
            restrict: 'AE',
            scope: {},
            replace: true,
            template: '<div class="ev-panels-container"></div>',
            link: function (scope, element, attrs) {
              panelService.registerContainer(element, attrs.id);
            }
        };
    }]);
