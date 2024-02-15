import { LinkRecord } from './LinkRecord.ts';
import { DataStorage } from './DataStorage.ts';
import { DB } from 'https://deno.land/x/sqlite@v3.8/mod.ts';
import { fromFileUrl } from 'https://deno.land/std@0.215.0/path/mod.ts';

export class SQLiteStorage implements DataStorage {
    private readonly database = new DB(fromFileUrl(new URL('../../../storage.db', import.meta.url)));

    public constructor() {
        this.database.execute(`CREATE TABLE IF NOT EXISTS links (
            id              TEXT PRIMARY KEY,
            destination     TEXT NOT NULL,
            expiration_time INTEGER NOT NULL,
            creation_date   INTEGER NOT NULL
        );`);
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

    close() {
        this.database.close();
        return Promise.resolve();
    }
}
