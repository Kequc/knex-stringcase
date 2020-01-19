module.exports = keyConverterFactory;

// String converter for keys of an object
function keyConverterFactory (converter, recursive) {
    return function keyConverter (value, path, queryContext) {
        if (isRaw(recursive, value, path, queryContext))
            return value;
        if (Array.isArray(value))
            return value.map(item => keyConverter(item, path, queryContext));

        const output = {};

        for (const key of Object.keys(value)) {
            const newKey = converter(key);
            output[newKey] = keyConverter(value[key], `${path}.${key}`, queryContext);
        }

        return output;
    };
}

// Value remains unchanged
function isRaw (recursive, value, path, queryContext) {
    if (!(value instanceof Object)) return true;
    if (value instanceof Date) return true;
    if (path === 'root') return false;
    if (typeof recursive !== 'function') return true;
    return !recursive(value, path, queryContext);
}
