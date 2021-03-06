angular.module('ev-fdm')
    .directive('evStopEventPropagation', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                attr.evStopEventPropagation
                    .split(',')
                    .forEach(function (eventName) {
                        element.bind(eventName.trim(), function (e) {
                            e.stopPropagation();
                        });
                    });
            }
        };
     });