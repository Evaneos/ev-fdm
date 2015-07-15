/**
 * Core Application
 */

// Angular depedencies for this app
angular.module('ev-fdm', ['ui.router', 'ui.date', 'chieffancypants.loadingBar',
        'ui.bootstrap.tooltip', 'ui.bootstrap.popover', 'ui.select2', 'angularMoment', 'ngAnimate', 'checklist-model',
        'ui.bootstrap', 'restangular'])


// configure the loading bar to be displayed
// just beneath the menu
.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = false;
    cfpLoadingBarProvider.parentSelector = '#menu';
}])

.config(['$tooltipProvider', function($tooltipProvider) {
    $tooltipProvider.options({
        placement: 'bottom',
        popupDelay: 100
    });
    $tooltipProvider.setTriggers({
        'mouseenter': 'mouseleave',
        'click': 'click',
        'focus': 'blur',
        'never': 'mouseleave',

        // Custom event, the tooltip appears when the element has the focus, and disappear when a key
        // in pressed (or the element has blurred).
        'focus-not-typing': 'blur-or-typing'
    });
}])

.config(['RestangularProvider', function(restangularProvider) {

}])


// ----------------------------------------------------
// ATTACH TO MODULE
// ----------------------------------------------------

.run(['$rootScope', '$state', '$location', 'uiSelect2Config', function($rootScope,
        $state, $location, uiSelect2Config) {

    // defaults for select2
    uiSelect2Config.minimumResultsForSearch = 7;
    uiSelect2Config.allowClear = true;

    // On the first loading state, we set this value
    // It used by the ev-menu directive which is loaded asynchronously
    // and can't listen to this event on the first load.
    $rootScope.$on('$stateChangeStart', function(event, toState) {
        toState.state = toState.name.split('.')[0];
        $rootScope['evmenu-state'] = toState;
    });


    // language for the user OR navigator language OR english
    window.moment.lang([window.navigator.language, 'en']);

}]);

'use strict';

angular.module('ev-fdm')
   .animation('.ev-animate-picture-list', function() {

    return {
      enter : function(element, done) {
            var width = element.width();
            element.css('opacity', 0);
            jQuery(element).animate({
                opacity: 1
            }, 300, done);

            return function(isCancelled) {
                if(isCancelled) {
                    jQuery(element).stop();
                }
            };
        },
        leave : function(element, done) {
            element.css('opacity', 1);

            jQuery(element).animate({
                opacity: 0.3
            }, 300, done);

            return function(isCancelled) {
              if(isCancelled) {
                jQuery(element).stop();
              }
            };
        },
        move : function(element, done) {
          element.css('opacity', 0);
          jQuery(element).animate({
              opacity: 1
          }, done);

          return function(isCancelled) {
              if(isCancelled) {
                  jQuery(element).stop();
              }
          };
        },

        // you can also capture these animation events
        addClass : function(element, className, done) {},
        removeClass : function(element, className, done) {}
    };
});

angular.module('ev-fdm')
    .animation('.ev-animate-tag-list', function() {
        return {
          enter : function(element, done) {
                element.css('opacity', 0);
                jQuery(element).animate({
                    opacity: 1
                }, 300, done);

                return function(isCancelled) {
                    if(isCancelled) {
                        jQuery(element).stop();
                    }
                };
            },
            leave : function(element, done) {
                element.css('opacity', 1);

                jQuery(element).animate({
                    opacity: 0.3
                }, 300, done);

                return function(isCancelled) {
                  if(isCancelled) {
                    jQuery(element).stop();
                  }
                };
            },
            move : function(element, done) {
              element.css('opacity', 0);
              jQuery(element).animate({
                  opacity: 1
              }, done);

              return function(isCancelled) {
                  if(isCancelled) {
                      jQuery(element).stop();
                  }
              };
            },

            // you can also capture these animation events
            addClass : function(element, className, done) {},
            removeClass : function(element, className, done) {}
        };
    });

angular.module('ev-fdm')
    .factory('ListController', ['$rootScope', '$state', '$stateParams', 'Restangular', function($rootScope, $state, $stateParams, restangular) {

        function ListController($scope, elementName, elements, defaultSortKey, defaultReverseSort, activeIdSelector) {

            if (typeof elementName === 'object') {
                defaultReverseSort = elementName.defaultReverseSort;
                defaultSortKey = elementName.defaultSortKey;
                elements = elementName.elements;
                activeIdSelector = elementName.activeIdSelector || 'id';
                elementName = elementName.elementName;
            }

            /*
                Properties
             */
            this.elementName = elementName;
            this.defaultSortKey = defaultSortKey;
            this.defaultReverseSort = defaultReverseSort;
            this.activeIdSelector = activeIdSelector || 'id';

            this.$scope = $scope;
            this.$scope.filters = {};
            this.$scope.sortKey = this.defaultSortKey;
            this.$scope.reverseSort = this.defaultReverseSort;

            this.setElements(elements);

            /*
                Pagination method that should be called from the template
             */
            this.$scope.changePage = function(newPage) {

                var eventArgs = angular.copy(arguments);
                Array.prototype.unshift.call(eventArgs, 'common::pagination.changed', this.$scope.currentPage, newPage);
                $rootScope.$broadcast.apply($rootScope, eventArgs);

                return this.update(newPage, this.$scope.filters, this.$scope.sortKey, this.$scope.reverseSort);
            }.bind(this);

            /*
                Sort method that should be called from the template
             */
            this.$scope.sortChanged = function() {

                var eventArgs = angular.copy(arguments);
                Array.prototype.unshift.call(eventArgs, 'common::sort.changed', this.$scope.sortKey, this.$scope.reverseSort);
                $rootScope.$broadcast.apply($rootScope, eventArgs);

                return this.update(1, this.$scope.filters, this.$scope.sortKey, this.$scope.reverseSort);
            }.bind(this);


            /*
                Filter method that should be called from the template
             */
            this.$scope.filtersChanged = function() {

                var eventArgs = angular.copy(arguments);
                Array.prototype.unshift.call(eventArgs, 'common::filters.changed', this.$scope.filters);
                $rootScope.$broadcast.apply($rootScope, eventArgs);

                return this.update(1, this.$scope.filters, this.$scope.sortKey, this.$scope.reverseSort);
            }.bind(this);

            /*
                Display an item by changing route
             */
            this.$scope.toggleDetailView = function(element) {
                this.toggleView('view', element);
            }.bind(this);

            /*
                When returning to the list state remove the active element
             */
            this.$scope.$on('$stateChangeSuccess', function(event, toState) {
                if(toState.name === this.elementName) {
                    this.$scope.activeElement = null;
                }
                else {
                    this.setActiveElement();
                }
            }.bind(this));

            this.$scope.$on(this.elementName + '::updated', function(event) {
                this.update(this.$scope.currentPage, this.$scope.filters, this.$scope.sortKey, this.$scope.reverseSort);
            }.bind(this));

            this.$scope.$on(this.elementName + '::created', function(event) {
                this.update(this.$scope.currentPage, this.$scope.filters, this.$scope.sortKey, this.$scope.reverseSort);
            }.bind(this));

            this.$scope.$on(this.elementName + '::deleted', function(event) {
                this.update(this.$scope.currentPage, this.$scope.filters, this.$scope.sortKey, this.$scope.reverseSort);
            }.bind(this));
        }

        ListController.prototype.update = function(page, filters, sortKey, reverseSort) {
            return this.fetch(page, filters, sortKey, reverseSort).then(function(elements) {
                this.setElements(elements);
                return elements;
            }.bind(this));
        };

        ListController.prototype.setElements = function(elements) {
            this.$scope[this.elementName] = elements;
            this.$scope.currentPage = elements.pagination.current_page;
            this.$scope.pageCount = elements.pagination.total_pages;
            this.$scope.totalElement = elements.pagination.total;

            if(!this.$scope.selectedElements || !this.$scope[this.elementName]) {
                this.$scope.selectedElements  = [];
            }
            else {
                var selectedElementsIds = this.$scope[this.elementName].map(function(elt) {
                    return restangular.configuration.getIdFromElem(elt);
                });
                this.$scope.selectedElements = this.$scope.selectedElements.filter(function(elt) {
                    return selectedElementsIds.indexOf(restangular.configuration.getIdFromElem(elt)) !== -1;
                });
            }

            this.setActiveElement();
        };

        ListController.prototype.setActiveElement = function() {
            this.$scope.activeElement = null;

            if(angular.isDefined($state.params[this.activeIdSelector])) {
                angular.forEach(this.$scope[this.elementName], function(element) {
                    if (restangular.configuration.getIdFromElem(element) == $state.params[this.activeIdSelector]) {
                        this.$scope.activeElement = element;
                    }
                }.bind(this));
            }
        };

        ListController.prototype.toggleView = function(view, element, routingArgs) {

            if (!element) {
                $rootScope.$broadcast('common::list.toggleView', view, 'close');
                $state.go(this.goToViewStatePath(false));
                return;
            }

            var id = restangular.configuration.getIdFromElem(element);

            if (!id || $stateParams.id === id) {
                $rootScope.$broadcast('common::list.toggleView', view, 'close');
                $state.go(this.goToViewStatePath(false));
            }
            else {
                var params = {};
                params[this.activeIdSelector] = id;

                angular.extend(params, routingArgs);

                $rootScope.$broadcast('common::list.toggleView', view, 'open');

                $state.go(this.goToViewStatePath(view, element), params);
            }
        };

        ListController.prototype.goToViewStatePath = function(view, element) {
            return this.elementName + (view ? '.' + view : '');
        };

        return ListController;
    }]);

'use strict';

var NotificationsController = ['$scope', 'NotificationsService', function($scope, NotificationsService) {
    $scope.notifications = NotificationsService.list;
    
    $scope.$watch(function() {
        return NotificationsService.activeNotification;
    }, function() {
        $scope.activeNotification = NotificationsService.activeNotification;
    });
    
    $scope.getClass = function (notification){
        if (!notification) return '';
        switch (notification.type){
            case NotificationsService.type.ERROR:
                return 'danger';
            case NotificationsService.type.SUCCESS:
                return 'success';
            case NotificationsService.type.WARNING:
                return 'warning';
            case NotificationsService.type.INFO:
                return 'info';
            default:
                return 'success';
        }
    };

    $scope.remove = function(notification) {
        NotificationsService.remove(notification);
    };
}];

