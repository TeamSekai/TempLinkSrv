import { CONFIG } from '../../setup/index.ts';
import { randomCharacterSequence } from '../util/random.ts';
import { LinkRecord } from '../database/LinkRecord.ts';
import { DataStorage } from '../database/DataStorage.ts';
import { SQLiteStorage } from '../database/SQLiteStorage.ts';

/**
 * リンクの作成用クラス
 */
export class Registry {
    /**
     * このクラスの唯一のインスタンス。
     */
    public static readonly instance: Registry = new Registry();

    private readonly storage: DataStorage = new SQLiteStorage();

    private constructor() {}

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
            const success = await this.storage.insertLink(id, record);
            if (success) {
                return id;
            }
        }
        return null;
    }

    public async close() {
        await this.storage.close();
    }
}
