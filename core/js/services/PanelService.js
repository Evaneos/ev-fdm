angular.module('ev-fdm')
    .service('PanelService', ['$animate', '$q', '$http', '$templateCache', '$compile', '$rootScope', '$timeout', 
        '$window', 'PanelLayoutEngine', function ($animate, $q, $http, $templateCache, $compile, $rootScope, $timeout, 
            $window, panelLayoutEngine) {

        var container   = null;
        var stylesCache = window.stylesCache = {};
        var self        = this;

        this.panels = {};

        /**
         * Panel options are:
         * - name
         * - template or templateURL
         * - index
         */
        this.open = function(options) {
            if (!options.name && options.panelName) {
                console.log("Deprecated: use name instead of panelName");
                options.name = options.panelName;
            }

            if (!options) {
                console.log("A panel must have a name (options.name)");
                return;
            }

            // Change panelName to panel-name
            var name = options.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

            if (self.panels[name]) {
                var panel        = self.panels[name];
                panel.index      = options.index;

                var beforeIndex   = findBeforeElementIndex(options.index),
                    beforeElement = getBeforeElement(beforeIndex);

                panel.element.css('z-index', 2000 + beforeIndex);
                $animate.move(panel.element, container, beforeElement, function() {
                    updateLayout();
                });

                return self.panels[name];
            }

            // We call it *THE BEAST*.
            var element          = angular.element('<div class="ev-panel container-fluid ev-panel-' + 
                    name + '" ev-responsive-viewport style="' + getStylesFromCache(name, options) + '"></div>');
            var templatePromises = getTemplatePromise(options);
            self.panels[name]    = options;
            options.element      = element;

            return templatePromises.then(function(template) {
                element.html(template);
                element          = $compile(element)($rootScope.$new());
                options.element  = element;

                var beforeIndex   = findBeforeElementIndex(options.index),
                    beforeElement = getBeforeElement(beforeIndex);

                element.resizable({
                    handles: "w",
                    helper: "ui-resizable-helper",
                });
                
                element.on('resizestop', function(event, ui) {
                    // resizable plugin does an unwanted height resize
                    // so we cancel the height set.
                    $(this).css("height","");

                    var delta = ui.size.width - ui.originalSize.width;
                    beforeElement.width(beforeElement.width() - delta);
                    element.width(ui.size.width);
                    console.log('after width', element.width());

                    stylesCache[options.panelName] = ui.size.width;
                    
                    updateLayout(self);

                            });

                $animate.enter(element, container, beforeElement, function() {
                    updateLayout();
                });
            
                return options;
            });
        };

        this.close = function(name) {
            if (!name || !self.panels[name]) {
                console.log("Panel not found for:" + name);
            }

            var element  = self.panels[name].element;
            self.panels[name] = null;

            $animate.leave(element, function() {
                updateLayout();
            });
        };          

        /**
         * Registers a panels container
         *
         * element : DOM element
         */
        this.registerContainer = function(element) {
            container = element;
        };

        var timerWindowResize = null;
        angular.element($window).on('resize', function() {
            if(timerWindowResize !== null) {
                $timeout.cancel(timerWindowResize);
            }
            timerWindowResize = $timeout(function() {
                updateLayout();
            }, 100);
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

        function findBeforeElementIndex(index) {
            var insertedPanels = angular.element(container).children(),
                beforeIndex     = index - 1;

            if (!index || index > insertedPanels.length) {
                beforeIndex = insertedPanels.length - 1;
            }
            else if (index < 1) {
                beforeIndex = 0;
            }

            return beforeIndex;
        }

        function getBeforeElement(beforeIndex) {
            var insertedPanels = angular.element(container).children(),
                domElement     = insertedPanels[beforeIndex];

            return domElement ? angular.element(domElement) : null;
        }

        function updateLayout(element) {
            var panelElements = angular.element(container).children('.ev-panel');
            
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
            var containerWidth = angular.element(container).innerWidth(); 
            panelLayoutEngine.checkStacking(panelElements, containerWidth);
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
              panelService.registerContainer(element);
            }
        };
    }]);
