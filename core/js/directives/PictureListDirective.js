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
              onChange: '&'
            },
            template:
                '<ul class="picture-list">' +
                    '<li ng-repeat="picture in pictures" class="ev-animate-picture-list">' +
                        '<figure>' +
                            '<div class="picture-thumb" ' +
                              'style="background-image: '+
                                  'url(\'{{picture.id | imageUrl:245:150 | escapeQuotes }}\');">' +
                                '<button class="delete-action" ' +
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
                        '</figure>' +
                    '</li>' +
                '</ul><div class="clearfix"></div>',
        link: function ($scope, elem, attrs) {
          if (!attrs.onDelete) {
            $scope.onDelete = function (params) {
              $scope.pictures.splice(params.index, 1);
            };
          }
          $scope.pictures = $scope.pictures || [];
        }
      };
    });
})();
