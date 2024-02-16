import { stub } from 'https://deno.land/std@0.215.0/testing/mock.ts';

import { uint8ArrayOf } from '../util/arrays.ts';
import { UUIDv4 } from './UUIDv4.ts';
import { BearerToken, PassCode } from './BearerToken.ts';
import { assertEquals } from 'https://deno.land/std@0.215.0/assert/assert_equals.ts';

const UUID_STRING = '39862482-dac0-4a0f-82b0-41d00fb72cb0';

const PASS_CODE_BYTES = uint8ArrayOf<26>([
    0x02,
    0x57,
    0xab,
    0x25,
    0x6c,
    0x90,
    0x37,
    0x67,
    0xfe,
    0xdb,
    0x37,
    0x74,
    0xfd,
    0xcd,
    0x77,
    0x61,
    0xc8,
    0x55,
    0x5d,
    0xae,
    0xe6,
    0xfd,
    0xab,
    0xfc,
    0x74,
    0xbc,
]);

const TOKEN = 'Tl0_OYYkgtrASg+CsEHQD7cssAJXqyVskDdn/ts3dP3Nd2HIVV2u5v2r/HS8';

Deno.test('BearerToken.generate', () => {
    const stubUUIDv4_random = stub(UUIDv4, 'random', () => new UUIDv4(UUID_STRING));
    const stubPassCode_random = stub(PassCode, 'random', () => PassCode.forBytes(PASS_CODE_BYTES));
    try {
        const token = BearerToken.generate();
        assertEquals(token.toString(), TOKEN);
        assertEquals(BearerToken.forString(TOKEN), token);
    } finally {
        stubUUIDv4_random.restore();
        stubPassCode_random.restore();
    }
});