angular.module('ev-fdm')
    .controller('NotificationsController', NotificationsController);
angular.module('ev-fdm')
    .factory('SearchController', ['$rootScope', function($rootScope) {
        function SearchController($scope) {
            this.$scope = $scope;
            this.$scope.filters = {};

            $scope.filtersChanged = function() {
                Array.prototype.unshift.call(arguments, 'common::filters.changed', this.$scope.filters);
                $rootScope.$broadcast.apply($rootScope, arguments);
            }.bind(this);
        }

        return SearchController;
    }]);

'use strict';

var module = angular.module('ev-fdm');

/**
 * evAccordion directive works as an attribute
 * and it's working with the accordion directive (required)
 *
 * His role is to add methods to the scope of the accordion
 */
module.directive('evAccordion', ['accordionDirective', function(accordionDirective) {
  return {
    restrict:'A',
    require: 'accordion',
    link: function(scope, element, attr, accordionCtrl) {

        scope.expandAll   = setIsOpenAll.bind(null, true);
        scope.collapseAll = setIsOpenAll.bind(null, false);
        scope.showableAccordionButton = showableAccordionButton;

        // Set the isOpen property for ALL groups (to true or false)
        function setIsOpenAll(isOpen) {
            accordionCtrl.groups.forEach(function(group) {
                group.isOpen = isOpen;
            });
        }

        /**
         * Should we display that 'type' of button?
         *  - type can have the value: 'expand' or 'collapse'
         *
         * Expand btn is displayed when all groups are closed
         * Collaspe btn is displayed when at least one group is open
         */
        function showableAccordionButton(type) {
            var groups = accordionCtrl.groups;
            if(groups.length === 0) {
                return false;
            }

            if(type === 'expand') {
                return groups.every(function(group) {
                    return !group.isOpen;
                });
            } else {
                return groups.some(function(group) {
                    return group.isOpen;
                });
            }
        }
    }
  };
}]);

'use strict';

angular.module('ev-fdm').directive('activableSet', function() {
    return {
        restrict: 'A',
        scope: false,
        controller: ['$scope', '$attrs', '$parse', function($scope, $attrs, $parse) {

            var activeElementGet = $parse($attrs.activeElement);
            var activeElementSet = activeElementGet.assign;

            var self = this;
            $scope.$watch(function() {
                return activeElementGet($scope);
            }, function(newActiveElement) {
                self.activeElement = newActiveElement;
            });

           this.toggleActive = function(value) {
                if(value !== this.activeElement) {
                    if (activeElementSet) {
                        activeElementSet($scope, value);
                    }

                    this.activeElement = value;
                }
                else {
                    if(activeElementSet) {
                        activeElementSet($scope, null);
                    }

                    this.activeElement = undefined;
                }

                $scope.$eval($attrs.activeChange);
           };

        }]
    };
});
angular.module('ev-fdm').directive('activable', ['$parse', function($parse) {
    return {
        restrict: 'A',
        require: '^activableSet',
        link: function(scope, element, attr, ctrl) {
            element.addClass('clickable');
            var elementGetter = $parse(attr.activable);
            var currentElement = elementGetter(scope);


            scope.$watch(function() { return elementGetter(scope); }, function(newCurrentElement) {
              currentElement = newCurrentElement;
            });

            scope.$watch(
                function() { return ctrl.activeElement; },
                function(newActiveElement, oldActiveElement) {
                    if(newActiveElement && currentElement === newActiveElement) {
                        element.addClass('active');
                    }
                    else {
                        element.removeClass('active');
                    }
                }
            );

            element.on('click', function(event) {
                if(!$(event.target).closest('.block-active').length && !event.ctrlKey && ! event.shiftKey) {
                    scope.$apply(function() {
                        ctrl.toggleActive(currentElement);
                    });
                }
            });
        }
    };
}]);

angular.module('ev-fdm').directive('evAddTagInList', [
    function() {
        return {
            restrict: 'EA',
            transclude: true,
            scope: {
                elements: '=',
                addElement: '=',
                maxElements: '=',
                iconName: '@',
                buttonText: '@',
                tooltipText: '@',
            },
            template:
                '<span ng-hide="elements.length >= maxElements"> ' +
                    '<button type="button" ' +
                        'class="btn btn-tertiary btn-env" ' +
                        'tabIndex="-1"' +
                        'tooltip="{{ tooltipText }}"' +
                        'tooltip-placement="top"' +
                        'tabIndex="-1"' +
                        'ng-hide="context.showSelect" ' +
                        'ng-click="context.showSelect = true"> ' +
                        '<span class="icon {{ iconName }}"></span> ' +
                        '{{ buttonText }} ' +
                    '</button> ' +
                    '<span ng-show="context.showSelect"> ' +
                        '<div class="transclude-addtaginlist"></div>' +
                    '</span> ' +
                '</span> ',
            link: function(scope, element, attrs, controller, transcludeFn) {
                scope.context = {
                    showSelect: false,
                };

                transcludeFn(function(clone, transcludedScope) {
                    transcludedScope.add = function(element) {
                        return scope.addElement(scope.elements, element);
                    };

                    // append body to template
                    element.find('.transclude-addtaginlist').append(clone);
                });
            },
        };
    },
]);

'use strict';

var module = angular.module('ev-fdm');

module.directive('clearable', [function() {

    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attr, ctrl) {

            var clearButton = angular.element('<button class="clear" ng-click="clear()">×</button>');
            element.after(clearButton);

            clearButton.on('click', function() {
                scope.$apply(function() {
                    element.val(''); 
                    ctrl.$setViewValue('');
                });
            });

            scope.$watch(function() { return ctrl.$isEmpty(ctrl.$viewValue); }, function(isEmpty) {
                if(isEmpty) {
                    clearButton.hide();
                }
                else {
                    clearButton.show();
                }
            });

        }
    }
}]);
'use strict';

angular.module('ev-fdm')
.directive('evDatepicker', function() {
    return {
        restrict: 'A',
        require : 'ngModel',
        link : function (scope, element, attrs, ngModelCtrl) {

            var dateCanBeInTheFutur = attrs.futurAllowed !== 'false',
                dateFormat = attrs.dateFormat || 'dd/mm/yy';

            $(function(){
                element.datepicker({
                    dateFormat: dateFormat,
                    maxDate: dateCanBeInTheFutur? null : 0,
                    onSelect:function (date) {
                        ngModelCtrl.$setViewValue(date);
                        scope.$apply();
                    }
                });

            });
        }
    }
});
angular.module('ev-fdm')
.directive('download', ['$http', '$location', '$document', 'DownloadService', function($http, $location, $document, downloadService) {
    return {
        link: function(scope, elm, attrs) {
            elm.on('click', function(event) {
                $http.get(attrs.download).success(function(data) {
                	downloadService.download(data.url);
                });
            });
        }
    }
}]);
'use strict';

angular.module('ev-fdm').directive('evEditSection', ['NotificationsService', function (notificationsService) {
    return {
        restrict: 'AE',
        transclude: true,
        scope: {
            options: '=',
            args: '=?',
            title: '@', // deprecated
            headerTitle: '@',
            noteditable: '=?',
            notdeletable: '=?',
        },
        templateUrl: 'ev-edit-section.html',

        link: function(scope, element, attrs, controller, transcludeFn) {
            var _transcludedScope = {};
            var options = scope.options;
            var triedToSave = false;

            function setEditMode(editMode) {
                _transcludedScope.edit = editMode;
                scope.edit = editMode;
                _transcludedScope.editform = scope.editform;
            }


            scope.changeToEditMode = function() {
                if (!options.onEdit || options.onEdit && options.onEdit.apply(null, scope.args || []) !== false) {
                    setEditMode(true);
                }
            };

            scope.save = function() {
                if (!scope.editform.$valid) {
                    triedToSave = true;
                    return;
                }
                var resultSave = !options.onSave || options.onSave && options.onSave.apply(null, scope.args || []);
                if (resultSave && resultSave.then) {
                    scope.inProgress = true;
                    resultSave.then(
                        function success() {
                            notificationsService.addSuccess({ text: options.successMessage || attrs.successMessage });
                            if (options.success) {
                                options.success();
                            }
                            scope.inProgress = false;
                            setEditMode(false);
                        },
                        function error() {
                            scope.inProgress = false;
                            notificationsService.addError({ text: options.errorMessage || attrs.errorMessage });
                        }
                    );
                } else if (resultSave !== false) {
                    setEditMode(false);
                }
            };

            scope.cancel = function() {
                if (!options.onCancel || options.onCancel && options.onCancel.apply(null, scope.args || []) !== false) {
                    setEditMode(false);
                }
            };

            scope.delete = options.onDelete && function() {
                var result = options.onDelete && options.onDelete.apply(null, scope.args || []);

                if (result && result.then) {
                    scope.inProgress = true;
                    result.then(
                        function success() {
                            notificationsService.addSuccess({ text: attrs.successDeleteMessage });
                            if (options.success) {
                                options.success();
                            }
                            scope.inProgress = false;
                            setEditMode(false);
                        },
                        function error() {
                            scope.inProgress = false;
                            notificationsService.addError({ text: attrs.errorDeleteMessage });
                        }
                    );
                }
            };

            transcludeFn(function(clone, transcludedScope) {
                // default state
                transcludedScope.edit = scope.edit = !!attrs.edit;

                // usefull methods
                transcludedScope.showErrorMessage = function(fieldName, errorName) {
                    var field = scope.editform[fieldName];
                    return (triedToSave || field.$dirty) && (!errorName ? field.$invalid : field.$error[errorName]);
                };

                // transclude values
                _transcludedScope = transcludedScope;

                // append body to template
                element.find('.transclude').append(clone);
            });
        }
    };
}]);

'use strict';

