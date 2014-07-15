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
    - `pictureSuccess`:  a function called each time a picture has successfully been uploaded (by flickr
        or manually). The picture is passed as argument.

*/
        return {
            restrict: 'AE',
            scope: {
                pictureSuccess: '&newPicture',
                url: '@'
            },
            template:
            '<ev-upload settings="settings" file-success="pictureSuccess({picture: file})"' +
                'class="ev-picture-upload" upload="newUpload(promise)">' +
                '<div ng-hide="uploading">' +
                    '<h4>{{ "Glissez une photo ici pour l\'ajouter à la liste" | i18n }}</h4>' +
                    '<button type="button" class="btn btn-default ev-upload-clickable">' +
                        '{{ "Importer" | i18n}}</button>' +
                    '<form novalidate name="flickr" ' +
                        'ng-submit="flickr.$valid && (uploadFlickrUrl(flickrUrl); flickrUrl=\'\';)" '+
                        'ng-class="{\'has-error\': flickr.$dirty && flickr.$invalid}">' +
                        '<input type="url" name="fUrl" placeholder="{{\'Lien Flickr\' | i18n}}" ' +
                            'ng-model="flickrUrl" ng-pattern="flickrUrlPattern" required="" ' +
                            'class="form-control" />' +
                        '<div ng-show="flickr.fUrl.$dirty && flickr.fUrl.$invalid">' +
                            '<p class="control-label" for="fUrl" data-ng-show="flickr.fUrl.$error.pattern">'+
                                '{{ "L\'url doit être une photo flickr" | i18n}}</p>' +
                        '</div>' +
                    '</form>' +
                '</div>' +
                '<div class="ev-picture-uploading" ng-show="uploading">' +
                    '<h4> {{"Upload en cours"| i18n}} </h4>' +
                    '<div class="spinner"></div>' +
                    '<p> {{upload.done}} / {{upload.total}} {{ "photo(s) uploadée(s)" | i18n }} </p>' +
                '</div>' +
                '<div ng-show="uploading" ev-promise-progress="uploadPromise"></div>' +
            '</ev-upload>',

            link: function ($scope) {
                $scope.flickrUrlPattern = /^(https\:\/\/)?www\.flickr\.com\/photos\/.*\/\d+.*$/;
                $scope.settings = {
                    acceptedFiles: 'image/*',
                    url: $scope.url
                };
            },
            controller: function ($scope) {

                $scope.uploading = false;
                $scope.uploadFlickrUrl = function (flickrUrl) {
                    /* Trailing the ends in order to have a https://www.flickr.com/photos/{user-id}/{photo-id} url
                        Warning: `.*` is greedy, so an address like:
                            https://www.flickr.com/photos/{user-id}/{photo-id}/blabla/1512
                        will not be parsed nicely
                     */
                    flickrUrl = /(https\:\/\/)?www\.flickr\.com\/photos\/.*\/\d+/.exec(flickrUrl)[0];
                    var uploadPromise = $http.post($scope.url, {'flickr-url': flickrUrl});
                    uploadPromise.success(function (response) {
                        $scope.pictureSuccess({picture: response});
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
                            function success () {
                                NotificationsService.addSuccess({
                                    text: 'Les images ont été uploadées avec succès'
                                });
                            },
                            function error () {
                                NotificationsService.add({
                                    type: NotificationsService.type.WARNING,
                                    text: 'Erreur lors de l\'upload d\'image'
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
            }
        };
}]);
}) ();