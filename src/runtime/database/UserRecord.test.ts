import { assertThrows } from 'https://deno.land/std@0.215.0/assert/assert_throws.ts';

import { UserRecord } from './UserRecord.ts';
import { uint8ArrayOf } from '../util/arrays.ts';

Deno.test('UserRecord', () => {
    assertThrows(() => new UserRecord(uint8ArrayOf([]), uint8ArrayOf([])), RangeError);
});
