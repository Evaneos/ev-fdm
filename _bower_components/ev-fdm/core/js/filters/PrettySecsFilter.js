angular.module('ev-fdm')
     .filter('prettySecs', [function() {
            return function(timeInSeconds) {
               	var numSec = parseInt(timeInSeconds, 10); // don't forget the second param
			    var hours   = Math.floor(numSec / 3600);
			    var minutes = Math.floor((numSec - (hours * 3600)) / 60);
			    var seconds = numSec - (hours * 3600) - (minutes * 60);

			    if (hours   < 10) {hours   = "0"+hours;}
			    if (minutes < 10) {minutes = "0"+minutes;}
			    if (seconds < 10) {seconds = "0"+seconds;}
			    var time    = hours+':'+minutes+':'+seconds;
			    return time;
            };
    }]);
