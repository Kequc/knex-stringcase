module.exports = knexStringcase;

const converter = require('./converter.js');

function knexStringcase (config = {}) {
    const options = Object.assign({}, config); // clone

    delete options.beforePostProcessResponse;
    delete options.beforeWrapIdentifier;
    delete options.dbStringcase;
    delete options.appStringcase;
    delete options.ignoreStringcase;

    options.postProcessResponse = postProcessResponse(
        converter(config.appStringcase || 'camelcase'),
        config.beforePostProcessResponse,
        config.postProcessResponse,
        config.ignoreStringcase
    );

    options.wrapIdentifier = wrapIdentifier(
        converter(config.dbStringcase || 'snakecase'),
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

    output = keyConvert(convert, ignore, output, [], queryContext);

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

function keyConvert (convert, ignore, obj, path, queryContext) {
    if (!(obj instanceof Object)) return obj;
    if (obj instanceof Date) return obj;
    if (Array.isArray(obj)) return obj.map(item => keyConvert(convert, ignore, item, path, queryContext));
    if (typeof ignore === 'function' && ignore(obj, path.join('.'), queryContext)) return obj;

    const result = {};

    for (const key of Object.keys(obj)) {
        const converted = convert(key);
        result[converted] = keyConvert(convert, ignore, obj[key], path.concat(key), queryContext);
    }

    return result;
}
