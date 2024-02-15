import { LinkRecord } from './LinkRecord.ts';

/**
 * データの格納先を表現するインターフェイス。
 */
export interface DataStorage {
    /**
     * リンクに関する情報を挿入する。
     * ID に対応したリンクが既に存在する場合は何もせず false を返す。
     * @param id リンク ID
     * @returns 挿入に成功した場合 true
     */
    insertLink(id: string, record: LinkRecord): Promise<boolean>;

    /**
     * リンクに関する情報を取得する。
     * リンクが存在しない場合は null を返す。
     * @param id リンク ID
     * @returns リンクに関する情報
     */
    selectLinkById(id: string): Promise<LinkRecord | null>;

    /**
     * 指定された有効期限が指定された値以下であるリンクの Map を返す。
     * 返される Map は変更可能だが、この Map の変更はデータの格納先に影響しない。
     * @param expirationDate 有効期限の上限
     * @return リンク ID とリンクの情報からなる Map
     */
    selectLinksByExpirationDate(expirationDate: number): Promise<Map<string, LinkRecord>>;

    /**
     * リンクに関する情報を削除する。
     * ID に対応したリンクが存在しない場合は何もせず false を返す。
     * @param id リンク ID
     * @returns 削除に成功した場合 true
     */
    deleteLink(id: string): Promise<boolean>;

    /**
     * 入出力を終了してデータの格納先を解放する。
     */
    close(): Promise<void>;
}
