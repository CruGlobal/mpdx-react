import i18n from 'src/lib/i18n';
import { getAmountSchema } from './getAmountSchema';

describe('getAmountSchema', () => {
  it('rejects a negative amount', () => {
    expect(() => getAmountSchema(i18n.t).validateSync('-5')).toThrow(
      'Please enter a positive amount.',
    );
  });

  it('rejects a non-whole-dollar amount', () => {
    expect(() => getAmountSchema(i18n.t).validateSync('12.50')).toThrow(
      'Please enter a whole dollar amount.',
    );
  });

  it('accepts a whole-dollar amount and parses it to a number', () => {
    expect(getAmountSchema(i18n.t).validateSync('500')).toBe(500);
    expect(getAmountSchema(i18n.t).validateSync('007')).toBe(7);
    expect(getAmountSchema(i18n.t).validateSync('0')).toBe(0);
  });
});
