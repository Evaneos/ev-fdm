
if(typeof(Fanny) == 'undefined') {
    Fanny = {}
};

Fanny.Utils = {
    generatedIds : {},
    generateId : function(prefix) {
        var id = prefix + Math.random() * 10000;
        if(typeof(this.generatedIds[id] != 'undefined')) {
            this.generatedIds[id] = true;
        } else {
            id = generateId(prefix);
        }
        return id;
    },
    convertNumberToString : function(number, nbDecimals, intMinLength) {
        var thousandsSep = ' ';
        var decimalSep   = ',';
        var numberStr    = '';
        var numberArray  = [];
        var integer      = '';
        var decimals     = '';
        var result       = '';
        
        if(typeof(nbDecimals) == 'undefined') {
            nbDecimals = 2;
        }
        
        numberStr = number + '';
        numberArray = numberStr.split('.');
        if(numberArray.length < 1 && numberArray.length > 2) {
            throw new Error('Invalid number');
            return false;
        }
        
        integer = numberArray[0];
        
        if(numberArray.length == 1) {
            decimals = '';
            for(var i = 0; i < nbDecimals; i++) {
                decimals += '0';
            }
        } else {
            decimals = numberArray[1];
            if(decimals.length > nbDecimals) {
                decimals = decimals.substring(0, 2);
            } else {
                while(decimals.length < nbDecimals) {
                    decimals += '0';
                }
            }
        }
        for(var i = 0; i < integer.length; i++) {
            if(i % 3 == 0 && i != 0) {
                result = thousandsSep + result;
            }
            result = integer[integer.length - i - 1] + result;
        }
        if(result == '') {
            result = '' + 0;
        }
        
        for(var i = result.length; i < intMinLength; i++) {
            result = '0' + result;
        }
        
        if(decimals.length > 0) {
            result += decimalSep + decimals;
        }
        return result;
    },
    stringToVar : function(string) {
        if(typeof(string) != 'string') {
            throw new Error('Not a string');
            return;
        }
        if(!isNaN(string)) {
            return parseInt(string);
        }
        var _exploded = string.split('.');
        var _result = window;
        for (var index = 0; index < _exploded.length; index++) {
            if(_exploded[index].length && typeof(_result[_exploded[index]]) != 'undefined') {
                _result = _result[_exploded[index]];
            } else {
                throw new Error('No corresponding var found for ' + string);
                return;
            }
        }
        return _result;
    },
    formatDate : function(date) {
        if(!date || typeof(date) != 'object') {
            return '';
        }
        var year = date.getFullYear();
        var month = this.convertNumberToString(date.getMonth() + 1, 0, 2);
        var day = this.convertNumberToString(date.getDate(), 0, 2);
        return year + '-' + month + '-' + day;
    },
    Renderers : {
        date : function(date) {
            var _date     = null;
            var _splitted = null;
            var _obj      = null;
            if(date && typeof(date) == 'object') {
                _date = date.date;
            } else {
                _date = date;
            }
            if(typeof(_date) == 'string' && _date) {
                _date = _date.split(' ')[0];
                _splitted = _date.split('-');
                if (_splitted.length === 3) {
                    return _splitted[2] + '/' + _splitted[1] + '/' + _splitted[0];
                }
                else {
                    return '';
                }
            } else {
                return '';
            }
        },
        amounts : function(number) {
            var res = Fanny.Utils.convertNumberToString(number, 2);
            if(number >= 0) {
                return res;
            } else {
                return $('<span>').addClass('text-orange').html(res)
            }
            
        },
        money : function(number, row) {
            var currency = (row && row.currency && row.currency.symbole) ? row.currency.symbole : '€';
            var res = Fanny.Utils.convertNumberToString(number, 2) + ' ' + currency;
            if(number >= 0) {
                return res;
            } else {
                return $('<span>').addClass('text-orange').html(res)
            }
        },
        euros : function(number) {
            var res = Fanny.Utils.convertNumberToString(number, 2) + ' €';
            if(number >= 0) {
                return res;
            } else {
                return $('<span>').addClass('text-orange').html(res)
            }
        },
        upper : function(string) {
            if(typeof(string) == 'string') {
                return string.toUpperCase();
            } else {
                return string;
            }
        }
    }
}