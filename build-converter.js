module.exports = buildConverter;

const stringcase = require('stringcase');

function buildConverter (arr) {
    const methods = (Array.isArray(arr) ? arr : [arr]).map(getMethod);
    const cache = new Map();

    return function converter (value) {
        if (!cache.has(value)) {
            cache.set(value, methods.reduce((acc, cur) => cur(acc), value));
        }
        return cache.get(value);
    };
}

function getMethod (conversion) {
    if (typeof conversion === 'string') {
        if (typeof stringcase[conversion] === 'function') return stringcase[conversion];
        throw new Error('Invalid conversion string ' + conversion);
    }
    if (typeof conversion === 'function') return conversion;
    throw new Error('Conversion must be string or function');
}
