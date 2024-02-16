import { assertEquals } from 'https://deno.land/std@0.215.0/assert/assert_equals.ts';
import { randomUint8Array } from './random.ts';
import { assertThrows } from 'https://deno.land/std@0.215.0/assert/assert_throws.ts';

Deno.test('randomReadonlyUint8Array', () => {
    assertEquals(randomUint8Array(4).length, 4);
    assertEquals(randomUint8Array(8).length, 8);
    assertEquals(randomUint8Array(0).length, 0);
    assertThrows(() => randomUint8Array(-1));
});
