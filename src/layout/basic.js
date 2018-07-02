/**
 * Created by ximing on 2018/7/2.
 */
'use strict';
import { getDateStr, format } from '../util';

function formatLogData(logData) {
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
export default function(logEvent, timezoneOffset) {
    return `[${getDateStr(logEvent.startTime)}] [${logEvent.level.levelStr}] ${
        logEvent.categoryName
    } - ${formatLogData(logEvent.data)} \n`;
}
