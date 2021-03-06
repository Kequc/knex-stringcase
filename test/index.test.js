const assert = require('assert');
const knexStringcase = require('../src/index.js');

describe('initialise', function () {
    it('without parameters', function () {
        const result = knexStringcase();

        assert.strict.equal(typeof result, 'object');
        assert.strict.equal(typeof result.postProcessResponse, 'function');
        assert.strict.equal(typeof result.wrapIdentifier, 'function');
    });

    it('with parameters', function () {
        const config = {
            appWrapIdentifier () {},
            appPostProcessResponse () {},
            appStringcase: 'camelcase',
            stringcase: 'snakecase',
            otherOption: 'hello',
            recursiveStringcase () {}
        };
        const result = knexStringcase(config);

        assert.strict.equal(typeof result, 'object');
        assert.strict.equal(typeof result.postProcessResponse, 'function');
        assert.strict.equal(typeof result.wrapIdentifier, 'function');
        assert.strict.equal(result.appWrapIdentifier, undefined);
        assert.strict.equal(result.appPostProcessResponse, undefined);
        assert.strict.equal(result.appStringcase, undefined);
        assert.strict.equal(result.stringcase, undefined);
        assert.strict.equal(result.otherOption, 'hello');
        assert.strict.equal(result.recursiveStringcase, undefined);
    });

    it('return new object', function () {
        const config = {};

        assert.strict.notEqual(knexStringcase(config), config);
    });
});

