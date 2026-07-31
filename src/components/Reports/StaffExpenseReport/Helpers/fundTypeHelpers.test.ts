import { compareFundTypes } from './fundTypeHelpers';

describe('compareFundTypes', () => {
  it('sorts known fund types into their display order', () => {
    expect(
      [
        'Re-Entry',
        'Savings',
        'Return Travel',
        'Primary',
        'Staff Conference Savings',
      ].toSorted(compareFundTypes),
    ).toEqual([
      'Primary',
      'Staff Conference Savings',
      'Savings',
      'Return Travel',
      'Re-Entry',
    ]);
  });
});
