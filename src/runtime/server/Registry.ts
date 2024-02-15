import { CONFIG } from '../../setup/index.ts';
import { randomCharacterSequence } from '../util/random.ts';
import { LinkRecord } from '../database/LinkRecord.ts';
import { DataStorage } from '../database/DataStorage.ts';
import { SQLiteStorage } from '../database/SQLiteStorage.ts';
import { Collector } from './Collector.ts';

/**
 * リンクの作成用クラス
 */
export class Registry {
    /**
     * このクラスの唯一のインスタンス。
     */
    public static readonly instance: Registry = new Registry();

    private readonly storage: DataStorage;

    private collector: Collector | null = null;

    private collectorPromise: Promise<Collector>;

    private constructor() {
        const storage = new SQLiteStorage();
        this.storage = storage;
        this.collectorPromise = Collector.forStorage(storage).then((collector) => this.collector = collector);
    }

    /**
     * 短縮リンクを作成する。作成に失敗した場合は null を返す。
     * @param destination リンク先
     * @param expirationTime リンクの有効期間
     * @returns 新たに作成されたリンク ID
     */
    public async createLink(destination: URL, expirationTime: number) {
        const record = new LinkRecord(destination, expirationTime, Date.now());
        const maxTrials = CONFIG.linkIdTrials;
        for (let i = 0; i < maxTrials; i++) {
            const id = randomCharacterSequence(CONFIG.linkIdCharacters, CONFIG.linkIdLength);
            const success = id != 'api' && await this.storage.insertLink(id, record);
            if (success) {
                this.collector?.addLink(id, record);
                return id;
            }
        }
        return null;
    }

    public getLinkById(id: string) {
        return this.collector?.getCachedLink(id) ?? this.storage.selectLinkById(id);
    }

    public async deleteLink(id: string) {
        const success = await this.collector?.timeout(id);
        return success ?? false;
    }

    public async close() {
        await Promise.all([
            this.storage.close(),
            this.collectorPromise.then((collector) => collector.end()),
        ]);
    }
}
