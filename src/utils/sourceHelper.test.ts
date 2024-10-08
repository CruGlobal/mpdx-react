import { isEditableSource, sourceToStr, sourcesMatch } from './sourceHelper';

describe('Sources-Helpers', () => {
  describe('SourceToStr()', () => {
    const t = (label: string) => label;

    it('should convert Siebel', () => {
      expect(sourceToStr(t, 'Siebel')).toBe('US Donation Services');
    });
    it('should convert DataServer', () => {
      expect(sourceToStr(t, 'DataServer')).toBe('DonorHub');
    });
    it('should not convert MPDX', () => {
      expect(sourceToStr(t, 'MPDX')).toBe('MPDX');
    });
    it('should convert TntImport', () => {
      expect(sourceToStr(t, 'TntImport')).toBe('Tnt Import');
    });
    it('should convert GoogleImport', () => {
      expect(sourceToStr(t, 'GoogleImport')).toBe('Google Import');
    });
    it('should convert default case', () => {
      expect(sourceToStr(t, 'test')).toBe('test');
    });
  });

  describe('sourcesMatch()', () => {
    it('default', () => {
      expect(sourcesMatch('manual', 'manual')).toBe(true);
      expect(sourcesMatch('Siebel', 'Siebel')).toBe(true);
      expect(sourcesMatch('Siebel', undefined)).toBe(false);
      expect(sourcesMatch('manual', 'random custom')).toBe(false);
    });
    it('matches sources with the old MPDX database value', () => {
      expect(sourcesMatch('manual', 'MPDX')).toBe(true);
    });
  });

  it('isEditableSource()', () => {
    expect(isEditableSource('MPDX')).toBe(true);
    expect(isEditableSource('Siebel')).toBe(false);
    expect(isEditableSource(undefined)).toBe(true);
  });
});
