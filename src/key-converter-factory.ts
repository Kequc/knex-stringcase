import { Converter, KeyConverter, RecursiveStringcase } from './types';

// String converter for keys of an object

export default function keyConverterFactory (
    converter: Converter,
    isRecursive?: RecursiveStringcase,
): KeyConverter {
    return function keyConverter (value, path, queryContext): unknown {
        if (isStatic(value, path, isRecursive, queryContext)) {
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

function isStatic (
    value: unknown,
    path: string,
    isRecursive?: RecursiveStringcase,
    queryContext?: unknown,
): boolean {
    if (typeof value !== 'object' || value === null) return true;
    if (value instanceof Date) return true;
    if (path === 'root') return false;
    if (typeof isRecursive === 'function') return !isRecursive(value, path, queryContext);
    return true;
}
