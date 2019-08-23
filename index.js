module.exports = knexStringcase;

const buildConverter = require('./build-converter.js');

function knexStringcase (config = {}) {
    const options = Object.assign({}, config); // clone

    delete options.beforePostProcessResponse;
    delete options.beforeWrapIdentifier;
    delete options.dbStringcase;
    delete options.appStringcase;
    delete options.ignoreStringcase;

    options.postProcessResponse = buildPostProcessResponse(
        buildKeyConverter(
            buildConverter(config.appStringcase || 'camelcase'),
            config.ignoreStringcase
        ),
        config.beforePostProcessResponse,
        config.postProcessResponse
    );

    options.wrapIdentifier = buildWrapIdentifier(
        buildConverter(config.dbStringcase || 'snakecase'),
        config.beforeWrapIdentifier,
        config.wrapIdentifier
    );

    return options;
}

// Process result returned from the database
function buildPostProcessResponse (keyConverter, before, after) {
    return function postProcessResponse (result, queryContext) {
        let output = result;

        if (typeof before === 'function') {
            output = before(output, queryContext);
        }

        output = keyConverter(output, [], queryContext);

        if (typeof after === 'function') {
            output = after(output, queryContext);
        }

        return output;
    };
}

// Recursively convert all object keys
function buildKeyConverter (converter, ignoreStringcase) {
    return function keyConverter (obj, path, queryContext) {
        if (!(obj instanceof Object)) return obj;
        if (obj instanceof Date) return obj;
        if (Array.isArray(obj)) return obj.map(item => keyConverter(item, path, queryContext));
        if (typeof ignoreStringcase === 'function' && ignoreStringcase(obj, path.join('.'), queryContext)) return obj;
    
        const output = {};
    
        for (const key of Object.keys(obj)) {
            const converted = converter(key);
            output[converted] = keyConverter(obj[key], path.concat(key), queryContext);
        }
    
        return output;
    };
}

// Convert string value on the way to the database
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
