'use strict';
/*
    Takes a string in the form 'yyyy-mm-dd hh::mn:ss'
*/
angular.module('ev-fdm')
    .filter('cleanupDate', function() {
        return function(input) {
            var res = '';
            if (input) {
                var y = input.slice (0,4);
                var m = input.slice (5,7);
                var day = input.slice (8,10);

                res = day + '/'+ m + '/' + y;
            }

            return res;
        };
    });