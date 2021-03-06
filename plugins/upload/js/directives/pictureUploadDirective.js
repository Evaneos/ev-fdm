/* jshint maxlen: 200 */
; (function () {
'use strict';
angular.module('ev-upload')
    .directive('evPictureUpload', ['NotificationsService', '$http', function (NotificationsService, $http) {

/*  ev-picture-upload
    =================
    Hi! I'm a directive used for uploading pictures. I'm based on the `ev-upload` directive. But I can also
    manage flickr uploads !

    You can parameter me with:
    - `url`:  which is the place where I'll upload the pictures
    - `addPicture`:  a function called each time a picture has successfully been uploaded (by flickr
        or manually). The picture is passed as argument.

*/
        return {
            restrict: 'AE',
            scope: {
                addPicture: '=',
                url: '@',
                language: '='
            },
            template:
            '<ev-upload settings="settings" file-success="pictureUploaded(file)"' +
                'class="ev-picture-upload" upload="newUpload(promise)">' +
                '<div ng-hide="uploading">' +
                    '<div class="ev-picture-upload-label">{{ "Faites glisser vos images ici" | i18n }}</div>' +
                    '<table style="width:100%"><tr><td style="width:114px">'+
                            '<button type="button" tabIndex="-1" class="btn ev-upload-clickable">' +
                                '{{ "Importer..." | i18n}}' +
                            '</button>' +
                        '</td>'+
                        '<td style="width:30px´; line-height: 36px;">'+
                            '{{ "ou" | i18n }}' +
                        '</td>'+
                        '<td>'+
                            '<ng-form novalidate name="flickr" ' +
                                'ng-class="{\'has-error\': flickr.$dirty && flickr.$invalid}">' +
                                '<input name="fUrl" placeholder="{{\'Lien Flickr\' | i18n}}" ' +
                                    'ng-model="$parent.flickrUrl" ng-pattern="flickrUrlPattern" ' +
                                    'class="form-control" ng-change="uploadFlickrUrl(flickr)"/>' +
                                '<div ng-show="flickr.fUrl.$dirty && flickr.fUrl.$invalid">' +
                                    '<p class="control-label" for="fUrl" data-ng-show="flickr.fUrl.$error.pattern">'+
                                        '{{ "L\'url doit être une photo flickr" | i18n}}</p>' +
                                '</div>' +
                            '</ng-form>' +
                        '</td></tr>'+
                        '<tr><td style="width:114px"></td>'+
                            '<td style="width:30px´; line-height: 36px;">'+
                                '{{ "ou" | i18n }}' +
                            '</td>'+
                            '<td>'+
                                '<ng-form novalidate name="shutterstock" ' +
                                    'ng-class="{\'has-error\': shutterstock.$dirty && shutterstock.$invalid}">' +
                                    '<input name="sUrl" placeholder="{{\'Lien Shutterstock\' | i18n}}" ' +
                                        'ng-model="$parent.shutterstockUrl" ng-pattern="shutterstockUrlPattern" ' +
                                        'class="form-control" ng-change="uploadShutterstockUrl(shutterstock)"/>' +
                                        '<div ng-show="shutterstock.sUrl.$dirty && shutterstock.sUrl.$invalid">' +
                                            '<p class="control-label" for="fUrl" data-ng-show="shutterstock.sUrl.$error.pattern">'+
                                            '{{ "L\'url doit être une photo shutterstock" | i18n}}</p>' +
                                        '</div>' +
                                '</ng-form>' +
                            '</td>'+
                        '</tr>'+
                    '</table>'+
                '</div>' +
                '<div class="ev-picture-uploading" ng-show="uploading">' +
                    '<div class="ev-picture-upload-label"> {{"Upload en cours"| i18n}} </div>' +
                    '<div class="spinner"></div>' +
                    '<p> {{upload.done}} / {{upload.total}} {{ "photo(s) uploadée(s)" | i18n }} </p>' +
                '</div>' +
                '<div ng-show="uploading" ev-promise-progress="uploadPromise"></div>' +
            '</ev-upload>',

            link: function ($scope) {
                $scope.flickrUrlPattern = /^(https\:\/\/)?www\.flickr\.com\/photos\/.*\/\d+.*$/;
                $scope.shutterstockUrlPattern = /^(https\:\/\/)?www\.shutterstock\.com\/([a-z]{2})\/image-photo\/(.*)-\d+.*$/;
                $scope.settings = {
                    acceptedFiles: 'image/*',
                    url: $scope.url
                };
            },
            controller: function ($scope) {
                $scope.uploading = false;
                $scope.$watch('url', function (url) {
                    $scope.settings.url = url;
                });
                $scope.uploadFlickrUrl = function (flickrForm) {
                    /* Trailing the ends in order to have a https://www.flickr.com/photos/{user-id}/{photo-id} url
                        Warning: `.*` is greedy, so an address like:
                            https://www.flickr.com/photos/{user-id}/{photo-id}/blabla/1512
                        will not be parsed nicely
                     */
                    if (!flickrForm.$valid || !$scope.flickrUrl) {
                        return;
                    }
                    var flickrUrl = /(https\:\/\/)?www\.flickr\.com\/photos\/.*\/\d+/ .exec($scope.flickrUrl)[0];
                    var uploadPromise = $http.post($scope.url, {'flickr-url': flickrUrl});
                    uploadPromise
                        .success(function (pictureUploaded) {
                            var picture = pictureUploaded.data[0];
                            $scope.addPicture(picture);
                        })
                        .success(function () {
                            flickrForm.$setPristine();
                            $scope.flickrUrl = "";
                        });

                    $scope.newUpload(uploadPromise);
                    $scope.upload = {
                        done: 0,
                        total: 1,
                        progress: 0
                    };
                };

                $scope.uploadShutterstockUrl = function (shutterstockForm) {
                    if (!shutterstockForm.$valid || !$scope.shutterstockUrl) {
                        return;
                    }
                    console.log(shutterstockForm);
                    var shutterstockUrl = shutterstockForm.sUrl.$modelValue;
                    var uploadPromise = $http.post($scope.url, {'shutterstock-url': shutterstockUrl});
                    uploadPromise
                        .success(function (pictureUploaded) {
                            var picture = pictureUploaded.data[0];
                            $scope.addPicture(picture);
                        })
                        .success(function () {
                            shutterstockForm.$setPristine();
                            $scope.shutterstockUrl = "";
                        });

                    $scope.newUpload(uploadPromise);
                    $scope.upload = {
                        done: 0,
                        total: 1,
                        progress: 0
                    };
                };

                $scope.newUpload = function (upload) {
                    $scope.upload = null;
                    $scope.uploading = true;
                    $scope.uploadPromise = upload;
                    upload
                        .then(
                            function success() {
                                NotificationsService.addSuccess({
                                    text: 'Les images ont été uploadées avec succès'
                                });
                            },
                            function error(xhr) {
                                var response = (typeof(xhr.data) == 'object') ? xhr.data : JSON.parse(xhr.response);
                                NotificationsService.add({
                                    type: NotificationsService.type.ERROR,
                                    text: (xhr.status === 400 && response !== null)
                                                ? response.error.message
                                                : 'Certaines images n\'ont pas pu être uploadées.',
                                    delay: 10,
                                });
                            },
                            function onNotify(progress) {
                                $scope.upload = progress;
                            }
                        )
                        .finally(function () {
                            $scope.uploading = false;
                        });
                };

                $scope.pictureUploaded = function(pictureUploaded) {
                    var picture = pictureUploaded.data[0];
                    $scope.addPicture(picture);
                };
            }
        };
}]);
}) ();
