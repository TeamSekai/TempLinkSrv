/**
 * 指定した区間内のランダムな整数を返す。
 * @param min 最小値
 * @param max 最大値
 * @returns `min` 以上 `max` 以下のランダムな整数
 */
export function randomInteger(min: number, max: number) {
    return Math.floor(min + Math.random() * (max - min));
}

/**
 * 指定された文字を用いてランダムな文字列を生成する。
 * @param characters 用いる文字
 * @param length 文字列の長さ
 */
export function randomCharacterSequence(characters: string, length: number) {
    const characterCount = characters.length;
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(randomInteger(0, characterCount));
    }
    return result;
}
