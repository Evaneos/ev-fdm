angular.module('ev-fdm')
	.filter('textSelect', [function() {

		return function(input, choices) {

			if(choices[input]) {
        return choices[input];
      }

    	return input;
		};

	}]);