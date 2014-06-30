'use strict';

/**
 * Meant to be used for stuff like this:
 * {{ message.isFromTraveller | cssify:{1:'message-traveller', 0:'message-agent'} }}
 * We want to display a css class depending on a given value,
 * and we do not want our controller to store a data for that
 * We can use this filter, and feed it with an object with the matching key,value we want
 */
angular.module('ev-fdm')
    .filter('cssify', function() {
        return function(input, possibilities) {
            var res = '';
            if (possibilities)
            {
                for (var prop in possibilities) {
                    if (possibilities.hasOwnProperty(prop)) { 
                        if (input == prop){
                            res = possibilities[prop];
                            break;
                        }
                    }
                }
            }

            return res;
        };
    });