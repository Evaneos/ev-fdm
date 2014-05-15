'use strict';

var module = angular.module('common.services');

module.service('SortService', [function() {
    var currentSortValue = '';
    var isReverse = false;

    var getCurrentSort = function() {
        return currentSortValue;
    }
    
    var sortBy = function(sortValue) {
        if (sortValue == currentSortValue)
            isReverse = !isReverse;
        else {
            currentSortValue = sortValue;
        }
        return this;
    };

    var getSortCSS = function(value) {
        var res = 'sort ';
        if (value == currentSortValue) {
            if (isReverse)
                res += 'sort-up';
            else
                res += 'sort-down';
        }
        else
            res += 'no-sort';
        return res;
    }

    var setReverse = function(reverse) {
        isReverse = reverse;
    };
    var isReverse = function() {
        return isReverse;
    };

    return {
        'sortBy'        : sortBy,
        'getSortCSS'    : getSortCSS,
        'getCurrentSort': getCurrentSort,
        'setReverse'    : setReverse,
        'isReverse'     : isReverse
    }
}]);