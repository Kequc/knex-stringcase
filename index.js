module.exports = knexStringcase;

const buildConverter = require('./build-converter.js');

function knexStringcase (config = {}) {
    const options = Object.assign({}, config); // clone

    delete options.beforePostProcessResponse;
    delete options.beforeWrapIdentifier;
    delete options.dbStringcase;
    delete options.appStringcase;
    delete options.ignoreStringcase;

    options.postProcessResponse = postProcessResponse(
        buildConverter(config.appStringcase || 'camelcase'),
        config.beforePostProcessResponse,
        config.postProcessResponse,
        config.ignoreStringcase
    );

    options.wrapIdentifier = wrapIdentifier(
        buildConverter(config.dbStringcase || 'snakecase'),
        config.beforeWrapIdentifier,
        config.wrapIdentifier
    );

    return options;
}

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
