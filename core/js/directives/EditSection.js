'use strict';

angular.module('ev-fdm').directive('evEditSection', ['NotificationsService', function (notificationsService) {
    return {
        restrict: 'AE',
        transclude: true,
        scope: {
            options: '=',
            successMessage: '@',
            errorMessage: '@'
        },

        template: ''
            + '<div class="edit">'
                + '<div ng-show="!options.edit">'
                    + '<span class="icon icon-edit"></span><button class="btn btn-link" ng-click="edit()">Editer</button>'
                + '</div>'
                + '<div ng-show="options.edit">'
                    + '<button class="btn btn-link" ng-click="save()"><span class="icon icon-tick"></span></button>&nbsp;'
                    + '<button class="btn btn-link" ng-click="cancel()"><span class="icon icon-cross"></span></button>'
                + '</div>'
            + '</div>'
            + '<div class="transclude"></div>',

        link: function(scope, element, attrs, controller, transcludeFn) {
            var _transcludedScope = {};
            var options = scope.options;

            function setEditMode(editMode) {
                _transcludedScope.edit = options.edit = editMode;
            }

            scope.edit = function() {
                if (!options.onEdit || options.onEdit && options.onEdit() !== false) {
                    setEditMode(true);
                }
            };

            scope.save = function() {
                var resultSave = !options.onSave || options.onSave && options.onSave();
                if (resultSave.then) {
                    resultSave.then(
                        function success() {
                            notificationsService.addSuccess({text: options.successMessage || scope.successMessage });
                            if (options.success) {
                                options.success();
                            }
                            setEditMode(false);
                        },
                        function error() {
                            notificationsService.addError({text: options.errorMessage || scope.errorMessage });
                        }
                    );
                } else if (resultSave !== false) {
                    setEditMode(false);
                }
            };

            scope.cancel = function() {
                if (!options.onCancel || options.onCancel && options.onCancel() !== false) {
                    setEditMode(false);
                }
            };

            transcludeFn(function(clone, transcludedScope) {
                // default state
                transcludedScope.edit = !!options.edit;

                // transclude values
                _transcludedScope = transcludedScope;

                // append body to template
                element.find('.transclude').append(clone);
            });
        }
    };
}]);
