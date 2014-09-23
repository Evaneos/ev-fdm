; (function () {
'use strict';
angular.module('ev-upload')
    .directive('evPictureButtonUpload', ['NotificationsService', '$http', function (NotificationsService, $http) {

/*  ev-picture-button-upload
    =================
    Hi! I'm a directive used for uploading pictures but I'm just a button.
    If you want a more advanced one, you can use the evPictureUpload

    You can parameter me with:
    - `url`:  which is the place where I'll upload the pictures
    - `pictureSuccess`:  a function called each time a picture has successfully been uploaded (by flickr
        or manually). The picture is passed as argument.

*/
        return {
            restrict: 'AE',
            scope: {
                pictures: '=',
                buttonText: '@',
                iconName: '@',
                url: '@',
                language: '='
            },
            template:
            '<ev-upload settings="settings" file-success="addPicture(file)"' +
                'upload="newUpload(promise)">' +
                '<div ng-hide="uploading">' +
                    '<button type="button" tabIndex="-1" class="btn btn-link ev-upload-clickable">' +
                        '<span class="icon {{iconName}}"></span>' +
                       '{{buttonText}}' +
                    '</button>' +
                '</div>' +
                '<div class="ev-picture-uploading" ng-show="uploading">' +
                    '<div class="ev-picture-upload-label"> {{"Upload en cours"| i18n}} </div>' +
                    '<div class="spinner"></div>' +
                    '<p> {{upload.done}} / {{upload.total}} {{ "photo(s) uploadée(s)" | i18n }} </p>' +
                '</div>' +
                '<div ng-show="uploading" ev-promise-progress="uploadPromise"></div>' +
            '</ev-upload>',

            link: function ($scope) {
                $scope.settings = {
                    acceptedFiles: 'image/*',
                    url: $scope.url
                };
            },
            controller: function ($scope) {
                $scope.$watch('url', function (url) {
                    $scope.settings.url = url;
                });
                $scope.uploading = false;

                $scope.newUpload = function (upload) {
                    $scope.upload = null;
                    $scope.uploading = true;
                    $scope.uploadPromise = upload;
                    upload
                        .then(
                            function success () {
                                NotificationsService.addSuccess({
                                    text: 'Les images ont été uploadées avec succès'
                                });
                            },
                            function error () {
                                NotificationsService.add({
                                    type: NotificationsService.type.WARNING,
                                    text: 'Certaines images n\'ont pas pu être uploadées.'
                                });
                            },
                            function onNotify (progress) {
                                $scope.upload = progress;
                            }
                        )
                        .finally(function () {
                            $scope.uploading = false;
                        });
                };

                $scope.addPicture = function(picture) {
                    console.log(picture);
                    var pictureData = picture.data[0];
                    if($scope.language) {
                        if (Array.isArray(pictureData.legend)) {
                            pictureData.legend = {};
                        }
                        if (!pictureData.legend[$scope.language]) {
                            pictureData.legend[$scope.language] = { name: '' };
                        }
                    }

                    $scope.pictures.unshift(pictureData);
                };
            }
        };
}]);
}) ();