angular.module('ev-fdm')
.directive('ngEnter', function() {
    return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {
            if(event.which === 13) {
                scope.$apply(function(){
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});
var module = angular.module('ev-fdm')
.directive('evErrorMessage', function () {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            input: '=',
            error: '@'
        },
        template: '<li ng-show="input[\'evHasError\'] && input.$error[error]"><div ng-transclude></div></li>'
    };
});

var module = angular.module('ev-fdm')
.directive('evErrors', function () {
    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        template: '<ul class="errors text-danger" ng-transclude></ul>'
    };
});

'use strict';

function MenuManagerProvider() {

    var self = this;
    this.tabs = [];
    this.activeTab = null;
    this.lastTab = null;

    this.addTab = function(tab) {
        this.tabs.push(tab);
        return this;
    };

    function findTab(stateName) {
        var res = null;
        angular.forEach(self.tabs, function(tab) {
            if(stateName === tab.state) {
                res = tab;
            }
        });

        return res;
    }

    function selectTab(tab) {
        tab = tab || {};
        tab = findTab(tab.state);

        if(!tab) {
            return;
        }

        if(self.activeTab) {
            self.lastTab = self.activeTab;
            self.activeTab.active = false;
        }

        tab.active = true;
        self.activeTab = tab;
    }

    this.$get = ['$rootScope', '$state', function($rootScope, $state) {

        // Handle first page load
        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState) {
            if (fromState.name === '') {
                var toTab = findTab(toState.name);

                if(toTab) {
                    selectTab(toTab);
                }
            }
        });

        $rootScope.$on('$stateChangeError', function(event) {
            selectTab(self.lastTab);
        });

        return {
            tabs: self.tabs,
            selectTab: selectTab
        };
    }];
}

function EvMenuDirective(menuManager) {
    return {
        restrict: 'E',
        replace: true,
        template:   '<ul class="module-tabs ev-header nav nav-tabs" ng-cloak>' +
                        '<li ng-repeat="tab in tabs" ng-class="{active: tab.active}">' +
                            '<a ng-click="selectTab(tab)">{{ tab.name }}</a>' +
                        '</li>' +
                    '</ul>',
        controller: [ '$scope', '$state', '$rootScope', function($scope, $state, $rootScope) {
            $scope.tabs = menuManager.tabs;

            if($rootScope['evmenu-state']) {
                menuManager.selectTab($rootScope['evmenu-state']);
            }

            $scope.selectTab = function(tab) {
                menuManager.selectTab(tab);
                $state.go(tab.state);
            };
        }]
    };
}

angular.module('ev-fdm')
    .provider('menuManager', [MenuManagerProvider])
    .directive('evMenu', ['menuManager', EvMenuDirective]);
'use strict';

var module = angular.module('ev-fdm')
.directive('evFlag', function () {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            lang: '='
        },
        template: '<i class="icon icon-flag flag-{{lang}}"></i>'
    };
});
angular.module('ev-fdm')
.directive('focus', [function() {
    return {
        link: function(scope, elm, attrs, ctrl) {
            scope.$evalAsync(function() {
                elm[0].focus();
            });
        }
    }
}]);
var module = angular.module('ev-fdm')
.directive('evFormGroup', ['$parse', '$rootScope', function($parse, $rootScope) {
    return {
        restrict: 'EA',
        scope: true,
        transclude: true,
        replace: true,
        template: '<div class="form-group" ng-transclude></div>',
        controller: function($scope, $element, $attrs) {
            this.toggleError = $element.toggleClass.bind($element, 'has-error');
        }
    };
}]);

'use strict';

angular.module('ev-fdm')
    .directive('linkDisabled', function() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var oldNgClick = attrs.ngClick;
                if (oldNgClick) {
                    scope.$watch(attrs.linkDisabled, function (value, oldValue) {
                        if (!! value) {
                            element.unbind('click');
                            element.attr('disabled', 'disabled');
                        } else if (oldValue) {
                            attrs.$set('ngClick', oldNgClick);
                            element.bind('click', function () {
                                scope.$apply(attrs.ngClick);
                            });
                            element.removeAttr('disabled');
                        }
                    });
                }
            }
        };
    });
'use strict';

var module = angular.module('ev-fdm')
.directive('evLoadingDots', function () {
    return {
        restrict: 'E',
        replace: true,
        template: '<span class="loading-dots"><span></span><span></span><span></span></span>'
    };
});
'use strict';

angular.module('ev-fdm')
    .directive('mouseFollower', ['$document', function ($document) {
        return {
            restrict: 'A',
            link : function (scope, element, attr){
                element = angular.element(element);
                element.css('position', 'absolute');
                element.css('z-index', 1500);

                $document.on('mousemove', function(evt) {
                    element.css({
                        left:  evt.pageX,
                        top:   evt.pageY
                    });
                });
            }
        }
    }]);
'use strict';

var module = angular.module('ev-fdm')
    .directive('evPagination', [function () {
        var ELLIPSIS = '...';
        return {
            restrict: 'AE',
            replace: true,
            templateUrl: 'ev-pagination.html',
            scope: {
                currPage:     '=',
                nbPage:       '=',
                onPageChange: '='
            },

            link: function (scope){
                scope.paginationButtons = [];
                scope.prevClass = '';
                scope.nextClass = '';

                scope.currPage = scope.currPage || 1;
                scope.nbPage   = scope.nbPage   || 1;

                scope.generateButtons = function () {
                    var i = 0;
                    var nbAround = 2; // We want to have this amount of links around the current page.

                    scope.paginationButtons = [];
                    // Add 1
                    scope.paginationButtons.push ({value: 1, class:scope.currPage==1 ? 'active':'' });

                    // Add the 3 dots
                    if (scope.currPage-nbAround > 2) {
                        scope.paginationButtons.push({ value: ELLIPSIS, class:'disabled' });
                    }

                    // add the surrounding page numbers
                    for (i = nbAround; i > 0; i--) {
                        if (scope.currPage-i > 1) {
                            scope.paginationButtons.push ({value: scope.currPage-i});
                        }
                    }

                    // add the actual page
                    if (scope.currPage != 1 && scope.currPage != scope.nbPage) {
                        scope.paginationButtons.push ({ value: scope.currPage, class:'active' });
                    }

                    // add the surrounding page numbers
                    for (i = 1; i <= nbAround; i++) {
                        if (scope.currPage+i < scope.nbPage) {
                            scope.paginationButtons.push ({value: scope.currPage+i});
                        }
                    }

                    // Add the 3 dots
                    if (scope.currPage+nbAround < scope.nbPage-1){
                        scope.paginationButtons.push ({ value: ELLIPSIS, class:'disabled' });
                    }

                    // Add final page number
                    if (scope.nbPage > 1){
                        scope.paginationButtons.push ({value: scope.nbPage,class:scope.currPage==scope.nbPage ? 'active':''});
                    }
                    // if (scope.currPage == 1)            { scope.prevClass='inactive'; }
                    // if (scope.currPage == scope.nbPage) { scope.nextClass='inactive'; }
                };

                scope.previousPage = function (){
                    if (scope.currPage > 1) {
                        var oldPage = scope.currPage;
                        scope.currPage--;
                        if(angular.isFunction(scope.onPageChange)) {
                            scope.onPageChange(scope.currPage, oldPage, 'previousPage');
                        }
                    }

                };

                scope.changePage = function (value){
                    if (value != ELLIPSIS && value >=1 && value <= scope.nbPage){
                         var oldPage = scope.currPage;
                        scope.currPage = value;

                        if(angular.isFunction(scope.onPageChange)) {
                            scope.onPageChange(value, oldPage);
                        }
                    }
                };

                scope.nextPage = function (){
                    if (scope.currPage < scope.nbPage){
                        var oldPage = scope.currPage;
                        scope.currPage++;

                        if(angular.isFunction(scope.onPageChange)) {
                            scope.onPageChange(scope.currPage, oldPage, 'nextPage');
                        }
                    }
                };

                scope.$watch('nbPage + currPage', function() {
                    scope.generateButtons ();
                });
            }
        };
    }]);

/* global console */
angular.module('ev-fdm').directive('evPictureList', function() {
    return {
        restrict: 'EA',
        scope: {
          pictures: '=',
          editable: '=',
          onDelete: '&',
          onChange: '&',
          showUpdate: '=',
          language: '=',
          colNumber: '=',
          onPictureDeleted: '&'
        },
        templateUrl: 'ev-picture-list.html',
        link: function($scope, elem, attrs) {
            $scope.pictures = $scope.pictures || [];

            // Number of columns for pictures
            var colNumber = $scope.colNumber || 2;
            // Convert it to bootstrap convention (12)
            $scope.colNumberBootstrap = 12 / colNumber;

            if (!attrs.onDelete) {
                $scope.onDelete = function(params) {
                    $scope.pictures.splice(params.index, 1);
                    $scope.onPictureDeleted();
                };
                $scope.onUpdate = function(params) {
                    // Not implemented yet
                    console.log(params);
                };
            }
        }
    };
});

(function () {
    'use strict';
        // update popover template for binding unsafe html
    angular.module("template/popover/popover.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("template/popover/popover.html",
          "<div class=\"popover {{placement}}\" ng-class=\"{ in: isOpen(), fade: animation() }\">\n" +
          "  <div class=\"arrow\"></div>\n" +
          "\n" +
          "  <div class=\"popover-inner\">\n" +
          "      <h3 class=\"popover-title\" ng-bind-html=\"title\" ng-show=\"title\"></h3>\n" +
          "      <div class=\"popover-content\"ng-bind-html=\"content\"></div>\n" +
          "  </div>\n" +
          "</div>\n" +
          "");
    }]);
    angular.module('ev-fdm')
        .directive('popover', ['$timeout', function ($timeout) {
        	return {
        		restrict: 'A',
				link: function ($scope, elem, attrs) {
                    var showTimeout;
                    elem.bind('focus', function () {
                        elem.triggerHandler('focus-not-typing');
                    });
					elem.bind('blur', function () {
                        if (showTimeout) {$timeout.cancel(showTimeout);}
                        elem.triggerHandler('blur-or-typing');
                    });
                    elem.bind('keypress', function () {
                        if (showTimeout) {$timeout.cancel(showTimeout);}
                        elem.triggerHandler('blur-or-typing');
                        showTimeout = $timeout(function () {
                            elem.triggerHandler('focus-not-typing');
                        }, 1000);
                    });
				}
        	};
        }]);
}) ();

/**
 * Display a promise state as css classes (promise-resolving, promise-resolved, promise-rejected)
 * + Supports empty lists by displaying a message (promise-empty)
 *
 * Options :
 * - emptyMessage (string) - display a message when promise resolves to empty array
 * - promiseDefaultStyles (boolean, default true) - apply spinning evaneos logo when resolving
 *
 * Examples :
 * <div promise="myPromise"
 *     empty-message="No quote"
 *     promise-default-styles="true">
 *
 */
