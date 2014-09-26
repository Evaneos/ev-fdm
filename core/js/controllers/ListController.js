angular.module('ev-fdm')
    .factory('ListController', ['$state', '$stateParams', 'Restangular', 'communicationService', function($state, $stateParams, restangular, communicationService) {

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
             * Update the view when filter are changed in the SearchController
             */
            communicationService.on('common::filters.changed', function(event, filters) {
                this.filters = filters;
                this.sortKey = this.defaultSortKey;
                this.update(1, this.filters, this.sortKey, this.reverseSort);
            }.bind(this));

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

            communicationService.on(this.elementName + '::updated', function(event) {
                self.update(self.$scope.currentPage, self.filters, self.sortKey, self.reverseSort);
            });

            communicationService.on(this.elementName + '::created', function(event) {
                self.update(self.$scope.currentPage, self.filters, self.sortKey, self.reverseSort);
            });

            communicationService.on(this.elementName + '::deleted', function(event) {
                self.update(self.$scope.currentPage, self.filters, self.sortKey, self.reverseSort);
            });
        }

        ListController.prototype.update = function(page, filters, sortKey, reverseSort) {
            this.fetch(page, filters, sortKey, reverseSort).then(function(elements) {
                this.elements = elements;
                this.updateScope();
            }.bind(this));
        };

        ListController.prototype.updateScope = function () {
            this.$scope[this.elementName] = this.elements;
            this.$scope.currentPage = this.elements.pagination.current_page;
            this.$scope.pageCount = this.elements.pagination.total_pages;
            this.$scope.sortKey = this.sortKey;
            this.$scope.reverseSort = this.reverseSort;

            if (!this.$scope.selectedElements || !this.elements) {
                this.$scope.selectedElements = [];
            } else {
                var selectedElementsIds = this.elements.map(function(elt) {
                    return restangular.configuration.getIdFromElem(elt);
                });
                this.$scope.selectedElements = this.$scope.selectedElements.filter(function(elt) {
                    return selectedElementsIds.indexOf(restangular.configuration.getIdFromElem(elt)) !== -1;
                });
            }
            this.setActiveElement();
        };

        ListController.prototype.setActiveElement = function() {
            var self = this;
            this.$scope.activeElement = null;

            if(angular.isDefined($state.params.id)) {
                angular.forEach(this.elements, function(element) {
                    var elementId = restangular.configuration.getIdFromElem(element);
                    if (elementId == $state.params.id) {
                        self.$scope.activeElement = element;
                    }
                });
            }
        };

        ListController.prototype.toggleView = function(view, element) {
            if (!element) {
                $state.go(this.goToViewStatePath());
                return;
            }

            var id = restangular.configuration.getIdFromElem(element);

            if (!id || $stateParams.id === id) {
                $state.go(this.goToViewStatePath());
            }
            else {
                $state.go(this.goToViewStatePath(view), { id: id });
            }
        };

        ListController.prototype.goToViewStatePath = function(view) {
            return this.elementName + (view ? '.' + view : '');
        };

        return ListController;
    }]);
