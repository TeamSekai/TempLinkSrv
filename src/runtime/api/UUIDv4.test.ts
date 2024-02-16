import { assertEquals } from 'https://deno.land/std@0.215.0/assert/assert_equals.ts';
import { assertSpyCalls, stub } from 'https://deno.land/std@0.215.0/testing/mock.ts';

import { UUIDv4 } from './UUIDv4.ts';
import { uint8ArrayOf } from '../util/arrays.ts';

const UUID_STRING = 'd0ceede6-6fd0-44dd-94ce-5486fcec615a';
const UUID_BYTES = uint8ArrayOf<16>([
    0xd0,
    0xce,
    0xed,
    0xe6,
    0x6f,
    0xd0,
    0x44,
    0xdd,
    0x94,
    0xce,
    0x54,
    0x86,
    0xfc,
    0xec,
    0x61,
    0x5a,
]);

Deno.test('UUIDv4 conversion', () => {
    const stubUUIDv4_random = stub(UUIDv4, 'random', () => new UUIDv4(UUID_STRING));
    try {
        const uuid = UUIDv4.random();
        assertEquals(uuid.toString(), UUID_STRING);
        const fromBytes = UUIDv4.fromUint8Array(UUID_BYTES);
        assertEquals(uuid, fromBytes);
        assertEquals(fromBytes.toUint8Array(), UUID_BYTES);
        assertSpyCalls(stubUUIDv4_random, 1);
    } finally {
        stubUUIDv4_random.restore();
    }
});
