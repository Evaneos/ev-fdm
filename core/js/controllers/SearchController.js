angular.module('ev-fdm')
    .factory('SearchController', ['communicationService', function(communicationService) {
        function SearchController($scope) {
            this.$scope = $scope;
            this.$scope.filters = {};

            this.$scope.filtersChanged = function() {
                Array.prototype.unshift.call(arguments, 'common::filters.changed', this.$scope.filters);
                communicationService.emit.apply(this, arguments);
            }.bind(this);
        }

        return SearchController;
    }]);
