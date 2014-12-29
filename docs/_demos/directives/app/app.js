(function() {
	'use strict';
	angular.module('directive-demo', ['ev-fdm'])
		.filter('i18n', function () {
			return function (input) {
				return input;
			};
		})
		.config(['evSelectLanguageProvider', function (cfg) {
			cfg.setAvailableLang(['fr', 'en', 'es', 'it']);
		}])
        .controller('EditSectionController', ['$scope', '$q', function($scope, $q) {
            var person = { name: 'Test' };
            $scope.person = angular.copy(person);

            $scope.nameSection = {
                onSave: function() {
                    if (!$scope.person.saveFail) {
                        person = angular.copy($scope.person);
                        return $q.when();
                    } else {
                        return $q.reject();
                    }
                },
                onCancel: function() {
                    $scope.person = angular.copy(person);
                }
            };
        }]);
}) ();
