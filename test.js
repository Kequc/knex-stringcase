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

        assert.strict.equal(typeof result, 'object');
        assert.strict.equal(typeof result.postProcessResponse, 'function');
        assert.strict.equal(typeof result.wrapIdentifier, 'function');
    });

    it('with parameters', () => {
        const config = {
            beforePostProcessResponse() {},
            beforeWrapIdentifier() {},
            dbStringcase: 'snakecase',
            appStringcase: 'camelcase',
            otherOption: 'hello',
            ignoreStringcase () {}
        };
        const result = knexStringcase(config);

        assert.strict.equal(typeof result, 'object');
        assert.strict.equal(typeof result.postProcessResponse, 'function');
        assert.strict.equal(typeof result.wrapIdentifier, 'function');
        assert.strict.equal(result.beforePostProcessResponse, undefined);
        assert.strict.equal(result.beforeWrapIdentifier, undefined);
        assert.strict.equal(result.dbStringcase, undefined);
        assert.strict.equal(result.appStringcase, undefined);
        assert.strict.equal(result.otherOption, 'hello');
        assert.strict.equal(result.ignoreStringcase, undefined);
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

        assert.deepEqual(postProcessResponse(['hi', now, 11]), ['hi', now, 11]);
    });

    it('ignore specified objects', () => {
        const { postProcessResponse } = knexStringcase({
            ignoreStringcase (obj) {
                return obj.skip_this === true;
            }
        });

        assert.deepEqual(postProcessResponse([{
            test_two: {
                not_skipped: 'hi'
            },
            test_three: {
                skip_this: true
            }
        }]), [{
            testTwo: {
                notSkipped: 'hi'
            },
            testThree: {
                skip_this: true
            }
        }]);
    });

    it('ignore using specified name', () => {
        const { postProcessResponse } = knexStringcase({
            ignoreStringcase (obj, name) {
                return name === 'test_three';
            }
        });

        assert.deepEqual(postProcessResponse([{
            test: {
                test_two: 'hi'
            },
            test_three: {
                test_four: 'there'
            }
        }]), [{
            test: {
                testTwo: 'hi'
            },
            testThree: {
                test_four: 'there'
            }
        }]);
    });

    it('ignore using specified deep name', () => {
        const { postProcessResponse } = knexStringcase({
            ignoreStringcase (obj, name) {
                return name === 'test.test_four';
            }
        });

        assert.deepEqual(postProcessResponse([{
            test: {
                test_two: { test_three: 'hi' },
                test_four: { test_five: 'there' }
            }
        }]), [{
            test: {
                testTwo: { testThree: 'hi' },
                testFour: { test_five: 'there' }
            }
        }]);
    });

    it('ignore using queryContext', () => {
        const { postProcessResponse } = knexStringcase({
            ignoreStringcase (obj, name, queryContext) {
                return queryContext.test === name;
            }
        });
        const queryContext = { test: 'test_three' };

        assert.deepEqual(postProcessResponse([{
            test: {
                test_two: 'hi'
            },
            test_three: {
                test_four: 'there'
            }
        }], queryContext), [{
            test: {
                testTwo: 'hi'
            },
            testThree: {
                test_four: 'there'
            }
        }]);
    });

    it('convert keys when response is an instance of a class', () => {
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

    it('converts the same key multiple times', () => {
        const { postProcessResponse } = knexStringcase();
        const now = new Date();

        assert.deepEqual(postProcessResponse([{
            test: 'hi',
            test_two: now,
            test_three: 11
        }, {
            test: 'hi',
            test_two: now,
            test_three: 11
        }]), [{
            test: 'hi',
            testTwo: now,
            testThree: 11
        }, {
            test: 'hi',
            testTwo: now,
            testThree: 11
        }]);
    });
});

describe('wrapIdentifier', () => {
    it('convert values', () => {
        const { wrapIdentifier } = knexStringcase();

        assert.strict.equal(wrapIdentifier('test', val => val), 'test');
        assert.strict.equal(wrapIdentifier('testTwo', val => val), 'test_two');
        assert.strict.equal(wrapIdentifier('testThree', val => val), 'test_three');
    });

    it('customise conversion', () => {
        const { wrapIdentifier } = knexStringcase({
            dbStringcase: ['snakecase', 'uppercase', value => value.slice(0, -1)]
        });

        assert.strict.equal(wrapIdentifier('test', val => val), 'TES');
        assert.strict.equal(wrapIdentifier('testTwo', val => val), 'TEST_TW');
        assert.strict.equal(wrapIdentifier('testThree', val => val), 'TEST_THRE');
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

        assert.strict.equal(wrapIdentifier('test', val => '1' + val), '1test_hmmmHm again');
        assert.strict.equal(wrapIdentifier('testTwo', val => '1' + val), '1test_two_hmmmHm again');
        assert.strict.equal(wrapIdentifier('testThree', val => '1' + val), '1test_three_hmmmHm again');
    });

    it('converts the same value multiple times', () => {
        const { wrapIdentifier } = knexStringcase();

        assert.strict.equal(wrapIdentifier('test', val => val), 'test');
        assert.strict.equal(wrapIdentifier('testTwo', val => val), 'test_two');
        assert.strict.equal(wrapIdentifier('testThree', val => val), 'test_three');
        assert.strict.equal(wrapIdentifier('test', val => val), 'test');
        assert.strict.equal(wrapIdentifier('testTwo', val => val), 'test_two');
        assert.strict.equal(wrapIdentifier('testThree', val => val), 'test_three');
    });
});
