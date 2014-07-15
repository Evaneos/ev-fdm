/**
 * Common Application
 */

// Angular depedencies for this app
var commonModule = angular.module('ev-fdm', ['ui.router', 'ui.date', 'chieffancypants.loadingBar',
        'ui.bootstrap.tooltip','ui.select2', 'angularMoment', 'ngAnimate', 'checklist-model', 'ui.bootstrap',
        'restangular']);


// configure the loading bar to be displayed
// just beneath the menu
commonModule.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = false;
    cfpLoadingBarProvider.parentSelector = '#lisette-menu';
}]);

commonModule.config(['$tooltipProvider', function($tooltipProvider) {
    $tooltipProvider.options({
        placement: 'bottom',
        popupDelay: 100
    });
}]);

/**
 * Define a default error state for our app
 */
commonModule.config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('ev-error', {
        templateUrl: 'ev-error.phtml'
    });
}]);

commonModule.config(['RestangularProvider', function(restangularProvider) {

}]);


// ----------------------------------------------------
// ATTACH TO MODULE
// ----------------------------------------------------

commonModule.run(['$rootScope', '$state', '$location', 'NotificationsService', 'uiSelect2Config', function($rootScope,
        $state, $location, notificationsService, uiSelect2Config) {

    // defaults for select2
    uiSelect2Config.minimumResultsForSearch = 7;
    uiSelect2Config.allowClear = true;


    // language for the user OR navigator language OR english
    window.moment.lang([window.navigator.language, 'en']);

    $rootScope.$on('$stateChangeStart', function(event, toState) {
        $state.nextState = toState;
        // not a tab changing
        if (!$state.current.name || toState.name.indexOf($state.current.name) !== 0) {
            $('body').addClass('state-resolving');
        }
    });

    $rootScope.$on('$stateChangeSuccess', function() {
        $('body').removeClass('state-resolving');
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
    $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, error) {
        $('body').removeClass('state-resolving');

        var errorMessage = (toState.fallback && toState.fallback.message) || 'Error';

        notificationsService.addError({
            text: errorMessage
        });

        // Redirect to the fallback we defined in our state
        if(toState && toState.fallback && toState.fallback.state) {
          $state.go(toState.fallback.state);
        }
        // Or our default error page
        // It's commented because ev-error is a template (in views) that doesn't seems to be loaded
        // else {
        //   $state.go('ev-error');
        // }
    });

    /*if (evaneos._frontData) {
        var scopeKeys = evaneos.frontData('__scopeKeys');
        _(scopeKeys).each(function(key) {
            $rootScope[key] = evaneos.frontData(key);
        });
    }
    */


}]);
angular.module('ev-fdm')
    .factory('ListController', ['$state', '$stateParams', 'Restangular', function($state, $stateParams, restangular) {

        function ListController($scope, elementName, elements, defaultSortKey, defaultReverseSort) {
            var self = this;

            /*
                Properties
             */
            this.$scope = $scope;
            this.elementName = elementName;
            this.elements = elements;
            this.defaultSortKey = defaultSortKey;
            this.defaultReverseSort = defaultReverseSort;
            this.sortKey = this.defaultSortKey;
            this.reverseSort = this.defaultReverseSort;

            this.updateScope();

            /*
                Pagination method that should be called from the template
             */
            this.$scope.changePage = function(newPage) {
                self.update(newPage, self.filters, self.sortKey, self.reverseSort);
            };

            /*
                Sort method that should be called from the template
             */
            this.$scope.sortChanged = function() {
                self.sortKey = self.$scope.sortKey;
                self.reverseSort = self.$scope.reverseSort;
                self.update(1, self.filters, self.sortKey, self.reverseSort);
            };

            /*
                Display an item by changing route
             */
            this.$scope.toggleDetailView = function(element) {

                if(!element) {
                    $state.go(self.elementName);
                    return;
                }

                var id = restangular.configuration.getIdFromElem(element);

                if(!id || $stateParams.id === id) {
                    $state.go(self.elementName);
                }
                else {
                    $state.go(self.elementName + '.view', {id: id});
                }
            };

            /*
                Update the view when filter are changed in the SearchController
             */
            this.$scope.$on('common::filters.changed', function(event, filters) {
                self.filters = filters;
                self.sortKey = self.defaultSortKey;
                self.defaultReverseSort = self.defaultReverseSort;
                self.update(1, self.filters, self.sortKey, self.reverseSort);
            });

            /*
                When returning to the list state remove the active element
             */
            this.$scope.$on('$stateChangeSuccess', function(event, toState) {
                if(toState.name === self.elementName) {
                    self.$scope.activeElement = null;
                }
            });

            this.$scope.$on(this.elementName + '::updated', function(event, updatedElements) {
                self.update(self.$scope.currentPage, self.filters, self.sortKey, self.reverseSort);
            });

            this.$scope.$on(this.elementName + '::created', function(event, createdElements) {
                self.update(self.$scope.currentPage, self.filters, self.sortKey, self.reverseSort);
            });

            this.$scope.$on(this.elementName + '::deleted', function(event, deletedElements) {
                self.update(self.$scope.currentPage, self.filters, self.sortKey, self.reverseSort);
            });
        }

        ListController.prototype.update = function(page, filters, sortKey, reverseSort) {
            var self = this;
            self.fetch(page, filters, sortKey, reverseSort).then(function(elements) {
                self.elements = elements;
                self.updateScope();
            });
        };

        ListController.prototype.updateScope = function () {
            var self = this;

            this.$scope[this.elementName] = this.elements;
            this.$scope.currentPage = this.elements.pagination.current_page;
            this.$scope.pageCount = this.elements.pagination.total_pages;
            this.$scope.sortKey = this.sortKey;
            this.$scope.reverseSort = this.reverseSort;
            this.$scope.selectedElements = [];
            this.$scope.activeElement = null;

            if(angular.isDefined($state.params.id)) {
                angular.forEach(this.elements, function(element) {
                    var elementId = restangular.configuration.getIdFromElem(element);
                    if(elementId === $state.params.id) {
                        self.$scope.activeElement = element;
                    }
                });
            }
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
            var self = this;

            this.$scope = $scope;
            this.$scope.filters = {};

            this.$scope.filtersChanged = function() {
                $rootScope.$broadcast('common::filters.changed', self.$scope.filters);
            };
        };

        return SearchController;
    }]);
'use strict';

