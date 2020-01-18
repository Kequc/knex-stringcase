module.exports = knexStringcase;

const converterFactory = require('./converter-factory.js');
const keyConverterFactory = require('./key-converter-factory.js');

// Add conversions to knex config
function knexStringcase (config = {}) {
    const options = Object.assign({}, config); // clone

    delete options.appWrapIdentifier;
    delete options.appPostProcessResponse;
    delete options.appStringcase;
    delete options.stringcase;
    delete options.recursiveStringcase;

    options.wrapIdentifier = buildWrapIdentifier(
        converterFactory(config.stringcase || 'snakecase'),
        config.appWrapIdentifier,
        config.wrapIdentifier
    );

    options.postProcessResponse = buildPostProcessResponse(
        keyConverterFactory(
            converterFactory(config.appStringcase || 'camelcase'),
            config.recursiveStringcase
        ),
        config.postProcessResponse,
        config.appPostProcessResponse
    );

    return options;
}

// Convert value for database
function buildWrapIdentifier (converter, before, after) {
    return function wrapIdentifier (value, origImpl, queryContext) {
        let output = value;

        if (typeof before === 'function') {
            output = before(output, queryContext);
        }

        output = converter(output);

        if (typeof after === 'function') {
            output = after(output, origImpl, queryContext);
        } else {
            output = origImpl(output);
        }

        return output;
    };
}

// Process result from database
function buildPostProcessResponse (keyConverter, before, after) {
    return function postProcessResponse (result, queryContext) {
        let output = result;

        if (typeof before === 'function') {
            output = before(output, queryContext);
        }

        output = keyConverter(output, 'root', queryContext);

        if (typeof after === 'function') {
            output = after(output, queryContext);
        }

        return output;
    };
}
