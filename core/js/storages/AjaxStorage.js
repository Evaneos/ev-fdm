'use strict';

function AjaxStorage($http, $q, $cacheFactory, $log) {

    var httpCache = $cacheFactory('customHttpCache');

    function launchRequest(options) {
        
        if(options.cache) {
            var key = JSON.stringify(options),
                cached = httpCache.get(key);

            if(cached) {
                return cached;
            }
        }

        // Add the request id... Ah, history...
        options.id = Fanny.Utils.generateId ('proxy:request:');
        var requestConfig = {
            url         : '/backoffice/common/xhr',
            method      : 'POST',
            responseType: 'json',
            headers     : {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            data: options
        };

        // We have to use then instead of success/error since they prevent from changing the value in the promise
        // We don't treat the error case since the server always returns a 200 status code
        var promise = $http(requestConfig)
            .then(function(response) {

                // php's xhr is not really consistent, let's be more 
                if (!response.data.success) {
                    $log.warn(response.data.error, response.data.errors);
                    return $q.reject(response.data.result[options.id]);
                }

                return response.data.result[options.id].data;
            });

        if(options.cache) {
            httpCache.put(key, promise);
        }

        return promise;
    }

    return {
        launchRequest: launchRequest
    }

}

angular.module('ev-fdm')
    .service('AjaxStorage', ['$http', '$q', '$cacheFactory', '$log', AjaxStorage]);
