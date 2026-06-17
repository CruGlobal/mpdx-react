import i18n from 'src/lib/i18n';
import { getWholeNumberSchema } from './getWholeNumberSchema';

const requiredMessage = 'Please enter a number, or 0 if you have none.';

describe('getWholeNumberSchema', () => {
  it('requires a value', () => {
    expect(() =>
      getWholeNumberSchema(i18n.t, requiredMessage).validateSync(undefined),
    ).toThrow(requiredMessage);
  });

  it('rejects a negative number', () => {
    expect(() =>
      getWholeNumberSchema(i18n.t, requiredMessage).validateSync('-5'),
    ).toThrow('Please enter a positive number.');
  });

  it('rejects a non-whole number', () => {
    expect(() =>
      getWholeNumberSchema(i18n.t, requiredMessage).validateSync('12.5'),
    ).toThrow('Please enter a whole number.');
  });

  it('accepts a whole number and normalizes leading zeros', () => {
    const schema = getWholeNumberSchema(i18n.t, requiredMessage);

    expect(schema.validateSync('500')).toBe('500');
    expect(schema.validateSync('007')).toBe('7');
    expect(schema.validateSync('0')).toBe('0');
  });

  it('uses overridden positive and whole messages', () => {
    const schema = getWholeNumberSchema(i18n.t, requiredMessage, {
      positive: 'Please enter a positive amount.',
      whole: 'Please enter a whole dollar amount.',
    });

    expect(() => schema.validateSync('-5')).toThrow(
      'Please enter a positive amount.',
    );
    expect(() => schema.validateSync('12.50')).toThrow(
      'Please enter a whole dollar amount.',
    );
  });
});
