/**
 * リンクに関する情報。
 */
export class LinkRecord {
    /**
     * リンク先
     */
    public readonly destination: URL;

    /**
     * リンクの有効期間 (ミリ秒)
     */
    public readonly expirationTime: number;

    /**
     * リンクの作成時刻 (UNIX タイム)
     */
    public readonly creationDate: number;

    /**
     * リンクに関する情報をまとめる。
     * @param destination リンク先
     * @param expirationTime リンクの有効期間 (ミリ秒)
     * @param creationDate リンクの作成時刻 (UNIX タイム)
     */
    constructor(destination: URL, expirationTime: number, creationDate: number) {
        this.destination = destination;
        this.expirationTime = expirationTime;
        this.creationDate = creationDate;
    }

    /**
     * リンクの有効期限 (UNIX タイム)
     */
    public get expirationDate() {
        return this.creationDate + this.expirationTime;
    }

}
