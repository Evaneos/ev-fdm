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

angular.module('common.factories')
    .factory('FilterService', ['$rootScope', '$timeout', FilterServiceFactory]);
