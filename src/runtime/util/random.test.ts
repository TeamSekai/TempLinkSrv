import { assertEquals } from 'std/assert/assert_equals';
import { assertThrows } from 'std/assert_throws';

import { randomUint8Array } from './random.ts';

Deno.test('randomReadonlyUint8Array', () => {
    assertEquals(randomUint8Array(4).length, 4);
    assertEquals(randomUint8Array(8).length, 8);
    assertEquals(randomUint8Array(0).length, 0);
    assertThrows(() => randomUint8Array(-1));
});
