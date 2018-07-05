/**
 * Created by ximing on 2018/7/2.
 */
'use strict';
import basicLayout from './basic';
import jsonLayout from './json';
import wxLayout from './wx';
const layoutMakers = {
    basic: function() {
        return basicLayout;
    },
    json: function() {
        return jsonLayout;
    },
    wx: function() {
        return wxLayout;
    }
};
export default {
    basicLayout: basicLayout,
    jsonLayout: jsonLayout,
    wxLayout: wxLayout,
    addLayout: function(name, serializerGenerator) {
        layoutMakers[name] = serializerGenerator;
    },
    layout: function(name, config) {
        return layoutMakers[name] && layoutMakers[name](config);
    }
};
