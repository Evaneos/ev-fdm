'use strict';

/* Services */
var module = angular.module('ev-fdm');

var AbstractAutocompleteStorage = function (AbstractStorage, $timeout) {
    _.extend (this, AbstractStorage);
    this.AbstractStorage = AbstractStorage;
    this.$timeout = $timeout;
};

AbstractAutocompleteStorage.prototype.generateAutocompleteConfig = function (searchCallback, matchingCallback, minLength) {
    var me = this;

    var filterTextTimeout;
    return {
        minimumInputLength: minLength,
        allowClear: true,
        initSelection: function() {
            return '';
        },
        query: function(q) {
            var res = [],
                searchParam = q.term;

            if (filterTextTimeout) {
                me.$timeout.cancel(filterTextTimeout);
            }

            // Fetches the result from the data store
            filterTextTimeout = me.$timeout(function() {
                searchCallback.call(me, searchParam.toUpperCase()).then(function (result){
                        var res = matchingCallback (result);
                        q.callback ({ results : res });
                    }
                );
            }, 600);

        }
    };
};

// Demonstrate how to register services
// In this case it is a simple value service.
module.service('AbstractAutocompleteStorage', ['Storage', '$timeout', AbstractAutocompleteStorage]);
