class InvalidPropertyError extends Error {
    static {
        InvalidPropertyError.prototype.name = 'InvalidPropertyError';
    }

    constructor(message: string | undefined) {
        super(message);
    }
}

function hasProperty<K extends string>(o: object, property: K): o is { [V in K]: unknown } {
    return property in o;
}

function requireProperty(o: object, property: string) {
    if (!hasProperty(o, property)) {
        throw new InvalidPropertyError(`The object must have a property '${property}'`);
    }
    const value = o[property];
    return value;
}

export function requireStringProperty(o: object, property: string) {
    const value = requireProperty(o, property);
    if (typeof value != 'string') {
        throw new InvalidPropertyError(`The property '${property}' must be a string`);
    }
    return value;
}

export function requireNumberProperty(o: object, property: string) {
    const value = requireProperty(o, property);
    if (typeof value != 'number') {
        throw new InvalidPropertyError(`The property '${property}' must be a number`);
    }
    return value;
}

export function requireBooleanProperty(o: object, property: string) {
    const value = requireProperty(o, property);
    if (typeof value != 'boolean') {
        throw new InvalidPropertyError(`The property '${property}' must be a boolean`);
    }
    return value;
}

export function requireStringArrayProperty(o: object, property: string) {
    const value = requireProperty(o, property);
    if (!isStringArray(value)) {
        throw new InvalidPropertyError(`The property '${property}' must be an array of strings`);
    }
    return value;
}

export function requireChoiceProperty<T>(
    o: object,
    property: string,
    choices: T[],
    equality = (a: unknown, b: T) => a === b,
) {
    const value = requireProperty(o, property);
    for (const choice of choices) {
        if (equality(value, choice)) {
            return choice;
        }
    }
    throw new InvalidPropertyError(`The property '${property}' must be one of ${choices.join(', ')}`);
}

function isStringArray(array: unknown): array is string[] {
    if (!(array instanceof Array)) {
        return false;
    }
    for (const element of array) {
        if (typeof element != 'string') {
            return false;
        }
    }
    return true;
}
