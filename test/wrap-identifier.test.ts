import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import knexStringcase from '../src/main';

describe('wrapIdentifier', () => {
    it('converts values', () => {
        const { wrapIdentifier } = knexStringcase();

        assert.strict.equal(wrapIdentifier('test', val => val), 'test');
        assert.strict.equal(wrapIdentifier('testTwo', val => val), 'test_two');
        assert.strict.equal(wrapIdentifier('testThree', val => val), 'test_three');
    });

    it('customizes conversion', () => {
        const { wrapIdentifier } = knexStringcase({
            stringcase: ['snakecase', 'uppercase', value => value.slice(0, -1)],
        });

        assert.strict.equal(wrapIdentifier('test', val => val), 'TES');
        assert.strict.equal(wrapIdentifier('testTwo', val => val), 'TEST_TW');
        assert.strict.equal(wrapIdentifier('testThree', val => val), 'TEST_THRE');
    });

    it('runs before after functions', () => {
        const { wrapIdentifier } = knexStringcase({
            appWrapIdentifier(output) {
                return output + 'Hmmm';
            },
            wrapIdentifier(output, origImpl) {
                return origImpl(output + 'Hm again');
            },
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