angular.module('ev-fdm')
    .directive('activableSet', function() {
        return {
            restrict: 'A',
            controller: ['$scope', '$attrs', '$parse', function($scope, $attrs, $parse) {
                this.activeElement;

                var activeElementGet = $parse($attrs.activeElement),
                    activeElementSet = activeElementGet.assign;
               
                var self = this;
                $scope.$watch(function() {
                    return activeElementGet($scope);
                }, function(newActiveElement) {
                    self.activeElement = newActiveElement;
                });

               this.toggleActive = function(value) {
                    if(value !== this.activeElement) {
                        if(activeElementSet) {
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
    })
    .directive('activable', function() {
        return {
            restrict: 'A',
            require: '^activableSet',
            link: function(scope, element, attr, ctrl) {
                element.addClass('clickable');

                var currentElement = scope[attr.activable];

                scope.$watch(function() { return ctrl.activeElement; }, function(newActiveElement, oldActiveElement) {
                    if(newActiveElement && currentElement === newActiveElement) {
                        element.addClass('active');
                    }
                    else {
                        element.removeClass('active');
                    }
                });

                element.on('click', function(event) {
                    if(!$(event.target).closest('.block-active').length && !event.ctrlKey && ! event.shiftKey) {
                        scope.$apply(function() {
                            ctrl.toggleActive(currentElement);
                        });
                    }
                });
            }
        }
    });
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
.directive('download', ['$http', '$location', '$document', function($http, $location, $document) {
    var iframe = null;
    return {
        link: function(scope, elm, attrs) {
            elm.on('click', function(event) {
                $http.get(attrs.download).success(function(data) {
                    if(!iframe) {
                        iframe = $document[0].createElement('iframe');
                        iframe.style.display = 'none';
                        $document[0].body.appendChild(iframe);
                    }
                    iframe.src = data.url;
                });
            });
        }
    }
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
'use strict';

function MenuManagerProvider() {

    var self = this;
    this.tabs = [];
    this.activeTab = null;
    this.lastTab = null;

    this.addTab = function(tab) {
        this.tabs.push(tab);
        return this;
    }

    function findTab(stateName) {
        var res = null;
        angular.forEach(self.tabs, function(tab) {
            if(stateName === tab.state) {
                res = tab;
            }
        })

        return res;
    }

    function selectTab(tab) {
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
        }
    }];
}

function EvMenuDirective(menuManager) {
    return {
        restrict: 'E',
        replace: true,
        template:   '<ul class="lisette-module-tabs nav nav-tabs" ng-cloak>' +
                        '<li ng-repeat="tab in tabs" ng-class="{active: tab.active}">' +
                            '<a ng-click="selectTab(tab)">{{ tab.name }}</a>' +
                        '</li>' +
                    '</ul>',
        controller: [ '$scope', '$state', function($scope, $state) {
            $scope.tabs = menuManager.tabs;
            $scope.selectTab = function(tab) {
                menuManager.selectTab(tab);
                $state.go(tab.state);
            }
        }]
    }

};

angular.module('ev-fdm')
    .provider('menuManager', [MenuManagerProvider])
    .directive('evMenu', ['menuManager', EvMenuDirective]);
'use strict';

var module = angular.module('ev-fdm');

module.directive('evFilters', function() {
    return {
        restrict: 'E',
        replace: true,
        transclude: true,
        templateUrl: 'filters.phtml'
    };
});

angular.module('ev-fdm')
    .directive('evFixedHeaders', ['$timeout', function ($timeout) {

    function _sync($table) {
        var $headers = $table.find('thead > tr');
        var $firstTr = $table.find('tbody > tr').first();

        // no header to resize
        if (!$headers.length) return;

        // uniform size for every header
        if (!$firstTr.length) {
            $headers.addClass('uniform');
            _uniformSize($headers, $table.outerWidth());
            return;
        } else {
            $headers.removeClass('uniform');
        }

        // compute size from first line sizing
        var currentChildIndex = 0;
        var $ths = $headers.find('th');
        $ths.each(function() {
            var $td = $firstTr.find('td:nth-child(' + (1 + currentChildIndex) + ')');
            if ($td.is(':visible')) {
                $(this).css('width', $td.outerWidth()).show();
                $(this).css('maxWidth', $td.outerWidth()).show();
            } else {
                $(this).hide();
            }
            currentChildIndex++;
        })
    }

    function _timeoutSync($table) {
        $timeout(function() {
            _sync($table);
        }, 0, false);
    }

    function _uniformSize($headers, width) {
        var $tds = $headers.find('th');
        if (!$tds.length) return;
        $tds.each(function() {
            $(this).css('width', (width/$tds.length) + 'px');
        });
    }

    return {

        restrict: 'A',
        replace: false,

        scope: {
            rows: '='
        },

        link: function ($scope, element, attrs) {
            var $table = $(element);
            $table.addClass('fixed-headers');
            $(window).on('resize', function() {
                _sync($table);
            });
            $scope.$on('module-layout-changed', function() {
                _sync($table);
            });
            // watch for raw data changes !
            $scope.$watch('rows', function() {
                _timeoutSync($table);
            }, true);
            // wait for end of digest then sync headers
            _timeoutSync($table);
        }
    }

}]);
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
    .directive('evModule', [ '$timeout', '$rootScope', function($timeout, $rootScope) {

    var bars = {
        tabs: {
            versions: []
        },
        topbar: {
            versions: [ 'size-mini', 'size-default', 'size-big' ]
        },
        leftbar: {
            versions: []
        },
        bottombar: {
            versions: []
        }
    };

    /**
     * Looks inside the module element for any module bar, and populates
     * required classes for each bar on the module container
     */
    function updateBarClasses($moduleEl) {
        return function() {
            angular.forEach(bars, function(barConfig, barId) {
                var $el = $moduleEl.find('.lisette-module-' + barId);
                var hasClass = 'has-' + barId;
                $moduleEl.removeClass(
                    _(barConfig.versions)
                        .map(function(versionId) {
                            return barId + '-' + versionId
                        })
                        .join(' '));
                if ($el.length) {
                    $moduleEl.addClass(hasClass);
                    angular.forEach(barConfig.versions, function(versionId) {
                        if ($el.hasClass('version-' + versionId)) {
                            $moduleEl.addClass(barId + '-' + versionId);
                        }
                    });
                } else {
                    $moduleEl.removeClass(hasClass);
                }
            });
            $rootScope.$broadcast('module-layout-changed');
        }
    };

    return {
        restrict: 'A',
        link: function($scope, element, attributes) {
            element.addClass('lisette-module');
            $scope.$on('$stateChangeSuccess', function() {
                $timeout(updateBarClasses(element), 0);
            });
            $timeout(updateBarClasses(element), 0);
        }
    };
}
]);
'use strict';

angular.module('ev-fdm')
.directive('evModuleHeader', ['$timeout', function ($timeout) {

    var self = this;

    function _sync($wrapper) {
        var $header = $wrapper.find('.lisette-module-header');

        // make sure the wrapper spans the right height
        // even when the header is position fixed
        $wrapper.height($header.height() - 1);

        // declaring affix to bootstrap
        // bs will watch the scroll for us and add the affix css class to $header
        $header.affix({
            offset: {
                top: 1 //$('#lisette-menu').attr('data-offset-top')
            }
        });
    }

    return function($scope, element, attrs) {
        var $wrapper = $(element);
        $timeout(function() {
            _sync($wrapper);
        }, 0, false);
        $(window).on('resize', function() {
            _sync($wrapper);
        });
        $scope.$on('itemsLoaded', function() {
            _sync($wrapper);
        });
    }
}]);
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
            templateUrl: 'pagination.phtml',
            scope: {
                currPage:     '=',
                nbPage:       '=',
                onPageChange: '='
            },

            link : function (scope){
                scope.paginationButtons = [];
                scope.prevClass = '';
                scope.nextClass = '';

                if (!scope.currPage) scope.currPage = 1;
                if (!scope.nbPage)   scope.nbPage   = 1;

                scope.generateButtons = function () {
                    var nbAround = 2; // We want to have this amount of links around the current page.

                    scope.paginationButtons = [];
                    // Add 1
                    scope.paginationButtons.push ({value: 1, class:scope.currPage==1 ? 'active':'' });

                    // Add the 3 dots
                    if (scope.currPage-nbAround > 2) {
                        scope.paginationButtons.push({ value: ELLIPSIS, class:'disabled' });
                    }

                    // add the surrounding page numbers
                    for (var i = nbAround; i > 0; i--) {
                        if (scope.currPage-i > 1) {
                            scope.paginationButtons.push ({value: scope.currPage-i});
                        }
                    }

                    // add the actual page
                    if (scope.currPage != 1 && scope.currPage != scope.nbPage) {
                        scope.paginationButtons.push ({ value: scope.currPage, class:'active' });
                    }

                    // add the surrounding page numbers
                    for (var i = 1; i <= nbAround; i++) {
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
                }

                scope.previousPage = function (){
                    if (scope.currPage > 1) {
                        scope.currPage--;
                        if(angular.isFunction(scope.onPageChange)) {
                            scope.onPageChange(scope.currPage);
                        }
                    }

                }

                scope.changePage = function (value){
                    if (value != ELLIPSIS && value >=1 && value <= scope.nbPage){
                        scope.currPage = value;
                        
                        if(angular.isFunction(scope.onPageChange)) {
                            scope.onPageChange(value);
                        }
                    }
                }

                scope.nextPage = function (){
                    if (scope.currPage < scope.nbPage){
                        scope.currPage++;
                        
                        if(angular.isFunction(scope.onPageChange)) {
                            scope.onPageChange(scope.currPage);
                        }
                    }
                }

                scope.$watch('nbPage + currPage', function() {
                    scope.generateButtons ();
                });
            }
    };
}]);
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
angular.module('ev-fdm')
    .directive('promise', [function () {

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
                    })
                } else {
                    applyClass('promise-resolved', $element);
                }
            });
        }]
    }

}]);
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

