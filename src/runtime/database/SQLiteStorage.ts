import { DB } from 'https://deno.land/x/sqlite@v3.8/mod.ts';

import { LinkRecord } from './LinkRecord.ts';
import { DataStorage } from './DataStorage.ts';
import { UUIDv4 } from '../authentication/UUIDv4.ts';
import { UserRecord } from '../authentication/UserRecord.ts';

export class SQLiteStorage implements DataStorage {
    private readonly database: DB;

    public constructor(path: string) {
        this.database = new DB(path);
        this.database.execute(`
            CREATE TABLE IF NOT EXISTS links (
                id              TEXT PRIMARY KEY,
                destination     TEXT NOT NULL,
                expiration_time INTEGER NOT NULL,
                creation_date   INTEGER NOT NULL
            );
        `);
        this.database.execute(`
            CREATE TABLE IF NOT EXISTS users (
                user_id TEXT PRIMARY KEY,
                salt    BLOB,
                hash    BLOB
            );
        `);
    }

    linkCount() {
        const result = this.database.query<[number]>('SELECT COUNT(id) FROM links;');
        return Promise.resolve(result[0][0]);
    }

    insertLink(id: string, record: LinkRecord) {
        if (this.database.query('SELECT id FROM links WHERE id = ?;', [id]).length != 0) {
            return Promise.resolve(false);
        }
        this.database.query('INSERT INTO links VALUES (?, ?, ?, ?);', [
            id,
            record.destination.toString(),
            record.expirationTime,
            record.creationDate,
        ]);
        return Promise.resolve(true);
    }

    selectLinkById(id: string) {
        const result = this.database.query<[string, number, number]>(
            'SELECT destination, expiration_time, creation_date FROM links WHERE id = ?;',
            [id],
        );
        if (result.length == 0) {
            return Promise.resolve(null);
        }
        const [destination, expirationTime, creationDate] = result[0];
        return Promise.resolve(new LinkRecord(new URL(destination), expirationTime, creationDate));
    }

    selectLinksByExpirationDate(expirationDate: number) {
        const result = this.database.query<[string, string, number, number]>(
            'SELECT id, destination, expiration_time, creation_date FROM links WHERE creation_date + expiration_time <= ?',
            [expirationDate],
        );
        const map = new Map<string, LinkRecord>();
        for (const [id, destination, expirationTime, creationDate] of result) {
            map.set(id, new LinkRecord(new URL(destination), expirationTime, creationDate));
        }
        return Promise.resolve(map);
    }

    deleteLink(id: string) {
        if (this.database.query('SELECT id FROM links WHERE id = ?;', [id]).length == 0) {
            return Promise.resolve(false);
        }
        this.database.query('DELETE FROM links WHERE id = ?;', [id]);
        return Promise.resolve(true);
    }

    userCount(): Promise<number> {
        const result = this.database.query<[number]>('SELECT COUNT(user_id) FROM users;');
        return Promise.resolve(result[0][0]);
    }

    insertUser(id: UUIDv4, record: UserRecord): Promise<boolean> {
        if (this.database.query('SELECT user_id FROM users WHERE user_id = ?;', [id.toString()]).length != 0) {
            return Promise.resolve(false);
        }
        this.database.query('INSERT INTO users VALUES (?, ?, ?);', [
            id.toString(),
            record.salt.slice(),
            record.hash.slice(),
        ]);
        return Promise.resolve(true);
    }

    selectUser(id: UUIDv4): Promise<UserRecord | null> {
        const result = this.database.query<[Uint8Array, Uint8Array]>(
            'SELECT salt, hash FROM users WHERE user_id = ?;',
            [id.toString()],
        );
        if (result.length == 0) {
            return Promise.resolve(null);
        }
        const [salt, hash] = result[0];
        return Promise.resolve(new UserRecord(salt, hash));
    }

    deleteUser(id: UUIDv4): Promise<boolean> {
        if (this.database.query('SELECT user_id FROM users WHERE user_id = ?;', [id.toString()]).length == 0) {
            return Promise.resolve(false);
        }
        this.database.query('DELETE FROM users WHERE user_id = ?;', [id.toString()]);
        return Promise.resolve(true);
    }

    close() {
        this.database.close();
        return Promise.resolve();
    }
}
