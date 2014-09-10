var module = angular.module('ev-fdm');

module
    .service('PanelService', [
        '$animate', '$q', '$http', '$templateCache', '$compile', '$rootScope', '$timeout', '$window', 'PanelLayoutEngine',
        function($animate, $q, $http, $templateCache, $compile, $rootScope, $timeout, $window, panelLayoutEngine) {

        var container   = null,
            stylesCache = window.stylesCache = {}
            self        = this;

        this.panels = {};

        /**
         * Panel options are:
         * - name
         * - template or templateURL
         * - index
         */
        this.open = function(options) {
            if (!options.name && options.panelName) {
                console.log("Deprecated: use name instead of panelName")
                options.name = options.panelName;
            }

            if (!options) {
                console.log("A panel must have a name (options.name)");
                return;
            }

            var name = options.name;

            if (self.panels[name]) {
                var panel        = self.panels[name];
                panel.index      = options.index;

                var afterIndex   = findAfterElementIndex(options.index),
                    afterElement = getAfterElement(afterIndex);

                panel.element.css('z-index', 2000 + afterIndex);
                $animate.move(panel.element, container, afterElement, function() {
                    updateLayout();
                });

                return self.panels[name];
            }

            // We call it *THE BEAST*.
            var element          = angular.element('<div class="ev-panel-placeholder" ev-panel-breakpoints style="' + getStylesFromCache(name, options) + '"   ><div class="ev-panel right" ><div class="ev-panel-inner"><div class="ev-panel-content"></div></div></div></div>'),
                templatePromises = getTemplatePromise(options);
            self.panels[name]         = options;
            options.element      = element;
            options.element.css('z-index', 2000 + options.index);

            return templatePromises.then(function(template) {
                element.find('.ev-panel-content').html(template);
                element          = $compile(element)($rootScope.$new());
                options.element  = element;

                var afterIndex   = findAfterElementIndex(options.index),
                    afterElement = getAfterElement(afterIndex);

                element.on('resizestop', function(event, ui) {
                    // resizable plugin does an unwanted height resize
                    // so we cancel the height set.
                    var originalSize = ui.originalSize;
                    $(this).css("height","");

                    stylesCache[options.panelName] = ui.size.width;
                    updateLayout(self);
                }).on('resize', function(event, ui) {
                    return false;
                });

                $animate.enter(element, container, afterElement, function() {
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
            })
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
                updateLayout()
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
                return $q.when(options.template)
            }

            return $http.get(options.templateUrl, {cache: $templateCache}).then(function (result) {
                return result.data;
            });
        }

        function findAfterElementIndex(index) {
            var insertedPanels = angular.element(container).children(),
                afterIndex     = index - 1;

            if (!index || index > insertedPanels.length) {
                afterIndex = insertedPanels.length - 1;
            }
            else if (index < 1) {
                afterIndex = 0;
            }

            return afterIndex;
        }

        function getAfterElement(afterIndex) {
            var insertedPanels = angular.element(container).children(),
                domElement     = insertedPanels[afterIndex];

            return domElement ? angular.element(domElement) : null;
        }

        function updateLayout(element) {
            var panelElements = angular.element(container).children('.ev-panel-placeholder');

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
            panelLayoutEngine.checkStacking(panelElements);
        }

        return this;
    }])
    .directive('evPanels', ['PanelService', function(panelService) {
        return {
            restrict: 'AE',
            scope: {},
            replace: true,
            template: '<div class="ev-panels ev-panels-container lisette-module"><div></div></div>',
            link: function (scope, element, attrs) {
              panelService.registerContainer(element);
            }
        };
    }]);
