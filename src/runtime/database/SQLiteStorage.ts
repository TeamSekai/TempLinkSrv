import { LinkRecord } from './LinkRecord.ts';
import { DataStorage } from './DataStorage.ts';
import { DB } from 'https://deno.land/x/sqlite@v3.8/mod.ts';
import { fromFileUrl } from 'https://deno.land/std@0.215.0/path/mod.ts';
import { synchronizedPromise } from '../util/promises.ts';

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

    insertLink = (id: string, record: LinkRecord) => {
        return synchronizedPromise(() => {
            if (this.database.query('SELECT id FROM links WHERE id = ?;', [id]).length != 0) {
                return false;
            }
            this.database.query('INSERT INTO links VALUES (?, ?, ?, ?);', [
                id,
                record.destination.toString(),
                record.expirationTime,
                record.creationDate,
            ]);
            return true;
        });
    };

    selectLinkById = (id: string) => {
        return synchronizedPromise(() => {
            const result = this.database.query<[string, number, number]>(
                'SELECT destination, expiration_time, creation_date FROM links WHERE id = ?;',
                [id],
            );
            if (result.length == 0) {
                return null;
            }
            const [destination, expirationTime, creationDate] = result[0];
            return new LinkRecord(new URL(destination), expirationTime, creationDate);
        });
    };

    selectLinksByExpirationDate = (expirationDate: number) => {
        return synchronizedPromise(() => {
            const result = this.database.query<[string, string, number, number]>(
                'SELECT id, destination, expiration_time, creation_date FROM links WHERE creation_date + expiration_time <= ?',
                [expirationDate],
            );
            const map = new Map<string, LinkRecord>();
            for (const [id, destination, expirationTime, creationDate] of result) {
                map.set(id, new LinkRecord(new URL(destination), expirationTime, creationDate));
            }
            return map;
        });
    };

    deleteLink = (id: string) => {
        return synchronizedPromise(() => {
            if (this.database.query('SELECT id FROM links WHERE id = ?;', [id]).length == 0) {
                return false;
            }
            this.database.query('DELETE FROM links WHERE id = ?;', [id]);
            return true;
        });
    };

    close = () => {
        return synchronizedPromise(() => this.database.close(true));
    };
}
