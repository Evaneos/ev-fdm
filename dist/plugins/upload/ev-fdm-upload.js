(function () {
    'use strict';
    angular.module('ev-upload', ['ev-fdm']);
}) ();
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
                    '<div class="ev-picture-upload-label">{{ "Faites glisser vos images ici" | i18n }}</div>' +
                    '<table style="width:100%"><tr><td style="width:114px">'+
                            '<button type="button" class="btn btn-default ev-upload-clickable">' +
                                '{{ "Importer..." | i18n}}' +
                            '</button>' +
                        '</td>'+
                        '<td style="width:30px´; line-height: 36px;">'+
                            '{{ "ou" | i18n }}' +
                        '</td>'+
                        '<td>'+
                            '<form novalidate name="flickr" ' +
                                'ng-class="{\'has-error\': flickr.$dirty && flickr.$invalid}">' +
                                '<input name="fUrl" placeholder="{{\'Lien Flickr\' | i18n}}" ' +
                                    'ng-model="$parent.flickrUrl" ng-pattern="flickrUrlPattern" required="" ' +
                                    'class="form-control" ng-change="uploadFlickrUrl(flickr)"/>' +
                                '<div ng-show="flickr.fUrl.$dirty && flickr.fUrl.$invalid">' +
                                    '<p class="control-label" for="fUrl" data-ng-show="flickr.fUrl.$error.pattern">'+
                                        '{{ "L\'url doit être une photo flickr" | i18n}}</p>' +
                                '</div>' +
                            '</form>' +
                        '</td></tr></table>'+
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
                $scope.uploadFlickrUrl = function (flickrForm) {
                    /* Trailing the ends in order to have a https://www.flickr.com/photos/{user-id}/{photo-id} url
                        Warning: `.*` is greedy, so an address like:
                            https://www.flickr.com/photos/{user-id}/{photo-id}/blabla/1512
                        will not be parsed nicely
                     */
                    if (!flickrForm.$valid) { return; }
                    var flickrUrl = /(https\:\/\/)?www\.flickr\.com\/photos\/.*\/\d+/ .exec($scope.flickrUrl)[0];
                    var uploadPromise = $http.post($scope.url, {'flickr-url': flickrUrl});
                    uploadPromise
                        .success(function (response) {
                            $scope.pictureSuccess({picture: response});
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

/* global Dropzone */
; (function (Dropzone) {
    'use strict';
    angular.module('ev-upload')
        .directive('evUpload', ['$log', '$q', function ($log, $q) {

    /*  ev-upload
        =========
        Hi! I'm a directive used for uploading files.

        You can give me two callback: `uploadStart` and `fileSuccess`
        - `fileSuccess` will be called each time a file has successfully been uploaded, with the data returned by the
            server.
        - `upload` will be called when a new multiple upload start (for instance, when the user dropped some files
            on the dropzone). It will be call with an argument: the promise for the status of the whole upload.

        My inner heart is powered by Dropzone. You can pass any settings to it through my `settings` parameter.
        Consequently, you can do whatever you want. Be wise :)

        ** Careful, if you change the settings parameters, all the current upload will be canceled, as a new dropzone
        object will be created. **
    */

        var BASE_CONFIG = {
            previewTemplate: false,
            previewsContainer: false,
            autoQueue: true,
            maxFilesize: 12,
            maxFiles: 40,

            uploadMultiple: false,
            parallelUploads: 3
        };

            return {
                transclude: true,
                restrict: 'EA',
                replace: true,
                scope: {
                    settings: '=',
                    uploadStart: '&upload',
                    fileSuccess: '&'
                },
                template: '<div class="ev-upload"><div class="dz-default dz-message" ng-transclude> </div></div>',
                link: function ($scope, elem, attrs) {

                    var dropzone = null;
                    var progress = null;

                    var clickableZone = elem.find('.ev-upload-clickable')[0];

                    function getBytes (status) {
                        return dropzone.getAcceptedFiles().reduce(function (bytes, file) {
                            return bytes + file.upload[status];
                        }, 0);
                    }


                    $scope.$watch('settings', function (settings) {
                        if (!settings.url) {
                            $log.warn('No url provided to the upload zone');
                            return;
                        }
                        if (dropzone !== null) {
                            dropzone.destroy();
                        }
                        settings = angular.extend(BASE_CONFIG, settings);
                        dropzone = new Dropzone(elem[0], angular.extend({clickable: clickableZone}, settings));
                        // the promise for the whole upload

                        $scope.currentUpload = null;

                        // At the beginning of a new file upload.
                        dropzone.on('sending', function (file) {
                            if ($scope.currentUpload === null) {
                                $scope.$apply(startNewUpload);
                            }
                        });

                        dropzone.on('success', function (file, response) {
                            progress.done += 1;
                            $scope.$apply(function ($scope) {
                                $scope.fileSuccess({file: response});
                            });
                        });

                    }, true);

                    // Create a new overall upload object
                    function startNewUpload($scope) {
                        progress = {
                            done: 0,
                        };

                        dropzone
                            .off('totaluploadprogress')
                            .off('queuecomplete')
                            .off('maxfilesexceeded');

                        // upload object, encapsulate the state of the current (multi file) upload
                        var upload = {
                            deferred: $q.defer(),
                            hasFileErrored: false,
                        };
                        dropzone.on('error', function() {
                            upload.hasFileErrored = true;
                        });

                        dropzone.on('uploadprogress', function () {
                            progress.progress = 100 * getBytes('bytesSent') / getBytes('total');
                            progress.total = dropzone.getAcceptedFiles().length;
                            upload.deferred.notify(progress);
                        });
                        dropzone.on('queuecomplete', function () {
                            $scope.$apply(function ($scope) {
                                if (upload.hasFileErrored) {
                                    upload.deferred.reject('filehaserrored');
                                } else {
                                    upload.deferred.resolve();
                                }
                            });
                        });
                        dropzone.on('maxfilesexceeded', function() {
                            upload.deferred.reject('maxfilesexceeded');
                        });

                        $scope.currentUpload = upload.deferred.promise;
                        $scope.uploadStart({promise: upload.deferred.promise});
                        $scope.currentUpload.finally(function () {
                            dropzone.removeAllFiles(true);
                            $scope.currentUpload = null;
                        });

                    }

                    $scope.$on('$destroy', function () {
                        dropzone.destroy();
                    });
                }
            };
        }]);
}(Dropzone));