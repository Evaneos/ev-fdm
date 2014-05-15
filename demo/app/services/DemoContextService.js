'use strict';

var module = angular.module('demo');

function DemoContextService() {
    return {
        grid: {
            sort: {
            },
            active: null,
            selected: []
        },
        options: {
            liveSearch: false
        },
        selectedFilters: {
            title: '',
            userRole: '',
            show: '',
            fruits: ['banana'],
            sport: ''
        },
        fruits: _(['Coco', 'Ananas', 'Letchi', 'Banana']).map(function(n) {
                return {
                    name: n,
                    value: n.toLowerCase(),
                    selected: false
                }
            }
        ),
        sports: _(['Basket', 'Kite', 'Windsurf']).map(function(n) {
            return {
                name: n,
                value: n.toLowerCase(),
                selected: false
            }
        })
    };
};

module.service('DemoContextService', [ DemoContextService ]);
