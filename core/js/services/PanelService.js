var module = angular.module('ev-fdm');

module
    .service('PanelService', [
        '$animate', '$q', '$http', '$templateCache', '$compile', '$rootScope',
        function($animate, $q, $http, $templateCache, $compile, $rootScope) {

        var container = null,
            panels    = {};

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

            if (panels[options.name]) {
                var panel        = panels[options.name];
                panel.index      = options.index
                var afterElement = getAfterElement(options.index);

                $animate.move(panel.element, container, afterElement);

                return panels[options.name];
            }

            var templatePromises = getTemplatePromise(options);

            panels[options.name] = options;
            var element          = angular.element('<div></div>');
            options.element      = element;

            return templatePromises.then(function(template) {
                element.html(template);
                element          = $compile(element)($rootScope.$new());
                options.element  = element;
                var afterElement = getAfterElement(options.index);

                $animate.enter(element, container, afterElement, function() {
                    console.log("new element inserted")
                });

                return options;
            });
        };

        this.close = function(name) {
            if (!name || !panels[name]) {
                console.log("Panel not found for:" + name);
            }

            var element  = panels[name].element;
            panels[name] = null;

            $animate.leave(element, function() {
                console.log("remove element:" + name);
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


        function getTemplatePromise(options) {
            if (options.template || options.templateURL) {
                return $q.when(options.template)
            }

            return $http.get(options.templateUrl, {cache: $templateCache}).then(function (result) {
                return result.data;
            });
        }

        function getAfterElement(index) {
            var insertedPanels = angular.element(container).children();
            var afterIndex     = index - 1;

            console.log("insertedPanels", insertedPanels);

            if (!index || index > insertedPanels.length) {
                afterIndex = insertedPanels.length - 1;
            }
            else if (index < 1) {
                afterIndex = 0;
            }

            var domElement = insertedPanels[afterIndex];

            return domElement ? angular.element(domElement) : null;
        }

        return this;
    }])
    .directive('panels', ['PanelService', function(panelService) {
        return {
            restrict: 'AE',
            scope: {},
            replace: true,
            template: '<div class="panels row"><div></div></div>',
            link: function (scope, element, attrs) {
              panelService.registerContainer(element);
            }
        };
    }]);
