import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import knexStringcase from '../src/main';

describe('main', () => {
    it('runs without parameters', () => {
        const options = knexStringcase();

        assert.equal(typeof options, 'object');
        assert.equal(typeof options.postProcessResponse, 'function');
        assert.equal(typeof options.wrapIdentifier, 'function');
    });

    it('returns a new object', () => {
        const config = {};

        assert.notEqual(knexStringcase(config), config);
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
        const options = knexStringcase(config);

        assert.equal(typeof options, 'object');
        assert.equal(typeof options.postProcessResponse, 'function');
        assert.equal(typeof options.wrapIdentifier, 'function');
        assert.equal(options.otherOption, 'hello');

        // @ts-ignore
        assert.equal(options.appWrapIdentifier, undefined);
        // @ts-ignore
        assert.equal(options.appPostProcessResponse, undefined);
        // @ts-ignore
        assert.equal(options.appStringcase, undefined);
        // @ts-ignore
        assert.equal(options.stringcase, undefined);
        // @ts-ignore
        assert.equal(options.recursiveStringcase, undefined);
    });
});
