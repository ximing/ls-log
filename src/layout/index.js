/**
 * Created by ximing on 2018/7/2.
 */
'use strict';
import basicLayout from './basic';
import jsonLayout from './json';
const layoutMakers = {
    basic: function() {
        return basicLayout;
    },
    json: function() {
        return jsonLayout;
    }
};
export default {
    basicLayout: basicLayout,
    jsonLayout: jsonLayout,
    addLayout: function(name, serializerGenerator) {
        layoutMakers[name] = serializerGenerator;
    },
    layout: function(name, config) {
        return layoutMakers[name] && layoutMakers[name](config);
    }
};
