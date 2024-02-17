import { assertThrows } from 'std/assert_throws';
import { assertEquals } from 'std/assert/assert_equals';

import { UserRecord } from './UserRecord.ts';
import { uint8ArrayOf } from '../util/arrays.ts';
import { PassCode } from './PassCode.ts';
import { hexStringToBuffer } from '../util/arrays.ts';

Deno.test('UserRecord', async (classTest) => {
    await classTest.step('Invalid prameter lengths', () => {
        assertThrows(() => new UserRecord(uint8ArrayOf(0), uint8ArrayOf(32)), RangeError);
        assertThrows(() => new UserRecord(uint8ArrayOf(32), uint8ArrayOf(0)), RangeError);
        assertThrows(() => new UserRecord(uint8ArrayOf(0), uint8ArrayOf(0)), RangeError);
    });

    await classTest.step('Testing pass codes', async () => {
        const salt = hexStringToBuffer('25c477d3a134deb92b273b6a104d3c563b90c22c11941f3d1f59a4cbf88eb7ae');
        const hash = hexStringToBuffer('fef2f31554df93e0326651cc065607a3299c748357675648445abd2a0a06b123');
        const record = new UserRecord(salt, hash);
        const correct = PassCode.forBytes(hexStringToBuffer('4eea2d2de26e8077feb6c46e68bd9c196903cb5ac0d1cbc08949'));
        const incorrect = PassCode.forBytes(hexStringToBuffer('4eea2d2de26e8077feb6c46e68bd9c196903cb5ac0d1cbc08940'));
        assertEquals(await record.test(correct), true);
        assertEquals(await record.test(incorrect), false);
    });
});
