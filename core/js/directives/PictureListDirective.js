(function () {
    'use strict';
    var module = angular.module('ev-fdm')
        .directive('evPictureList', function () {
          return {
            restrict: 'EA',
            scope: {
              pictures: '=',
              editable: '=',
              onDelete: '&',
              onChange: '&',
              showUpdate: '=',
              language: '='
            },
            template:
                '<ul class="picture-list row">' +
                    '<li ng-repeat="picture in pictures track by picture.id" class="col-xs-4 ev-animate-picture-list">' +
                        '<figure>' +
                            '<div class="picture-thumb">' +
                                '<img src="{{picture.id | imageUrl:245:150 | escapeQuotes }}" />' +
                                '<button class="action update-action ev-upload-clickable"' +
                                    'ng-click="onUpdate({picture: picture, index: $index})" ' +
                                    'data-ng-show="editable && showUpdate">' +
                                    '<span class="icon icon-edit"></span>' +
                                '</button>' +
                                '<button class="action delete-action" ' +
                                  'ng-click="onDelete({picture: picture, index: $index})" ' +
                                  'tabIndex="-1"' +
                                  'data-ng-show="editable">' +
                                    '<span class="icon icon-bin"></span>' +
                                '</button>' +
                            '</div>' +
                            '<figcaption>' +
                                '<span class="copyright">&copy;</span>' +
                                '<span class="author" data-ng-show="!editable">' +
                                     '{{ picture.author }}' +
                                '</span>' +
                                '<span data-ng-show="editable">' +
                                    '<input ' +
                                      'type="text" ' +
                                      'class="form-control author" ' +
                                      'ng-model="picture.author" ' +
                                      'ng-change="onChange({picture: picture})"/>' +
                                '</span>' +
                            '</figcaption>' +
                            '<figcaption ng-if="language">' +
                                '<span class="author" data-ng-show="!editable">' +
                                     '{{ picture.legend[language].name }}' +
                                '</span>' +
                                '<span data-ng-show="editable">' +
                                    '<input ' +
                                        'type="text" ' +
                                        'class="form-control author" ' +
                                        'ng-model="picture.legend[language].name" ' +
                                        'ng-change="onChange({picture: picture})"/>' +
                                '</span>' +
                            '</figcaption>' +
                        '</figure>' +
                    '</li>' +
                '</ul><div class="clearfix"></div>',
        link: function ($scope, elem, attrs) {
          if (!attrs.onDelete) {
            $scope.onDelete = function (params) {
              $scope.pictures.splice(params.index, 1);
            };
            $scope.onUpdate = function (params) {
                // Not implemented yet
                console.log(params);
            };
          }
          $scope.pictures = $scope.pictures || [];
        }
      };
    });
})();
