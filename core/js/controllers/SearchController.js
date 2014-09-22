angular.module('ev-fdm')
    .factory('SearchController', ['communicationService', function(communicationService) {
        function SearchController($scope) {
            this.$scope = $scope;
            this.$scope.filters = {};

            this.$scope.filtersChanged = function() {
                communicationService.emit('common::filters.changed', this.$scope.filters);
            }.bind(this);
        }

        return SearchController;
    }]);
