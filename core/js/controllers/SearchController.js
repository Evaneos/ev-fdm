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