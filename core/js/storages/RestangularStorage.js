
angular.module('ev-fdm')
    .factory('RestangularStorage', ['Restangular', 'communicationService', function(restangular, communicationService) {

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

        RestangularStorage.buidParameters = function(resource, embed) {
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
            return this.restangular.one(this.resourceName, id).get(RestangularStorage.buidParameters(this, embed));
        };

        RestangularStorage.prototype.update = function(element, embed) {
            return element.put(RestangularStorage.buidParameters(this, embed));
        };

        RestangularStorage.prototype.patch = function(element, changes, embed) {
            angular.extend(element, changes);
            communicationService.emit(this.resourceName + '::updating', [ element ]);

            return element.patch(changes, RestangularStorage.buidParameters(this, embed)).then(function(result) {
                communicationService.emit(this.resourceName + '::updated');
            }.bind(this));
        };

        RestangularStorage.prototype.create = function(element, embed) {
            return this.restangular.all(this.resourceName).post(element, RestangularStorage.buidParameters(this, embed));
        };

        RestangularStorage.prototype.delete = function(element) {
            return element.remove();
        };

        RestangularStorage.prototype.save = function(element, embed) {
            return element.save(RestangularStorage.buidParameters(this, embed));
        };

        RestangularStorage.prototype.getNew = function() {
            return this.restangular.one(this.resourceName);
        };


        return RestangularStorage;
    }]);
