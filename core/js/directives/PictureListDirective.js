(function () {
    'use strict';
    angular.module('ev-fdm')
        .directive('evPictureList', function () {
          return {
            restrict: 'EA',
            scope: {
              pictures: '=',
              editable: '=',
              onDelete: '&',
              onChange: '&',
              showUpdate: '=',
              language: '=',
              colNumber: '=',
              onPictureDeleted: '&'
            },
            template:
                '<ul class="picture-list row">' +
                    '<li ng-repeat="picture in pictures track by picture.id" class="col-xs-{{colNumberBootstrap}} ev-animate-picture-list">' +
                        '<figure>' +
                            '<div class="picture-thumb">' +
                                '<img ng-src="{{picture.id | imageUrl:300:200 | escapeQuotes }}" />' +
                                '<button class="action btn btn-tertiary update-action ev-upload-clickable"' +
                                    'ng-click="onUpdate({picture: picture, index: $index})" ' +
                                    'data-ng-show="editable && showUpdate">' +
                                    '<span class="icon icon-edit"></span>' +
                                '</button>' +
                                '<button class="action btn btn-tertiary delete-action" ' +
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
          $scope.pictures = $scope.pictures || [];

          // Number of columns for pictures
          var colNumber = $scope.colNumber || 2;
          // Convert it to bootstrap convention (12)
          $scope.colNumberBootstrap = 12 / colNumber;

          if (!attrs.onDelete) {
            $scope.onDelete = function (params) {
              $scope.pictures.splice(params.index, 1);
              $scope.onPictureDeleted();
            };
            $scope.onUpdate = function (params) {
                // Not implemented yet
                console.log(params);
            };
          }
        }
      };
    });
})();
