/**
 * Created by ximing on 2018/7/2.
 */
'use strict';
const consoleLog = console.log.bind(console);

function consoleAppender(layout, timezoneOffset) {
    return (loggingEvent) => {
        consoleLog(layout(loggingEvent, timezoneOffset));
    };
}

function configure(config, layouts) {
    let layout = layouts.basicLayout;
    if (config.layout) {
        layout = layouts.layout(config.layout.type, config.layout);
    }
    return consoleAppender(layout, config.timezoneOffset);
}

export default { configure };
