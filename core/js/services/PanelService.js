var module = angular.module('ev-fdm');

module.factory('panelFactory', function() {
    var Panel = function(extensions) {
        this.blockers = [];
        _(this).extend(extensions);
    };
    Panel.prototype.addBlocker = function(blocker) {
        this.blockers.push(blocker);
    };
    Panel.prototype.removeBlocker = function(blocker) {
        this.blockers = _(this.blockers).without(blocker);
    };
    Panel.prototype.isBlocked = function(silent) {
        return _(this.blockers).some(function(blocker) {
            return blocker(silent);
        });
    };
    return {
        create: function(extensions) {
            return new Panel(extensions);
        }
    };
});

module.service('PanelService', [ '$rootScope', '$http', '$templateCache', '$q', '$injector', '$controller',  'panelManager', 'panelFactory', function($rootScope, $http, $templateCache, $q, $injector, $controller, panelManager, panelFactory) {

    // Identifies all panels
    var currentId = 1;

    function parseOptions(options) {
        options = options || {};

        if (!options.template && !options.templateUrl && !options.content) {
            throw new Error('Should define options.template or templateUrl or content');
        }

        // Retrieve the last panel
        var last = panelManager.last();

        /**
         * Parse the opening options (replace or pushFrom)
         */
        if(options.replace) {
            if(angular.isString(options.replace)) {
                //We can use 'panel-main' as a special panel name
                if(options.replace === 'panel-main') {
                    options.replace = getMainPanel();
                } else {
                    options.replace = getPanel(options.replace);
                }
            } else if(options.replace === true) {
                options.replace = last;
            }
        } else if (options.pushFrom) {
            if(angular.isString(options.pushFrom)) {
                options.pushFrom = getPanel(options.pushFrom);
            }

            if(options.pushFrom !== null && options.pushFrom != last) {
                options.replace = panelManager.getNext(options.pushFrom);
            }
        }

        if(!options.replace && !options.pushFrom) {
            options.pushFrom = last;
        }

        options.panelName = options.panelName || '';

        options.panelClass = options.panelName || '';
        options.panelClass += ' right';

        options.resolve = options.resolve || {};
        return options;
    }

    function getTemplatePromise(options) {
        return options.content ? $q.when(options.content) :
            options.template ? $q.when(options.template) :
            $http.get(options.templateUrl, {
                cache: $templateCache
            }).then(function(result) {
                return result.data;
            });
    }

    function getResolvePromises(resolves) {
        var promises = [];
        angular.forEach(resolves, function(value) {
            if (angular.isFunction(value) || angular.isArray(value)) {
                promises.push($q.when($injector.invoke(value)));
            }
        });
        return promises;
    }

    function getPromises(options) {
        return [getTemplatePromise(options)].concat(getResolvePromises(options.resolve));
    }

    function resolveAll(options) {
        return $q.all(getPromises(options))
            .then(function(contentAndLocals) {
                // variables injected in the controller
                var locals = {};
                var i = 1;
                angular.forEach(options.resolve, function(value, key) {
                    locals[key] = contentAndLocals[i++];
                });
                return {
                    content: contentAndLocals[0],
                    locals: locals
                };
            });
    }

    /**
     * Resolves everything needed to the view (templates, locals)
     * + creates the controller, scope
     * + finally creates the view
     */
    function createInstance(options, done) {
        var self = this;
        var resultDeferred = $q.defer();
        var openedDeferred = $q.defer();

        var instance = panelFactory.create({
            panelName : options.panelName,
            result: resultDeferred.promise,
            opened: openedDeferred.promise,
            close: function(result) {
                if (!instance.isBlocked()) {
                    var notCancelled = panelManager.dismissChildren(instance, 'parent closed');
                    if (!notCancelled) {
                        return false;
                    }
                    panelManager.close(instance, options);
                    panelManager.remove(instance);
                    resultDeferred.resolve(result);
                    return true;
                }
                return false;
            },
            dismiss: function(reason) {
                if (!instance.isBlocked()) {
                    var notCancelled = panelManager.dismissChildren(instance, 'parent dismissed');
                    if (!notCancelled) {
                      return false;
                    }
                    panelManager.close(instance, options);
                    panelManager.remove(instance);
                    resultDeferred.reject(reason);
                    return true;
                }
                return false;
            }
        });

        resolveAll(options)
            .then(function(contentAndLocals) {

                // create scope
                var scope = (options.scope || $rootScope).$new();
                scope.$close = instance.close;
                scope.$dismiss = instance.dismiss;

                // fires the controller
                var controller;
                if (options.controller) {
                    var locals = contentAndLocals.locals;
                    locals.$scope = scope;
                    locals.$instance = instance;
                    controller = $controller(options.controller, locals);
                }

                // add variables required by panelManager
                options.scope = scope;
                options.deferred = resultDeferred;
                options.content = contentAndLocals.content;

                // finally open the view
                if (options.replace) {
                    panelManager.replace(options.replace, instance, options);
                    panelManager.remove(options.replace, options);
                } else {
                    panelManager.open(instance, options);
                }
            })
            .then(function() {
                openedDeferred.resolve(true);
            }, function() {
                openedDeferred.resolve(false);
            });

        return instance;
    }

    /**
     * Get a panel instance via his name
     */
    function getPanel(panelName) {
        var panel = panelManager.panels.find(function(_panel) {
            return _panel.panelName === panelName;
        });

        return panel || null;
    }

    /**
     * Get the main panel instance
     */
    function getMainPanel() {
        var mainPanel = panelManager.panels.first();
        // var mainPanel = panelManager.panels.find(function(_panel) {
        //     return _panel.isMain === true;
        // });

        return mainPanel || null;
    }

    /**
     * Return a boolean if either the panel exist or not
     */
    function hasPanel(panelName) {
        return getPanel(panelName) != null;
    }

    /**
     * @param {Object} options
     *        - {Mixed} template / templateUrl / content
     *        - (optional) {String} controller
     *        - (optional) {Mixed} scope
     *        - (optional) {Object} resolve
     *        - (optional) {String} panelName
     *        - (optional) {Mixed} pushFrom :
     *                            + {String} : the panel name
     *                            + {Object} : the panel instance
     *        - (optional) {Mixed} replaceAt :
     *                            + {String} : the panel name
     *                            + {Object} : the panel instance
     *                            + {Boolean}: if true replace the last panel
     *
     * @return {Object} The panel instance or null if something wrong occured
     */
    function open(options) {
        options = parseOptions(options);

        var instance;

        if (options.replace) {
            var result = panelManager.dismissChildren(options.replace, 'parent replaced');
            // some child might have canceled the close
            if (!result) {
                return null;
            }
        }

        if (options.replace && options.replace.isBlocked()) {
            return null;
        }

        // Contains the panel 'depth'
        options.depth = panelManager.panels.size();
        instance = createInstance(options);

        // Attach some variables to the instance
        instance.$$id = currentId++;

        panelManager.push(instance);

        return instance;
    }

    var panelService = {
        getPanel : getPanel,
        hasPanel : hasPanel,
        open: open,
        dismissAll: function(reason) {
            panelManager.dismissAll(reason);
        },
        dismissChildren: function(instance, reason) {
            return panelManager.dismissChildren(instance, reason);
        }
    };

    return panelService;
}]);