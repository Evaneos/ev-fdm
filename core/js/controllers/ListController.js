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