angular.module('ev-fdm').directive('promise', [
    function () {
        function applyClass(classes, element) {
            element.removeClass('promise-resolved promise-resolving promise-empty promise-rejected');
            element.addClass(classes);
        }

        return {
            restrict: 'A',
            replace: false,

            controller: ['$scope', '$attrs', '$parse', '$element', function($scope, $attrs, $parse, $element) {
                var promiseGetter = $parse($attrs.promise);
                var emptyMessage = $attrs.emptyMessage;
                var promiseDefaultStyles = ($attrs.promiseDefaultStyles !== 'false');
                if (promiseDefaultStyles) {
                    applyClass('promise-default-styles', $element);
                }
                if (emptyMessage) {
                    $element.append('<div class="promise-empty-message">' + emptyMessage + '</div>');
                }
                $scope.$watch(function() {
                    return promiseGetter($scope);
                }, function(promise) {
                    if (promise) {
                        applyClass('promise-resolving', $element);
                        promise.then(function(result) {
                            // make sure we are dealing with arrays
                            // otherwise (not a collection, we can't assume it's empty or non empty)
                            if (emptyMessage && angular.isArray(result) && !result.length) {
                                applyClass('promise-resolved promise-empty', $element);
                            } else {
                                applyClass('promise-resolved', $element);
                            }

                            return result;
                        }, function() {
                            applyClass('promise-rejected', $element);
                        });
                    } else {
                        applyClass('promise-resolved', $element);
                    }
                });
            }]
        };

    }
]);

(function () {
    'use strict';
    angular.module('ev-fdm')
        .directive('evPromiseProgress', [function () {

    /*  ev-promise-progress
        ===================
        Hi! I'm a directive that link a progress bar to a promise.

        Just give me a promise argument. I'll update automatically each time the `notify` callback is called. Of course
        I assume that a percentage progress is given.

        Beware! Each time the promise changes, and is replaced by a new one, I bind the progress bar to the new promise.
        Without unbinding from the previous one. If it wasn't completed, it can leads to strange behavior (i.e. the
        progress bar taking value from both at the same time, doing back and forth).
    */
            return {
                restrict: 'A',
                replace: true,
                scope: {
                    promise: '=evPromiseProgress',
                },
                template: '<div role="progressbar" class="ev-progress" aria-valuemin="0" aria-valuemax="100"' +
                    'aria-valuenow="0"> <div class="ev-progress-overlay"></div> </div> ',
                link: function ($scope, elem, attrs) {
                    var progressBar = elem.find(angular.element(document.querySelector('.ev-progress-overlay')));
                    progressBar.css({width: '0%'});
                    $scope.$watch('promise', function (newPromise) {
                        if (!newPromise || !newPromise.then) { return; }
                        progressBar.css({width: '0%'});
                        newPromise.then(null, null, function notify (progress) {
                            if (typeof(progress) === 'object') {
                                progress = progress.progress;
                            }
                            progressBar.css({width: progress + '%'});
                        });
                        newPromise.finally(function () {
                            progressBar.css({width: '100%'});
                        });
                    });
                }
            };
        }]);
}());
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
'use strict';

angular.module('ev-fdm').directive('body', [
    '$rootScope',
    'NotificationsService',
    '$state',
    function($rootScope, notificationsService, $state) {
        return {
            restrict: 'E',
            link: function(scope, element, attrs) {

                $rootScope.$on('$stateChangeStart', function(event, toState) {
                    // not a tab changing
                    var dotX = $state.current.name.indexOf('.');
                    var stateName = (dotX != -1) ? $state.current.name.substring(0, dotX) : $state.current.name;

                    if (!stateName || toState.name.indexOf(stateName) !== 0) {
                        $('body').addClass('state-resolving');
                    }
                });

                $rootScope.$on('$stateChangeSuccess', function() {
                    element.removeClass('state-resolving');
                });

                /**
                 * When there is an error on a state change
                 *
                 * In your state config you can add the following.
                 * This will allows the router to fallback to this state on error
                 * while displaying the specified message

                      fallback: {
                        state: 'list',
                        message: t('Unable to open this transaction!')
                      }
                 */
                $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
                    if (console.error) {
                        console.error(
                            'toState=', toState,
                            'toParams=', toParams,
                            'fromState=', fromState,
                            'error=', error,
                            'event=', event
                        );
                    }
                    $('body').removeClass('state-resolving');

                    var errorMessage = (toState.fallback && toState.fallback.message) || 'Error';

                    notificationsService.addError({
                        text: errorMessage
                    });

                    // Redirect to the fallback we defined in our state
                    if (toState && toState.fallback && toState.fallback.state) {
                      $state.go(toState.fallback.state);
                    }
                });
            }
        };
    }
]);

/*
    responsive-viewport
    ===================

    I'm a directive that place the proper class responsive class dependanding on the size of the element I'm attached.

*/

"use strict";
angular.module('ev-fdm')
    .provider('evResponsiveViewport', function () {
        var breakpoints = {
            400: 'ev-viewport-xs',
            600: 'ev-viewport-sm',
            900: 'ev-viewport-md'
        };
        this.$get =function () {
            return breakpoints;
        };

        this.setXsBreakpoint = function (breakpoint) {
            breakpoints[breakpoint] = 'ev-viewport-xs';
        };

        this.setSmBreakpoint = function (breakpoint) {
            breakpoints[breakpoint] = 'ev-viewport-sm';
        };

        this.setMdBreakpoint = function (breakpoint) {
            breakpoints[breakpoint] = 'ev-viewport-md';
        };

        this.setBreakpoints = function (breaks) {
            if (breaks.length !== 3) {
                throw new Error('There should be three breakpoints');
            }
            breaks.sort();
            breakpoints[breaks[0]] = 'ev-viewport-xs';
            breakpoints[breaks[1]] = 'ev-viewport-sm';
            breakpoints[breaks[2]] = 'ev-viewport-md';
        };
    })
    .directive('evResponsiveViewport', ['evResponsiveViewport', function (breakpoints) {
        return {
            link: function (scope, elm) {
                var updateViewport = function () {

                    var elmWidth = elm.width();
                    var _class;

                    var largeViewport = !Object.keys(breakpoints).some(function (breakpoint) {
                        _class = breakpoints[breakpoint];
                        return elmWidth < breakpoint;
                    });
                    if (largeViewport) {
                        _class = 'ev-viewport-lg';
                    }

                    if (!elm.hasClass(_class)) {
                        Object.keys(breakpoints).forEach(function (key) {
                                elm.removeClass(breakpoints[key]);
                            });
                        elm.removeClass('ev-viewport-lg');
                        elm.addClass(_class);
                    }
                };

                updateViewport();
                scope.$on('module-layout-changed', updateViewport);
            }
        };
    }]);

angular.module('ev-fdm')
    .provider('evSelectLanguage', function() {
        this.$get = function () {
            return {
                availableLang: this.availableLang || [],
                defaultLang: this.defaultLang
            };
        };

        this.setAvailableLang = function (availableLang) {
            this.availableLang = availableLang;
        };
        this.setDefaultLang =function (defaultLang) {
            this.defaultLang = defaultLang;
        };
    })
    .directive('evSelectLanguage', ['evSelectLanguage', function (cfg) {
        return {
            template:
                '<div class="ev-language-tabs">' +
                    '<div class="btn-group">' +
                        '<button class="btn btn-lg" ng-repeat="lang in availableLang"'+
                            'ng-class="{active: selectedLang===lang}"' +
                            'ng-click="$parent.selectedLang=lang">' +
                            '<span class="ev-icons-flags" ng-class="\'icon-\' + lang"></span>' +
                        '</button>' +
                    '</div>' +
                '</div>',
            restrict: 'AE',
            scope: {
                selectedLang: '=lang'
            },
            link: function($scope) {
                $scope.availableLang = cfg.availableLang;
                if (!$scope.selectedLang) {
                    $scope.selectedLang = cfg.defaultLang;
                }
            }
        };
    }]);

