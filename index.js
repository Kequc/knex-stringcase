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

    output = keyConvert(converters, output, ignore);

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

    output = convert(converters, output);

    if (typeof after === 'function') {
        output = after(output, origImpl, queryContext);
    } else {
        output = origImpl(output);
    }

    return output;
};

function keyConvert (converters, obj, ignore) {
    if (!(obj instanceof Object)) return obj;
    if (obj instanceof Date) return obj;
    if (Array.isArray(obj)) return obj.map(item => keyConvert(converters, item, ignore));
    if (typeof ignore === 'function' && ignore(obj)) return obj;

    const result = {};

    for (const key of Object.keys(obj)) {
        const converted = convert(converters, key);
        result[converted] = keyConvert(converters, obj[key], ignore);
    }

    return result;
}

function convert (converters, value) {
    return converters.reduce((acc, cur) => cur(acc), value);
}
