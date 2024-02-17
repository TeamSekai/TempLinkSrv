import { UUIDv4 } from '../api/UUIDv4.ts';
import { DataStorage } from './DataStorage.ts';
import { LinkRecord } from './LinkRecord.ts';
import { UserRecord } from './UserRecord.ts';

export class VolatileStorage implements DataStorage {
    private readonly linkTable = new Map<string, LinkRecord>();

    private readonly userTable = new Map<string, UserRecord>();

    public constructor() {}

    public linkCount() {
        return Promise.resolve(this.linkTable.size);
    }

    public insertLink(id: string, record: LinkRecord) {
        const linkTable = this.linkTable;
        if (linkTable.has(id)) {
            return Promise.resolve(false);
        }
        linkTable.set(id, record);
        return Promise.resolve(true);
    }

    public selectLinkById(id: string) {
        return Promise.resolve(this.linkTable.get(id) ?? null);
    }

    public selectLinksByExpirationDate(expirationDate: number) {
        const result = new Map<string, LinkRecord>();
        for (const [id, record] of this.linkTable) {
            if (record.expirationDate <= expirationDate) {
                result.set(id, record);
            }
        }
        return Promise.resolve(result);
    }

    public deleteLink(id: string) {
        const linkTable = this.linkTable;
        if (!linkTable.has(id)) {
            return Promise.resolve(false);
        }
        linkTable.delete(id);
        return Promise.resolve(true);
    }

    public userCount(): Promise<number> {
        return Promise.resolve(this.userTable.size);
    }

    public insertUser(id: UUIDv4, record: UserRecord): Promise<boolean> {
        const userTable = this.userTable;
        if (userTable.has(id.toString())) {
            return Promise.resolve(false);
        }
        userTable.set(id.toString(), record);
        return Promise.resolve(true);
    }

    public selectUser(id: UUIDv4): Promise<UserRecord | null> {
        return Promise.resolve(this.userTable.get(id.toString()) ?? null);
    }

    public deleteUser(id: UUIDv4): Promise<boolean> {
        const userTable = this.userTable;
        if (!userTable.has(id.toString())) {
            return Promise.resolve(false);
        }
        userTable.delete(id.toString());
        return Promise.resolve(true);
    }

    public close() {
        return Promise.resolve();
    }
}
