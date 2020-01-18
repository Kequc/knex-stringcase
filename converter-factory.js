module.exports = converterFactory;

const stringcase = require('stringcase');

// String converter
function converterFactory (arr) {
    const modifiers = (Array.isArray(arr) ? arr : [arr]).map(getModifier);
    const cache = new Map();

    return function converter (value) {
        if (!cache.has(value)) {
            cache.set(value, modifiers.reduce((acc, cur) => cur(acc), value));
        }
        return cache.get(value);
    };
}

// Function for use in converting strings
function getModifier (modifier) {
    switch (typeof modifier) {
        case 'string': return getStringcase(modifier);
        case 'function': return modifier;
        default: throw new Error('Conversion must be string or function');
    }
}

// Function from stringcase
function getStringcase (name) {
    const modifier = stringcase[name];

    if (typeof modifier === 'function') {
        return modifier;
    } else {
        throw new Error(`Invalid conversion string: ${name}`);
    }
}
