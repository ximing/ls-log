/**
 * Created by ximing on 2018/7/2.
 */
'use strict';

function wxAppender(layout, send = function() {}, timezoneOffset) {
    return (loggingEvent) => {
        send(layout(loggingEvent, timezoneOffset));
    };
}

function configure(config, layouts) {
    let layout = layouts.wxLayout;
    if (config.layout) {
        layout = layouts.layout(config.layout.type, config.layout);
    }
    return wxAppender(layout, config.send, config.timezoneOffset);
}

export default { configure };
