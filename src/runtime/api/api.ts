const API_VERSION = 1;

export interface ResponseBody {
    api_version: number;
}

export interface OkResponse extends ResponseBody {
    ok: ResponseValue | null;
}

export interface ErrorResponse extends ResponseBody {
    error: ErrorValue;
}

export interface ResponseValue {
    type: string;
}

export interface ErrorValue extends ResponseValue {
    description: string;
}

export function resultOk(value: ResponseValue | null): OkResponse {
    return {
        api_version: API_VERSION,
        ok: value,
    };
}

export function resultError(value: ErrorValue): ErrorResponse {
    return {
        api_version: API_VERSION,
        error: value,
    };
}