'use strict';
/// This directive currently depend on ng-repeat $index for the
///  shift selection. It would be great to remove this depency.
angular.module('ev-fdm')
    .directive('selectableSet', [function() {
        return {
            restrict: 'A',
            controller: ['$scope', '$parse', '$element', '$attrs', '$document',
            function($scope, $parse, $element, $attrs, $document) {
                var self = this,
                    shiftKey = 16;

                var selectedElementsGet = $parse($attrs.selectedElements);

                this.selectableElements = [];
                this.selectedElement = [];

                var lastClickedIndex,
                    shiftSelectedElements = [];

                $scope.$watch(function() {
                    return selectedElementsGet($scope);
                  },
                  function() {
                    self.selectedElements = angular.isArray(selectedElementsGet($scope))?
                      selectedElementsGet($scope) : [];
                  }
                );

                // Toggle a noselect class on the element when the shift key is pressed
                // This allows us to disable selection overlay via css
                $document.on('keydown', function(event) {
                    if(event.keyCode === shiftKey) {
                        $element.addClass('noselect');
                    }
                });

                $document.on('keyup', function(event) {
                    if(event.keyCode === shiftKey) {
                        $element.removeClass('noselect');
                    }
                });

                this.toggleSelection = function(element, index) {
                    lastClickedIndex = index;
                    shiftSelectedElements.length = 0;

                    if(this.isElementSelected(element)) {
                        unselectElement(element);
                    }
                    else {
                        selectElement(element);
                    }
                };

                this.toggleSelectAll = function() {

                    if(this.selectedElements.length === this.selectableElements.length){
                        this.selectedElements.length = 0;
                    }
                    else {
                      angular.forEach(this.selectableElements, function(element) {
                        if(!self.isElementSelected(element)) {
                          selectElement(element);
                          }
                      });
                    }
                };

                this.shiftedClick = function(element, index) {
                    if(typeof lastClickedIndex !== undefined) {
                        toggleRangeUpTo(lastClickedIndex, index);
                    }
                };

                this.registerElement = function(element, directive) {
                  this.selectableElements.push(element);
                };

                this.unregisterElement = function(element) {
                  var index = this.selectableElements.indexOf(element);
                  if(index > -1) {
                      this.selectableElements.splice(index, 1);
                  }

                  index = this.selectedElements.indexOf(element);
                  if(index > -1) {
                      this.selectedElements.splice(index, 1);
                  }
                };

                this.areAllElementSelected = function() {
                  return this.selectedElements.length === this.selectableElements.length
                     && this.selectedElements.length !== 0;
                };

                this.isElementSelected = function(element) {
                    return self.selectedElements.indexOf(element) > -1;
                };

                function toggleRangeUpTo(firstIndex, lastIndex) {

                    var lastElement = getElementAtIndex(lastIndex),
                        min = Math.min(firstIndex, lastIndex),
                        max = Math.max(firstIndex, lastIndex),
                        element,
                        i;

                    angular.forEach(shiftSelectedElements, function(element, index) {
                        unselectElement(element);
                    });

                    if(self.isElementSelected(lastElement)) {
                        for(i = min; i <= max; i++) {
                            element = getElementAtIndex(i);
                            unselectElement(element);
                        }

                        lastClickedIndex = lastIndex;
                        shiftSelectedElements.length = 0;
                    }
                    else {
                        shiftSelectedElements.length = 0;
                        for(i = min; i <= max; i++) {
                            element = getElementAtIndex(i);
                            selectElement(element);
                            shiftSelectedElements.push(element);
                        }
                    }
                }

                function getElementAtIndex(index) {
                    return self.selectableElements[index];
                }

                function selectElement(element) {
                    if(!self.isElementSelected(element)) {
                        self.selectedElements.push(element);
                    }
                }

                function unselectElement(element) {
                    var index = self.selectedElements.indexOf(element);
                    if(index > -1) {
                        self.selectedElements.splice(index, 1);
                    }
                }
            }]
        };
    }])
    .directive('selectable', ['$parse', function($parse) {
      return {
          restrict: 'A',
          require: ['^selectableSet', '?ngModel'],
          link: function(scope, element, attr, ctrls) {

              var currentElementGetter = $parse(attr.selectable);
              var currentElement = currentElementGetter(scope);

              var ctrl = ctrls[0],
                  modelCtrl = ctrls[1];

              ctrl.registerElement(currentElement);

              scope.$on('$destroy', function() {
                  ctrl.unregisterElement(currentElement);
              });

              scope.$watch(function() { return ctrl.isElementSelected(currentElement); }, function() {
                scope.selected = ctrl.isElementSelected(currentElement);
                if(modelCtrl) {
                  modelCtrl.$setViewValue(scope.selected);
                }
              });

              element.on('click', function(event) {
                  scope.$apply(function() {
                      handleClick(event);
                  });
              });

              function handleClick(event) {
                  if (event.shiftKey) {
                      ctrl.shiftedClick(currentElement, scope.$index);
                  }
                  else if (event.ctrlKey || angular.element(event.target).is('[type=checkbox]')) {
                      ctrl.toggleSelection(currentElement, scope.$index);
                  }
              }

          }
      };
  }])
    .directive('selectBox', function() {
        return {
            restrict: 'E',
            require: '^selectable',
            replace: true,
            controller: ['$scope', function ($scope) {
                $scope.idRand = String(Math.random());
            }],
            template: '<span><input ng-attr-id="{{idRand}}" type="checkbox" class="tick-checkbox" ng-checked="selected"><label ng-attr-for="{{idRand}}"></label></span>'
            // template: '<span class="checkbox" ng-class="{ \'icon-tick\': selected }"></span>'
        };
    })
    .directive('selectAll', function() {
        return {
            restrict: 'E',
            require: '^selectableSet',
            scope: true,
            template: '<span><input ng-attr-id="{{idRand}}" type="checkbox" class="tick-checkbox" ng-checked="allSelected" ng-click="toggleSelectAll()"><label ng-attr-for="{{idRand}}"></label></span>',
            //'<span class="checkbox" ng-class="{ \'icon-tick\': allSelected }" ng-click="toggleSelectAll()"></span>',
            link: function(scope, element, attr, ctrl) {
                scope.idRand = String(Math.random());
                scope.toggleSelectAll = function () {
                    ctrl.toggleSelectAll();
                };

                scope.$watchCollection(function() { return ctrl.areAllElementSelected(); }, function() {
                    scope.allSelected = ctrl.areAllElementSelected();
                });
            }
        };
    });
'use strict';

angular.module('ev-fdm')
    .directive('sortableSet', function() {
        return {
            restrict: 'A',
            scope: false,
            controller: ['$scope', '$parse', '$element', '$attrs', function($scope, $parse, $element, $attrs) {
                var self = this;
                this.reverseSort = false;
                this.sortKey = '';

                $scope.reverseSort = $scope.reverseSort || false;

                var reverseSortGet = $parse($attrs.reverseSort),
                    reverseSortSet = reverseSortGet.assign,
                    sortKeyGet = $parse($attrs.sortBy),
                    sortKeySet = sortKeyGet.assign;

                $scope.$watch(function() {
                    return reverseSortGet($scope);
                }, function(newReverseSort) {
                    self.reverseSort = newReverseSort;
                });

                $scope.$watch(function() {
                    return sortKeyGet($scope);
                }, function(newSortKey) {
                    self.sortKey = newSortKey;
                });

                this.sortBy = function(key) {
                    if(key == this.sortKey) {
                        this.reverseSort = !this.reverseSort;
                    }
                    else {
                        this.reverseSort = false;
                        this.sortKey = key;
                    }

                    if(reverseSortSet) {
                        reverseSortSet($scope, this.reverseSort);
                    }

                    if(sortKeySet) {
                        sortKeySet($scope, this.sortKey);
                    }

                    $scope.$eval($attrs.sortChange);
                };

            }]
        };
    })
    .directive('sortable', function() {
        return {
            restrict: 'A',
            scope: false,
            require: '^sortableSet',
            link: function(scope, element, attr, ctrl) {
                var key = attr.sortable;
                element.addClass('sortable sort');

                scope.$watch(function() { return ctrl.sortKey;}, function() {
                    setClasses();
                });

                scope.$watch(function() { return ctrl.reverseSort;}, function() {
                    setClasses();
                });

                element.on('click', function() {
                    scope.$apply(function() {
                        ctrl.sortBy(key);
                    });
                });

                function setClasses() {
                    if(ctrl.sortKey === key){
                        element.removeClass('no-sort');
                        if(ctrl.reverseSort) {
                            element.removeClass('sort-down').addClass('sort-up');
                        }
                        else {
                            element.removeClass('sort-up').addClass('sort-down');
                        }
                    }
                    else {
                        element.removeClass('sort-up sort-down').addClass('no-sort');
                    }
                }
            }
        }
    });
angular.module('ev-fdm')
    .directive('evStopEventPropagation', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                attr.evStopEventPropagation
                    .split(',')
                    .forEach(function (eventName) {
                        element.bind(eventName.trim(), function (e) {
                            e.stopPropagation();
                        });
                    });
            }
        };
     });
var module = angular.module('ev-fdm')
.directive('evSubmit', ['$parse', function($parse) {
    return {
        restrict: 'A',
        require: 'form',
        controller: function($scope, $element, $attrs) {
            var validables = [];

            this.$addValidable = function(makeValidable) {
                validables.push(makeValidable)
            };

            var fn = $parse($attrs['evSubmit'], /* interceptorFn */ null, /* expensiveChecks */ true);

            $element.on('submit', function(event) {
                var callback = function() {
                    if ($scope.form.$valid) {
                        fn($scope, {$event:event});
                    }
                };

                validables.forEach(function(makeValidable) {
                  makeValidable();
                });

                $scope.$apply(callback);
            });
        },
        link: function(scope, element, attrs, form) {
            scope.form = form;
        }
    };
}]);

(function () {
    'use strict';
    angular.module('ev-fdm')
        .directive('evTab', function () {
            return {
                restrict: 'E',
                transclude: true,
                scope: {},
                controller: function($scope, $element) {
                    var panes = $scope.panes = [];


                    $scope.select = function(pane) {
                        angular.forEach(panes, function(pane) {
                            pane.selected = false;
                        });
                        pane.selected = true;
                    };


                    this.addPane = function(pane) {
                        if (panes.length === 0) { $scope.select(pane); }
                        panes.push(pane);
                    };

                    var selectFuture = function (panes) {
                        var futurePane;
                        panes.some(function (pane) {
                            var isSelected = $scope.isShowed(pane);
                            if (isSelected) {
                                futurePane = pane;
                            }
                            return isSelected;
                        });
                       return futurePane;
                    };

                    this.selectNext = function() {
                        var selectedIndex = $scope.selectedIndex();
                        var nextPanes = panes.slice(selectedIndex + 1);
                        $scope.select(selectFuture(nextPanes) || panes[selectedIndex]);
                    };

                    this.selectPrevious = function() {
                        var selectedIndex = $scope.selectedIndex();
                        var previousPanes = panes.slice(0, selectedIndex).reverse();
                        $scope.select(selectFuture(previousPanes) || panes[selectedIndex]);
                    };

                    $scope.selectedIndex = function() {
                        for (var i = 0; i < panes.length; i++) {
                            var pane = panes[i];

                            if (pane.selected) {
                                return i;
                            }
                        }
                    };

                    $scope.isShowed = function (pane) {
                        return pane.alwaysShow || !!pane.tabShow;
                    };
                },
                template:
                    '<div class="tabbable ev-fixed-header">' +
                        '<ul class="nav nav-tabs ev-header">' +
                            '<li ng-repeat="pane in panes | filter:isShowed" ' +
                                'ng-class="{active:pane.selected}" '+
                                'tooltip="{{pane.tabTitle}}" tooltip-placement="bottom" tooltip-append-to-body="true">'+
                                '<a href="" ng-click="select(pane); pane.tabClick()"> ' +
                                    '<span ng-show="pane.tabIcon" class="icon {{pane.tabIcon}}"></span> '+
                                    '<span ng-hide="pane.tabIcon">{{pane.tabTitle}}</span>'+
                                '</a>' +
                            '</li>' +
                        '</ul>' +
                        '<div class="tab-content ev-body" ng-transclude></div>' +
                    '</div>',
                replace: true
            };
        })
        .directive('evPane', function() {
            return {
                require: '^evTab',
                restrict: 'E',
                transclude: true,
                scope: {
                    tabTitle: '@',
                    tabIcon: '@',
                    tabClick: '&',
                    tabShow: '='
                },
                link: function(scope, element, attrs, tabsCtrl, transcludeFn) {
                    scope.alwaysShow = true;
                    if(angular.isDefined(attrs.tabShow)) {
                        scope.alwaysShow = false;
                    }

                    var childScope;
                    var transclude = function transclude (clone, transcludedScope) {
                        childScope = transcludedScope;
                        transcludedScope.$selectNext     = tabsCtrl.selectNext;
                        transcludedScope.$selectPrevious = tabsCtrl.selectPrevious;
                        var el = element.find('.transclude');
                        el.children().remove();
                        el.append(clone);
                    };
                    scope.$watch('selected', function (selected) {
                        if (!angular.isDefined(attrs.tabReset)) {
                            return;
                        }
                        if (selected) {
                            transcludeFn(transclude);
                        } else if (childScope) {
                            childScope.$destroy();
                        }
                    });
                    tabsCtrl.addPane(scope);
                    transcludeFn(transclude);
                },
                template:
                    '<div class="tab-pane" ng-class="{active: selected}">' +
                        '<div class="section transclude"></div>' +
                    '</div>',
                replace: true
            };
        });
}) ();
'use strict';

