import { fromFileUrl } from 'https://deno.land/std@0.215.0/path/mod.ts';

import { CONFIG } from '../../setup/index.ts';
import { randomCharacterSequence } from '../util/random.ts';
import { LinkRecord } from '../database/LinkRecord.ts';
import { DataStorage } from '../database/DataStorage.ts';
import { SQLiteStorage } from '../database/SQLiteStorage.ts';
import { VolatileStorage } from '../database/VolatileStorage.ts';
import { Collector } from './Collector.ts';
import { filterCharacters } from '../util/strings.ts';

const LINK_ID_CHARACTERS = filterCharacters(CONFIG.linkIdCharacters, /[A-Z0-9\-._~]/);

function getStorage(): DataStorage {
    switch (CONFIG.databaseType) {
        case 'sqlite':
            return new SQLiteStorage(fromFileUrl(new URL('../../../storage.db', import.meta.url)));
        case 'volatile':
            return new VolatileStorage();
    }
}

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
        const storage = getStorage();
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
        if (CONFIG.linkIdCharacters == '') {
            throw new RangeError('linkIdCharacters must not be an empty string');
        }
        const record = new LinkRecord(destination, expirationTime, Date.now());
        const maxTrials = CONFIG.linkIdTrials;
        for (let i = 0; i < maxTrials; i++) {
            const id = randomCharacterSequence(LINK_ID_CHARACTERS, CONFIG.linkIdLength);
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
