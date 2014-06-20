angular.module('ev-fdm')
    .factory('Select2Configuration', ['$timeout', function($timeout) {
    
        return function(dataProvider, formatter, resultModifier, minimumInputLength) {
            var oldQueryTerm = '',
                filterTextTimeout;

            return {
                minimumInputLength: angular.isDefined(minimumInputLength) && angular.isNumber(minimumInputLength) ? minimumInputLength : 3,
                allowClear: true,
                query: function(query) {
                    var res = [],
                        timeoutDuration = (oldQueryTerm === query.term) ? 0 : 600;

                        oldQueryTerm = query.term;

                        if (filterTextTimeout) {
                            $timeout.cancel(filterTextTimeout);
                        }

                    filterTextTimeout = $timeout(function() {
                        dataProvider(query.term, query.page).then(function (resources){

                            var res = [];
                            if(resultModifier) {
                                angular.forEach(resources, function(resource ){
                                    res.push(resultModifier(resource));
                                });
                            }

                            var result = {
                                results: res.length ? res : resources
                            };

                            if(resources.pagination.current_page < resources.pagination.total_pages) {
                                result.more = true;
                            }

                            query.callback(result);
                        });

                    }, timeoutDuration);

                },
                formatResult: function(resource, container, query, escapeMarkup) {
                    return formatter(resource);
                },
                formatSelection: function(resource) {
                    return formatter(resource);
                },
                initSelection: function() {
                    return {};
                }
             };
        };
    }]);