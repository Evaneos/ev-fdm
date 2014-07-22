// WORK IN PROGRESS

// var module = angular.module('ev-fdm');

// module.factory('Panel', function() {

//     var Panel = function(extensions) {
//         this.blockers = [];
//         _(this).extend(extensions);
//     };

//     Panel.prototype.addBlocker = function(blocker) {
//         this.blockers.push(blocker);
//     };

//     Panel.prototype.removeBlocker = function(blocker) {
//         this.blockers = _(this.blockers).without(blocker);
//     };

//     Panel.prototype.isBlocked = function(silent) {
//         return _(this.blockers).some(function(blocker) {
//             return blocker(silent);
//         });
//     };

//     return Panel;
// });

// module.service('PanelServiceUI', [ '$rootScope', '$compile', '$animate', '$timeout', function($rootScope, $compile, $animate, $timeout) {

//     var STACKED_WIDTH = 15;
//     var els = {};

//     var Region = function() {
//         this.updateStacking = function() {
//             // return $timeout(checkStackingThrottled);
//         };

//         this.open = function(instance, options) {
//             instance.$$depth = region.panels.size();
//             var el = createPlaceholder(instance.$$depth);
//             var inner = createPanelView(instance, options);
//             el.html(inner);
//             els[instance.$$id] = el;
//             $animate.enter(el, container, panelZero, function() {
//                 options.scope.$emit('animation-complete');
//                 $rootScope.$broadcast('module-layout-changed');
//                 region.updateStacking();
//             });
//             el.on('resize', function(event, ui) {
//                 stylesCache[instance.$$depth + '-' + options.panelClass] = ui.size.width;
//                 region.updateStacking();
//             });
//             region.updateStacking();
//             return instance;
//         };

//         this.replace = function(fromInstance, toInstance, options) {
//             if (typeof(els[fromInstance.$$id]) != 'undefined') {
//                 var el = els[fromInstance.$$id];
//                 toInstance.$$depth = region.panels.size() - 1;
//                 var inner = createPanelView(toInstance, options);
//                 el.html(inner);
//                 els[toInstance.$$id] = el;
//                 delete els[fromInstance.$$id];
//                 region.updateStacking();
//                 return toInstance;
//             } else {
//                 return region.open(toInstance, options);
//             }
//         };

//         this.close = function(instance) {
//             if (typeof(els[instance.$$id]) != 'undefined') {
//                 var el = els[instance.$$id];
//                 $animate.leave(el, function() {
//                     delete els[instance.$$id];
//                     region.updateStacking();
//                 });
//                 region.updateStacking();
//             }
//         };

//         this.remove = function(instance) {
//             // TODO

//             // var i = this.panels.indexOf(instance);
//             // if (i > -1) {
//             //     this.panels.splice(i, 1);
//             // }
//             // return i;
//         };
//     };

//     var region = new Region();

//     function getEl(instance) {
//         if (els[instance.$$id]) {
//             return els[instance.$$id];
//         } else {
//             return null;
//         }
//     }

//     function getStylesFromCache(instance, options) {
//         var savedWidth = stylesCache[instance.$$depth + '-' + options.panelClass];
//         if (savedWidth) {
//             return 'width: ' + savedWidth + 'px;';
//         } else {
//             return '';
//         }
//     }

//     function stack(fromInstanceIndex) {
//         for (var i = 0; i < region.panels.size(); i++) {
//             var shouldStack = (i < fromInstanceIndex);
//             var instance = region.at(i);
//             var el = getEl(instance);
//             if (instance.$$stacked && !shouldStack) {
//                 delete instance.$$actualWidth;
//                 $animate.removeClass(el, 'stacked');
//             } else if (!instance.$$stacked && shouldStack) {
//                 instance.$$actualWidth = getEl(instance).outerWidth();
//                 $animate.addClass(el, 'stacked');
//             }
//             instance.$$stacked = shouldStack;
//         }
//     }

//     function checkStacking() {
//         var maxWidth = $(window).innerWidth() - 100;
//         for (var i = 0; i < region.panels.size(); i++) {
//             var j = 0;
//             var totalWidth = _(region.panels).reduce(function(memo, instance) {
//                 if (j++ < i) {
//                     return memo + STACKED_WIDTH;
//                 } else {
//                     var el = getEl(instance);
//                     if (!el) { return memo; }
//                     if (instance.$$stacked) { return memo + instance.$$actualWidth; }
//                     var width = el.outerWidth();
//                     if (width < 50) {
//                         // most probably before animation has finished landing
//                         // we neeed to anticipate a final w
//                         return memo + 300;
//                     } else {
//                         return memo + width;
//                     }
//                 }
//             }, 0);
//             if (totalWidth < maxWidth) {
//                 return stack(i);
//             }
//         }
//         // stack all
//         stack(region.panels.size() - 1);
//     }

