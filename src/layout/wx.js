/**
 * Created by ximing on 2018/7/2.
 */
'use strict';
import { formatLogData } from '../util';

export default function(logEvent) {
    return Object.assign({}, logEvent, { data: formatLogData(logEvent.data) });
}
