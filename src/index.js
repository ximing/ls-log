/**
 * Created by ximing on 2018/7/2.
 */
'use strict';
import Configuration from './configuration';
import logger from './logger';
import levels from './level';
import { getDateStr } from './util';
import layout from './layout/index';

const defaultConf = {
    appenders: {
        console: {
            type: 'console',
            layout: {
                type: 'basic'
            }
        }
    },
    categories: {
        default: {
            appenders: ['console'],
            level: 'trace'
        }
    },
    separator: '\n'
};

let config;
let Logger;
let LoggingEvent;
let enabled;

function configForCategory(category) {
    if (config.categories.has(category)) {
        return config.categories.get(category);
    }
    if (category.indexOf('.') > 0) {
        return configForCategory(category.substring(0, category.lastIndexOf('.')));
    }
    return configForCategory('default');
}

function appendersForCategory(category) {
    return configForCategory(category).appenders;
}

function levelForCategory(category) {
    return configForCategory(category).level;
}

function setLevelForCategory(category, level) {
    let categoryConfig = config.categories.get(category);
    if (!categoryConfig) {
        const sourceCategoryConfig = configForCategory(category);
        categoryConfig = { appenders: sourceCategoryConfig.appenders };
    }
    categoryConfig.level = level;
    config.categories.set(category, categoryConfig);
}

function sendLogEventToAppender(logEvent) {
    if (!enabled) return;
    const appenders = appendersForCategory(logEvent.categoryName);
    appenders.forEach((appender) => {
        appender(logEvent);
    });
}

function getLogger(category) {
    if (!enabled) configure(defaultConf);
    const cat = category || 'default';
    enabled = true;
    return new Logger(sendLogEventToAppender, cat);
}

function configure(configObject = defaultConf) {
    config = new Configuration(configObject);
    log4js.levels = config.levels;
    const loggerModule = logger(config.levels, levelForCategory, setLevelForCategory);
    Logger = loggerModule.Logger;
    LoggingEvent = loggerModule.LoggingEvent;
    enabled = true;
    return log4js;
}

const log4js = {
    getLogger,
    configure,
    levels: levels(),
    getDateStr,
    addLayout: layout.addLayout
};

export default log4js;
