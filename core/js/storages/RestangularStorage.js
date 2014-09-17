
angular.module('ev-fdm')
    .factory('RestangularStorage', ['$q', 'Restangular', 'communicationService', function($q, restangular, communicationService) {

        function RestangularStorage(resourceName, defaultEmbed) {
            this.restangular = restangular;
            this.resourceName = resourceName;
            this.defaultEmbed = defaultEmbed || [];
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

        RestangularStorage.prototype.getList = function(page, embed, filters, sortKey, reverseSort) {
            var parameters = {};

            if(angular.isNumber(page) && page > 0) {
                parameters.page = page;
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
        };


        RestangularStorage.prototype.getById = function(id, embed) {
            return this.restangular.one(this.resourceName, id).get(RestangularStorage.buildParameters(this, embed));
        };

        RestangularStorage.prototype.update = function(element, embed) {
            return element.put(RestangularStorage.buildParameters(this, embed)).then(function(result) {
                communicationService.emit(this.resourceName + '::updated');
                return result;
            }.bind(this));
        };

        RestangularStorage.prototype.updateAll = function(elements, embed) {
            communicationService.emit(this.resourceName + '::updating', elements);

            return $q.all(elements.map(function(element) {
                return element.put(RestangularStorage.buildParameters(this, embed));
            })).then(function(result) {
                communicationService.emit(this.resourceName + '::updated');
                return result;
            }.bind(this));
        };

        RestangularStorage.prototype.patch = function(element, changes, embed) {
            angular.extend(element, changes);
            communicationService.emit(this.resourceName + '::updating', [ element ]);

            return element.patch(changes, RestangularStorage.buildParameters(this, embed)).then(function(result) {
                communicationService.emit(this.resourceName + '::updated');
            }.bind(this));
        };

        RestangularStorage.prototype.patchAll = function(elements, changes, embed) {
            elements.forEach(function(element) {
                angular.extend(element, changes);
            });
            communicationService.emit(this.resourceName + '::updating', elements);

            return $q.all(elements.map(function(element) {
                return element.patch(changes, RestangularStorage.buildParameters(this, embed));
            })).then(function(result) {
                communicationService.emit(this.resourceName + '::updated');
                return result;
            }.bind(this));
        };

        RestangularStorage.prototype.create = function(element, embed) {
            return this.restangular.all(this.resourceName)
                .post(element, RestangularStorage.buildParameters(this, embed))
                .then(function(result) {
                    communicationService.emit(this.resourceName + '::updated');
                    return result;
                }.bind(this));
        };

        RestangularStorage.prototype.delete = function(element) {
            communicationService.emit(this.resourceName + '::updating', [element]);
            return element.remove().then(function(result) {
                communicationService.emit(this.resourceName + '::updated');
                return result;
            }.bind(this));
        };

        RestangularStorage.prototype.deleteAll = function(elements) {
            communicationService.emit(this.resourceName + '::updating', elements);

            return $q.all(elements.map(function(element) {
                return element.remove();
            })).then(function(result) {
                communicationService.emit(this.resourceName + '::updated');
                return result;
            }.bind(this));
        };

        RestangularStorage.prototype.save = function(element, embed) {
            communicationService.emit(this.resourceName + '::updating', [element]);
            return element.save(RestangularStorage.buildParameters(this, embed))
                .then(function(result) {
                    communicationService.emit(this.resourceName + '::updated');
                    return result;
                }.bind(this));
        };

        RestangularStorage.prototype.saveAll = function(elements, embed) {
            communicationService.emit(this.resourceName + '::updating', elements);

            return $q.all(elements.map(function(element) {
                return element.save(RestangularStorage.buildParameters(this, embed));
            })).then(function(result) {
                communicationService.emit(this.resourceName + '::updated');
                return result;
            }.bind(this));
        };

        RestangularStorage.prototype.getNew = function() {
            return this.restangular.one(this.resourceName);
        };


        return RestangularStorage;
    }]);
