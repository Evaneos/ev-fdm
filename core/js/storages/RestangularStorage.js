angular.module('ev-fdm')
    .factory('RestangularStorage', ['$q', 'Restangular', 'communicationService', function($q, restangular, communicationService) {

        function RestangularStorage(resourceName, defaultEmbed) {
            this.restangular = restangular;
            this.resourceName = resourceName;
            this.defaultEmbed = defaultEmbed || [];

            this.emitEventCallbackCreator = function(eventName, elements) {
                return function(result) {
                    communicationService.emit(this.resourceName + '::' + eventName, elements);
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

        RestangularStorage.buildParameters = function(resource, embed) {
            var parameters = {};

            if(angular.isArray(embed) && embed.length) {
                parameters.embed = RestangularStorage.buildEmbed(embed.concat(resource.defaultEmbed));
            }
            else if(resource.defaultEmbed.length) {
                parameters.embed = RestangularStorage.buildEmbed(resource.defaultEmbed);
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
                            if (!objectData[embedName]) {
                                objectData[embedName] = resultData[embedName];
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
            })(object, angular.copy(restangular.stripRestangular(result)), result.embeds);
        };
        RestangularStorage.prototype.updateObjectFromResult = RestangularStorage.updateObjectFromResult;

        RestangularStorage.updateObjectBeforePatch = function(object, changes) {
            (function merge(objectData, objectEmbeds, changesData) {
                if (objectEmbeds) {
                    objectEmbeds.forEach(function(embedName) {
                        if (embedName in changesData) {
                            if (!objectData[embedName]) {
                                objectData[embedName] = changesData[embedName];
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


        function getAll(number, page, embed, filters, sortKey, reverseSort) {
            var parameters = {};

            if(angular.isNumber(page) && page > 0) {
                parameters.page = page;
            }

            if(angular.isNumber(number) && number > 0) {
                parameters.number = number;
            }

            if(angular.isArray(embed) && embed.length) {
                parameters.embed = RestangularStorage.buildEmbed(embed.concat(this.defaultEmbed));
            }
            else if(this.defaultEmbed.length) {
                parameters.embed = RestangularStorage.buildEmbed(this.defaultEmbed);
            }

            if(sortKey) {
                parameters.sortBy = RestangularStorage.buildSortBy(sortKey, reverseSort);
            }

            if(filters) {
                filters = RestangularStorage.buildFilters(filters);
                angular.extend(parameters, filters);
            }
            return this.restangular.all(this.resourceName).getList(parameters);
        }


        RestangularStorage.prototype.getFirst = function(number, embed, filters, sortKey, reverseSort) {
             if(!angular.isNumber(number) || number <= 0) {
                number = 1;
            }
            return getAll.call(this, number, null, embed, filters, sortKey, reverseSort).then(function (result) {
                return result[0];
            });
        };

        RestangularStorage.prototype.getList = getAll.bind(this, null);


        RestangularStorage.prototype.getById = function(id, embed) {
            return this.restangular.one(this.resourceName, id).get(RestangularStorage.buildParameters(this, embed));
        };

        RestangularStorage.prototype.update = function(element, embed) {
            return element.put(RestangularStorage.buildParameters(this, embed))
                .then(function(result) {
                    RestangularStorage.updateObjectFromResult(element, result);
                    return result;
                })
                .then(this.emitEventCallbackCreator('updated', [element]));
        };

        RestangularStorage.prototype.updateAll = function(elements, embed) {
            var parameters = RestangularStorage.buildParameters(this, embed);

            return $q.all(elements.map(function(element) {
                return element.put(parameters)
                    .then(function(result) {
                        RestangularStorage.updateObjectFromResult(element, result);
                        return result;
                    });
            })).then(this.emitEventCallbackCreator('updated', elements));
        };

        RestangularStorage.prototype.patch = function(element, changes, embed) {
            if (!element.patch) {
                restangular.restangularizeElement(null, element, this.resourceName);
            }
            RestangularStorage.updateObjectBeforePatch(element, changes);
            return element.patch(changes, RestangularStorage.buildParameters(this, embed))
                .then(function(result) {
                    RestangularStorage.updateObjectFromResult(element, result);
                    return result;
                })
                .then(this.emitEventCallbackCreator('updated', [element]));
        };

        RestangularStorage.prototype.patchAll = function(elements, changes, embed) {
            elements.forEach(function(element) {
                RestangularStorage.updateObjectBeforePatch(element, changes);
            });
            var parameters = RestangularStorage.buildParameters(this, embed);

            return $q.all(elements.map(function(element) {
                return element.patch(changes, parameters)
                    .then(function(result) {
                        RestangularStorage.updateObjectFromResult(element, result);
                        return result;
                    })
            })).then(this.emitEventCallbackCreator('updated', elements));
        };

        RestangularStorage.prototype.create = function(element, embed) {
            return this.restangular.all(this.resourceName)
                .post(element, RestangularStorage.buildParameters(this, embed))
                .then(function(result) {
                    RestangularStorage.updateObjectFromResult(element, result);
                    return result;
                })
                .then(this.emitEventCallbackCreator('created', [element]));
        };

        RestangularStorage.prototype.delete = function(element) {
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
        RestangularStorage.prototype.save = function(element, embed) {
            return element.save(RestangularStorage.buildParameters(this, embed))
                .then(function(result) {
                    RestangularStorage.updateObjectFromResult(element, result);
                    return result;
                })
                .then(this.emitEventCallbackCreator('updated', [element]));
        };

        RestangularStorage.prototype.saveAll = function(elements, embed) {
            var parameters = RestangularStorage.buildParameters(this, embed);

            return $q.all(elements.map(function(element) {
                return element.save(parameters)
                    .then(function(result) {
                        RestangularStorage.updateObjectFromResult(element, result);
                        return result;
                    });
            })).then(this.emitEventCallbackCreator('updated', elements));
        };

        RestangularStorage.prototype.getNew = function() {
            return this.restangular.one(this.resourceName);
        };

        return RestangularStorage;
    }]);
