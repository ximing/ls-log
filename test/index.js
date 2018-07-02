/**
 * Created by ximing on 2018/7/2.
 */
'use strict';
import test from 'ava';
import log, { getLogger } from '../src/index';
test('getLogger', (t) => {
    t.is(log.getLogger().category, 'default');
});
