/**
 * Created by ximing on 2018/7/2.
 */
'use strict';
import { getDateStr, formatLogData } from '../util';

export default function(logEvent, timezoneOffset) {
    return `[${getDateStr(logEvent.startTime)}] [${logEvent.level.levelStr}] ${
        logEvent.categoryName
    } - ${formatLogData(logEvent.data)} \n`;
}
