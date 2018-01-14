const getConverters = require('./get-converters');

const runConverters = (converters) => (value) => {
    let result = value;
    for (const converter of converters) {
        result = converter(result);
    }
    return result;
};

const postProcessResponse = (converters, before, after) => (value) => {
    let result = value;

    if (typeof before === 'function') {
        result = before(result);
    }

    if (Array.isArray(result)) {
        result = result.map(runConverters(converters));
    } else {
        result = runConverters(converters)(result);
    }

    if (typeof after === 'function') {
        result = after(result);
    }

    return result;
};

const wrapIdentifier = (converters, before, after) => (value, origImpl) => {
    let result = value;

    if (typeof before === 'function') {
        result = before(result);
    }

    result = runConverters(converters)(result);

    if (typeof after === 'function') {
        result = after(result, origImpl);
    } else {
        result = origImpl(result);
    }

    return result;
};

module.exports = (config) => {
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
