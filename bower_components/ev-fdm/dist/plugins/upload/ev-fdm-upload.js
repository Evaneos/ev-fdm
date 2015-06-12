(function () {
    'use strict';
    angular.module('ev-upload', ['ev-fdm']);
}) ();
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
                tooltipText: '@',
                iconName: '@',
                url: '@',
                language: '=',
                maxFiles: '@',
                addPicture: '&',
                onPictureAdded: '&'
            },
            template:
            '<ev-upload settings="settings" file-success="addPicture({picture: file})"' +
                'upload="newUpload(promise)">' +
                '<div ng-hide="uploading">' +
                    '<button type="button" tabIndex="-1" class="btn btn-tertiary btn-env ev-upload-clickable"' +
                            'tooltip="{{tooltipText}}"' +
                            'tooltip-placement="top">' +
                        '<span class="icon {{iconName}}"></span> ' +
                       '{{buttonText}}' +
                    '</button>' +
                '</div>' +
                '<div class="ev-picture-uploading" ng-show="uploading">' +
                    '<div class="ev-picture-upload-label"> {{"Transfert en cours"| i18n}} </div>' +
                    '<p> {{upload.done}} / {{upload.total}} </p>' +
                '</div>' +
                '<div ng-show="uploading" ev-promise-progress="uploadPromise"></div>' +
            '</ev-upload>',

            link: function ($scope, elem, attrs) {
                $scope.uploading = false;

                $scope.settings = {
                    acceptedFiles: 'image/*',
                    url: $scope.url,
                    maxFiles: $scope.maxFiles || 100
                };

                $scope.pictures = $scope.pictures || [];

                $scope.$watch('url', function (url) {
                    $scope.settings.url = url;
                });

                $scope.newUpload = function (upload) {
                    $scope.upload = {
                        done: 0,
                        total: '?'
                    };
                    $scope.uploading = true;
                    $scope.uploadPromise = upload;
                    upload
                        .then(
                            function success () {
                                NotificationsService.addSuccess({
                                    text: 'Les images ont été transférées avec succès'
                                });
                            },
                            function error () {
                                NotificationsService.add({
                                    type: NotificationsService.type.WARNING,
                                    text: 'Certaines images n\'ont pas pu être transférées.'
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

                // This allow us to override the add picture
                if(!attrs.addPicture) {
                    $scope.addPicture = function(picture) {
                        picture = picture.picture;
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
                        $scope.onPictureAdded();
                    };
                }
            }
        };
}]);
}) ();

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

                $scope.pictureUploaded = function(pictureUploaded) {
                    var picture = pictureUploaded.data[0];
                    $scope.addPicture(picture);
                };
            }
        };
}]);
}) ();

