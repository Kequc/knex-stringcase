module.exports = keyConverterFactory;

// String converter for keys of an object
function keyConverterFactory (converter, recursiveStringcase = () => false) {
    if (typeof recursiveStringcase !== 'function') {
        throw new Error('Recursive stringcase must be a function');
    }

    return function keyConverter (value, path, queryContext) {
        if (!(value instanceof Object)) return value;
        if (value instanceof Date) return value;
        if (path !== 'root' && !recursiveStringcase(value, path, queryContext)) return value;

        if (Array.isArray(value)) return value.map(item => keyConverter(item, path, queryContext));

        const output = {};

        for (const key of Object.keys(value)) {
            const newKey = converter(key);
            output[newKey] = keyConverter(value[key], `${path}.${key}`, queryContext);
        }

        return output;
    };
}
