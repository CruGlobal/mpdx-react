import i18n from 'src/lib/i18n';
import { getHeader } from './getHeader';

describe('getHeader', () => {
  it('returns the text About this Form with step AboutForm', () => {
    expect(getHeader(0, i18n.t)).toBe('About this Form');
  });
  it('returns the text Complete the Form with step CompleteForm', () => {
    expect(getHeader(1, i18n.t)).toBe('Complete the Form');
  });
  it('returns the text Receipt with step Receipt', () => {
    expect(getHeader(2, i18n.t)).toBe('Receipt');
  });
});
