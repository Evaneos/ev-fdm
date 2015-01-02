angular.module('ev-fdm')
    .directive('evStopEvent', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                attr.evStopEvent
                    .split(',')
                    .map(function (eventName) {
                        return eventName.trim();
                    })
                    .forEach(function (eventName) {
                        element.bind(eventName, function (e) {
                            e.stopPropagation();
                        });
                    });
            }
        };
     });