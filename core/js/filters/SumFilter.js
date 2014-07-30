angular.module('ev-fdm')
     .filter('sum', ['$parse', function($parse) {
            return function(objects, key) {
                var getValue = $parse(key);
                return objects.reduce(function(total, object) {
                    var value = getValue(object);
                    return total +
                        ((angular.isDefined(value) && angular.isNumber(value)) ? parseFloat(value) : 0);
                }, 0);
            };
    }]);