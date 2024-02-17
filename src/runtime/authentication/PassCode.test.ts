import { PassCode } from './PassCode.ts';
import { bufferToHexString, hexStringToBuffer } from '../util/arrays.ts';
import { assertEquals } from 'https://deno.land/std@0.215.0/assert/assert_equals.ts';
import { assertRejects } from 'https://deno.land/std@0.215.0/assert/assert_rejects.ts';

Deno.test('PassCode', async classTest => {
    await classTest.step('hash', async () => {
        const passCode = PassCode.forBytes(hexStringToBuffer('4eea2d2de26e8077feb6c46e68bd9c196903cb5ac0d1cbc08949'));
        const invalidSalt = hexStringToBuffer('25c477d3a134deb92b273b6a104d3c563b90c22c11941f3d1f59');
        assertRejects(async () => await passCode.hash(invalidSalt), RangeError);
        const salt = hexStringToBuffer('25c477d3a134deb92b273b6a104d3c563b90c22c11941f3d1f59a4cbf88eb7ae');
        const result = await passCode.hash(salt)
        assertEquals(bufferToHexString(result), 'fef2f31554df93e0326651cc065607a3299c748357675648445abd2a0a06b123')
    });
});
