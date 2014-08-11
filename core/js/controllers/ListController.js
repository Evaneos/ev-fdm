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
                else if(toState.name === self.elementName + '.view') {
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
