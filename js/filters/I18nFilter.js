'use strict';

/**
 * i18n inside ng templates
 * Usage :
 *     "my very simple string" | i18n
 *     "my %s string having %d variables" | i18n:['pretty', 2]
 */
angular.module('ev-fdm')
    .filter('i18n', function() {
        return function(input, variables) {
            variables = variables || [];
            variables.unshift(input);
            return evaneos.t.apply(evaneos, variables);
        };
    });