//     function createPlaceholder(depth) {
//         var isMain = depth === 1;
//         return angular.element('<div ' +
//             'class="panel-placeholder ' + (isMain ? 'panel-main' : '') + '" ' +
//             'style="z-index:' + (2000 + depth) + ';"></div>');
//     }

//     function createPanelView(instance, options) {
//         var inner = angular.element(options.content);
//         inner.attr('style', getStylesFromCache(instance, options));
//         inner.attr('right-panel-window', true);
//         options.scope.panelClass = options.panelClass;
//         return $compile(inner)(options.scope);
//     }

//     var checkStackingThrottled = _(checkStacking).debounce(50);

//     $(window).on('resize', function() {
//         region.updateStacking();
//     });

//     var stylesCache = window.stylesCache = {};
//     var container = angular.element('.lisette-module-region.right');
//     var panelZero = container.find('.panel-zero');


//     return region;
// }]);

// module.service('PanelService', ['$rootScope', '$http', '$templateCache', '$q', '$injector', '$controller',  'PanelServiceUI', 'Panel',
//                         function($rootScope, $http, $templateCache, $q, $injector, $controller, panelServiceUI, Panel) {

//     var panels = [];

//     var openingTypes = {
//         PUSH    : 1,       // Creates a new panel after the others
//         REPLACE : 2        // Replace the panel if it already exists, and dismiss its children
//     };
//     var defaultOpeningType = openingTypes.PUSH;
//     var STACKED_WIDTH = 15;

//     /**
//      * HELPERS
//      */

//     /**
//      * Get a panel with his name
//      * @param  {String} panelName the panel name
//      * @return {Object}           either the panel or null
//      */
//     function getPanel(panelName) {
//         var panel = _(this.panels).where({
//             panelName: panelName
//         });

//         if(panel) {
//             return _(panel).last();
//         }

//         return null;
//     }

//     /**
//      * Return true if we have this panel, false otherwise
//      * @param  {String}  panelName the panel name
//      * @return {Boolean}           if we have this panel or not
//      */
//     function hasPanel(panelName) {
//         return getPanel(panelName) !== null;
//     }

//     function _isEmpty() {
//         return panels.length === 0;
//     }

//     function _remove(panel) {
//         var i = panels.indexOf(panel);
//         if (i > -1) {
//             panels.splice(i, 1);
//         }

//         return i;
//     }

//     function _each() {
//         return this.panels.each.apply(this.panels, arguments);
//     }

//     function _getNextPanel(panel) {
//         var i = panels.indexOf(panel);
//         if (i < panels.length - 1) {
//             return panels[i + 1];
//         } else {
//             return null;
//         }
//     }

//     function _getNextPanels(panel) {
//         var i = panels.indexOf(panel);
//         if (i > -1 && i < panels.length - 1) {
//             return panels.slice(i + 1)
//         } else {
//             return [];
//         }
//     }

//     /**
//      * Helper to parse the options
//      * @param  {Object} options the options(todo list them)
//      * @return {Object}         the options formatted
//      */
//     function _parseOptions(options) {
//         if (!options.template && !options.templateUrl && !options.content) {
//             throw new Error('Should define options.template or templateUrl or content');
//         }

//         if (!openingTypes[options.openingType]){
//             options.openingType = defaultOpeningType;
//         }
//         options.panelName = options.panelClass || '';

//         options.panelClass = options.panelClass || '';
//         options.panelClass += ' right';

//         options.resolve = options.resolve || {};

//         // We generate our id
//         options.$$id = panels.length + 1;

//         return options;
//     }

//     function getTemplatePromise(options) {
//         return options.content ? $q.when(options.content) :
//             options.template ? $q.when(options.template) :
//             $http.get(options.templateUrl, {
//                 cache: $templateCache
//             }).then(function(result) {
//                 return result.data;
//             });
//     }

//     function getResolvePromises(resolves) {
//         var promises = [];
//         angular.forEach(resolves, function(value) {
//             if (angular.isFunction(value) || angular.isArray(value)) {
//                 promises.push($q.when($injector.invoke(value)));
//             }
//         });
//         return promises;
//     }