angular.module('ev-fdm')
    .directive('evTagList', function () {
        return {
            restrict: 'EA',
            scope: {
                elements: '=',
                trackBy: '=?',
                displayElement: '=?',
                editable: '=',
                className: '@',
                maxElements: '=',
                maxAlertMessage: '@',
                onTagDeleted: '&',
                iconRemoveClass: '@',
            },
            replace: true,
            template:
                '<ul class="list-inline {{ className }}">' +
                    '<li ng-repeat="element in elements track by trackBy(element)" class="ev-animate-tag-list">' +
                        '<span class="label label-default" >' +
                            '{{ displayElement(element) }}' +
                            '<button ng-show="editable" tabIndex="-1" type="button" class="label-btn" ' +
                                'ng-click="remove($index)"><span class="{{ iconRemoveClass || \'icon-bin\' }}"></span></button> ' +
                        '</span>' +
                    '</li>' +
                    '<li ng-show="editable && elements.length >= maxElements" class="text-orange no-margin">' +
                        ' {{ maxAlertMessage }}' +
                    '</li>' +
                '</ul>',
            link: function ($scope, elem, attrs) {
                $scope.trackBy = $scope.trackBy || function(element) {
                    return element.name;
                };

                $scope.displayElement = $scope.displayElement || function(element) {
                    return element.name;
                };

                $scope.remove = function (index) {
                    $scope.elements.splice(index, 1);
                    $scope.onTagDeleted();
                };
            }
        };
    });

'use strict';

var module = angular.module('ev-fdm');

module.directive('throttle', ['$timeout', function($timeout) {

    return {
        restrict: 'A',
        require: 'ngModel',
        priority: 1,
        link: function(scope, element, attr, ctrl) {

            var originalSetViewValue = ctrl.$setViewValue,
                originalViewListeners = angular.copy(ctrl.$viewChangeListeners);

            ctrl.$viewChangeListeners = [];

            var throttleGuard;
            ctrl.$setViewValue = function(value) {
                var callViewListeners = ctrl.$modelValue !== value;

                originalSetViewValue.apply(ctrl, [value]);

                if (callViewListeners) {
                    if(throttleGuard) {
                        $timeout.cancel(throttleGuard);
                    }

                    throttleGuard = $timeout(function() {
                        angular.forEach(originalViewListeners, function(listener) {
                            try {
                                listener();
                            } catch(e) {
                                $exceptionHandler(e);
                            }
                        });
                    }, 600);
                }

            };
        }
    }
}]);
var module = angular.module('ev-fdm')
/**
 * DONE: makeValidable only happens after first blur or when ev-validable event occurs.
 * TO DO: expose makeValidable, to provides validation directly
 * on focus or on when a key is entered
 */
.directive('evValidable', function () {
    return {
        restrict: 'A',
        require: ['ngModel', '^?evSubmit', '^?evFormGroup'],
        link: function(scope, element, attrs, controllers) {
            var model = controllers[0],
                evSubmit = controllers[1],
                evFormGroup = controllers[2];

            var markAsBlurred = function() {
                model.evBlurred = true;
            };

            var markAsChanged = function() {
                model.evChanged = true;
            };

            var displayErrors = function() {
                model.evHasError = !!(!model.$valid && model.evBlurred && model.evChanged);

                if (evFormGroup) {
                    evFormGroup.toggleError(model.evHasError);
                }
            };

            element.on('blur', function() {
                scope.$evalAsync(function() {
                    markAsBlurred();
                    displayErrors();
                });
            });

            model.$viewChangeListeners.push(function() {
                markAsChanged();
                displayErrors();
            });

            evSubmit && evSubmit.$addValidable(function() {
                markAsBlurred();
                markAsChanged();
                displayErrors();
            });
        }
    };
});

'use strict';

angular.module('ev-fdm')
    .directive('evValue', function () {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                value: '=',
                noValue: '@',
            },
            templateUrl: 'ev-value.html'
        };
    });
angular.module('ev-fdm').factory('confirmBox', [
    '$modal',
    function($modal) {
        return function(title, message, positive, negative) {
            return $modal.open({
                backdrop: 'static',
                templateUrl: 'ev-confirm-box.html',
                controller: ['$scope', function($scope) {
                    $scope.title    = title;
                    $scope.message  = message;
                    $scope.positive = positive;
                    $scope.negative = negative;
                }]
            }).result;
        };
    }
]);

'use strict';

function FilterServiceFactory($rootScope, $timeout) {

    function FilterService() {
        
        this.filters = {};

        var listeners = [];
        var modifier = null;

        var self = this;
        $rootScope.$watch(function() { return self.filters; }, function(newFilters, oldFilters) {
            if(oldFilters === newFilters) {
                return;
            }

            $timeout(function() {
                if(self.modifier) {
                    self.modifier.call(self, newFilters, oldFilters);
                }
                else {
                    self.callListeners();
                }
            }, 0);

        }, true);

        this.setModifier = function(callback) {
            if(angular.isFunction(callback)) {
                this.modifier = callback;
            }
        };

        this.addListener = function(scope, callback) {
            if(angular.isFunction(callback)) {          
                listeners.push(callback);

                scope.$on('$destroy', function() {
                    self.removeListener(callback);
                });
            }
        };

        this.removeListener = function(callback) {
            angular.forEach(listeners, function(listener, index) {
                if(listener === callback) {
                    listeners.splice(index, 1);
                }
            });
        };

        this.callListeners = function() {
            var self = this;
            angular.forEach(listeners, function(listener) {
                listener(self.filters);
            })
        }
    }

    return new FilterService();
}

angular.module('ev-fdm')
    .factory('FilterService', ['$rootScope', '$timeout', FilterServiceFactory]);

/* jshint sub: true */
angular.module('ev-fdm').factory('Select2Configuration', [
    '$timeout',
    function($timeout) {
        return function(dataProvider, formatter, resultModifier, minimumInputLength, key) {
            var dataProviderFilter;
            var idFunction;
            var timeout = 600;
            var opt = {};
            if (typeof dataProvider === 'object') {
                opt = dataProvider;
                formatter = opt.formatter;
                resultModifier = opt.resultModifier;
                minimumInputLength = opt.minimumInputLength;
                key = opt.key;
                dataProviderFilter = opt.dataProviderFilter;
                dataProvider = opt.dataProvider;
                timeout = opt.timeout || timeout;
                if (typeof dataProviderFilter === 'object') {
                    var filter = dataProviderFilter;
                    dataProviderFilter = function() { return filter; };
                } else if (typeof dataProviderFilter !== 'function') {
                    dataProviderFilter = function() { return {}; };
                }

                if (typeof opt.id === 'string') {
                    idFunction = function(ressource) {return ressource[opt.id];};
                } else if (typeof opt.id === 'function') {
                    idFunction = opt.id;
                }
            }
            var oldQueryTerm = '', filterTextTimeout;

            var config = {
                minimumInputLength: angular.isDefined(minimumInputLength)
                    && angular.isNumber(minimumInputLength) ? minimumInputLength : 3,
                allowClear: true,
                query: function(query) {
                    var timeoutDuration = oldQueryTerm === query.term ? 0 : 600;

                    oldQueryTerm = query.term;

                    if (filterTextTimeout) {
                        $timeout.cancel(filterTextTimeout);
                    }

                    filterTextTimeout = $timeout(function() {
                        dataProvider(query.term, query.page, dataProviderFilter).then(function(resources) {

                            var res = [];
                            if (resultModifier) {
                                angular.forEach(resources, function(resource) {
                                    res.push(resultModifier(resource));
                                });
                            }

                            var result = {
                                results: res.length ? res : resources
                            };

                            if (resources.pagination &&
                                resources.pagination['current_page'] < resources.pagination['total_pages']) {
                                result.more = true;
                            }
                            if (key && query.term.length) {
                                var value = { id: null };
                                value[key] = query.term;
                                if (result.results.length) {
                                    var tmp = result.results.shift();
                                    result.results.unshift(tmp, value);
                                } else {
                                    result.results.unshift(value);
                                }
                            }
                            query.callback(result);
                        });

                    }, timeoutDuration);

                },
                formatResult: function(resource, container, query, escapeMarkup) {
                    return formatter(resource);
                },
                formatSelection: function(resource) {
                    return formatter(resource);
                },
                initSelection: function() {
                    return {};
                },
                id: idFunction,
            };
            return config;
        };
    }
]);

'use strict';
/*
    Takes a string in the form 'yyyy-mm-dd hh::mn:ss'
*/
angular.module('ev-fdm')
    .filter('cleanupDate', function() {
        return function(input) {
            var res = '';
            if (input) {
                var y = input.slice (0,4);
                var m = input.slice (5,7);
                var day = input.slice (8,10);

                res = day + '/'+ m + '/' + y;
            }

            return res;
        };
    });
(function() {
'use strict';

var hasOwnProp = Object.prototype.hasOwnProperty;
var isObject = angular.isObject;

function MapFilterProvider() {
  var maps = {};
  var defaults = {};

  function assertMapping(name) {
    if (!hasOwnProp.call(maps, name)) {
      throw new Error('Mapping "' + name + '" is not valid, did you register it using mapSymbolFilterProvider#registerMapping() ?');
    }
  }

  this.registerMapping = function(name, mapping) {
    if (hasOwnProp.call(maps, name)) {
      throw new Error('A mapping named "' + name + '" was already registered');
    }
    var map = maps[name] = {};
    for (var key in mapping) {
      if (hasOwnProp.call(mapping, key)) {
        map[key] = mapping[key];
      }
    }
  };

  this.registerDefault = function(name, value) {
    assertMapping(name);
    defaults[name] = value;
  };

  this.$get = function factory() {
    return function mapFilter(key, mapping) {
      // Mapping is directly provided
      if (isObject(mapping)) {
        return hasOwnProp.call(mapping, key) ? mapping[key] : key;
      }
      // or it's just a mapping name
      assertMapping(mapping);
      var map = maps[mapping];
      switch (true) {
        case hasOwnProp.call(map, key):
          return map[key];
        case hasOwnProp.call(defaults, mapping):
          return defaults[mapping];
        default:
          return key;
      }
    };
  };
}


angular.module('ev-fdm')
  .provider('mapFilter', MapFilterProvider)
;

})();

