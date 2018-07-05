/**
 * Created by ximing on 2018/7/2.
 */
'use strict';
import dateFormat from 'date-format';
import inspect from 'object-inspect';

export function getDateStr(date) {
    return dateFormat('yy/MM/dd hh:mm:ss.SSS', date || new Date());
}

export function getCategory(conf, categoryName = 'default') {
    return conf['categories'][categoryName] || conf['categories']['default'];
}

const emptyOptions = {};
let CIRCULAR_ERROR_MESSAGE;

export function tryStringify(arg) {
    try {
        return JSON.stringify(arg);
    } catch (err) {
        // Populate the circular error message lazily
        if (!CIRCULAR_ERROR_MESSAGE) {
            try {
                const a = {};
                a.a = a;
                JSON.stringify(a);
            } catch (err) {
                CIRCULAR_ERROR_MESSAGE = err.message;
            }
        }
        if (err.name === 'TypeError' && err.message === CIRCULAR_ERROR_MESSAGE) return '[Circular]';
        throw err;
    }
}

export function format(...args) {
    return formatWithOptions(emptyOptions, ...args);
}

function formatWithOptions(inspectOptions, f) {
    let i, tempStr;
    if (typeof f !== 'string') {
        if (arguments.length === 1) return '';
        let res = '';
        for (i = 1; i < arguments.length - 1; i++) {
            res += inspect(arguments[i], inspectOptions);
            res += ' ';
        }
        res += inspect(arguments[i], inspectOptions);
        return res;
    }

    if (arguments.length === 2) return f;

    let str = '';
    let a = 2;
    let lastPos = 0;
    for (i = 0; i < f.length - 1; i++) {
        if (f.charCodeAt(i) === 37) {
            // '%'
            const nextChar = f.charCodeAt(++i);
            if (a !== arguments.length) {
                switch (nextChar) {
                    case 115: // 's'
                        tempStr = String(arguments[a++]);
                        break;
                    case 106: // 'j'
                        tempStr = tryStringify(arguments[a++]);
                        break;
                    case 100: // 'd'
                        tempStr = `${Number(arguments[a++])}`;
                        break;
                    case 79: // 'O'
                        tempStr = inspect(arguments[a++], inspectOptions);
                        break;
                    case 111: {
                        // 'o'
                        const opts = Object.assign({}, inspectOptions, {
                            showHidden: true,
                            showProxy: true,
                            depth: 4
                        });
                        tempStr = inspect(arguments[a++], opts);
                        break;
                    }
                    case 105: // 'i'
                        tempStr = `${parseInt(arguments[a++])}`;
                        break;
                    case 102: // 'f'
                        tempStr = `${parseFloat(arguments[a++])}`;
                        break;
                    case 37: // '%'
                        str += f.slice(lastPos, i);
                        lastPos = i + 1;
                        continue;
                    default:
                        // any other character is not a correct placeholder
                        continue;
                }
                if (lastPos !== i - 1) str += f.slice(lastPos, i - 1);
                str += tempStr;
                lastPos = i + 1;
            } else if (nextChar === 37) {
                str += f.slice(lastPos, i);
                lastPos = i + 1;
            }
        }
    }
    if (lastPos === 0) str = f;
    else if (lastPos < f.length) str += f.slice(lastPos);
    while (a < arguments.length) {
        const x = arguments[a++];
        if ((typeof x !== 'object' && typeof x !== 'symbol') || x === null) {
            str += ` ${x}`;
        } else {
            str += ` ${inspect(x, inspectOptions)}`;
        }
    }
    return str;
}

export function formatLogData(logData) {
    let data = logData;
    if (!Array.isArray(data)) {
        const numArgs = arguments.length;
        data = new Array(numArgs);
        for (let i = 0; i < numArgs; i++) {
            // eslint-disable-line no-plusplus
            data[i] = arguments[i];
        }
    }
    return format.apply(null, data);
}
