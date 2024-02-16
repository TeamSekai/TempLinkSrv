import { DataStorage } from './DataStorage.ts';
import { LinkRecord } from './LinkRecord.ts';

export class VolatileStorage implements DataStorage {
    private readonly linkTable = new Map<string, LinkRecord>();

    public constructor() {}

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

    public close() {
        return Promise.resolve();
    }
}
