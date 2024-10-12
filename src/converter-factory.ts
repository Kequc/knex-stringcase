import stringcase from 'stringcase';
import { Converter, Modifier } from './types';

// String converter

export default function converterFactory (arr: Modifier | Modifier[]): Converter {
    const modifiers = (Array.isArray(arr) ? arr : [arr]).map(getModifier);
    const cache = new Map<string, string>();

    return function converter (value: string): string {
        if (!cache.has(value)) {
            cache.set(value, modifiers.reduce((acc, cur) => cur(acc), value));
        }
        return cache.get(value) as string;
    };
}

// Function for use in converting strings

function getModifier (modifier: Modifier): Converter {
    switch (typeof modifier) {
    case 'string': return getStringcase(modifier);
    case 'function': return modifier;
    default: throw new Error('Conversion must be string or function');
    }
}

// Function from stringcase

function getStringcase (name: string): Converter {
    const modifier = stringcase[name];

    if (typeof modifier === 'function') {
        return modifier;
    } else {
        throw new Error(`Invalid conversion string: ${name}`);
    }
}
