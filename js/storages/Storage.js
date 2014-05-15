'use strict';

var module = angular.module('common.storages');

function Storage(AjaxStorage) {

        return {

            get: function(options) {
                return AjaxStorage.launchRequest(options);
            }

        }
}

module.service('Storage', ['AjaxStorage', Storage]);