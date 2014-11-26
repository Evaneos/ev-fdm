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
