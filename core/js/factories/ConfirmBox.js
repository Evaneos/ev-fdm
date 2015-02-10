angular.module('ev-fdm').factory('ConfirmBox', [
    '$modal',
    function($modal) {
        return function(title, message, positive, negative) {
            return $modal.open({
                template:
                    '<div class="modal-header">' +
                        '<button type="button" class="close" ng-click="$dismiss()">&times;</button>' +
                        '<h3 class="modal-title">{{ \'' +  title  + '\'| i18n }}</h3>' +
                    '</div>' +
                    '<div class="modal-body">' +
                        '{{ \'' + message + '\' | i18n }}'+
                    '</div>' +
                    '<div class="modal-footer">' +
                        '<button class="btn" ng-click="$dismiss()">{{ \'' + negative + '\' | i18n }}</button>' +
                        '<button class="btn btn-primary btn-orange" ng-click="$close()">{{ \'' + positive + '\' | i18n }}</button>' +
                    '</div>'
            }).result;
        };
    }
]);
