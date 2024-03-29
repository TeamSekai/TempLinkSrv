import { assertEquals } from 'std/assert/assert_equals';

import { SQLiteStorage } from './SQLiteStorage.ts';
import { VolatileStorage } from './VolatileStorage.ts';
import { LinkRecord } from './LinkRecord.ts';
import { testEach } from '../../tests/tests.ts';
import { DataStorage } from './DataStorage.ts';
import { UUIDv4 } from '../authentication/UUIDv4.ts';
import { UserRecord } from '../authentication/UserRecord.ts';
import { randomUint8Array } from '../util/random.ts';

const DUMMY_USERS: readonly (readonly [UUIDv4, UserRecord])[] = new Array(3).fill(null).map(
    () => [UUIDv4.random(), new UserRecord(randomUint8Array(32), randomUint8Array(32))],
);

function setupStorage(storage: DataStorage) {
    storage.insertLink('abc', new LinkRecord(new URL('https://example.com/1'), 300000, 1708100000000));
    storage.insertLink('xyz', new LinkRecord(new URL('https://example.com/3'), 450000, 1708100002000));
    storage.insertLink('987', new LinkRecord(new URL('https://example.com/4'), 60000, 1708100060000));
    storage.insertLink('123', new LinkRecord(new URL('https://example.com/5'), 3600000, 1708100061000));
    storage.insertUser(...DUMMY_USERS[1]);
    storage.insertUser(...DUMMY_USERS[2]);
    return storage;
}

testEach<[string, () => DataStorage]>(
    ['VolatileStorage', () => new VolatileStorage()],
    ['SQLiteStorage', () => new SQLiteStorage(':memory:')],
)('$0', async (classTest, [_name, newStorage]) => {
    await classTest.step('The counts in an empty storage is 0', async () => {
        const storage = newStorage();
        try {
            assertEquals(await storage.linkCount(), 0);
            assertEquals(await storage.userCount(), 0);
        } finally {
            await storage.close();
        }
    });

    await classTest.step('Checking the counts', async () => {
        const storage = setupStorage(newStorage());
        try {
            assertEquals(await storage.linkCount(), 4);
            assertEquals(await storage.userCount(), 2);
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
            assertEquals(await storage.insertUser(...DUMMY_USERS[0]), true);
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
            assertEquals(await storage.insertUser(...DUMMY_USERS[1]), false);
            assertEquals(await storage.insertUser(...DUMMY_USERS[0]), true);
            assertEquals(await storage.insertUser(...DUMMY_USERS[0]), false);
        } finally {
            await storage.close();
        }
    });

    await classTest.step('Selecting from an empty storage should return null', async () => {
        const storage = newStorage();
        try {
            assertEquals(await storage.selectLinkById('00'), null);
            assertEquals(await storage.selectLinksByExpirationDate(1800000000000), new Map<string, LinkRecord>());
            assertEquals(await storage.selectUser(DUMMY_USERS[1][0]), null);
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
            assertEquals(await storage.selectUser(DUMMY_USERS[0][0]), null);
            assertEquals(await storage.selectUser(DUMMY_USERS[1][0]), DUMMY_USERS[1][1]);
        } finally {
            await storage.close();
        }
    });

    await classTest.step('Deleting from an empty storage should fail', async () => {
        const storage = newStorage();
        try {
            assertEquals(await storage.deleteLink('a1'), false);
            assertEquals(await storage.deleteUser(DUMMY_USERS[0][0]), false);
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
            assertEquals(await storage.deleteUser(DUMMY_USERS[0][0]), false);
            assertEquals(await storage.deleteUser(DUMMY_USERS[1][0]), true);
            assertEquals(await storage.deleteUser(DUMMY_USERS[1][0]), false);
        } finally {
            await storage.close();
        }
    });
});
