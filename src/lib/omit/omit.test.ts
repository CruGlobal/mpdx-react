import omit from './omit';

const obj = {
    a: 'b',
    c: 'd',
    e: 'f',
};

describe('omit', () => {
    it('should omit single key', () => {
        expect(omit(['a'], obj)).toEqual({ c: 'd', e: 'f' });
    });

    it('should omit multiple keys', () => {
        expect(omit(['a', 'c'], obj)).toEqual({ e: 'f' });
    });
});
