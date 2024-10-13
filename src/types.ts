export type Converter = (input: string) => string;

export type Modifier = string | Converter;

export type Recursive = (value: Record<string, unknown>, path: string, queryContext?: unknown) => boolean;

export type KeyConverter = (value: unknown, path: string, queryContext?: unknown) => unknown;

export type WrapIdentifier = (value: string, origImpl: (value: string) => string, queryContext?: unknown) => string;

export type PostProcessResponse = (result: unknown, queryContext?: unknown) => unknown;

export type AppWrapIdentifier = (value: string, queryContext?: unknown) => string;

export type AppPostProcessResponse = (result: unknown, queryContext?: unknown) => unknown;

export interface KnexStringcaseConfig {
    [key: string]: unknown;
    appWrapIdentifier?: AppWrapIdentifier;
    appPostProcessResponse?: AppPostProcessResponse;
    appStringcase?: Modifier | Modifier[];
    stringcase?: Modifier | Modifier[];
    recursiveStringcase?: Recursive;
    wrapIdentifier?: WrapIdentifier;
    postProcessResponse?: PostProcessResponse;
}

export interface KnexOptions {
    wrapIdentifier: WrapIdentifier;
    postProcessResponse: PostProcessResponse;
}
