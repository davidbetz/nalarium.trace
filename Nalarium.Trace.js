/** Nalarium.Trace v1.9.1 **/
/* Copyright (c) 2005-2013 David Betz (http://www.netfxharmonics.com/) */
if (typeof usingV8Standalone == 'undefined') {
    usingV8Standalone = false;
}
if (usingV8Standalone === true) {
    var Nalarium = Nalarium || {};
}
else {
    window.Nalarium = window.Nalarium || {};
}
//+
//- Nalarium.Trace -//
Nalarium.Trace = {
    _enabled: false,
    enableTraceFunction: false,
    //+ by default each browser uses its own console
    alwaysUseFirebug: false,
    forceFirebugLite: false,
    enableWriteLineCounter: true,
    _counter: 0,
    _pureFirebugLogger: !!(typeof console !== 'undefined' && typeof console.log !== 'undefined'),
    _liteFirebugLogger: !!(typeof firebug !== 'undefined' && typeof firebug.d !== 'undefined' && typeof firebug.d.console !== 'undefined'),
    _isIE: !!(!usingV8Standalone && window && window.attachEvent && !window.opera),
    _isMozilla: !usingV8Standalone && navigator.userAgent.indexOf('Gecko') > -1 && navigator.userAgent.indexOf('KHTML') === -1,
    _isWebKit: !usingV8Standalone && navigator.userAgent.indexOf('KHTML') > -1,
    _isOpera: !usingV8Standalone && !!window.opera,
    _isV8Standalone: usingV8Standalone
};

//- isSupported -//
Nalarium.Trace.isSupported = function () {
    return (typeof Nalarium.Trace._isMozilla || Nalarium.Trace._isWebKit || Nalarium.Trace._isOpera || window.debugService || window.console) !== 'undefined'
};

//- setWriter -//
Nalarium.Trace.setCustomWriter = function (customWriter) {
    Nalarium.Trace._customWriter = customWriter;
}

//- setWriter -//
Nalarium.Trace._writeUsingCustomIfPossible = function (text, fallback) {
    if (!!Nalarium.Trace._customWriter == true) {
        Nalarium.Trace._customWriter(text)
    }
    else {
        fallback(text);
    }
};

//- enable -//
Nalarium.Trace.enable = function (options) {
    options = options || {};
    if (options.enableTraceFunction === true) {
        window.trace = function () { Nalarium.Trace.writeLine(arguments); return Nalarium.Trace; }
    }
    else if (Nalarium.Trace._isV8Standalone === false) {
        window.trace = window.trace || function () { return Nalarium.Trace; };
    }
    if (options.alwaysUseFirebug === true) {
        Nalarium.Trace.alwaysUseFirebug = true;
    }
    if (options.enableWriteLineCounter === false) {
        Nalarium.Trace.enableWriteLineCounter = false;
    }
    if (options.forceFirebugLite === true) {
        Nalarium.Trace.forceFirebugLite = true;
    }
    Nalarium.Trace._enabled = true;
    if (options.enable === false) {
        Nalarium.Trace._enabled = false;
    }
    //+
    return Nalarium.Trace;
};

//- _firebugLogger -//
Nalarium.Trace._firebugLogger = function (text) {
    if (Nalarium.Trace._pureFirebugLogger == true && Nalarium.Trace.forceFirebugLite == false) {
        console.log(text);
    }
    else if (Nalarium.Trace._liteFirebugLogger == true) {
        firebug.d.console.log(text);
    }
};

//- addNewLine -//
Nalarium.Trace.addNewLine = function (count) {
    if (Nalarium.Trace._enabled == true && Nalarium.Trace.isSupported() == true) {
        var countNumber = isNaN(count) == true ? 1 : parseInt(count);
        for (var i = 0; i < countNumber; i++) {
            Nalarium.Trace.write('\n');
        }
    }
    //+
    return Nalarium.Trace;
};

//- writeLine -//
Nalarium.Trace.writeLine = function () {
    var args = arguments;
    var text = '';
    if (args.length == 0) {
        return Nalarium.Trace;
    }
    var packaged = false;
    if (typeof args[0] != 'string' && typeof args[0].length != 'undefined') {
        args = args[0];
        packaged = true;
    }
    if (args.length == 1 && packaged === false) {
        text = args[0];
    }
    else {
        text = Nalarium.Trace._combine(args);
    }
    if (Nalarium.Trace._enabled == true && Nalarium.Trace.isSupported() == true) {
        Nalarium.Trace._counter++;
        if (!!window.debugService == false) {
            text = text + '\n';
        }
        if (Nalarium.Trace.enableWriteLineCounter === true) {
            text = Nalarium.Trace._counter + ':' + text;
        }
        Nalarium.Trace.write(text);
    }
    //+
    return Nalarium.Trace;
};

//- writeLabeledLine -//
Nalarium.Trace.writeLabeledLine = function (label, text) {
    label = label || '';
    if (Nalarium.Trace._enabled == true && Nalarium.Trace.isSupported() == true) {
        Nalarium.Trace._counter++;
        Nalarium.Trace.write(Nalarium.Trace._counter + ':' + label + ' (' + text + ')\n');
    }
    //+
    return Nalarium.Trace;
};

Nalarium.Trace._combine = function (args) {
    var text = '';
    if (args.length == 1) {
        text = args[0];
    }
    else {
        var stringBuilder = [];
        var hasLineBreak = false;
        for (var i = 0; i < args.length; i++) {
            var c = args[i];
            if (c == '\n') {
                hasLineBreak = true;
                continue;
            }
            stringBuilder.push(c);
        }
        text = stringBuilder.join(',');
        if (hasLineBreak === true) {
            text += '\n';
        }
    }
    //+
    return text;
}

