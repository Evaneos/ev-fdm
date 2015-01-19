'use strict';

angular.module('ev-fdm').directive('evEditSection', ['NotificationsService', function (notificationsService) {
    return {
        restrict: 'AE',
        transclude: true,
        scope: {
            options: '=',
            args: '=?',
            title: '@', // deprecated
            headerTitle: '@',
            noteditable: '=?'
        },
        templateUrl: 'ev-edit-section.html',

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
                    return;
                }
                var resultSave = !options.onSave || options.onSave && options.onSave.apply(null, scope.args || []);
                if (resultSave && resultSave.then) {
                    scope.inProgress = true;
                    resultSave.then(
                        function success() {
                            notificationsService.addSuccess({ text: options.successMessage || attrs.successMessage });
                            if (options.success) {
                                options.success();
                            }
                            scope.inProgress = false;
                            setEditMode(false);
                        },
                        function error() {
                            scope.inProgress = false;
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
                    scope.inProgress = true;
                    result.then(
                        function success() {
                            notificationsService.addSuccess({ text: attrs.successDeleteMessage });
                            if (options.success) {
                                options.success();
                            }
                            scope.inProgress = false;
                            setEditMode(false);
                        },
                        function error() {
                            scope.inProgress = false;
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
