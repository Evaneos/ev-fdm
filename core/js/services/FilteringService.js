'use strict';

// Map that stores the selected filters across pages
angular.module('ev-fdm').
    service('FilteringService', ['$location', function ($location) {

        var filters = {};

        return {
            setSelectedFilter:function (filterName, value){
                if (value != undefined && value != 'undefined'){
                    filters[filterName] = value;
                    // $location.search(filterName, encodeURIComponent(value));
                }
                else {
                    filters[filterName] = '';
                }

            },

            getSelectedFilter:function (filterName){
                var res = '';

                if (typeof filters[filterName] != 'undefined' && filters[filterName] != 'undefined') {
                    res = filters[filterName];
                }

                return res;
            },

            getAllFilters:function (){
                return filters;
            }
        }
    }]
    );