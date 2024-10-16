import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import knexStringcase from '../src/main';

describe('recursiveStringcase', () => {
    it('converts specified objects', () => {
        const { postProcessResponse } = knexStringcase({
            recursiveStringcase: (value) => {
                return (value as any).convert_this === true;
            },
        });

        assert.deepEqual(postProcessResponse([{
            test_two: {
                is_skipped: 'hi',
            },
            test_three: {
                convert_this: true,
            },
        }]), [{
            testTwo: {
                is_skipped: 'hi',
            },
            testThree: {
                convertThis: true,
            },
        }]);
    });

    it('converts using specified name', () => {
        const { postProcessResponse } = knexStringcase({
            recursiveStringcase: (value, path) => {
                return path === 'root.test_three';
            },
        });

        assert.deepEqual(postProcessResponse([{
            test: {
                test_two: 'hi',
            },
            test_three: {
                test_four: 'there',
            },
        }]), [{
            test: {
                test_two: 'hi',
            },
            testThree: {
                testFour: 'there',
            },
        }]);
    });

    it('converts using specified deep name', () => {
        const { postProcessResponse } = knexStringcase({
            recursiveStringcase: (value, path) => {
                return path.startsWith('root.test') && path !== 'root.test.test_two';
            },
        });

        assert.deepEqual(postProcessResponse([{
            test: {
                test_two: { test_three: 'hi' },
                test_four: { test_five: 'there' },
            },
        }]), [{
            test: {
                testTwo: { test_three: 'hi' },
                testFour: { testFive: 'there' },
            },
        }]);
    });

    it('converts using queryContext', () => {
        const { postProcessResponse } = knexStringcase({
            recursiveStringcase: (value, path, queryContext) => {
                return queryContext === path;
            },
        });
        const queryContext = 'root.test_three';

        assert.deepEqual(postProcessResponse([{
            test: {
                test_two: 'hi',
            },
            test_three: {
                test_four: 'there',
            },
        }], queryContext), [{
            test: {
                test_two: 'hi',
            },
            testThree: {
                testFour: 'there',
            },
        }]);
    });

    it('converts deep results', () => {
        const { postProcessResponse } = knexStringcase({
            recursiveStringcase: () => {
                return true;
            },
        });

        assert.deepEqual(postProcessResponse([{
            test: {
                test_two: 'hi',
            },
            test_three: {
                test_four: 'there',
            },
        }]), [{
            test: {
                testTwo: 'hi',
            },
            testThree: {
                testFour: 'there',
            },
        }]);
    });

    it('converts arrays', () => {
        const { postProcessResponse } = knexStringcase({
            recursiveStringcase: (value, path) => {
                return path === 'root.test';
            },
        });

        assert.deepEqual(postProcessResponse([{
            test: [{
                test_two: 'hi',
            }, {
                test_four: 'there',
            }],
        }]), [{
            test: [{
                testTwo: 'hi',
            }, {
                testFour: 'there',
            }],
        }]);
    });
});
