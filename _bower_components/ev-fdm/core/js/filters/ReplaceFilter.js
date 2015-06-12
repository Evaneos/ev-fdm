angular.module('ev-fdm')
     .filter('replace', [function() {
            return function(string, regex, replace) {
                if (!angular.isDefined(string)) {
                    return '';
                }
                return string.replace(regex, replace || '');
            };
    }]);