describe('postProcessResponse', function () {
    it('convert keys', function () {
        const { postProcessResponse } = knexStringcase();
        const now = new Date();

        assert.deepStrictEqual(postProcessResponse({
            test: 'hi',
            test_two: now,
            test_three: 11
        }), {
            test: 'hi',
            testTwo: now,
            testThree: 11
        });
    });

    it('do not deep convert keys', function () {
        const { postProcessResponse } = knexStringcase();
        const now = new Date();

        assert.deepStrictEqual(postProcessResponse([{
            test: {
                test_two: now
            },
            test_three: 11
        }]), [{
            test: {
                test_two: now
            },
            testThree: 11
        }]);
    });

    it('return raw values', function () {
        const { postProcessResponse } = knexStringcase();
        const now = new Date();

        assert.deepStrictEqual(postProcessResponse(['hi', now, 11]), ['hi', now, 11]);
    });

    it('recursively convert specified objects', function () {
        const { postProcessResponse } = knexStringcase({
            recursiveStringcase (obj) {
                return obj.convert_this === true;
            }
        });

        assert.deepStrictEqual(postProcessResponse([{
            test_two: {
                is_skipped: 'hi'
            },
            test_three: {
                convert_this: true
            }
        }]), [{
            testTwo: {
                is_skipped: 'hi'
            },
            testThree: {
                convertThis: true
            }
        }]);
    });

    it('recursively convert using specified name', function () {
        const { postProcessResponse } = knexStringcase({
            recursiveStringcase (obj, name) {
                return name === 'root.test_three';
            }
        });

        assert.deepStrictEqual(postProcessResponse([{
            test: {
                test_two: 'hi'
            },
            test_three: {
                test_four: 'there'
            }
        }]), [{
            test: {
                test_two: 'hi'
            },
            testThree: {
                testFour: 'there'
            }
        }]);
    });

    it('recursively convert using specified deep name', function () {
        const { postProcessResponse } = knexStringcase({
            recursiveStringcase (obj, name) {
                return name.startsWith('root.test') && name !== 'root.test.test_two';
            }
        });

        assert.deepStrictEqual(postProcessResponse([{
            test: {
                test_two: { test_three: 'hi' },
                test_four: { test_five: 'there' }
            }
        }]), [{
            test: {
                testTwo: { test_three: 'hi' },
                testFour: { testFive: 'there' }
            }
        }]);
    });

    it('recursively convert using queryContext', function () {
        const { postProcessResponse } = knexStringcase({
            recursiveStringcase (obj, name, queryContext) {
                return queryContext.test === name;
            }
        });
        const queryContext = { test: 'root.test_three' };

        assert.deepStrictEqual(postProcessResponse([{
            test: {
                test_two: 'hi'
            },
            test_three: {
                test_four: 'there'
            }
        }], queryContext), [{
            test: {
                test_two: 'hi'
            },
            testThree: {
                testFour: 'there'
            }
        }]);
    });

    it('recursively convert deep results', function () {
        const { postProcessResponse } = knexStringcase({
            recursiveStringcase () {
                return true;
            }
        });

        assert.deepStrictEqual(postProcessResponse([{
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
                testFour: 'there'
            }
        }]);
    });

    it('convert keys when response is an instance of a class', function () {
        const { postProcessResponse } = knexStringcase();
        const now = new Date();

        class TextRow {
            constructor () {
                this.test = 'hi';
                this.test_two = now;
                this.test_three = 11;
            }
        }

        assert.deepStrictEqual(postProcessResponse(new TextRow()), {
            test: 'hi',
            testTwo: now,
            testThree: 11
        });
    });

    it('customise conversion', function () {
        const { postProcessResponse } = knexStringcase({
            appStringcase: ['camelcase', 'lowercase', value => value.slice(0, -1)]
        });
        const now = new Date();

        assert.deepStrictEqual(postProcessResponse({ 'TEST': 'hi' }), { tes: 'hi' });
        assert.deepStrictEqual(postProcessResponse({ 'TEST_TWO': now }), { testtw: now });
        assert.deepStrictEqual(postProcessResponse({ 'TEST_THREE': 11 }), { testthre: 11 });
    });

    it('run before after functions', function () {
        const { postProcessResponse } = knexStringcase({
            postProcessResponse (output) {
                return Object.assign({ what_this: 'ahhhhhhh' }, output);
            },
            appPostProcessResponse (output) {
                return Object.assign({ what_this: 'ah again' }, output);
            },
        });
        const now = new Date();

        assert.deepStrictEqual(postProcessResponse({
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

    it('converts the same key multiple times', function () {
        const { postProcessResponse } = knexStringcase();
        const now = new Date();

        assert.deepStrictEqual(postProcessResponse([{
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

describe('wrapIdentifier', function () {
    it('convert values', function () {
        const { wrapIdentifier } = knexStringcase();

        assert.strict.equal(wrapIdentifier('test', val => val), 'test');
        assert.strict.equal(wrapIdentifier('testTwo', val => val), 'test_two');
        assert.strict.equal(wrapIdentifier('testThree', val => val), 'test_three');
    });

    it('customise conversion', function () {
        const { wrapIdentifier } = knexStringcase({
            stringcase: ['snakecase', 'uppercase', value => value.slice(0, -1)]
        });

        assert.strict.equal(wrapIdentifier('test', val => val), 'TES');
        assert.strict.equal(wrapIdentifier('testTwo', val => val), 'TEST_TW');
        assert.strict.equal(wrapIdentifier('testThree', val => val), 'TEST_THRE');
    });

    it('run before after functions', function () {
        const { wrapIdentifier } = knexStringcase({
            appWrapIdentifier (output) {
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

    it('converts the same value multiple times', function () {
        const { wrapIdentifier } = knexStringcase();

        assert.strict.equal(wrapIdentifier('test', val => val), 'test');
        assert.strict.equal(wrapIdentifier('testTwo', val => val), 'test_two');
        assert.strict.equal(wrapIdentifier('testThree', val => val), 'test_three');
        assert.strict.equal(wrapIdentifier('test', val => val), 'test');
        assert.strict.equal(wrapIdentifier('testTwo', val => val), 'test_two');
        assert.strict.equal(wrapIdentifier('testThree', val => val), 'test_three');
    });
});
