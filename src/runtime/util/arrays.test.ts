import { assertEquals } from 'https://deno.land/std@0.215.0/assert/assert_equals.ts';
import { assertThrows } from 'https://deno.land/std@0.215.0/assert/assert_throws.ts';

import { bufferToHexString, hexStringToBuffer, isArrayEqual } from '../util/arrays.ts';

Deno.test('bufferToHexString', () => {
    const buffer = new Uint8Array([0x12, 0x34, 0x56, 0x78]);
    assertEquals(bufferToHexString(buffer, 0, 4), '12345678');
    assertEquals(bufferToHexString(buffer, 1, 4), '345678');
    assertEquals(bufferToHexString(buffer, 0, 3), '123456');
    assertEquals(bufferToHexString(buffer, 1, 3), '3456');
    assertThrows(() => bufferToHexString(buffer, 0, 5));
    assertThrows(() => bufferToHexString(buffer, -1, 3));
    assertThrows(() => bufferToHexString(buffer, 0, 2.5));
    assertThrows(() => bufferToHexString(buffer, 0.5, 3));
    assertThrows(() => bufferToHexString(buffer, 2, 1));
});

Deno.test('hexStringToBuffer', () => {
    const buffer1 = new Uint8Array(4);
    hexStringToBuffer('12345678', buffer1, 0);
    assertEquals(buffer1, new Uint8Array([0x12, 0x34, 0x56, 0x78]));

    const buffer2 = new Uint8Array(4);
    hexStringToBuffer('345678', buffer2, 1);
    assertEquals(buffer2, new Uint8Array([0x00, 0x34, 0x56, 0x78]));

    const buffer3 = new Uint8Array(4);
    hexStringToBuffer('123456', buffer3, 0);
    assertEquals(buffer3, new Uint8Array([0x12, 0x34, 0x56, 0x00]));

    const buffer4 = new Uint8Array(4);
    hexStringToBuffer('3456', buffer4, 1);
    assertEquals(buffer4, new Uint8Array([0x00, 0x34, 0x56, 0x00]));

    const buffer5 = new Uint8Array(4);
    assertThrows(() => hexStringToBuffer('12345', buffer5, 0));
});

Deno.test('isArrayEqual', () => {
    assertEquals(isArrayEqual([0], []), false);
    assertEquals(isArrayEqual([], [0]), false);
    assertEquals(isArrayEqual([0, 1], [0, 1, 2]), false);
    assertEquals(isArrayEqual([0, 1, 2], [0, 1]), false);
    assertEquals(isArrayEqual([0, 1, 2], [0, 1, 2]), true);
    assertEquals(isArrayEqual([], []), true);
    assertEquals(isArrayEqual([0, 1, 2, 3], [0, 1, -2, 3]), false);
});
