import converterFactory from './converter-factory';
import keyConverterFactory from './key-converter-factory';
import { AppPostProcessResponse, AppWrapIdentifier, Converter, KeyConverter, KnexOptions, KnexStringcaseConfig, PostProcessResponse, WrapIdentifier } from './types';

type ExcludedKeys = 'appWrapIdentifier' | 'appPostProcessResponse' | 'appStringcase' | 'stringcase' | 'recursiveStringcase';

// Add conversions to knex config

export default function knexStringcase<T extends KnexStringcaseConfig>(config: T = {} as T) {
    const options = Object.assign({}, config); // clone

    delete options.appWrapIdentifier;
    delete options.appPostProcessResponse;
    delete options.appStringcase;
    delete options.stringcase;
    delete options.recursiveStringcase;

    options.wrapIdentifier = wrapIdentifierFactory(
        converterFactory(config.stringcase ?? 'snakecase'),
        config.appWrapIdentifier,
        config.wrapIdentifier,
    );

    options.postProcessResponse = postProcessResponseFactory(
        keyConverterFactory(
            converterFactory(config.appStringcase ?? 'camelcase'),
            config.recursiveStringcase,
        ),
        config.postProcessResponse,
        config.appPostProcessResponse,
    );

    return options as Omit<T, ExcludedKeys> & KnexOptions;
}

// Convert value for database

function wrapIdentifierFactory (converter: Converter, before?: AppWrapIdentifier, after?: WrapIdentifier): WrapIdentifier {
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

function postProcessResponseFactory (keyConverter: KeyConverter, before?: PostProcessResponse, after?: AppPostProcessResponse): PostProcessResponse {
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
