module.exports = buildKeyConverter;

function buildKeyConverter (converter, ignoreStringcase) {
    return function keyConverter (obj, path, queryContext) {
        if (!(obj instanceof Object)) return obj;
        if (obj instanceof Date) return obj;

        if (typeof ignoreStringcase === 'function') {
            if (ignoreStringcase(obj, path, queryContext)) return obj;
        }

        if (Array.isArray(obj)) return obj.map(item => keyConverter(item, path, queryContext));

        const output = {};

        for (const key of Object.keys(obj)) {
            const converted = converter(key);
            output[converted] = keyConverter(obj[key], `${path}.${key}`, queryContext);
        }

        return output;
    };
}
