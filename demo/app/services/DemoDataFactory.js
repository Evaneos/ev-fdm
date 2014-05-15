'use strict';

var module = angular.module('demo');

function DemoDataFactory() {

    function Row() {
        this.cells = {};
    }
    Row.prototype.toJSON = function() {
        console.log(this.cells[ 'Name' ]);
        return this.cells[ 'Name' ];
    }

    function generateString(len) {
        var text = "";
        var possible = "    ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for( var i=0; i < len; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text.trim();
    }

    function generateRow(cols) {
        var row = new Row;
        _(cols).each(function(col) {
            row.cells[col] = generateString(1 + Math.random() * 18);
        });
        return row;

    }

    function generateRows(len, cols) {
        var rows = [];
        for (var i = 0; i < len; i++) {
            rows.push(generateRow(cols));
        }
        return rows;
    }

    function generateCols(len) {
        var cols = [ 'Name' ];
        for (var i = 0; i < len - 1; i++) {
            cols.push(generateString(3 + Math.random() * 10));
        }
        return cols;
    }

    return function(len, cols) {
        var self = this;
        this.cols = generateCols(cols);
        this.rows = generateRows(len, this.cols);
        this.addRow = function() {
            var row = generateRow(self.cols);
            self.rows.push(row);
            return row;
        };
        this.sort = function(sort) {
            if (!sort || !sort.by) return;
            var x = (sort.reverse ? -1 : 1);
            self.rows.sort(function (a, b) {
                a = a.cells[sort.by].toLowerCase();
                b = b.cells[sort.by].toLowerCase();
                if (a < b) return x * 1;
                if (b < a) return x * -1;
                return 0;
            });
        };
    }
};

module.factory('DemoDataFactory', [ DemoDataFactory ]);
