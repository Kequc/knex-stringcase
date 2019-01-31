jest.mock('../src/get-converters.js', () => () => [(value) => value + '-converted']);

const knexStringcase = require('../src/index.js');

test('returns configured options', () => {
    const options = knexStringcase();

    expect(options).toBeInstanceOf(Object);
    expect(options.postProcessResponse).toBeInstanceOf(Function);
    expect(options.wrapIdentifier).toBeInstanceOf(Function);
});

test('removes new options', () => {
    const config = {
        dbStringcase: 'fakecase1',
        appStringcase: 'fakecase2',
        beforePostProcessResponse () {},
        beforeWrapIdentifier () {},
        otherOption: 'hi'
    };
    const options = knexStringcase(config);

    expect(options.dbStringcase).toBeUndefined();
    expect(options.appStringcase).toBeUndefined();
    expect(options.postProcessResponse).not.toBe(config.postProcessResponse);
    expect(options.beforeWrapIdentifier).not.toBe(config.beforeWrapIdentifier);
    expect(options.otherOption).toBe(config.otherOption);
});

describe('postProcessResponse', () => {
    test('returns raw values', () => {
        const options = knexStringcase();

        expect(options.postProcessResponse('hi')).toBe('hi');
        expect(options.postProcessResponse(100)).toBe(100);
    });

    test('returns object with converted keys', () => {
        const result = {
            key1: 'value1',
            key2: 'value2'
        };

        expect(knexStringcase().postProcessResponse(result)).toEqual({
            'key1-converted': 'value1',
            'key2-converted': 'value2'
        });
    });

    test('returns array with converted keys', () => {
        const result = [{
            key1: 'value1',
            key2: 'value2'
        }, {
            key1: 'value3',
            key2: 'value4'
        }];

        expect(knexStringcase().postProcessResponse(result)).toEqual([{
            'key1-converted': 'value1',
            'key2-converted': 'value2'
        }, {
            'key1-converted': 'value3',
            'key2-converted': 'value4'
        }]);
    });

    test('runs before and after methods', () => {
        const keyConvert = append => a => {
            const b = {};
            for (const key of Object.keys(a)) { b[key + append] = a[key]; }
            return b;
        };
        const config = {
            beforePostProcessResponse: keyConvert('-before'),
            postProcessResponse: keyConvert('-after')
        };
        const options = knexStringcase(config);
        const result = {
            key1: 'value1'
        };

        expect(options.postProcessResponse(result)).toEqual({
            'key1-before-converted-after': 'value1'
        });
    });

    test('persists query context', () => {
        const qcs = {};
        const config = {
            beforePostProcessResponse: (value, queryContext) => { qcs.before = queryContext; return value; },
            postProcessResponse: (value, queryContext) => { qcs.after = queryContext; return value; }
        };
        const options = knexStringcase(config);
        const result = {
            key1: 'value1'
        };

        options.postProcessResponse(result, { hi: 'there' });

        expect(qcs.before).toEqual({ hi: 'there' });
        expect(qcs.after).toEqual({ hi: 'there' });
    });
});

describe('wrapIdentifier', () => {
    function origImpl (value) {
        return value + '-orig';
    }

    test('returns converted value', () => {
        expect(knexStringcase().wrapIdentifier('hi', origImpl)).toBe('hi-converted-orig');
    });

    test('runs before and after methods', () => {
        const config = {
            beforeWrapIdentifier: value => value + '-before',
            wrapIdentifier: value => value + '-after'
        };
        const options = knexStringcase(config, origImpl);

        expect(options.wrapIdentifier('hi')).toEqual('hi-before-converted-after');
    });

    test('persists query context', () => {
        const qcs = {};
        const config = {
            beforeWrapIdentifier: (value, queryContext) => { qcs.before = queryContext; return value; },
            wrapIdentifier: (value, orig, queryContext) => { qcs.after = queryContext; qcs.origImpl = orig; return value; }
        };
        const options = knexStringcase(config);

        options.wrapIdentifier('hi', origImpl, { hi: 'there' });

        expect(qcs.before).toEqual({ hi: 'there' });
        expect(qcs.after).toEqual({ hi: 'there' });
        expect(qcs.origImpl).toBe(origImpl);
    });
});
