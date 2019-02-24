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

    if (Array.isArray(output)) {
        output = output.map(keyConvert(converters));
    } else {
        output = keyConvert(converters)(output);
    }

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

const keyConvert = (converters) => (row) => {
    if (!(row instanceof Object)) return row;
    return recursiveKeyConvert(row, converters);
};

function recursiveKeyConvert(row, converters) {
    const result = {}
    for (const key of Object.keys(row)) {
        const converted = convert(converters, key);
        if (row[key] instanceof Object) {
            result[converted] = recursiveKeyConvert(row[key], converters)
        } else {
            result[converted] = row[key];
        }
    }
    return result
};

const convert = (converters, value) => {
    let result = value;

    for (const converter of converters) {
        result = converter(result);
    }

    return result;
};
