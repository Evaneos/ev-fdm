angular.module('ev-fdm')
    .directive('evFixedHeaders', ['$timeout', function ($timeout) {

    function _sync($table, $scope) {
        var containerH, containerW,
            container    = angular.element('.table-container'),
            subContainer = angular.element('.ev-fixed-header-table-container');

        if (!container.length) {
            console.log("Table should be wrapped inside a div having 'table-container' class to use evFixedHeaders directive");
            return;
        }

        $scope.$watch(function() {
            containerH = container.height();
            containerW = container.width();
            return containerH + "-" + containerW;
        },
        function() {
            subContainer.height(container.height());
            $table.floatThead('reflow');
        });
    }

    function _timeoutSync($table, $scope) {
        $timeout(function() {
            _sync($table, $scope);
        }, 0, false);
    }

    return {
        restrict: 'A',
        replace: false,
        scope: {
            rows: '='
        },
        link: function ($scope, element, attrs) {
            var $table = $(element);

            $table
                .wrap('<div class="ev-fixed-header-table-container"></div>')
                .floatThead({
                    scrollContainer: function($table){
                        return $table.closest('.ev-fixed-header-table-container');
                    }
                });
            angular.element('.table-container').css('overflow', 'hidden');

            $(window).on('resize', function() {
                _sync($table, $scope);
            });
            $scope.$on('module-layout-changed', function() {
                _timeoutSync($table, $scope);
            });
            // watch for raw data changes !
            $scope.$watch('rows', function() {
                _timeoutSync($table, $scope);
            }, true);
            // wait for end of digest then sync headers
            _timeoutSync($table, $scope);
        }
    };

}]);
