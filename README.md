# TempLinkSrv

指定した期間だけ有効な短縮リンクを作成する Web サーバー。

## Usage

1. このリポジトリをクローンして設定ファイルを生成します。
   ```sh
   $ git clone https://github.com/takejohn/TempLinkSrv.git
   $ cd TempLinkSrv
   $ deno task setup
   ```
2. 設定ファイルを編集します。
3. サーバーを起動します。
   ```sh
   $ deno task start
   ```
4. Bearer トークンを生成します。表示されたトークンは REST API に使うために保存します。
   ```
   > token-create
   ```
5. サーバーを停止します。
   ```
   > stop
   ```
6. 再度サーバーを起動するには 3. と同じコマンドを用いるか、
   ```sh
   $ deno task start
   ```
   pm2 がインストールされている場合は次のコマンドを用います。
   ```sh
   $ deno task pm2
   ```

## REST API

このサーバーにおける REST API の仕様です。\
使用するには Bearer トークンによる認証が必要です。\
リクエスト、レスポンスの内容はともに `application/json` 形式です。

HTTP リクエストの例:

```http
POST /api/links HTTP/1.1
Host: link.example.com
User-Agent: curl/7.87.0
Accept: */*
Authorization: Bearer Tl0_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Content-Type: application/json
Content-Length: 63

{"destination":"https://example.com/","expiration_time":300000}
```

HTTP レスポンスの例:

```http
HTTP/1.1 201 Created
Server: nginx/1.24.0
Date: Mon, 19 Feb 2024 13:08:09 GMT
Content-Type: application/json
Content-Length: 224
Connection: keep-alive
content-location: /api/links/xxxxx
vary: Accept-Encoding

{"api_version":1,"ok":{"type":"link_resource","link":"https://link.example.com/xxxxx","id":"xxxxx","destination":"https://example.com/","expiration_time":300000,"creation_date":1708348089644,"expiration_date":1708348389644}}
```

### `links` リソース

#### POST メソッド

リンクを作成します。

エンドポイント:

```
/api/links
```

リクエスト:

- リクエストの JSON の内容:
  - 次のプロパティをもつオブジェクト
    - 文字列 `destination`: リンク先の URL
    - 数値 `expiration_time`: リンクの有効期間 (ミリ秒単位)

レスポンス:

- ステータスコード: 201 Created
- レスポンスの JSON の内容:
  - 以下のプロパティをもつオブジェクト
    - 数値 `api_version`: API のバージョン
    - 以下のプロパティをもつオブジェクト `ok`
      - 文字列 `type`: `"link_resource"`
      - 文字列 `link`: リンクの URL
      - 文字列 `id`: リンク ID
      - 文字列 `destination`: リンク先の URL
      - 数値 `expiration_time` リンクの有効期間 (ミリ秒単位)
      - 数値 `creation_date` リンクの作成日時 (UNIX タイムスタンプ)
      - 数値 `expiration_date` リンクの有効期限 (UNIX タイムスタンプ)

#### GET メソッド

リンクの情報を取得します。

エンドポイント:

```
/api/links/:linkID
```

`:linkID` はリンク ID に置き換えます。

レスポンス:

- ステータスコード: 200 OK
- レスポンスの JSON の内容:
  - 以下のプロパティをもつオブジェクト
    - 数値 `api_version`: API のバージョン
    - 以下のプロパティをもつオブジェクト `ok`: リンク ID に対応するリンクが見つかった場合
      - 文字列 `type`: `"link_resource"`
      - 文字列 `link`: リンクの URL
      - 文字列 `id`: リンク ID
      - 文字列 `destination`: リンク先の URL
      - 数値 `expiration_time` リンクの有効期間 (ミリ秒単位)
      - 数値 `creation_date` リンクの作成日時 (UNIX タイムスタンプ)
      - 数値 `expiration_date` リンクの有効期限 (UNIX タイムスタンプ)
    - null値 `ok`: リンク ID に対応するリンクが見つからない場合

#### DELETE メソッド

リンクを削除します。

エンドポイント:

```
/api/links/:linkID
```

`:linkID` はリンク ID に置き換えます。

レスポンス:

- ステータスコード: 200 OK
- レスポンスの JSON の内容:
  - 以下のプロパティをもつオブジェクト
    - 数値 `api_version`: API のバージョン
    - null値 `ok`

### 全リソース・メソッド共通

リクエスト内容に誤りが含まれる場合、以下を返します。

- ステータスコード -- 400 Bad Request
- レスポンスの JSON の内容:
  - 以下のプロパティをもつオブジェクト
    - 数値 `api_version`: API のバージョン
    - 以下のプロパティをもつオブジェクト `error`
      - 文字列 `type`: `"error"`
      - 文字列 `description`: エラーの説明

サーバーで予期しないエラーが起きた場合、以下を返します。

- ステータスコード -- 500 Internal Server Error
- レスポンスの JSON の内容:
  - 以下のプロパティをもつオブジェクト
    - 数値 `api_version`: API のバージョン
    - 以下のプロパティをもつオブジェクト `error`
      - 文字列 `type`: `"error"`
      - 文字列 `description`: エラーの説明

## License

このプログラムは [GNU General Public License Version 3](/LICENSE) の下で配布されています。
