export type Converter = (value: string) => string;

export type Modifier = string | Converter;

export type RecursiveStringcase = (value: object, path: string, queryContext?: unknown) => boolean;

export type KeyConverter = (value: unknown, path: string, queryContext?: unknown) => unknown;

export type WrapIdentifier = (value: string, origImpl: Converter, queryContext?: unknown) => string;

export type PostProcessResponse = (result: unknown, queryContext?: unknown) => unknown;

export type AppWrapIdentifier = (value: string, queryContext?: unknown) => string;

export type AppPostProcessResponse = (result: unknown, queryContext?: unknown) => unknown;

type ExcludedKeys =
    | 'appWrapIdentifier'
    | 'appPostProcessResponse'
    | 'appStringcase'
    | 'stringcase'
    | 'recursiveStringcase';

export type KnexOptions<T> = Omit<T, ExcludedKeys> & {
    wrapIdentifier: WrapIdentifier;
    postProcessResponse: PostProcessResponse;
};

export interface KnexStringcaseOptions {
    [key: string]: unknown;
    appWrapIdentifier?: AppWrapIdentifier;
    appPostProcessResponse?: AppPostProcessResponse;
    appStringcase?: Modifier | Modifier[];
    stringcase?: Modifier | Modifier[];
    recursiveStringcase?: RecursiveStringcase;
    wrapIdentifier?: WrapIdentifier;
    postProcessResponse?: PostProcessResponse;
}
