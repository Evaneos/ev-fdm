/* jshint sub: true */
angular.module('ev-fdm').factory('Select2Configuration', [
    '$timeout',
    function($timeout) {
        return function(dataProvider, formatter, resultModifier, minimumInputLength, key) {
            var dataProviderFilter;
            if (typeof dataProvider === 'object') {
                formatter = dataProvider.formatter;
                resultModifier = dataProvider.resultModifier;
                minimumInputLength = dataProvider.minimumInputLength;
                key = dataProvider.key;
                dataProviderFilter = dataProvider.dataProviderFilter;
                dataProvider = dataProvider.dataProvider;

                if (typeof dataProviderFilter === 'object') {
                    var filter = dataProviderFilter;
                    dataProviderFilter = function() { return filter; };
                } else if (typeof dataProviderFilter !== 'function') {
                    dataProviderFilter = function() { return {}; };
                }
            }
            var oldQueryTerm = '', filterTextTimeout;

            var config = {
                minimumInputLength: angular.isDefined(minimumInputLength)
                    && angular.isNumber(minimumInputLength) ? minimumInputLength : 3,
                allowClear: true,
                query: function(query) {
                    var timeoutDuration = oldQueryTerm === query.term ? 0 : 600;

                    oldQueryTerm = query.term;

                    if (filterTextTimeout) {
                        $timeout.cancel(filterTextTimeout);
                    }

                    filterTextTimeout = $timeout(function() {
                        dataProvider(query.term, query.page, dataProviderFilter).then(function(resources) {

                            var res = [];
                            if (resultModifier) {
                                angular.forEach(resources, function(resource) {
                                    res.push(resultModifier(resource));
                                });
                            }

                            var result = {
                                results: res.length ? res : resources
                            };

                            if (resources.pagination &&
                                resources.pagination['current_page'] < resources.pagination['total_pages']) {
                                result.more = true;
                            }
                            if (key && query.term.length) {
                                var value = { id: null };
                                value[key] = query.term;
                                if (result.results.length) {
                                    var tmp = result.results.shift();
                                    result.results.unshift(tmp, value);
                                } else {
                                    result.results.unshift(value);
                                }
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
            return config;
        };
    }
]);
