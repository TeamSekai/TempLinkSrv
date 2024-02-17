export function testEach<T extends unknown[]>(
    ...table: T[]
): (name: string, fn: (t: Deno.TestContext, params: T) => void | Promise<void>) => void {
    return (name, fn) => {
        for (const params of table) {
            Deno.test(formatTestName(name, params), (t) => fn(t, params));
        }
    };
}

export function formatTestName<T extends unknown[]>(name: string, params: T) {
    let result = '';
    let afterDollar = false;
    for (const c of name) {
        if (afterDollar) {
            if (c == '$') {
                result += '$';
            } else if (/\d/.test(c)) {
                result += params[Number.parseInt(c)];
            } else {
                throw new SyntaxError(`'${c}' is not a number`);
            }
            afterDollar = false;
        } else {
            if (c == '$') {
                afterDollar = true;
            } else {
                result += c;
            }
        }
    }
    if (afterDollar) {
        throw new SyntaxError('Unexpected end of the name');
    }
    return result;
}
