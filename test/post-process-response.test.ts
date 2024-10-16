import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import knexStringcase from '../src/main';

describe('postProcessResponse', () => {
    it('converts keys', () => {
        const { postProcessResponse } = knexStringcase();
        const now = new Date();

        assert.deepEqual(postProcessResponse({
            test: 'hi',
            test_two: now,
            test_three: 11,
        }), {
            test: 'hi',
            testTwo: now,
            testThree: 11,
        });
    });

    it('does not deep converts keys', () => {
        const { postProcessResponse } = knexStringcase();
        const now = new Date();

        assert.deepEqual(postProcessResponse([{
            test: {
                test_two: now,
            },
            test_three: 11,
        }]), [{
            test: {
                test_two: now,
            },
            testThree: 11,
        }]);
    });

    it('returns raw values', () => {
        const { postProcessResponse } = knexStringcase();
        const now = new Date();

        assert.deepEqual(postProcessResponse(['hi', now, 11]), ['hi', now, 11]);
    });

    it('converts keys when response is an instance of a class', () => {
        const { postProcessResponse } = knexStringcase();
        const now = new Date();

        class TextRow {
            test: string;
            test_two: Date;
            test_three: number;

            constructor() {
                this.test = 'hi';
                this.test_two = now;
                this.test_three = 11;
            }
        }

        assert.deepEqual(postProcessResponse(new TextRow()), {
            test: 'hi',
            testTwo: now,
            testThree: 11,
        });
    });

    it('customizes conversion', () => {
        const { postProcessResponse } = knexStringcase({
            appStringcase: ['camelcase', 'lowercase', value => value.slice(0, -1)],
        });
        const now = new Date();

        assert.deepEqual(postProcessResponse({ 'TEST': 'hi' }), { tes: 'hi' });
        assert.deepEqual(postProcessResponse({ 'TEST_TWO': now }), { testtw: now });
        assert.deepEqual(postProcessResponse({ 'TEST_THREE': 11 }), { testthre: 11 });
    });

    it('runs before after functions', () => {
        const { postProcessResponse } = knexStringcase({
            postProcessResponse: (result) => {
                return Object.assign({ what_this: 'ahhhhhhh' }, result);
            },
            appPostProcessResponse: (result) => {
                return Object.assign({ what_this: 'ah again' }, result);
            },
        });
        const now = new Date();

        assert.deepEqual(postProcessResponse({
            test: 'hi',
            test_two: now,
            test_three: 11,
        }), {
            test: 'hi',
            testTwo: now,
            testThree: 11,
            whatThis: 'ahhhhhhh',
            what_this: 'ah again',
        });
    });

    it('converts the same key multiple times', () => {
        const { postProcessResponse } = knexStringcase();
        const now = new Date();

        assert.deepEqual(postProcessResponse([{
            test: 'hi',
            test_two: now,
            test_three: 11,
        }, {
            test: 'hi',
            test_two: now,
            test_three: 11,
        }]), [{
            test: 'hi',
            testTwo: now,
            testThree: 11,
        }, {
            test: 'hi',
            testTwo: now,
            testThree: 11,
        }]);
    });
});
