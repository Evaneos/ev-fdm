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
            clickable: '.ev-upload-clickable',
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
                        dropzone = new Dropzone(elem[0], angular.extend(BASE_CONFIG, settings));
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