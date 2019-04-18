const getConverters = require('./get-converters.js');

module.exports = (config = {}) => {
    const options = Object.assign({}, config); // clone

    delete options.beforePostProcessResponse;
    delete options.beforeWrapIdentifier;
    delete options.dbStringcase;
    delete options.appStringcase;
    delete options.ignoreStringcase;

    const makeMemoizedConvert = converters => memoize(
        value => converters.reduce((acc, cur) => cur(acc), value)
    );

    options.postProcessResponse = postProcessResponse(
        makeMemoizedConvert(getConverters(config.appStringcase || 'camelcase')),
        config.beforePostProcessResponse,
        config.postProcessResponse,
        config.ignoreStringcase
    );

    options.wrapIdentifier = wrapIdentifier(
        makeMemoizedConvert(getConverters(config.dbStringcase || 'snakecase')),
        config.beforeWrapIdentifier,
        config.wrapIdentifier
    );

    return options;
};

const postProcessResponse = (convert, before, after, ignore) => (result, queryContext) => {
    let output = result;

    if (typeof before === 'function') {
        output = before(output, queryContext);
    }

    output = keyConvert(convert, output, ignore);

    if (typeof after === 'function') {
        output = after(output, queryContext);
    }

    return output;
};

const wrapIdentifier = (convert, before, after) => (value, origImpl, queryContext) => {
    let output = value;

    if (typeof before === 'function') {
        output = before(output, queryContext);
    }

    output = convert(output);

    if (typeof after === 'function') {
        output = after(output, origImpl, queryContext);
    } else {
        output = origImpl(output);
    }

    return output;
};

function keyConvert (convert, obj, ignore) {
    if (!(obj instanceof Object)) return obj;
    if (obj instanceof Date) return obj;

    if (Array.isArray(obj)) return obj.map(item => keyConvert(convert, item, ignore));
    if (typeof ignore === 'function' && ignore(obj)) return obj;

    const result = {};

    for (const key of Object.keys(obj)) {
        const converted = convert(key);
        result[converted] = keyConvert(convert, obj[key], ignore);
    }

    return result;
}

function memoize(fn) {
    const cache = new Map();
    return function(...args) {
        if (cache.has(args[0])) {
            return cache.get(args[0]);
        }

        const result = fn(...args);
        cache.set(args[0], result);
        return result;
    }
}
