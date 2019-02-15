const stringcase = require('stringcase');

const getConverter = (conversion) => {
    if (typeof conversion === 'string') {
        if (typeof stringcase[conversion] === 'function') return stringcase[conversion];
        throw new Error('Invalid conversion string ' + conversion);
    }
    if (typeof conversion === 'function') return conversion;
    throw new Error('Conversion must be string or function');
};

module.exports = (arr) =>
    (Array.isArray(arr) ? arr : [arr]).map(getConverter);
