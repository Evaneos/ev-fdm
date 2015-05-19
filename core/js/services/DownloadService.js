angular.module('ev-fdm')
.service('DownloadService', ['$window', '$document', function($window, $document) {
    var iframe = null;
    return {
        /**
         * Download a specific url using an iframe
         *
         * @param  {string}  url         the url you want to download
         * @param  {boolean} useFullHost either you want to prepend the full host or not (without trailing slash!)
         */
        download: function(url, useFullHost) {
            if(!iframe) {
                iframe = $document[0].createElement('iframe');
                iframe.style.display = 'none';
                $document[0].body.appendChild(iframe);
            }

            if(useFullHost) {
                var fullHost = $window.location.protocol + '//' + $window.location.host;
                url = fullHost + url;
            }

            iframe.src = url;
        }
    };
}]);
