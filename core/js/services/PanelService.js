const DEFAULT_CONTAINER_ID = 'ev-default-panels-container';
const MAX_VISIBLE_PANEL = 3;

angular.module('ev-fdm')
    .service('PanelService', ['$animate', '$q', '$http', '$templateCache', '$compile', '$rootScope', '$timeout',
        '$window', function ($animate, $q, $http, $templateCache, $compile, $rootScope, $timeout,
            $window) {

        var containers   = {};
        var panelsList   = {};

        var addToDom = function (panel, containerId) {
            var container = containers[containerId];
            if (!container || panel.element.parent().length) {
                return;
            }

            // If no panel index, or no panel inside the container, it is added at the end
            if (!panel.index || !container.children().length) {
                $animate.enter(panel.element, container, null, function () {
                    updateLayout(null, containerId);
                });
            } else {
                var beforePanel = getBeforePanelElm(panel.index, containerId);
                    $animate.enter(panel.element, container, beforePanel.element, function () {
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
                    name + '" ev-responsive-viewport ev-resizable-column>' +
                    '</div>');
            var templatePromises = getTemplatePromise(panel);
            panels[name] = panel;
            panel.element = element;

            return templatePromises.then(function(template) {
                element.html(template);
                element = $compile(element)($rootScope.$new());
                panel.element  = element;
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
                console.log("Panel not found for: " + name + " in container: " + containerId);
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


            checkStacking(panelElements, container);
        }

        function checkStacking(panels, container) {
            panels.forEach(function (panel) {
                angular.element(panel).removeClass('ev-stacked');
                // We reset the width each time we update the layout
                angular.element(panel).css('minWidth', '');
                angular.element(panel).css('maxWidth', '');
            });
            // We stack panels until there is only three left
            if (panels.length > MAX_VISIBLE_PANEL) {
                panels.slice(0, -MAX_VISIBLE_PANEL).forEach(function (panel) {
                    angular.element(panel).addClass('ev-stacked');
                });
            }
            // Starting from the first non stack panel,
            var i = panels.slice(0, -MAX_VISIBLE_PANEL).length;
            // Stack until overflow does not exists anymore (or we arrive to the last panel)
            while (container[0].offsetWidth < container[0].scrollWidth && i < panels.length - 1) {
                angular.element(panels[i]).addClass('ev-stacked');
                i ++;
            }
            var panel = angular.element(panels[i]);
            panel.css('minWidth', panel.width() - container[0].scrollWidth + container[0].offsetWidth);
            panel.css('maxWidth', container[0].offsetWidth);
            $rootScope.$broadcast('module-layout-changed');
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
