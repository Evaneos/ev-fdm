/**
 * Display a promise state as css classes (promise-resolving, promise-resolved, promise-rejected)
 * + Supports empty lists by displaying a message (promise-empty)
 *
 * Options :
 * - emptyMessage (string) - display a message when promise resolves to empty array
 * - promiseDefaultStyles (boolean, default true) - apply spinning evaneos logo when resolving
 *
 * Examples :
 * <div promise="myPromise"
 *     empty-message="No quote"
 *     promise-default-styles="true">
 *
 */
angular.module('ev-fdm').directive('promise', [
    function () {
        function applyClass(classes, element) {
            element.removeClass('promise-resolved promise-resolving promise-empty promise-rejected');
            element.addClass(classes);
        }

        return {
            restrict: 'A',
            replace: false,

            controller: ['$scope', '$attrs', '$parse', '$element', function($scope, $attrs, $parse, $element) {
                var promiseGetter = $parse($attrs.promise);
                var emptyMessage = $attrs.emptyMessage;
                var promiseDefaultStyles = ($attrs.promiseDefaultStyles !== 'false');
                if (promiseDefaultStyles) {
                    applyClass('promise-default-styles', $element);
                }
                if (emptyMessage) {
                    $element.append('<div class="promise-empty-message">' + emptyMessage + '</div>');
                }
                $scope.$watch(function() {
                    return promiseGetter($scope);
                }, function(promise) {
                    if (promise) {
                        applyClass('promise-resolving', $element);
                        promise.then(function(result) {
                            // make sure we are dealing with arrays
                            // otherwise (not a collection, we can't assume it's empty or non empty)
                            if (emptyMessage && angular.isArray(result) && !result.length) {
                                applyClass('promise-resolved promise-empty', $element);
                            } else {
                                applyClass('promise-resolved', $element);
                            }

                            return result;
                        }, function() {
                            applyClass('promise-rejected', $element);
                        });
                    } else {
                        applyClass('promise-resolved', $element);
                    }
                });
            }]
        };

    }
]);
