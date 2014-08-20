angular.module('ev-fdm')
.directive('download', ['$http', '$location', '$document', 'DownloadService', function($http, $location, $document, downloadService) {
    return {
        link: function(scope, elm, attrs) {
            elm.on('click', function(event) {
                $http.get(attrs.download).success(function(data) {
                	downloadService.download(data.url);
                });
            });
        }
    }
}]);