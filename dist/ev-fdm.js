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
    cfpLoadingBarProvider.parentSelector = '#lisette-menu';
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

/**
 * Define a default error state for our app
 */
.config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('ev-error', {
        templateUrl: 'ev-error.phtml'
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
                self.toggleView('view', element);
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
                else {
                  self.setActiveElement();
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
            this.setActiveElement();
        };

        ListController.prototype.setActiveElement = function() {
          var self = this;
          this.$scope.activeElement = null;

          if(angular.isDefined($state.params.id)) {
            angular.forEach(this.elements, function(element) {
              var elementId = restangular.configuration.getIdFromElem(element);
              if(elementId == $state.params.id) {
                self.$scope.activeElement = element;
                }
            });
          }
        };

        ListController.prototype.toggleView = function(view, element) {
            if(!element) {
                $state.go(this.elementName);
                return;
            }

            var id = restangular.configuration.getIdFromElem(element);

            if(!id || $stateParams.id === id) {
                $state.go(this.elementName);
            }
            else {
                $state.go(this.elementName + '.' + view, {id: id});
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
            scope: false,
            controller: ['$scope', '$attrs', '$parse', function($scope, $attrs, $parse) {

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
    .directive('activable', ['$parse', function($parse) {
            return {
                restrict: 'A',
                require: '^activableSet',
                link: function(scope, element, attr, ctrl) {
                    element.addClass('clickable');
                    var elementGetter = $parse(attr.activable),
                        currentElement = elementGetter(scope);


                    scope.$watch(function() { return elementGetter(scope); }, function(newCurrentElement) {
                      currentElement = newCurrentElement;
                    });

                    scope.$watch(function() { return ctrl.activeElement; },
                     function(newActiveElement, oldActiveElement) {
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
            };
        }]);

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
        template:   '<ul class="lisette-module-tabs nav nav-tabs" ng-cloak>' +
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
(function () {
    'use strict';
    angular.module('ev-fdm')
        .directive('evFixedHeader', function () {
            return {
                link: function($scope, $element, $attrs) {
                    $element.addClass('full-height');
                    var header = $element.find('>.ev-header');
                    var body   = $element.find('>.ev-body');
                    body.css({'overflow-y': 'auto'});
                    header.css({'overflow-y': 'auto'});

                    // Compute and return the height available for the element's body
                    var getBodyHeight = function() {
                        var bodyHeight = $element.innerHeight() - header.outerHeight(true);
                        // This allows us to remove the padding/etc.. from the measurement
                        bodyHeight -= body.outerHeight() - body.height();

                        return bodyHeight;
                    };

                    var refreshDimensions = function() {
                        body.hide();
                        body.height(getBodyHeight());
                        body.show();

                        if ($attrs.refreshIdentifier) {
                            $scope.$broadcast('evFullHeightBody::refresh::' + $attrs.refreshIdentifier);
                        }
                    };


                    $scope.$watch(function() {
                        return getBodyHeight();
                    }, refreshDimensions);

                    $(window).bind('resize', refreshDimensions);

                    if ($attrs.refreshOn) {
                        $scope.$on('evFullHeightBody::refresh::' + $attrs.refreshOn, refreshDimensions);
                    }

                }
            };
        });
}) ();

// @TODO: DELETE //
angular.module('ev-fdm')
    .directive('evFixedHeaders', ['$timeout', function ($timeout) {

    function _sync($table) {
        var $headers = $table.find('thead > tr');
        var $firstTr = $table.find('tbody > tr').first();

        // no header to resize
        if (!$headers.length) { return; }

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
                // $(this).hide();
            }
            currentChildIndex++;
        });
    }

    function _timeoutSync($table) {
        $timeout(function() {
            _sync($table);
        }, 0, false);
    }

    function _uniformSize($headers, width) {
        var $tds = $headers.find('th');
        if (!$tds.length) { return; }
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
    };

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
'use strict';

var module = angular.module('ev-fdm');

module.directive('evPanelBreakpoints', [ '$timeout', '$rootScope', 'panelManager', function($timeout, $rootScope, panelManager) {

    var BREAKS = [ 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100 ];

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

    function updateBreakpoints(element) {
        var inner = element.find('.panel-inner');
        var bp = getBPMatching(inner.outerWidth());
        applyBPAttribute(element, bp);
    }

    return {
        restrict: 'A',
        scope: false,
        replace: true,
        transclude: true,
        templateUrl: 'panels/panel-skeleton.phtml',
        link: function(scope, element, attrs) {
            /**
             * Listener to update the breakpoints properties
             */
            element.resizable({
                handles: "w",
                resize: function(event, ui) {
                    updateBreakpoints(element);
                    $rootScope.$broadcast('panel-resized', element);
                }
            });
            $rootScope.$on('module-layout-changed', function() {
                updateBreakpoints(element);
            });
            $timeout(function() {
                updateBreakpoints(element);
                // focus a freshly-opened modal
                element[0].focus();
            });
        }
    };
}]);
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

angular.module('ev-fdm').directive('body', ['$rootScope', 'NotificationsService', '$state', function ($rootScope, notificationsService, $state) {
    return {
        restrict: 'E',
        link: function(scope, element, attrs) {

            $rootScope.$on('$stateChangeStart', function(event, toState) {
                // not a tab changing
                var dotX = $state.current.name.indexOf('.'),
                     stateName = (dotX != -1) ? $state.current.name.substring(0, dotX) : $state.current.name;

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
            });
        }
    };
}]);

angular.module('ev-fdm')
    .provider('evSelectLanguage', function() {
        this.$get =function () {
            return {
                availableLang: this.availableLang || [],
                defaultLang: this.defaultLang
            };
        };

        this.setAvailableLang =function (availableLang) {
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
                        '<button class="btn btn-lg btn-default" ng-repeat="lang in availableLang"'+
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
                        return pane.tabShow == null || !!pane.tabShow;
                    };
                },
                template:
                    '<div class="tabbable" ev-fixed-header refresh-on="tab_container">' +
                        '<ul class="nav nav-tabs ev-header">' +
                            '<li ng-repeat="pane in panes | filter:isShowed" ' +
                                'ng-class="{active:pane.selected}" '+
                                'tooltip="{{pane.tabTitle}}" tooltip-placement="bottom" tooltip-append-to-body="true">'+
                                '<a href="" ng-click="select(pane); pane.tabClick()"> ' +
                                    '<span ng-show="pane.tabIcon" class="{{pane.tabIcon}}"></span> '+
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
                    tabsCtrl.addPane(scope);
                    transcludeFn(function(clone, transcludedScope) {
                        transcludedScope.$selectNext     = tabsCtrl.selectNext;
                        transcludedScope.$selectPrevious = tabsCtrl.selectPrevious;

                        element.find('.transclude').append(clone);
                    });
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

/* jshint sub: true */
angular.module('ev-fdm')
    .factory('Select2Configuration', ['$timeout', function($timeout) {

        return function(dataProvider, formatter, resultModifier, minimumInputLength, key) {
            var oldQueryTerm = '',
                filterTextTimeout;

            var config = {
                minimumInputLength: angular.isDefined(minimumInputLength)
                    && angular.isNumber(minimumInputLength) ? minimumInputLength : 3,
                allowClear: true,
                query: function(query) {
                    var timeoutDuration = (oldQueryTerm === query.term) ? 0 : 600;

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
                                resources.pagination['current_page'] < resources.pagination['total_pages']) {
                                result.more = true;
                            }
                            if (key && query.term.length) {
                                var value = {id: null};
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
                }
            };
            return config;
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

'use strict';

angular.module('ev-fdm')
    .filter('unsafe', ['$sce', function($sce) {
        return function(val) {
            return $sce.trustAsHtml(val);
        };
    }]);
'use strict';

var module = angular.module('ev-fdm');

/**
 * Communication Service
 * Manage the communication for our app
 */
module.service('communicationService', ['$rootScope', function($rootScope) {

    var COMMUNICATION_KEY = 'evfdm-communication';

    /**
     * Emit an event
     */
    var emit = function(eventName, params) {
        $rootScope.$emit(eventName, params);
    };

    /**
     * Listen to an event
     */
    var on = function(eventName, callback) {
        $rootScope.$on(eventName, callback);
    };

    /**
     * Set a key/value
     */
    var set = function(key, value) {
        if($rootScope[COMMUNICATION_KEY] === undefined) {
            $rootScope[COMMUNICATION_KEY] = {};
        }

        $rootScope[COMMUNICATION_KEY][key] = value;
    };

    /**
     * Get a value by key
     */
    var get = function(key) {
        var result = null;
        if($rootScope[COMMUNICATION_KEY] && $rootScope[COMMUNICATION_KEY][key] !== undefined) {
            result = $rootScope[COMMUNICATION_KEY][key];
        }

        return result;
    };

    var communicationService = {
        emit: emit,
        on  : on,
        set : set,
        get : get
    };

    return communicationService;
}]);
angular.module('ev-fdm')
.service('DownloadService', ['$document', function($document) {
   var iframe = null;
   return {
       download: function(url) {
           if(!iframe) {
               iframe = $document[0].createElement('iframe');
               iframe.style.display = 'none';
               $document[0].body.appendChild(iframe);
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
        count: function() {
            return panelManager.size();
        },
        dismissChildrenId: function(i) {
            panelManager.dismissChildrenId(i);
        },
        dismissAll: function(reason) {
            panelManager.dismissAll(reason);
        },
        dismissChildren: function(instance, reason) {
            return panelManager.dismissChildren(instance, reason);
        }
    };

    return panelService;
}]);
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
        }

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

        RestangularStorage.prototype.create = function(element, embed) {
            var parameters = {};

            if(angular.isArray(embed) && embed.length) {
                parameters.embed = RestangularStorage.buildEmbed(embed.concat(this.defaultEmbed));
            }
            else if(this.defaultEmbed.length) {
                parameters.embed = RestangularStorage.buildEmbed(this.defaultEmbed);
            }

            return this.restangular.all(this.resourceName).post(element, parameters);
        };

        RestangularStorage.prototype.delete = function(element) {
            return element.remove();
        };

        RestangularStorage.prototype.save = function(element, embed) {
            var parameters = {};

            if(angular.isArray(embed) && embed.length) {
                parameters.embed = RestangularStorage.buildEmbed(embed.concat(this.defaultEmbed));
            }
            else if(this.defaultEmbed.length) {
                parameters.embed = RestangularStorage.buildEmbed(this.defaultEmbed);
            }

            return element.save(parameters);
        };

        RestangularStorage.prototype.getNew = function() {
            return this.restangular.one(this.resourceName);
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
 * STACKING AND PANELS SIZE MANAGEMENT
 */
module.service('PanelLayoutEngine', ['$animate', function($animate) {

    var STACKED_WIDTH = 35;

    /**************************
     *           #1           *
     *  Extract panels infos  *
     **************************/

    /**
     * Extract all useful panels informations
     * The (min-/max-/stacked-)width and the stacked state
     * @param  {Array} panels the panels
     * @param  {Object}  panelManager (we need a function from it.. TO refactor.)
     * @return {Array}        Array containing the extracted values
     */
    function getDataFromPanels(panels, panelManager) {
        var datas = [];
        var i = 0;
        var panelsLength = panels.size();

        for (; i < panelsLength; i++) {
            var panel = panels._wrapped[i]; // Dealing with a _ object, yeah..
            var panelElement = panelManager.getElement(panel);
            datas.push({
                minWidth: parseInt(panelElement.children().first().css('min-width')) || STACKED_WIDTH,
                maxWidth: parseInt(panelElement.children().first().css('max-width')) || 0,
                stacked:  panel.$$stacked,
                width:    panelElement.width(),
                stackedWidth: STACKED_WIDTH
            });
        }

        return datas;
    }

    /**************************
     *           #2           *
     *      Compute datas     *
     **************************/

    /**
     * Count the minimal number of panels that need to be stacked
     */
    function countMinStacked(datas, limit) {
        var minStacked = 0;
        var i = 0;
        var j = 0;
        var datasLength = datas.length;
        var totalMinWidth = 0;
        var data = null;

        for (; i < datasLength; i++) {
            totalMinWidth = 0;

            for(j = 0; j < datasLength; j++) {
                data = datas[j];

                if (j < i) {
                    totalMinWidth += data.stackedWidth;
                    continue;
                }

                var _width = data.minWidth;
                if(_width < data.stackedWidth) {
                    _width = data.stackedWidth;
                }

                totalMinWidth += _width;
            }

            if (totalMinWidth > limit) {
                minStacked++;
            }
        }

        return minStacked;
    }

    /**
     * Count the maximal number of panels that can be stacked
     */
    function countMaxStacked(datas, limit) {
        var maxStacked = datas.length;
        var datasLength = datas.length;
        var i = datasLength;
        var j = 0;
        var totalMaxWidth = 0;
        var data = null;

        for (; i > 0; i--) {
            totalMaxWidth = 0;

            for(j = 0; j < datasLength; j++) {
                data = datas[j];

                if (j < i) {
                    totalMaxWidth += data.stackedWidth;
                    continue;
                }

                var _width = data.maxWidth;
                if(_width < data.stackedWidth) {
                    _width = data.stackedWidth;
                }

                totalMaxWidth += _width;
            }

            if (totalMaxWidth < limit) {
                maxStacked--;
            }
        }

        return maxStacked;
    }

    /**
     * For each panels, test if he needs to be stacked
     */
    function updateStackState(datas,limit) {

        var minStacked = countMinStacked(datas, limit);
        var maxStacked = countMaxStacked(datas, limit);

        _(datas).each(function(element) {
            element.stacked = false;
        });

        var nbStacked = minStacked;

        /**
         * Specific rule where, for more readability, we stack a panel.
         */
        if(((datas.length - minStacked) > 3) && (datas.length - maxStacked <= 3)) {
            nbStacked = datas.length - 3;
        }

        var i = 0;
        for(; i < nbStacked; i++) {
            datas[i].stacked = true;
        }

        return {
            nbStacked: nbStacked,
            datas: datas
        };
    }

    /**
     * Update the size of each panels
     */
    function updateSize(datas, limit) {
        var data = null;

        // Ensures the width aren't below the min
        _(datas).each(function(data) {
            if(data.width < data.minWidth) {
                data.width = data.minWidth;
            }
        });

        // Total width of all datas
        var totalWidth = _(datas).reduce(function(memo, data) {
            if(data.stacked) {
                return memo + data.stackedWidth;
            }

            return memo + data.width;
        }, 0);

        // Delta is the gap we have to reach the limit
        var delta = limit - totalWidth;
        var i = 0;
        var datasLength = datas.length;
        for (i = 0; i < datasLength; i++) {
            data = datas[i];

            if(data.stacked) {
                data.width = data.stackedWidth;
                continue;
            }

            // Try to add all the delta at once
            var oldWidth = data.width;
            var newWidth = data.width + delta;

            // Check limit
            if (data.minWidth > newWidth) {
                data.width = data.minWidth;
            }

            // Check limit
            else if (data.maxWidth !== 0 && data.maxWidth < newWidth) {
                data.width = data.maxWidth;
            } else {
                data.width = data.width + delta;
            }

            delta = delta - (data.width - oldWidth);

            // Break if there is no more delta
            if(delta === 0) {
                break;
            }
        }

        // if (delta !== 0) {
        //     return false;
        // }

        return datas;
    }

    /**
     * Calculate datas from the dataPanels received accordingly to a max width
     * @param  {Array}  datas Panels data
     * @param  {Int}    limit limit width]
     * @return {Array}  datas computed
     */
    function calculateStackingFromData(datas, limit) {

        var result = updateStackState(datas, limit);
        datas      = result.datas;

        // If we don't need to stack all the panels (which is a specific case not handled here)
        if(result.nbStacked !== datas.length) {
            datas = updateSize(datas, limit);
        }

        return datas;
    }

    /*****************************
     *           #3              *
     * Apply new datas to panels *
     *****************************/

     /**
     * Apply our results to the panels
     * @param  {Array}   panels      the panels
     * @param  {Array}   dataPanels  the datas we want to apply
     * @param  {Int}     windowWidth the windowWidth
     * @param  {Object}  panelManager (we need a function from it.. TO refactor.)
     */
    function resizeAndStackPanels(panels, dataPanels, windowWidth, panelManager) {
        // If we need to stack all the panels
        // We don't stack the last one, but we hide all the stacked panels
        var isMobile  = false;
        var lastPanel = dataPanels[dataPanels.length - 1];
        if(lastPanel.stacked === true) {
            lastPanel.stacked = false;
            lastPanel.width = windowWidth;
            isMobile = true;
        }

        var i = 0;
        var panelsSize = panels.size();
        var panel, dataPanel, element = null;
        for (; i < panelsSize; i++) {
            panel = panels._wrapped[i]; // Dealing with a _ object, yeah..
            dataPanel = dataPanels[i];
            element = panelManager.getElement(panel);

            if(!element) {
                console.log('no element for this panel)');
                continue;
            }

            if (panel.$$stacked && !dataPanel.stacked) {
                $animate.removeClass(element, 'stacked');
                $animate.removeClass(element, 'stacked-mobile');
            } else if (!panel.$$stacked && dataPanel.stacked) {
                $animate.addClass(element, 'stacked');

                if(isMobile) {
                    $animate.addClass(element, 'stacked-mobile');
                }
            }

            panel.$$stacked = dataPanel.stacked;

            element.children().first().width(dataPanel.width);
        }
    }

    /**************************
     *         MAIN           *
     **************************/

    /**
     * Check the stacking and so on
     * The first args is panelManager because we need panels and a (stupid! to refactor) method from it..
     */
    function checkStacking(panelManager) {

        var panels = panelManager.panels;

        var windowWidth   = $(window).innerWidth();

        // #1 - We extract the data from our panels (width, and so on)
        var rawDataPanels = getDataFromPanels(panels, panelManager);

        // #2 - We compute these new data with our specifics rules (agnostic algorithm)
        var dataPanels    = calculateStackingFromData(rawDataPanels, windowWidth);

        // #3 - We apply these new values to our panels
        resizeAndStackPanels(panels, dataPanels, windowWidth, panelManager);
    }


    /**
     * The panelLayoutEngine
     * @type {Object}
     */
    var panelLayoutEngine = {
        checkStacking: checkStacking
    };

    return panelLayoutEngine;
}]);
var module = angular.module('ev-fdm');

module.factory('PanelManagerFactory', function() {
    function shouldBeOverriden(name) {
        return function() {
            throw new Error('Method ' + name + ' should be overriden');
        };
    }
    var PanelManager = function() {
        this.panels = _([]);
    };
    PanelManager.prototype.open = shouldBeOverriden('open');
    PanelManager.prototype.close = shouldBeOverriden('close');
    PanelManager.prototype.push = function(instance) {
        this.panels.push(instance);
    };
    PanelManager.prototype.remove = function(instance) {
        var i = this.panels.indexOf(instance);
        if (i > -1) {
            this.panels.splice(i, 1);
        }
        return i;
    };
    PanelManager.prototype.at = function(index) {
        return this.panels._wrapped[index];
    };
    PanelManager.prototype.each = function() {
        return this.panels.each.apply(this.panels, arguments);
    };
    PanelManager.prototype.dismissAll = function(reason) {
        // dismiss all panels except the first one
        var i = 0;
        this.each(function(instance) {
            if(i !== 0) {
                instance.dismiss(reason);
            }
            i++;
        });
    };

    PanelManager.prototype.dismissChildrenId = function(rank) {
        var children = this.panels.slice(rank);
        var reason = '';
        for (var i = children.length - 1; i >= 0; i--) {
            var child = children[i];
            var result = child.dismiss(reason);
            if (!result) {
                return false;
            }
        }

        return true;
    };

    PanelManager.prototype.dismissChildren = function(instance, reason) {
        var children = this.getChildren(instance);
        for (var i = children.length - 1; i >= 0; i--) {
            var child = children[i];
            var result = child.dismiss(reason);
            if (!result) {
                return false;
            }
        }

        return true;
    };
    PanelManager.prototype.last = function() {
        return this.panels.last();
    };
    PanelManager.prototype.getNext = function(instance) {
        var i = this.panels.indexOf(instance);
        if (i < this.panels.size() - 1) {
            return this.at(i + 1);
        } else {
            return null;
        }
    };
    PanelManager.prototype.getChildren = function(instance) {
        var i = this.panels.indexOf(instance);
        if (i > -1) {
            return this.panels.slice(i + 1);
        } else {
            return [];
        }
    };
    PanelManager.prototype.size = function() {
        return this.panels.size();
    };
    PanelManager.prototype.isEmpty = function() {
        return this.panels.size() === 0;
    };

    return {
        create: function(methods) {
            var ChildClass = function() {
                return PanelManager.call(this);
            };
            ChildClass.prototype = _({}).extend(PanelManager.prototype, methods);
            return new ChildClass();
        }
    };
});

module.service('panelManager', [ '$rootScope', '$compile', '$animate', '$timeout', 'PanelManagerFactory', 'PanelLayoutEngine', function($rootScope, $compile, $animate, $timeout, PanelManagerFactory, panelLayoutEngine) {

    var elements = {};

    var stylesCache = window.stylesCache = {};
    var container = angular.element('.panels-container');
    var panelZero = container.find('.panel-zero');

    var panelManager = PanelManagerFactory.create({
        updateLayout: function() {
            updateLayout();
        },
        getElement: function(instance) {
            if (elements[instance.$$id]) {
                return elements[instance.$$id];
            } else {
                return null;
            }
        },
        open: function(instance, options) {
            instance.$$stacked = false;
            instance.$$depth = options.depth;
            var isMain = options.depth === 0;
            if(isMain) {
                instance.isMain = true;
            }

            var el = createPlaceholder(instance.$$depth);
            var inner = createPanelView(instance, options);
            el.html(inner);
            elements[instance.$$id] = el;
            $animate.enter(el, container, panelZero, function() {
                panelManager.updateLayout();
            });
            var timerResize = null;
            el.on('resize', function(event, ui) {
                if(timerResize !== null) {
                    $timeout.cancel(timerResize);
                }
                timerResize = $timeout(function() {
                    stylesCache[options.panelName] = ui.size.width;
                    panelManager.updateLayout();
                }, 100);
            });
            return instance;
        },
        replace: function(fromInstance, toInstance, options) {
            if (typeof(elements[fromInstance.$$id]) != 'undefined') {
                var el = elements[fromInstance.$$id];
                toInstance.$$depth = options.depth - 1;
                var inner = createPanelView(toInstance, options);
                el.html(inner);
                elements[toInstance.$$id] = el;
                delete elements[fromInstance.$$id];
                return toInstance;
            } else {
                return panelManager.open(toInstance, options);
            }
        },
        close: function(instance) {
            if (typeof(elements[instance.$$id]) != 'undefined') {
                var el = elements[instance.$$id];
                $animate.leave(el, function() {
                    delete elements[instance.$$id];
                    panelManager.updateLayout();
                });
            }
        }
    });

    /**
     * Return the panels sizes (if the user resized them)
     */
    function getStylesFromCache(instance, options) {
        var savedWidth = stylesCache[options.panelName];
        if (savedWidth) {
            return 'width: ' + savedWidth + 'px;';
        }

        return '';
    }

    /**
     * Create a panel container in the DOM
     */
    function createPlaceholder(depth) {
        var isMain = depth === 0;
        return angular.element('<div ' +
            'class="panel-placeholder ' + (isMain ? 'panel-main' : '') + '" ' +
            'style="z-index:' + (2000 + depth) + ';"></div>');
    }

    /**
     * Create a panel view section
     */
    function createPanelView(instance, options) {
        var inner = angular.element('<div ev-panel-breakpoints style="' + getStylesFromCache(instance, options) + '"></div>');
        inner.html(options.content);
        options.scope.panelClass = options.panelClass;
        return $compile(inner)(options.scope);
    }

    /**
     * Whenever a layout is changed
     */
    function updateLayout() {
        panelLayoutEngine.checkStacking(panelManager);
        $rootScope.$broadcast('module-layout-changed');
    }

    var timerWindowResize = null;
    $(window).on('resize', function() {
        if(timerWindowResize !== null) {
            $timeout.cancel(timerWindowResize);
        }
        timerWindowResize = $timeout(function() {
            panelManager.updateLayout();
        }, 100);
    });

    return panelManager;
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
    .directive('evLeaflet', ['leafletData', 'evLeaflet', '$log', function (leafletData, evLeaflet, $log) {
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
                    if(isNaN(lat)) {
                        lat = 0;
                        $log.warn('ev-leaflet: latitude is not a number');
                    }
                    $scope.markers.marker.lat = lat;
                    centerOnMarker();
                });

                $scope.$watch('coordinate.longitude', function (lng) {
                    if(isNaN(lng)) {
                        lng = 0;
                        $log.warn('ev-leaflet: longitude is not a number');
                    }
                    $scope.markers.marker.lng = lng;
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

/**
 * Directive to override some settings in tinymce
 * Usage:
 * <ev-tinymce
 *     max-chars="1000"                        -- maxChars this input accept (default: unlimited)
 *     ng-model="message.body"                 -- ng-model
 *     tinymce-options="tinymceOptions"        -- override default options with yours (object expected)
 *  ></ev-tinymce>
 */
angular.module('ev-tinymce', ['ui.tinymce'])
    .directive('evTinymce', [function () {
        return {
            template: '<div class="tiny-mce-wrapper">' +
                            '<textarea ui-tinymce="tinymceFinalOptions" ng-model="ngModel"></textarea>' +
                            '<span class="max-chars-info">&nbsp;</span>' +
                      '</div>',
            restrict: 'AE',
            replace: false,
            scope: {
                ngModel: '=',
                tinymceOptions: '='
            },
            controller: ['$scope', '$attrs', '$element', function($scope, $attrs, $element) {

                var defaultOptions = {
                    menubar: false,
                    statusbar: false,
                    resize: false,
                    toolbar: 'bold italic underline | alignleft aligncenter alignright | bullist',
                    'content_css': '/bower_components/ev-fdm/dist/css/ev-fdm.min.css',
                    skin: false,
                    'verify_html': true,
                    'convert_fonts_to_spans': true,

                    // We choose to have a restrictive approach here.
                    // The aim is to output the cleanest html possible.
                    // See http://www.tinymce.com/wiki.php/Configuration:valid_elements
                    // 'valid_elements':
                    //     'strong,em' +
                    //     'span[!style<text-decoration: underline;],' +
                    //     '@[style<text-align: right;?text-align: left;?text-align: center;],' +
                    //     'p,!div,ul,li'
                };
                $scope.tinymceFinalOptions = angular.extend({}, defaultOptions, $scope.tinymceOptions);

                /**
                 * This part is used for the max-chars attibute.
                 * It allows us to easily limit the number of characters typed in the editor
                 */
                $scope.tinymceFinalOptions.maxChars = $attrs.maxChars || $scope.tinymceFinalOptions.maxChars || null;
                // We set the max char warning when the THRESHOLD is reached
                // Here, it's 85% of max chars
                var THRESHOLD = 85;

                /**
                 * Update the information area about the textEditor state (maxChars, ..)
                 */
                var updateInfo = function(currentChars, maxChars) {
                    var maxCharInfosElm = $element.parent().find('.max-chars-info');
                    maxCharInfosElm.text(currentChars + ' / ' + maxChars);

                    var isThresholdReached = ((currentChars / maxChars) * 100) > THRESHOLD;
                    var isMaxLimitReached  = currentChars >= maxChars;

                    var warningClassName = 'max-chars-warning';
                    var alertClassName   = 'max-chars-reached';
                    if(isThresholdReached) {
                        maxCharInfosElm.addClass(warningClassName);
                    } else {
                        maxCharInfosElm.removeClass(warningClassName);
                    }

                    if(isMaxLimitReached) {
                            maxCharInfosElm.addClass(alertClassName);
                    } else {
                            maxCharInfosElm.removeClass(alertClassName);
                    }
                };

                /**
                 * Setup and listen to the editor events
                 */
                var setup = function(editor) {
                    // If there is no maxChars options defined, we return
                    if($scope.tinymceFinalOptions.maxChars === null) {
                        return;
                    }

                    var currentText       = '';
                    var currentTextLength = '';
                    var oldText           = '';
                    var maxChars          = $scope.tinymceFinalOptions.maxChars;

                    editor.on('init', function(e) {
                       $scope.$watch(function() { return editor.getContent(); }, function(newHtml, oldHtml) {
                            currentText       = angular.element(newHtml).text();
                            currentTextLength = currentText.length;
                            oldText           = angular.element(oldHtml).text();

                            /**
                             * Specific case where the old and new text are both over the limit of max chars.
                             * This case can occur on the first initilization, if data from DB are over the limit.
                             * For now, we substring the content (but that break the html and everything..)
                             */
                            var isLimitAlert = (oldText.length > maxChars) && (currentTextLength > maxChars);
                            if(isLimitAlert) {
                                var shorterText = oldText.substring(0, maxChars);
                                $scope.ngModel = shorterText;
                                currentTextLength = shorterText.length;

                            } else if(currentTextLength > maxChars) {
                                $scope.ngModel    = oldHtml;
                                currentTextLength = angular.element($scope.ngModel).text().length;
                            }

                            updateInfo(currentTextLength, maxChars);
                        });
                    });
                };

                $scope.tinymceFinalOptions.setup = setup;
            }]
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
                    '<div class="ev-picture-upload-label">{{ "Faites glisser vos images ici" | i18n }}</div>' +
                    '<table style="width:100%"><tr><td style="width:114px">'+
                            '<button type="button" class="btn btn-default ev-upload-clickable">' +
                                '{{ "Importer..." | i18n}}' +
                            '</button>' +
                        '</td>'+
                        '<td style="width:30px´; line-height: 36px;">'+
                            '{{ "ou" | i18n }}' +
                        '</td>'+
                        '<td>'+
                            '<form novalidate name="flickr" ' +
                                'ng-class="{\'has-error\': flickr.$dirty && flickr.$invalid}">' +
                                '<input name="fUrl" placeholder="{{\'Lien Flickr\' | i18n}}" ' +
                                    'ng-model="$parent.flickrUrl" ng-pattern="flickrUrlPattern" required="" ' +
                                    'class="form-control" ng-change="uploadFlickrUrl(flickr)"/>' +
                                '<div ng-show="flickr.fUrl.$dirty && flickr.fUrl.$invalid">' +
                                    '<p class="control-label" for="fUrl" data-ng-show="flickr.fUrl.$error.pattern">'+
                                        '{{ "L\'url doit être une photo flickr" | i18n}}</p>' +
                                '</div>' +
                            '</form>' +
                        '</td></tr></table>'+
                '</div>' +
                '<div class="ev-picture-uploading" ng-show="uploading">' +
                    '<div class="ev-picture-upload-label"> {{"Upload en cours"| i18n}} </div>' +
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
                $scope.$watch('url', function (url) {
                    $scope.settings.url = url;
                });
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
                                    text: 'Certaines images n\'ont pas pu être uploadées.'
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

        You can give me three callback: `uploadStart`, `fileSuccess` and `fileAdded`
        - `uploadStart` will be called when a new multiple upload start (for instance, when the user dropped some files
            on the dropzone). It will be call with an argument: the promise for the status of the whole upload.
        - `fileSuccess` will be called each time a file has successfully been uploaded, with the data returned by the
            server.
        - `fileAdded` will be called each time a file is added to the queue. It will be called with 3 arguments :
            - dropzoneFile : the Dropzone file being uploaded
            - promise : the promise associated with the file
            - cancel : a function that can be called to cancel the upload of the file.

        Clickable Element : you can define a clickable element inside the directive with the
                            class '.ev-upload-clickable'

        Dropzone Element : you can define a clickable element inside the directive with the class '.ev-upload-dropzone'
                           If the class is not present, it will use the root element.

        My inner heart is powered by Dropzone. You can pass any settings to it through my `settings` parameter.
        Consequently, you can do whatever you want. Be wise :)

        ** Careful, if you change the settings parameters, all the current upload will be canceled, as a new dropzone
        object will be created. **
    */

        var BASE_CONFIG = {
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
                    fileSuccess: '&',
                    fileAdded: '&'
                },
                template: '<div class="ev-upload"><div ng-transclude> </div></div>',
                link: function ($scope, elem, attrs) {

                    $scope.fileSuccess = $scope.fileSuccess || function() {};
                    $scope.fileAdded = $scope.fileAdded || function() {};

                    var dropzone = null;
                    var progress = null;

                    var filesPromises = {};
                    function getBytes (status) {
                        return dropzone.getAcceptedFiles().reduce(function (bytes, file) {
                            return bytes + file.upload[status];
                        }, 0);
                    }

                    function getDropzoneElement() {
                        var dz = elem.find('.ev-upload-dropzone');
                        if (dz.length === 0) {
                            dz = elem;
                        }
                        dz.addClass("dz-default");
                        dz.addClass("dz-message");
                        return dz[0];
                    }

                    function getClickableElement() {
                        return elem.find('.ev-upload-clickable')[0];
                    }

                    $scope.$watch('settings', function (settings) {
                        if (!settings.url) {
                            $log.warn('No url provided to the upload zone');
                            return;
                        }
                        if (dropzone !== null) {
                            dropzone.destroy();
                        }
                        settings = angular.extend(BASE_CONFIG, settings);
                        dropzone = new Dropzone(
                            getDropzoneElement(),
                            angular.extend({clickable: getClickableElement()},settings)
                        );
                        // the promise for the whole upload

                        $scope.currentUpload = null;

                        // When a file is added to the queue
                        dropzone.on('addedfile', function (file) {
                            if ($scope.currentUpload === null) {
                                $scope.$apply(startNewUpload);
                            }
                            var deferred = $q.defer();
                            filesPromises[file.name] = deferred;
                            var cancel = function () {
                                dropzone.removeFile(file);
                            };
                            $scope.$apply(function($scope) {
                                $scope.fileAdded({
                                    dropzoneFile: file,
                                    promise: deferred.promise,
                                    cancel: cancel
                                });
                            });
                        });

                        dropzone.on('uploadprogress', function (file, progress) {
                            $scope.$apply(function ($scope) {
                                filesPromises[file.name].notify(progress);
                            });
                        });

                        dropzone.on('success', function (file, response) {
                            $scope.$apply(function ($scope) {
                                filesPromises[file.name].resolve({file: response});
                                $scope.fileSuccess({file: response});
                            });
                        });

                        dropzone.on('error', function (file, response) {
                            $scope.$apply(function ($scope) {
                                filesPromises[file.name].reject(response);
                            });
                        });

                        dropzone.on('canceled', function (file) {
                            var deferred = filesPromises[file.name];
                            $scope.$apply(function ($scope) {
                                deferred.reject(settings.dictCanceledUpload || 'The upload has been canceled');
                            });
                        });

                        dropzone.on('complete', function (file) {
                            if(angular.isDefined(progress)){
                                progress.done += 1;
                            }
                        });

                    }, true);

                    // Create a new overall upload object
                    function startNewUpload($scope) {
                        progress = {
                            done: 0,
                        };

                        var computeOverallProgress = function () {
                            progress.progress = 100 * getBytes('bytesSent') / getBytes('total');
                            progress.total = dropzone.getAcceptedFiles().length;
                            upload.deferred.notify(progress);
                        };

                        // De-register all events
                        dropzone
                            .off('uploadprogress', computeOverallProgress)
                            .off('maxfilesexceeded');

                        // upload object, encapsulate the state of the current (multi file) upload
                        var upload = {
                            deferred: $q.defer(),
                            hasFileErrored: false,
                        };
                        computeOverallProgress();

                        dropzone.once('error', function() {
                            upload.hasFileErrored = true;
                        });


                        dropzone.on('uploadprogress', computeOverallProgress);

                        var computeComplete = function () {
                            $scope.$apply(function ($scope) {
                                // If there are still files in the queue
                                if (progress.progress !== 100) {
                                    return;
                                }
                                dropzone.off('complete', computeComplete);
                                if (upload.hasFileErrored) {
                                    upload.deferred.reject('filehaserrored');
                                } else {
                                    upload.deferred.resolve();
                                }
                            });
                        };
                        dropzone.on('complete', computeComplete);
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