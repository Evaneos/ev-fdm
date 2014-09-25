'use strict';

angular.module('ev-fdm').directive('evEditSection', [function () {
    return {
        restrict: 'AE',
        transclude: true,
        scope: {
            options: '='
        },

        template: ''
            + '<div class="edit">'
                + '<div ng-show="!options.edit">'
                    + '<span class="icon icon-edit"></span><button class="btn btn-link" data-ng-click="edit()">Editer</button>'
                + '</div>'
                + '<div ng-show="options.edit">'
                    + '<button class="btn btn-link" ng-click="save()"><span class="icon icon-tick"></span></button>&nbsp;'
                    + '<button class="btn btn-link" ng-click="cancel()"><span class="icon icon-cross"></span></button>'
                + '</div>'
            + '</div>'
            + '<div class="transclude"></div>',

        link: function (scope, element, attrs, tabsCtrl, transcludeFn) {
            var _transcludedScope = {
                edit: false
            };

            function editToggle() {
                _transcludedScope.edit = scope.options.edit = scope.options.edit ? false : true;
            }

            scope.edit = function() {
                if (!scope.options.onEdit || scope.options.onEdit && scope.options.onEdit() !== false) {
                    editToggle();
                }
            };

            scope.save = function() {
                if (!scope.options.onSave || scope.options.onSave && scope.options.onSave() !== false) {
                    editToggle();
                }
            };

            scope.cancel = function() {
                if (!scope.options.onCancel || scope.options.onCancel && scope.options.onCancel() !== false) {
                    editToggle();
                }
            };

            transcludeFn(function(clone, transcludedScope) {

                // default state
                if (scope.options.edit) {
                    transcludedScope.edit = true;
                }

                // transclude values
                _transcludedScope = transcludedScope;

                // append body to template
                element.find('.transclude').append(clone);
            });
        }
    }
}]);