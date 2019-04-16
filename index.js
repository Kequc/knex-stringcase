const getConverters = require('./get-converters.js');

module.exports = (config = {}) => {
    const options = Object.assign({}, config); // clone

    delete options.beforePostProcessResponse;
    delete options.beforeWrapIdentifier;
    delete options.dbStringcase;
    delete options.appStringcase;
    delete options.ignoreStringcase;

    options.postProcessResponse = postProcessResponse(
        getConverters(config.appStringcase || 'camelcase'),
        config.beforePostProcessResponse,
        config.postProcessResponse,
        config.ignoreStringcase
    );

    options.wrapIdentifier = wrapIdentifier(
        getConverters(config.dbStringcase || 'snakecase'),
        config.beforeWrapIdentifier,
        config.wrapIdentifier
    );

    return options;
};

const postProcessResponse = (converters, before, after, ignore) => (result, queryContext) => {
    let output = result;

    if (typeof before === 'function') {
        output = before(output, queryContext);
    }

    const memoizedConvert = memoize(convert(converters))
    output = keyConvert(memoizedConvert, output, ignore);

    if (typeof after === 'function') {
        output = after(output, queryContext);
    }

    return output;
};

const wrapIdentifier = (converters, before, after) => (value, origImpl, queryContext) => {
    let output = value;

    if (typeof before === 'function') {
        output = before(output, queryContext);
    }

    output = convert(converters)(output);

    if (typeof after === 'function') {
        output = after(output, origImpl, queryContext);
    } else {
        output = origImpl(output);
    }

    return output;
};

function keyConvert (convertFn, obj, ignore) {
    if (!(obj instanceof Object)) return obj;
    if (obj instanceof Date) return obj;

    if (Array.isArray(obj)) return obj.map(item => keyConvert(convertFn, item, ignore));
    if (typeof ignore === 'function' && ignore(obj)) return obj;

    const result = {};

    for (const key of Object.keys(obj)) {
        const converted = convertFn(key);
        result[converted] = keyConvert(convertFn, obj[key], ignore);
    }

    return result;
}

function convert (converters) {
    return function(value) {
        return converters.reduce((acc, cur) => cur(acc), value);
    }
}

function memoize(fn) {
    const cache = new Map()
    return function(...args) {
        if (cache.has(args[0])) {
            return cache.get(args[0])
        }

        const result = fn(...args)
        cache.set(args[0], result)
        return result
    }
}
