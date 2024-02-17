import { assertEquals } from 'https://deno.land/std@0.215.0/assert/assert_equals.ts';

import { SQLiteStorage } from './SQLiteStorage.ts';
import { VolatileStorage } from './VolatileStorage.ts';
import { LinkRecord } from './LinkRecord.ts';
import { testEach } from '../../tests/tests.ts';
import { DataStorage } from './DataStorage.ts';

function setupStorage(storage: DataStorage) {
    storage.insertLink('abc', new LinkRecord(new URL('https://example.com/1'), 300000, 1708100000000));
    storage.insertLink('xyz', new LinkRecord(new URL('https://example.com/3'), 450000, 1708100002000));
    storage.insertLink('987', new LinkRecord(new URL('https://example.com/4'), 60000, 1708100060000));
    storage.insertLink('123', new LinkRecord(new URL('https://example.com/5'), 3600000, 1708100061000));
    return storage;
}

testEach<[string, () => DataStorage]>(
    ['VolatileStorage', () => new VolatileStorage()],
    ['SQLiteStorage', () => new SQLiteStorage(':memory:')],
)('$0', async (classTest, [_name, newStorage]) => {
    await classTest.step('The link count of an empty storage is 0', async () => {
        const storage = newStorage();
        try {
            assertEquals(await storage.linkCount(), 0);
        } finally {
            await storage.close();
        }
    });

    await classTest.step('Checking the link count', async () => {
        const storage = setupStorage(newStorage());
        try {
            assertEquals(await storage.linkCount(), 4);
        } finally {
            await storage.close();
        }
    });

    await classTest.step('Inserting to an empty storage should succeed', async () => {
        const storage = newStorage();
        try {
            assertEquals(
                await storage.insertLink('0', new LinkRecord(new URL('https://example.com/0'), 300000, 1708100000000)),
                true,
            );
        } finally {
            await storage.close();
        }
    });

    await classTest.step('Attempt to insert to a storage', async () => {
        const storage = setupStorage(newStorage());
        try {
            const linkRecord = new LinkRecord(new URL('https://example.com/2'), 600000, 1708100001000);
            assertEquals(await storage.insertLink('abc', linkRecord), false);
            assertEquals(await storage.insertLink('-42', linkRecord), true);
            assertEquals(await storage.insertLink('-42', linkRecord), false);
        } finally {
            await storage.close();
        }
    });

    await classTest.step('Selecting from an empty storage should return null', async () => {
        const storage = newStorage();
        try {
            assertEquals(await storage.selectLinkById('00'), null);
            assertEquals(await storage.selectLinksByExpirationDate(1800000000000), new Map<string, LinkRecord>());
        } finally {
            await storage.close();
        }
    });

    await classTest.step('Selecting from storage', async () => {
        const storage = setupStorage(newStorage());
        try {
            assertEquals(
                await storage.selectLinkById('abc'),
                new LinkRecord(new URL('https://example.com/1'), 300000, 1708100000000),
            );
            assertEquals(
                await storage.selectLinkById('xyz'),
                new LinkRecord(new URL('https://example.com/3'), 450000, 1708100002000),
            );
            assertEquals(
                await storage.selectLinkById('987'),
                new LinkRecord(new URL('https://example.com/4'), 60000, 1708100060000),
            );
            assertEquals(
                await storage.selectLinkById('123'),
                new LinkRecord(new URL('https://example.com/5'), 3600000, 1708100061000),
            );
            assertEquals(
                await storage.selectLinksByExpirationDate(1708101800000),
                new Map([
                    ['abc', new LinkRecord(new URL('https://example.com/1'), 300000, 1708100000000)],
                    ['xyz', new LinkRecord(new URL('https://example.com/3'), 450000, 1708100002000)],
                    ['987', new LinkRecord(new URL('https://example.com/4'), 60000, 1708100060000)],
                ]),
            );
        } finally {
            await storage.close();
        }
    });

    await classTest.step('Deleting from an empty storage should fail', async () => {
        const storage = newStorage();
        try {
            assertEquals(await storage.deleteLink('a1'), false);
        } finally {
            await storage.close();
        }
    });

    await classTest.step('Deleting from a storage', async () => {
        const storage = setupStorage(newStorage());
        try {
            assertEquals(await storage.deleteLink('360'), false);
            assertEquals(await storage.deleteLink('abc'), true);
            assertEquals(await storage.deleteLink('abc'), false);
        } finally {
            await storage.close();
        }
    });
});
