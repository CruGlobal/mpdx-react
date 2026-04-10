import i18n from './i18n';
import { phoneNumber } from './yupHelpers';

const schema = phoneNumber(i18n.t);

describe('phoneNumber validation', () => {
  it('accepts a US number with country code', () => {
    expect(schema.validateSync('11234567890')).toBe('11234567890');
  });

  it('accepts trunk prefix (example is a UK numbers starting with 0)', () => {
    expect(schema.validateSync('01234567890')).toBe('01234567890');
  });

  it('accepts a number with dashes', () => {
    expect(schema.validateSync('123-456-7890')).toBe('123-456-7890');
  });

  it('accepts a number with parentheses and spaces', () => {
    expect(schema.validateSync('(123) 456 7890')).toBe('(123) 456 7890');
  });

  it('accepts a number with plus prefix', () => {
    expect(schema.validateSync('+447911123456')).toBe('+447911123456');
  });

  it('accepts the shortest international number (7 digits)', () => {
    expect(schema.validateSync('1234567')).toBe('1234567');
  });

  it('accepts the max E.164 length (15 digits)', () => {
    expect(schema.validateSync('123456789012345')).toBe('123456789012345');
  });

  it('rejects a number that is too short (6 digits)', () => {
    expect(() => schema.validateSync('123456')).toThrow();
  });

  it('rejects a number that is too long (16 digits)', () => {
    expect(() => schema.validateSync('1234567890123456')).toThrow();
  });

  it('rejects an empty string', () => {
    expect(() => schema.validateSync('')).toThrow();
  });

  it('rejects only non-digit characters', () => {
    expect(() => schema.validateSync('+-() ')).toThrow();
  });

  it('rejects alphabetical characters', () => {
    expect(() => schema.validateSync('abcdefghij')).toThrow();
  });

  it('rejects numbers mixed with letters', () => {
    expect(() => schema.validateSync('123abc4567')).toThrow();
  });

  it('rejects special characters', () => {
    expect(() => schema.validateSync('123@456#7890')).toThrow();
  });
});
