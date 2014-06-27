angular.module('ev-fdm')
.directive('download', ['$http', '$location', '$document', function($http, $location, $document) {
    var iframe = null;
    return {
        link: function(scope, elm, attrs) {
            elm.on('click', function(event) {
                $http.get(attrs.download).success(function(data) {
                    if(!iframe) {
                        iframe = $document[0].createElement('iframe');
                        iframe.style.display = 'none';
                        $document[0].body.appendChild(iframe);
                    }
                    iframe.src = data.url;
                });
            });
        }
    }
}]);