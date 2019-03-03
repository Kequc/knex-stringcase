const getConverters = require('./get-converters.js');

module.exports = (config = {}) => {
    const options = Object.assign({}, config); // clone

    delete options.dbStringcase;
    delete options.appStringcase;
    delete options.beforePostProcessResponse;
    delete options.beforeWrapIdentifier;

    options.postProcessResponse = postProcessResponse(
        getConverters(config.appStringcase || 'camelcase'),
        config.beforePostProcessResponse,
        config.postProcessResponse
    );

    options.wrapIdentifier = wrapIdentifier(
        getConverters(config.dbStringcase || 'snakecase'),
        config.beforeWrapIdentifier,
        config.wrapIdentifier
    );

    return options;
};

const postProcessResponse = (converters, before, after) => (result, queryContext) => {
    let output = result;

    if (typeof before === 'function') {
        output = before(output, queryContext);
    }

    output = keyConvert(converters, output);

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

const keyConvert = (converters, obj) => {
    if (!(obj instanceof Object)) return obj;
    if (Array.isArray(obj)) return obj.map(item => keyConvert(converters, item));

    const result = {};

    for (const key of Object.keys(obj)) {
        const converted = convert(converters, key);
        result[converted] = keyConvert(converters, obj[key]);
    }

    return result;
};

const convert = (converters, value) => {
    let result = value;

    for (const converter of converters) {
        result = converter(result);
    }

    return result;
};
