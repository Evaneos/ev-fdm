'use strict';

angular.module('ev-fdm').directive('evEditSection', ['NotificationsService', function (notificationsService) {
    return {
        restrict: 'AE',
        transclude: true,
        scope: {
            options: '=',
            title: '@',
            successMessage: '@',
            errorMessage: '@'
        },

        template: ''
            + '<form name="editform" novalidate>'
            + '<div class="edit">'
                + '<h4 ng-if="title">{{ title }}</h4>'
                + '<div ng-show="!options.edit">'
                    + '<span class="icon icon-edit"></span><button class="btn btn-link" ng-click="edit()">Editer</button>'
                + '</div>'
                + '<div ng-show="options.edit">'
                    + '<button class="btn btn-link" ng-click="save()" ng-class="{ disabled: editform.$invalid }"><span class="icon icon-tick"></span></button>&nbsp;'
                    + '<button class="btn btn-link" ng-click="cancel()"><span class="icon icon-cross"></span></button>'
                + '</div>'
            + '</div>'
            + '<div class="transclude"></div>'
            + '</form>',

        link: function(scope, element, attrs, controller, transcludeFn) {
            var _transcludedScope = {};
            var options = scope.options;

            function setEditMode(editMode) {
                _transcludedScope.edit = options.edit = editMode;
                _transcludedScope.editform = scope.editform;
                _transcludedScope.showErrorMessage = function(fieldName, errorName) {
                    var field = scope.editform[fieldName];
                    return (scope.triedToSave || field.$dirty) && (!errorName ? field.$invalid : field.$error[errorName]);
                };
            }


            scope.edit = function() {
                if (!options.onEdit || options.onEdit && options.onEdit() !== false) {
                    setEditMode(true);
                }
            };

            scope.save = function() {
                if (!scope.editform.$valid) {
                    scope.triedToSave = true;
                    return;
                }
                var resultSave = !options.onSave || options.onSave && options.onSave();
                if (resultSave && resultSave.then) {
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
