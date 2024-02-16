import { assertEquals } from 'https://deno.land/std@0.215.0/assert/assert_equals.ts';
import { LinkRecord } from './LinkRecord.ts';

Deno.test('LinkRecord', async (classTest) => {
    await classTest.step('expirationDate', () => {
        const linkRecord = new LinkRecord(new URL('https://example.com/'), 300000, 1708100000000);
        assertEquals(linkRecord.expirationDate, 1708100300000);
    });
});
