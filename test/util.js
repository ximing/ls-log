/**
 * Created by ximing on 2018/7/2.
 */
'use strict';
import test from 'ava';
import { format } from '../src/util';
test('util format', (t) => {
    t.is(format([1, 2, 3]), '[ 1, 2, 3 ]');
});
test('util format', (t) => {
    t.is(format({ a: 1, b: 's' }), "{ a: 1, b: 's' }");
});
