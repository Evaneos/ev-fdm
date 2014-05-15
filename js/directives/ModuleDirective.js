'use strict';

angular.module('common.directives')
    .directive('evModule', [ '$timeout', '$rootScope', function($timeout, $rootScope) {

    var bars = {
        tabs: {
            versions: []
        },
        topbar: {
            versions: [ 'size-mini', 'size-default', 'size-big' ]
        },
        leftbar: {
            versions: []
        },
        bottombar: {
            versions: []
        }
    };

    /**
     * Looks inside the module element for any module bar, and populates
     * required classes for each bar on the module container
     */
    function updateBarClasses($moduleEl) {
        return function() {
            angular.forEach(bars, function(barConfig, barId) {
                var $el = $moduleEl.find('.lisette-module-' + barId);
                var hasClass = 'has-' + barId;
                $moduleEl.removeClass(
                    _(barConfig.versions)
                        .map(function(versionId) {
                            return barId + '-' + versionId
                        })
                        .join(' '));
                if ($el.length) {
                    $moduleEl.addClass(hasClass);
                    angular.forEach(barConfig.versions, function(versionId) {
                        if ($el.hasClass('version-' + versionId)) {
                            $moduleEl.addClass(barId + '-' + versionId);
                        }
                    });
                } else {
                    $moduleEl.removeClass(hasClass);
                }
            });
            $rootScope.$broadcast('module-layout-changed');
        }
    };

    return {
        restrict: 'A',
        link: function($scope, element, attributes) {
            element.addClass('lisette-module');
            $scope.$on('$stateChangeSuccess', function() {
                $timeout(updateBarClasses(element), 0);
            });
            $timeout(updateBarClasses(element), 0);
        }
    };
}
]);