angular.module('ev-fdm')
     .filter('prettySecs', [function() {
            return function(timeInSeconds) {
               	var numSec = parseInt(timeInSeconds, 10); // don't forget the second param
			    var hours   = Math.floor(numSec / 3600);
			    var minutes = Math.floor((numSec - (hours * 3600)) / 60);
			    var seconds = numSec - (hours * 3600) - (minutes * 60);

			    if (hours   < 10) {hours   = "0"+hours;}
			    if (minutes < 10) {minutes = "0"+minutes;}
			    if (seconds < 10) {seconds = "0"+seconds;}
			    var time    = hours+':'+minutes+':'+seconds;
			    return time;
            };
    }]);

angular.module('ev-fdm')
     .filter('replace', [function() {
            return function(string, regex, replace) {
                if (!angular.isDefined(string)) {
                    return '';
                }
                return string.replace(regex, replace || '');
            };
    }]);

angular.module('ev-fdm')
     .filter('sum', ['$parse', function($parse) {
            return function(objects, key) {
                if (!angular.isDefined(objects)) {
                    return 0;
                }
                var getValue = $parse(key);
                return objects.reduce(function(total, object) {
                    var value = getValue(object);
                    return total +
                        ((angular.isDefined(value) && angular.isNumber(value)) ? parseFloat(value) : 0);
                }, 0);
            };
    }]);

angular.module('ev-fdm')
	.filter('textSelect', [function() {

		return function(input, choices) {

			if(choices[input]) {
        return choices[input];
      }

    	return input;
		};

	}]);
'use strict';

angular.module('ev-fdm')
    .filter('unsafe', ['$sce', function($sce) {
        return function(val) {
            return $sce.trustAsHtml(val);
        };
    }]);
angular.module('ev-fdm')
.service('DownloadService', ['$window', '$document', function($window, $document) {
    var iframe = null;
    return {
        /**
         * Download a specific url using an iframe
         *
         * @param  {string}  url         the url you want to download
         * @param  {boolean} useFullHost either you want to prepend the full host or not (without trailing slash!)
         */
        download: function(url, useFullHost) {
            if(!iframe) {
                iframe = $document[0].createElement('iframe');
                iframe.style.display = 'none';
                $document[0].body.appendChild(iframe);
            }

            if(useFullHost) {
                var fullHost = $window.location.protocol + '//' + $window.location.host;
                url = fullHost + url;
            }

            iframe.src = url;
        }
    };
}]);

'use strict';

// Map that stores the selected filters across pages
angular.module('ev-fdm').
    service('FilteringService', ['$location', function ($location) {

        var filters = {};

        return {
            setSelectedFilter:function (filterName, value){
                if (value != undefined && value != 'undefined'){
                    filters[filterName] = value;
                    // $location.search(filterName, encodeURIComponent(value));
                }
                else {
                    filters[filterName] = '';
                }

            },

            getSelectedFilter:function (filterName){
                var res = '';

                if (typeof filters[filterName] != 'undefined' && filters[filterName] != 'undefined') {
                    res = filters[filterName];
                }

                return res;
            },

            getAllFilters:function (){
                return filters;
            }
        }
    }]
    );
/**
 * ModalService
 *     Angularization of bootstrap's $.fn.modal into a service
 *     - read template from ng's template cache
 *     - uses ng's $compilation, attaching the provided $scope
 *     - (optional) attach a controller to the view for more advanced modals
 *
 * Usage:
 *     - modalService.open({
 *         .. same as twitter bootstrap options
 *         template:                [html value string],
 *         templateUrl:             [url matching a key in $templateCache],
 *         scope:                   [key values],
 *         parentScope (optional):  [scope will inherit from that scope, $rootScope by default],
 *         controller: (optional):  [that controller will be injected on the view]
 *     })
 *     returns the $dom
 *
 * @author maz
 */

var module = angular.module('ev-fdm');

var ModalService = function($rootScope, $templateCache, $compile, $controller) {
    this.$rootScope = $rootScope;
    this.$templateCache = $templateCache;
    this.$compile = $compile;
    this.$controller = $controller;
};

ModalService.prototype.open = function(options) {
    // extend and check options given
    options = this._readOptions(options);

    // get/create the scope
    var $scope = (options.parentScope || this.$rootScope).$new();
    $scope = _($scope).extend(options.scope);

    // attach a controller if specified
    var $controller;
    if (options.controller) {
        $controller = this.$controller(options.controller, { $scope: $scope });
    }

    // create the dom that will feed bs modal service
    var modalDom = this.$compile(options.template || this.$templateCache.get(options.templateUrl))($scope);

    // attach these to the returned dom el
    modalDom.$scope = $scope;
    modalDom.$controller = $controller;
    // controller has access to the bs dom modal object
    if ($controller) {
        $controller.$modal = modalDom;
    }

    return $(modalDom).modal(options);
}

ModalService.prototype._readOptions = function(options) {
    // read options, adding defaults
    options = _({
        backdrop: true,
        scope: {},
        keyboard: true
    }).extend(options);

    // templateUrl is compulsory
    if (!options.templateUrl && !options.template) {
        throw new Error('Either template or templateUrl have to be defined');
    }

    return options;
}

// injection
module.service('ModalService', [
    '$rootScope',
    '$templateCache',
    '$compile',
    '$controller',
    ModalService
]);
'use strict';

/* Services */
var module = angular.module('ev-fdm');

