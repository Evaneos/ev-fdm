(function () {
    'use strict';
    angular.module('ev-fdm')
        .directive('evPromiseProgress', [function () {

    /*  ev-promise-progress
        ===================
        Hi! I'm a directive that link a progress bar to a promise.

        Just give me a promise argument. I'll update automatically each time the `notify` callback is called. Of course
        I assume that a percentage progress is given.

        Beware! Each time the promise changes, and is replaced by a new one, I bind the progress bar to the new promise.
        Without unbinding from the previous one. If it wasn't completed, it can leads to strange behavior (i.e. the
        progress bar taking value from both at the same time, doing back and forth).
    */
            return {
                restrict: 'A',
                replace: true,
                scope: {
                    promise: '=evPromiseProgress',
                },
                template: '<div role="progressbar" class="ev-progress" aria-valuemin="0" aria-valuemax="100"' +
                    'aria-valuenow="0"> <div class="ev-progress-overlay"></div> </div> ',
                link: function ($scope, elem, attrs) {
                    var progressBar = elem.find(angular.element(document.querySelector('.ev-progress-overlay')));
                    progressBar.css({width: '0%'});
                    $scope.$watch('promise', function (newPromise) {
                        if (!newPromise || !newPromise.then) { return; }
                        progressBar.css({width: '0%'});
                        newPromise.then(null, null, function notify (progress) {
                            if (typeof(progress) === 'object') {
                                progress = progress.progress;
                            }
                            progressBar.css({width: progress + '%'});
                        });
                        newPromise.finally(function () {
                            progressBar.css({width: '100%'});
                        });
                    });
                }
            };
        }]);
}());