import { DataStorage } from '../database/DataStorage.ts';
import { LinkRecord } from '../database/LinkRecord.ts';
import { ServerConsole } from './ServerConsole.ts';

/** 有効期限までの時間がこれ以下であるリンクはキャッシュされる */
const CACHED_EXPIRATION_TIME = 1000 * 60 * 60;  // 60 分間

/** キャッシュを更新する頻度 */
const CACHE_INTERVAL = 1000 * 60 * 30;  // 30 分間

/**
 * 指定の時刻にリンクを削除するクラス。
 */
export class Collector {
    private readonly storage: DataStorage;

    private cache: Map<string, LinkRecord>;

    /** リンク ID と timeoutID の対応 */
    private timeouts = new Map<string, number>();

    private readonly updateIntervalId: number;

    private constructor(storage: DataStorage, initialCache: Map<string, LinkRecord>) {
        this.storage = storage;
        this.cache = initialCache;
        this.updateIntervalId = setInterval(() => this.updateCache(), CACHE_INTERVAL);
        this.updateTimeouts();
    }

    public static async forStorage(storage: DataStorage) {
        const initialCache = await Collector.createCache(storage);
        return new Collector(storage, initialCache);
    }

    public addLink(id: string, linkRecord: LinkRecord) {
        if (this.timeouts.has(id)) {
            return;
        }
        const delay = linkRecord.expirationDate - Date.now();
        if (delay > CACHED_EXPIRATION_TIME) {
            return;
        }
        const timeoutId = setTimeout(() => this.timeout(id), delay);
        this.timeouts.set(id, timeoutId);
    }

    public end() {
        clearInterval(this.updateIntervalId);
        for (const timeoutId of this.timeouts.values()) {
            clearTimeout(timeoutId);
        }
    }

    private static async createCache(storage: DataStorage) {
        const result = await storage.selectLinksByExpirationDate(Date.now() + CACHED_EXPIRATION_TIME);
        await ServerConsole.instance.log(`Links cached: ${result.size}`);
        return result;
    }

    private updateTimeouts() {
        this.cache.forEach((linkRecord, id) => this.addLink(id, linkRecord));
    }

    private async updateCache() {
        this.cache = await Collector.createCache(this.storage)
        this.updateTimeouts();
    }

    public async timeout(id: string) {
        this.timeouts.delete(id);
        const success = await this.storage.deleteLink(id);
        if (!success) {
            return false;
        }
        await ServerConsole.instance.log(`Link '${id}' has expired`);
        this.cache.delete(id);
        this.timeouts.delete(id);
        return true;
    }

}