// Map that stores the selected filters across pages
module.service('NotificationsService', ['$timeout', function($timeout) {

    var self = this;
    var queue = [];
    var DEFAULT_DELAY = 5;
    var TYPES = {
        SUCCESS : 0,
        ERROR : 1,
        INFO : 2,
        WARNING : 3
    };

    /**
     * The notification being displayed
     */
    this.activeNotification = null;

    /**
     * Give this function a notification object with :
     * {
     *     text: 'the text you want to display',
     *     type: the type, a value among the constant in NotificationsService.type
     *     [delay]: optionnal, the duration in seconds during which you want to display the error
     *             if -1 : sticky message
     * }
     */
    function add(notification) {
        if (!notification.type) {
            notification.type = TYPES.SUCCESS;
        }
        queueNotification(notification);
    }

    /**
     * For manual removal
     */
    function remove(notification) {
        queue = _(queue).without(notification);
        next();
    }

    function next() {
        if (queue.length) {
            var notification = queue[0];
            if (self.activeNotification !== notification) {
                self.activeNotification = notification;
                if (notification.delay !== -1) {
                    // The notification is removed after a while
                    $timeout(
                        function() { remove(notification); },
                        (notification.delay || DEFAULT_DELAY) * 1000
                    );
                }
            }
        } else {
            self.activeNotification = null;
        }
    }

    function queueNotification(notification) {
        queue.push(notification);
        next();
    }

    function prepareNotification(notification) {
        if(!angular.isObject(notification)){
            return { text: notification };
        }

      return notification;
    }

    // export only these
    this.add = add;
    this.remove = remove;
    this.addError = function(notification) {
        
        notification = prepareNotification(notification);

        notification.type = TYPES.ERROR;
        add(notification);
    };
    this.addSuccess = function(notification) {

        notification = prepareNotification(notification);

        notification.type = TYPES.SUCCESS;
        add(notification);
    };
    this.type = TYPES;
}]);

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
                $animate.move(panel.element, container, null, function () {
                    updateLayout(containerId);
                });
            } else {
                var beforePanel = getBeforePanelElm(panel.index, containerId);
                    $animate.move(panel.element, container, beforePanel.element, function () {
                        updateLayout(containerId);
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
                var scope = $rootScope.$new();
                element.html(template);
                element = $compile(element)(scope);
                panel.element  = element;
                panel.scope = scope;
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
            $animate.leave(element, function() {
                updateLayout(containerId);
                panels[name].scope.$destroy();
                delete panels[name];
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


        function updateLayout(containerId) {
            if (!containerId) {
                Object.keys(containers).map(function (id) {
                    updateLayout(id);
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

'use strict';

var module = angular.module('ev-fdm');

module.service('SortService', [function() {
    var currentSortValue = '';
    var isReverse = false;

    var getCurrentSort = function() {
        return currentSortValue;
    }
    
    var sortBy = function(sortValue) {
        if (sortValue == currentSortValue)
            isReverse = !isReverse;
        else {
            currentSortValue = sortValue;
        }
        return this;
    };

    var getSortCSS = function(value) {
        var res = 'sort ';
        if (value == currentSortValue) {
            if (isReverse)
                res += 'sort-up';
            else
                res += 'sort-down';
        }
        else
            res += 'no-sort';
        return res;
    }

    var setReverse = function(reverse) {
        isReverse = reverse;
    };
    var isReverse = function() {
        return isReverse;
    };

    return {
        'sortBy'        : sortBy,
        'getSortCSS'    : getSortCSS,
        'getCurrentSort': getCurrentSort,
        'setReverse'    : setReverse,
        'isReverse'     : isReverse
    }
}]);
'use strict';

var module = angular.module('ev-fdm');

module.service('UtilService', [function() {
    this.generatedIds = {};

    this.generateId = function(prefix) {
        var id = prefix + Math.random() * 10000;

        if(typeof(this.generatedIds[id] !== 'undefined')) {
            this.generatedIds[id] = true;
        } else {
            id = this.generateId(prefix);
        }

        return id;
    };
}]);

angular.module('ev-fdm')
    .factory('RestangularStorage', ['$rootScope', '$q', 'Restangular', function($rootScope, $q, restangular) {

        function RestangularStorage(resourceName, defaultEmbed) {
            this.restangular = restangular;
            this.resourceName = resourceName;
            this.defaultEmbed = defaultEmbed || [];

            this.emitEventCallbackCreator = function(eventName, elements) {
                return function(result) {
                    $rootScope.$broadcast(this.resourceName + '::' + eventName, elements);
                    return result;
                }.bind(this);
            }.bind(this);
        }

        RestangularStorage.buildSortBy = function(sortKey, reverseSort) {
            var sortDir = reverseSort ? 'DESC' : 'ASC';
            return sortKey + ':' + sortDir;
        };

        RestangularStorage.buildEmbed = function(embed) {
            return embed.join(',');
        };

        RestangularStorage.buildParameters = function(resource, embed) {
            var parameters = {};

            if(angular.isArray(embed) && embed.length) {
                parameters.embed = RestangularStorage.buildEmbed(embed.concat(resource.defaultEmbed));
            }
            else if(resource.defaultEmbed.length) {
                parameters.embed = RestangularStorage.buildEmbed(resource.defaultEmbed);
            }

            return parameters;
        };

        RestangularStorage.buildFilters = function(filters) {
            var res = {};

            angular.forEach(filters, function(filter, filterKey) {

                if(angular.isObject(filter) && angular.isDefined(filter.uuid)) {
                    res[filterKey + '.uuid'] = filter.uuid;
                }
                else if(angular.isObject(filter) && angular.isDefined(filter.id)) {
                    res[filterKey + '.id'] = filter.id;
                }
                else if(angular.isArray(filter) && filter.length > 0) {
                    res[filterKey] = filter.join(',');
                }
                else if(angular.isDate(filter)) {
                    res[filterKey] = filter.toISOString();
                }
                else if(angular.isDefined(filter) && filter !== '' && filter !== null) {
                    res[filterKey] = filter;
                }

            });

            return res;
        };

        RestangularStorage.updateObjectFromResult = function(object, result) {
            (function merge(objectData, resultData, resultEmbeds) {
                if (resultEmbeds) {
                    resultEmbeds.forEach(function(embedName) {
                        if (embedName in resultData) {
                            if (!objectData[embedName] || !objectData[embedName].data) {
                                objectData[embedName] = resultData[embedName];
                            } else if (typeof resultData[embedName].data !== 'object' ||
                                       Array.isArray(resultData[embedName].data)) {
                                objectData[embedName].data = resultData[embedName].data;
                            } else {
                                merge(
                                    objectData[embedName].data,
                                    resultData[embedName].data,
                                    resultData[embedName].embeds
                                );
                            }
                            delete resultData[embedName];
                        }
                    });
                }
                angular.extend(objectData, resultData);
            })(
                object.data && object.embeds ? object.data : object,
                angular.copy(restangular.stripRestangular(result)),
                result.embeds
            );
        };
        RestangularStorage.prototype.updateObjectFromResult = RestangularStorage.updateObjectFromResult;

        RestangularStorage.updateObjectBeforePatch = function(object, changes) {
            (function merge(objectData, objectEmbeds, changesData) {
                if (objectEmbeds) {
                    objectEmbeds.forEach(function(embedName) {
                        if (embedName in changesData) {
                            if (!objectData[embedName] || !objectData[embedName].data) {
                                objectData[embedName] = changesData[embedName];
                            } else if (typeof changesData[embedName].data !== 'object' ||
                                       Array.isArray(changesData[embedName].data)) {
                                objectData[embedName].data = changesData[embedName].data;
                            } else {
                                merge(
                                    objectData[embedName].data,
                                    objectData[embedName].embeds,
                                    changesData[embedName].data
                                );
                            }
                            delete changesData[embedName];
                        }
                    });
                }
                angular.extend(objectData, changesData);
            })(object, object.embeds, angular.copy(changes));
        };


        RestangularStorage.prototype.getAll = function(options) {
            var parameters = {};

            options = options || {};

            if (angular.isNumber(options.page) && options.page > 0) {
                parameters.page = options.page;
            }

            if (angular.isNumber(options.number) && options.number > 0) {
                parameters.number = options.number;
            }

            if (angular.isArray(options.embed) && options.embed.length) {
                parameters.embed = RestangularStorage.buildEmbed(options.embed.concat(this.defaultEmbed));
            }
            else if (this.defaultEmbed.length) {
                parameters.embed = RestangularStorage.buildEmbed(this.defaultEmbed);
            }

            if (options.sortKey) {
                parameters.sortBy = RestangularStorage.buildSortBy(options.sortKey, options.reverseSort);
            }

            if (options.filters) {
                var filters = RestangularStorage.buildFilters(options.filters);
                angular.extend(parameters, filters);
            }
            return this.restangular.all(this.resourceName).getList(parameters);
        };


        RestangularStorage.prototype.getFirst = function(embed, filters, sortKey, reverseSort) {
            return this.getAll.call(this, {
                number: 1,
                page: null,
                embed: embed,
                filters: filters,
                sortKey: sortKey,
                reverseSort: reverseSort
            }).then(function(result) {
                return result[0];
            });
        };

        RestangularStorage.prototype.getList = function(page, embed, filters, sortKey, reverseSort) {
            return this.getAll.call(this, {
                page: page,
                embed: embed,
                filters: filters,
                sortKey: sortKey,
                reverseSort: reverseSort
            });
        };

        RestangularStorage.prototype.getById = function(id, embed) {
            return this.restangular.one(this.resourceName, id).get(RestangularStorage.buildParameters(this, embed));
        };

        RestangularStorage.prototype.update = function(element, embed, options) {
            if (!element.put) {
                restangular.restangularizeElement(null, element, this.resourceName);
            }
            return element.put(RestangularStorage.buildParameters(this, embed))
                .then(function(result) {
                    if (!options || !options.preventObjectUpdate) {
                        RestangularStorage.updateObjectFromResult(element, result);
                    }
                    return result;
                })
                .then(this.emitEventCallbackCreator('updated', [element]));
        };

        RestangularStorage.prototype.updateAll = function(elements, embed, options) {
            var parameters = RestangularStorage.buildParameters(this, embed);

            return $q.all(elements.map(function(element) {
                return element.put(parameters)
                    .then(function(result) {
                        if (!options || !options.preventObjectUpdate) {
                            RestangularStorage.updateObjectFromResult(element, result);
                        }
                        return result;
                    });
            })).then(this.emitEventCallbackCreator('updated', elements));
        };

        RestangularStorage.prototype.patch = function(element, changes, embed, options) {
            if (!element.patch) {
                restangular.restangularizeElement(null, element, this.resourceName);
            }
            RestangularStorage.updateObjectBeforePatch(element, changes);
            return element.patch(changes, RestangularStorage.buildParameters(this, embed))
                .then(function(result) {
                    if (!options || !options.preventObjectUpdate) {
                        RestangularStorage.updateObjectFromResult(element, result);
                    }
                    return result;
                })
                .then(this.emitEventCallbackCreator('updated', [element]));
        };

        RestangularStorage.prototype.patchAll = function(elements, changes, embed, options) {
            elements.forEach(function(element) {
                RestangularStorage.updateObjectBeforePatch(element, changes);
            });
            var parameters = RestangularStorage.buildParameters(this, embed);

            return $q.all(elements.map(function(element) {
                return element.patch(changes, parameters)
                    .then(function(result) {
                        if (!options || !options.preventObjectUpdate) {
                            RestangularStorage.updateObjectFromResult(element, result);
                        }
                        RestangularStorage.updateObjectFromResult(element, result);
                        return result;
                    });
            })).then(this.emitEventCallbackCreator('updated', elements));
        };

        RestangularStorage.prototype.create = function(element, embed, options) {
            return this.restangular.all(this.resourceName)
                .post(element, RestangularStorage.buildParameters(this, embed))
                .then(function(result) {
                    if (!options || !options.preventObjectUpdate) {
                        RestangularStorage.updateObjectFromResult(element, result);
                    }
                    return result;
                })
                .then(this.emitEventCallbackCreator('created', [element]));
        };

        RestangularStorage.prototype.delete = function(element) {
            if (!element.delete) {
                restangular.restangularizeElement(null, element, this.resourceName);
            }
            return element.remove().then(this.emitEventCallbackCreator('deleted', [element]));
        };

        RestangularStorage.prototype.deleteAll = function(elements) {

            return $q.all(elements.map(function(element) {
                return element.remove();
            })).then(this.emitEventCallbackCreator('deleted', elements));
        };

        /**
         * prefer use of create() or update()
         */
        RestangularStorage.prototype.save = function(element, embed, options) {
            if (!element.save) {
                restangular.restangularizeElement(null, element, this.resourceName);
            }
            return element.save(RestangularStorage.buildParameters(this, embed))
                .then(function(result) {
                    if (!options || !options.preventObjectUpdate) {
                        RestangularStorage.updateObjectFromResult(element, result);
                    }
                    return result;
                })
                .then(this.emitEventCallbackCreator('updated', [element]));
        };

        RestangularStorage.prototype.saveAll = function(elements, embed, options) {
            var parameters = RestangularStorage.buildParameters(this, embed);

            return $q.all(elements.map(function(element) {
                return element.save(parameters)
                    .then(function(result) {
                        if (!options || !options.preventObjectUpdate) {
                            RestangularStorage.updateObjectFromResult(element, result);
                        }
                        return result;
                    });
            })).then(this.emitEventCallbackCreator('updated', elements));
        };

        RestangularStorage.prototype.getNew = function() {
            return this.restangular.one(this.resourceName);
        };

        RestangularStorage.prototype.copy = function(element) {
            return this.restangular.copy(element);
        };

        return RestangularStorage;
    }]);

angular.module('ev-fdm')
  .directive('disableValidation', function() {
    return {
      require: '^form',
      restrict: 'A',
      link: function(scope, element, attrs, form) {
        var control;

        scope.$watch(attrs.disableValidation, function(value) {
          if (!control) {
            control = form[element.attr("name")];
          }
          if (value === false) {
            form.$addControl(control);
            angular.forEach(control.$error, function(validity, validationToken) {
              form.$setValidity(validationToken, !validity, control);
            });
          } else {
            form.$removeControl(control);
          }
        });
      }
    };
  });

angular.module('ev-fdm')
.directive('strictMin', function() {
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {

            function validator(viewValue) {
                var testedValue = parseFloat(viewValue),
                    min = parseFloat(attrs.strictMin);

                if(testedValue > min ) {
                    ctrl.$setValidity('strictMin', true);
                    return viewValue;
                }
                else {
                    ctrl.$setValidity('strictMin', false);
                    return undefined;
                }

            };

            ctrl.$parsers.unshift(validator);
            ctrl.$formatters.push(validator);
        }
    }
});