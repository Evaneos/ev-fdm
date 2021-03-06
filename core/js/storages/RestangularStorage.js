angular.module('ev-fdm')
    .factory('RestangularStorage', ['$rootScope', '$q', 'Restangular', function($rootScope, $q, restangular) {

        function RestangularStorage(resourceName, defaultEmbed) {
            this.restangular = restangular;
            this.resourceName = resourceName;
            this.defaultEmbed = defaultEmbed || [];

            this.emitEventCallbackCreator = function(eventName, elements) {
                return function(result) {
                    $rootScope.$broadcast(this.resourceName + '::' + eventName, elements);
                    return result;
                }.bind(this);
            }.bind(this);
        }

        RestangularStorage.buildSortBy = function(sortKey, reverseSort) {
            var sortDir = reverseSort ? 'DESC' : 'ASC';
            return sortKey + ':' + sortDir;
        };

        RestangularStorage.buildEmbed = function(embed) {
            return embed.join(',');
        };

        RestangularStorage.buildEmbedParameters = function(resource, embed) {
            var parameters = {};

            if(angular.isArray(embed) && embed.length) {
                parameters.embed = RestangularStorage.buildEmbed(embed.concat(resource.defaultEmbed));
            }
            else if(resource.defaultEmbed.length) {
                parameters.embed = RestangularStorage.buildEmbed(resource.defaultEmbed);
            }

            return parameters;
        };

        RestangularStorage.buildParameters = function(options, defaultEmbed) {
            var parameters = {};

            options = options || {};

            if (angular.isNumber(options.page) && options.page > 0) {
                parameters.page = options.page;
            }

            if (angular.isNumber(options.number) && options.number > 0) {
                parameters.number = options.number;
            }

            if (angular.isArray(options.embed) && options.embed.length) {
                parameters.embed = RestangularStorage.buildEmbed(options.embed.concat(defaultEmbed));
            } else if (defaultEmbed && defaultEmbed.length) {
                parameters.embed = RestangularStorage.buildEmbed(defaultEmbed);
            }

            if (options.sortKey) {
                parameters.sortBy = RestangularStorage.buildSortBy(options.sortKey, options.reverseSort);
            }

            if (options.filters) {
                var filters = RestangularStorage.buildFilters(options.filters);
                angular.extend(parameters, filters);
            }

            return parameters;
        };

        RestangularStorage.buildFilters = function(filters) {
            var res = {};

            angular.forEach(filters, function(filter, filterKey) {

                if(angular.isObject(filter) && angular.isDefined(filter.uuid)) {
                    res[filterKey + '.uuid'] = filter.uuid;
                }
                else if(angular.isObject(filter) && angular.isDefined(filter.id)) {
                    res[filterKey + '.id'] = filter.id;
                }
                else if(angular.isArray(filter) && filter.length > 0) {
                    res[filterKey] = filter.join(',');
                }
                else if(angular.isDate(filter)) {
                    res[filterKey] = filter.toISOString();
                }
                else if(angular.isDefined(filter) && filter !== '' && filter !== null) {
                    res[filterKey] = filter;
                }

            });

            return res;
        };

        RestangularStorage.updateObjectFromResult = function(object, result) {
            (function merge(objectData, resultData, resultEmbeds) {
                if (resultEmbeds) {
                    resultEmbeds.forEach(function(embedName) {
                        if (embedName in resultData) {
                            if (!objectData[embedName] || !objectData[embedName].data) {
                                objectData[embedName] = resultData[embedName];
                            } else if (typeof resultData[embedName].data !== 'object' ||
                                       Array.isArray(resultData[embedName].data)) {
                                objectData[embedName].data = resultData[embedName].data;
                            } else {
                                merge(
                                    objectData[embedName].data,
                                    resultData[embedName].data,
                                    resultData[embedName].embeds
                                );
                            }
                            delete resultData[embedName];
                        }
                    });
                }
                angular.extend(objectData, resultData);
            })(
                object.data && object.embeds ? object.data : object,
                angular.copy(restangular.stripRestangular(result)),
                result.embeds
            );
        };
        RestangularStorage.prototype.updateObjectFromResult = RestangularStorage.updateObjectFromResult;

        RestangularStorage.updateObjectBeforePatch = function(object, changes) {
            (function merge(objectData, objectEmbeds, changesData) {
                if (objectEmbeds) {
                    objectEmbeds.forEach(function(embedName) {
                        if (embedName in changesData) {
                            if (!objectData[embedName] || !objectData[embedName].data) {
                                objectData[embedName] = changesData[embedName];
                            } else if (typeof changesData[embedName].data !== 'object' ||
                                       Array.isArray(changesData[embedName].data)) {
                                objectData[embedName].data = changesData[embedName].data;
                            } else {
                                merge(
                                    objectData[embedName].data,
                                    objectData[embedName].embeds,
                                    changesData[embedName].data
                                );
                            }
                            delete changesData[embedName];
                        }
                    });
                }
                angular.extend(objectData, changesData);
            })(object, object.embeds, angular.copy(changes));
        };

        RestangularStorage.prototype.getAll = function(options) {
            var parameters = RestangularStorage.buildParameters(options, this.defaultEmbed);

            return this.restangular.all(this.resourceName).getList(parameters);
        };


        RestangularStorage.prototype.getFirst = function(embed, filters, sortKey, reverseSort) {
            return this.getAll.call(this, {
                number: 1,
                page: null,
                embed: embed,
                filters: filters,
                sortKey: sortKey,
                reverseSort: reverseSort
            }).then(function(result) {
                return result[0];
            });
        };

        RestangularStorage.prototype.getList = function(page, embed, filters, sortKey, reverseSort) {
            return this.getAll.call(this, {
                page: page,
                embed: embed,
                filters: filters,
                sortKey: sortKey,
                reverseSort: reverseSort
            });
        };

        RestangularStorage.prototype.getById = function(id, embed) {
            return this.restangular.one(this.resourceName, id).get(RestangularStorage.buildEmbedParameters(this, embed));
        };

        RestangularStorage.prototype.update = function(element, embed, options) {
            if (!element.put) {
                restangular.restangularizeElement(null, element, this.resourceName);
            }
            return element.put(RestangularStorage.buildEmbedParameters(this, embed))
                .then(function(result) {
                    if (!options || !options.preventObjectUpdate) {
                        RestangularStorage.updateObjectFromResult(element, result);
                    }
                    return result;
                })
                .then(this.emitEventCallbackCreator('updated', [element]));
        };

        RestangularStorage.prototype.updateAll = function(elements, embed, options) {
            var parameters = RestangularStorage.buildEmbedParameters(this, embed);

            return $q.all(elements.map(function(element) {
                return element.put(parameters)
                    .then(function(result) {
                        if (!options || !options.preventObjectUpdate) {
                            RestangularStorage.updateObjectFromResult(element, result);
                        }
                        return result;
                    });
            })).then(this.emitEventCallbackCreator('updated', elements));
        };

        RestangularStorage.prototype.patch = function(element, changes, embed, options) {
            if (!element.patch) {
                restangular.restangularizeElement(null, element, this.resourceName);
            }
            RestangularStorage.updateObjectBeforePatch(element, changes);
            return element.patch(changes, RestangularStorage.buildEmbedParameters(this, embed))
                .then(function(result) {
                    if (!options || !options.preventObjectUpdate) {
                        RestangularStorage.updateObjectFromResult(element, result);
                    }
                    return result;
                })
                .then(this.emitEventCallbackCreator('updated', [element]));
        };

        RestangularStorage.prototype.patchAll = function(elements, changes, embed, options) {
            elements.forEach(function(element) {
                RestangularStorage.updateObjectBeforePatch(element, changes);
            });
            var parameters = RestangularStorage.buildEmbedParameters(this, embed);

            return $q.all(elements.map(function(element) {
                return element.patch(changes, parameters)
                    .then(function(result) {
                        if (!options || !options.preventObjectUpdate) {
                            RestangularStorage.updateObjectFromResult(element, result);
                        }
                        RestangularStorage.updateObjectFromResult(element, result);
                        return result;
                    });
            })).then(this.emitEventCallbackCreator('updated', elements));
        };

        RestangularStorage.prototype.create = function(element, embed, options) {
            return this.restangular.all(this.resourceName)
                .post(element, RestangularStorage.buildEmbedParameters(this, embed))
                .then(function(result) {
                    if (!options || !options.preventObjectUpdate) {
                        RestangularStorage.updateObjectFromResult(element, result);
                    }
                    return result;
                })
                .then(this.emitEventCallbackCreator('created', [element]));
        };

        RestangularStorage.prototype.delete = function(element) {
            if (!element.delete) {
                restangular.restangularizeElement(null, element, this.resourceName);
            }
            return element.remove().then(this.emitEventCallbackCreator('deleted', [element]));
        };

        RestangularStorage.prototype.deleteAll = function(elements) {

            return $q.all(elements.map(function(element) {
                return element.remove();
            })).then(this.emitEventCallbackCreator('deleted', elements));
        };

        /**
         * prefer use of create() or update()
         */
        RestangularStorage.prototype.save = function(element, embed, options) {
            if (!element.save) {
                restangular.restangularizeElement(null, element, this.resourceName);
            }
            return element.save(RestangularStorage.buildEmbedParameters(this, embed))
                .then(function(result) {
                    if (!options || !options.preventObjectUpdate) {
                        RestangularStorage.updateObjectFromResult(element, result);
                    }
                    return result;
                })
                .then(this.emitEventCallbackCreator('updated', [element]));
        };

        RestangularStorage.prototype.saveAll = function(elements, embed, options) {
            var parameters = RestangularStorage.buildEmbedParameters(this, embed);

            return $q.all(elements.map(function(element) {
                return element.save(parameters)
                    .then(function(result) {
                        if (!options || !options.preventObjectUpdate) {
                            RestangularStorage.updateObjectFromResult(element, result);
                        }
                        return result;
                    });
            })).then(this.emitEventCallbackCreator('updated', elements));
        };

        RestangularStorage.prototype.getNew = function() {
            return this.restangular.one(this.resourceName);
        };

        RestangularStorage.prototype.copy = function(element) {
            return this.restangular.copy(element);
        };

        return RestangularStorage;
    }]);
