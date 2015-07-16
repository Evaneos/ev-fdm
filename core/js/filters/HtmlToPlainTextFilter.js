angular.module('ev-fdm')
    .filter('htmlToPlainText', function() {
        return function(text) {
            return String(text).replace(/<[^>]+>/gm, '');
        };
    }
);