'use strict';

var module = angular.module('ev-fdm');

module.service('UtilService', [function() {
    this.generatedIds = {};

    this.generateId = function(prefix) {
        var id = prefix + Math.random() * 10000;

        if(typeof(this.generatedIds[id] !== 'undefined')) {
            this.generatedIds[id] = true;
        } else {
            id = this.generateId(prefix);
        }

        return id;
    };
}]);
