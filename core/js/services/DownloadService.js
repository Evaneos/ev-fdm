angular.module('ev-fdm')
.service('DownloadService', ['$document', function($document) {
   var iframe = null;
   return {
       download: function(url) {
           if(!iframe) {
               iframe = $document[0].createElement('iframe');
               iframe.style.display = 'none';
               $document[0].body.appendChild(iframe);
           }
           iframe.src = url;
       }
   }
}]);