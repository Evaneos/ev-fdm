'use strict';

var module = angular.module('ev-fdm');

/**
 * Communication Service
 * Manage the communication for our app
 */
module.service('communicationService', ['$rootScope', function($rootScope) {

    var COMMUNICATION_KEY = 'evfdm-communication';

    /**
     * Emit an event
     */
    var emit = function(eventName, args) {
        $rootScope.$emit.apply($rootScope, arguments);
    };

    /**
     * Listen to an event
     */
    var on = function(eventName, callback) {
        $rootScope.$on(eventName, callback);
    };

    /**
     * Set a key/value
     */
    var set = function(key, value) {
        if($rootScope[COMMUNICATION_KEY] === undefined) {
            $rootScope[COMMUNICATION_KEY] = {};
        }

        $rootScope[COMMUNICATION_KEY][key] = value;
    };

    /**
     * Get a value by key
     */
    var get = function(key) {
        var result = null;
        if($rootScope[COMMUNICATION_KEY] && $rootScope[COMMUNICATION_KEY][key] !== undefined) {
            result = $rootScope[COMMUNICATION_KEY][key];
        }

        return result;
    };

    var communicationService = {
        emit: emit,
        on  : on,
        set : set,
        get : get
    };

    return communicationService;
}]);