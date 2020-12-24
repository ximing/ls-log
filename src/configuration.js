/**
 * Created by ximing on 2018/7/2.
 */
'use strict';
import levels from './level';
import layouts from './layout/index';

import { console, wx } from './appender/index';
const validColours = [
    'white',
    'grey',
    'black',
    'blue',
    'cyan',
    'green',
    'magenta',
    'red',
    'yellow'
];

function not(thing) {
    return !thing;
}

function anObject(thing) {
    return thing && typeof thing === 'object' && !Array.isArray(thing);
}

function validIdentifier(thing) {
    return /^[A-Za-z][A-Za-z0-9_]*$/g.test(thing);
}

function anInteger(thing) {
    return thing && typeof thing === 'number' && Number.isInteger(thing);
}

export default class Configuration {
    constructor(candidate) {
        this.candidate = candidate;

        this.throwExceptionIf(not(anObject(candidate)), 'must be an object.');
        this.throwExceptionIf(
            not(anObject(candidate.appenders)),
            'must have a property "appenders" of type object.'
        );
        this.throwExceptionIf(
            not(anObject(candidate.categories)),
            'must have a property "categories" of type object.'
        );

        this.deprecationWarnings = true;
        if ('deprecationWarnings' in this.candidate) {
            this.deprecationWarnings = this.candidate.deprecationWarnings;
        }

        this.levels = candidate.levels;
        this.appenders = candidate.appenders;
        this.categories = candidate.categories;
    }

    throwExceptionIf(checks, message) {
        const tests = Array.isArray(checks) ? checks : [checks];
        tests.forEach((test) => {
            if (test) {
                throw new Error(
                    `Problem with log4js configuration ${message}`
                );
            }
        });
    }

    loadAppenderModule(type) {
        if (type === 'console') return console;
        else if (type === 'wx') return wx;
    }

    createAppender(name, config) {
        const appenderModule = this.loadAppenderModule(config.type);

        this.throwExceptionIf(
            not(appenderModule),
            `appender "${name}" is not valid (type "${config.type}" could not be found)`
        );

        const appender = appenderModule.configure(
            config,
            layouts,
            this.configuredAppenders.get.bind(this.configuredAppenders),
            this.configuredLevels
        );

        if (appender.deprecated && this.deprecationWarnings) {
            console.error(
                `Appender "${name}" uses a deprecated type "${config.type}", ` + // eslint-disable-line
                    'which will be removed in log4js v3. ' +
                    `You should change it to use "${appender.deprecated}". ` +
                    'To turn off this warning add "deprecationWarnings: false" to your config.'
            );
        }

        return appender;
    }

    get appenders() {
        return this.configuredAppenders;
    }

    set appenders(appenderConfig) {
        const appenderNames = Object.keys(appenderConfig);
        this.throwExceptionIf(not(appenderNames.length), 'must define at least one appender.');

        this.configuredAppenders = new Map();
        appenderNames.forEach((name) => {
            this.throwExceptionIf(
                not(appenderConfig[name].type),
                `appender "${name}" is not valid (must be an object with property "type")`
            );
            this.configuredAppenders.set(name, this.createAppender(name, appenderConfig[name]));
        });
    }

    get categories() {
        return this.configuredCategories;
    }

    set categories(categoryConfig) {
        const categoryNames = Object.keys(categoryConfig);
        this.throwExceptionIf(not(categoryNames.length), 'must define at least one category.');

        this.configuredCategories = new Map();
        categoryNames.forEach((name) => {
            const category = categoryConfig[name];
            this.throwExceptionIf(
                [not(category.appenders), not(category.level)],
                `category "${name}" is not valid (must be an object with properties "appenders" and "level")`
            );

            this.throwExceptionIf(
                not(Array.isArray(category.appenders)),
                `category "${name}" is not valid (appenders must be an array of appender names)`
            );

            this.throwExceptionIf(
                not(category.appenders.length),
                `category "${name}" is not valid (appenders must contain at least one appender name)`
            );

            const appenders = [];
            category.appenders.forEach((appender) => {
                this.throwExceptionIf(
                    not(this.configuredAppenders.get(appender)),
                    `category "${name}" is not valid (appender "${appender}" is not defined)`
                );
                appenders.push(this.appenders.get(appender));
            });

            this.throwExceptionIf(
                not(this.configuredLevels.getLevel(category.level)),
                `category "${name}" is not valid (level "${category.level}" not recognised;` +
                    ` valid levels are ${this.configuredLevels.levels.join(', ')})`
            );
            this.configuredCategories.set(name, {
                appenders: appenders,
                level: this.configuredLevels.getLevel(category.level)
            });
        });

        this.throwExceptionIf(not(categoryConfig.default), 'must define a "default" category.');
    }

    get levels() {
        return this.configuredLevels;
    }

    set levels(levelConfig) {
        // levels are optional
        if (levelConfig) {
            this.throwExceptionIf(not(anObject(levelConfig)), 'levels must be an object');
            const newLevels = Object.keys(levelConfig);
            newLevels.forEach((l) => {
                this.throwExceptionIf(
                    not(validIdentifier(l)),
                    `level name "${l}" is not a valid identifier (must start with a letter, only contain A-Z,a-z,0-9,_)`
                );
                this.throwExceptionIf(
                    not(anObject(levelConfig[l])),
                    `level "${l}" must be an object`
                );
                this.throwExceptionIf(
                    not(levelConfig[l].value),
                    `level "${l}" must have a 'value' property`
                );
                this.throwExceptionIf(
                    not(anInteger(levelConfig[l].value)),
                    `level "${l}".value must have an integer value`
                );
                this.throwExceptionIf(
                    not(levelConfig[l].colour),
                    `level "${l}" must have a 'colour' property`
                );
                this.throwExceptionIf(
                    not(validColours.indexOf(levelConfig[l].colour) > -1),
                    `level "${l}".colour must be one of ${validColours.join(', ')}`
                );
            });
        }
        this.configuredLevels = levels(levelConfig);
    }
}
