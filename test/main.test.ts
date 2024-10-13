import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import knexStringcase from '../src/main';

describe('main', () => {
    it('runs without parameters', () => {
        const result = knexStringcase();

        assert.strict.equal(typeof result, 'object');
        assert.strict.equal(typeof result.postProcessResponse, 'function');
        assert.strict.equal(typeof result.wrapIdentifier, 'function');
    });

    it('returns a new object', () => {
        const config = {};

        assert.strict.notEqual(knexStringcase(config), config);
    });

    it('runs with parameters', () => {
        const config = {
            appWrapIdentifier: () => '',
            appPostProcessResponse: () => ({}),
            appStringcase: 'camelcase',
            stringcase: 'snakecase',
            otherOption: 'hello',
            recursiveStringcase: () => false,
        };
        const result = knexStringcase(config);

        assert.strict.equal(typeof result, 'object');
        assert.strict.equal(typeof result.postProcessResponse, 'function');
        assert.strict.equal(typeof result.wrapIdentifier, 'function');

        assert.strict.equal(result.otherOption, 'hello');
        // @ts-ignore
        assert.strict.equal(result.appWrapIdentifier, undefined);
        // @ts-ignore
        assert.strict.equal(result.appPostProcessResponse, undefined);
        // @ts-ignore
        assert.strict.equal(result.appStringcase, undefined);
        // @ts-ignore
        assert.strict.equal(result.stringcase, undefined);
        // @ts-ignore
        assert.strict.equal(result.recursiveStringcase, undefined);
    });
});
