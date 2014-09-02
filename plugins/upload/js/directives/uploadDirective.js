/* global Dropzone */
; (function (Dropzone) {
    'use strict';
    angular.module('ev-upload')
        .directive('evUpload', ['$log', '$q', function ($log, $q) {

    /*  ev-upload
        =========
        Hi! I'm a directive used for uploading files.

        You can give me three callback: `uploadStart`, `fileSuccess` and `fileAdded`
        - `uploadStart` will be called when a new multiple upload start (for instance, when the user dropped some files
            on the dropzone). It will be call with an argument: the promise for the status of the whole upload.
        - `fileSuccess` will be called each time a file has successfully been uploaded, with the data returned by the
            server.
        - `fileAdded` will be called each time a file is added to the queue. It will be called with 2 arguments :
            - dropzoneFile : the Dropzone file being uploaded
            - promise : the promise associated with the file

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
                                    cancel: cancel});
                            });
                        });

                        dropzone.on('uploadprogress', function (file, progress) {
                            var deferred = filesPromises[file.name];
                            $scope.$apply(function ($scope) {
                                deferred.notify(progress);
                            });
                        });

                        dropzone.on('uploadprogress', function (file, progress) {
                            $scope.$apply(function ($scope) {
                                filesPromises[file.fullPath].notify(progress);
                            });
                        });

                        dropzone.on('success', function (file, response) {
                            var deferred = filesPromises[file.name];
                            $scope.$apply(function ($scope) {
                                deferred.resolve({file: response});
                                $scope.fileSuccess({file: response});
                            });
                        });

                        dropzone.on('error', function (file, response) {
                            $scope.$apply(function ($scope) {
                                filesPromises[file.fullPath].reject(response);
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
                            delete filesPromises[file.name];
                        });

                    }, true);

                    // Create a new overall upload object
                    function startNewUpload($scope) {
                        progress = {
                            done: 0,
                        };

                        // De-register all events
                        dropzone
                            .off('uploadprogress')
                            .off('maxfilesexceeded');

                        // upload object, encapsulate the state of the current (multi file) upload
                        var upload = {
                            deferred: $q.defer(),
                            hasFileErrored: false,
                        };
                        dropzone.once('error', function() {
                            upload.hasFileErrored = true;
                        });

                        dropzone.on('uploadprogress', function () {
                            progress.progress = 100 * getBytes('bytesSent') / getBytes('total');
                            progress.total = dropzone.getAcceptedFiles().length;
                            upload.deferred.notify(progress);
                        });

                        dropzone.once('queuecomplete', function () {
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