//     function getPromises(options) {
//         return [getTemplatePromise(options)].concat(getResolvePromises(options.resolve));
//     }

//     function resolveAll(options) {
//         return $q.all(getPromises(options))
//             .then(function(contentAndLocals) {
//                 // variables injected in the controller
//                 var locals = {};
//                 var i = 1;
//                 angular.forEach(options.resolve, function(value, key) {
//                     locals[key] = contentAndLocals[i++];
//                 });
//                 return {
//                     content: contentAndLocals[0],
//                     locals: locals
//                 };
//             });
//     }

//     /**
//      * Resolves everything needed to the view (templates, locals)
//      * + creates the controller, scope
//      * + finally creates the view
//      */
//     function createInstance(region, options, done) {
//         var resultDeferred = $q.defer();
//         var openedDeferred = $q.defer();

//         var instance = new Panel({
//             panelName : options.panelName,
//             result: resultDeferred.promise,
//             opened: openedDeferred.promise,
//             close: function(result) {
//                 if (!instance.isBlocked()) {
//                     var notCancelled = dismissChildren(instance, 'parent closed');
//                     if (!notCancelled) {
//                         return false;
//                     }

//                     region.close(instance, options);
//                     region.remove(instance);

//                     resultDeferred.resolve(result);
//                     return true;
//                 }
//                 return false;
//             },
//             dismiss: function(reason) {
//                 if (!instance.isBlocked()) {
//                     var notCancelled = dismissChildren(instance, 'parent dismissed');
//                     if (!notCancelled) {
//                       return false;
//                     }
//                     region.close(instance, options);
//                     region.remove(instance);

//                     resultDeferred.reject(reason);

//                     return true;
//                 }
//                 return false;
//             }
//         });

//         resolveAll(options)
//             .then(function(contentAndLocals) {

//                 // create scope
//                 var scope = (options.scope || $rootScope).$new();
//                 scope.$close = instance.close;
//                 scope.$dismiss = instance.dismiss;

//                 // fires the controller
//                 var controller;
//                 if (options.controller) {
//                     var locals = contentAndLocals.locals;
//                     locals.$scope = scope;
//                     locals.$instance = instance;
//                     controller = $controller(options.controller, locals);
//                 }

//                 // add variables required by regions
//                 options.scope = scope;
//                 options.deferred = resultDeferred;
//                 options.content = contentAndLocals.content;

//                 // finally open the view
//                 if (options.replace) {
//                     region.replace(options.replace, instance, options);
//                     region.remove(options.replace, options);
//                 } else {
//                     region.open(instance, options);
//                 }
//             })
//             .then(function() {
//                 openedDeferred.resolve(true);
//             }, function() {
//                 openedDeferred.resolve(false);
//             });

//         return instance;
//     }

//     function dismissChildrens(panel, reason) {
//         var childrens = _getNextPanels(panel);
//         var i = childrens.length -1;

//         for (; i >= 0; i--) {
//             var child  = childrens[i];
//             var result = child.dismiss(reason);
//             if (!result) {
//                 return false;
//             }

//         }

//         return true;
//     }

//     /**
//      * Dismiss all panels except the first one (the main list)
//      */
//     function dismissAll(reason) {
//         if(panels.length >= 2) {
//             dismissChildrens(panels[1], reason);
//         }
//     }

//     /**
//      * Open a new panel
//      */
//     function open(options) {
//         options = _parseOptions(options);
//         var  lastPanel = _(panels).last();

//         if (options.push && !options.pushFrom) {
//             options.pushFrom = lastPanel;
//         }

//         if (options.pushFrom && options.pushFrom != lastPanel) {
//             options.replace = _getNextPanel(options.pushFrom);
//             if (options.replace) {
//                 var result = _dismissChildrens(options.replace, 'parent replaced');
//                 // some child might have canceled the close
//                 if (!result) {
//                     return false;
//                 }
//             }
//         }

//         if (!options.push && !_isEmpty()) {
//             options.replace = lastPanel;
//         }

//         if (options.replace && options.replace.isBlocked()) {
//             return false;
//         }

//         var panel = createInstance(panelServiceUI, options);
//         panels.push(panel);

//         return panel;
//     }



//     /**
//      * Our panel service.
//      * @type {Object}
//      */
//     var PanelService = {
//         panels: panels,
//         openingTypes: openingTypes,
//         getPanel: getPanel,
//         hasPanel: hasPanel,
//         open: open,
//         dismissChildrens: dismissChildrens,
//         dismissAll: dismissAll
//     };

//     return PanelService;
// }]);