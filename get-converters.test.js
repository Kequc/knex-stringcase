jest.mock('stringcase', () => ({
    fakecase1 () {},
    fakecase2 () {}
}));

const stringcase = require('stringcase');
const getConverters = require('./get-converters.js');

test('returns array of functions from function', () => {
    function fakeconverter () {}

    expect(getConverters(fakeconverter)).toEqual([fakeconverter]);
    expect(getConverters([fakeconverter])).toEqual([fakeconverter]);
});

test('returns array of functions from string', () => {
    expect(getConverters('fakecase1')).toEqual([stringcase.fakecase1]);
    expect(getConverters(['fakecase1'])).toEqual([stringcase.fakecase1]);
});

test('returns array of functions from function array', () => {
    function fakeconverter1 () {}
    function fakeconverter2 () {}

    expect(getConverters([fakeconverter1, fakeconverter2])).toEqual([fakeconverter1, fakeconverter2]);
});

test('returns array of functions from string array', () => {
    expect(getConverters(['fakecase1', 'fakecase2'])).toEqual([stringcase.fakecase1, stringcase.fakecase2]);
});

test('throws error on invalid entry', () => {
    expect(() => getConverters(null)).toThrowError();
    expect(() => getConverters(undefined)).toThrowError();
    expect(() => getConverters(100)).toThrowError();
    expect(() => getConverters({})).toThrowError();
});

test('throws error on invalid string', () => {
    expect(() => getConverters('invalidcase')).toThrowError();
});