//- write -//
Nalarium.Trace.write = function () {
    var args = arguments;
    var text = '';
    if (args.length == 1) {
        text = args[0];
    }
    else {
        text = Nalarium.Trace._combine(args);
    }
    if (Nalarium.Trace._enabled == true && Nalarium.Trace.isSupported() == true) {
        if (Nalarium.Trace._isV8Standalone === true) {
            Nalarium.Trace._writeUsingCustomIfPossible(text, function (text) {
                console.log(text);
            });
        }
        else if (Nalarium.Trace.alwaysUseFirebug == true) {
            if (text != '\n') {
                Nalarium.Trace._writeUsingCustomIfPossible(text, function (text) {
                    Nalarium.Trace._firebugLogger(text);
                });
            }
        }
        else if (window.debugService) {
            Nalarium.Trace._writeUsingCustomIfPossible(text, function (text) {
                window.debugService.trace(text);
            });
        }
        else if (Nalarium.Trace._isMozilla == true) {
            Nalarium.Trace._writeUsingCustomIfPossible(text, function (text) {
                dump(text);
            });
        }
        else if (Nalarium.Trace._isWebKit == true) {
            if (text != '\n') {
                Nalarium.Trace._writeUsingCustomIfPossible(text, function (text) {
                    window.console.log(text);
                });
            }
        }
        else if (Nalarium.Trace._isOpera == true) {
            Nalarium.Trace._writeUsingCustomIfPossible(text, function () {
                opera.postError(text);
            });
        }
    }
    //+
    return Nalarium.Trace;
};

//+
//- Nalarium.Trace.Buffer -//
Nalarium.Trace.Buffer = (function () {
    this._stringBuilder = [];
    this._depth = 0;
    var that = this;

    //- $getIndent -//
    this.getIndent = function () {
        var indent = '';
        for (var i = 0; i < this._depth; i++) {
            indent += this.indent;
        }
        //+
        return indent;
    };

    function ctor(options) {
        options = options || {};
        this.wrap = options.wrap || false;
        var indentSize = options.indentSize;
        if (typeof indentSize !== 'number') {
            that.indent = '    ';
        }
        else {
            that.indent = '';
            for (var i = 0; i < indentSize; i++) {
                that.indent += ' ';
            }
        }

        //- #beginSegment -//
        this._writeArray = function (array) {
            if (array && array.length > 0) {
                var first = true;
                var c = array.length;
                for (var n = 0; n < c; n++) {
                    if (array[n]) {
                        this.write('[');
                        that._depth++;
                        this.write(array[n]);
                        that._depth--;
                        first = false;
                        if (n + 1 < c) {
                            this.write('],');
                        }
                        else {
                            this.write(']');
                        }
                    }
                }
            }
            //+
            return this;
        },

        //- #beginSegment -//
        this._writeObject = function (obj) {
            for (var o in obj) {
                if (obj[o] && typeof obj[o] !== 'function') {
                    var m = obj[o];
                    if (typeof m === 'object' && 'join' in m) {
                        this.beginSegment(o + '[]');
                        this._writeArray(m);
                        this.endSegment(o + '[]');
                    }
                    else if (typeof obj[o] === 'number' || typeof obj[o] === 'string') {
                        if (this.wrap === true) {
                            this.write('\'' + o + '\':\'' + m + '\'');
                        }
                        else {
                            this.write(o + ':' + m);
                        }
                    }
                    else {
                        this.beginSegment(o);
                        this._writeObject(m);
                        this.endSegment(o);
                    }
                }
            }
            //+
            return this;
        }
    }

    //+ public
    ctor.prototype = {
        //- @beginSegment -//
        beginSegment: function (title) {
            title = title || '';
            that._stringBuilder.push(that.getIndent() + '++' + title);
            that._depth++;
            //+
            return this;
        },

        //- @endSegment -//
        endSegment: function (title) {
            title = title || '';
            that._depth--;
            that._stringBuilder.push(that.getIndent() + '--' + title);
            //+
            return this;
        },

        //- @write -//
        write: function (text) {
            text = text || '';
            if (typeof text === 'number' || typeof text === 'string') {
                that._stringBuilder.push(that.getIndent() + text);
            }
            else if (typeof m === 'object' && 'join' in m) {
                this._writeArray(text);
            }
            else {
                this._writeObject(text);
            }
            //+
            return this;
        },

        writeLabeledLine: function (label, text) {
            this.write(label + ':' + text);
            //+
            return this;
        },

        //- @writeNewLine -//
        writeNewLine: function () {
            this.write('\n');
            //+
            return this;
        },

        //- flush -//
        flush: function (options) {
            options = options || {};
            var separator = options.separator || '\n';
            var mode = options.mode || '';
            var data = that._stringBuilder.join(separator);
            that._stringBuilder = [];
            if (mode == 'alert') {
                alert(data);
            }
            else if (mode == 'nowrite') {
            }
            else {
                Nalarium.Trace.write(data + '\n');
            }
            //+
            return data;
        }
    };

    return ctor;
})();



if (usingV8Standalone === true) {
    exports.setCustomWriter = Nalarium.Trace.setCustomWriter;
    exports.write = Nalarium.Trace.write;
    exports.enable = Nalarium.Trace.enable;
    exports.buffer = Nalarium.Trace.Buffer;
}