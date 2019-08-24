module.exports = knexStringcase;

const buildConverter = require('./build-converter.js');
const buildKeyConverter = require('./build-key-converter.js');

function knexStringcase (config = {}) {
    const options = Object.assign({}, config); // clone

    delete options.appWrapIdentifier;
    delete options.appPostProcessResponse;
    delete options.appStringcase;
    delete options.dbStringcase;
    delete options.ignoreStringcase;

    options.wrapIdentifier = buildWrapIdentifier(
        buildConverter(config.dbStringcase || 'snakecase'),
        config.appWrapIdentifier,
        config.wrapIdentifier
    );

    options.postProcessResponse = buildPostProcessResponse(
        buildKeyConverter(
            buildConverter(config.appStringcase || 'camelcase'),
            config.ignoreStringcase
        ),
        config.postProcessResponse,
        config.appPostProcessResponse
    );

    return options;
}

// Convert value on the way to the database
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

// Process result returned from the database
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
