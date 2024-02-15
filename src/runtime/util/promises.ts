export function synchronizedPromise<T>(func: () => T): Promise<T> {
    return new Promise((resolve, reject) => {
        try {
            resolve(func());
        } catch (e) {
            reject(e);
        }
    });
}