/* global Dropzone */
; (function (Dropzone) {
    'use strict';
    angular.module('ev-upload')
        .directive('evUpload', ['$log', '$q', '$timeout', function ($log, $q, $timeout) {

    /*  ev-upload
        =========
        Hi! I'm a directive used for uploading files.

        You can give me three callback: `uploadStart`, `fileSuccess` and `fileAdded`
        - `uploadStart` will be called when a new multiple upload start (for instance, when the user dropped some files
            on the dropzone). It will be call with an argument: the promise for the status of the whole upload.
        - `fileSuccess` will be called each time a file has successfully been uploaded, with the data returned by the
            server.
        - `fileAdded` will be called each time a file is added to the queue. It will be called with 3 arguments :
            - dropzoneFile : the Dropzone file being uploaded
            - promise : the promise associated with the file
            - cancel : a function that can be called to cancel the upload of the file.

        Clickable Element : you can define a clickable element inside the directive with the
                            class '.ev-upload-clickable'

        Dropzone Element : you can define a clickable element inside the directive with the class '.ev-upload-dropzone'
                           If the class is not present, it will use the root element.

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
            maxFiles: 100,

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
                    fileSuccess: '&',
                    fileAdded: '&'
                },
                template: '<div class="ev-upload"><div ng-transclude> </div></div>',
                link: function ($scope, elem, attrs) {

                    $scope.fileSuccess = $scope.fileSuccess || function() {};
                    $scope.fileAdded = $scope.fileAdded || function() {};

                    var dropzone = null;
                    var progress = null;

                    var filesPromises = {};
                    function getBytes (status) {
                        return dropzone.getAcceptedFiles().reduce(function (bytes, file) {
                            return bytes + file.upload[status];
                        }, 0);
                    }

                    function getDropzoneElement() {
                        var dz = elem.find('.ev-upload-dropzone');
                        if (dz.length === 0) {
                            dz = elem;
                        }
                        dz.addClass("dz-default");
                        dz.addClass("dz-message");
                        return dz[0];
                    }

                    function getClickableElement() {
                        return elem.find('.ev-upload-clickable')[0];
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
                        dropzone = new Dropzone(
                            getDropzoneElement(),
                            angular.extend({clickable: getClickableElement()},settings)
                        );
                        // the promise for the whole upload

                        $scope.currentUpload = null;

                        // When a file is added to the queue
                        dropzone.on('addedfile', function (file) {
                            if ($scope.currentUpload === null) {
                                $scope.$apply(startNewUpload);
                            }
                            var deferred = $q.defer();
                            filesPromises[file.name] = deferred;
                            var cancel = function () {
                                dropzone.removeFile(file);
                            };
                            $scope.$apply(function($scope) {
                                $scope.fileAdded({
                                    dropzoneFile: file,
                                    promise: deferred.promise,
                                    cancel: cancel
                                });
                            });
                        });

                        dropzone.on('uploadprogress', function (file, progress) {
                            $scope.$apply(function ($scope) {
                                filesPromises[file.name].notify(progress);
                            });
                        });

                        dropzone.on('success', function (file, response) {
                            $scope.$apply(function ($scope) {
                                filesPromises[file.name].resolve({file: response});
                                $scope.fileSuccess({file: response});
                            });
                        });

                        dropzone.on('error', function (file, response, xhr) {
                            if (!response && xhr.status === 500) {
                                response = settings.dictResponseError || 'Unexpected error during the upload';
                            }
                            if (response === 'Upload canceled.') {
                                response = settings.dictCanceledUpload || 'The upload has been canceled';
                            }
                            $scope.$apply(function ($scope) {
                                filesPromises[file.name].reject(response);
                            });
                        });

                        dropzone.on('canceled', function (file) {
                            var deferred = filesPromises[file.name];
                            $scope.$apply(function ($scope) {
                                deferred.reject(settings.dictCanceledUpload || 'The upload has been canceled');
                            });
                        });

                        dropzone.on('complete', function (file) {
                            if(angular.isDefined(progress)){
                                progress.done += 1;
                            }
                        });

                    }, true);

                    // Create a new overall upload object
                    function startNewUpload($scope) {
                        progress = {
                            done: 0,
                            progress: 0
                        };

                        var computeOverallProgress = function () {
                            progress.progress = 100 * getBytes('bytesSent') / getBytes('total');
                            progress.total = dropzone.getAcceptedFiles().length;
                            upload.deferred.notify(progress);
                        };

                        // De-register all events
                        dropzone
                            .off('uploadprogress', computeOverallProgress)
                            .off('maxfilesexceeded');

                        // upload object, encapsulate the state of the current (multi file) upload
                        var upload = {
                            deferred: $q.defer(),
                            hasFileErrored: false,
                        };
                        computeOverallProgress();

                        dropzone.once('error', function() {
                            upload.hasFileErrored = true;
                        });


                        dropzone.on('uploadprogress', computeOverallProgress);

                        var isUploadComplete = function () {
                            return !dropzone.files.filter(function (file) {
                                return file.status === Dropzone.QUEUED ||
                                file.status === Dropzone.ADDED ||
                                file.status === Dropzone.UPLOADING;
                            }).length;
                        };

                        var stopIfComplete = function () {
                            $scope.$apply(function ($scope) {
                                $timeout(function () {
                                    if ( !isUploadComplete() ) { return; }
                                    dropzone.off('complete', stopIfComplete);
                                    $timeout(function () {
                                        if (upload.hasFileErrored) {
                                            upload.deferred.reject('filehaserrored');
                                        } else {
                                            upload.deferred.resolve();
                                        }
                                    });
                                });
                            });
                        };

                        dropzone.on('maxfilesexceeded', function() {
                            upload.deferred.reject('maxfilesexceeded');
                        });
                        dropzone.on('complete', stopIfComplete);

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