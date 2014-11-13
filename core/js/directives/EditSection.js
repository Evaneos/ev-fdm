'use strict';

angular.module('ev-fdm').directive('evEditSection', ['NotificationsService', function (notificationsService) {
    return {
        restrict: 'AE',
        transclude: true,
        scope: {
            options: '=',
            args: '=?',
            title: '@', // deprecated
            headerTitle: '@'
        },

        template: ''
            + '<form name="editform" novalidate>'
                + '<header>'
                    + '<div class="pull-right" ng-hide="edit">'
                        + '<button class="btn btn-xs btn-link" ng-click="changeToEditMode()"><span class="icon icon-edit"></span>Editer</button>'
                        + ' &nbsp; <button class="btn btn-xs  btn-link" ng-if="delete" ng-click="delete()"><span class="icon icon-bin"></span>Supprimer</button>'
                    + '</div>'
                    + '<div class="pull-right" ng-show="edit">'
                        + '<button class="btn btn-xs btn-link" ng-click="save()" ng-class="{ \'btn-red\': editform.$invalid }"><span class="icon icon-tick"></span>Enregistrer</button>'
                        + ' &nbsp;<button class="btn btn-xs btn-link text-light" ng-click="cancel()"><span class="icon icon-cross"></span>Annuler</button>'
                    + '</div>'
                    + '<h4 ng-if="headerTitle || title">{{ headerTitle || title }}</h4>'
                + '</header>'
                + '<div class="transclude"></div>'
            + '</form>',

        link: function(scope, element, attrs, controller, transcludeFn) {
            var _transcludedScope = {};
            var options = scope.options;
            var triedToSave = false;

            function setEditMode(editMode) {
                _transcludedScope.edit = editMode;
                scope.edit = editMode;
                _transcludedScope.editform = scope.editform;
            }


            scope.changeToEditMode = function() {
                if (!options.onEdit || options.onEdit && options.onEdit.apply(null, scope.args || []) !== false) {
                    setEditMode(true);
                }
            };

            scope.save = function() {
                if (!scope.editform.$valid) {
                    triedToSave = true;
                    console.log(scope.editform.$error);
                    return;
                }
                var resultSave = !options.onSave || options.onSave && options.onSave.apply(null, scope.args || []);
                if (resultSave && resultSave.then) {
                    resultSave.then(
                        function success() {
                            notificationsService.addSuccess({ text: options.successMessage || attrs.successMessage });
                            if (options.success) {
                                options.success();
                            }
                            setEditMode(false);
                        },
                        function error() {
                            notificationsService.addError({ text: options.errorMessage || attrs.errorMessage });
                        }
                    );
                } else if (resultSave !== false) {
                    setEditMode(false);
                }
            };

            scope.cancel = function() {
                if (!options.onCancel || options.onCancel && options.onCancel.apply(null, scope.args || []) !== false) {
                    setEditMode(false);
                }
            };

            scope.delete = options.onDelete && function() {
                var result = options.onDelete && options.onDelete.apply(null, scope.args || []);

                if (result && result.then) {
                    result.then(
                        function success() {
                            notificationsService.addSuccess({ text: attrs.successDeleteMessage });
                            if (options.success) {
                                options.success();
                            }
                            setEditMode(false);
                        },
                        function error() {
                            notificationsService.addError({ text: attrs.errorDeleteMessage });
                        }
                    );
                }
            };

            transcludeFn(function(clone, transcludedScope) {
                // default state
                transcludedScope.edit = scope.edit = !!attrs.edit;

                // usefull methods
                transcludedScope.showErrorMessage = function(fieldName, errorName) {
                    var field = scope.editform[fieldName];
                    return (triedToSave || field.$dirty) && (!errorName ? field.$invalid : field.$error[errorName]);
                };

                // transclude values
                _transcludedScope = transcludedScope;

                // append body to template
                element.find('.transclude').append(clone);
            });
        }
    };
}]);
