const assert = require('assert');
const knexStringcase = require('./index.js');

function it (description, cb) {
    process.stdout.write(' \u00B7 ' + description);
    try {
        cb();
        process.stdout.write(' \x1b[32m\u2713\x1b[0m\n');
    } catch (err) {
        process.stdout.write(' \x1b[31m\u2717\x1b[0m\n');
        throw err;
    }
}

function describe (description, cb) {
    process.stdout.write(description + '\n');
    cb();
}

describe('initialise', () => {
    it('without parameters', () => {
        const result = knexStringcase();

        assert.equal(typeof result, 'object');
        assert.equal(typeof result.postProcessResponse, 'function');
        assert.equal(typeof result.wrapIdentifier, 'function');
    });

    it('with parameters', () => {
        const config = {
            beforePostProcessResponse() {},
            beforeWrapIdentifier() {},
            dbStringcase: 'snakecase',
            appStringcase: 'camelcase',
            otherOption: 'hello'
        };
        const result = knexStringcase(config);

        assert.equal(typeof result, 'object');
        assert.equal(typeof result.postProcessResponse, 'function');
        assert.equal(typeof result.wrapIdentifier, 'function');
        assert.equal(result.beforePostProcessResponse, undefined);
        assert.equal(result.beforeWrapIdentifier, undefined);
        assert.equal(result.dbStringcase, undefined);
        assert.equal(result.appStringcase, undefined);
        assert.equal(result.otherOption, 'hello');
    });

    it('return new object', () => {
        const config = {};

        assert.strict.notEqual(knexStringcase(config), config);
    });
});

describe('postProcessResponse', () => {
    it('convert keys', () => {
        const { postProcessResponse } = knexStringcase();
        const now = new Date();

        assert.deepEqual(postProcessResponse({
            test: 'hi',
            test_two: now,
            test_three: 11
        }), {
            test: 'hi',
            testTwo: now,
            testThree: 11
        });
    });

    it('convert keys when response is a class (mysql2 has TextRow as a response)', () => {
        const { postProcessResponse } = knexStringcase();
        const now = new Date();

        class TextRow {
            constructor() {
                this.test = 'hi';
                this.test_two = now;
                this.test_three = 11;
            }
        }

        assert.deepEqual(postProcessResponse(new TextRow()), {
            test: 'hi',
            testTwo: now,
            testThree: 11
        });
    });

    it('deep convert keys', () => {
        const { postProcessResponse } = knexStringcase();
        const now = new Date();

        assert.deepEqual(postProcessResponse([{
            test: {
                test_two: now
            },
            test_three: 11
        }]), [{
            test: {
                testTwo: now
            },
            testThree: 11
        }]);
    });

    it('return raw values', () => {
        const { postProcessResponse } = knexStringcase();
        const now = new Date();

        assert.deepEqual(postProcessResponse(['hi', now, 11, null, undefined]), ['hi', now, 11, null, undefined]);
    });

    it('customise conversion', () => {
        const { postProcessResponse } = knexStringcase({
            appStringcase: ['camelcase', 'lowercase', value => value.slice(0, -1)]
        });
        const now = new Date();

        assert.deepEqual(postProcessResponse({ 'TEST': 'hi' }), { tes: 'hi' });
        assert.deepEqual(postProcessResponse({ 'TEST_TWO': now }), { testtw: now });
        assert.deepEqual(postProcessResponse({ 'TEST_THREE': 11 }), { testthre: 11 });
    });

    it('run before after functions', () => {
        const { postProcessResponse } = knexStringcase({
            beforePostProcessResponse (output) {
                return Object.assign({ what_this: 'ahhhhhhh' }, output);
            },
            postProcessResponse (output) {
                return Object.assign({ what_this: 'ah again' }, output);
            },
        });
        const now = new Date();

        assert.deepEqual(postProcessResponse({
            test: 'hi',
            test_two: now,
            test_three: 11
        }), {
            test: 'hi',
            testTwo: now,
            testThree: 11,
            whatThis: 'ahhhhhhh',
            what_this: 'ah again'
        });
    });
});

describe('wrapIdentifier', () => {
    it('convert values', () => {
        const { wrapIdentifier } = knexStringcase();

        assert.equal(wrapIdentifier('test', val => val), 'test');
        assert.equal(wrapIdentifier('testTwo', val => val), 'test_two');
        assert.equal(wrapIdentifier('testThree', val => val), 'test_three');
    });

    it('customise conversion', () => {
        const { wrapIdentifier } = knexStringcase({
            dbStringcase: ['snakecase', 'uppercase', value => value.slice(0, -1)]
        });

        assert.equal(wrapIdentifier('test', val => val), 'TES');
        assert.equal(wrapIdentifier('testTwo', val => val), 'TEST_TW');
        assert.equal(wrapIdentifier('testThree', val => val), 'TEST_THRE');
    });

    it('run before after functions', () => {
        const { wrapIdentifier } = knexStringcase({
            beforeWrapIdentifier (output) {
                return output + 'Hmmm';
            },
            wrapIdentifier (output, origImpl) {
                return origImpl(output + 'Hm again');
            }
        });

        assert.equal(wrapIdentifier('test', val => '1' + val), '1test_hmmmHm again');
        assert.equal(wrapIdentifier('testTwo', val => '1' + val), '1test_two_hmmmHm again');
        assert.equal(wrapIdentifier('testThree', val => '1' + val), '1test_three_hmmmHm again');
    });
});
