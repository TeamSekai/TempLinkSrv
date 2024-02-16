function repeatedStartChars(s: string, character: string) {
    const length = s.length;
    for (let result = 0; result < length; result++) {
        if (s.charAt(result) != character) {
            return result;
        }
    }
    return length;
}

/**
 * 文字列のインデントを解除する。
 * @param s 文字列
 * @param indentChar インデントの文字
 * @returns インデントが解除された文字列
 */
export function dedent(s: string, indentChar = ' ') {
    const lines = s.split(/\n|\r/g);
    const minDepth = lines
        .map((line) => {
            const depth = repeatedStartChars(line, indentChar);
            return depth != line.length ? depth : Number.MAX_VALUE;
        })
        .reduce((a, b) => a < b ? a : b);
    return lines.map((line) => line.substring(minDepth)).join('\n');
}

/**
 * 文字列の中で正規表現に一致する文字だけを取り出した文字列を返す。
 * @param s 文字列
 * @param regexp 文字を検査する正規表現
 */
export function filterCharacters(s: string, regexp: RegExp): string {
    let result = '';
    for (const c of s) {
        if (regexp.test(c)) {
            result += c;
        }
    }
    return result;
}
