import { assertEquals } from 'std/assert/assert_equals';
import { assertSpyCalls, stub } from 'std/testing/mock';
import { assertThrows } from 'std/assert_throws';

import { UUIDv4 } from './UUIDv4.ts';
import { uint8ArrayOf } from '../util/arrays.ts';
import { TokenError } from '../api/errors.ts';

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

Deno.test('UUIDv4', async (classTest) => {
    const stubUUIDv4_random = stub(UUIDv4, 'random', () => new UUIDv4(UUID_STRING));

    await classTest.step('constructor', () => {
        assertThrows(() => new UUIDv4('Not a v4 UUID'), TokenError);
    });

    await classTest.step('random', () => {
        const uuid = UUIDv4.random();
        assertEquals(uuid.toString(), UUID_STRING);
        const fromBytes = UUIDv4.fromUint8Array(UUID_BYTES);
        assertEquals(uuid, fromBytes);
        assertEquals(fromBytes.toUint8Array(), UUID_BYTES);
    });

    await classTest.step('fromUint8Array', () => {
        assertThrows(() => UUIDv4.fromUint8Array(uint8ArrayOf([0x12, 0x34])), RangeError);
    });

    assertSpyCalls(stubUUIDv4_random, 1);
    stubUUIDv4_random.restore();
});
