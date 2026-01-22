import { getHeader } from './getHeader';

describe('getHeader', () => {
  it('returns the text About this Form with step AboutForm', () => {
    expect(getHeader(0)).toBe('About this Form');
  });
  it('returns the text Complete the Form with step CompleteForm', () => {
    expect(getHeader(1)).toBe('Complete the Form');
  });
  it('returns the text Receipt with step Receipt', () => {
    expect(getHeader(2)).toBe('Receipt');
  });
});
