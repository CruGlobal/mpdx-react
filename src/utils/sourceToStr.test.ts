import { sourceToStr } from './sourceToStr';

describe('SourceToStr', () => {
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
    expect(sourceToStr(t, 'test')).toBe('MPDX');
  });
});
