import { Converter, KeyConverter, Recursive } from './types';

// String converter for keys of an object

export default function keyConverterFactory (converter: Converter, recursive?: Recursive): KeyConverter {
    return function keyConverter (value, path, queryContext): unknown {
        if (isRaw(recursive, value, path, queryContext)) {
            return value;
        }
        if (Array.isArray(value)) {
            return value.map(item => keyConverter(item, path, queryContext));
        }

        const input = value as Record<string, unknown>;
        const output: Record<string, unknown> = {};

        for (const key of Object.keys(input)) {
            const newKey = converter(key);
            output[newKey] = keyConverter(input[key], `${path}.${key}`, queryContext);
        }

        return output;
    };
}

// Value remains unchanged

function isRaw (recursive: Recursive | undefined, value: unknown, path: string, queryContext: unknown): boolean {
    if (typeof value !== 'object' || value === null) return true;
    if (value instanceof Date) return true;
    if (path === 'root') return false;
    if (typeof recursive !== 'function') return true;
    return !recursive(value as Record<string, unknown>, path, queryContext);
}
