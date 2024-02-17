import { assertEquals } from 'std/assert/assert_equals';
import { LinkRecord } from './LinkRecord.ts';

Deno.test('LinkRecord', async (classTest) => {
    await classTest.step('expirationDate', () => {
        const linkRecord = new LinkRecord(new URL('https://example.com/'), 300000, 1708100000000);
        assertEquals(linkRecord.expirationDate, 1708100300000);
    });
});
