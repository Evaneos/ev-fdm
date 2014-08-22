// @TODO: DELETE //
angular.module('ev-fdm')
    .directive('evFixedHeaders', ['$timeout', function ($timeout) {

    function _sync($table) {
        var $headers = $table.find('thead > tr');
        var $firstTr = $table.find('tbody > tr').first();

        // no header to resize
        if (!$headers.length) { return; }

        // uniform size for every header
        if (!$firstTr.length) {
            $headers.addClass('uniform');
            _uniformSize($headers, $table.outerWidth());
            return;
        } else {
            $headers.removeClass('uniform');
        }

        // compute size from first line sizing
        var currentChildIndex = 0;
        var $ths = $headers.find('th');
        $ths.each(function() {
            var $td = $firstTr.find('td:nth-child(' + (1 + currentChildIndex) + ')');
            if ($td.is(':visible')) {
                $(this).css('width', $td.outerWidth()).show();
                $(this).css('maxWidth', $td.outerWidth()).show();
            } else {
                // $(this).hide();
            }
            currentChildIndex++;
        });
    }

    function _timeoutSync($table) {
        $timeout(function() {
            _sync($table);
        }, 0, false);
    }

    function _uniformSize($headers, width) {
        var $tds = $headers.find('th');
        if (!$tds.length) { return; }
        $tds.each(function() {
            $(this).css('width', (width/$tds.length) + 'px');
        });
    }

    return {

        restrict: 'A',
        replace: false,

        scope: {
            rows: '='
        },

        link: function ($scope, element, attrs) {
            var $table = $(element);
            $table.addClass('fixed-headers');
            $(window).on('resize', function() {
                _sync($table);
            });
            $scope.$on('module-layout-changed', function() {
                _sync($table);
            });
            // watch for raw data changes !
            $scope.$watch('rows', function() {
                _timeoutSync($table);
            }, true);
            // wait for end of digest then sync headers
            _timeoutSync($table);
        }
    };

}]);