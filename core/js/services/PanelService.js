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

module.factory('sidonieRegion', function() {
    function shouldBeOverriden(name) {
        return function() {
            throw new Error('Method ' + name + ' should be overriden');
        };
    }
    var Region = function(hasPush) {
        this.hasPush = hasPush;
        this.panels = _([]);
    };
    Region.prototype.open = shouldBeOverriden('open');
    Region.prototype.close = shouldBeOverriden('close');
    Region.prototype.push = function(instance) {
        this.panels.push(instance);
    };
    Region.prototype.remove = function(instance) {
        var i = this.panels.indexOf(instance);
        if (i > -1) {
            this.panels.splice(i, 1);
        }
        return i;
    };
    Region.prototype.at = function(index) {
        return this.panels._wrapped[index];
    };
    Region.prototype.each = function() {
        return this.panels.each.apply(this.panels, arguments);
    };
    Region.prototype.dismissAll = function(reason) {
        // dismiss all panels except the first one
        var i = 0;
        this.each(function(instance) {
            if(i !== 0) {
                instance.dismiss(reason);
            }
            i++;
        });
    };
    Region.prototype.last = function() {
        return this.panels.last();
    };
    Region.prototype.getNext = function(instance) {
        var i = this.panels.indexOf(instance);
        if (i < this.panels.size() - 1) {
            return this.at(i + 1);
        } else {
            return null;
        }
    };
    Region.prototype.getChildren = function(instance) {
        var i = this.panels.indexOf(instance);
        if (i > -1) {
            return this.panels.slice(i + 1);
        } else {
            return [];
        }
    };
    Region.prototype.size = function() {
        return this.panels.size();
    };
    Region.prototype.isEmpty = function() {
        return this.panels.size() === 0;
    };

    return {
        create: function(hasPush, methods) {
            var ChildClass = function(hasPush) {
                return Region.call(this, hasPush);
            };
            ChildClass.prototype = _({}).extend(Region.prototype, methods);
            return new ChildClass(hasPush);
        }
    };
});

module.service('PanelService', [ '$rootScope', '$http', '$templateCache', '$q', '$injector', '$controller',  'rightRegion', 'panelFactory', function($rootScope, $http, $templateCache, $q, $injector, $controller, rightRegion, panelFactory) {

    // identifies all panels
    var currentId = 1;

    var openingTypes = {
        PUSH    : 1,       // Creates a new panel after the others
        REPLACE : 2        // Replace the panel if it already exists, and dismiss its children
    };
    var defaultOpeningType = openingTypes.PUSH;

    function parseOptions(options) {
        if (!options.template && !options.templateUrl && !options.content) {
            throw new Error('Should define options.template or templateUrl or content');
        }

        if (!openingTypes[options.openingType]){
            options.openingType = defaultOpeningType;
        }
        options.panelName = options.panelClass || '';

        options.panelClass = options.panelClass || '';
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

    function dismissChildren(region, instance, reason) {
        var children = region.getChildren(instance);
        for (var i = children.length - 1; i >= 0; i--) {
            var child = children[i];
            var result = child.dismiss(reason);
            if (!result) {
                return false;
            }

        }
        return true;
    }

    /**
     * Resolves everything needed to the view (templates, locals)
     * + creates the controller, scope
     * + finally creates the view
     */
    function createInstance(region, options, done) {
        var self = this;
        var resultDeferred = $q.defer();
        var openedDeferred = $q.defer();

        var instance = panelFactory.create({
            panelName : options.panelName,
            result: resultDeferred.promise,
            opened: openedDeferred.promise,
            close: function(result) {
                if (!instance.isBlocked()) {
                    var notCancelled = dismissChildren(region, instance, 'parent closed');
                    if (!notCancelled) {
                        return false;
                    }
                    region.close(instance, options);
                    region.remove(instance);
                    resultDeferred.resolve(result);
                    return true;
                }
                return false;
            },
            dismiss: function(reason) {
                if (!instance.isBlocked()) {
                    var notCancelled = dismissChildren(region, instance, 'parent dismissed');
                    if (!notCancelled) {
                      return false;
                    }
                    region.close(instance, options);
                    region.remove(instance);
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

                // add variables required by regions
                options.scope = scope;
                options.deferred = resultDeferred;
                options.content = contentAndLocals.content;

                // finally open the view
                if (options.replace) {
                    region.replace(options.replace, instance, options);
                    region.remove(options.replace, options);
                } else {
                    region.open(instance, options);
                }
            })
            .then(function() {
                openedDeferred.resolve(true);
            }, function() {
                openedDeferred.resolve(false);
            });

        return instance;
    }

    function getPanel (panelName){
        var panel = rightRegion.panels.where({panelName:panelName});
        if(panel) return _(panel).last();
        return null;
    }
    function hasPanel (panelName){
        return getPanel(panelName) != null;
    }


    return {
        OPENING_TYPE : openingTypes,
        getPanel : getPanel,
        hasPanel : hasPanel,
        /**
         * @param {String} regionName
         * @param {Mixed} options
         *     {Mixed} template / templateUrl / content
         *     (optional) {String} controller
         *     (optional) {Mixed} scope
         *     (optional) {Object} resolve
         *     (optional) {String} panelClass
         *     (optional) {Boolean} push: if the region is push enabled, open
         *         a popup on top of the latest one
         *     (optional) {PanelInstance} pushFrom: if the region is push enabled, open
         *         a popup on top of that instance (and close existing children)
         */
        open: function(options) {
            options = parseOptions(options);

            var last = rightRegion.last ();
            var instance;

            if (options.push && !options.pushFrom) {
                options.pushFrom = last;
            }
            if (options.pushFrom && options.pushFrom != last) {
                options.replace = rightRegion.getNext(options.pushFrom);
                if (options.replace) {
                    var result = dismissChildren(rightRegion, options.replace, 'parent replaced');
                    // some child might have canceled the close
                    if (!result) {
                        return false;
                    }
                }
            }

            if (!(rightRegion.hasPush && options.push) && !rightRegion.isEmpty()) {
                options.replace = last;
            }

            if (options.replace && options.replace.isBlocked()) {
                return false;
            }

            instance = createInstance(rightRegion, options);

            // attach some variables to the instance
            instance.$$id = currentId++;
            instance.$$region = 'right';

            rightRegion.push(instance);
            return instance;
        },
        dismissAll: function(reason) {
            // _(regions).each(function(region) {
                rightRegion.dismissAll(reason);
            // });
        },
        dismissChildren: function(instance, reason) {
            var region = rightRegion;
            return dismissChildren(region, instance, reason);
        }
    };
}]);