const TIME_PATTERN = /^\s*([0-9]+)([A-Za-z]*)\s*$/;

/**
 * 時間の文字列表記をミリ秒単位での時間に変換する。
 * 文字列表記は整数量と単位となるアルファベットからなり、次の正規表現を満たす:
 * ```
 * /^\s*[0-9]+[A-Za-z]*\s*$/
 * ```
 * 数字と小数点、空白文字のみからなる文字列の場合、ミリ秒単位の時間として解釈される。
 * 単位が `s`, `m`, `h`, `d` の場合、それぞれ秒、分、時間、日単位の時間として解釈される。
 * これら以外の単位が付せられた場合、例外が発生する。
 * @param value 時間表記
 * @returns ミリ秒単位での時間
 */
export function parseTime(value: string): number {
    const matcher = TIME_PATTERN.exec(value);
    if (matcher == null) {
        throw new SyntaxError(`'${value} does not match the pattern ${TIME_PATTERN}`);
    }
    const num = Number.parseInt(matcher[1], 10);
    const unit = unitStringToTime(matcher[2]);
    return num * unit;
}

function unitStringToTime(unit: string): number {
    switch (unit) {
        case '':
            return 1;
        case 's':
            return 1000;
        case 'm':
            return 1000 * 60;
        case 'h':
            return 1000 * 60 * 60;
        case 'd':
            return 1000 * 60 * 60 * 24;
        default:
            throw new SyntaxError(`Unknown time unit ${unit}`);
    }
}