angular.module('ev-fdm').directive('body', ['$rootScope', '$state', function ($rootScope, $state) {
    return {
        restrict: 'E',
        link: function(scope, element, attrs) {

            $rootScope.$on('$stateChangeStart', function(event, toState) {
                if (!$state.current.name || toState.name.indexOf($state.current.name) !== 0) {
                    element.addClass('state-resolving');
                }
            });

            $rootScope.$on('$stateChangeSuccess', function() {
                element.removeClass('state-resolving');
            });

            $rootScope.$on('$stateChangeError', function() {
                element.removeClass('state-resolving');
            });
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
            require: '^selectableSet',
            link: function(scope, element, attr, ctrl) {

                var currentElementGetter = $parse(attr.selectable);
                var currentElement = currentElementGetter(scope);

                ctrl.registerElement(currentElement);

                scope.$on('$destroy', function() {
                    ctrl.unregisterElement(currentElement);
                });

                scope.$watch(function() { return ctrl.isElementSelected(currentElement); }, function() {
                  scope.selected = ctrl.isElementSelected(currentElement);
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
                    else if (event.ctrlKey || angular.element(event.target).is('.checkbox')) {
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
            template: '<span class="checkbox" ng-class="{ active: selected }"></span>'
        };
    })
    .directive('selectAll', function() {
        return {
            restrict: 'E',
            require: '^selectableSet',
            scope: true,
            template: '<span class="checkbox" ng-class="{ active: allSelected }" ng-click="toggleSelectAll()"></span>',
            link: function(scope, element, attr, ctrl) {

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
            templateUrl: 'value.phtml'
        };
    });
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

angular.module('ev-fdm')
    .factory('Select2Configuration', ['$timeout', function($timeout) {

        return function(dataProvider, formatter, resultModifier, minimumInputLength) {
            var oldQueryTerm = '',
                filterTextTimeout;

            return {
                minimumInputLength: angular.isDefined(minimumInputLength) && angular.isNumber(minimumInputLength) ? minimumInputLength : 3,
                allowClear: true,
                query: function(query) {
                    var res = [],
                        timeoutDuration = (oldQueryTerm === query.term) ? 0 : 600;

                        oldQueryTerm = query.term;

                        if (filterTextTimeout) {
                            $timeout.cancel(filterTextTimeout);
                        }

                    filterTextTimeout = $timeout(function() {
                        dataProvider(query.term, query.page).then(function (resources){

                            var res = [];
                            if(resultModifier) {
                                angular.forEach(resources, function(resource ){
                                    res.push(resultModifier(resource));
                                });
                            }

                            var result = {
                                results: res.length ? res : resources
                            };

                            if(resources.pagination &&
                                resources.pagination.current_page < resources.pagination.total_pages) {
                                result.more = true;
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
                }
             };
        };
    }]);

if(typeof(Fanny) == 'undefined') {
    Fanny = {}
};

Fanny.Utils = {
    generatedIds : {},
    generateId : function(prefix) {
        var id = prefix + Math.random() * 10000;
        if(typeof(this.generatedIds[id] != 'undefined')) {
            this.generatedIds[id] = true;
        } else {
            id = generateId(prefix);
        }
        return id;
    },
    convertNumberToString : function(number, nbDecimals, intMinLength) {
        var thousandsSep = ' ';
        var decimalSep   = ',';
        var numberStr    = '';
        var numberArray  = [];
        var integer      = '';
        var decimals     = '';
        var result       = '';
        
        if(typeof(nbDecimals) == 'undefined') {
            nbDecimals = 2;
        }
        
        numberStr = number + '';
        numberArray = numberStr.split('.');
        if(numberArray.length < 1 && numberArray.length > 2) {
            throw new Error('Invalid number');
            return false;
        }
        
        integer = numberArray[0];
        
        if(numberArray.length == 1) {
            decimals = '';
            for(var i = 0; i < nbDecimals; i++) {
                decimals += '0';
            }
        } else {
            decimals = numberArray[1];
            if(decimals.length > nbDecimals) {
                decimals = decimals.substring(0, 2);
            } else {
                while(decimals.length < nbDecimals) {
                    decimals += '0';
                }
            }
        }
        for(var i = 0; i < integer.length; i++) {
            if(i % 3 == 0 && i != 0) {
                result = thousandsSep + result;
            }
            result = integer[integer.length - i - 1] + result;
        }
        if(result == '') {
            result = '' + 0;
        }
        
        for(var i = result.length; i < intMinLength; i++) {
            result = '0' + result;
        }
        
        if(decimals.length > 0) {
            result += decimalSep + decimals;
        }
        return result;
    },
    stringToVar : function(string) {
        if(typeof(string) != 'string') {
            throw new Error('Not a string');
            return;
        }
        if(!isNaN(string)) {
            return parseInt(string);
        }
        var _exploded = string.split('.');
        var _result = window;
        for (var index = 0; index < _exploded.length; index++) {
            if(_exploded[index].length && typeof(_result[_exploded[index]]) != 'undefined') {
                _result = _result[_exploded[index]];
            } else {
                throw new Error('No corresponding var found for ' + string);
                return;
            }
        }
        return _result;
    },
    formatDate : function(date) {
        if(!date || typeof(date) != 'object') {
            return '';
        }
        var year = date.getFullYear();
        var month = this.convertNumberToString(date.getMonth() + 1, 0, 2);
        var day = this.convertNumberToString(date.getDate(), 0, 2);
        return year + '-' + month + '-' + day;
    },
    Renderers : {
        date : function(date) {
            var _date     = null;
            var _splitted = null;
            var _obj      = null;
            if(date && typeof(date) == 'object') {
                _date = date.date;
            } else {
                _date = date;
            }
            if(typeof(_date) == 'string' && _date) {
                _date = _date.split(' ')[0];
                _splitted = _date.split('-');
                if (_splitted.length === 3) {
                    return _splitted[2] + '/' + _splitted[1] + '/' + _splitted[0];
                }
                else {
                    return '';
                }
            } else {
                return '';
            }
        },
        amounts : function(number) {
            var res = Fanny.Utils.convertNumberToString(number, 2);
            if(number >= 0) {
                return res;
            } else {
                return $('<span>').addClass('text-orange').html(res)
            }
            
        },
        money : function(number, row) {
            var currency = (row && row.currency && row.currency.symbole) ? row.currency.symbole : '€';
            var res = Fanny.Utils.convertNumberToString(number, 2) + ' ' + currency;
            if(number >= 0) {
                return res;
            } else {
                return $('<span>').addClass('text-orange').html(res)
            }
        },
        euros : function(number) {
            var res = Fanny.Utils.convertNumberToString(number, 2) + ' €';
            if(number >= 0) {
                return res;
            } else {
                return $('<span>').addClass('text-orange').html(res)
            }
        },
        upper : function(string) {
            if(typeof(string) == 'string') {
                return string.toUpperCase();
            } else {
                return string;
            }
        }
    }
}
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
'use strict';

/**
 * Meant to be used for stuff like this:
 * {{ message.isFromTraveller | cssify:{1:'message-traveller', 0:'message-agent'} }}
 * We want to display a css class depending on a given value,
 * and we do not want our controller to store a data for that
 * We can use this filter, and feed it with an object with the matching key,value we want
 */
angular.module('ev-fdm')
    .filter('cssify', function() {
        return function(input, possibilities) {
            var res = '';
            if (possibilities)
            {
                for (var prop in possibilities) {
                    if (possibilities.hasOwnProperty(prop)) { 
                        if (input == prop){
                            res = possibilities[prop];
                            break;
                        }
                    }
                }
            }

            return res;
        };
    });
'use strict';

angular.module('ev-fdm')
    .filter('unsafe', ['$sce', function($sce) {
        return function(val) {
            return $sce.trustAsHtml(val);
        };
    }]);
'use strict';

/* Services */
var module = angular.module('ev-fdm');

var AbstractAutocompleteStorage = function (AbstractStorage, $timeout) {
    _.extend (this, AbstractStorage);
    this.AbstractStorage = AbstractStorage;
    this.$timeout = $timeout;
}

AbstractAutocompleteStorage.prototype.generateAutocompleteConfig = function (searchCallback, matchingCallback, minLength) {
    var me = this;

    var filterTextTimeout;
    return {
        minimumInputLength: minLength,
        allowClear: true,
        initSelection: function() {
            return '';
        },
        query: function(q) {
            var res = [],
                searchParam = q.term;

            if (filterTextTimeout) {
                me.$timeout.cancel(filterTextTimeout);
            }

            // Fetches the result from the data store
            filterTextTimeout = me.$timeout(function() {
                searchCallback.call(me, searchParam.toUpperCase()).then(function (result){
                        var res = matchingCallback (result);
                        q.callback ({ results : res });
                    }
                );
            }, 600);

        }
    };
}

// Demonstrate how to register services
// In this case it is a simple value service.
module.service('AbstractAutocompleteStorage', ['Storage', '$timeout', AbstractAutocompleteStorage]);

'use strict';

function AjaxStorage($http, $q, $cacheFactory, $log) {

    var httpCache = $cacheFactory('customHttpCache');

    function launchRequest(options) {
        
        if(options.cache) {
            var key = JSON.stringify(options),
                cached = httpCache.get(key);

            if(cached) {
                return cached;
            }
        }

        // Add the request id... Ah, history...
        options.id = Fanny.Utils.generateId ('proxy:request:');
        var requestConfig = {
            url         : '/backoffice/common/xhr',
            method      : 'POST',
            responseType: 'json',
            headers     : {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            data: options
        };

        // We have to use then instead of success/error since they prevent from changing the value in the promise
        // We don't treat the error case since the server always returns a 200 status code
        var promise = $http(requestConfig)
            .then(function(response) {

                // php's xhr is not really consistent, let's be more 
                if (!response.data.success) {
                    $log.warn(response.data.error, response.data.errors);
                    return $q.reject(response.data.result[options.id]);
                }

                return response.data.result[options.id].data;
            });

        if(options.cache) {
            httpCache.put(key, promise);
        }

        return promise;
    }

    return {
        launchRequest: launchRequest
    }

}

angular.module('ev-fdm')
    .service('AjaxStorage', ['$http', '$q', '$cacheFactory', '$log', AjaxStorage]);

angular.module('ev-fdm')
    .factory('RestangularStorage', ['Restangular', function(restangular) {

        function RestangularStorage(resourceName, defaultEmbed) {
            this.restangular = restangular;
            this.resourceName = resourceName;
            this.defaultEmbed = defaultEmbed || [];
        };

        RestangularStorage.buildSortBy = function(sortKey, reverseSort) {
            var sortDir = reverseSort ? 'DESC' : 'ASC';
            return sortKey + ':' + sortDir;
        };

        RestangularStorage.buildEmbed = function(embed) {
            return embed.join(',');
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

        RestangularStorage.prototype.getList = function(page, embed, filters, sortKey, reverseSort) {
            var parameters = {};

            if(angular.isNumber(page) && page > 0) {
                parameters.page = page;
            }

            if(angular.isArray(embed) && embed.length) {
                parameters.embed = RestangularStorage.buildEmbed(embed.concat(this.defaultEmbed));
            }
            else if(this.defaultEmbed.length) {
                parameters.embed = RestangularStorage.buildEmbed(this.defaultEmbed);
            }
            
            if(sortKey) {
                parameters.sortBy = RestangularStorage.buildSortBy(sortKey, reverseSort);
            }

            if(filters) {
                filters = RestangularStorage.buildFilters(filters);
                angular.extend(parameters, filters);
            }

            return this.restangular.all(this.resourceName).getList(parameters);
        };


        RestangularStorage.prototype.getById = function(id, embed) {
            var parameters = {};

            if(angular.isArray(embed) && embed.length) {
                parameters.embed = RestangularStorage.buildEmbed(embed.concat(this.defaultEmbed));
            }
            else if(this.defaultEmbed.length) {
                parameters.embed = RestangularStorage.buildEmbed(this.defaultEmbed);
            }

            return this.restangular.one(this.resourceName, id).get(parameters);
        };

        RestangularStorage.prototype.update = function(element, embed) {
            var parameters = {};

            if(angular.isArray(embed) && embed.length) {
                parameters.embed = RestangularStorage.buildEmbed(embed.concat(this.defaultEmbed));
            }
            else if(this.defaultEmbed.length) {
                parameters.embed = RestangularStorage.buildEmbed(this.defaultEmbed);
            }

            return element.put(parameters);
        };


        return RestangularStorage;
    }]);
'use strict';

var module = angular.module('ev-fdm');

function Storage(AjaxStorage) {

        return {

            get: function(options) {
                return AjaxStorage.launchRequest(options);
            }

        }
}

module.service('Storage', ['AjaxStorage', Storage]);
'use strict';

/* Start angularLocalStorage */

var angularLocalStorage = angular.module('LocalStorageModule', []);

// You should set a prefix to avoid overwriting any local storage variables from the rest of your app
// e.g. angularLocalStorage.constant('prefix', 'youAppName');
angularLocalStorage.value('prefix', 'ls');
// Cookie options (usually in case of fallback)
// expiry = Number of days before cookies expire // 0 = Does not expire
// path = The web path the cookie represents
angularLocalStorage.constant('cookie', { expiry:30, path: '/'});
angularLocalStorage.constant('notify', { setItem: true, removeItem: false} );

angularLocalStorage.service('localStorageService', [
  '$rootScope',
  'prefix',
  'cookie',
  'notify',
  function($rootScope, prefix, cookie, notify) {

  // If there is a prefix set in the config lets use that with an appended period for readability
  //var prefix = angularLocalStorage.constant;
  if (prefix.substr(-1)!=='.') {
    prefix = !!prefix ? prefix + '.' : '';
  }

  // Checks the browser to see if local storage is supported
  var browserSupportsLocalStorage = function () {
    try {
        return ('localStorage' in window && window['localStorage'] !== null);
    } catch (e) {
        $rootScope.$broadcast('LocalStorageModule.notification.error',e.message);
        return false;
    }
  };

  // Directly adds a value to local storage
  // If local storage is not available in the browser use cookies
  // Example use: localStorageService.add('library','angular');
  var addToLocalStorage = function (key, value) {

    // If this browser does not support local storage use cookies
    if (!browserSupportsLocalStorage()) {
      $rootScope.$broadcast('LocalStorageModule.notification.warning','LOCAL_STORAGE_NOT_SUPPORTED');
      if (notify.setItem) {
        $rootScope.$broadcast('LocalStorageModule.notification.setitem', {key: key, newvalue: value, storageType: 'cookie'});
      }
      return addToCookies(key, value);
    }

    // Let's convert undefined values to null to get the value consistent
    if (typeof value == "undefined") value = null;

    try {
      if (angular.isObject(value) || angular.isArray(value)) {
          value = angular.toJson(value);
      }
      localStorage.setItem(prefix+key, value);
      if (notify.setItem) {
        $rootScope.$broadcast('LocalStorageModule.notification.setitem', {key: key, newvalue: value, storageType: 'localStorage'});
      }
    } catch (e) {
      $rootScope.$broadcast('LocalStorageModule.notification.error',e.message);
      return addToCookies(key, value);
    }
    return true;
  };

  // Directly get a value from local storage
  // Example use: localStorageService.get('library'); // returns 'angular'
  var getFromLocalStorage = function (key) {
    if (!browserSupportsLocalStorage()) {
      $rootScope.$broadcast('LocalStorageModule.notification.warning','LOCAL_STORAGE_NOT_SUPPORTED');
      return getFromCookies(key);
    }

    var item = localStorage.getItem(prefix+key);
    if (!item) return null;
    if (item.charAt(0) === "{" || item.charAt(0) === "[") {
        return angular.fromJson(item);
    }
    return item;
  };

  // Remove an item from local storage
  // Example use: localStorageService.remove('library'); // removes the key/value pair of library='angular'
  var removeFromLocalStorage = function (key) {
    if (!browserSupportsLocalStorage()) {
      $rootScope.$broadcast('LocalStorageModule.notification.warning','LOCAL_STORAGE_NOT_SUPPORTED');
       if (notify.removeItem) {
        $rootScope.$broadcast('LocalStorageModule.notification.removeitem', {key: key, storageType: 'cookie'});
      }
      return removeFromCookies(key);
    }

    try {
      localStorage.removeItem(prefix+key);
      if (notify.removeItem) {
        $rootScope.$broadcast('LocalStorageModule.notification.removeitem', {key: key, storageType: 'localStorage'});
      }
    } catch (e) {
      $rootScope.$broadcast('LocalStorageModule.notification.error',e.message);
      return removeFromCookies(key);
    }
    return true;
  };

  // Return array of keys for local storage
  // Example use: var keys = localStorageService.keys()
  var getKeysForLocalStorage = function () {

    if (!browserSupportsLocalStorage()) {
      $rootScope.$broadcast('LocalStorageModule.notification.warning','LOCAL_STORAGE_NOT_SUPPORTED');
      return false;
    }

    var prefixLength = prefix.length;
    var keys = [];
    for (var key in localStorage) {
      // Only return keys that are for this app
      if (key.substr(0,prefixLength) === prefix) {
        try {
          keys.push(key.substr(prefixLength))
        } catch (e) {
          $rootScope.$broadcast('LocalStorageModule.notification.error',e.Description);
          return [];
        }
      }
    }
    return keys;
  };

  // Remove all data for this app from local storage
  // Example use: localStorageService.clearAll();
  // Should be used mostly for development purposes
  var clearAllFromLocalStorage = function () {

    if (!browserSupportsLocalStorage()) {
      $rootScope.$broadcast('LocalStorageModule.notification.warning','LOCAL_STORAGE_NOT_SUPPORTED');
      return clearAllFromCookies();
    }

    var prefixLength = prefix.length;

    for (var key in localStorage) {
      // Only remove items that are for this app
      if (key.substr(0,prefixLength) === prefix) {
        try {
          removeFromLocalStorage(key.substr(prefixLength));
        } catch (e) {
          $rootScope.$broadcast('LocalStorageModule.notification.error',e.message);
          return clearAllFromCookies();
        }
      }
    }
    return true;
  };

  // Checks the browser to see if cookies are supported
  var browserSupportsCookies = function() {
    try {
      return navigator.cookieEnabled ||
        ("cookie" in document && (document.cookie.length > 0 ||
        (document.cookie = "test").indexOf.call(document.cookie, "test") > -1));
    } catch (e) {
      $rootScope.$broadcast('LocalStorageModule.notification.error',e.message);
      return false;
    }
  };

  // Directly adds a value to cookies
  // Typically used as a fallback is local storage is not available in the browser
  // Example use: localStorageService.cookie.add('library','angular');
  var addToCookies = function (key, value) {

    if (typeof value == "undefined") return false;

    if (!browserSupportsCookies()) {
      $rootScope.$broadcast('LocalStorageModule.notification.error','COOKIES_NOT_SUPPORTED');
      return false;
    }

    try {
      var expiry = '', expiryDate = new Date();
      if (value === null) {
        cookie.expiry = -1;
        value = '';
      }
      if (cookie.expiry !== 0) {
        expiryDate.setTime(expiryDate.getTime() + (cookie.expiry*24*60*60*1000));
        expiry = "; expires="+expiryDate.toGMTString();
      }
      if (!!key) {
        document.cookie = prefix + key + "=" + encodeURIComponent(value) + expiry + "; path="+cookie.path;
      }
    } catch (e) {
      $rootScope.$broadcast('LocalStorageModule.notification.error',e.message);
      return false;
    }
    return true;
  };

  // Directly get a value from a cookie
  // Example use: localStorageService.cookie.get('library'); // returns 'angular'
  var getFromCookies = function (key) {
    if (!browserSupportsCookies()) {
      $rootScope.$broadcast('LocalStorageModule.notification.error','COOKIES_NOT_SUPPORTED');
      return false;
    }

    var cookies = document.cookie.split(';');
    for(var i=0;i < cookies.length;i++) {
      var thisCookie = cookies[i];
      while (thisCookie.charAt(0)==' ') {
        thisCookie = thisCookie.substring(1,thisCookie.length);
      }
      if (thisCookie.indexOf(prefix+key+'=') === 0) {
        return decodeURIComponent(thisCookie.substring(prefix.length+key.length+1,thisCookie.length));
      }
    }
    return null;
  };

  var removeFromCookies = function (key) {
    addToCookies(key,null);
  };

  var clearAllFromCookies = function () {
    var thisCookie = null, thisKey = null;
    var prefixLength = prefix.length;
    var cookies = document.cookie.split(';');
    for(var i=0;i < cookies.length;i++) {
      thisCookie = cookies[i];
      while (thisCookie.charAt(0)==' ') {
        thisCookie = thisCookie.substring(1,thisCookie.length);
      }
      key = thisCookie.substring(prefixLength,thisCookie.indexOf('='));
      removeFromCookies(key);
    }
  };

  return {
    isSupported: browserSupportsLocalStorage,
    set: addToLocalStorage, 
    add: addToLocalStorage, //DEPRECATED
    get: getFromLocalStorage,
    keys: getKeysForLocalStorage,
    remove: removeFromLocalStorage,
    clearAll: clearAllFromLocalStorage,
    cookie: {
      set: addToCookies,
      add: addToCookies, //DEPRECATED
      get: getFromCookies,
      remove: removeFromCookies,
      clearAll: clearAllFromCookies
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

    // export only these
    this.add = add;
    this.remove = remove;
    this.addError = function(notification) {
        notification.type = TYPES.ERROR;
        add(notification);
    };
    this.addSuccess = function(notification) {
        notification.type = TYPES.SUCCESS;
        add(notification);
    };
    this.type = TYPES;
}]);

var module = angular.module('ev-fdm');

module.factory('panelFactory', function() {
    var Panel = function(extensions) {
        this.blockers = [];
        _(this).extend(extensions);
    }
    Panel.prototype.addBlocker = function(blocker) {
        this.blockers.push(blocker);
    }
    Panel.prototype.removeBlocker = function(blocker) {
        this.blockers = _(this.blockers).without(blocker);
    }
    Panel.prototype.isBlocked = function(silent) {
        return _(this.blockers).some(function(blocker) {
            return blocker(silent);
        });
    }
    return {
        create: function(extensions) {
            return new Panel(extensions);
        }
    }
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
        if (i > -1) this.panels.splice(i, 1);
        return i;
    };
    Region.prototype.at = function(index) {
        return this.panels._wrapped[index];
    };
    Region.prototype.each = function() {
        return this.panels.each.apply(this.panels, arguments);
    };
    Region.prototype.dismissAll = function(reason) {
        this.each(function(instance) {
            instance.dismiss(reason);
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
            }
            ChildClass.prototype = _({}).extend(Region.prototype, methods);
            return new ChildClass(hasPush);
        }
    }
});

module.service('PanelService', [ '$rootScope', '$http', '$templateCache', '$q', '$injector', '$controller', 'middleRegion', 'rightRegion', 'panelFactory', function($rootScope, $http, $templateCache, $q, $injector, $controller, middleRegion, rightRegion, panelFactory) {

    // identifies all panels
    var currentId = 1;

    var regions = {
        middle: middleRegion,
        right: rightRegion
    };

    function parseOptions(regionName, options) {
        if (!options.template && !options.templateUrl && !options.content) {
            throw new Error('Should define options.template or templateUrl or content')
        }
        options.push = options.push || options.pushFrom;
        options.panelClass = options.panelClass || '';
        options.panelClass += ' ' + regionName;
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
        angular.forEach(resolves, function(value, key) {
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

    function getRegion(name) {
        if (_(regions).has(name)) {
            return regions[name];
        } else {
            throw new Error('Unknown region ' + name);
        }
    }

    function dismissChildren(region, instance, reason) {
        var children = region.getChildren(instance);
        for (var i = children.length - 1; i >= 0; i--) {
            var child = children[i];
            var result = child.dismiss(reason);
            if (!result) return false;
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
            result: resultDeferred.promise,
            opened: openedDeferred.promise,
            close: function(result) {
                if (!instance.isBlocked()) {
                    var notCancelled = dismissChildren(region, instance, 'parent closed');
                    if (!notCancelled) return false;
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
                    if (!notCancelled) return false;
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

    return {
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
        open: function(regionName, options) {

            options = parseOptions(regionName, options);
            var region = getRegion(regionName);
            var last = region.last();
            var instance;

            if (options.push && !options.pushFrom) {
                options.pushFrom = last;
            }

            if (options.pushFrom && options.pushFrom != last) {
                options.replace = region.getNext(options.pushFrom);
                if (options.replace) {
                    var result = dismissChildren(region, options.replace, 'parent replaced');
                    // some child might have canceled the close
                    if (!result) {
                        return false;
                    }
                }
            }

            if (!(region.hasPush && options.push) && !region.isEmpty()) {
                options.replace = last;
            }

            if (options.replace && options.replace.isBlocked()) {
                return false;
            }

            instance = createInstance(region, options);

            // attach some variables to the instance
            instance.$$id = currentId++;
            instance.$$region = regionName;
            
            region.push(instance);
            return instance;
        },
        push: function(regionName, options) {
            options.push = true;
            return this.open(regionName, options);
        },
        dismissAll: function(reason) {
            _(regions).each(function(region) {
                region.dismissAll(reason);
            });
        },
        dismissChildren: function(instance, reason) {
            var region = regions[instance.$$region];
            return dismissChildren(region, instance, reason);
        }
    };
}]);
var module = angular.module('ev-fdm');

var SidonieModalService = function($modal, $animate, $log) {

    // main object containing all opened modals
    var regions = {};
    regions[ SidonieModalService.REGION_RIGHT ] = { multi: false, opened: [ ] };
    regions[ SidonieModalService.REGION_MIDDLE ] = { multi: false, opened: [ ] };


    // --------------------------------------------------------
    // 'PUBLIC' FUNCTIONS
    // --------------------------------------------------------

    /**
     * Makes sure that:
     * - the current opened popup in that region is not locked for edition
     * - the current opened popup is not already of that type (in that case, do not open a new popup)
     *
     * @param  region
     * @param  modalType
     * @param  options
     * @return the modal instance if success, false if cancelled by a locked popup
     */
    function open(region, modalType, options) {
        var regionSpecs = getRegionSpecs(region);
        var isMulti = regionSpecs.multi;
        var openedModals = regionSpecs.opened;

        if (!options.windowClass) {
            options.windowClass = ' fade ';
        }
        options.windowClass += ' ' + region;
        if (!options.templateUrl && !options.template) {
            options.templateUrl = modalType + '.phtml';
        }

        options.backdrop = (region == SidonieModalService.REGION_MIDDLE);

        if (isMulti) {
            throw new Error('Multi not implemented yet');
        } else {
            if (openedModals.length) {
                var openedModal = openedModals[openedModals.length - 1];
                // current opened modal cannot be closed / updated
                if (openedModal.status == SidonieModalService.STATUS_LOCKED) {
                    $log.warn('Open modal aborted due to ' + openedModal.sidonieModalType + '\'s locked status');
                    highlightModal(openedModal);
                    return false;
                // current opened modal has to be replaced
                } else if (openedModal.sidonieModalType != modalType) {
                    // close and open a new one
                    openedModal.modal('hide');
                    var modal = $modal.open(options);
                    modal.sidonieModalType = modalType;
                    modal.result.finally(handleModalClosing(region, modal));
                    regionSpecs.opened = [ modal ];
                    return modal;
                // current opened modal can be kept and content updated
                } else {
                    return openedModal;
                }
            } else {
                // simply open a new popup
                var modal = $modal.open(options);
                modal.sidonieModalType = modalType;
                modal.result.finally(handleModalClosing(region, modal));
                regionSpecs.opened = [ modal ];
                return modal;
            }
        }
    }

    /**
     * Closes all currently opened modals, making sure
     * they are ALL not locked
     * @return true if success, locked popup if not
     */
    function closeAll() {
        // check if all popups are ready to be closed
        var cancelled = false;
        angular.forEach(regions, function(regionSpecs, region) {
            angular.forEach(regionSpecs.opened, function(modal) {
                if (cancelled) return;
                if (modal.status == SidonieModalService.STATUS_LOCKED) {
                    highlightModal(modal);
                    $log.warn('Open modal aborted due to ' + modal.sidonieModalType + '\'s locked status');
                    cancelled = modal;
                }
            });
        });
        if (cancelled) return cancelled;
        // actually close all the popups
        angular.forEach(regions, function(regionSpecs, region) {
            angular.forEach(regionSpecs.opened, function(modal) {
                try {
                    modal.close();
                } catch(e) {}
            });
        });
        return true;
    }

    /**
     * Returns the latest modal of that region
     */
    function get(region, modalType) {
        var regionSpecs = getRegionSpecs(region);
        if (regionSpecs.modals.length) {
            var modal = regionSpecs.modals[regionSpecs.modals.length - 1];
            if (!modalType || modal.sidonieModalType == modalType) {
                return modal;
            } else {
                return false;
            }
        }
    }

    // --------------------------------------------------------
    // 'PRIVATE' FUNCTIONS
    // --------------------------------------------------------

    function getRegionSpecs(region) {
        var regionSpecs = regions[region];
        if (typeof(regionSpecs) == 'undefined') {
            throw new Error('Unknown region ' + region);
        }
        return regionSpecs;
    }

    function handleModalClosing(region, modal) {
        return function(result) {
            var regionSpecs = getRegionSpecs(region);
            angular.forEach(regionSpecs.opened, function(_modal) {
                if (modal == _modal) {
                    regionSpecs.opened = _(regionSpecs.opened).without(modal);
                }
            });
        }
    }

    function highlightModal(modal) {
        $animate.addClass(modal, 'modal-locked', function() {
            $animate.removeClass(modal, 'modal-locked');
        });
    }

    return {
        open: open,
        openRight: function(modalType, options) {
            open(SidonieModalService.REGION_RIGHT, modalType, options);
        },
        openMiddle: function(modalType, options) {
            open(SidonieModalService.REGION_MIDDLE, modalType, options);
        },
        get: get,
        closeAll: closeAll
    }
}

SidonieModalService.STATUS_LOCKED = 'locked';
SidonieModalService.REGION_RIGHT = 'right';
SidonieModalService.REGION_MIDDLE = 'middle';


module.service('SidonieModalService', [ '$modal', '$animate', '$log', SidonieModalService ]);
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
var module = angular.module('ev-fdm');

/**
 * Taken from Angular-UI > $modal
 * A helper directive for the $modal service. It creates a backdrop element.
 */
module.directive('middlePanelBackdrop', ['$timeout', 
    function($timeout) {
        return {
            restrict: 'EA',
            replace: true,
            template: '<div class="modal-backdrop fade" ng-class="{in: animate}" ng-style="{\'z-index\': 1040 + index*10}"></div>',
            link: function(scope, element) {
                scope.animate = false;
                //trigger CSS transitions
                $timeout(function() {
                    scope.animate = true;
                });
            }
        };
    }
]);

/**
 * Taken from Angular-UI > $modal
 */
module.directive('middlePanelWindow', ['$timeout', 'middleRegion',
    function($timeout, middleRegion) {
        return {
            restrict: 'EA',
            scope: {
                index: '@'
            },
            replace: true,
            transclude: true,
            templateUrl: 'panels/middle-window.phtml',
            link: function(scope, element, attrs) {
                $timeout(function() {
                    // trigger CSS transitions
                    scope.animate = true;
                    // focus a freshly-opened modal
                    element[0].focus();
                });
                scope.close = function(evt) {
                    if (evt.target === evt.currentTarget) {
                        evt.preventDefault();
                        evt.stopPropagation();
                        middleRegion.dismissAll();
                    }
                };
            }
        };
    }
]);

module.service('middleRegion', ['$compile', '$document', '$rootScope', 'sidonieRegion', function($compile, $document, $rootScope, sidonieRegion) {

    var els = {};
    var body = $document.find('body').eq(0);

    var region = sidonieRegion.create(false, {

        open: function(instance, options) {

            // create backdrop element
            var backdropjqLiteEl, backdropDomEl;
            backdropjqLiteEl = angular.element('<div middle-panel-backdrop></div>');
            backdropDomEl = $compile(backdropjqLiteEl)($rootScope.$new(true));
            body.append(backdropDomEl);
            
            // create window
            var angularDomEl = angular.element('<div middle-panel-window></div>');
            angularDomEl.addClass(options.panelClass);
            angularDomEl.html(options.content);
            // dom el
            var modalDomEl = $compile(angularDomEl)(options.scope);
            body.append(modalDomEl);

            els[instance.$$id] = {
                window: modalDomEl,
                backdrop: backdropDomEl
            }

            return instance;
        },

        replace: function(fromInstance, toInstance, options) {
            throw new Error('Not implemented');
        },

        close: function(instance, result) {
            if (typeof(els[instance.$$id]) != 'undefined') {
                els[instance.$$id].window.remove();
                els[instance.$$id].backdrop.remove();
                delete els[instance.$$id];
            }
        }
    });

    $document.bind('keydown', function(evt) {
        if (evt.which === 27) {
            var instance = region.last();
            if (instance) {
                $rootScope.$apply(function() {
                    instance.dismiss('escape');
                });
            }
        }
    });

    return region;
}]);
var module = angular.module('ev-fdm');

module.directive('rightPanelWindow', [ '$timeout', function($timeout) {
    
    var BREAKS = [ 100, 200, 300, 400, 500, 600, 700 ];

    function getBPMatching(width) {
        var breakp, index;
        for (index = 0; index < BREAKS.length; index++) {
            if (width < BREAKS[index]) {
                breakp = BREAKS[index];
                break;
            }
        }
        if (breakp) return index;
        else return -1;
    }

    function applyBPAttribute(element, breakpIndex) {
        var attributeValue = '';
        if (breakpIndex == -1) {
            attributeValue = 'max';
        } else {
            attributeValue = BREAKS[breakpIndex];
        }
        element.attr('data-breakpoint', attributeValue);
    }

    return {
        restrict: 'A',
        replace: true,
        transclude: true,
        templateUrl: 'panels/right-window.phtml',
        link: function(scope, element, attrs) {
            element.resizable({
                handles: "w",
                resize: function(event, ui) {
                    var bp = getBPMatching(ui.size.width);
                    applyBPAttribute(element, bp);
                }
            });
            scope.$on('animation-complete', function() {
                var bp = getBPMatching(element.outerWidth());
                applyBPAttribute(element, bp);
            });
            $timeout(function() {
                var bp = getBPMatching(element.outerWidth());
                applyBPAttribute(element, bp);
                // focus a freshly-opened modal
                element[0].focus();
            });
        }
    }
}]);

module.service('rightRegion', [ '$rootScope', '$compile', '$animate', '$timeout', 'sidonieRegion', function($rootScope, $compile, $animate, $timeout, sidonieRegion) {

    var STACKED_WIDTH = 15;
    var els = {};

    function getEl(instance) {
        if (els[instance.$$id]) {
            return els[instance.$$id];
        } else {
            return null;
        }
    }

    function getStylesFromCache(instance, options) {
        var savedWidth = stylesCache[instance.$$depth + '-' + options.panelClass];
        if (savedWidth)
            return 'style="width: ' + savedWidth + 'px;"';
        else
            return '';
    }

    function stack(fromInstanceIndex) {
        for (var i = 0; i < region.panels.size(); i++) {
            var shouldStack = (i < fromInstanceIndex);
            var instance = region.at(i);
            var el = getEl(instance);
            if (instance.$$stacked && !shouldStack) {
                delete instance.$$actualWidth;
                $animate.removeClass(el, 'stacked');
            } else if (!instance.$$stacked && shouldStack) {
                instance.$$actualWidth = getEl(instance).outerWidth();
                $animate.addClass(el, 'stacked');
            }
            instance.$$stacked = shouldStack;
        }
    }

    function checkStacking() {
        var maxWidth = $(window).innerWidth() - 100;
        for (var i = 0; i < region.panels.size(); i++) {
            var j = 0;
            var totalWidth = _(region.panels).reduce(function(memo, instance) {
                if (j++ < i)
                    return memo + STACKED_WIDTH;
                else {
                    var el = getEl(instance);
                    if (!el) return memo;
                    if (instance.$$stacked) return memo + instance.$$actualWidth;
                    var width = el.outerWidth();
                    if (width < 50) {
                        // most probably before animation has finished landing
                        // we neeed to anticipate a final w
                        return memo + 300;
                    } else {
                        return memo + width;
                    }
                }
            }, 0);
            if (totalWidth < maxWidth) {
                return stack(i);
            }
        }
        // stack all
        stack(region.panels.size() - 1);
    }

    var checkStackingThrottled = _(checkStacking).debounce(50);

    $(window).on('resize', function() {
        region.updateStacking();
    });

    var stylesCache = window.stylesCache = {};

    var region = sidonieRegion.create(true, {
        updateStacking: function() {
            return $timeout(checkStackingThrottled);
        },
        open: function(instance, options) {
            instance.$$depth = region.panels.size();
            var el = angular.element('<div class="panel-placeholder"></div>');
            var inner = angular.element('<div right-panel-window ' + getStylesFromCache(instance, options) + '></div>');
            inner.html(options.content);
            options.scope.panelClass = options.panelClass;
            inner = $compile(inner)(options.scope);
            el.html(inner);
            els[instance.$$id] = el;
            $animate.enter(el, $('.lisette-module-region.right'), null, function() {
                options.scope.$emit('animation-complete');
                $rootScope.$broadcast('module-layout-changed');
                region.updateStacking();
            });
            el.on('resize', function(event, ui) {
                stylesCache[instance.$$depth + '-' + options.panelClass] = ui.size.width;
                region.updateStacking();
            });
            region.updateStacking();
            return instance;
        },
        replace: function(fromInstance, toInstance, options) {
            if (typeof(els[fromInstance.$$id]) != 'undefined') {
                var el = els[fromInstance.$$id];
                toInstance.$$depth = region.panels.size() - 1;
                var inner = angular.element('<div right-panel-window ' + getStylesFromCache(toInstance, options) + '></div>');
                inner.html(options.content);
                options.scope.panelClass = options.panelClass;
                inner = $compile(inner)(options.scope);
                el.html(inner);
                els[toInstance.$$id] = el;
                delete els[fromInstance.$$id];
                region.updateStacking();
                return toInstance;
            } else {
                return region.open(toInstance, options);
            }
        },
        close: function(instance) {
            if (typeof(els[instance.$$id]) != 'undefined') {
                var el = els[instance.$$id];
                $animate.leave(el, function() {
                    delete els[instance.$$id];
                    region.updateStacking();
                });
                region.updateStacking();
            }
        }
    });

    return region;

}]);
angular.module('ev-leaflet', ['leaflet-directive'])
    .provider('evLeaflet', function() {
        this.$get =function () {
            return {icons: this.icons};
        };

        this.setIcons =function (icons) {
            this.icons = icons;
        };
    })
    .directive('evLeaflet', ['leafletData', 'evLeaflet', function (leafletData, evLeaflet) {
        return {
            template: '<leaflet class="ev-leaflet" defaults="defaults" markers="markers" center="center"></leaflet>',
            restrict: 'AE',
            scope: {
                coordinate: '=',
                editable: '='
            },
            controller:function ($scope) {

                // Icons settings
                var baseIcon = {
                    iconSize:   [40, 40],
                    shadowSize: [1, 1],
                    iconAnchor: [1, 20]
                };

                var icons = evLeaflet.icons;

                if ('default' in icons) {
                    angular.extend(icons.default, baseIcon);
                }
                if ('draggable' in icons) {
                    angular.extend(icons.draggable, baseIcon);
                }


                $scope.defaults = {
                    scrollWheelZoom: false,
                    doubleClickZoom: false
                };

                // Setting a marker in location
                $scope.markers = {
                    marker: {
                        focus: true
                    }
                };
                centerOnMarker();

                // Double binding between coordinate and marker's position
                $scope.$watch('coordinate.latitude', function (lat) {
                    $scope.markers.marker.lat = $scope.coordinate.latitude;
                    centerOnMarker();
                });

                $scope.$watch('coordinate.longitude', function (lng) {
                    $scope.markers.marker.lng = $scope.coordinate.longitude;
                    centerOnMarker();
                });

                $scope.$watch('markers.marker.lat', function (lat) {
                    $scope.coordinate.latitude = lat;
                });

                $scope.$watch('markers.marker.lng', function (lng) {
                    $scope.coordinate.longitude = lng;
                });

                // Setting map center
                function centerOnMarker() {
                    $scope.center = {
                        lat: $scope.markers.marker.lat,
                        lng: $scope.markers.marker.lng,
                        zoom: 8
                    };
                }

                $scope.$watch('editable', function () {
                    var edited = $scope.editable;
                    $scope.markers.marker.icon = edited ? icons.draggable : icons['default'];
                    $scope.markers.marker.draggable = edited;
                });
            }
        };
    }]);

(function () {
    'use strict';
    angular.module('ev-upload', ['ev-fdm']);
}) ();
; (function () {
'use strict';
angular.module('ev-upload')
    .directive('evPictureUpload', ['NotificationsService', '$http', function (NotificationsService, $http) {

/*  ev-picture-upload
    =================
    Hi! I'm a directive used for uploading pictures. I'm based on the `ev-upload` directive. But I can also
    manage flickr uploads !

    You can parameter me with:
    - `url`:  which is the place where I'll upload the pictures
    - `pictureSuccess`:  a function called each time a picture has successfully been uploaded (by flickr
        or manually). The picture is passed as argument.

*/
        return {
            restrict: 'AE',
            scope: {
                pictureSuccess: '&newPicture',
                url: '@'
            },
            template:
            '<ev-upload settings="settings" file-success="pictureSuccess({picture: file})"' +
                'class="ev-picture-upload" upload="newUpload(promise)">' +
                '<div ng-hide="uploading">' +
                    '<h4>{{ "Glissez une photo ici pour l\'ajouter à la liste" | i18n }}</h4>' +
                    '<button type="button" class="btn btn-default ev-upload-clickable">' +
                        '{{ "Importer" | i18n}}</button>' +
                    '<form novalidate name="flickr" ' +
                        'ng-submit="uploadFlickrUrl(flickr)"'+
                        'ng-class="{\'has-error\': flickr.$dirty && flickr.$invalid}">' +
                        '<input type="url" name="fUrl" placeholder="{{\'Lien Flickr\' | i18n}}" ' +
                            'ng-model="$parent.flickrUrl" ng-pattern="flickrUrlPattern" required="" ' +
                            'class="form-control" />' +
                        '<div ng-show="flickr.fUrl.$dirty && flickr.fUrl.$invalid">' +
                            '<p class="control-label" for="fUrl" data-ng-show="flickr.fUrl.$error.pattern">'+
                                '{{ "L\'url doit être une photo flickr" | i18n}}</p>' +
                        '</div>' +
                    '</form>' +
                '</div>' +
                '<div class="ev-picture-uploading" ng-show="uploading">' +
                    '<h4> {{"Upload en cours"| i18n}} </h4>' +
                    '<div class="spinner"></div>' +
                    '<p> {{upload.done}} / {{upload.total}} {{ "photo(s) uploadée(s)" | i18n }} </p>' +
                '</div>' +
                '<div ng-show="uploading" ev-promise-progress="uploadPromise"></div>' +
            '</ev-upload>',

            link: function ($scope) {
                $scope.flickrUrlPattern = /^(https\:\/\/)?www\.flickr\.com\/photos\/.*\/\d+.*$/;
                $scope.settings = {
                    acceptedFiles: 'image/*',
                    url: $scope.url
                };
            },
            controller: function ($scope) {

                $scope.uploading = false;
                $scope.uploadFlickrUrl = function (flickrForm) {
                    /* Trailing the ends in order to have a https://www.flickr.com/photos/{user-id}/{photo-id} url
                        Warning: `.*` is greedy, so an address like:
                            https://www.flickr.com/photos/{user-id}/{photo-id}/blabla/1512
                        will not be parsed nicely
                     */
                    if (!flickrForm.$valid) { return; }
                    var flickrUrl = /(https\:\/\/)?www\.flickr\.com\/photos\/.*\/\d+/ .exec($scope.flickrUrl)[0];
                    var uploadPromise = $http.post($scope.url, {'flickr-url': flickrUrl});
                    uploadPromise
                        .success(function (response) {
                            $scope.pictureSuccess({picture: response});
                        })
                        .success(function () {
                            flickrForm.$setPristine();
                            $scope.flickrUrl = "";
                        });

                    $scope.newUpload(uploadPromise);
                    $scope.upload = {
                        done: 0,
                        total: 1,
                        progress: 0
                    };
                };

                $scope.newUpload = function (upload) {
                    $scope.upload = null;
                    $scope.uploading = true;
                    $scope.uploadPromise = upload;
                    upload
                        .then(
                            function success () {
                                NotificationsService.addSuccess({
                                    text: 'Les images ont été uploadées avec succès'
                                });
                            },
                            function error () {
                                NotificationsService.add({
                                    type: NotificationsService.type.WARNING,
                                    text: 'Erreur lors de l\'upload d\'image'
                                });
                            },
                            function onNotify (progress) {
                                $scope.upload = progress;
                            }
                        )
                        .finally(function () {
                            $scope.uploading = false;
                        });
                };
            }
        };
}]);
}) ();
/* global Dropzone */
; (function (Dropzone) {
    'use strict';
    angular.module('ev-upload')
        .directive('evUpload', ['$log', '$q', function ($log, $q) {

    /*  ev-upload
        =========
        Hi! I'm a directive used for uploading files.

        You can give me two callback: `uploadStart` and `fileSuccess`
        - `fileSuccess` will be called each time a file has successfully been uploaded, with the data returned by the
            server.
        - `upload` will be called when a new multiple upload start (for instance, when the user dropped some files
            on the dropzone). It will be call with an argument: the promise for the status of the whole upload.

        My inner heart is powered by Dropzone. You can pass any settings to it through my `settings` parameter.
        Consequently, you can do whatever you want. Be wise :)

        ** Careful, if you change the settings parameters, all the current upload will be canceled, as a new dropzone
        object will be created. **
    */

        var BASE_CONFIG = {
            clickable: '.ev-upload-clickable',
            previewTemplate: false,
            previewsContainer: false,
            autoQueue: true,
            maxFilesize: 12,
            maxFiles: 40,

            uploadMultiple: false,
            parallelUploads: 3
        };

            return {
                transclude: true,
                restrict: 'EA',
                replace: true,
                scope: {
                    settings: '=',
                    uploadStart: '&upload',
                    fileSuccess: '&'
                },
                template: '<div class="ev-upload"><div class="dz-default dz-message" ng-transclude> </div></div>',
                link: function ($scope, elem, attrs) {

                    var dropzone = null;
                    var progress = null;


                    function getBytes (status) {
                        return dropzone.getAcceptedFiles().reduce(function (bytes, file) {
                            return bytes + file.upload[status];
                        }, 0);
                    }


                    $scope.$watch('settings', function (settings) {
                        if (!settings.url) {
                            $log.warn('No url provided to the upload zone');
                            return;
                        }
                        if (dropzone != null) {
                            dropzone.destroy();
                        }
                        dropzone = new Dropzone(elem[0], angular.extend(BASE_CONFIG, settings));
                        // the promise for the whole upload

                        $scope.currentUpload = null;

                        // At the beginning of a new file upload.
                        dropzone.on('sending', function (file) {
                            if ($scope.currentUpload === null) {
                                $scope.$apply(startNewUpload);
                            }
                        });

                        dropzone.on('success', function (file, response) {
                            progress.done += 1;
                            $scope.$apply(function ($scope) {
                                $scope.fileSuccess({file: response});
                            });
                        });

                    });

                    // Create a new overall upload object
                    function startNewUpload($scope) {
                        progress = {
                            done: 0,
                        };

                        dropzone
                            .off('totaluploadprogress')
                            .off('queuecomplete')
                            .off('maxfilesexceeded');

                        // upload object, encapsulate the state of the current (multi file) upload
                        var upload = {
                            deferred: $q.defer(),
                            hasFileErrored: false,
                        };

                        dropzone.on('uploadprogress', function () {
                            progress.progress = 100 * getBytes('bytesSent') / getBytes('total');
                            progress.total = dropzone.getAcceptedFiles().length;
                            upload.deferred.notify(progress);
                        });
                        dropzone.on('queuecomplete', function () {
                            $scope.$apply(function ($scope) {
                                if (upload.hasFileErrored) {
                                    upload.deferred.reject('filehaserrored');
                                } else {
                                    upload.deferred.resolve();
                                }
                            });
                        });
                        dropzone.on('maxfilesexceeded', function() {
                            upload.deferred.reject('maxfilesexceeded');
                        });

                        $scope.currentUpload = upload.deferred.promise;
                        $scope.uploadStart({promise: upload.deferred.promise});
                        $scope.currentUpload.finally(function () {
                            dropzone.removeAllFiles(true);
                            $scope.currentUpload = null;
                        });

                    }

                    $scope.$on('$destroy', function () {
                        dropzone.destroy();
                    });
                }
            };
        }]);
}(Dropzone));
//# sourceMappingURL=ev-fdm.js.map